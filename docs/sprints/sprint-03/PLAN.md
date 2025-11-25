# Sprint 3: Foundation Layer Implementation

**Sprint Number**: 3
**Phase**: Phase 1 - Foundation Layer
**Duration**: 3 weeks (15 working days)
**Planned Start**: After Sprint 2 completion
**Status**: Planned

---

## Sprint Objectives

### Primary Goal
Implement the complete Foundation Layer of the four-layer architecture, including database models, API endpoints, and basic UI components for Customers, Plans, Materials, Subdivisions, and Vendors.

### Success Criteria
- [ ] All Foundation Layer Prisma models created and migrated
- [ ] CRUD API endpoints for all entities
- [ ] Input validation with Zod schemas
- [ ] Basic UI components for data entry
- [ ] Code system integration from Sprint 2
- [ ] 80%+ test coverage on new code
- [ ] API documentation complete

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

### Week 1: Core Data Models

#### Days 1-2: Customer Management
**Priority**: HIGH
**Estimated Time**: 8 hours

**Prisma Models**:
```prisma
model Customer {
  id              String           @id @default(uuid())
  name            String
  code            String           @unique
  type            CustomerType
  pricingTier     PricingTier      @default(STANDARD)
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  address         String?
  city            String?
  state           String?
  zip             String?
  notes           String?
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  pricingOverrides CustomerPricing[]
  purchaseOrders   PurchaseOrder[]
}

enum CustomerType {
  BUILDER
  SUBCONTRACTOR
  SUPPLIER
  OTHER
}

enum PricingTier {
  TIER_1      // Best pricing
  TIER_2      // Standard pricing
  STANDARD    // Default pricing
  RETAIL      // Retail pricing
}

model CustomerPricing {
  id          String   @id @default(uuid())
  customerId  String
  materialId  String
  price       Decimal  @db.Decimal(10, 2)
  effectiveDate DateTime
  expirationDate DateTime?

  customer    Customer @relation(fields: [customerId], references: [id])
  material    Material @relation(fields: [materialId], references: [id])

  @@unique([customerId, materialId, effectiveDate])
}
```

**API Endpoints**:
- `GET /api/v1/customers` - List all customers (paginated)
- `GET /api/v1/customers/:id` - Get customer by ID
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Soft delete customer
- `GET /api/v1/customers/:id/pricing` - Get customer pricing overrides
- `POST /api/v1/customers/:id/pricing` - Add pricing override

**Zod Validation**:
```typescript
const CustomerCreateSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(2).max(20).regex(/^[A-Z0-9-]+$/),
  type: z.enum(['BUILDER', 'SUBCONTRACTOR', 'SUPPLIER', 'OTHER']),
  pricingTier: z.enum(['TIER_1', 'TIER_2', 'STANDARD', 'RETAIL']).optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  // ... address fields
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

**Prisma Models**:
```prisma
model Plan {
  id              String        @id @default(uuid())
  name            String
  code            String        @unique
  description     String?
  sqft            Int
  bedrooms        Int
  bathrooms       Decimal       @db.Decimal(3, 1)
  garage          Int           @default(2)
  stories         Int           @default(1)
  basePrice       Decimal       @db.Decimal(10, 2)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  elevations      Elevation[]
  options         PlanOption[]
  takeoffs        PlanTakeoff[]
}

model Elevation {
  id          String   @id @default(uuid())
  planId      String
  name        String   // A, B, C, D
  description String?
  priceAdj    Decimal  @db.Decimal(10, 2) @default(0)
  sqftAdj     Int      @default(0)
  isActive    Boolean  @default(true)

  plan        Plan     @relation(fields: [planId], references: [id])

  @@unique([planId, name])
}

