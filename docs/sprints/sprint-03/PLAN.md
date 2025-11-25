# Sprint 3: Foundation Layer Implementation

**Sprint Number**: 3
**Phase**: Phase 1 - Foundation Layer
**Duration**: 3 weeks (15 working days)
**Planned Start**: After Sprint 2 completion
**Status**: Planned

---

## Sprint Objectives

### Primary Goal
Implement the complete Foundation Layer of the four-layer architecture. The Prisma schema already exists with 22 models - this sprint focuses on building API endpoints, services, and UI components.

### Success Criteria
- [ ] Initialize Prisma migrations and seed database
- [ ] CRUD API endpoints for all Foundation Layer entities
- [ ] Input validation with Zod schemas (aligned with existing schema)
- [ ] Basic UI components for data entry
- [ ] Code system integration from Sprint 2
- [ ] 80%+ test coverage on new code
- [ ] API documentation complete

> **IMPORTANT**: The Prisma schema (`backend/prisma/schema.prisma`) already contains all 22 models. This sprint builds the API layer and UI, NOT the database schema.

---

## Architecture Context

### Four-Layer System
```
┌─────────────────────────────────────────┐
│ INTELLIGENCE LAYER (Future)             │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ TRANSACTION LAYER (Future)              │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ OPERATIONAL CORE (Future)               │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│ FOUNDATION LAYER ← THIS SPRINT          │
│ • Customers                             │
│ • Plans                                 │
│ • Materials & Pricing                   │
│ • Subdivisions                          │
│ • Vendors                               │
└─────────────────────────────────────────┘
```

---

## Tasks Breakdown

### Week 1: Core API & Services

#### Days 1-2: Customer Management Enhancement
**Priority**: HIGH
**Estimated Time**: 8 hours
**Status**: Partially implemented (basic CRUD exists)

**Existing Prisma Schema** (from `backend/prisma/schema.prisma`):
```prisma
model Customer {
  id              String       @id @default(uuid())
  customerName    String       @map("customer_name")
  customerType    CustomerType @map("customer_type")
  pricingTier     String?      @map("pricing_tier")
  primaryContactId String?     @map("primary_contact_id")
  isActive        Boolean      @default(true) @map("is_active")
  notes           String?
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  // Relationships
  contacts        CustomerContact[]
  pricingTiers    CustomerPricingTier[]
  externalIds     CustomerExternalId[]
  jobs            Job[]
  communities     Community[]
  customerPricing CustomerPricing[]
  variancePatterns VariancePattern[]
}

enum CustomerType {
  PRODUCTION
  SEMI_CUSTOM
  FULL_CUSTOM
}
```

**What Exists**:
- ✅ Basic Customer CRUD API (`/api/v1/customers`)
- ✅ CustomerService with repository pattern
- ✅ Zod validation schemas
- ✅ Frontend: List view, Detail view, Create/Edit modals

**What Needs to Be Built**:
- [ ] CustomerPricingTier management API
- [ ] CustomerExternalId management API
- [ ] CustomerContact full CRUD (enhance existing)
- [ ] Pricing tier UI components
- [ ] External system ID mapping UI

**API Endpoints to Add**:
- `GET /api/v1/customers/:id/pricing-tiers` - Get customer pricing tiers
- `POST /api/v1/customers/:id/pricing-tiers` - Add pricing tier
- `PUT /api/v1/customers/:id/pricing-tiers/:tierId` - Update pricing tier
- `DELETE /api/v1/customers/:id/pricing-tiers/:tierId` - Remove pricing tier

**Zod Validation** (aligned with actual schema):
```typescript
const CustomerCreateSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerType: z.enum(['PRODUCTION', 'SEMI_CUSTOM', 'FULL_CUSTOM']),
  pricingTier: z.string().max(50).optional(),
  notes: z.string().optional(),
});

const CustomerPricingTierSchema = z.object({
  tierName: z.string().min(1).max(50),
  discountPercentage: z.number().min(0).max(100),
  effectiveDate: z.string().datetime(),
  expirationDate: z.string().datetime().optional(),
});
```

