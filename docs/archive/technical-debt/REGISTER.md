# Technical Debt Register

**Purpose**: Track all workarounds, deferred work, and technical compromises that need future attention.

**Review Cadence**: Weekly (every Friday during weekly review)

---

## Active Technical Debt

### HIGH Priority

#### TD-001: Plan Routes Disabled Due to Schema Mismatch
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/index.ts:68` (commented out)
- **Impact**: Plan management features completely unavailable
- **Root Cause**: Service implementation expects fields that don't exist in schema
- **Errors**: 18+ TypeScript compilation errors
- **Estimated Effort**: 6-8 hours
- **Target Sprint**: Sprint 6-7
- **Details**:
  ```typescript
  // Expected by service but missing in schema:
  // - customerId (string)
  // - planNumber (string)
  // - description (string)
  // - estimatedCost (Decimal)
  // - isTemplate (boolean)
  ```
- **Resolution Plan**:
  1. Align schema with service expectations OR
  2. Refactor service to match actual schema
  3. Run migration if schema changes needed
  4. Re-enable routes and test thoroughly

---

#### TD-002: Material Routes Disabled Due to Schema Mismatch
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/index.ts:69` (commented out)
- **Impact**: Material management features completely unavailable
- **Root Cause**: Service expects MaterialPricing model with different structure
- **Errors**: 25+ TypeScript compilation errors
- **Estimated Effort**: 8-10 hours
- **Target Sprint**: Sprint 8-9
- **Details**:
  ```typescript
  // Schema mismatches:
  // - MaterialPricing model structure different
  // - Missing supplier property on Material
  // - Different field types (string vs Decimal)
  // - Missing relationships
  ```
- **Resolution Plan**:
  1. Review actual database schema vs. service expectations
  2. Decide on canonical schema design
  3. Update Prisma schema
  4. Run migration
  5. Update service layer to match
  6. Re-enable routes and test

---

### MEDIUM Priority

