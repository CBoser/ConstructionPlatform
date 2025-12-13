import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * Dashboard API Routes
 *
 * Serves aggregated data for the dashboard UI:
 * - Stats cards (active jobs, material orders, pending approvals, on-time delivery)
 * - Critical alerts
 * - Recent activity feed
 * - Today's deliveries
 * - Material cost trends
 *
 * Note: Portal-related tables (portal_orders, system_alerts, activity_logs, delivery_schedules)
 * may not exist if the database hasn't been fully migrated. All queries to these tables
 * have fallback handling to return empty/default values.
 */

// Helper to check if an error is a Prisma "table does not exist" error
function isTableNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2021' || error.code === 'P2010')
  );
}

// Helper functions
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    po_approved: '📄',
    bid_submitted: '💼',
    delivery: '🚚',
    document: '📋',
    job_completed: '✅',
    portal_sync: '🔄',
    job_created: '🏠',
    material_update: '📦',
  };
  return icons[type] || '📊';
}

function getAlertIcon(type: string): string {
  const icons: Record<string, string> = {
    critical: '⚠️',
    warning: '💰',
    info: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
}

// Safe query wrappers for portal tables
async function safePortalOrderAggregate(where: Prisma.PortalOrderWhereInput) {
  try {
    return await prisma.portalOrder.aggregate({
      where,
      _sum: { amount: true },
    });
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return { _sum: { amount: null } };
    }
    throw error;
  }
}

async function safePortalOrderCount(where: Prisma.PortalOrderWhereInput) {
  try {
    return await prisma.portalOrder.count({ where });
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return 0;
    }
    throw error;
  }
}

