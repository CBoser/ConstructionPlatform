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
  let xrefCount = 0;

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
    xrefCount++;
  }
  console.log(`    ✓ ${xrefCount} HOLT SKU cross-references seeded`);

  console.log('✅ Material Catalog seeding complete!');
  console.log(`   - ${SUPPLIERS.length} suppliers`);
  console.log(`   - ${ALL_INTERNAL_MATERIALS.length} internal materials`);
  console.log(`   - ${xrefCount} supplier SKU cross-references`);
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