**Testing**:
- [ ] Unit tests for customer service functions
- [ ] Integration tests for all API endpoints
- [ ] Validation tests for edge cases
- [ ] Pricing tier calculation tests

---

#### Days 3-4: Plans & Elevations
**Priority**: HIGH
**Estimated Time**: 8 hours
**Status**: Schema exists, API/UI not implemented

**Existing Prisma Schema** (from `backend/prisma/schema.prisma`):
```prisma
model Plan {
  id          String   @id @default(uuid())
  code        String   @unique // e.g., "2400", "G21D"
  name        String?              // Human-readable name
  type        PlanType
  sqft        Int?
  bedrooms    Int?
  bathrooms   Decimal?  @db.Decimal(3, 1)
  garage      String?              // "2-Car", "3-Car", etc.
  style       String?              // "Ranch", "Modern", etc.
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  pdssUrl     String?              // Plan Design & Specification Sheet URL
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  elevations       PlanElevation[]
  options          PlanOption[]
  templateItems    PlanTemplateItem[] // BOM template
  jobs             Job[]
  variancePatterns VariancePattern[]
}

enum PlanType {
  SINGLE_STORY
  TWO_STORY
  THREE_STORY
  DUPLEX
  TOWNHOME
}

model PlanElevation {
  id          String   @id @default(uuid())
  planId      String
  code        String              // "A", "B", "C", "D"
  name        String?             // "Craftsman", "Contemporary"
  description String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade)
  jobs Job[]

  @@unique([planId, code])
}

model PlanOption {
  id          String   @id @default(uuid())
  code        String   @unique // "DECK-12X12", "SUNROOM"
  name        String
  description String?
  category    OptionCategory
  basePrice   Decimal  @db.Decimal(10, 2)
  triggersPacks String[] // Array of pack names this option triggers
  appliesTo   String[] // Array of plan codes (empty = all plans)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  plans       Plan[]
  jobOptions  JobOption[]
}

enum OptionCategory {
  DECK
  FENCING
  ROOM_ADDITION
  GARAGE
  PATIO
  STRUCTURAL
  FINISH
  OTHER
}
```

**What Exists**:
- ✅ Complete Prisma schema with relationships
- ⚠️ Plan routes exist but are disabled (TypeScript errors)
- ⚠️ Plan service exists but has schema mismatches

**What Needs to Be Built**:
- [ ] Fix plan.ts service to match actual schema
- [ ] Plan CRUD API endpoints
- [ ] PlanElevation management API
- [ ] PlanOption management API
- [ ] PlanTemplateItem (BOM) management API
- [ ] Plans list/detail UI pages
- [ ] Elevation management UI
- [ ] Option assignment UI

**API Endpoints**:
- `GET /api/v1/plans` - List all plans
- `GET /api/v1/plans/:id` - Get plan with elevations and options
- `POST /api/v1/plans` - Create plan
- `PUT /api/v1/plans/:id` - Update plan
- `DELETE /api/v1/plans/:id` - Soft delete
- `GET /api/v1/plans/:id/elevations` - Get plan elevations
- `POST /api/v1/plans/:id/elevations` - Add elevation
- `GET /api/v1/plans/:id/options` - Get plan options
- `POST /api/v1/plans/:id/options` - Link option to plan
- `GET /api/v1/plans/:id/template` - Get BOM template items
- `POST /api/v1/plans/:id/template` - Add template item

**Testing**:
- [ ] Plan CRUD operations
- [ ] Elevation management
- [ ] Option management
- [ ] Template item management
- [ ] Price calculations with adjustments

---

#### Day 5: Vendors
**Priority**: MEDIUM
**Estimated Time**: 4 hours
**Status**: Schema exists, API/UI not implemented

**Existing Prisma Schema** (from `backend/prisma/schema.prisma`):
```prisma
model Vendor {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique

  // Contact
  primaryContact String?
  email       String?
  phone       String?

  // Terms
  paymentTerms String?  // "Net 30", "Net 45"
  leadTimeDays Int      @default(5)

  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  materials      Material[]      // Direct relation (not join table)
  purchaseOrders PurchaseOrder[]
}
```

