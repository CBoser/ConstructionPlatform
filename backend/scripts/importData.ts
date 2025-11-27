/**
 * Data Import Script
 *
 * This script imports plans and materials from CSV files into the database.
 *
 * Usage:
 *   npx ts-node scripts/importData.ts [--plans] [--materials] [--all]
 *
 * Required files in backend/data/:
 *   - Plans.csv - Plan index with columns: code, name, type, sqft, bedrooms, bathrooms, garage, style
 *   - SH_Unconverted.csv - Materials with pricing data
 *   - MaterialDatabase.csv - Current materials list (optional, for additional metadata)
 *
 * The SH_Unconverted file is the primary source for pricing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient, PlanType, MaterialCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Data directory path
const DATA_DIR = path.join(__dirname, '..', 'data');

// ============================================================================
// Utility Functions
// ============================================================================

function readCSV(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // Remove BOM (Byte Order Mark) if present - this is common in Excel-exported CSVs
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true, // Also tell csv-parse to handle BOM
  });
}

function mapPlanType(typeStr: string): PlanType {
  const typeMap: Record<string, PlanType> = {
    'single': PlanType.SINGLE_STORY,
    'single_story': PlanType.SINGLE_STORY,
    'single story': PlanType.SINGLE_STORY,
    '1': PlanType.SINGLE_STORY,
    '1-story': PlanType.SINGLE_STORY,
    'two': PlanType.TWO_STORY,
    'two_story': PlanType.TWO_STORY,
    'two story': PlanType.TWO_STORY,
    '2': PlanType.TWO_STORY,
    '2-story': PlanType.TWO_STORY,
    'three': PlanType.THREE_STORY,
    'three_story': PlanType.THREE_STORY,
    'three story': PlanType.THREE_STORY,
    '3': PlanType.THREE_STORY,
    '3-story': PlanType.THREE_STORY,
    'duplex': PlanType.DUPLEX,
    'townhome': PlanType.TOWNHOME,
    'townhouse': PlanType.TOWNHOME,
  };

  const normalized = typeStr.toLowerCase().trim();
  return typeMap[normalized] || PlanType.SINGLE_STORY;
}

function mapMaterialCategory(categoryStr: string): MaterialCategory {
  const categoryMap: Record<string, MaterialCategory> = {
    'lumber': MaterialCategory.DIMENSIONAL_LUMBER,
    'dimensional lumber': MaterialCategory.DIMENSIONAL_LUMBER,
    'dimensional_lumber': MaterialCategory.DIMENSIONAL_LUMBER,
    'engineered': MaterialCategory.ENGINEERED_LUMBER,
    'engineered lumber': MaterialCategory.ENGINEERED_LUMBER,
    'engineered_lumber': MaterialCategory.ENGINEERED_LUMBER,
    'lvl': MaterialCategory.ENGINEERED_LUMBER,
    'lsl': MaterialCategory.ENGINEERED_LUMBER,
    'glulam': MaterialCategory.ENGINEERED_LUMBER,
    'sheathing': MaterialCategory.SHEATHING,
    'osb': MaterialCategory.SHEATHING,
    'plywood': MaterialCategory.SHEATHING,
    'panel': MaterialCategory.SHEATHING,
    'treated': MaterialCategory.PRESSURE_TREATED,
    'pressure treated': MaterialCategory.PRESSURE_TREATED,
    'pressure_treated': MaterialCategory.PRESSURE_TREATED,
    'pt': MaterialCategory.PRESSURE_TREATED,
    'hardware': MaterialCategory.HARDWARE,
    'fasteners': MaterialCategory.HARDWARE,
    'connectors': MaterialCategory.HARDWARE,
    'simpson': MaterialCategory.HARDWARE,
    'concrete': MaterialCategory.CONCRETE,
    'roofing': MaterialCategory.ROOFING,
    'shingles': MaterialCategory.ROOFING,
    'siding': MaterialCategory.SIDING,
    'hardie': MaterialCategory.SIDING,
    'trim': MaterialCategory.SIDING,
    'insulation': MaterialCategory.INSULATION,
    'drywall': MaterialCategory.DRYWALL,
    'gypsum': MaterialCategory.DRYWALL,
  };

  const normalized = categoryStr.toLowerCase().trim();

  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return MaterialCategory.OTHER;
}

function inferCategoryFromSku(sku: string, description: string): MaterialCategory {
  const combined = `${sku} ${description}`.toUpperCase();

  // Lumber patterns
  if (/\b\d+X\d+/.test(combined) || /\bDF\b|\bSPF\b|\bHF\b|\bSYP\b/.test(combined)) {
    if (/TRTD|TREATED|ICT|GC|AG/.test(combined)) {
      return MaterialCategory.PRESSURE_TREATED;
    }
    return MaterialCategory.DIMENSIONAL_LUMBER;
  }

  // Engineered lumber
  if (/\bLVL\b|\bLSL\b|\bGLAM\b|\bGLULAM\b|\bPSL\b/.test(combined)) {
    return MaterialCategory.ENGINEERED_LUMBER;
  }

  // Sheathing
  if (/\bOSB\b|\bPLYWOOD\b|\bSHEATH/.test(combined)) {
    return MaterialCategory.SHEATHING;
  }

  // Hardware
  if (/SIMPSON|ANCHOR|HANGER|STRAP|NAIL|SCREW|BOLT|CONNECTOR/.test(combined)) {
    return MaterialCategory.HARDWARE;
  }

  // Roofing
  if (/SHINGLE|ROOF|UNDERLAYMENT|FELT/.test(combined)) {
    return MaterialCategory.ROOFING;
  }

  // Siding
  if (/HARDIE|SIDING|TRIM|SOFFIT|FASCIA/.test(combined)) {
    return MaterialCategory.SIDING;
  }

  // Insulation
  if (/INSUL|BATT|FOAM/.test(combined)) {
    return MaterialCategory.INSULATION;
  }

  // Drywall
  if (/DRYWALL|GYPSUM|SHEETROCK/.test(combined)) {
    return MaterialCategory.DRYWALL;
  }

  return MaterialCategory.OTHER;
}

function inferDartCategoryFromPack(packName: string): { dartCategory: number; dartCategoryName: string } | null {
  // Parse pack names like "|10 FOUNDATION", "|20 MAIN WALLS", etc.
  const match = packName.match(/\|?(\d{2})/);
  if (!match) return null;

  const packNumber = parseInt(match[1]);

  // Map pack numbers to DART categories (simplified mapping)
  // This is an approximation - actual mapping should be verified with the user
  const dartMappings: Record<number, { dartCategory: number; dartCategoryName: string }> = {
    9: { dartCategory: 1, dartCategoryName: '01-Lumber' },   // WO BASEMENT WALLS
    10: { dartCategory: 1, dartCategoryName: '01-Lumber' },  // FOUNDATION
    11: { dartCategory: 1, dartCategoryName: '01-Lumber' },  // MAIN JOIST SYSTEM
    18: { dartCategory: 2, dartCategoryName: '02-Panel' },   // MAIN SUBFLOOR
    20: { dartCategory: 1, dartCategoryName: '01-Lumber' },  // MAIN WALLS
    30: { dartCategory: 1, dartCategoryName: '01-Lumber' },  // 2ND FLOOR SYSTEM
    32: { dartCategory: 2, dartCategoryName: '02-Panel' },   // 2ND FLOOR SUBFLOOR
    34: { dartCategory: 1, dartCategoryName: '01-Lumber' },  // 2ND FLOOR WALLS
    40: { dartCategory: 8, dartCategoryName: '08-Roofing' }, // ROOF
    58: { dartCategory: 9, dartCategoryName: '09-Siding' },  // HOUSEWRAP
    60: { dartCategory: 9, dartCategoryName: '09-Siding' },  // EXTERIOR TRIM AND SIDING
  };

  return dartMappings[packNumber] || { dartCategory: 14, dartCategoryName: '14-Other' };
}

// ============================================================================
// Import Functions
// ============================================================================

async function importPlans(): Promise<void> {
  console.log('\n--- Importing Plans ---');

  // Try different filename patterns
  const filePatterns = ['Plans.csv', 'plans.csv', 'PlanIndex.csv', 'plan_index.csv'];
  let records: Record<string, string>[] = [];

  for (const pattern of filePatterns) {
    records = readCSV(pattern);
    if (records.length > 0) {
      console.log(`Found ${records.length} plans in ${pattern}`);
      break;
    }
  }

  if (records.length === 0) {
    console.log('No plan data found. Please ensure Plans.csv exists in backend/data/');
    console.log('Expected columns: Plan Sheet, Model, Elevations, Garage, Living Area Total, etc.');
    return;
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let elevationsCreated = 0;

  for (const record of records) {
    try {
      // Support actual column names from Plans.csv
      const code = record['Plan Sheet'] || record.code || record.Code || record.Plan || record.plan_code || record.PlanCode;

      if (!code) {
        console.log('Skipping record with no code:', record);
        skipped++;
        continue;
      }

      // Model column contains the plan name (e.g., "1670 - Coyote Ridge")
      const name = record.Model || record.name || record.Name || record.PlanName || record.plan_name;

      // Determine plan type based on living areas
      const livingMain = record['Living Area Main'] ? parseInt(record['Living Area Main']) : 0;
      const livingUpper = record['Living Area Upper'] ? parseInt(record['Living Area Upper']) : 0;
      let typeStr = record.type || record.Type || record.Stories || record.stories || record.plan_type || '';

      // If no explicit type, infer from living areas
      if (!typeStr && livingMain > 0 && livingUpper > 0) {
        typeStr = 'two_story';
      } else if (!typeStr) {
        typeStr = 'single_story';
      }

      // Living Area Total for sqft
      const sqftStr = record['Living Area Total'] || record.sqft || record.SqFt || record.SquareFootage || record.square_footage || record.sq_ft;
      const bedroomsStr = record.bedrooms || record.Bedrooms || record.Beds || record.beds;
      const bathroomsStr = record.bathrooms || record.Bathrooms || record.Baths || record.baths;
      const garage = record.Garage || record.garage || record.GarageType || record.garage_type;
      const style = record.style || record.Style || record.ArchStyle || record.arch_style;
      const elevationsStr = record.Elevations || record.elevations || '';
      const bidNumber = record['Bid Number'] || record.BidNumber || '';

      // Check if plan already exists
      const existing = await prisma.plan.findUnique({ where: { code: code.trim() } });
      if (existing) {
        console.log(`  Plan ${code} already exists, skipping`);
        skipped++;
        continue;
      }

      // Build notes from bid number if present
      const notes = bidNumber ? `Bid Number: ${bidNumber}` : null;

      const plan = await prisma.plan.create({
        data: {
          code: code.trim(),
          name: name?.trim() || null,
          type: mapPlanType(typeStr || 'single'),
          sqft: sqftStr ? parseInt(sqftStr) : null,
          bedrooms: bedroomsStr ? parseInt(bedroomsStr) : null,
          bathrooms: bathroomsStr ? parseFloat(bathroomsStr) : null,
          garage: garage?.trim() || null,
          style: style?.trim() || null,
          notes: notes,
          isActive: true,
        },
      });

      console.log(`  Imported plan: ${plan.code} - ${plan.name || 'unnamed'}`);
      imported++;

      // Parse and create elevations if present
      if (elevationsStr) {
        const elevations = parseElevations(elevationsStr);
        for (const elev of elevations) {
          try {
            await prisma.planElevation.create({
              data: {
                planId: plan.id,
                code: elev.code,
                name: elev.name || null,
                description: elev.description || null,
              },
            });
            elevationsCreated++;
          } catch (elevError) {
            // Elevation might already exist, skip
            console.log(`    Elevation ${elev.code} skipped`);
          }
        }
      }
    } catch (error) {
      console.error(`  Error importing plan:`, error);
      errors++;
    }
  }

  console.log(`\nPlans import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
  console.log(`Elevations created: ${elevationsCreated}`);
}

/**
 * Parse elevation string like "A (Northwest), B (Prairie), C (Modern)"
 * Returns array of { code, name, description }
 */
