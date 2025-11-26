/**
 * Pricing Tier Service
 *
 * Implements BAT System pricing tier calculations including:
 * - Tier-based pricing lookup
 * - Random Lengths commodity pricing
 * - Customer-specific tier assignments
 * - Price revision tracking
 *
 * Reference: /docs/reference/BAT_SYSTEM_GUIDE.md
 */

import { PrismaClient, Prisma } from '@prisma/client';
import {
  PricingTier,
  calculatePriceScheduleColumn,
  isValidPricingTier,
  DartCategoryCode,
  getDartCategory,
} from '../constants/dartCategories';

const prisma = new PrismaClient();

export interface TierPriceCalculation {
  materialId: string;
  customerId: string;
  dartCategory: number;
  tier: PricingTier;
  basePrice: number;
  finalPrice: number;
  calculationMethod: 'TIER_BASED' | 'RANDOM_LENGTHS' | 'OVERRIDE';
  priceColumn?: number | null;
  commodityFactor?: number;
  steps: PriceCalculationStep[];
}

export interface PriceCalculationStep {
  step: number;
  description: string;
  value: number;
  formula?: string;
}

export interface CustomerTierAssignment {
  customerId: string;
  dartCategory: number;
  dartCategoryName: string;
  tier: PricingTier;
  effectiveDate: Date;
  expirationDate?: Date | null;
}

/**
 * Get customer's tier assignment for a specific DART category
 */
export async function getCustomerTier(
  customerId: string,
  dartCategory: number,
  effectiveDate: Date = new Date()
): Promise<CustomerTierAssignment | null> {
  const tierAssignment = await prisma.customerPricingTier.findFirst({
    where: {
      customerId,
      dartCategory,
      effectiveDate: {
        lte: effectiveDate,
      },
      OR: [
        { expirationDate: null },
        { expirationDate: { gte: effectiveDate } },
      ],
    },
    orderBy: {
      effectiveDate: 'desc',
    },
  });

  if (!tierAssignment) {
    return null;
  }

  return {
    customerId: tierAssignment.customerId,
    dartCategory: tierAssignment.dartCategory,
    dartCategoryName: tierAssignment.dartCategoryName,
    tier: tierAssignment.tier as PricingTier,
    effectiveDate: tierAssignment.effectiveDate,
    expirationDate: tierAssignment.expirationDate,
  };
}

/**
 * Get all tier assignments for a customer
 */
export async function getCustomerTierAssignments(
  customerId: string,
  effectiveDate: Date = new Date()
): Promise<CustomerTierAssignment[]> {
  const tierAssignments = await prisma.customerPricingTier.findMany({
    where: {
      customerId,
      effectiveDate: {
        lte: effectiveDate,
      },
      OR: [
        { expirationDate: null },
        { expirationDate: { gte: effectiveDate } },
      ],
    },
    orderBy: {
      dartCategory: 'asc',
    },
  });

  return tierAssignments.map((assignment) => ({
    customerId: assignment.customerId,
    dartCategory: assignment.dartCategory,
    dartCategoryName: assignment.dartCategoryName,
    tier: assignment.tier as PricingTier,
    effectiveDate: assignment.effectiveDate,
    expirationDate: assignment.expirationDate,
  }));
}

/**
 * Get material price for a specific tier
 */
export async function getMaterialPriceForTier(
  materialId: string,
  tier: PricingTier,
  effectiveDate: Date = new Date()
): Promise<number | null> {
  // Get the latest price revision for this material
  const priceRevision = await prisma.priceRevision.findFirst({
    where: {
      materialId,
      effectiveDate: {
        lte: effectiveDate,
      },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: effectiveDate } },
      ],
    },
    orderBy: {
      effectiveDate: 'desc',
    },
  });

  if (!priceRevision) {
    return null;
  }

  // Extract tier price from JSON
  const tierPrices = priceRevision.tierPrices as Prisma.JsonObject;
  const price = tierPrices[tier];

  if (typeof price === 'number') {
    return price;
  }

  if (tier === 'L5') {
    // L5 requires Random Lengths calculation
    return null; // Handled by calculateRandomLengthsPrice
  }

  return null;
}

