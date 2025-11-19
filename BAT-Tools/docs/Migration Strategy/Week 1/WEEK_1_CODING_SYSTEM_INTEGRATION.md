# WEEK 1 ENHANCED: CODING SYSTEM + BAT AUDIT

**Consolidates:** WEEK_1_CODING_SYSTEM_INTEGRATION.md (v1.0)  
**Version:** 2.0  
**Created:** November 10, 2025  
**Status:** Active - Enhanced for v2.0 Documentation  
**Integrates With:** 02_MASTER_PLAN.md, 03_FOUNDATION_GUIDE.md, 04_CODING_STANDARDS.md

---

## 📋 DOCUMENT CONTEXT

**This is the detailed execution guide for Week 1's coding system integration work.**

**Use this file when:**
- Planning Tuesday's architecture session
- Making the three critical decisions
- Designing database schema
- Creating import mapping rules

**Related Files:**
- **02_MASTER_PLAN.md** → Week 1 overview and timeline
- **03_FOUNDATION_GUIDE.md** → Complete Week 1 day-by-day breakdown
- **04_CODING_STANDARDS.md** → Architecture decisions reference
- **05_REFERENCE_DATA.md** → Richmond/Holt analysis findings

**Note:** This file provides the *detailed methodology* for Tuesday's work. For the complete Week 1 plan including all days, see 03_FOUNDATION_GUIDE.md.

---

## 🎯 WHY THIS MATTERS

You're about to import **35 Richmond plans** (55,605 materials) into your BAT system. **Before you do that**, you need to solve the coding system architecture. Otherwise you'll:
- ❌ Create tables that don't relate properly
- ❌ Triple-encode elevation data (like current 10.82BCD problem)
- ❌ Build technical debt into 55,605 material line items
- ❌ Make the Holt-Richmond integration exponentially harder

**The good news:** Week 1 is EXACTLY when this needs to happen. Your Monday audits will give you the data you need to design the right system.

**Investment:** +4 hours in Week 1  
**Return:** Saves 4-6 weeks of rework, cleaner system, team clarity

---

## 📊 INTEGRATED WEEK 1 PLAN (18 hours total)

### Original Week 1: 14 hours
```
├─ Item numbering audit: 4 hours
├─ Richmond structure audit: 2 hours  
├─ Draft coding standards: 4 hours
├─ Team review: 2 hours
└─ Finalize: 2 hours
```

### Enhanced Week 1: 18 hours (+4 hours)
```
├─ Item numbering audit: 4 hours (same)
├─ Richmond structure audit: 2 hours (same)
├─ **Coding system design: 6 hours** ⭐ NEW
├─ Draft coding standards: 2 hours (reduced, informed by design)
├─ Team review: 2 hours (same)
└─ Finalize: 2 hours (same)
```

**Why +4 hours:** The coding system design work front-loads complexity but **saves weeks** during plan imports (Weeks 5-8).

**Status Update (Nov 10, 2025):**
- ✅ Monday audits: COMPLETE
  - item_numbering_patterns.txt created (746 items analyzed)
  - richmond_structure.txt created (20 pages)
  - 6 critical findings identified
  - Ready for Tuesday architecture session

---

## 🗓️ DAY-BY-DAY BREAKDOWN

### ✅ Monday (4 hours): Foundational Audits - COMPLETE

**Status:** Completed November 10, 2025

**Morning (2 hours): Item Numbering Audit** ✅
```
Richmond "Item Pricing" sheet:
✅ Documented prefixes (288 unique patterns)
✅ Number ranges (1 to 812,110)
✅ Suffixes (496 items with suffixes)
✅ Category patterns (NUMBER-LETTER 38.6%)
✅ Special characters analyzed

Holt IWP and RL sheets:
✅ Documented prefixes (DFKDR dominant 53%)
✅ Number ranges (1 to 1,212)
✅ Category organization (timber-focused)
✅ Elevation encoding (XX placeholder 78%)
✅ Community patterns (CR, GG, HA, HH, WR)

Output: ✅ item_numbering_patterns.txt (15 pages, 746 items)
```

**Afternoon (2 hours): Richmond Structure Audit** ✅
```
Richmond 3BAT:
✅ Pricing sheet structure documented
✅ Column mappings analyzed
✅ Price levels identified
✅ Formula patterns examined
✅ Plan sheet organization ⭐
   ✅ Sheet naming patterns (3 types)
   ✅ Elevation encoding (ELVA, ELVB, ELVC)
   ✅ Triple-encoding problem identified
   ✅ Pack hierarchy mapped (|10.82 format)
✅ Table naming conventions

Output: ✅ richmond_structure.txt (20 pages)
```

**Key Findings from Monday:**
1. ✅ Richmond: 633 unique SKUs, vendor passthrough
2. ✅ Holt: 113 items, systematic timber codes
3. ✅ **Triple-encoding problem confirmed** (|10.82BCD)
4. ✅ Plan naming inconsistency (3 patterns)
5. ✅ Both systems use similar pack hierarchy (commonality!)
6. ✅ Three critical decisions identified for Tuesday

---

### Tuesday (6 hours): Coding System Architecture Design ⭐

**Status:** Ready to Execute (November 11, 2025)

**This is the critical session that solves your integration problems.**

#### Session 1: Understanding Current State (2 hours)

**Goal:** Map how Richmond and Holt currently handle the Plan → Elevation → Option → Material hierarchy.

**Activities:**

**1. Richmond Plan Analysis (1 hour)**
```
Open Richmond BAT, examine these sheets:
├─ 1649A PTO GG (plan sheet example)
├─ G603, G914 (plan sheet examples)
├─ LE93 G603B, LE94 G603A (elevation variants)
└─ Plan Index

Document:
1. How is plan encoded?
   - In sheet name? (G603, G914, 1649A)
   - In table name?
   - In Plan Index?

2. How is elevation encoded?
   - In sheet name? (1649A, G603B)
   - In separate column?
   - In option codes?

3. How do options relate to plans?
   - Option code changes by plan?
   - Option code changes by elevation?
   - One option, multiple uses?

4. Current table relationships:
   - How do sheets link together?
   - What's the primary key?
   - What formulas reference what?

Output: richmond_hierarchy_map.txt
```

