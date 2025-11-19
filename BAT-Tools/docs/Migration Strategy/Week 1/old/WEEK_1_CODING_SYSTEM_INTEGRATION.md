# WEEK 1 ENHANCED: CODING SYSTEM + BAT AUDIT
**Foundation Week with Coding System Design**  
**November 11-15, 2025**

---

## 🎯 WHY THIS MATTERS

You're about to import 35 Richmond plans into your BAT system. **Before you do that**, you need to solve the coding system architecture. Otherwise you'll:
- ❌ Create tables that don't relate properly
- ❌ Triple-encode elevation data (like current 10.82BCD problem)
- ❌ Build technical debt into 43,952 material line items
- ❌ Make the Holt-Richmond integration exponentially harder

**The good news:** Week 1 is EXACTLY when this needs to happen. Your Monday audits will give you the data you need to design the right system.

---

## 📊 INTEGRATED WEEK 1 PLAN (18 hours total)

### Original Week 1: 14 hours
- Item numbering audit: 4 hours
- Richmond structure audit: 2 hours  
- Draft coding standards: 4 hours
- Team review: 2 hours
- Finalize: 2 hours

### Enhanced Week 1: 18 hours (+4 hours)
- Item numbering audit: 4 hours (same)
- Richmond structure audit: 2 hours (same)
- **NEW: Coding system design: 6 hours** ⭐
- Draft coding standards: 2 hours (reduced, informed by design)
- Team review: 2 hours (same)
- Finalize: 2 hours (same)

**Why +4 hours:** The coding system design work front-loads complexity but **saves weeks** during plan imports.

---

## 🗓️ DAY-BY-DAY BREAKDOWN

### Monday (4 hours): Foundational Audits
**Same as Master Plan - No changes needed**

**Morning (2 hours): Item Numbering Audit**
```
Richmond "Item Pricing" sheet:
├─ Document prefixes (letters before numbers)
├─ Number ranges (1000-1999, 2000-2999, etc.)
├─ Suffixes (letters after numbers)
├─ Category patterns
└─ Special characters

Holt IWP and RL sheets:
├─ Document prefixes
├─ Number ranges
├─ Category organization
├─ Elevation encoding (if any)
└─ Community patterns

Output: item_numbering_patterns.txt
```

**Afternoon (2 hours): Richmond Structure Audit**
```
Richmond 3BAT:
├─ Pricing sheet structure
├─ Column mappings
├─ Price levels (L1-L5?)
├─ Formula patterns
├─ Plan sheet organization ⭐ NEW FOCUS
│  ├─ How are plan sheets named?
│  ├─ How are elevations encoded?
│  ├─ How do tables relate?
│  └─ How do options link to plans?
└─ Table naming (if any)

Output: richmond_structure.txt
```

**Monday Evening Homework (Optional):**
Read your two coding system analysis documents:
- construction_portal_coding_systems_analysis.md (30 min)
- mindflow_code_system_technical_review.md (30 min)

These will prepare you for Tuesday's coding system design session.

---

### Tuesday (6 hours): Coding System Architecture Design ⭐ NEW

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
1. Pick pack 12.x5 (garage extension)
2. Look at Richmond data: Does 2CAR5XA appear on multiple plans?
3. When it does, are the material quantities the same or different?
4. If same → Universal Pack (A)
5. If different → Plan-Specific Pack (B)

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
```

**Decision 2: Plan-Elevation Model (30 min)**

Look at your actual data:
```
Richmond names:
- G603
- G603B  
- LE93 G603B
- LE94 G603A

Holt names:
- 1670ABCD CR
- 1649ABC GG
- 1547 (153e)
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
```

**How to decide:**
1. Look at Holt Plan Index - does it list plan + elevation separately?
2. Look at Richmond - does LE93 mean something about 603 vs. just being a code?
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

Evidence from Richmond:
[How do LE codes work?]

Customer perspective:
[How do they actually select?]

Implications:
- plan_id field: [includes elevation OR separate elevation column]
- Queries: [simpler OR need join]
```

**Decision 3: Internal Option Code Philosophy (60 min)**

This is about YOUR internal codes (not Richmond's or Holt's).

**Current MindFlow approach:**
- Preserve Richmond codes: 2CAR5XA, FPSING01, XGREAT
- Use pack IDs: 10.82, 12.x5, 10.60x

**The question:** What's your internal "option code" that maps to external systems?

