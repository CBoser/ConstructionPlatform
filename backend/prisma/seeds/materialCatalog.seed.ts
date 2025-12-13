/**
 * Material Catalog Seed Data
 *
 * Seeds the internal material catalog and supplier SKU cross-references.
 *
 * Architecture:
 * - InternalMaterial: MindFlow's supplier-agnostic material catalog
 * - SupplierSkuXref: Maps internal materials to supplier-specific SKUs
 * - Supplier: Vendor/supplier master list
 *
 * Source: MindFlow Unified Coding System v2.0 + HOLT BAT Pack Materials Reference Guide
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// SUPPLIER DEFINITIONS
// ============================================================================

const SUPPLIERS = [
  {
    code: 'HOLT',
    name: 'Holt Homes Supply',
    type: 'Distributor',
    catalogVersion: 'BAT_NOV_2025',
    packSystem: 'BAT',
    notes: 'Primary framing and siding supplier for Holt Homes builders',
  },
  {
    code: 'BFS',
    name: "Builder's FirstSource",
    type: 'Dealer',
    catalogVersion: 'STO_DEC_2025',
    packSystem: 'STO',
    notes: "Sales Team One PDX - Builder's FirstSource descriptive item codes",
  },
  {
    code: '84LBR',
    name: '84 Lumber',
    type: 'Dealer',
    catalogVersion: '2025-Q4',
    packSystem: 'BOM',
    notes: 'National lumber and building materials dealer',
  },
  {
    code: 'BLUELINX',
    name: 'BlueLinx',
    type: 'Distributor',
    catalogVersion: '2025',
    packSystem: 'Custom',
    notes: 'Specialty building products distributor',
  },
  {
    code: 'RAH',
    name: 'Richmond American Homes',
    type: 'Builder',
    catalogVersion: 'BAT_V2_2025',
    packSystem: 'BAT',
    notes: 'Richmond American Homes - 400 items with RAH Item Numbers',
  },
];

// ============================================================================
// INTERNAL MATERIAL CATALOG
// Our unified material definitions - supplier agnostic
// ============================================================================

interface InternalMaterialDef {
  internalCode: string;
  description: string;
  category: string;
  subcategory?: string;
  itemTypeCode?: string;
  species?: string;
  grade?: string;
  nominalSize?: string;
  length?: string;
  unitOfMeasure: string;
  notes?: string;
}

// Framing Lumber (Item Type 1000)
const FRAMING_LUMBER: InternalMaterialDef[] = [
  // 2x4 Studs
  { internalCode: 'FRM-2X4-92-SPF-STUD', description: '2x4x92-5/8 SPF Precut Stud', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'SPF', grade: 'STUD', nominalSize: '2x4', length: '92-5/8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-92-HF-STUD', description: '2x4x92-5/8 HF Precut Stud', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'HF', grade: 'STUD', nominalSize: '2x4', length: '92-5/8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-104-SPF-STUD', description: '2x4x104-5/8 SPF Precut Stud 9ft', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'SPF', grade: 'STUD', nominalSize: '2x4', length: '104-5/8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-116-SPF-STUD', description: '2x4x116-5/8 SPF Precut Stud 10ft', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'SPF', grade: 'STUD', nominalSize: '2x4', length: '116-5/8', unitOfMeasure: 'EA' },

  // 2x6 Studs
  { internalCode: 'FRM-2X6-92-SPF-STUD', description: '2x6x92-5/8 SPF Precut Stud', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'SPF', grade: 'STUD', nominalSize: '2x6', length: '92-5/8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-92-HF-STUD', description: '2x6x92-5/8 HF Precut Stud', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'HF', grade: 'STUD', nominalSize: '2x6', length: '92-5/8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-104-SPF-STUD', description: '2x6x104-5/8 SPF Precut Stud 9ft', category: 'Framing Lumber', subcategory: 'Studs', itemTypeCode: '1000', species: 'SPF', grade: 'STUD', nominalSize: '2x6', length: '104-5/8', unitOfMeasure: 'EA' },

  // Plates - 2x4
  { internalCode: 'FRM-2X4-8-SPF-PLT', description: '2x4x8 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-10-SPF-PLT', description: '2x4x10 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-12-SPF-PLT', description: '2x4x12 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-14-SPF-PLT', description: '2x4x14 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-16-SPF-PLT', description: '2x4x16 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-20-SPF-PLT', description: '2x4x20 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x4', length: '20', unitOfMeasure: 'EA' },

  // Plates - 2x6
  { internalCode: 'FRM-2X6-8-SPF-PLT', description: '2x6x8 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-10-SPF-PLT', description: '2x6x10 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-12-SPF-PLT', description: '2x6x12 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-14-SPF-PLT', description: '2x6x14 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-16-SPF-PLT', description: '2x6x16 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-20-SPF-PLT', description: '2x6x20 SPF #2 Plate', category: 'Framing Lumber', subcategory: 'Plates', itemTypeCode: '1000', species: 'SPF', grade: '#2', nominalSize: '2x6', length: '20', unitOfMeasure: 'EA' },

  // Headers - 2x10
  { internalCode: 'FRM-2X10-8-DF-HDR', description: '2x10x8 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x10', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X10-10-DF-HDR', description: '2x10x10 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x10', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X10-12-DF-HDR', description: '2x10x12 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x10', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X10-14-DF-HDR', description: '2x10x14 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x10', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X10-16-DF-HDR', description: '2x10x16 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x10', length: '16', unitOfMeasure: 'EA' },

  // Headers - 2x12
  { internalCode: 'FRM-2X12-8-DF-HDR', description: '2x12x8 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x12', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X12-10-DF-HDR', description: '2x12x10 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x12', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X12-12-DF-HDR', description: '2x12x12 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x12', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X12-14-DF-HDR', description: '2x12x14 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x12', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X12-16-DF-HDR', description: '2x12x16 DF #2 Header', category: 'Framing Lumber', subcategory: 'Headers', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x12', length: '16', unitOfMeasure: 'EA' },

  // Sill Plate - Pressure Treated
  { internalCode: 'FRM-2X6-8-PT-SILL', description: '2x6x8 PT Sill Plate', category: 'Framing Lumber', subcategory: 'Sill Plate', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '2x6', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-10-PT-SILL', description: '2x6x10 PT Sill Plate', category: 'Framing Lumber', subcategory: 'Sill Plate', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '2x6', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-12-PT-SILL', description: '2x6x12 PT Sill Plate', category: 'Framing Lumber', subcategory: 'Sill Plate', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '2x6', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-14-PT-SILL', description: '2x6x14 PT Sill Plate', category: 'Framing Lumber', subcategory: 'Sill Plate', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '2x6', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X6-16-PT-SILL', description: '2x6x16 PT Sill Plate', category: 'Framing Lumber', subcategory: 'Sill Plate', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '2x6', length: '16', unitOfMeasure: 'EA' },

  // Posts - 4x4 Pressure Treated
  { internalCode: 'FRM-4X4-8-PT-POST', description: '4x4x8 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '4x4', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-4X4-10-PT-POST', description: '4x4x10 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '4x4', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-4X4-12-PT-POST', description: '4x4x12 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '4x4', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-4X4-16-PT-POST', description: '4x4x16 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '4x4', length: '16', unitOfMeasure: 'EA' },

  // Posts - 6x6 Pressure Treated
  { internalCode: 'FRM-6X6-8-PT-POST', description: '6x6x8 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '6x6', length: '8', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-6X6-10-PT-POST', description: '6x6x10 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '6x6', length: '10', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-6X6-12-PT-POST', description: '6x6x12 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '6x6', length: '12', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-6X6-16-PT-POST', description: '6x6x16 PT Post', category: 'Framing Lumber', subcategory: 'Posts', itemTypeCode: '1000', species: 'PT', grade: '#2', nominalSize: '6x6', length: '16', unitOfMeasure: 'EA' },

  // Bracing
  { internalCode: 'FRM-2X4-14-DF-BRACE', description: '2x4x14 DF Let-In Brace', category: 'Framing Lumber', subcategory: 'Bracing', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x4', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-16-DF-BRACE', description: '2x4x16 DF Let-In Brace', category: 'Framing Lumber', subcategory: 'Bracing', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x4', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'FRM-2X4-20-DF-BRACE', description: '2x4x20 DF Let-In Brace', category: 'Framing Lumber', subcategory: 'Bracing', itemTypeCode: '1000', species: 'DF', grade: '#2', nominalSize: '2x4', length: '20', unitOfMeasure: 'EA' },
];

// Engineered Lumber (Item Type 1100)
const ENGINEERED_LUMBER: InternalMaterialDef[] = [
  // I-Joists
  { internalCode: 'ENG-IJ-9.5-16', description: 'I-Joist 9-1/2" x 16ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '9.5"', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-9.5-18', description: 'I-Joist 9-1/2" x 18ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '9.5"', length: '18', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-9.5-20', description: 'I-Joist 9-1/2" x 20ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '9.5"', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-11.875-16', description: 'I-Joist 11-7/8" x 16ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '11.875"', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-11.875-18', description: 'I-Joist 11-7/8" x 18ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '11.875"', length: '18', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-11.875-20', description: 'I-Joist 11-7/8" x 20ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '11.875"', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-11.875-24', description: 'I-Joist 11-7/8" x 24ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '11.875"', length: '24', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-14-16', description: 'I-Joist 14" x 16ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '14"', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-14-20', description: 'I-Joist 14" x 20ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '14"', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-IJ-16-20', description: 'I-Joist 16" x 20ft', category: 'Engineered Lumber', subcategory: 'I-Joists', itemTypeCode: '1100', nominalSize: '16"', length: '20', unitOfMeasure: 'EA' },

  // LVL Beams
  { internalCode: 'ENG-LVL-1.75X9.5-16', description: 'LVL 1-3/4 x 9-1/2 x 16ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x9.5', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X9.5-20', description: 'LVL 1-3/4 x 9-1/2 x 20ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x9.5', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X11.875-16', description: 'LVL 1-3/4 x 11-7/8 x 16ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x11.875', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X11.875-20', description: 'LVL 1-3/4 x 11-7/8 x 20ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x11.875', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X11.875-24', description: 'LVL 1-3/4 x 11-7/8 x 24ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x11.875', length: '24', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X14-20', description: 'LVL 1-3/4 x 14 x 20ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x14', length: '20', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-LVL-1.75X16-20', description: 'LVL 1-3/4 x 16 x 20ft', category: 'Engineered Lumber', subcategory: 'LVL', itemTypeCode: '1100', nominalSize: '1.75x16', length: '20', unitOfMeasure: 'EA' },

  // Rim Board
  { internalCode: 'ENG-RIM-1.125X9.5-16', description: 'Rim Board 1-1/8 x 9-1/2 x 16ft', category: 'Engineered Lumber', subcategory: 'Rim Board', itemTypeCode: '1100', nominalSize: '1.125x9.5', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-RIM-1.125X11.875-16', description: 'Rim Board 1-1/8 x 11-7/8 x 16ft', category: 'Engineered Lumber', subcategory: 'Rim Board', itemTypeCode: '1100', nominalSize: '1.125x11.875', length: '16', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-RIM-1.25X14-16', description: 'Rim Board 1-1/4 x 14 x 16ft', category: 'Engineered Lumber', subcategory: 'Rim Board', itemTypeCode: '1100', nominalSize: '1.25x14', length: '16', unitOfMeasure: 'EA' },

  // Glulam
  { internalCode: 'ENG-GLU-3.125X11.25-14', description: 'Glulam 3-1/8 x 11-1/4 x 14ft', category: 'Engineered Lumber', subcategory: 'Glulam', itemTypeCode: '1100', nominalSize: '3.125x11.25', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-GLU-3.125X11.25-18', description: 'Glulam 3-1/8 x 11-1/4 x 18ft', category: 'Engineered Lumber', subcategory: 'Glulam', itemTypeCode: '1100', nominalSize: '3.125x11.25', length: '18', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-GLU-5.125X12-14', description: 'Glulam 5-1/8 x 12 x 14ft', category: 'Engineered Lumber', subcategory: 'Glulam', itemTypeCode: '1100', nominalSize: '5.125x12', length: '14', unitOfMeasure: 'EA' },
  { internalCode: 'ENG-GLU-5.125X12-18', description: 'Glulam 5-1/8 x 12 x 18ft', category: 'Engineered Lumber', subcategory: 'Glulam', itemTypeCode: '1100', nominalSize: '5.125x12', length: '18', unitOfMeasure: 'EA' },
];

// Sheathing (Item Type 2000)
const SHEATHING: InternalMaterialDef[] = [
  // OSB Wall Sheathing
  { internalCode: 'SHT-OSB-7/16-4X8', description: 'OSB 7/16 4x8 Wall Sheathing', category: 'Sheathing', subcategory: 'Wall Sheathing', itemTypeCode: '2000', nominalSize: '7/16', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-OSB-7/16-4X9', description: 'OSB 7/16 4x9 Wall Sheathing', category: 'Sheathing', subcategory: 'Wall Sheathing', itemTypeCode: '2000', nominalSize: '7/16', length: '4x9', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-OSB-7/16-4X10', description: 'OSB 7/16 4x10 Wall Sheathing', category: 'Sheathing', subcategory: 'Wall Sheathing', itemTypeCode: '2000', nominalSize: '7/16', length: '4x10', unitOfMeasure: 'SHT' },

  // OSB Roof Sheathing
  { internalCode: 'SHT-OSB-1/2-4X8-ROOF', description: 'OSB 1/2 4x8 Roof Sheathing', category: 'Sheathing', subcategory: 'Roof Sheathing', itemTypeCode: '2000', nominalSize: '1/2', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-OSB-15/32-4X8-ROOF', description: 'OSB 15/32 4x8 Roof Sheathing', category: 'Sheathing', subcategory: 'Roof Sheathing', itemTypeCode: '2000', nominalSize: '15/32', length: '4x8', unitOfMeasure: 'SHT' },

  // Subfloor
  { internalCode: 'SHT-OSB-23/32-4X8-TG', description: 'OSB 23/32 4x8 T&G Subfloor', category: 'Sheathing', subcategory: 'Subfloor', itemTypeCode: '2000', nominalSize: '23/32', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-OSB-7/8-4X8-TG', description: 'OSB 7/8 4x8 T&G Subfloor', category: 'Sheathing', subcategory: 'Subfloor', itemTypeCode: '2000', nominalSize: '7/8', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-OSB-1-1/8-4X8-TG', description: 'OSB 1-1/8 4x8 T&G Subfloor', category: 'Sheathing', subcategory: 'Subfloor', itemTypeCode: '2000', nominalSize: '1-1/8', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-ADV-23/32-4X8-TG', description: 'AdvanTech 23/32 4x8 Subfloor', category: 'Sheathing', subcategory: 'Subfloor', itemTypeCode: '2000', nominalSize: '23/32', length: '4x8', unitOfMeasure: 'SHT' },

  // Plywood
  { internalCode: 'SHT-PLY-1/2-CDX-4X8', description: 'Plywood 1/2 CDX 4x8', category: 'Sheathing', subcategory: 'Plywood', itemTypeCode: '2000', grade: 'CDX', nominalSize: '1/2', length: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SHT-PLY-3/4-CDX-4X8', description: 'Plywood 3/4 CDX 4x8', category: 'Sheathing', subcategory: 'Plywood', itemTypeCode: '2000', grade: 'CDX', nominalSize: '3/4', length: '4x8', unitOfMeasure: 'SHT' },
];

// Hardware (Item Type 1200)
const HARDWARE: InternalMaterialDef[] = [
  // Joist Hangers
  { internalCode: 'HW-HGR-LUS26', description: 'Joist Hanger LUS26', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-LUS28', description: 'Joist Hanger LUS28', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-LUS210', description: 'Joist Hanger LUS210', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-LUS212', description: 'Joist Hanger LUS212', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-HUS26', description: 'Face Mount Hanger HUS26', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-HUS28', description: 'Face Mount Hanger HUS28', category: 'Hardware', subcategory: 'Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // I-Joist Hangers
  { internalCode: 'HW-HGR-IUS9.5', description: 'I-Joist Hanger 9-1/2', category: 'Hardware', subcategory: 'I-Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HGR-IUS11.875', description: 'I-Joist Hanger 11-7/8', category: 'Hardware', subcategory: 'I-Joist Hangers', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // Framing Angles
  { internalCode: 'HW-ANG-A34', description: 'Framing Angle A34', category: 'Hardware', subcategory: 'Framing Angles', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-ANG-A35', description: 'Framing Angle A35', category: 'Hardware', subcategory: 'Framing Angles', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-ANG-LS50', description: 'Angle LS50', category: 'Hardware', subcategory: 'Framing Angles', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // Post Bases
  { internalCode: 'HW-BASE-ABU44Z', description: 'Post Base ABU44Z', category: 'Hardware', subcategory: 'Post Bases', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-BASE-ABU66Z', description: 'Post Base ABU66Z', category: 'Hardware', subcategory: 'Post Bases', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-BASE-CB44', description: 'Column Base CB44', category: 'Hardware', subcategory: 'Post Bases', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-BASE-CB66', description: 'Column Base CB66', category: 'Hardware', subcategory: 'Post Bases', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // Hold-Downs
  { internalCode: 'HW-HD-HDU2', description: 'Hold-Down HDU2', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HD-HDU4', description: 'Hold-Down HDU4', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HD-HDU5', description: 'Hold-Down HDU5', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HD-HDU8', description: 'Hold-Down HDU8', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HD-HD5A', description: 'Hold-Down HD5A', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-HD-HD7A', description: 'Hold-Down HD7A', category: 'Hardware', subcategory: 'Hold-Downs', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // Straps
  { internalCode: 'HW-STRAP-CS16', description: 'Coiled Strap CS16', category: 'Hardware', subcategory: 'Straps', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-STRAP-CS22', description: 'Coiled Strap CS22', category: 'Hardware', subcategory: 'Straps', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-STRAP-MSTA24', description: 'Strap Tie MSTA24', category: 'Hardware', subcategory: 'Straps', itemTypeCode: '1200', unitOfMeasure: 'EA' },
  { internalCode: 'HW-STRAP-MSTC40', description: 'Strap Tie MSTC40', category: 'Hardware', subcategory: 'Straps', itemTypeCode: '1200', unitOfMeasure: 'EA' },

  // Sill Sealer
  { internalCode: 'HW-SEAL-5.5X50', description: 'Sill Sealer 5.5" x 50ft', category: 'Hardware', subcategory: 'Sill Sealer', itemTypeCode: '1200', unitOfMeasure: 'RL' },
];

// Housewrap (Item Type 2000)
const HOUSEWRAP: InternalMaterialDef[] = [
  { internalCode: 'WRB-TYVEK-9X125', description: 'Tyvek Housewrap 9ft x 125ft', category: 'Weather Barrier', subcategory: 'Housewrap', itemTypeCode: '2000', nominalSize: '9x125', unitOfMeasure: 'RL' },
  { internalCode: 'WRB-TYVEK-10X150', description: 'Tyvek Housewrap 10ft x 150ft', category: 'Weather Barrier', subcategory: 'Housewrap', itemTypeCode: '2000', nominalSize: '10x150', unitOfMeasure: 'RL' },
  { internalCode: 'WRB-TAPE-3X164', description: 'Tyvek Tape 3" x 164ft', category: 'Weather Barrier', subcategory: 'Tape', itemTypeCode: '2000', nominalSize: '3x164', unitOfMeasure: 'RL' },
  { internalCode: 'WRB-FLASH-4X75', description: 'Flashing Tape 4" x 75ft', category: 'Weather Barrier', subcategory: 'Flashing', itemTypeCode: '2000', nominalSize: '4x75', unitOfMeasure: 'RL' },
  { internalCode: 'WRB-FLASH-9X75-SILL', description: 'Sill Flashing 9" x 75ft', category: 'Weather Barrier', subcategory: 'Flashing', itemTypeCode: '2000', nominalSize: '9x75', unitOfMeasure: 'RL' },
];

// Siding (Item Type 2100)
const SIDING: InternalMaterialDef[] = [
  // Lap Siding
  { internalCode: 'SID-LAP-HZ-5.25-12', description: 'HardiePlank Lap 5-1/4" x 12ft', category: 'Siding', subcategory: 'Lap Siding', itemTypeCode: '2100', nominalSize: '5.25', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-LAP-HZ-8.25-12', description: 'HardiePlank Lap 8-1/4" x 12ft', category: 'Siding', subcategory: 'Lap Siding', itemTypeCode: '2100', nominalSize: '8.25', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-LAP-HZ-6.25-12', description: 'HardiePlank Lap 6-1/4" x 12ft', category: 'Siding', subcategory: 'Lap Siding', itemTypeCode: '2100', nominalSize: '6.25', length: '12', unitOfMeasure: 'PC' },

  // Panel Siding
  { internalCode: 'SID-PNL-HZ-4X8', description: 'HardiePanel 4x8 Smooth', category: 'Siding', subcategory: 'Panel Siding', itemTypeCode: '2100', nominalSize: '4x8', unitOfMeasure: 'SHT' },
  { internalCode: 'SID-PNL-HZ-4X9', description: 'HardiePanel 4x9 Smooth', category: 'Siding', subcategory: 'Panel Siding', itemTypeCode: '2100', nominalSize: '4x9', unitOfMeasure: 'SHT' },
  { internalCode: 'SID-PNL-HZ-4X10', description: 'HardiePanel 4x10 Smooth', category: 'Siding', subcategory: 'Panel Siding', itemTypeCode: '2100', nominalSize: '4x10', unitOfMeasure: 'SHT' },

  // Shingle Siding
  { internalCode: 'SID-SHGL-HZ-STD', description: 'HardieShingle Standard', category: 'Siding', subcategory: 'Shingle Siding', itemTypeCode: '2100', unitOfMeasure: 'PC' },
  { internalCode: 'SID-SHGL-HZ-STAG', description: 'HardieShingle Staggered', category: 'Siding', subcategory: 'Shingle Siding', itemTypeCode: '2100', unitOfMeasure: 'PC' },

  // Trim
  { internalCode: 'SID-TRM-HZ-4-12', description: 'HardieTrim 5/4 x 4 x 12ft', category: 'Siding', subcategory: 'Trim', itemTypeCode: '2100', nominalSize: '5/4x4', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-TRM-HZ-6-12', description: 'HardieTrim 5/4 x 6 x 12ft', category: 'Siding', subcategory: 'Trim', itemTypeCode: '2100', nominalSize: '5/4x6', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-TRM-HZ-8-12', description: 'HardieTrim 5/4 x 8 x 12ft', category: 'Siding', subcategory: 'Trim', itemTypeCode: '2100', nominalSize: '5/4x8', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-TRM-HZ-10-12', description: 'HardieTrim 5/4 x 10 x 12ft', category: 'Siding', subcategory: 'Trim', itemTypeCode: '2100', nominalSize: '5/4x10', length: '12', unitOfMeasure: 'PC' },
  { internalCode: 'SID-TRM-HZ-12-12', description: 'HardieTrim 5/4 x 12 x 12ft', category: 'Siding', subcategory: 'Trim', itemTypeCode: '2100', nominalSize: '5/4x12', length: '12', unitOfMeasure: 'PC' },

  // Fascia
  { internalCode: 'SID-FASC-FJ-2X8-20', description: 'Fascia FJ 2x8x20 WWP', category: 'Siding', subcategory: 'Fascia', itemTypeCode: '2100', nominalSize: '2x8', length: '20', unitOfMeasure: 'PC' },
  { internalCode: 'SID-FASC-FJ-2X10-20', description: 'Fascia FJ 2x10x20 WWP', category: 'Siding', subcategory: 'Fascia', itemTypeCode: '2100', nominalSize: '2x10', length: '20', unitOfMeasure: 'PC' },
  { internalCode: 'SID-FASC-FJ-2X12-20', description: 'Fascia FJ 2x12x20 WWP', category: 'Siding', subcategory: 'Fascia', itemTypeCode: '2100', nominalSize: '2x12', length: '20', unitOfMeasure: 'PC' },
];

// Combine all materials
const ALL_INTERNAL_MATERIALS = [
  ...FRAMING_LUMBER,
  ...ENGINEERED_LUMBER,
  ...SHEATHING,
  ...HARDWARE,
  ...HOUSEWRAP,
  ...SIDING,
];

// ============================================================================
// HOLT SUPPLIER SKU CROSS-REFERENCE
// Maps our internal materials to HOLT's BAT pack SKUs
// ============================================================================

interface SupplierSkuXrefDef {
  internalCode: string;      // Links to InternalMaterial
  supplierSku: string;       // HOLT's SKU
  supplierDescription?: string;
  supplierPackId: string;    // HOLT's BAT pack (|10, |20, etc.)
  supplierCategory?: number; // DART category
}

const HOLT_SKUS: SupplierSkuXrefDef[] = [
  // Foundation/Sill Plate - Pack |10
  { internalCode: 'FRM-2X6-16-PT-SILL', supplierSku: '2616HF3TICAG', supplierDescription: '2x6x16 KD HF #3 TIC Corner AG', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-14-PT-SILL', supplierSku: '2614HF3TICAG', supplierDescription: '2x6x14 KD HF #3 TIC Corner AG', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-12-PT-SILL', supplierSku: '2612HF3TICAG', supplierDescription: '2x6x12 KD HF #3 TIC Corner AG', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'HW-SEAL-5.5X50', supplierSku: 'SS550', supplierDescription: 'Sill Sealer 5.5" x 50\'', supplierPackId: '|10', supplierCategory: 8 },

  // Studs - Pack |20
  { internalCode: 'FRM-2X4-92-SPF-STUD', supplierSku: '2492SPF2', supplierDescription: '2x4x92-5/8 SPF Stud Precut', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-92-HF-STUD', supplierSku: '2492HF2', supplierDescription: '2x4x92-5/8 HF Stud Precut', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-92-SPF-STUD', supplierSku: '2692SPF2', supplierDescription: '2x6x92-5/8 SPF Stud Precut', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-92-HF-STUD', supplierSku: '2692HF2', supplierDescription: '2x6x92-5/8 HF Stud Precut', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-104-SPF-STUD', supplierSku: '2410458DF', supplierDescription: '2x4x104-5/8 DF Stud 9ft', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-104-SPF-STUD', supplierSku: '2610458DF', supplierDescription: '2x6x104-5/8 DF Stud 9ft', supplierPackId: '|20', supplierCategory: 1 },

  // Wall Sheathing - Pack |20
  { internalCode: 'SHT-OSB-7/16-4X8', supplierSku: '716OSB', supplierDescription: '7/16 OSB 4x8', supplierPackId: '|20', supplierCategory: 3 },
  { internalCode: 'SHT-OSB-7/16-4X9', supplierSku: '716OSB9', supplierDescription: '7/16 OSB 4x9', supplierPackId: '|20', supplierCategory: 3 },
  { internalCode: 'SHT-OSB-7/16-4X10', supplierSku: '716OSB10', supplierDescription: '7/16 OSB 4x10', supplierPackId: '|20', supplierCategory: 3 },

  // Subfloor - Pack |18
  { internalCode: 'SHT-OSB-1-1/8-4X8-TG', supplierSku: '118TGOSBWGOFF', supplierDescription: '1-1/8" T&G OSB Subfloor', supplierPackId: '|18', supplierCategory: 3 },
  { internalCode: 'SHT-OSB-7/8-4X8-TG', supplierSku: '78TGOSBWGOFF', supplierDescription: '7/8" T&G OSB 2nd Floor', supplierPackId: '|32', supplierCategory: 3 },

  // Hardware - Pack |10, |20
  { internalCode: 'HW-ANG-A35', supplierSku: 'A35', supplierDescription: 'Simpson A35 Framing Angle', supplierPackId: '|10', supplierCategory: 8 },
  { internalCode: 'HW-ANG-A34', supplierSku: 'A34', supplierDescription: 'Simpson A34 Framing Angle', supplierPackId: '|40', supplierCategory: 8 },
  { internalCode: 'HW-ANG-LS50', supplierSku: 'LS50', supplierDescription: 'Simpson LS50 Angle', supplierPackId: '|30', supplierCategory: 8 },
  { internalCode: 'HW-BASE-ABU66Z', supplierSku: 'ABU66Z', supplierDescription: 'Post Base ABU66Z', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU2', supplierSku: 'HDU2-SDS2.5', supplierDescription: 'Hold-Down HDU2-SDS2.5', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU4', supplierSku: 'HDU4-SDS2.5', supplierDescription: 'Hold-Down HDU4-SDS2.5', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU5', supplierSku: 'HDU5-SDS2.5', supplierDescription: 'Hold-Down HDU5-SDS2.5', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-STRAP-MSTA24', supplierSku: 'MSTA24', supplierDescription: '24" Strap Tie', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-STRAP-CS16', supplierSku: 'CS16-R', supplierDescription: 'Coiled Strap CS16-R', supplierPackId: '|20', supplierCategory: 8 },

  // Joist Hangers - Pack |11, |30
  { internalCode: 'HW-HGR-LUS26', supplierSku: 'LUS26', supplierDescription: 'Simpson LUS26', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-LUS28', supplierSku: 'LUS28', supplierDescription: 'Simpson LUS28', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-LUS210', supplierSku: 'LUS210', supplierDescription: 'Simpson LUS210', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-LUS212', supplierSku: 'LUS212', supplierDescription: 'Simpson LUS212', supplierPackId: '|11', supplierCategory: 8 },

  // Housewrap - Pack |58
  { internalCode: 'WRB-TYVEK-9X125', supplierSku: '9125DWRA', supplierDescription: '9\' x 125\' Tyvek Housewrap', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-TAPE-3X164', supplierSku: 'TTAPE3-164RA', supplierDescription: 'Tyvek Tape 3" x 164\'', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-4X75', supplierSku: '475DFTRA', supplierDescription: 'Flashing Tape 4" x 75\'', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-9X75-SILL', supplierSku: '975TFWNFRA', supplierDescription: 'Sill Flashing 9" x 75\'', supplierPackId: '|58', supplierCategory: 7 },

  // Siding - Pack |60
  { internalCode: 'SID-LAP-HZ-5.25-12', supplierSku: 'HZ10514CMSP', supplierDescription: 'HardiePlank 5-1/4 ColorPlus', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-LAP-HZ-8.25-12', supplierSku: 'HZ10814CMSP', supplierDescription: 'HardiePlank 8-1/4 ColorPlus', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-PNL-HZ-4X8', supplierSku: 'HZ1048CMP', supplierDescription: 'HardiePanel 4x8 ColorPlus', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-PNL-HZ-4X9', supplierSku: 'HZ1049CMP', supplierDescription: 'HardiePanel 4x9 ColorPlus', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-PNL-HZ-4X10', supplierSku: 'HZ10410CMP', supplierDescription: 'HardiePanel 4x10 ColorPlus', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-SHGL-HZ-STD', supplierSku: 'HZ10PSE', supplierDescription: 'HardieShingle Standard Edge', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-SHGL-HZ-STAG', supplierSku: 'HZ10PSTE', supplierDescription: 'HardieShingle Staggered Edge', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-TRM-HZ-4-12', supplierSku: 'HZU54412RT', supplierDescription: 'HardieTrim 5/4x4x12', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-TRM-HZ-6-12', supplierSku: 'HZU54612RT', supplierDescription: 'HardieTrim 5/4x6x12', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-TRM-HZ-8-12', supplierSku: 'HZU54812RT', supplierDescription: 'HardieTrim 5/4x8x12', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-TRM-HZ-10-12', supplierSku: 'HZU541012RT', supplierDescription: 'HardieTrim 5/4x10x12', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-TRM-HZ-12-12', supplierSku: 'HZU541212RT', supplierDescription: 'HardieTrim 5/4x12x12', supplierPackId: '|60', supplierCategory: 4 },

  // Fascia - Pack |40
  { internalCode: 'SID-FASC-FJ-2X8-20', supplierSku: '2820WWP', supplierDescription: '2x8x20 FJ WWP Fascia', supplierPackId: '|40', supplierCategory: 5 },
  { internalCode: 'SID-FASC-FJ-2X10-20', supplierSku: '21020WWP', supplierDescription: '2x10x20 FJ WWP Fascia', supplierPackId: '|40', supplierCategory: 5 },
  { internalCode: 'SID-FASC-FJ-2X12-20', supplierSku: '21220WWP', supplierDescription: '2x12x20 FJ WWP Fascia', supplierPackId: '|40', supplierCategory: 5 },

  // ========== ADDITIONAL HOLT MATERIALS BY CATEGORY (278 items total) ==========

  // Dimensional Lumber - Additional 2x4 Lengths
  { internalCode: 'FRM-2X4-8-SPF-PLT', supplierSku: '248DF', supplierDescription: '2x4x8 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-10-SPF-PLT', supplierSku: '2410DF', supplierDescription: '2x4x10 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-12-SPF-PLT', supplierSku: '2412DF', supplierDescription: '2x4x12 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-14-SPF-PLT', supplierSku: '2414DF', supplierDescription: '2x4x14 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-16-SPF-PLT', supplierSku: '2416DF', supplierDescription: '2x4x16 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-20-SPF-PLT', supplierSku: '2420DF', supplierDescription: '2x4x20 STD&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-116-SPF-STUD', supplierSku: '2411658DF', supplierDescription: '2x4x116-5/8 DF Stud 10ft', supplierPackId: '|20', supplierCategory: 1 },

  // Dimensional Lumber - Additional 2x6 Lengths
  { internalCode: 'FRM-2X6-8-SPF-PLT', supplierSku: '268DF2', supplierDescription: '2x6x8 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-10-SPF-PLT', supplierSku: '2610DF2', supplierDescription: '2x6x10 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-12-SPF-PLT', supplierSku: '2612DF2', supplierDescription: '2x6x12 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-14-SPF-PLT', supplierSku: '2614DF2', supplierDescription: '2x6x14 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-16-SPF-PLT', supplierSku: '2616DF2', supplierDescription: '2x6x16 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-20-SPF-PLT', supplierSku: '2620DF2', supplierDescription: '2x6x20 #2&BTR DF Plate', supplierPackId: '|20', supplierCategory: 1 },

  // Headers & Beams - 2x8, 2x10, 2x12
  { internalCode: 'FRM-2X10-8-DF-HDR', supplierSku: '2108DF2', supplierDescription: '2x10x8 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X10-10-DF-HDR', supplierSku: '21010DF2', supplierDescription: '2x10x10 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X10-12-DF-HDR', supplierSku: '21012DF2', supplierDescription: '2x10x12 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X10-16-DF-HDR', supplierSku: '21016DF2', supplierDescription: '2x10x16 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X12-10-DF-HDR', supplierSku: '21210DF2', supplierDescription: '2x12x10 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X12-12-DF-HDR', supplierSku: '21212DF2', supplierDescription: '2x12x12 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X12-16-DF-HDR', supplierSku: '21216DF2', supplierDescription: '2x12x16 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },
  { internalCode: 'FRM-2X12-20-DF-HDR', supplierSku: '21220DF2', supplierDescription: '2x12x20 #2&BTR DF Header', supplierPackId: '|30', supplierCategory: 1 },

  // Pressure Treated Lumber
  { internalCode: 'FRM-2X4-8-PT-SILL', supplierSku: '248HF2TICGC', supplierDescription: '2x4x8 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-12-PT-SILL', supplierSku: '2412HF2TICGC', supplierDescription: '2x4x12 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X4-20-PT-SILL', supplierSku: '2420HF2TICGC', supplierDescription: '2x4x20 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X6-16-PT-SILL', supplierSku: '2616HF2TICGC', supplierDescription: '2x6x16 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X8-10-PT-HDR', supplierSku: '2810HF2TICGC', supplierDescription: '2x8x10 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },
  { internalCode: 'FRM-2X12-12-PT-HDR', supplierSku: '21212HF2TICGC', supplierDescription: '2x12x12 #2 HF TRTD GC ICT', supplierPackId: '|10', supplierCategory: 1 },

  // Engineered Lumber - I-Joists (TJI)
  { internalCode: 'ENG-IJ-9.5-16', supplierSku: '10TJI110', supplierDescription: '9-1/2 TJI-110 LF', supplierPackId: '|11', supplierCategory: 2 },
  { internalCode: 'ENG-IJ-11.875-16', supplierSku: '12TJI110', supplierDescription: '11-7/8 TJI-110 LF', supplierPackId: '|11', supplierCategory: 2 },
  { internalCode: 'ENG-LVL-1.75X9.5-16', supplierSku: '10TSH', supplierDescription: '3-1/2x9-1/2 TJ LSL LF', supplierPackId: '|11', supplierCategory: 2 },
  { internalCode: 'ENG-RIM-1.125X9.5-16', supplierSku: '10114TJRIM20', supplierDescription: '1-1/4x9-1/2 TJ LSL RIM 20\'', supplierPackId: '|11', supplierCategory: 2 },
  { internalCode: 'ENG-RIM-1.125X11.875-16', supplierSku: '12114TJRIM20', supplierDescription: '1-1/4x11-7/8 TJ LSL RIM 20\'', supplierPackId: '|11', supplierCategory: 2 },

  // Sheathing/Panels - OSB
  { internalCode: 'SHT-OSB-23/32-4X8-TG', supplierSku: '34TGOSBWGOFF', supplierDescription: '23/32 T&G OSB EdgeGold SIF', supplierPackId: '|18', supplierCategory: 3 },
  { internalCode: 'SHT-PLY-1/2-CDX-4X8', supplierSku: '12CDXF4', supplierDescription: '15/32 4x8 CDX FIR 4PLY RTD', supplierPackId: '|32', supplierCategory: 3 },

  // Hardware - Additional Angles & Clips
  { internalCode: 'HW-ANG-A35Z', supplierSku: 'A35Z', supplierDescription: 'A35 FRAMING ANCHOR Z-MAX', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-ANG-A34Z', supplierSku: 'A34Z', supplierDescription: 'A34 FRAMING ANCHOR Z-MAX', supplierPackId: '|40', supplierCategory: 8 },
  { internalCode: 'HW-BASE-ABU44Z', supplierSku: 'ABU44Z', supplierDescription: 'ABU44 4X4 ADJ. POST Z-MAX', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-BASE-ABU46Z', supplierSku: 'ABU46Z', supplierDescription: 'ABU46 4X6 ADJ. POST Z-MAX', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-BASE-ABU88Z', supplierSku: 'ABU88Z', supplierDescription: 'ABU88 8X8 ADJ. POST Z-MAX', supplierPackId: '|20', supplierCategory: 8 },

  // Hardware - Straps & Hold-Downs
  { internalCode: 'HW-STRAP-CMST14', supplierSku: 'CMST14', supplierDescription: 'COILED STRAP 14GA', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-STRAP-CS16', supplierSku: 'CS16', supplierDescription: 'COILED STRAP 150\'', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-STRAP-CS20', supplierSku: 'CS20', supplierDescription: 'SIMPSON CS20 11/4 250COILSTRAP', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU8', supplierSku: 'HDU8-SDS2.5', supplierDescription: '16-5/8 HOLDOWN HANGER W/SCREWS', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU11', supplierSku: 'HDU11-SDS2.5', supplierDescription: 'HDU11-SDS2.5 HOLDDOWN', supplierPackId: '|20', supplierCategory: 8 },
  { internalCode: 'HW-HD-HDU14', supplierSku: 'HDU14-SDS2.5', supplierDescription: '25-11/16 PREDEFLECTED HOLDOWN', supplierPackId: '|20', supplierCategory: 8 },

  // Hardware - Additional Joist Hangers
  { internalCode: 'HW-HGR-HUS210', supplierSku: 'HUS210', supplierDescription: '2X10 JOIST FM HANGER EA', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUS26', supplierSku: 'HUS26', supplierDescription: 'SIMPSON HUS26 JOIST HANGER EA', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUS26Z', supplierSku: 'HUS26Z', supplierDescription: 'HUS26Z JOIST HANGR Z-MAX', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUS26-2', supplierSku: 'HUS26-2', supplierDescription: 'HUS26-2 Heavy DutyHanger', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUS48', supplierSku: 'HUS48', supplierDescription: 'HUS48 Heavy Duty DblShear Hanger', supplierPackId: '|30', supplierCategory: 8 },
  { internalCode: 'HW-HGR-LUS28', supplierSku: 'LUS28', supplierDescription: 'LUS28 JOIST HANGER 2X8', supplierPackId: '|11', supplierCategory: 8 },
  { internalCode: 'HW-HGR-LUS210-2', supplierSku: 'LUS210-2', supplierDescription: 'SIMPSON DBL JOIST HANGER 2X10', supplierPackId: '|11', supplierCategory: 8 },

  // Hardware - Concealed Hangers
  { internalCode: 'HW-HGR-HUC210-2Z', supplierSku: 'HUC210-2Z', supplierDescription: '2X10 DBL FM CONCL HANGER ZMAX', supplierPackId: '|30', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUC26-2', supplierSku: 'HUC26-2', supplierDescription: 'SIMP FACE-MNT HGR CONCELD', supplierPackId: '|30', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUC48Z', supplierSku: 'HUC48Z', supplierDescription: 'HUC48Z 4X8 F/M HGR CFLG ZMAX', supplierPackId: '|30', supplierCategory: 8 },
  { internalCode: 'HW-HGR-HUC612', supplierSku: 'HUC612', supplierDescription: 'SIMP FACE-MNT HGR CONCEALED', supplierPackId: '|30', supplierCategory: 8 },

  // Weather Barrier - Additional Items
  { internalCode: 'WRB-FLASH-4X150', supplierSku: '4150TF', supplierDescription: '4"X150\' TYVEK FLASHING', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-6X75', supplierSku: '675TFWNFRA', supplierDescription: '6"X75\' TYVEK FLEXWRAP NF TAPE', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-FORTI-9X75', supplierSku: '975FF', supplierDescription: '9 X 75 FORTIFLASH 25 MIL', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-TAPE-2X165', supplierSku: 'TTAPE2-165', supplierDescription: '1.88"X165\' TYVEK TAPE', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-QFP100', supplierSku: 'QFP100', supplierDescription: 'QUICKFLASH PLUMB FLASHNG P-100', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-QFPE', supplierSku: 'QFPE30BA78', supplierDescription: 'E-SGA QUICKFLASH PANEL', supplierPackId: '|58', supplierCategory: 7 },
  { internalCode: 'WRB-FLASH-ZFLASH', supplierSku: 'XZH516', supplierDescription: 'TAMLYN 5/16"X 10 Z-FLASHING', supplierPackId: '|58', supplierCategory: 7 },

  // Siding - Additional HardiePlank Items
  { internalCode: 'SID-LAP-HZ-6.25-12', supplierSku: 'HZ10614CMSP', supplierDescription: '5/16X6.25X12 HZ10 CEDRML SELCT', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-LAP-HZ-9.25-12', supplierSku: 'HZ10914CMSP', supplierDescription: '5/16X9.25X12 HZ10 CEDRML SELCT', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-LAP-HZ-12-12', supplierSku: 'HZ1012CMSP', supplierDescription: '5/16X12X12\' HZ10 CEDRML SELCT', supplierPackId: '|60', supplierCategory: 4 },
  { internalCode: 'SID-PNL-HZ-4X10-SM', supplierSku: 'HZ10410SMP', supplierDescription: '5/16X4\'X10\' HZ10 SMOOTH VRTCL', supplierPackId: '|60', supplierCategory: 4 },

  // Trim - Primed Wood
  { internalCode: 'TRM-1X3-20-WWP', supplierSku: '1320WWP', supplierDescription: '1X3-20\' WW PRIMED', supplierPackId: '|40', supplierCategory: 5 },
  { internalCode: 'TRM-1X6-20-WWP', supplierSku: '1620WWP', supplierDescription: '1X6-20\' WW PRIMED', supplierPackId: '|40', supplierCategory: 5 },
  { internalCode: 'TRM-2X2-20-WWP', supplierSku: '2220WWP', supplierDescription: '2"X2"-20\' WW PRIMED', supplierPackId: '|40', supplierCategory: 5 },
  { internalCode: 'TRM-HMOLD-516-10', supplierSku: 'SHM51610', supplierDescription: '5/16"X10 PRM ALUM H-MOLD SDG', supplierPackId: '|60', supplierCategory: 5 },

  // Adhesives & Sealants
  { internalCode: 'ADH-SEALANT-DUPONT', supplierSku: 'DPWS', supplierDescription: '10.3 OZ TUBE DUPONT SEALANT', supplierPackId: '|20', supplierCategory: 9 },
  { internalCode: 'ADH-BACKER-ROD', supplierSku: 'MD71550', supplierDescription: 'CAULK BACKER ROD 3/8" X 350\'', supplierPackId: '|60', supplierCategory: 9 },
  { internalCode: 'ADH-SUBFLOOR-GLUE', supplierSku: 'SFG', supplierDescription: 'BFS SUB FLR GLUE 28OZ', supplierPackId: '|18', supplierCategory: 9 },
  { internalCode: 'ADH-POLY-TX1', supplierSku: 'TX1WHT10', supplierDescription: 'TX1 TEXT POLY SEALANT WHT 10OZ', supplierPackId: '|60', supplierCategory: 9 },

  // Accessories - Vents & Bird Blocks
  { internalCode: 'ACC-VENT-1218', supplierSku: '1218RCF', supplierDescription: '12"X18" FLUSH WOOD VENT CEDAR', supplierPackId: '|40', supplierCategory: 6 },
  { internalCode: 'ACC-VENT-1824', supplierSku: '1824RGV', supplierDescription: '18X24 RECTANGLE GABLE VENT', supplierPackId: '|40', supplierCategory: 6 },
  { internalCode: 'ACC-BIRDBLOCK-24', supplierSku: '24SBB', supplierDescription: '2X4 22-7/16 SOLID BIRD BLOCK', supplierPackId: '|40', supplierCategory: 6 },
  { internalCode: 'ACC-BIRDBLOCK-26', supplierSku: '26SBB', supplierDescription: '2X6 22-7/16 SOLID BIRD BLOCK', supplierPackId: '|40', supplierCategory: 6 },
  { internalCode: 'ACC-BIBBLOCK', supplierSku: '512BIBBLK', supplierDescription: '1X5-1/2"X5-1/2" BIB BLOCK', supplierPackId: '|40', supplierCategory: 6 },
  { internalCode: 'ACC-FNDTNVENT', supplierSku: 'HU559408', supplierDescription: '8X16 FNDTN VENT PLASTIC 559408', supplierPackId: '|10', supplierCategory: 6 },
  { internalCode: 'ACC-GABLEVENT-12X18', supplierSku: 'MA00451218030', supplierDescription: '030 PAINTABLE 12X18 GABLEVENT', supplierPackId: '|40', supplierCategory: 6 },

  // Decking
  { internalCode: 'DECK-FIBERON-1X6-20', supplierSku: 'FGL1620SCA', supplierDescription: '1X6-20\' SQ FIBERON GL CABIN', supplierPackId: '|75', supplierCategory: 10 },
];

// ============================================================================
// RICHMOND AMERICAN HOMES (RAH) SKU CROSS-REFERENCE
// Maps internal materials to RAH Item Numbers - 400 items
// Format: RAH option codes with associated material mappings
// ============================================================================

interface RichmondSkuXrefDef {
  internalCode: string;      // Links to InternalMaterial
  rahItemNumber: string;     // RAH Item Number
  rahDescription?: string;   // RAH Description
  rahOption?: string;        // RAH Option Code (3CARA, DEN, COVP, etc.)
  unifiedPhase?: string;     // Unified phase code (012.000, 010.820, etc.)
  category: string;          // Material category
}

const RICHMOND_SKUS: RichmondSkuXrefDef[] = [
  // ========== FOUNDATION MATERIALS (|10 Phase) ==========
  // Base Foundation - Phase 010.000
  { internalCode: 'FRM-2X6-16-PT-SILL', rahItemNumber: 'RAH-FND-001', rahDescription: '2x6x16 PT Mudsill', rahOption: 'Base', unifiedPhase: '010.000', category: 'Foundation' },
  { internalCode: 'FRM-2X6-14-PT-SILL', rahItemNumber: 'RAH-FND-002', rahDescription: '2x6x14 PT Mudsill', rahOption: 'Base', unifiedPhase: '010.000', category: 'Foundation' },
  { internalCode: 'FRM-2X6-12-PT-SILL', rahItemNumber: 'RAH-FND-003', rahDescription: '2x6x12 PT Mudsill', rahOption: 'Base', unifiedPhase: '010.000', category: 'Foundation' },
  { internalCode: 'HW-SEAL-5.5X50', rahItemNumber: 'RAH-FND-010', rahDescription: 'Sill Sealer 5.5" x 50\'', rahOption: 'Base', unifiedPhase: '010.000', category: 'Foundation' },

  // Optional Foundation - Fireplace - Phase 010.010
  { internalCode: 'FRM-2X6-8-PT-SILL', rahItemNumber: 'RAH-FND-020', rahDescription: '2x6x8 PT Fireplace Base', rahOption: 'FPSING01', unifiedPhase: '010.010', category: 'Foundation' },
  { internalCode: 'FRM-4X4-8-PT-POST', rahItemNumber: 'RAH-FND-021', rahDescription: '4x4x8 PT Support Post', rahOption: 'FPSING01', unifiedPhase: '010.010', category: 'Foundation' },

  // ========== 3RD CAR GARAGE MATERIALS (|12 Phase) ==========
  // 3 Car Garage - Elevation A - Phase 012.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-3CAR-001A', rahDescription: '2x4x92-5/8 Garage Wall Stud', rahOption: '3CARA', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-3CAR-002A', rahDescription: '2x4x8 Garage Top Plate', rahOption: '3CARA', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'SHT-OSB-7/16-4X9', rahItemNumber: 'RAH-3CAR-010A', rahDescription: '7/16 OSB Garage Sheathing', rahOption: '3CARA', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'HW-ANG-A35', rahItemNumber: 'RAH-3CAR-020A', rahDescription: 'A35 Framing Angle', rahOption: '3CARA', unifiedPhase: '012.000', category: '3rd Car Garage' },

  // 3 Car Garage - Elevation B - Phase 012.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-3CAR-001B', rahDescription: '2x4x92-5/8 Garage Wall Stud', rahOption: '3CARB', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-3CAR-002B', rahDescription: '2x4x8 Garage Top Plate', rahOption: '3CARB', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'SHT-OSB-7/16-4X9', rahItemNumber: 'RAH-3CAR-010B', rahDescription: '7/16 OSB Garage Sheathing', rahOption: '3CARB', unifiedPhase: '012.000', category: '3rd Car Garage' },

  // 3 Car Garage - Elevation C - Phase 012.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-3CAR-001C', rahDescription: '2x4x92-5/8 Garage Wall Stud', rahOption: '3CARC', unifiedPhase: '012.000', category: '3rd Car Garage' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-3CAR-002C', rahDescription: '2x4x8 Garage Top Plate', rahOption: '3CARC', unifiedPhase: '012.000', category: '3rd Car Garage' },

  // 3 Car Garage - Elevation D - Phase 012.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-3CAR-001D', rahDescription: '2x4x92-5/8 Garage Wall Stud', rahOption: '3CARD', unifiedPhase: '012.000', category: '3rd Car Garage' },

  // 2 Car 4' Extension - Phase 012.040
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-2C4X-001', rahDescription: '2x4x92-5/8 Extension Wall Stud', rahOption: '2CAR4XA', unifiedPhase: '012.040', category: 'Garage Extension' },
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-2C4X-002', rahDescription: '2x4x92-5/8 Extension Wall Stud', rahOption: '2CAR4XB', unifiedPhase: '012.040', category: 'Garage Extension' },

  // ========== COVERED PATIO MATERIALS (|13 Phase) ==========
  // Covered Patio - Elevation A - Phase 013.100
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-COVP-001A', rahDescription: '2x6x92-5/8 Patio Post', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Covered Patio' },
  { internalCode: 'FRM-2X10-12-DF-HDR', rahItemNumber: 'RAH-COVP-010A', rahDescription: '2x10x12 DF Patio Header', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Covered Patio' },
  { internalCode: 'FRM-4X4-8-PT-POST', rahItemNumber: 'RAH-COVP-020A', rahDescription: '4x4x8 PT Patio Support', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Covered Patio' },
  { internalCode: 'HW-BASE-ABU66Z', rahItemNumber: 'RAH-COVP-030A', rahDescription: 'Post Base ABU66Z', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Covered Patio' },

  // Extended Covered Patio - Phase 013.200
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-COVP-001X', rahDescription: '2x6x92-5/8 Extended Patio Post', rahOption: 'XCOVP', unifiedPhase: '013.200', category: 'Covered Patio' },
  { internalCode: 'FRM-2X10-16-DF-HDR', rahItemNumber: 'RAH-COVP-010X', rahDescription: '2x10x16 DF Extended Header', rahOption: 'XCOVP', unifiedPhase: '013.200', category: 'Covered Patio' },

  // ========== MAIN WALLS MATERIALS (|20 Phase) ==========
  // Main Walls - Base - Phase 020.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-WALL-001', rahDescription: '2x4x92-5/8 Interior Wall Stud', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-WALL-002', rahDescription: '2x6x92-5/8 Exterior Wall Stud', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-WALL-010', rahDescription: '2x4x8 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-10-SPF-PLT', rahItemNumber: 'RAH-WALL-011', rahDescription: '2x4x10 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-12-SPF-PLT', rahItemNumber: 'RAH-WALL-012', rahDescription: '2x4x12 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-14-SPF-PLT', rahItemNumber: 'RAH-WALL-013', rahDescription: '2x4x14 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-16-SPF-PLT', rahItemNumber: 'RAH-WALL-014', rahDescription: '2x4x16 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'FRM-2X4-20-SPF-PLT', rahItemNumber: 'RAH-WALL-015', rahDescription: '2x4x20 Top Plate', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'SHT-OSB-7/16-4X8', rahItemNumber: 'RAH-WALL-020', rahDescription: '7/16 OSB Wall Sheathing 4x8', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'SHT-OSB-7/16-4X9', rahItemNumber: 'RAH-WALL-021', rahDescription: '7/16 OSB Wall Sheathing 4x9', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },
  { internalCode: 'SHT-OSB-7/16-4X10', rahItemNumber: 'RAH-WALL-022', rahDescription: '7/16 OSB Wall Sheathing 4x10', rahOption: 'Base', unifiedPhase: '020.000', category: 'Main Walls' },

  // ReadyFrame Walls - Phase 020.x01
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-RF-001', rahDescription: '2x4x92-5/8 ReadyFrame Stud', rahOption: 'RDFRM', unifiedPhase: '020.001', category: 'ReadyFrame' },
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-RF-002', rahDescription: '2x6x92-5/8 ReadyFrame Stud', rahOption: 'RDFRM', unifiedPhase: '020.001', category: 'ReadyFrame' },

  // Great Room Windows - Phase 020.020
  { internalCode: 'FRM-2X10-12-DF-HDR', rahItemNumber: 'RAH-GRW-001', rahDescription: '2x10x12 Window Header', rahOption: 'WDWGREAT', unifiedPhase: '020.020', category: 'Great Room' },
  { internalCode: 'FRM-2X10-16-DF-HDR', rahItemNumber: 'RAH-GRW-002', rahDescription: '2x10x16 Window Header', rahOption: 'WDWGREAT', unifiedPhase: '020.020', category: 'Great Room' },

  // ========== OPTIONAL DEN (|10.820 Phase) ==========
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-DEN-001', rahDescription: '2x4x92-5/8 Den Wall Stud', rahOption: 'DEN', unifiedPhase: '010.820', category: 'Optional Den' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-DEN-002', rahDescription: '2x4x8 Den Top Plate', rahOption: 'DEN', unifiedPhase: '010.820', category: 'Optional Den' },
  { internalCode: 'SHT-OSB-7/16-4X8', rahItemNumber: 'RAH-DEN-010', rahDescription: '7/16 OSB Den Sheathing', rahOption: 'DEN', unifiedPhase: '010.820', category: 'Optional Den' },

  // Den with Full Bath - Phase 010.830
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-DENB-001', rahDescription: '2x4x92-5/8 Den+Bath Wall Stud', rahOption: 'DENBATH', unifiedPhase: '010.830', category: 'Den w/Bath' },
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-DENB-002', rahDescription: '2x6x92-5/8 Den+Bath Wet Wall', rahOption: 'DENBATH', unifiedPhase: '010.830', category: 'Den w/Bath' },

  // ========== SECOND FLOOR (|30-34 Phases) ==========
  // 2nd Floor Deck - Phase 030.000
  { internalCode: 'SHT-OSB-23/32-4X8-TG', rahItemNumber: 'RAH-2FL-001', rahDescription: '23/32 T&G OSB Subfloor', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },
  { internalCode: 'SHT-OSB-7/8-4X8-TG', rahItemNumber: 'RAH-2FL-002', rahDescription: '7/8 T&G OSB Subfloor', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },
  { internalCode: 'ENG-IJ-9.5-16', rahItemNumber: 'RAH-2FL-010', rahDescription: '9-1/2 TJI-110 Floor Joist', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },
  { internalCode: 'ENG-IJ-11.875-16', rahItemNumber: 'RAH-2FL-011', rahDescription: '11-7/8 TJI-110 Floor Joist', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },
  { internalCode: 'ENG-RIM-1.125X9.5-16', rahItemNumber: 'RAH-2FL-020', rahDescription: '9-1/2 TJ Rim Board', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },
  { internalCode: 'ENG-RIM-1.125X11.875-16', rahItemNumber: 'RAH-2FL-021', rahDescription: '11-7/8 TJ Rim Board', rahOption: 'Base', unifiedPhase: '030.000', category: '2nd Floor' },

  // 2nd Floor Walls - Phase 034.000
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-2FW-001', rahDescription: '2x4x92-5/8 2nd Floor Stud', rahOption: 'Base', unifiedPhase: '034.000', category: '2nd Floor Walls' },
  { internalCode: 'FRM-2X6-92-SPF-STUD', rahItemNumber: 'RAH-2FW-002', rahDescription: '2x6x92-5/8 2nd Floor Ext Stud', rahOption: 'Base', unifiedPhase: '034.000', category: '2nd Floor Walls' },

  // Loft Variant - Phase 034.003
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-LOFT-001', rahDescription: '2x4x92-5/8 Loft Wall Stud', rahOption: 'LOFT', unifiedPhase: '034.003', category: 'Loft' },
  { internalCode: 'HW-HGR-LUS26', rahItemNumber: 'RAH-LOFT-010', rahDescription: 'LUS26 Loft Joist Hanger', rahOption: 'LOFT', unifiedPhase: '034.003', category: 'Loft' },

  // Loft to Bedroom Conversion - Phase 034.610
  { internalCode: 'FRM-2X4-92-SPF-STUD', rahItemNumber: 'RAH-L2B-001', rahDescription: '2x4x92-5/8 Bedroom Wall Stud', rahOption: 'ABR6', unifiedPhase: '034.610', category: 'Loft to Bedroom' },
  { internalCode: 'FRM-2X4-8-SPF-PLT', rahItemNumber: 'RAH-L2B-002', rahDescription: '2x4x8 Bedroom Top Plate', rahOption: 'ABR6', unifiedPhase: '034.610', category: 'Loft to Bedroom' },

  // ========== TRUSSES (|40 Phase) ==========
  // Gable Sheathing - Phase 040.100
  { internalCode: 'SHT-OSB-7/16-4X8', rahItemNumber: 'RAH-TRS-001', rahDescription: '7/16 OSB Gable Sheathing', rahOption: 'GABLE', unifiedPhase: '040.100', category: 'Trusses' },
  { internalCode: 'FRM-2X4-14-DF-BRACE', rahItemNumber: 'RAH-TRS-010', rahDescription: '2x4x14 Truss Brace', rahOption: 'Base', unifiedPhase: '040.000', category: 'Trusses' },
  { internalCode: 'FRM-2X4-16-DF-BRACE', rahItemNumber: 'RAH-TRS-011', rahDescription: '2x4x16 Truss Brace', rahOption: 'Base', unifiedPhase: '040.000', category: 'Trusses' },

  // ========== ROOF SHEATHING (|44 Phase) ==========
  { internalCode: 'SHT-OSB-1/2-4X8-ROOF', rahItemNumber: 'RAH-ROOF-001', rahDescription: '1/2 OSB Roof Sheathing', rahOption: 'Base', unifiedPhase: '044.000', category: 'Roof' },
  { internalCode: 'SHT-OSB-15/32-4X8-ROOF', rahItemNumber: 'RAH-ROOF-002', rahDescription: '15/32 OSB Roof Sheathing', rahOption: 'Base', unifiedPhase: '044.000', category: 'Roof' },

  // ========== HOUSEWRAP/WEATHERIZATION (|58 Phase) ==========
  { internalCode: 'WRB-TYVEK-9X125', rahItemNumber: 'RAH-WRP-001', rahDescription: '9\' x 125\' Tyvek Housewrap', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },
  { internalCode: 'WRB-TAPE-3X164', rahItemNumber: 'RAH-WRP-010', rahDescription: 'Tyvek Tape 3" x 164\'', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },
  { internalCode: 'WRB-FLASH-4X75', rahItemNumber: 'RAH-WRP-020', rahDescription: 'Flashing Tape 4" x 75\'', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },
  { internalCode: 'WRB-FLASH-9X75-SILL', rahItemNumber: 'RAH-WRP-021', rahDescription: 'Sill Flashing 9" x 75\'', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },
  { internalCode: 'WRB-FLASH-QFP100', rahItemNumber: 'RAH-WRP-030', rahDescription: 'QuickFlash Plumbing P-100', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },
  { internalCode: 'WRB-FLASH-QFPE', rahItemNumber: 'RAH-WRP-031', rahDescription: 'QuickFlash Panel E-SGA', rahOption: 'Base', unifiedPhase: '058.000', category: 'Weather Barrier' },

  // ========== SIDING (|60 Phase) ==========
  // Base Siding - Phase 060.000
  { internalCode: 'SID-LAP-HZ-5.25-12', rahItemNumber: 'RAH-SID-001', rahDescription: 'HardiePlank 5-1/4 Lap', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-LAP-HZ-8.25-12', rahItemNumber: 'RAH-SID-002', rahDescription: 'HardiePlank 8-1/4 Lap', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X8', rahItemNumber: 'RAH-SID-010', rahDescription: 'HardiePanel 4x8 Vertical', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X9', rahItemNumber: 'RAH-SID-011', rahDescription: 'HardiePanel 4x9 Vertical', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X10', rahItemNumber: 'RAH-SID-012', rahDescription: 'HardiePanel 4x10 Vertical', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-SHGL-HZ-STD', rahItemNumber: 'RAH-SID-020', rahDescription: 'HardieShingle Standard', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },
  { internalCode: 'SID-SHGL-HZ-STAG', rahItemNumber: 'RAH-SID-021', rahDescription: 'HardieShingle Staggered', rahOption: 'Base', unifiedPhase: '060.000', category: 'Siding' },

  // HardieTrim
  { internalCode: 'SID-TRM-HZ-4-12', rahItemNumber: 'RAH-TRM-001', rahDescription: 'HardieTrim 5/4x4x12', rahOption: 'Base', unifiedPhase: '060.000', category: 'Trim' },
  { internalCode: 'SID-TRM-HZ-6-12', rahItemNumber: 'RAH-TRM-002', rahDescription: 'HardieTrim 5/4x6x12', rahOption: 'Base', unifiedPhase: '060.000', category: 'Trim' },
  { internalCode: 'SID-TRM-HZ-8-12', rahItemNumber: 'RAH-TRM-003', rahDescription: 'HardieTrim 5/4x8x12', rahOption: 'Base', unifiedPhase: '060.000', category: 'Trim' },
  { internalCode: 'SID-TRM-HZ-10-12', rahItemNumber: 'RAH-TRM-004', rahDescription: 'HardieTrim 5/4x10x12', rahOption: 'Base', unifiedPhase: '060.000', category: 'Trim' },
  { internalCode: 'SID-TRM-HZ-12-12', rahItemNumber: 'RAH-TRM-005', rahDescription: 'HardieTrim 5/4x12x12', rahOption: 'Base', unifiedPhase: '060.000', category: 'Trim' },

  // Enhanced Elevations - Phase 060.050/100/150
  { internalCode: 'SID-SHGL-HZ-STD', rahItemNumber: 'RAH-ENH-001A', rahDescription: 'Enhanced Shingle Elev A', rahOption: 'ENHA', unifiedPhase: '060.050', category: 'Enhanced' },
  { internalCode: 'SID-SHGL-HZ-STD', rahItemNumber: 'RAH-ENH-001B', rahDescription: 'Enhanced Shingle Elev B', rahOption: 'ENHB', unifiedPhase: '060.050', category: 'Enhanced' },
  { internalCode: 'SID-SHGL-HZ-STD', rahItemNumber: 'RAH-ENH-001C', rahDescription: 'Enhanced Shingle Elev C', rahOption: 'ENHC', unifiedPhase: '060.100', category: 'Enhanced' },
  { internalCode: 'SID-SHGL-HZ-STD', rahItemNumber: 'RAH-ENH-001D', rahDescription: 'Enhanced Shingle Elev D', rahOption: 'ENHD', unifiedPhase: '060.150', category: 'Enhanced' },

  // ========== FASCIA & SOFFIT (|74-76 Phases) ==========
  { internalCode: 'SID-FASC-FJ-2X8-20', rahItemNumber: 'RAH-FAS-001', rahDescription: '2x8x20 FJ Fascia', rahOption: 'Base', unifiedPhase: '074.000', category: 'Fascia' },
  { internalCode: 'SID-FASC-FJ-2X10-20', rahItemNumber: 'RAH-FAS-002', rahDescription: '2x10x20 FJ Fascia', rahOption: 'Base', unifiedPhase: '074.000', category: 'Fascia' },
  { internalCode: 'SID-FASC-FJ-2X12-20', rahItemNumber: 'RAH-FAS-003', rahDescription: '2x12x20 FJ Fascia', rahOption: 'Base', unifiedPhase: '074.000', category: 'Fascia' },
  { internalCode: 'TRM-1X3-20-WWP', rahItemNumber: 'RAH-FAS-010', rahDescription: '1x3x20 Fascia Trim', rahOption: 'Base', unifiedPhase: '074.000', category: 'Fascia' },
  { internalCode: 'TRM-1X6-20-WWP', rahItemNumber: 'RAH-FAS-011', rahDescription: '1x6x20 Fascia Trim', rahOption: 'Base', unifiedPhase: '074.000', category: 'Fascia' },

  // ========== HARDWARE - General (Multiple Phases) ==========
  // Foundation Hardware
  { internalCode: 'HW-ANG-A35', rahItemNumber: 'RAH-HW-001', rahDescription: 'A35 Framing Anchor', rahOption: 'Base', unifiedPhase: '010.000', category: 'Hardware' },
  { internalCode: 'HW-ANG-A35Z', rahItemNumber: 'RAH-HW-002', rahDescription: 'A35 Z-MAX Framing Anchor', rahOption: 'Base', unifiedPhase: '010.000', category: 'Hardware' },
  { internalCode: 'HW-ANG-A34', rahItemNumber: 'RAH-HW-003', rahDescription: 'A34 Framing Anchor', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-ANG-A34Z', rahItemNumber: 'RAH-HW-004', rahDescription: 'A34 Z-MAX Framing Anchor', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },

  // Post Bases
  { internalCode: 'HW-BASE-ABU44Z', rahItemNumber: 'RAH-HW-010', rahDescription: 'ABU44 4x4 Post Base Z-MAX', rahOption: 'Base', unifiedPhase: '013.000', category: 'Hardware' },
  { internalCode: 'HW-BASE-ABU46Z', rahItemNumber: 'RAH-HW-011', rahDescription: 'ABU46 4x6 Post Base Z-MAX', rahOption: 'Base', unifiedPhase: '013.000', category: 'Hardware' },
  { internalCode: 'HW-BASE-ABU66Z', rahItemNumber: 'RAH-HW-012', rahDescription: 'ABU66 6x6 Post Base Z-MAX', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Hardware' },
  { internalCode: 'HW-BASE-ABU88Z', rahItemNumber: 'RAH-HW-013', rahDescription: 'ABU88 8x8 Post Base Z-MAX', rahOption: 'XCOVP', unifiedPhase: '013.200', category: 'Hardware' },

  // Hold-Downs
  { internalCode: 'HW-HD-HDU2', rahItemNumber: 'RAH-HW-020', rahDescription: 'HDU2-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU4', rahItemNumber: 'RAH-HW-021', rahDescription: 'HDU4-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU5', rahItemNumber: 'RAH-HW-022', rahDescription: 'HDU5-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU8', rahItemNumber: 'RAH-HW-023', rahDescription: 'HDU8-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '034.000', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU11', rahItemNumber: 'RAH-HW-024', rahDescription: 'HDU11-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '034.000', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU14', rahItemNumber: 'RAH-HW-025', rahDescription: 'HDU14-SDS2.5 Hold-Down', rahOption: 'Base', unifiedPhase: '034.000', category: 'Hardware' },

  // Straps
  { internalCode: 'HW-STRAP-CMST14', rahItemNumber: 'RAH-HW-030', rahDescription: 'CMST14 Coiled Strap 14GA', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-STRAP-CS16', rahItemNumber: 'RAH-HW-031', rahDescription: 'CS16 Coiled Strap 150\'', rahOption: 'Base', unifiedPhase: '020.000', category: 'Hardware' },
  { internalCode: 'HW-STRAP-CS16-R', rahItemNumber: 'RAH-HW-032', rahDescription: 'CS16-R Coiled Strap 25\'', rahOption: 'Base', unifiedPhase: '034.000', category: 'Hardware' },
  { internalCode: 'HW-STRAP-CS20', rahItemNumber: 'RAH-HW-033', rahDescription: 'CS20 Coiled Strap 250\'', rahOption: 'Base', unifiedPhase: '040.000', category: 'Hardware' },
  { internalCode: 'HW-STRAP-MSTA24', rahItemNumber: 'RAH-HW-034', rahDescription: 'MSTA24 24" Strap Tie', rahOption: 'Base', unifiedPhase: '034.000', category: 'Hardware' },

  // Joist Hangers - Floor
  { internalCode: 'HW-HGR-LUS26', rahItemNumber: 'RAH-HW-040', rahDescription: 'LUS26 2x6 Joist Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS28', rahItemNumber: 'RAH-HW-041', rahDescription: 'LUS28 2x8 Joist Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS210', rahItemNumber: 'RAH-HW-042', rahDescription: 'LUS210 2x10 Joist Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS210-2', rahItemNumber: 'RAH-HW-043', rahDescription: 'LUS210-2 Dbl Joist Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },

  // Joist Hangers - Heavy Duty
  { internalCode: 'HW-HGR-HUS26', rahItemNumber: 'RAH-HW-050', rahDescription: 'HUS26 HD Joist Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS26Z', rahItemNumber: 'RAH-HW-051', rahDescription: 'HUS26Z HD Hanger Z-MAX', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS26-2', rahItemNumber: 'RAH-HW-052', rahDescription: 'HUS26-2 HD Double Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS210', rahItemNumber: 'RAH-HW-053', rahDescription: 'HUS210 HD 2x10 Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS48', rahItemNumber: 'RAH-HW-054', rahDescription: 'HUS48 HD 4x8 Hanger', rahOption: 'Base', unifiedPhase: '013.100', category: 'Hardware' },

  // Concealed Hangers
  { internalCode: 'HW-HGR-HUC26-2', rahItemNumber: 'RAH-HW-060', rahDescription: 'HUC26-2 Concealed Hanger', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUC210-2Z', rahItemNumber: 'RAH-HW-061', rahDescription: 'HUC210-2Z Concealed Z-MAX', rahOption: 'Base', unifiedPhase: '030.000', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUC48Z', rahItemNumber: 'RAH-HW-062', rahDescription: 'HUC48Z Concealed 4x8 Z-MAX', rahOption: 'COVP', unifiedPhase: '013.100', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUC612', rahItemNumber: 'RAH-HW-063', rahDescription: 'HUC612 Concealed 6x12', rahOption: 'XCOVP', unifiedPhase: '013.200', category: 'Hardware' },

  // ========== ADHESIVES & SEALANTS ==========
  { internalCode: 'ADH-SEALANT-DUPONT', rahItemNumber: 'RAH-ADH-001', rahDescription: 'DuPont Sealant 10.3oz', rahOption: 'Base', unifiedPhase: '058.000', category: 'Adhesives' },
  { internalCode: 'ADH-BACKER-ROD', rahItemNumber: 'RAH-ADH-002', rahDescription: 'Backer Rod 3/8" x 350\'', rahOption: 'Base', unifiedPhase: '060.000', category: 'Adhesives' },
  { internalCode: 'ADH-SUBFLOOR-GLUE', rahItemNumber: 'RAH-ADH-003', rahDescription: 'Subfloor Adhesive 28oz', rahOption: 'Base', unifiedPhase: '030.000', category: 'Adhesives' },
  { internalCode: 'ADH-POLY-TX1', rahItemNumber: 'RAH-ADH-004', rahDescription: 'TX1 Poly Sealant White 10oz', rahOption: 'Base', unifiedPhase: '060.000', category: 'Adhesives' },

  // ========== ACCESSORIES ==========
  { internalCode: 'ACC-VENT-1218', rahItemNumber: 'RAH-ACC-001', rahDescription: '12x18 Cedar Flush Vent', rahOption: 'Base', unifiedPhase: '074.000', category: 'Accessories' },
  { internalCode: 'ACC-VENT-1824', rahItemNumber: 'RAH-ACC-002', rahDescription: '18x24 Rectangle Gable Vent', rahOption: 'Base', unifiedPhase: '074.000', category: 'Accessories' },
  { internalCode: 'ACC-BIRDBLOCK-24', rahItemNumber: 'RAH-ACC-010', rahDescription: '2x4 Solid Bird Block', rahOption: 'Base', unifiedPhase: '040.000', category: 'Accessories' },
  { internalCode: 'ACC-BIRDBLOCK-26', rahItemNumber: 'RAH-ACC-011', rahDescription: '2x6 Solid Bird Block', rahOption: 'Base', unifiedPhase: '040.000', category: 'Accessories' },
  { internalCode: 'ACC-BIBBLOCK', rahItemNumber: 'RAH-ACC-012', rahDescription: '5-1/2 x 5-1/2 BIB Block', rahOption: 'Base', unifiedPhase: '020.000', category: 'Accessories' },
  { internalCode: 'ACC-FNDTNVENT', rahItemNumber: 'RAH-ACC-020', rahDescription: '8x16 Foundation Vent', rahOption: 'Base', unifiedPhase: '010.000', category: 'Accessories' },
  { internalCode: 'ACC-GABLEVENT-12X18', rahItemNumber: 'RAH-ACC-021', rahDescription: '12x18 Paintable Gable Vent', rahOption: 'Base', unifiedPhase: '074.000', category: 'Accessories' },

  // ========== DECKING ==========
  { internalCode: 'DECK-FIBERON-1X6-20', rahItemNumber: 'RAH-DECK-001', rahDescription: 'Fiberon 1x6x20 Cabin', rahOption: 'DECK', unifiedPhase: '075.000', category: 'Decking' },
];

// ============================================================================
// BFS (BUILDER'S FIRSTSOURCE) STO SKU CROSS-REFERENCE
// Sales Team One - Human-readable descriptive item codes
// Format: PREFIX-DIMENSION-SPEC[-VARIANT][-SEQ]
// ============================================================================

interface BfsSkuXrefDef {
  internalCode: string;      // Links to InternalMaterial
  supplierSku: string;       // STO descriptive code
  supplierDescription?: string;
  category: string;          // STO category
}

const BFS_SKUS: BfsSkuXrefDef[] = [
  // Dimensional Lumber - Studs
  { internalCode: 'FRM-2X4-92-SPF-STUD', supplierSku: '2X4-92-5/8-SPF', supplierDescription: '2x4 x 92-5/8" SPF Stud Grade', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-92-HF-STUD', supplierSku: '2X4-92-5/8-HF', supplierDescription: '2x4 x 92-5/8" HF Stud Grade', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-92-SPF-STUD', supplierSku: '2X6-92-5/8-SPF', supplierDescription: '2x6 x 92-5/8" SPF Stud Grade', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-92-HF-STUD', supplierSku: '2X6-92-5/8-HF', supplierDescription: '2x6 x 92-5/8" HF Stud Grade', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-104-SPF-STUD', supplierSku: '2X4-104-5/8-DF', supplierDescription: '2x4 x 104-5/8" DF Stud 9ft', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-104-SPF-STUD', supplierSku: '2X6-104-5/8-DF', supplierDescription: '2x6 x 104-5/8" DF Stud 9ft', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-116-SPF-STUD', supplierSku: '2X4-116-5/8-DF', supplierDescription: '2x4 x 116-5/8" DF Stud 10ft', category: 'Dimensional Lumber' },

  // Dimensional Lumber - Plates
  { internalCode: 'FRM-2X4-8-SPF-PLT', supplierSku: '2X4-8-SPF', supplierDescription: '2x4 x 8\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-10-SPF-PLT', supplierSku: '2X4-10-SPF', supplierDescription: '2x4 x 10\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-12-SPF-PLT', supplierSku: '2X4-12-SPF', supplierDescription: '2x4 x 12\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-14-SPF-PLT', supplierSku: '2X4-14-SPF', supplierDescription: '2x4 x 14\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-16-SPF-PLT', supplierSku: '2X4-16-SPF', supplierDescription: '2x4 x 16\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X4-20-SPF-PLT', supplierSku: '2X4-20-SPF', supplierDescription: '2x4 x 20\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-8-SPF-PLT', supplierSku: '2X6-8-SPF', supplierDescription: '2x6 x 8\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-10-SPF-PLT', supplierSku: '2X6-10-SPF', supplierDescription: '2x6 x 10\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-12-SPF-PLT', supplierSku: '2X6-12-SPF', supplierDescription: '2x6 x 12\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-14-SPF-PLT', supplierSku: '2X6-14-SPF', supplierDescription: '2x6 x 14\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-16-SPF-PLT', supplierSku: '2X6-16-SPF', supplierDescription: '2x6 x 16\' SPF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X6-20-SPF-PLT', supplierSku: '2X6-20-SPF', supplierDescription: '2x6 x 20\' SPF #2', category: 'Dimensional Lumber' },

  // Dimensional Lumber - Headers
  { internalCode: 'FRM-2X10-8-DF-HDR', supplierSku: '2X10-8-DF', supplierDescription: '2x10 x 8\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X10-10-DF-HDR', supplierSku: '2X10-10-DF', supplierDescription: '2x10 x 10\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X10-12-DF-HDR', supplierSku: '2X10-12-DF', supplierDescription: '2x10 x 12\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X10-14-DF-HDR', supplierSku: '2X10-14-DF', supplierDescription: '2x10 x 14\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X10-16-DF-HDR', supplierSku: '2X10-16-DF', supplierDescription: '2x10 x 16\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X12-8-DF-HDR', supplierSku: '2X12-8-DF', supplierDescription: '2x12 x 8\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X12-10-DF-HDR', supplierSku: '2X12-10-DF', supplierDescription: '2x12 x 10\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X12-12-DF-HDR', supplierSku: '2X12-12-DF', supplierDescription: '2x12 x 12\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X12-14-DF-HDR', supplierSku: '2X12-14-DF', supplierDescription: '2x12 x 14\' DF #2', category: 'Dimensional Lumber' },
  { internalCode: 'FRM-2X12-16-DF-HDR', supplierSku: '2X12-16-DF', supplierDescription: '2x12 x 16\' DF #2', category: 'Dimensional Lumber' },

  // Pressure Treated - Sill Plates
  { internalCode: 'FRM-2X6-8-PT-SILL', supplierSku: '2X6-8-PT-GC', supplierDescription: '2x6 x 8\' PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-2X6-10-PT-SILL', supplierSku: '2X6-10-PT-GC', supplierDescription: '2x6 x 10\' PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-2X6-12-PT-SILL', supplierSku: '2X6-12-PT-GC', supplierDescription: '2x6 x 12\' PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-2X6-14-PT-SILL', supplierSku: '2X6-14-PT-GC', supplierDescription: '2x6 x 14\' PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-2X6-16-PT-SILL', supplierSku: '2X6-16-PT-GC', supplierDescription: '2x6 x 16\' PT Ground Contact', category: 'Pressure Treated' },

  // Pressure Treated - Posts
  { internalCode: 'FRM-4X4-8-PT-POST', supplierSku: '4X4-8-DF-PT-GC', supplierDescription: '4x4 x 8\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-4X4-10-PT-POST', supplierSku: '4X4-10-DF-PT-GC', supplierDescription: '4x4 x 10\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-4X4-12-PT-POST', supplierSku: '4X4-12-DF-PT-GC', supplierDescription: '4x4 x 12\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-4X4-16-PT-POST', supplierSku: '4X4-16-DF-PT-GC', supplierDescription: '4x4 x 16\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-6X6-8-PT-POST', supplierSku: '6X6-8-DF-PT-GC', supplierDescription: '6x6 x 8\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-6X6-10-PT-POST', supplierSku: '6X6-10-DF-PT-GC', supplierDescription: '6x6 x 10\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-6X6-12-PT-POST', supplierSku: '6X6-12-DF-PT-GC', supplierDescription: '6x6 x 12\' DF PT Ground Contact', category: 'Pressure Treated' },
  { internalCode: 'FRM-6X6-16-PT-POST', supplierSku: '6X6-16-DF-PT-GC', supplierDescription: '6x6 x 16\' DF PT Ground Contact', category: 'Pressure Treated' },

  // Engineered Lumber - I-Joists
  { internalCode: 'ENG-IJ-9.5-16', supplierSku: 'IJT-9-1/2-TJI110', supplierDescription: 'TJI 110 I-Joist 9-1/2" x 16\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-9.5-18', supplierSku: 'IJT-9-1/2-TJI110-18', supplierDescription: 'TJI 110 I-Joist 9-1/2" x 18\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-9.5-20', supplierSku: 'IJT-9-1/2-TJI110-20', supplierDescription: 'TJI 110 I-Joist 9-1/2" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-11.875-16', supplierSku: 'IJT-11-7/8-TJI110', supplierDescription: 'TJI 110 I-Joist 11-7/8" x 16\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-11.875-18', supplierSku: 'IJT-11-7/8-TJI110-18', supplierDescription: 'TJI 110 I-Joist 11-7/8" x 18\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-11.875-20', supplierSku: 'IJT-11-7/8-TJI110-20', supplierDescription: 'TJI 110 I-Joist 11-7/8" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-11.875-24', supplierSku: 'IJT-11-7/8-TJI110-24', supplierDescription: 'TJI 110 I-Joist 11-7/8" x 24\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-14-16', supplierSku: 'IJT-14-TJI110', supplierDescription: 'TJI 110 I-Joist 14" x 16\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-14-20', supplierSku: 'IJT-14-TJI110-20', supplierDescription: 'TJI 110 I-Joist 14" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-IJ-16-20', supplierSku: 'IJT-16-TJI110-20', supplierDescription: 'TJI 110 I-Joist 16" x 20\'', category: 'Engineered Lumber' },

  // Engineered Lumber - LVL
  { internalCode: 'ENG-LVL-1.75X9.5-16', supplierSku: 'LVL-1-3/4X9-1/2', supplierDescription: 'LVL 1-3/4" x 9-1/2" x 16\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X9.5-20', supplierSku: 'LVL-1-3/4X9-1/2-20', supplierDescription: 'LVL 1-3/4" x 9-1/2" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X11.875-16', supplierSku: 'LVL-1-3/4X11-7/8', supplierDescription: 'LVL 1-3/4" x 11-7/8" x 16\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X11.875-20', supplierSku: 'LVL-1-3/4X11-7/8-20', supplierDescription: 'LVL 1-3/4" x 11-7/8" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X11.875-24', supplierSku: 'LVL-1-3/4X11-7/8-24', supplierDescription: 'LVL 1-3/4" x 11-7/8" x 24\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X14-20', supplierSku: 'LVL-1-3/4X14', supplierDescription: 'LVL 1-3/4" x 14" x 20\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-LVL-1.75X16-20', supplierSku: 'LVL-1-3/4X16', supplierDescription: 'LVL 1-3/4" x 16" x 20\'', category: 'Engineered Lumber' },

  // Engineered Lumber - Rim Board
  { internalCode: 'ENG-RIM-1.125X9.5-16', supplierSku: 'RIM-1-1/8X9-1/2', supplierDescription: 'Rim Board 1-1/8" x 9-1/2"', category: 'Engineered Lumber' },
  { internalCode: 'ENG-RIM-1.125X11.875-16', supplierSku: 'RIM-1-1/8X11-7/8', supplierDescription: 'Rim Board 1-1/8" x 11-7/8"', category: 'Engineered Lumber' },
  { internalCode: 'ENG-RIM-1.25X14-16', supplierSku: 'RIM-1-1/4X14', supplierDescription: 'Rim Board 1-1/4" x 14"', category: 'Engineered Lumber' },

  // Engineered Lumber - Glulam
  { internalCode: 'ENG-GLU-3.125X11.25-14', supplierSku: 'GLB-3-1/8X11-1/4', supplierDescription: 'Glulam Beam 3-1/8" x 11-1/4" x 14\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-GLU-3.125X11.25-18', supplierSku: 'GLB-3-1/8X11-1/4-18', supplierDescription: 'Glulam Beam 3-1/8" x 11-1/4" x 18\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-GLU-5.125X12-14', supplierSku: 'GLB-5-1/8X12', supplierDescription: 'Glulam Beam 5-1/8" x 12" x 14\'', category: 'Engineered Lumber' },
  { internalCode: 'ENG-GLU-5.125X12-18', supplierSku: 'GLB-5-1/8X12-18', supplierDescription: 'Glulam Beam 5-1/8" x 12" x 18\'', category: 'Engineered Lumber' },

  // Sheathing - OSB
  { internalCode: 'SHT-OSB-7/16-4X8', supplierSku: 'OSB-7/16-4X8', supplierDescription: '7/16" OSB 4x8 Wall Sheathing', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-7/16-4X9', supplierSku: 'OSB-7/16-4X9', supplierDescription: '7/16" OSB 4x9 Wall Sheathing', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-7/16-4X10', supplierSku: 'OSB-7/16-4X10', supplierDescription: '7/16" OSB 4x10 Wall Sheathing', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-1/2-4X8-ROOF', supplierSku: 'OSB-1/2-4X8', supplierDescription: '1/2" OSB 4x8 Roof Sheathing', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-15/32-4X8-ROOF', supplierSku: 'OSB-15/32-4X8', supplierDescription: '15/32" OSB 4x8 Roof Sheathing', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-23/32-4X8-TG', supplierSku: 'OSB-23/32-4X8-TG', supplierDescription: '23/32" OSB 4x8 T&G Subfloor', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-7/8-4X8-TG', supplierSku: 'OSB-7/8-4X8-TG', supplierDescription: '7/8" OSB 4x8 T&G Subfloor', category: 'Sheathing' },
  { internalCode: 'SHT-OSB-1-1/8-4X8-TG', supplierSku: 'OSB-1-1/8-4X8-TG', supplierDescription: '1-1/8" OSB 4x8 T&G Subfloor', category: 'Sheathing' },

  // Sheathing - Plywood
  { internalCode: 'SHT-PLY-1/2-CDX-4X8', supplierSku: 'PLY-1/2-CDX-4X8', supplierDescription: '1/2" CDX Plywood 4x8', category: 'Sheathing' },
  { internalCode: 'SHT-PLY-3/4-CDX-4X8', supplierSku: 'PLY-3/4-CDX-4X8', supplierDescription: '3/4" CDX Plywood 4x8', category: 'Sheathing' },

  // Hardware - Joist Hangers (Simpson Strong-Tie)
  { internalCode: 'HW-HGR-LUS26', supplierSku: 'HANGER-LUS26', supplierDescription: 'Simpson LUS26 Joist Hanger', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS28', supplierSku: 'HANGER-LUS28', supplierDescription: 'Simpson LUS28 Joist Hanger', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS210', supplierSku: 'HANGER-LUS210', supplierDescription: 'Simpson LUS210 Joist Hanger', category: 'Hardware' },
  { internalCode: 'HW-HGR-LUS212', supplierSku: 'HANGER-LUS212', supplierDescription: 'Simpson LUS212 Joist Hanger', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS26', supplierSku: 'HANGER-HUS26', supplierDescription: 'Simpson HUS26 Face Mount Hanger', category: 'Hardware' },
  { internalCode: 'HW-HGR-HUS28', supplierSku: 'HANGER-HUS28', supplierDescription: 'Simpson HUS28 Face Mount Hanger', category: 'Hardware' },

  // Hardware - Framing Angles
  { internalCode: 'HW-ANG-A34', supplierSku: 'CLIP-A34', supplierDescription: 'Simpson A34 Framing Angle', category: 'Hardware' },
  { internalCode: 'HW-ANG-A35', supplierSku: 'CLIP-A35', supplierDescription: 'Simpson A35 Framing Angle', category: 'Hardware' },
  { internalCode: 'HW-ANG-LS50', supplierSku: 'HDW-LS50', supplierDescription: 'Simpson LS50 Angle', category: 'Hardware' },

  // Hardware - Post Bases
  { internalCode: 'HW-BASE-ABU44Z', supplierSku: 'BASE-ABU44Z', supplierDescription: 'Simpson ABU44Z Post Base', category: 'Hardware' },
  { internalCode: 'HW-BASE-ABU66Z', supplierSku: 'BASE-ABU66Z', supplierDescription: 'Simpson ABU66Z Post Base', category: 'Hardware' },
  { internalCode: 'HW-BASE-CB44', supplierSku: 'BASE-CB44', supplierDescription: 'Simpson CB44 Column Base', category: 'Hardware' },
  { internalCode: 'HW-BASE-CB66', supplierSku: 'BASE-CB66', supplierDescription: 'Simpson CB66 Column Base', category: 'Hardware' },

  // Hardware - Hold-Downs
  { internalCode: 'HW-HD-HDU2', supplierSku: 'ANCHOR-HDU2', supplierDescription: 'Simpson HDU2 Hold-Down', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU4', supplierSku: 'ANCHOR-HDU4', supplierDescription: 'Simpson HDU4 Hold-Down', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU5', supplierSku: 'ANCHOR-HDU5', supplierDescription: 'Simpson HDU5 Hold-Down', category: 'Hardware' },
  { internalCode: 'HW-HD-HDU8', supplierSku: 'ANCHOR-HDU8', supplierDescription: 'Simpson HDU8 Hold-Down', category: 'Hardware' },
  { internalCode: 'HW-HD-HD5A', supplierSku: 'ANCHOR-HD5A', supplierDescription: 'Simpson HD5A Hold-Down', category: 'Hardware' },
  { internalCode: 'HW-HD-HD7A', supplierSku: 'ANCHOR-HD7A', supplierDescription: 'Simpson HD7A Hold-Down', category: 'Hardware' },

  // Hardware - Straps
  { internalCode: 'HW-STRAP-CS16', supplierSku: 'STRAP-CS16', supplierDescription: 'Simpson CS16 Coiled Strap', category: 'Hardware' },
  { internalCode: 'HW-STRAP-CS22', supplierSku: 'STRAP-CS22', supplierDescription: 'Simpson CS22 Coiled Strap', category: 'Hardware' },
  { internalCode: 'HW-STRAP-MSTA24', supplierSku: 'STRAP-MSTA24', supplierDescription: 'Simpson MSTA24 Strap Tie', category: 'Hardware' },
  { internalCode: 'HW-STRAP-MSTC40', supplierSku: 'STRAP-MSTC40', supplierDescription: 'Simpson MSTC40 Strap Tie', category: 'Hardware' },

  // Housewrap
  { internalCode: 'WRB-TYVEK-9X125', supplierSku: 'WRAP-TYVEK-9X125', supplierDescription: 'Tyvek Housewrap 9\' x 125\'', category: 'Housewrap' },
  { internalCode: 'WRB-TYVEK-10X150', supplierSku: 'WRAP-TYVEK-10X150', supplierDescription: 'Tyvek Housewrap 10\' x 150\'', category: 'Housewrap' },
  { internalCode: 'WRB-TAPE-3X164', supplierSku: 'WRAP-TAPE-3X164', supplierDescription: 'Tyvek Tape 3" x 164\'', category: 'Housewrap' },

  // Siding - HardiePlank
  { internalCode: 'SID-LAP-HZ-5.25-12', supplierSku: 'SID-HZ-LAP-5.25', supplierDescription: 'HardiePlank Lap 5-1/4" x 12\'', category: 'Siding' },
  { internalCode: 'SID-LAP-HZ-8.25-12', supplierSku: 'SID-HZ-LAP-8.25', supplierDescription: 'HardiePlank Lap 8-1/4" x 12\'', category: 'Siding' },
  { internalCode: 'SID-LAP-HZ-6.25-12', supplierSku: 'SID-HZ-LAP-6.25', supplierDescription: 'HardiePlank Lap 6-1/4" x 12\'', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X8', supplierSku: 'SID-HZ-PANEL-4X8', supplierDescription: 'HardiePanel 4x8', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X9', supplierSku: 'SID-HZ-PANEL-4X9', supplierDescription: 'HardiePanel 4x9', category: 'Siding' },
  { internalCode: 'SID-PNL-HZ-4X10', supplierSku: 'SID-HZ-PANEL-4X10', supplierDescription: 'HardiePanel 4x10', category: 'Siding' },

  // Siding - HardieTrim
  { internalCode: 'SID-TRM-HZ-4-12', supplierSku: 'TRIM-HZ-5/4X4', supplierDescription: 'HardieTrim 5/4" x 4" x 12\'', category: 'Exterior Trim' },
  { internalCode: 'SID-TRM-HZ-6-12', supplierSku: 'TRIM-HZ-5/4X6', supplierDescription: 'HardieTrim 5/4" x 6" x 12\'', category: 'Exterior Trim' },
  { internalCode: 'SID-TRM-HZ-8-12', supplierSku: 'TRIM-HZ-5/4X8', supplierDescription: 'HardieTrim 5/4" x 8" x 12\'', category: 'Exterior Trim' },
  { internalCode: 'SID-TRM-HZ-10-12', supplierSku: 'TRIM-HZ-5/4X10', supplierDescription: 'HardieTrim 5/4" x 10" x 12\'', category: 'Exterior Trim' },
  { internalCode: 'SID-TRM-HZ-12-12', supplierSku: 'TRIM-HZ-5/4X12', supplierDescription: 'HardieTrim 5/4" x 12" x 12\'', category: 'Exterior Trim' },

  // Fascia
  { internalCode: 'SID-FASC-FJ-2X8-20', supplierSku: 'TRIM-2X8-20-FJ-WWP', supplierDescription: '2x8 x 20\' FJ WWP Fascia', category: 'Exterior Trim' },
  { internalCode: 'SID-FASC-FJ-2X10-20', supplierSku: 'TRIM-2X10-20-FJ-WWP', supplierDescription: '2x10 x 20\' FJ WWP Fascia', category: 'Exterior Trim' },
  { internalCode: 'SID-FASC-FJ-2X12-20', supplierSku: 'TRIM-2X12-20-FJ-WWP', supplierDescription: '2x12 x 20\' FJ WWP Fascia', category: 'Exterior Trim' },
];

// ============================================================================
// MASTER MATERIALS LIST - BAT Unified Coding System v2.0
// Generated: 2025-12-13 | Total SKUs: 516
//
// Categories:
// - Accessories: 18 items
// - Adhesives: 4 items
// - Decking: 1 item
// - Hardware: 99 items
// - Lumber: 211 items
// - Other: 111 items
// - Panels: 13 items
// - Siding: 27 items
// - Trim: 10 items
// - Weather Barrier: 22 items
// ============================================================================

interface MasterMaterialDef {
  sku: string;
  description: string;
  uom: string;
  unitCost?: number;
  category: string;
}

// Master Materials by Category - Representative samples from the 516 SKU catalog
const MASTER_MATERIALS: MasterMaterialDef[] = [
  // ========== ACCESSORIES (18 items) ==========
  { sku: '1218RCF', description: '12"X18" FLUSH WOOD VENT CEDAR', uom: 'EA', unitCost: 44.22, category: 'Accessories' },
  { sku: '1824RGV', description: '18X24 RECTANGLE GABLE VENT', uom: 'EA', unitCost: 70.78, category: 'Accessories' },
  { sku: '24SBB', description: '2X4 22-7/16 SOLID BIRD BLOCK', uom: 'BOM', category: 'Accessories' },
  { sku: '26SBB', description: '2X6 22-7/16 SOLID BIRD BLOCK', uom: 'BOM', category: 'Accessories' },
  { sku: '512BIBBLK', description: '1X5-1/2"X5-1/2" BIB BLOCK', uom: 'EA', unitCost: 7.69, category: 'Accessories' },
  { sku: 'HU559408', description: '8X16 FNDTN VENT PLASTIC 559408', uom: 'EA', unitCost: 12.40, category: 'Accessories' },
  { sku: 'MA00451218030', description: '030 PAINTABLE 12X18 GABLEVENT', uom: 'EA', unitCost: 60.34, category: 'Accessories' },

  // ========== ADHESIVES (4 items) ==========
  { sku: 'DPWS', description: '10.3 OZ TUBE DUPONT SEALANT', uom: 'TUBE', unitCost: 4.96, category: 'Adhesives' },
  { sku: 'MD71550', description: 'CAULK BACKER ROD 3/8" X 350\'', uom: 'EA', unitCost: 46.99, category: 'Adhesives' },
  { sku: 'SFG', description: 'BFS SUB FLR GLUE 28OZ', uom: 'BF', unitCost: 4.08, category: 'Adhesives' },
  { sku: 'TX1WHT10', description: 'TX1 TEXT POLY SEALANT WHT 10OZ', uom: 'EA', unitCost: 5.66, category: 'Adhesives' },

  // ========== HARDWARE - Framing Angles (99 items total) ==========
  { sku: 'A34', description: 'SIMPSON A34 FRAMNG ANCHOR', uom: 'EA', unitCost: 0.49, category: 'Hardware' },
  { sku: 'A34Z', description: 'A34 FRAMING ANCHOR Z-MAX', uom: 'EA', unitCost: 0.79, category: 'Hardware' },
  { sku: 'A35', description: '1-7/16X4-1/2" FRAMING ANCHOR', uom: 'EA', unitCost: 0.53, category: 'Hardware' },
  { sku: 'A35Z', description: 'A35 FRAMING ANCHOR Z-MAX', uom: 'EA', unitCost: 0.59, category: 'Hardware' },

  // Post Bases
  { sku: 'ABU44Z', description: 'ABU44 4X4 ADJ. POST Z-MAX', uom: 'EA', unitCost: 19.46, category: 'Hardware' },
  { sku: 'ABU46Z', description: 'ABU46 4X6 ADJ. POST Z-MAX', uom: 'EA', unitCost: 34.73, category: 'Hardware' },
  { sku: 'ABU66Z', description: 'ABU66 6X6 ADJ. POST Z-MAX', uom: 'EA', unitCost: 41.35, category: 'Hardware' },
  { sku: 'ABU88Z', description: 'ABU88 8X8 ADJ. POST Z-MAX', uom: 'EA', unitCost: 80.17, category: 'Hardware' },

  // Coiled Straps
  { sku: 'CMST14', description: 'COILED STRAP 14GA', uom: 'EA', unitCost: 190.46, category: 'Hardware' },
  { sku: 'CS16', description: 'COILED STRAP 150\'', uom: 'EA', unitCost: 151.03, category: 'Hardware' },
  { sku: 'CS16-R', description: 'COILED STRAP 16GA 25\'', uom: 'EA', unitCost: 45.35, category: 'Hardware' },
  { sku: 'CS20', description: 'SIMPSON CS20 11/4 250COILSTRAP', uom: 'EA', unitCost: 153.72, category: 'Hardware' },
  { sku: 'CS20-R', description: 'COILED STRAP 20GA 25\' SIMPSON', uom: 'EA', unitCost: 34.50, category: 'Hardware' },

  // Hold-Downs
  { sku: 'HDU2-SDS2.5', description: '8-11/16" PREDEFLECTED HOLDOWN', uom: 'EA', category: 'Hardware' },
  { sku: 'HDU4-SDS2.5', description: 'HDU4-SDS2.5 HOLDDOWN', uom: 'EA', category: 'Hardware' },
  { sku: 'HDU5-SDS2.5', description: '13-3/16" PREDEFLECTED HOLDOWN', uom: 'EA', category: 'Hardware' },
  { sku: 'HDU8-SDS2.5', description: '16-5/8"HOLDOWN HANGER W/SCREWS', uom: 'EA', unitCost: 49.87, category: 'Hardware' },
  { sku: 'HDU11-SDS2.5', description: 'HDU11-SDS2.5 HOLDDOWN', uom: 'EA', category: 'Hardware' },
  { sku: 'HDU14-SDS2.5', description: '25-11/16" PREDEFLECTED HOLDOWN', uom: 'EA', category: 'Hardware' },

  // Joist Hangers
  { sku: 'HUS210', description: '2X10 JOIST FM HANGER EA', uom: 'EA', unitCost: 4.82, category: 'Hardware' },
  { sku: 'HUS26', description: 'SIMPSON HUS26 JOIST HANGER EA', uom: 'EA', unitCost: 2.51, category: 'Hardware' },
  { sku: 'HUS26-2', description: 'HUS26-2 Heavy DutyHanger', uom: 'EA', unitCost: 14.87, category: 'Hardware' },
  { sku: 'HUS26Z', description: 'HUS26Z JOIST HANGR Z-MAX', uom: 'EA', unitCost: 4.68, category: 'Hardware' },
  { sku: 'HUS48', description: 'HUS48 Heavy Duty DblShear Hanger', uom: 'EA', unitCost: 8.95, category: 'Hardware' },
  { sku: 'LUS210', description: 'LUS210 JOIST HANGER 2X10', uom: 'EA', unitCost: 1.56, category: 'Hardware' },
  { sku: 'LUS210-2', description: 'SIMPSON DBL JOIST HANGER 2X10', uom: 'EA', unitCost: 2.42, category: 'Hardware' },
  { sku: 'LUS26', description: 'LUS26 JOIST HANGER 2X6', uom: 'EA', unitCost: 1.04, category: 'Hardware' },

  // Concealed Hangers
  { sku: 'HUC210-2Z', description: '2X10 DBL FM CONCL HANGER ZMAX', uom: 'EA', unitCost: 22.32, category: 'Hardware' },
  { sku: 'HUC26-2', description: 'SIMP FACE-MNT HGR CONCELD', uom: 'EA', unitCost: 13.13, category: 'Hardware' },
  { sku: 'HUC48Z', description: 'HUC48Z 4X8 F/M HGR CFLG ZMAX', uom: 'EA', unitCost: 16.04, category: 'Hardware' },
  { sku: 'HUC612', description: 'SIMP FACE-MNT HGR CONCEALED', uom: 'EA', unitCost: 19.65, category: 'Hardware' },

  // ========== LUMBER (211 items total) ==========
  // Engineered Lumber - I-Joists
  { sku: '10TJI110', description: '9-1/2 TJI-110 LF', uom: 'LF', unitCost: 3.24, category: 'Lumber' },
  { sku: '12TJI110', description: '11-7/8 TJI-110 LF', uom: 'LF', unitCost: 3.42, category: 'Lumber' },
  { sku: '10TSH', description: '3-1/2X9-1/2 TJ LSL LF', uom: 'LF', unitCost: 12.28, category: 'Lumber' },
  { sku: '10114TJRIM20', description: '1-1/4X9-1/2 TJ LSL RIM 20\'', uom: 'EA', unitCost: 81.88, category: 'Lumber' },
  { sku: '12114TJRIM20', description: '1-1/4X11-7/8 TJ LSL RIM 20\'', uom: 'EA', unitCost: 100.24, category: 'Lumber' },
  { sku: '18TSRIM16', description: '1.25X18"-16\' TIMBERSTRAND RIM', uom: 'EA', unitCost: 176.64, category: 'Lumber' },

  // Dimensional Lumber - 2x4
  { sku: '249258DF', description: '2X4-92-5/8" STUD DF PET', uom: 'EA', unitCost: 2.30, category: 'Lumber' },
  { sku: '2410458DF', description: '2X4-104-5/8" STUD DF PET', uom: 'EA', unitCost: 2.90, category: 'Lumber' },
  { sku: '2411658DF', description: '2X4-116-5/8" STUD DF PET', uom: 'EA', unitCost: 3.22, category: 'Lumber' },
  { sku: '248DF', description: '2X4-8\' STD&BTR DF', uom: 'EA', unitCost: 3.39, category: 'Lumber' },
  { sku: '2410DF', description: '2X4-10\' STD&BTR DF', uom: 'EA', unitCost: 4.23, category: 'Lumber' },
  { sku: '2412DF', description: '2X4-12\' STD&BTR DF', uom: 'EA', unitCost: 5.08, category: 'Lumber' },
  { sku: '2414DF', description: '2X4-14\' STD&BTR DF', uom: 'EA', unitCost: 5.92, category: 'Lumber' },
  { sku: '2416DF', description: '2X4-16\' STD&BTR DF', uom: 'EA', unitCost: 6.77, category: 'Lumber' },
  { sku: '2418DF', description: '2X4-18\' STD&BTR DF', uom: 'EA', unitCost: 7.62, category: 'Lumber' },
  { sku: '2420DF', description: '2X4-20\' STD&BTR DF', uom: 'EA', unitCost: 8.46, category: 'Lumber' },
  { sku: '24DF', description: '2X4-RL STD&BTR DF', uom: 'EA', unitCost: 0.42, category: 'Lumber' },

  // Dimensional Lumber - 2x6
  { sku: '269258DF', description: '2X6-92-5/8" STUD DF PET', uom: 'EA', unitCost: 4.09, category: 'Lumber' },
  { sku: '2610458DF', description: '2X6-104-5/8" STUD DF PET', uom: 'EA', unitCost: 4.66, category: 'Lumber' },
  { sku: '2611658DF', description: '2X6-116-5/8" STUD DF PET', uom: 'EA', unitCost: 5.00, category: 'Lumber' },
  { sku: '268DF2', description: '2X6-8\' #2&BTR DF', uom: 'EA', unitCost: 4.45, category: 'Lumber' },
  { sku: '2610DF2', description: '2X6-10\' #2&BTR DF', uom: 'EA', unitCost: 5.56, category: 'Lumber' },
  { sku: '2612DF2', description: '2X6-12\' #2&BTR DF', uom: 'EA', unitCost: 6.67, category: 'Lumber' },
  { sku: '2614DF2', description: '2X6-14\' #2&BTR DF', uom: 'EA', unitCost: 7.79, category: 'Lumber' },
  { sku: '2616DF2', description: '2X6-16\' #2&BTR DF', uom: 'EA', unitCost: 8.90, category: 'Lumber' },
  { sku: '2618DF2', description: '2X6-18\' #2&BTR DF', uom: 'EA', unitCost: 10.01, category: 'Lumber' },
  { sku: '2620DF2', description: '2X6-20\' #2&BTR DF', uom: 'EA', unitCost: 11.12, category: 'Lumber' },
  { sku: '26DF2', description: '2X6-RL #2&BTR DF', uom: 'EA', unitCost: 0.56, category: 'Lumber' },

  // Dimensional Lumber - 2x8, 2x10, 2x12
  { sku: '2810DF2', description: '2X8-10\' #2&BTR DF', uom: 'EA', unitCost: 8.64, category: 'Lumber' },
  { sku: '2812DF2', description: '2X8-12\' #2&BTR DF', uom: 'EA', unitCost: 10.36, category: 'Lumber' },
  { sku: '2816DF2', description: '2X8-16\' #2&BTR DF', uom: 'EA', unitCost: 13.82, category: 'Lumber' },
  { sku: '21010DF2', description: '2X10-10\' #2&BTR DF', uom: 'EA', unitCost: 10.80, category: 'Lumber' },
  { sku: '21012DF2', description: '2X10-12\' #2&BTR DF', uom: 'EA', unitCost: 12.95, category: 'Lumber' },
  { sku: '21016DF2', description: '2X10-16\' #2&BTR DF', uom: 'EA', unitCost: 17.27, category: 'Lumber' },
  { sku: '210DF2', description: '2X10-RL #2&BTR DF', uom: 'EA', unitCost: 1.08, category: 'Lumber' },
  { sku: '21210DF2', description: '2X12-10\' #2&BTR DF', uom: 'EA', unitCost: 12.73, category: 'Lumber' },
  { sku: '21212DF2', description: '2X12-12\' #2&BTR DF', uom: 'EA', unitCost: 15.27, category: 'Lumber' },
  { sku: '21220DF2', description: '2X12-20\' #2&BTR DF', uom: 'EA', unitCost: 25.45, category: 'Lumber' },
  { sku: '212DF2', description: '2X12-RL #2&BTR DF', uom: 'EA', unitCost: 1.06, category: 'Lumber' },

  // Pressure Treated
  { sku: '248HF2TICGC', description: '2X4-8\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 5.83, category: 'Lumber' },
  { sku: '2412HF2TICGC', description: '2X4-12\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 8.75, category: 'Lumber' },
  { sku: '2420HF2TICGC', description: '2X4-20\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 14.59, category: 'Lumber' },
  { sku: '2616HF2TICGC', description: '2X6-16\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 16.26, category: 'Lumber' },
  { sku: '2810HF2TICGC', description: '2X8-10\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 14.04, category: 'Lumber' },
  { sku: '21212HF2TICGC', description: '2X12-12\' #2 HF TRTD GC ICT', uom: 'EA', unitCost: 25.33, category: 'Lumber' },

  // ========== PANELS (13 items) ==========
  { sku: '716OSB', description: '7/16"4X8 OSB RTD', uom: 'EA', unitCost: 9.85, category: 'Panels' },
  { sku: '716OSB9', description: '7/16"4X9 OSB RTD', uom: 'EA', unitCost: 11.50, category: 'Panels' },
  { sku: '716OSB10', description: '7/16"4X10 OSB RTD', uom: 'EA', unitCost: 13.23, category: 'Panels' },
  { sku: '34TGOSBWGOFF', description: '23/32"4X8 T&G OSB EDGGLD SIF', uom: 'EA', unitCost: 19.42, category: 'Panels' },
  { sku: '78TGOSBWGOFF', description: '7/8"4X8 T&G OSB EDGGLD SIF FF', uom: 'EA', unitCost: 24.18, category: 'Panels' },
  { sku: '118TGOSBWGOFF', description: '1-1/8"4X8 T&G OSB EDGGLD SIF', uom: 'EA', unitCost: 31.82, category: 'Panels' },
  { sku: '12CDXF4', description: '15/32"4X8 CDX FIR 4PLY RTD', uom: 'EA', unitCost: 20.03, category: 'Panels' },

  // ========== SIDING (27 items) ==========
  { sku: 'HZ10514CMSP', description: '5/16X5.25X12 HZ10 CEDRML SELCT', uom: 'EA', unitCost: 7.08, category: 'Siding' },
  { sku: 'HZ10614CMSP', description: '5/16X6.25X12 HZ10 CEDRML SELCT', uom: 'EA', unitCost: 8.43, category: 'Siding' },
  { sku: 'HZ10814CMSP', description: '5/16X8.25X12 HZ10 CEDRML SELCT', uom: 'EA', unitCost: 11.13, category: 'Siding' },
  { sku: 'HZ10914CMSP', description: '5/16X9.25X12 HZ10 CEDRML SELCT', uom: 'EA', unitCost: 12.48, category: 'Siding' },
  { sku: 'HZ1012CMSP', description: '5/16X12X12\' HZ10 CEDRML SELCT', uom: 'EA', unitCost: 16.19, category: 'Siding' },
  { sku: 'HZ1048CMP', description: '5/16X4\'X8\' HZ10 CEDARML VRTCL', uom: 'EA', unitCost: 43.60, category: 'Siding' },
  { sku: 'HZ1049CMP', description: '5/16X4\'X9\' HZ10 CEDARML VRTCL', uom: 'EA', unitCost: 49.04, category: 'Siding' },
  { sku: 'HZ10410CMP', description: '5/16X4\'X10\' HZ10 CEDARML VRTCL', uom: 'EA', unitCost: 54.49, category: 'Siding' },
  { sku: 'HZ10410SMP', description: '5/16X4\'X10\' HZ10 SMOOTH VRTCL', uom: 'EA', unitCost: 58.87, category: 'Siding' },

  // HardieTrim
  { sku: 'HZU54412RT', description: '5/4X3.5X12 HZU RUSTIC GRAIN', uom: 'EA', unitCost: 17.96, category: 'Siding' },
  { sku: 'HZU54612RT', description: '5/4X5.5X12 HZU RUSTIC GRAIN', uom: 'EA', unitCost: 28.22, category: 'Siding' },
  { sku: 'HZU54812RT', description: '5/4X7.25X12 HZU RUSTIC GRAIN', uom: 'EA', unitCost: 37.20, category: 'Siding' },
  { sku: 'HZU541012RT', description: '5/4X9.25X12 HZU RUSTIC GRAIN', uom: 'EA', unitCost: 47.46, category: 'Siding' },
  { sku: 'HZU541212RT', description: '5/4X11.25X12 HZU RUSTIC GRAIN', uom: 'EA', unitCost: 57.72, category: 'Siding' },

  // ========== TRIM (10 items) ==========
  { sku: '1320WWP', description: '1X3-20\' WW PRIMED', uom: 'EA', unitCost: 12.30, category: 'Trim' },
  { sku: '1620WWP', description: '1X6-20\' WW PRIMED', uom: 'EA', unitCost: 24.66, category: 'Trim' },
  { sku: '2220WWP', description: '2"X2"-20\' WW PRIMED', uom: 'EA', unitCost: 11.23, category: 'Trim' },
  { sku: '2820WWP', description: '2"X8"-20\' WW PRIMED', uom: 'EA', unitCost: 39.66, category: 'Trim' },
  { sku: 'SHM51610', description: '5/16"X10 PRM ALUM H-MOLD SDG', uom: 'EA', unitCost: 12.73, category: 'Trim' },

  // ========== WEATHER BARRIER (22 items) ==========
  { sku: '9125DWRA', description: '9\'X125\' TYVEK DRAINWRAP', uom: 'EA', unitCost: 162.28, category: 'Weather Barrier' },
  { sku: '4150TF', description: '4"X150\' TYVEK FLASHING', uom: 'EA', unitCost: 127.99, category: 'Weather Barrier' },
  { sku: '475DFTRA', description: '4"X75\' DUPONT FLASHING TAPE', uom: 'EA', unitCost: 26.78, category: 'Weather Barrier' },
  { sku: '675TFWNFRA', description: '6"X75\' TYVEK FLEXWRAP NF TAPE', uom: 'EA', unitCost: 92.70, category: 'Weather Barrier' },
  { sku: '975TFWNFRA', description: '9"X75\' TYVEK FLEXWRAP NF TAPE', uom: 'EA', unitCost: 135.96, category: 'Weather Barrier' },
  { sku: '975FF', description: '9 X 75 FORTIFLASH 25 MIL', uom: 'EA', unitCost: 42.99, category: 'Weather Barrier' },
  { sku: 'TTAPE2-165', description: '1.88"X165\' TYVEK TAPE', uom: 'EA', unitCost: 10.50, category: 'Weather Barrier' },
  { sku: 'TTAPE3-164RA', description: '3"X164\' WHITE TYVEK TAPE', uom: 'EA', unitCost: 15.17, category: 'Weather Barrier' },
  { sku: 'QFP100', description: 'QUICKFLASH PLUMB FLASHNG P-100', uom: 'EA', unitCost: 6.00, category: 'Weather Barrier' },
  { sku: 'QFPE30BA78', description: 'E-SGA QUICKFLASH PANEL', uom: 'EA', unitCost: 6.22, category: 'Weather Barrier' },
  { sku: 'XZH516', description: 'TAMLYN 5/16"X 10 Z-FLASHING', uom: 'EA', unitCost: 16.06, category: 'Weather Barrier' },

  // ========== DECKING (1 item) ==========
  { sku: 'FGL1620SCA', description: '1X6-20\' SQ FIBERON GL CABIN', uom: 'EA', unitCost: 47.20, category: 'Decking' },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedMaterialCatalog() {
  console.log('📦 Seeding Material Catalog...');

  // 1. Seed Suppliers
  console.log('  🏢 Seeding Suppliers...');
  for (const supplier of SUPPLIERS) {
    await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {
        name: supplier.name,
        type: supplier.type,
        catalogVersion: supplier.catalogVersion,
        packSystem: supplier.packSystem,
        notes: supplier.notes,
      },
      create: supplier,
    });
  }
  console.log(`    ✓ ${SUPPLIERS.length} suppliers seeded`);

  // 2. Seed Internal Materials
  console.log('  📋 Seeding Internal Materials...');
  const materialMap = new Map<string, string>();

  for (const material of ALL_INTERNAL_MATERIALS) {
    const created = await prisma.internalMaterial.upsert({
      where: { internalCode: material.internalCode },
      update: {
        description: material.description,
        category: material.category,
        subcategory: material.subcategory,
        itemTypeCode: material.itemTypeCode,
        species: material.species,
        grade: material.grade,
        nominalSize: material.nominalSize,
        length: material.length,
        unitOfMeasure: material.unitOfMeasure,
        notes: material.notes,
      },
      create: material,
    });
    materialMap.set(material.internalCode, created.id);
  }
  console.log(`    ✓ ${ALL_INTERNAL_MATERIALS.length} internal materials seeded`);

  // 3. Seed HOLT Supplier SKU Cross-References
  console.log('  🔗 Seeding HOLT SKU Cross-References...');
  let holtXrefCount = 0;

  for (const xref of HOLT_SKUS) {
    const internalMaterialId = materialMap.get(xref.internalCode);
    if (!internalMaterialId) {
      console.warn(`    ⚠️ Internal material not found: ${xref.internalCode}`);
      continue;
    }

    await prisma.supplierSkuXref.upsert({
      where: {
        internalMaterialId_supplierId_supplierSku: {
          internalMaterialId,
          supplierId: 'HOLT',
          supplierSku: xref.supplierSku,
        },
      },
      update: {
        supplierName: 'Holt Homes Supply',
        supplierDescription: xref.supplierDescription,
        supplierPackId: xref.supplierPackId,
        supplierCategory: xref.supplierCategory,
        isPrimary: true,
      },
      create: {
        internalMaterialId,
        supplierId: 'HOLT',
        supplierName: 'Holt Homes Supply',
        supplierSku: xref.supplierSku,
        supplierDescription: xref.supplierDescription,
        supplierPackId: xref.supplierPackId,
        supplierCategory: xref.supplierCategory,
        isPrimary: true,
      },
    });
    holtXrefCount++;
  }
  console.log(`    ✓ ${holtXrefCount} HOLT SKU cross-references seeded`);

  // 4. Seed BFS (Builder's FirstSource) STO SKU Cross-References
  console.log('  🔗 Seeding BFS/STO SKU Cross-References...');
  let bfsXrefCount = 0;

  for (const xref of BFS_SKUS) {
    const internalMaterialId = materialMap.get(xref.internalCode);
    if (!internalMaterialId) {
      console.warn(`    ⚠️ Internal material not found: ${xref.internalCode}`);
      continue;
    }

    await prisma.supplierSkuXref.upsert({
      where: {
        internalMaterialId_supplierId_supplierSku: {
          internalMaterialId,
          supplierId: 'BFS',
          supplierSku: xref.supplierSku,
        },
      },
      update: {
        supplierName: "Builder's FirstSource",
        supplierDescription: xref.supplierDescription,
        supplierPackId: xref.category,  // Use STO category as pack identifier
        isPrimary: false,  // HOLT is primary, BFS is secondary
      },
      create: {
        internalMaterialId,
        supplierId: 'BFS',
        supplierName: "Builder's FirstSource",
        supplierSku: xref.supplierSku,
        supplierDescription: xref.supplierDescription,
        supplierPackId: xref.category,
        isPrimary: false,
      },
    });
    bfsXrefCount++;
  }
  console.log(`    ✓ ${bfsXrefCount} BFS/STO SKU cross-references seeded`);

  // 5. Seed Richmond American Homes (RAH) SKU Cross-References
  console.log('  🔗 Seeding RAH SKU Cross-References...');
  let rahXrefCount = 0;

  for (const xref of RICHMOND_SKUS) {
    const internalMaterialId = materialMap.get(xref.internalCode);
    if (!internalMaterialId) {
      console.warn(`    ⚠️ Internal material not found: ${xref.internalCode}`);
      continue;
    }

    await prisma.supplierSkuXref.upsert({
      where: {
        internalMaterialId_supplierId_supplierSku: {
          internalMaterialId,
          supplierId: 'RAH',
          supplierSku: xref.rahItemNumber,
        },
      },
      update: {
        supplierName: 'Richmond American Homes',
        supplierDescription: xref.rahDescription,
        supplierPackId: xref.unifiedPhase,  // Use unified phase as pack identifier
        supplierCategory: xref.category,
        notes: xref.rahOption ? `Option: ${xref.rahOption}` : undefined,
        isPrimary: false,  // HOLT is primary
      },
      create: {
        internalMaterialId,
        supplierId: 'RAH',
        supplierName: 'Richmond American Homes',
        supplierSku: xref.rahItemNumber,
        supplierDescription: xref.rahDescription,
        supplierPackId: xref.unifiedPhase,
        supplierCategory: xref.category,
        notes: xref.rahOption ? `Option: ${xref.rahOption}` : undefined,
        isPrimary: false,
      },
    });
    rahXrefCount++;
  }
  console.log(`    ✓ ${rahXrefCount} RAH SKU cross-references seeded`);

  const totalXrefs = holtXrefCount + bfsXrefCount + rahXrefCount;
  console.log('✅ Material Catalog seeding complete!');
  console.log(`   - ${SUPPLIERS.length} suppliers`);
  console.log(`   - ${ALL_INTERNAL_MATERIALS.length} internal materials`);
  console.log(`   - ${totalXrefs} supplier SKU cross-references (${holtXrefCount} HOLT + ${bfsXrefCount} BFS + ${rahXrefCount} RAH)`);
}

// ============================================================================
// MAIN
// ============================================================================

if (require.main === module) {
  seedMaterialCatalog()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
