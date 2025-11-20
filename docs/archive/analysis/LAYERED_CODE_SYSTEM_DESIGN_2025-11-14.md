# Layered Hierarchical Code System Design
**Date:** 2025-11-14
**Time:** 17:00
**Purpose:** Define unified code system combining Holt structure with user's decimal methodology

---

## Executive Summary

**User's Vision:** A **two-layer code system** that works at different granularities:
- **Layer 1 (Plan/Elevation/Option):** Aggregate level for quoting, estimating, high-level tracking
- **Layer 2 (Material List):** Detailed SKU level for purchasing, shipping, installation

**Code Format:**
```
[Plan]-[Phase/Elevation/Option]-[MaterialClass]

4-digit  4-digit decimal         4-digit
plan     phase/elev/option       material class
```

**Examples:**
```
1670-10.00-1000  = Plan 1670, Foundation (10.00), Framing Material (1000)
1670-60.pw-1100  = Plan 1670, Post Wrap (60.pw), Siding Material (1100)
1670-01-1000     = Plan 1670, Elevation A (01), Framing Material (1000)
2321-20.rf-1000  = Plan 2321, Main Wall ReadyFrame (20.rf), Framing Material (1000)
```

---

## Code Structure Breakdown

### Component 1: Plan Code (4 digits)

**Format:** `XXXX`

**Examples:**
- `1670` = Plan 1670 (Holt)
- `2321` = Plan 2321 (Holt)
- `G603` = Plan G603 (Richmond - can use alphanumeric)
- `M001` = Manor Homes Plan 1

**Rules:**
- Numeric for Holt/new plans
- Alphanumeric allowed for Richmond migration
- Unique per builder
- 4 characters max

---

### Component 2: Phase/Elevation/Option Code (4-digit decimal)

**Format:** `XX.XX` or `XX` or `XX.aa`

This is the **brilliant part** - it encodes BOTH phase-based options AND elevation codes in the same format!

#### A. Phase-Based Codes (Construction Phases)

**Major Phases (XX.00):**
```
10.00 = Foundation
18.00 = Main Floor Subfloor
20.00 = Main Walls
30.00 = Upper Floor System
32.00 = Upper Floor Subfloor
34.00 = Upper Walls
40.00 = Roof
58.00 = Housewrap
60.00 = Siding
```

**Sub-Phases (XX.YY where YY = variant):**
```
10.01 = Foundation Fireplace Option
10.60 = Foundation Extended Great Room
10.82 = Foundation Optional Den
12.x2 = Garage 2' Extension
12.x4 = Garage 4' Extension
12.x5 = Garage 5' Extension
20.02 = Main Walls Great Room Windows Option
```

**Special Variants (XX.aa where aa = abbreviation):**
```
20.rf = Main Walls ReadyFrame
34.rf = Upper Walls ReadyFrame
40.gs = Roof Gable Sheeting
60.pw = Siding Post Wrap
10.tc = Foundation Tall Crawl
```

**Pattern:**
- First 2 digits = Construction phase (10=Foundation, 20=Main, 30=Upper, 40=Roof, etc.)
- Decimal + 2 digits = Variant number (00=base, 01-99=options)
- Decimal + letters = Named variant (rf=ReadyFrame, gs=Gable Sheeting, pw=Post Wrap, tc=Tall Crawl)

#### B. Elevation Codes (Building Elevations)

**Format:** `0X` (2 digits, leading zero)

```
01 = Elevation A
02 = Elevation B
03 = Elevation C
04 = Elevation D
```

**Why this works:**
- Elevations start with `0` (phases never start with 0)
- Phases start with `1-9` (elevations never go above 04)
- **NO COLLISION!** You can distinguish at a glance:
  - `01` = Elevation A (starts with 0)
  - `10.00` = Foundation phase (starts with 1, has decimal)

---

### Component 3: Material Class Code (4 digits)

**Format:** `XXXX`

