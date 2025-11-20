# Phase 0: Foundation Repair Strategy
**Version**: 2.0 (Environment-Aware)
**Created**: 2025-11-11
**Duration**: Weeks 0-3 (12-20 hours total)
**Status**: Week 0 Complete - Awaiting Environment Decision

---

## 🎯 EXECUTIVE SUMMARY

**Current Status** (End of Week 0):
- ✅ Custom type declarations removed and backed up
- ✅ Build errors documented (63 current errors)
- ✅ All services audited against schema
- ✅ 51 schema/code sync issues identified
- ⚠️ BLOCKED: Prisma Client cannot generate (network restrictions)

**Critical Blocker**:
```
Error: Failed to fetch the engine file at
https://binaries.prisma.sh/.../schema-engine.gz - 403 Forbidden
```

**Repair Cannot Proceed Until**:
1. Environment allows Prisma Client generation, OR
2. Pre-generated Prisma Client copied from working environment

**Once Unblocked - Repair Sequence**:
- Week 1: Customer Service (4-6 hours) → 0 errors
- Week 2: Material & Plan Services (8-12 hours) → 0 errors
- Week 3: Integration & Validation (2-4 hours) → Full system working

**Total Estimated Time**: 14-22 hours (2-3 weeks at 5-7 hours/week)

---

## 🚨 ENVIRONMENT DECISION REQUIRED

### Option 1: Fix Network Restrictions (Recommended for Long-term)

**Pros**:
- Proper solution
- Enables future Prisma updates
- No manual copying needed

**Cons**:
- Requires environment configuration changes
- May need admin/IT approval

**Steps**:
1. Whitelist `binaries.prisma.sh` in firewall/proxy
2. Run `npx prisma generate`
3. Verify generation succeeds
4. Proceed with Week 1 repairs

---

### Option 2: Copy Pre-Generated Client from Windows

**Pros**:
- Immediate unblock
- Can start repairs today
- No environment changes needed

**Cons**:
- Manual process
- Must repeat for future schema changes
- Temporary workaround

**Steps**:
1. On Windows machine (where Prisma works):
   ```bash
   cd C:\Users\...\ConstructionPlatform\backend
   npx prisma generate
   ```

2. Copy the generated client:
   ```bash
   # Copy from Windows:
   C:\Users\...\ConstructionPlatform\backend\node_modules\.prisma\client\

   # To Linux:
   /home/user/ConstructionPlatform/backend/node_modules/.prisma/client/
   ```

3. Copy the @prisma/client generated files:
   ```bash
   # From Windows:
   C:\Users\...\ConstructionPlatform\backend\node_modules\@prisma\client\

   # To Linux:
   /home/user/ConstructionPlatform/backend/node_modules/@prisma/client/
   ```

4. Verify TypeScript compilation:
   ```bash
   cd /home/user/ConstructionPlatform/backend
   npm run build
   ```

5. If successful, proceed with Week 1 repairs

---

### Option 3: Work in Windows Environment

**Pros**:
- No cross-environment copying
- Prisma generation works
- Native development experience

**Cons**:
- Different environment from deployment
- May have Windows-specific issues

**Steps**:
1. Switch to Windows development environment
2. Generate Prisma Client: `npx prisma generate`
3. Proceed with Week 1-3 repairs
4. Push completed repairs to repository
5. Pull to Linux environment for testing

---

## 📋 DECISION POINT

**You must choose one option above before proceeding.**

**Recommendation**:
- **Short-term**: Option 2 (copy pre-generated client) - fastest unblock
- **Long-term**: Option 1 (fix network) - proper solution

**Once decided, continue to Week 1 repair instructions below.**

---

## WEEK 1: CUSTOMER SERVICE REPAIR (4-6 hours)

**Prerequisites**:
- ✅ Prisma Client generating successfully
- ✅ `npm run build` shows actual errors (not just import errors)

**Goal**: Fix all Customer service errors, achieve 0 errors, smoke tests passing

---

### Step 1.1: Backup Current State (15 min)

```bash
# Create backup of current customer.ts
cp backend/src/services/customer.ts docs/backups/customer.ts.before-repair

# Create git branch for repairs
git checkout -b phase0/customer-service-repair
```

---

### Step 1.2: Fix Critical Issue #1 - Field Name: `name` → `customerName` (60-90 min)

**Affected Lines**: 4, 16, 32, 44, 78, 103, 127, 144, 177, 214, 235, 271

**File**: `backend/src/services/customer.ts`

#### Changes Required:

**A. Update Interfaces** (Lines 3-34):

