# BAT System Design v2.0 - Modular Bid Assistance Tool

**Date:** 2025-11-16
**Purpose:** Modern, scalable replacement for Excel-based BAT system
**Integration:** Works in parallel with Construction Management Platform

---

## Executive Summary

**Current State:** Excel-based BAT with 49 sheets, 1,280+ formulas, manual pricing updates
**Target State:** Modular Python/TypeScript application with automated pricing, plan extraction, and database-driven workflows

**Key Improvements:**
- 🚀 **Performance:** Replace VLOOKUP with indexed database queries (100x faster)
- 🔄 **Automation:** Monthly pricing updates via API integration
- 📊 **Analytics:** Real-time margin analysis and bid optimization
- 🔌 **Integration:** RESTful API for Construction Management Platform
- 🛡️ **Reliability:** Error handling, validation, audit trails

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BAT System v2.0 Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Frontend   │────▶│   API Layer  │────▶│   Database   │        │
│  │  (React/TS)  │     │  (FastAPI)   │     │ (PostgreSQL) │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
│         │                     │                     │                │
│         │              ┌──────▼──────┐             │                │
│         │              │   Modules   │             │                │
│         │              ├─────────────┤             │                │
│         └─────────────▶│ • Pricing   │◀────────────┘                │
│                        │ • Plans     │                              │
│                        │ • Materials │                              │
│                        │ • Bids      │                              │
│                        │ • Analytics │                              │
│                        └─────────────┘                              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            External Integrations                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • Supplier APIs (Pricing Updates)                            │  │
│  │ • Construction Management Platform                            │  │
│  │ • Excel Import/Export (Transition Period)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### Module 1: Material Catalog Service

**Purpose:** Central repository for all materials, SKUs, and specifications

**Responsibilities:**
- Store and manage material definitions
- Track SKU inventory and specifications
- Handle material categorization (DART categories, item types)
- Provide search and filtering capabilities
- Manage material relationships (substitutes, alternatives)

**Database Tables:**
```sql
-- Core material definition
CREATE TABLE materials (
    id UUID PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    online_description TEXT,
    category_id INTEGER REFERENCES categories(id),
    item_type_code VARCHAR(10),
    uom VARCHAR(20),  -- Unit of measure
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Material categories (DART)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    dart_code VARCHAR(20),
    minor_code VARCHAR(20)
);

-- Material specifications
CREATE TABLE material_specs (
    id UUID PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    spec_key VARCHAR(100),
    spec_value TEXT,
    effective_date DATE
);
```

**Key Functions:**
```python
class MaterialCatalogService:
    """Manages material catalog and specifications"""

    async def search_materials(self, query: str, filters: Dict) -> List[Material]:
        """Search materials by SKU, description, or category"""

    async def get_material_by_sku(self, sku: str) -> Material:
        """Retrieve material details by SKU"""

    async def bulk_import_materials(self, materials: List[Dict]) -> ImportResult:
        """Bulk import materials from Excel/CSV"""

    async def get_material_substitutes(self, sku: str) -> List[Material]:
        """Get alternative/substitute materials"""
```

**API Endpoints:**
```
GET    /api/v1/materials              # List all materials
GET    /api/v1/materials/search?q=    # Search materials
GET    /api/v1/materials/{sku}        # Get material by SKU
POST   /api/v1/materials              # Create new material
PUT    /api/v1/materials/{sku}        # Update material
DELETE /api/v1/materials/{sku}        # Deactivate material
POST   /api/v1/materials/import       # Bulk import
```

**Integration with CM Platform:**
- Provides material lookup for purchase orders
- Supplies cost data for project budgeting
- Feeds material specs to scheduling module

---

### Module 2: Pricing Engine

**Purpose:** Manage pricing across multiple levels, suppliers, and customers

**Responsibilities:**
- Store multi-tier pricing (wholesale, retail, contractor levels)
- Handle customer-specific pricing agreements
- Calculate volume discounts
- Track pricing history and changes
- Support monthly price updates via API
- Calculate margins and profitability

