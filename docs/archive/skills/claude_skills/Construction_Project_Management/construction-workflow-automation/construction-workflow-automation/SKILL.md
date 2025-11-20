---
name: construction-workflow-automation
description: Specialized skill for implementing automated workflows and business logic for the construction platform. Use when building workflow engines for job lifecycle management (plan start → completion), PDSS document routing, option validation logic, schedule optimization, contract approvals, notification systems, or time-based triggers. Includes state machines, business rules, notification patterns, and integration orchestration for construction processes.
---

# Construction Workflow Automation

Comprehensive guide for implementing automated workflows and business logic in the construction project management platform.

## Workflow Architecture

### Technology Stack
- **Workflow Engine**: Custom state machine with event triggers
- **Job Scheduling**: node-cron for time-based tasks
- **Message Queue**: Bull (Redis-based) for async processing
- **Notifications**: SendGrid (email), Twilio (SMS), Push notifications
- **Events**: EventEmitter for internal events
- **Logging**: Winston for workflow audit trails

## Core Workflow Patterns

### 1. Job Lifecycle State Machine

```javascript
// workflows/JobLifecycleWorkflow.js
const { EventEmitter } = require('events');

class JobLifecycleWorkflow extends EventEmitter {
  constructor() {
    super();
    this.states = {
      plan_start: {
        allowedTransitions: ['pdss_initiated', 'cancelled'],
        onEnter: this.handlePlanStart.bind(this),
        requiredData: ['planId', 'subdivisionId', 'lotNumber'],
      },
      pdss_initiated: {
        allowedTransitions: ['plan_review', 'plan_start', 'on_hold'],
        onEnter: this.handlePDSSInitiated.bind(this),
        requiredData: ['pdssDocuments'],
      },
      plan_review: {
        allowedTransitions: ['approved', 'plan_start', 'on_hold'],
        onEnter: this.handlePlanReview.bind(this),
        checks: [this.checkDocumentCompleteness],
      },
      approved: {
        allowedTransitions: ['in_production', 'plan_review', 'on_hold'],
        onEnter: this.handleApproved.bind(this),
        autoActions: ['createProductionSchedule', 'notifyTeam'],
      },
      in_production: {
        allowedTransitions: ['quality_check', 'on_hold'],
        onEnter: this.handleInProduction.bind(this),
        monitoringRules: ['checkScheduleDeviation', 'trackMilestones'],
      },
      quality_check: {
        allowedTransitions: ['completed', 'in_production', 'on_hold'],
        onEnter: this.handleQualityCheck.bind(this),
        requiredApprovals: ['qualityInspector'],
      },
      completed: {
        allowedTransitions: [],
        onEnter: this.handleCompleted.bind(this),
        finalActions: ['archiveDocuments', 'generateReport', 'updateMetrics'],
      },
      on_hold: {
        allowedTransitions: ['plan_start', 'pdss_initiated', 'plan_review', 'approved', 'in_production', 'cancelled'],
        onEnter: this.handleOnHold.bind(this),
        requiresReason: true,
      },
      cancelled: {
        allowedTransitions: [],
        onEnter: this.handleCancelled.bind(this),
        requiresReason: true,
      },
    };
  }

  /**
   * Transition job to new state
   */
  async transitionTo(job, newState, context = {}) {
    const currentState = this.states[job.status];
    const targetState = this.states[newState];

    if (!targetState) {
      throw new Error(`Invalid state: ${newState}`);
    }

    // Check if transition is allowed
    if (!currentState.allowedTransitions.includes(newState)) {
      throw new Error(
        `Cannot transition from ${job.status} to ${newState}. ` +
        `Allowed transitions: ${currentState.allowedTransitions.join(', ')}`
      );
    }

    // Validate required data
    if (targetState.requiredData) {
      const missingData = targetState.requiredData.filter(field => !job[field]);
      if (missingData.length > 0) {
        throw new Error(`Missing required data: ${missingData.join(', ')}`);
      }
    }

    // Run state checks
    if (targetState.checks) {
      for (const check of targetState.checks) {
        const result = await check(job, context);
        if (!result.passed) {
          throw new Error(`State check failed: ${result.reason}`);
        }
      }
    }

    // Execute transition
    const oldState = job.status;
    job.status = newState;
    job.statusUpdatedAt = new Date();
    
    // Save to database
    await job.save();

    // Log transition
    await this.logTransition(job, oldState, newState, context);

    // Execute onEnter actions
    if (targetState.onEnter) {
      await targetState.onEnter(job, context);
    }

    // Execute auto actions
    if (targetState.autoActions) {
      for (const action of targetState.autoActions) {
        await this[action](job, context);
      }
    }

    // Emit event for other systems
    this.emit('stateChanged', {
      jobId: job.id,
      jobNumber: job.jobNumber,
      oldState,
      newState,
      timestamp: new Date(),
    });

    return job;
  }

  /**
   * Plan Start state handler
   */
  async handlePlanStart(job, context) {
    // Create initial PDSS entry
    await this.createInitialPDSS(job);

    // Assign project coordinator
    await this.assignCoordinator(job);

    // Send welcome notification to client
    await this.notifyClient(job, 'job_started');

    // Create initial timeline
    await this.createTimeline(job);
  }

  /**
   * PDSS Initiated state handler
   */
  async handlePDSSInitiated(job, context) {
    // Validate PDSS documents
    const validation = await this.validatePDSSDocuments(job);
    if (!validation.complete) {
      await this.notifyTeam(job, 'missing_pdss_documents', {
        missing: validation.missingDocuments,
      });
    }

    // Route documents for review
    await this.routeForReview(job);

    // Set review deadline
    await this.setReviewDeadline(job, 5); // 5 business days
  }

  /**
   * Plan Review state handler
   */
  async handlePlanReview(job, context) {
    // Assign reviewers based on plan complexity
    const reviewers = await this.assignReviewers(job);

    // Create review tasks
    for (const reviewer of reviewers) {
      await this.createReviewTask(job, reviewer);
    }

    // Set review checkpoints
    await this.scheduleReviewCheckpoint(job, 2); // Check in 2 days
  }

  /**
   * Approved state handler
   */
  async handleApproved(job, context) {
    // Generate production documents
    await this.generateProductionDocs(job);

    // Notify all stakeholders
    await this.notifyStakeholders(job, 'plan_approved');

    // Update subdivision metrics
    await this.updateSubdivisionMetrics(job.subdivisionId);
  }

  /**
   * Completion handler
   */
  async handleCompleted(job, context) {
    // Calculate actual vs estimated times
    const performance = await this.calculatePerformanceMetrics(job);

    // Update time estimation models
    await this.updateEstimationModels(job, performance);

    // Generate completion report
    await this.generateCompletionReport(job, performance);

    // Send satisfaction survey to client
    await this.sendSatisfactionSurvey(job);

    // Archive all documents
    await this.archiveJobDocuments(job);
  }

  /**
   * Check document completeness before allowing transition
   */
  async checkDocumentCompleteness(job, context) {
    const requiredDocs = [
      'site_plan',
      'floor_plan',
      'elevation_drawings',
      'foundation_plan',
    ];

    const missingDocs = [];
    for (const docType of requiredDocs) {
      const exists = await PDSSDocument.findOne({
        where: { jobId: job.id, documentType: docType, status: 'approved' },
      });
      if (!exists) {
        missingDocs.push(docType);
      }
    }

    return {
      passed: missingDocs.length === 0,
      reason: missingDocs.length > 0 
        ? `Missing required documents: ${missingDocs.join(', ')}`
        : null,
    };
  }

  /**
   * Log state transition for audit trail
   */
  async logTransition(job, oldState, newState, context) {
    await WorkflowLog.create({
      jobId: job.id,
      eventType: 'state_transition',
      oldState,
      newState,
      triggeredBy: context.userId || 'system',
      reason: context.reason,
      metadata: context.metadata,
      timestamp: new Date(),
    });
  }
}

module.exports = new JobLifecycleWorkflow();
```

