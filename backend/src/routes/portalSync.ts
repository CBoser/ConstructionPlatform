import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Portal Sync Routes
 *
 * These routes receive data from Python STO agents (SupplyPro, Hyphen, OneDrive)
 * and sync it to the MindFlow database.
 *
 * Authentication: Service-to-service token (x-service-token header)
 */

// Service-to-service authentication middleware
const validateServiceToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-service-token'];
  const expectedToken = process.env.PORTAL_SYNC_SECRET;

  if (!expectedToken) {
    console.error('PORTAL_SYNC_SECRET environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid service token' });
  }

  next();
};

// Helper to create sync log entry
async function createSyncLog(portal: string, syncType: string) {
  return prisma.portalSyncLog.create({
    data: {
      portal,
      syncType,
      status: 'started',
    },
  });
}

// Helper to update sync log on completion
async function completeSyncLog(id: string, itemsFound: number, itemsProcessed: number, errors?: unknown) {
  return prisma.portalSyncLog.update({
    where: { id },
    data: {
      status: errors ? 'failed' : 'completed',
      itemsFound,
      itemsProcessed,
      errors: errors ? JSON.parse(JSON.stringify(errors)) : null,
      completedAt: new Date(),
    },
  });
}

/**
 * POST /api/v1/portal-sync/orders
 *
 * Receives orders from Python agents (SupplyPro, Hyphen)
 * Upserts orders to the database based on externalId
 */