```typescript
// BEFORE:
export interface CreateCustomerInput {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive?: boolean;
}

// AFTER:
export interface CreateCustomerInput {
  customerName: string;         // ← RENAMED
  customerType: CustomerType;   // ← ADDED (required enum)
  pricingTier?: string;         // ← ADDED (optional)
  primaryContactId?: string;    // ← ADDED (optional FK)
  notes?: string;
  isActive?: boolean;
  // REMOVED: contactEmail, contactPhone, address, city, state, zipCode
  // These belong in CustomerContact model (future work)
}

export interface UpdateCustomerInput {
  customerName?: string;        // ← RENAMED
  customerType?: CustomerType;  // ← ADDED
  pricingTier?: string;         // ← ADDED
  primaryContactId?: string;    // ← ADDED
  notes?: string;
  isActive?: boolean;
  // REMOVED: invalid fields
}

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'customerName' | 'createdAt' | 'updatedAt';  // ← FIXED
  sortOrder?: 'asc' | 'desc';
}
```

**B. Import CustomerType Enum**:

```typescript
// Line 1 - Add to imports:
import { PrismaClient, Customer, CustomerType, Prisma } from '@prisma/client';
```

**C. Update createCustomer Method** (Lines 40-65):

```typescript
async createCustomer(input: CreateCustomerInput): Promise<Customer> {
  try {
    const customer = await db.customer.create({
      data: {
        customerName: input.customerName,    // ← FIXED
        customerType: input.customerType,    // ← ADDED
        pricingTier: input.pricingTier,      // ← ADDED
        primaryContactId: input.primaryContactId,  // ← ADDED
        notes: input.notes,
        isActive: input.isActive ?? true,
        // REMOVED: invalid fields
      },
    });
    return customer;
  } catch (error: unknown) {  // ← ADDED TYPE
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('A customer with this name already exists');
      }
    }
    throw error;
  }
}
```

**D. Update updateCustomer Method** (Lines 120-150):

```typescript
async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  try {
    const customer = await db.customer.update({
      where: { id },
      data: {
        ...(input.customerName && { customerName: input.customerName }),  // ← FIXED
        ...(input.customerType && { customerType: input.customerType }),  // ← ADDED
        ...(input.pricingTier !== undefined && { pricingTier: input.pricingTier }),
        ...(input.primaryContactId !== undefined && { primaryContactId: input.primaryContactId }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        // REMOVED: invalid fields
      },
    });
    return customer;
  } catch (error: unknown) {  // ← ADDED TYPE
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('A customer with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new Error('Customer not found');
      }
    }
    throw error;
  }
}
```

**E. Update listCustomers Method** (Lines 100-180):

```typescript
async listCustomers(query: ListCustomersQuery = {}): Promise<{
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.CustomerWhereInput = {
    ...(query.search && {
      customerName: {           // ← FIXED
        contains: query.search,
        mode: 'insensitive' as const,
      },
    }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
  };

  // Build orderBy
  const orderBy: Prisma.CustomerOrderByWithRelationInput = {
    [query.sortBy || 'customerName']: query.sortOrder || 'asc',  // ← FIXED DEFAULT
  };

  try {
    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {  // ← ADDED TYPE
    if (error instanceof Error) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }
    throw error;
  }
}
```

---

### Step 1.3: Fix Critical Issue #2 - Remove Invalid `plans` Relation (15 min)

**Lines Affected**: 75-82

**File**: `backend/src/services/customer.ts`

**Change**:

```typescript
// BEFORE (Lines 70-98):
async getCustomerById(id: string, includeRelations = false): Promise<Customer | null> {
  const customer = await db.customer.findUnique({
    where: { id },
    include: includeRelations
      ? {
          plans: {  // ← REMOVE THIS - relation doesn't exist
            select: { id: true, name: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
          communities: {
            select: { id: true, name: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        }
      : undefined,
  });
  return customer;
}

// AFTER:
async getCustomerById(id: string, includeRelations = false): Promise<Customer | null> {
  const customer = await db.customer.findUnique({
    where: { id },
    include: includeRelations
      ? {
          communities: {
            select: { id: true, name: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' as const },
          },
          jobs: {  // ← ADD jobs instead (Plans accessible through Jobs)
            select: {
              id: true,
              jobNumber: true,
              status: true,
              createdAt: true,
              plan: {  // ← Nested select to get Plan through Job
                select: { id: true, code: true, name: true, type: true },
              },
            },
            orderBy: { createdAt: 'desc' as const },
          },
        }
      : undefined,
  });
  return customer;
}
```

---

### Step 1.4: Fix All Error Typing Issues (30 min)

**Pattern to Find**:
```typescript
} catch (error) {
```

**Replace With**:
```typescript
} catch (error: unknown) {
  if (error instanceof Error) {
    throw new Error(`Failed to ...: ${error.message}`);
  }
  throw error;
}
```

**Lines to Fix**: 60, 176, 179, 200, 221, 239, 242

**Example - deleteCustomer Method**:

```typescript
// BEFORE:
async deleteCustomer(id: string): Promise<void> {
  try {
    await db.customer.delete({
      where: { id },
    });
  } catch (error) {  // ← NO TYPE
    if (error.code === 'P2025') {
      throw new Error('Customer not found');
    }
    throw error;
  }
}

// AFTER:
async deleteCustomer(id: string): Promise<void> {
  try {
    await db.customer.delete({
      where: { id },
    });
  } catch (error: unknown) {  // ← TYPED
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Customer not found');
    }
    if (error instanceof Error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
    throw error;
  }
}
```

