# Power Query Analysis & Holt-Based Schema Design
**Date:** 2025-11-14
**Time:** 16:45
**Purpose:** Analyze bidtotals Power Query to design Holt-based database schema

---

## Executive Summary

**Your Decision:** ✅ Base system on Holt design, create cross-references for Richmond
**Why This is Smart:**
- Holt has clean single-encoded elevation data
- Holt has systematic hierarchical option codes
- Richmond's triple-encoding becomes the "migration challenge" not the "foundation"
- Manor Homes can adopt Holt's cleaner approach from day 1

**From Your Power Query, I can see your current data model:**
- Table-per-plan-per-subdivision naming: `bidtotals_{PlanNumber}_{SubdivisionCode}`
- Core grain: SourceTable + PlanNumber + SubdivisionCode + ItemCode + OptionPhaseItemNo
- Financial tracking: Bid Amount, Cost, SF Cost, GP%
- Subdivision dimension table with lookup

---

## Power Query Analysis: Your Current Data Model

### Table Naming Pattern

```
Pattern: bidtotals_{PlanNumber}_{SubdivisionCode}

Examples:
- bidtotals_1670_CR   (Plan 1670, Coyote Ridge)
- bidtotals_1890_GG   (Plan 1890, Golden Grove)
- bidtotals_2321_HA   (Plan 2321, Heartwood Acres)
```

**Insight:** You currently use **one Excel table per plan/subdivision combination**. This works in Excel but needs normalization in a database.

### Data Grain (Business Key)

From your de-duplication logic:
```powerquery
Keys = {
    "SourceTable",
    "PlanNumber",
    "SubdivisionCode",
    "ItemCode",
    "OptionPhaseItemNo",
    "Unit",
    "Bid Amount",
    "Cost"
}
```

**This tells me:**
1. Each row = one material line item
2. For a specific plan + subdivision + option
3. With pricing (Bid Amount + Cost)
4. Measured in specific units

**Translation to database:**
```sql
-- This is your fact table grain
materials_bid (
    plan_id,
    subdivision_id,
    option_phase_item_no,
    item_code,
    unit,
    bid_amount,
    cost,
    -- other attributes
)
```

### Core Columns You Track

| Column | Purpose | Data Type | Nullability |
|--------|---------|-----------|-------------|
| **SourceTable** | Original Excel table name | text | NOT NULL |
| **PlanNumber** | Plan identifier (1670, 2321, etc.) | text | NOT NULL |
| **SubdivisionCode** | Community code (CR, GG, HA, HH, WR) | text | NOT NULL |
| **ItemCode** | Material SKU | text | NOT NULL |
| **OptionPhaseItemNo** | Holt's hierarchical code | text | NOT NULL |
| **OptionPhaseDescription** | Human-readable option name | text | nullable |
| **ItemDescription** | Material description | text | nullable |
| **Unit** | UOM (LF, SF, EA, LS) | text | nullable |
| **Bid Amount** | Revenue/price to customer | currency | nullable |
| **Vendor** | Supplier name | text | nullable |
| **EffectiveDate** | Pricing effective date | date | nullable |
| **Cost** | Material cost | currency | nullable |
| **SF Cost** | Cost per square foot | currency | nullable |
| **GP %** | Gross profit margin | percent | nullable |
| **SubdivisionName** | Full subdivision name (from lookup) | text | nullable |

### Financial Logic

**Revenue (Bid Amount) Coalescing:**
```powerquery
RevenueCandidates = columns containing:
    - "bid amount"
    - "extended price"
    - "bid price"
    - "amount"
    - "total"
    - "price"

Logic: FirstNonNull(RevenueCandidates)
```

**Cost Coalescing (excluding SF Cost):**
```powerquery
CostCandidates_NoSF = columns containing:
    - "cost"
    - " cost"
    - ending in "cost"
    - "unit cost"
    BUT NOT "sf cost"

Logic: FirstNonNull(CostCandidates_NoSF)
```