**Option A: Use Pack ID as Internal Code**
```
Internal code = pack_id

12.x5 → maps to → Richmond: 2CAR5XA, Holt: 167010205
10.82 → maps to → Richmond: DENOPT, Holt: 167020xxx

Pro: Single namespace, clean
Con: Pack IDs are sequential, not semantic
```

**Option B: Create Semantic Internal Codes**
```
Internal code = semantic abbreviation

GAREXT5 → maps to → Richmond: 2CAR5XA, Holt: 167010205  
DENOPT → maps to → Richmond: DENOPT, Holt: 167020xxx
FPSNG01 → maps to → Richmond: FPSING01, Holt: 167030xxx

Pro: Human-readable, self-documenting
Con: Need naming rules, risk of collisions
```

**Option C: Hierarchical Codes (Pack + Variant)**
```
Internal code = pack_id + variant suffix

12.x5-01 → Richmond 2CAR5XA, Holt 167010205
12.x5-02 → Richmond 2CAR5XB, Holt 167010305
10.82-A → Richmond DENOPT, Holt 167020xxx

Pro: Systematic, extensible
Con: Less semantic, looks like noise
```

**How to decide:**
1. Which will you remember in 6 months?
2. Which will the team understand?
3. Which makes queries clearer?
4. Which reduces translation errors?

**Document your decision:**
```
DECISION 3: INTERNAL OPTION CODE PHILOSOPHY
Choice: [ ] A - Pack ID  [ ] B - Semantic  [ ] C - Hierarchical

Reasoning:
[Explain your preference]

Example mappings:
Internal: _____ → Richmond: 2CAR5XA → Holt: 167010205
Internal: _____ → Richmond: FPSING01 → Holt: 167030xxx

Naming rules:
[If semantic, what are the rules?]
- Abbreviation max length?
- Capitalization?
- Special characters allowed?

Implications:
- Readability: [high/medium/low]
- Collision risk: [high/medium/low]
- Training needed: [high/medium/low]
```

#### Session 3: Schema Design (2 hours)

**Goal:** Create the actual database structure based on your three decisions.

**Activity 1: Core Tables (1 hour)**

Based on your decisions, design 4 core tables:

**1. Plans Table**
```sql
-- Design this based on Decision 2

-- If Elevation as Variant (A):
CREATE TABLE plans (
    plan_id VARCHAR(20) PRIMARY KEY,  -- "G603B"
    plan_series VARCHAR(10),           -- "G603"
    elevation VARCHAR(2),              -- "B"
    description TEXT,
    square_feet INTEGER,
    date_created DATE
);

-- If Elevation as Dimension (B):
CREATE TABLE plans (
    plan_id VARCHAR(20),               -- "G603"
    elevation VARCHAR(2),              -- "B"
    description TEXT,
    square_feet INTEGER,
    date_created DATE,
    PRIMARY KEY (plan_id, elevation)
);

-- Choose one and document why
```

**2. Packs Table**
```sql
-- Design this based on Decision 1

-- If Universal Pack (A):
CREATE TABLE packs (
    pack_id VARCHAR(20) PRIMARY KEY,   -- "12.x5"
    description TEXT,
    shipping_order INTEGER,
    applies_to_elevations VARCHAR(20)  -- "ALL" or "B,C,D"
);

-- If Plan-Specific Pack (B):
CREATE TABLE packs (
    plan_id VARCHAR(20),               -- "G603"
    pack_id VARCHAR(20),               -- "12.x5"
    description TEXT,
    shipping_order INTEGER,
    applies_to_elevations VARCHAR(20),
    PRIMARY KEY (plan_id, pack_id),
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
);

-- Choose one and document why
```

**3. Options Table (Translation Layer)**
```sql
-- This maps your internal codes to external systems
-- Design based on Decision 3

CREATE TABLE option_codes (
    internal_code VARCHAR(20) PRIMARY KEY,  -- Your chosen format
    pack_id VARCHAR(20),                     
    elevation VARCHAR(2),                    -- If elevation-specific
    
    -- External system codes
    richmond_code VARCHAR(20),               -- "2CAR5XA"
    holt_code VARCHAR(20),                   -- "167010205"
    
    description TEXT,
    
    -- Relationships
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id)
);

-- Example rows based on Decision 3:
-- If using Pack ID (A):
--   internal_code="12.x5", richmond_code="2CAR5XA"
--   
-- If using Semantic (B):
--   internal_code="GAREXT5", richmond_code="2CAR5XA"
--
-- If using Hierarchical (C):
--   internal_code="12.x5-01", richmond_code="2CAR5XA"
```

