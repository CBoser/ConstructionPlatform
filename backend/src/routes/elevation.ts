import { Router, Request, Response } from 'express';
import { elevationService } from '../services/elevation';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router({ mergeParams: true }); // mergeParams to access planId from parent router

// ====== ELEVATION ROUTES ======

/**
 * @route   POST /api/v1/plans/:planId/elevations
 * @desc    Create a new elevation for a plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const {
        code,
        name,
        description,
        architectDesigner,
        architectDesignerDate,
        structuralEngineer,
        structuralEngineerDate,
        iJoistCompany,
        iJoistCompanyDate,
        floorTrussCompany,
        floorTrussCompanyDate,
        roofTrussCompany,
        roofTrussCompanyDate,
        customDetails,
      } = req.body;

      // Validation
      if (!code || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Elevation code is required',
        });
      }

      const elevation = await elevationService.createElevation({
        planId,
        code: code.trim(),
        name: name?.trim(),
        description: description?.trim(),
        architectDesigner: architectDesigner?.trim(),
        architectDesignerDate: architectDesignerDate ? new Date(architectDesignerDate) : undefined,
        structuralEngineer: structuralEngineer?.trim(),
        structuralEngineerDate: structuralEngineerDate ? new Date(structuralEngineerDate) : undefined,
        iJoistCompany: iJoistCompany?.trim(),
        iJoistCompanyDate: iJoistCompanyDate ? new Date(iJoistCompanyDate) : undefined,
        floorTrussCompany: floorTrussCompany?.trim(),
        floorTrussCompanyDate: floorTrussCompanyDate ? new Date(floorTrussCompanyDate) : undefined,
        roofTrussCompany: roofTrussCompany?.trim(),
        roofTrussCompanyDate: roofTrussCompanyDate ? new Date(roofTrussCompanyDate) : undefined,
        customDetails,
      });

      res.status(201).json({
        success: true,
        data: elevation,
        message: 'Elevation created successfully',
      });
    } catch (error) {
      console.error('Create elevation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create elevation',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/elevations
 * @desc    List elevations for a plan
 * @access  Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    const elevations = await elevationService.listElevationsByPlanId(planId);

    res.status(200).json({
      success: true,
      data: elevations,
    });
  } catch (error) {
    console.error('List elevations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list elevations',
    });
  }
});

/**
 * @route   GET /api/v1/plans/:planId/elevations/:elevationId
 * @desc    Get elevation by ID
 * @access  Private
 */
router.get('/:elevationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { elevationId } = req.params;

    const elevation = await elevationService.getElevationById(elevationId);

    if (!elevation) {
      return res.status(404).json({
        success: false,
        error: 'Elevation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: elevation,
    });
  } catch (error) {
    console.error('Get elevation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get elevation',
    });
  }
});

/**
 * @route   PUT /api/v1/plans/:planId/elevations/:elevationId
 * @desc    Update elevation
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:elevationId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { elevationId } = req.params;
      const {
        code,
        name,
        description,
        architectDesigner,
        architectDesignerDate,
        structuralEngineer,
        structuralEngineerDate,
        iJoistCompany,
        iJoistCompanyDate,
        floorTrussCompany,
        floorTrussCompanyDate,
        roofTrussCompany,
        roofTrussCompanyDate,
        customDetails,
        changeNotes,
      } = req.body;

      // Build update object
      const updateData: any = {};
      if (code !== undefined) updateData.code = code.trim();
      if (name !== undefined) updateData.name = name?.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (architectDesigner !== undefined) updateData.architectDesigner = architectDesigner?.trim();
      if (architectDesignerDate !== undefined)
        updateData.architectDesignerDate = architectDesignerDate ? new Date(architectDesignerDate) : null;
      if (structuralEngineer !== undefined) updateData.structuralEngineer = structuralEngineer?.trim();
      if (structuralEngineerDate !== undefined)
        updateData.structuralEngineerDate = structuralEngineerDate ? new Date(structuralEngineerDate) : null;
      if (iJoistCompany !== undefined) updateData.iJoistCompany = iJoistCompany?.trim();
      if (iJoistCompanyDate !== undefined)
        updateData.iJoistCompanyDate = iJoistCompanyDate ? new Date(iJoistCompanyDate) : null;
      if (floorTrussCompany !== undefined) updateData.floorTrussCompany = floorTrussCompany?.trim();
      if (floorTrussCompanyDate !== undefined)
        updateData.floorTrussCompanyDate = floorTrussCompanyDate ? new Date(floorTrussCompanyDate) : null;
      if (roofTrussCompany !== undefined) updateData.roofTrussCompany = roofTrussCompany?.trim();
      if (roofTrussCompanyDate !== undefined)
        updateData.roofTrussCompanyDate = roofTrussCompanyDate ? new Date(roofTrussCompanyDate) : null;
      if (customDetails !== undefined) updateData.customDetails = customDetails;
      if (changeNotes !== undefined) updateData.changeNotes = changeNotes;

      const elevation = await elevationService.updateElevation(elevationId, updateData);

      res.status(200).json({
        success: true,
        data: elevation,
        message: 'Elevation updated successfully',
      });
    } catch (error) {
      console.error('Update elevation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update elevation',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/plans/:planId/elevations/:elevationId
 * @desc    Delete elevation
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:elevationId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { elevationId } = req.params;

      await elevationService.deleteElevation(elevationId);

      res.status(200).json({
        success: true,
        message: 'Elevation deleted successfully',
      });
    } catch (error) {
      console.error('Delete elevation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete elevation',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/elevations/:elevationId/versions
 * @desc    Get elevation version history
 * @access  Private
 */
router.get('/:elevationId/versions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { elevationId } = req.params;

    const versions = await elevationService.getVersionHistory(elevationId);

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('Get elevation versions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get elevation version history',
    });
  }
});

export default router;