function parseElevations(elevationsStr: string): Array<{ code: string; name: string | null; description: string | null }> {
  const elevations: Array<{ code: string; name: string | null; description: string | null }> = [];

  // Handle different formats:
  // "A (Northwest), B (Prairie), C (Modern)"
  // "A, B, C, D"
  // "F,C,G,J,K"

  const parts = elevationsStr.split(/[,;]/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Match patterns like "A (Northwest)" or just "A"
    const match = trimmed.match(/^([A-Z])\s*(?:\(([^)]+)\))?/i);
    if (match) {
      elevations.push({
        code: match[1].toUpperCase(),
        name: match[2]?.trim() || null,
        description: null,
      });
    }
  }

  return elevations;
}

async function importMaterials(): Promise<void> {
  console.log('\n--- Importing Materials ---');

  // Try different filename patterns
  const filePatterns = [
    'SH_Unconverted.csv',
    'SH_Unconverted',
    'sh_unconverted.csv',
    'Materials.csv',
    'materials.csv',
    'MaterialDatabase.csv',
    'MaterialDatabase11-26-25.csv',
  ];

  let records: Record<string, string>[] = [];
  let usedFile = '';

  for (const pattern of filePatterns) {
    records = readCSV(pattern);
    if (records.length > 0) {
      console.log(`Found ${records.length} materials in ${pattern}`);
      usedFile = pattern;
      break;
    }
  }

  if (records.length === 0) {
    console.log('No material data found. Please ensure material CSV exists in backend/data/');
    console.log('Expected columns: Sku, Description, Price, Pack (for DART category), Category, UnitOfMeasure');
    return;
  }

  // Group by SKU to avoid duplicates (same SKU may appear in multiple packs)
  const materialMap = new Map<string, {
    sku: string;
    description: string;
    vendorCost: number;
    dartCategory?: number;
    dartCategoryName?: string;
    unitOfMeasure: string;
    category: MaterialCategory;
    isRLLinked: boolean;
  }>();

  for (const record of records) {
    const sku = record.Sku || record.SKU || record.sku || record.ItemNumber || record.item_number;

    if (!sku) continue;

    const description = record.Description || record.description || record.ItemDescription || record.item_description || '';
    const priceStr = record.Price || record.price || record.VendorCost || record.vendor_cost || record.Cost || record.cost || '0';
    const packName = record.Pack || record.pack || record.Category || '';
    const categoryStr = record.Category || record.category || record.MaterialCategory || '';
    const uom = record.UnitOfMeasure || record.UOM || record.uom || record.Unit || record.unit || 'EA';

    // Skip if already processed with a higher price (keep highest price for each SKU)
    const existing = materialMap.get(sku);
    const price = parseFloat(priceStr.replace(/[^0-9.-]/g, '')) || 0;

    if (existing && existing.vendorCost >= price) continue;

    // Determine category
    let category: MaterialCategory;
    if (categoryStr) {
      category = mapMaterialCategory(categoryStr);
    } else {
      category = inferCategoryFromSku(sku, description);
    }

    // Determine DART category from pack name
    const dartInfo = packName ? inferDartCategoryFromPack(packName) : null;

    // Check if Random Lengths linked (lumber items)
    const isRLLinked = /\bDF\b|\bSPF\b|\bHF\b|\bSYP\b/.test(sku.toUpperCase()) &&
                       category === MaterialCategory.DIMENSIONAL_LUMBER;

    materialMap.set(sku, {
      sku: sku.trim(),
      description: description.trim(),
      vendorCost: price,
      dartCategory: dartInfo?.dartCategory,
      dartCategoryName: dartInfo?.dartCategoryName,
      unitOfMeasure: uom.trim().toUpperCase(),
      category,
      isRLLinked,
    });
  }

  console.log(`Processed ${materialMap.size} unique materials`);

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const [sku, data] of materialMap) {
    try {
      // Check if material already exists
      const existing = await prisma.material.findUnique({ where: { sku } });

      if (existing) {
        // Update pricing if different
        if (existing.vendorCost.toNumber() !== data.vendorCost) {
          await prisma.material.update({
            where: { sku },
            data: {
              vendorCost: data.vendorCost,
              dartCategory: data.dartCategory || existing.dartCategory,
              dartCategoryName: data.dartCategoryName || existing.dartCategoryName,
            },
          });
          console.log(`  Updated pricing for: ${sku}`);
          updated++;
        }
        continue;
      }

      const material = await prisma.material.create({
        data: {
          sku: data.sku,
          description: data.description,
          category: data.category,
          dartCategory: data.dartCategory,
          dartCategoryName: data.dartCategoryName,
          unitOfMeasure: data.unitOfMeasure,
          vendorCost: data.vendorCost,
          freight: 0,
          isRLLinked: data.isRLLinked,
          isActive: true,
        },
      });

      console.log(`  Imported material: ${material.sku}`);
      imported++;
    } catch (error) {
      console.error(`  Error importing material ${sku}:`, error);
      errors++;
    }
  }

  console.log(`\nMaterials import complete: ${imported} imported, ${updated} updated, ${errors} errors`);
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  console.log('========================================');
  console.log('Construction Platform - Data Import');
  console.log('========================================');
  console.log(`Data directory: ${DATA_DIR}`);

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.log('\nData directory does not exist. Creating...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // List available files
  const files = fs.readdirSync(DATA_DIR);
  console.log('\nAvailable files:', files.length > 0 ? files.join(', ') : '(none)');

  const importAll = args.includes('--all') || args.length === 0;
  const importPlansFlag = args.includes('--plans') || importAll;
  const importMaterialsFlag = args.includes('--materials') || importAll;

  try {
    if (importPlansFlag) {
      await importPlans();
    }

    if (importMaterialsFlag) {
      await importMaterials();
    }

    console.log('\n========================================');
    console.log('Import complete!');
    console.log('========================================');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
