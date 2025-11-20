---
name: unified-system-sql-queries
description: SQL query patterns and examples for the unified two-layer coding system. Use when user needs help writing SQL queries, understanding views, joining tables, filtering codes, calculating costs, reporting, or data analysis. Trigger on mentions of "SQL query", "database query", "how do I find", "get all codes", "calculate total", "join tables", or "write a query".
---

# Unified System SQL Queries

Practical SQL query patterns for working with the MindFlow unified two-layer material coding system.

## Quick Reference: Key Views

**Always use views instead of raw tables for common queries:**

```sql
-- 1. Complete code information with all lookups
v_layer1_codes_complete

-- 2. Codes with elevation lists (comma-separated)
v_layer1_with_elevations

-- 3. Codes with Richmond option mappings
v_layer1_with_richmond_options

-- 4. Materials with full context
v_materials_complete

-- 5. Code summaries with cost rollups
v_layer1_summary

-- 6. Richmond code lookup
v_richmond_option_lookup
```

## Common Query Patterns

### 1. Get All Codes for a Plan

**Simple:**
```sql
SELECT full_code, description, estimated_price
FROM v_layer1_codes_complete
WHERE plan_id = '1670'
ORDER BY shipping_order;
```

**With Details:**
```sql
SELECT 
    full_code,
    phase_name,
    class_name,
    description,
    estimated_price,
    estimated_cost,
    gp_percent,
    CASE WHEN is_optional THEN 'Optional' ELSE 'Standard' END as type
FROM v_layer1_codes_complete
WHERE plan_id = '1670'
ORDER BY shipping_order, full_code;
```

### 2. Get Materials for a Specific Code

**Basic Material List:**
```sql
SELECT 
    item_code,
    item_description,
    quantity,
    unit,
    unit_cost,
    extended_cost
FROM v_materials_complete
WHERE full_code = '1670-010.000-1000'
ORDER BY installation_sequence;
```

**With Vendor Information:**
```sql
SELECT 
    m.item_code,
    m.item_description,
    m.quantity,
    m.unit,
    m.unit_cost,
    m.extended_cost,
    v.vendor_name,
    v.vendor_code
FROM layer2_materials m
JOIN layer1_codes l1 ON m.code_id = l1.code_id
LEFT JOIN vendors v ON m.vendor_id = v.vendor_id
WHERE l1.full_code = '1670-010.000-1000'
ORDER BY m.installation_sequence;
```

### 3. Find Codes by Elevation

**All Codes for Elevation B:**
```sql
SELECT 
    l1.full_code,
    l1.description,
    l1.estimated_price
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE lce.elevation_code = 'B'
ORDER BY l1.plan_id, l1.full_code;
```

**Codes for Multiple Elevations (B or C):**
```sql
SELECT 
    l1.full_code,
    l1.description,
    GROUP_CONCAT(DISTINCT lce.elevation_code) as elevations
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE lce.elevation_code IN ('B', 'C')
GROUP BY l1.code_id
ORDER BY l1.plan_id, l1.full_code;
```

**Codes Spanning Multiple Elevations (BCD):**
```sql
SELECT 
    full_code,
    description,
    elevations
FROM v_layer1_with_elevations
WHERE elevations LIKE '%B%' 
  AND elevations LIKE '%C%' 
  AND elevations LIKE '%D%'
ORDER BY plan_id, full_code;
```

### 4. Search Across Plans by Phase

**All Foundation Codes (010.xxx range):**
```sql
SELECT 
    plan_name,
    full_code,
    description,
    estimated_cost
FROM v_layer1_codes_complete
WHERE phase_option_code LIKE '010.%'
ORDER BY plan_id, phase_option_code;
```

**All Optional Den Foundations (010.820):**
```sql
SELECT 
    plan_id,
    full_code,
    description,
    estimated_price,
    estimated_cost,
    gp_percent
FROM v_layer1_codes_complete
WHERE phase_option_code = '010.820'
ORDER BY plan_id;
```

