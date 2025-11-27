/**
 * Material Seed Data
 *
 * Seeds construction materials organized by DART category:
 * - Dimensional lumber (2x4, 2x6, etc.)
 * - Structural panels (OSB, plywood)
 * - Engineered wood (LVL, I-joists)
 * - Hardware and fasteners
 *
 * Reference: /docs/reference/BAT_SYSTEM_GUIDE.md
 * Reference: /docs/archive/skills/claude_skills/ReadyFrame_Process/readyframe-material-calculator/references/lumber_specs.md
 */

import { PrismaClient, MaterialCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface MaterialSeed {
  sku: string;
  description: string;
  category: MaterialCategory;
  subcategory?: string;
  dartCategory: number;
  dartCategoryName: string;
  unitOfMeasure: string;
  vendorCost: number;
  isRLLinked?: boolean;
  rlTag?: string;
}

const MATERIALS: MaterialSeed[] = [
  // ============================================================================
  // DART Category 1: Dimensional Lumber (01-Lumber)
  // ============================================================================
  // 2x4 Studs
  {
    sku: '2X4-92-5/8-DF',
    description: '2x4x92-5/8" DF Stud Grade',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Studs',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 3.89,
    isRLLinked: true,
    rlTag: 'SPF-2X4-STUD',
  },
  {
    sku: '2X4-104-5/8-DF',
    description: '2x4x104-5/8" DF Stud Grade (Main Floor)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Studs',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 4.29,
    isRLLinked: true,
    rlTag: 'SPF-2X4-STUD',
  },
  // 2x4 Plates & Stock
  {
    sku: '2X4-8-SPF',
    description: '2x4x8\' SPF #2',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 4.19,
    isRLLinked: true,
    rlTag: 'SPF-2X4',
  },
  {
    sku: '2X4-10-SPF',
    description: '2x4x10\' SPF #2',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 5.29,
    isRLLinked: true,
    rlTag: 'SPF-2X4',
  },
  {
    sku: '2X4-12-SPF',
    description: '2x4x12\' SPF #2',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 6.29,
    isRLLinked: true,
    rlTag: 'SPF-2X4',
  },
  {
    sku: '2X4-16-SPF',
    description: '2x4x16\' SPF #2 (Top Plates)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 8.49,
    isRLLinked: true,
    rlTag: 'SPF-2X4',
  },
  // 2x6 Studs
  {
    sku: '2X6-92-5/8-DF',
    description: '2x6x92-5/8" DF Stud Grade',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Studs',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 5.79,
    isRLLinked: true,
    rlTag: 'SPF-2X6-STUD',
  },
  {
    sku: '2X6-104-5/8-DF',
    description: '2x6x104-5/8" DF Stud Grade (Main Floor)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Studs',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 6.49,
    isRLLinked: true,
    rlTag: 'SPF-2X6-STUD',
  },
  // 2x6 Stock
  {
    sku: '2X6-8-SPF',
    description: '2x6x8\' SPF #2',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 6.29,
    isRLLinked: true,
    rlTag: 'SPF-2X6',
  },
  {
    sku: '2X6-16-SPF',
    description: '2x6x16\' SPF #2 (Top Plates)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Plates',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 12.79,
    isRLLinked: true,
    rlTag: 'SPF-2X6',
  },
  // Header Materials
  {
    sku: '2X8-8-DF',
    description: '2x8x8\' DF #2 (Headers)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Headers',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 9.49,
    isRLLinked: true,
    rlTag: 'DF-2X8',
  },
  {
    sku: '2X10-8-DF',
    description: '2x10x8\' DF #2 (Headers)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Headers',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 12.29,
    isRLLinked: true,
    rlTag: 'DF-2X10',
  },
  {
    sku: '2X12-8-DF',
    description: '2x12x8\' DF #2 (Headers)',
    category: MaterialCategory.DIMENSIONAL_LUMBER,
    subcategory: 'Headers',
    dartCategory: 1,
    dartCategoryName: '01-Lumber',
    unitOfMeasure: 'EA',
    vendorCost: 15.49,
    isRLLinked: true,
    rlTag: 'DF-2X12',
  },

  // ============================================================================
  // DART Category 2: Structural Panels (02-StrctP)
  // ============================================================================
  {
    sku: 'OSB-7/16-4X8',
    description: '7/16" OSB 4x8 Wall Sheathing',
    category: MaterialCategory.SHEATHING,
    subcategory: 'Wall Sheathing',
    dartCategory: 2,
    dartCategoryName: '02-StrctP',
    unitOfMeasure: 'SHT',
    vendorCost: 12.49,
    isRLLinked: true,
    rlTag: 'OSB-7/16',
  },
  {
    sku: 'OSB-15/32-4X8',
    description: '15/32" OSB 4x8 Roof Sheathing',
    category: MaterialCategory.SHEATHING,
    subcategory: 'Roof Sheathing',
    dartCategory: 2,
    dartCategoryName: '02-StrctP',
    unitOfMeasure: 'SHT',
    vendorCost: 14.99,
    isRLLinked: true,
    rlTag: 'OSB-15/32',
  },
  {
    sku: 'OSB-23/32-4X8-TG',
    description: '23/32" OSB 4x8 T&G Floor Sheathing',
    category: MaterialCategory.SHEATHING,
    subcategory: 'Floor Sheathing',
    dartCategory: 2,
    dartCategoryName: '02-StrctP',
    unitOfMeasure: 'SHT',
    vendorCost: 26.99,
    isRLLinked: true,
    rlTag: 'OSB-23/32',
  },
  {
    sku: 'PLY-1/2-CDX-4X8',
    description: '1/2" CDX Plywood 4x8',
    category: MaterialCategory.SHEATHING,
    subcategory: 'Plywood',
    dartCategory: 2,
    dartCategoryName: '02-StrctP',
    unitOfMeasure: 'SHT',
    vendorCost: 28.49,
    isRLLinked: true,
    rlTag: 'PLY-CDX',
  },
  {
    sku: 'PLY-3/4-CDX-4X8',
    description: '3/4" CDX Plywood 4x8',
    category: MaterialCategory.SHEATHING,
    subcategory: 'Plywood',
    dartCategory: 2,
    dartCategoryName: '02-StrctP',
    unitOfMeasure: 'SHT',
    vendorCost: 42.99,
    isRLLinked: true,
    rlTag: 'PLY-CDX',
  },

  // ============================================================================
  // DART Category 3: Engineered Wood (03-EngWdP)
  // ============================================================================
  {
    sku: 'LVL-1-3/4X9-1/2-16',
    description: 'LVL 1-3/4"x9-1/2"x16\' Beam',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'LVL Beams',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 89.99,
  },
  {
    sku: 'LVL-1-3/4X11-7/8-16',
    description: 'LVL 1-3/4"x11-7/8"x16\' Beam',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'LVL Beams',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 119.99,
  },
  {
    sku: 'LVL-1-3/4X14-16',
    description: 'LVL 1-3/4"x14"x16\' Beam',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'LVL Beams',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 149.99,
  },
  {
    sku: 'IJT-9-1/2-TJI110',
    description: 'TJI 110 I-Joist 9-1/2" x 16\'',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'I-Joists',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 32.99,
  },
  {
    sku: 'IJT-11-7/8-TJI110',
    description: 'TJI 110 I-Joist 11-7/8" x 16\'',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'I-Joists',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 38.99,
  },
  {
    sku: 'RIM-1-1/8X9-1/2',
    description: 'Rim Board 1-1/8"x9-1/2" x 16\'',
    category: MaterialCategory.ENGINEERED_LUMBER,
    subcategory: 'Rim Board',
    dartCategory: 3,
    dartCategoryName: '03-EngWdP',
    unitOfMeasure: 'EA',
    vendorCost: 45.99,
  },

  // ============================================================================
  // DART Category 10: Insulation (10-Insul)
  // ============================================================================
  {
    sku: 'INS-R13-15-KRAFT',
    description: 'R-13 Fiberglass Batt 15" Kraft Faced',
    category: MaterialCategory.INSULATION,
    subcategory: 'Batts',
    dartCategory: 10,
    dartCategoryName: '10-Insul',
    unitOfMeasure: 'BAG',
    vendorCost: 38.99,
  },
  {
    sku: 'INS-R19-15-KRAFT',
    description: 'R-19 Fiberglass Batt 15" Kraft Faced',
    category: MaterialCategory.INSULATION,
    subcategory: 'Batts',
    dartCategory: 10,
    dartCategoryName: '10-Insul',
    unitOfMeasure: 'BAG',
    vendorCost: 52.99,
  },
  {
    sku: 'INS-R21-23-KRAFT',
    description: 'R-21 Fiberglass Batt 23" Kraft Faced',
    category: MaterialCategory.INSULATION,
    subcategory: 'Batts',
    dartCategory: 10,
    dartCategoryName: '10-Insul',
    unitOfMeasure: 'BAG',
    vendorCost: 64.99,
  },
  {
    sku: 'INS-R38-BLOW',
    description: 'R-38 Blown-In Fiberglass',
    category: MaterialCategory.INSULATION,
    subcategory: 'Blown',
    dartCategory: 10,
    dartCategoryName: '10-Insul',
    unitOfMeasure: 'BAG',
    vendorCost: 32.99,
  },

  // ============================================================================
  // DART Category 12: Gypsum (12-Gypsum)
  // ============================================================================
  {
    sku: 'DRY-1/2-4X8',
    description: '1/2" Drywall 4x8 Regular',
    category: MaterialCategory.DRYWALL,
    subcategory: 'Standard',
    dartCategory: 12,
    dartCategoryName: '12-Gypsum',
    unitOfMeasure: 'SHT',
    vendorCost: 8.99,
  },
  {
    sku: 'DRY-1/2-4X12',
    description: '1/2" Drywall 4x12 Regular',
    category: MaterialCategory.DRYWALL,
    subcategory: 'Standard',
    dartCategory: 12,
    dartCategoryName: '12-Gypsum',
    unitOfMeasure: 'SHT',
    vendorCost: 13.49,
  },
  {
    sku: 'DRY-5/8-4X8-FR',
    description: '5/8" Drywall 4x8 Fire Rated',
    category: MaterialCategory.DRYWALL,
    subcategory: 'Fire Rated',
    dartCategory: 12,
    dartCategoryName: '12-Gypsum',
    unitOfMeasure: 'SHT',
    vendorCost: 11.99,
  },
  {
    sku: 'DRY-1/2-4X8-MR',
    description: '1/2" Drywall 4x8 Moisture Resistant',
    category: MaterialCategory.DRYWALL,
    subcategory: 'Moisture Resistant',
    dartCategory: 12,
    dartCategoryName: '12-Gypsum',
    unitOfMeasure: 'SHT',
    vendorCost: 14.99,
  },

  // ============================================================================
  // DART Category 13: Hardware (13-Hrdwr)
  // ============================================================================
  {
    sku: 'NAIL-16D-COMMON',
    description: '16d Common Nails 50lb Box',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Nails',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'BOX',
    vendorCost: 54.99,
  },
  {
    sku: 'NAIL-8D-COMMON',
    description: '8d Common Nails 50lb Box',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Nails',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'BOX',
    vendorCost: 52.99,
  },
  {
    sku: 'SCREW-3-DECK',
    description: '#9 x 3" Deck Screws 5lb Box',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Screws',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'BOX',
    vendorCost: 38.99,
  },
  {
    sku: 'HANGER-LUS28',
    description: 'Simpson LUS28 Joist Hanger',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Hangers',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'EA',
    vendorCost: 2.89,
  },
  {
    sku: 'HANGER-LUS210',
    description: 'Simpson LUS210 Joist Hanger',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Hangers',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'EA',
    vendorCost: 3.49,
  },
  {
    sku: 'STRAP-LSTP',
    description: 'Simpson LSTA Strap Tie 1-1/4"x21"',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Straps',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'EA',
    vendorCost: 4.29,
  },
  {
    sku: 'ANCHOR-HD5A',
    description: 'Simpson HD5A Hold-Down',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Hold-Downs',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'EA',
    vendorCost: 18.99,
  },
  {
    sku: 'ANCHOR-AB',
    description: 'Anchor Bolt 1/2" x 10"',
    category: MaterialCategory.HARDWARE,
    subcategory: 'Anchors',
    dartCategory: 13,
    dartCategoryName: '13-Hrdwr',
    unitOfMeasure: 'EA',
    vendorCost: 1.49,
  },

  // ============================================================================
  // DART Category 4: Pressure Treated (04-TrusWP / using PT)
  // ============================================================================
  {
    sku: '2X6-8-PT-GC',
    description: '2x6x8\' Pressure Treated Ground Contact',
    category: MaterialCategory.PRESSURE_TREATED,
    subcategory: 'Ground Contact',
    dartCategory: 4,
    dartCategoryName: '04-TrusWP',
    unitOfMeasure: 'EA',
    vendorCost: 10.99,
  },
  {
    sku: '2X6-12-PT-GC',
    description: '2x6x12\' Pressure Treated Ground Contact',
    category: MaterialCategory.PRESSURE_TREATED,
    subcategory: 'Ground Contact',
    dartCategory: 4,
    dartCategoryName: '04-TrusWP',
    unitOfMeasure: 'EA',
    vendorCost: 16.49,
  },
  {
    sku: '4X4-8-PT-GC',
    description: '4x4x8\' Pressure Treated Ground Contact',
    category: MaterialCategory.PRESSURE_TREATED,
    subcategory: 'Posts',
    dartCategory: 4,
    dartCategoryName: '04-TrusWP',
    unitOfMeasure: 'EA',
    vendorCost: 12.99,
  },
];

export async function seedMaterials() {
  console.log('🌱 Seeding materials...');

  const createdMaterials: any[] = [];

  for (const materialData of MATERIALS) {
    console.log(`  Creating material ${materialData.sku}...`);

    const material = await prisma.material.upsert({
      where: { sku: materialData.sku },
      update: {
        description: materialData.description,
        category: materialData.category,
        subcategory: materialData.subcategory,
        dartCategory: materialData.dartCategory,
        dartCategoryName: materialData.dartCategoryName,
        unitOfMeasure: materialData.unitOfMeasure,
        vendorCost: materialData.vendorCost,
        isRLLinked: materialData.isRLLinked ?? false,
        rlTag: materialData.rlTag,
        isActive: true,
      },
      create: {
        sku: materialData.sku,
        description: materialData.description,
        category: materialData.category,
        subcategory: materialData.subcategory,
        dartCategory: materialData.dartCategory,
        dartCategoryName: materialData.dartCategoryName,
        unitOfMeasure: materialData.unitOfMeasure,
        vendorCost: materialData.vendorCost,
        isRLLinked: materialData.isRLLinked ?? false,
        rlTag: materialData.rlTag,
        isActive: true,
      },
    });

    createdMaterials.push(material);
  }

  // Summary by category
  const byCategory = createdMaterials.reduce((acc, m) => {
    acc[m.dartCategoryName] = (acc[m.dartCategoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('✅ Materials seeded successfully');
  console.log(`  - Total materials: ${createdMaterials.length}`);
  console.log('  - By DART category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`    ${cat}: ${count}`);
  });

  return createdMaterials;
}

export default seedMaterials;