---

### Step 1.5: Remove `: any` Type Bypasses (15 min)

**Lines Affected**: 283-284

**File**: `backend/src/services/customer.ts`

**Change**:

```typescript
// BEFORE:
const totalPlans = stats.plans.reduce((sum: number, plan: any) =>
  sum + (plan._count?.lots || 0), 0);
const totalLots = stats.plans.reduce((sum: number, plan: any) =>
  sum + plan._count.lots, 0);

// AFTER:
interface PlanWithCount {
  _count: { lots: number };
}

const totalPlans = stats.plans.reduce((sum: number, plan: PlanWithCount) =>
  sum + (plan._count?.lots || 0), 0);
const totalLots = stats.plans.reduce((sum: number, plan: PlanWithCount) =>
  sum + plan._count.lots, 0);
```

---

### Step 1.6: Verify and Test (60 min)

**A. TypeScript Compilation**:
```bash
cd backend
npm run build
```

**Expected**: Zero errors in `customer.ts` (other files may still have errors)

**B. Create Smoke Test**:

Create `backend/src/services/__tests__/customer.smoke.test.ts`:

```typescript
import { CustomerType } from '@prisma/client';
import { customerService } from '../customer';

describe('Customer Service Smoke Tests', () => {
  test('should create, read, update, delete customer', async () => {
    // 1. Create
    const customer = await customerService.createCustomer({
      customerName: 'Test Builder',
      customerType: CustomerType.PRODUCTION,
      pricingTier: 'Standard',
      isActive: true,
    });
    expect(customer.id).toBeDefined();
    expect(customer.customerName).toBe('Test Builder');

    // 2. Read
    const fetched = await customerService.getCustomerById(customer.id);
    expect(fetched?.customerName).toBe('Test Builder');

    // 3. Update
    const updated = await customerService.updateCustomer(customer.id, {
      customerName: 'Updated Builder',
    });
    expect(updated.customerName).toBe('Updated Builder');

    // 4. Delete
    await customerService.deleteCustomer(customer.id);
    const deleted = await customerService.getCustomerById(customer.id);
    expect(deleted).toBeNull();
  });
});
```

**C. Run Smoke Test** (if test infrastructure ready):
```bash
npm test -- customer.smoke.test.ts
```

**D. Manual Testing** (if DB available):
1. Start backend: `npm run dev`
2. Test customer endpoints via Postman/curl:
   - POST /api/customers (create)
   - GET /api/customers/:id (read)
   - PUT /api/customers/:id (update)
   - DELETE /api/customers/:id (delete)

---

### Step 1.7: Commit Changes (15 min)

```bash
git add backend/src/services/customer.ts
git commit -m "fix(customer): Align Customer service with Prisma schema

Changes:
- Rename 'name' field to 'customerName' (12 locations)
- Add required 'customerType' enum field
- Add 'pricingTier' and 'primaryContactId' optional fields
- Remove invalid plans relation, use jobs → plan instead
- Remove invalid contact fields (belong in CustomerContact model)
- Fix all error typing (catch error: unknown)
- Remove ': any' type bypasses

Result: customer.ts now compiles with 0 TypeScript errors

Related: Phase 0, Week 1 - Customer Service Repair
"
```

---

### Week 1 Success Criteria

- ✅ `npm run build` shows 0 errors in `customer.ts`
- ✅ All field names match schema (`customerName` not `name`)
- ✅ Required `customerType` field added
- ✅ Invalid `plans` relation removed
- ✅ All error typing fixed (no `catch (error)` without type)
- ✅ All `: any` bypasses removed
- ✅ Smoke test passes (manual or automated)
- ✅ Changes committed to git

**Proceed to Week 2 when all criteria met.**

---

## WEEK 2: MATERIAL & PLAN SERVICES (8-12 hours)

### Part A: Material Service Repair (6-8 hours)

**Goal**: Fix MaterialPricing → PricingHistory model name, field names, achieve 0 errors

---

#### Step 2A.1: Backup and Branch (15 min)

```bash
cp backend/src/services/material.ts docs/backups/material.ts.before-repair
git checkout -b phase0/material-service-repair
```

---

#### Step 2A.2: Fix CRITICAL Issue - Model Name `MaterialPricing` → `PricingHistory` (120-180 min)

**This is the most extensive change** - affects 16+ locations throughout file.

**File**: `backend/src/services/material.ts`

**A. Update Imports** (Line 1):

```typescript
// BEFORE:
import { PrismaClient, Material, MaterialPricing, Prisma } from '@prisma/client';

// AFTER:
import { PrismaClient, Material, PricingHistory, Prisma } from '@prisma/client';
//                              ^^^^^^^^^^^^^^ RENAMED
```