**All Garage Options (012.xxx range):**
```sql
SELECT 
    plan_name,
    full_code,
    description,
    estimated_price
FROM v_layer1_codes_complete
WHERE phase_option_code LIKE '012.%'
ORDER BY plan_id, phase_option_code;
```

### 5. Calculate Totals and Summaries

**Total Cost by Plan:**
```sql
SELECT 
    plan_id,
    plan_name,
    COUNT(*) as code_count,
    SUM(estimated_price) as total_price,
    SUM(estimated_cost) as total_cost,
    AVG(gp_percent) as avg_gp_percent
FROM v_layer1_codes_complete
GROUP BY plan_id, plan_name
ORDER BY total_price DESC;
```

**Total Cost by Material Class:**
```sql
SELECT 
    material_class,
    class_name,
    COUNT(*) as code_count,
    SUM(estimated_cost) as total_cost,
    SUM(estimated_price) as total_price
FROM v_layer1_codes_complete
WHERE plan_id = '1670'
GROUP BY material_class, class_name
ORDER BY total_cost DESC;
```

**Total Cost by Phase:**
```sql
SELECT 
    SUBSTR(phase_option_code, 1, 3) as major_phase,
    pod.phase_name,
    COUNT(*) as code_count,
    SUM(l1.estimated_cost) as total_cost
FROM layer1_codes l1
JOIN phase_option_definitions pod 
    ON SUBSTR(l1.phase_option_code, 1, 3) || '.000' = pod.phase_code
WHERE l1.plan_id = '1670'
GROUP BY major_phase, pod.phase_name
ORDER BY major_phase;
```

### 6. Find Optional Upgrades

**All Optional Codes:**
```sql
SELECT 
    plan_name,
    full_code,
    description,
    estimated_price
FROM v_layer1_codes_complete
WHERE is_optional = TRUE
ORDER BY plan_id, estimated_price DESC;
```

**Optional Upgrades by Plan:**
```sql
SELECT 
    plan_id,
    COUNT(*) as optional_count,
    SUM(estimated_price) as total_optional_price
FROM v_layer1_codes_complete
WHERE is_optional = TRUE
GROUP BY plan_id
ORDER BY total_optional_price DESC;
```

### 7. Cost Validation Queries

**Find Cost Variances:**
```sql
SELECT 
    full_code,
    description,
    estimated_cost,
    total_material_cost,
    cost_variance,
    cost_variance_percent
FROM v_layer1_summary
WHERE ABS(cost_variance_percent) > 10
ORDER BY ABS(cost_variance_percent) DESC;
```

**Codes Without Materials:**
```sql
SELECT 
    l1.full_code,
    l1.description,
    l1.estimated_cost
FROM layer1_codes l1
WHERE NOT EXISTS (
    SELECT 1 FROM layer2_materials m
    WHERE m.code_id = l1.code_id
)
ORDER BY l1.plan_id, l1.full_code;
```

**Materials Without Valid Codes (Orphans):**
```sql
SELECT 
    m.material_id,
    m.item_code,
    m.item_description,
    m.code_id
FROM layer2_materials m
WHERE NOT EXISTS (
    SELECT 1 FROM layer1_codes l1
    WHERE l1.code_id = m.code_id
);
```

### 8. Translation and Mapping

**Find Richmond Option Mappings:**
```sql
SELECT 
    rot.richmond_code,
    rot.description,
    l1.full_code,
    l1.estimated_price
FROM richmond_option_translations rot
JOIN layer1_codes l1 ON rot.phase_option_code = l1.phase_option_code
WHERE rot.richmond_code = 'XGREAT'
ORDER BY l1.plan_id;
```

**All Richmond Codes for a Plan:**
```sql
SELECT 
    l1.full_code,
    l1.description,
    GROUP_CONCAT(DISTINCT lcro.richmond_option_code) as richmond_codes
FROM layer1_codes l1
LEFT JOIN layer1_code_richmond_options lcro ON l1.code_id = lcro.code_id
WHERE l1.plan_id = '1670'
GROUP BY l1.code_id
ORDER BY l1.full_code;
```