**Major Categories:**
```
1000 = Framing Materials
1100 = Siding Materials
1200 = Roofing Materials
1300 = Windows
1400 = Doors
1500 = Trim/Millwork
1600 = Insulation
1700 = Drywall
1800 = Flooring
...
4085 = Lumber (Holt legacy)
4120 = Trusses (Holt legacy)
4140 = Window Supply (Holt legacy)
4150 = Exterior Door Supply (Holt legacy)
4155 = Siding Supply (Holt legacy)
4320 = Interior Trim Supply (Holt legacy)
```

**Rules:**
- 1000-1999 = New unified material classes
- 4000-4999 = Holt legacy cost codes (for compatibility)
- User can define custom ranges per builder

---

## Complete Code Examples

### Example 1: Foundation Framing for Elevation A

**Full Code:** `1670-01-1000`

**Breakdown:**
- `1670` = Plan 1670
- `01` = Elevation A
- `1000` = Framing Materials

**Meaning:** "All framing materials for Plan 1670, Elevation A (foundation through roof)"

**Layer 1 Usage:** Quote shows "1670-01-1000: $12,500" (aggregate framing cost)
**Layer 2 Usage:** Material list shows 150 line items (2x4s, 2x6s, studs, plates, etc.)

---

### Example 2: Foundation Phase Framing for All Elevations

**Full Code:** `1670-10.00-1000`

**Breakdown:**
- `1670` = Plan 1670
- `10.00` = Foundation phase (base, no options)
- `1000` = Framing Materials

**Meaning:** "Foundation framing materials for Plan 1670 (all elevations share this)"

**Layer 1 Usage:** Estimating shows "1670-10.00-1000: $3,200" (foundation framing only)
**Layer 2 Usage:** Material list shows 45 line items for foundation framing

---

### Example 3: Optional Den Foundation for Elevations B, C, D

**Full Code:** `1670-10.82-1000`

**Breakdown:**
- `1670` = Plan 1670
- `10.82` = Foundation Optional Den
- `1000` = Framing Materials

**Meaning:** "Den foundation framing option for Plan 1670"

**Layer 1 Usage:** Option pricing "1670-10.82-1000: +$850" (den foundation upcharge)
**Layer 2 Usage:** Material list shows 12 line items (den-specific foundation framing)

**Elevation Filter:** This option is available for elevations B, C, D only (stored in `pack_elevations` table)

---

### Example 4: Siding Post Wrap for Elevation D

**Full Code:** `1670-60.pw-1100`

**Breakdown:**
- `1670` = Plan 1670
- `60.pw` = Siding Post Wrap variant
- `1100` = Siding Materials

**Meaning:** "Post wrap siding materials for Plan 1670"

**Layer 1 Usage:** Option shows "1670-60.pw-1100: $425"
**Layer 2 Usage:** Material list shows 3 line items (post wrap product, trim, fasteners)

---

### Example 5: Main Wall ReadyFrame for Elevation B

**Full Code:** `2321-20.rf-1000`

**Breakdown:**
- `2321` = Plan 2321
- `20.rf` = Main Walls ReadyFrame variant
- `1000` = Framing Materials

**Meaning:** "ReadyFrame system for main walls, Plan 2321"

**Layer 1 Usage:** Option shows "2321-20.rf-1000: +$3,200"
**Layer 2 Usage:** Material list shows 1 line item (ReadyFrame panels - comes pre-assembled)

---

## Layer 1 vs Layer 2 Usage

### Layer 1: Plan/Elevation/Option Level (Aggregate)

**Purpose:** High-level quoting, estimating, option selection

**Data Tracked:**
- Total price per code
- Aggregate quantities
- GP% by code
- Option availability (which elevations)