**Evidence from Monday's Audit:**
- Richmond has **3 naming patterns** (see richmond_structure.txt lines 45-62)
- **Triple-encoding confirmed** (|10.82BCD + location + option codes)
- Plan Index shows 9 plans with mixed naming
- Need to validate: Are materials same across plans?

**2. Holt Plan Analysis (1 hour)**
```
Open Holt BAT, examine these sheets:
├─ 1670ABCD CR (multi-elevation plan)
├─ 1649ABC GG (multi-elevation plan)
├─ 1547 (153e) (single elevation?)
├─ Plan Index
└─ reference_Subdivisions

Document:
1. How is plan encoded?
   - In sheet name? (1670, 1649, 1547)
   - In plan number alone? (167, 164, 154)
   - In Plan Index?

2. How is elevation encoded?
   - In sheet name? (ABCD, ABC, 153e)
   - Numeric? (01, 02, 03, 04)
   - Letter? (A, B, C, D)

3. How is community encoded?
   - In sheet name? (CR, GG)
   - Separate dimension?
   - Part of option code?

4. Current table relationships:
   - Pack ID system (your 10.x, 11.x structure)
   - How packs link to plans
   - How packs link to elevations
   - Community relationships

Output: holt_hierarchy_map.txt
```

**Evidence from Monday's Audit:**
- Holt uses **consistent pattern** (1670ABCD CR format)
- Communities mapped in reference_Subdivisions
- Numeric option codes (167010100-4085)
- Need to validate: How do communities affect packs?

#### Session 2: Architecture Decisions (2 hours)

**Goal:** Make the three critical decisions identified in your coding system analysis.

**Decision 1: Plan-Pack Relationship (30 min)**

Review your MindFlow pack structure:
```
Current packs:
09.2   - BASEMENT MASONRY UPGRADE
10.01  - OPT FIREPLACE FOUNDATION  
10.60x - EXTENDED GREAT ROOM FOUNDATION
10.82  - OPT DEN FOUNDATION
10.82BCD - OPT DEN FOUNDATION (elevation restricted)
12.x5  - OPT 2 CAR GARAGE 5' EXT FOUNDATION
```

**Question to answer:**

When pack "12.x5" (2-car garage 5' extension) exists, is it:

**A) Universal Pack**
```
✓ Same pack works on Plan G603, G914, G1649
✓ Materials/quantities identical regardless of plan
✓ Plan is a filter (can this plan use this pack?)

Schema:
pack_id | description              | valid_for_plans
12.x5   | 2CAR GARAGE 5' EXT FOUND | ALL (or specific list)
```

**B) Plan-Specific Pack**
```
✓ Pack 12.x5 on G603 is different than pack 12.x5 on G914
✓ Different materials/quantities per plan
✓ Plan is part of the identity

Schema:
plan_id | pack_id | description              
G603    | 12.x5   | 2CAR GARAGE 5' EXT FOUND (G603 version)
G914    | 12.x5   | 2CAR GARAGE 5' EXT FOUND (G914 version)
```

**How to decide:**
1. Pick pack 12.x5 (garage extension) or similar
2. Look at Richmond data: Does the Richmond option code (e.g., "2CAR5XA") appear on multiple plans?
3. When it does, are the material quantities the same or different?
4. If same → Universal Pack (A)
5. If different → Plan-Specific Pack (B)

**Monday's Evidence Suggests:**
- From richmond_structure.txt: Same pack IDs appear across plans
- Need validation: Check actual material quantities
- Question for William: "When option 2CAR5XA appears on Plan G603 and Plan G914, are the materials identical?"

**Document your decision:**
```
DECISION 1: PLAN-PACK RELATIONSHIP
Choice: [ ] A - Universal  [ ] B - Plan-Specific

Reasoning:
[Explain based on actual data]

Example:
Pack 12.x5 on Plan G603 uses [X] 2x6x16 studs
Pack 12.x5 on Plan G914 uses [Y] 2x6x16 studs
Therefore: [same or different?]

Implications:
- Primary key: [pack_id alone OR plan_id + pack_id]
- Table structure: [simpler OR more complex]
- Data volume: [X packs total OR X packs × Y plans]
```

**Save as:** DECISION_1_Plan_Pack_Relationship.md

---

**Decision 2: Plan-Elevation Model (30 min)**

Look at your actual data:
```
Richmond names (from Monday's audit):
- G603 (base sheet, all elevations)
- G603B (unclear if variant or dimension)
- LE93 G603B (community + plan + elevation)
- LE94 G603A (community + plan + elevation)
- 1649A PTO GG (plan + elev + community)

Holt names (from Monday's audit):
- 1670ABCD CR (multi-elevation)
- 1649ABC GG (multi-elevation)
- 1547 (153e) (elevation in parens?)
```

**Question to answer:**

Is "G603B" one plan, or is it Plan G603 + Elevation B?

**A) Elevation as Plan Variant**
```
✓ G603B is a distinct plan (happens to be elevation B of 603 series)
✓ You reference the whole thing as one unit
✓ "G603B" is the plan_id

Schema:
plan_id | description
G603    | Plan 603 base
G603B   | Plan 603 elevation B  
G603C   | Plan 603 elevation C

Query: SELECT * FROM plans WHERE plan_id = 'G603B'
```

**B) Elevation as Separate Dimension**
```
✓ Plan G603 exists as concept
✓ Elevation B is a way to build plan G603
✓ Separable: plan_id = "G603", elevation = "B"

Schema:
plan_id | elevation | description
G603    | (base)    | Plan 603 base
G603    | B         | Plan 603 elevation B
G603    | C         | Plan 603 elevation C

Query: SELECT * FROM plans WHERE plan_id = 'G603' AND elevation = 'B'

Benefits:
- Query "all elevations of plan G603"
- Solves triple-encoding problem
- Matches customer selection flow
```

