# BAT Migration Action Plan

**Status:** ✅ Tools Installed & Ready
**Database:** ✅ Created (empty, ready for import)
**Dependencies:** ✅ Pandas & openpyxl installed
**Date:** 2025-11-15

---

## TL;DR - What's Next?

**I Can Automate Here:**
1. ✅ Install dependencies (DONE)
2. ✅ Create automated import scripts
3. ✅ Process Excel files into database
4. ✅ Generate validation reports
5. ✅ Integrate with framework tools

**You Need to Validate:**
1. ⚠️ Business logic (pack names map correctly)
2. ⚠️ Data quality (elevations parsed correctly)
3. ⚠️ Pricing accuracy (unit prices and totals)
4. ⚠️ Completeness (all materials captured)

---

## Current State

### ✅ What You Have

**Location:** `docs/Migration Strategy/bat_coding_system_builder/`

**Import Tools:**
- `interactive_menu.py` - Guided wizard for manual import
- `bat_coding_system_builder.py` - Core import engine
- `example_usage.py` - Working code examples
- `customer_code_mapping.py` - Code translation logic

**Database:**
- `bat_unified.db` - SQLite database (empty, ready)
- 8 tables with full schema
- Indexes and foreign keys configured

**Translation Tables:**
- `coding_schema_translation.csv` - 313 Richmond → Unified mappings
- Complete documentation in README.md

**Excel Files:**
Located in: `docs/Migration Strategy/Migration Files/`
- `NEW HOLT BAT 10-28-25 Updated 11-05-25.xlsx` - Holt materials
- `RAH_MaterialDatabase.xlsx` - Richmond materials
- `indexMaterialListbyPlanHolt20251114.xlsx` - Holt index
- Various other supporting files

### 📊 Database Status

```
Total Materials:    0 (empty - ready for import)
Total Plans:        0
Total Phases:       0 (will load from translation table)
Total Item Types:   0 (will load from translation table)
```

---

## Migration Options

### Option 1: Automated Migration (Recommended)

**I can create a script that:**
1. Loads all Richmond Excel files
2. Parses pack names using smart detection
3. Translates to unified codes
4. Imports into database
5. Generates validation report
6. Shows what needs your review

**Time:** ~30-60 minutes to write script + 5-10 minutes to run
**Your Involvement:** Review validation report, fix any parsing issues

### Option 2: Interactive Manual Import

**You use the wizard:**
1. Run: `python interactive_menu.py`
2. Select option 13: "Import Customer Database"
3. Follow prompts to import each file
4. Review and confirm each material

**Time:** 2-4 hours of manual work
**Your Involvement:** Full control, review each entry

### Option 3: Hybrid Approach (Best Balance)

**Combined automated + manual:**
1. I create automated script for bulk import
2. Script flags uncertain translations
3. You review only the flagged items
4. I integrate validated data into main database

**Time:** 1-2 hours total
**Your Involvement:** Review ~10-20% of materials (the tricky ones)

---

## Recommended: Automated Migration Script

Let me create `auto_import_bat.py` that will:

### Phase 1: Richmond Import

```python
# Pseudocode of what it will do:

1. Load Richmond Excel file
   - Read all material sheets
   - Parse pack names (e.g., "|10.82BCD OPT DEN FOUNDATION")

2. Smart Translation
   - Extract phase: 10.82 → 010.820
   - Extract elevations: BCD → BCD
   - Detect item type from description
   - Translate to unified code: 1670-010.820-BCD-1000

3. Validation
   - Check for triple-encoding conflicts
   - Verify all elevations parsed
   - Flag unknown pack names
   - Report data quality issues

4. Import to Database
   - Add materials with full codes
   - Preserve Richmond pack IDs for traceability
   - Track which records need review

5. Generate Report
   - Success count: X materials imported
   - Warnings: Y materials need review
   - Errors: Z materials failed (with reasons)
```

### Phase 2: Holt Import

```python
# Holt import will handle:

1. Different Structure
   - Activity-based (not pack-based)
   - Community codes (.001, .002, .003)
   - Plan naming patterns

2. Translation
   - Map Holt activities → unified phases
   - Community suffix → minor codes
   - Generate unified codes

3. Validation & Import
   - Same validation as Richmond
   - Merge into same database
   - Report any conflicts
```

### What You'll Get

**Success Report:**
```
================================================================================
BAT MIGRATION REPORT
================================================================================

Richmond Import:
  ✅ Materials Imported: 55,604
  ✅ Plans Created: 9
  ⚠️  Needs Review: 127 materials (2.3%)
  ❌ Failed: 3 materials (0.05%)

Holt Import:
  ✅ Materials Imported: 9,373
  ✅ Plans Created: 47
  ⚠️  Needs Review: 42 materials (0.4%)
  ❌ Failed: 1 material (0.01%)

================================================================================
REVIEW REQUIRED
================================================================================

Materials Needing Review (flagged for uncertainty):

1. Plan 1670 | Pack "|10.x9SPECIAL"
   Issue: Unknown pack format
   Description: Custom foundation option
   Suggested: Manually map to phase code

2. Plan G603 | Pack "|12.5xABCDE"
   Issue: 5 elevations (expected max 4)
   Description: Garage extension
   Suggested: Verify elevation codes

[... rest of flagged items ...]
```

---

## What I Need From You

### To Create Automated Script:

**Answer these questions:**