**Translate Holt 9-Digit Code:**
```sql
SELECT 
    hot.holt_code,
    hot.description,
    l1.full_code,
    l1.estimated_price
FROM holt_option_translations hot
JOIN layer1_codes l1 ON hot.phase_option_code = l1.phase_option_code
    AND hot.plan_id = l1.plan_id
WHERE hot.holt_code = '167010100';
```

### 9. Material Analysis

**Top 10 Most Expensive Materials:**
```sql
SELECT 
    item_description,
    unit_cost,
    vendor_name,
    full_code,
    pack_description
FROM v_materials_complete
ORDER BY unit_cost DESC
LIMIT 10;
```

**Most Common Materials (by quantity):**
```sql
SELECT 
    item_code,
    item_description,
    SUM(quantity) as total_quantity,
    COUNT(DISTINCT code_id) as code_count
FROM layer2_materials
GROUP BY item_code, item_description
ORDER BY total_quantity DESC
LIMIT 20;
```

**Materials by Vendor:**
```sql
SELECT 
    v.vendor_name,
    COUNT(DISTINCT m.material_id) as material_count,
    SUM(m.extended_cost) as total_cost
FROM layer2_materials m
JOIN vendors v ON m.vendor_id = v.vendor_id
GROUP BY v.vendor_id, v.vendor_name
ORDER BY total_cost DESC;
```

### 10. Comparison Queries

**Compare Plans by Cost:**
```sql
SELECT 
    p.plan_id,
    p.plan_name,
    p.builder_id,
    COUNT(l1.code_id) as code_count,
    SUM(l1.estimated_cost) as total_cost,
    AVG(l1.estimated_cost) as avg_cost_per_code
FROM plans p
JOIN layer1_codes l1 ON p.plan_id = l1.plan_id
GROUP BY p.plan_id, p.plan_name, p.builder_id
ORDER BY total_cost DESC;
```

**Compare Richmond vs Holt Structures:**
```sql
SELECT 
    builder_id,
    COUNT(DISTINCT plan_id) as plan_count,
    COUNT(code_id) as total_codes,
    AVG(estimated_cost) as avg_code_cost,
    SUM(estimated_cost) as total_cost
FROM v_layer1_codes_complete
GROUP BY builder_id;
```

**Find Similar Codes Across Plans:**
```sql
SELECT 
    phase_option_code,
    material_class,
    COUNT(DISTINCT plan_id) as plan_count,
    AVG(estimated_cost) as avg_cost,
    MIN(estimated_cost) as min_cost,
    MAX(estimated_cost) as max_cost
FROM layer1_codes
GROUP BY phase_option_code, material_class
HAVING COUNT(DISTINCT plan_id) > 1
ORDER BY plan_count DESC, phase_option_code;
```

## Advanced Patterns

### 1. Window Functions - Running Totals

**Running Cost Total by Shipping Order:**
```sql
SELECT 
    full_code,
    description,
    estimated_cost,
    SUM(estimated_cost) OVER (
        PARTITION BY plan_id 
        ORDER BY shipping_order, full_code
    ) as running_total
FROM v_layer1_codes_complete
WHERE plan_id = '1670'
ORDER BY shipping_order, full_code;
```

**Rank Codes by Cost Within Plan:**
```sql
SELECT 
    full_code,
    description,
    estimated_cost,
    RANK() OVER (
        PARTITION BY plan_id 
        ORDER BY estimated_cost DESC
    ) as cost_rank
FROM layer1_codes
WHERE plan_id = '1670'
ORDER BY cost_rank;
```

### 2. Common Table Expressions (CTEs)