**Queries:**
```sql
-- Quote for Plan 1670, Elevation B, with Den Option
SELECT
    code,
    description,
    total_price,
    gp_percent
FROM layer1_codes
WHERE plan_id = '1670'
  AND (elevation = '02' OR elevation IS NULL)  -- Elevation B or universal
  AND code LIKE '1670-%';

-- Result:
-- 1670-01-1000    Elevation B Framing       $12,500   35%
-- 1670-01-1100    Elevation B Siding         $8,200   32%
-- 1670-10.82-1000 Optional Den Foundation    $  850   40%
-- 1670-18.00-1000 Main Subfloor (universal)  $2,100   33%
```

**Use Cases:**
- Sales: "What options are available for elevation B?"
- Estimating: "What's the total framing cost for this plan?"
- Quoting: "Customer selected den option - add $850"
- Reporting: "What's our GP% on framing materials?"

---

### Layer 2: Material List Level (Detailed)

**Purpose:** Purchasing, shipping, installation, detailed tracking

**Data Tracked:**
- Individual SKUs (2X6X16, 2X4X92-5/8, etc.)
- Exact quantities per item
- Vendor information
- Unit costs
- Installation sequence

**Queries:**
```sql
-- Material list for Plan 1670, Elevation B Foundation (10.00)
SELECT
    item_code,
    item_description,
    quantity,
    unit,
    vendor,
    unit_cost,
    extended_cost
FROM layer2_materials
WHERE plan_id = '1670'
  AND elevation = '02'
  AND code LIKE '%-10.00-%';

-- Result:
-- 2X6X16     2x6x16 Treated Sill Plate   24  EA  Vendor A  $12.50   $300.00
-- 2X10X16    2x10x16 Floor Joist         48  EA  Vendor A  $18.75   $900.00
-- 3/4 T&G    3/4" T&G Plywood Sheathing  32  SHEET Vendor B  $42.00  $1,344.00
-- ...
```

**Use Cases:**
- Purchasing: "Order materials for 5 houses (Plan 1670, Elevation B)"
- Shipping: "Create 3 shipments: Foundation, Framing, Siding"
- Installation: "Here's the material list for foundation crew"
- Tracking: "Do we have enough 2x6x16 treated sills in stock?"

---

## Database Schema for Layered Approach

### Layer 1 Tables

#### 1. layer1_codes (Plan/Elevation/Option Codes)

```sql
CREATE TABLE layer1_codes (
    code_id INTEGER PRIMARY KEY,

    -- Code Components
    plan_id TEXT NOT NULL,                 -- '1670', 'G603', 'M001'
    phase_option_code TEXT NOT NULL,       -- '10.00', '60.pw', '01', '10.82'
    material_class TEXT NOT NULL,          -- '1000', '1100', '4085'

    -- Full Code (computed)
    full_code TEXT GENERATED ALWAYS AS (
        plan_id || '-' || phase_option_code || '-' || material_class
    ) STORED,

    -- Metadata
    description TEXT,                      -- "Foundation Framing for Elevation A"
    is_phase_code BOOLEAN,                 -- TRUE if phase (10.00), FALSE if elevation (01)
    is_optional BOOLEAN DEFAULT FALSE,     -- TRUE if option, FALSE if required
    builder_id TEXT NOT NULL,

    -- Pricing (aggregate)
    estimated_price REAL,                  -- Total price for this code
    estimated_cost REAL,                   -- Total cost for this code
    gp_percent REAL,                       -- Calculated GP%

    -- Availability
    available_elevations TEXT,             -- '01,02,03,04' or NULL if universal

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(plan_id, phase_option_code, material_class)
);

-- Index for lookups
CREATE INDEX idx_layer1_full_code ON layer1_codes(full_code);
CREATE INDEX idx_layer1_plan ON layer1_codes(plan_id);
```