async function safeSystemAlertFindMany(options: Prisma.SystemAlertFindManyArgs) {
  try {
    return await prisma.systemAlert.findMany(options);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

async function safeActivityLogFindMany(options: Prisma.ActivityLogFindManyArgs) {
  try {
    return await prisma.activityLog.findMany(options);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

async function safeDeliveryScheduleFindMany(options: Prisma.DeliveryScheduleFindManyArgs) {
  try {
    return await prisma.deliverySchedule.findMany(options);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

async function safePortalOrderFindMany(options: Prisma.PortalOrderFindManyArgs) {
  try {
    return await prisma.portalOrder.findMany(options);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

/**
 * GET /api/v1/dashboard/stats
 *
 * Returns aggregated statistics for the dashboard stat cards:
 * - Active jobs count and trend
 * - Material orders total (this month) and today's additions
 * - Pending approvals count
 * - On-time delivery percentage
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Active Jobs (from Job model)
    const activeJobs = await prisma.job.count({
      where: { status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] } },
    });

    const jobsLastWeek = await prisma.job.count({
      where: {
        status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] },
        createdAt: { lt: startOfWeek },
      },
    });

    const jobsTrend = activeJobs - jobsLastWeek;

    // Material Orders (from PortalOrder) - with fallback
    const materialOrders = await safePortalOrderAggregate({
      orderType: 'po',
      createdAt: { gte: startOfMonth },
    });

    const todayOrders = await safePortalOrderAggregate({
      orderType: 'po',
      createdAt: { gte: startOfToday },
    });

    // Pending Approvals (from PurchaseOrder model)
    const pendingApprovals = await prisma.purchaseOrder.count({
      where: { status: 'DRAFT' }, // DRAFT status used as "pending approval"
    });

    // On Time Delivery calculation - with fallback
    const totalDeliveries = await safePortalOrderCount({
      orderType: 'po',
      status: 'delivered',
      createdAt: { gte: startOfMonth },
    });

    const lateDeliveries = await safePortalOrderCount({
      orderType: 'po',
      status: 'late',
      createdAt: { gte: startOfMonth },
    });

    const totalDeliveriesForRate = totalDeliveries + lateDeliveries;
    const onTimeRate =
      totalDeliveriesForRate > 0
        ? Math.round((totalDeliveries / totalDeliveriesForRate) * 100)
        : 100;

    const totalMaterialAmount = Number(materialOrders._sum.amount || 0);
    const todayMaterialAmount = Number(todayOrders._sum.amount || 0);

    res.json({
      activeJobs: {
        value: activeJobs,
        trend: `${jobsTrend >= 0 ? '+' : ''}${jobsTrend} this week`,
        trendUp: jobsTrend >= 0,
      },
      materialOrders: {
        value: totalMaterialAmount,
        formatted: `$${Math.round(totalMaterialAmount / 1000)}K`,
        trend: `+$${Math.round(todayMaterialAmount / 1000)}K today`,
        trendUp: true,
      },
      pendingApprovals: {
        value: pendingApprovals,
      },
      onTimeDelivery: {
        value: onTimeRate,
        trend: `${onTimeRate >= 95 ? '+' : '-'}${Math.abs(onTimeRate - 95)}% vs target`,
        trendUp: onTimeRate >= 95,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/dashboard/alerts
 *
 * Returns active (non-dismissed) system alerts
 * Sorted by type (critical first) and recency
 */
router.get('/alerts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const alerts = await safeSystemAlertFindMany({
      where: { isDismissed: false },
      orderBy: [
        { alertType: 'asc' }, // critical < info < warning (alphabetical puts critical first)
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        customer: { select: { customerName: true } },
        community: { select: { name: true } },
      },
    });

    res.json(
      alerts.map((a: any) => ({
        id: a.id,
        type: a.alertType,
        icon: getAlertIcon(a.alertType),
        title: a.title,
        message: a.message,
        details: a.details,
        time: formatRelativeTime(a.createdAt),
        createdAt: a.createdAt,
        actionUrl: a.actionUrl,
        customer: a.customer?.customerName,
        community: a.community?.name,
        isRead: a.isRead,
      }))
    );
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * PATCH /api/v1/dashboard/alerts/:id/dismiss
 *
 * Dismisses an alert
 */
router.patch('/alerts/:id/dismiss', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.systemAlert.update({
      where: { id },
      data: { isDismissed: true },
    });

    res.json({ success: true });
  } catch (error) {
    if (isTableNotFoundError(error)) {
      res.status(404).json({ error: 'Alert system not available' });
      return;
    }
    console.error('Dismiss alert error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * PATCH /api/v1/dashboard/alerts/:id/read
 *
 * Marks an alert as read
 */
router.patch('/alerts/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.systemAlert.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    if (isTableNotFoundError(error)) {
      res.status(404).json({ error: 'Alert system not available' });
      return;
    }
    console.error('Mark alert read error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/dashboard/activity
 *
 * Returns recent activity feed
 */
router.get('/activity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const activities = await safeActivityLogFindMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: { select: { customerName: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json(
      activities.map((a: any) => ({
        id: a.id,
        type: a.activityType,
        icon: a.icon || getActivityIcon(a.activityType),
        title: a.title,
        detail: a.detail,
        amount: a.amount ? Number(a.amount) : null,
        time: formatRelativeTime(a.createdAt),
        createdAt: a.createdAt,
        customer: a.customer?.customerName,
        user: a.user
          ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || a.user.email
          : null,
      }))
    );
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/dashboard/deliveries
 *
 * Returns today's delivery schedule
 */
router.get('/deliveries', authenticateToken, async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveries = await safeDeliveryScheduleFindMany({
      where: {
        scheduledTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { scheduledTime: 'asc' },
      include: {
        community: { select: { name: true } },
      },
    });

    res.json(
      deliveries.map((d: any) => ({
        id: d.id,
        time: formatTime(d.scheduledTime),
        scheduledTime: d.scheduledTime,
        title: d.title,
        location: d.location || (d.community ? `${d.community.name} - Lot ${d.lotNumber}` : null),
        status: d.status,
        portal: d.portal,
      }))
    );
  } catch (error) {
    console.error('Dashboard deliveries error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/dashboard/trends
 *
 * Returns material cost trends (aggregated by day/week/month)
 */
router.get('/trends', authenticateToken, async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'week'; // day, week, month
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6); // Last 6 months
        break;
      case 'week':
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 28); // Last 4 weeks
        break;
    }

    const orders = await safePortalOrderFindMany({
      where: {
        orderType: 'po',
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by category and time period
    const trendData: Record<string, Record<string, number>> = {};

    for (const order of orders as any[]) {
      const dateKey =
        period === 'month'
          ? `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
          : order.createdAt.toISOString().split('T')[0];

      const category = order.category || 'Other';

      if (!trendData[dateKey]) {
        trendData[dateKey] = {};
      }

      if (!trendData[dateKey][category]) {
        trendData[dateKey][category] = 0;
      }

      trendData[dateKey][category] += Number(order.amount);
    }

    // Format for chart consumption
    const labels = Object.keys(trendData).sort();
    const categories = [...new Set((orders as any[]).map((o) => o.category || 'Other'))];

    const datasets = categories.map((category) => ({
      label: category,
      data: labels.map((label) => trendData[label]?.[category] || 0),
    }));

    res.json({
      labels,
      datasets,
      summary: {
        totalAmount: (orders as any[]).reduce((sum, o) => sum + Number(o.amount), 0),
        orderCount: orders.length,
        period,
      },
    });
  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/v1/dashboard/summary
 *
 * Returns a combined summary with all dashboard data in one request
 * Useful for initial page load to reduce round trips
 *
 * Note: This endpoint gracefully handles missing portal tables by returning
 * default/empty values for portal-related data.
 */
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run queries - core models first, then portal models with fallbacks
    const [activeJobsCount, jobsLastWeekCount, pendingApprovalsCount] = await Promise.all([
      prisma.job.count({
        where: { status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] } },
      }),
      prisma.job.count({
        where: {
          status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] },
          createdAt: { lt: startOfWeek },
        },
      }),
      prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),
    ]);

    // Portal-related queries with fallbacks
    const [materialOrdersSum, todayOrdersSum, deliveredCount, lateCount, alerts, activities, deliveries] =
      await Promise.all([
        safePortalOrderAggregate({ orderType: 'po', createdAt: { gte: startOfMonth } }),
        safePortalOrderAggregate({ orderType: 'po', createdAt: { gte: startOfToday } }),
        safePortalOrderCount({ orderType: 'po', status: 'delivered', createdAt: { gte: startOfMonth } }),
        safePortalOrderCount({ orderType: 'po', status: 'late', createdAt: { gte: startOfMonth } }),
        safeSystemAlertFindMany({
          where: { isDismissed: false },
          orderBy: [{ alertType: 'asc' }, { createdAt: 'desc' }],
          take: 5,
          include: {
            customer: { select: { customerName: true } },
            community: { select: { name: true } },
          },
        }),
        safeActivityLogFindMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            customer: { select: { customerName: true } },
          },
        }),
        safeDeliveryScheduleFindMany({
          where: { scheduledTime: { gte: startOfToday, lt: tomorrow } },
          orderBy: { scheduledTime: 'asc' },
          take: 5,
          include: { community: { select: { name: true } } },
        }),
      ]);

    const jobsTrend = activeJobsCount - jobsLastWeekCount;
    const totalMaterialAmount = Number(materialOrdersSum._sum.amount || 0);
    const todayMaterialAmount = Number(todayOrdersSum._sum.amount || 0);
    const totalDeliveriesForRate = deliveredCount + lateCount;
    const onTimeRate =
      totalDeliveriesForRate > 0
        ? Math.round((deliveredCount / totalDeliveriesForRate) * 100)
        : 100;

    res.json({
      stats: {
        activeJobs: {
          value: activeJobsCount,
          trend: `${jobsTrend >= 0 ? '+' : ''}${jobsTrend} this week`,
          trendUp: jobsTrend >= 0,
        },
        materialOrders: {
          value: totalMaterialAmount,
          formatted: `$${Math.round(totalMaterialAmount / 1000)}K`,
          trend: `+$${Math.round(todayMaterialAmount / 1000)}K today`,
          trendUp: true,
        },
        pendingApprovals: { value: pendingApprovalsCount },
        onTimeDelivery: {
          value: onTimeRate,
          trend: `${onTimeRate >= 95 ? '+' : '-'}${Math.abs(onTimeRate - 95)}% vs target`,
          trendUp: onTimeRate >= 95,
        },
      },
      alerts: (alerts as any[]).map((a) => ({
        id: a.id,
        type: a.alertType,
        icon: getAlertIcon(a.alertType),
        title: a.title,
        message: a.message,
        time: formatRelativeTime(a.createdAt),
        customer: a.customer?.customerName,
        community: a.community?.name,
      })),
      activities: (activities as any[]).map((a) => ({
        id: a.id,
        type: a.activityType,
        icon: a.icon || getActivityIcon(a.activityType),
        title: a.title,
        detail: a.detail,
        amount: a.amount ? Number(a.amount) : null,
        time: formatRelativeTime(a.createdAt),
      })),
      deliveries: (deliveries as any[]).map((d) => ({
        id: d.id,
        time: formatTime(d.scheduledTime),
        title: d.title,
        location: d.location || (d.community ? `${d.community.name} - Lot ${d.lotNumber}` : null),
        status: d.status,
      })),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