> **Note**: The actual schema uses a direct relation from Material to Vendor (via `vendorId` on Material), NOT a VendorMaterial join table. Materials belong to one vendor.

**What Exists**:
- ✅ Prisma schema with direct Material→Vendor relation
- ❌ No API endpoints
- ❌ No UI

**What Needs to Be Built**:
- [ ] Vendor CRUD API endpoints
- [ ] Vendor materials listing (via Material.vendorId)
- [ ] Vendor list/detail UI pages
- [ ] Vendor selection in Material forms

**API Endpoints**:
- `GET /api/v1/vendors` - List vendors
- `GET /api/v1/vendors/:id` - Get vendor details with materials
- `POST /api/v1/vendors` - Create vendor
- `PUT /api/v1/vendors/:id` - Update vendor
- `DELETE /api/v1/vendors/:id` - Soft delete
- `GET /api/v1/vendors/:id/materials` - Get materials from this vendor

---

### Week 2: Materials & Pricing

#### Days 6-8: Materials System
**Priority**: CRITICAL
**Estimated Time**: 12 hours
**Status**: Schema exists with commodity pricing, API/UI not implemented

**Existing Prisma Schema** (from `backend/prisma/schema.prisma`):
```prisma
model Material {
  id          String   @id @default(uuid())
  sku         String   @unique
  description String

  // Categorization
  category    MaterialCategory
  subcategory String?

  // Unit of Measure
  unitOfMeasure String             // "EA", "LF", "SF", "MBF", "SHT"

  // Base Costs
  vendorCost  Decimal  @db.Decimal(10, 2)
  freight     Decimal  @db.Decimal(10, 2) @default(0)

  // Commodity Pricing (for lumber)
  isRLLinked      Boolean  @default(false) // Linked to Random Lengths
  rlTag           String?                   // Random Lengths commodity tag
  rlBasePrice     Decimal? @db.Decimal(10, 2)
  rlLastUpdated   DateTime?

  // Length Modifiers (for lumber)
  lengthAdders    Json?               // { "8": 0, "10": 0.15, "12": 0.25 }
  gradeMultipliers Json?              // { "SPF": 1.0, "SYP": 1.15 }

  // Status
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  vendor              Vendor?  @relation(fields: [vendorId], references: [id])
  vendorId            String?
  pricingHistory      PricingHistory[]
  templateItems       PlanTemplateItem[]
  customerPricing     CustomerPricing[]
  takeoffLineItems    TakeoffLineItem[]
}

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

model PricingHistory {
  id          String   @id @default(uuid())
  materialId  String

  // Pricing Breakdown (Transparent Calculation)
  baseVendorCost      Decimal  @db.Decimal(10, 2)
  commodityAdjustment Decimal  @db.Decimal(10, 2) @default(0)
  freight             Decimal  @db.Decimal(10, 2) @default(0)
  totalCost           Decimal  @db.Decimal(10, 2)

  // Margin
  marginPercentage    Decimal  @db.Decimal(5, 2)
  marginAmount        Decimal  @db.Decimal(10, 2)

  // Final Price
  unitPrice           Decimal  @db.Decimal(10, 2)

  // Calculation Steps (for pedagogical transparency)
  calculationSteps    Json                    // Array of calculation step objects

  effectiveDate DateTime @default(now())
  expiresAt     DateTime?
  createdAt   DateTime @default(now())

  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
}

model RandomLengthsPricing {
  id          String   @id @default(uuid())
  tag         String                     // Commodity tag
  description String
  price       Decimal  @db.Decimal(10, 2)
  unit        String                     // "MBF", "MSF"
  region      String?
  grade       String?
  effectiveDate DateTime
  source      String                     // "RL_REPORT_2024_12_01"
  createdAt   DateTime @default(now())

  @@unique([tag, effectiveDate])
}
```

> **Key Difference**: The schema uses `sku` not `code`, `MaterialCategory` enum (not string), and includes commodity pricing integration with Random Lengths for lumber pricing.

**What Exists**:
- ✅ Complete Prisma schema with commodity pricing
- ⚠️ Material routes exist but are disabled (TypeScript errors)
- ⚠️ Material service exists but has schema mismatches