**Database Tables:**
```sql
-- Base pricing for materials
CREATE TABLE material_pricing (
    id UUID PRIMARY KEY,
    material_id UUID REFERENCES materials(id),
    supplier_id UUID REFERENCES suppliers(id),
    cost_per_uom DECIMAL(10,4) NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Price levels (01, 02, 03, etc. from current Excel)
CREATE TABLE price_levels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,  -- "01", "02", "L5", etc.
    name VARCHAR(100),
    markup_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true
);

-- Customer price level assignments
CREATE TABLE customer_pricing (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    material_id UUID REFERENCES materials(id),
    price_level_id INTEGER REFERENCES price_levels(id),
    custom_price DECIMAL(10,4),  -- Override if needed
    effective_date DATE NOT NULL,
    expiration_date DATE
);

-- Pricing update history
CREATE TABLE pricing_updates (
    id UUID PRIMARY KEY,
    update_date DATE NOT NULL,
    source VARCHAR(50),  -- 'manual', 'api', 'supplier_feed'
    materials_updated INTEGER,
    avg_price_change_pct DECIMAL(5,2),
    updated_by VARCHAR(100),
    notes TEXT
);
```

**Key Functions:**
```python
class PricingEngine:
    """Manages pricing calculations and updates"""

    async def get_material_price(
        self,
        sku: str,
        quantity: float,
        customer_id: UUID = None,
        price_level: str = None
    ) -> PriceQuote:
        """Calculate price for material based on quantity and customer"""

    async def update_monthly_pricing(
        self,
        supplier: str,
        price_data: List[Dict]
    ) -> PricingUpdateResult:
        """Process monthly pricing updates from supplier API"""

    async def calculate_bid_pricing(
        self,
        plan_code: str,
        customer_id: UUID,
        options: Dict
    ) -> BidPricing:
        """Calculate complete bid pricing for a plan"""

    async def get_pricing_history(
        self,
        sku: str,
        start_date: date,
        end_date: date
    ) -> List[PriceHistory]:
        """Get historical pricing for analysis"""

    async def calculate_margin(
        self,
        sell_price: Decimal,
        cost: Decimal
    ) -> MarginAnalysis:
        """Calculate dollar and percentage margins"""
```

**API Endpoints:**
```
GET    /api/v1/pricing/{sku}                     # Get current pricing
POST   /api/v1/pricing/calculate                 # Calculate price quote
POST   /api/v1/pricing/update/monthly            # Monthly price update
GET    /api/v1/pricing/history/{sku}             # Price history
GET    /api/v1/pricing/levels                    # List price levels
POST   /api/v1/pricing/customer/{customer_id}    # Set customer pricing
```

**Monthly Pricing Update Workflow:**
```python
# Example: Monthly pricing update from supplier
async def monthly_pricing_update_workflow():
    """
    Automated monthly pricing update process

    Replaces manual Excel updates with automated API-driven process
    """

    # 1. Fetch pricing from supplier APIs
    pricing_data = await supplier_api.fetch_monthly_pricing()

    # 2. Validate pricing data
    validation = await pricing_engine.validate_pricing_update(pricing_data)

    # 3. Preview changes (like Excel "what-if" scenario)
    preview = await pricing_engine.preview_price_changes(pricing_data)

    # 4. Send notification for approval
    await notify_pricing_team(preview)

    # 5. Apply approved changes
    if approved:
        result = await pricing_engine.update_monthly_pricing(
            supplier='primary_supplier',
            price_data=pricing_data
        )

    # 6. Recalculate all active bids with new pricing
    await bid_service.recalculate_active_bids()

    # 7. Generate pricing change report
    await generate_pricing_report(result)
```

**Integration with CM Platform:**
- Provides real-time pricing for material requisitions
- Feeds cost estimates to project budgets
- Supports purchase order pricing validation

---

### Module 3: Plan Management Service

**Purpose:** Manage house plans, material lists, and pack definitions

**Responsibilities:**
- Store plan definitions (1670, 2336-B, G18L, etc.)
- Manage pack structures (foundation, walls, roof, etc.)
- Track plan-specific material quantities
- Handle plan options and variations
- Support plan extraction based on pack requirements
- Generate material takeoffs

