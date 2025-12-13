/**
 * Layer 2 Materials Seed Data
 *
 * Seeds the Layer2Material table with individual SKU-level items
 * from the HOLT BAT Pack Materials Reference Guide.
 *
 * These are the actual material items that make up each BAT pack:
 * - Framing lumber (2x4, 2x6, 2x8, 2x10, 2x12)
 * - Sheathing (OSB, plywood)
 * - Fasteners (nails, screws, bolts)
 * - Hardware (hangers, straps, clips)
 * - Engineered products (I-joists, LVL, trusses)
 * - Siding and exterior materials
 *
 * Source: HOLT BAT Pack Materials Reference Guide v2.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// LAYER 2 MATERIAL DEFINITIONS
// Format: { sku, description, batPackId, dartCategory, species, grade, dimensions, unitOfMeasure, subcategory }
// ============================================================================

interface Layer2MaterialDef {
  sku: string;
  description: string;
  batPackId: string;
  dartCategory?: number;
  species?: string;
  grade?: string;
  dimensions?: string;
  unitOfMeasure: string;
  subcategory: string;
  isStandard?: boolean;
  notes?: string;
}

// ============================================================================
// PACK |10 - FOUNDATION MATERIALS
// ============================================================================
const FOUNDATION_MATERIALS: Layer2MaterialDef[] = [
  // Dimensional Lumber - Foundation
  { sku: '2616HF3TICAG', description: '2x6x16 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x6x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2614HF3TICAG', description: '2x6x14 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x6x14', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2612HF3TICAG', description: '2x6x12 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x6x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2610HF3TICAG', description: '2x6x10 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x6x10', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '268HF3TICAG', description: '2x6x8 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x6x8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2416HF3TICAG', description: '2x4x16 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x4x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2414HF3TICAG', description: '2x4x14 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x4x14', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2412HF3TICAG', description: '2x4x12 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x4x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2410HF3TICAG', description: '2x4x10 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x4x10', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '248HF3TICAG', description: '2x4x8 KD HF #3 TIC Corner AG', batPackId: '|10', dartCategory: 1, species: 'HF', grade: '#3', dimensions: '2x4x8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Pressure Treated - Foundation
  { sku: '2616PTAG', description: '2x6x16 PT AG', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '2x6x16', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '2614PTAG', description: '2x6x14 PT AG', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '2x6x14', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '2612PTAG', description: '2x6x12 PT AG', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '2x6x12', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '4416PTAG', description: '4x4x16 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '4x4x16', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '4412PTAG', description: '4x4x12 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '4x4x12', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '4410PTAG', description: '4x4x10 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '4x4x10', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '448PTAG', description: '4x4x8 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '4x4x8', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '6616PTAG', description: '6x6x16 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '6x6x16', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },
  { sku: '6612PTAG', description: '6x6x12 PT AG Post', batPackId: '|10', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '6x6x12', unitOfMeasure: 'EA', subcategory: 'Pressure Treated' },

  // Hardware - Foundation
  { sku: 'SS550', description: 'Simpson Strong-Tie SS550 Strap', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'A35', description: 'Simpson A35 Framing Angle', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'ABE44', description: 'Simpson ABE44 Post Base', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'CB44', description: 'Simpson CB44 Column Base', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'CB66', description: 'Simpson CB66 Column Base', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'PAHD22', description: 'Simpson PAHD22 Hold-Down', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'HD5A', description: 'Simpson HD5A Hold-Down', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'HD7A', description: 'Simpson HD7A Hold-Down', batPackId: '|10', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },

  // Fasteners - Foundation
  { sku: 'BP5/8-3HDG', description: 'Bolt Pack 5/8 x 3 HDG', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'EA', subcategory: 'Fasteners' },
  { sku: 'BP1/2-4HDG', description: 'Bolt Pack 1/2 x 4 HDG', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'EA', subcategory: 'Fasteners' },
  { sku: 'TITEN38-3', description: 'Titen HD 3/8 x 3 Anchor', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'EA', subcategory: 'Fasteners' },
  { sku: 'TITEN38-4', description: 'Titen HD 3/8 x 4 Anchor', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'EA', subcategory: 'Fasteners' },
  { sku: 'SD9112', description: 'Simpson SD9112 Screw', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'BX', subcategory: 'Fasteners' },
  { sku: 'SD9212', description: 'Simpson SD9212 Screw', batPackId: '|10', dartCategory: 9, unitOfMeasure: 'BX', subcategory: 'Fasteners' },
];

// ============================================================================
// PACK |11 - MAIN JOIST SYSTEM MATERIALS
// ============================================================================
const JOIST_SYSTEM_MATERIALS: Layer2MaterialDef[] = [
  // I-Joists
  { sku: 'IJ9-1/2x16', description: 'I-Joist 9-1/2" x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '9.5x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ9-1/2x18', description: 'I-Joist 9-1/2" x 18\'', batPackId: '|11', dartCategory: 2, dimensions: '9.5x18', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ9-1/2x20', description: 'I-Joist 9-1/2" x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '9.5x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ11-7/8x16', description: 'I-Joist 11-7/8" x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '11.875x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ11-7/8x18', description: 'I-Joist 11-7/8" x 18\'', batPackId: '|11', dartCategory: 2, dimensions: '11.875x18', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ11-7/8x20', description: 'I-Joist 11-7/8" x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '11.875x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ11-7/8x24', description: 'I-Joist 11-7/8" x 24\'', batPackId: '|11', dartCategory: 2, dimensions: '11.875x24', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ14x16', description: 'I-Joist 14" x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '14x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ14x20', description: 'I-Joist 14" x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '14x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'IJ16x20', description: 'I-Joist 16" x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '16x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },

  // LVL Beams
  { sku: 'LVL1-3/4x9-1/2x16', description: 'LVL 1-3/4 x 9-1/2 x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x9.5x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x9-1/2x20', description: 'LVL 1-3/4 x 9-1/2 x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x9.5x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x11-7/8x16', description: 'LVL 1-3/4 x 11-7/8 x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x11.875x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x11-7/8x20', description: 'LVL 1-3/4 x 11-7/8 x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x11.875x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x11-7/8x24', description: 'LVL 1-3/4 x 11-7/8 x 24\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x11.875x24', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x14x20', description: 'LVL 1-3/4 x 14 x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x14x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x16x20', description: 'LVL 1-3/4 x 16 x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x16x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL1-3/4x18x20', description: 'LVL 1-3/4 x 18 x 20\'', batPackId: '|11', dartCategory: 2, dimensions: '1.75x18x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },

  // Rim Board
  { sku: 'RIM1-1/8x9-1/2x16', description: 'Rim Board 1-1/8 x 9-1/2 x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '1.125x9.5x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'RIM1-1/8x11-7/8x16', description: 'Rim Board 1-1/8 x 11-7/8 x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '1.125x11.875x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'RIM1-1/4x14x16', description: 'Rim Board 1-1/4 x 14 x 16\'', batPackId: '|11', dartCategory: 2, dimensions: '1.25x14x16', unitOfMeasure: 'EA', subcategory: 'Engineered' },

  // Joist Hangers
  { sku: 'LUS26', description: 'Simpson LUS26 Joist Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'LUS28', description: 'Simpson LUS28 Joist Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'LUS210', description: 'Simpson LUS210 Joist Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'LUS212', description: 'Simpson LUS212 Joist Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'HUS26', description: 'Simpson HUS26 Face Mount Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'HUS28', description: 'Simpson HUS28 Face Mount Hanger', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'IUS2.56/9.5', description: 'Simpson I-Joist Hanger 9-1/2', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'IUS2.56/11.88', description: 'Simpson I-Joist Hanger 11-7/8', batPackId: '|11', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },

  // Blocking/Bridging
  { sku: 'BLKG2x10x16', description: 'Blocking 2x10x16', batPackId: '|11', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x10x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: 'BLKG2x12x16', description: 'Blocking 2x12x16', batPackId: '|11', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x12x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
];

// ============================================================================
// PACK |18 - MAIN SUBFLOOR MATERIALS
// ============================================================================
const SUBFLOOR_MATERIALS: Layer2MaterialDef[] = [
  // Subfloor Sheathing
  { sku: 'OSB23/32-4x8', description: 'OSB 23/32 4x8 T&G Subfloor', batPackId: '|18', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'ADVTECH23/32', description: 'AdvanTech 23/32 4x8 Subfloor', batPackId: '|18', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'PLY3/4CDX4x8', description: 'Plywood 3/4 CDX 4x8 Subfloor', batPackId: '|18', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },

  // Subfloor Adhesive
  { sku: 'SUBADHV29', description: 'Subfloor Adhesive 29oz Tube', batPackId: '|18', dartCategory: 12, unitOfMeasure: 'EA', subcategory: 'Adhesives' },
  { sku: 'SUBADHVBULK', description: 'Subfloor Adhesive 5-Gal Pail', batPackId: '|18', dartCategory: 12, unitOfMeasure: 'EA', subcategory: 'Adhesives' },

  // Fasteners
  { sku: 'FLOORNL8d', description: '8d Ring Shank Floor Nail', batPackId: '|18', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'FLOORSCR2', description: '2" Subfloor Screw', batPackId: '|18', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'FLOORSCR2-1/2', description: '2-1/2" Subfloor Screw', batPackId: '|18', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
];

// ============================================================================
// PACK |20 - MAIN FLOOR WALLS MATERIALS
// ============================================================================
const MAIN_WALLS_MATERIALS: Layer2MaterialDef[] = [
  // Wall Framing - Studs
  { sku: '2492SPF2', description: '2x4x92-5/8 SPF Stud Precut', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x4x92-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2492HF2', description: '2x4x92-5/8 HF Stud Precut', batPackId: '|20', dartCategory: 1, species: 'HF', grade: 'STUD', dimensions: '2x4x92-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2692SPF2', description: '2x6x92-5/8 SPF Stud Precut', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x6x92-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2692HF2', description: '2x6x92-5/8 HF Stud Precut', batPackId: '|20', dartCategory: 1, species: 'HF', grade: 'STUD', dimensions: '2x6x92-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '24104SPF2', description: '2x4x104-5/8 SPF Stud Precut 9\'', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x4x104-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '26104SPF2', description: '2x6x104-5/8 SPF Stud Precut 9\'', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x6x104-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '24116SPF2', description: '2x4x116-5/8 SPF Stud Precut 10\'', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x4x116-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Plates
  { sku: '2416SPF2', description: '2x4x16 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x4x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2414SPF2', description: '2x4x14 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x4x14', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2412SPF2', description: '2x4x12 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x4x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2410SPF2', description: '2x4x10 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x4x10', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2616SPF2', description: '2x6x16 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x6x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2614SPF2', description: '2x6x14 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x6x14', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2612SPF2', description: '2x6x12 SPF #2 Plate', batPackId: '|20', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x6x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Headers
  { sku: '2x12x16DF2', description: '2x12x16 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x12x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x12x14DF2', description: '2x12x14 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x12x14', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x12x12DF2', description: '2x12x12 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x12x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x12x10DF2', description: '2x12x10 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x12x10', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x10x16DF2', description: '2x10x16 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x10x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x10x12DF2', description: '2x10x12 DF #2 Header', batPackId: '|20', dartCategory: 1, species: 'DF', grade: '#2', dimensions: '2x10x12', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Wall Sheathing
  { sku: 'OSB7/16-4x8', description: 'OSB 7/16 4x8 Wall Sheathing', batPackId: '|20', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'OSB7/16-4x9', description: 'OSB 7/16 4x9 Wall Sheathing', batPackId: '|20', dartCategory: 3, dimensions: '4x9', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'OSB7/16-4x10', description: 'OSB 7/16 4x10 Wall Sheathing', batPackId: '|20', dartCategory: 3, dimensions: '4x10', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'PLY1/2CDX4x8', description: 'Plywood 1/2 CDX 4x8', batPackId: '|20', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },

  // Fasteners - Wall Framing
  { sku: 'FN16d-SING', description: '16d Sinker Nail', batPackId: '|20', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'FN16d-HDG', description: '16d HDG Nail', batPackId: '|20', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'FN10d-SING', description: '10d Sinker Nail', batPackId: '|20', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'FN8d-SING', description: '8d Sinker Nail', batPackId: '|20', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },

  // Hardware - Wall
  { sku: 'HTT4', description: 'Simpson HTT4 Heavy Tension Tie', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'HTT5', description: 'Simpson HTT5 Heavy Tension Tie', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'MSTA24', description: 'Simpson MSTA24 Strap', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'MSTA36', description: 'Simpson MSTA36 Strap', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'LSTA24', description: 'Simpson LSTA24 Lateral Strap', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'LSTA36', description: 'Simpson LSTA36 Lateral Strap', batPackId: '|20', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
];

// ============================================================================
// PACK |22 - 3-CAR GARAGE WALLS MATERIALS
// ============================================================================
const GARAGE_WALLS_MATERIALS: Layer2MaterialDef[] = [
  // Garage Wall Studs (typically 2x4 or 2x6)
  { sku: '2492SPF2-GAR', description: '2x4x92-5/8 SPF Stud Garage', batPackId: '|22', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x4x92-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '24116SPF2-GAR', description: '2x4x116-5/8 SPF Stud 10\' Garage', batPackId: '|22', dartCategory: 1, species: 'SPF', grade: 'STUD', dimensions: '2x4x116-5/8', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Garage Door Headers (large spans)
  { sku: 'GARHDR2x12x20', description: '2x12x20 DF Garage Header', batPackId: '|22', dartCategory: 1, species: 'DF', grade: '#1', dimensions: '2x12x20', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: 'GARHDR2x12x18', description: '2x12x18 DF Garage Header', batPackId: '|22', dartCategory: 1, species: 'DF', grade: '#1', dimensions: '2x12x18', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: 'GARHDR2x12x16', description: '2x12x16 DF Garage Header', batPackId: '|22', dartCategory: 1, species: 'DF', grade: '#1', dimensions: '2x12x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // LVL for Garage Headers
  { sku: 'LVL3-1/2x11-7/8x20-GAR', description: 'LVL 3-1/2 x 11-7/8 x 20 Garage', batPackId: '|22', dartCategory: 2, dimensions: '3.5x11.875x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL5-1/4x11-7/8x20-GAR', description: 'LVL 5-1/4 x 11-7/8 x 20 Garage', batPackId: '|22', dartCategory: 2, dimensions: '5.25x11.875x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },
  { sku: 'LVL7x11-7/8x20-GAR', description: 'LVL 7 x 11-7/8 x 20 Garage', batPackId: '|22', dartCategory: 2, dimensions: '7x11.875x20', unitOfMeasure: 'EA', subcategory: 'Engineered' },

  // Garage Wall Sheathing
  { sku: 'OSB7/16-4x9-GAR', description: 'OSB 7/16 4x9 Garage Wall', batPackId: '|22', dartCategory: 3, dimensions: '4x9', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'OSB7/16-4x10-GAR', description: 'OSB 7/16 4x10 Garage Wall', batPackId: '|22', dartCategory: 3, dimensions: '4x10', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
];

// ============================================================================
// PACK |40 - ROOF MATERIALS
// ============================================================================
const ROOF_MATERIALS: Layer2MaterialDef[] = [
  // Roof Trusses (placeholders - actual specs from truss company)
  { sku: 'TRUSS-STD', description: 'Standard Roof Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },
  { sku: 'TRUSS-HIP', description: 'Hip Roof Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },
  { sku: 'TRUSS-GIRDER', description: 'Girder Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },
  { sku: 'TRUSS-VALLEY', description: 'Valley Set Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },
  { sku: 'TRUSS-MONO', description: 'Mono Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },
  { sku: 'TRUSS-SCISSORS', description: 'Scissors Truss', batPackId: '|40', dartCategory: 2, unitOfMeasure: 'EA', subcategory: 'Trusses' },

  // Roof Sheathing
  { sku: 'OSB7/16-4x8-ROOF', description: 'OSB 7/16 4x8 Roof Sheathing', batPackId: '|40', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'OSB1/2-4x8-ROOF', description: 'OSB 1/2 4x8 Roof Sheathing', batPackId: '|40', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },
  { sku: 'PLY1/2CDX4x8-ROOF', description: 'Plywood 1/2 CDX 4x8 Roof', batPackId: '|40', dartCategory: 3, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Sheathing' },

  // Fascia & Trim Lumber
  { sku: '1x8x16KDWRC', description: '1x8x16 KD WRC Fascia', batPackId: '|40', dartCategory: 1, species: 'WRC', grade: 'C&BTR', dimensions: '1x8x16', unitOfMeasure: 'EA', subcategory: 'Trim Lumber' },
  { sku: '1x6x16KDWRC', description: '1x6x16 KD WRC Fascia', batPackId: '|40', dartCategory: 1, species: 'WRC', grade: 'C&BTR', dimensions: '1x6x16', unitOfMeasure: 'EA', subcategory: 'Trim Lumber' },
  { sku: '2x8x16SPF2', description: '2x8x16 SPF #2 Subfascia', batPackId: '|40', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x8x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },
  { sku: '2x6x16SPF2', description: '2x6x16 SPF #2 Subfascia', batPackId: '|40', dartCategory: 1, species: 'SPF', grade: '#2', dimensions: '2x6x16', unitOfMeasure: 'EA', subcategory: 'Framing Lumber' },

  // Hurricane Ties
  { sku: 'H2.5A', description: 'Simpson H2.5A Hurricane Tie', batPackId: '|40', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'H1', description: 'Simpson H1 Hurricane Tie', batPackId: '|40', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'H3', description: 'Simpson H3 Hurricane Tie', batPackId: '|40', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },

  // Roofing Fasteners
  { sku: 'ROOFNL8d-HDG', description: '8d HDG Roof Sheathing Nail', batPackId: '|40', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'ROOFNL8d-RS', description: '8d Ring Shank Roof Nail', batPackId: '|40', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
];

// ============================================================================
// PACK |58 - HOUSEWRAP MATERIALS
// ============================================================================
const HOUSEWRAP_MATERIALS: Layer2MaterialDef[] = [
  // Housewrap
  { sku: 'TYVEK9x100', description: 'Tyvek HomeWrap 9\' x 100\'', batPackId: '|58', dartCategory: 11, dimensions: '9x100', unitOfMeasure: 'RL', subcategory: 'Building Wrap' },
  { sku: 'TYVEK9x150', description: 'Tyvek HomeWrap 9\' x 150\'', batPackId: '|58', dartCategory: 11, dimensions: '9x150', unitOfMeasure: 'RL', subcategory: 'Building Wrap' },
  { sku: 'TYVEK10x100', description: 'Tyvek HomeWrap 10\' x 100\'', batPackId: '|58', dartCategory: 11, dimensions: '10x100', unitOfMeasure: 'RL', subcategory: 'Building Wrap' },

  // Flashing Tape
  { sku: 'FLASHTAPE4x75', description: 'Flashing Tape 4" x 75\'', batPackId: '|58', dartCategory: 11, dimensions: '4x75', unitOfMeasure: 'RL', subcategory: 'Flashing' },
  { sku: 'FLASHTAPE6x75', description: 'Flashing Tape 6" x 75\'', batPackId: '|58', dartCategory: 11, dimensions: '6x75', unitOfMeasure: 'RL', subcategory: 'Flashing' },
  { sku: 'FLASHTAPE9x75', description: 'Flashing Tape 9" x 75\'', batPackId: '|58', dartCategory: 11, dimensions: '9x75', unitOfMeasure: 'RL', subcategory: 'Flashing' },

  // Cap Staples/Nails
  { sku: 'CAPSTAPLE1', description: '1" Cap Staple for Housewrap', batPackId: '|58', dartCategory: 9, unitOfMeasure: 'BX', subcategory: 'Fasteners' },
  { sku: 'CAPNAIL1-1/4', description: '1-1/4" Cap Nail for Housewrap', batPackId: '|58', dartCategory: 9, unitOfMeasure: 'BX', subcategory: 'Fasteners' },
];

// ============================================================================
// PACK |60 - EXTERIOR TRIM AND SIDING MATERIALS
// ============================================================================
const SIDING_MATERIALS: Layer2MaterialDef[] = [
  // LP SmartSide Siding
  { sku: 'LP38-8x16', description: 'LP SmartSide 38 8" x 16\' Lap Siding', batPackId: '|60', dartCategory: 4, dimensions: '8x16', unitOfMeasure: 'EA', subcategory: 'Siding' },
  { sku: 'LP38-8x12', description: 'LP SmartSide 38 8" x 12\' Lap Siding', batPackId: '|60', dartCategory: 4, dimensions: '8x12', unitOfMeasure: 'EA', subcategory: 'Siding' },
  { sku: 'LP76-4x8', description: 'LP SmartSide 76 4x8 Panel Siding', batPackId: '|60', dartCategory: 4, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Siding' },
  { sku: 'LP76-4x9', description: 'LP SmartSide 76 4x9 Panel Siding', batPackId: '|60', dartCategory: 4, dimensions: '4x9', unitOfMeasure: 'SHT', subcategory: 'Siding' },
  { sku: 'LP76-4x10', description: 'LP SmartSide 76 4x10 Panel Siding', batPackId: '|60', dartCategory: 4, dimensions: '4x10', unitOfMeasure: 'SHT', subcategory: 'Siding' },

  // Fiber Cement Siding
  { sku: 'HARDIE8.25x144', description: 'HardiePlank 8.25" x 144"', batPackId: '|60', dartCategory: 4, dimensions: '8.25x144', unitOfMeasure: 'EA', subcategory: 'Siding' },
  { sku: 'HARDIE6.25x144', description: 'HardiePlank 6.25" x 144"', batPackId: '|60', dartCategory: 4, dimensions: '6.25x144', unitOfMeasure: 'EA', subcategory: 'Siding' },
  { sku: 'HARDIEPANEL4x8', description: 'HardiePanel 4x8', batPackId: '|60', dartCategory: 4, dimensions: '4x8', unitOfMeasure: 'SHT', subcategory: 'Siding' },
  { sku: 'HARDIEPANEL4x10', description: 'HardiePanel 4x10', batPackId: '|60', dartCategory: 4, dimensions: '4x10', unitOfMeasure: 'SHT', subcategory: 'Siding' },

  // Exterior Trim (LP SmartSide / Composite)
  { sku: 'LPTRIM3/4x4x16', description: 'LP SmartSide Trim 3/4x4x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x4x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM3/4x6x16', description: 'LP SmartSide Trim 3/4x6x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x6x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM3/4x8x16', description: 'LP SmartSide Trim 3/4x8x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x8x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM3/4x10x16', description: 'LP SmartSide Trim 3/4x10x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x10x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM3/4x12x16', description: 'LP SmartSide Trim 3/4x12x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x12x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM1-1/4x4x16', description: 'LP SmartSide Trim 1-1/4x4x16', batPackId: '|60', dartCategory: 4, dimensions: '1-1/4x4x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'LPTRIM1-1/4x6x16', description: 'LP SmartSide Trim 1-1/4x6x16', batPackId: '|60', dartCategory: 4, dimensions: '1-1/4x6x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },

  // Window/Door Trim
  { sku: 'HARDIETRIM3/4x4x12', description: 'HardieTrim 3/4x4x12', batPackId: '|60', dartCategory: 4, dimensions: '3/4x4x12', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'HARDIETRIM3/4x6x12', description: 'HardieTrim 3/4x6x12', batPackId: '|60', dartCategory: 4, dimensions: '3/4x6x12', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },

  // Corner Boards
  { sku: 'CORNER3/4x4x16', description: 'LP Corner Board 3/4x4x16', batPackId: '|60', dartCategory: 4, dimensions: '3/4x4x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },
  { sku: 'CORNER1-1/4x4x16', description: 'LP Corner Board 1-1/4x4x16', batPackId: '|60', dartCategory: 4, dimensions: '1-1/4x4x16', unitOfMeasure: 'EA', subcategory: 'Exterior Trim' },

  // Siding Fasteners
  { sku: 'SIDINGNL8d-HDG', description: '8d HDG Siding Nail', batPackId: '|60', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'SIDINGNL6d-HDG', description: '6d HDG Siding Nail', batPackId: '|60', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'SIDINGSCR2-SS', description: '2" Stainless Siding Screw', batPackId: '|60', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },

  // Caulk
  { sku: 'CAULKEXT-WHT', description: 'Exterior Caulk White', batPackId: '|60', dartCategory: 12, unitOfMeasure: 'EA', subcategory: 'Caulk & Sealants' },
  { sku: 'CAULKEXT-CLR', description: 'Exterior Caulk Clear', batPackId: '|60', dartCategory: 12, unitOfMeasure: 'EA', subcategory: 'Caulk & Sealants' },
];

// ============================================================================
// PACK |74 - DECK SURFACE MATERIALS
// ============================================================================
const DECK_SURFACE_MATERIALS: Layer2MaterialDef[] = [
  // Pressure Treated Decking
  { sku: '5/4x6x16PT', description: '5/4x6x16 PT Deck Board', batPackId: '|74', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '5/4x6x16', unitOfMeasure: 'EA', subcategory: 'Decking' },
  { sku: '5/4x6x14PT', description: '5/4x6x14 PT Deck Board', batPackId: '|74', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '5/4x6x14', unitOfMeasure: 'EA', subcategory: 'Decking' },
  { sku: '5/4x6x12PT', description: '5/4x6x12 PT Deck Board', batPackId: '|74', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '5/4x6x12', unitOfMeasure: 'EA', subcategory: 'Decking' },
  { sku: '5/4x6x10PT', description: '5/4x6x10 PT Deck Board', batPackId: '|74', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '5/4x6x10', unitOfMeasure: 'EA', subcategory: 'Decking' },

  // Composite Decking
  { sku: 'TREX1x6x16', description: 'Trex 1x6x16 Composite', batPackId: '|74', dartCategory: 13, dimensions: '1x6x16', unitOfMeasure: 'EA', subcategory: 'Composite Decking' },
  { sku: 'TREX1x6x12', description: 'Trex 1x6x12 Composite', batPackId: '|74', dartCategory: 13, dimensions: '1x6x12', unitOfMeasure: 'EA', subcategory: 'Composite Decking' },
  { sku: 'TIMBRTECH1x6x16', description: 'TimberTech 1x6x16 Composite', batPackId: '|74', dartCategory: 13, dimensions: '1x6x16', unitOfMeasure: 'EA', subcategory: 'Composite Decking' },

  // Deck Screws
  { sku: 'DECKSCR2-1/2', description: '2-1/2" Deck Screw', batPackId: '|74', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'DECKSCR3', description: '3" Deck Screw', batPackId: '|74', dartCategory: 9, unitOfMeasure: 'LB', subcategory: 'Fasteners' },
  { sku: 'DECKSCR-HIDDEN', description: 'Hidden Deck Fastener System', batPackId: '|74', dartCategory: 9, unitOfMeasure: 'BX', subcategory: 'Fasteners' },
];

// ============================================================================
// PACK |75 - DECK RAIL MATERIALS
// ============================================================================
const DECK_RAIL_MATERIALS: Layer2MaterialDef[] = [
  // PT Rail System
  { sku: '2x4x8PT-RAIL', description: '2x4x8 PT Rail Top/Bottom', batPackId: '|75', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '2x4x8', unitOfMeasure: 'EA', subcategory: 'Railing' },
  { sku: '4x4x42PT-POST', description: '4x4x42 PT Rail Post', batPackId: '|75', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '4x4x42', unitOfMeasure: 'EA', subcategory: 'Railing' },
  { sku: '2x2x42PT-BAL', description: '2x2x42 PT Baluster', batPackId: '|75', dartCategory: 1, species: 'PT', grade: '#2', dimensions: '2x2x42', unitOfMeasure: 'EA', subcategory: 'Railing' },

  // Composite Rail System
  { sku: 'TREX-RAIL6', description: 'Trex Rail Section 6\'', batPackId: '|75', dartCategory: 13, dimensions: '6', unitOfMeasure: 'EA', subcategory: 'Composite Railing' },
  { sku: 'TREX-RAIL8', description: 'Trex Rail Section 8\'', batPackId: '|75', dartCategory: 13, dimensions: '8', unitOfMeasure: 'EA', subcategory: 'Composite Railing' },
  { sku: 'TREX-POST', description: 'Trex Post Sleeve', batPackId: '|75', dartCategory: 13, unitOfMeasure: 'EA', subcategory: 'Composite Railing' },
  { sku: 'TREX-CAP', description: 'Trex Post Cap', batPackId: '|75', dartCategory: 13, unitOfMeasure: 'EA', subcategory: 'Composite Railing' },

  // Rail Hardware
  { sku: 'POSTBASE', description: 'Post Base Bracket', batPackId: '|75', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
  { sku: 'RAILBRACKET', description: 'Rail Bracket', batPackId: '|75', dartCategory: 8, unitOfMeasure: 'EA', subcategory: 'Hardware' },
];

// ============================================================================
// AGGREGATE ALL MATERIALS
// ============================================================================
const ALL_LAYER2_MATERIALS: Layer2MaterialDef[] = [
  ...FOUNDATION_MATERIALS,
  ...JOIST_SYSTEM_MATERIALS,
  ...SUBFLOOR_MATERIALS,
  ...MAIN_WALLS_MATERIALS,
  ...GARAGE_WALLS_MATERIALS,
  ...ROOF_MATERIALS,
  ...HOUSEWRAP_MATERIALS,
  ...SIDING_MATERIALS,
  ...DECK_SURFACE_MATERIALS,
  ...DECK_RAIL_MATERIALS,
];

// ============================================================================
// SEED FUNCTION
// ============================================================================
export async function seedLayer2Materials() {
  console.log('📦 Seeding Layer 2 Materials...');

  let count = 0;
  let skipped = 0;

  for (const material of ALL_LAYER2_MATERIALS) {
    try {
      await prisma.layer2Material.upsert({
        where: { sku: material.sku },
        update: {
          description: material.description,
          batPackId: material.batPackId,
          dartCategory: material.dartCategory,
          species: material.species,
          grade: material.grade,
          dimensions: material.dimensions,
          unitOfMeasure: material.unitOfMeasure,
          subcategory: material.subcategory,
          isStandard: material.isStandard ?? true,
          notes: material.notes,
        },
        create: {
          sku: material.sku,
          description: material.description,
          batPackId: material.batPackId,
          dartCategory: material.dartCategory,
          species: material.species,
          grade: material.grade,
          dimensions: material.dimensions,
          unitOfMeasure: material.unitOfMeasure,
          subcategory: material.subcategory,
          isStandard: material.isStandard ?? true,
          notes: material.notes,
        },
      });
      count++;
    } catch (error) {
      console.warn(`  ⚠️ Skipped ${material.sku}: ${error}`);
      skipped++;
    }
  }

  console.log(`  ✓ ${count} Layer 2 materials seeded`);
  if (skipped > 0) {
    console.log(`  ⚠️ ${skipped} materials skipped`);
  }

  // Summary by pack
  const packCounts: Record<string, number> = {};
  for (const m of ALL_LAYER2_MATERIALS) {
    packCounts[m.batPackId] = (packCounts[m.batPackId] || 0) + 1;
  }

  console.log('\n  📊 Materials by Pack:');
  for (const [pack, c] of Object.entries(packCounts).sort()) {
    console.log(`      ${pack}: ${c} items`);
  }

  console.log('✅ Layer 2 Materials seeding complete!');

  return {
    total: count,
    skipped,
    byPack: packCounts,
  };
}

export default seedLayer2Materials;