**B. Update All Type References**:

Search for: `MaterialPricing`
Replace with: `PricingHistory`

**Locations**:
- Line 1 (import)
- Line 306 (interface property)
- Line 349 (type annotation)
- Line 372 (query type)
- Line 377 (return type)
- Line 390 (create method)
- Line 401 (query result)
- Line 410 (include type)
- Line 419 (select type)
- Line 439 (where input)
- Line 465 (create input)
- Line 482 (update method)
- Line 492 (return type)
- Line 506 (error handling)
- Line 522 (query method)
- Line 542 (relation name)

**C. Update Relation Name `pricing` → `pricingHistory`**:

Search for: `.pricing` (as relation access)
Replace with: `.pricingHistory`

**Example**:
```typescript
// BEFORE:
const material = await db.material.findUnique({
  where: { id },
  include: { pricing: true },  // ← WRONG
});

// AFTER:
const material = await db.material.findUnique({
  where: { id },
  include: { pricingHistory: true },  // ← CORRECT
});
```

**D. Update PricingHistory Field Names**:

The PricingHistory model has different field structure. Update queries/creates:

```typescript
// Schema Fields:
interface PricingHistory {
  id: string;
  materialId: string;
  baseVendorCost: Decimal;      // ← May be different in code
  commodityAdjustment: Decimal;
  freight: Decimal;
  totalCost: Decimal;
  marginPercentage: Decimal;
  marginAmount: Decimal;
  sellPrice: Decimal;
  effectiveDate: DateTime;
  source?: string;              // "Manual", "RL Update", etc.
}
```

**Update all PricingHistory create/update operations to use these field names.**

---

#### Step 2A.3: Fix Field Names `name` → `description`, `unit` → `unitOfMeasure` (60 min)

**A. Update `name` → `description`**:

Search for Material field access with `name`:
```typescript
// BEFORE:
material.name

// AFTER:
material.description
```

**B. Update `unit` → `unitOfMeasure`**:

```typescript
// BEFORE:
material.unit

// AFTER:
material.unitOfMeasure
```

**Affected**: CreateMaterialInput, UpdateMaterialInput, all queries/creates/updates

---

#### Step 2A.4: Add Missing Material Fields (45 min)

Update Material interfaces to include all schema fields:

```typescript
export interface CreateMaterialInput {
  sku: string;
  description: string;          // ← RENAMED from 'name'
  category: MaterialCategory;
  subcategory?: string;
  unitOfMeasure: string;        // ← RENAMED from 'unit'
  vendorCost: Decimal;          // ← ADD if missing
  freight?: Decimal;            // ← ADD if missing
  isRLLinked?: boolean;         // ← ADD if missing
  rlTag?: string;               // ← ADD if missing
  rlBasePrice?: Decimal;        // ← ADD if missing
  vendorId?: string;            // ← ADD for Vendor relation
  isActive?: boolean;
}
```

---

#### Step 2A.5: Fix Error Typing and `: any` Bypasses (45 min)

**Lines to Fix**: 75, 219, 222, 243, 264, 282, 285, 306, 503, 521, 554, 556

Same pattern as Customer service:
```typescript
} catch (error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
  }
  if (error instanceof Error) {
    throw new Error(`Failed to ...: ${error.message}`);
  }
  throw error;
}
```

Remove `: any` on lines 554, 556 (similar to Customer service pattern).

---

#### Step 2A.6: Verify and Test Material Service (60 min)

```bash
npm run build  # Should show 0 errors in material.ts
```

**Create Smoke Test** (`backend/src/services/__tests__/material.smoke.test.ts`):

```typescript
import { MaterialCategory } from '@prisma/client';
import { materialService } from '../material';

describe('Material Service Smoke Tests', () => {
  test('should create, read, update, delete material', async () => {
    const material = await materialService.createMaterial({
      sku: 'TEST-001',
      description: 'Test Material',
      category: MaterialCategory.DIMENSIONAL_LUMBER,
      unitOfMeasure: 'EA',
      vendorCost: 10.50,
      isActive: true,
    });
    expect(material.id).toBeDefined();

    // Test pricing history
    const pricing = await materialService.createPricingHistory({
      materialId: material.id,
      baseVendorCost: 10.50,
      freight: 0.50,
      totalCost: 11.00,
      marginPercentage: 20,
      marginAmount: 2.20,
      sellPrice: 13.20,
      source: 'Manual',
    });
    expect(pricing.id).toBeDefined();

    // Cleanup
    await materialService.deleteMaterial(material.id);
  });
});
```

---

#### Step 2A.7: Commit Material Changes (15 min)