### 2. Option Validation Workflow

```javascript
// workflows/OptionValidationWorkflow.js

class OptionValidationWorkflow {
  /**
   * Real-time option validation as user selects
   */
  async validateSelection(planId, selectedOptions, elevation) {
    const validationSteps = [
      this.checkElevationCompatibility,
      this.checkOptionConflicts,
      this.checkRequiredDependencies,
      this.checkScheduleImpact,
      this.checkEngineeringRequirements,
      this.generateRecommendations,
    ];

    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      estimatedImpact: {},
    };

    // Run all validation steps
    for (const step of validationSteps) {
      const stepResult = await step.call(this, planId, selectedOptions, elevation);
      
      if (stepResult.errors) {
        results.errors.push(...stepResult.errors);
        results.isValid = false;
      }
      
      if (stepResult.warnings) {
        results.warnings.push(...stepResult.warnings);
      }
      
      if (stepResult.recommendations) {
        results.recommendations.push(...stepResult.recommendations);
      }
      
      if (stepResult.impact) {
        Object.assign(results.estimatedImpact, stepResult.impact);
      }
    }

    return results;
  }

  /**
   * Check elevation compatibility
   */
  async checkElevationCompatibility(planId, selectedOptions, elevation) {
    const options = await PlanOption.findAll({
      where: { optionCode: selectedOptions },
    });

    const incompatible = options.filter(
      opt => opt.availableElevations.length > 0 && 
             !opt.availableElevations.includes(elevation)
    );

    return {
      errors: incompatible.map(opt => ({
        type: 'ELEVATION_INCOMPATIBLE',
        optionCode: opt.optionCode,
        optionName: opt.optionName,
        message: `${opt.optionName} is not available for elevation ${elevation}`,
      })),
    };
  }

  /**
   * Check for option conflicts
   */
  async checkOptionConflicts(planId, selectedOptions, elevation) {
    const options = await PlanOption.findAll({
      where: { optionCode: selectedOptions },
    });

    const errors = [];

    for (const option of options) {
      const conflicts = option.conflictingOptions.filter(code =>
        selectedOptions.includes(code)
      );

      if (conflicts.length > 0) {
        const conflictNames = await PlanOption.findAll({
          where: { optionCode: conflicts },
          attributes: ['optionName'],
        });

        errors.push({
          type: 'OPTION_CONFLICT',
          optionCode: option.optionCode,
          optionName: option.optionName,
          conflictsWith: conflicts,
          message: `${option.optionName} conflicts with: ${
            conflictNames.map(c => c.optionName).join(', ')
          }`,
        });
      }
    }

    return { errors };
  }

  /**
   * Calculate schedule impact
   */
  async checkScheduleImpact(planId, selectedOptions, elevation) {
    const options = await PlanOption.findAll({
      where: { optionCode: selectedOptions },
    });

    const totalLeadTime = options.reduce(
      (sum, opt) => sum + (opt.leadTimeDays || 0),
      0
    );

    const warnings = [];
    const impact = {
      additionalDays: totalLeadTime,
      impactLevel: totalLeadTime > 14 ? 'high' : totalLeadTime > 7 ? 'medium' : 'low',
    };

    if (totalLeadTime > 14) {
      warnings.push({
        type: 'SCHEDULE_IMPACT',
        message: `Selected options will add ${totalLeadTime} days to schedule`,
        severity: 'high',
      });
    } else if (totalLeadTime > 7) {
      warnings.push({
        type: 'SCHEDULE_IMPACT',
        message: `Selected options will add ${totalLeadTime} days to schedule`,
        severity: 'medium',
      });
    }

    return { warnings, impact };
  }

  /**
   * Generate smart recommendations
   */
  async generateRecommendations(planId, selectedOptions, elevation) {
    const options = await PlanOption.findAll({
      where: { optionCode: selectedOptions },
    });

    // Get all compatible options
    const compatibleCodes = [...new Set(
      options.flatMap(opt => opt.compatibleOptions)
    )].filter(code => !selectedOptions.includes(code));

    if (compatibleCodes.length === 0) {
      return { recommendations: [] };
    }

    // Fetch compatible options
    const compatible = await PlanOption.findAll({
      where: { 
        optionCode: compatibleCodes,
        status: 'available',
      },
    });

    // Calculate recommendation scores
    const recommendations = compatible.map(opt => {
      const frequency = options.filter(
        selected => selected.compatibleOptions.includes(opt.optionCode)
      ).length;

      return {
        optionCode: opt.optionCode,
        optionName: opt.optionName,
        category: opt.category,
        reason: `Frequently selected with your current choices (${frequency}/${options.length})`,
        score: frequency / options.length,
      };
    });

    // Sort by score and return top 5
    recommendations.sort((a, b) => b.score - a.score);

    return {
      recommendations: recommendations.slice(0, 5),
    };
  }
}

module.exports = new OptionValidationWorkflow();
```

