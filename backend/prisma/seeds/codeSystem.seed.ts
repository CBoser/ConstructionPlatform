/**
 * Code System Seed Data
 *
 * Seeds the unified code system reference tables:
 * - MaterialClass: High-level material categories (1000=Framing, 1100=Siding)
 * - PhaseOptionDefinition: All phase codes and their variants
 * - RichmondOptionCode: Richmond builder's mnemonic option codes
 * - OptionSuffix: Option suffixes (.x01=rf, .x03=l, etc.)
 *
 * Source: unified_code_system.sql and Coding_Schema_v2_NEW_FORMAT.csv
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// MATERIAL CLASSES
// ============================================================================
const MATERIAL_CLASSES = [
  {
    classCode: '1000',
    className: 'Framing',
    description: 'Structural framing materials including lumber, engineered wood, fasteners',
    sortOrder: 1,
  },
  {
    classCode: '1100',
    className: 'Siding',
    description: 'Exterior finishing materials including siding, trim, housewrap, post wraps',
    sortOrder: 2,
  },
];

// ============================================================================
// BUILDING TYPES - Dwelling Classification
// Separates dwelling types from story counts for flexible filtering
// ============================================================================
const BUILDING_TYPES = [
  { code: 'SFR', name: 'Single Family Residence', description: 'Detached single-family home', sortOrder: 1 },
  { code: 'MF', name: 'Multi-Family', description: 'Multi-family residential building (apartments, condos)', sortOrder: 2 },
  { code: 'DUP', name: 'Duplex', description: 'Two-unit attached dwelling', sortOrder: 3 },
  { code: 'TRI', name: 'Tri-Plex', description: 'Three-unit attached dwelling', sortOrder: 4 },
  { code: 'QUAD', name: 'Quad-Plex', description: 'Four-unit attached dwelling', sortOrder: 5 },
  { code: 'COT', name: 'Cottage', description: 'Small detached dwelling, often accessory unit', sortOrder: 6 },
  { code: 'ADU', name: 'Accessory Dwelling Unit', description: 'Secondary dwelling on property (granny flat, in-law suite)', sortOrder: 7 },
  { code: 'TH', name: 'Townhome', description: 'Multi-story attached dwelling with shared walls', sortOrder: 8 },
];

// ============================================================================
// STORY TYPES - Floor/Level Classification
// Separates story count from building type for flexible filtering
// ============================================================================
const STORY_TYPES = [
  { code: '1S', name: 'One Story', description: 'Single-level floor plan', sortOrder: 1 },
  { code: '1.5S', name: 'One and Half Story', description: 'Main floor with partial second floor or bonus room', sortOrder: 2 },
  { code: '2S', name: 'Two Story', description: 'Two-level floor plan', sortOrder: 3 },
  { code: '3S', name: 'Three Story', description: 'Three-level floor plan', sortOrder: 4 },
  { code: 'WO', name: 'Walkout Basement', description: 'Basement with walkout access to grade', sortOrder: 5 },
  { code: 'FULL', name: 'Full Basement', description: 'Full below-grade basement', sortOrder: 6 },
  { code: 'PART', name: 'Partial Basement', description: 'Partial below-grade basement', sortOrder: 7 },
  { code: 'CRAWL', name: 'Crawl Space', description: 'Crawl space foundation', sortOrder: 8 },
  { code: 'SLAB', name: 'Slab on Grade', description: 'Concrete slab foundation', sortOrder: 9 },
  { code: 'PIER', name: 'Pier/Post', description: 'Pier or post foundation (coastal, flood zone)', sortOrder: 10 },
];

// ============================================================================
// OPTION SUFFIXES - Complete Range (.01-.83)
// Based on MindFlow Unified Coding System v2.0
// Format: .xNN where x is the tens digit and NN is the full code
// ============================================================================
const OPTION_SUFFIXES = [
  // 00-09: Core Structural Options
  { suffixCode: '00', abbreviation: 'base', fullName: 'Base/Standard', category: 'base', description: 'Base configuration - no option applied' },
  { suffixCode: '01', abbreviation: 'rf', fullName: 'ReadyFrame', category: 'structural', description: 'ReadyFrame prefab wall panels' },
  { suffixCode: '02', abbreviation: 'lo', fullName: 'Loft Option', category: 'structural', description: 'Loft addition to plan' },
  { suffixCode: '03', abbreviation: 'l', fullName: 'Loft', category: 'structural', description: 'With Loft configuration' },
  { suffixCode: '04', abbreviation: 'nl', fullName: 'No Loft', category: 'structural', description: 'Without Loft configuration' },
  { suffixCode: '05', abbreviation: 'x', fullName: 'Extended', category: 'structural', description: 'Extended version of room/area' },
  { suffixCode: '06', abbreviation: 'sr', fullName: 'Sunroom', category: 'addition', description: 'Sunroom addition' },
  { suffixCode: '07', abbreviation: 'pw', fullName: 'Post Wrap', category: 'exterior', description: 'Decorative post wraps' },
  { suffixCode: '08', abbreviation: 'tc', fullName: 'Tall Crawl', category: 'foundation', description: 'Tall crawl space foundation' },
  { suffixCode: '09', abbreviation: '9t', fullName: "9' Tall Walls", category: 'structural', description: '9-foot wall height option' },

  // 10-19: Wall & Exterior Options
  { suffixCode: '10', abbreviation: '10t', fullName: "10' Tall Walls", category: 'structural', description: '10-foot wall height option' },
  { suffixCode: '11', abbreviation: 'ec', fullName: 'Enhanced Corners', category: 'exterior', description: 'Enhanced corner trim package' },
  { suffixCode: '12', abbreviation: 'er', fullName: 'Enhanced Rear', category: 'exterior', description: 'Enhanced rear elevation trim' },
  { suffixCode: '13', abbreviation: 'fw', fullName: 'Fauxwood Siding', category: 'exterior', description: 'Fauxwood siding option' },
  { suffixCode: '14', abbreviation: 'ma', fullName: 'Masonry', category: 'exterior', description: 'Masonry/stone veneer option' },
  { suffixCode: '15', abbreviation: 'pr', fullName: 'Porch Rail', category: 'exterior', description: 'Porch railing option' },
  { suffixCode: '16', abbreviation: 'dk', fullName: 'Deck', category: 'addition', description: 'Deck addition' },
  { suffixCode: '17', abbreviation: 'cp', fullName: 'Covered Patio', category: 'addition', description: 'Covered patio option' },
  { suffixCode: '18', abbreviation: 's', fullName: 'Exterior Stair Material', category: 'exterior', description: 'Exterior stair materials' },
  { suffixCode: '19', abbreviation: 'hw', fullName: 'Housewrap for Options', category: 'exterior', description: 'Housewrap for option areas' },

  // 20-29: Room/Area Options
  { suffixCode: '20', abbreviation: 'fp', fullName: 'Fireplace', category: 'interior', description: 'Fireplace addition' },
  { suffixCode: '21', abbreviation: 'dba', fullName: 'Deluxe Bath A', category: 'interior', description: 'Deluxe master bath option A' },
  { suffixCode: '22', abbreviation: 'dba2', fullName: 'Deluxe Bath A2', category: 'interior', description: 'Deluxe master bath option A2' },
  { suffixCode: '23', abbreviation: 'dba3', fullName: 'Deluxe Bath A3', category: 'interior', description: 'Deluxe master bath option A3' },
  { suffixCode: '24', abbreviation: 'br4', fullName: 'Bedroom 4', category: 'interior', description: 'Additional bedroom 4' },
  { suffixCode: '25', abbreviation: 'br5', fullName: 'Bedroom 5', category: 'interior', description: 'Additional bedroom 5' },
  { suffixCode: '26', abbreviation: 'stdy', fullName: 'Study', category: 'interior', description: 'Study/office option' },
  { suffixCode: '27', abbreviation: 'den', fullName: 'Den', category: 'interior', description: 'Den option' },
  { suffixCode: '28', abbreviation: 'denfb', fullName: 'Den w/ Full Bath', category: 'interior', description: 'Den with full bathroom' },
  { suffixCode: '29', abbreviation: 'pwdr', fullName: 'Powder Room', category: 'interior', description: 'Powder room option' },

  // 30-39: Garage & Covered Structures
  { suffixCode: '30', abbreviation: '3car', fullName: '3-Car Garage', category: 'garage', description: '3-car garage addition' },
  { suffixCode: '31', abbreviation: '4car', fullName: '4-Car Tandem Garage', category: 'garage', description: '4-car tandem garage' },
  { suffixCode: '32', abbreviation: 'gx2', fullName: 'Garage 2\' Extension', category: 'garage', description: '2-foot garage extension' },
  { suffixCode: '33', abbreviation: 'gx4', fullName: 'Garage 4\' Extension', category: 'garage', description: '4-foot garage extension' },
  { suffixCode: '34', abbreviation: 'gx5', fullName: 'Garage 5\' Extension', category: 'garage', description: '5-foot garage extension' },
  { suffixCode: '35', abbreviation: 'cd', fullName: 'Covered Deck', category: 'addition', description: 'Covered deck option' },
  { suffixCode: '36', abbreviation: 'cd2', fullName: 'Covered Deck 2', category: 'addition', description: 'Covered deck option 2' },
  { suffixCode: '37', abbreviation: 'cd3', fullName: 'Covered Deck 3', category: 'addition', description: 'Covered deck option 3' },
  { suffixCode: '38', abbreviation: 'cp2', fullName: 'Covered Patio 2', category: 'addition', description: 'Covered patio option 2' },
  { suffixCode: '39', abbreviation: 'cp3', fullName: 'Covered Patio 3', category: 'addition', description: 'Covered patio option 3' },

  // 40-49: Window & Door Options
  { suffixCode: '40', abbreviation: 'wgr', fullName: 'Great Room Windows', category: 'windows', description: 'Optional great room windows' },
  { suffixCode: '41', abbreviation: 'wbr2', fullName: 'Bedroom 2 Window', category: 'windows', description: 'Optional bedroom 2 window' },
  { suffixCode: '42', abbreviation: 'wbr3', fullName: 'Bedroom 3 Window', category: 'windows', description: 'Optional bedroom 3 window' },
  { suffixCode: '43', abbreviation: 'wbr4', fullName: 'Bedroom 4 Window', category: 'windows', description: 'Optional bedroom 4 window' },
  { suffixCode: '44', abbreviation: 'wbr5', fullName: 'Bedroom 5 Window', category: 'windows', description: 'Optional bedroom 5 window' },
  { suffixCode: '45', abbreviation: 'wstd', fullName: 'Study Window', category: 'windows', description: 'Optional study window' },
  { suffixCode: '46', abbreviation: 'ctr', fullName: 'Center Meet Door', category: 'doors', description: 'Center-meet sliding door' },
  { suffixCode: '47', abbreviation: 'msl', fullName: 'Multi-Slide Door', category: 'doors', description: 'Multi-slide door system' },
  { suffixCode: '48', abbreviation: 'frd', fullName: 'French Double Door', category: 'doors', description: 'French double door option' },
  { suffixCode: '49', abbreviation: 'wflx', fullName: 'Flex Window', category: 'windows', description: 'Flex room window option' },

  // 50-59: Basement & Foundation Options
  { suffixCode: '50', abbreviation: 'wo', fullName: 'Walk-Out Basement', category: 'foundation', description: 'Walk-out basement option' },
  { suffixCode: '51', abbreviation: 'wo2', fullName: 'Walk-Out Basement 2', category: 'foundation', description: 'Walk-out basement option 2' },
  { suffixCode: '52', abbreviation: 'bsmfw', fullName: 'Basement Full Wall', category: 'foundation', description: 'Full basement wall framing' },
  { suffixCode: '53', abbreviation: 'cfnd', fullName: 'Custom Foundation', category: 'foundation', description: 'Custom foundation option' },
  { suffixCode: '54', abbreviation: 'slb', fullName: 'Slab Foundation', category: 'foundation', description: 'Slab on grade foundation' },
  { suffixCode: '55', abbreviation: '', fullName: 'Reserved 55', category: 'reserved', isActive: false },
  { suffixCode: '56', abbreviation: '', fullName: 'Reserved 56', category: 'reserved', isActive: false },
  { suffixCode: '57', abbreviation: '', fullName: 'Reserved 57', category: 'reserved', isActive: false },
  { suffixCode: '58', abbreviation: '', fullName: 'Reserved 58', category: 'reserved', isActive: false },
  { suffixCode: '59', abbreviation: '', fullName: 'Reserved 59', category: 'reserved', isActive: false },

  // 60-69: Ceiling & Interior Upgrades
  { suffixCode: '60', abbreviation: 'cofdr', fullName: 'Coffered Dining Room', category: 'interior', description: 'Coffered ceiling in dining room' },
  { suffixCode: '61', abbreviation: 'cofmb', fullName: 'Coffered Master BR', category: 'interior', description: 'Coffered ceiling in master bedroom' },
  { suffixCode: '62', abbreviation: 'cofent', fullName: 'Coffered Entry', category: 'interior', description: 'Coffered ceiling in entry' },
  { suffixCode: '63', abbreviation: 'coflv', fullName: 'Coffered Living Room', category: 'interior', description: 'Coffered ceiling in living room' },
  { suffixCode: '64', abbreviation: 'bkcs', fullName: 'Bookcase', category: 'interior', description: 'Built-in bookcase option' },
  { suffixCode: '65', abbreviation: 'retrt', fullName: 'Retreat', category: 'interior', description: 'Clubhouse/retreat option' },
  { suffixCode: '66', abbreviation: 'pkoff', fullName: 'Pocket Office', category: 'interior', description: 'Pocket office option' },
  { suffixCode: '67', abbreviation: '', fullName: 'Reserved 67', category: 'reserved', isActive: false },
  { suffixCode: '68', abbreviation: '', fullName: 'Reserved 68', category: 'reserved', isActive: false },
  { suffixCode: '69', abbreviation: '', fullName: 'Reserved 69', category: 'reserved', isActive: false },

  // 70-79: Specialty & Regional Options
  { suffixCode: '70', abbreviation: 'xgrt', fullName: 'Extended Great Room', category: 'structural', description: 'Extended great room option' },
  { suffixCode: '71', abbreviation: 'loft2', fullName: 'Loft 2', category: 'structural', description: 'Second loft option' },
  { suffixCode: '72', abbreviation: 'sunwo', fullName: 'Sunroom Walk-Out', category: 'addition', description: 'Sunroom with walk-out' },
  { suffixCode: '73', abbreviation: 'fpsng', fullName: 'Fireplace Single', category: 'interior', description: 'Single-sided fireplace' },
  { suffixCode: '74', abbreviation: 'fpdbl', fullName: 'Fireplace Double', category: 'interior', description: 'Double-sided fireplace' },
  { suffixCode: '75', abbreviation: 'altkn', fullName: 'Alternate Kitchen', category: 'interior', description: 'Alternate kitchen layout' },
  { suffixCode: '76', abbreviation: '', fullName: 'Reserved 76', category: 'reserved', isActive: false },
  { suffixCode: '77', abbreviation: '', fullName: 'Reserved 77', category: 'reserved', isActive: false },
  { suffixCode: '78', abbreviation: '', fullName: 'Reserved 78', category: 'reserved', isActive: false },
  { suffixCode: '79', abbreviation: '', fullName: 'Reserved 79', category: 'reserved', isActive: false },

  // 80-83: Elevation-Specific & Special Cases
  { suffixCode: '80', abbreviation: 'elva', fullName: 'Elevation A Specific', category: 'elevation', description: 'Elevation A specific option' },
  { suffixCode: '81', abbreviation: 'elvb', fullName: 'Elevation B Specific', category: 'elevation', description: 'Elevation B specific option' },
  { suffixCode: '82', abbreviation: 'elvc', fullName: 'Elevation C Specific', category: 'elevation', description: 'Elevation C specific option' },
  { suffixCode: '83', abbreviation: 'elvd', fullName: 'Elevation D Specific', category: 'elevation', description: 'Elevation D specific option' },
];

// ============================================================================
// PHASE OPTION DEFINITIONS
// Organized by phase series (09-90)
// ============================================================================
interface PhaseDefinition {
  phaseCode: string;
  phaseName: string;
  isBasePhase: boolean;
  isOption: boolean;
  isAlphaVariant: boolean;
  materialClass: '1000' | '1100';
  shippingOrder: number;
  description?: string;
}

const PHASE_DEFINITIONS: PhaseDefinition[] = [
  // 09 Series - Basement Walls
  { phaseCode: '009.000', phaseName: 'WO BASEMENT WALLS', isBasePhase: true, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Walk-out basement wall framing' },
  { phaseCode: '009.200', phaseName: 'WO BASEMENT WALLS 2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Walk-out basement wall framing variant 2' },

  // 10 Series - Foundation
  { phaseCode: '010.000', phaseName: 'FOUNDATION', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Standard foundation framing' },
  { phaseCode: '010.008', phaseName: 'TALLCRAWL FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 1, description: 'Tall crawl space framing - TALLCRWL' },
  { phaseCode: '010.020', phaseName: 'OPT FIREPLACE FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Optional foundation with fireplace - FPSING01' },
  { phaseCode: '010.600', phaseName: 'EXTENDED GREAT ROOM FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Extended great room foundation - XGREAT' },
  { phaseCode: '010.610', phaseName: 'SUNROOM FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Sunroom foundation - SUN' },
  { phaseCode: '010.820', phaseName: 'OPT DEN FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Optional den foundation' },
  { phaseCode: '010.830', phaseName: 'OPT DEN W/FULL BATH FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Optional den with full bathroom foundation' },

  // 11 Series - Main Joist System @ Foundation
  { phaseCode: '011.000', phaseName: 'MAIN JOIST SYSTEM @FOUNDATION', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Main floor joist system at foundation level' },
  { phaseCode: '011.010', phaseName: 'MAIN JOIST SYSTEM FIREPLACE ADD ON @FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Fireplace add-on joist system - FPSING' },
  { phaseCode: '011.600', phaseName: 'MAIN JOIST SYSTEM @ EXTENDED GREAT ROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Extended great room joist system - XGREAT' },
  { phaseCode: '011.620', phaseName: 'MAIN JOIST SYSTEM LOFT 2 ADD ON @FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Loft 2 add-on joist system - LOFT2' },

  // 12 Series - Garage Foundation
  { phaseCode: '012.000', phaseName: 'OPT 3RD CAR GARAGE FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Third car garage foundation - 3CARA/B/C' },
  { phaseCode: '012.205', phaseName: "OPT 2 CAR GARAGE 2' EXT FOUNDATION", isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 1, description: '2-car garage 2-foot extension - GAREXT2' },
  { phaseCode: '012.400', phaseName: 'OPT 4 CAR GARAGE TANDEM FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: '4-car tandem garage foundation - 4CARTA/B/C' },
  { phaseCode: '012.405', phaseName: "OPT 2 CAR GARAGE 4' EXT FOUNDATION", isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 1, description: '2-car garage 4-foot extension - 2CAR4XA/B/C' },
  { phaseCode: '012.505', phaseName: "OPT 2 CAR GARAGE 5' EXT FOUNDATION", isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 1, description: '2-car garage 5-foot extension - 2CAR5XA/B/C' },

  // 13 Series - Covered Patio Foundation
  { phaseCode: '013.100', phaseName: 'COVERED PATIO FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered patio foundation option 1 - COVP' },
  { phaseCode: '013.200', phaseName: 'COVERED PATIO 2 FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered patio foundation option 2 - COVP2' },
  { phaseCode: '013.300', phaseName: 'COVERED PATIO 3 FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered patio foundation option 3 - COVP3' },

  // 14 Series - Deck Foundation
  { phaseCode: '014.100', phaseName: 'DECK FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Deck foundation option 1 - DECK' },
  { phaseCode: '014.200', phaseName: 'DECK FOUNDATION 2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Deck foundation option 2 - DECK2' },
  { phaseCode: '014.300', phaseName: 'DECK FOUNDATION 3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Deck foundation option 3 - DECK3' },

  // 15 Series - Covered Deck Foundation
  { phaseCode: '015.100', phaseName: 'COVERED DECK FOUNDATION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered deck foundation option 1 - COVD' },
  { phaseCode: '015.200', phaseName: 'COVERED DECK FOUNDATION 2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered deck foundation option 2 - COVD2' },
  { phaseCode: '015.300', phaseName: 'COVERED DECK FOUNDATION 3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Covered deck foundation option 3 - COVD3' },

  // 16 Series - Main Floor Over Basement
  { phaseCode: '016.100', phaseName: 'TRUSSED MAIN FLOOR OVER BASEMENT', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Trussed main floor over walkout basement - WO' },
  { phaseCode: '016.200', phaseName: 'OPT WO 2 BASEMENT MAIN FLOOR SYSTEM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Walkout basement floor system - WO2' },
  { phaseCode: '016.610', phaseName: 'WO BSMT MAIN FLOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 1, description: 'Walkout basement with sunroom - SUNWO' },

  // 18 Series - Main Subfloor
  { phaseCode: '018.000', phaseName: 'MAIN SUBFLOOR', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 2, description: 'Main floor subfloor decking' },
  { phaseCode: '018.820', phaseName: 'OPT DEN SUBFLOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 2, description: 'Optional den subfloor' },
  { phaseCode: '018.830', phaseName: 'OPT DEN W/FULL BATH SUBFLOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 2, description: 'Optional den with full bathroom subfloor' },

  // 20 Series - Main Floor Walls
  { phaseCode: '020.000', phaseName: 'MAIN FLOOR WALLS', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Main floor wall framing' },
  { phaseCode: '020.001', phaseName: 'MAIN WALLS READYFRAME', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Main walls ReadyFrame system' },
  { phaseCode: '020.002', phaseName: 'MAIN FLOOR WALLS (LOFT)', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Main floor walls with loft' },
  { phaseCode: '020.003', phaseName: 'MAIN FLOOR WALLS (NO LOFT)', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Main floor walls without loft' },
  { phaseCode: '020.004', phaseName: 'Alternate Kitchen', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Alternate kitchen layout' },
  { phaseCode: '020.010', phaseName: 'OPT DBL SIDED FIREPLACE', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional double-sided fireplace' },
  { phaseCode: '020.014', phaseName: 'FRAMING MASONRY', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Masonry framing' },
  { phaseCode: '020.020', phaseName: 'OPT GREAT ROOM WINDOWS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional great room windows - WDWGREAT/WDWGRALT/WDWGRTX' },
  { phaseCode: '020.123', phaseName: 'OPT CENTER MEET DOOR @ NO LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Optional center-meet door at no loft' },
  { phaseCode: '020.133', phaseName: 'OPT MULTI SLIDE DOOR @ NO LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Optional multi-slide door at no loft' },
  { phaseCode: '020.060', phaseName: 'OPT FLEX WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional flex room window' },
  { phaseCode: '020.120', phaseName: 'OPT CENTER MEET DOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional center-meet sliding door - MSLIDE1' },
  { phaseCode: '020.122', phaseName: 'OPT CENTER MEET DOOR @ LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Optional center-meet door at loft - MSLIDE1' },
  { phaseCode: '020.130', phaseName: 'OPT MULTI SLIDE DOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional multi-slide door - MSLIDE2' },
  { phaseCode: '020.132', phaseName: 'OPT MULTI SLIDE DOOR @ LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Optional multi-slide door at loft - MSLIDE2' },
  { phaseCode: '020.140', phaseName: 'OPT BEDROOM 2 WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 2 window - WDWBR2' },
  { phaseCode: '020.150', phaseName: 'OPT BEDROOM 3 WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 3 window - WDWBR3' },
  { phaseCode: '020.160', phaseName: 'OPT BEDROOM 4 WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 4 window - WDWBR4' },
  { phaseCode: '020.170', phaseName: 'OPT BEDROOM 5 WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 5 window - WDWBR5' },
  { phaseCode: '020.190', phaseName: 'OPT STUDY WINDOW', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional study window - WDWSTUDY' },
  { phaseCode: '020.200', phaseName: 'OPT POWDER ROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional powder room - ABAPWDR' },
  { phaseCode: '020.210', phaseName: 'OPT DBA DELUXE MASTER BATH 1', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deluxe master bath option 1 - DBA' },
  { phaseCode: '020.220', phaseName: 'OPT DBA2 DELUXE MASTER BATH 2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deluxe master bath option 2 - DBA2' },
  { phaseCode: '020.230', phaseName: 'OPT DBA3 DELUXE MASTER BATH 3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deluxe master bath option 3 - DBA3' },
  { phaseCode: '020.240', phaseName: 'OPT BEDROOM 4', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 4 - ABR4/ABR4BA' },
  { phaseCode: '020.250', phaseName: 'OPT BEDROOM 5 W/ BATHROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 5 with bathroom - ABR5BA' },
  { phaseCode: '020.270', phaseName: 'OPT STUDY', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional study - STUDY' },
  { phaseCode: '020.280', phaseName: 'OPT DINING ROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional dining room' },
  { phaseCode: '020.290', phaseName: 'OPT BED W/ BATHROOM ILO DEN', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom with bath in lieu of den' },
  { phaseCode: '020.330', phaseName: 'OPT FRENCH DOUBLE DOOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional French double door - FRENCHDB' },
  { phaseCode: '020.340', phaseName: 'OPT POCKET OFFICE', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional pocket office' },
  { phaseCode: '020.410', phaseName: 'OPT DINING ROOM COFFERED CEILING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Dining room coffered ceiling - COFDIN' },
  { phaseCode: '020.420', phaseName: 'OPT MBR COFFERED CEILING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Master bedroom coffered ceiling - COFMBR' },
  { phaseCode: '020.430', phaseName: 'OPT ENTRY COFFERED CEILING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Entry coffered ceiling' },
  { phaseCode: '020.440', phaseName: 'OPT LIVING ROOM COFFERED CEILING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Living room coffered ceiling' },
  { phaseCode: '020.500', phaseName: 'OPT BOOKCASE STUDY', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bookcase in study - BOOK1' },
  { phaseCode: '020.600', phaseName: 'EXTENDED GREAT ROOM WALLS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Extended great room walls - XGREAT' },
  { phaseCode: '020.610', phaseName: 'MAIN WALLS SUNROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Sunroom main walls - SUN' },
  { phaseCode: '020.700', phaseName: 'MAIN WALL OPT BDR 3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional bedroom 3 main walls' },
  { phaseCode: '020.810', phaseName: 'OPT CLUBHOUSE RETREAT', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional clubhouse retreat - RETREAT' },
  { phaseCode: '020.820', phaseName: 'OPT DEN WALLS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional den walls' },
  { phaseCode: '020.830', phaseName: 'OPT DEN W/FULL BATH WALLS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Optional den with full bathroom walls' },

  // 22 Series - Garage Walls
  { phaseCode: '022.000', phaseName: '3RD CAR GARAGE WALLS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Third car garage wall framing' },
  { phaseCode: '022.205', phaseName: 'OPT EXTENDED GARAGE WALLS', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Extended garage walls - GAREXT2' },
  { phaseCode: '022.400', phaseName: 'OPT 4 CAR GARAGE TANDEM WALLS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: '4-car tandem garage walls - 4CARTA/B/C' },
  { phaseCode: '022.405', phaseName: "OPT 2 CAR GARAGE 4' EXT WALLS", isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: '2-car garage 4-foot extension walls - 2CAR4XA/B/C' },
  { phaseCode: '022.505', phaseName: "OPT 2 CAR GARAGE 5' EXT WALLS", isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: '2-car garage 5-foot extension walls - 2CAR5XA/B/C' },

  // 23 Series - Covered Patio Framing
  { phaseCode: '023.000', phaseName: 'COVERED PATIO FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered patio framing base' },
  { phaseCode: '023.005', phaseName: 'COVERED PATIO FRAMING EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Extended covered patio framing' },
  { phaseCode: '023.006', phaseName: 'COVERED PATIO FRAMING SUNROOM', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Sunroom covered patio framing' },
  { phaseCode: '023.100', phaseName: 'COVERED PATIO 1 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered patio option 1 framing' },
  { phaseCode: '023.200', phaseName: 'COVERED PATIO 2 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered patio option 2 framing' },
  { phaseCode: '023.300', phaseName: 'COVERED PATIO 3 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered patio option 3 framing' },
  { phaseCode: '023.610', phaseName: 'COVERED PATIO SUNROOM FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Sunroom covered patio framing' },

  // 24 Series - Deck Framing
  { phaseCode: '024.000', phaseName: 'DECK FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deck framing base' },
  { phaseCode: '024.005', phaseName: 'DECK FRAMING EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Extended deck framing' },
  { phaseCode: '024.006', phaseName: 'DECK FRAMING SUNROOM', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Sunroom deck framing' },
  { phaseCode: '024.100', phaseName: 'DECK 1 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deck option 1 framing' },
  { phaseCode: '024.200', phaseName: 'DECK 2 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deck option 2 framing' },
  { phaseCode: '024.300', phaseName: 'DECK 3 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deck option 3 framing' },
  { phaseCode: '024.605', phaseName: 'DECK EXT FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Extended deck framing option' },

  // 25 Series - Covered Deck Framing
  { phaseCode: '025.008', phaseName: 'COVERED DECK FRAMING TALL CRAWL', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Tall crawl covered deck framing' },
  { phaseCode: '025.100', phaseName: 'COVERED DECK 1 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered deck option 1 framing' },
  { phaseCode: '025.101', phaseName: 'COVERED DECK 1 FRAMING RF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Covered deck option 1 ReadyFrame' },
  { phaseCode: '025.200', phaseName: 'COVERED DECK 2 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered deck option 2 framing' },
  { phaseCode: '025.300', phaseName: 'COVERED DECK 3 FRAMING', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Covered deck option 3 framing' },

  // 27 Series - Floor Framing Options
  { phaseCode: '027.000', phaseName: 'FLOOR FRAMING OPTIONS', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Floor framing options' },

  // 30 Series - 2nd Floor System
  { phaseCode: '030.000', phaseName: '2ND FLOOR SYSTEM', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Second floor joist system' },
  { phaseCode: '030.004', phaseName: '2ND FLOOR SYSTEM ALT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 3, description: 'Second floor system alternate' },
  { phaseCode: '030.210', phaseName: '2ND FLOOR DBA FLOOR SYSTEM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deluxe bath option floor system' },
  { phaseCode: '030.220', phaseName: '2ND FLOOR DBA2 FLOOR SYSTEM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Deluxe bath option 2 floor system' },
  { phaseCode: '030.620', phaseName: '2ND FLOOR LOFT2 FLOOR SYSTEM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Loft 2 second floor system' },

  // 32 Series - 2nd Floor Subfloor
  { phaseCode: '032.000', phaseName: '2ND FLOOR SUBFLOOR', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor subfloor decking' },
  { phaseCode: '032.003', phaseName: '2ND FLOOR SUBFLOOR NO LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Second floor subfloor without loft' },
  { phaseCode: '032.623', phaseName: '2ND FLOOR SUBFLOOR LOFT2 NO LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Loft 2 second floor subfloor without loft' },

  // 34 Series - 2nd Floor Walls
  { phaseCode: '034.000', phaseName: '2ND FLOOR DECKING & WALLS', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor wall framing' },
  { phaseCode: '034.001', phaseName: '2ND FLOOR WALLS RF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Second floor walls ReadyFrame' },
  { phaseCode: '034.003', phaseName: '2ND FLOOR WALLS LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Second floor walls with loft' },
  { phaseCode: '034.004', phaseName: '2ND FLOOR WALLS NO LOFT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Second floor walls without loft' },
  { phaseCode: '034.100', phaseName: '2ND FLOOR OPT COVERED PATIO', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor covered patio option' },
  { phaseCode: '034.110', phaseName: '2ND FLOOR OPT COVERED PATIO 1', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor covered patio option 1' },
  { phaseCode: '034.140', phaseName: '2ND FLOOR OPT WDWBR2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor bedroom 2 window' },
  { phaseCode: '034.150', phaseName: '2ND FLOOR OPT WDWBR3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor bedroom 3 window' },
  { phaseCode: '034.160', phaseName: '2ND FLOOR OPT WDWBR4', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor bedroom 4 window' },
  { phaseCode: '034.210', phaseName: '2ND FLOOR OPT DBA', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor deluxe bath option' },
  { phaseCode: '034.220', phaseName: '2ND FLOOR OPT DBA2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor deluxe bath option 2' },
  { phaseCode: '034.230', phaseName: '2ND FLOOR OPT DBA3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor deluxe bath option 3' },
  { phaseCode: '034.240', phaseName: '2ND FLOOR OPT ABR4', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor add bedroom 4' },
  { phaseCode: '034.250', phaseName: '2ND FLOOR OPT ABR5', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor add bedroom 5' },
  { phaseCode: '034.260', phaseName: '2ND FLOOR OPT ABRBATH', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor add bedroom with bath' },
  { phaseCode: '034.270', phaseName: '2ND FLOOR OPT STUDY', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor study option' },
  { phaseCode: '034.610', phaseName: '2ND FLOOR WALLS SUNROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor sunroom walls' },
  { phaseCode: '034.620', phaseName: '2ND FLOOR WALLS LOFT2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor loft 2 walls' },
  { phaseCode: '034.800', phaseName: '2ND FLOOR WALLS RETREAT', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor retreat walls' },
  { phaseCode: '034.909', phaseName: '2ND FLOOR WALLS 9T', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 4, description: 'Second floor 9-tall walls' },

  // 40 Series - Roof
  { phaseCode: '040.000', phaseName: 'ROOF', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Main roof framing and sheathing' },
  { phaseCode: '040.006', phaseName: 'ROOF SUNROOM', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 5, description: 'Sunroom roof' },
  { phaseCode: '040.600', phaseName: 'ROOF EXTENDED GREAT ROOM', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Extended great room roof' },
  { phaseCode: '040.610', phaseName: 'ROOF SUNROOM OPTION', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Sunroom roof option' },
  { phaseCode: '040.800', phaseName: 'ROOF RETREAT', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Retreat roof' },

  // 42 Series - Garage Roof
  { phaseCode: '042.000', phaseName: 'GARAGE ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Garage roof base' },
  { phaseCode: '042.400', phaseName: '4 CAR GARAGE ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: '4-car tandem garage roof' },
  { phaseCode: '042.405', phaseName: '2 CAR GARAGE 4FT EXT ROOF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 5, description: '2-car garage 4-foot extension roof' },
  { phaseCode: '042.505', phaseName: '2 CAR GARAGE 5FT EXT ROOF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 5, description: '2-car garage 5-foot extension roof' },

  // 43 Series - Covered Patio Roof
  { phaseCode: '043.000', phaseName: 'COVERED PATIO ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered patio roof base' },
  { phaseCode: '043.100', phaseName: 'COVERED PATIO 1 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered patio option 1 roof' },
  { phaseCode: '043.200', phaseName: 'COVERED PATIO 2 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered patio option 2 roof' },
  { phaseCode: '043.300', phaseName: 'COVERED PATIO 3 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered patio option 3 roof' },
  { phaseCode: '043.610', phaseName: 'COVERED PATIO SUNROOM ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Sunroom covered patio roof' },
  { phaseCode: '043.910', phaseName: 'COVERED PATIO 9T ROOF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 5, description: 'Covered patio 9-tall roof' },
  { phaseCode: '043.920', phaseName: 'COVERED PATIO 10T ROOF', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1000', shippingOrder: 5, description: 'Covered patio 10-tall roof' },

  // 45 Series - Covered Deck Roof
  { phaseCode: '045.000', phaseName: 'COVERED DECK ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered deck roof base' },
  { phaseCode: '045.100', phaseName: 'COVERED DECK 1 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered deck option 1 roof' },
  { phaseCode: '045.200', phaseName: 'COVERED DECK 2 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered deck option 2 roof' },
  { phaseCode: '045.300', phaseName: 'COVERED DECK 3 ROOF', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Covered deck option 3 roof' },

  // 58 Series - Housewrap
  { phaseCode: '058.000', phaseName: 'HOUSEWRAP', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1100', shippingOrder: 6, description: 'Exterior building wrap' },

  // 60 Series - Exterior Trim and Siding
  { phaseCode: '060.000', phaseName: 'EXTERIOR TRIM AND SIDING', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Main exterior siding and trim' },
  { phaseCode: '060.007', phaseName: 'POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Exterior post wraps' },
  { phaseCode: '060.008', phaseName: 'EXTERIOR TALL CRAWL', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Tall crawl exterior' },
  { phaseCode: '060.011', phaseName: 'ENHANCED CORNERS', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Enhanced corner trim and siding' },
  { phaseCode: '060.012', phaseName: 'ENHANCED REAR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Enhanced rear trim and siding' },
  { phaseCode: '060.013', phaseName: 'FAUX WOOD', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Faux wood trim' },
  { phaseCode: '060.014', phaseName: 'MASONRY EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Masonry exterior trim and siding' },
  { phaseCode: '060.015', phaseName: 'PORCH RAIL', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Porch railing - PORRAIL' },
  { phaseCode: '060.020', phaseName: 'OPT FIREPLACE EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Optional fireplace exterior' },
  { phaseCode: '060.110', phaseName: 'COVERED PATIO 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 1 exterior' },
  { phaseCode: '060.120', phaseName: 'DECK 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deck option 1 exterior' },
  { phaseCode: '060.130', phaseName: 'COVERED DECK 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 1 exterior' },
  { phaseCode: '060.140', phaseName: 'OPT WDWBR2 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Bedroom 2 window exterior' },
  { phaseCode: '060.150', phaseName: 'OPT WDWBR3 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Bedroom 3 window exterior' },
  { phaseCode: '060.160', phaseName: 'OPT WDWBR4 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Bedroom 4 window exterior' },
  { phaseCode: '060.170', phaseName: 'OPT WDWBR5 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Bedroom 5 window exterior' },
  { phaseCode: '060.190', phaseName: 'OPT STUDY EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Study option exterior' },
  { phaseCode: '060.210', phaseName: 'OPT DBA EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deluxe bath option exterior' },
  { phaseCode: '060.220', phaseName: 'OPT DBA2 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deluxe bath option 2 exterior' },
  { phaseCode: '060.240', phaseName: 'OPT ABR4 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Add bedroom 4 exterior' },
  { phaseCode: '060.270', phaseName: 'OPT STUDY ROOM EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Study room exterior' },
  { phaseCode: '060.605', phaseName: 'EXTENDED GREAT ROOM EXTERIOR EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended great room exterior' },
  { phaseCode: '060.610', phaseName: 'SUNROOM EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Sunroom exterior' },
  { phaseCode: '060.800', phaseName: 'RETREAT EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Retreat exterior' },

  // 62 Series - Garage Exterior
  { phaseCode: '062.000', phaseName: 'GARAGE EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Garage exterior base' },
  { phaseCode: '062.005', phaseName: 'GARAGE EXTERIOR EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended garage exterior' },
  { phaseCode: '062.400', phaseName: '4 CAR GARAGE EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: '4-car garage exterior' },
  { phaseCode: '062.405', phaseName: '2 CAR GARAGE 4FT EXT EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: '2-car garage 4-foot extension exterior' },
  { phaseCode: '062.505', phaseName: '2 CAR GARAGE 5FT EXT EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: '2-car garage 5-foot extension exterior' },

  // 63 Series - Covered Patio Exterior
  { phaseCode: '063.000', phaseName: 'COVERED PATIO EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered patio exterior base' },
  { phaseCode: '063.005', phaseName: 'COVERED PATIO EXTERIOR EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended covered patio exterior' },
  { phaseCode: '063.006', phaseName: 'COVERED PATIO SUNROOM EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Sunroom covered patio exterior' },
  { phaseCode: '063.007', phaseName: 'COVERED PATIO POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered patio post wrap' },
  { phaseCode: '063.100', phaseName: 'COVERED PATIO 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 1 exterior' },
  { phaseCode: '063.107', phaseName: 'COVERED PATIO 1 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 1 post wrap' },
  { phaseCode: '063.119', phaseName: 'COVERED PATIO 1 HOUSEWRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 1 housewrap' },
  { phaseCode: '063.200', phaseName: 'COVERED PATIO 2 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 2 exterior' },
  { phaseCode: '063.207', phaseName: 'COVERED PATIO 2 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 2 post wrap' },
  { phaseCode: '063.300', phaseName: 'COVERED PATIO 3 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 3 exterior' },
  { phaseCode: '063.307', phaseName: 'COVERED PATIO 3 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered patio option 3 post wrap' },
  { phaseCode: '063.610', phaseName: 'COVERED PATIO SUNROOM EXT EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Sunroom covered patio extended exterior' },

  // 65 Series - Covered Deck Exterior
  { phaseCode: '065.100', phaseName: 'COVERED DECK 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 1 exterior' },
  { phaseCode: '065.107', phaseName: 'COVERED DECK 1 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 1 post wrap' },
  { phaseCode: '065.200', phaseName: 'COVERED DECK 2 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 2 exterior' },
  { phaseCode: '065.207', phaseName: 'COVERED DECK 2 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 2 post wrap' },
  { phaseCode: '065.300', phaseName: 'COVERED DECK 3 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 3 exterior' },
  { phaseCode: '065.307', phaseName: 'COVERED DECK 3 POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Covered deck option 3 post wrap' },

  // 74 Series - Deck Exterior
  { phaseCode: '074.005', phaseName: 'DECK EXTERIOR EXT', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended deck exterior' },
  { phaseCode: '074.100', phaseName: 'DECK 1 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deck option 1 exterior' },
  { phaseCode: '074.200', phaseName: 'DECK 2 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deck option 2 exterior' },
  { phaseCode: '074.300', phaseName: 'DECK 3 EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Deck option 3 exterior' },
  { phaseCode: '074.605', phaseName: 'DECK EXT EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended deck exterior option' },

  // 75 Series - Exterior Stair Material
  { phaseCode: '075.100', phaseName: 'EXTERIOR STAIR 1', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Exterior stair option 1' },
  { phaseCode: '075.118', phaseName: 'EXTERIOR STAIR 1 EXT STAIR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended exterior stair option 1' },
  { phaseCode: '075.200', phaseName: 'EXTERIOR STAIR 2', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Exterior stair option 2' },
  { phaseCode: '075.218', phaseName: 'EXTERIOR STAIR 2 EXT STAIR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Extended exterior stair option 2' },
  { phaseCode: '075.300', phaseName: 'EXTERIOR STAIR 3', isBasePhase: false, isOption: true, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Exterior stair option 3' },
  { phaseCode: '075.908', phaseName: 'EXTERIOR STAIR TALL CRAWL', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Tall crawl exterior stair' },
];

// ============================================================================
// RICHMOND OPTION CODES
// ============================================================================
interface RichmondOption {
  optionCode: string;
  optionDescription: string;
  phaseCode?: string;  // Links to PhaseOptionDefinition
  isMultiPhase: boolean;
}

const RICHMOND_OPTIONS: RichmondOption[] = [
  // Walk-out basement options
  { optionCode: 'WO', optionDescription: 'Walk-out Basement', phaseCode: '009.000', isMultiPhase: false },
  { optionCode: 'WO2', optionDescription: 'Walk-out Basement Variant 2', phaseCode: '009.200', isMultiPhase: false },
  { optionCode: 'SUNWO', optionDescription: 'Sunroom with Walk-out', phaseCode: '016.610', isMultiPhase: false },

  // Foundation/structural options
  { optionCode: 'FPSING', optionDescription: 'Fireplace Single', phaseCode: '011.010', isMultiPhase: false },
  { optionCode: 'FPSING01', optionDescription: 'Fireplace Single Option 1', phaseCode: '010.020', isMultiPhase: false },
  { optionCode: 'XGREAT', optionDescription: 'Extended Great Room', isMultiPhase: true },
  { optionCode: 'SUN', optionDescription: 'Sunroom', isMultiPhase: true },
  { optionCode: 'TALLCRWL', optionDescription: 'Tall Crawl Space', isMultiPhase: true },
  { optionCode: 'LOFT', optionDescription: 'Loft', isMultiPhase: true },
  { optionCode: 'LOFT2', optionDescription: 'Loft 2', isMultiPhase: true },

  // Garage options
  { optionCode: '3CARA', optionDescription: '3-Car Garage Option A', isMultiPhase: true },
  { optionCode: '3CARB', optionDescription: '3-Car Garage Option B', isMultiPhase: true },
  { optionCode: '3CARC', optionDescription: '3-Car Garage Option C', isMultiPhase: true },
  { optionCode: '3CARD', optionDescription: '3-Car Garage Option D', isMultiPhase: true },
  { optionCode: '4CARTA', optionDescription: '4-Car Tandem Garage Option A', isMultiPhase: true },
  { optionCode: '4CARTB', optionDescription: '4-Car Tandem Garage Option B', isMultiPhase: true },
  { optionCode: '4CARTC', optionDescription: '4-Car Tandem Garage Option C', isMultiPhase: true },
  { optionCode: 'GAREXT2', optionDescription: '2-Car Garage 2-Foot Extension', isMultiPhase: true },
  { optionCode: '2CAR4XA', optionDescription: '2-Car Garage 4-Foot Extension Option A', isMultiPhase: true },
  { optionCode: '2CAR4XB', optionDescription: '2-Car Garage 4-Foot Extension Option B', isMultiPhase: true },
  { optionCode: '2CAR4XC', optionDescription: '2-Car Garage 4-Foot Extension Option C', isMultiPhase: true },
  { optionCode: '2CAR5XA', optionDescription: '2-Car Garage 5-Foot Extension Option A', isMultiPhase: true },
  { optionCode: '2CAR5XB', optionDescription: '2-Car Garage 5-Foot Extension Option B', isMultiPhase: true },
  { optionCode: '2CAR5XC', optionDescription: '2-Car Garage 5-Foot Extension Option C', isMultiPhase: true },
  { optionCode: '3CARTB', optionDescription: '3-Car Garage Tandem Option B', isMultiPhase: true },
  { optionCode: '3CARTC', optionDescription: '3-Car Garage Tandem Option C', isMultiPhase: true },

  // Patio and deck options
  { optionCode: 'COVP', optionDescription: 'Covered Patio', isMultiPhase: true },
  { optionCode: 'COVP2', optionDescription: 'Covered Patio 2', isMultiPhase: true },
  { optionCode: 'COVP3', optionDescription: 'Covered Patio 3', isMultiPhase: true },
  { optionCode: 'COVPX', optionDescription: 'Extended Covered Patio', isMultiPhase: true },
  { optionCode: 'DECK', optionDescription: 'Deck Option 1', isMultiPhase: true },
  { optionCode: 'DECK2', optionDescription: 'Deck Option 2', isMultiPhase: true },
  { optionCode: 'DECK3', optionDescription: 'Deck Option 3', isMultiPhase: true },
  { optionCode: 'COVD', optionDescription: 'Covered Deck', isMultiPhase: true },
  { optionCode: 'COVD2', optionDescription: 'Covered Deck 2', isMultiPhase: true },
  { optionCode: 'COVD3', optionDescription: 'Covered Deck 3', isMultiPhase: true },

  // Window options
  { optionCode: 'WDWGREAT', optionDescription: 'Great Room Window', isMultiPhase: true },
  { optionCode: 'WDWGRALT', optionDescription: 'Alternate Great Room Window with Fireplace', isMultiPhase: true },
  { optionCode: 'WDWMBR', optionDescription: 'Master Bedroom Window', isMultiPhase: true },
  { optionCode: 'WDWBR2', optionDescription: 'Bedroom 2 Window', isMultiPhase: true },
  { optionCode: 'WDWBR3', optionDescription: 'Bedroom 3 Window', isMultiPhase: true },
  { optionCode: 'WDWBR4', optionDescription: 'Bedroom 4 Window', isMultiPhase: true },
  { optionCode: 'WDWBR5', optionDescription: 'Bedroom 5 Window', isMultiPhase: true },
  { optionCode: 'WDWSTUDY', optionDescription: 'Study Window', isMultiPhase: true },

  // Door options
  { optionCode: 'MSLIDE1', optionDescription: 'Center-Meet Sliding Door', isMultiPhase: true },
  { optionCode: 'MSLIDE2', optionDescription: 'Multi-Slide Door', isMultiPhase: true },
  { optionCode: 'FRENCHDB', optionDescription: 'French Double Door', phaseCode: '020.330', isMultiPhase: false },

  // Bathroom options
  { optionCode: 'DBA', optionDescription: 'Deluxe Bath Option A', isMultiPhase: true },
  { optionCode: 'DBA2', optionDescription: 'Deluxe Bath Option 2', isMultiPhase: true },
  { optionCode: 'DBA3', optionDescription: 'Deluxe Bath Option 3', phaseCode: '020.230', isMultiPhase: false },
  { optionCode: 'ABAPWDR', optionDescription: 'Above Powder Room', phaseCode: '020.200', isMultiPhase: false },

  // Bedroom options
  { optionCode: 'ABR4', optionDescription: 'Additional Bedroom 4', isMultiPhase: true },
  { optionCode: 'ABR4BA', optionDescription: 'Additional Bedroom 4 with Bath', isMultiPhase: true },
  { optionCode: 'ABR5BA', optionDescription: 'Additional Bedroom 5 with Bath', phaseCode: '020.250', isMultiPhase: false },

  // Other options
  { optionCode: 'STUDY', optionDescription: 'Study', phaseCode: '020.270', isMultiPhase: false },
  { optionCode: 'RETREAT', optionDescription: 'Clubhouse Retreat', phaseCode: '020.810', isMultiPhase: false },
  { optionCode: 'BOOK1', optionDescription: 'Bookcase Option 1', phaseCode: '020.500', isMultiPhase: false },
  { optionCode: 'COFDIN', optionDescription: 'Coffered Dining Room Ceiling', phaseCode: '020.410', isMultiPhase: false },
  { optionCode: 'COFMBR', optionDescription: 'Coffered Master Bedroom Ceiling', phaseCode: '020.420', isMultiPhase: false },
  { optionCode: 'PORRAIL', optionDescription: 'Porch Rail', phaseCode: '060.015', isMultiPhase: false },
  { optionCode: 'DEN', optionDescription: 'Den', isMultiPhase: true },
  { optionCode: 'DENF', optionDescription: 'Den with Full Bath', isMultiPhase: true },
  { optionCode: 'SIDED FIREPLACE', optionDescription: 'Sided Fireplace', isMultiPhase: true },
  { optionCode: 'SLIDE DOOR', optionDescription: 'Sliding Door', isMultiPhase: true },
  { optionCode: 'WDWGRTX', optionDescription: 'Great Room Window Extended', isMultiPhase: true },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================
export async function seedCodeSystem() {
  console.log('🏗️  Seeding Code System...');

  // 1. Seed Material Classes
  console.log('  📦 Seeding Material Classes...');
  for (const mc of MATERIAL_CLASSES) {
    await prisma.materialClass.upsert({
      where: { classCode: mc.classCode },
      update: {
        className: mc.className,
        description: mc.description,
        sortOrder: mc.sortOrder,
      },
      create: mc,
    });
  }
  console.log(`    ✓ ${MATERIAL_CLASSES.length} material classes seeded`);

  // 2. Seed Building Types
  console.log('  🏠 Seeding Building Types...');
  for (const bt of BUILDING_TYPES) {
    await prisma.buildingType.upsert({
      where: { code: bt.code },
      update: {
        name: bt.name,
        description: bt.description,
        sortOrder: bt.sortOrder,
      },
      create: bt,
    });
  }
  console.log(`    ✓ ${BUILDING_TYPES.length} building types seeded`);

  // 3. Seed Story Types
  console.log('  🏢 Seeding Story Types...');
  for (const st of STORY_TYPES) {
    await prisma.storyType.upsert({
      where: { code: st.code },
      update: {
        name: st.name,
        description: st.description,
        sortOrder: st.sortOrder,
      },
      create: st,
    });
  }
  console.log(`    ✓ ${STORY_TYPES.length} story types seeded`);

  // 4. Seed Option Suffixes
  console.log('  🏷️  Seeding Option Suffixes...');
  for (const suffix of OPTION_SUFFIXES) {
    await prisma.optionSuffix.upsert({
      where: { suffixCode: suffix.suffixCode },
      update: {
        abbreviation: suffix.abbreviation,
        fullName: suffix.fullName,
        category: suffix.category,
        description: (suffix as any).description,
        isActive: (suffix as any).isActive ?? true,
      },
      create: {
        suffixCode: suffix.suffixCode,
        abbreviation: suffix.abbreviation,
        fullName: suffix.fullName,
        category: suffix.category,
        description: (suffix as any).description,
        isActive: (suffix as any).isActive ?? true,
      },
    });
  }
  console.log(`    ✓ ${OPTION_SUFFIXES.length} option suffixes seeded`);

  // 5. Seed Phase Option Definitions
  console.log('  📋 Seeding Phase Option Definitions...');
  const materialClassMap = new Map<string, string>();
  const classes = await prisma.materialClass.findMany();
  for (const mc of classes) {
    materialClassMap.set(mc.classCode, mc.id);
  }

  const phaseMap = new Map<string, string>();
  for (const phase of PHASE_DEFINITIONS) {
    const materialClassId = materialClassMap.get(phase.materialClass);
    if (!materialClassId) {
      console.warn(`    ⚠️ Material class ${phase.materialClass} not found for phase ${phase.phaseCode}`);
      continue;
    }

    const created = await prisma.phaseOptionDefinition.upsert({
      where: { phaseCode: phase.phaseCode },
      update: {
        phaseName: phase.phaseName,
        isBasePhase: phase.isBasePhase,
        isOption: phase.isOption,
        isAlphaVariant: phase.isAlphaVariant,
        materialClassId,
        shippingOrder: phase.shippingOrder,
        description: phase.description,
      },
      create: {
        phaseCode: phase.phaseCode,
        phaseName: phase.phaseName,
        isBasePhase: phase.isBasePhase,
        isOption: phase.isOption,
        isAlphaVariant: phase.isAlphaVariant,
        materialClassId,
        shippingOrder: phase.shippingOrder,
        description: phase.description,
      },
    });
    phaseMap.set(phase.phaseCode, created.id);
  }
  console.log(`    ✓ ${PHASE_DEFINITIONS.length} phase definitions seeded`);

  // 6. Seed Richmond Option Codes
  console.log('  🏠 Seeding Richmond Option Codes...');
  for (const option of RICHMOND_OPTIONS) {
    const phaseId = option.phaseCode ? phaseMap.get(option.phaseCode) : undefined;

    await prisma.richmondOptionCode.upsert({
      where: { optionCode: option.optionCode },
      update: {
        optionDescription: option.optionDescription,
        phaseId: phaseId || null,
        isMultiPhase: option.isMultiPhase,
      },
      create: {
        optionCode: option.optionCode,
        optionDescription: option.optionDescription,
        phaseId: phaseId || null,
        isMultiPhase: option.isMultiPhase,
      },
    });
  }
  console.log(`    ✓ ${RICHMOND_OPTIONS.length} Richmond option codes seeded`);

  console.log('✅ Code System seeding complete!');

  return {
    materialClasses: MATERIAL_CLASSES.length,
    optionSuffixes: OPTION_SUFFIXES.length,
    phaseDefinitions: PHASE_DEFINITIONS.length,
    richmondOptions: RICHMOND_OPTIONS.length,
  };
}

export default seedCodeSystem;
