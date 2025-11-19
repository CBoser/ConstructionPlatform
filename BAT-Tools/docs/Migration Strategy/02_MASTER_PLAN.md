# 02_MASTER_PLAN.md

**BAT Integration - Complete Execution Plan**  
**Single Source of Truth for Timeline & Tasks**

---

**Source:** BAT_MASTER_PLAN_INTEGRATED.md (enhanced)  
**Created:** November 10, 2025  
**Last Updated:** November 10, 2025  
**Version:** 2.0  
**Status:** Active - Primary Execution Guide

---

## 🎯 EXECUTIVE SUMMARY

### Purpose
Integrate Richmond American Homes and Holt Homes Builder Acceleration Tools (BATs) into a unified, standardized, database-driven platform ahead of the **March 2026 merger**. This is not just data migration—it's building competitive advantage through expertise preservation and system unification.

### Project Scope
- **Timeline:** 12 weeks (November 11 - February 28, 2026)
- **Investment:** 148 hours (12.3 hours/week average)
- **Team:** Corey (lead), William (Richmond), Alicia (Holt), Claude (AI architect)
- **Outcome:** Unified system with 8 weeks production testing before merger

### Current Reality (November 10, 2025)

**✅ What You Have:**
- Holt pricing updater (Python) - **PRODUCTION READY**
- Plan Index structures in both BATs
- Material databases: 44 Richmond plans + 47 Holt plans
- Monday's analysis complete (45 pages documentation)
- 64,977 total material line items ready for migration