**Monday's Evidence Suggests:**
- Richmond Plan Index lists: Model = "G603", Elevations = "A, B, C" (SEPARATE!)
- **This strongly suggests Option B (Elevation as Dimension)**
- Triple-encoding problem solved by storing elevation once
- Question for William: "Do customers say 'Plan G603B' or 'Plan G603, elevation B'?"

**How to decide:**
1. Look at Holt Plan Index - does it list plan + elevation separately?
2. Look at Richmond Plan Index structure (checked Monday - they ARE separate)
3. Do customers think "I want plan 603, elevation B" or "I want plan G603B"?
4. Which matches your quoting workflow?

**Document your decision:**
```
DECISION 2: PLAN-ELEVATION MODEL  
Choice: [ ] A - Elevation as Variant  [ ] B - Elevation as Dimension

Reasoning:
[Explain based on workflow]

Evidence from Holt Plan Index:
[What does Plan Index show?]

Evidence from Richmond Plan Index:
Plan Index shows: Model = "G603", Elevations = "A, B, C"
This suggests they ARE separate dimensions (Option B)

Evidence from Monday's Triple-Encoding Problem:
Pack |10.82BCD encodes elevation 3 times
Option B solves this by storing elevation once in proper field

Customer perspective:
[How do they actually select?]

Implications:
- plan_id field: [includes elevation OR separate elevation column]
- Queries: [simpler OR need join]
- Triple-encoding: [persists OR solved]
```

**Recommendation Based on Monday's Audit:**
**Option B (Elevation as Dimension)** appears to be the correct choice because:
1. Richmond Plan Index structure already separates them
2. Solves triple-encoding problem
3. Enables queries like "all elevations of plan X"
4. Matches Holt's multi-elevation approach (1670ABCD)

**Save as:** DECISION_2_Plan_Elevation_Model.md

---

**Decision 3: Internal Option Code Philosophy (60 min)**

**Current state (from Monday's audit):**
```
Richmond approach:
  Pack: |10.60x EXTENDED GREAT ROOM FOUNDATION
  Option Code: XGREAT
  → Two identifiers for same thing

Holt approach:
  Pack: |10ABCD FOUNDATION (phase-based)
  Option Code: 167010100-4085 (plan-phase-option-item)
  → Systematic numeric system

Your MindFlow system:
  Pack IDs: 10.82, 12.x5, 10.60x
  → Decimal-based hierarchy
```

**Question to answer:**

What's YOUR internal code? Pack ID? Option code? Or something new?

**A) Use Pack ID as Internal Code**
```
✓ Internal code = pack_id (e.g., "12.x5", "10.82")
✓ Minimal translation layer
✓ Team already knows these codes

Richmond mapping:
  Richmond option: 2CAR5XA → Pack: 12.x5 → Internal code: 12.x5

Holt mapping:
  Holt option: 167050100-4085 → Pack: 12.x5 → Internal code: 12.x5

Quote shows: "Option 12.x5 - 2 Car Garage 5' Extension"

Pros:
  + Simple (already using these)
  + No new learning curve
  + Direct database queries

Cons:
  - Less human-readable
  - Decimal notation may confuse customers
```

**B) Use Semantic Internal Codes**
```
✓ Internal code = human-readable (e.g., "GAREXT5", "DENOPT")
✓ Self-documenting system
✓ Customer-facing friendly

Richmond mapping:
  Richmond option: 2CAR5XA → Pack: 12.x5 → Internal: GAREXT5

Holt mapping:
  Holt option: 167050100-4085 → Pack: 12.x5 → Internal: GAREXT5

Quote shows: "Option GAREXT5 - 2 Car Garage 5' Extension"

Pros:
  + Human-readable
  + Self-documenting
  + Customer-friendly

Cons:
  - Requires translation table
  - Need naming conventions
  - Learning curve for team
```

**C) Use Hierarchical Internal Codes**
```
✓ Internal code = systematic hierarchy (e.g., "12.05-01", "10.82-BCD")
✓ Combines structure + extensibility
✓ Database-friendly

Richmond mapping:
  Richmond option: 2CAR5XA → Pack: 12.x5 → Internal: 12.05-01

Holt mapping:
  Holt option: 167050100-4085 → Pack: 12.x5 → Internal: 12.05-01

Structure:
  [Phase].[Category]-[Variant]
  12.05-01 = Phase 12, Category 05 (garage), Variant 01

Pros:
  + Systematic extensibility
  + Clear variant relationships
  + Good for large-scale systems

Cons:
  - Most complex to implement
  - Requires strong conventions
  - Overkill for current scale?
```

**D) Hybrid Approach (Recommended)**
```
✓ Use pack_id as primary internal identifier
✓ Add semantic_code for human readability
✓ Preserve Richmond/Holt codes for traceability

Schema:
pack_id | semantic_code | richmond_code | holt_code      | description
12.x5   | GAREXT5       | 2CAR5XA       | 167050100-...  | 2 Car Garage 5' Ext
10.82   | DENOPT        | DEN           | 167010200-...  | Optional Den

Quote shows: "Option GAREXT5 (12.x5) - 2 Car Garage 5' Extension"
Database uses: pack_id (12.x5)
Humans use: semantic_code (GAREXT5)
Richmond import uses: richmond_code (2CAR5XA)
Holt import uses: holt_code (167050100-...)

Pros:
  + Best of all worlds
  + Preserve all existing codes
  + Human + machine readable
  + Smooth transition

Cons:
  - More columns in database
  - Need to create semantic codes
  - Slight complexity increase
```

**How to decide:**
1. Show examples to William and team
2. Which format would they prefer to:
   - See in quotes?
   - Use in daily conversation?
   - Search for in database?
3. Consider: Will customers see these codes?
4. Consider: How many options total? (If <100, semantic works. If >500, hierarchical may be better.)

**Monday's Evidence Suggests:**
- You have ~50-100 packs total (manageable for semantic)
- Team already knows pack IDs (12.x5, 10.82)
- **Hybrid approach preserves existing while adding readability**

