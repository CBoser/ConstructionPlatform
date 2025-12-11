import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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
 */

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

    // Material Orders (from PortalOrder)
    const materialOrders = await prisma.portalOrder.aggregate({
      where: {
        orderType: 'po',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    const todayOrders = await prisma.portalOrder.aggregate({
      where: {
        orderType: 'po',
        createdAt: { gte: startOfToday },
      },
      _sum: { amount: true },
    });

    // Pending Approvals (from PurchaseOrder model)
    const pendingApprovals = await prisma.purchaseOrder.count({
      where: { status: 'DRAFT' }, // DRAFT status used as "pending approval"
    });

    // On Time Delivery calculation
    const totalDeliveries = await prisma.portalOrder.count({
      where: {
        orderType: 'po',
        status: 'delivered',
        createdAt: { gte: startOfMonth },
      },
    });

    const lateDeliveries = await prisma.portalOrder.count({
      where: {
        orderType: 'po',
        status: 'late',
        createdAt: { gte: startOfMonth },
      },
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

    const alerts = await prisma.systemAlert.findMany({
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
      alerts.map((a) => ({
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

    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: { select: { customerName: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json(
      activities.map((a) => ({
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

    const deliveries = await prisma.deliverySchedule.findMany({
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
      deliveries.map((d) => ({
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

    const orders = await prisma.portalOrder.findMany({
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

    for (const order of orders) {
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
    const categories = [...new Set(orders.map((o) => o.category || 'Other'))];

    const datasets = categories.map((category) => ({
      label: category,
      data: labels.map((label) => trendData[label]?.[category] || 0),
    }));

    res.json({
      labels,
      datasets,
      summary: {
        totalAmount: orders.reduce((sum, o) => sum + Number(o.amount), 0),
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

    // Run all queries in parallel
    const [
      activeJobsCount,
      jobsLastWeekCount,
      materialOrdersSum,
      todayOrdersSum,
      pendingApprovalsCount,
      deliveredCount,
      lateCount,
      alerts,
      activities,
      deliveries,
    ] = await Promise.all([
      prisma.job.count({
        where: { status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] } },
      }),
      prisma.job.count({
        where: {
          status: { in: ['DRAFT', 'ESTIMATED', 'APPROVED', 'IN_PROGRESS'] },
          createdAt: { lt: startOfWeek },
        },
      }),
      prisma.portalOrder.aggregate({
        where: { orderType: 'po', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.portalOrder.aggregate({
        where: { orderType: 'po', createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),
      prisma.portalOrder.count({
        where: { orderType: 'po', status: 'delivered', createdAt: { gte: startOfMonth } },
      }),
      prisma.portalOrder.count({
        where: { orderType: 'po', status: 'late', createdAt: { gte: startOfMonth } },
      }),
      prisma.systemAlert.findMany({
        where: { isDismissed: false },
        orderBy: [{ alertType: 'asc' }, { createdAt: 'desc' }],
        take: 5,
        include: {
          customer: { select: { customerName: true } },
          community: { select: { name: true } },
        },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { customerName: true } },
        },
      }),
      prisma.deliverySchedule.findMany({
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
      alerts: alerts.map((a) => ({
        id: a.id,
        type: a.alertType,
        icon: getAlertIcon(a.alertType),
        title: a.title,
        message: a.message,
        time: formatRelativeTime(a.createdAt),
        customer: a.customer?.customerName,
        community: a.community?.name,
      })),
      activities: activities.map((a) => ({
        id: a.id,
        type: a.activityType,
        icon: a.icon || getActivityIcon(a.activityType),
        title: a.title,
        detail: a.detail,
        amount: a.amount ? Number(a.amount) : null,
        time: formatRelativeTime(a.createdAt),
      })),
      deliveries: deliveries.map((d) => ({
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
