---
name: unified-coding-system
description: Expert guide for the MindFlow unified two-layer material coding system. Use when user needs help with the coding structure, phase/option codes, elevation handling, layer1/layer2 architecture, Richmond/Holt translation, or implementation of the PLAN_ID-PHASE_OPTION_CODE-MATERIAL_CLASS format. Trigger on mentions of "unified system", "two layer", "phase codes", "option codes", "elevation junction", "layer1", "layer2", "full_code", or "code structure".
---

# Unified Two-Layer Coding System

Expert guide for implementing and using the MindFlow unified material coding system that consolidates Richmond American and Holt Homes builder data into a single, scalable architecture.

## System Overview

### Core Architecture: Two Layers

**Layer 1: Aggregate Codes (For Quoting)**
- Purpose: High-level pricing and quoting
- Table: `layer1_codes`
- Contains: Estimated prices, costs, GP%
- One Layer 1 code → Many Layer 2 materials

**Layer 2: Detailed Materials (For Purchasing)**
- Purpose: Purchase orders, vendor management
- Table: `layer2_materials`
- Contains: SKUs, quantities, unit costs, vendors
- Many materials → One Layer 1 code

### Code Format

```
PLAN_ID-PHASE_OPTION_CODE-MATERIAL_CLASS
│       │                  │
│       │                  └─ 4-digit material class (1000, 1100, etc.)
│       └──────────────────── Phase/Option XXX.XXX format
└──────────────────────────── Plan identifier (1670, G603, 2321)

Examples:
1670-010.000-1000  → Plan 1670, Foundation, Framing
G603-010.820-1000  → Plan G603, Optional Den Foundation, Framing
2321-060.000-1100  → Plan 2321, Siding, Siding materials
```

### Elevation Handling: The Junction Table Solution

**Problem Solved: Richmond's Triple-Encoding**
- OLD: Elevation stored in 3 places (pack name, location field, elevation column)
- NEW: Elevation stored ONCE in `layer1_code_elevations` table

**Schema:**
```sql
CREATE TABLE layer1_code_elevations (
    code_id INTEGER,
    elevation_code TEXT,
    PRIMARY KEY (code_id, elevation_code)
);
```

**Query Example:**
```sql
-- Get all codes for Plan 1670, Elevation B
SELECT l1.full_code, l1.description
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE l1.plan_id = '1670' AND lce.elevation_code = 'B';
```

## Phase/Option Code Taxonomy

### Format: XXX.XXX
- First 3 digits: Major phase (000-999)
- Last 3 digits: Minor variant (.000-.999)

### Major Phase Ranges

**Foundation & Site (000-019)**
```
010.000  Foundation (base)
010.010  Foundation with fireplace option
010.600  Extended great room foundation
010.610  Sunroom foundation
010.820  Den foundation
010.830  Den with full bath foundation
011.000  Main joist system
012.000  3rd car garage foundation
012.040  2 car garage 4' extension
```

**Framing (020-039)**
```
020.000  Main wall framing (base)
020.600  Extended great room framing
020.610  Sunroom framing
020.820  Den framing
021.000  Second floor framing
030.000  Main roof framing
```

**Roofing & Gutters (040-049)**
```
040.000  Main roof system
040.600  Extended great room roof
041.000  Roof shingles
042.000  Gutter system
```

**Siding & Exterior (050-069)**
```
050.000  Main siding
060.000  Exterior trim
060.pw   Post wrap option
```

**Interior (070-089)**
```
070.000  Interior framing
071.000  Drywall
080.000  Interior trim
```

### Minor Variants (.XXX)
- .000 = Base version
- .001-.009 = Community/subdivision variants
- .010-.099 = Option variants
- .100-.199 = Elevation-specific variants (rare, prefer junction table)
- .600-.699 = Extended room options
- .800-.899 = Additional room options (den, bath, etc.)
- .900-.999 = Special/custom variants

## Material Class Codes

### 4-Digit Format: XXXX

**Common Classes:**
```
1000  Framing lumber
1100  Siding materials
1200  Roofing materials
2000  Concrete & masonry
2100  Doors
2200  Windows
3000  Plumbing
4000  Electrical
5000  HVAC
6000  Insulation
7000  Drywall
8000  Interior trim
9000  Exterior trim
```

## Database Schema: Core Tables