**Document your decision:**
```
DECISION 3: INTERNAL OPTION CODES
Choice: [ ] A - Pack ID  [ ] B - Semantic  [ ] C - Hierarchical  [ ] D - Hybrid

Reasoning:
[Explain team preference]

Examples:
Pack 12.x5:
  Pack ID: 12.x5
  Semantic: GAREXT5 or GAR2C5X
  Richmond: 2CAR5XA
  Holt: 167050100-4085
  
Chosen format: [selected option]
Customer sees: [what appears on quote]
Team uses: [what they search for]
Database uses: [primary key]

Implications:
- Translation table needed: [yes/no]
- Learning curve: [none/low/medium/high]
- Future extensibility: [easy/moderate/complex]
```

**Recommendation Based on Experience:**
**Option D (Hybrid)** provides the most flexibility:
- Keep pack_id as primary key (team knows it)
- Add semantic_code for readability
- Preserve builder codes for traceability
- Future-proof for growth

**Save as:** DECISION_3_Internal_Option_Codes.md

---

#### Session 3: Schema Design (2 hours)

**Goal:** Create the SQL database schema that implements your three decisions.

**1. Core Tables Design (1 hour)**

Based on your decisions, design these core tables:

**Plans Table**
```sql
-- Design depends on Decision 2
-- If Option B (Elevation as Dimension):

CREATE TABLE plans (
    plan_id TEXT NOT NULL,              -- "G603", "1670"
    elevation TEXT,                     -- "A", "B", "C", "D" or NULL for base
    builder_id TEXT NOT NULL,           -- "RICHMOND" or "HOLT"
    description TEXT,                   -- "Plan 603 Elevation B"
    community TEXT,                     -- For Holt: "CR", "GG", etc.
    sq_ft INTEGER,
    bedrooms INTEGER,
    bathrooms REAL,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (plan_id, elevation),
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);

-- If Option A (Elevation as Variant):
-- plan_id would be "G603B" and elevation column removed
-- PRIMARY KEY would be just (plan_id)
```

**Packs Table**
```sql
-- Design depends on Decision 1
-- If Option A (Universal Pack):

CREATE TABLE packs (
    pack_id TEXT PRIMARY KEY,           -- "12.x5", "10.82"
    semantic_code TEXT,                 -- "GAREXT5", "DENOPT" (if Decision 3 = Hybrid/Semantic)
    phase INTEGER NOT NULL,             -- 10, 11, 12, etc.
    category TEXT,                      -- "FOUNDATION", "FRAMING", etc.
    description TEXT NOT NULL,          -- "2 Car Garage 5' Extension Foundation"
    estimated_cost REAL,
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- If Option B (Plan-Specific Pack):
-- Add plan_id to primary key
-- PRIMARY KEY (plan_id, pack_id)
```

**Options Table (Translation/Mapping)**
```sql
-- Maps builder-specific option codes to your internal packs

CREATE TABLE options (
    option_id INTEGER PRIMARY KEY,
    pack_id TEXT NOT NULL,              -- Links to packs.pack_id
    builder_id TEXT NOT NULL,           -- "RICHMOND" or "HOLT"
    builder_option_code TEXT NOT NULL,  -- "2CAR5XA" or "167050100-4085"
    plan_id TEXT,                       -- Optional: if option is plan-specific
    elevation TEXT,                     -- Optional: if option is elevation-specific
    description TEXT,
    
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id),
    
    UNIQUE(builder_id, builder_option_code, plan_id)
);

-- This table solves the translation problem:
-- Richmond "2CAR5XA" → pack "12.x5"
-- Holt "167050100-4085" → pack "12.x5"
```

**Materials Table**
```sql
-- Individual line items (55,605 rows for Richmond + Holt combined)

CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    builder_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    elevation TEXT,                     -- Based on Decision 2
    pack_id TEXT NOT NULL,
    item_sku TEXT NOT NULL,             -- Vendor SKU (preserve as-is)
    item_description TEXT,
    quantity REAL NOT NULL,
    unit TEXT,                          -- "EA", "LF", "SF", etc.
    unit_cost REAL,
    phase INTEGER,
    category TEXT,
    location TEXT,                      -- Preserve original location string
    is_active INTEGER DEFAULT 1,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id)
);

-- Indexes for performance
CREATE INDEX idx_materials_plan ON materials(plan_id, elevation);
CREATE INDEX idx_materials_pack ON materials(pack_id);
CREATE INDEX idx_materials_sku ON materials(item_sku);
```

**Elevation Availability Table (Solves Triple-Encoding)**
```sql
-- Tracks which elevations each pack supports
-- Replaces |10.82BCD encoding

CREATE TABLE pack_elevations (
    pack_id TEXT NOT NULL,
    elevation TEXT NOT NULL,            -- "B", "C", "D"
    
    PRIMARY KEY (pack_id, elevation),
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id)
);

-- Example data:
-- pack_id | elevation
-- 10.82   | B
-- 10.82   | C  
-- 10.82   | D

-- Query: "Which packs work with elevation B?"
-- SELECT pack_id FROM pack_elevations WHERE elevation = 'B'

-- Query: "Which elevations does pack 10.82 support?"
-- SELECT elevation FROM pack_elevations WHERE pack_id = '10.82'

-- No more triple-encoding! ✅
```

**Supporting Tables**
```sql
-- Builders
CREATE TABLE builders (
    builder_id TEXT PRIMARY KEY,        -- "RICHMOND", "HOLT"
    builder_name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Communities (Holt-specific)
CREATE TABLE communities (
    community_id TEXT PRIMARY KEY,      -- "CR", "GG", "HA"
    community_name TEXT NOT NULL,
    builder_id TEXT NOT NULL,
    area_code INTEGER,                  -- 98, 99, 106, 107
    
    FOREIGN KEY (builder_id) REFERENCES builders(builder_id)
);
```

**Save as:** schema_design_v1.sql

---

**2. Triple-Encoding Solution Documentation (30 min)**

Document how your schema solves the |10.82BCD problem:

**Before (Current Problem):**
```
Pack name: |10.82BCD OPT DEN FOUNDATION - ELVB - ELVC - ELVD
                 ^^^                        ^^^^   ^^^^   ^^^^
              Encoded in:                   Encoded again 3 times!
              1. Pack ID suffix
              2. Location string (3 times)
              3. Individual option codes
```

**After (Your Solution):**
```
packs table:
  pack_id | description
  10.82   | OPT DEN FOUNDATION

pack_elevations table:
  pack_id | elevation
  10.82   | B
  10.82   | C
  10.82   | D

materials table:
  material_id | pack_id | elevation | item_sku | quantity
  12345       | 10.82   | B         | 2X6X16   | 24
  12346       | 10.82   | C         | 2X6X16   | 24
  12347       | 10.82   | D         | 2X6X16   | 24
```

**Query Examples:**
```sql
-- Find all packs available for elevation B
SELECT DISTINCT p.*
FROM packs p
JOIN pack_elevations pe ON p.pack_id = pe.pack_id
WHERE pe.elevation = 'B';

-- Find all elevations for pack 10.82
SELECT elevation
FROM pack_elevations
WHERE pack_id = '10.82';

-- Find materials for pack 10.82, elevation B
SELECT *
FROM materials
WHERE pack_id = '10.82' AND elevation = 'B';

-- Quote generation: Plan G603, Elevation B, Pack 10.82
SELECT 
    m.item_sku,
    m.item_description,
    m.quantity,
    m.unit_cost,
    m.quantity * m.unit_cost AS line_total
FROM materials m
WHERE m.plan_id = 'G603'
  AND m.elevation = 'B'
  AND m.pack_id = '10.82';
```

**Benefits:**
- ✅ Store elevation once (in materials.elevation field)
- ✅ No redundant encoding
- ✅ Easy to query
- ✅ Easy to maintain
- ✅ No inconsistency risk
- ✅ Follows DRY principle

**Save as:** Triple_Encoding_Solution.md

---

**3. Import Mapping Rules (30 min)**

Document how Richmond and Holt data maps to your new schema:

**Richmond → Schema Mapping**
```
Richmond 3BAT Sources:
├─ Plan Index sheet
│  ├─ Column A: Model → plans.plan_id
│  ├─ Column B: Elevations → plans.elevation (split on comma)
│  └─ Columns C-G: Plan metadata
│
├─ Plan sheets (e.g., "G603", "LE93 G603B")
│  ├─ Pack column (|10.82 format) → materials.pack_id
│  ├─ Location column (ELVB, ELVC) → materials.elevation (parse)
│  ├─ Item# column → materials.item_sku
│  ├─ Descrp column → materials.item_description
│  ├─ Qty column → materials.quantity
│  └─ Cost columns (L1-L5?) → materials.unit_cost
│
└─ Option codes in formulas
   └─ Extract option code → options.builder_option_code

Parsing Rules:
1. Plan ID extraction:
   - "G603" → plan_id = "G603", elevation = NULL (base)
   - "LE93 G603B" → plan_id = "G603", elevation = "B"
   - "1649A PTO GG" → plan_id = "1649", elevation = "A"

2. Pack ID cleaning:
   - "|10.82BCD" → pack_id = "10.82"
   - Store elevations separately in pack_elevations table

3. Elevation parsing from location:
   - "- ELVB - ELVC" → elevations: ["B", "C"]
   - Create separate material rows for each elevation

4. Builder codes:
   - builder_id = "RICHMOND"
   - Extract option codes from cell formulas/comments
```

**Holt → Schema Mapping**
```
Holt BAT Sources:
├─ Plan Index sheet
│  ├─ Plan column → plans.plan_id (extract digits)
│  ├─ Elevation encoded in sheet name → plans.elevation
│  └─ Community from sheet name → plans.community
│
├─ Plan sheets (e.g., "1670ABCD CR")
│  ├─ Pack column (|10ABCD format) → materials.pack_id (clean)
│  ├─ Sheet name elevations → materials.elevation (parse ABCD)
│  ├─ Item# column → materials.item_sku
│  ├─ Description column → materials.item_description
│  ├─ Qty column → materials.quantity
│  └─ Price column → materials.unit_cost
│
├─ reference_Subdivisions sheet
│  ├─ Community codes → communities table
│  └─ Area codes → communities.area_code
│
└─ Option codes in separate column
   └─ Format: 167010100-4085 → options.builder_option_code

Parsing Rules:
1. Plan ID extraction:
   - "1670ABCD CR" → plan_id = "1670"
   - Elevations = ["A", "B", "C", "D"]
   - Community = "CR"

2. Pack ID cleaning:
   - "|10ABCD" → pack_id = "10" (numeric option variant)
   - Store elevation support in pack_elevations

3. Elevation parsing:
   - "ABCD" in sheet name → create 4 plan records
   - Or create material records for each elevation

4. Builder codes:
   - builder_id = "HOLT"
   - Parse option codes: "167010100-4085"
     - 167 = plan
     - 01 = phase
     - 01 = option number
     - 00 = elevation variant
     - 4085 = item type
```

**Validation Rules**
```
On import, validate:
1. ✅ Plan ID exists in plans table
2. ✅ Elevation matches plan's available elevations
3. ✅ Pack ID exists in packs table
4. ✅ Pack elevation compatibility (pack_elevations check)
5. ✅ Item SKU is not empty
6. ✅ Quantity is positive number
7. ✅ No duplicate material records (plan + elevation + pack + SKU)
8. ✅ Foreign key constraints satisfied

Logging:
- Log all validation failures to import_errors.log
- Include row number, plan ID, pack ID, error message
- Allow review and correction before retrying
```

**Save as:** import_mapping_rules.md

---

**Tuesday Session Complete!**

At end of Tuesday (6 hours), you will have:
- ✅ richmond_hierarchy_map.txt
- ✅ holt_hierarchy_map.txt
- ✅ DECISION_1_Plan_Pack_Relationship.md
- ✅ DECISION_2_Plan_Elevation_Model.md
- ✅ DECISION_3_Internal_Option_Codes.md
- ✅ schema_design_v1.sql
- ✅ import_mapping_rules.md
- ✅ Triple_Encoding_Solution.md