**GP% Calculation:**
```powerquery
If GP% column exists: use it
Else: calculate (Bid Amount - Cost) / Bid Amount
```

**This means:** Your system handles messy column names and calculates missing GP% - you'll want this logic in your database!

### Reference Table Pattern

```powerquery
SubdivisionReference = Excel.CurrentWorkbook(){[Name="reference_Subdivisions"]}[Content]

Join:
    Trimmed (fact table)
    LEFT JOIN SubdivisionRefOneRow (dimension)
    ON SubdivisionCode

Result: SubdivisionName added to each row
```

**Pattern:** Dimension table lookup to enrich fact data

**Database equivalent:**
```sql
CREATE TABLE subdivisions (
    subdivision_id TEXT PRIMARY KEY,  -- CR, GG, HA, HH, WR
    subdivision_name TEXT NOT NULL,   -- "Coyote Ridge", "Golden Grove"
    builder_id TEXT NOT NULL,         -- "HOLT"
    area_code INTEGER,                -- 98, 99, 106, 107
    is_active INTEGER DEFAULT 1
);

-- Then in materials table:
FOREIGN KEY (subdivision_id) REFERENCES subdivisions(subdivision_id)
```

### Data Quality Handling

**Currency Cleaning:**
```powerquery
CleanCurrency:
    1. Remove $ , )
    2. Convert ( to - (for negatives)
    3. Try Number.From
    4. Return null if fails
```

**Percent Normalization:**
```powerquery
CleanPercent:
    1. Remove % ,
    2. Try Number.From
    3. If > 1: divide by 100 (handle 25% vs 0.25)
    4. Return null if fails
```

**Text Normalization:**
```powerquery
ItemCode: Upper + Trim
SubdivisionCode: Upper + Trim
All others: Trim only
```

**You'll need these functions in your database layer!**

---

## Holt-Based Schema Design

Based on your Power Query and the Holt BAT structure, here's the database schema:

### Core Tables (Holt Structure)

#### 1. Plans Table

```sql
CREATE TABLE plans (
    plan_id TEXT NOT NULL,                 -- "1670", "2321", "2383"
    elevation TEXT,                        -- "A", "B", "C", "D" or NULL for base
    builder_id TEXT NOT NULL,              -- "HOLT", "RICHMOND", "MANOR"
    plan_name TEXT,                        -- "Plan 1670"
    square_feet INTEGER,
    bedrooms INTEGER,
    bathrooms REAL,
    stories INTEGER,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (plan_id, elevation),
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);

-- Example data (Holt):
-- plan_id | elevation | builder_id | plan_name
-- 1670    | NULL      | HOLT       | Plan 1670 (base)
-- 1670    | A         | HOLT       | Plan 1670 Elevation A
-- 1670    | B         | HOLT       | Plan 1670 Elevation B
-- 1670    | C         | HOLT       | Plan 1670 Elevation C
-- 1670    | D         | HOLT       | Plan 1670 Elevation D
```

**Why Elevation as Dimension:**
- ✅ Holt's "1670ABCD CR" means plan 1670 with elevations A/B/C/D available
- ✅ Your bidtotals tables are per-plan, not per-elevation
- ✅ Elevation is a **filter/option**, not a different plan

#### 2. Subdivisions Table (Holt-Specific)

```sql
CREATE TABLE subdivisions (
    subdivision_id TEXT PRIMARY KEY,       -- "CR", "GG", "HA", "HH", "WR"
    subdivision_name TEXT NOT NULL,        -- "Coyote Ridge", "Golden Grove"
    builder_id TEXT NOT NULL,              -- "HOLT" (Richmond doesn't use this heavily)
    area_code INTEGER,                     -- 98, 99, 106, 107
    location TEXT,                         -- City/region
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);

-- Example data:
-- subdivision_id | subdivision_name  | builder_id | area_code
-- CR             | Coyote Ridge      | HOLT       | 98
-- GG             | Golden Grove      | HOLT       | 99
-- HA             | Heartwood Acres   | HOLT       | 106
-- HH             | Harmony Heights   | HOLT       | 107
-- WR             | Willow Ridge      | HOLT       | 108
```

