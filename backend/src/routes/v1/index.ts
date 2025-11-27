import { Router } from 'express';
import authRoutes from '../auth';
import customerRoutes from '../customer';
import spreadsheetRoutes from '../spreadsheet';
import planRoutes from '../plan';
import materialRoutes from '../material';
import { v1VersionHeader } from '../../middleware/apiVersion';

/**
 * API Version 1 Router
 *
 * Aggregates all v1 API routes under /api/v1
 *
 * Routes:
 * - /api/v1/auth       - Authentication endpoints
 * - /api/v1/customers  - Customer management
 * - /api/v1/plans      - Plan management
 * - /api/v1/materials  - Material management
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

// Tools & Utilities
v1Router.use('/spreadsheet', spreadsheetRoutes);

export default v1Router;