```bash
git add backend/src/services/material.ts
git commit -m "fix(material): Align Material service with Prisma schema

Critical Changes:
- Rename MaterialPricing model to PricingHistory (16 locations)
- Rename 'pricing' relation to 'pricingHistory' throughout
- Rename 'name' field to 'description'
- Rename 'unit' field to 'unitOfMeasure'
- Add missing Material fields (vendorCost, freight, isRLLinked, etc.)
- Update PricingHistory field structure
- Fix all error typing
- Remove ': any' type bypasses

Result: material.ts now compiles with 0 TypeScript errors

Related: Phase 0, Week 2 Part A - Material Service Repair
"
```

---

### Part B: Plan Service Repair (4-6 hours)

**Goal**: Fix PlanType enum, verify relations, achieve 0 errors

---

#### Step 2B.1: Backup and Branch (15 min)

```bash
cp backend/src/services/plan.ts docs/backups/plan.ts.before-repair
git checkout -b phase0/plan-service-repair
```

---

#### Step 2B.2: DECISION REQUIRED - PlanType Enum Strategy (30 min)

**Current Situation**:
- **Code expects**: `PRODUCTION`, `SEMI_CUSTOM`, `FULL_CUSTOM`
- **Schema has**: `SINGLE_STORY`, `TWO_STORY`, `THREE_STORY`, `DUPLEX`, `TOWNHOME`

**ZERO overlap** - complete mismatch.

**Decision Options**:

**Option A: Keep Schema Enum (Recommended)**
- Update ALL code to use `SINGLE_STORY`, `TWO_STORY`, etc.
- These are more specific and architecturally meaningful
- Better for estimation (stories affect material quantities)

**Option B: Revert Schema to Match Code**
- Change schema.prisma PlanType enum back to `PRODUCTION`, `SEMI_CUSTOM`, `FULL_CUSTOM`
- Less work in code
- Loses architectural specificity

**Option C: Data Migration**
- If existing data uses old enum values
- Create migration script to map:
  - `PRODUCTION` → `SINGLE_STORY` (or based on sqft/bedrooms)
  - `SEMI_CUSTOM` → `TWO_STORY`
  - `FULL_CUSTOM` → `THREE_STORY`

**Recommendation**: **Option A** - Keep schema enum. The schema design is better.

---

#### Step 2B.3: Fix PlanType Enum References (120 min)

**If Option A chosen**, update all PlanType usage:

**A. Update Imports**:
```typescript
import { PrismaClient, Plan, PlanType, PlanTemplateItem, Prisma } from '@prisma/client';
// PlanType will now have: SINGLE_STORY, TWO_STORY, THREE_STORY, DUPLEX, TOWNHOME
```

**B. Update Interfaces**:
```typescript
export interface CreatePlanInput {
  code: string;
  name?: string;
  type: PlanType;  // ← Now expects SINGLE_STORY, etc.
  sqft?: number;
  bedrooms?: number;
  bathrooms?: Decimal;
  garage?: string;
  style?: string;
  version?: number;
  isActive?: boolean;
  pdssUrl?: string;
  notes?: string;
}
```

**C. Update All Enum Value References**:

Search for:
- `PlanType.PRODUCTION` → Change to `PlanType.SINGLE_STORY` (or determine correct mapping)
- `PlanType.SEMI_CUSTOM` → Change to `PlanType.TWO_STORY`
- `PlanType.FULL_CUSTOM` → Change to `PlanType.THREE_STORY`

**D. Update Validation/Filtering**:

```typescript
// BEFORE:
if (plan.type === PlanType.PRODUCTION) { ... }

// AFTER:
if (plan.type === PlanType.SINGLE_STORY) { ... }
```

**Note**: This requires careful thought about business logic. What did `PRODUCTION` mean in the old code? Map it appropriately.

---

#### Step 2B.4: Verify Relations (30 min)

**Check These Relations**:

```typescript
// Schema provides:
plan.elevations        // PlanElevation[]
plan.options           // PlanOption[]
plan.templateItems     // PlanTemplateItem[]  ← Verify name
plan.jobs              // Job[]
plan.variancePatterns  // VariancePattern[]
```

**Ensure code uses**:
- `templateItems` (not `planTemplateItems` or `items`)
- Correct relation names throughout

---

#### Step 2B.5: Check for customerId Field (15 min)

**Question**: Does code expect `plan.customerId`?

**Schema Reality**: Plan has NO `customerId` field.

**If Code Expects It**:
1. Remove all `customerId` references from Plan
2. Access Customers through: `plan.jobs[].customer`

**Example**:
```typescript
// DON'T DO THIS (no direct relation):
const customer = plan.customer;

// DO THIS (through jobs):
const customer = plan.jobs[0]?.customer;
```

---

#### Step 2B.6: Fix Error Typing (45 min)

**Lines**: 95, 255, 258, 279, 300, 318, 321, 422, 485, 503, 539

Same pattern as previous services:
```typescript
} catch (error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('Plan with this code already exists');
    }
  }
  if (error instanceof Error) {
    throw new Error(`Failed to ...: ${error.message}`);
  }
  throw error;
}
```

Remove `: any` on lines 363, 368.

---