**Example Data:**
```sql
INSERT INTO layer1_codes VALUES
    (1, '1670', '01', '1000', '1670-01-1000', 'Elevation A Framing', FALSE, FALSE, 'HOLT', 12500, 8125, 0.35, NULL, TRUE, CURRENT_TIMESTAMP),
    (2, '1670', '10.00', '1000', '1670-10.00-1000', 'Foundation Framing', TRUE, FALSE, 'HOLT', 3200, 2144, 0.33, NULL, TRUE, CURRENT_TIMESTAMP),
    (3, '1670', '10.82', '1000', '1670-10.82-1000', 'Optional Den Foundation', TRUE, TRUE, 'HOLT', 850, 510, 0.40, '02,03,04', TRUE, CURRENT_TIMESTAMP),
    (4, '1670', '60.pw', '1100', '1670-60.pw-1100', 'Siding Post Wrap', TRUE, TRUE, 'HOLT', 425, 289, 0.32, '04', TRUE, CURRENT_TIMESTAMP);
```

---

#### 2. phase_option_definitions (Define what codes mean)

```sql
CREATE TABLE phase_option_definitions (
    phase_option_code TEXT PRIMARY KEY,   -- '10.00', '60.pw', '01'
    code_type TEXT NOT NULL,               -- 'PHASE', 'ELEVATION', 'OPTION'
    category TEXT,                         -- 'FOUNDATION', 'FRAMING', 'SIDING'
    description TEXT NOT NULL,             -- "Foundation Phase", "Post Wrap Variant"
    display_order INTEGER,                 -- For sorting in UI
    is_active BOOLEAN DEFAULT TRUE
);

-- Example Data
INSERT INTO phase_option_definitions VALUES
    ('10.00', 'PHASE', 'FOUNDATION', 'Foundation Phase', 10, TRUE),
    ('10.82', 'OPTION', 'FOUNDATION', 'Optional Den', 11, TRUE),
    ('18.00', 'PHASE', 'SUBFLOOR', 'Main Floor Subfloor', 18, TRUE),
    ('20.00', 'PHASE', 'WALLS', 'Main Walls', 20, TRUE),
    ('20.rf', 'OPTION', 'WALLS', 'Main Walls ReadyFrame', 21, TRUE),
    ('60.00', 'PHASE', 'SIDING', 'Siding Phase', 60, TRUE),
    ('60.pw', 'OPTION', 'SIDING', 'Post Wrap Variant', 61, TRUE),
    ('01', 'ELEVATION', 'ELEVATION', 'Elevation A', 1, TRUE),
    ('02', 'ELEVATION', 'ELEVATION', 'Elevation B', 2, TRUE),
    ('03', 'ELEVATION', 'ELEVATION', 'Elevation C', 3, TRUE),
    ('04', 'ELEVATION', 'ELEVATION', 'Elevation D', 4, TRUE);
```

---

#### 3. material_class_definitions (Define material classes)

```sql
CREATE TABLE material_class_definitions (
    material_class TEXT PRIMARY KEY,      -- '1000', '1100', '4085'
    class_name TEXT NOT NULL,              -- "Framing Materials", "Siding Materials"
    category TEXT,                         -- "STRUCTURAL", "EXTERIOR", "INTERIOR"
    is_legacy_code BOOLEAN DEFAULT FALSE,  -- TRUE for Holt 4000-series codes
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Example Data
INSERT INTO material_class_definitions VALUES
    ('1000', 'Framing Materials', 'STRUCTURAL', FALSE, 10, TRUE),
    ('1100', 'Siding Materials', 'EXTERIOR', FALSE, 11, TRUE),
    ('1200', 'Roofing Materials', 'EXTERIOR', FALSE, 12, TRUE),
    ('1300', 'Windows', 'EXTERIOR', FALSE, 13, TRUE),
    ('1400', 'Doors', 'EXTERIOR', FALSE, 14, TRUE),
    ('4085', 'Lumber (Holt Legacy)', 'STRUCTURAL', TRUE, 40, TRUE),
    ('4120', 'Trusses (Holt Legacy)', 'STRUCTURAL', TRUE, 41, TRUE),
    ('4155', 'Siding Supply (Holt Legacy)', 'EXTERIOR', TRUE, 42, TRUE);
```