### 3. Notification System

```javascript
// workflows/NotificationWorkflow.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationWorkflow {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Notification templates
    this.templates = {
      job_started: {
        subject: 'Your Project Has Started - Job {jobNumber}',
        channels: ['email'],
      },
      plan_approved: {
        subject: 'Plans Approved - Job {jobNumber}',
        channels: ['email', 'sms'],
      },
      schedule_delay: {
        subject: 'Schedule Update - Job {jobNumber}',
        channels: ['email', 'push'],
        priority: 'high',
      },
      missing_documents: {
        subject: 'Action Required - Missing Documents',
        channels: ['email'],
        priority: 'high',
      },
      quality_issue: {
        subject: 'URGENT - Quality Issue Detected',
        channels: ['email', 'sms', 'push'],
        priority: 'urgent',
      },
      job_completed: {
        subject: 'Project Complete - Job {jobNumber}',
        channels: ['email'],
      },
    };
  }

  /**
   * Send notification through appropriate channels
   */
  async send(notificationType, recipients, data) {
    const template = this.templates[notificationType];
    if (!template) {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    const promises = [];

    for (const channel of template.channels) {
      switch (channel) {
        case 'email':
          promises.push(this.sendEmail(template, recipients, data));
          break;
        case 'sms':
          promises.push(this.sendSMS(template, recipients, data));
          break;
        case 'push':
          promises.push(this.sendPushNotification(template, recipients, data));
          break;
      }
    }

    const results = await Promise.allSettled(promises);

    // Log notification sending
    await NotificationLog.create({
      notificationType,
      recipients: recipients.map(r => r.email || r.phone),
      channels: template.channels,
      priority: template.priority || 'normal',
      status: results.every(r => r.status === 'fulfilled') ? 'sent' : 'partial',
      timestamp: new Date(),
    });

    return results;
  }

  /**
   * Send email notification
   */
  async sendEmail(template, recipients, data) {
    const subject = this.interpolate(template.subject, data);
    const html = await this.renderEmailTemplate(template, data);

    return this.emailTransporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: recipients.map(r => r.email).join(','),
      subject,
      html,
    });
  }

  /**
   * Schedule notification for future delivery
   */
  async schedule(notificationType, recipients, data, sendAt) {
    await ScheduledNotification.create({
      notificationType,
      recipients,
      data,
      sendAt,
      status: 'pending',
    });
  }

  /**
   * Digest notifications (e.g., daily summary)
   */
  async sendDailyDigest(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all jobs updated today
    const updatedJobs = await Job.findAll({
      where: {
        updatedAt: { [Op.gte]: today },
      },
      include: ['plan', 'subdivision'],
    });

    // Get pending approvals
    const pendingApprovals = await Job.findAll({
      where: {
        status: 'plan_review',
        assignedTo: userId,
      },
    });

    const digestData = {
      updatedJobs: updatedJobs.length,
      pendingApprovals: pendingApprovals.length,
      jobs: updatedJobs.map(job => ({
        jobNumber: job.jobNumber,
        status: job.status,
        subdivision: job.subdivision.subdivisionName,
      })),
    };

    await this.send('daily_digest', [{ email: user.email }], digestData);
  }

  /**
   * Interpolate template variables
   */
  interpolate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
  }
}

module.exports = new NotificationWorkflow();
```