**Database Tables:**
```sql
-- Plan definitions
CREATE TABLE plans (
    id UUID PRIMARY KEY,
    plan_code VARCHAR(50) UNIQUE NOT NULL,  -- "1670", "G18L", "2336-B"
    name VARCHAR(200),
    builder VARCHAR(100),  -- "Holt", "Richmond"
    square_footage INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pack definitions (|10 FOUNDATION, |20 WALLS, etc.)
CREATE TABLE packs (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,  -- "10", "20", "30"
    name VARCHAR(200),  -- "FOUNDATION", "MAIN WALLS"
    elevations VARCHAR(20)[],  -- ["A", "B", "C", "D"]
    phase_code VARCHAR(10),
    display_order INTEGER
);

-- Plan-Pack-Material relationships (the core of BAT)
CREATE TABLE plan_materials (
    id UUID PRIMARY KEY,
    plan_id UUID REFERENCES plans(id),
    pack_id UUID REFERENCES packs(id),
    material_id UUID REFERENCES materials(id),
    quantity DECIMAL(10,4) NOT NULL,
    unified_code VARCHAR(50),  -- "1670-101.000-00-4085"
    location_string VARCHAR(200),  -- "05 UNDERFLOOR|"
    is_optional BOOLEAN DEFAULT false,
    notes TEXT
);

-- Plan options/variations
CREATE TABLE plan_options (
    id UUID PRIMARY KEY,
    plan_id UUID REFERENCES plans(id),
    option_name VARCHAR(100),
    description TEXT,
    material_adjustments JSONB  -- Add/remove materials
);
```

**Key Functions:**
```python
class PlanManagementService:
    """Manages house plans and material lists"""

    async def get_plan_materials(
        self,
        plan_code: str,
        packs: List[str] = None,
        elevations: List[str] = None
    ) -> PlanMaterialList:
        """
        Extract material list for a plan based on selected packs

        Example:
            # Get just foundation and walls
            materials = await service.get_plan_materials(
                plan_code="1670",
                packs=["10", "20"],
                elevations=["A", "B"]
            )
        """

    async def calculate_plan_takeoff(
        self,
        plan_code: str,
        options: List[str] = None
    ) -> MaterialTakeoff:
        """Generate complete material takeoff for plan"""

    async def compare_plans(
        self,
        plan_codes: List[str]
    ) -> PlanComparison:
        """Compare material requirements across multiple plans"""

    async def import_plan_from_excel(
        self,
        excel_file: str,
        plan_code: str
    ) -> ImportResult:
        """Import plan materials from existing Excel BAT"""
```

**API Endpoints:**
```
GET    /api/v1/plans                           # List all plans
GET    /api/v1/plans/{code}                    # Get plan details
GET    /api/v1/plans/{code}/materials          # Get plan materials
POST   /api/v1/plans/{code}/materials/filter   # Filter by packs/elevations
GET    /api/v1/plans/{code}/takeoff            # Generate takeoff
POST   /api/v1/plans/compare                   # Compare multiple plans
POST   /api/v1/plans/import                    # Import from Excel
```

**Pack-Based Extraction Example:**
```python
# Example: Extract only packs needed for a specific job
async def extract_job_specific_materials():
    """
    Customer only needs foundation and main floor
    Extract just those packs from plan
    """

    materials = await plan_service.get_plan_materials(
        plan_code="1670",
        packs=["10", "11"],  # Foundation + Main Joist System
        elevations=["A", "B", "C"]
    )

    # Returns filtered material list with quantities
    return {
        "plan": "1670",
        "packs": ["10 FOUNDATION", "11 MAIN JOIST SYSTEM"],
        "elevations": ["A", "B", "C"],
        "materials": [
            {"sku": "24DF", "qty": 60, "description": "bracing"},
            {"sku": "2616HF3TICAG", "qty": 12, "description": "sill plate"},
            # ... more materials
        ],
        "total_materials": 45,
        "estimated_cost": 12450.00
    }
```

**Integration with CM Platform:**
- Provides material lists for project creation
- Feeds scheduling module with material delivery requirements
- Supports procurement planning

---

### Module 4: Bid Generation Service

**Purpose:** Create, manage, and optimize construction bids

**Responsibilities:**
- Generate bids from plan selections
- Calculate bid totals with margins
- Track bid versions and revisions
- Support bid comparison and optimization
- Export to PDF/Excel for customer delivery
- Track bid status (pending, approved, rejected)

