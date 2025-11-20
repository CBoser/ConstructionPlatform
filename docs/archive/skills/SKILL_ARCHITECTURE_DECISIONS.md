---
name: coding-system-architecture
description: Guide to the three critical architectural decisions that define the unified coding system structure. Use when user needs help understanding design choices, plan-pack relationships, elevation modeling, option code philosophy, decision rationale, or trade-offs. Trigger on mentions of "architecture", "design decisions", "why elevation", "plan-pack model", "option codes", "hybrid approach", or "decision document".
---

# Coding System Architecture

Understanding the three foundational decisions that shape the MindFlow unified two-layer material coding system.

## Overview: Three Critical Decisions

The unified system's architecture is built on three carefully-reasoned decisions that solve specific problems while enabling future scalability:

```
DECISION 1: Plan-Pack Relationship
└─→ How do plans and packs relate?
    Answer: Hybrid (plan-specific packs with universal taxonomy)

DECISION 2: Plan-Elevation Model  
└─→ Is elevation part of plan or a dimension?
    Answer: Elevation as Dimension (solves triple-encoding)

DECISION 3: Option Code Philosophy
└─→ What internal code format should we use?
    Answer: Hybrid (preserve existing, add universal phase codes)
```

## Decision 1: Plan-Pack Relationship

### The Question
Are material packs universal (shared across all plans) or plan-specific (unique to each plan)?

### The Options Considered

**Option A: Universal Packs**
```
Single pack library shared by all plans
- Pro: Centralized management, easy updates
- Con: May not fit every plan perfectly
- Example: "Den Foundation" pack used by all plans
```

**Option B: Plan-Specific Packs**
```
Each plan has its own pack definitions
- Pro: Perfect fit for each plan
- Con: Duplicate effort, hard to maintain
- Example: "G603 Den Foundation" vs "1670 Den Foundation"
```

**Option C: Hybrid (CHOSEN)**
```
Plan-specific packs, but universal phase/option taxonomy
- Pro: Best of both worlds
- Con: Slightly more complex
- How: Plans have own packs, but phase codes are universal
```

### The Decision: Hybrid Approach

**Why Hybrid?**
1. **Preserves Richmond's pack thinking** - Teams already work in packs
2. **Enables universal queries** - "Show all foundation codes" works across plans
3. **Supports Holt's activity model** - Hierarchical phase codes map to activities
4. **Allows customization** - Each plan can have specific variants
5. **Future-proofs for Manor Homes** - New builder adopts universal taxonomy

**Implementation:**
```sql
-- Plans table
CREATE TABLE plans (
    plan_id TEXT PRIMARY KEY,  -- '1670', 'G603', '2321'
    plan_name TEXT,
    builder_id TEXT
);

-- Universal phase/option taxonomy
CREATE TABLE phase_option_definitions (
    phase_code TEXT PRIMARY KEY,  -- '010.820', '012.040'
    phase_name TEXT,              -- 'Den Foundation', '2 Car Garage 4ft'
    material_class TEXT           -- '1000' (Framing)
);

-- Plan-specific Layer 1 codes
CREATE TABLE layer1_codes (
    code_id INTEGER PRIMARY KEY,
    plan_id TEXT,               -- Plan-specific
    phase_option_code TEXT,     -- Universal taxonomy
    material_class TEXT,        -- Universal taxonomy
    -- full_code = plan_id + phase_option_code + material_class
);
```

**Real Example:**
```
Plan 1670 + Phase 010.820 (Den Foundation) + Class 1000 (Framing)
= 1670-010.820-1000

Plan G603 + Phase 010.820 (Den Foundation) + Class 1000 (Framing)  
= G603-010.820-1000

Different codes, same phase taxonomy!
```

### Business Impact

**For Richmond Team:**
- ✅ Still think in "packs" (pack name = phase + class)
- ✅ Pack IDs preserved for traceability (|10.82 → 010.820)
- ✅ Can query "all den foundations" across plans

**For Holt Team:**
- ✅ Activities map to phase ranges (Activity 10 → 010-019)
- ✅ Hierarchical structure preserved
- ✅ Community variants fit in phase minor codes (.001, .002)

**For Future (Manor Homes):**
- ✅ Adopt universal phase codes immediately
- ✅ Don't need to learn Richmond/Holt specifics
- ✅ Cross-builder queries work from day 1

---

## Decision 2: Plan-Elevation Model

### The Problem: Richmond's Triple-Encoding