**Find Plans with Above-Average Costs:**
```sql
WITH plan_costs AS (
    SELECT 
        plan_id,
        SUM(estimated_cost) as total_cost
    FROM layer1_codes
    GROUP BY plan_id
),
avg_cost AS (
    SELECT AVG(total_cost) as average
    FROM plan_costs
)
SELECT 
    pc.plan_id,
    p.plan_name,
    pc.total_cost,
    ac.average,
    pc.total_cost - ac.average as above_average
FROM plan_costs pc
CROSS JOIN avg_cost ac
JOIN plans p ON pc.plan_id = p.plan_id
WHERE pc.total_cost > ac.average
ORDER BY above_average DESC;
```

**Recursive Phase Hierarchy:**
```sql
WITH RECURSIVE phase_tree AS (
    -- Base case: major phases
    SELECT 
        phase_code,
        phase_name,
        0 as level
    FROM phase_option_definitions
    WHERE phase_code LIKE '%.000'
    
    UNION ALL
    
    -- Recursive case: variants
    SELECT 
        pod.phase_code,
        pod.phase_name,
        pt.level + 1
    FROM phase_option_definitions pod
    JOIN phase_tree pt 
        ON SUBSTR(pod.phase_code, 1, 3) = SUBSTR(pt.phase_code, 1, 3)
    WHERE pod.phase_code NOT LIKE '%.000'
)
SELECT * FROM phase_tree
ORDER BY phase_code;
```

### 3. Pivot Queries

**Cost by Plan and Material Class (Pivot):**
```sql
SELECT 
    plan_id,
    SUM(CASE WHEN material_class = '1000' THEN estimated_cost ELSE 0 END) as framing_cost,
    SUM(CASE WHEN material_class = '1100' THEN estimated_cost ELSE 0 END) as siding_cost,
    SUM(CASE WHEN material_class = '1200' THEN estimated_cost ELSE 0 END) as roofing_cost,
    SUM(CASE WHEN material_class = '2000' THEN estimated_cost ELSE 0 END) as concrete_cost,
    SUM(estimated_cost) as total_cost
FROM layer1_codes
GROUP BY plan_id
ORDER BY total_cost DESC;
```

### 4. JSON Aggregation (PostgreSQL)

**Build JSON Material List:**
```sql
SELECT 
    l1.full_code,
    l1.description,
    json_agg(
        json_build_object(
            'item_code', m.item_code,
            'description', m.item_description,
            'quantity', m.quantity,
            'unit', m.unit,
            'cost', m.extended_cost
        ) ORDER BY m.installation_sequence
    ) as materials
FROM layer1_codes l1
LEFT JOIN layer2_materials m ON l1.code_id = m.code_id
WHERE l1.plan_id = '1670'
GROUP BY l1.code_id, l1.full_code, l1.description
ORDER BY l1.shipping_order;
```

## Reporting Queries

### 1. Executive Summary Report

```sql
SELECT 
    'Total Plans' as metric,
    COUNT(DISTINCT plan_id) as value
FROM plans
WHERE is_active = TRUE

UNION ALL

SELECT 
    'Total Layer 1 Codes',
    COUNT(*)
FROM layer1_codes

UNION ALL

SELECT 
    'Total Layer 2 Materials',
    COUNT(*)
FROM layer2_materials

UNION ALL

SELECT 
    'Total Estimated Value',
    CAST(SUM(estimated_price) AS INTEGER)
FROM layer1_codes

UNION ALL

SELECT 
    'Total Estimated Cost',
    CAST(SUM(estimated_cost) AS INTEGER)
FROM layer1_codes

UNION ALL

SELECT 
    'Average GP%',
    CAST(AVG(gp_percent) AS INTEGER)
FROM layer1_codes
WHERE estimated_price > 0;
```

### 2. Plan Detail Report