model PlanOption {
  id          String   @id @default(uuid())
  planId      String
  code        String
  name        String
  description String?
  category    String   // Kitchen, Bath, Exterior, etc.
  price       Decimal  @db.Decimal(10, 2)
  isStandard  Boolean  @default(false)
  isActive    Boolean  @default(true)

  plan        Plan     @relation(fields: [planId], references: [id])

  @@unique([planId, code])
}
```

**API Endpoints**:
- `GET /api/v1/plans` - List all plans
- `GET /api/v1/plans/:id` - Get plan with elevations and options
- `POST /api/v1/plans` - Create plan
- `PUT /api/v1/plans/:id` - Update plan
- `DELETE /api/v1/plans/:id` - Soft delete
- `GET /api/v1/plans/:id/elevations` - Get plan elevations
- `POST /api/v1/plans/:id/elevations` - Add elevation
- `GET /api/v1/plans/:id/options` - Get plan options
- `POST /api/v1/plans/:id/options` - Add option

**Testing**:
- [ ] Plan CRUD operations
- [ ] Elevation management
- [ ] Option management
- [ ] Price calculations with adjustments

---

#### Day 5: Vendors
**Priority**: MEDIUM
**Estimated Time**: 4 hours

**Prisma Models**:
```prisma
model Vendor {
  id              String        @id @default(uuid())
  name            String
  code            String        @unique
  type            VendorType
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  address         String?
  city            String?
  state           String?
  zip             String?
  paymentTerms    String?       // Net 30, Net 15, etc.
  notes           String?
  isActive        Boolean       @default(true)
  isPreferred     Boolean       @default(false)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  materials       VendorMaterial[]
  purchaseOrders  PurchaseOrder[]
}

enum VendorType {
  SUPPLIER
  MANUFACTURER
  DISTRIBUTOR
  SUBCONTRACTOR
}

model VendorMaterial {
  id          String   @id @default(uuid())
  vendorId    String
  materialId  String
  vendorSku   String?
  price       Decimal  @db.Decimal(10, 2)
  leadTime    Int?     // days
  minOrder    Int?
  isPreferred Boolean  @default(false)

  vendor      Vendor   @relation(fields: [vendorId], references: [id])
  material    Material @relation(fields: [materialId], references: [id])

  @@unique([vendorId, materialId])
}
```

**API Endpoints**:
- `GET /api/v1/vendors` - List vendors
- `GET /api/v1/vendors/:id` - Get vendor details
- `POST /api/v1/vendors` - Create vendor
- `PUT /api/v1/vendors/:id` - Update vendor
- `DELETE /api/v1/vendors/:id` - Soft delete
- `GET /api/v1/vendors/:id/materials` - Get vendor materials
- `POST /api/v1/vendors/:id/materials` - Link material to vendor

---

### Week 2: Materials & Pricing

#### Days 6-8: Materials System
**Priority**: CRITICAL
**Estimated Time**: 12 hours

**Prisma Models**:
```prisma
model Material {
  id              String           @id @default(uuid())
  code            String           @unique  // From code system
  name            String
  description     String?
  category        String           // Primary category
  subcategory     String?          // Secondary category
  unit            UnitOfMeasure
  unitCost        Decimal          @db.Decimal(10, 4)
  laborCost       Decimal?         @db.Decimal(10, 4)
  waste           Decimal          @db.Decimal(5, 2) @default(0)
  isCommodity     Boolean          @default(false)
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  vendors         VendorMaterial[]
  customerPricing CustomerPricing[]
  priceHistory    MaterialPriceHistory[]
  takeoffItems    TakeoffItem[]
}

enum UnitOfMeasure {
  EACH
  LF         // Linear Feet
  SF         // Square Feet
  CF         // Cubic Feet
  BF         // Board Feet
  MBF        // Thousand Board Feet
  CY         // Cubic Yards
  TON
  GAL
  LB
  BAG
  BOX
  ROLL
  SHEET
  BUNDLE
}

model MaterialPriceHistory {
  id          String   @id @default(uuid())
  materialId  String
  price       Decimal  @db.Decimal(10, 4)
  effectiveDate DateTime
  source      String?  // Manual, Import, API
  notes       String?

  material    Material @relation(fields: [materialId], references: [id])

  @@index([materialId, effectiveDate])
}

model CodeCategory {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  parentId    String?
  sortOrder   Int      @default(0)

  parent      CodeCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    CodeCategory[] @relation("CategoryHierarchy")
}
```

**API Endpoints**:
- `GET /api/v1/materials` - List materials (with filtering)
- `GET /api/v1/materials/:id` - Get material details
- `POST /api/v1/materials` - Create material
- `PUT /api/v1/materials/:id` - Update material
- `DELETE /api/v1/materials/:id` - Soft delete
- `GET /api/v1/materials/:id/price-history` - Get price history
- `POST /api/v1/materials/:id/price` - Update price (creates history)
- `GET /api/v1/materials/categories` - Get code categories
- `GET /api/v1/materials/search` - Search by code or name

**Filtering Support**:
```typescript
// GET /api/v1/materials?category=FRM&isCommodity=true&isActive=true
const MaterialFilterSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  isCommodity: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
```

**Testing**:
- [ ] Material CRUD operations
- [ ] Code validation against code system
- [ ] Price history tracking
- [ ] Category filtering
- [ ] Search functionality

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

### Week 3: Subdivisions & Integration

#### Days 11-12: Subdivisions & Lots
**Priority**: MEDIUM
**Estimated Time**: 8 hours

**Prisma Models**:
```prisma
model Subdivision {
  id              String    @id @default(uuid())
  name            String
  code            String    @unique
  city            String
  state           String
  county          String?
  builder         String?
  totalLots       Int
  availableLots   Int
  startDate       DateTime?
  estimatedEnd    DateTime?
  status          SubdivisionStatus @default(PLANNING)
  notes           String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  lots            Lot[]
  allowedPlans    SubdivisionPlan[]
}