### 4. Automated Scheduling

```javascript
// workflows/AutomatedScheduler.js
const cron = require('node-cron');
const { Op } = require('sequelize');

class AutomatedScheduler {
  constructor() {
    this.jobs = [];
    this.initialize();
  }

  initialize() {
    // Daily at 6 AM: Send digest notifications
    this.schedule('0 6 * * *', 'dailyDigest', this.sendDailyDigests);

    // Every hour: Check for overdue reviews
    this.schedule('0 * * * *', 'overdueReviews', this.checkOverdueReviews);

    // Every 15 minutes: Update schedule metrics
    this.schedule('*/15 * * * *', 'scheduleMetrics', this.updateScheduleMetrics);

    // Daily at 8 AM: Generate daily reports
    this.schedule('0 8 * * *', 'dailyReports', this.generateDailyReports);

    // Weekly on Monday at 7 AM: Weekly planning
    this.schedule('0 7 * * 1', 'weeklyPlanning', this.weeklyPlanning);

    // Daily at 10 PM: Backup workflow logs
    this.schedule('0 22 * * *', 'backupLogs', this.backupWorkflowLogs);
  }

  /**
   * Schedule a cron job
   */
  schedule(cronExpression, name, handler) {
    const job = cron.schedule(cronExpression, async () => {
      console.log(`Running scheduled task: ${name}`);
      try {
        await handler.call(this);
      } catch (error) {
        console.error(`Error in scheduled task ${name}:`, error);
        await this.logError(name, error);
      }
    });

    this.jobs.push({ name, cronExpression, job });
    console.log(`Scheduled: ${name} (${cronExpression})`);
  }

  /**
   * Send daily digest to all users
   */
  async sendDailyDigests() {
    const users = await User.findAll({ where: { active: true } });
    
    for (const user of users) {
      await NotificationWorkflow.sendDailyDigest(user.id);
    }
  }

  /**
   * Check for overdue plan reviews
   */
  async checkOverdueReviews() {
    const overdueJobs = await Job.findAll({
      where: {
        status: 'plan_review',
        reviewDeadline: { [Op.lt]: new Date() },
      },
      include: ['plan', 'subdivision'],
    });

    for (const job of overdueJobs) {
      // Escalate to manager
      await NotificationWorkflow.send(
        'overdue_review',
        [{ email: job.manager.email }],
        {
          jobNumber: job.jobNumber,
          daysOverdue: Math.floor(
            (new Date() - job.reviewDeadline) / (1000 * 60 * 60 * 24)
          ),
        }
      );

      // Add flag to job
      await job.update({
        flags: [...job.flags, 'overdue_review'],
      });
    }
  }

  /**
   * Weekly planning workflow
   */
  async weeklyPlanning() {
    // Generate upcoming week schedule
    const nextWeekStart = new Date();
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const upcomingJobs = await Job.findAll({
      where: {
        estimatedStartDate: {
          [Op.between]: [nextWeekStart, nextWeekEnd],
        },
        status: { [Op.in]: ['approved', 'in_production'] },
      },
      include: ['plan', 'subdivision'],
    });

    // Generate resource allocation report
    const report = await this.generateResourceAllocation(upcomingJobs);

    // Send to project managers
    const managers = await User.findAll({
      where: { role: 'project_manager' },
    });

    for (const manager of managers) {
      await NotificationWorkflow.send(
        'weekly_planning',
        [{ email: manager.email }],
        { report }
      );
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped: ${name}`);
    });
  }
}

