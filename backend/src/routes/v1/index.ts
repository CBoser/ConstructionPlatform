import { Router } from 'express';
import authRoutes from '../auth';
import customerRoutes from '../customer';
import spreadsheetRoutes from '../spreadsheet';
import planRoutes from '../plan';
import materialRoutes from '../material';
import jobRoutes from '../job';
import pdssRoutes from '../pdss';
import portalSyncRoutes from '../portalSync';
import dashboardRoutes from '../dashboard';
import teamsRoutes from '../teamsNotify';
import feedbackRoutes from '../feedback';
import { v1VersionHeader } from '../../middleware/apiVersion';

/**
 * API Version 1 Router
 *
 * Aggregates all v1 API routes under /api/v1
 *
 * Routes:
 * - /api/v1/auth         - Authentication endpoints
 * - /api/v1/customers    - Customer management
 * - /api/v1/plans        - Plan management
 * - /api/v1/materials    - Material management
 * - /api/v1/jobs         - Job management
 * - /api/v1/pdss         - PDSS tracking (Plan Data Status Sheet)
 * - /api/v1/portal-sync  - Portal sync endpoints (Python agent integration)
 * - /api/v1/dashboard    - Dashboard data endpoints
 * - /api/v1/teams        - Teams notification endpoints
 * - /api/v1/feedback     - Feedback and learning system
 */

const v1Router = Router();

// Add version header to all v1 routes
v1Router.use(v1VersionHeader);

// Foundation Layer Routes
v1Router.use('/auth', authRoutes);
v1Router.use('/customers', customerRoutes);

// Plan & Material Management
v1Router.use('/plans', planRoutes);
v1Router.use('/materials', materialRoutes);

// Job Management
v1Router.use('/jobs', jobRoutes);

// PDSS Tracking
v1Router.use('/pdss', pdssRoutes);

// Tools & Utilities
v1Router.use('/spreadsheet', spreadsheetRoutes);

// Portal Integration & Dashboard (Python Agent Integration)
v1Router.use('/portal-sync', portalSyncRoutes);
v1Router.use('/dashboard', dashboardRoutes);

// Teams Notifications
v1Router.use('/teams', teamsRoutes);

// Feedback & Learning System
v1Router.use('/feedback', feedbackRoutes);

export default v1Router;
