import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const PDSSStatusEnum = z.enum(['NEW', 'IN_PROGRESS', 'COMPLETE', 'ON_HOLD', 'ARCHIVED']);
const PDSSTakeoffStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETE']);
const PDSSQuoteStatusEnum = z.enum(['NOT_STARTED', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED']);
const PDSSPriorityEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

const updatePlanStatusSchema = z.object({
  planStatus: PDSSStatusEnum.optional(),
  takeoffStatus: PDSSTakeoffStatusEnum.optional(),
  quoteStatus: PDSSQuoteStatusEnum.optional(),
  documentsComplete: z.boolean().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  priority: PDSSPriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateJobStatusSchema = z.object({
  planStatus: PDSSStatusEnum.optional(),
  takeoffStatus: PDSSTakeoffStatusEnum.optional(),
  quoteStatus: PDSSQuoteStatusEnum.optional(),
  documentsComplete: z.boolean().optional(),
  missingDocuments: z.array(z.string()).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  priority: PDSSPriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const listPDSSSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  planStatus: PDSSStatusEnum.optional(),
  takeoffStatus: PDSSTakeoffStatusEnum.optional(),
  priority: PDSSPriorityEnum.optional(),
  assignedToId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// ============================================================================
// PDSS Plan Status Routes
// ============================================================================

/**
 * GET /api/v1/pdss/plans
 * List all plan-level PDSS statuses with filtering
 */
router.get('/plans', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listPDSSSchema.parse(req.query);
    const { page, limit, planStatus, takeoffStatus, priority, assignedToId, customerId, search } = query;

    const where: Record<string, unknown> = {};

    if (planStatus) where.planStatus = planStatus;
    if (takeoffStatus) where.takeoffStatus = takeoffStatus;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    if (customerId) {
      where.plan = { builderId: customerId };
    }

    if (search) {
      where.OR = [
        { plan: { code: { contains: search, mode: 'insensitive' } } },
        { plan: { name: { contains: search, mode: 'insensitive' } } },
        { elevation: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [statuses, total] = await Promise.all([
      prisma.pDSSPlanStatus.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
        include: {
          plan: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              builder: {
                select: {
                  id: true,
                  customerName: true,
                },
              },
            },
          },
          elevation: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              documentStatuses: true,
            },
          },
        },
      }),
      prisma.pDSSPlanStatus.count({ where }),
    ]);

    res.json({
      success: true,
      data: statuses,
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
 * GET /api/v1/pdss/plans/stats
 * Get PDSS statistics summary
 */
router.get('/plans/stats', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [byStatus, byTakeoff, byPriority, total] = await Promise.all([
      prisma.pDSSPlanStatus.groupBy({
        by: ['planStatus'],
        _count: true,
      }),
      prisma.pDSSPlanStatus.groupBy({
        by: ['takeoffStatus'],
        _count: true,
      }),
      prisma.pDSSPlanStatus.groupBy({
        by: ['priority'],
        _count: true,
      }),
      prisma.pDSSPlanStatus.count(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.map((s: { planStatus: string; _count: number }) => ({ status: s.planStatus, count: s._count })),
        byTakeoff: byTakeoff.map((s: { takeoffStatus: string; _count: number }) => ({ status: s.takeoffStatus, count: s._count })),
        byPriority: byPriority.map((s: { priority: string; _count: number }) => ({ priority: s.priority, count: s._count })),
        needsAttention: byPriority
          .filter((p: { priority: string; _count: number }) => p.priority === 'CRITICAL' || p.priority === 'HIGH')
          .reduce((sum: number, p: { priority: string; _count: number }) => sum + p._count, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pdss/plans/:id
 * Get a single plan PDSS status
 */
router.get('/plans/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const status = await prisma.pDSSPlanStatus.findUnique({
      where: { id },
      include: {
        plan: {
          include: {
            builder: true,
            elevations: true,
          },
        },
        elevation: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        documentStatuses: {
          include: {
            requirement: true,
          },
        },
      },
    });

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'PDSS status not found',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pdss/plans
 * Create or get PDSS status for a plan/elevation
 */
router.post('/plans', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId, elevationId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'planId is required',
      });
    }

    // Check if status already exists
    const existing = await prisma.pDSSPlanStatus.findFirst({
      where: {
        planId,
        elevationId: elevationId || null,
      },
    });

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: 'PDSS status already exists',
      });
    }

    // Create new status
    const status = await prisma.pDSSPlanStatus.create({
      data: {
        planId,
        elevationId: elevationId || null,
      },
      include: {
        plan: {
          select: {
            code: true,
            name: true,
          },
        },
        elevation: {
          select: {
            code: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: status,
      message: 'PDSS status created',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/pdss/plans/:id
 * Update plan PDSS status
 */
router.put('/plans/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updatePlanStatusSchema.parse(req.body);

    const status = await prisma.pDSSPlanStatus.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        plan: {
          select: {
            code: true,
            name: true,
          },
        },
        elevation: {
          select: {
            code: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: status,
      message: 'PDSS status updated',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PDSS Job Status Routes
// ============================================================================

/**
 * GET /api/v1/pdss/jobs
 * List all job-level PDSS statuses
 */
router.get('/jobs', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listPDSSSchema.parse(req.query);
    const { page, limit, planStatus, takeoffStatus, priority, assignedToId, customerId, search } = query;

    const where: Record<string, unknown> = {};

    if (planStatus) where.planStatus = planStatus;
    if (takeoffStatus) where.takeoffStatus = takeoffStatus;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    if (customerId) {
      where.job = { customerId };
    }

    if (search) {
      where.OR = [
        { job: { jobNumber: { contains: search, mode: 'insensitive' } } },
        { job: { plan: { code: { contains: search, mode: 'insensitive' } } } },
        { job: { community: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [statuses, total] = await Promise.all([
      prisma.pDSSJobStatus.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
        include: {
          job: {
            select: {
              id: true,
              jobNumber: true,
              status: true,
              startDate: true,
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
              elevation: {
                select: {
                  id: true,
                  code: true,
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
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.pDSSJobStatus.count({ where }),
    ]);

    res.json({
      success: true,
      data: statuses,
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
 * GET /api/v1/pdss/jobs/stats
 * Get PDSS job statistics
 */
router.get('/jobs/stats', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [byStatus, byPriority, incompleteCount, total] = await Promise.all([
      prisma.pDSSJobStatus.groupBy({
        by: ['planStatus'],
        _count: true,
      }),
      prisma.pDSSJobStatus.groupBy({
        by: ['priority'],
        _count: true,
      }),
      prisma.pDSSJobStatus.count({
        where: { documentsComplete: false },
      }),
      prisma.pDSSJobStatus.count(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.map((s: { planStatus: string; _count: number }) => ({ status: s.planStatus, count: s._count })),
        byPriority: byPriority.map((s: { priority: string; _count: number }) => ({ priority: s.priority, count: s._count })),
        incompleteDocuments: incompleteCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pdss/jobs/:jobId
 * Get PDSS status for a specific job
 */
router.get('/jobs/:jobId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    let status = await prisma.pDSSJobStatus.findUnique({
      where: { jobId },
      include: {
        job: {
          include: {
            customer: true,
            plan: true,
            elevation: true,
            community: true,
            lot: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Auto-create if doesn't exist
    if (!status) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found',
        });
      }

      status = await prisma.pDSSJobStatus.create({
        data: { jobId },
        include: {
          job: {
            include: {
              customer: true,
              plan: true,
              elevation: true,
              community: true,
              lot: true,
            },
          },
          assignedTo: true,
        },
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/pdss/jobs/:jobId
 * Update job PDSS status
 */
router.put('/jobs/:jobId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const data = updateJobStatusSchema.parse(req.body);

    // Ensure status exists
    let status = await prisma.pDSSJobStatus.findUnique({
      where: { jobId },
    });

    if (!status) {
      // Auto-create
      status = await prisma.pDSSJobStatus.create({
        data: { jobId },
      });
    }

    // Update
    const updated = await prisma.pDSSJobStatus.update({
      where: { jobId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        job: {
          select: {
            jobNumber: true,
            plan: { select: { code: true } },
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'PDSS status updated',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Document Requirements Routes
// ============================================================================

/**
 * GET /api/v1/pdss/requirements
 * Get document requirements for a builder
 */
router.get('/requirements', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (customerId) where.customerId = customerId;

    const requirements = await prisma.pDSSDocumentRequirement.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { docName: 'asc' }],
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pdss/requirements
 * Create a document requirement for a builder
 */
router.post('/requirements', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, docType, docName, isRequired, description, requiredByPhase, daysBeforeStart, sortOrder } =
      req.body;

    if (!customerId || !docType || !docName) {
      return res.status(400).json({
        success: false,
        error: 'customerId, docType, and docName are required',
      });
    }

    const requirement = await prisma.pDSSDocumentRequirement.create({
      data: {
        customerId,
        docType,
        docName,
        isRequired: isRequired ?? true,
        description,
        requiredByPhase,
        daysBeforeStart,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        customer: {
          select: {
            customerName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: requirement,
      message: 'Document requirement created',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Combined Dashboard View
// ============================================================================

/**
 * GET /api/v1/pdss/dashboard
 * Get combined PDSS dashboard data
 */
router.get('/dashboard', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { user: { id: string } }).user?.id;

    const [
      planStats,
      jobStats,
      myAssignedPlans,
      myAssignedJobs,
      criticalItems,
      recentActivity,
    ] = await Promise.all([
      // Plan status summary
      prisma.pDSSPlanStatus.groupBy({
        by: ['planStatus'],
        _count: true,
      }),
      // Job status summary
      prisma.pDSSJobStatus.groupBy({
        by: ['planStatus'],
        _count: true,
      }),
      // My assigned plans
      userId
        ? prisma.pDSSPlanStatus.count({
            where: { assignedToId: userId, planStatus: { not: 'COMPLETE' } },
          })
        : Promise.resolve(0),
      // My assigned jobs
      userId
        ? prisma.pDSSJobStatus.count({
            where: { assignedToId: userId, planStatus: { not: 'COMPLETE' } },
          })
        : Promise.resolve(0),
      // Critical items
      prisma.pDSSJobStatus.findMany({
        where: {
          OR: [
            { priority: 'CRITICAL' },
            { priority: 'HIGH', documentsComplete: false },
          ],
          planStatus: { not: 'COMPLETE' },
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          job: {
            select: {
              jobNumber: true,
              startDate: true,
              customer: { select: { customerName: true } },
              plan: { select: { code: true } },
              community: { select: { name: true } },
              lot: { select: { lotNumber: true } },
            },
          },
        },
      }),
      // Recent activity (jobs updated in last 7 days)
      prisma.pDSSJobStatus.findMany({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          job: {
            select: {
              jobNumber: true,
              plan: { select: { code: true } },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        planStats: planStats.map((s: { planStatus: string; _count: number }) => ({ status: s.planStatus, count: s._count })),
        jobStats: jobStats.map((s: { planStatus: string; _count: number }) => ({ status: s.planStatus, count: s._count })),
        myAssignments: {
          plans: myAssignedPlans,
          jobs: myAssignedJobs,
        },
        criticalItems,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