---

### Layer 2 Tables

#### 4. layer2_materials (Detailed Material Lists)

```sql
CREATE TABLE layer2_materials (
    material_id INTEGER PRIMARY KEY,

    -- Link to Layer 1
    layer1_code_id INTEGER NOT NULL,       -- Links to layer1_codes.code_id

    -- Material Details
    item_code TEXT NOT NULL,               -- SKU: '2X6X16', '2X4X92-5/8'
    item_description TEXT,                 -- "2x6x16 Treated Sill Plate"
    quantity REAL NOT NULL,                -- 24
    unit TEXT NOT NULL,                    -- 'EA', 'LF', 'SF', 'SHEET', 'LS'

    -- Pricing
    unit_cost REAL,                        -- $12.50
    extended_cost REAL,                    -- $300.00 (quantity * unit_cost)

    -- Vendor
    vendor_id TEXT,
    vendor_sku TEXT,                       -- Vendor's SKU (may differ from item_code)

    -- Installation
    installation_sequence INTEGER,         -- Order of installation
    crew_type TEXT,                        -- 'FOUNDATION', 'FRAMING', 'FINISH'

    -- Shipping
    shipping_group TEXT,                   -- 'FOUNDATION', 'ROUGH', 'FINISH'
    weight REAL,                           -- For shipping calculations

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (layer1_code_id) REFERENCES layer1_codes(code_id)
);

-- Indexes
CREATE INDEX idx_layer2_code ON layer2_materials(layer1_code_id);
CREATE INDEX idx_layer2_item ON layer2_materials(item_code);
CREATE INDEX idx_layer2_vendor ON layer2_materials(vendor_id);
```

**Example Data:**
```sql
-- Layer 1: 1670-10.00-1000 (Foundation Framing) has code_id = 2
INSERT INTO layer2_materials VALUES
    (1, 2, '2X6X16', '2x6x16 Treated Sill Plate', 24, 'EA', 12.50, 300.00, 'VENDOR-A', '2X6-16-PT', 1, 'FOUNDATION', 'FOUNDATION', 45.6, TRUE, CURRENT_TIMESTAMP),
    (2, 2, '2X10X16', '2x10x16 Floor Joist', 48, 'EA', 18.75, 900.00, 'VENDOR-A', '2X10-16-SPF', 2, 'FOUNDATION', 'FOUNDATION', 72.0, TRUE, CURRENT_TIMESTAMP),
    (3, 2, '3/4 T&G', '3/4" T&G Plywood Sheathing', 32, 'SHEET', 42.00, 1344.00, 'VENDOR-B', 'PLY-3/4-TG', 3, 'FOUNDATION', 'FOUNDATION', 62.4, TRUE, CURRENT_TIMESTAMP);
```

---

## Query Examples

### Layer 1 Queries (Aggregate)

**Q1: Get all codes for Plan 1670, Elevation B**
```sql
SELECT
    full_code,
    description,
    estimated_price,
    estimated_cost,
    gp_percent,
    is_optional
FROM layer1_codes
WHERE plan_id = '1670'
  AND (
      phase_option_code = '02'  -- Elevation B specific
      OR available_elevations IS NULL  -- Universal (all elevations)
      OR available_elevations LIKE '%02%'  -- Available for elevation B
  )
ORDER BY full_code;
```

**Q2: Get all optional upgrades for Plan 1670**
```sql
SELECT
    full_code,
    description,
    estimated_price,
    available_elevations
FROM layer1_codes
WHERE plan_id = '1670'
  AND is_optional = TRUE
ORDER BY estimated_price DESC;
```