**Database Tables:**
```sql
-- Bid headers
CREATE TABLE bids (
    id UUID PRIMARY KEY,
    bid_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(20),  -- 'draft', 'pending', 'approved', 'rejected'
    created_date DATE NOT NULL,
    valid_until DATE,
    total_cost DECIMAL(12,2),
    total_sell DECIMAL(12,2),
    margin_dollars DECIMAL(12,2),
    margin_percent DECIMAL(5,2),
    created_by VARCHAR(100),
    notes TEXT
);

-- Bid line items
CREATE TABLE bid_items (
    id UUID PRIMARY KEY,
    bid_id UUID REFERENCES bids(id),
    material_id UUID REFERENCES materials(id),
    pack_code VARCHAR(50),
    quantity DECIMAL(10,4),
    unit_cost DECIMAL(10,4),
    unit_sell DECIMAL(10,4),
    line_total_cost DECIMAL(12,2),
    line_total_sell DECIMAL(12,2),
    is_optional BOOLEAN DEFAULT false
);

-- Bid revisions
CREATE TABLE bid_revisions (
    id UUID PRIMARY KEY,
    bid_id UUID REFERENCES bids(id),
    revision_number INTEGER,
    revised_date DATE,
    revision_reason TEXT,
    price_delta DECIMAL(12,2),
    revised_by VARCHAR(100)
);
```

**Key Functions:**
```python
class BidGenerationService:
    """Creates and manages construction bids"""

    async def generate_bid(
        self,
        plan_code: str,
        customer_id: UUID,
        packs: List[str] = None,
        options: Dict = None
    ) -> Bid:
        """
        Generate complete bid from plan selection

        Replaces manual Excel bid creation with automated process
        """

    async def calculate_bid_total(
        self,
        bid_id: UUID
    ) -> BidTotal:
        """
        Calculate bid totals by category

        Replaces Excel SUMIF formulas with database aggregation
        """

    async def optimize_bid_margin(
        self,
        bid_id: UUID,
        target_margin: Decimal
    ) -> OptimizationResult:
        """Suggest price adjustments to hit target margin"""

    async def export_bid_to_pdf(
        self,
        bid_id: UUID,
        template: str = 'standard'
    ) -> bytes:
        """Generate professional PDF bid for customer"""

    async def compare_bid_scenarios(
        self,
        plan_code: str,
        scenarios: List[Dict]
    ) -> ScenarioComparison:
        """Compare different pack/option combinations"""
```

**API Endpoints:**
```
GET    /api/v1/bids                      # List all bids
POST   /api/v1/bids/generate             # Generate new bid
GET    /api/v1/bids/{id}                 # Get bid details
PUT    /api/v1/bids/{id}                 # Update bid
POST   /api/v1/bids/{id}/calculate       # Recalculate totals
POST   /api/v1/bids/{id}/optimize        # Optimize margins
GET    /api/v1/bids/{id}/export/pdf      # Export to PDF
POST   /api/v1/bids/compare              # Compare scenarios
```

**Bid Total Calculation (Replaces Excel):**
```python
async def calculate_bid_total_by_category(bid_id: UUID) -> BidTotal:
    """
    Calculate bid totals by category

    Current Excel: Multiple SUMIF formulas across columns
    New System: Single database query with aggregation
    """

    query = """
    SELECT
        c.name AS category,
        c.dart_code,
        SUM(bi.line_total_cost) AS total_cost,
        SUM(bi.line_total_sell) AS total_sell,
        SUM(bi.line_total_sell - bi.line_total_cost) AS margin_dollars,
        AVG((bi.line_total_sell - bi.line_total_cost) / NULLIF(bi.line_total_sell, 0)) AS margin_pct
    FROM bid_items bi
    JOIN materials m ON bi.material_id = m.id
    JOIN categories c ON m.category_id = c.id
    WHERE bi.bid_id = $1
    GROUP BY c.name, c.dart_code
    ORDER BY c.dart_code
    """

    results = await db.fetch(query, bid_id)

    return {
        "bid_id": bid_id,
        "categories": results,
        "grand_total_cost": sum(r['total_cost'] for r in results),
        "grand_total_sell": sum(r['total_sell'] for r in results),
        "overall_margin_pct": calculate_overall_margin(results)
    }
```

**Integration with CM Platform:**
- Creates projects from approved bids
- Feeds material procurement from bid line items
- Tracks bid-to-project conversion rate

---

### Module 5: Analytics & Reporting

**Purpose:** Provide insights, trends, and decision support

**Responsibilities:**
- Track pricing trends over time
- Analyze margin performance
- Generate supplier performance reports
- Forecast material costs
- Identify bid optimization opportunities
- Support data-driven pricing decisions