**Richmond stores elevation in THREE places:**
```
1. Pack name: "|10.82BCD OPT DEN FOUNDATION"
2. Location field: "- ELVB - ELVC - ELVD"
3. Elevation column: "B, C, D"

Result: Synchronization nightmare
- What if pack name says BCD but column says BC?
- How do you query "all elevation B packs"?
- Manual maintenance of three copies
```

### The Options Considered

**Option A: Elevation as Plan Variant**
```
Treat each elevation as a separate plan
- Plan variants: G603A, G603B, G603C, G603D
- Pro: Simple, each is distinct
- Con: Doesn't match business process (customer picks plan THEN elevation)
- Con: Can't query "all elevations of G603"
```

**Option B: Elevation as Dimension (CHOSEN)**
```
Elevation is an attribute of the plan
- Plan: G603
- Elevations: A, B, C, D (stored separately)
- Pro: Matches business process
- Pro: Solves triple-encoding (store once!)
- Pro: Easy queries ("show elevation B across all plans")
```

### The Decision: Elevation as Dimension

**Why Dimension?**
1. **Matches business reality** - Customer picks plan first, then elevation
2. **Solves triple-encoding** - Elevation stored ONCE in junction table
3. **Enables powerful queries** - "All elevation B materials" across plans
4. **Matches Holt model** - Holt already does this
5. **Supports multi-elevation packs** - BCD stored as 3 records, not string parsing

**Implementation:**
```sql
-- Plans table (no elevation)
CREATE TABLE plans (
    plan_id TEXT PRIMARY KEY,  -- 'G603', not 'G603B'
    plan_name TEXT
);

-- Elevations table
CREATE TABLE elevations (
    elevation_code TEXT PRIMARY KEY,  -- 'A', 'B', 'C', 'D'
    elevation_name TEXT               -- 'Elevation A'
);

-- Junction table: Which elevations apply to which codes?
CREATE TABLE layer1_code_elevations (
    code_id INTEGER,
    elevation_code TEXT,
    PRIMARY KEY (code_id, elevation_code)
);
```

**Example: BCD Pack Storage**
```
Richmond: |10.82BCD OPT DEN FOUNDATION

In unified system:
1. Create code: 1670-010.820-1000
2. Insert 3 junction records:
   - code_id=123, elevation_code='B'
   - code_id=123, elevation_code='C'  
   - code_id=123, elevation_code='D'

Query for elevation B:
SELECT l1.*
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE lce.elevation_code = 'B';

Result: Returns this code (among others)!
```

### Business Impact

**Problem Solved:**
- ❌ Old: Elevation in pack name, location, and column
- ✅ New: Elevation in junction table ONCE

**Query Power:**
```sql
-- Impossible in Richmond 3BAT:
"Show me all materials for Plan 1670, Elevation B"

-- Easy in unified system:
SELECT l1.full_code, l1.description
FROM layer1_codes l1
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
WHERE l1.plan_id = '1670' AND lce.elevation_code = 'B';
```

**Multi-Elevation Support:**
```sql
-- Find codes that work for BOTH B and C:
SELECT l1.full_code, l1.description
FROM layer1_codes l1
WHERE EXISTS (
    SELECT 1 FROM layer1_code_elevations 
    WHERE code_id = l1.code_id AND elevation_code = 'B'
)
AND EXISTS (
    SELECT 1 FROM layer1_code_elevations 
    WHERE code_id = l1.code_id AND elevation_code = 'C'
);
```

---

## Decision 3: Option Code Philosophy

### The Question
What internal code format should we standardize on for the unified system?

### The Background

**Richmond Uses Descriptive Alphanumeric:**
```
XGREAT     → Extended Great Room
2CAR5XA    → 2 Car Garage, 5ft extension, Elevation A
FPSING01   → Fireplace Single, Option 01
DEN        → Den option
```

**Holt Uses Hierarchical Numeric:**
```
167010100  → Plan 1670, Phase 01, Option 01, Elevation A
189020300  → Plan 1890, Phase 02, Option 03, Elevation C
Format: [PLAN 4][PHASE 2][OPTION 2][ELEVATION 2]
```

### The Options Considered

**Option A: Richmond-Style (Semantic)**
```
- Pro: Human-readable, self-documenting
- Pro: Richmond team already knows codes
- Con: Hard to systematize (running out of good names)
- Con: No hierarchy
- Example: XGREAT, 3CARA, DEN
```

**Option B: Holt-Style (Hierarchical)**
```
- Pro: Systematic, infinitely extensible
- Pro: Clear hierarchy
- Con: Not human-readable
- Con: Richmond team must relearn
- Example: 167010100, 232100200
```