**What Needs to Be Built**:
- [ ] Fix material.ts service to match actual schema
- [ ] Material CRUD API endpoints
- [ ] PricingHistory management API
- [ ] RandomLengthsPricing import/management
- [ ] Materials list/detail UI pages
- [ ] Category browser/filter UI
- [ ] Commodity pricing UI (Random Lengths integration)

**API Endpoints**:
- `GET /api/v1/materials` - List materials (with filtering)
- `GET /api/v1/materials/:id` - Get material details
- `POST /api/v1/materials` - Create material
- `PUT /api/v1/materials/:id` - Update material
- `DELETE /api/v1/materials/:id` - Soft delete
- `GET /api/v1/materials/:id/pricing-history` - Get pricing history
- `POST /api/v1/materials/:id/price` - Update price (creates history)
- `GET /api/v1/materials/categories` - Get MaterialCategory enum values
- `GET /api/v1/materials/search` - Search by SKU or description
- `GET /api/v1/random-lengths` - Get Random Lengths pricing data
- `POST /api/v1/random-lengths/import` - Import Random Lengths report

**Filtering Support**:
```typescript
// GET /api/v1/materials?category=DIMENSIONAL_LUMBER&isRLLinked=true&isActive=true
const MaterialFilterSchema = z.object({
  category: z.enum([
    'DIMENSIONAL_LUMBER', 'ENGINEERED_LUMBER', 'SHEATHING',
    'PRESSURE_TREATED', 'HARDWARE', 'CONCRETE', 'ROOFING',
    'SIDING', 'INSULATION', 'DRYWALL', 'OTHER'
  ]).optional(),
  subcategory: z.string().optional(),
  isRLLinked: z.boolean().optional(),
  isActive: z.boolean().optional(),
  vendorId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
```

**Testing**:
- [ ] Material CRUD operations
- [ ] SKU validation
- [ ] Pricing history tracking
- [ ] Category filtering
- [ ] Random Lengths integration
- [ ] Commodity price calculations

---

#### Days 9-10: Pricing Engine
**Priority**: HIGH
**Estimated Time**: 8 hours

**Tasks**:
1. Implement pricing calculation service
2. Support tiered customer pricing
3. Handle commodity price adjustments
4. Calculate waste factors
5. Support volume discounts

**Pricing Service**:
```typescript
// backend/src/services/pricing.ts
export class PricingService {
  // Get effective price for customer + material
  async getPrice(materialId: string, customerId?: string): Promise<PriceResult>

  // Calculate total with waste
  async calculateTotal(materialId: string, quantity: number, customerId?: string): Promise<number>

  // Apply commodity adjustments
  async applyCommodityFactor(materialId: string, factor: number): Promise<void>

  // Get pricing breakdown
  async getPriceBreakdown(materialId: string, customerId?: string): Promise<PriceBreakdown>
}

interface PriceResult {
  basePrice: number;
  adjustedPrice: number;
  tier: string;
  source: 'BASE' | 'CUSTOMER' | 'COMMODITY';
}

interface PriceBreakdown {
  material: number;
  labor: number;
  waste: number;
  total: number;
}
```

**API Endpoints**:
- `GET /api/v1/pricing/calculate` - Calculate price for material + quantity
- `GET /api/v1/pricing/breakdown` - Get detailed price breakdown
- `POST /api/v1/pricing/commodity-adjustment` - Apply commodity adjustment

**Testing**:
- [ ] Base price calculations
- [ ] Customer tier overrides
- [ ] Waste factor calculations
- [ ] Commodity adjustments
- [ ] Volume discount logic

---

### Week 3: Communities & Integration

#### Days 11-12: Communities & Lots
**Priority**: MEDIUM
**Estimated Time**: 8 hours
**Status**: Schema exists, API/UI not implemented

> **Note**: The actual schema uses `Community` instead of `Subdivision`. Communities are linked to Customers and contain Lots.

