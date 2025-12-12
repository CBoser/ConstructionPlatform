/**
 * Feedback Routes
 *
 * API endpoints for the feedback and learning system.
 * Captures user feedback, variance reports, and tracks patterns for improvement.
 *
 * Routes:
 * - GET    /feedback              - List feedback with filters
 * - GET    /feedback/dashboard    - Get feedback dashboard stats
 * - GET    /feedback/patterns     - Get detected patterns
 * - GET    /feedback/variance     - Get variance summaries
 * - GET    /feedback/:id          - Get single feedback
 * - POST   /feedback              - Submit new feedback
 * - POST   /feedback/quick        - Quick thumbs up/down feedback
 * - POST   /feedback/variance     - Submit variance report
 * - PUT    /feedback/:id          - Update feedback
 * - PUT    /feedback/:id/resolve  - Resolve feedback
 * - POST   /feedback/:id/respond  - Add response to feedback
 * - DELETE /feedback/:id          - Delete feedback
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const FeedbackTypeEnum = z.enum([
  'VARIANCE_REPORT',
  'QUALITY_ISSUE',
  'PROCESS_FAILURE',
  'SUGGESTION',
  'CORRECTION',
  'THUMBS_UP',
  'THUMBS_DOWN',
]);

const FeedbackCategoryEnum = z.enum([
  'MATERIAL',
  'TIMING',
  'DOCUMENT',
  'ESTIMATE',
  'IMPORT',
  'AGENT',
  'UI_UX',
  'OTHER',
]);

const FeedbackStatusEnum = z.enum([
  'NEW',
  'REVIEWED',
  'IN_PROGRESS',
  'RESOLVED',
  'DISMISSED',
  'DEFERRED',
]);

const CreateFeedbackSchema = z.object({
  feedbackType: FeedbackTypeEnum,
  category: FeedbackCategoryEnum.optional().default('OTHER'),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  entityName: z.string().optional(),
  rating: z.number().min(-1).max(5).optional(),
  estimatedValue: z.number().optional(),
  actualValue: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  context: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
});

const QuickFeedbackSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  entityName: z.string().optional(),
  isPositive: z.boolean(), // true = thumbs up, false = thumbs down
  category: FeedbackCategoryEnum.optional().default('OTHER'),
  notes: z.string().optional(),
});

const VarianceReportSchema = z.object({
  entityType: z.string().min(1), // "Job", "Estimate"
  entityId: z.string().min(1),
  entityName: z.string().optional(),
  category: FeedbackCategoryEnum.optional().default('MATERIAL'),
  estimatedValue: z.number(),
  actualValue: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  context: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateFeedbackSchema = z.object({
  category: FeedbackCategoryEnum.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: FeedbackStatusEnum.optional(),
});

const ResolveFeedbackSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED', 'DEFERRED']),
  actionTaken: z.string().optional(),
});

const FeedbackResponseSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().optional().default(false),
});

const FeedbackListQuerySchema = z.object({
  feedbackType: FeedbackTypeEnum.optional(),
  category: FeedbackCategoryEnum.optional(),
  status: FeedbackStatusEnum.optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'rating', 'variancePercent']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateVariance(estimated: number, actual: number): { amount: number; percent: number } {
  const amount = actual - estimated;
  const percent = estimated !== 0 ? ((amount / estimated) * 100) : 0;
  return { amount, percent: Math.round(percent * 100) / 100 };
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /feedback/dashboard
 * Get feedback dashboard statistics
 */