**Q3: Calculate total framing cost for Plan 1670, Elevation B with Den option**
```sql
SELECT
    SUM(estimated_cost) as total_cost,
    SUM(estimated_price) as total_price,
    (SUM(estimated_price) - SUM(estimated_cost)) / SUM(estimated_price) as overall_gp
FROM layer1_codes
WHERE plan_id = '1670'
  AND material_class = '1000'  -- Framing only
  AND (
      phase_option_code = '02'  -- Elevation B
      OR phase_option_code IN ('10.82')  -- Plus den option
      OR (available_elevations IS NULL AND is_phase_code = TRUE)  -- Plus universal phases
  );
```

---

### Layer 2 Queries (Detailed)

**Q4: Get material list for Foundation phase (10.00)**
```sql
SELECT
    lc.full_code,
    m.item_code,
    m.item_description,
    m.quantity,
    m.unit,
    m.unit_cost,
    m.extended_cost,
    m.vendor_id
FROM layer2_materials m
JOIN layer1_codes lc ON m.layer1_code_id = lc.code_id
WHERE lc.plan_id = '1670'
  AND lc.phase_option_code = '10.00'
ORDER BY m.installation_sequence;
```

**Q5: Generate purchase order for 5 houses (Plan 1670, Elevation B)**
```sql
SELECT
    m.vendor_id,
    m.item_code,
    m.vendor_sku,
    m.item_description,
    SUM(m.quantity * 5) as total_quantity,  -- 5 houses
    m.unit,
    m.unit_cost,
    SUM(m.extended_cost * 5) as total_cost
FROM layer2_materials m
JOIN layer1_codes lc ON m.layer1_code_id = lc.code_id
WHERE lc.plan_id = '1670'
  AND (
      lc.phase_option_code = '02'
      OR lc.available_elevations IS NULL
      OR lc.available_elevations LIKE '%02%'
  )
GROUP BY m.vendor_id, m.item_code, m.vendor_sku, m.item_description, m.unit, m.unit_cost
ORDER BY m.vendor_id, m.item_code;
```

**Q6: Get shipping groups for Plan 1670 foundation**
```sql
SELECT
    m.shipping_group,
    COUNT(*) as item_count,
    SUM(m.quantity) as total_pieces,
    SUM(m.weight) as total_weight,
    SUM(m.extended_cost) as total_value
FROM layer2_materials m
JOIN layer1_codes lc ON m.layer1_code_id = lc.code_id
WHERE lc.plan_id = '1670'
  AND lc.phase_option_code LIKE '10.%'  -- All foundation phases/options
GROUP BY m.shipping_group
ORDER BY m.shipping_group;
```

---

## Richmond/Holt Code Mapping

### Holt Legacy Code Translation

**Old Holt Format:** `167010100-4085`
- 167 = Plan
- 01 = Phase
- 01 = Option
- 00 = Variant
- 4085 = Material class

**New Unified Format:** `1670-10.01-4085` or `1670-10.01-1000`

**Translation Table:**
```sql
CREATE TABLE legacy_code_mapping (
    legacy_code TEXT PRIMARY KEY,          -- '167010100-4085'
    unified_code TEXT NOT NULL,            -- '1670-10.01-4085'
    builder_id TEXT NOT NULL,
    code_type TEXT NOT NULL,               -- 'HOLT_HIERARCHICAL'
    notes TEXT,

    FOREIGN KEY (unified_code) REFERENCES layer1_codes(full_code)
);

-- Example mappings
INSERT INTO legacy_code_mapping VALUES
    ('167010100-4085', '1670-10.00-4085', 'HOLT', 'HOLT_HIERARCHICAL', 'Foundation base'),
    ('167010200-4085', '1670-10.82-4085', 'HOLT', 'HOLT_HIERARCHICAL', 'Optional den foundation'),
    ('167060100-4155', '1670-60.00-4155', 'HOLT', 'HOLT_HIERARCHICAL', 'Siding base');
```

---

### Richmond Mnemonic Code Translation

