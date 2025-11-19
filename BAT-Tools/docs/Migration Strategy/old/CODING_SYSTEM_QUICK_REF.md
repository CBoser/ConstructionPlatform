# CODING SYSTEM - QUICK REFERENCE
**3 Decisions + 1 Schema = Foundation for Success**

---

## 🎯 YOUR CHALLENGE

Before importing 35 Richmond plans with 43,952 materials, you need to solve:

❌ **Triple-encoding** (elevation in pack_id, column, AND option code)  
❌ **Unclear relationships** (how plans relate to packs)  
❌ **No standard** (what's YOUR internal code format?)

---

## ✅ THE SOLUTION: TUESDAY'S 3 DECISIONS

### Decision 1: Plan-Pack Relationship (30 min)

**Question:** Can pack "12.x5" work on multiple plans with same materials?

**Option A - Universal Pack:**
- ✓ Same pack, same materials, any plan
- ✓ Simple schema: `pack_id` alone
- ✓ Example: "2-car garage" works on any plan that fits

**Option B - Plan-Specific Pack:**
- ✓ Each plan has its own version
- ✓ Complex schema: `(plan_id, pack_id)` composite key
- ✓ Example: "2-car garage on G603" ≠ "2-car garage on G914"

**How to decide:** Look at Richmond data. Same option on 2 plans = same quantities?

---

### Decision 2: Plan-Elevation Model (30 min)

**Question:** Is "G603B" one thing or two dimensions?

**Option A - Elevation as Variant:**
- ✓ G603B is THE plan (one identity)
- ✓ Schema: `plan_id = "G603B"` (single field)
- ✓ Customer says: "I want G603B"

**Option B - Elevation as Dimension:**
- ✓ G603 = plan, B = elevation (separable)
- ✓ Schema: `plan_id = "G603", elevation = "B"` (two fields)
- ✓ Customer says: "I want G603, elevation B"

**How to decide:** Ask William/Alicia - how do customers actually select?

---

### Decision 3: Internal Option Codes (60 min)

**Question:** What's YOUR internal standard that maps to external systems?

**Option A - Use Pack ID:**
```
Internal: 12.x5
→ Richmond: 2CAR5XA
→ Holt: 167010205
```

**Option B - Semantic Codes:**
```
Internal: GAREXT5 (garage extension 5')
→ Richmond: 2CAR5XA
→ Holt: 167010205
```

**Option C - Hierarchical:**
```
Internal: 12.x5-01 (pack + variant)
→ Richmond: 2CAR5XA
→ Holt: 167010205
```

**How to decide:** Which will team remember? Which reduces errors?

---

## 📋 TUESDAY'S SCHEDULE

### Morning (2 hours): Map Current State
```
9-10am:  Richmond hierarchy (plans/elevations/options)
10-11am: Holt hierarchy (plans/elevations/packs)

Output:
- richmond_hierarchy_map.txt
- holt_hierarchy_map.txt
```

### Afternoon (2 hours): Make Decisions
```
1-1:30pm:  Decision 1 (Plan-Pack)
1:30-2pm:  Decision 2 (Plan-Elevation)
2-3pm:     Decision 3 (Option Codes)

Output:
- DECISION_1_Plan_Pack_Relationship.md
- DECISION_2_Plan_Elevation_Model.md
- DECISION_3_Internal_Option_Codes.md
```

### Evening (2 hours): Design Schema
```
4-5pm:  Core tables design
5-6pm:  Triple-encoding solution

Output:
- schema_design_v1.sql
- import_mapping_rules.md
```

---

## 🗂️ THE SCHEMA YOU'LL CREATE

### 4 Core Tables

**1. Plans Table** (based on Decision 2)
```sql
-- If Elevation as Variant:
plan_id VARCHAR(20) PRIMARY KEY  -- "G603B"

-- If Elevation as Dimension:
plan_id VARCHAR(20),              -- "G603"
elevation VARCHAR(2),             -- "B"
PRIMARY KEY (plan_id, elevation)
```

**2. Packs Table** (based on Decision 1)
```sql
-- If Universal Pack:
pack_id VARCHAR(20) PRIMARY KEY  -- "12.x5"

-- If Plan-Specific:
plan_id VARCHAR(20),              -- "G603"
pack_id VARCHAR(20),              -- "12.x5"
PRIMARY KEY (plan_id, pack_id)
```

**3. Option Codes Table** (Translation Layer)
```sql
internal_code VARCHAR(20),        -- Your format (Decision 3)
pack_id VARCHAR(20),
elevation VARCHAR(2),
richmond_code VARCHAR(20),        -- "2CAR5XA"
holt_code VARCHAR(20)             -- "167010205"
```

**4. Materials Table** (43,952 rows)
```sql
material_id INTEGER,
pack_id VARCHAR(20),
plan_id VARCHAR(20),              -- If plan-specific
elevation VARCHAR(2),
item_number VARCHAR(20),          -- BFS SKU
quantity DECIMAL(10,2),
phase VARCHAR(50)                 -- "10 FOUNDATION"
```

---

## 🔧 TRIPLE-ENCODING SOLUTION

### Before (❌ Problem)
```
Pack: 10.82BCD
Elevation column: "B, C, D"
Option codes: ELVB, ELVC, ELVD

Elevation in 3 places! Which is truth?
```

### After (✅ Solution)
```sql
-- 1. Pack DEFINITION
packs: pack_id="10.82"

-- 2. Pack AVAILABILITY
pack_elevation: pack_id="10.82", elevation="B", available=TRUE

-- 3. CODE TRANSLATION
option_codes: pack_id="10.82", elevation="B", richmond="DENOPTB"

-- 4. CUSTOMER SELECTION
job_items: pack_id="10.82", elevation_selected="B"

Each concern = ONE source of truth ✓
```

---

## ⏱️ TIME INVESTMENT

**Tuesday Coding System Design: 6 hours**
- Morning mapping: 2 hours
- Afternoon decisions: 2 hours
- Evening schema: 2 hours

**Week 1 Total Enhancement: +4 hours**
- Original plan: 14 hours
- Enhanced plan: 18 hours
- Additional: 4 hours

**Return on Investment: 40-60x**
- Saves: 4-6 weeks of rework (160-240 hours)
- Prevents: Import chaos, data inconsistency
- Enables: Clean system, team clarity, scalability

---

## ✅ SUCCESS CHECKLIST

### Tuesday Morning Done When:
```
[ ] Richmond hierarchy mapped and documented
[ ] Holt hierarchy mapped and documented
[ ] Understand how each system structures data
[ ] Ready to make informed decisions
```

### Tuesday Afternoon Done When:
```
[ ] Decision 1 made with concrete examples
[ ] Decision 2 made with team input
[ ] Decision 3 made with sample mappings
[ ] All documented with reasoning
```

### Tuesday Evening Done When:
```
[ ] 4 core tables designed (SQL)
[ ] Triple-encoding problem solved
[ ] Import mapping rules defined
[ ] Ready for Wednesday coding standards
```

---

## 🚨 CRITICAL REMINDERS

**Don't guess on decisions:**
- Use actual data from BAT files
- Get William/Alicia input
- Test with real examples
- Document reasoning

**Don't skip documentation:**
- Future you needs to know WHY
- Team needs to understand logic
- Manor Homes will follow same pattern
- Decisions have long-term impact

**Don't rush:**
- 6 hours is the right investment
- Quality over speed
- These decisions affect 43,952+ items
- Getting it right saves weeks

---

## 📚 FULL DOCUMENTATION

**For Tuesday deep dive:**
→ WEEK_1_CODING_SYSTEM_INTEGRATION.md (detailed guide)

**For overall context:**
→ BAT_MASTER_PLAN_INTEGRATED.md (12-week plan)

**For background:**
→ construction_portal_coding_systems_analysis.md (analysis)
→ mindflow_code_system_technical_review.md (current state)

---

## 🎯 BOTTOM LINE

**Tuesday = Foundation Day**

6 hours to:
- Make 3 architecture decisions
- Design clean schema
- Solve triple-encoding
- Enable 35 plan imports

**Investment:** 6 hours
**Return:** Weeks of saved work
**Result:** System you're proud of

**Block Tuesday now. This is your most important day. 🚀**