### 1. Plans Table
```sql
CREATE TABLE plans (
    plan_id TEXT PRIMARY KEY,
    plan_name TEXT NOT NULL,
    builder_id TEXT NOT NULL,  -- 'RICHMOND' or 'HOLT'
    square_feet INTEGER,
    bedrooms INTEGER,
    bathrooms REAL,
    stories REAL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. Layer 1 Codes Table
```sql
CREATE TABLE layer1_codes (
    code_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL,
    phase_option_code TEXT NOT NULL,
    material_class TEXT NOT NULL,
    
    -- Auto-generated full code
    full_code TEXT GENERATED ALWAYS AS 
        (plan_id || '-' || phase_option_code || '-' || material_class) STORED,
    
    description TEXT,
    estimated_price DECIMAL(10,2),
    estimated_cost DECIMAL(10,2),
    
    -- Auto-calculated GP%
    gp_percent DECIMAL(5,2) GENERATED ALWAYS AS 
        (CASE WHEN estimated_price > 0 
         THEN ((estimated_price - estimated_cost) / estimated_price) * 100 
         ELSE NULL END) STORED,
    
    is_optional BOOLEAN DEFAULT FALSE,
    shipping_order INTEGER,
    
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (phase_option_code) REFERENCES phase_option_definitions(phase_code),
    FOREIGN KEY (material_class) REFERENCES material_classes(class_id)
);
```

### 3. Layer 1 Code Elevations (Junction Table)
```sql
CREATE TABLE layer1_code_elevations (
    code_id INTEGER,
    elevation_code TEXT,
    PRIMARY KEY (code_id, elevation_code),
    FOREIGN KEY (code_id) REFERENCES layer1_codes(code_id) ON DELETE CASCADE,
    FOREIGN KEY (elevation_code) REFERENCES elevations(elevation_code)
);
```

### 4. Layer 2 Materials Table
```sql
CREATE TABLE layer2_materials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    
    vendor_id INTEGER,
    vendor_sku TEXT,
    item_code TEXT,
    item_description TEXT,
    
    quantity DECIMAL(12,4),
    unit TEXT,
    unit_cost DECIMAL(10,4),
    extended_cost DECIMAL(12,2) GENERATED ALWAYS AS 
        (quantity * unit_cost) STORED,
    
    installation_sequence INTEGER,
    notes TEXT,
    
    FOREIGN KEY (code_id) REFERENCES layer1_codes(code_id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);
```

## Key Views for Common Queries

### View 1: Complete Code Information
```sql
CREATE VIEW v_layer1_codes_complete AS
SELECT 
    l1.code_id,
    l1.plan_id,
    p.plan_name,
    l1.phase_option_code,
    pod.phase_name,
    l1.material_class,
    mc.class_name,
    l1.full_code,
    l1.description,
    l1.estimated_price,
    l1.estimated_cost,
    l1.gp_percent,
    l1.is_optional,
    pod.shipping_order
FROM layer1_codes l1
JOIN plans p ON l1.plan_id = p.plan_id
JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
JOIN material_classes mc ON l1.material_class = mc.class_id;
```

### View 2: Codes with Elevations
```sql
CREATE VIEW v_layer1_with_elevations AS
SELECT 
    l1.*,
    GROUP_CONCAT(lce.elevation_code, ', ') as elevations
FROM layer1_codes l1
LEFT JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
GROUP BY l1.code_id;
```

### View 3: Materials Complete
```sql
CREATE VIEW v_materials_complete AS
SELECT 
    m.*,
    l1.full_code,
    l1.description as pack_description,
    v.vendor_name,
    v.vendor_code
FROM layer2_materials m
JOIN layer1_codes l1 ON m.code_id = l1.code_id
LEFT JOIN vendors v ON m.vendor_id = v.vendor_id;
```

### View 4: Layer 1 Summary
```sql
CREATE VIEW v_layer1_summary AS
SELECT 
    l1.code_id,
    l1.full_code,
    l1.description,
    l1.estimated_cost,
    COUNT(m.material_id) as material_count,
    SUM(m.extended_cost) as total_material_cost,
    l1.estimated_cost - COALESCE(SUM(m.extended_cost), 0) as cost_variance,
    CASE WHEN l1.estimated_cost > 0 
         THEN ((l1.estimated_cost - COALESCE(SUM(m.extended_cost), 0)) / l1.estimated_cost) * 100 
         ELSE 0 END as cost_variance_percent
FROM layer1_codes l1
LEFT JOIN layer2_materials m ON l1.code_id = m.code_id
GROUP BY l1.code_id;
```

## Translation Tables

### Richmond Option Translation
```sql
CREATE TABLE richmond_option_translations (
    richmond_code TEXT PRIMARY KEY,
    phase_option_code TEXT NOT NULL,
    description TEXT,
    category TEXT,
    FOREIGN KEY (phase_option_code) REFERENCES phase_option_definitions(phase_code)
);