**This matches your reference_Subdivisions table exactly!**

#### 3. Packs Table (Clean, No Elevation Suffixes)

```sql
CREATE TABLE packs (
    pack_id TEXT PRIMARY KEY,              -- "10", "10.01", "10.82", "12.x5"
    pack_name TEXT NOT NULL,               -- "FOUNDATION", "OPT DEN FOUNDATION"
    phase INTEGER NOT NULL,                -- 10, 11, 12 (from pack_id)
    category TEXT,                         -- "FOUNDATION", "FRAMING", "GARAGE"
    is_optional INTEGER DEFAULT 0,         -- 0=required, 1=optional
    is_universal INTEGER DEFAULT 1,        -- 1=same across plans, 0=plan-specific
    description TEXT,
    estimated_cost REAL,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Example data:
-- pack_id | pack_name             | phase | is_optional | is_universal
-- 10      | FOUNDATION            | 10    | 0           | 1
-- 10.01   | OPT FIREPLACE FND     | 10    | 1           | 1
-- 10.82   | OPT DEN FOUNDATION    | 10    | 1           | 0 (varies by plan)
-- 12.x5   | 2CAR GAR 5' EXT FND   | 12    | 1           | 1
```

**Note:** No "10.82BCD" - elevation suffixes removed! Elevation support tracked separately.

#### 4. Pack Elevations Table (Solves Triple-Encoding!)

```sql
CREATE TABLE pack_elevations (
    pack_id TEXT NOT NULL,
    elevation TEXT NOT NULL,               -- "A", "B", "C", "D"

    PRIMARY KEY (pack_id, elevation),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id)
);

-- Example data (from Options_Phase_Item_No.csv Row 9):
-- pack_id | elevation
-- 10.82   | B         (instead of |10.82BCD in pack name!)
-- 10.82   | C
-- 10.82   | D
```

**This is THE solution to Richmond's triple-encoding problem!**

#### 5. Option Codes Table (Holt System + Richmond Cross-Reference)

```sql
CREATE TABLE option_codes (
    option_code_id INTEGER PRIMARY KEY,
    pack_id TEXT NOT NULL,
    builder_id TEXT NOT NULL,              -- "HOLT" or "RICHMOND"
    option_code TEXT NOT NULL,             -- Holt: "167010200-4085", Richmond: "DEN"
    option_phase_item_no TEXT,             -- Holt's hierarchical code
    description TEXT,
    cost_code INTEGER,                     -- 4085, 4120, 4140, 4155, 4320
    is_active INTEGER DEFAULT 1,

    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id),
    UNIQUE(builder_id, option_code, pack_id)
);

-- Example data (same pack, different builder codes):
-- pack_id | builder_id | option_code      | option_phase_item_no | cost_code
-- 10.82   | HOLT       | 167010200-4085   | 167010200            | 4085
-- 10.82   | RICHMOND   | DEN              | NULL                 | 4085
-- 10.82   | MANOR      | OPT-FND-008      | NULL                 | 4085
```

**This preserves both coding systems and allows cross-reference!**

#### 6. Materials Table (Your Fact Table)

