# Code System Implementation Guide

**Created:** 2025-11-14
**Updated:** 2025-11-18
**Status:** Ready for Implementation
**Database Schema:** `database/schema/unified_code_system.sql`

## Overview

This guide explains how to use the unified two-layer code system for managing construction materials, pricing, and pack assembly.

## System Architecture

### Two-Layer Design

**Layer 1: Aggregate Codes** (Estimating/Quoting)
- Format: `PLAN-PHASE/OPTION-ELEV-MATERIALCLASS`
- Example: `1234-20.00-AB-1000` (Plan 1234, Main Walls, Elevation, Framing)
- Purpose: High-level pricing, quotes, estimates
- Table: `layer1_codes`

**Layer 2: Detailed Materials** (Purchasing/Inventory)
- Links to Layer 1 codes via `code_id`
- Contains: SKU, quantity, unit cost, vendor
- Purpose: Purchase orders, pack assembly, inventory
- Table: `layer2_materials`

## Code Format Explained

### Full Code Structure
```
XXXX-XX.XX-XX-XXXX
 │    │     │  └─── Material Class (4 digits: 1000=Framing, 1100=Siding)
 │    │     └─ Elevation Code (2 chars: A, B, C, D)
 │    └────── Phase/Option Code (2-4 chars: numeric or alpha)
 └────────────── Plan Number (4 digits)
```

### Phase Code Patterns

**Numeric Base Phases:**
- `10.00` - Foundation
- `20.00` - Main Floor Walls
- `30.00` - 2nd Floor System
- `40.00` - Roof
- `58.00` - Housewrap
- `60.00` - Exterior Trim and Siding

**Numeric Options:**
- `xx.82` - Optional Den Foundation
- `xx.21` - Deluxe Master Bath Option 1

**Alpha Variants:** Note: These need to be mapped to numeric codes in the system.
- `10.tc` - Tall Crawl
- `20.rf` - ReadyFrame Walls
- `60.pw` - Post Wrap
- `40.gs` - Gable Sheeting

### No Code Collisions
- Phase codes start with 1-9 (e.g., `10.00`, `20.rf`)
- Elevation codes are alphabetical (e.g., `A`, `B`, `C`, `D`)
- This prevents confusion between phases and elevations

## Database Tables

### Core Reference Tables

**`material_classes`**
- Defines material categories (1000, 1100)
- Currently: Framing, Siding

**`phase_option_definitions`**
- All 150+ phase/option codes from your CSV
- Includes base phases and variants
- Links to material class and shipping order

**`richmond_option_codes`**
- Richmond's mnemonic codes (WO, XGREAT, SUN, DBA, etc.)
- Richmond's Elevation codes are denoted with ELV (ELVA, ELVB, etc.)
- Maps to phase codes where applicable
- Supports multi-phase options

**`elevations`**
- Standard elevation letters (A, B, C, D)
- Used for elevation-specific packs

**`plans`**
- Your plan numbers (4-digit codes)
- Replace 'XXXX' placeholder with actual plans

### Layer 1 Tables

**`layer1_codes`**
- Core aggregate code table
- Auto-generates `full_code` via computed column
- Stores estimated price/cost and calculates GP%

**`layer1_code_elevations`**
- Associates codes with elevations
- Solves Richmond's triple-encoding problem
- Single source of truth for elevation data

**`layer1_code_richmond_options`**
- Cross-reference to Richmond option codes
- Enables Richmond → Unified code translation

### Layer 2 Tables

**`layer2_materials`**
- Detailed material SKUs
- Links to `layer1_codes` via `code_id`
- Auto-calculates `extended_cost` (qty × unit_cost)

**`vendors`**
- Supplier information
- Links to materials via `vendor_id`

## Common Queries

### 1. Get All Codes for a Plan and Elevation

```sql
SELECT * FROM get_codes_for_plan_elevation('1234', 'B');
```

Returns all applicable codes for Plan 1234, Elevation B, ordered by shipping sequence.

### 2. Find Materials for a Specific Code