/**
 * Calculate price for a customer and material
 */
export async function calculateCustomerPrice(
  customerId: string,
  materialId: string,
  quantity: number = 1,
  effectiveDate: Date = new Date()
): Promise<TierPriceCalculation | null> {
  const steps: PriceCalculationStep[] = [];

  // Step 1: Get material details
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      priceRevisions: {
        where: {
          effectiveDate: {
            lte: effectiveDate,
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: effectiveDate } },
          ],
        },
        orderBy: {
          effectiveDate: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!material || !material.dartCategory) {
    return null;
  }

  steps.push({
    step: 1,
    description: `Material: ${material.description} (SKU: ${material.sku})`,
    value: 0,
  });

  // Step 2: Get customer tier assignment for this DART category
  const tierAssignment = await getCustomerTier(
    customerId,
    material.dartCategory,
    effectiveDate
  );

  if (!tierAssignment) {
    return null;
  }

  const dartCategoryInfo = getDartCategory(material.dartCategory);
  steps.push({
    step: 2,
    description: `DART Category: ${dartCategoryInfo?.name} (${material.dartCategoryName})`,
    value: material.dartCategory,
  });

  steps.push({
    step: 3,
    description: `Customer Tier: ${tierAssignment.tier}`,
    value: parseInt(tierAssignment.tier, 10) || 0,
  });

  // Step 3: Check for customer-specific pricing override
  const customerPricing = await prisma.customerPricing.findUnique({
    where: {
      customerId_materialId: {
        customerId,
        materialId,
      },
    },
  });

  if (customerPricing && customerPricing.overridePrice) {
    const finalPrice = customerPricing.overridePrice.toNumber();
    steps.push({
      step: 4,
      description: 'Customer-specific override price',
      value: finalPrice,
    });

    return {
      materialId,
      customerId,
      dartCategory: material.dartCategory,
      tier: tierAssignment.tier,
      basePrice: material.vendorCost.toNumber(),
      finalPrice,
      calculationMethod: 'OVERRIDE',
      steps,
    };
  }

  // Step 4: Calculate tier-based price
  if (tierAssignment.tier === 'L5') {
    // Random Lengths calculation
    const rlPrice = await calculateRandomLengthsPrice(material, effectiveDate);
    if (!rlPrice) {
      return null;
    }

    steps.push({
      step: 4,
      description: 'Random Lengths commodity price',
      value: rlPrice,
      formula: 'RL Base Price × Commodity Factor',
    });

    return {
      materialId,
      customerId,
      dartCategory: material.dartCategory,
      tier: tierAssignment.tier,
      basePrice: material.vendorCost.toNumber(),
      finalPrice: rlPrice,
      calculationMethod: 'RANDOM_LENGTHS',
      commodityFactor: material.priceRevisions[0]?.commodityFactor?.toNumber(),
      steps,
    };
  }

  // Standard tier-based pricing
  const tierPrice = await getMaterialPriceForTier(
    materialId,
    tierAssignment.tier,
    effectiveDate
  );

  if (!tierPrice) {
    return null;
  }

  const priceColumn = calculatePriceScheduleColumn(tierAssignment.tier);
  steps.push({
    step: 4,
    description: `Tier ${tierAssignment.tier} price (Column ${priceColumn})`,
    value: tierPrice,
    formula: `Column = 14 + (${parseInt(tierAssignment.tier, 10)} × 3) = ${priceColumn}`,
  });

  return {
    materialId,
    customerId,
    dartCategory: material.dartCategory,
    tier: tierAssignment.tier,
    basePrice: material.vendorCost.toNumber(),
    finalPrice: tierPrice,
    calculationMethod: 'TIER_BASED',
    priceColumn,
    steps,
  };
}

/**
 * Calculate Random Lengths commodity-based price
 */