**Old Richmond Format:** Varies widely
- Pack: `|10.82BCD OPT DEN FOUNDATION`
- Option Code: `DEN`
- Elevation: `ELVB`, `ELVC`, `ELVD`

**New Unified Format:** Multiple codes
- `G603-10.82-1000` (Den foundation framing)
- `G603-02-1000` (Elevation B framing)
- `G603-03-1000` (Elevation C framing)
- `G603-04-1000` (Elevation D framing)

**Translation Table:**
```sql
-- Example mappings for Richmond
INSERT INTO legacy_code_mapping VALUES
    ('DEN', 'G603-10.82-1000', 'RICHMOND', 'RICHMOND_MNEMONIC', 'Den option - framing'),
    ('XGREAT', 'G603-10.60-1000', 'RICHMOND', 'RICHMOND_MNEMONIC', 'Extended great room - framing'),
    ('ELVA', 'G603-01-1000', 'RICHMOND', 'RICHMOND_MNEMONIC', 'Elevation A - framing'),
    ('ELVB', 'G603-02-1000', 'RICHMOND', 'RICHMOND_MNEMONIC', 'Elevation B - framing');
```

---

## Benefits of Layered Approach

### For Quoting/Sales (Layer 1)
✅ **Fast:** Aggregate pricing, no need to dive into 150-item material lists
✅ **Clear:** Customer sees "Den Option: +$850" not "12 line items totaling $850"
✅ **Flexible:** Can show/hide options based on elevation selection
✅ **Professional:** Clean quotes with option pricing

### For Purchasing (Layer 2)
✅ **Detailed:** Exact SKUs, quantities, vendors
✅ **Scalable:** Can order materials for 50 houses at once
✅ **Accurate:** No rounding errors from aggregate quantities
✅ **Trackable:** Can track materials by vendor, shipping group, crew type

### For Estimating (Both Layers)
✅ **Layer 1:** Quick ROM (Rough Order of Magnitude) estimates
✅ **Layer 2:** Detailed takeoffs with exact quantities
✅ **Validation:** Layer 1 total should equal sum of Layer 2 extended costs

### For Reporting (Both Layers)
✅ **Layer 1:** "What's our average GP% on framing materials?"
✅ **Layer 2:** "How many 2x6x16 studs did we buy this quarter?"
✅ **Drill-down:** Click on "1670-10.00-1000" to see 45 material line items

---

## Next Steps

1. ✅ **User validates code structure** (you're here!)
2. 🔲 **Finalize phase/option codes** (add missing codes: 30.00, 32.00, 34.00, 40.00, etc.)
3. 🔲 **Define material classes** (complete the 1000-1999 range)
4. 🔲 **Generate SQL schema** for layered tables
5. 🔲 **Create Holt→Unified translation script**
6. 🔲 **Create Richmond→Unified translation script**
7. 🔲 **Build Layer 1 import** (aggregate codes with pricing)
8. 🔲 **Build Layer 2 import** (detailed material lists)

---

## Questions for You

1. **Material Classes:**
   - Should we complete the 1000-1999 series? (1200=Roofing, 1300=Windows, etc.)
   - Or stick with 1000/1100 and use Holt's 4000-series for others?

2. **Phase Codes:**
   - Do you want me to create the complete list of phase codes?
   - (30.00, 32.00, 34.00, 40.00, 50.00, 70.00, etc.)

3. **Elevation Codes:**
   - Stick with 01-04 (A-D)?
   - Or support more (01-10 for A-J)?

4. **Code Display:**
   - In quotes/reports, show full code or abbreviated?
   - Example: "1670-10.82-1000" or just "10.82" (with plan/class implied)?

5. **Layer Preference:**
   - When do you use Layer 1 vs Layer 2?
   - Should quotes default to Layer 1 (aggregate) with drill-down to Layer 2?

**This is a brilliant design!** The layered approach gives you the best of both worlds - aggregate simplicity AND detailed granularity. 🚀
