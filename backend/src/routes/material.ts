import { Router, Request, Response } from 'express';
import { materialService } from '../services/material';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole, MaterialCategory } from '@prisma/client';

const router = Router();

// ====== MATERIAL ROUTES ======

/**
 * @route   POST /api/v1/materials
 * @desc    Create a new material
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const {
        sku,
        description,
        category,
        subcategory,
        dartCategory,
        dartCategoryName,
        unitOfMeasure,
        vendorCost,
        freight,
        isRLLinked,
        rlTag,
        isActive,
      } = req.body;

      // Validation
      if (!sku || sku.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Material SKU is required',
        });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Description is required',
        });
      }

      if (!category || !Object.values(MaterialCategory).includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Category is required. Valid categories: ${Object.values(MaterialCategory).join(', ')}`,
        });
      }

      if (!unitOfMeasure || unitOfMeasure.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Unit of measure is required',
        });
      }

      if (vendorCost === undefined || isNaN(parseFloat(vendorCost))) {
        return res.status(400).json({
          success: false,
          error: 'Valid vendor cost is required',
        });
      }

      const material = await materialService.createMaterial({
        sku: sku.trim(),
        description: description.trim(),
        category: category as MaterialCategory,
        subcategory: subcategory?.trim(),
        dartCategory: dartCategory ? parseInt(dartCategory) : undefined,
        dartCategoryName: dartCategoryName?.trim(),
        unitOfMeasure: unitOfMeasure.trim(),
        vendorCost: parseFloat(vendorCost),
        freight: freight ? parseFloat(freight) : undefined,
        isRLLinked: isRLLinked ?? false,
        rlTag: rlTag?.trim(),
        isActive,
      });

      res.status(201).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Create material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create material',
      });
    }
  }
);

/**
 * @route   GET /api/v1/materials
 * @desc    List materials with filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      category,
      dartCategory,
      isActive,
      isRLLinked,
      sortBy = 'sku',
      sortOrder = 'asc',
    } = req.query;

    const result = await materialService.listMaterials({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      category: category as MaterialCategory | undefined,
      dartCategory: dartCategory ? parseInt(dartCategory as string) : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isRLLinked: isRLLinked === 'true' ? true : isRLLinked === 'false' ? false : undefined,
      sortBy: sortBy as 'sku' | 'description' | 'category' | 'createdAt' | 'updatedAt' | 'vendorCost',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list materials',
    });
  }
});

/**
 * @route   GET /api/v1/materials/categories
 * @desc    Get material categories (enum values)
 * @access  Private
 */
router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = await materialService.getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
    });
  }
});

/**
 * @route   GET /api/v1/materials/stats
 * @desc    Get material statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await materialService.getMaterialStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

/**
 * @route   GET /api/v1/materials/rl-linked
 * @desc    Get Random Lengths linked materials
 * @access  Private
 */
router.get('/rl-linked', authenticateToken, async (req: Request, res: Response) => {
  try {
    const materials = await materialService.getRLLinkedMaterials();

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Get RL materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Random Lengths materials',
    });
  }
});

/**
 * @route   GET /api/v1/materials/dart-category/:dartCategory
 * @desc    Get materials by DART category
 * @access  Private
 */
router.get('/dart-category/:dartCategory', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { dartCategory } = req.params;

    const materials = await materialService.getMaterialsByDartCategory(parseInt(dartCategory));

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Get materials by DART category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get materials',
    });
  }
});

/**
 * @route   GET /api/v1/materials/sku/:sku
 * @desc    Get material by SKU
 * @access  Private
 */
router.get('/sku/:sku', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { includeRelations = 'false' } = req.query;

    const material = await materialService.getMaterialBySku(sku, includeRelations === 'true');

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('Get material by SKU error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get material',
    });
  }
});

/**
 * @route   GET /api/v1/materials/:id
 * @desc    Get material by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeRelations = 'false' } = req.query;

    const material = await materialService.getMaterialById(id, includeRelations === 'true');

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get material',
    });
  }
});

/**
 * @route   PUT /api/v1/materials/:id
 * @desc    Update material
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
        sku,
        description,
        category,
        subcategory,
        dartCategory,
        dartCategoryName,
        unitOfMeasure,
        vendorCost,
        freight,
        isRLLinked,
        rlTag,
        isActive,
      } = req.body;

      // Build update object (only include provided fields)
      const updateData: any = {};
      if (sku !== undefined) updateData.sku = sku.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (category !== undefined) updateData.category = category as MaterialCategory;
      if (subcategory !== undefined) updateData.subcategory = subcategory.trim();
      if (dartCategory !== undefined) updateData.dartCategory = parseInt(dartCategory);
      if (dartCategoryName !== undefined) updateData.dartCategoryName = dartCategoryName.trim();
      if (unitOfMeasure !== undefined) updateData.unitOfMeasure = unitOfMeasure.trim();
      if (vendorCost !== undefined) updateData.vendorCost = parseFloat(vendorCost);
      if (freight !== undefined) updateData.freight = parseFloat(freight);
      if (isRLLinked !== undefined) updateData.isRLLinked = isRLLinked;
      if (rlTag !== undefined) updateData.rlTag = rlTag.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      const material = await materialService.updateMaterial(id, updateData);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Update material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update material',
      });
    }
  }
);

/**
 * @route   POST /api/v1/materials/:id/deactivate
 * @desc    Deactivate material
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/deactivate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const material = await materialService.deactivateMaterial(id);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Deactivate material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate material',
      });
    }
  }
);

/**
 * @route   POST /api/v1/materials/:id/activate
 * @desc    Activate material
 * @access  Private (ADMIN)
 */
router.post(
  '/:id/activate',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const material = await materialService.activateMaterial(id);

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error('Activate material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate material',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/materials/:id
 * @desc    Delete material (hard delete - use with caution)
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await materialService.deleteMaterial(id);

      res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
      });
    } catch (error) {
      console.error('Delete material error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete material',
      });
    }
  }
);

export default router;