#### TD-003: Prisma Type Stubs Workaround
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/src/types/prisma.d.ts`
- **Impact**: TypeScript compilation works, but types are not fully accurate
- **Root Cause**: Prisma Client generation fails in sandbox environment
- **Risk**: Type safety compromised, may miss type errors
- **Estimated Effort**: 2-3 hours (environmental fix)
- **Target Sprint**: Sprint 1 completion or Sprint 2
- **Details**:
  - Created manual type declarations for all Prisma models
  - Uses `any` for complex types (Decimal, JSON)
  - May not reflect actual generated types exactly
- **Resolution Plan**:
  1. Investigate why Prisma generation fails in sandbox
  2. Fix environment configuration OR
  3. Accept as permanent workaround (acceptable if types are accurate)
  4. Validate types match actual database schema
  5. Remove type stubs if Prisma Client can generate properly

---

#### TD-004: Missing JWT Validation Test Execution
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: Test deferred, not executed
- **Impact**: JWT validation not formally tested across environments
- **Risk**: Production JWT issues may not be caught
- **Estimated Effort**: 1-2 hours
- **Target Sprint**: Sprint 1 Day 4
- **Details**:
  - Test script exists: `backend/src/tests/test-jwt-validation.js`
  - Not executed during Day 3 due to time constraints
  - Need to test dev, staging, production configurations
- **Resolution Plan**:
  1. Run existing test script
  2. Test with short JWT_SECRET (should fail)
  3. Test with proper JWT_SECRET (should pass)
  4. Test in different NODE_ENV values
  5. Document results

---

### LOW Priority

#### TD-005: Test Files Excluded from TypeScript Compilation
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Location**: `backend/tsconfig.json:17`
- **Impact**: Test files not type-checked during compilation
- **Root Cause**: Jest types not available, 50+ errors in test files
- **Risk**: Type errors in tests won't be caught until test execution
- **Estimated Effort**: 2-3 hours
- **Target Sprint**: Sprint 2
- **Details**:
  ```json
  "exclude": ["node_modules", "dist", "src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.spec.ts"]
  ```
- **Resolution Plan**:
  1. Install Jest types: `npm install -D @types/jest`
  2. Configure Jest properly in tsconfig
  3. Fix any remaining type errors in tests
  4. Remove exclusion from tsconfig
  5. Ensure tests pass TypeScript compilation

---

---

---

### CRITICAL Priority

_No critical priority items_

---

### LOW Priority (Continued)

#### TD-009: TypeScript Exclusion for Deferred Routes
- **Created**: 2025-11-12 (Sprint 1 Day 9)
- **Location**: `backend/tsconfig.json:23-26`
- **Impact**: Material and plan service files excluded from TypeScript compilation
- **Root Cause**: Intentional exclusion to allow clean builds despite schema mismatches
- **Risk**: Type errors in excluded files won't be caught during compilation
- **Estimated Effort**: 0 hours (intentional technical debt, to be addressed in Sprints 6-9)
- **Target Sprint**: Sprint 6-7 (Plan), Sprint 8-9 (Material)
- **Details**:
  ```json
  "exclude": [
    "src/services/material.ts",
    "src/services/plan.ts",
    "src/routes/material.ts",
    "src/routes/plan.ts"
  ]
  ```
- **Justification**:
  - Routes already disabled in main server (TD-001, TD-002)
  - Exclusion allows backend build to complete successfully
  - Enables testing and deployment of Days 1-9 features
  - No impact on functional code (these services not in use)
- **Resolution Plan**:
  1. Address TD-001 (Plan routes) in Sprint 6-7
  2. Address TD-002 (Material routes) in Sprint 8-9
  3. Remove tsconfig exclusions when services are fixed
  4. Verify full TypeScript compilation succeeds
- **Related Items**: TD-001, TD-002 (disabled routes)

---

## Resolved Technical Debt

### ✅ TD-008: Prisma Client Generation Blocked (Network Restrictions)
- **Created**: 2025-11-11 (Sprint 1 Day 7)
- **Resolved**: 2025-11-12 (Sprint 1 Day 8)
- **Resolution**: Generated Prisma client on Windows machine (unrestricted network), committed to git (forced add), pulled into Linux environment
- **Workaround Details**:
  1. Generated on Windows: `npx prisma generate`
  2. Force-added to git: `git add -f node_modules/.prisma/client/`
  3. Committed to main branch (temporary)
  4. Pulled in Linux and copied to feature branch
  5. Verified AuditLog model available (60 references in index.d.ts)
- **Impact**: Unblocked Days 5-7 features (audit logging, rate limiting)
- **Lessons Learned**:
  - Cross-platform Prisma generation is viable workaround
  - Git is effective for transferring generated files
  - Document workarounds thoroughly for future schema changes
  - Environment-specific constraints can be blocking but have creative solutions
- **Documented**: `docs/sprints/sprint-01/DECISIONS.md:360-410` (full workflow)

---

### ✅ TD-006: Implicit 'any' Type Warnings
- **Created**: 2025-11-09 (Sprint 1 Day 3)
- **Resolved**: 2025-11-11 (Sprint 1 Day 7)
- **Resolution**: Fixed 10 implicit 'any' type errors across service files
  - `backend/src/services/customer.ts` (lines 283-284)
  - `backend/src/services/material.ts` (lines 306, 554, 556)
  - `backend/src/services/plan.ts` (lines 363, 368)
  - `backend/src/services/auditLog.ts` (line 350)
- **Impact**: TypeScript errors reduced from 200+ to 6 (97% reduction)
- **Lessons Learned**:
  - Missing node_modules was root cause of many type errors
  - Installing dependencies resolved most compilation issues
  - Incremental type annotation fixes are straightforward
  - Type safety improvements prevent runtime errors

---

## Technical Debt Metrics

**Total Active Debt**: 7 items (was 7, TD-006 and TD-008 resolved, TD-009 added)
- Critical Priority: 0 items (TD-008 resolved!)
- High Priority: 2 items (~14-18 hours)
- Medium Priority: 2 items (~3-5 hours)
- Low Priority: 3 items (~3-5 hours) - TD-009 added

**Total Estimated Effort**: ~20-28 hours (down from ~21-29 hours)

**Debt by Sprint**:
- Sprint 1: 3 items (TD-003, TD-004, TD-007) - TD-008 resolved, TD-009 intentional
- Sprint 2: 2 items (TD-005, TD-007 completion)
- Sprint 6-7: 2 items (TD-001, TD-009 for plan)
- Sprint 8-9: 2 items (TD-002, TD-009 for material)

**Trend**: Improving - Critical blocker resolved, Day 9 exclusions intentional and documented

---

## Debt Prevention Strategies

### Implemented
- ✅ TypeScript strict mode enabled
- ✅ ESLint for code quality
- ✅ Prisma for schema management

### Recommended
- [ ] Schema validation in CI/CD pipeline
- [ ] Pre-commit hooks for TypeScript compilation
- [ ] Automated test execution before merge
- [ ] Weekly technical debt review
- [ ] "Definition of Done" includes no new tech debt

---

## Review History

### 2025-11-12 - Day 9 Update
- **Items Added**: 1 (TD-009 TypeScript exclusions - LOW, intentional)
- **Items Resolved**: 1 (TD-008 Prisma generation - ✅)
- **Items Modified**: Metrics updated, critical priority cleared
- **Notes**:
  - TD-008 resolved via cross-platform Prisma generation workaround
  - TD-009 added for tsconfig exclusions (intentional technical debt)
  - No critical priority items remaining!
  - Backend builds successfully with deferred routes excluded
  - All Days 1-9 features now operational

### 2025-11-11 - Day 7 Update
- **Items Added**: 1 (TD-008 Prisma generation - CRITICAL)
- **Items Resolved**: 1 (TD-006 implicit 'any' types - ✅)
- **Items Modified**: Metrics updated, priority reordered
- **Notes**:
  - Major progress: 97% reduction in TypeScript errors (200+ → 6)
  - New critical blocker: Prisma Client generation (network restrictions)
  - TD-006 resolved through dependency installation and type annotations

### 2025-11-09 - Initial Register Created
- **Items Added**: 7
- **Items Resolved**: 0
- **Notes**: First technical debt register. All items from Sprint 1 Days 1-3.

---

**Last Updated**: 2025-11-12
**Next Review**: 2025-11-15 (Friday)