-- Example mappings:
-- Richmond 'XGREAT' → '010.600', '011.600', '020.600' (Extended Great Room)
-- Richmond '2CAR5XA' → '012.050-A' (2 Car Garage 5' Extension, Elevation A)
-- Richmond 'FPSING01' → '010.010' (Fireplace Single Option 01)
```

### Holt Option Translation
```sql
CREATE TABLE holt_option_translations (
    holt_code TEXT PRIMARY KEY,      -- 9-digit: 167010100
    plan_id TEXT NOT NULL,
    phase_option_code TEXT NOT NULL,
    item_no TEXT NOT NULL,           -- 3-digit: elevation + option
    cost_code TEXT NOT NULL,         -- 4-digit: 4085, 4155, etc.
    description TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (phase_option_code) REFERENCES phase_option_definitions(phase_code)
);

-- Holt 9-digit format: [PLAN 4][PHASE 2][ITEM_NO 3] - [COST_CODE]
-- Item_No: first digit = elevation (1=A, 2=B, 3=C, 4=D, 5=Corner, 6=Rear)
--          last two digits = option variant (00=base, 05=3-car garage)
-- Example: 167010100 - 4085 → Plan 1670, Phase 10, Item_No 100 (Elev A Base), Cost 4085 (Lumber)
-- Holt Cost Codes: 4085, 4086, 4120, 4140, 4142, 4150, 4155, 4320
```

## Common Query Patterns

### 1. Get All Codes for a Plan
```sql
SELECT * FROM v_layer1_codes_complete
WHERE plan_id = '1670'
ORDER BY shipping_order;
```

### 2. Get Materials for a Code
```sql
SELECT * FROM v_materials_complete
WHERE code_id = 123
ORDER BY installation_sequence;
```

### 3. Find Codes by Elevation
```sql
SELECT l1.full_code, l1.description
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE lce.elevation_code = 'B';
```

### 4. Get All Foundation Codes Across Plans
```sql
SELECT * FROM v_layer1_codes_complete
WHERE phase_option_code LIKE '010.%'
ORDER BY plan_id, phase_option_code;
```

### 5. Calculate Total Cost by Material Class
```sql
SELECT 
    material_class,
    class_name,
    SUM(estimated_cost) as total_cost,
    COUNT(*) as code_count
FROM v_layer1_codes_complete
WHERE plan_id = '1670'
GROUP BY material_class, class_name;
```

### 6. Find Optional Upgrades
```sql
SELECT * FROM v_layer1_codes_complete
WHERE is_optional = TRUE
ORDER BY plan_id, shipping_order;
```

### 7. Validate Cost Accuracy
```sql
SELECT * FROM v_layer1_summary
WHERE ABS(cost_variance_percent) > 10  -- More than 10% variance
ORDER BY ABS(cost_variance_percent) DESC;
```

## Implementation Best Practices

### 1. Always Use Views
Don't write complex joins repeatedly. Use the pre-built views:
- `v_layer1_codes_complete` for code browsing
- `v_materials_complete` for material lists
- `v_layer1_summary` for validation

### 2. Leverage Generated Columns
Don't manually calculate:
- `full_code` (auto-generated)
- `gp_percent` (auto-calculated)
- `extended_cost` (auto-calculated)

### 3. Use Transactions for Imports
```sql
BEGIN TRANSACTION;
-- Insert Layer 1 code
INSERT INTO layer1_codes (...) VALUES (...);
-- Insert elevations
INSERT INTO layer1_code_elevations (...) VALUES (...);
-- Insert materials
INSERT INTO layer2_materials (...) VALUES (...);
COMMIT;
```

### 4. Validate After Import
```sql
-- Check for orphaned materials
SELECT * FROM layer2_materials m
WHERE NOT EXISTS (SELECT 1 FROM layer1_codes WHERE code_id = m.code_id);

-- Check for codes without materials
SELECT * FROM layer1_codes l1
WHERE NOT EXISTS (SELECT 1 FROM layer2_materials WHERE code_id = l1.code_id);
```

## Migration Support

### Richmond BAT Import
1. Parse pack name: `|10.82BCD OPT DEN FOUNDATION`
2. Extract phase: `10.82` → `010.820`
3. Extract elevations: `BCD` → Insert 3 rows in junction table
4. Map to material class based on item type
5. Create Layer 1 code
6. Import all materials as Layer 2 records

### Holt BAT Import
1. Parse 9-digit code: `167010100`
2. Extract plan: `1670`
3. Extract phase: `01` → `010.XXX`
4. Extract elevation: `100` → `A`
5. Map activity to phase code
6. Create Layer 1 code with elevation junction
7. Import materials as Layer 2 records

## Troubleshooting

### Issue: Duplicate full_codes
**Cause:** Same plan + phase + material_class combination
**Solution:** Add minor variant to phase code (.001, .002, etc.)

### Issue: Elevation not appearing in queries
**Cause:** Missing entry in `layer1_code_elevations` table
**Solution:** Always insert junction table records with Layer 1 codes

### Issue: Cost variance too high
**Cause:** Missing materials or incorrect estimated_cost
**Solution:** Use `v_layer1_summary` view to identify discrepancies

### Issue: Can't find Richmond option
**Cause:** Missing translation in `richmond_option_translations`
**Solution:** Add mapping to translation table

## Success Metrics

✅ **65,000+ materials** imported successfully  
✅ **Zero data loss** during migration  
✅ **Single source of truth** for all elevations  
✅ **<5% error rate** on code translations  
✅ **<2 second** query response times  
✅ **100% backward compatibility** with legacy pack IDs  

## Next Steps

1. Review the three decision documents:
   - DECISION_1_Plan_Pack_Relationship.md
   - DECISION_2_Plan_Elevation_Model.md
   - DECISION_3_Internal_Option_Codes.md

2. Study the schema design:
   - schema_design_v1.sql (complete 5,300 line schema)

3. Practice with SQL exercises:
   - SQL_PRACTICE_LAB.md (hands-on exercises)

4. Learn the coding standards:
   - 04_CODING_STANDARDS.md (full standards document)

5. Begin implementation:
   - 03_FOUNDATION_GUIDE.md (step-by-step guide)
