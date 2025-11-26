import { Router } from 'express';
import authRoutes from '../auth';
import customerRoutes from '../customer';
import spreadsheetRoutes from '../spreadsheet';
// import planRoutes from '../plan'; // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 6-7)
// import materialRoutes from '../material'; // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 8-9)
import { v1VersionHeader } from '../../middleware/apiVersion';

/**
 * API Version 1 Router
 *
 * Aggregates all v1 API routes under /api/v1
 *
 * Sprint 1 Day 9: Initial implementation
 *
 * Routes:
 * - /api/v1/auth       - Authentication endpoints
 * - /api/v1/customers  - Customer management
 *
 * Deferred (schema refactoring needed):
 * - /api/v1/plans      - Sprint 6-7
 * - /api/v1/materials  - Sprint 8-9
 */

const v1Router = Router();

// Add version header to all v1 routes
v1Router.use(v1VersionHeader);

// Foundation Layer Routes (Phase 1)
v1Router.use('/auth', authRoutes);
v1Router.use('/customers', customerRoutes);

// Tools & Utilities
v1Router.use('/spreadsheet', spreadsheetRoutes);

// Future routes (deferred to later sprints)
// v1Router.use('/plans', planRoutes);      // Sprint 6-7
// v1Router.use('/materials', materialRoutes); // Sprint 8-9

export default v1Router;