```sql
SELECT * FROM v_materials_complete
WHERE layer1_code = '1234-20.00-ABCD-1000';
```

Shows all SKU-level materials for this aggregate code.

### 3. Get Pricing Summary for a Plan

```sql
SELECT
    plan_id,
    phase_option_code,
    full_code,
    estimated_price,
    estimated_cost,
    gp_percent
FROM v_layer1_codes_complete
WHERE plan_id = '1234'
ORDER BY shipping_order;
```

### 4. Look Up Richmond Option Code

```sql
SELECT * FROM v_richmond_option_lookup
WHERE option_code = 'XGREAT';
```

Shows what 'XGREAT' means, which phases use it, and usage count.

### 5. Get All Codes Using a Richmond Option

```sql
SELECT l1.full_code, l1.description, ro.option_description
FROM layer1_codes l1
JOIN layer1_code_richmond_options l1r ON l1.code_id = l1r.code_id
JOIN richmond_option_codes ro ON l1r.option_code = ro.option_code
WHERE ro.option_code = 'DBA'
ORDER BY l1.full_code;
```

Finds all codes that include the DBA (Deluxe Bath A) option.

### 6. Get Complete Pack List with Materials

```sql
SELECT
    v.full_code,
    v.phase_name,
    v.shipping_order,
    v.material_count,
    v.total_material_cost,
    v.estimated_price,
    v.gp_percent
FROM v_layer1_summary v
WHERE v.plan_id = '1234'
ORDER BY v.shipping_order, v.full_code;
```

### 7. Get Detailed BOM for a Code

```sql
SELECT
    item_code,
    item_description,
    quantity,
    unit,
    unit_cost,
    extended_cost,
    vendor_name
FROM v_materials_complete
WHERE layer1_code = '1234-20.00-1000'
ORDER BY item_code;
```

## Workflow Examples

### Estimating Workflow

1. **Customer requests quote for Plan 1234, Elevation B**
   ```sql
   SELECT full_code, phase_name, estimated_price
   FROM v_layer1_codes_complete
   WHERE plan_id = '1234'
   ORDER BY shipping_order;
   ```

2. **Get codes specific to Elevation B**
   ```sql
   SELECT * FROM get_codes_for_plan_elevation('1234', 'B');
   ```

3. **Calculate total quote**
   ```sql
   SELECT SUM(estimated_price) AS total_quote
   FROM layer1_codes
   WHERE plan_id = '1234';
   ```

### Purchasing Workflow

1. **Order confirmed - need to purchase materials**
   ```sql
   SELECT
       vendor_name,
       SUM(extended_cost) AS vendor_total,
       COUNT(DISTINCT material_id) AS item_count
   FROM v_materials_complete
   WHERE plan_id = '1234'
   GROUP BY vendor_name
   ORDER BY vendor_total DESC;
   ```

2. **Generate purchase order for specific vendor**
   ```sql
   SELECT
       item_code,
       item_description,
       quantity,
       unit,
       unit_cost,
       extended_cost
   FROM v_materials_complete
   WHERE plan_id = '1234' AND vendor_name = 'ABC Lumber'
   ORDER BY item_code;
   ```

### Pack Assembly Workflow

1. **Get packing sequence by shipping order**
   ```sql
   SELECT
       shipping_order,
       full_code,
       phase_name,
       material_count
   FROM v_layer1_summary
   WHERE plan_id = '1234'
   ORDER BY shipping_order, full_code;
   ```

2. **Get materials for current pack being assembled**
   ```sql
   SELECT
       m.item_code,
       m.item_description,
       m.quantity,
       m.unit,
       l1.full_code,
       pod.shipping_order
   FROM layer2_materials m
   JOIN layer1_codes l1 ON m.code_id = l1.code_id
   JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
   WHERE l1.plan_id = '1234' AND pod.shipping_order = 1
   ORDER BY l1.full_code, m.item_code;
   ```

## Data Import Strategy

### Step 1: Populate Plans Table

Replace the 'XXXX' placeholder with your actual plan numbers:

```sql
INSERT INTO plans (plan_id, plan_name, plan_description)
VALUES
('1234', 'Plan 1234', 'Description of plan 1234'),
('5678', 'Plan 5678', 'Description of plan 5678');
```

### Step 2: Import Holt BAT Data

For each Holt pack:
1. Parse Holt's code (e.g., `167010100 - 4085`)
   - Format: `{Plan 4-digit}{Phase 2-digit}{ItemNo 3-digit} - {CostCode}`
   - Plan: 1670, Phase: 10, Item_No: 100, Cost Code: 4085
2. Extract elevation from Item_No first digit (1=A, 2=B, 3=C, 4=D)
3. Create Layer 1 code entry
4. Import all line items as Layer 2 materials
5. Link via `code_id`

**Holt Code Structure:**
```
167010100 - 4085 → Plan 1670, Phase 10 (Elevations), Item_No 100 (Elev A Base), Cost 4085 (Lumber)
167011310 - 4155 → Plan 1670, Phase 11 (Siding), Item_No 310 (Elev C, Option 10), Cost 4155 (Siding)
```

**Holt Cost Codes:** 4085, 4086, 4120, 4140, 4142, 4150, 4155, 4320

### Step 3: Import Richmond 3BAT Data

For each Richmond pack:
1. Parse pack name to extract phase, elevation, options
2. Create Layer 1 code entry
3. Parse elevation string ("B, C, D") → insert 3 rows in `layer1_code_elevations`
4. Parse option codes → insert into `layer1_code_richmond_options`
5. Import line items as Layer 2 materials

**Example Richmond Pack:**
```
Pack Name: |10.82BCD OPT DEN FOUNDATION - ELVB - ELVC - ELVD
Elevations: "B, C, D"

Processing:
1. Create layer1_code: plan='XXXX', phase='10.82', class='1000'
2. Insert elevations: B, C, D into layer1_code_elevations
3. No explicit option code in this case
4. Import all materials under this code_id
```

### Step 4: Validate Data

```sql
-- Check for codes without materials
SELECT full_code, phase_name
FROM v_layer1_codes_complete
WHERE code_id NOT IN (SELECT DISTINCT code_id FROM layer2_materials);

-- Check cost variance
SELECT
    full_code,
    estimated_cost,
    total_material_cost,
    cost_variance_percent
FROM v_layer1_summary
WHERE ABS(cost_variance_percent) > 10  -- More than 10% variance
ORDER BY ABS(cost_variance_percent) DESC;

-- Verify elevation associations
SELECT
    full_code,
    elevations
FROM v_layer1_with_elevations
WHERE elevations IS NOT NULL
ORDER BY full_code;
```

## Elevation Handling

### Richmond Triple-Encoding Problem - SOLVED

**Old Richmond Approach (3 places for same data):**
```
Pack Name:    |10.82BCD OPT DEN FOUNDATION - ELVB - ELVC - ELVD
Location:     "- ELVB - ELVC - ELVD"
Elevation:    "B, C, D"
              ↑        ↑              ↑
           Suffix  Location String  Column
```

**New Unified Approach (single source of truth):**
```sql
-- Pack definition (no elevation in name)
layer1_codes: plan='1234', phase='10.82', class='1000'
              full_code='1234-10.82-1000'

-- Elevation associations (separate table)
layer1_code_elevations:
  code_id=123, elevation_code='B'
  code_id=123, elevation_code='C'
  code_id=123, elevation_code='D'
```

**Query for Plan 1234, Elevation B:**
```sql
SELECT l1.full_code
FROM layer1_codes l1
JOIN layer1_code_elevations e ON l1.code_id = e.code_id
WHERE l1.plan_id = '1234' AND e.elevation_code = 'B';
```

## Richmond Option Code Translation

Your CSV contains 50+ Richmond mnemonic codes. The system maps these to unified codes:

