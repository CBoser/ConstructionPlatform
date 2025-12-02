/**
 * Database Backup Script
 * Creates compressed PostgreSQL backups with timestamp
 *
 * Usage:
 *   npm run db:backup              # Create backup
 *   npm run db:backup -- --list    # List existing backups
 *   npm run db:backup -- --clean   # Remove backups older than retention period
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const RETENTION_DAYS = 7; // Keep backups for 7 days

interface DbConfig {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
}

function parseDbUrl(url: string): DbConfig {
  // Parse: postgresql://user:password@host:port/database
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

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function createBackup(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set in environment');
  }

  const config = parseDbUrl(dbUrl);
  ensureBackupDir();

  const timestamp = getTimestamp();
  const filename = `${config.database}_${timestamp}.dump`;
  const filepath = path.join(BACKUP_DIR, filename);

  console.log('Starting database backup...');
  console.log(`  Database: ${config.database}`);
  console.log(`  Host: ${config.host}:${config.port}`);
  console.log(`  Output: ${filename}`);

  // Set PGPASSWORD environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: config.password };

  try {
    // Use pg_dump with custom format (compressed)
    const command = `pg_dump -Fc -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -f "${filepath}"`;

    execSync(command, {
      env,
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });

    // Get file size
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\nBackup completed successfully!`);
    console.log(`  File: ${filename}`);
    console.log(`  Size: ${sizeMB} MB`);

    return filepath;
  } catch (error) {
    // Clean up partial file if exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    throw error;
  }
}

function listBackups(): void {
  ensureBackupDir();

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
  console.log(`Total: ${files.length} backup(s)`);
}

function cleanOldBackups(): void {
  ensureBackupDir();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.dump'));
  let removed = 0;

  for (const file of files) {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filepath);

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filepath);
      console.log(`Removed old backup: ${file}`);
      removed++;
    }
  }

  if (removed === 0) {
    console.log(`No backups older than ${RETENTION_DAYS} days to remove.`);
  } else {
    console.log(`\nRemoved ${removed} old backup(s).`);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listBackups();
} else if (args.includes('--clean')) {
  cleanOldBackups();
} else if (args.includes('--help')) {
  console.log(`
Database Backup Script

Usage:
  npm run db:backup              Create a new backup
  npm run db:backup -- --list    List existing backups
  npm run db:backup -- --clean   Remove backups older than ${RETENTION_DAYS} days
  npm run db:backup -- --help    Show this help message

Backups are stored in: ${BACKUP_DIR}
`);
} else {
  try {
    createBackup();
  } catch (error) {
    console.error('\nBackup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
