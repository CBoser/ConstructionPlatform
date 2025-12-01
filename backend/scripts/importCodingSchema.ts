/**
 * Import Coding Schema CSV Data
 *
 * Parses Coding_Schema_v2_NEW_FORMAT.csv and populates:
 * - Layer1Code: Aggregate codes for estimating
 * - Layer1CodeElevation: Elevation associations
 * - Layer1CodeRichmondOption: Richmond option mappings
 *
 * Usage:
 *   npx ts-node scripts/importCodingSchema.ts
 *   npx ts-node scripts/importCodingSchema.ts --dry-run
 *   npx ts-node scripts/importCodingSchema.ts --file path/to/custom.csv
 *
 * CSV Columns Expected:
 *   Richmond_Pack_ID, Shipping_Order, Elevation_Letters_Original, Option_Codes,
 *   Phase_Str, Pack_Name, Item_No, Item_Type, Old_Code, Plan_No,
 *   New_Phase_Code, New_Elevation_Code, New_Item_Type_Code, New_Full_Code
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Default CSV path
const DEFAULT_CSV_PATH = path.join(
  __dirname,
  '../../database/schema/Coding_Schema_v2_NEW_FORMAT.csv'
);

// CSV Row interface
interface CodingSchemaRow {
  Richmond_Pack_ID: string;
  Shipping_Order: string;
  Elevation_Letters_Original: string;
  Option_Codes: string;
  Phase_Str: string;
  Pack_Name: string;
  Item_No: string;
  Item_Type: string;
  Old_Code: string;
  Plan_No: string;
  New_Phase_Code: string;
  New_Elevation_Code: string;
  New_Item_Type_Code: string;
  New_Full_Code: string;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    filePath: DEFAULT_CSV_PATH,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    } else if (args[i] === '--file' && args[i + 1]) {
      options.filePath = args[i + 1];
      i++;
    }
  }

  return options;
}

// Parse elevation codes from string like "B, C, D" or "A" or ""
function parseElevationCodes(elevationStr: string): string[] {
  if (!elevationStr || elevationStr.trim() === '') {
    return ['**']; // ** means all elevations
  }

  // Split by comma and clean up
  return elevationStr
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

// Parse option codes from string like "WO, XGREAT" or "3CARA, 3CARB, 3CARC"
function parseOptionCodes(optionStr: string): string[] {
  if (!optionStr || optionStr.trim() === '') {
    return [];
  }

  // Split by comma and clean up
  return optionStr
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

// Determine material class from Item_No or Item_Type
function getMaterialClassCode(itemNo: string, itemType: string): string {
  // Item_No directly indicates material class in most cases
  if (itemNo === '1000') return '1000'; // Framing
  if (itemNo === '1100') return '1100'; // Siding

  // Fall back to item type
  const type = itemType?.toLowerCase() || '';
  if (type.includes('framing') || type.includes('foundation')) return '1000';
  if (type.includes('siding') || type.includes('trim')) return '1100';

  // Default to framing
  return '1000';
}

async function importCodingSchema() {
  const options = parseArgs();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📥 Import Coding Schema CSV');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  File: ${options.filePath}`);
  console.log(`  Mode: ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`  Verbose: ${options.verbose}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check file exists
  if (!fs.existsSync(options.filePath)) {
    console.error(`❌ File not found: ${options.filePath}`);
    process.exit(1);
  }

  // Read and parse CSV
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(options.filePath, 'utf-8');
  const records: CodingSchemaRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`   Found ${records.length} rows\n`);

  // Load reference data
  console.log('📚 Loading reference data...');

  // Get material classes
  const materialClasses = await prisma.materialClass.findMany();
  const materialClassMap = new Map(materialClasses.map((mc) => [mc.classCode, mc.id]));
  console.log(`   Material Classes: ${materialClasses.length}`);

  // Get phase option definitions
  const phaseDefinitions = await prisma.phaseOptionDefinition.findMany();
  const phaseMap = new Map(phaseDefinitions.map((p) => [p.phaseCode, p.id]));
  console.log(`   Phase Definitions: ${phaseDefinitions.length}`);

  // Get Richmond option codes
  const richmondOptions = await prisma.richmondOptionCode.findMany();
  const richmondMap = new Map(richmondOptions.map((r) => [r.optionCode, r.id]));
  console.log(`   Richmond Options: ${richmondOptions.length}`);

  console.log('');

  // Statistics
  const stats = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    elevationsCreated: 0,
    optionsLinked: 0,
    errors: [] as string[],
    missingPhases: new Set<string>(),
    missingOptions: new Set<string>(),
  };

  // Process records
  console.log('🔄 Processing records...');

  for (const row of records) {
    stats.processed++;

    if (options.verbose) {
      console.log(`\n   [${stats.processed}] ${row.New_Full_Code}`);
    }

    // Skip if no full code
    if (!row.New_Full_Code || row.New_Full_Code.trim() === '') {
      stats.skipped++;
      if (options.verbose) {
        console.log(`      ⏭️  Skipped: No full code`);
      }
      continue;
    }

    // Get phase option ID
    const phaseCode = row.New_Phase_Code?.trim();
    const phaseId = phaseMap.get(phaseCode);

    if (!phaseId) {
      stats.missingPhases.add(phaseCode);
      if (options.verbose) {
        console.log(`      ⚠️  Missing phase: ${phaseCode}`);
      }
      // We'll still try to create the record, but need to handle this
      stats.skipped++;
      continue;
    }

    // Get material class ID
    const materialClassCode = getMaterialClassCode(row.Item_No, row.Item_Type);
    const materialClassId = materialClassMap.get(materialClassCode);

    if (!materialClassId) {
      stats.errors.push(`Missing material class: ${materialClassCode} for ${row.New_Full_Code}`);
      stats.skipped++;
      continue;
    }

    // Parse elevations
    const elevationCodes = parseElevationCodes(row.Elevation_Letters_Original);

    // Parse option codes
    const optionCodes = parseOptionCodes(row.Option_Codes);

    // Check for missing Richmond options
    for (const optCode of optionCodes) {
      if (!richmondMap.has(optCode)) {
        stats.missingOptions.add(optCode);
      }
    }

    if (!options.dryRun) {
      try {
        // Upsert Layer1Code
        const layer1Code = await prisma.layer1Code.upsert({
          where: { fullCode: row.New_Full_Code },
          update: {
            planCode: row.Plan_No || 'PPPP',
            packName: row.Pack_Name?.trim(),
            richmondPackId: row.Richmond_Pack_ID?.trim(),
            itemNo: row.Item_No?.trim(),
            itemType: row.Item_Type?.trim(),
            shippingOrder: row.Shipping_Order ? parseInt(row.Shipping_Order, 10) : null,
            description: row.Pack_Name?.trim(),
          },
          create: {
            fullCode: row.New_Full_Code,
            planCode: row.Plan_No || 'PPPP',
            phaseOptionId: phaseId,
            materialClassId: materialClassId,
            packName: row.Pack_Name?.trim(),
            richmondPackId: row.Richmond_Pack_ID?.trim(),
            itemNo: row.Item_No?.trim(),
            itemType: row.Item_Type?.trim(),
            shippingOrder: row.Shipping_Order ? parseInt(row.Shipping_Order, 10) : null,
            description: row.Pack_Name?.trim(),
          },
        });

        stats.created++;

        // Create elevation associations
        for (const elevCode of elevationCodes) {
          try {
            await prisma.layer1CodeElevation.upsert({
              where: {
                layer1CodeId_elevationCode: {
                  layer1CodeId: layer1Code.id,
                  elevationCode: elevCode,
                },
              },
              update: {},
              create: {
                layer1CodeId: layer1Code.id,
                elevationCode: elevCode,
              },
            });
            stats.elevationsCreated++;
          } catch {
            // Ignore duplicate key errors
          }
        }

        // Link Richmond options
        for (const optCode of optionCodes) {
          const richmondId = richmondMap.get(optCode);
          if (richmondId) {
            try {
              await prisma.layer1CodeRichmondOption.upsert({
                where: {
                  layer1CodeId_richmondOptionId: {
                    layer1CodeId: layer1Code.id,
                    richmondOptionId: richmondId,
                  },
                },
                update: {},
                create: {
                  layer1CodeId: layer1Code.id,
                  richmondOptionId: richmondId,
                },
              });
              stats.optionsLinked++;
            } catch {
              // Ignore duplicate key errors
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        stats.errors.push(`Error processing ${row.New_Full_Code}: ${errorMsg}`);
        stats.skipped++;
      }
    } else {
      // Dry run - just count
      stats.created++;
      stats.elevationsCreated += elevationCodes.length;
      stats.optionsLinked += optionCodes.filter((o) => richmondMap.has(o)).length;
    }

    // Progress indicator
    if (stats.processed % 100 === 0) {
      process.stdout.write(`   Processed ${stats.processed}/${records.length}\r`);
    }
  }

  console.log('\n');

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📊 Import Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Records Processed: ${stats.processed}`);
  console.log(`  Layer1Codes Created/Updated: ${stats.created}`);
  console.log(`  Elevation Associations: ${stats.elevationsCreated}`);
  console.log(`  Richmond Options Linked: ${stats.optionsLinked}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Warnings
  if (stats.missingPhases.size > 0) {
    console.log('⚠️  Missing Phase Definitions (add to codeSystem.seed.ts):');
    for (const phase of Array.from(stats.missingPhases).sort()) {
      console.log(`     - ${phase}`);
    }
    console.log('');
  }

  if (stats.missingOptions.size > 0) {
    console.log('⚠️  Missing Richmond Options (add to codeSystem.seed.ts):');
    for (const opt of Array.from(stats.missingOptions).sort()) {
      console.log(`     - ${opt}`);
    }
    console.log('');
  }

  // Errors
  if (stats.errors.length > 0) {
    console.log('❌ Errors:');
    for (const err of stats.errors.slice(0, 10)) {
      console.log(`     ${err}`);
    }
    if (stats.errors.length > 10) {
      console.log(`     ... and ${stats.errors.length - 10} more errors`);
    }
    console.log('');
  }

  if (options.dryRun) {
    console.log('ℹ️  This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('✅ Import completed!\n');
  }
}

// Run
importCodingSchema()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Import failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