**Common Richmond Codes:**
- `WO` → Walk-out Basement (09.00, 16.10, 24.00)
- `XGREAT` → Extended Great Room (10.60, 20.60, 40.60, 60.6x, 74.60)
- `SUN` → Sunroom (10.61, 20.61, 24.sr, 40.61, 60.61)
- `DBA` → Deluxe Bath A (20.21, 30.21, 34.21, 60.21)
- `3CARA/B/C` → 3-Car Garage variants (12.00, 22.00, 42.00, 62.00)
- `TALLCRWL` → Tall Crawl (10.tc, 25.tc, 60.tc, 75.tc, 80.00, 90.00)

**Query Richmond option usage:**
```sql
SELECT
    option_code,
    option_description,
    usage_count,
    phase_code
FROM v_richmond_option_lookup
WHERE option_code = 'XGREAT';
```

## Material Class Codes

Currently defined:
- **1000** - Framing (structural materials, lumber, fasteners)
- **1100** - Siding (exterior finishing, trim, housewrap)

Expandable to support:
- **1200** - Windows & Doors
- **1300** - Roofing Materials
- **1400** - Insulation
- etc.

## Shipping Order Sequence

Your CSV defines 9 shipping orders matching installation sequence:

1. **Order 1** - Foundation (09.00, 10.xx, 11.xx, 12.xx, 13.xx, 14.xx, 15.xx, 16.xx, 80.00)
2. **Order 2** - Main Subfloor (18.xx)
3. **Order 3** - Main Walls (20.xx, 22.xx, 23.xx, 24.xx, 25.xx, 27.xx, 30.xx)
4. **Order 4** - 2nd Floor Subfloor (32.xx)
5. **Order 5** - Roof (40.xx, 42.xx, 43.xx, 45.xx)
6. **Order 6** - Housewrap (58.xx, 63.10)
7. **Order 7** - Siding (60.xx, 62.xx, 63.xx, 65.xx, 90.00)
8. **Order 8** - Post Wraps (60.pw variants)
9. **Order 9** - Decking/Rails (74.xx, 75.xx)

**Query by shipping order:**
```sql
SELECT
    shipping_order,
    phase_code,
    phase_name,
    material_class
FROM phase_option_definitions
ORDER BY shipping_order, phase_code;
```

## Views Reference

### `v_layer1_codes_complete`
Complete Layer 1 code information with phase and material class names.

### `v_layer1_with_elevations`
Layer 1 codes with associated elevations (comma-separated).

### `v_layer1_with_richmond_options`
Layer 1 codes with Richmond option codes and descriptions.

### `v_materials_complete`
Complete material details with Layer 1 context (plan, phase, class).

### `v_layer1_summary`
Aggregate summary with material counts, costs, and variance analysis.

### `v_richmond_option_lookup`
Richmond option code cross-reference with usage statistics.

## Next Steps

1. **Database Setup**
   - Deploy `unified_code_system.sql` to your database
   - Verify all tables and views created successfully

2. **Plan Data**
   - Populate `plans` table with your actual plan numbers
   - Remove or update the 'XXXX' placeholder

3. **Holt Data Import**
   - Create import script for Holt BAT Excel data
   - Map Holt hierarchical codes to unified phase codes
   - Populate Layer 1 and Layer 2 tables

4. **Richmond Data Import**
   - Create import script for Richmond 3BAT Excel data
   - Parse pack names for phase/elevation/option extraction
   - Populate elevation and option associations

5. **Validation**
   - Run validation queries to check data integrity
   - Verify cost calculations and GP% computations
   - Test all views and functions

6. **Integration**
   - Connect to your existing Power Query workflows
   - Update bidtotals logic to use new schema
   - Create reporting dashboards

## Support Files

- **Schema:** `database/schema/unified_code_system.sql`
- **Design Doc:** `LAYERED_CODE_SYSTEM_DESIGN_2025-11-14.md`
- **BAT Analysis:** `BAT_SYSTEMS_ANALYSIS_2025-11-14.md`
- **Holt Schema:** `HOLT_BASED_SCHEMA_DESIGN_2025-11-14.md`
- **Source CSV:** `docs/Migration Strategy/Migration Files/Coding_Schema_20251113.csv`

## Contact

For questions or modifications to this system, refer to the design documentation or consult the session notes from 2025-11-14.