**Option C: Universal (New System)**
```
- Pro: Clean slate, best practices
- Pro: Both teams learn together
- Con: Loses institutional knowledge
- Con: Translation layer for both systems
- Example: OPT-INT-001, OPT-GAR-002
```

**Option D: Hybrid with Phase Codes (CHOSEN)**
```
- Pro: Universal taxonomy (phase codes)
- Pro: Preserve Richmond pack IDs for traceability
- Pro: Preserve Holt codes for traceability
- Pro: Translation tables bridge old to new
- Con: Short-term translation complexity
- How: Phase codes ARE the option system
```

### The Decision: Hybrid with Universal Phase Codes

**Why Hybrid?**
1. **Phase codes are the universal system** - XXX.XXX format is the standard
2. **Richmond pack IDs preserved** - Translation table maps |10.82 → 010.820
3. **Holt codes preserved** - Translation table maps 167010100 → plan + phase + elevation
4. **Future is universal** - Manor Homes adopts phase codes directly
5. **No retraining needed** - Teams can use familiar codes, system translates

**Implementation:**
```sql
-- Universal phase/option definitions
CREATE TABLE phase_option_definitions (
    phase_code TEXT PRIMARY KEY,  -- THE universal system
    phase_name TEXT,
    material_class TEXT,
    shipping_order INTEGER
);

-- Richmond translation
CREATE TABLE richmond_option_translations (
    richmond_code TEXT PRIMARY KEY,  -- 'XGREAT', 'DEN'
    phase_option_code TEXT,          -- '010.600', '010.820'
    description TEXT
);

-- Holt translation  
CREATE TABLE holt_option_translations (
    holt_code TEXT PRIMARY KEY,      -- '167010100'
    plan_id TEXT,                     -- '1670'
    phase_option_code TEXT,           -- '010.100'
    elevation_code TEXT               -- 'A'
);
```

**Translation Examples:**

**Richmond XGREAT → Universal:**
```sql
-- XGREAT affects multiple phases
INSERT INTO richmond_option_translations VALUES
    ('XGREAT', '010.600', 'Extended Great Room Foundation'),
    ('XGREAT', '011.600', 'Extended Great Room Joist'),
    ('XGREAT', '020.600', 'Extended Great Room Framing'),
    ('XGREAT', '040.600', 'Extended Great Room Roof');

-- Query: Find all phases for XGREAT
SELECT phase_option_code, description
FROM richmond_option_translations
WHERE richmond_code = 'XGREAT';
```

**Holt 167010100 → Universal:**
```sql
-- Parse 9-digit code
INSERT INTO holt_option_translations VALUES
    ('167010100', '1670', '010.100', 'A');
    -- Plan 1670, Phase 01, Option 01, Elevation A

-- Query: Translate Holt code
SELECT plan_id, phase_option_code, elevation_code
FROM holt_option_translations
WHERE holt_code = '167010100';
```

### Phase Code Taxonomy (The Universal System)

```
XXX.XXX format
│   │
│   └─ Minor variant (.000-.999)
└───── Major phase (000-999)

Ranges:
000-019  Foundation & Site
020-039  Framing
040-049  Roofing & Gutters
050-069  Siding & Exterior
070-089  Interior
090-099  Special/Other

Examples:
010.000  Foundation (base)
010.820  Den foundation (option)
012.040  2 Car Garage 4ft extension
060.pw   Post wrap (mnemonic minor code!)

Benefits:
- Systematic (can add 010.821, 010.822, etc.)
- Hierarchical (010.xxx are all foundation)
- Sortable (shipping order implicit)
- Extensible (room for 999,000 codes!)
```

### Business Impact

**Short-Term (Weeks 1-12):**
- ✅ Richmond: Use familiar pack IDs, system translates
- ✅ Holt: Use familiar 9-digit codes, system translates
- ✅ Both: See unified phase codes in reports
- ⚙️ Translation tables maintained by admin

**Long-Term (Post-Merger):**
- ✅ Both teams learn phase codes naturally through usage
- ✅ Manor Homes adopts phase codes from day 1
- ✅ Legacy codes preserved in translation tables
- 🎯 Universal system enables cross-builder analytics

---

## Combined Impact: The Three Decisions Working Together

### Example: Richmond XGREAT Option

**In Richmond 3BAT:**
```
Code: XGREAT
Elevations: Stored in multiple places (triple-encoded)
Packs: XGRT, XGR1, XGR2 (fragmented)
Query: "Show me all XGREAT materials" → Complex
```

