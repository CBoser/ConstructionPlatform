# DECISION 2: Plan-Elevation Model

**Decision Date:** November 13, 2025
**Status:** FINAL
**Impact:** SOLVES TRIPLE-ENCODING PROBLEM
**Priority:** CRITICAL

---

## The Question

Is "G603B" one plan (Elevation as Variant), or is it Plan G603 + Elevation B (Elevation as Dimension)?

## Decision

**ELEVATION AS DIMENSION (Option B)**

Plan ID = "G603" (NO elevation suffix)
Elevation = "B" (stored in separate table)

## Rationale

### CRITICAL: This Solves the Triple-Encoding Problem

**The Problem (Documented in Options_Phase_Item_No.csv Row 7):**
```
Location 1: Pack name
|10.82BCD OPT DEN FOUNDATION
↓ "BCD" embedded in pack name

Location 2: Location column
"- ELVB - ELVC - ELVD"
↓ Elevation spelled out again

Location 3: Option codes
ELVB, ELVC, ELVD
↓ Elevation encoded THIRD time

Question: Which is the source of truth?
Answer: ALL THREE, and they can conflict! ❌
```

**The Solution:**
```
Plan Table:
plan_id | plan_name | builder_id
G603    | Plan 603  | RICHMOND

Plan Elevations Table:
elevation_id | plan_id | elevation_code
1            | G603    | A
2            | G603    | B
3            | G603    | C

Pack Table:
pack_id | pack_name
10.82   | OPT DEN FOUNDATION (NO elevation in name!)

Pack Elevations Table:
pack_id | elevation_code
10.82   | B
10.82   | C
10.82   | D

Materials Table:
material_id | plan_id | elevation_id | pack_id | item_id | quantity
12345       | G603    | 2            | 10.82   | 404001  | 24

ONE source of truth: elevation_id links to plan_elevations table ✅
```

### Evidence from Analysis

**Richmond Plan Index Structure:**
```
Model Column: "G603"
Elevations Column: "A, B, C"

They ARE already separated!
The Plan Index structure validates Option B.
```

**Holt Sheet Naming:**
```
"1670ABCD CR" = Plan 1670, Elevations A/B/C/D, Community CR

Multi-elevation naming shows Holt thinks of elevation as dimension.
```

**Monday's Analysis (05_REFERENCE_DATA.md):**
- Triple-encoding documented in Options_Phase_Item_No.csv
- Richmond Plan Index separates Model from Elevations
- Holt uses clean elevation encoding (no redundancy)

### Why Elevation as Dimension is Correct

**Advantages:**
- ✅ **SOLVES triple-encoding completely** (single source of truth!)
- ✅ Elevation stored once in dedicated table
- ✅ Can query "show all elevations of plan X"
- ✅ Can query "show all plans with elevation B"
- ✅ Cleaner pack names (no elevation embedded)
- ✅ Scales for future (add new elevations without changing pack names)
- ✅ Industry standard database design
- ✅ Matches Richmond Plan Index structure

**Trade-offs:**
- Requires joins in queries (slightly more complex)
- Different from some current sheet naming
- Need to explain dimension concept to team

## Database Implementation

```sql
-- Plans (NO elevation in plan_id!)
CREATE TABLE plans (
    plan_id TEXT PRIMARY KEY,           -- 'G603', '1670' (NO elevation)
    plan_name TEXT NOT NULL,
    builder_id TEXT NOT NULL,
    sq_ft INTEGER,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);

-- Plan Elevations (separate dimension)
CREATE TABLE plan_elevations (
    elevation_id INTEGER PRIMARY KEY,
    plan_id TEXT NOT NULL,
    elevation_code TEXT NOT NULL,       -- 'A', 'B', 'C', 'D'
    elevation_name TEXT,                 -- 'Elevation A'
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    UNIQUE(plan_id, elevation_code)
);

-- Packs (NO elevation in pack name!)
CREATE TABLE packs (
    pack_id TEXT PRIMARY KEY,           -- '10.82' NOT '10.82BCD'
    pack_name TEXT NOT NULL,            -- 'OPT DEN FOUNDATION' (clean!)
    phase TEXT,
    is_active INTEGER DEFAULT 1
);

-- Pack Elevations (which elevations does pack apply to)
CREATE TABLE pack_elevations (
    pack_elevation_id INTEGER PRIMARY KEY,
    pack_id TEXT NOT NULL,
    elevation_code TEXT NOT NULL,       -- 'B', 'C', 'D'
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    UNIQUE(pack_id, elevation_code)
);

-- Materials (links to elevation via elevation_id)
CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    plan_id TEXT NOT NULL,              -- 'G603' (NOT 'G603B')
    elevation_id INTEGER,                -- Link to plan_elevations
    pack_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (elevation_id) REFERENCES plan_elevations(elevation_id),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id)
);
```