**Existing Prisma Schema** (from `backend/prisma/schema.prisma`):
```prisma
model Community {
  id           String   @id @default(uuid())
  name         String
  customerId   String

  // Location
  shippingYard String
  jurisdiction String?
  region       String?

  // Status
  activePlans  Int      @default(0)
  isActive     Boolean  @default(true)

  // Requirements
  specialRequirements String? @db.Text

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  customer         Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  lots             Lot[]
  jobs             Job[]
  variancePatterns VariancePattern[]
}

model Lot {
  id          String   @id @default(uuid())
  communityId String
  lotNumber   String

  // Status
  status      LotStatus @default(AVAILABLE)

  // Lot Characteristics
  sqft        Int?
  frontage    Decimal?  @db.Decimal(10, 2)
  depth       Decimal?  @db.Decimal(10, 2)

  notes       String?   @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  jobs      Job[]

  @@unique([communityId, lotNumber])
}

enum LotStatus {
  AVAILABLE
  RESERVED
  SOLD
  IN_PROGRESS
  COMPLETED
}
```

> **Key Differences from Plan**:
> - No `Subdivision` model - uses `Community` instead
> - Community is linked to a Customer (builder)
> - No `SubdivisionPlan` join table - plans are assigned via Jobs
> - LotStatus uses `IN_PROGRESS` instead of `UNDER_CONSTRUCTION`

**What Exists**:
- ✅ Prisma schema with Community and Lot models
- ❌ No API endpoints
- ❌ No UI

**What Needs to Be Built**:
- [ ] Community CRUD API endpoints
- [ ] Lot management API
- [ ] Community list/detail UI pages
- [ ] Lot management UI within community
- [ ] Customer→Community relationship UI

**API Endpoints**:
- `GET /api/v1/communities` - List communities
- `GET /api/v1/communities/:id` - Get community with lots
- `POST /api/v1/communities` - Create community
- `PUT /api/v1/communities/:id` - Update community
- `DELETE /api/v1/communities/:id` - Soft delete
- `GET /api/v1/communities/:id/lots` - Get lots
- `POST /api/v1/communities/:id/lots` - Add lot
- `PUT /api/v1/communities/:id/lots/:lotId` - Update lot
- `DELETE /api/v1/communities/:id/lots/:lotId` - Remove lot
- `GET /api/v1/customers/:id/communities` - Get customer's communities

---

#### Days 13-14: UI Components
**Priority**: MEDIUM
**Estimated Time**: 8 hours
**Status**: Some common components exist, domain components needed

**What Exists**:
- ✅ Common UI components (Button, Modal, Table, Input, Card, Alert, Loading, Toast)
- ✅ Layout components (Header, Sidebar, MainLayout, PageHeader)
- ✅ Customer components (CustomerFormModal, ContactFormModal, ExternalIdFormModal)
- ⚠️ Customer pages exist but need enhancement
- ❌ Plans, Materials, Vendors, Communities pages are stubs

**Components to Build**:

1. **Data Tables**
   - `CustomerTable` - ✅ Exists, enhance with pricing tier display
   - `MaterialTable` - With category filtering and commodity indicator
   - `PlanTable` - With type badge and elevation count
   - `VendorTable` - With material count
   - `CommunityTable` - With lot counts and status

2. **Forms**
   - `CustomerForm` - ✅ Exists, add pricing tier management
   - `MaterialForm` - With category enum picker, commodity pricing fields
   - `PlanForm` - With type enum, elevation/option management
   - `VendorForm` - With contact and terms fields
   - `CommunityForm` - With customer selection, lot management

3. **Shared Components**
   - `CategoryPicker` - Dropdown for MaterialCategory enum
   - `CustomerPricingTierManager` - Pricing tier CRUD
   - `StatusBadge` - For LotStatus, JobStatus, etc.
   - `PriceDisplay` - Formatted price with calculation breakdown
   - `CommodityPriceIndicator` - Shows if material is RL-linked

**Pages**:
- `/customers` - ✅ Exists, enhance with pricing tier display
- `/customers/:id` - ✅ Exists, add pricing tier management
- `/materials` - Replace stub with full implementation
- `/materials/:id` - Material detail with pricing history
- `/plans` - Replace stub with full implementation
- `/plans/:id` - Plan detail with elevations/options/template
- `/vendors` - Replace stub with full implementation
- `/vendors/:id` - Vendor detail with materials list
- `/communities` - New page (not `/subdivisions`)
- `/communities/:id` - Community detail with lot management