**4. Materials Table (Line Items)**
```sql
-- This is where 43,952 Richmond materials will go

CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- What is this material for?
    pack_id VARCHAR(20),                  -- Which pack
    plan_id VARCHAR(20),                  -- Which plan (if plan-specific)
    elevation VARCHAR(2),                 -- Which elevation variant
    
    -- Material details
    item_number VARCHAR(20),              -- BFS SKU
    description TEXT,
    quantity DECIMAL(10,2),
    unit VARCHAR(10),
    phase VARCHAR(50),                    -- "10 FOUNDATION", "11 JOIST"
    location TEXT,                        -- "|10 FOUNDATION - ELVA - ELVB"
    
    -- External references
    richmond_sku VARCHAR(20),
    holt_item VARCHAR(20),
    
    -- Relationships
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    FOREIGN KEY (plan_id, elevation) REFERENCES plans(plan_id, elevation)
);

-- Adjust based on your Decision 1 and 2
```

**Activity 2: Solve the Triple-Encoding Problem (30 min)**

Remember your current issue:
```
Row: 10.82BCD OPT DEN FOUNDATION
Elevation column: "B, C, D"  
Option codes: ELVB, ELVC, ELVD

This is triple-encoded! ❌
```

**Refactor to:**
```sql
-- Packs table: Pack DEFINITION
pack_id | description            | applies_to_elevations
10.82   | OPT DEN FOUNDATION     | B,C,D

-- OR better, junction table:
pack_id | elevation | is_available
10.82   | A         | FALSE
10.82   | B         | TRUE
10.82   | C         | TRUE  
10.82   | D         | TRUE

-- Options table: TRANSLATION
pack_id | elevation | richmond_code | holt_code
10.82   | B         | DENOPTB       | 167020200
10.82   | C         | DENOPTC       | 167020300
10.82   | D         | DENOPTD       | 167020400

-- Job line items: SELECTION
job_id | pack_id | elevation_selected
J1001  | 10.82   | B

Now elevation is:
✓ Once in pack definition (availability)
✓ Once in translation (external codes)  
✓ Once in job selection (customer choice)

Single source of truth for each concern! ✓
```

**Document your approach:**
```
TRIPLE-ENCODING SOLUTION:

Current problem:
[Copy example from your data]

New structure:
[Show your table design]

How this fixes it:
[Explain single source of truth]

Example query:
[Show SQL that gets materials for pack 10.82, elevation B]
```

**Activity 3: Import Mapping (30 min)**

Design how Richmond material data maps to your new structure:

**Richmond Material Database structure:**
```
Column A: Plan Number (G603, G914, etc.)
Column B: Location/Phase (|10 FOUNDATION - ELVA - ELVB)
Column C: Description
Column G: SKU
Column H: QTY
```

**Your materials table:**
```sql
material_id | pack_id | plan_id | elevation | item_number | quantity | phase    | location
1           | 10.x    | G603    | A         | BFS12345    | 10       | 10 FOUND | 10 FOUND-ELVA
```

**Mapping logic to document:**
```
RICHMOND IMPORT MAPPING:

1. Plan extraction:
   Richmond Column A "G603" → plan_id = "G603"
   [Based on Decision 2: extract elevation if needed]

2. Phase extraction:
   Richmond Column B "|10 FOUNDATION - ELVA - ELVB"
   → phase = "10 FOUNDATION"
   → elevation indicators: ELVA, ELVB
   [How to parse this?]

3. Pack assignment:
   Richmond phase "10 FOUNDATION" → Which pack_id?
   [Need pack mapping rules]

4. Elevation assignment:
   Richmond "ELVA" → elevation = "A"
   Richmond "ELVB" → elevation = "B"
   [Consistent parsing rules]

5. Quantity handling:
   Richmond Column H → quantity field
   [Any transformations needed?]

Rules to define:
- [How to determine pack from phase?]
- [How to parse elevation from location?]
- [What if elevation indicators conflict?]
```

**Outputs from Tuesday:**
```
✓ richmond_hierarchy_map.txt (how Richmond structures data)
✓ holt_hierarchy_map.txt (how Holt structures data)  
✓ DECISION_1_Plan_Pack_Relationship.md
✓ DECISION_2_Plan_Elevation_Model.md
✓ DECISION_3_Internal_Option_Codes.md
✓ schema_design_v1.sql (your core tables)
✓ import_mapping_rules.md (Richmond → your schema)
```

