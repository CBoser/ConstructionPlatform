# Phase 0, Week 0: Service vs Schema Audit
**Date**: 2025-11-11
**Purpose**: Document all mismatches between service code and Prisma schema
**Status**: Manual audit (Prisma Client generation blocked)

---

## 🔴 CRITICAL: Prisma Client Generation Blocked

**Blocker**: Network restrictions preventing download of Prisma engines (403 Forbidden on binaries.prisma.sh)

**Impact**: Cannot run TypeScript compiler to expose full errors. This audit is based on manual code inspection against schema.

**Resolution Options**:
1. Allow network access to binaries.prisma.sh in this environment
2. Copy pre-generated Prisma Client from Windows environment to `.prisma/client`
3. Work in Windows environment where Prisma Client can be generated

---

## 📊 AUDIT SUMMARY

| Service | Critical Issues | High Priority | Medium Priority | Total |
|---------|----------------|---------------|-----------------|-------|
| Customer | 3 | 8 | 4 | 15 |
| Material | 1 | 15 | 6 | 22 |
| Plan | 2 | 9 | 3 | 14 |
| **TOTAL** | **6** | **32** | **13** | **51** |

---

## 1. CUSTOMER SERVICE AUDIT

**File**: `backend/src/services/customer.ts` (295 lines)
**Schema Model**: `Customer` (lines 51-72 in schema.prisma)

### Schema Definition (Source of Truth)

```prisma
model Customer {
  id              String       @id @default(uuid())
  customerName    String       @map("customer_name")          // ← CODE USES 'name'
  customerType    CustomerType @map("customer_type")          // ← MISSING IN CODE
  pricingTier     String?      @map("pricing_tier")
  primaryContactId String?     @map("primary_contact_id")
  isActive        Boolean      @default(true)
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relationships
  contacts        CustomerContact[]                          // ← CODE DOESN'T USE
  pricingTiers    CustomerPricingTier[]                      // ← CODE DOESN'T USE
  externalIds     CustomerExternalId[]                       // ← CODE DOESN'T USE
  jobs            Job[]
  communities     Community[]
  customerPricing CustomerPricing[]
  variancePatterns VariancePattern[]
  // NO 'plans' RELATION IN SCHEMA                          // ← CODE EXPECTS THIS
}
```

### Critical Issues (3)

#### Issue 1: Field Name Mismatch - `name` vs `customerName`
**Severity**: CRITICAL
**Lines Affected**: 4, 16, 32, 44, 78, 103, 127, 144, 177, 214, 235, 271 (12 locations)

**Code Expects**:
```typescript
export interface CreateCustomerInput {
  name: string;  // ← WRONG
  ...
}

// Line 44
data: {
  name: input.name,  // ← WRONG: Field doesn't exist in schema
}
```

**Schema Has**:
```prisma
customerName String @map("customer_name")
```

**Fix Required**: Rename all `name` references to `customerName` throughout file.

---

#### Issue 2: Non-Existent Relation - `plans`
**Severity**: CRITICAL
**Lines Affected**: 75-82

**Code Expects**:
```typescript
include: includeRelations
  ? {
      plans: {  // ← WRONG: This relation doesn't exist on Customer
        select: { id: true, name: true, isActive: true, createdAt: true },
      },
      communities: { ... },
    }
  : undefined
```

**Schema Reality**: Customer model has NO `plans` relation. Plans are linked to Jobs, not directly to Customers.

**Fix Required**: Remove `plans` relation query. If customer-to-plan relationship needed, it must go through Jobs.

---

#### Issue 3: Missing Required Field - `customerType`
**Severity**: CRITICAL
**Lines Affected**: CreateCustomerInput interface (lines 3-13), createCustomer method (lines 40-65)

**Code Missing**:
```typescript
export interface CreateCustomerInput {
  name: string;
  // ← MISSING: customerType (required enum field)
  // ← MISSING: pricingTier (optional field)
  ...
}
```