**Database Views:**
```sql
-- Material cost trends
CREATE VIEW material_cost_trends AS
SELECT
    m.sku,
    m.description,
    mp.effective_date,
    mp.cost_per_uom,
    LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    ) AS previous_cost,
    ((mp.cost_per_uom - LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    )) / NULLIF(LAG(mp.cost_per_uom) OVER (
        PARTITION BY m.id
        ORDER BY mp.effective_date
    ), 0)) * 100 AS pct_change
FROM materials m
JOIN material_pricing mp ON m.id = mp.material_id
WHERE m.is_active = true;

-- Bid performance metrics
CREATE VIEW bid_performance AS
SELECT
    DATE_TRUNC('month', b.created_date) AS month,
    COUNT(*) AS total_bids,
    COUNT(*) FILTER (WHERE b.status = 'approved') AS approved_bids,
    AVG(b.margin_percent) AS avg_margin,
    SUM(b.total_sell) FILTER (WHERE b.status = 'approved') AS approved_revenue
FROM bids b
GROUP BY DATE_TRUNC('month', b.created_date);
```

**Key Functions:**
```python
class AnalyticsService:
    """Provides business intelligence and reporting"""

    async def get_pricing_trends(
        self,
        sku: str = None,
        category: str = None,
        period: str = '12m'
    ) -> PricingTrends:
        """Analyze pricing trends over time"""

    async def analyze_bid_margins(
        self,
        start_date: date,
        end_date: date,
        group_by: str = 'category'
    ) -> MarginAnalysis:
        """Analyze margin performance"""

    async def forecast_material_costs(
        self,
        sku: str,
        months_ahead: int = 6
    ) -> CostForecast:
        """Predict future material costs using ML"""

    async def generate_monthly_report(
        self,
        month: date
    ) -> MonthlyReport:
        """Generate comprehensive monthly business report"""
```

**API Endpoints:**
```
GET    /api/v1/analytics/pricing-trends       # Pricing trend analysis
GET    /api/v1/analytics/margins              # Margin analysis
GET    /api/v1/analytics/forecast/{sku}       # Cost forecasting
POST   /api/v1/analytics/reports/monthly      # Monthly report
GET    /api/v1/analytics/dashboards           # Analytics dashboards
```

**Integration with CM Platform:**
- Provides cost trend data for project budgeting
- Feeds margin analysis to executive dashboards
- Supports procurement planning with forecasts

---

## Database Schema Overview

### Unified Material Coding

The system uses the unified coding format developed in the import tool:

**Format:** `PPPP-PPP.MMM-EE-IIII`

Where:
- `PPPP` = Plan code (1670, 2336, G18L, etc.)
- `PPP.MMM` = Phase code (101.000, 010.820, etc.)
- `EE` = Elevation (00, AB, ABCD, **, etc.)
- `IIII` = Item type (4085, 9000, etc.)

**Example:** `1670-101.000-AB-4085`

This unified code is stored in `plan_materials.unified_code` and serves as the primary key for material lookups.

---

## API Architecture

### RESTful API Design

**Base URL:** `https://api.construction-platform.com/bat/v1/`

**Authentication:** JWT tokens with role-based access control

**Response Format:**
```json
{
    "success": true,
    "data": { ... },
    "meta": {
        "timestamp": "2025-11-16T12:00:00Z",
        "request_id": "uuid",
        "version": "1.0"
    },
    "errors": []
}
```

**Rate Limiting:** 1000 requests/hour per API key

**Pagination:**
```
GET /api/v1/materials?page=2&per_page=50
```

Response:
```json
{
    "data": [...],
    "meta": {
        "page": 2,
        "per_page": 50,
        "total_pages": 10,
        "total_items": 500
    }
}
```

---

## Integration with Construction Management Platform

### Integration Points

1. **Project Creation from Bid**
   ```
   POST /api/v1/cm/projects/from-bid
   Body: { "bid_id": "uuid" }

   Creates new CM project with:
   - Material list from bid
   - Budget from bid pricing
   - Timeline estimates
   ```

2. **Material Procurement**
   ```
   POST /api/v1/cm/purchase-orders/from-plan
   Body: { "plan_code": "1670", "packs": ["10", "20"] }

   Generates purchase orders with:
   - Current pricing from BAT
   - Supplier assignments
   - Delivery schedules
   ```

3. **Budget Tracking**
   ```
   GET /api/v1/cm/projects/{id}/budget-variance

   Compares actual costs vs. bid estimates
   ```

4. **Real-time Pricing Updates**
   ```
   Webhook: POST /cm/webhooks/pricing-updated
   Body: { "materials": ["SKU1", "SKU2"], "date": "2025-11-16" }

   Notifies CM platform when pricing changes
   Triggers budget recalculation if needed
   ```