---

#### Day 15: Integration & Testing
**Priority**: HIGH
**Estimated Time**: 4 hours

**Tasks**:
1. End-to-end integration testing
2. API documentation with Swagger/OpenAPI
3. Performance testing for list views
4. Security review of new endpoints
5. Update main README with Foundation Layer docs

**Integration Tests**:
- [ ] Create customer → add pricing tier → verify discount calculation
- [ ] Create material → assign vendor → verify lookup
- [ ] Create plan → add elevations → add options → verify template
- [ ] Create community → add lots → verify lot status workflow
- [ ] Full workflow: Customer → Community → Lot → Job assignment

**Performance Targets**:
- List endpoints: < 200ms for 1000 records
- Detail endpoints: < 100ms
- Search endpoints: < 300ms
- Pricing calculations: < 50ms

**Documentation**:
- [ ] Swagger/OpenAPI spec for all endpoints
- [ ] Postman collection export
- [ ] README updates for Foundation Layer
- [ ] Database schema diagram

---

## Success Metrics

### Code Quality
- **Target**: 80%+ test coverage on new code
- **Target**: TypeScript strict mode compliance
- **Target**: Zero eslint errors
- **Target**: All Zod validations comprehensive

### API Quality
- **Target**: RESTful conventions followed
- **Target**: Consistent error responses
- **Target**: Pagination on all list endpoints
- **Target**: Filtering support where appropriate

### Performance
- **Target**: < 200ms response for list endpoints
- **Target**: < 100ms for CRUD operations
- **Target**: Efficient database queries (no N+1)

### Documentation
- **Target**: 100% API endpoints documented
- **Target**: All models have field descriptions
- **Target**: Usage examples for complex operations

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Schema changes from code system | High | Medium | Flexible design, migrations ready |
| Performance issues with pricing | Medium | Medium | Cache common calculations |
| Complex validation rules | Medium | Medium | Comprehensive Zod schemas |
| UI scope creep | Medium | High | MVP functionality first |

---

## Dependencies

### From Sprint 2
- Code system decision
- Category structure
- Code format specification

### External
- Frontend component library (existing)
- Prisma ORM (existing)
- PostgreSQL (existing)

---

## Documentation Deliverables

### API Documentation
- [ ] OpenAPI/Swagger spec
- [ ] Postman collection
- [ ] API usage examples

### Database Documentation
- [ ] Updated schema diagram
- [ ] Model relationship docs
- [ ] Migration history

### Sprint Documentation
- [ ] `/docs/sprints/sprint-03/PLAN.md` (this file)
- [ ] `/docs/sprints/sprint-03/PROGRESS.md`
- [ ] `/docs/sprints/sprint-03/DECISIONS.md`
- [ ] `/docs/sprints/sprint-03/RETROSPECTIVE.md`

### User Documentation
- [ ] Foundation Layer overview
- [ ] Data entry guides
- [ ] Pricing system documentation

---

## Future Considerations

### Next Sprint (Sprint 4: Operational Core)
Foundation Layer enables:
- Job creation (Customer + Plan + Community + Lot)
- Takeoff management with PlanTemplateItem as base
- Estimate generation with PricingHistory transparency
- Variance tracking (already in schema)

### Schema Already Supports
The Prisma schema already includes Operational Core models:
- `Job` - Full job lifecycle management
- `JobOption` - Selected options per job
- `Takeoff` - Material takeoffs with validation
- `TakeoffLineItem` - Individual line items with variance tracking
- `TakeoffValidation` - Multi-stage validation
- `PurchaseOrder` - PO management with delivery tracking

### Integration Points
- Random Lengths commodity pricing (schema ready)
- External system IDs via `CustomerExternalId`
- Variance patterns for continuous improvement

---

**Sprint Status**: Planned
**Created**: 2025-11-20
**Updated**: 2025-11-25 (aligned with actual schema.prisma)
**Prerequisites**: Sprint 2 (Code System Review) complete
**Next Update**: Sprint kickoff