module.exports = new AutomatedScheduler();
```

### 5. Integration Orchestration

```javascript
// workflows/IntegrationOrchestrator.js

class IntegrationOrchestrator {
  /**
   * Orchestrate job creation across all systems
   */
  async createJobWorkflow(jobData) {
    const steps = [
      {
        name: 'validateInput',
        handler: this.validateJobInput,
        rollback: null,
      },
      {
        name: 'createJobRecord',
        handler: this.createJobRecord,
        rollback: this.deleteJobRecord,
      },
      {
        name: 'initializePDSS',
        handler: this.initializePDSS,
        rollback: this.deletePDSS,
      },
      {
        name: 'createTimeline',
        handler: this.createTimeline,
        rollback: this.deleteTimeline,
      },
      {
        name: 'assignTeam',
        handler: this.assignTeam,
        rollback: this.unassignTeam,
      },
      {
        name: 'sendNotifications',
        handler: this.sendCreationNotifications,
        rollback: null,
      },
    ];

    const context = { jobData, createdResources: [] };
    const completedSteps = [];

    try {
      // Execute steps sequentially
      for (const step of steps) {
        console.log(`Executing step: ${step.name}`);
        const result = await step.handler.call(this, context);
        context[step.name] = result;
        completedSteps.push(step);
      }

      return context.createJobRecord;
    } catch (error) {
      console.error('Job creation workflow failed:', error);

      // Rollback completed steps in reverse order
      for (const step of completedSteps.reverse()) {
        if (step.rollback) {
          try {
            await step.rollback.call(this, context);
          } catch (rollbackError) {
            console.error(`Rollback failed for ${step.name}:`, rollbackError);
          }
        }
      }

      throw error;
    }
  }