---

## Migration Path from Excel

### Phase 1: Data Import (Week 1-2)

**Objective:** Import existing Excel data into new database

**Steps:**
1. Run `auto_import_bat.py` to import Richmond (55K materials) and Holt (15K codes)
2. Import pricing data from Excel worksheets
3. Import customer pricing levels
4. Validate data integrity

**Tools:**
```bash
# Import Richmond materials
python tools/auto_import_bat.py \
  --file "RAH_MaterialDatabase.xlsx" \
  --all-plans

# Import Holt materials
python tools/auto_import_bat.py \
  --holt \
  --file "indexMaterialListbyPlanHolt20251114.xlsx"

# Import pricing data
python tools/import_pricing.py \
  --file "NEW HOLT BAT.xlsx" \
  --sheet "Customer Price Levels"
```

### Phase 2: Parallel Operation (Week 3-8)

**Objective:** Run new system alongside Excel for validation

**Steps:**
1. Deploy API and database
2. Build basic web interface for bid generation
3. Users create bids in both systems
4. Compare results for accuracy
5. Fix discrepancies

**Success Criteria:**
- 95% match rate between Excel and new system
- All major workflows functional
- User acceptance testing passed

### Phase 3: Full Cutover (Week 9-12)

**Objective:** Deprecate Excel, full migration to new system

**Steps:**
1. Train all users on new interface
2. Migrate all active bids to new system
3. Archive Excel files
4. Monitor for issues
5. Continuous improvement based on feedback

---

## Technology Stack Recommendations

### Backend

**Framework:** FastAPI (Python 3.11+)
- High performance async API
- Automatic OpenAPI documentation
- Type safety with Pydantic
- Easy integration with existing Python tools

**Database:** PostgreSQL 15+
- Robust JSON support for flexible schemas
- Excellent query performance
- Strong data integrity
- Mature ecosystem

**ORM:** SQLAlchemy 2.0
- Type-safe queries
- Migration support with Alembic
- Good performance

### Frontend

**Framework:** React 18 with TypeScript
- Component reusability
- Type safety
- Rich ecosystem
- Easy to integrate with existing CM platform

**State Management:** Zustand or React Query
- Simple and performant
- Built-in caching
- Optimistic updates

**UI Library:** shadcn/ui or Material-UI
- Professional appearance
- Accessibility built-in
- Consistent with modern standards

### Infrastructure

**Deployment:** Docker + Kubernetes
- Scalability
- Easy deployment
- Environment consistency

**Caching:** Redis
- Fast price lookups
- Session management
- Rate limiting

**File Storage:** S3-compatible storage
- PDF exports
- Excel imports/exports
- Backup storage

---

## Security Considerations

### Data Protection

1. **Encryption at Rest**
   - Database encryption
   - File storage encryption
   - Backup encryption

2. **Encryption in Transit**
   - TLS 1.3 for all API calls
   - Certificate pinning for mobile apps

3. **Access Control**
   - Role-based permissions
   - Audit logging
   - IP whitelisting for API access

### Pricing Data Security

Pricing data is sensitive business information:

- Restricted access by role
- Audit trail for all pricing changes
- Approval workflow for manual overrides
- Encrypted exports

---

## Performance Targets

### Response Times

| Operation | Target | Excel Baseline |
|-----------|--------|----------------|
| Material lookup | <50ms | ~500ms (VLOOKUP) |
| Bid generation | <2s | ~30s (manual) |
| Pricing update | <5s | ~15min (manual) |
| Report generation | <10s | ~5min (pivot tables) |
| Plan extraction | <1s | ~2min (filtering) |

### Scalability

- Support 10,000+ materials
- Handle 1,000 concurrent users
- Process 100 pricing updates/second
- Store 10 years of historical data

---

## Cost Estimate

### Development Costs (Initial)

| Phase | Duration | Cost Estimate |
|-------|----------|---------------|
| Phase 1: Data Import | 2 weeks | $5,000 |
| Phase 2: Core Modules | 8 weeks | $40,000 |
| Phase 3: Frontend | 6 weeks | $30,000 |
| Phase 4: Integration | 4 weeks | $20,000 |
| Phase 5: Testing | 2 weeks | $10,000 |
| **Total** | **22 weeks** | **$105,000** |

### Operational Costs (Annual)

