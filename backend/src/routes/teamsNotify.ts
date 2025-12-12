/**
 * Teams Notification Routes
 *
 * API endpoints for sending Teams notifications from the web platform.
 *
 * Routes:
 * - POST /teams/test - Test webhook connection
 * - POST /teams/notify - Send custom notification
 * - GET /teams/status - Check webhook configuration status
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  teamsNotifyService,
  sendTeamsNotification,
  testWebhook,
  notifyPDSSUpdated,
  notifyJobStatusChange,
  NotificationColors,
} from '../services/teamsNotify';

const router = Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const NotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  channel: z.enum(['general', 'alerts', 'automation']).optional().default('general'),
  color: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional().default('INFO'),
});

const JobStatusNotificationSchema = z.object({
  jobId: z.string(),
  subdivision: z.string(),
  lot: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
  changedBy: z.string().optional(),
});

const PDSSNotificationSchema = z.object({
  newJobs: z.number().default(0),
  updatedJobs: z.number().default(0),
  archivedJobs: z.number().default(0),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /teams/status
 * Check webhook configuration status
 */
router.get('/status', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const channels = ['general', 'alerts', 'automation'];
    const status: Record<string, boolean> = {};

    channels.forEach((channel) => {
      status[channel] = teamsNotifyService.isConfigured(channel);
    });

    const isAnyConfigured = Object.values(status).some((v) => v);

    res.json({
      configured: isAnyConfigured,
      channels: status,
      message: isAnyConfigured
        ? 'Teams webhook is configured'
        : 'No Teams webhook configured. Set TEAMS_WEBHOOK_URL environment variable.',
    });
  } catch (error) {
    console.error('[TeamsNotify] Error checking status:', error);
    res.status(500).json({
      error: 'Failed to check webhook status',
    });
  }
});

/**
 * POST /teams/test
 * Test webhook connection
 */
router.post('/test', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (_req: Request, res: Response) => {
  try {
    const result = await testWebhook();

    if (result.success) {
      res.json({
        success: true,
        message: 'Test notification sent successfully',
        channel: result.channel,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test notification',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[TeamsNotify] Error testing webhook:', error);
    res.status(500).json({
      error: 'Failed to test webhook',
    });
  }
});

/**
 * POST /teams/notify
 * Send custom notification
 */
router.post('/notify', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const validation = NotificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
    }

    const { title, message, channel, color } = validation.data;
    const colorValue = NotificationColors[color as keyof typeof NotificationColors];

    const result = await sendTeamsNotification(title, message, channel, colorValue);

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification sent successfully',
        channel: result.channel,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send notification',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[TeamsNotify] Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
    });
  }
});

/**
 * POST /teams/notify/job-status
 * Send job status change notification
 */
router.post('/notify/job-status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = JobStatusNotificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
    }

    const { jobId, subdivision, lot, oldStatus, newStatus, changedBy } = validation.data;
    const result = await notifyJobStatusChange(jobId, subdivision, lot, oldStatus, newStatus, changedBy);

    res.json({
      success: result.success,
      message: result.success ? 'Job status notification sent' : 'Failed to send notification',
      error: result.error,
    });
  } catch (error) {
    console.error('[TeamsNotify] Error sending job status notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
    });
  }
});

/**
 * POST /teams/notify/pdss
 * Send PDSS sync notification
 */
router.post('/notify/pdss', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = PDSSNotificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
    }

    const { newJobs, updatedJobs, archivedJobs } = validation.data;
    const result = await notifyPDSSUpdated(newJobs, updatedJobs, archivedJobs);

    res.json({
      success: result.success,
      message: result.success ? 'PDSS notification sent' : 'Failed to send notification',
      error: result.error,
    });
  } catch (error) {
    console.error('[TeamsNotify] Error sending PDSS notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
    });
  }
});

export default router;