**⚠️ What Needs Work:**
- No standardized coding system across builders
- Architecture decisions not yet made (Tuesday's work)
- Richmond BAT incomplete (9 of 44 plans active)
- No table naming conventions
- No database structure designed

### Success Vision (March 2026)
- ✅ Single unified BAT system operational
- ✅ 100% plan coverage (both builders)
- ✅ Zero pricing errors through database validation
- ✅ Material orders: 15 minutes → 2 minutes
- ✅ Team trained and productive
- ✅ 8 weeks of production testing complete

---

## 📊 GROUND TRUTH - CURRENT STATE

### Richmond BAT Status
```
File: RICHMOND_3BAT_NOVEMBER_2025_10-17-25_Updated_11-07-25.xlsm
Sheets: 38 total
Plans Active: 9 of 44 (20%)
Plans Ready: 44 total (CONFIRMED in RAH_MaterialDatabase.xlsx)
Material Items: 55,604 line items total
Unique SKUs: 581
Status: Ready for automated import
Critical Issue: Triple-encoded elevation data (|10.82BCD)
```

### Holt BAT Status
```
File: HOLT_BAT_NOVEMBER_2025_10-28-25.xlsm
Sheets: 103 total
Plans Active: 47 of 50 (94%)
Material Items: 9,373 line items
Communities: 5 active (GG, CR, HH, HA, WR)
Python Updater: PRODUCTION READY
Status: Nearly complete, stable system
```

### Python Pricing Updater Status
```
Tool: holt_updater.py (390 lines)
Status: ✅ PRODUCTION READY
Features:
  ✅ Updates 15,000+ rows in seconds
  ✅ Column-specific targeting (PL01-PL12)
  ✅ One-click batch file operation
  ✅ Timestamped backups
  ✅ Visual change highlighting
  ✅ Professional error handling
  
⚠️ Needs enhancements:
  - Price change log (1 hour)
  - Preview mode (0.5 hours)
  - Richmond adaptation (2 hours)
```

### Monday's Completed Work ✅
```
Date: November 10, 2025
Time: 4 hours

Completed:
✅ Item numbering audit (746 items analyzed)
✅ Richmond structure audit (pricing infrastructure mapped)
✅ 45 pages documentation created
✅ item_numbering_patterns.txt
✅ richmond_structure.txt
✅ WEEK1_MONDAY_SUMMARY.txt

Key Findings:
✅ Richmond: Hierarchical 6-digit codes (confirmed)
✅ Holt: Descriptive 4-6 character codes (confirmed)
✅ Community is job-level, not item-level attribute
✅ Both systems have 64,977 line items total
✅ Triple-encoding problem identified and documented
✅ Translation table strategy defined
```

---

## 🗺️ 12-WEEK INTEGRATED ROADMAP

## PHASE 1: FOUNDATION (Weeks 1-4) - 52 hours

### **WEEK 1 (Nov 11-15): Standards + Architecture** ⭐ CURRENT WEEK
**Total: 18 hours** (Enhanced from original 14 hours)

#### **Monday (Nov 11) - 4 hours** ✅ COMPLETE
```
Item Numbering Audit (2 hours)
├─ Richmond "Item Pricing" sheet analysis
├─ Holt IWP and RL sheet analysis
├─ Document prefixes, ranges, patterns
└─ Identify inconsistencies

Richmond Structure Audit (2 hours)
├─ Document pricing sheet structure
├─ Map columns for updater adaptation
├─ Identify price levels (L1-L5)
├─ Plan/elevation/option relationships
└─ Output: richmond_structure.txt

Status: ✅ COMPLETE
Deliverables: ✅ item_numbering_patterns.txt, richmond_structure.txt
```

#### **Tuesday (Nov 12) - 6 hours** 🔴 CRITICAL DAY
```
SESSION 1: Map Hierarchies (2 hours)
├─ Richmond hierarchy analysis
│  ├─ How plans encode (G603, G603B, LE93 G603B?)
│  ├─ How elevations work (variant or dimension?)
│  ├─ How options relate to plans
│  └─ Current table relationships
│
├─ Holt hierarchy analysis
│  ├─ How plans encode (1670, 1670ABCD?)
│  ├─ How communities fit (CR, GG, WR?)
│  ├─ How pack system works (10.82, 12.x5?)
│  └─ Current table relationships
│
└─ Outputs: richmond_hierarchy_map.txt, holt_hierarchy_map.txt

SESSION 2: Make Architecture Decisions (2 hours)
├─ DECISION 1: Plan-Pack Relationship (30 min)
│  Question: Can pack "12.x5" work on multiple plans with same materials?
│  Options: Universal Pack vs Plan-Specific Pack
│  Impact: Determines primary keys, table structure
│  Output: DECISION_1_Plan_Pack_Relationship.md
│
├─ DECISION 2: Plan-Elevation Model (30 min)
│  Question: Is "G603B" one plan or Plan G603 + Elevation B?
│  Options: Elevation as Variant vs Elevation as Dimension
│  Impact: Determines how you query and join tables
│  Solves: Triple-encoding problem (|10.82BCD)
│  Output: DECISION_2_Plan_Elevation_Model.md
│
└─ DECISION 3: Internal Option Codes (60 min)
   Question: What's YOUR internal standard?
   Options: Keep Richmond, Keep Holt, Create Hybrid, Create New
   Impact: User interface, database design, translation needs
   Output: DECISION_3_Internal_Option_Codes.md

SESSION 3: Database Schema Design (2 hours)
├─ Design 10 core tables based on decisions
│  ├─ builders (Richmond, Holt)
│  ├─ plans (plan_id, builder_id)
│  ├─ plan_elevations (elevation_id, plan_id)
│  ├─ packs (pack_id, pack_name, phase)
│  ├─ materials (material_id, plan_id, pack_id, item_number)
│  ├─ items (item_id, description, category)
│  ├─ pricing (price_id, item_id, price_level, effective_date)
│  ├─ communities (community_id, name, builder_id)
│  ├─ option_translation (richmond_code, holt_code, description)
│  └─ pack_hierarchy (pack_id, parent_pack_id, order)
│
├─ Solve triple-encoding problem
│  Example: |10.82BCD becomes:
│  - pack_id: "10.82"
│  - elevation_mappings: B, C, D (separate table)
│  - Single source of truth
│
├─ Add Prism SQL migration notes
│  - SQLite type → Prism type conversions
│  - Migration script template
│  - Data export/import procedures
│
└─ Outputs: schema_design_v1.sql, import_mapping_rules.md

Deliverables:
⏳ richmond_hierarchy_map.txt
⏳ holt_hierarchy_map.txt
⏳ DECISION_1_Plan_Pack_Relationship.md
⏳ DECISION_2_Plan_Elevation_Model.md
⏳ DECISION_3_Internal_Option_Codes.md
⏳ schema_design_v1.sql (with Prism notes)
⏳ import_mapping_rules.md

Why This Day is Critical:
❗ These decisions lock in the foundation for all future work
❗ Wrong choices = 4-6 weeks of rework later
❗ Right choices = smooth execution Weeks 2-12
❗ Can't start Week 5 imports without clear target structure
```

#### **Wednesday-Thursday (Nov 13-14) - 8 hours**
```
Wednesday (4 hours): Draft Coding Standards
├─ Plan coding (based on Decision 2)
│  Format: [PREFIX][NUMBER][VARIANT?]
│  Examples: G603, G603B, 1670
│  Validation rules: 4-6 characters, alphanumeric
│
├─ Pack coding (MindFlow structure)
│  Format: |[PHASE].[VARIANT] [DESCRIPTION] - [OPTION_CODE]
│  Examples: |10.82 OPT DEN FOUNDATION
│  Hierarchy: Phase groups related packs
│
├─ Internal option codes (based on Decision 3)
│  Richmond: XGREAT, 2CAR5XA, FPSING01
│  Holt: 167010100, 164910105
│  Standard: [Choose based on Decision 3]
│
└─ Material item numbering
   Richmond: 6-digit hierarchical
   Holt: 4-6 character descriptive
   Both valid, document translation

Thursday (4 hours): Refine Documentation
├─ Create BAT_Coding_Standards.docx
│  ├─ Section 1: Philosophy (WHY we have standards)
│  ├─ Section 2: Plan Coding (with examples)
│  ├─ Section 3: Pack Coding (with hierarchy)
│  ├─ Section 4: Option Codes (with translation)
│  ├─ Section 5: Material Items (both systems)
│  ├─ Section 6: Validation Rules
│  └─ Section 7: Examples (good and bad)
│
├─ Prepare team review materials
│  ├─ Summary slide/doc
│  ├─ Key decisions highlighted
│  ├─ Examples from real data
│  └─ Questions for validation
│
└─ Test examples with real BAT data

Deliverables:
⏳ BAT_Coding_Standards.docx (comprehensive)
⏳ Team review materials
⏳ Test validation complete
```

#### **Friday (Nov 15) - 2 hours**
```
Team Validation Session (2 hours)
├─ Present to William Hatley (Richmond expert)
│  ├─ Review Richmond plan structure
│  ├─ Validate item numbering decisions
│  ├─ Confirm price level structure
│  └─ Get feedback on coding standards
│
├─ Present to Alicia Vandehey (Holt expert)
│  ├─ Review Holt community structure
│  ├─ Validate pack hierarchy
│  ├─ Confirm plan-elevation relationships
│  └─ Get feedback on coding standards
│
├─ Incorporate feedback
│  ├─ Update decisions if needed
│  ├─ Revise schema if necessary
│  ├─ Adjust coding standards
│  └─ Document changes
│
└─ Finalize Week 1
   ├─ Create Phase_1_Foundation_Summary.md
   ├─ Lock coding standards (formal review process for changes)
   ├─ Add reference sheets to both BATs
   └─ Ready for Week 2

Deliverables:
⏳ Team validation complete
⏳ All feedback incorporated
⏳ Coding standards finalized
⏳ Reference sheets in BAT files
⏳ Week 1 complete! 🎉

Week 1 Success Criteria:
✓ Three architecture decisions made and documented
✓ Database schema designed (10 core tables)
✓ Import mapping rules defined
✓ Triple-encoding problem solved
✓ Coding standards documented
✓ William validated (Richmond perspective)
✓ Alicia validated (Holt perspective)
✓ Team understands and agrees
✓ Foundation locked and approved
```

---

### **WEEK 2 (Nov 18-22): Pricing Infrastructure** 
**Total: 10 hours** (Reduced from 16 - updater already works!)

#### **Monday (Nov 18) - 2 hours**
```
Current Updater Validation
├─ Test holt_updater.py on November 2025 BATs
├─ Verify all features work correctly
│  ├─ Price updates apply correctly
│  ├─ Backups create successfully
│  ├─ Change highlighting works
│  └─ Error handling catches issues
├─ Document any issues found
└─ Create test results report

Output: Updater validation report
```

#### **Tuesday (Nov 19) - 1.5 hours**
```
Add Enhancements
├─ Price change log sheet (1 hour)
│  ├─ Create "PriceChangeLog" sheet
│  ├─ Columns: Date, Item, Old Price, New Price, Level, User
│  ├─ Auto-populate on update
│  └─ Test logging functionality
│
└─ Preview mode (0.5 hours)
   ├─ Add --preview flag
   ├─ Show changes without applying
   ├─ Generate preview report
   └─ Test preview functionality

Output: Enhanced holt_updater.py v2.0
```

#### **Wednesday (Nov 20) - 2 hours**
```
Richmond Version Creation
├─ Copy holt_updater.py → richmond_updater.py
├─ Update column mappings from richmond_structure.txt
│  ├─ Price level columns (L1-L5 vs PL01-PL12)
│  ├─ Sheet name patterns
│  ├─ Table identification logic
│  └─ Backup naming convention
│
├─ Update price level structure
│  ├─ Richmond uses L1, L2, L3, L4, L5
│  ├─ Column positions different
│  └─ Validation rules
│
└─ Test on Richmond BAT copy
   ├─ Test with small CSV first
   ├─ Verify updates apply correctly
   ├─ Check backup creation
   └─ Validate highlighting

Output: richmond_updater.py (fully functional)
```

#### **Thursday (Nov 21) - 3.5 hours**
```
Price Schedule Integration
├─ Add Richmond price schedule sheet (2 hours)
│  ├─ Create "PriceSchedule" sheet
│  ├─ Columns: Item, Description, L1, L2, L3, L4, L5, Last Updated
│  ├─ Import from current price data
│  ├─ Add lookup formulas
│  └─ Link to updater tool
│
├─ Verify Holt price schedule structure (1 hour)
│  ├─ Review existing sheet
│  ├─ Confirm PL01-PL12 structure
│  ├─ Check formulas
│  └─ Document any issues
│
└─ Link to updater tools (0.5 hours)
   ├─ Update both updaters to reference schedule
   ├─ Add validation against schedule
   └─ Test end-to-end workflow

Output: Integrated price schedules
```

#### **Friday (Nov 22) - 1 hour**
```
Documentation & Training
├─ Update README files (0.5 hours)
│  ├─ Holt updater documentation
│  ├─ Richmond updater documentation
│  ├─ Price schedule usage
│  └─ Troubleshooting guide
│
├─ Create batch files (0.25 hours)
│  ├─ RUN_HOLT_UPDATE.bat
│  ├─ RUN_RICHMOND_UPDATE.bat
│  └─ Test both launchers
│
└─ Team demo (0.25 hours)
   ├─ Show price update workflow
   ├─ Demonstrate preview mode
   ├─ Explain price change log
   └─ Answer questions

Deliverables:
✅ Enhanced holt_updater.py (with logging & preview)
✅ richmond_updater.py (full functionality)
✅ RUN_HOLT_UPDATE.bat
✅ RUN_RICHMOND_UPDATE.bat
✅ Richmond price schedule integrated
✅ Holt price schedule verified
✅ Documentation updated
✅ Team trained on tools
✅ Week 2 complete! 🎉
```

---

### **WEEK 3 (Nov 25-29): Standardization**
**Total: 14 hours**

#### **Monday (Nov 25) - 4 hours**
```
Table Inventory
├─ Map all tables in Richmond BAT (2 hours)
│  ├─ Use Table_Inventory_Template.md
│  ├─ Document: Table name, Type, Plan, Purpose
│  ├─ Count: ~38 sheets
│  └─ Output: richmond_table_inventory.xlsx
│
└─ Map all tables in Holt BAT (2 hours)
   ├─ Use same template
   ├─ Document: Table name, Type, Plan, Community, Purpose
   ├─ Count: ~103 sheets
   └─ Output: holt_table_inventory.xlsx

Deliverable: Complete table inventories
```

#### **Tuesday (Nov 26) - 4 hours**
```
Table Naming Convention
├─ Define convention (2 hours)
│  Format: tableType_planNumber_community_elevation
│  Examples:
│  - materialist_G603_A (Richmond with elevation)
│  - materialist_G603 (Richmond no elevation)
│  - bidtotals_1649_GG_A (Holt with community)
│  - pricing_base (shared resources)
│  - schedule_PriceSchedule (master schedules)
│
│  Special cases:
│  - Plan Index: "PlanIndex"
│  - Item Pricing: "ItemPricing"
│  - Reference sheets: "ref_[topic]"
│  - Lookup tables: "lookup_[type]"
│
├─ Document in Table_Naming_Convention.docx (1 hour)
│  ├─ Format rules
│  ├─ Examples (good and bad)
│  ├─ Special cases
│  ├─ Validation rules
│  └─ Migration checklist
│
└─ Create rename automation VBA (1 hour)
   ├─ Read inventory sheet
   ├─ Generate new names
   ├─ Batch rename with formula preservation
   ├─ Log results
   └─ Test on 5 sheets first

Deliverable: Naming convention + automation tool
```

#### **Wednesday (Nov 27) - 4 hours**
```
Apply Renaming
├─ Batch rename Richmond tables (1.5 hours)
│  ├─ Backup file first
│  ├─ Run automation on all sheets
│  ├─ Review rename log
│  └─ Spot-check formulas
│
├─ Batch rename Holt tables (2 hours)
│  ├─ Backup file first
│  ├─ Run automation on all sheets
│  ├─ Review rename log
│  └─ Spot-check formulas
│
└─ Validate all formulas still work (0.5 hours)
   ├─ Open both files
   ├─ Check for #REF! errors
   ├─ Test key formulas
   ├─ Document any issues
   └─ Fix if needed

Deliverable: All tables renamed and validated
```

#### **Thursday (Nov 28) - 2 hours** (Thanksgiving - may adjust)
```
Cross-Reference Sheets
├─ Create Holt community cross-reference (1 hour)
│  ├─ Sheet: "ref_Communities"
│  ├─ Columns: Community Code, Name, Active Plans, Notes
│  ├─ Data: CR, GG, HA, HH, WR
│  └─ Add lookup formulas
│
└─ Create Holt plan-to-elevation mapping (1 hour)
   ├─ Sheet: "ref_PlanElevations"
   ├─ Columns: Plan, Elevations Available, Community
   ├─ Data: All 47 plans
   └─ Add lookup formulas

Deliverables:
✅ All tables renamed per convention
✅ Table_Naming_Convention.docx
✅ Holt cross-reference sheets
✅ Validation complete
✅ Week 3 complete! 🎉
```

---

### **WEEK 4 (Dec 2-6): Plan Details**
**Total: 8 hours**

#### **Monday-Tuesday (Dec 2-3) - 4 hours**
```
Add Arch/Eng Date Columns
├─ Add columns to Plan Index (both BATs) (2 hours)
│  ├─ Richmond Plan Index
│  │  ├─ Add "Arch Date" column
│  │  ├─ Add "Eng Date" column
│  │  └─ Format as Date type
│  │
│  └─ Holt Plan Index
│     ├─ Add "Arch Date" column
│     ├─ Add "Eng Date" column
│     └─ Format as Date type
│
└─ Research date sources (2 hours)
   ├─ Check plan files
   ├─ Review design documents
   ├─ Ask William/Alicia
   └─ Document date retrieval process

Deliverable: Date columns added to both Plan Indexes
```

#### **Wednesday-Thursday (Dec 4-5) - 3 hours**
```
Populate Dates
├─ Richmond plans (1.5 hours)
│  ├─ 9 active plans first
│  ├─ Research dates for each
│  ├─ Enter in Plan Index
│  └─ Flag any TBD/missing
│
└─ Holt plans (1.5 hours)
   ├─ 47 active plans
   ├─ Research dates for each
   ├─ Enter in Plan Index
   └─ Flag any TBD/missing

Get team validation:
├─ William verifies Richmond dates
├─ Alicia verifies Holt dates
└─ Document any corrections

Deliverable: Complete Plan Indexes with dates
```

#### **Friday (Dec 6) - 1 hour**
```
Foundation Checkpoint
├─ Review all Week 1-4 deliverables (0.5 hours)
│  ├─ Week 1: Architecture decisions ✓
│  ├─ Week 2: Pricing tools ✓
│  ├─ Week 3: Standardization ✓
│  └─ Week 4: Plan details ✓
│
├─ Validate everything working (0.25 hours)
│  ├─ Test pricing updaters
│  ├─ Check table names
│  ├─ Verify formulas
│  └─ Review Plan Indexes
│
├─ Document any issues (0.125 hours)
│  └─ Create issues list if needed
│
└─ Prepare for content phase (0.125 hours)
   ├─ Review import script
   ├─ Prepare test data
   └─ Schedule Week 5 work

Deliverables:
✅ Complete Plan Index with dates
✅ Foundation Phase complete
✅ Ready for Richmond plan imports
✅ Phase 1 complete! 🎉

Phase 1 Success Criteria:
✓ Coding standards finalized and approved
✓ Database schema designed
✓ Pricing tools operational (both builders)
✓ Tables renamed with convention
✓ Plan Indexes complete
✓ Team trained and confident
✓ Ready to import 35 Richmond plans
```

---

## PHASE 2: CONTENT IMPORT (Weeks 5-8) - 32 hours

### Richmond Plan Import Strategy

**Source Data:**
```
File: RAH_MaterialDatabase.xlsx
Location: /mnt/project/ (uploaded)
Sheet: Combined_A_to_G
Total Plans: 44 confirmed
Total Materials: 43,952 line items
Unique SKUs: 581
Import Method: Python automated script (import_richmond_materials.py)
```

**Import Groupings:**
```
Small Plans (<500 materials): 8 plans - Week 5
Medium Plans (500-1500): 12 plans - Week 6
Large Plans (1500-3000): 15 plans - Week 7
Largest Plans (3000+): 9 plans - Week 8

Total: 44 plans over 4 weeks
Strategy: Start small, scale up as confidence grows
```

---

### **WEEK 5 (Dec 9-13): Small Plans**
**Total: 8 hours**

#### **Monday (Dec 9) - 2 hours**
```
Setup & Test
├─ Copy import_richmond_materials.py script (0.5 hours)
│  ├─ From template or create new
│  ├─ Update file paths
│  └─ Configure for Richmond format
│
├─ Update configuration (0.5 hours)
│  ├─ Source: RAH_MaterialDatabase.xlsx
│  ├─ Target: RICHMOND_3BAT.xlsm
│  ├─ Sheet name format: materialist_[PLAN]
│  ├─ Column mapping per coding standards
│  └─ Validation rules
│
└─ Test on ONE plan (1 hour)
   ├─ Choose: G18L (smallest at ~200 materials)
   ├─ Run import script
   ├─ Verify output format
   ├─ Check formulas
   ├─ Validate data
   └─ Fix any issues

Output: Import script tested and working
```

#### **Tuesday-Wednesday (Dec 10-11) - 4 hours**
```
Import Small Plans
Plans: G18L, G19E, G21D, G31H, G33H, G44H, G48H, G148
(All <500 materials each)

Batch 1 (Tuesday - 2 hours): G18L, G19E, G21D, G31H
├─ Run import for each plan
├─ Validate material counts match source
├─ Check table formatting
├─ Update Plan Index
└─ Document any issues

Batch 2 (Wednesday - 2 hours): G33H, G44H, G48H, G148
├─ Run import for each plan
├─ Validate material counts match source
├─ Check table formatting
├─ Update Plan Index
└─ Document any issues

Output: 8 small plans imported
```

#### **Thursday-Friday (Dec 12-13) - 2 hours**
```
Validation & Review
├─ Material counts verification (0.5 hours)
│  ├─ Compare to source database
│  ├─ Document any discrepancies
│  └─ Investigate issues
│
├─ Table naming check (0.25 hours)
│  ├─ All follow materialist_PLAN format
│  └─ Consistent with standards
│
├─ Formula validation (0.5 hours)
│  ├─ No #REF! errors
│  ├─ Pricing formulas correct
│  └─ Totals calculate properly
│
├─ Plan Index update (0.25 hours)
│  ├─ All 8 plans marked active
│  ├─ Material counts updated
│  └─ Status = "Complete"
│
└─ Team review (0.5 hours)
   ├─ Show imported plans to William
   ├─ Get feedback
   └─ Document for next week

Milestone: 17 of 44 plans complete (38%)

Deliverables:
✅ 8 small Richmond plans imported
✅ Material counts validated
✅ Tables properly formatted
✅ Plan Index updated
✅ Team review complete
✅ Week 5 complete! 🎉
```

---

### **WEEK 6 (Dec 16-20): Medium Plans**
**Total: 10 hours**

**Plans:** G591, G592, G593, G600, G625, G626, G654, G712, G713, G720, G742, G753
**Materials:** 500-1,000 each

#### **Monday-Tuesday (Dec 16-17) - 4 hours**
```
Batch 1: 6 Plans
Plans: G591, G592, G593, G600, G625, G626

Process:
├─ Run import script for each (3 hours)
├─ Validate as importing (0.5 hours)
└─ Quick spot-checks (0.5 hours)

Output: 6 medium plans imported
```

#### **Wednesday-Thursday (Dec 18-19) - 4 hours**
```
Batch 2: 6 Plans
Plans: G654, G712, G713, G720, G742, G753

Process:
├─ Run import script for each (3 hours)
├─ Validate as importing (0.5 hours)
└─ Quick spot-checks (0.5 hours)

Output: 6 more medium plans imported
```

#### **Friday (Dec 20) - 2 hours**
```
Validation & Performance Check
├─ Material counts verification (0.5 hours)
├─ Performance check (0.5 hours)
│  ├─ File size growth
│  ├─ Load time
│  ├─ Calculation speed
│  └─ Document if concerns
│
├─ Plan Index update (0.5 hours)
│  ├─ All 12 plans marked active
│  └─ Status updated
│
└─ Week 6 checkpoint (0.5 hours)
   ├─ Review progress
   ├─ Document any issues
   └─ Prepare for Week 7

Milestone: 29 of 44 plans complete (66%)

Deliverables:
✅ 12 medium Richmond plans imported
✅ Performance validated
✅ Plan Index updated
✅ Week 6 complete! 🎉
```

---

### **WEEK 7 (Dec 23-27): Large Plans**
**Total: 10 hours** (Holiday week - adjust as needed)

**Plans:** 15 large plans (1500-3000 materials each)
**Including:** G250, G260, G639, G698, G730, G760, and others

#### **Monday-Wednesday (Dec 23-25) - 6 hours**
```
Note: Christmas week - flexible scheduling

Batch Import: 15 Large Plans
├─ Group into 3 batches of 5 plans
├─ Run imports (5 hours)
├─ Basic validation during import (1 hour)
└─ Document any issues

Output: 15 large plans imported
```

#### **Thursday-Friday (Dec 26-27) - 4 hours**
```
Validation & Review
├─ Material counts verification (1 hour)
├─ Performance assessment (1 hour)
│  ├─ File size now significant
│  ├─ Load time monitoring
│  └─ Document concerns
│
├─ Plan Index update (1 hour)
│  └─ All 15 plans marked active
│
└─ Week 7 checkpoint (1 hour)
   ├─ Review progress
   ├─ Assess Week 8 strategy
   └─ Plan database migration timing

Milestone: 44 of 44 plans imported (100%)!

Wait - that's only 29 + 12 + 15 = 56 plans?

CORRECTION: Let me recount from source
- Week 5: 8 plans
- Week 6: 12 plans
- Week 7: 8 plans (large)
- Week 8: 7 plans (largest)
Total: 35 NEW plans + 9 existing = 44 total

Adjusted Week 7:
8 Large Plans (1500-3000 materials)
Plans: G250, G260, G639, G654, G698, G712, G730, G760

Milestone: 29 of 44 plans complete (66%)

Deliverables:
✅ 8 large Richmond plans imported
✅ Performance monitored
✅ Plan Index updated
✅ Week 7 complete! 🎉
```

---

### **WEEK 8 (Dec 30-Jan 3): Final Plans + Validation**
**Total: 8 hours** (New Year week)

**Plans:** 7 largest plans (3000+ materials each)
**Including:** G603, G914, LE01, LE91, LE92, LE93, LE95

#### **Monday-Tuesday (Dec 30-31) - 4 hours**
```
Final Import: 7 Largest Plans
├─ These are the biggest plans
├─ Import one at a time (3 hours)
├─ Validate each carefully (1 hour)
└─ Document file size impact

Output: Final 7 plans imported

Status: ALL 44 RICHMOND PLANS COMPLETE! 🎉
```

#### **Wednesday-Friday (Jan 1-3) - 4 hours**
```
Complete Dataset Validation
├─ Comprehensive material count check (1 hour)
│  ├─ Source: 43,952 materials
│  ├─ Imported: Verify match
│  └─ Document any discrepancies
│
├─ Performance final assessment (1 hour)
│  ├─ File size: Expect 50-80 MB
│  ├─ Load time: Measure
│  ├─ Calculation speed: Test
│  └─ Recommend database migration timing
│
├─ Plan Index final update (0.5 hours)
│  ├─ All 44 plans marked active
│  ├─ All material counts verified
│  └─ Status: "Complete"
│
├─ Create validation report (1 hour)
│  ├─ Import statistics
│  ├─ Data quality metrics
│  ├─ Performance metrics
│  ├─ Issues encountered
│  └─ Recommendations
│
└─ Phase 2 checkpoint (0.5 hours)
   ├─ Celebrate completion!
   ├─ Review next phase
   └─ Plan database migration

Milestone: 44 of 44 plans complete (100%)! 🎊

Deliverables:
✅ Final 7 Richmond plans imported
✅ Complete dataset validation
✅ Validation report created
✅ 100% plan coverage achieved
✅ Phase 2 complete! 🎉

Phase 2 Success Criteria:
✓ All 44 Richmond plans imported
✓ All 43,952 materials in BAT
✓ Data quality validated
✓ Performance acceptable
✓ Team can use all plans
✓ Ready for database phase
```

---

## PHASE 3: INFRASTRUCTURE & TESTING (Weeks 9-12) - 64 hours

### **WEEK 9-10 (Jan 6-17): Database & Tools**
**Total: 40 hours over 2 weeks**

#### **Database Strategy Decision (Week 9 Day 1 - 4 hours)**
```
Critical Decision Point

Options:
A) SQLite + ODBC
   Pros: Robust, queryable, scalable, standards-based
   Cons: Technical setup, ODBC drivers, team training
   Best for: Long-term, sophisticated queries

B) SharePoint Lists
   Pros: Multi-user, auto-sync, version control, familiar
   Cons: Network dependency, SharePoint setup
   Best for: Collaboration, always-updated

C) Keep Excel Embedded
   Pros: No change, self-contained
   Cons: Size limits, single-user, backup issues
   Best for: Status quo (not recommended)

Process:
├─ Evaluate based on March merger needs
├─ Consider Prism SQL migration path
├─ Test with sample data
├─ Get team input
└─ Make decision and document

Output: Database_Strategy_Decision.md

Recommended: Option A (SQLite → Prism SQL)
├─ Develop in SQLite (Week 9-10)
├─ Migrate to Prism SQL (Week 11-12)
├─ Use schema_design_v1.sql with Prism notes
└─ Export CSV → Import to Prism with type conversion
```

#### **Database Creation & Population (Week 9-10 - 20 hours)**
```
IF SQLite chosen:

Create Database (4 hours)
├─ Run schema_design_v1.sql
├─ Create bat_master.db
├─ Verify table structure
└─ Add indexes

Population Scripts (8 hours)
├─ export_to_csv.py (export from Excel)
├─ import_to_sqlite.py (import to database)
├─ validate_data.py (check integrity)
└─ Test with sample data

Full Import (4 hours)
├─ Export Richmond BAT to CSV
├─ Export Holt BAT to CSV
├─ Import both to database
├─ Validate counts and relationships
└─ Test queries

Database Testing (4 hours)
├─ Test all major queries
├─ Performance benchmarks
├─ Data integrity checks
└─ Document results

Output: bat_master.db (fully populated)
```

#### **Excel Tool Development (Week 9-10 - 12 hours)**
```
Material Order Generator (4 hours)
├─ Create BAT_Material_Order_Generator.xlsm
├─ ODBC connection to database
├─ Plan selection interface
├─ Query builder
├─ Export to formatted order
└─ Test thoroughly

Price Lookup Tool (3 hours)
├─ Create BAT_Price_Lookup.xlsm
├─ ODBC connection to database
├─ Item search interface
├─ Price level selection
├─ Display results
└─ Test thoroughly

Plan Comparison Tool (3 hours)
├─ Create BAT_Plan_Comparison.xlsm
├─ ODBC connection to database
├─ Multi-plan selection
├─ Side-by-side comparison
├─ Cost analysis
└─ Test thoroughly

Formatting Automation (2 hours)
├─ Apply consistent theme to all sheets
├─ Colors, fonts, borders
├─ Batch processing macro
└─ Document theme standard

Output: 3 Excel tools operational + formatted BATs
```

#### **User Testing & Refinement (Week 10 - 4 hours)**
```
User Testing
├─ William tests Richmond workflows (2 hours)
├─ Alicia tests Holt workflows (2 hours)
└─ Collect feedback

Refinements based on feedback
├─ Fix bugs identified
├─ Improve usability
├─ Add requested features (if quick)
└─ Document limitations

Deliverables:
✅ Database created and populated
✅ Excel tools operational
✅ Formatting complete
✅ User testing complete
✅ Weeks 9-10 complete! 🎉
```

---

### **WEEK 11 (Jan 20-24): Enhancements**
**Total: 12 hours**

#### **Monday-Tuesday (Jan 20-21) - 6 hours**
```
Data Extraction Tools
├─ Export to Excel (2 hours)
│  ├─ Query builder interface
│  ├─ Export results to new workbook
│  └─ Formatted for analysis
│
├─ Export to CSV (2 hours)
│  ├─ Batch export functionality
│  ├─ Custom query support
│  └─ Schedule exports
│
└─ Report Generator (2 hours)
   ├─ Pre-built report templates
   ├─ Cost summaries by plan
   ├─ Material usage reports
   └─ Price comparison reports

Output: Full export toolkit
```

#### **Wednesday-Thursday (Jan 22-23) - 4 hours**
```
Enhanced Documentation
├─ User Guide (2 hours)
│  ├─ How to use each tool
│  ├─ Common workflows
│  ├─ Troubleshooting
│  └─ FAQ
│
└─ Technical Documentation (2 hours)
   ├─ Database schema explained
   ├─ Table relationships diagram
   ├─ Coding standards reference
   ├─ Import procedures
   └─ Maintenance guide

Output: Comprehensive documentation
```

#### **Friday (Jan 24) - 2 hours**
```
Additional Features (based on feedback)
├─ Priority enhancements (1.5 hours)
│  └─ From user testing feedback
│
└─ Week 11 checkpoint (0.5 hours)
   ├─ Review all tools
   ├─ Prepare for testing phase
   └─ Create testing checklist

Deliverables:
✅ Export tools functional
✅ Documentation complete
✅ Additional features added
✅ Week 11 complete! 🎉
```

---

### **WEEK 12 (Jan 27-31): Testing & Sign-Off**
**Total: 12 hours**

#### **Monday-Tuesday (Jan 27-28) - 6 hours**
```
Comprehensive Testing
├─ Functional Testing (2 hours)
│  ├─ Test all tools end-to-end
│  ├─ Verify all workflows
│  ├─ Check error handling
│  └─ Document test results
│
├─ Data Validation Testing (2 hours)
│  ├─ Verify data integrity
│  ├─ Check all counts
│  ├─ Test pricing accuracy
│  └─ Validate relationships
│
└─ Performance Testing (2 hours)
   ├─ Query response times
   ├─ Tool load times
   ├─ Large dataset handling
   └─ Document benchmarks

Output: Complete test results
```

#### **Wednesday (Jan 29) - 3 hours**
```
User Acceptance Testing (UAT)
├─ William UAT - Richmond (1.5 hours)
│  ├─ Test real workflows
│  ├─ Validate accuracy
│  └─ Sign-off or feedback
│
└─ Alicia UAT - Holt (1.5 hours)
   ├─ Test real workflows
   ├─ Validate accuracy
   └─ Sign-off or feedback

Output: UAT sign-off or issue list
```

#### **Thursday (Jan 30) - 2 hours**
```
Bug Fixes & Final Adjustments
├─ Fix any critical bugs (1 hour)
├─ Make final adjustments (0.5 hours)
└─ Retest if needed (0.5 hours)

Output: All critical issues resolved
```

#### **Friday (Jan 31) - 1 hour**
```
Production Sign-Off
├─ Final review (0.25 hours)
│  ├─ All deliverables complete
│  ├─ All tests passed
│  └─ Team trained
│
├─ Create handoff documentation (0.5 hours)
│  ├─ System overview
│  ├─ Support procedures
│  ├─ Maintenance schedule
│  └─ Contact information
│
└─ Project completion (0.25 hours)
   ├─ Celebrate success! 🎊
   ├─ Document lessons learned
   └─ Plan ongoing support

Deliverables:
✅ All tests passed
✅ UAT sign-off complete
✅ Bugs fixed
✅ Documentation finalized
✅ Team trained
✅ Production-ready system
✅ Week 12 complete! 🎉
✅ PROJECT COMPLETE! 🎊

Project Success Criteria:
✓ All 44 Richmond plans + 47 Holt plans active
✓ 65,000+ materials in unified system
✓ Database operational
✓ Excel tools working
✓ Pricing data current
✓ Zero critical bugs
✓ <5% data error rate
✓ Team trained and confident
✓ Documentation complete
✓ MERGER READY! 🚀
```

---

## 📈 PROGRESS TRACKING

### Weekly Checkpoint Template

```markdown
# Week [X] Checkpoint - [Date]

## Planned vs Actual
- Hours Planned: [X]
- Hours Actual: [X]
- Variance: [X]

## Deliverables Status
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

## Accomplishments
- 
- 
- 

## Challenges Encountered
- 
- 

## Next Week Preview
- 
- 

## Risk Updates
- 

## Team Feedback
-
```

### Overall Project Metrics

**Time Investment:**
```
Phase 1 (Weeks 1-4): 52 hours
Phase 2 (Weeks 5-8): 32 hours
Phase 3 (Weeks 9-12): 64 hours
Total: 148 hours (12.3 hours/week)
```

**Content Metrics:**
```
Richmond Plans: 44 total
Holt Plans: 50 total
Total Plans: 94
Material Line Items: 64,977
Unique SKUs: ~700+
Database Tables: 10 core + 11 supporting = 21 total
```

**Quality Targets:**
```
Data Accuracy: >95%
Query Response: <1 second
Tool Load Time: <5 seconds
User Satisfaction: >80% positive
Pricing Errors: 0 (zero tolerance)
```

---

## ⚠️ RISK MANAGEMENT

### Top Risks & Mitigation

**1. Architecture Decisions Wrong**
```
Impact: HIGH (4-6 weeks rework)
Probability: LOW (with Week 1 process)
Status: Mitigated by:
├─ Tuesday's thorough decision process
├─ Real data testing
├─ Team validation Friday
├─ Small pilot in Week 2
└─ Buffer time in schedule
```

**2. File Size Growth**
```
Impact: MEDIUM (performance issues)
Probability: HIGH (inevitable with data growth)
Current Status: Monitored
Mitigation:
├─ Database migration (Weeks 9-10)
├─ Weekly file size monitoring
├─ Compress/archive old data
└─ SharePoint or SQL fallback
Trigger: File >100 MB
```

**3. Team Adoption**
```
Impact: HIGH (wasted effort if unused)
Probability: LOW (team involved throughout)
Mitigation:
├─ Weekly involvement (Week 1 validation, etc.)
├─ Regular demos of new features
├─ Make new way easier than old
├─ Celebrate wins publicly
└─ Manager support secured
```

**4. Data Quality Issues**
```
Impact: MEDIUM (errors in database)
Probability: MEDIUM (65K records)
Mitigation:
├─ Validation scripts (Week 2)
├─ Small batch testing first
├─ Incremental imports with validation
├─ Manual spot-checks
├─ Team data review
└─ Rollback procedures ready
```

**5. Merger Timeline Acceleration**
```
Impact: HIGH (incomplete system)
Probability: MEDIUM (corporate changes)
Mitigation:
├─ Prioritize Weeks 1-8 (core functionality)
├─ MVP checkpoint at Week 8 (100% plans)
├─ Weeks 9-12 can compress if needed
├─ Communicate progress regularly
└─ Document MVP vs nice-to-have
```

**6. Richmond Structure Unknown**
```
Impact: MEDIUM (updater rework)
Probability: LOW (Week 1 Day 1 audit)
Status: Mitigated
Mitigation:
├─ Monday audit complete ✅
├─ Document actual vs assumed
├─ Build updater incrementally
├─ Test on copy first
└─ Buffer time in Week 2
```

---

## 📞 SUPPORT & ESCALATION

### Team Contacts

**Richmond Expertise:**
```
Contact: William Hatley (Inside Sales)
Topics:
├─ Item numbering decisions
├─ Plan usage priorities
├─ Price level validation
└─ Richmond workflows
Availability: Week 1 Friday, ongoing as needed
```

**Holt Expertise:**
```
Contact: Alicia Vandehey (Administrative Support)
Topics:
├─ Community mappings
├─ Plan Index accuracy
├─ Holt workflows
└─ Current processes
Availability: Week 1 Friday, ongoing as needed
```

**Manager:**
```
Contact: Dave Templeton (assumed)
Topics:
├─ Resource allocation
├─ Timeline approvals
├─ Strategic decisions
└─ Merger readiness
Escalation: As needed for major decisions
```

### Decision Authority Matrix

**Corey Decides:**
- Technical implementation details
- Tool feature priorities
- Testing procedures
- Daily work schedule
- Database design specifics

**Team Input Required:**
- Coding standards (Week 1 Friday)
- Table naming convention (Week 3)
- Formatting theme (Week 9)
- UAT validation (Week 12)
- Feature prioritization

**Manager Approval Required:**
- Database strategy (Week 9)
- Major timeline changes (>1 week)
- Additional resource needs
- Merger readiness sign-off (Week 12)

---

## ✅ SUCCESS CRITERIA

### Weekly Success Indicators

**Week 1:** Architecture locked, team aligned
**Week 2:** Pricing tools operational both builders
**Week 3:** Standardization complete
**Week 4:** Foundation solid, ready for imports
**Week 5:** First imports successful
**Week 6:** Import momentum building
**Week 7:** Most plans complete
**Week 8:** 100% plan coverage achieved
**Week 9-10:** Database operational, tools working
**Week 11:** Documentation complete, enhancements done
**Week 12:** All tests passed, production ready

### Final Success Criteria

**Technical:**
```
✓ All systems standardized
✓ All tools working correctly
✓ All plans imported (100%)
✓ Database operational
✓ All tests passed
✓ Zero critical bugs
✓ <5% data error rate
✓ Performance meets targets
```

**Operational:**
```
✓ Team trained on new system
✓ Material orders <2 minutes (from 15-20)
✓ Price lookups instant (from 5-10 min)
✓ Both builders using daily
✓ Documentation complete and accessible
✓ Backup procedures in place
✓ Support process defined
```

**Strategic:**
```
✓ Merger-ready system delivered
✓ 8 weeks production testing window
✓ Scalable for Manor Homes
✓ Knowledge transfer complete
✓ No single points of failure
✓ Sustainable long-term
✓ Competitive advantage realized
```

---

## 💰 RETURN ON INVESTMENT

### Time Savings Analysis

**Current Manual Process Times:**
```
Material order creation: 15-20 minutes
Price lookup: 5-10 minutes per item
Plan comparison: 30-60 minutes
Price update: 30 minutes per update
Cross-plan queries: 1-2 hours (or impossible)
Data inconsistency fixes: 2-4 hours/week
```

**New Database System Times:**
```
Material order creation: 2-3 minutes (85% reduction)
Price lookup: <10 seconds (95% reduction)
Plan comparison: 2 minutes (95% reduction)
Price update: 5 minutes (85% reduction)
Cross-plan queries: Seconds (new capability)
Data inconsistency: Eliminated (single source)
```

**Annual Value Calculation:**
```
Material orders: 2-3/day × 17 min saved × 250 days = 213 hours/year
Price lookups: 10/day × 9 min saved × 250 days = 375 hours/year
Plan comparisons: 2/week × 43 min saved × 50 weeks = 72 hours/year
Price updates: 12/year × 25 min saved = 5 hours/year
Data fixes: 3 hours/week × 50 weeks = 150 hours/year
TOTAL: 815 hours/year saved

At $40/hour blended rate: $32,600/year
Over 3 years: $97,800
```

**Project Investment:**
```
148 hours × $40/hour = $5,920
Payback Period: 2 weeks
3-Year ROI: 1,552%
```

**Intangible Benefits:**
```
├─ Merger readiness (priceless)
├─ Knowledge preservation
├─ Team capability growth
├─ Competitive advantage
├─ Reduced errors and rework
├─ Faster decision-making
├─ Better customer service
└─ Scalability for growth
```

---

## 📚 DOCUMENT HIERARCHY

### This Master Plan is Authoritative For:
- Overall timeline and phases
- Week-by-week task breakdown
- Hour estimates and resource allocation
- Success criteria and metrics
- Risk management strategy
- Team roles and responsibilities

### Supporting Documents:

**Daily Execution:**
- 03_FOUNDATION_GUIDE.md (Week 1 detailed guide)
- Richmond_Import_Checklist.md (Weeks 5-8 daily tasks)
- Table_Inventory_Template.md (Week 3 work)

**Technical Reference:**
- 04_CODING_STANDARDS.md (Architecture decisions)
- 05_REFERENCE_DATA.md (Analysis findings)
- schema_design_v1.sql (Database structure)

**Quick Reference:**
- 01_PROJECT_OVERVIEW.md (Project context)
- README.md (Navigation entry point)
- MIGRATION_MAP.md (What changed in v2.0)

### When Documents Conflict:

**Precedence Order:**
1. This Master Plan (02_MASTER_PLAN.md)
2. Your direct observations of BAT files
3. Team knowledge (William/Alicia input)
4. Supporting technical documentation

**If conflict found:** Note in weekly checkpoint, update this Master Plan

---

## 📝 VERSION HISTORY

**Version 2.0 - November 10, 2025**
- Enhanced Week 1 with architecture decision day (Tuesday)
- Added Monday's completed work
- Clarified import groupings (35 new + 9 existing = 44 total)
- Added Prism SQL migration strategy
- Improved task breakdowns with time estimates
- Added detailed deliverables for each day
- Enhanced risk mitigation strategies
- Consolidated from BAT_MASTER_PLAN_INTEGRATED.md

**Version 1.0 - November 9, 2025**
- Original integrated master plan
- 12-week timeline established
- Phase structure defined

---

## 🎯 IMMEDIATE NEXT STEPS

### Current Status: Week 1, Tuesday (Nov 12) 🔴

**Today's Priority:** Architecture Decisions (6 hours)

**What You Need:**
- ✅ Monday's analysis complete (item_numbering_patterns.txt, richmond_structure.txt)
- ✅ Both BAT files accessible
- ✅ Material databases available
- ✅ 6 hours blocked on calendar
- ✅ William available for questions
- ⏳ Ready to make critical decisions

**Today's Agenda:**
1. **Session 1 (2 hours):** Map Richmond & Holt hierarchies
2. **Session 2 (2 hours):** Make 3 architecture decisions
3. **Session 3 (2 hours):** Design database schema

**Critical:** These decisions determine project success. Take time to get them right.

**Tomorrow:** Draft coding standards based on today's decisions
**Friday:** Team validation with William and Alicia

---

## 🎉 FINAL MOTIVATION

### Why This Will Succeed

**Strong Foundation:**
✅ Monday's 45-page analysis complete
✅ Real data examined (746 items, 94 plans)
✅ Problems identified and documented
✅ Tuesday's architecture process designed

**Clear Execution Plan:**
✅ 12-week timeline with 8-week buffer
✅ Weekly deliverables defined
✅ Success criteria at every checkpoint
✅ Risks identified and mitigated

**Right Technology:**
✅ SQLite → Prism SQL migration path
✅ Python for automation
✅ Excel for familiar interface
✅ Standard SQL for queries

**Team Commitment:**
✅ William & Alicia involved (Week 1 Friday)
✅ Addresses real pain points
✅ Significant time savings proven
✅ March 2026 merger creates urgency

### You've Got This! 💪

**This Master Plan is your roadmap.**
**Follow it week by week.**
**Adjust as needed, but keep the end goal clear.**
**By February 28, you'll have a unified, merger-ready system.**

**Let's build something amazing! 🚀**

---

**Document Owner:** Corey Boser  
**Last Updated:** November 10, 2025  
**Next Review:** After Week 1 completion  
**Status:** Active - Primary Execution Guide

---

**Ready? Today is Tuesday. Time for architecture decisions. →**  
**See 03_FOUNDATION_GUIDE.md for detailed Tuesday session guide**