router.post('/orders', validateServiceToken, async (req: Request, res: Response) => {
  const syncLog = await createSyncLog(req.body.portal || 'unknown', 'orders');

  try {
    const { orders, portal, syncId } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders must be an array' });
    }

    let processed = 0;
    const errors: Array<{ externalId: string; error: string }> = [];

    for (const order of orders) {
      try {
        await prisma.portalOrder.upsert({
          where: { externalId: order.external_id },
          update: {
            status: order.status,
            amount: order.amount,
            dueDate: order.due_date ? new Date(order.due_date) : null,
            completedAt: order.completed_at ? new Date(order.completed_at) : null,
            rawData: order.raw_data,
            syncedAt: new Date(),
          },
          create: {
            externalId: order.external_id,
            portal: portal,
            orderType: order.order_type,
            category: order.category,
            status: order.status,
            amount: order.amount,
            description: order.description,
            dueDate: order.due_date ? new Date(order.due_date) : null,
            customerId: order.customer_id,
            communityId: order.community_id,
            lotNumber: order.lot_number,
            rawData: order.raw_data,
          },
        });
        processed++;
      } catch (err) {
        errors.push({
          externalId: order.external_id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Log sync activity
    await prisma.activityLog.create({
      data: {
        activityType: 'portal_sync',
        title: `Synced ${processed} orders from ${portal}`,
        detail: syncId ? `Sync ID: ${syncId}` : null,
        icon: '🔄',
      },
    });

    await completeSyncLog(syncLog.id, orders.length, processed, errors.length > 0 ? errors : undefined);

    res.json({ success: true, processed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Order sync error:', error);
    await completeSyncLog(syncLog.id, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/documents
 *
 * Receives document metadata from Python agents
 * Creates document records in the database
 */
router.post('/documents', validateServiceToken, async (req: Request, res: Response) => {
  const syncLog = await createSyncLog(req.body.portal || 'unknown', 'documents');

  try {
    const { documents, portal } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'documents must be an array' });
    }

    let processed = 0;
    const errors: Array<{ filename: string; error: string }> = [];

    for (const doc of documents) {
      try {
        await prisma.portalDocument.create({
          data: {
            externalId: doc.external_id,
            portal: portal,
            filename: doc.filename,
            docType: doc.doc_type,
            fileUrl: doc.file_url,
            fileSize: doc.file_size,
            customerId: doc.customer_id,
            communityId: doc.community_id,
            planId: doc.plan_id,
            lotNumber: doc.lot_number,
          },
        });
        processed++;
      } catch (err) {
        errors.push({
          filename: doc.filename,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    await completeSyncLog(syncLog.id, documents.length, processed, errors.length > 0 ? errors : undefined);

    res.json({ success: true, processed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Document sync error:', error);
    await completeSyncLog(syncLog.id, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/alerts
 *
 * Receives alerts from Python agents (completeness checker, variance alerts)
 * Creates system alert records
 */
router.post('/alerts', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { alerts } = req.body;

    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: 'alerts must be an array' });
    }

    let processed = 0;
    const errors: Array<{ title: string; error: string }> = [];

    for (const alert of alerts) {
      try {
        await prisma.systemAlert.create({
          data: {
            alertType: alert.type || 'info',
            source: alert.source || 'portal_sync',
            title: alert.title,
            message: alert.message,
            details: alert.details,
            actionUrl: alert.action_url,
            customerId: alert.customer_id,
            communityId: alert.community_id,
            orderId: alert.order_id,
          },
        });
        processed++;
      } catch (err) {
        errors.push({
          title: alert.title,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    res.json({ success: true, count: processed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Alert sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/deliveries
 *
 * Receives delivery schedules from Python agents
 * Updates today's delivery schedule (clears old entries for the portal, inserts new ones)
 */
router.post('/deliveries', validateServiceToken, async (req: Request, res: Response) => {
  const syncLog = await createSyncLog(req.body.portal || 'unknown', 'deliveries');

  try {
    const { deliveries, portal } = req.body;

    if (!Array.isArray(deliveries)) {
      return res.status(400).json({ error: 'deliveries must be an array' });
    }

    // Clear old deliveries for this portal (today only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.deliverySchedule.deleteMany({
      where: {
        portal,
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let processed = 0;
    const errors: Array<{ title: string; error: string }> = [];

    // Insert new deliveries
    for (const delivery of deliveries) {
      try {
        await prisma.deliverySchedule.create({
          data: {
            portal,
            orderId: delivery.order_id,
            scheduledTime: new Date(delivery.scheduled_time),
            title: delivery.title,
            location: delivery.location,
            status: delivery.status || 'scheduled',
            communityId: delivery.community_id,
            lotNumber: delivery.lot_number,
          },
        });
        processed++;
      } catch (err) {
        errors.push({
          title: delivery.title,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    await completeSyncLog(syncLog.id, deliveries.length, processed, errors.length > 0 ? errors : undefined);

    res.json({ success: true, count: processed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Delivery sync error:', error);
    await completeSyncLog(syncLog.id, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/activity
 *
 * Receives activity log entries from Python agents
 * Creates activity log records for the dashboard feed
 */
router.post('/activity', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { activities } = req.body;

    if (!Array.isArray(activities)) {
      return res.status(400).json({ error: 'activities must be an array' });
    }

    let processed = 0;
    const errors: Array<{ title: string; error: string }> = [];

    for (const activity of activities) {
      try {
        await prisma.activityLog.create({
          data: {
            activityType: activity.type || 'general',
            title: activity.title,
            detail: activity.detail,
            amount: activity.amount,
            icon: activity.icon,
            customerId: activity.customer_id,
            orderId: activity.order_id,
          },
        });
        processed++;
      } catch (err) {
        errors.push({
          title: activity.title,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    res.json({ success: true, count: processed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Activity sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/portal-sync/status
 *
 * Returns the status of recent syncs (for monitoring)
 */
router.get('/status', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const recentLogs = await prisma.portalSyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    // Get last successful sync per portal/type
    const lastSyncs = await prisma.portalSyncLog.groupBy({
      by: ['portal', 'syncType'],
      where: { status: 'completed' },
      _max: { completedAt: true },
    });

    res.json({
      recentLogs,
      lastSuccessfulSyncs: lastSyncs,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// PLAN MANAGEMENT ROUTES
// ============================================================================

/**
 * POST /api/v1/portal-sync/plans
 *
 * Creates or updates plans from Python agents
 */
router.post('/plans', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const plan = req.body;

    if (!plan.code) {
      return res.status(400).json({ error: 'plan code is required' });
    }

    const result = await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        customerPlanCode: plan.customerPlanCode,
        type: plan.type || 'SINGLE_STORY',
        sqft: plan.sqft,
        bedrooms: plan.bedrooms,
        bathrooms: plan.bathrooms,
        garage: plan.garage,
        style: plan.style,
        notes: plan.notes,
        updatedAt: new Date(),
      },
      create: {
        code: plan.code,
        name: plan.name,
        customerPlanCode: plan.customerPlanCode,
        builderId: plan.builderId,
        type: plan.type || 'SINGLE_STORY',
        sqft: plan.sqft,
        bedrooms: plan.bedrooms,
        bathrooms: plan.bathrooms,
        garage: plan.garage,
        style: plan.style,
        notes: plan.notes,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        activityType: 'plan_sync',
        title: `Plan ${plan.code} synced`,
        detail: plan.name || null,
        icon: '📋',
      },
    });

    res.json({ success: true, plan: result });
  } catch (error) {
    console.error('Plan sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/elevations
 *
 * Creates or updates plan elevations
 */
router.post('/elevations', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const elevation = req.body;

    if (!elevation.planId || !elevation.code) {
      return res.status(400).json({ error: 'planId and code are required' });
    }

    const result = await prisma.planElevation.upsert({
      where: {
        planId_code: {
          planId: elevation.planId,
          code: elevation.code,
        },
      },
      update: {
        name: elevation.name,
        description: elevation.description,
        architectDesigner: elevation.architectDesigner,
        architectDesignerDate: elevation.architectDesignerDate ? new Date(elevation.architectDesignerDate) : null,
        structuralEngineer: elevation.structuralEngineer,
        structuralEngineerDate: elevation.structuralEngineerDate ? new Date(elevation.structuralEngineerDate) : null,
        iJoistCompany: elevation.iJoistCompany,
        iJoistCompanyDate: elevation.iJoistCompanyDate ? new Date(elevation.iJoistCompanyDate) : null,
        floorTrussCompany: elevation.floorTrussCompany,
        floorTrussCompanyDate: elevation.floorTrussCompanyDate ? new Date(elevation.floorTrussCompanyDate) : null,
        roofTrussCompany: elevation.roofTrussCompany,
        roofTrussCompanyDate: elevation.roofTrussCompanyDate ? new Date(elevation.roofTrussCompanyDate) : null,
        updatedAt: new Date(),
      },
      create: {
        planId: elevation.planId,
        code: elevation.code,
        name: elevation.name,
        description: elevation.description,
        architectDesigner: elevation.architectDesigner,
        architectDesignerDate: elevation.architectDesignerDate ? new Date(elevation.architectDesignerDate) : null,
        structuralEngineer: elevation.structuralEngineer,
        structuralEngineerDate: elevation.structuralEngineerDate ? new Date(elevation.structuralEngineerDate) : null,
        iJoistCompany: elevation.iJoistCompany,
        iJoistCompanyDate: elevation.iJoistCompanyDate ? new Date(elevation.iJoistCompanyDate) : null,
        floorTrussCompany: elevation.floorTrussCompany,
        floorTrussCompanyDate: elevation.floorTrussCompanyDate ? new Date(elevation.floorTrussCompanyDate) : null,
        roofTrussCompany: elevation.roofTrussCompany,
        roofTrussCompanyDate: elevation.roofTrussCompanyDate ? new Date(elevation.roofTrussCompanyDate) : null,
      },
    });

    res.json({ success: true, elevation: result });
  } catch (error) {
    console.error('Elevation sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/plan-documents
 *
 * Associates documents with plans or elevations
 */
router.post('/plan-documents', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const doc = req.body;

    if (!doc.planId || !doc.fileName) {
      return res.status(400).json({ error: 'planId and fileName are required' });
    }

    const result = await prisma.planDocument.create({
      data: {
        planId: doc.planId,
        elevationId: doc.elevationId || null,
        fileName: doc.fileName,
        fileType: doc.fileType || 'OTHER',
        filePath: doc.filePath,
        fileSize: doc.fileSize || 0,
        mimeType: doc.mimeType || 'application/octet-stream',
        version: doc.version || 1,
        documentDate: doc.documentDate ? new Date(doc.documentDate) : new Date(),
        changeNotes: doc.changeNotes,
        uploadedBy: doc.uploadedBy,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        activityType: 'document_upload',
        title: `Document uploaded: ${doc.fileName}`,
        detail: doc.fileType || null,
        icon: '📄',
      },
    });

    res.json({ success: true, document: result });
  } catch (error) {
    console.error('Plan document sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/portal-sync/documents
 *
 * Gets documents, optionally filtered by jobId, planId, or communityId
 */
router.get('/documents', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { jobId, planId, communityId, lotNumber } = req.query;

    const where: Record<string, unknown> = {};
    if (planId) where.planId = planId;
    if (communityId) where.communityId = communityId;
    if (lotNumber) where.lotNumber = parseInt(lotNumber as string, 10);

    const documents = await prisma.portalDocument.findMany({
      where,
      orderBy: { syncedAt: 'desc' },
      take: 100,
    });

    res.json(documents);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * PATCH /api/v1/portal-sync/documents/:id
 *
 * Updates document status
 */
router.patch('/documents/:id', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, processedAt } = req.body;

    const result = await prisma.portalDocument.update({
      where: { id },
      data: {
        status,
        processedAt: processedAt ? new Date(processedAt) : undefined,
      },
    });

    res.json({ success: true, document: result });
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * PATCH /api/v1/portal-sync/documents/:id/archive
 *
 * Archives a document
 */
router.patch('/documents/:id/archive', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived, archiveDate, archiveNotes } = req.body;

    // Note: archiving for PlanDocument model (not PortalDocument)
    // This would need to be adjusted based on which document type you're archiving
    // For now, just update the portal document status
    const result = await prisma.portalDocument.update({
      where: { id },
      data: {
        status: isArchived ? 'archived' : 'received',
      },
    });

    res.json({ success: true, document: result });
  } catch (error) {
    console.error('Document archive error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// JOB TRACKING ROUTES
// ============================================================================

/**
 * POST /api/v1/portal-sync/stats
 *
 * Receives aggregated stats from Python agents for dashboard
 */
router.post('/stats', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    // Store stats as a system alert of type "info" for now
    // In a full implementation, you might have a dedicated stats table
    await prisma.systemAlert.create({
      data: {
        alertType: 'info',
        source: `stats_${type}`,
        title: `${type} stats updated`,
        message: `Dashboard stats for ${type} updated`,
        details: data,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Stats sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/portal-sync/jobs/upcoming
 *
 * Gets jobs with upcoming start dates
 */
router.get('/jobs/upcoming', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 7;
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const jobs = await prisma.job.findMany({
      where: {
        startDate: {
          gte: now,
          lte: cutoff,
        },
        status: {
          in: ['APPROVED', 'ESTIMATED'],
        },
      },
      include: {
        customer: true,
        plan: true,
        elevation: true,
        community: true,
        lot: true,
      },
      orderBy: { startDate: 'asc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Upcoming jobs fetch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/portal-sync/jobs/summary
 *
 * Gets job summary statistics
 */
router.get('/jobs/summary', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const [
      totalJobs,
      draftJobs,
      estimatedJobs,
      approvedJobs,
      inProgressJobs,
      completedJobs,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.job.count({ where: { status: 'ESTIMATED' } }),
      prisma.job.count({ where: { status: 'APPROVED' } }),
      prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Get jobs starting this week
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const startingThisWeek = await prisma.job.count({
      where: {
        startDate: {
          gte: now,
          lte: weekFromNow,
        },
        status: {
          in: ['APPROVED', 'ESTIMATED'],
        },
      },
    });

    res.json({
      total: totalJobs,
      byStatus: {
        draft: draftJobs,
        estimated: estimatedJobs,
        approved: approvedJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
      },
      startingThisWeek,
    });
  } catch (error) {
    console.error('Job summary fetch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ============================================================================
// JOB AND COMMUNITY SYNC ROUTES (for Excel imports)
// ============================================================================

/**
 * POST /api/v1/portal-sync/jobs
 *
 * Creates or updates jobs from Excel imports or Python agents
 */
router.post('/jobs', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const job = req.body;

    if (!job.jobNumber) {
      return res.status(400).json({ error: 'jobNumber is required' });
    }

    // Try to find existing job by job number
    const existing = await prisma.job.findFirst({
      where: { jobNumber: job.jobNumber },
    });

    let result;
    if (existing) {
      // Update existing job
      result = await prisma.job.update({
        where: { id: existing.id },
        data: {
          status: job.status || existing.status,
          startDate: job.startDate ? new Date(job.startDate) : existing.startDate,
          notes: job.notes || existing.notes,
          updatedAt: new Date(),
        },
      });
    } else {
      // Find or create related records
      let customerId = job.customerId;
      let communityId = job.communityId;
      let planId = job.planId;

      // Look up customer by builder code if not provided
      if (!customerId && job.builder) {
        const customer = await prisma.customer.findFirst({
          where: {
            customerName: { contains: job.builder, mode: 'insensitive' },
          },
        });
        if (customer) customerId = customer.id;
      }

      // Look up community by name if not provided
      if (!communityId && job.subdivision) {
        const community = await prisma.community.findFirst({
          where: { name: { contains: job.subdivision, mode: 'insensitive' } },
        });
        if (community) communityId = community.id;
      }

      // Look up plan by code if not provided
      if (!planId && job.planCode) {
        const plan = await prisma.plan.findFirst({
          where: { code: { equals: job.planCode, mode: 'insensitive' } },
        });
        if (plan) planId = plan.id;
      }

      // Validate required fields for job creation
      if (!customerId || !planId) {
        return res.status(400).json({
          error: 'Cannot create job without customer and plan',
          details: { customerId: !!customerId, planId: !!planId },
        });
      }

      // Get or create a system user for service-created jobs
      let systemUser = await prisma.user.findFirst({
        where: { email: 'system@mindflow.local' },
      });
      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'system@mindflow.local',
            passwordHash: 'SERVICE_ACCOUNT_NO_LOGIN',
            firstName: 'System',
            lastName: 'Service',
            role: 'ADMIN',
            isActive: true,
          },
        });
      }

      // Create new job using relations
      result = await prisma.job.create({
        data: {
          jobNumber: job.jobNumber,
          customer: { connect: { id: customerId } },
          plan: { connect: { id: planId } },
          community: communityId ? { connect: { id: communityId } } : undefined,
          createdBy: { connect: { id: job.createdById || systemUser.id } },
          status: job.status || 'DRAFT',
          startDate: job.startDate ? new Date(job.startDate) : null,
          notes: job.notes,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        activityType: 'job_sync',
        title: `Job ${job.jobNumber} ${existing ? 'updated' : 'created'}`,
        detail: job.subdivision || null,
        icon: '🏗️',
      },
    });

    res.json({ success: true, job: result, created: !existing });
  } catch (error) {
    console.error('Job sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/communities
 *
 * Creates or updates communities from Excel imports
 */
router.post('/communities', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const community = req.body;

    if (!community.name) {
      return res.status(400).json({ error: 'community name is required' });
    }

    // Find customer by builder code if provided
    let customerId = community.customerId;
    if (!customerId && community.builder) {
      const customer = await prisma.customer.findFirst({
        where: {
          customerName: { contains: community.builder, mode: 'insensitive' },
        },
      });
      if (customer) customerId = customer.id;
    }

    // customerId is required for Community
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID or valid builder name is required' });
    }

    // Find existing community by name and customer
    const existing = await prisma.community.findFirst({
      where: {
        name: community.name,
        customerId: customerId,
      },
    });

    let result;
    if (existing) {
      // Update existing community
      result = await prisma.community.update({
        where: { id: existing.id },
        data: {
          shippingYard: community.shippingYard || existing.shippingYard,
          jurisdiction: community.jurisdiction || existing.jurisdiction,
          region: community.region || existing.region,
          isActive: community.isActive ?? existing.isActive,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new community
      result = await prisma.community.create({
        data: {
          name: community.name,
          customerId: customerId,
          shippingYard: community.shippingYard || 'DEFAULT',
          jurisdiction: community.jurisdiction,
          region: community.region,
          isActive: community.isActive ?? true,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        activityType: 'community_sync',
        title: `Community ${community.name} synced`,
        detail: community.city || null,
        icon: '🏘️',
      },
    });

    res.json({ success: true, community: result });
  } catch (error) {
    console.error('Community sync error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/v1/portal-sync/excel-import
 *
 * Receives Excel import results from Python agent
 * This is called after the Python agent processes an Excel file
 */
router.post('/excel-import', validateServiceToken, async (req: Request, res: Response) => {
  try {
    const { sourceType, recordsFound, recordsImported, recordsUpdated, recordsSkipped, errors, warnings } = req.body;

    // Log the import
    await prisma.portalSyncLog.create({
      data: {
        portal: `excel_${sourceType}`,
        syncType: 'import',
        status: errors && errors.length > 0 ? 'completed_with_errors' : 'completed',
        itemsFound: recordsFound || 0,
        itemsProcessed: recordsImported || 0,
        errors: errors && errors.length > 0 ? errors : null,
        completedAt: new Date(),
      },
    });

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        activityType: 'excel_import',
        title: `Excel import: ${sourceType}`,
        detail: `${recordsImported || 0} records imported from ${sourceType}`,
        icon: '📊',
      },
    });

    // Create alert if there were errors
    if (errors && errors.length > 0) {
      await prisma.systemAlert.create({
        data: {
          alertType: 'warning',
          source: 'excel_import',
          title: `Excel import completed with ${errors.length} errors`,
          message: `Import of ${sourceType} completed but had ${errors.length} errors`,
          details: { sourceType, errors, warnings },
        },
      });
    }

    res.json({
      success: true,
      summary: {
        sourceType,
        recordsFound,
        recordsImported,
        recordsUpdated,
        recordsSkipped,
        errorCount: errors?.length || 0,
      },
    });
  } catch (error) {
    console.error('Excel import log error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