1. **Which Excel file should I start with?**
   - Richmond: `RAH_MaterialDatabase.xlsx`?
   - Holt: `NEW HOLT BAT 10-28-25 Updated 11-05-25.xlsx`?
   - Both?

2. **Which sheets in the Excel file have material data?**
   - Usually named "Materials", "Plan_1670", etc.
   - I can detect them, but you can specify

3. **Priority plans to import first?**
   - Start with one plan as test (Plan 1670?)
   - Or import all plans at once?

4. **What level of validation do you want?**
   - Strict: Stop on any uncertain translation
   - Moderate: Flag for review, continue import
   - Permissive: Import everything, review later

### Sample Data for Testing

If you can provide me with:
- One sample row from Richmond Excel
- One sample row from Holt Excel
- I can validate the parsing logic before full import

---

## After Migration - What You'll Be Able to Do

### Query Materials

```python
from bat_coding_system_builder import BATCodingSystemBuilder

builder = BATCodingSystemBuilder("bat_unified.db")
builder.connect()

# Get all materials for Plan 1670
materials_1670 = builder.get_materials_by_plan("1670")
print(f"Plan 1670 has {len(materials_1670)} materials")

# Get all foundation materials (across all plans)
foundation = builder.get_materials_by_phase("010.000")
print(f"Found {len(foundation)} foundation materials")

# Get materials for specific elevation
elev_b = builder.get_materials_by_elevation("1670", "B")
print(f"Elevation B has {len(elev_b)} materials")

# Export to Excel for analysis
builder.export_materials_report("plan_1670_materials.csv", plan_code="1670")
```

### Generate Reports

```python
# Material cost summary
summary = builder.generate_summary_report()
print(summary)

# Validation report
results = builder.validate_database()
print(f"Total materials: {results['materials_count']:,d}")
print(f"Orphaned records: {results['orphaned_materials']}")

# Export for stakeholders
builder.export_materials_report("all_materials_unified.csv")
```

### Integrate with Pricing Tool

Once migrated, you can update your Python pricing tool to use:
```python
# Instead of reading 70+ Excel files:
materials = builder.get_materials_by_plan(plan_code)

# Instead of complex pack name parsing:
unified_code = material['full_code']  # Already parsed!

# Instead of triple-encoded elevations:
elevation = material['elevation_code']  # Single source of truth
```

---

## Migration Risks & Mitigation

### Risk 1: Triple-Encoding Conflicts

**Problem:** Richmond stores elevation data 3 times
**Example:** Pack "|10.82BCD" + Location "ELVB-ELVC-ELVD" + Column "B, C, D"

**Mitigation:**
- Script will check all 3 sources
- Flag if they don't match
- You review and decide source of truth
- Document decision in audit trail

### Risk 2: Unknown Pack Names

**Problem:** New pack formats not in translation table
**Example:** "|10.x9SPECIAL" not in 313-line mapping

**Mitigation:**
- Script flags unknown packs
- Provides context (description, plan)
- You create new translation rule
- Script re-imports with new rule

### Risk 3: Data Quality Issues

**Problem:** Missing SKUs, zero quantities, null prices
**Example:** Quantity = 0, Unit Price = blank

**Mitigation:**
- Script validates required fields
- Flags incomplete records
- You fix in Excel or after import
- Re-run validation after fixes

### Risk 4: Holt-Richmond Conflicts

**Problem:** Same unified code from both builders
**Example:** Both map to "010.820" but different items

**Mitigation:**
- Builder-specific columns track source
- Unified code includes plan prefix (1670 vs G603)
- You review conflicts in report
- Decide merge strategy or keep separate

---

## Decision Time

### Choose Your Path:

**Path A: Full Automation (30min)**
```bash
# I create the script, you run it
python auto_import_bat.py --richmond --holt --validate
# Review the report, fix flagged items
```

**Path B: Test First (1 hour)**
```bash
# I create script for one plan as test
python auto_import_bat.py --plan 1670 --dry-run
# You review test results
# Then run full import
python auto_import_bat.py --richmond --all-plans
```

**Path C: Manual Control (2-4 hours)**
```bash
# You use interactive wizard
python interactive_menu.py
# Select option 13: Import Customer Database
# Follow prompts for each file
```

**Path D: Hybrid (1-2 hours)**
```bash
# I create automated script
# It imports 90% automatically
# Flags 10% for your review
# You validate flagged items
# Script finishes import
```

---

## My Recommendation

**Start with Path B (Test First):**

1. **Today (30 min):**
   - I create automated import script
   - Test on Plan 1670 only
   - Generate validation report
   - You review results

2. **If Test Passes (30 min):**
   - Run full Richmond import
   - Review flagged items
   - Fix any issues
   - Export validation report

3. **Then Holt (30 min):**
   - Same process for Holt files
   - Merge into same database
   - Final validation
   - Generate master report

4. **Integration (30 min):**
   - Update Python pricing tool
   - Test with unified database
   - Document new workflow

**Total Time:** 2 hours
**Your Involvement:** ~30 min review + validation

---

## What Do You Want to Do?

**Tell me:**

1. **Which path?** (A, B, C, or D)
2. **Start with which file?** (Richmond or Holt)
3. **Test plan first?** (Plan 1670 or another)
4. **Validation strictness?** (Strict, Moderate, Permissive)

**Then I'll:**
- Create the automated script
- Test it on sample data
- Run the import
- Generate reports for your review

---

**Ready to migrate your Excel data into a unified, queryable database!** 🚀

Would you like me to create the automated import script?