  /**
   * Validate job input data
   */
  async validateJobInput(context) {
    const { jobData } = context;
    
    // Verify plan exists
    const plan = await Plan.findByPk(jobData.planId);
    if (!plan) {
      throw new Error(`Plan not found: ${jobData.planId}`);
    }

    // Verify subdivision exists
    const subdivision = await Subdivision.findByPk(jobData.subdivisionId);
    if (!subdivision) {
      throw new Error(`Subdivision not found: ${jobData.subdivisionId}`);
    }

    // Validate options if provided
    if (jobData.selectedOptions && jobData.selectedOptions.length > 0) {
      const validation = await OptionValidationWorkflow.validateSelection(
        jobData.planId,
        jobData.selectedOptions,
        jobData.elevation
      );

      if (!validation.isValid) {
        throw new Error(`Invalid option selection: ${
          validation.errors.map(e => e.message).join(', ')
        }`);
      }
    }

    return { validated: true };
  }
}

module.exports = new IntegrationOrchestrator();
```

## Queue-Based Processing

```javascript
// queues/jobQueue.js
const Queue = require('bull');
const jobQueue = new Queue('job-processing', process.env.REDIS_URL);

// Process jobs asynchronously
jobQueue.process('generateReport', async (job) => {
  const { jobId, reportType } = job.data;
  
  // Generate report (long-running task)
  const report = await generateReport(jobId, reportType);
  
  // Store in S3
  await uploadToS3(report);
  
  // Notify user
  await NotificationWorkflow.send('report_ready', [...], { report });
  
  return { reportUrl: report.url };
});

// Add job to queue
const addReportJob = async (jobId, reportType) => {
  await jobQueue.add('generateReport', { jobId, reportType }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};
```

## Monitoring & Alerting

```javascript
// Monitor workflow health
const monitorWorkflows = () => {
  setInterval(async () => {
    // Check for stuck jobs
    const stuckJobs = await Job.findAll({
      where: {
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        updatedAt: { [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    if (stuckJobs.length > 0) {
      await alertTeam('stuck_jobs', { count: stuckJobs.length });
    }

    // Check queue length
    const queueLength = await jobQueue.count();
    if (queueLength > 1000) {
      await alertTeam('high_queue_length', { length: queueLength });
    }
  }, 300000); // Every 5 minutes
};
```
