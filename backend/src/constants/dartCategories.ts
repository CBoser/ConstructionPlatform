/**
 * DART Category Definitions for BAT System Integration
 *
 * DART categories determine how products are classified for tier-based pricing.
 * Each customer has different tier assignments (01-12 or L5) per DART category.
 *
 * Reference: /docs/reference/BAT_SYSTEM_GUIDE.md
 */

export enum DartCategoryCode {
  LUMBER = 1,
  STRUCTURAL_PANELS = 2,
  ENGINEERED_WOOD = 3,
  TRUSSES = 4,
  MILLWORK = 5,
  WINDOWS = 6,
  DOORS = 7,
  CABINETS_TOPS = 8,
  SIDING_MASONRY = 9,
  INSULATION = 10,
  ROOFING = 11,
  GYPSUM = 12,
  HARDWARE = 13,
  HOME_CENTER = 14,
  SPECIAL = 15,
}

export interface DartCategory {
  code: number;
  name: string;
  description: string;
  batCode: string; // Original BAT system code
}

export const DART_CATEGORIES: Record<number, DartCategory> = {
  1: {
    code: 1,
    name: 'Lumber',
    description: 'Dimensional lumber, boards',
    batCode: '01-Lumber',
  },
  2: {
    code: 2,
    name: 'Structural Panels',
    description: 'Plywood, OSB, sheathing',
    batCode: '02-StrctP',
  },
  3: {
    code: 3,
    name: 'Engineered Wood',
    description: 'I-joists, LVL, glulam',
    batCode: '03-EngWdP',
  },
  4: {
    code: 4,
    name: 'Trusses',
    description: 'Floor/roof trusses',
    batCode: '04-TrusWP',
  },
  5: {
    code: 5,
    name: 'Millwork',
    description: 'Trim, molding, millwork',
    batCode: '05-MilWrk',
  },
  6: {
    code: 6,
    name: 'Windows',
    description: 'Windows, skylights',
    batCode: '06-Window',
  },
  7: {
    code: 7,
    name: 'Doors',
    description: 'Entry, interior doors',
    batCode: '07-Doors',
  },
  8: {
    code: 8,
    name: 'Cabinets & Tops',
    description: 'Cabinets, countertops',
    batCode: '08-CabTop',
  },
  9: {
    code: 9,
    name: 'Siding & Masonry',
    description: 'Siding, masonry, concrete',
    batCode: '09-SidMCn',
  },
  10: {
    code: 10,
    name: 'Insulation',
    description: 'Insulation materials',
    batCode: '10-Insul',
  },
  11: {
    code: 11,
    name: 'Roofing',
    description: 'Shingles, underlayment',
    batCode: '11-Roofing',
  },
  12: {
    code: 12,
    name: 'Gypsum',
    description: 'Drywall, joint compound',
    batCode: '12-Gypsum',
  },
  13: {
    code: 13,
    name: 'Hardware',
    description: 'Hardware, fasteners',
    batCode: '13-Hrdwr',
  },
  14: {
    code: 14,
    name: 'Home Center',
    description: 'Home center items',
    batCode: '14-HomeCen',
  },
  15: {
    code: 15,
    name: 'Special Order',
    description: 'Special order (Random Lengths calculation)',
    batCode: 'special',
  },
};

/**
 * Get DART category by code
 */
export function getDartCategory(code: number): DartCategory | undefined {
  return DART_CATEGORIES[code];
}

/**
 * Get DART category code by BAT code string
 */
export function getDartCategoryByBatCode(batCode: string): DartCategory | undefined {
  return Object.values(DART_CATEGORIES).find((cat) => cat.batCode === batCode);
}

/**
 * Get all DART categories
 */
export function getAllDartCategories(): DartCategory[] {
  return Object.values(DART_CATEGORIES);
}

/**
 * Validate DART category code
 */
export function isValidDartCategory(code: number): boolean {
  return code >= 1 && code <= 15;
}

/**
 * Pricing Tier Definitions
 */
export type PricingTier = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | 'L5';

export interface TierInfo {
  tier: PricingTier;
  description: string;
  discountRange: string;
}

export const PRICING_TIERS: Record<PricingTier, TierInfo> = {
  '01': { tier: '01', description: 'List Price', discountRange: '0% (full price)' },
  '02': { tier: '02', description: 'Low Discount', discountRange: '~5-10%' },
  '03': { tier: '03', description: 'Low Discount', discountRange: '~10-15%' },
  '04': { tier: '04', description: 'Low Discount', discountRange: '~15%' },
  '05': { tier: '05', description: 'Medium Discount', discountRange: '~15-18%' },
  '06': { tier: '06', description: 'Medium Discount', discountRange: '~18-20%' },
  '07': { tier: '07', description: 'Medium Discount', discountRange: '~20-22%' },
  '08': { tier: '08', description: 'High Discount', discountRange: '~22-24%' },
  '09': { tier: '09', description: 'High Discount', discountRange: '~24-26%' },
  '10': { tier: '10', description: 'High Discount', discountRange: '~26-28%' },
  '11': { tier: '11', description: 'Maximum Discount', discountRange: '~28-29%' },
  '12': { tier: '12', description: 'Maximum Discount', discountRange: '~29-30%' },
  'L5': { tier: 'L5', description: 'Random Lengths Calculation', discountRange: 'Variable (commodity-based)' },
};

/**
 * Validate pricing tier
 */
export function isValidPricingTier(tier: string): tier is PricingTier {
  return tier in PRICING_TIERS;
}

/**
 * Get tier info
 */
export function getTierInfo(tier: PricingTier): TierInfo | undefined {
  return PRICING_TIERS[tier];
}

/**
 * Calculate price schedule column for a given tier (BAT System formula)
 * Formula: Column = 14 + (Tier × 3)
 * Example: Tier 09 → Column 14 + (9 × 3) = Column 41
 *
 * @param tier - Pricing tier (01-12)
 * @returns Column number in the price schedule, or null for L5 (Random Lengths)
 */
export function calculatePriceScheduleColumn(tier: PricingTier): number | null {
  if (tier === 'L5') {
    return null; // L5 uses Random Lengths calculation, not a column
  }

  const tierNumber = parseInt(tier, 10);
  return 14 + (tierNumber * 3);
}

/**
 * Location Codes
 */
export interface LocationInfo {
  code: string;
  name: string;
  state: string;
}

export const LOCATION_CODES: Record<string, LocationInfo> = {
  CLACORAD: { code: 'CLACORAD', name: 'Clackamas OR Yard', state: 'Oregon' },
  FOGRORYD: { code: 'FOGRORYD', name: 'Forest Grove OR Yard', state: 'Oregon' },
  TANGORYD: { code: 'TANGORYD', name: 'Tangent OR Yard', state: 'Oregon' },
  VANCWAYD: { code: 'VANCWAYD', name: 'Vancouver WA Yard', state: 'Washington' },
  LACEWACR: { code: 'LACEWACR', name: 'Credit Location', state: '' },
};

/**
 * Account Types
 */
export enum AccountType {
  MASTER = 'M',
  QUOTE = 'Q',
}

export interface AccountTypeInfo {
  code: string;
  description: string;
}

export const ACCOUNT_TYPES: Record<string, AccountTypeInfo> = {
  M: { code: 'M', description: 'Master Account (primary billing relationship)' },
  Q: { code: 'Q', description: 'Quote Account (temporary/bid pricing)' },
};