**These 8 documents will guide everything you build in Weeks 2-12!**

---

### Wednesday (2 hours): Draft Coding Standards

**Status:** Ready to Execute After Tuesday Decisions

**Morning (2 hours): Write BAT_Coding_Standards.docx**

Now that you have your architecture decisions, write the coding standards document:

**Document Structure:**
```
1. INTRODUCTION
   - Purpose of standards
   - Scope (Richmond + Holt integration)
   - Authority (based on Tuesday's decisions)

2. DECISION SUMMARY
   - Decision 1: [Your choice from Tuesday]
   - Decision 2: [Your choice from Tuesday]
   - Decision 3: [Your choice from Tuesday]
   - Rationale for each

3. PLAN NAMING STANDARDS
   - Standard format: [Based on Decision 2]
   - Examples from Richmond
   - Examples from Holt
   - How to handle edge cases

4. ELEVATION ENCODING STANDARDS
   - How elevations are stored [Based on Decision 2]
   - Query patterns
   - Examples

5. PACK ID STANDARDS
   - Format: Phase.Variant (10.82, 12.x5)
   - How pack IDs relate to plans [Based on Decision 1]
   - Creating new pack IDs

6. OPTION CODE STANDARDS
   - Internal code format [Based on Decision 3]
   - Richmond option code mapping
   - Holt option code mapping
   - Translation table usage

7. DATABASE SCHEMA REFERENCE
   - Core tables summary
   - Primary keys
   - Foreign keys
   - Common queries

8. IMPORT PROCEDURES
   - Richmond import workflow
   - Holt import workflow
   - Validation requirements

9. EXAMPLES & EDGE CASES
   - Real examples from your data
   - How to handle special cases
   - Troubleshooting guide

10. APPENDIX
    - Complete schema_design_v1.sql
    - Import mapping reference
    - Triple-encoding solution
```

**Use Monday's Findings:**
- Item numbering patterns (746 items analyzed)
- Richmond structure (20 pages of analysis)
- 6 critical findings identified

**Use Tuesday's Decisions:**
- All three architecture decisions
- Schema design
- Import mapping rules

**Output:** BAT_Coding_Standards.docx (comprehensive reference document)

---

### Thursday (2 hours): Team Review

**Status:** Same as Master Plan

**Morning (2 hours): Review with William and team**

Present your decisions and get feedback:

**Agenda:**
```
1. Overview of Week 1 work (5 min)
   - Monday audits recap
   - Tuesday decisions made

2. Present Decision 1: Plan-Pack Relationship (15 min)
   - Show your choice
   - Explain reasoning
   - Show examples
   - Get validation

3. Present Decision 2: Plan-Elevation Model (15 min)
   - Show your choice
   - Explain how it solves triple-encoding
   - Show query examples
   - Get validation

4. Present Decision 3: Internal Option Codes (15 min)
   - Show your choice
   - Show example codes
   - Explain translation approach
   - Get validation

5. Walk through schema design (20 min)
   - Show core tables
   - Explain relationships
   - Show query examples
   - Address questions

6. Review coding standards document (20 min)
   - Walk through key sections
   - Show real examples
   - Get feedback on clarity

7. Next steps discussion (10 min)
   - Week 2 tool building preview
   - How these decisions enable import
   - Timeline confirmation
```

**Questions to Ask:**
```
FOR WILLIAM (Richmond):
1. Decision 1: When option "2CAR5XA" appears on G603 and G914, 
   are the materials identical? ← This validates your choice
   
2. Decision 2: Do customers say "Plan G603B" or "Plan G603, 
   elevation B"? ← This validates elevation model
   
3. Decision 3: Show Richmond option codes. Which internal format 
   would you prefer to see in quotes and search for?

FOR ALICIA (Holt):
1. When you see "1670ABCD CR", does that represent one option 
   or four elevation variants?
   
2. How do communities (GG, CR, WR) relate to packs? 
   Pack-specific or just filtering?
   
3. In daily work, how do you look up materials for a build?

FOR BOTH:
1. Does the schema design make sense for your workflow?
2. Which option code format is easier to work with?
3. What would make the unified system easier than current BATs?
```

**Capture Feedback:**
- Document all questions raised
- Note any concerns about decisions
- Identify any missed edge cases
- List action items for Friday

---

### Friday (2 hours): Finalize

**Status:** Same as Master Plan

**Morning (2 hours): Incorporate feedback and finalize**

**Activities:**
```
1. Review Thursday's feedback (30 min)
   - Address all concerns
   - Adjust decisions if needed
   - Update documentation

2. Update coding standards (60 min)
   - Incorporate feedback
   - Add any missed examples
   - Clarify any confusing sections
   - Final proofread

3. Create reference sheets (30 min)
   - Quick reference card for decisions
   - Schema diagram visual
   - Import workflow diagram
   - Option code translation examples

4. Week 1 wrap-up
   - Confirm all deliverables complete
   - Archive working documents
   - Prepare for Week 2
```

**Final Deliverables Checklist:**
```
[ ] item_numbering_patterns.txt (Monday)
[ ] richmond_structure.txt (Monday)
[ ] richmond_hierarchy_map.txt (Tuesday)
[ ] holt_hierarchy_map.txt (Tuesday)
[ ] DECISION_1_Plan_Pack_Relationship.md (Tuesday)
[ ] DECISION_2_Plan_Elevation_Model.md (Tuesday)
[ ] DECISION_3_Internal_Option_Codes.md (Tuesday)
[ ] schema_design_v1.sql (Tuesday)
[ ] import_mapping_rules.md (Tuesday)
[ ] Triple_Encoding_Solution.md (Tuesday)
[ ] BAT_Coding_Standards.docx (Wednesday, finalized Friday)
[ ] Reference sheets and diagrams (Friday)
[ ] Week 1 completion summary (Friday)
```

