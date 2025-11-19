# DECISION 1: Plan-Pack Relationship

**Decision Date:** November 13, 2025
**Status:** FINAL
**Impact:** Database schema, primary keys, import logic

---

## The Question

When pack "12.x5" (2-car garage 5' extension) appears on multiple plans, are the materials identical or plan-specific?

## Decision

**HYBRID APPROACH (Option C)**

Packs can be either:
- **Universal:** Same materials on all plans (with `is_universal = TRUE`)
- **Plan-Specific:** Custom materials per plan (with `override_materials = TRUE`)

## Rationale

### Evidence from BAT Analysis

1. **Foundation packs appear universal**
   - Pack "10" (Foundation) is standard across plans
   - Materials likely identical regardless of plan
   - Simpler maintenance if truly universal

2. **Interior packs appear plan-specific**
   - Pack "10.82" (Optional Den) varies by plan size
   - Materials depend on plan dimensions
   - Customization needed per plan

3. **Richmond Pack_Names.xlsx shows both patterns**
   - 315 packs in catalog
   - Some reference specific plans
   - Some are generic/universal

### Why Hybrid is Best

**Advantages:**
- ✅ Accommodates both reality patterns
- ✅ Foundation packs can be universal (simpler)
- ✅ Custom packs can be plan-specific (flexibility)
- ✅ Clear flags indicate intent (`is_universal`, `override_materials`)
- ✅ Scalable for Manor Homes integration
- ✅ Matches how construction actually works

**Trade-offs:**
- Slightly more complex than pure approaches
- Requires clear rules for when to use each type
- Two-step logic for queries

## Database Implementation

```sql
CREATE TABLE packs (
    pack_id TEXT PRIMARY KEY,           -- '12.x5', '10.82'
    pack_name TEXT NOT NULL,
    is_universal INTEGER DEFAULT 0,     -- Universal pack flag
    description TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE plan_packs (
    plan_pack_id INTEGER PRIMARY KEY,
    plan_id TEXT NOT NULL,
    pack_id TEXT NOT NULL,
    override_materials INTEGER DEFAULT 0, -- Plan-specific override flag
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    UNIQUE(plan_id, pack_id)
);

CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    plan_pack_id INTEGER NOT NULL,     -- Links to specific plan-pack combo
    item_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL,
    FOREIGN KEY (plan_pack_id) REFERENCES plan_packs(plan_pack_id)
);
```

## Logic Rules

### Universal Pack
```
IF pack.is_universal = TRUE AND plan_packs.override_materials = FALSE:
    All plans using this pack share the same materials
    Materials query: Join materials → plan_packs → packs
```

### Plan-Specific Pack
```
IF pack.is_universal = FALSE OR plan_packs.override_materials = TRUE:
    This plan has custom materials for this pack
    Materials are stored per plan-pack combination
```

## Query Examples

**Show all universal packs:**
```sql
SELECT * FROM packs WHERE is_universal = 1;
```

**Show plans with customized pack 12.x5:**
```sql
SELECT p.plan_id, pp.notes
FROM plans p
JOIN plan_packs pp ON p.plan_id = pp.plan_id
WHERE pp.pack_id = '12.x5' AND pp.override_materials = 1;
```

**Get materials for plan G603, pack 10.82:**
```sql
SELECT m.*
FROM materials m
JOIN plan_packs pp ON m.plan_pack_id = pp.plan_pack_id
WHERE pp.plan_id = 'G603' AND pp.pack_id = '10.82';
```

## Migration Impact

### Richmond Import (Weeks 5-8)
- Start assuming packs are plan-specific (safer)
- Flag obvious universal candidates (|10 FOUNDATION)
- Review with William to confirm universal status

### Holt Import (Future)
- Similar approach
- Community dimension is separate concern
- Communities affect pricing, not pack universality

## Validation Rules

1. If `is_universal = TRUE`:
   - Pack should work on multiple plans
   - Materials should be identical across plans
   - Document any exceptions

2. If `override_materials = TRUE`:
   - Plan has customized this pack
   - Materials differ from universal or other plans
   - Document reason for customization

## Team Validation

**William (Richmond):** Confirmed foundation packs are typically universal, interior packs vary
**Alicia (Holt):** Similar pattern in Holt operations
**Decision:** Hybrid approach matches reality ✅

---

**This decision enables:** Database schema design, import logic, query patterns
**Next Decision:** Decision 2 (Plan-Elevation Model) - Solves triple-encoding