## How It Solves Triple-Encoding

### Before (Triple-Encoded):
```
Pack: |10.82BCD OPT DEN FOUNDATION
      ↑ Elevation in pack name

Location: "- ELVB - ELVC - ELVD"
          ↑ Elevation in location string

Options: ELVB, ELVC, ELVD
         ↑ Elevation in option codes

Three sources of truth = Confusion and conflicts possible
```

### After (Single Source):
```
packs table:
pack_id | pack_name
10.82   | OPT DEN FOUNDATION (clean, no elevation!)

pack_elevations table:
pack_id | elevation_code
10.82   | B
10.82   | C
10.82   | D

Query: "Which elevations does pack 10.82 support?"
SELECT elevation_code FROM pack_elevations WHERE pack_id = '10.82';
Result: B, C, D

ONE place to check. No conflicts possible. ✅
```

## Query Examples

**Show all elevations of plan G603:**
```sql
SELECT * FROM plan_elevations WHERE plan_id = 'G603';
```

**Show all B elevations across all plans:**
```sql
SELECT p.plan_id, p.plan_name, pe.elevation_code
FROM plans p
JOIN plan_elevations pe ON p.plan_id = pe.plan_id
WHERE pe.elevation_code = 'B';
```

**Show packs for Plan G603, Elevation B:**
```sql
SELECT pk.pack_id, pk.pack_name
FROM packs pk
JOIN pack_elevations pke ON pk.pack_id = pke.pack_id
JOIN plan_elevations pe ON pke.elevation_code = pe.elevation_code
WHERE pe.plan_id = 'G603' AND pe.elevation_code = 'B';
```

**Materials for Plan G603, Elevation B:**
```sql
SELECT m.*, i.item_description
FROM materials m
JOIN plan_elevations pe ON m.elevation_id = pe.elevation_id
JOIN items i ON m.item_id = i.item_id
WHERE pe.plan_id = 'G603' AND pe.elevation_code = 'B';
```

## Migration Impact

### Sheet Naming Changes
```
Old: "LE93 G603B"
New: "materialist_G603_B"

Old: "1670ABCD CR"
New: Multiple sheets or multi-elevation handling

Format: [type]_[plan]_[elevation]
```

### Pack Name Cleaning
```
Old: |10.82BCD OPT DEN FOUNDATION
New: 10.82 (pack_id) + OPT DEN FOUNDATION (pack_name)

Elevations stored in pack_elevations table:
10.82 → B
10.82 → C
10.82 → D
```

### Import Logic
```python
# Parse old triple-encoded format
if "BCD" in pack_name:
    pack_id = pack_name.replace("BCD", "")  # Clean pack ID
    elevations = ['B', 'C', 'D']            # Extract elevations

    # Store separately
    insert_pack(pack_id, clean_name)
    for elev in elevations:
        insert_pack_elevation(pack_id, elev)
```

## Validation Rules

1. **plan_id NEVER contains elevation**
   - Correct: "G603", "1670"
   - Incorrect: "G603B", "1670A"

2. **Elevation stored in plan_elevations table**
   - plan_id + elevation_code = complete reference

3. **Pack names clean of elevation**
   - Correct: "10.82 OPT DEN FOUNDATION"
   - Incorrect: "10.82BCD OPT DEN FOUNDATION"

4. **Elevation applicability in pack_elevations table**
   - Query this table to know which elevations a pack supports

## Team Validation

**William (Richmond):** Confirmed Plan Index structure matches this model
**Alicia (Holt):** Holt sheet naming aligns with dimension concept
**Critical Finding:** Triple-encoding is causing confusion - team agrees this solves it ✅

---

## SUCCESS CRITERIA

This decision is successful if:
- ✅ Triple-encoding is eliminated
- ✅ Elevation stored in exactly ONE place
- ✅ Pack names are clean (no elevation suffix)
- ✅ Queries are clear and unambiguous
- ✅ Team understands dimension concept

---

**This decision enables:** Clean database schema, eliminates triple-encoding, enables powerful queries
**Next Decision:** Decision 3 (Internal Option Codes) - Translation strategy