**Ready for Week 2:**
```
✓ Architecture decisions made
✓ Database schema designed
✓ Import mapping rules documented
✓ Coding standards finalized
✓ Team aligned and confident
✓ Triple-encoding problem solved
✓ Foundation for 35 plan imports established
```

---

## 🎯 WHY THIS MATTERS FOR YOUR MIGRATION

### Without Coding System Design
```
Week 5: Start importing Richmond plans
Week 6: Realize tables don't link properly
Week 7: Try to fix while importing (chaos)
Week 8: Half-working system, inconsistent data
Week 9: Major refactor needed
Week 10: Re-import everything
Week 11-12: Still cleaning up

Result: 
❌ Triple the work
❌ Inconsistent data
❌ Technical debt
❌ Team confusion
❌ Timeline blown
```

### With Coding System Design (Week 1)
```
Week 1: Design system properly (4 extra hours) ← YOU ARE HERE
Week 2: Build tools that match design
Week 5: Import plans cleanly into good structure
Week 6: Everything links correctly
Week 7: Scaling smoothly
Week 8: Complete with validation
Week 9-12: Infrastructure/testing as planned

Result:
✓ Right the first time
✓ Consistent structure
✓ Clean relationships
✓ Team confidence
✓ On schedule
```

**The 4 extra hours in Week 1 saves 4-6 weeks of rework.**

---

## 📦 COMPLETE DELIVERABLES LIST

### Monday Deliverables (✅ COMPLETE)
```
✅ item_numbering_patterns.txt (15 pages)
   - 633 Richmond SKUs analyzed
   - 113 Holt items analyzed
   - Pattern analysis complete

✅ richmond_structure.txt (20 pages)
   - Plan Index structure documented
   - Triple-encoding problem identified
   - 6 critical findings documented

✅ WEEK1_MONDAY_SUMMARY.txt
   - Completion summary
   - Key findings
   - Tuesday prep guide
```

### Tuesday Deliverables (📅 November 11, 2025)
```
☐ richmond_hierarchy_map.txt
☐ holt_hierarchy_map.txt
☐ DECISION_1_Plan_Pack_Relationship.md
☐ DECISION_2_Plan_Elevation_Model.md (Evidence suggests Option B)
☐ DECISION_3_Internal_Option_Codes.md (Consider Hybrid approach)
☐ schema_design_v1.sql
☐ import_mapping_rules.md
☐ Triple_Encoding_Solution.md
```

### Wednesday-Friday Deliverables
```
☐ BAT_Coding_Standards.docx (Wednesday draft)
☐ Team feedback notes (Thursday)
☐ BAT_Coding_Standards.docx final (Friday)
☐ Reference sheets and diagrams (Friday)
☐ Week 1 completion summary (Friday)
```

---

## 🚨 CRITICAL SUCCESS FACTORS

### Decision Quality
Your three architecture decisions will affect:
- Every table you create
- Every import script you write
- Every query you run
- Every feature you build

**Take the time to get these right.** Involve team.

**Monday's evidence provides strong guidance:**
- Decision 2: Richmond Plan Index structure suggests Option B (Elevation as Dimension)
- Triple-encoding problem requires proper schema solution
- Both systems have commonality (pipe separator, phase numbers)