---

### Wednesday (2 hours): Coding Standards Draft

**This is now MUCH easier because you made the architecture decisions!**

**Activity: Write BAT_Coding_Standards.docx (2 hours)**

**Section 1: Plan Coding (30 min)**
```
Based on Decision 2:

Plan Format: [G603 vs G603B - based on your decision]
Elevation Format: [Separate column vs. embedded]
Examples: [From your actual data]
Rules: [When to create new plan vs. elevation variant]
```

**Section 2: Pack Coding (30 min)**
```
Based on existing MindFlow pack structure:

Pack Format: Major.Minor[suffix]
Examples:
  10.82   - Den foundation (base)
  10.82b  - Den w/bath foundation  
  12.x5   - 2-car garage 5' extension

Rules:
  - Major number = construction phase (09=basement, 10=foundation, etc.)
  - Minor number = variant within phase
  - Suffix = modifier (b=bath, x=extension, tc=tallcrawl)
  - Elevation restrictions stored separately (not in pack_id)
```

**Section 3: Internal Option Codes (30 min)**
```
Based on Decision 3:

Format: [Your chosen format from Decision 3]
Examples: [Your mappings]
Rules: [Your naming conventions]

Translation mapping:
Internal → Richmond → Holt
[Show examples from your option_codes table]
```

**Section 4: Material Item Numbering (30 min)**
```
Based on Monday's audit:

Richmond format: [From item_numbering_patterns.txt]
Holt format: [From item_numbering_patterns.txt]
Your format: [SKU passthrough OR new internal codes?]

Rules:
- [When to use Richmond SKU directly]
- [When to use Holt SKU directly]
- [How to handle conflicts]
```

**Output: BAT_Coding_Standards.docx (draft for team review)**

---

### Thursday (2 hours): Team Review

**Morning (1 hour): Present to William (Richmond expertise)**
```
Show him:
1. Your Plan-Pack decision → Does this match Richmond reality?
2. Your Plan-Elevation decision → Does this match customer workflow?
3. Example pack mappings → Can he validate these?

Questions to ask:
- "When pack X applies to multiple plans, is it the same materials?"
- "How do customers select? Plan then elevation, or combined?"
- "What Richmond codes should we preserve vs. create new?"
```

**Afternoon (1 hour): Review in depth**
```
Show her:
1. Your Holt hierarchy map → Does this match the overall understanding?
2. Community relationship → How do communities tie to packs?
3. Elevation encoding → 01/02/03/04 vs. A/B/C/D consistency?

Questions to ask:
- "When we say 1670ABCD, does that mean one thing or four options?"
- "How do you currently find materials for a specific plan+elevation?"
- "What would make this easier for you to use daily?"
```

**Capture feedback → Update decisions if needed**

---

### Friday (2 hours): Finalize

**Morning (1 hour): Incorporate Feedback**
```
1. Update your three decision documents
2. Revise schema if needed  
3. Update coding standards document
4. Create reference sheets for both BATs
```

**Afternoon (1 hour): Week 1 Checkpoint**
```
✓ Item numbering patterns documented
✓ Richmond structure mapped
✓ Holt structure mapped
✓ Three architecture decisions made
✓ Database schema designed
✓ Coding standards documented
✓ Team validated approach
✓ Reference sheets created

Ready for Week 2: Building tools on this foundation
```

---

## 📦 DELIVERABLES FROM ENHANCED WEEK 1

### Original Deliverables (Still Included)
```
✓ item_numbering_patterns.txt
✓ richmond_structure.txt  
✓ BAT_Coding_Standards.docx
✓ Reference sheets in both BATs
```

### New Coding System Deliverables
```
✓ richmond_hierarchy_map.txt
✓ holt_hierarchy_map.txt
✓ DECISION_1_Plan_Pack_Relationship.md
✓ DECISION_2_Plan_Elevation_Model.md
✓ DECISION_3_Internal_Option_Codes.md
✓ schema_design_v1.sql
✓ import_mapping_rules.md
✓ Triple_Encoding_Solution.md
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
```

### With Coding System Design (Week 1)
```
Week 1: Design system properly (4 extra hours)
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
```

**The 4 extra hours in Week 1 saves 4-6 weeks of rework.**

---

## 🚨 CRITICAL SUCCESS FACTORS

### Decision Quality
Your three architecture decisions will affect:
- Every table you create
- Every import script you write
- Every query you run
- Every feature you build

**Take the time to get these right.** Involve team.

