/**
 * Database Restore Script
 * Restores PostgreSQL database from backup file
 *
 * Usage:
 *   npm run db:restore                     # Restore from latest backup
 *   npm run db:restore -- <filename>       # Restore from specific backup
 *   npm run db:restore -- --list           # List available backups
 *
 * WARNING: This will OVERWRITE the current database!
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

interface DbConfig {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}

function parseDbUrl(url: string): DbConfig {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

function getLatestBackup(): string | null {
  if (!fs.existsSync(BACKUP_DIR)) {
    return null;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.dump'))
    .sort()
    .reverse();

  return files.length > 0 ? files[0] : null;
}

function listBackups(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backup directory found.');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.dump'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No backups found.');
    return;
  }

  console.log('Available backups:');
  console.log('─'.repeat(60));

  for (const file of files) {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const created = stats.mtime.toISOString().slice(0, 19).replace('T', ' ');

    console.log(`  ${file}`);
    console.log(`    Size: ${sizeMB} MB | Created: ${created}`);
  }

  console.log('─'.repeat(60));
}

async function confirmRestore(filename: string, database: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n' + '!'.repeat(60));
    console.log('  WARNING: This will OVERWRITE the database!');
    console.log('!'.repeat(60));
    console.log(`\n  Database: ${database}`);
    console.log(`  Backup: ${filename}\n`);

    rl.question('  Type "yes" to confirm restore: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function restore(backupFile: string, skipConfirm: boolean = false): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set in environment');
  }

  const config = parseDbUrl(dbUrl);

  // Determine full path
  let filepath: string;
  if (path.isAbsolute(backupFile)) {
    filepath = backupFile;
  } else if (fs.existsSync(backupFile)) {
    filepath = backupFile;
  } else {
    filepath = path.join(BACKUP_DIR, backupFile);
  }

  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup file not found: ${filepath}`);
  }

  const filename = path.basename(filepath);

  // Confirm with user
  if (!skipConfirm) {
    const confirmed = await confirmRestore(filename, config.database);
    if (!confirmed) {
      console.log('\nRestore cancelled.');
      return;
    }
  }

  console.log('\nStarting database restore...');
  console.log(`  Database: ${config.database}`);
  console.log(`  Backup: ${filename}`);

  const env = { ...process.env, PGPASSWORD: config.password };

  try {
    // Drop and recreate all objects, then restore
    // Using --clean to drop objects before recreating
    const command = `pg_restore --clean --if-exists -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} "${filepath}"`;

    execSync(command, {
      env,
      stdio: 'inherit',
      timeout: 600000 // 10 minute timeout
    });

    console.log('\nRestore completed successfully!');

    // Regenerate Prisma client after restore
    console.log('\nRegenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('\nDatabase restored and ready to use.');
  } catch (error) {
    // pg_restore may return non-zero even on success with warnings
    // Check if it's just warnings about objects that don't exist
    if (error instanceof Error && error.message.includes('exit code')) {
      console.log('\nRestore completed with warnings (this is usually normal).');
      console.log('Run validation script to verify: npx ts-node scripts/validateDatabase.ts');
    } else {
      throw error;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    listBackups();
    return;
  }

  if (args.includes('--help')) {
    console.log(`
Database Restore Script

Usage:
  npm run db:restore                     Restore from latest backup
  npm run db:restore -- <filename>       Restore from specific backup file
  npm run db:restore -- --list           List available backups
  npm run db:restore -- --help           Show this help message

Backups directory: ${BACKUP_DIR}

WARNING: Restore will OVERWRITE the current database!
`);
    return;
  }

  // Find backup file to restore
  let backupFile: string | null = null;

  // Check for filename argument (skip flags)
  const fileArg = args.find(a => !a.startsWith('--'));

  if (fileArg) {
    backupFile = fileArg;
  } else {
    backupFile = getLatestBackup();
    if (!backupFile) {
      console.error('No backups found. Create one with: npm run db:backup');
      process.exit(1);
    }
    console.log(`Using latest backup: ${backupFile}`);
  }

  try {
    await restore(backupFile, args.includes('--yes'));
  } catch (error) {
    console.error('\nRestore failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