### Documentation
Every decision should include:
- The choice you made
- Why you made it (with evidence from Monday's audits)
- Evidence supporting it (cite actual data)
- Implications for implementation

**Future you (in Week 8) will thank present you.**

### Validation
Test your decisions with real data:
- Pick 3 actual packs from your current system (e.g., 12.x5, 10.82, 10.60x)
- Map them through your new structure
- Verify it makes sense
- Adjust if needed

**Theory is good. Working examples are better.**

---

## 💡 DECISION-MAKING GUIDELINES

### Decision 1: Plan-Pack Relationship
**Choose Universal Pack (A) if:**
- Same pack has same materials regardless of plan
- Packs are truly standardized components
- You want simpler schema
- **Monday's evidence:** Check if 2CAR5XA materials are identical across plans

**Choose Plan-Specific Pack (B) if:**
- Materials change based on which plan
- Each plan needs custom takeoffs
- You need plan-level tracking
- **Monday's evidence:** If materials differ per plan

**When in doubt:** Check actual Richmond data. Look at materials for same option code on different plans.

---

### Decision 2: Plan-Elevation Model
**Choose Elevation as Variant (A) if:**
- Customers select "Plan G603B" as single unit
- Richmond codes treat them as distinct plans
- Your quoting workflow uses combined codes

**Choose Elevation as Dimension (B) if:**
- Customers select plan, THEN elevation
- You need to query "all elevations of plan X"
- Holt-style separation matches workflow
- **Monday's evidence strongly suggests this:** Richmond Plan Index shows Model = "G603", Elevations = "A, B, C" (SEPARATE!)
- **Solves triple-encoding problem** identified in |10.82BCD

**Recommendation:** Based on Monday's audit, **Option B appears correct**:
1. ✅ Richmond Plan Index already separates them
2. ✅ Solves |10.82BCD triple-encoding
3. ✅ Matches Holt's multi-elevation approach
4. ✅ Enables clean queries

---

### Decision 3: Internal Option Codes
**Choose Pack ID (A) if:**
- You want minimal translation layer
- Pack IDs are memorable enough
- You prefer systematic over semantic

**Choose Semantic Codes (B) if:**
- Human readability is critical
- You want self-documenting system
- Team learns codes by usage

**Choose Hierarchical (C) if:**
- You need systematic extensibility
- You want clear variant relationships
- Database is primary interface

**Choose Hybrid (D) if:**
- You want best of all worlds
- Preserve existing pack IDs (team knows them)
- Add semantic codes for readability
- Keep builder codes for traceability

**Recommendation:** Based on ~50-100 total packs and existing team knowledge, **Hybrid approach** provides most flexibility while preserving institutional knowledge.

---

## 🔗 HOW THIS INTEGRATES WITH V2.0 DOCUMENTATION

### Master Plan Week 1 → Enhanced Week 1
```
See 02_MASTER_PLAN.md, Week 1 section:
├─ Item numbering audit (4h) - SAME
├─ Richmond structure audit (2h) - SAME  
├─ Coding system design (6h) - NEW ⭐ (THIS DOCUMENT DETAILS THIS)
├─ Draft coding standards (2h) - REDUCED (informed by design)
├─ Team review (2h) - SAME
└─ Finalize (2h) - SAME
Total: 18 hours (+4 hours investment)
```

### Foundation Guide Integration
**See 03_FOUNDATION_GUIDE.md for:**
- Complete Week 1 day-by-day schedule
- All task details
- Deliverables checklists
- Success criteria

**This document (WEEK_1_CODING_SYSTEM_INTEGRATION.md):**
- Provides detailed methodology for Tuesday's work
- Deep dive into architecture decisions
- Schema design guidance
- Evidence from Monday's completed audits

### Impact on Later Weeks

**Week 2: Pricing Tools**
- Richmond updater column mappings → Clear from schema
- Price level structure → Documented in standards
- Table relationships → Already designed

**Weeks 5-8: Plan Imports**
- Import script knows target schema → Write once, run 56 times
- Table creation standardized → Consistent structure
- Validation rules clear → Catch errors immediately

**Weeks 9-12: Infrastructure**
- Database migration path → Schema already designed
- Query optimization → Clean relationships
- Testing → Known structure to validate

---

## ✅ WEEK 1 SUCCESS CHECKLIST

### Monday Completion (✅ DONE - November 10, 2025)
```
✅ item_numbering_patterns.txt created (746 items)
✅ richmond_structure.txt created (20 pages)
✅ Understand current encoding in both systems
✅ Know what questions need answers
✅ 6 critical findings identified
✅ Three architecture decisions framed
```

### Tuesday Completion (📅 November 11, 2025)
```
[ ] Decision 1 made and documented
[ ] Decision 2 made and documented (Evidence suggests Option B)
[ ] Decision 3 made and documented (Consider Hybrid)
[ ] Schema tables designed (plans, packs, options, materials)
[ ] Triple-encoding solution documented
[ ] Import mapping rules defined
```

### Wednesday Completion
```
[ ] BAT_Coding_Standards.docx drafted
[ ] All decisions incorporated
[ ] Examples from real data included
[ ] Reference sheets started
```

### Thursday Completion
```
[ ] William reviewed and validated
[ ] Feedback captured
[ ] Revisions identified
```

### Friday Completion
```
[ ] All decisions finalized
[ ] Coding standards final
[ ] Reference sheets complete
[ ] Team aligned and confident
[ ] Ready for Week 2 tool building
```

---

## 🎉 YOU'RE BUILDING IT RIGHT

**This enhanced Week 1 is about:**
- ✅ Getting the foundation right (Monday audits complete!)
- ✅ Avoiding rework later (4 hours now saves 4-6 weeks)
- ✅ Creating a system that scales (56 plans, 55,605 materials)
- ✅ Preserving institutional knowledge (pack IDs team knows)
- ✅ Making your team independent (clear documentation)

**4 extra hours in Week 1 = 4-6 weeks saved overall**

**Plus:** You'll have a system you're proud of, that works consistently, and that others can understand and maintain.

**Monday's Progress:** 20% of Week 1 complete, on track! ✅

---

## 📞 QUESTIONS TO RESOLVE THIS WEEK

Bring these to Thursday's review:

**For William (Richmond):**
1. When option "2CAR5XA" appears on Plan G603 and Plan G914, are the materials identical? ← **Critical for Decision 1**
2. How do customers currently select options? Plan+elevation together or separate? ← **Validates Decision 2**
3. Which Richmond codes should we preserve as-is vs. translate? ← **Informs Decision 3**

**For Alicia (Holt):**
1. When we see "1670ABCD CR", does that represent one option or four elevation variants?
2. How do communities (GG, CR, WR) relate to packs? Pack-specific or just filtering?
3. In your daily work, how do you currently look up materials for a specific build?

**For Both:**
1. Show schema examples - does this structure make sense for your workflow?
2. Show option code examples - which format would you prefer to work with?
3. What would make this system easier to use than current BATs?

---

## 🚀 LET'S GET STARTED

**Monday:** ✅ **COMPLETE!** Well done!

**Tuesday (November 11):**
1. Block 6 hours for architecture session
2. Read Monday's findings (item_numbering_patterns.txt + richmond_structure.txt)
3. Open this document → Tuesday session guide
4. Make the three critical decisions
5. Design your schema
6. Create all 8 Tuesday deliverables

**By Friday you'll have:**
- ✅ A system architecture you're confident in
- ✅ Database structure ready to implement
- ✅ Team validation and buy-in
- ✅ Clear coding standards
- ✅ Foundation for 56 plan imports (not 35—we found more!)

**Week 1: 20% Complete! Ready for Tuesday! 🎯**

---

## 📚 RELATED DOCUMENTATION

**Core v2.0 Documentation:**
- **README.md** → Entry point, navigation
- **01_PROJECT_OVERVIEW.md** → Project context
- **02_MASTER_PLAN.md** → Week 1 overview, timeline
- **03_FOUNDATION_GUIDE.md** → Complete Week 1 plan
- **04_CODING_STANDARDS.md** → Architecture decisions reference
- **05_REFERENCE_DATA.md** → Monday's audit findings

**This Document:**
- **Purpose:** Detailed Tuesday methodology
- **Use:** Architecture decision session guide
- **Status:** Ready for November 11, 2025

---

**Document Version:** 2.0  
**Created:** November 10, 2025 (updated from v1.0)  
**Integrates With:** 02_MASTER_PLAN.md, 03_FOUNDATION_GUIDE.md, 04_CODING_STANDARDS.md  
**Purpose:** Enhance Week 1 with coding system architecture design  
**Investment:** +4 hours  
**Return:** Saves 4-6 weeks, cleaner system, team clarity  
**Status:** Monday complete ✅, Tuesday ready 📅

---

**Tuesday (Nov 11): Architecture Design Day! Let's solve this properly! 🚀**