| Item | Annual Cost |
|------|-------------|
| Server hosting | $3,600 |
| Database | $2,400 |
| Storage | $1,200 |
| Monitoring/logging | $1,800 |
| SSL certificates | $200 |
| **Total** | **$9,200/year** |

### ROI Analysis

**Cost Savings:**
- Reduced bid preparation time: 20 hours/month × $50/hour = $12,000/year
- Fewer pricing errors: ~$25,000/year
- Automated pricing updates: 10 hours/month × $50/hour = $6,000/year
- **Total Savings: ~$43,000/year**

**Payback Period:** ~2.4 years

---

## Next Steps

### Immediate (Next Week)

1. **Review this design** with stakeholders
2. **Prioritize modules** - which to build first?
3. **Validate assumptions** - does this meet your needs?
4. **Choose tech stack** - approve recommendations or suggest alternatives

### Short Term (Month 1)

1. **Complete data import** using `auto_import_bat.py`
2. **Set up development environment**
3. **Build MVP** of core modules
4. **Create API documentation**

### Medium Term (Months 2-3)

1. **Develop frontend** interface
2. **Implement pricing engine**
3. **Build bid generation** module
4. **User acceptance testing**

### Long Term (Months 4-6)

1. **Parallel operation** with Excel
2. **Train users** on new system
3. **Full cutover** from Excel
4. **Monitor and optimize**

---

## Questions for Stakeholders

1. **Priority:** Which module is most critical to build first?
   - Pricing engine for monthly updates?
   - Plan extraction for daily operations?
   - Bid generation for customer-facing work?

2. **Integration:** What other systems need to integrate with BAT?
   - Accounting software?
   - Inventory management?
   - CRM system?

3. **Reporting:** What reports do you need that Excel doesn't provide?
   - Real-time dashboards?
   - Predictive analytics?
   - Supplier performance?

4. **Timeline:** What's the target launch date?
   - Aggressive (3 months) - MVP only
   - Moderate (6 months) - Full system
   - Conservative (9 months) - Comprehensive with all features

5. **Users:** Who will use this system?
   - Estimators/bidders?
   - Procurement team?
   - Management/executives?
   - Customers (self-service portal)?

---

## Appendix: Sample Code

### Example: Generate Bid API

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

router = APIRouter(prefix="/api/v1/bids", tags=["bids"])

@router.post("/generate", response_model=BidResponse)
async def generate_bid(
    request: BidGenerationRequest,
    current_user: User = Depends(get_current_user),
    pricing_service: PricingEngine = Depends(get_pricing_service),
    plan_service: PlanManagementService = Depends(get_plan_service),
    bid_service: BidGenerationService = Depends(get_bid_service)
):
    """
    Generate a new bid from a plan selection

    Replaces manual Excel bid creation process
    """

    # 1. Validate plan exists
    plan = await plan_service.get_plan(request.plan_code)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # 2. Extract materials based on selected packs
    materials = await plan_service.get_plan_materials(
        plan_code=request.plan_code,
        packs=request.packs,
        elevations=request.elevations
    )

    # 3. Calculate pricing for each material
    priced_items = []
    for material in materials:
        price_quote = await pricing_service.get_material_price(
            sku=material.sku,
            quantity=material.quantity,
            customer_id=request.customer_id,
            price_level=request.price_level
        )

        priced_items.append(BidItem(
            material_id=material.id,
            sku=material.sku,
            description=material.description,
            quantity=material.quantity,
            unit_cost=price_quote.cost,
            unit_sell=price_quote.sell,
            line_total_cost=material.quantity * price_quote.cost,
            line_total_sell=material.quantity * price_quote.sell
        ))

    # 4. Create bid
    bid = await bid_service.create_bid(
        customer_id=request.customer_id,
        plan_id=plan.id,
        items=priced_items,
        created_by=current_user.username
    )

    # 5. Calculate totals
    totals = await bid_service.calculate_bid_total(bid.id)

    # 6. Return complete bid
    return BidResponse(
        bid_id=bid.id,
        bid_number=bid.bid_number,
        plan_code=request.plan_code,
        customer_id=request.customer_id,
        items=priced_items,
        totals=totals,
        created_date=bid.created_date,
        valid_until=bid.valid_until
    )
```

---

**Document Version:** 2.0
**Last Updated:** 2025-11-16
**Status:** Proposal / Design Phase
**Next Review:** Upon stakeholder feedback
