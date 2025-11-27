import { Router, Request, Response } from 'express';
import { planService } from '../services/plan';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole, PlanType } from '@prisma/client';
import documentRoutes from './document';
import elevationRoutes from './elevation';
import optionRoutes from './option';

const router = Router();

// ====== PLAN ROUTES ======

/**
 * @route   POST /api/v1/plans
 * @desc    Create a new plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const {
        code,
        name,
        type,
        builderId,
        sqft,
        bedrooms,
        bathrooms,
        garage,
        style,
        pdssUrl,
        notes,
        isActive,
      } = req.body;

      // Validation
      if (!code || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Plan code is required',
        });
      }

      if (!type || !Object.values(PlanType).includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Plan type is required. Valid types: ${Object.values(PlanType).join(', ')}`,
        });
      }

      const plan = await planService.createPlan({
        code: code.trim(),
        name: name?.trim(),
        type: type as PlanType,
        builderId: builderId?.trim(),
        sqft: sqft ? parseInt(sqft) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
        garage: garage?.trim(),
        style: style?.trim(),
        pdssUrl: pdssUrl?.trim(),
        notes: notes?.trim(),
        isActive,
      });

      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Create plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create plan',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans
 * @desc    List plans with filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      type,
      builderId,
      isActive,
      sortBy = 'code',
      sortOrder = 'asc',
    } = req.query;

    const result = await planService.listPlans({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      type: type as PlanType | undefined,
      builderId: builderId as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as 'code' | 'name' | 'createdAt' | 'updatedAt' | 'sqft',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list plans',
    });
  }
});

/**
 * @route   GET /api/v1/plans/stats
 * @desc    Get aggregate plan statistics for dashboard
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await planService.getAggregateStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get plan aggregate stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan statistics',
    });
  }
});

/**
 * @route   GET /api/v1/plans/code/:code
 * @desc    Get plan by code
 * @access  Private
 */
router.get('/code/:code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { includeRelations = 'false' } = req.query;

    const plan = await planService.getPlanByCode(code, includeRelations === 'true');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan by code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan',
    });
  }
});

/**
 * @route   GET /api/v1/plans/:id
 * @desc    Get plan by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeRelations = 'false' } = req.query;

    const plan = await planService.getPlanById(id, includeRelations === 'true');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan',
    });
  }
});

/**
 * @route   GET /api/v1/plans/:id/stats
 * @desc    Get plan statistics
 * @access  Private
 */
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await planService.getPlanStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get plan stats error:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get plan statistics',
    });
  }
});

/**
 * @route   PUT /api/v1/plans/:id
 * @desc    Update plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        code,
        name,
        type,
        builderId,
        sqft,
        bedrooms,
        bathrooms,
        garage,
        style,
        pdssUrl,
        notes,
        isActive,
      } = req.body;

      // Build update object (only include provided fields)
      const updateData: any = {};
      if (code !== undefined) updateData.code = code.trim();
      if (name !== undefined) updateData.name = name.trim();
      if (type !== undefined) updateData.type = type as PlanType;
      if (builderId !== undefined) updateData.builderId = builderId?.trim() || null;
      if (sqft !== undefined) updateData.sqft = parseInt(sqft);
      if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
      if (bathrooms !== undefined) updateData.bathrooms = parseFloat(bathrooms);
      if (garage !== undefined) updateData.garage = garage.trim();
      if (style !== undefined) updateData.style = style.trim();
      if (pdssUrl !== undefined) updateData.pdssUrl = pdssUrl.trim();
      if (notes !== undefined) updateData.notes = notes.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      const plan = await planService.updatePlan(id, updateData);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Update plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update plan',
      });
    }
  }
);

/**
 * @route   POST /api/v1/plans/:id/deactivate
 * @desc    Deactivate plan
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/deactivate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const plan = await planService.deactivatePlan(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Deactivate plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate plan',
      });
    }
  }
);

/**
 * @route   POST /api/v1/plans/:id/activate
 * @desc    Activate plan
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/activate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const plan = await planService.activatePlan(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Activate plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate plan',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/plans/:id
 * @desc    Delete plan (hard delete - use with caution)
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await planService.deletePlan(id);

      res.status(200).json({
        success: true,
        message: 'Plan deleted successfully',
      });
    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete plan',
      });
    }
  }
);

// ====== TEMPLATE ITEM ROUTES ======

/**
 * @route   POST /api/v1/plans/:planId/items
 * @desc    Add template item to plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:planId/items',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const { materialId, category, subcategory, quantity, unit, wasteFactor, notes } = req.body;

      // Validation
      if (!materialId || materialId.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Material ID is required',
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      if (!quantity || isNaN(parseFloat(quantity))) {
        return res.status(400).json({
          success: false,
          error: 'Valid quantity is required',
        });
      }

      if (!unit || unit.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Unit is required',
        });
      }

      const item = await planService.createTemplateItem({
        planId,
        materialId: materialId.trim(),
        category: category.trim(),
        subcategory: subcategory?.trim(),
        quantity: parseFloat(quantity),
        unit: unit.trim(),
        wasteFactor: wasteFactor ? parseFloat(wasteFactor) : undefined,
        notes: notes?.trim(),
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Create template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template item',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/items
 * @desc    List template items for a plan
 * @access  Private
 */
router.get('/:planId/items', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const items = await planService.listTemplateItems(planId);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('List template items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list template items',
    });
  }
});

/**
 * @route   GET /api/v1/plans/items/:itemId
 * @desc    Get template item by ID
 * @access  Private
 */
router.get('/items/:itemId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await planService.getTemplateItemById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Template item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get template item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get template item',
    });
  }
});

/**
 * @route   PUT /api/v1/plans/items/:itemId
 * @desc    Update template item
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/items/:itemId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { quantity, unit, wasteFactor, subcategory, notes } = req.body;

      // Build update object
      const updateData: any = {};
      if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
      if (unit !== undefined) updateData.unit = unit.trim();
      if (wasteFactor !== undefined) updateData.wasteFactor = parseFloat(wasteFactor);
      if (subcategory !== undefined) updateData.subcategory = subcategory.trim();
      if (notes !== undefined) updateData.notes = notes.trim();

      const item = await planService.updateTemplateItem(itemId, updateData);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Update template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template item',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/plans/items/:itemId
 * @desc    Delete template item
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/items/:itemId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;

      await planService.deleteTemplateItem(itemId);

      res.status(200).json({
        success: true,
        message: 'Template item deleted successfully',
      });
    } catch (error) {
      console.error('Delete template item error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template item',
      });
    }
  }
);

// ====== EXPORT ROUTES ======

/**
 * @route   GET /api/v1/plans/export-all
 * @desc    Export all plans to Excel (returns JSON that frontend will use to generate Excel)
 * @access  Private
 */
router.get('/export-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    // Fetch all plans with related data
    const result = await planService.listPlans({
      page: 1,
      limit: 10000, // Get all plans
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: 'code',
      sortOrder: 'asc',
    });

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Plans data ready for export',
    });
  } catch (error) {
    console.error('Export all plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export plans',
    });
  }
});

// ====== NESTED ROUTES ======
router.use('/:planId/elevations', elevationRoutes);
router.use('/:planId/options', optionRoutes);
router.use('/', documentRoutes);

export default router;