async function calculateRandomLengthsPrice(
  material: any,
  effectiveDate: Date
): Promise<number | null> {
  if (!material.isRLLinked || !material.rlTag) {
    return null;
  }

  // Get latest Random Lengths pricing
  const rlPricing = await prisma.randomLengthsPricing.findFirst({
    where: {
      tag: material.rlTag,
      effectiveDate: {
        lte: effectiveDate,
      },
    },
    orderBy: {
      effectiveDate: 'desc',
    },
  });

  if (!rlPricing) {
    return material.rlBasePrice?.toNumber() || null;
  }

  // Apply commodity factor if available
  const basePrice = rlPricing.price.toNumber();
  const latestRevision = material.priceRevisions[0];
  const commodityFactor = latestRevision?.commodityFactor?.toNumber() || 1.0;

  return basePrice * commodityFactor;
}

/**
 * Calculate total with waste factor
 */
export function calculateTotalWithWaste(
  unitPrice: number,
  quantity: number,
  wasteFactor: number = 0
): { subtotal: number; waste: number; total: number } {
  const subtotal = unitPrice * quantity;
  const waste = subtotal * (wasteFactor / 100);
  const total = subtotal + waste;

  return {
    subtotal,
    waste,
    total,
  };
}

/**
 * Get price breakdown for transparency
 */
export async function getPriceBreakdown(
  customerId: string,
  materialId: string,
  quantity: number,
  wasteFactor: number = 0,
  effectiveDate: Date = new Date()
): Promise<{
  calculation: TierPriceCalculation | null;
  pricing: {
    unitPrice: number;
    quantity: number;
    subtotal: number;
    wasteFactor: number;
    wasteAmount: number;
    total: number;
  } | null;
}> {
  const calculation = await calculateCustomerPrice(
    customerId,
    materialId,
    quantity,
    effectiveDate
  );

  if (!calculation) {
    return { calculation: null, pricing: null };
  }

  const totals = calculateTotalWithWaste(
    calculation.finalPrice,
    quantity,
    wasteFactor
  );

  return {
    calculation,
    pricing: {
      unitPrice: calculation.finalPrice,
      quantity,
      subtotal: totals.subtotal,
      wasteFactor,
      wasteAmount: totals.waste,
      total: totals.total,
    },
  };
}

/**
 * Create price revision
 */
export async function createPriceRevision(
  materialId: string,
  tierPrices: Record<PricingTier, number | string>,
  vendorCost: number,
  freight: number,
  baseMargin: number,
  revisionType: string,
  changedBy?: string,
  changeReason?: string,
  effectiveDate: Date = new Date(),
  expiresAt?: Date
): Promise<any> {
  // Get latest revision number
  const latestRevision = await prisma.priceRevision.findFirst({
    where: { materialId },
    orderBy: { revisionNumber: 'desc' },
  });

  const revisionNumber = (latestRevision?.revisionNumber || 0) + 1;

  return prisma.priceRevision.create({
    data: {
      materialId,
      revisionNumber,
      revisionType,
      tierPrices,
      vendorCost,
      freight,
      baseMargin,
      effectiveDate,
      expiresAt,
      changedBy,
      changeReason,
    },
  });
}

/**
 * Bulk update customer tier assignments
 */
export async function updateCustomerTiers(
  customerId: string,
  tiers: Array<{
    dartCategory: number;
    dartCategoryName: string;
    tier: PricingTier;
  }>,
  effectiveDate: Date = new Date()
): Promise<void> {
  // Expire existing tiers
  await prisma.customerPricingTier.updateMany({
    where: {
      customerId,
      expirationDate: null,
    },
    data: {
      expirationDate: effectiveDate,
    },
  });

  // Create new tier assignments
  await prisma.customerPricingTier.createMany({
    data: tiers.map((tier) => ({
      customerId,
      dartCategory: tier.dartCategory,
      dartCategoryName: tier.dartCategoryName,
      tier: tier.tier,
      effectiveDate,
    })),
  });
}

export default {
  getCustomerTier,
  getCustomerTierAssignments,
  getMaterialPriceForTier,
  calculateCustomerPrice,
  calculateTotalWithWaste,
  getPriceBreakdown,
  createPriceRevision,
  updateCustomerTiers,
};