```sql
SELECT 
    p.plan_id,
    p.plan_name,
    p.builder_id,
    COUNT(DISTINCT l1.code_id) as total_codes,
    COUNT(DISTINCT CASE WHEN l1.is_optional = TRUE THEN l1.code_id END) as optional_codes,
    SUM(l1.estimated_price) as total_price,
    SUM(l1.estimated_cost) as total_cost,
    AVG(l1.gp_percent) as avg_gp_percent,
    COUNT(DISTINCT m.material_id) as total_materials,
    COUNT(DISTINCT m.vendor_id) as vendor_count
FROM plans p
LEFT JOIN layer1_codes l1 ON p.plan_id = l1.plan_id
LEFT JOIN layer2_materials m ON l1.code_id = m.code_id
GROUP BY p.plan_id, p.plan_name, p.builder_id
ORDER BY p.plan_id;
```

### 3. Material Class Summary

```sql
SELECT 
    mc.class_id,
    mc.class_name,
    COUNT(DISTINCT l1.code_id) as code_count,
    SUM(l1.estimated_cost) as total_cost,
    COUNT(DISTINCT m.material_id) as material_count,
    AVG(m.unit_cost) as avg_unit_cost
FROM material_classes mc
LEFT JOIN layer1_codes l1 ON mc.class_id = l1.material_class
LEFT JOIN layer2_materials m ON l1.code_id = m.code_id
GROUP BY mc.class_id, mc.class_name
ORDER BY total_cost DESC;
```

## Performance Tips

### 1. Use Indexes
```sql
-- Verify indexes exist
.indexes layer1_codes
.indexes layer2_materials

-- Key indexes for performance:
CREATE INDEX idx_layer1_plan ON layer1_codes(plan_id);
CREATE INDEX idx_layer1_phase ON layer1_codes(phase_option_code);
CREATE INDEX idx_layer2_code ON layer2_materials(code_id);
```

### 2. Use EXPLAIN
```sql
EXPLAIN QUERY PLAN
SELECT * FROM v_layer1_codes_complete
WHERE plan_id = '1670';
```

### 3. Limit Large Result Sets
```sql
-- Use LIMIT for testing
SELECT * FROM layer2_materials LIMIT 100;

-- Use pagination for web apps
SELECT * FROM layer1_codes
ORDER BY full_code
LIMIT 50 OFFSET 0;  -- Page 1
```

### 4. Avoid SELECT *
```sql
-- Instead of:
SELECT * FROM layer2_materials;

-- Use:
SELECT material_id, item_code, item_description, quantity
FROM layer2_materials;
```

## Common Mistakes to Avoid

❌ **Don't Query Without WHERE Clause on Large Tables**
```sql
-- Bad: Returns all 65,000 materials
SELECT * FROM layer2_materials;

-- Good: Filter first
SELECT * FROM layer2_materials WHERE code_id = 123;
```

❌ **Don't Join Without Indexes**
```sql
-- Ensure foreign keys are indexed before joining
CREATE INDEX idx_layer2_code ON layer2_materials(code_id);
```

❌ **Don't Use LIKE with Leading Wildcard**
```sql
-- Slow: Can't use index
WHERE full_code LIKE '%1670%';

-- Fast: Can use index
WHERE full_code LIKE '1670%';
```

❌ **Don't Forget to Use Views**
```sql
-- Instead of repeating complex joins:
SELECT l1.*, pod.*, mc.*
FROM layer1_codes l1
JOIN phase_option_definitions pod ON ...
JOIN material_classes mc ON ...;

-- Use the view:
SELECT * FROM v_layer1_codes_complete;
```

## Next Steps

1. Practice with SQL_PRACTICE_LAB.md
2. Review SQL_QUICK_REFERENCE.md for syntax
3. Study the 6 pre-built views in schema
4. Create custom views for your common queries
5. Use EXPLAIN to optimize slow queries

## Additional Resources

**Quick Reference:** SQL_QUICK_REFERENCE.md  
**Practice Lab:** SQL_PRACTICE_LAB.md  
**Cheat Sheet:** SQL_CHEAT_SHEET.md  
**Schema Documentation:** schema_design_v1.sql
