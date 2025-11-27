/**
 * Pricing Engine API Routes
 *
 * Implements BAT System tier-based pricing calculations
 * Reference: /docs/reference/BAT_SYSTEM_GUIDE.md
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  calculateCustomerPrice,
  getPriceBreakdown,
  getCustomerTierAssignments,
  getCustomerTier,
} from '../services/pricingTier.service';
import { getAllDartCategories } from '../constants/dartCategories';

const router = Router();

/**
 * @route   GET /api/pricing/dart-categories
 * @desc    Get all DART category definitions
 * @access  Private (All authenticated users)
 */
router.get('/dart-categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = getAllDartCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching DART categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DART categories',
    });
  }
});

/**
 * @route   GET /api/pricing/customer/:customerId/tiers
 * @desc    Get all tier assignments for a customer
 * @access  Private (All authenticated users)
 */
router.get('/customer/:customerId/tiers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const effectiveDate = req.query.effectiveDate
      ? new Date(req.query.effectiveDate as string)
      : new Date();

    const tiers = await getCustomerTierAssignments(customerId, effectiveDate);

    res.json({
      success: true,
      data: {
        customerId,
        effectiveDate,
        tiers,
      },
    });
  } catch (error) {
    console.error('Error fetching customer tier assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer tier assignments',
    });
  }
});

/**
 * @route   GET /api/pricing/customer/:customerId/tier/:dartCategory
 * @desc    Get tier assignment for specific DART category
 * @access  Private (All authenticated users)
 */
router.get(
  '/customer/:customerId/tier/:dartCategory',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { customerId, dartCategory } = req.params;
      const effectiveDate = req.query.effectiveDate
        ? new Date(req.query.effectiveDate as string)
        : new Date();

      const tier = await getCustomerTier(customerId, parseInt(dartCategory, 10), effectiveDate);

      if (!tier) {
        return res.status(404).json({
          success: false,
          error: `No tier assignment found for customer ${customerId} in DART category ${dartCategory}`,
        });
      }

      res.json({
        success: true,
        data: tier,
      });
    } catch (error) {
      console.error('Error fetching customer tier:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer tier',
      });
    }
  }
);

/**
 * @route   POST /api/pricing/calculate
 * @desc    Calculate price for customer and material
 * @access  Private (All authenticated users)
 * @body    { customerId, materialId, quantity?, effectiveDate? }
 */
router.post('/calculate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { customerId, materialId, quantity = 1, effectiveDate } = req.body;

    if (!customerId || !materialId) {
      return res.status(400).json({
        success: false,
        error: 'customerId and materialId are required',
      });
    }

    const date = effectiveDate ? new Date(effectiveDate) : new Date();
    const calculation = await calculateCustomerPrice(customerId, materialId, quantity, date);

    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: 'Could not calculate price. Check that material has DART category and customer has tier assignment.',
      });
    }

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price',
    });
  }
});

/**
 * @route   POST /api/pricing/breakdown
 * @desc    Get detailed price breakdown with waste factor
 * @access  Private (All authenticated users)
 * @body    { customerId, materialId, quantity, wasteFactor?, effectiveDate? }
 */
router.post('/breakdown', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { customerId, materialId, quantity, wasteFactor = 0, effectiveDate } = req.body;

    if (!customerId || !materialId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'customerId, materialId, and quantity are required',
      });
    }

    const date = effectiveDate ? new Date(effectiveDate) : new Date();
    const breakdown = await getPriceBreakdown(
      customerId,
      materialId,
      quantity,
      wasteFactor,
      date
    );

    if (!breakdown.calculation) {
      return res.status(404).json({
        success: false,
        error: 'Could not calculate price breakdown. Check that material has DART category and customer has tier assignment.',
      });
    }

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    console.error('Error calculating price breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price breakdown',
    });
  }
});

/**
 * @route   POST /api/pricing/batch-calculate
 * @desc    Calculate prices for multiple materials
 * @access  Private (All authenticated users)
 * @body    { customerId, items: [{ materialId, quantity, wasteFactor? }], effectiveDate? }
 */
router.post('/batch-calculate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { customerId, items, effectiveDate } = req.body;

    if (!customerId || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'customerId and items array are required',
      });
    }

    const date = effectiveDate ? new Date(effectiveDate) : new Date();

    const results = await Promise.all(
      items.map(async (item: any) => {
        try {
          const breakdown = await getPriceBreakdown(
            customerId,
            item.materialId,
            item.quantity,
            item.wasteFactor || 0,
            date
          );
          return {
            materialId: item.materialId,
            success: !!breakdown.calculation,
            ...breakdown,
          };
        } catch (error) {
          return {
            materialId: item.materialId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const totalAmount = successful.reduce(
      (sum, r) => sum + ((r as any).pricing?.total || 0),
      0
    );

    res.json({
      success: true,
      data: {
        customerId,
        effectiveDate: date,
        totalItems: items.length,
        successCount: successful.length,
        failedCount: failed.length,
        totalAmount,
        results,
      },
    });
  } catch (error) {
    console.error('Error in batch calculate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate batch pricing',
    });
  }
});

export default router;
