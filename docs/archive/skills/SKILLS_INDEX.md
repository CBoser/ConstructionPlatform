# Skills Index - Unified Coding System
**Complete reference guide to all available skills**  
**Last Updated:** November 15, 2025

---

## Quick Navigation

| Skill | Size | Purpose | When to Use |
|-------|------|---------|-------------|
| [Unified Coding System](#unified-coding-system) | 14 KB | Master reference | System overview, code structure |
| [BAT Data Importer](#bat-data-importer) | 17 KB | Import guide | Richmond/Holt data migration |
| [SQL Queries](#sql-queries) | 16 KB | Query patterns | Writing queries, data analysis |
| [Architecture Decisions](#architecture-decisions) | 17 KB | Design rationale | Understanding design choices |

---

## Skill Details

### Unified Coding System
**File:** `SKILL_UNIFIED_CODING_SYSTEM.md`  
**Size:** 14 KB  
**Trigger words:** unified system, two layer, phase codes, option codes, elevation junction, layer1, layer2, full_code, code structure

**What it covers:**
- Two-layer architecture (Layer 1 aggregate, Layer 2 detail)
- Code format: `PLAN_ID-PHASE_OPTION_CODE-MATERIAL_CLASS`
- Elevation junction table solution
- Phase/option code taxonomy (XXX.XXX)
- Material class codes (4-digit)
- Complete database schema (15 tables)
- 6 pre-built views
- Translation tables
- Common query patterns

**Use this skill when:**
- Learning the system for the first time
- Need to understand code structure
- Want to know how elevations work
- Need schema reference
- Looking for view definitions

**Key sections:**
1. System Overview (two-layer architecture)
2. Code Format (with examples)
3. Elevation Handling (junction table)
4. Phase/Option Taxonomy (XXX.XXX breakdown)
5. Database Schema (all 15 tables)
6. Key Views (6 pre-built views)
7. Translation Tables (Richmond & Holt)
8. Common Query Patterns
9. Implementation Best Practices
10. Migration Support

**Example question this answers:**
> "How does the unified coding system work? What's the format?"

**Links to:**
- `schema_design_v1.sql` - Complete schema
- `DATABASE_SKILLS_ROADMAP.md` - Learning path
- `DECISION_2_Plan_Elevation_Model.md` - Elevation design
- `SQL_PRACTICE_LAB.md` - Practice exercises

---

### BAT Data Importer
**File:** `SKILL_BAT_IMPORTER.md`  
**Size:** 17 KB  
**Trigger words:** import BAT, Richmond import, Holt import, data migration, parse pack name, translate codes, import wizard

**What it covers:**
- Richmond BAT file structure and parsing
- Holt BAT file structure and parsing
- Pack name parsing (|10.82BCD format)
- 9-digit Holt code parsing (167010100)
- Elevation extraction
- Item type mapping
- Layer 1 and Layer 2 workflows
- Translation table usage
- Community tracking (Holt)
- Validation queries
- Error handling

**Use this skill when:**
- Importing Richmond 3BAT data
- Importing Holt BAT data
- Need to parse pack names
- Need to translate codes
- Running validation after import
- Troubleshooting import errors

**Key sections:**
1. Quick Start (interactive wizard)
2. Richmond BAT Import (complete workflow)
3. Holt BAT Import (complete workflow)
4. Parsing Pack Names (Python code)
5. Parsing 9-Digit Codes (Python code)
6. Translation Tables (usage examples)
7. Validation After Import (4 key checks)
8. Error Handling (common errors)
9. Performance Tips (batch inserts, etc.)

**Example question this answers:**
> "How do I import Richmond materials from Excel? How do I parse |10.82BCD?"

**Links to:**
- `CUSTOMER_IMPORT_GUIDE.md` - Step-by-step wizard
- `interactive_menu.py` - Python import tool
- `bat_coding_system_builder.py` - Builder class
- `coding_schema_translation.csv` - Translation table

---

### SQL Queries
**File:** `SKILL_SQL_QUERIES.md`  
**Size:** 16 KB  
**Trigger words:** SQL query, database query, how do I find, get all codes, calculate total, join tables, write a query

**What it covers:**
- Quick reference to 6 views
- 50+ example queries
- Common query patterns (10 categories)
- Cost calculations and summaries
- Validation queries
- Translation queries
- Advanced patterns (CTEs, window functions)
- Reporting queries
- Performance tips
- Common mistakes

**Use this skill when:**
- Need to write a SQL query
- Want to find specific data
- Need to calculate totals
- Validating imported data
- Creating reports
- Optimizing slow queries

**Key sections:**
1. Quick Reference (6 key views)
2. Common Query Patterns:
   - Get codes for a plan
   - Get materials for a code
   - Find codes by elevation
   - Search across plans
   - Calculate totals
   - Find optional upgrades
   - Cost validation
   - Translation/mapping
   - Material analysis
   - Comparison queries
3. Advanced Patterns (CTEs, window functions)
4. Reporting Queries
5. Performance Tips

**Example question this answers:**
> "How do I get all codes for elevation B? How do I calculate total cost by material class?"

**Links to:**
- `SQL_PRACTICE_LAB.md` - Practice exercises
- `SQL_QUICK_REFERENCE.md` - SQL syntax
- `schema_design_v1.sql` - Schema with views
- `v_layer1_codes_complete` - Most useful view

---

### Architecture Decisions
**File:** `SKILL_ARCHITECTURE_DECISIONS.md`  
**Size:** 17 KB  
**Trigger words:** architecture, design decisions, why elevation, plan-pack model, option codes, hybrid approach, decision document

**What it covers:**
- Three foundational decisions
- Complete rationale for each
- Options considered and rejected
- Business impact analysis
- Implementation details
- Real-world examples
- Validation evidence
- How decisions work together

**Use this skill when:**
- Need to understand design rationale
- Want to know why elevation is a dimension
- Curious about hybrid approach
- Need to explain decisions to stakeholders
- Reviewing architecture trade-offs
- Making similar design decisions

**Key sections:**
1. Overview (three critical decisions)
2. Decision 1: Plan-Pack Relationship
   - The question
   - Options considered
   - Why hybrid?
   - Implementation
   - Business impact
3. Decision 2: Plan-Elevation Model
   - The problem (triple-encoding)
   - Options considered
   - Why dimension?
   - Implementation
   - Business impact
4. Decision 3: Option Code Philosophy
   - The question
   - Options considered
   - Why hybrid with phase codes?
   - Implementation
   - Business impact
5. Combined Impact (examples)
6. Validation of Decisions

**Example question this answers:**
> "Why is elevation stored in a junction table? Why not put it in the code string?"

**Links to:**
- `DECISION_1_Plan_Pack_Relationship.md` - Full decision doc
- `DECISION_2_Plan_Elevation_Model.md` - Full decision doc
- `DECISION_3_Internal_Option_Codes.md` - Full decision doc
- `architecture_decisions.md` - Framework
- `bat_schema_patterns.md` - Design patterns

---

## How to Choose the Right Skill

### I want to learn the system
→ Start with **Unified Coding System**

### I need to import data
→ Use **BAT Data Importer**

### I need to query data
→ Use **SQL Queries**

### I need to understand design choices
→ Use **Architecture Decisions**

---

## Common Questions → Which Skill?

| Question | Skill to Use |
|----------|--------------|
| What's the code format? | Unified Coding System |
| How do elevations work? | Unified Coding System |
| How do I import Richmond data? | BAT Data Importer |
| How do I import Holt data? | BAT Data Importer |
| How do I parse |10.82BCD? | BAT Data Importer |
| How do I write a query to find...? | SQL Queries |
| What views are available? | SQL Queries |
| How do I validate my import? | SQL Queries |
| Why is elevation a dimension? | Architecture Decisions |
| Why use hybrid plan-pack? | Architecture Decisions |
| What are phase codes? | Unified Coding System |
| How do translation tables work? | BAT Data Importer |

---

## Related Documentation

### Learning Path
1. **SKILL_UNIFIED_CODING_SYSTEM.md** - Understand the architecture
2. **DATABASE_SKILLS_ROADMAP.md** - Learning progression
3. **SQL_PRACTICE_LAB.md** - Hands-on practice
4. **SKILL_SQL_QUERIES.md** - Query patterns
5. **SKILL_ARCHITECTURE_DECISIONS.md** - Deep understanding

### Implementation Path
1. **SKILL_ARCHITECTURE_DECISIONS.md** - Understand design
2. **03_FOUNDATION_GUIDE.md** - Week-by-week plan
3. **SKILL_BAT_IMPORTER.md** - Import data
4. **SKILL_SQL_QUERIES.md** - Validate and query
5. **04_CODING_STANDARDS.md** - Follow standards

### Quick Reference Path
1. **SKILL_UNIFIED_CODING_SYSTEM.md** - System overview
2. **SKILL_SQL_QUERIES.md** - Query examples
3. **SQL_QUICK_REFERENCE.md** - SQL syntax
4. **QUICK_REFERENCE_CARD.md** - Quick lookup

---

## Skill Coverage Matrix

| Topic | Unified System | BAT Importer | SQL Queries | Architecture |
|-------|:--------------:|:------------:|:-----------:|:------------:|
| **Code Format** | ✅✅✅ | ✅ | ✅ | ✅ |
| **Two-Layer Architecture** | ✅✅✅ | ✅ | ✅ | ✅✅ |
| **Elevation Handling** | ✅✅✅ | ✅✅ | ✅✅ | ✅✅✅ |
| **Phase/Option Codes** | ✅✅✅ | ✅ | ✅ | ✅✅✅ |
| **Material Classes** | ✅✅ | ✅ | ✅ | - |
| **Database Schema** | ✅✅✅ | ✅ | ✅ | ✅ |
| **Views** | ✅✅ | - | ✅✅✅ | - |
| **Richmond Import** | ✅ | ✅✅✅ | ✅ | - |
| **Holt Import** | ✅ | ✅✅✅ | ✅ | - |
| **Translation Tables** | ✅✅ | ✅✅✅ | ✅✅ | ✅ |
| **Query Examples** | ✅ | ✅ | ✅✅✅ | ✅ |
| **Validation** | ✅ | ✅✅✅ | ✅✅✅ | - |
| **Design Rationale** | ✅ | - | - | ✅✅✅ |
| **Decision Context** | - | - | - | ✅✅✅ |
| **Python Code** | - | ✅✅✅ | - | - |
| **Performance Tips** | ✅ | ✅✅ | ✅✅✅ | - |

Legend:
- ✅✅✅ = Primary/Comprehensive coverage
- ✅✅ = Significant coverage
- ✅ = Mentioned/Referenced
- - = Not covered

---

## File Locations

All skills are available in `/mnt/user-data/outputs/`:

```bash
/mnt/user-data/outputs/
├── SKILL_UNIFIED_CODING_SYSTEM.md      (14 KB)
├── SKILL_BAT_IMPORTER.md               (17 KB)
├── SKILL_SQL_QUERIES.md                (16 KB)
├── SKILL_ARCHITECTURE_DECISIONS.md     (17 KB)
├── SKILLS_UPDATE_SUMMARY.md            (Summary doc)
└── SKILLS_INDEX.md                     (This file)
```

**Download links:**
- [SKILL_UNIFIED_CODING_SYSTEM.md](computer:///mnt/user-data/outputs/SKILL_UNIFIED_CODING_SYSTEM.md)
- [SKILL_BAT_IMPORTER.md](computer:///mnt/user-data/outputs/SKILL_BAT_IMPORTER.md)
- [SKILL_SQL_QUERIES.md](computer:///mnt/user-data/outputs/SKILL_SQL_QUERIES.md)
- [SKILL_ARCHITECTURE_DECISIONS.md](computer:///mnt/user-data/outputs/SKILL_ARCHITECTURE_DECISIONS.md)
- [SKILLS_UPDATE_SUMMARY.md](computer:///mnt/user-data/outputs/SKILLS_UPDATE_SUMMARY.md)

---

## Version History

**v1.0 - November 15, 2025**
- Initial creation of 4 comprehensive skills
- All skills aligned with actual schema design
- Corrected code format across all documentation
- Added 50+ SQL query examples
- Complete Richmond and Holt import workflows

---

## Feedback & Updates

Have questions about these skills or need additional coverage?

**Contact:** Project team  
**Location:** `/mnt/project/` for source files  
**Status:** Active and maintained