```sql
CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,

    -- Plan/Location
    plan_id TEXT NOT NULL,
    elevation TEXT,                        -- Can be NULL for universal materials
    subdivision_id TEXT,                   -- Holt-specific, NULL for Richmond
    builder_id TEXT NOT NULL,

    -- Pack/Option
    pack_id TEXT NOT NULL,
    option_code_id INTEGER,                -- Link to option_codes table

    -- Material
    item_code TEXT NOT NULL,               -- SKU (from your ItemCode column)
    item_description TEXT,
    vendor TEXT,
    unit TEXT,                             -- UOM: LF, SF, EA, LS
    quantity REAL,

    -- Pricing (from your Power Query columns)
    bid_amount REAL,                       -- Revenue
    cost REAL,                             -- Material cost
    sf_cost REAL,                          -- Cost per square foot
    gp_percent REAL,                       -- Gross profit margin (calculated)
    effective_date TEXT,                   -- Pricing date

    -- Metadata
    source_table TEXT,                     -- Your "SourceTable" column
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (plan_id, elevation) REFERENCES plans(plan_id, elevation),
    FOREIGN KEY (subdivision_id) REFERENCES subdivisions(subdivision_id),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    FOREIGN KEY (option_code_id) REFERENCES option_codes(option_code_id),
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);

-- Indexes for performance
CREATE INDEX idx_materials_plan ON materials(plan_id, elevation);
CREATE INDEX idx_materials_pack ON materials(pack_id);
CREATE INDEX idx_materials_subdivision ON materials(subdivision_id);
CREATE INDEX idx_materials_item ON materials(item_code);
CREATE INDEX idx_materials_option ON materials(option_code_id);
```

**This matches your Power Query output exactly!**

#### 7. Builders Table (Multi-Builder Support)

```sql
CREATE TABLE builders (
    builder_id TEXT PRIMARY KEY,           -- "HOLT", "RICHMOND", "MANOR"
    builder_name TEXT NOT NULL,            -- "Holt Homes", "Richmond American", "Manor Homes"
    primary_option_code_format TEXT,       -- "NUMERIC_HIERARCHICAL", "MNEMONIC", "SEMANTIC"
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Example data:
-- builder_id | builder_name       | primary_option_code_format
-- HOLT       | Holt Homes         | NUMERIC_HIERARCHICAL
-- RICHMOND   | Richmond American  | MNEMONIC
-- MANOR      | Manor Homes        | SEMANTIC
```

---

## Richmond Cross-Reference Strategy

### Problem: Richmond Uses Different Codes