#### Step 2B.7: Verify and Test Plan Service (60 min)

```bash
npm run build  # Should show 0 errors in plan.ts
```

**Create Smoke Test** (`backend/src/services/__tests__/plan.smoke.test.ts`):

```typescript
import { PlanType } from '@prisma/client';
import { planService } from '../plan';

describe('Plan Service Smoke Tests', () => {
  test('should create, read, update, delete plan', async () => {
    const plan = await planService.createPlan({
      code: 'TEST-2400',
      name: 'Test Plan 2400',
      type: PlanType.SINGLE_STORY,
      sqft: 2400,
      bedrooms: 4,
      bathrooms: 2.5,
      garage: '2-Car',
      isActive: true,
    });
    expect(plan.id).toBeDefined();
    expect(plan.type).toBe(PlanType.SINGLE_STORY);

    // Update
    const updated = await planService.updatePlan(plan.id, {
      sqft: 2450,
    });
    expect(updated.sqft).toBe(2450);

    // Delete
    await planService.deletePlan(plan.id);
  });
});
```

---

#### Step 2B.8: Commit Plan Changes (15 min)

```bash
git add backend/src/services/plan.ts
git commit -m "fix(plan): Align Plan service with Prisma schema

Critical Changes:
- Update PlanType enum to use SINGLE_STORY, TWO_STORY, THREE_STORY, DUPLEX, TOWNHOME
- Remove any invalid customerId references (Plans link to Jobs, not Customers)
- Verify templateItems relation name usage
- Fix all error typing
- Remove ': any' type bypasses

Result: plan.ts now compiles with 0 TypeScript errors

Related: Phase 0, Week 2 Part B - Plan Service Repair
"
```

---

### Week 2 Success Criteria

**Material Service**:
- ✅ PricingHistory model used (not MaterialPricing)
- ✅ `description` field used (not `name`)
- ✅ `unitOfMeasure` field used (not `unit`)
- ✅ All Material fields match schema
- ✅ 0 TypeScript errors in material.ts

**Plan Service**:
- ✅ PlanType enum values match schema
- ✅ No invalid customerId references
- ✅ Correct relation names used
- ✅ 0 TypeScript errors in plan.ts

**Both**:
- ✅ All error typing fixed
- ✅ All `: any` bypasses removed
- ✅ Smoke tests pass
- ✅ Changes committed

**Proceed to Week 3 when all criteria met.**

---

## WEEK 3: INTEGRATION & VALIDATION (2-4 hours)

**Goal**: Verify all services work together, fix any remaining compilation errors, establish working foundation

---

### Step 3.1: Full TypeScript Compilation (30 min)

```bash
cd backend
npm run build
```

**Expected Result**: 0 TypeScript errors across entire backend

**If Errors Remain**:
1. Categorize: Import errors? Type errors? Logic errors?
2. Fix systematically (highest priority first)
3. Re-run build until clean

---

### Step 3.2: Fix Any Remaining Import Errors (60 min)

**Common Issues**:

**A. AuditLog Service** (if errors exist):
- Should auto-resolve once Prisma Client regenerated
- If not, check `auditLog` model is in schema
- Verify imports: `import { PrismaClient, AuditLog } from '@prisma/client'`

**B. Controllers/Routes**:
- May reference old field names (`name` instead of `customerName`)
- Update to match service changes

**C. Validators**:
- Update Zod schemas (if they exist) to match new interfaces
- CustomerType, PlanType enum imports

**Example - CustomerController**:
```typescript
// BEFORE:
const customer = await customerService.createCustomer({
  name: req.body.name,  // ← OLD FIELD
});

// AFTER:
const customer = await customerService.createCustomer({
  customerName: req.body.customerName,  // ← FIXED
  customerType: req.body.customerType,  // ← ADDED
});
```

---

### Step 3.3: Integration Smoke Test (60 min)

**Create** `backend/src/__tests__/integration.smoke.test.ts`:

```typescript
import { CustomerType, MaterialCategory, PlanType } from '@prisma/client';
import { db } from '../services/database';
import { customerService } from '../services/customer';
import { materialService } from '../services/material';
import { planService } from '../services/plan';

describe('Integration Smoke Tests', () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('Full CRUD integration: Customer → Material → Plan', async () => {
    // 1. Create Customer
    const customer = await customerService.createCustomer({
      customerName: 'Integration Test Builder',
      customerType: CustomerType.PRODUCTION,
      pricingTier: 'Standard',
      isActive: true,
    });
    expect(customer.id).toBeDefined();

    // 2. Create Material
    const material = await materialService.createMaterial({
      sku: 'INT-TEST-001',
      description: 'Integration Test Material',
      category: MaterialCategory.DIMENSIONAL_LUMBER,
      unitOfMeasure: 'EA',
      vendorCost: 10.00,
      isActive: true,
    });
    expect(material.id).toBeDefined();

    // 3. Create Plan
    const plan = await planService.createPlan({
      code: 'INT-TEST-2400',
      name: 'Integration Test Plan',
      type: PlanType.SINGLE_STORY,
      sqft: 2400,
      bedrooms: 4,
      bathrooms: 2.5,
      isActive: true,
    });
    expect(plan.id).toBeDefined();

    // 4. Verify all exist
    const fetchedCustomer = await customerService.getCustomerById(customer.id);
    const fetchedMaterial = await materialService.getMaterialById(material.id);
    const fetchedPlan = await planService.getPlanById(plan.id);

    expect(fetchedCustomer).not.toBeNull();
    expect(fetchedMaterial).not.toBeNull();
    expect(fetchedPlan).not.toBeNull();

    // 5. Cleanup
    await planService.deletePlan(plan.id);
    await materialService.deleteMaterial(material.id);
    await customerService.deleteCustomer(customer.id);

    console.log('✅ Integration test passed - all services working!');
  });
});
```