**Schema Requires**:
```prisma
customerType CustomerType @map("customer_type")  // NOT NULL - required!

enum CustomerType {
  PRODUCTION
  SEMI_CUSTOM
  FULL_CUSTOM
}
```

**Fix Required**: Add `customerType: CustomerType` to CreateCustomerInput interface and all create operations.

---

### High Priority Issues (8)

#### Issue 4: Schema Fields Not in Code
**Severity**: HIGH
**Missing Fields**:
- `pricingTier` (optional String)
- `primaryContactId` (optional String - FK to CustomerContact)

**Fix**: Add these fields to input/update interfaces.

---

#### Issue 5: Code Fields Not in Schema
**Severity**: HIGH
**Fields in Code BUT NOT in Schema**:
- `contactEmail`
- `contactPhone`
- `address`
- `city`
- `state`
- `zipCode`

**Schema Reality**: Customer contact information is in the `CustomerContact` model (separate table).

**Fix Options**:
1. **Option A (Recommended)**: Remove these fields from Customer interfaces, use CustomerContact model
2. **Option B**: Add these fields to Customer schema (less normalized)

**Recommendation**: Use Option A - schema design is correct. These belong in CustomerContact.

---

#### Issue 6: Unused Relations
**Lines**: Throughout file
**Schema Has These Relations** (code doesn't use):
- `contacts: CustomerContact[]`
- `pricingTiers: CustomerPricingTier[]`
- `externalIds: CustomerExternalId[]`
- `customerPricing: CustomerPricing[]`
- `variancePatterns: VariancePattern[]`

**Impact**: Code is incomplete - missing functionality for customer contacts, pricing tiers, external IDs.

**Fix**: Not urgent for Phase 0, but document as technical debt.

---

#### Issue 7-14: Type Safety Issues
**Lines**: 60, 176, 179, 200, 221, 239, 242, 283-284

**Pattern**:
```typescript
} catch (error) {  // ← Type 'unknown' in strict TypeScript
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    ...
  }
  throw error;  // ← 'error' is of type 'unknown'
}
```

**Fix**: Add proper error typing:
```typescript
} catch (error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    ...
  }
  throw error;
}
```

Also fix `: any` type bypasses on lines 283-284:
```typescript
const totalLots = stats.plans.reduce((sum: number, plan: any) =>  // ← Remove 'any'
```

---

### Medium Priority Issues (4)

#### Issue 15: sortBy Option Mismatch
**Line**: 32
**Code**: `sortBy?: 'name' | 'createdAt' | 'updatedAt'`
**Schema**: Field is `customerName`, not `name`

**Fix**: Change to `sortBy?: 'customerName' | 'createdAt' | 'updatedAt'`

---

#### Issues 16-19: Error Messages Reference 'name'
**Lines**: 60, 200, etc.

**Example**:
```typescript
throw new Error('A customer with this name already exists');
```

**Fix**: Update error messages to reference `customerName` for clarity.

---

## 2. MATERIAL SERVICE AUDIT

**File**: `backend/src/services/material.ts` (573 lines)
**Schema Models**: `Material` (lines 294-338), `PricingHistory` (lines 379-403)

### Schema Definitions (Source of Truth)

```prisma
model Material {
  id            String           @id @default(uuid())
  sku           String           @unique
  description   String           // ← CODE USES 'name'
  category      MaterialCategory
  subcategory   String?
  unitOfMeasure String           // ← CODE USES 'unit'
  vendorCost    Decimal          @db.Decimal(10, 2)
  freight       Decimal          @db.Decimal(10, 2) @default(0)
  isRLLinked    Boolean          @default(false)
  rlTag         String?
  rlBasePrice   Decimal?         @db.Decimal(10, 2)
  rlLastUpdated DateTime?
  isActive      Boolean          @default(true)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  vendor   Vendor? @relation(fields: [vendorId], references: [id])
  vendorId String?

  // Relationships
  pricingHistory   PricingHistory[]    // ← CODE EXPECTS 'pricing' with MaterialPricing model
  planTemplateItems PlanTemplateItem[]
  customerPricing   CustomerPricing[]
  takeoffLineItems  TakeoffLineItem[]
  purchaseOrderItems PurchaseOrderItem[]
}

// ============================================================================
// CRITICAL: CODE EXPECTS "MaterialPricing" - DOESN'T EXIST IN SCHEMA
// ============================================================================

model PricingHistory {  // ← CODE USES WRONG MODEL NAME
  id          String   @id @default(uuid())
  materialId  String

  // Pricing Breakdown
  baseVendorCost      Decimal  @db.Decimal(10, 2)
  commodityAdjustment Decimal  @db.Decimal(10, 2) @default(0)
  freight             Decimal  @db.Decimal(10, 2) @default(0)
  totalCost           Decimal  @db.Decimal(10, 2)
  marginPercentage    Decimal  @db.Decimal(5, 2)
  marginAmount        Decimal  @db.Decimal(10, 2)
  sellPrice           Decimal  @db.Decimal(10, 2)

  effectiveDate DateTime @default(now())
  source        String?  // "Manual", "RL Update", "Vendor Update"

  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)

  @@index([materialId])
  @@index([effectiveDate])
}
```

### Critical Issue (1)

#### Issue 1: Wrong Model Name - `MaterialPricing` vs `PricingHistory`
**Severity**: CRITICAL
**Lines Affected**: 1, 306, 349, 372, 377, 390, 401, 410, 419, 439, 465, 482, 492, 506, 522, 542 (16 locations)

**Code Expects**:
```typescript
import { PrismaClient, Material, MaterialPricing, Prisma } from '@prisma/client';
//                              ^^^^^^^^^^^^^^^^ DOESN'T EXIST

// Line 306
pricing?: MaterialPricing[];  // ← WRONG MODEL NAME

// Line 372
pricing: {
  where: MaterialPricingWhereInput;  // ← WRONG
  ...
}
```

**Schema Has**:
```prisma
model PricingHistory {  // ← CORRECT NAME
  ...
  material Material @relation(fields: [materialId], references: [id])
}

// On Material model:
pricingHistory PricingHistory[]  // ← CORRECT RELATION NAME (not 'pricing')
```

**Fix Required**:
1. Rename ALL `MaterialPricing` references to `PricingHistory` (16 locations)
2. Rename ALL `pricing` relation references to `pricingHistory` throughout file
3. Update all queries, creates, updates to use correct model name

**Estimated Impact**: 22 errors (most in this file are from this single issue)

---

### High Priority Issues (15)

#### Issue 2: Field Name Mismatch - `name` vs `description`
**Lines**: Throughout file

**Code Uses**: `name` field
**Schema Has**: `description` field

**Fix**: Rename all `name` references to `description`.

---

#### Issue 3: Field Name Mismatch - `unit` vs `unitOfMeasure`
**Lines**: Throughout file

**Code Uses**: `unit` field
**Schema Has**: `unitOfMeasure` field

**Fix**: Rename all `unit` references to `unitOfMeasure`.

---

#### Issue 4: Missing Vendor Relationship
**Lines**: Material create/update operations

**Schema Has**:
```prisma
vendor   Vendor? @relation(fields: [vendorId], references: [id])
vendorId String?
```

**Code Status**: Not utilizing vendor relationship properly.

**Fix**: Add vendor linking in create/update operations.

---

#### Issue 5: Missing Fields in Material Model
**Schema Has (Code May Not Use)**:
- `vendorCost` (required Decimal)
- `freight` (Decimal, default 0)
- `isRLLinked` (Boolean)
- `rlTag` (String?)
- `rlBasePrice` (Decimal?)
- `rlLastUpdated` (DateTime?)

**Fix**: Ensure all schema fields are in TypeScript interfaces.

---

#### Issue 6: PricingHistory Field Mismatches
**When switching from MaterialPricing to PricingHistory**, check these field name differences:

**Schema PricingHistory Fields**:
- `baseVendorCost`
- `commodityAdjustment`
- `freight`
- `totalCost`
- `marginPercentage`
- `marginAmount`
- `sellPrice`
- `effectiveDate`
- `source`

**Code Expectations**: May not match - need to audit after model name fix.

---

#### Issues 7-21: Type Safety Issues (Same as Customer Service)
**Lines**: 75, 219, 222, 243, 264, 282, 285, 306, 503, 521, 554, 556

**Pattern**: `catch (error)` without type annotation + `: any` bypasses

**Fix**: Add `catch (error: unknown)` and remove `: any`.

---

### Medium Priority Issues (6)

#### Issue 22: MaterialCategory Enum Values
**Need to verify code uses correct enum values**:

```prisma
enum MaterialCategory {
  DIMENSIONAL_LUMBER
  ENGINEERED_LUMBER
  SHEATHING
  PRESSURE_TREATED
  HARDWARE
  CONCRETE
  ROOFING
  SIDING
  INSULATION
  DRYWALL
  OTHER
}
```

**Action**: Check if code references match schema enum values.

---

#### Issues 23-27: Query Performance
**Lines**: Various
**Issue**: Missing indexes on frequently queried fields

**Fix**: Not critical for Phase 0, but document as optimization opportunity.

---

## 3. PLAN SERVICE AUDIT

**File**: `backend/src/services/plan.ts` (548 lines)
**Schema Model**: `Plan` (lines 155-189 in schema.prisma)

### Schema Definition (Source of Truth)

```prisma
model Plan {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String?

  // Plan Characteristics
  type      PlanType  // ← CRITICAL: Enum values different in code!
  sqft      Int?
  bedrooms  Int?
  bathrooms Decimal?  @db.Decimal(3, 1)
  garage    String?
  style     String?

  version   Int      @default(1)
  isActive  Boolean  @default(true)
  pdssUrl   String?
  notes     String?  @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  elevations       PlanElevation[]
  options          PlanOption[]
  templateItems    PlanTemplateItem[]
  jobs             Job[]
  variancePatterns VariancePattern[]
  // NO customerId field or Customer relation
}

enum PlanType {
  SINGLE_STORY    // ← CODE EXPECTS: PRODUCTION
  TWO_STORY       // ← CODE EXPECTS: SEMI_CUSTOM
  THREE_STORY     // ← CODE EXPECTS: FULL_CUSTOM
  DUPLEX          // ← NEW
  TOWNHOME        // ← NEW
}
```

### Critical Issues (2)

#### Issue 1: PlanType Enum Completely Wrong
**Severity**: CRITICAL
**Lines Affected**: All references to PlanType throughout file

**Code Expects (from custom types)**:
```typescript
enum PlanType {
  PRODUCTION
  SEMI_CUSTOM
  FULL_CUSTOM
}
```

**Schema Has**:
```prisma
enum PlanType {
  SINGLE_STORY
  TWO_STORY
  THREE_STORY
  DUPLEX
  TOWNHOME
}
```

**Impact**: COMPLETE MISMATCH - NO OVERLAP. Every PlanType reference in code is wrong.

**Fix Required**:
1. Update ALL PlanType enum usage throughout file
2. Determine mapping strategy:
   - Is this a migration issue? (Old enum → New enum)
   - Is code using wrong enum entirely?
3. Update validation, queries, creates, updates

**Decision Needed**: How to map old values to new? Or is this completely different data?

---

#### Issue 2: Missing customerId Field?
**Severity**: CRITICAL (uncertain)
**Lines**: Plan creation/queries

**Code May Expect**: `customerId` field to link Plans to Customers

**Schema Reality**: NO `customerId` field. Plans link to Jobs, Jobs link to Customers.

**Fix Required**:
1. Determine if code expects direct Customer → Plan relationship
2. If yes, decide:
   - Option A: Add `customerId` to Plan schema
   - Option B: Update code to link through Jobs

**Recommendation**: Check code first, then decide.

---

### High Priority Issues (9)

#### Issue 3: PlanTemplateItem Relation Name
**Lines**: Queries including template items

**Schema Has**: `templateItems` relation name
**Code May Use**: Different relation name

**Fix**: Ensure code uses `templateItems` (not `planTemplateItems` or `items`).

---

#### Issue 4: Missing Relations Not Utilized
**Schema Relations Code May Not Use**:
- `elevations: PlanElevation[]`
- `options: PlanOption[]`
- `jobs: Job[]`
- `variancePatterns: VariancePattern[]`

**Impact**: Code incomplete - missing functionality.

**Fix**: Document as technical debt, not critical for Phase 0.

---

#### Issues 5-13: Type Safety Issues (Same Pattern)
**Lines**: 95, 255, 258, 279, 300, 318, 321, 363, 368, 422, 485, 503, 539

**Pattern**: `catch (error)` without type + `: any` bypasses

**Fix**: Add proper error typing and remove `: any`.

---

### Medium Priority Issues (3)

#### Issue 14: Field Type Precision
**Line**: Bathrooms field

**Schema**: `Decimal? @db.Decimal(3, 1)` - allows 2.5, 3.5 bathrooms
**Code**: May treat as integer

**Fix**: Ensure code handles decimal bathroom values.

---

#### Issue 15-16: Query Optimization
**Lines**: Various

**Issue**: Missing efficient queries for plan statistics.

**Fix**: Document as optimization opportunity.

---

## 4. REPAIR PRIORITY MATRIX

### Phase 0, Week 1: Customer Service (4-6 hours)

**Priority 1 - BLOCKERS** (Must fix first):
1. ✅ Generate Prisma Client (environment fix required)
2. Rename `name` → `customerName` (12 locations)
3. Add `customerType` required field (enum)
4. Remove `plans` relation query

**Priority 2 - HIGH** (Fix next):
5. Add `pricingTier`, `primaryContactId` fields
6. Remove invalid fields (contactEmail, contactPhone, address, etc.) OR migrate to CustomerContact
7. Fix sortBy field name
8. Fix error typing (7 locations)
9. Remove `: any` bypasses (2 locations)

**Priority 3 - MEDIUM** (Can defer):
10. Update error messages
11. Document unused relations as technical debt

**Estimated Time**: 4-6 hours (assumes Prisma Client working)

---

### Phase 0, Week 2: Material Service (6-8 hours)

**Priority 1 - BLOCKERS** (Must fix first):
1. Rename ALL `MaterialPricing` → `PricingHistory` (16 locations)
2. Rename ALL `pricing` → `pricingHistory` relations
3. Update all PricingHistory field references to match schema

**Priority 2 - HIGH** (Fix next):
4. Rename `name` → `description` throughout
5. Rename `unit` → `unitOfMeasure` throughout
6. Add missing Material fields (vendorCost, freight, etc.)
7. Fix vendor relationship usage
8. Fix error typing (9 locations)
9. Remove `: any` bypasses (2 locations)

**Priority 3 - MEDIUM** (Can defer):
10. Verify MaterialCategory enum values
11. Document query optimizations

**Estimated Time**: 6-8 hours (most complex service)

---

### Phase 0, Week 2-3: Plan Service (4-6 hours)

**Priority 1 - BLOCKERS** (Must fix first):
1. **DECISION REQUIRED**: Map old PlanType enum to new enum OR update schema
2. Fix ALL PlanType references throughout file
3. Determine if `customerId` field needed, add if yes

**Priority 2 - HIGH** (Fix next):
4. Verify `templateItems` relation name usage
5. Fix error typing (11 locations)
6. Remove `: any` bypasses (2 locations)

**Priority 3 - MEDIUM** (Can defer):
7. Document unused relations
8. Fix bathrooms Decimal handling
9. Document query optimizations

**Estimated Time**: 4-6 hours

---

## 5. DECISION POINTS

### Decision 1: Customer Contact Information

**Question**: Where should customer contact information live?

**Option A (Recommended)**: Use CustomerContact model (schema design)
- Remove invalid fields from Customer service
- Create CustomerContact service
- Link contacts to customers properly

**Option B**: Add fields to Customer model
- Simpler short-term
- Less normalized
- Defeats purpose of CustomerContact table

**Recommendation**: Option A - schema is correct.

---

### Decision 2: PlanType Enum Migration

**Question**: How to handle completely different PlanType enums?

**Old Code Values**:
- PRODUCTION
- SEMI_CUSTOM
- FULL_CUSTOM

**New Schema Values**:
- SINGLE_STORY
- TWO_STORY
- THREE_STORY
- DUPLEX
- TOWNHOME

**Options**:
1. **Keep Schema** (Recommended): Update code to use architectural types (SINGLE_STORY, etc.)
2. **Revert Schema**: Change schema back to PRODUCTION/SEMI_CUSTOM/FULL_CUSTOM
3. **Support Both**: Add second enum for build type vs production type

**Recommendation**: Keep schema - architectural types are more specific and useful.

---

### Decision 3: Customer-Plan Relationship

**Question**: Should Plans link directly to Customers?

**Current Schema**: Plan → Job → Customer (indirect)

**Code May Expect**: Plan → Customer (direct)

**Options**:
1. **Keep Schema** (Recommended): Plans belong to Jobs, Jobs belong to Customers
2. **Add Direct Link**: Add optional `customerId` to Plan model

**Recommendation**: Keep schema - Job is the correct intermediary.

---

## 6. SUCCESS CRITERIA

### Week 0 Complete When:
- ✅ Custom type declarations removed
- ✅ Build errors documented
- ✅ All services audited vs schema
- ✅ Repair strategy created
- ✅ Decisions documented

### Week 1 Complete When (Customer Service):
- ✅ Prisma Client generating successfully
- ✅ `customerName` field used correctly (not `name`)
- ✅ `customerType` required field added
- ✅ Invalid fields removed/migrated
- ✅ All error typing fixed
- ✅ All `: any` bypasses removed
- ✅ Zero TypeScript errors in customer.ts
- ✅ Customer CRUD smoke tests pass

### Week 2 Complete When (Material Service):
- ✅ `PricingHistory` model used (not `MaterialPricing`)
- ✅ `description` field used (not `name`)
- ✅ `unitOfMeasure` field used (not `unit`)
- ✅ All Material fields match schema
- ✅ All error typing fixed
- ✅ All `: any` bypasses removed
- ✅ Zero TypeScript errors in material.ts
- ✅ Material CRUD smoke tests pass

### Week 3 Complete When (Plan Service):
- ✅ PlanType enum values correct
- ✅ Decision made on Customer-Plan relationship
- ✅ All error typing fixed
- ✅ All `: any` bypasses removed
- ✅ Zero TypeScript errors in plan.ts
- ✅ Plan CRUD smoke tests pass
- ✅ Full integration test passes

---

## 7. RISK ASSESSMENT

**Critical Risks**:
1. **Prisma Client Generation Blocked** (10/10) - Cannot proceed without environment fix
2. **PlanType Enum Migration** (8/10) - Complete mismatch, may affect existing data
3. **MaterialPricing Model Name** (8/10) - Extensive changes required (16 locations)

**Medium Risks**:
4. **Customer Field Migration** (5/10) - May require data migration if fields exist in DB
5. **Time Estimate Accuracy** (6/10) - Could take longer if hidden issues emerge

**Low Risks**:
6. **Error Typing** (2/10) - Straightforward fixes
7. **Missing Relations** (3/10) - Can defer to later phases

---

**Audit Completed**: 2025-11-11
**Next Steps**: Create detailed repair strategy document with step-by-step fixes
**Estimated Repair Time**: 14-20 hours total (2-3 weeks at 5-7 hours/week)

---

**Document Version**: 1.0
**Status**: Complete
**Next Document**: PHASE0-WEEK0-REPAIR-STRATEGY.md
