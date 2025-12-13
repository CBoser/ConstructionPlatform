/**
 * Holt Cross-Reference Seed Data
 *
 * Seeds the Holt-to-Unified cross-reference tables:
 * - HoltPhaseXref: Maps Holt 5-digit phase codes to unified phases
 * - ItemTypeXref: Maps Holt cost codes to unified material classes
 * - BatPackDefinition: Legacy BAT pack structure for shipping order
 *
 * Source: User's unified code system decisions document
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ITEM TYPE CROSS-REFERENCE (Decision 5)
// Maps Holt's 4-digit cost codes to unified material classes
// ============================================================================
interface ItemTypeMapping {
  holtCostCode: string;
  holtCostName: string;
  materialClassCode: string;  // '1000' or '1100'
  dartCategory?: number;
  dartCategoryName?: string;
  description?: string;
}

const ITEM_TYPE_MAPPINGS: ItemTypeMapping[] = [
  // ============================================================================
  // BAT Unified Coding System v2.0 - Item Type Cross-Reference
  // Rosetta Stone: Unified ↔ Holt ↔ Richmond
  // ============================================================================

  // Framing/Lumber (1000) - Pack Range: |00-49, |80+
  { holtCostCode: '4085', holtCostName: 'Lumber', materialClassCode: '1000', dartCategory: 1, dartCategoryName: 'Dimensional Lumber', description: 'Framing/Lumber - structural framing materials' },

  // Lumber - Barge Credit (1100)
  { holtCostCode: '4086', holtCostName: 'Lumber - Barge Credit', materialClassCode: '1100', dartCategory: 1, dartCategoryName: 'Dimensional Lumber', description: 'Lumber - Barge Credit adjustments' },

  // Trusses (1200) - Pack Range: |40-45
  { holtCostCode: '4120', holtCostName: 'Trusses', materialClassCode: '1200', dartCategory: 4, dartCategoryName: 'Trusses', description: 'Engineered roof and floor trusses' },

  // Windows (2000) - Pack Range: |40.xx
  { holtCostCode: '4140', holtCostName: 'Window Supply', materialClassCode: '2000', dartCategory: 6, dartCategoryName: 'Windows', description: 'Windows - standard window units' },

  // Windows - Triple Pane (2050)
  { holtCostCode: '4142', holtCostName: 'Window Supply - U-22 Triple Pane', materialClassCode: '2050', dartCategory: 6, dartCategoryName: 'Windows', description: 'Windows - Triple Pane (WA energy code)' },

  // Siding/Exterior (2100) - Pack Range: |58-79
  { holtCostCode: '4155', holtCostName: 'Siding Supply', materialClassCode: '2100', dartCategory: 9, dartCategoryName: 'Siding/Masonry', description: 'Siding/Exterior - siding, trim, housewrap' },

  // Exterior Doors (2150) - Pack Range: |83.xx
  { holtCostCode: '4150', holtCostName: 'Exterior Door Supply', materialClassCode: '2150', dartCategory: 7, dartCategoryName: 'Doors', description: 'Exterior Doors - entry, patio, sliding' },

  // Roofing (2200) - Pack Range: |50-57
  { holtCostCode: '4156', holtCostName: 'Roofing Supply', materialClassCode: '2200', dartCategory: 11, dartCategoryName: 'Roofing', description: 'Roofing - shingles, underlayment, flashing' },

  // Interior Trim/Millwork (3000) - Pack Range: |83+
  { holtCostCode: '4320', holtCostName: 'Interior Trim Supply - Millwork', materialClassCode: '3000', dartCategory: 5, dartCategoryName: 'Millwork', description: 'Interior Trim/Millwork - trim, molding, doors' },
];

// ============================================================================
// HOLT PHASE CROSS-REFERENCE (Decision 2)
// Maps Holt's 5-digit OptionPhase codes to unified phases
// ============================================================================
interface HoltPhaseMapping {
  holtPhaseCode: string;      // "10100", "10200", "40100"
  holtCostCode?: string;      // "4085", "4120"
  holtDescription?: string;
  unifiedPhaseCode: string;   // "010.000", "020.000"
  elevationCode: string;      // "A", "B", "C", "D", "**"
  batPackId?: string;         // "|10", "|20"
  shippingOrder?: number;
}

const HOLT_PHASE_MAPPINGS: HoltPhaseMapping[] = [
  // Foundation Series (10xxx) - Shipping Order 1
  // Pattern: 10100=A, 10200=B, 10300=C, 10400=D
  { holtPhaseCode: '10100', holtCostCode: '4085', unifiedPhaseCode: '010.000', elevationCode: 'A', batPackId: '|10', shippingOrder: 1, holtDescription: 'Foundation Elevation A' },
  { holtPhaseCode: '10200', holtCostCode: '4085', unifiedPhaseCode: '010.000', elevationCode: 'B', batPackId: '|10', shippingOrder: 1, holtDescription: 'Foundation Elevation B' },
  { holtPhaseCode: '10300', holtCostCode: '4085', unifiedPhaseCode: '010.000', elevationCode: 'C', batPackId: '|10', shippingOrder: 1, holtDescription: 'Foundation Elevation C' },
  { holtPhaseCode: '10400', holtCostCode: '4085', unifiedPhaseCode: '010.000', elevationCode: 'D', batPackId: '|10', shippingOrder: 1, holtDescription: 'Foundation Elevation D' },

  // Siding Add-ons Series (11xxx) - Shipping Order 7
  { holtPhaseCode: '11100', holtCostCode: '4155', unifiedPhaseCode: '060.000', elevationCode: 'A', batPackId: '|60', shippingOrder: 7, holtDescription: 'Exterior Siding Elevation A' },
  { holtPhaseCode: '11200', holtCostCode: '4155', unifiedPhaseCode: '060.000', elevationCode: 'B', batPackId: '|60', shippingOrder: 7, holtDescription: 'Exterior Siding Elevation B' },
  { holtPhaseCode: '11300', holtCostCode: '4155', unifiedPhaseCode: '060.000', elevationCode: 'C', batPackId: '|60', shippingOrder: 7, holtDescription: 'Exterior Siding Elevation C' },
  { holtPhaseCode: '11400', holtCostCode: '4155', unifiedPhaseCode: '060.000', elevationCode: 'D', batPackId: '|60', shippingOrder: 7, holtDescription: 'Exterior Siding Elevation D' },

  // Main Floor Walls Series (18xxx-21xxx) - Shipping Order 3
  { holtPhaseCode: '18100', holtCostCode: '4085', unifiedPhaseCode: '018.000', elevationCode: 'A', batPackId: '|18', shippingOrder: 2, holtDescription: 'Main Subfloor Elevation A' },
  { holtPhaseCode: '18200', holtCostCode: '4085', unifiedPhaseCode: '018.000', elevationCode: 'B', batPackId: '|18', shippingOrder: 2, holtDescription: 'Main Subfloor Elevation B' },

  { holtPhaseCode: '20100', holtCostCode: '4085', unifiedPhaseCode: '020.000', elevationCode: 'A', batPackId: '|20', shippingOrder: 3, holtDescription: 'Main Floor Walls Elevation A' },
  { holtPhaseCode: '20200', holtCostCode: '4085', unifiedPhaseCode: '020.000', elevationCode: 'B', batPackId: '|20', shippingOrder: 3, holtDescription: 'Main Floor Walls Elevation B' },
  { holtPhaseCode: '20300', holtCostCode: '4085', unifiedPhaseCode: '020.000', elevationCode: 'C', batPackId: '|20', shippingOrder: 3, holtDescription: 'Main Floor Walls Elevation C' },
  { holtPhaseCode: '20400', holtCostCode: '4085', unifiedPhaseCode: '020.000', elevationCode: 'D', batPackId: '|20', shippingOrder: 3, holtDescription: 'Main Floor Walls Elevation D' },

  { holtPhaseCode: '21100', holtCostCode: '4085', unifiedPhaseCode: '020.000', elevationCode: 'A', batPackId: '|20', shippingOrder: 3, holtDescription: 'Main Floor Walls Variant A' },

  // Options for Main Walls (25xxx)
  { holtPhaseCode: '25100', holtCostCode: '4085', unifiedPhaseCode: '025.100', elevationCode: 'A', batPackId: '|25', shippingOrder: 3, holtDescription: 'Covered Deck Option A' },
  { holtPhaseCode: '25200', holtCostCode: '4085', unifiedPhaseCode: '025.200', elevationCode: 'B', batPackId: '|25', shippingOrder: 3, holtDescription: 'Covered Deck Option B' },

  // Window Series (40xxx) - Shipping Order 5
  { holtPhaseCode: '40100', holtCostCode: '4140', unifiedPhaseCode: '040.000', elevationCode: 'A', batPackId: '|40', shippingOrder: 5, holtDescription: 'Roof/Windows Elevation A' },
  { holtPhaseCode: '40200', holtCostCode: '4140', unifiedPhaseCode: '040.000', elevationCode: 'B', batPackId: '|40', shippingOrder: 5, holtDescription: 'Roof/Windows Elevation B' },
  { holtPhaseCode: '40300', holtCostCode: '4140', unifiedPhaseCode: '040.000', elevationCode: 'C', batPackId: '|40', shippingOrder: 5, holtDescription: 'Roof/Windows Elevation C' },
  { holtPhaseCode: '40400', holtCostCode: '4140', unifiedPhaseCode: '040.000', elevationCode: 'D', batPackId: '|40', shippingOrder: 5, holtDescription: 'Roof/Windows Elevation D' },

  // Doors & Trim Series (83xxx) - Shipping Order 7
  { holtPhaseCode: '83100', holtCostCode: '4150', unifiedPhaseCode: '060.000', elevationCode: 'A', batPackId: '|83', shippingOrder: 7, holtDescription: 'Doors/Trim Elevation A' },
  { holtPhaseCode: '83200', holtCostCode: '4150', unifiedPhaseCode: '060.000', elevationCode: 'B', batPackId: '|83', shippingOrder: 7, holtDescription: 'Doors/Trim Elevation B' },
  { holtPhaseCode: '83300', holtCostCode: '4150', unifiedPhaseCode: '060.000', elevationCode: 'C', batPackId: '|83', shippingOrder: 7, holtDescription: 'Doors/Trim Elevation C' },
  { holtPhaseCode: '83400', holtCostCode: '4150', unifiedPhaseCode: '060.000', elevationCode: 'D', batPackId: '|83', shippingOrder: 7, holtDescription: 'Doors/Trim Elevation D' },
];

// ============================================================================
// BAT PACK DEFINITIONS
// Legacy BAT pack structure for shipping order and Richmond code grouping
// ============================================================================
interface BatPackDef {
  packId: string;
  packName: string;
  packTitle?: string;
  richmondCodes?: string;
  shippingOrder: number;
  shipsWith?: string;
  materialClassCode: string;
  description?: string;
}

const BAT_PACK_DEFINITIONS: BatPackDef[] = [
  // Shipping Order 1 - Foundation
  { packId: '|10', packName: 'Foundation', packTitle: '10 Foundation', richmondCodes: 'ELVA,ELVB,ELVC,ELVD', shippingOrder: 1, materialClassCode: '1000', description: 'Standard foundation framing' },
  { packId: '|11', packName: 'Main Joist System', packTitle: '11 Main Joist @Foundation', shippingOrder: 1, materialClassCode: '1000', description: 'Main floor joist system at foundation' },
  { packId: '|12', packName: 'Garage Foundation', packTitle: '12 Garage Foundation', richmondCodes: '3CARA,3CARB,3CARC', shippingOrder: 1, materialClassCode: '1000', description: 'Garage foundation options' },
  { packId: '|13', packName: 'Covered Patio Foundation', packTitle: '13 Covered Patio Foundation', richmondCodes: 'COVP', shippingOrder: 1, materialClassCode: '1000', description: 'Covered patio foundation' },
  { packId: '|14', packName: 'Deck Foundation', packTitle: '14 Deck Foundation', richmondCodes: 'DECK', shippingOrder: 1, materialClassCode: '1000', description: 'Deck foundation' },
  { packId: '|15', packName: 'Covered Deck Foundation', packTitle: '15 Covered Deck Foundation', richmondCodes: 'COVD', shippingOrder: 1, materialClassCode: '1000', description: 'Covered deck foundation' },

  // Shipping Order 2 - Subfloor
  { packId: '|18', packName: 'Main Subfloor', packTitle: '18 Main Subfloor', shippingOrder: 2, materialClassCode: '1000', description: 'Main floor subfloor decking' },

  // Shipping Order 3 - Main Walls
  { packId: '|20', packName: 'Main Floor Walls', packTitle: '20 Main Floor Walls', shippingOrder: 3, materialClassCode: '1000', description: 'Main floor wall framing' },
  { packId: '|22', packName: '3-Car Garage Walls', packTitle: '22 3-Car Garage Walls', richmondCodes: '3CARA,3CARB,3CARC', shippingOrder: 3, materialClassCode: '1000', description: '3-car garage wall framing' },
  { packId: '|23', packName: 'Covered Patio Framing', packTitle: '23 Covered Patio Framing', richmondCodes: 'COVP', shippingOrder: 3, materialClassCode: '1000', description: 'Covered patio framing' },
  { packId: '|24', packName: 'Deck Framing', packTitle: '24 Deck Framing', richmondCodes: 'DECK', shippingOrder: 3, materialClassCode: '1000', description: 'Deck framing' },
  { packId: '|25', packName: 'Covered Deck Framing', packTitle: '25 Covered Deck Framing', richmondCodes: 'COVD', shippingOrder: 3, materialClassCode: '1000', description: 'Covered deck framing' },

  // Shipping Order 4 - 2nd Floor
  { packId: '|30', packName: '2nd Floor System', packTitle: '30 2nd Floor System', shippingOrder: 4, materialClassCode: '1000', description: 'Second floor joist system' },
  { packId: '|32', packName: '2nd Floor Subfloor', packTitle: '32 2nd Floor Subfloor', shippingOrder: 4, materialClassCode: '1000', description: 'Second floor subfloor' },
  { packId: '|34', packName: '2nd Floor Walls', packTitle: '34 2nd Floor Walls', shippingOrder: 4, materialClassCode: '1000', description: 'Second floor wall framing' },

  // Shipping Order 5 - Roof
  { packId: '|40', packName: 'Roof', packTitle: '40 Roof', shippingOrder: 5, materialClassCode: '1000', description: 'Main roof framing and sheathing' },
  { packId: '|42', packName: 'Garage Roof', packTitle: '42 Garage Roof', richmondCodes: '3CARA,3CARB,3CARC', shippingOrder: 5, materialClassCode: '1000', description: 'Garage roof' },
  { packId: '|43', packName: 'Covered Patio Roof', packTitle: '43 Covered Patio Roof', richmondCodes: 'COVP', shippingOrder: 5, materialClassCode: '1000', description: 'Covered patio roof' },
  { packId: '|45', packName: 'Covered Deck Roof', packTitle: '45 Covered Deck Roof', richmondCodes: 'COVD', shippingOrder: 5, materialClassCode: '1000', description: 'Covered deck roof' },

  // Shipping Order 6 - Housewrap
  { packId: '|58', packName: 'Housewrap', packTitle: '58 Housewrap', shippingOrder: 6, materialClassCode: '1100', description: 'Exterior building wrap' },

  // Shipping Order 7 - Exterior Siding
  { packId: '|60', packName: 'Exterior Siding', packTitle: '60 Exterior Trim & Siding', shippingOrder: 7, materialClassCode: '1100', description: 'Main exterior siding and trim' },
  { packId: '|62', packName: 'Garage Exterior', packTitle: '62 Garage Exterior', richmondCodes: '3CARA,3CARB,3CARC', shippingOrder: 7, materialClassCode: '1100', description: 'Garage exterior siding' },
  { packId: '|63', packName: 'Covered Patio Exterior', packTitle: '63 Siding Covered Patio', richmondCodes: 'COVP', shippingOrder: 7, materialClassCode: '1100', description: 'Covered patio siding' },
  { packId: '|65', packName: 'Covered Deck Exterior', packTitle: '65 Covered Deck Exterior', richmondCodes: 'COVD', shippingOrder: 7, materialClassCode: '1100', description: 'Covered deck exterior' },

  // Shipping Order 8 - Deck Surface
  { packId: '|74', packName: 'Deck Surface', packTitle: '74 Deck Surface', richmondCodes: 'DECK', shippingOrder: 8, materialClassCode: '1100', description: 'Deck surface materials' },
  { packId: '|75', packName: 'Deck Rail', packTitle: '75 Deck Rail', shippingOrder: 8, materialClassCode: '1100', description: 'Deck railing' },

  // Shipping Order 9 - Tall Crawl (separate shipment)
  { packId: '|80', packName: 'Tall Crawl Framing', packTitle: '80 Tall Crawl Framing', richmondCodes: 'TALLCRWL', shippingOrder: 9, materialClassCode: '1000', description: 'Tall crawl space framing' },
  { packId: '|83', packName: 'Doors & Trim', packTitle: '83 Doors & Trim', shippingOrder: 7, materialClassCode: '1100', description: 'Exterior doors and trim' },
  { packId: '|90', packName: 'Tall Crawl Siding', packTitle: '90 Tall Crawl Siding', richmondCodes: 'TALLCRWL', shippingOrder: 9, materialClassCode: '1100', description: 'Tall crawl space siding' },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================
export async function seedHoltXref() {
  console.log('🔗 Seeding Holt Cross-Reference Tables...');

  // 1. Get Material Class IDs
  console.log('  📦 Loading Material Classes...');
  const materialClasses = await prisma.materialClass.findMany();
  const materialClassMap = new Map<string, string>();
  for (const mc of materialClasses) {
    materialClassMap.set(mc.classCode, mc.id);
  }

  if (materialClasses.length === 0) {
    console.error('    ❌ No material classes found! Run codeSystem seed first.');
    return { itemTypes: 0, holtPhases: 0, batPacks: 0 };
  }
  console.log(`    ✓ Found ${materialClasses.length} material classes`);

  // 2. Seed Item Type Cross-Reference
  console.log('  🏷️  Seeding Item Type Cross-Reference...');
  for (const item of ITEM_TYPE_MAPPINGS) {
    const materialClassId = materialClassMap.get(item.materialClassCode);

    await prisma.itemTypeXref.upsert({
      where: { holtCostCode: item.holtCostCode },
      update: {
        holtCostName: item.holtCostName,
        materialClassId: materialClassId || null,
        dartCategory: item.dartCategory,
        dartCategoryName: item.dartCategoryName,
        description: item.description,
      },
      create: {
        holtCostCode: item.holtCostCode,
        holtCostName: item.holtCostName,
        materialClassId: materialClassId || null,
        dartCategory: item.dartCategory,
        dartCategoryName: item.dartCategoryName,
        description: item.description,
      },
    });
  }
  console.log(`    ✓ ${ITEM_TYPE_MAPPINGS.length} item type mappings seeded`);

  // 3. Seed BAT Pack Definitions
  console.log('  📋 Seeding BAT Pack Definitions...');
  for (const pack of BAT_PACK_DEFINITIONS) {
    const materialClassId = materialClassMap.get(pack.materialClassCode);

    await prisma.batPackDefinition.upsert({
      where: { packId: pack.packId },
      update: {
        packName: pack.packName,
        packTitle: pack.packTitle,
        richmondCodes: pack.richmondCodes,
        shippingOrder: pack.shippingOrder,
        shipsWith: pack.shipsWith,
        materialClassId: materialClassId || null,
        description: pack.description,
      },
      create: {
        packId: pack.packId,
        packName: pack.packName,
        packTitle: pack.packTitle,
        richmondCodes: pack.richmondCodes,
        shippingOrder: pack.shippingOrder,
        shipsWith: pack.shipsWith,
        materialClassId: materialClassId || null,
        description: pack.description,
      },
    });
  }
  console.log(`    ✓ ${BAT_PACK_DEFINITIONS.length} BAT pack definitions seeded`);

  // 4. Get Phase Option IDs for Holt mapping
  console.log('  🔍 Loading Phase Option Definitions...');
  const phaseOptions = await prisma.phaseOptionDefinition.findMany();
  const phaseMap = new Map<string, string>();
  for (const phase of phaseOptions) {
    phaseMap.set(phase.phaseCode, phase.id);
  }
  console.log(`    ✓ Found ${phaseOptions.length} phase definitions`);

  // 5. Seed Holt Phase Cross-Reference
  console.log('  🏠 Seeding Holt Phase Cross-Reference...');
  let holtCount = 0;
  for (const holt of HOLT_PHASE_MAPPINGS) {
    const unifiedPhaseId = phaseMap.get(holt.unifiedPhaseCode);
    const materialClassId = holt.holtCostCode
      ? materialClassMap.get(
          ITEM_TYPE_MAPPINGS.find(i => i.holtCostCode === holt.holtCostCode)?.materialClassCode || '1000'
        )
      : null;

    await prisma.holtPhaseXref.upsert({
      where: { holtPhaseCode: holt.holtPhaseCode },
      update: {
        holtCostCode: holt.holtCostCode,
        holtDescription: holt.holtDescription,
        unifiedPhaseId: unifiedPhaseId || null,
        elevationCode: holt.elevationCode,
        itemTypeCode: materialClassId ? '1000' : null,
        batPackId: holt.batPackId,
        shippingOrder: holt.shippingOrder,
      },
      create: {
        holtPhaseCode: holt.holtPhaseCode,
        holtCostCode: holt.holtCostCode,
        holtDescription: holt.holtDescription,
        unifiedPhaseId: unifiedPhaseId || null,
        elevationCode: holt.elevationCode,
        itemTypeCode: materialClassId ? '1000' : null,
        batPackId: holt.batPackId,
        shippingOrder: holt.shippingOrder,
      },
    });
    holtCount++;
  }
  console.log(`    ✓ ${holtCount} Holt phase mappings seeded`);

  console.log('✅ Holt Cross-Reference seeding complete!');

  return {
    itemTypes: ITEM_TYPE_MAPPINGS.length,
    holtPhases: HOLT_PHASE_MAPPINGS.length,
    batPacks: BAT_PACK_DEFINITIONS.length,
  };
}

export default seedHoltXref;
