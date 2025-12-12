/**
 * Teams Notification Service
 *
 * Sends notifications to Microsoft Teams via webhooks.
 * Mirrors the Python teams_notify.py functionality for web-based notifications.
 *
 * Setup:
 * 1. Create an Incoming Webhook in your Teams channel
 * 2. Set TEAMS_WEBHOOK_URL environment variable
 *
 * Channels:
 * - general: Default channel for regular updates
 * - alerts: Critical alerts and errors
 * - automation: Automation status updates
 */

import https from 'https';
import http from 'http';

// =============================================================================
// TYPES
// =============================================================================

interface TeamsSection {
  activityTitle: string;
  activitySubtitle?: string;
  text: string;
  markdown: boolean;
  facts?: { name: string; value: string }[];
}

interface TeamsMessageCard {
  '@type': 'MessageCard';
  '@context': string;
  themeColor: string;
  summary: string;
  sections: TeamsSection[];
}

interface SimpleMessage {
  text: string;
}

type TeamsPayload = TeamsMessageCard | SimpleMessage;

export interface NotificationResult {
  success: boolean;
  channel: string;
  error?: string;
}

// Color constants
export const NotificationColors = {
  INFO: '0076D7',     // Blue
  SUCCESS: '00FF00',  // Green
  WARNING: 'FFA500',  // Orange
  ERROR: 'FF0000',    // Red
} as const;

type NotificationColor = typeof NotificationColors[keyof typeof NotificationColors];

// =============================================================================
// WEBHOOK CONFIGURATION
// =============================================================================

function getWebhookUrl(channel: string = 'general'): string | null {
  // Check channel-specific webhooks
  const channelEnvKey = `TEAMS_WEBHOOK_URL_${channel.toUpperCase()}`;
  const channelUrl = process.env[channelEnvKey];
  if (channelUrl) {
    return channelUrl;
  }

  // Fall back to default webhook
  const defaultUrl = process.env.TEAMS_WEBHOOK_URL;
  if (defaultUrl) {
    return defaultUrl;
  }

  return null;
}

// =============================================================================
// MESSAGE FORMATTING
// =============================================================================

function formatAdaptiveCard(
  title: string,
  message: string,
  color: string = NotificationColors.INFO
): TeamsMessageCard {
  const now = new Date();
  const subtitle = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: color,
    summary: title,
    sections: [
      {
        activityTitle: title,
        activitySubtitle: subtitle,
        text: message,
        markdown: true,
      },
    ],
  };
}

function formatSimpleMessage(message: string): SimpleMessage {
  return { text: message };
}

// =============================================================================
// SEND FUNCTIONS
// =============================================================================