router.get('/dashboard', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get counts by status
    const statusCounts = await db.feedback.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get counts by type (last 30 days)
    const typeCounts = await db.feedback.groupBy({
      by: ['feedbackType'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    });

    // Get counts by category (last 30 days)
    const categoryCounts = await db.feedback.groupBy({
      by: ['category'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    });

    // Get variance statistics
    const varianceStats = await db.feedback.aggregate({
      where: {
        feedbackType: 'VARIANCE_REPORT',
        variancePercent: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      _avg: { variancePercent: true },
      _count: { id: true },
    });

    // Get recent feedback
    const recentFeedback = await db.feedback.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Get top patterns
    const patterns = await db.feedbackPattern.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { occurrenceCount: 'desc' },
    });

    // Calculate thumbs up/down ratio
    const thumbsUp = await db.feedback.count({
      where: { feedbackType: 'THUMBS_UP', createdAt: { gte: sevenDaysAgo } },
    });
    const thumbsDown = await db.feedback.count({
      where: { feedbackType: 'THUMBS_DOWN', createdAt: { gte: sevenDaysAgo } },
    });

    res.json({
      summary: {
        total: statusCounts.reduce((sum, s) => sum + s._count.id, 0),
        new: statusCounts.find(s => s.status === 'NEW')?._count.id || 0,
        inProgress: statusCounts.find(s => s.status === 'IN_PROGRESS')?._count.id || 0,
        resolved: statusCounts.find(s => s.status === 'RESOLVED')?._count.id || 0,
        dismissed: statusCounts.find(s => s.status === 'DISMISSED')?._count.id || 0,
      },
      byType: typeCounts.reduce((acc, t) => {
        acc[t.feedbackType] = t._count.id;
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryCounts.reduce((acc, c) => {
        acc[c.category] = c._count.id;
        return acc;
      }, {} as Record<string, number>),
      variance: {
        avgVariancePercent: varianceStats._avg.variancePercent
          ? Number(varianceStats._avg.variancePercent).toFixed(2)
          : null,
        reportCount: varianceStats._count.id,
      },
      satisfaction: {
        thumbsUp,
        thumbsDown,
        ratio: thumbsUp + thumbsDown > 0
          ? Math.round((thumbsUp / (thumbsUp + thumbsDown)) * 100)
          : null,
      },
      recentFeedback,
      topPatterns: patterns,
    });
  } catch (error) {
    console.error('[Feedback] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get feedback dashboard' });
  }
});

/**
 * GET /feedback/patterns
 * Get detected patterns
 */
router.get('/patterns', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { entityType, isActive } = req.query;

    const where: Prisma.FeedbackPatternWhereInput = {};
    if (entityType) where.entityType = entityType as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const patterns = await db.feedbackPattern.findMany({
      where,
      orderBy: [{ occurrenceCount: 'desc' }, { totalImpact: 'desc' }],
      take: 50,
    });

    res.json(patterns);
  } catch (error) {
    console.error('[Feedback] Patterns error:', error);
    res.status(500).json({ error: 'Failed to get patterns' });
  }
});

/**
 * GET /feedback/variance
 * Get variance summaries
 */
router.get('/variance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { periodType, entityType, limit } = req.query;

    const where: Prisma.VarianceSummaryWhereInput = {};
    if (periodType) where.periodType = periodType as string;
    if (entityType) where.entityType = entityType as string;

    const summaries = await db.varianceSummary.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: Number(limit) || 30,
    });

    res.json(summaries);
  } catch (error) {
    console.error('[Feedback] Variance error:', error);
    res.status(500).json({ error: 'Failed to get variance summaries' });
  }
});