enum SubdivisionStatus {
  PLANNING
  PERMITTING
  DEVELOPMENT
  ACTIVE
  CLOSEOUT
  COMPLETED
}

model Lot {
  id              String    @id @default(uuid())
  subdivisionId   String
  lotNumber       String
  block           String?
  address         String?
  sqft            Int?
  premium         Decimal   @db.Decimal(10, 2) @default(0)
  status          LotStatus @default(AVAILABLE)
  notes           String?

  subdivision     Subdivision @relation(fields: [subdivisionId], references: [id])

  @@unique([subdivisionId, lotNumber])
}

enum LotStatus {
  AVAILABLE
  RESERVED
  SOLD
  UNDER_CONSTRUCTION
  COMPLETED
}

model SubdivisionPlan {
  id              String   @id @default(uuid())
  subdivisionId   String
  planId          String

  subdivision     Subdivision @relation(fields: [subdivisionId], references: [id])
  plan            Plan        @relation(fields: [planId], references: [id])

  @@unique([subdivisionId, planId])
}
```

**API Endpoints**:
- `GET /api/v1/subdivisions` - List subdivisions
- `GET /api/v1/subdivisions/:id` - Get subdivision with lots
- `POST /api/v1/subdivisions` - Create subdivision
- `PUT /api/v1/subdivisions/:id` - Update subdivision
- `GET /api/v1/subdivisions/:id/lots` - Get lots
- `POST /api/v1/subdivisions/:id/lots` - Add lot
- `PUT /api/v1/subdivisions/:id/lots/:lotId` - Update lot
- `GET /api/v1/subdivisions/:id/plans` - Get allowed plans
- `POST /api/v1/subdivisions/:id/plans` - Link plan to subdivision

---

#### Days 13-14: UI Components
**Priority**: MEDIUM
**Estimated Time**: 8 hours

**Components to Build**:

1. **Data Tables**
   - `CustomerTable` - List view with sorting, filtering
   - `MaterialTable` - With category filtering
   - `PlanTable` - With elevation preview
   - `VendorTable` - Standard list view
   - `SubdivisionTable` - With lot counts

2. **Forms**
   - `CustomerForm` - Create/edit customer
   - `MaterialForm` - With code picker
   - `PlanForm` - With elevation/option management
   - `VendorForm` - Standard form
   - `SubdivisionForm` - With lot management

3. **Shared Components**
   - `CodePicker` - Autocomplete for material codes
   - `PricingTierSelector` - Customer tier selection
   - `StatusBadge` - Status indicators
   - `PriceDisplay` - Formatted price display

**Pages**:
- `/customers` - Customer list
- `/customers/:id` - Customer detail/edit
- `/materials` - Material list with category browser
- `/materials/:id` - Material detail/edit
- `/plans` - Plan list
- `/plans/:id` - Plan detail with elevations/options
- `/vendors` - Vendor list
- `/vendors/:id` - Vendor detail
- `/subdivisions` - Subdivision list
- `/subdivisions/:id` - Subdivision detail with lot map

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
- [ ] Create customer → add pricing → verify calculation
- [ ] Create material → link to vendor → verify lookup
- [ ] Create plan → add elevations → add options → verify pricing
- [ ] Create subdivision → add lots → link plans → verify availability
- [ ] Full workflow: Customer + Plan + Subdivision + Pricing

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
- Job creation (Customer + Plan + Lot)
- Takeoff management
- Estimate generation

### Integration Points
- External vendor APIs
- Accounting system sync
- Document management

---

**Sprint Status**: Planned
**Created**: 2025-11-20
**Prerequisites**: Sprint 2 (Code System Review) complete
**Next Update**: Sprint kickoff