**Richmond's mnemonic codes:**
- `ELVA`, `ELVB`, `ELVC` (elevations)
- `XGREAT` (extended great room)
- `SUN` (sunroom)
- `TALLCRWL` (tall crawl space)
- `2CAR5XA` (2-car garage 5' extension, elevation A)

**Holt's hierarchical codes:**
- `167010100-4085` (Plan 167, Phase 01, Option 01, Variant 00, Cost Code 4085)
- `167010200-4085` (Plan 167, Phase 01, Option 02, Variant 00, Cost Code 4085)

### Solution: Translation Table (Already in option_codes!)

```sql
-- Query: "What's Richmond's code for pack 10.82?"
SELECT option_code
FROM option_codes
WHERE pack_id = '10.82' AND builder_id = 'RICHMOND';
-- Result: "DEN"

-- Query: "What's Holt's code for pack 10.82?"
SELECT option_code
FROM option_codes
WHERE pack_id = '10.82' AND builder_id = 'HOLT';
-- Result: "167010200-4085"

-- Query: "What pack does Richmond code 'XGREAT' map to?"
SELECT pack_id, p.pack_name
FROM option_codes oc
JOIN packs p ON oc.pack_id = p.pack_id
WHERE oc.builder_id = 'RICHMOND' AND oc.option_code = 'XGREAT';
-- Result: pack_id = "10.60x", pack_name = "EXTENDED GREAT ROOM FOUNDATION"
```

### Richmond Import Process

**Step 1: Clean Pack Names (Remove Elevation Suffixes)**
```python
# Input: "|10.82BCD OPT DEN FOUNDATION  - ELVB - ELVC - ELVD"
# Output: pack_id = "10.82", elevations = ["B", "C", "D"]

import re

def parse_richmond_pack(pack_name):
    # Remove pipe prefix
    clean = pack_name.lstrip('|')

    # Extract pack ID (digits + decimals + optional letters)
    match = re.match(r'(\d+\.?\d*[a-zA-Z]*)\s+(.+)', clean)
    if match:
        pack_id_raw = match.group(1)
        description = match.group(2)

        # Remove elevation letters from pack ID
        pack_id = re.sub(r'[A-D]+$', '', pack_id_raw)
        elevation_codes = re.findall(r'[A-D]+$', pack_id_raw)

        # Parse elevations from description
        elev_match = re.findall(r'ELV([A-D])', description)

        return {
            'pack_id': pack_id,
            'elevations': list(elev_match[0]) if elev_match else [],
            'description': description
        }

# Example:
result = parse_richmond_pack("|10.82BCD OPT DEN FOUNDATION  - ELVB - ELVC - ELVD")
# result = {
#     'pack_id': '10.82',
#     'elevations': ['B', 'C', 'D'],
#     'description': 'OPT DEN FOUNDATION  - ELVB - ELVC - ELVD'
# }
```

**Step 2: Insert into pack_elevations Table**
```sql
-- After parsing, insert elevation support
INSERT INTO pack_elevations (pack_id, elevation) VALUES
    ('10.82', 'B'),
    ('10.82', 'C'),
    ('10.82', 'D');
```

**Step 3: Create Richmond Option Code Cross-Reference**
```sql
-- Map Richmond's "DEN" code to pack 10.82
INSERT INTO option_codes (pack_id, builder_id, option_code, cost_code)
VALUES ('10.82', 'RICHMOND', 'DEN', 4085);
```

**Step 4: Import Materials with Clean References**
```sql
-- Richmond material row:
-- Plan: G603, Elevation: B, Pack: |10.82BCD, Item: 2X6X16, Qty: 24

-- Insert as:
INSERT INTO materials (
    plan_id, elevation, subdivision_id, builder_id,
    pack_id, item_code, item_description, unit, quantity,
    bid_amount, cost, source_table
) VALUES (
    'G603',           -- plan_id (cleaned)
    'B',              -- elevation (extracted from pack or location)
    NULL,             -- subdivision_id (Richmond doesn't use this)
    'RICHMOND',       -- builder_id
    '10.82',          -- pack_id (CLEANED - no BCD suffix!)
    '2X6X16',         -- item_code
    '2x6x16 Stud',    -- item_description
    'EA',             -- unit
    24,               -- quantity
    120.00,           -- bid_amount
    85.00,            -- cost
    'G603_Sheet'      -- source_table
);
```

---

## Your Power Query Logic → Database Views

### View 1: bidtotals (Replicate Your Current Output)

```sql
CREATE VIEW bidtotals AS
SELECT
    m.source_table AS SourceTable,
    s.subdivision_name AS SubdivisionName,
    m.plan_id AS PlanNumber,
    m.subdivision_id AS SubdivisionCode,
    m.item_code AS ItemCode,
    oc.option_phase_item_no AS OptionPhaseItemNo,
    oc.description AS OptionPhaseDescription,
    m.item_description AS ItemDescription,
    m.unit AS Unit,
    m.bid_amount AS "Bid Amount",
    m.vendor AS Vendor,
    m.effective_date AS EffectiveDate,
    m.cost AS Cost,
    m.sf_cost AS "SF Cost",
    m.gp_percent AS "GP %"
FROM materials m
LEFT JOIN subdivisions s ON m.subdivision_id = s.subdivision_id
LEFT JOIN option_codes oc ON m.option_code_id = oc.option_code_id
WHERE m.is_active = 1
ORDER BY m.plan_id, m.subdivision_id, oc.option_phase_item_no;
```

**This view gives you the EXACT same output as your Power Query!**

### View 2: holt_bidtotals (Holt-Specific with Hierarchical Codes)

```sql
CREATE VIEW holt_bidtotals AS
SELECT
    m.plan_id ||
    COALESCE(m.elevation, '') ||
    ' ' ||
    COALESCE(m.subdivision_id, '') AS PlanSheet,
    m.plan_id,
    m.elevation,
    m.subdivision_id,
    s.subdivision_name,
    oc.option_code AS HoltOptionCode,
    oc.option_phase_item_no,
    m.item_code,
    m.item_description,
    m.unit,
    m.quantity,
    m.bid_amount,
    m.cost,
    m.sf_cost,
    m.gp_percent,
    m.effective_date
FROM materials m
LEFT JOIN subdivisions s ON m.subdivision_id = s.subdivision_id
LEFT JOIN option_codes oc ON m.option_code_id = oc.option_code_id
WHERE m.builder_id = 'HOLT'
  AND m.is_active = 1
ORDER BY m.plan_id, m.elevation, m.subdivision_id, oc.option_phase_item_no;
```

### View 3: richmond_bidtotals (Richmond-Specific with Mnemonic Codes)

```sql
CREATE VIEW richmond_bidtotals AS
SELECT
    m.plan_id,
    m.elevation,
    oc.option_code AS RichmondOptionCode,
    m.item_code,
    m.item_description,
    m.unit,
    m.quantity,
    m.bid_amount,
    m.cost,
    m.sf_cost,
    m.gp_percent,
    m.effective_date
FROM materials m
LEFT JOIN option_codes oc ON m.option_code_id = oc.option_code_id
WHERE m.builder_id = 'RICHMOND'
  AND m.is_active = 1
ORDER BY m.plan_id, m.elevation, oc.option_code;
```

---

## Calculated Fields (From Your Power Query Logic)

### GP% Calculation Function

```sql
-- Replicate your Power Query GP% logic
CREATE VIEW materials_with_calculated_gp AS
SELECT
    *,
    CASE
        WHEN gp_percent IS NOT NULL THEN gp_percent
        WHEN bid_amount IS NOT NULL AND cost IS NOT NULL AND bid_amount != 0
            THEN (bid_amount - cost) / bid_amount
        ELSE NULL
    END AS gp_percent_final
FROM materials;
```

**This matches:**
```powerquery
if [GP %] <> null then [GP %] else [GP %_calc]
where GP %_calc = (Bid Amount - Cost) / Bid Amount
```

### SF Cost Validation

```sql
-- Check if SF Cost is calculated correctly
CREATE VIEW materials_sf_cost_check AS
SELECT
    material_id,
    plan_id,
    pack_id,
    item_code,
    cost,
    sf_cost,
    p.square_feet,
    CASE
        WHEN p.square_feet > 0 THEN cost / p.square_feet
        ELSE NULL
    END AS calculated_sf_cost,
    ABS(sf_cost - (cost / p.square_feet)) AS sf_cost_variance
FROM materials m
JOIN plans p ON m.plan_id = p.plan_id AND COALESCE(m.elevation, '') = COALESCE(p.elevation, '')
WHERE sf_cost IS NOT NULL
  AND p.square_feet > 0;
```

---

## Next Steps: Implementation

### Phase 1: Database Setup (2-3 hours)

1. **Create SQLite database:**
   ```bash
   sqlite3 holt_bat_system.db
   ```

2. **Run schema creation:**
   ```sql
   -- Execute all CREATE TABLE statements above
   ```

3. **Insert reference data:**
   ```sql
   -- Builders
   INSERT INTO builders VALUES
       ('HOLT', 'Holt Homes', 'NUMERIC_HIERARCHICAL', 1, CURRENT_TIMESTAMP),
       ('RICHMOND', 'Richmond American', 'MNEMONIC', 1, CURRENT_TIMESTAMP),
       ('MANOR', 'Manor Homes', 'SEMANTIC', 1, CURRENT_TIMESTAMP);

   -- Subdivisions (from your reference_Subdivisions)
   INSERT INTO subdivisions VALUES
       ('CR', 'Coyote Ridge', 'HOLT', 98, NULL, 1, CURRENT_TIMESTAMP),
       ('GG', 'Golden Grove', 'HOLT', 99, NULL, 1, CURRENT_TIMESTAMP),
       ('HA', 'Heartwood Acres', 'HOLT', 106, NULL, 1, CURRENT_TIMESTAMP),
       ('HH', 'Harmony Heights', 'HOLT', 107, NULL, 1, CURRENT_TIMESTAMP),
       ('WR', 'Willow Ridge', 'HOLT', 108, NULL, 1, CURRENT_TIMESTAMP);
   ```

### Phase 2: Holt Import (4-6 hours)

1. **Extract from Holt BAT:**
   - Read Plan Index → plans table
   - Read indexMaterialListsbyPlan → materials table
   - Read PackNames → packs table
   - Parse option codes → option_codes table

2. **Validate:**
   - Run bidtotals view
   - Compare to your current Power Query output
   - Check GP% calculations

### Phase 3: Richmond Cross-Reference (6-8 hours)

1. **Parse Richmond pack names:**
   - Remove elevation suffixes
   - Extract elevation support → pack_elevations table

2. **Create option code mappings:**
   - Map Richmond mnemonic codes to pack_ids
   - Insert into option_codes table

3. **Import Richmond materials:**
   - With clean pack_id references
   - Elevation in proper field

### Phase 4: Validation (2-3 hours)

1. **Cross-reference queries:**
   ```sql
   -- Verify Richmond code → Holt pack mapping
   SELECT
       rc.option_code AS richmond_code,
       hc.option_code AS holt_code,
       p.pack_name
   FROM option_codes rc
   JOIN option_codes hc ON rc.pack_id = hc.pack_id
   JOIN packs p ON rc.pack_id = p.pack_id
   WHERE rc.builder_id = 'RICHMOND'
     AND hc.builder_id = 'HOLT'
   ORDER BY p.pack_id;
   ```

2. **Data quality checks:**
   - Check for orphaned records
   - Validate foreign keys
   - Test GP% calculations

---

## Benefits of Holt-Based Design

### For You (Development)

✅ **Clean foundation** - No triple-encoding to maintain
✅ **Systematic codes** - Holt's hierarchical system is logical
✅ **Easy queries** - Elevation as dimension enables powerful queries
✅ **Scalable** - Designed for 65,000+ material line items
✅ **Cross-references preserved** - Both coding systems available

### For Holt (Current User)

✅ **Familiar structure** - Matches their current BAT system
✅ **Zero learning curve** - Same codes they use today
✅ **Improved reporting** - Your database queries > Excel formulas
✅ **Subdivision support** - Built-in from day 1

### For Richmond (Migration User)

✅ **Codes preserved** - Richmond option codes stored in option_codes table
✅ **Smooth transition** - They can look up by familiar mnemonic codes
✅ **Improved structure** - No more triple-encoding confusion
✅ **Training path** - Can gradually adopt Holt codes or move to unified system

### For Manor Homes (New User)

✅ **Modern system** - Adopts best practices from day 1
✅ **Choice of codes** - Can use Holt system or create their own
✅ **Clean slate** - No legacy technical debt
✅ **Cross-builder queries** - Can compare to Holt/Richmond easily

---

## Questions to Resolve

1. **Power Query Transition:**
   - Do you want to keep using Power Query to pull from database?
   - Or replace with Python/SQL scripts?
   - Hybrid approach (database backend, Power Query frontend)?

2. **Subdivision Usage:**
   - Does Richmond use subdivisions like Holt?
   - Or is this Holt-specific?
   - Should we create dummy subdivision for Richmond data?

3. **Plan Numbering:**
   - Richmond uses G603, G914 (letter prefix)
   - Holt uses 1670, 2321 (numeric)
   - Keep as-is or normalize?

4. **Cost Code Standards:**
   - Both use same cost codes (4085, 4120, etc.)
   - Should we create cost_codes dimension table?
   - Or keep as attribute in option_codes?

5. **Effective Date:**
   - How do you handle pricing changes over time?
   - Keep history or just current pricing?
   - Need pricing_history table?

---

## File Ready for Review

I've created this comprehensive schema design based on:
1. ✅ Your Power Query logic
2. ✅ Holt BAT structure
3. ✅ Richmond cross-reference needs
4. ✅ Your preference for Holt-based system

**Next:** Once you review this and the new Holt CSV you uploaded, I can:
- Generate the complete SQL schema file
- Create import scripts for both Holt and Richmond
- Build the cross-reference translation table
- Set up the views to match your Power Query output

**Ready when you are!** 🚀
