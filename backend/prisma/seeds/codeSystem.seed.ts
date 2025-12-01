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
// OPTION SUFFIXES (from user's updated format)
// ============================================================================
const OPTION_SUFFIXES = [
  { suffixCode: '01', abbreviation: 'rf', fullName: 'ReadyFrame', category: 'structural' },
  { suffixCode: '03', abbreviation: 'l', fullName: 'Loft', category: 'structural' },
  { suffixCode: '04', abbreviation: 'nl', fullName: 'No Loft', category: 'structural' },
  { suffixCode: '05', abbreviation: 'x', fullName: 'Extended', category: 'structural' },
  { suffixCode: '06', abbreviation: 'sr', fullName: 'Sunroom', category: 'addition' },
  { suffixCode: '07', abbreviation: 'pw', fullName: 'Post Wrap', category: 'exterior' },
  { suffixCode: '08', abbreviation: 'tc', fullName: 'Tall Crawl', category: 'foundation' },
  { suffixCode: '09', abbreviation: '9t', fullName: '9 Tall Walls', category: 'structural' },
  { suffixCode: '10', abbreviation: '10t', fullName: "10' Tall Walls", category: 'structural' },
  { suffixCode: '11', abbreviation: 'ec', fullName: 'Enhanced Corners', category: 'exterior' },
  { suffixCode: '12', abbreviation: 'er', fullName: 'Enhanced Rear', category: 'exterior' },
  { suffixCode: '13', abbreviation: 'fw', fullName: 'Fauxwood Siding', category: 'exterior' },
  { suffixCode: '14', abbreviation: 'ma', fullName: 'Masonry', category: 'exterior' },
  { suffixCode: '15', abbreviation: 'pr', fullName: 'Porch Rail', category: 'exterior' },
  { suffixCode: '16', abbreviation: '', fullName: 'Available', category: 'reserved', isActive: false },
  { suffixCode: '17', abbreviation: '', fullName: 'Available', category: 'reserved', isActive: false },
  { suffixCode: '18', abbreviation: 's', fullName: 'Exterior Stair Material', category: 'exterior' },
  { suffixCode: '19', abbreviation: '', fullName: 'Housewrap for Options', category: 'exterior' },
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

  // 30 Series - 2nd Floor System
  { phaseCode: '030.000', phaseName: '2ND FLOOR SYSTEM', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 3, description: 'Second floor joist system' },

  // 32 Series - 2nd Floor Subfloor
  { phaseCode: '032.000', phaseName: '2ND FLOOR SUBFLOOR', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor subfloor decking' },

  // 34 Series - 2nd Floor Walls
  { phaseCode: '034.000', phaseName: '2ND FLOOR DECKING & WALLS', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 4, description: 'Second floor wall framing' },

  // 40 Series - Roof
  { phaseCode: '040.000', phaseName: 'ROOF', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1000', shippingOrder: 5, description: 'Main roof framing and sheathing' },

  // 58 Series - Housewrap
  { phaseCode: '058.000', phaseName: 'HOUSEWRAP', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1100', shippingOrder: 6, description: 'Exterior building wrap' },

  // 60 Series - Exterior Trim and Siding
  { phaseCode: '060.000', phaseName: 'EXTERIOR TRIM AND SIDING', isBasePhase: true, isOption: false, isAlphaVariant: false, materialClass: '1100', shippingOrder: 7, description: 'Main exterior siding and trim' },
  { phaseCode: '060.011', phaseName: 'ENHANCED CORNERS', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Enhanced corner trim and siding' },
  { phaseCode: '060.012', phaseName: 'ENHANCED REAR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Enhanced rear trim and siding' },
  { phaseCode: '060.013', phaseName: 'FAUX WOOD', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Faux wood trim' },
  { phaseCode: '060.014', phaseName: 'MASONRY EXTERIOR', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Masonry exterior trim and siding' },
  { phaseCode: '060.015', phaseName: 'PORCH RAIL', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Porch railing - PORRAIL' },
  { phaseCode: '060.007', phaseName: 'POST WRAP', isBasePhase: false, isOption: true, isAlphaVariant: true, materialClass: '1100', shippingOrder: 7, description: 'Exterior post wraps' },
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

  // 2. Seed Option Suffixes
  console.log('  🏷️  Seeding Option Suffixes...');
  for (const suffix of OPTION_SUFFIXES) {
    await prisma.optionSuffix.upsert({
      where: { suffixCode: suffix.suffixCode },
      update: {
        abbreviation: suffix.abbreviation,
        fullName: suffix.fullName,
        category: suffix.category,
        isActive: suffix.isActive ?? true,
      },
      create: {
        suffixCode: suffix.suffixCode,
        abbreviation: suffix.abbreviation,
        fullName: suffix.fullName,
        category: suffix.category,
        isActive: suffix.isActive ?? true,
      },
    });
  }
  console.log(`    ✓ ${OPTION_SUFFIXES.length} option suffixes seeded`);

  // 3. Seed Phase Option Definitions
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

  // 4. Seed Richmond Option Codes
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