### Documentation
Every decision should include:
- The choice you made
- Why you made it
- Evidence supporting it
- Implications for implementation

**Future you (in Week 8) will thank present you.**

### Validation
Test your decisions with real data:
- Pick 3 actual packs from your current system
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

**Choose Plan-Specific Pack (B) if:**
- Materials change based on which plan
- Each plan needs custom takeoffs
- You need plan-level tracking

**When in doubt:** Check actual data. Look at Richmond materials for same option on different plans.

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

**When in doubt:** Ask William: "When customer calls, do they say 'I want plan G603B' or 'I want plan G603, elevation B'?"

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

**When in doubt:** Show examples to William. Which would they prefer to work with daily?

---

## 🔗 HOW THIS INTEGRATES WITH MASTER PLAN

### Master Plan Week 1 → Enhanced Week 1
```
Original:
├─ Item numbering audit (4h)
├─ Richmond structure audit (2h)
├─ Draft coding standards (4h)
├─ Team review (2h)
└─ Finalize (2h)
Total: 14 hours

Enhanced:
├─ Item numbering audit (4h) - SAME
├─ Richmond structure audit (2h) - SAME  
├─ Coding system design (6h) - NEW ⭐
├─ Draft coding standards (2h) - REDUCED (informed by design)
├─ Team review (2h) - SAME
└─ Finalize (2h) - SAME
Total: 18 hours (+4 hours investment)
```

### Impact on Later Weeks

**Week 2: Pricing Tools**
- Richmond updater column mappings → Clear from schema
- Price level structure → Documented in standards
- Table relationships → Already designed

**Weeks 5-8: Plan Imports**
- Import script knows target schema → Write once, run 44 times
- Table creation standardized → Consistent structure
- Validation rules clear → Catch errors immediately

**Weeks 9-12: Infrastructure**
- Database migration path → Schema already designed
- Query optimization → Clean relationships
- Testing → Known structure to validate

---

## ✅ WEEK 1 SUCCESS CHECKLIST

### Monday Completion
```
[ ] item_numbering_patterns.txt created
[ ] richmond_structure.txt created
[ ] Understand current encoding in both systems
[ ] Know what questions need answers
```

### Tuesday Completion
```
[ ] Decision 1 made and documented
[ ] Decision 2 made and documented
[ ] Decision 3 made and documented
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
- ✅ Getting the foundation right
- ✅ Avoiding rework later
- ✅ Creating a system that scales
- ✅ Preserving institutional knowledge
- ✅ Making your team independent

**4 extra hours in Week 1 = 4-6 weeks saved overall**

**Plus:** You'll have a system you're proud of, that works consistently, and that others can understand and maintain.

---

## 📞 QUESTIONS TO RESOLVE THIS WEEK

Bring these to team Thursday's review:

**For William (Richmond):**
1. When option "2CAR5XA" appears on Plan G603 and Plan G914, are the materials identical?
2. How do customers currently select options? Plan+elevation together or separate?
3. Which Richmond codes should we preserve as-is vs. translate?

**For Holt:**
1. When we see "1670ABCD CR", does that represent one option or four elevation variants?
2. How do communities (GG, CR, WR) relate to packs? Pack-specific or just filtering?
3. In your daily work, how do you currently look up materials for a specific build?

**For Both:**
1. Show schema examples - does this structure make sense for your workflow?
2. Show option code examples - which format would you prefer to work with?
3. What would make this system easier to use than current BATs?

---

## 🚀 LET'S GET STARTED

**Monday morning:**
1. Open Master Plan → Week 1 → Monday section
2. Also open this document → Monday section
3. Do BOTH audits as planned
4. The item numbering audit is unchanged
5. The Richmond structure audit now includes plan/elevation/option relationships

**Tuesday is your coding system design day:**
- Block the full 6 hours
- This is deep thinking work
- Use your coding system analysis documents
- Make the three critical decisions
- Design your schema

**By Friday you'll have:**
- ✅ A system architecture you're confident in
- ✅ Database structure ready to implement
- ✅ Team validation and buy-in
- ✅ Clear coding standards
- ✅ Foundation for 35 plan imports

**Start Monday! 🎯**

---

**Document Version:** 1.0  
**Created:** November 9, 2025  
**Integrates With:** BAT_MASTER_PLAN_INTEGRATED.md  
**Purpose:** Enhance Week 1 with coding system architecture design  
**Investment:** +4 hours  
**Return:** Saves 4-6 weeks, cleaner system, team clarity
