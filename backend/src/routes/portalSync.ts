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

export default router;