**In Unified System:**
```
Phase Codes: 010.600, 011.600, 020.600, 040.600
Elevations: Stored once in junction table
Packs: Unified under phase codes
Query: "Show me all extended great room materials"
```

```sql
SELECT 
    l1.full_code,
    l1.description,
    pod.phase_name,
    lce.elevation_code
FROM layer1_codes l1
JOIN layer1_code_richmond_options lcro ON l1.code_id = lcro.code_id
JOIN layer1_code_elevations lce ON l1.code_id = lce.code_id
JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
WHERE lcro.richmond_option_code = 'XGREAT'
  AND l1.plan_id = '1670'
ORDER BY pod.shipping_order, lce.elevation_code;

Results:
1670-010.600-1000  Extended Great Room Foundation    B,C,D
1670-011.600-1000  Extended Great Room Joist         B,C,D
1670-020.600-1000  Extended Great Room Framing       B,C,D
1670-040.600-1200  Extended Great Room Roof          B,C,D
```

### Example: Holt Community Variants

**In Holt BAT:**
```
Same plan in different communities = different items
Tracking: Community in sheet name
Query: "Show me all communities for Plan 1670" → Manual
```

**In Unified System:**
```
Community variants: Encoded in phase minor codes
Community tracking: plan_communities junction table  
Query: "Show me all communities for Plan 1670"
```

```sql
SELECT 
    pc.community_code,
    c.community_name,
    COUNT(DISTINCT l1.code_id) as code_count
FROM plan_communities pc
JOIN communities c ON pc.community_code = c.community_code
JOIN layer1_codes l1 ON pc.plan_id = l1.plan_id
WHERE pc.plan_id = '1670'
GROUP BY pc.community_code, c.community_name;

Results:
CR   Creek Ridge     47 codes
GG   Green Gables    47 codes  
HA   Heritage Acres  45 codes
```

---

## Validation of Decisions

### Decision Validation Checklist

**Decision 1: Plan-Pack (Hybrid)**
- ✅ Supports Richmond pack thinking
- ✅ Supports Holt activity model
- ✅ Enables universal queries
- ✅ Scales to Manor Homes
- ✅ Preserves institutional knowledge

**Decision 2: Elevation (Dimension)**
- ✅ Solves triple-encoding problem
- ✅ Matches business process
- ✅ Enables elevation queries
- ✅ Supports multi-elevation packs
- ✅ Works for both Richmond and Holt

**Decision 3: Option Codes (Hybrid/Phase)**
- ✅ Universal taxonomy (phase codes)
- ✅ Preserves Richmond pack IDs
- ✅ Preserves Holt codes
- ✅ No retraining required
- ✅ Scales infinitely

### Evidence Supporting Decisions

**From Richmond Analysis:**
- 55,604 material line items across 44 plans
- Triple-encoding problem confirmed (|10.82BCD example)
- Pack-centric thinking dominant
- 581 unique SKUs (manageable for translation)

**From Holt Analysis:**
- 9,373 material line items across 50 plans
- Clean single-encoding (no duplication)
- Hierarchical 9-digit codes work well
- 5 active communities need tracking

**From Business Requirements:**
- March 2026 merger deadline
- Both teams must remain productive
- Manor Homes integration planned
- Zero data loss requirement
- <5% error tolerance

---

## Next Steps

### For Implementation
1. Review complete decision documents:
   - DECISION_1_Plan_Pack_Relationship.md
   - DECISION_2_Plan_Elevation_Model.md
   - DECISION_3_Internal_Option_Codes.md

2. Study the schema that implements these decisions:
   - schema_design_v1.sql

3. Understand the coding standards:
   - 04_CODING_STANDARDS.md

### For Learning
1. Review architectural patterns:
   - bat_schema_patterns.md
   - architecture_decisions.md

2. Practice with examples:
   - SQL_PRACTICE_LAB.md
   - example_usage.py

3. Understand the migration:
   - CUSTOMER_IMPORT_GUIDE.md
   - BAT_IMPORTER skill

---

## Key Takeaways

**The unified system succeeds because:**

1. **Hybrid Plan-Pack** - Preserves team thinking while enabling universal queries
2. **Elevation as Dimension** - Solves triple-encoding, enables powerful queries
3. **Phase Codes as Standard** - Universal taxonomy with backward compatibility

**The decisions work together to:**
- ✅ Eliminate data duplication
- ✅ Enable cross-plan queries
- ✅ Preserve institutional knowledge
- ✅ Scale to new builders
- ✅ Support both legacy systems
- ✅ Require zero retraining

**The result:**
A future-proof, scalable system that respects the past while enabling the future.
