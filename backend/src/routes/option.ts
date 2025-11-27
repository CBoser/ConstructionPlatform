import { Router, Request, Response } from 'express';
import { optionService } from '../services/option';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole, OptionCategory } from '@prisma/client';

const router = Router({ mergeParams: true }); // mergeParams to access planId from parent router

// ====== ASSIGNED OPTION ROUTES ======

/**
 * @route   POST /api/v1/plans/:planId/options
 * @desc    Create a new assigned option for a plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const { elevationId, name, description, category, estimatedCost, notes, isStandard } = req.body;

      // Validation
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Option name is required',
        });
      }

      const option = await optionService.createAssignedOption({
        planId,
        elevationId,
        name: name.trim(),
        description: description?.trim(),
        category: category as OptionCategory,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        notes: notes?.trim(),
        isStandard,
      });

      res.status(201).json({
        success: true,
        data: option,
        message: 'Option created successfully',
      });
    } catch (error) {
      console.error('Create option error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create option',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/options
 * @desc    List assigned options for a plan
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const options = await optionService.listAssignedOptions(planId);

    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error('List options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list options',
    });
  }
});

/**
 * @route   GET /api/v1/plans/:planId/options/:optionId
 * @desc    Get assigned option by ID
 * @access  Private
 */
router.get('/:optionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { optionId } = req.params;

    const option = await optionService.getAssignedOptionById(optionId);

    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Option not found',
      });
    }

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error('Get option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get option',
    });
  }
});

/**
 * @route   PUT /api/v1/plans/:planId/options/:optionId
 * @desc    Update assigned option
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:optionId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { optionId } = req.params;
      const { name, description, category, estimatedCost, notes, isStandard } = req.body;

      // Build update object
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (category !== undefined) updateData.category = category as OptionCategory;
      if (estimatedCost !== undefined) updateData.estimatedCost = parseFloat(estimatedCost);
      if (notes !== undefined) updateData.notes = notes?.trim();
      if (isStandard !== undefined) updateData.isStandard = isStandard;

      const option = await optionService.updateAssignedOption(optionId, updateData);

      res.status(200).json({
        success: true,
        data: option,
        message: 'Option updated successfully',
      });
    } catch (error) {
      console.error('Update option error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update option',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/plans/:planId/options/:optionId
 * @desc    Delete assigned option
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.delete(
  '/:optionId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { optionId } = req.params;

      await optionService.deleteAssignedOption(optionId);

      res.status(200).json({
        success: true,
        message: 'Option deleted successfully',
      });
    } catch (error) {
      console.error('Delete option error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete option',
      });
    }
  }
);

export default router;