/**
 * GET /feedback
 * List feedback with filters
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const query = FeedbackListQuerySchema.parse(req.query);
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FeedbackWhereInput = {};

    if (filters.feedbackType) where.feedbackType = filters.feedbackType;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [items, total] = await Promise.all([
      db.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          resolvedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { responses: true } },
        },
      }),
      db.feedback.count({ where }),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Feedback] List error:', error);
    res.status(500).json({ error: 'Failed to list feedback' });
  }
});

/**
 * GET /feedback/:id
 * Get single feedback with details
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const feedback = await db.feedback.findUnique({
      where: { id: req.params.id },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        resolvedBy: { select: { id: true, firstName: true, lastName: true } },
        responses: {
          include: {
            responder: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        patterns: true,
      },
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('[Feedback] Get error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

/**
 * POST /feedback
 * Submit new feedback
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = CreateFeedbackSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const data = validation.data;
    const userId = (req as any).user?.id;

    // Calculate variance if applicable
    let varianceAmount: number | undefined;
    let variancePercent: number | undefined;

    if (data.estimatedValue !== undefined && data.actualValue !== undefined) {
      const variance = calculateVariance(data.estimatedValue, data.actualValue);
      varianceAmount = variance.amount;
      variancePercent = variance.percent;
    }

    const feedback = await db.feedback.create({
      data: {
        feedbackType: data.feedbackType,
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        rating: data.rating,
        estimatedValue: data.estimatedValue,
        actualValue: data.actualValue,
        varianceAmount,
        variancePercent,
        title: data.title,
        description: data.description,
        notes: data.notes,
        context: data.context,
        tags: data.tags || [],
        source: data.source || 'web',
        submittedById: userId,
      },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('[Feedback] Create error:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

/**
 * POST /feedback/quick
 * Quick thumbs up/down feedback
 */
router.post('/quick', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = QuickFeedbackSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const data = validation.data;
    const userId = (req as any).user?.id;

    const feedback = await db.feedback.create({
      data: {
        feedbackType: data.isPositive ? 'THUMBS_UP' : 'THUMBS_DOWN',
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        rating: data.isPositive ? 1 : -1,
        notes: data.notes,
        source: 'web',
        submittedById: userId,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('[Feedback] Quick feedback error:', error);
    res.status(500).json({ error: 'Failed to submit quick feedback' });
  }
});

/**
 * POST /feedback/variance
 * Submit variance report
 */
router.post('/variance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = VarianceReportSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const data = validation.data;
    const userId = (req as any).user?.id;

    const variance = calculateVariance(data.estimatedValue, data.actualValue);

    const feedback = await db.feedback.create({
      data: {
        feedbackType: 'VARIANCE_REPORT',
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        estimatedValue: data.estimatedValue,
        actualValue: data.actualValue,
        varianceAmount: variance.amount,
        variancePercent: variance.percent,
        title: data.title || `Variance Report: ${data.entityName || data.entityId}`,
        description: data.description,
        context: data.context,
        tags: data.tags || [],
        source: 'web',
        submittedById: userId,
      },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('[Feedback] Variance report error:', error);
    res.status(500).json({ error: 'Failed to submit variance report' });
  }
});

/**
 * PUT /feedback/:id
 * Update feedback
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = UpdateFeedbackSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const feedback = await db.feedback.update({
      where: { id: req.params.id },
      data: validation.data,
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('[Feedback] Update error:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

/**
 * PUT /feedback/:id/resolve
 * Resolve feedback
 */
router.put('/:id/resolve', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const validation = ResolveFeedbackSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const userId = (req as any).user?.id;

    const feedback = await db.feedback.update({
      where: { id: req.params.id },
      data: {
        status: validation.data.status,
        actionTaken: validation.data.actionTaken,
        resolvedById: userId,
        resolvedAt: new Date(),
      },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
        resolvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('[Feedback] Resolve error:', error);
    res.status(500).json({ error: 'Failed to resolve feedback' });
  }
});

/**
 * POST /feedback/:id/respond
 * Add response to feedback
 */
router.post('/:id/respond', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = FeedbackResponseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
    }

    const userId = (req as any).user?.id;

    // Update feedback status to REVIEWED if it was NEW
    await db.feedback.update({
      where: { id: req.params.id, status: 'NEW' },
      data: { status: 'REVIEWED' },
    }).catch(() => {}); // Ignore if not NEW

    const response = await db.feedbackResponse.create({
      data: {
        feedbackId: req.params.id,
        responderId: userId,
        message: validation.data.message,
        isInternal: validation.data.isInternal,
      },
      include: {
        responder: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('[Feedback] Response error:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

/**
 * DELETE /feedback/:id
 * Delete feedback
 */
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    await db.feedback.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    console.error('[Feedback] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;