**Run Test**:
```bash
npm test -- integration.smoke.test.ts
```

---

### Step 3.4: Manual End-to-End Test (60 min)

**If database is available**:

```bash
# 1. Start backend server
cd backend
npm run dev

# Should see:
# ✅ Server running on port 5001
# ✅ Database connected
```

**2. Test Customer Endpoints**:

```bash
# Create customer
curl -X POST http://localhost:5001/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Builder",
    "customerType": "PRODUCTION",
    "pricingTier": "Standard"
  }'

# Response should include customer ID
# {"id": "...", "customerName": "Test Builder", ...}

# Get customer
curl http://localhost:5001/api/customers/<customer-id>
```

**3. Test Material Endpoints**:

```bash
# Create material
curl -X POST http://localhost:5001/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "description": "Test Material",
    "category": "DIMENSIONAL_LUMBER",
    "unitOfMeasure": "EA",
    "vendorCost": 10.50
  }'
```

**4. Test Plan Endpoints**:

```bash
# Create plan
curl -X POST http://localhost:5001/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST-2400",
    "name": "Test Plan",
    "type": "SINGLE_STORY",
    "sqft": 2400,
    "bedrooms": 4,
    "bathrooms": 2.5
  }'
```

**All endpoints should**:
- Return 201 Created (or 200 OK)
- Return valid JSON with correct field names
- Store data in database
- Retrieve data correctly

---

### Step 3.5: Update Documentation (30 min)

**A. Update CHANGELOG** (`docs/CHANGELOG.md`):

```markdown
### Day 8-9 - Phase 0: Foundation Repair Complete (2025-11-11)
**Status**: ✅ Complete
**Type**: Critical Bug Fix
**Duration**: ~12-20 hours

#### Fixed
- [x] **Prisma Client Generation** (backend/node_modules/.prisma/client/)
  - Issue: Network restrictions prevented engine download
  - Fix: [Option chosen - describe resolution]
  - Impact: Prisma Client now generating successfully

- [x] **Customer Service Schema Sync** (backend/src/services/customer.ts)
  - Issue: Field name mismatch ('name' vs 'customerName'), invalid 'plans' relation, missing 'customerType' field
  - Fix: 15 schema mismatches resolved
  - Impact: Customer CRUD operations now functional

- [x] **Material Service Schema Sync** (backend/src/services/material.ts)
  - Issue: Wrong model name (MaterialPricing vs PricingHistory), field name mismatches
  - Fix: 22 schema mismatches resolved, MaterialPricing → PricingHistory throughout
  - Impact: Material and pricing operations now functional

- [x] **Plan Service Schema Sync** (backend/src/services/plan.ts)
  - Issue: PlanType enum completely wrong (PRODUCTION vs SINGLE_STORY), potential customerId mismatch
  - Fix: 14 schema mismatches resolved, enum values updated
  - Impact: Plan operations now functional

- [x] **Type Safety Improvements**
  - Issue: 24 instances of untyped error handling, 6 instances of ': any' bypasses
  - Fix: All error handlers properly typed, all ': any' removed
  - Impact: Full TypeScript strict mode compliance

#### Performance
- [x] **Compilation Success**
  - Before: 63 TypeScript errors (+ 49 hidden = 112 total)
  - After: 0 TypeScript errors
  - Result: 100% reduction in compilation errors

#### Breaking
- ⚠️ **API Field Name Changes**
  - Customer: 'name' → 'customerName' (all endpoints affected)
  - Customer: Added required 'customerType' field
  - Material: 'name' → 'description'
  - Material: 'unit' → 'unitOfMeasure'
  - Plan: 'type' enum values changed (PRODUCTION → SINGLE_STORY, etc.)
  - Action Required: Update all API clients to use new field names
```

**B. Create Phase 0 Completion Report** (`docs/foundation-repair/PHASE0-COMPLETION-REPORT.md`):

