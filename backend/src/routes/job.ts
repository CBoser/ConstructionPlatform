import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const JobStatusEnum = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
]);

const createJobSchema = z.object({
  jobNumber: z.string().optional(),
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  elevationId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  lotId: z.string().uuid().optional(),
  status: JobStatusEnum.optional(),
  estimatedCost: z.number().optional(),
  startDate: z.string().datetime().optional(),
  completionDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updateJobSchema = createJobSchema.partial().extend({
  actualCost: z.number().optional(),
  margin: z.number().optional(),
});

const listJobsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: JobStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  communityId: z.string().uuid().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  sortBy: z.enum(['jobNumber', 'createdAt', 'startDate', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function generateJobNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');

  // Get the count of jobs this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const count = await prisma.job.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const sequence = (count + 1).toString().padStart(4, '0');
  return `JOB-${year}${month}-${sequence}`;
}

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/v1/jobs
 * List jobs with pagination and filtering
 */
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listJobsSchema.parse(req.query);
    const { page, limit, search, status, customerId, communityId, startDateFrom, startDateTo, sortBy, sortOrder } = query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { jobNumber: { contains: search, mode: 'insensitive' } },
        { customer: { customerName: { contains: search, mode: 'insensitive' } } },
        { plan: { code: { contains: search, mode: 'insensitive' } } },
        { community: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        (where.startDate as Record<string, Date>).gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        (where.startDate as Record<string, Date>).lte = new Date(startDateTo);
      }
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              customerCode: true,
            },
          },
          plan: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            },
          },
          elevation: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          lot: {
            select: {
              id: true,
              lotNumber: true,
              address: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              purchaseOrders: true,
              jobOptions: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jobs/stats
 * Get job statistics
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      total,
      byStatus,
      upcomingStarts,
      recentlyCompleted,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.job.count({
        where: {
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: { in: ['APPROVED', 'PENDING_APPROVAL'] },
        },
      }),
      prisma.job.count({
        where: {
          status: 'COMPLETED',
          completionDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
        upcomingStarts,
        recentlyCompleted,
        activeCount: byStatus
          .filter((s) => ['IN_PROGRESS', 'APPROVED', 'PENDING_APPROVAL'].includes(s.status))
          .reduce((sum, s) => sum + s._count, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jobs/upcoming
 * Get jobs with upcoming start dates
 */
router.get('/upcoming', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 14;

    const jobs = await prisma.job.findMany({
      where: {
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
        },
        status: { in: ['APPROVED', 'PENDING_APPROVAL', 'DRAFT'] },
      },
      orderBy: { startDate: 'asc' },
      take: 20,
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
          },
        },
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        lot: {
          select: {
            lotNumber: true,
            address: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jobs/:id
 * Get a single job by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: {
          include: {
            elevations: true,
          },
        },
        elevation: true,
        community: true,
        lot: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobOptions: {
          include: {
            option: true,
          },
        },
        purchaseOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        takeoff: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/jobs
 * Create a new job
 */
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createJobSchema.parse(req.body);
    const userId = (req as Request & { user: { id: string } }).user.id;

    // Generate job number if not provided
    const jobNumber = data.jobNumber || await generateJobNumber();

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Verify plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Plan not found',
      });
    }

    const job = await prisma.job.create({
      data: {
        jobNumber,
        customerId: data.customerId,
        planId: data.planId,
        elevationId: data.elevationId,
        communityId: data.communityId,
        lotId: data.lotId,
        status: data.status || 'DRAFT',
        estimatedCost: data.estimatedCost,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
        notes: data.notes,
        createdById: userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
          },
        },
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/jobs/:id
 * Update a job
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateJobSchema.parse(req.body);

    const existing = await prisma.job.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
          },
        },
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: job,
      message: 'Job updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/jobs/:id/status
 * Update job status
 */
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: JobStatusEnum }).parse(req.body);
    const userId = (req as Request & { user: { id: string } }).user.id;

    const existing = await prisma.job.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    const updateData: Record<string, unknown> = { status };

    // Set approval info when status changes to APPROVED
    if (status === 'APPROVED' && existing.status !== 'APPROVED') {
      updateData.approvedById = userId;
      updateData.approvedAt = new Date();
    }

    // Set completion date when status changes to COMPLETED
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completionDate = new Date();
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            customerName: true,
          },
        },
        plan: {
          select: {
            code: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: job,
      message: `Job status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/jobs/:id
 * Delete a job (soft delete - set status to CANCELLED)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';

    const existing = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    if (existing._count.purchaseOrders > 0 && hardDelete) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete job with purchase orders. Use soft delete instead.',
      });
    }

    if (hardDelete) {
      await prisma.job.delete({
        where: { id },
      });
    } else {
      await prisma.job.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }

    res.json({
      success: true,
      message: hardDelete ? 'Job deleted permanently' : 'Job cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