async function sendTeamsMessage(
  payload: TeamsPayload,
  channel: string = 'general'
): Promise<NotificationResult> {
  const webhookUrl = getWebhookUrl(channel);

  if (!webhookUrl) {
    console.log(`[TeamsNotify] Webhook not configured for channel: ${channel} - skipping notification`);
    return {
      success: false,
      channel,
      error: 'Webhook URL not configured',
    };
  }

  return new Promise((resolve) => {
    try {
      const url = new URL(webhookUrl);
      const data = JSON.stringify(payload);

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
        timeout: 10000,
      };

      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log(`[TeamsNotify] Notification sent to ${channel}`);
          resolve({ success: true, channel });
        } else {
          console.error(`[TeamsNotify] Webhook returned status ${res.statusCode}`);
          resolve({
            success: false,
            channel,
            error: `HTTP ${res.statusCode}`,
          });
        }
      });

      req.on('error', (error) => {
        console.error(`[TeamsNotify] Failed to send notification: ${error.message}`);
        resolve({
          success: false,
          channel,
          error: error.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('[TeamsNotify] Request timeout');
        resolve({
          success: false,
          channel,
          error: 'Request timeout',
        });
      });

      req.write(data);
      req.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TeamsNotify] Unexpected error: ${errorMessage}`);
      resolve({
        success: false,
        channel,
        error: errorMessage,
      });
    }
  });
}

/**
 * Send a formatted notification to Teams
 */
export async function sendTeamsNotification(
  title: string,
  message: string,
  channel: string = 'general',
  color: NotificationColor = NotificationColors.INFO
): Promise<NotificationResult> {
  const payload = formatAdaptiveCard(title, message, color);
  return sendTeamsMessage(payload, channel);
}

// =============================================================================
// SPECIFIC NOTIFICATION TYPES
// =============================================================================

/**
 * Notify about plan intake results
 */
export async function notifyPlanIntake(
  plansDownloaded: string[],
  errors: string[] = []
): Promise<NotificationResult> {
  if (!plansDownloaded.length && !errors.length) {
    return { success: true, channel: 'general' };
  }

  const messageParts: string[] = [];

  if (plansDownloaded.length) {
    messageParts.push(`**${plansDownloaded.length} plans downloaded:**`);
    const displayPlans = plansDownloaded.slice(0, 10);
    displayPlans.forEach((plan) => messageParts.push(`- ${plan}`));
    if (plansDownloaded.length > 10) {
      messageParts.push(`- ... and ${plansDownloaded.length - 10} more`);
    }
  }

  if (errors.length) {
    messageParts.push(`\n**${errors.length} errors:**`);
    const displayErrors = errors.slice(0, 5);
    displayErrors.forEach((error) => messageParts.push(`- ${error}`));
  }

  const color = errors.length ? NotificationColors.WARNING : NotificationColors.SUCCESS;
  return sendTeamsNotification('Plan Intake Complete', messageParts.join('\n'), 'general', color);
}

/**
 * Notify about completeness check results
 */
export async function notifyCompletenessCheck(
  total: number,
  complete: number,
  incomplete: number,
  incompleteJobs?: { subdivision: string; lot: string; missing?: string[] }[]
): Promise<NotificationResult> {
  const messageParts: string[] = [
    '**Summary:**',
    `- Total Jobs: ${total}`,
    `- Complete: ${complete}`,
    `- Incomplete: ${incomplete}`,
  ];

  if (incompleteJobs && incomplete > 0) {
    messageParts.push('\n**Incomplete Jobs:**');
    const displayJobs = incompleteJobs.slice(0, 10);
    displayJobs.forEach((job) => {
      messageParts.push(`- ${job.subdivision} - ${job.lot}`);
      if (job.missing?.length) {
        messageParts.push(`  Missing: ${job.missing.slice(0, 3).join(', ')}`);
      }
    });
  }

  const color = incomplete === 0 ? NotificationColors.SUCCESS : NotificationColors.WARNING;
  return sendTeamsNotification('Completeness Check', messageParts.join('\n'), 'general', color);
}

/**
 * Notify about PDSS sync results
 */
export async function notifyPDSSUpdated(
  newJobs: number = 0,
  updatedJobs: number = 0,
  archivedJobs: number = 0
): Promise<NotificationResult> {
  const messageParts: string[] = [
    '**PDSS Sync Complete**',
    `- New Jobs: ${newJobs}`,
    `- Updated: ${updatedJobs}`,
    `- Archived: ${archivedJobs}`,
  ];

  return sendTeamsNotification('PDSS Sync', messageParts.join('\n'), 'general', NotificationColors.INFO);
}

/**
 * Notify about job status changes
 */
export async function notifyJobStatusChange(
  jobId: string,
  subdivision: string,
  lot: string,
  oldStatus: string,
  newStatus: string,
  changedBy?: string
): Promise<NotificationResult> {
  const messageParts: string[] = [
    `**Job:** ${subdivision} - ${lot}`,
    `**Status Change:** ${oldStatus} -> ${newStatus}`,
  ];

  if (changedBy) {
    messageParts.push(`**Changed By:** ${changedBy}`);
  }

  return sendTeamsNotification('Job Status Updated', messageParts.join('\n'), 'general', NotificationColors.INFO);
}

/**
 * Notify about backup completion
 */
export async function notifyBackupComplete(
  backupType: string,
  files: number,
  sizeMb: number,
  destination?: string
): Promise<NotificationResult> {
  const messageParts: string[] = [
    `**${backupType.charAt(0).toUpperCase() + backupType.slice(1)} Backup Complete**`,
    `- Files: ${files.toLocaleString()}`,
    `- Size: ${sizeMb.toFixed(1)} MB`,
  ];

  if (destination) {
    messageParts.push(`- Location: ${destination}`);
  }

  return sendTeamsNotification('Backup Complete', messageParts.join('\n'), 'general', NotificationColors.SUCCESS);
}

/**
 * Send error notification
 */
export async function notifyError(
  agentName: string,
  errorMessage: string,
  details?: string
): Promise<NotificationResult> {
  const messageParts: string[] = [
    `**Agent:** ${agentName}`,
    `**Error:** ${errorMessage}`,
  ];

  if (details) {
    messageParts.push(`\n**Details:**\n${details.substring(0, 500)}`);
  }

  return sendTeamsNotification(
    `Agent Error: ${agentName}`,
    messageParts.join('\n'),
    'alerts',
    NotificationColors.ERROR
  );
}

/**
 * Notify about SupplyPro daily report
 */
export async function notifySupplyProReport(
  dashboard: { newOrders?: number; toDo?: number; changeOrders?: number },
  epoSummary: { total?: number; totalAmount?: number; pending?: number; pendingAmount?: number },
  documents?: { totalUnviewed?: number }
): Promise<NotificationResult> {
  const messageParts: string[] = [
    '**Dashboard:**',
    `- New Orders: ${(dashboard.newOrders ?? 0).toLocaleString()}`,
    `- To Do: ${(dashboard.toDo ?? 0).toLocaleString()}`,
    `- Change Orders: ${dashboard.changeOrders ?? 0}`,
    '',
    '**EPO Summary:**',
    `- Total: ${epoSummary.total ?? 0} ($${(epoSummary.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
    `- Pending: ${epoSummary.pending ?? 0} ($${(epoSummary.pendingAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
  ];

  if (documents?.totalUnviewed) {
    messageParts.push(`\n**New Documents:** ${documents.totalUnviewed} unviewed`);
  }

  const color = (epoSummary.pending ?? 0) > 0 ? NotificationColors.WARNING : NotificationColors.INFO;
  return sendTeamsNotification('SupplyPro Daily Report', messageParts.join('\n'), 'general', color);
}

/**
 * Test the webhook connection
 */
export async function testWebhook(): Promise<NotificationResult> {
  return sendTeamsNotification(
    'MindFlow Test',
    'This is a test notification from MindFlow.\n\nIf you can see this, your webhook is configured correctly!',
    'general',
    NotificationColors.SUCCESS
  );
}

// =============================================================================
// SERVICE CLASS (alternative OOP interface)
// =============================================================================

class TeamsNotifyService {
  async send(title: string, message: string, channel?: string, color?: NotificationColor) {
    return sendTeamsNotification(title, message, channel, color);
  }

  async notifyPlanIntake(plans: string[], errors?: string[]) {
    return notifyPlanIntake(plans, errors);
  }

  async notifyPDSSUpdated(newJobs: number, updatedJobs: number, archivedJobs: number) {
    return notifyPDSSUpdated(newJobs, updatedJobs, archivedJobs);
  }

  async notifyJobStatusChange(
    jobId: string,
    subdivision: string,
    lot: string,
    oldStatus: string,
    newStatus: string,
    changedBy?: string
  ) {
    return notifyJobStatusChange(jobId, subdivision, lot, oldStatus, newStatus, changedBy);
  }

  async notifyError(agentName: string, errorMessage: string, details?: string) {
    return notifyError(agentName, errorMessage, details);
  }

  async test() {
    return testWebhook();
  }

  isConfigured(channel: string = 'general'): boolean {
    return getWebhookUrl(channel) !== null;
  }
}

// Export singleton instance
export const teamsNotifyService = new TeamsNotifyService();
export default TeamsNotifyService;