```markdown
# Phase 0: Foundation Repair - Completion Report
**Date Completed**: 2025-11-11
**Duration**: [Actual hours] hours over 3 weeks
**Status**: ✅ COMPLETE

## Summary

Successfully repaired foundation issues preventing TypeScript compilation and database integration.

### Issues Resolved
- 51 schema/code synchronization errors fixed
- 24 error typing issues fixed
- 6 `: any` type bypasses removed
- 63 direct TypeScript errors eliminated
- 49 hidden errors prevented from emerging

### Services Repaired
1. ✅ Customer Service - 15 issues fixed
2. ✅ Material Service - 22 issues fixed
3. ✅ Plan Service - 14 issues fixed

### Validation Complete
- ✅ Full TypeScript compilation succeeds (0 errors)
- ✅ Prisma Client generation working
- ✅ Database connection established
- ✅ CRUD operations functional
- ✅ Integration tests passing

## Metrics

| Metric | Before Repair | After Repair | Change |
|--------|--------------|--------------|--------|
| TypeScript Errors | 112 total | 0 | -112 (-100%) |
| Compilation Success | ❌ Failed | ✅ Passed | Fixed |
| Type Safety (`: any`) | 6 instances | 0 | -6 (-100%) |
| Error Typing | 24 untyped | 24 typed | +100% |
| Services Functional | 0/3 (0%) | 3/3 (100%) | +100% |

## Decisions Made

1. **Customer Contact Information**: Use CustomerContact model (not inline fields on Customer)
2. **PlanType Enum**: Keep schema design (SINGLE_STORY, etc.) vs code expectations (PRODUCTION, etc.)
3. **Customer-Plan Relationship**: Indirect through Jobs (Plan → Job → Customer)

## Next Steps

- ✅ Phase 0 Complete - Foundation solid
- 🔵 Resume Sprint 1 (Security Foundation) from Day 4
- 🔵 Begin Phase 1, Week 4: CORS hardening (next task)

## Lessons Learned

1. Custom type declarations mask real errors - never use as long-term workaround
2. Schema is source of truth - fix code to match schema, not vice versa
3. Network-restricted environments need pre-generated Prisma Client strategy
4. Systematic audit before repair saves time vs. fixing errors as they appear

**Foundation is now solid. Ready for forward progress.**
```

---

### Step 3.6: Merge All Repairs (30 min)

```bash
# Switch to main work branch
git checkout claude/work-session-start-011CV2E8CWgo7BPRjqxB5eju

# Merge customer repairs
git merge phase0/customer-service-repair

# Merge material repairs
git merge phase0/material-service-repair

# Merge plan repairs
git merge phase0/plan-service-repair

# Push all changes
git push origin claude/work-session-start-011CV2E8CWgo7BPRjqxB5eju
```

---

### Week 3 Success Criteria

- ✅ Full backend compiles with 0 TypeScript errors
- ✅ Prisma Client generation working
- ✅ Database connection established and tested
- ✅ All CRUD operations functional (Customer, Material, Plan)
- ✅ Integration smoke test passing
- ✅ Manual end-to-end test successful
- ✅ Documentation updated (CHANGELOG, completion report)
- ✅ All changes merged and pushed

**When all criteria met: PHASE 0 COMPLETE ✅**

---

## PHASE 0 CHECKPOINT

### Review Questions

1. ✅ Are all TypeScript errors resolved? (Target: 0 errors)
2. ✅ Do all services compile and run? (Target: Yes)
3. ✅ Do CRUD operations work end-to-end? (Target: Yes)
4. ✅ Are integration tests passing? (Target: All pass)
5. ✅ Is database connection stable? (Target: Yes)
6. ✅ Did repairs take expected time? (Target: <25 hours total)

### Decision: Ready for Phase 1?

**✅ PROCEED to Phase 1** if:
- 0 compilation errors
- All services working
- Tests passing
- Took <25 hours
- Feeling confident

**⚠️ CONSOLIDATE 1 more week** if:
- Minor issues remain
- Tests not complete
- Took 20-25 hours but not quite finished

**🛑 REASSESS** if:
- Errors still exist after 25 hours
- Major architectural issues discovered
- Feeling burned out

### Expected Outcome

✅ PROCEED (80% probability)

Foundation is solid, all services working, ready to resume Sprint 1.

---

## NEXT: PHASE 1 - SECURITY FOUNDATION

**Resume Sprint 1 from Day 4**:
- Day 4: CORS hardening (1-1.5 hours)
- Day 5: Audit logging integration (30-45 min)
- Day 6-7: Rate limiting (1-1.5 hours)
- Day 8: Connection pooling (45 min)
- Day 9: API versioning (45 min)
- Day 10: Sprint review & documentation (1 hour)

**Total Sprint 1 Time Remaining**: 5-7 hours

**Phase 1 Total**: Weeks 4-13 (30-40 hours) - 5 sprints

---

**Document Version**: 2.0
**Status**: Ready for Execution (pending environment decision)
**Next Update**: After environment decision made and Week 1 begins
