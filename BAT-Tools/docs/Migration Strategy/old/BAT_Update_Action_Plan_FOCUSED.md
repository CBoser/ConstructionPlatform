# BAT UPDATE - FOCUSED ACTION PLAN
## Richmond & Holt Homes - November 2025 Edition
**Analysis Date:** November 7, 2025  
**Target Completion:** February 28, 2026  
**Status:** Based on November 2025 BAT versions

---

## CURRENT STATE SUMMARY

### ✅ ALREADY COMPLETED
1. **Plan Index** - Both BATs have structured Plan Index (10 columns)
   - Richmond: 9 plans indexed
   - Holt: 47 plans indexed
2. **Material List Index** - Both BATs have indexMaterialListsbyPlan
   - Richmond: 1,596 line items
   - Holt: 9,373 line items
3. **Subdivision Reference** - Both BATs have reference_Subdivisions
   - Richmond: 10 subdivisions
   - Holt: 12 subdivisions
4. **Pricing Updater** - Both BATs have PRICING UPDATE sheet
5. **Price Schedule** - Holt BAT has schedule_PriceSchedule (needs review)

### ❌ CRITICAL GAPS
1. **Table Naming** - No named tables following conventions on plan sheets
2. **Base Coding System** - No standardized codes documented
3. **Richmond Plans** - Only 9 plans vs 80+ needed
4. **Price Schedule** - Richmond missing, Holt needs review/enhancement
5. **Price Change Log** - Neither BAT has change tracking
6. **Cross Reference** - No Holt-specific plan/option mapping sheets
7. **Arch/Engineering Dates** - Not in Plan Index
8. **Price Level Issues** - Updater can't target specific columns

---

## PRIORITY MATRIX

### 🔴 PRIORITY 1 - CRITICAL (Blocks everything else)
**Complete by:** Week 1-2

1. **Determine Base Coding System**
   - Review current item numbering
   - Document elevation codes
   - Document option numbering
   - Create standardized format
   - **Status:** NOT STARTED
   - **Owner:** Corey + Team input needed

2. **Fix Pricing Updater Tool**
   - Diagnose column selection issue
   - Redesign to target specific price levels
   - Add preview functionality
   - Test thoroughly
   - **Status:** TOOL EXISTS but BROKEN
   - **Owner:** Corey (VBA work)

### 🟡 PRIORITY 2 - HIGH (Enables efficiency)
**Complete by:** Week 3-6

3. **Incorporate Price Schedule into Richmond BAT**
   - Review Holt's schedule_PriceSchedule structure
   - Design Richmond price schedule format
   - Import Item Pricing data
   - Link to all plan sheets
   - **Status:** NOT STARTED
   - **Depends on:** Item 1 (coding system)

4. **Map Out Table Types & Name Formats**
   - Define naming convention (e.g., bidtotals_1649_GG_A)
   - Inventory all existing tables
   - Create rename script
   - **Status:** NOT STARTED
   - **Depends on:** Item 1 (coding system)

5. **Create Holt Cross-Reference Sheets**
   - Plan mapping (by community)
   - Option mapping (by plan)
   - Document in separate sheets
   - **Status:** NOT STARTED
   - **Depends on:** Item 1 (coding system)

### 🟢 PRIORITY 3 - MEDIUM (Improves completeness)
**Complete by:** Week 7-10

6. **Add All Richmond Plans**
   - Inventory missing plans (70+ to add)
   - Prioritize by usage frequency
   - Add systematically
   - Format consistently
   - **Status:** 9/80+ complete
   - **Depends on:** Item 4 (naming convention)

7. **Update Plan Index with Arch/Engineering Dates**
   - Add columns to Plan Index
   - Research actual dates
   - Populate where available
   - Flag TBD entries
   - **Status:** COLUMNS MISSING

8. **Format All Tables with Theme**
   - Define color scheme
   - Create formatting macro
   - Apply to all tables
   - **Status:** NOT STARTED
   - **Depends on:** Item 4 (tables named/mapped)

### 🔵 PRIORITY 4 - NICE TO HAVE (Polish & optimization)
**Complete by:** Week 11-16

9. **Build Price Change Functionality**
   - Create price_change_log sheet
   - Auto-log all updates
   - Add reporting
   - **Status:** NOT STARTED

10. **Determine Database Storage Strategy**
    - External file vs embedded
    - SharePoint integration
    - Sync strategy
    - **Status:** NOT STARTED

11. **Enhance Extractor VBA**
    - Use current extractor as base
    - Add filtering
    - Add multiple formats
    - Log iterations
    - **Status:** NOT STARTED

12. **Create Testing Rubric & Log**
    - Define test scenarios
    - Build test log
    - Document results
    - **Status:** NOT STARTED

---

## RECOMMENDED 12-WEEK SEQUENCE

### WEEKS 1-2: Foundation & Critical Fixes
**Goal:** Unblock everything else

#### Week 1: Coding System & Documentation
- [ ] **Day 1-2:** Audit current coding (Richmond Item Pricing, Holt IWP/RL)
- [ ] **Day 2-3:** Design unified coding standard document
- [ ] **Day 3-4:** Get team review/approval on coding
- [ ] **Day 4-5:** Create base code reference sheet for each BAT

**Deliverable:** `BAT_Coding_Standards_v1.0.docx` + Reference sheets

#### Week 2: Fix Pricing Updater
- [ ] **Day 1:** Diagnose current updater VBA issues
- [ ] **Day 2:** Design new interface & logic
- [ ] **Day 3-4:** Rebuild VBA with column-specific targeting
- [ ] **Day 5:** Test all update scenarios

**Deliverable:** Working Pricing Updater v2.0

### WEEKS 3-4: Price Schedule Integration
**Goal:** Get pricing infrastructure solid

#### Week 3: Richmond Price Schedule
- [ ] **Day 1:** Review Holt's schedule_PriceSchedule structure
- [ ] **Day 2:** Design Richmond schedule format
- [ ] **Day 3:** Import Item Pricing data
- [ ] **Day 4:** Add lookup formulas
- [ ] **Day 5:** Test price retrieval

**Deliverable:** schedule_PriceSchedule in Richmond BAT

#### Week 4: Price Schedule Enhancement & Testing
- [ ] **Day 1-2:** Review/fix Holt price schedule (odd column header issue)
- [ ] **Day 3:** Link schedules to all plan sheets
- [ ] **Day 4:** Test pricing across 20 plans
- [ ] **Day 5:** Document price schedule usage

**Deliverable:** Both BATs with working price schedules

### WEEKS 5-6: Table Naming & Structure
**Goal:** Standardize all table structures

#### Week 5: Define & Map Tables
- [ ] **Day 1:** Document table naming convention
- [ ] **Day 2:** Inventory all existing tables (both BATs)
- [ ] **Day 3:** Map table types (bidtotals, pricing, options, materials)
- [ ] **Day 4:** Create rename plan
- [ ] **Day 5:** Build VBA rename tool

**Deliverable:** Table inventory & rename automation

#### Week 6: Rename & Validate
- [ ] **Day 1-2:** Rename all Richmond tables
- [ ] **Day 2-3:** Rename all Holt tables
- [ ] **Day 4:** Validate all formula links still work
- [ ] **Day 5:** Fix any broken references

**Deliverable:** All tables following naming convention

### WEEKS 7-8: Cross-Reference & Plan Details
**Goal:** Complete plan documentation

#### Week 7: Holt Cross-Reference
- [ ] **Day 1-2:** Create plan cross-reference sheet
  - Map plans to communities
  - Document elevation variations
- [ ] **Day 3-4:** Create option cross-reference sheet
  - Map options to plans
  - Document community-specific options
- [ ] **Day 5:** Test cross-reference lookups

**Deliverable:** Cross-reference sheets in Holt BAT

#### Week 8: Plan Index Enhancement
- [ ] **Day 1:** Add Arch Date column
- [ ] **Day 2:** Add Engineering Date column
- [ ] **Day 3-4:** Research and populate dates
- [ ] **Day 5:** Add data validation rules

**Deliverable:** Enhanced Plan Index in both BATs

### WEEKS 9-10: Plan Addition (Richmond)
**Goal:** Get Richmond to feature parity with Holt

#### Week 9: Add 30 High-Priority Plans
- [ ] **Day 1:** Identify 30 most-used plans
- [ ] **Day 2-4:** Create plan sheets (10 per day)
- [ ] **Day 5:** Update Plan Index, test formulas

**Deliverable:** 30 new Richmond plan sheets

#### Week 10: Add Remaining Plans
- [ ] **Day 1-4:** Create remaining plan sheets
- [ ] **Day 5:** Final validation & testing

**Deliverable:** All Richmond plans in BAT

### WEEKS 11-12: Formatting & Testing
**Goal:** Polish and validate

#### Week 11: Formatting & Theme
- [ ] **Day 1:** Define formatting standards
- [ ] **Day 2:** Create formatting VBA macro
- [ ] **Day 3-4:** Apply to all tables
- [ ] **Day 5:** Visual QA check

**Deliverable:** Consistently formatted BATs

#### Week 12: Testing & Documentation
- [ ] **Day 1-2:** Create test scenarios
- [ ] **Day 2-3:** Execute comprehensive tests
- [ ] **Day 4:** Fix critical issues
- [ ] **Day 5:** Final documentation update

**Deliverable:** Production-ready BATs with test log

---

## DETAILED TASK BREAKDOWNS

### TASK 1: Determine Base Coding System ⭐ START HERE

#### Context:
You need a standardized format for all identifiers to ensure consistency across both BATs and enable future automation.

#### Sub-tasks:
1. **Audit Current Systems** (4 hours)
   ```
   Richmond Item Numbers:
   - Review all items in "Item Pricing" sheet
   - Document numbering pattern
   - Identify prefixes, suffixes, ranges
   - Note any inconsistencies
   
   Holt Item Numbers:
   - Review IWP sheet items
   - Review RL sheet items
   - Compare with Richmond
   - Document overlaps
   ```

2. **Elevation Codes** (2 hours)
   ```
   Current Patterns:
   - Single letter: A, B, C, D, E, I
   - Multiple letters: AB, CD, ABC, BCD
   - Elevation combinations by plan
   
   Standardize to:
   - Single character codes where possible
   - Document multi-elevation plans
   - Create elevation lookup table
   ```

3. **Option Numbering** (3 hours)
   ```
   Review:
   - Q1, Q2, Q3, Q4 2025 Options Pricing sheets
   - Document option number format
   - Identify option categories
   - Note plan-specific vs universal options
   ```

4. **Community Codes** (1 hour)
   ```
   Already defined in reference_Subdivisions:
   - Extract community abbreviations
   - Validate uniqueness
   - Document in coding standard
   ```

5. **Create Coding Standard Document** (2 hours)
   ```
   Document structure:
   Builder Codes:
   - RA = Richmond American
   - HH = Holt Homes
   
   Plan Numbers:
   - 4-digit format: 1649, 1555, etc.
   - Preserve existing numbering
   
   Elevations:
   - Single char preferred: A, B, C, D, E, I
   - Multi-char when necessary: AB, CD
   
   Communities (Holt only):
   - 2-char codes from reference_Subdivisions
   - GG, CR, HH, WR, etc.
   
   Items:
   - Preserve builder-specific formats
   - Map overlapping items
   ```

**Output:** `BAT_Coding_Standards.docx` + Reference sheet in each BAT

---

### TASK 2: Fix Pricing Updater Tool ⭐ CRITICAL

#### Current Issues:
- Cannot read/change specific columns
- Changes all prices instead of necessary ones
- No price level targeting

#### Solution Design:

```vba
' New Interface Requirements:
UserForm: frmPricingUpdater

Controls:
1. ListBox (multi-select): Item selection
2. CheckBoxes: Price level selection (L1, L2, L3, L4, L5, IWP, RL)
3. RadioButtons: Update method
   - Flat amount ($)
   - Percentage (%)
   - Replace value
4. TextBox: Amount/Percentage value
5. Button: Preview Changes
6. Button: Apply Changes
7. Button: Undo Last Update
8. DataGridView: Preview table

Logic:
- Read price schedule sheet
- Filter to selected items
- Filter to selected price levels
- Calculate new prices based on method
- Show preview
- On confirm, update only selected cells
- Log all changes to price_change_log sheet
```

#### Implementation Steps:

1. **Diagnose Current Code** (2 hours)
   - Export current PRICING UPDATE VBA
   - Document what it does vs what it should do
   - Identify root cause of issues

2. **Design New Interface** (2 hours)
   - Sketch UserForm layout
   - Define all controls
   - Write pseudo-code logic

3. **Build New UserForm** (4 hours)
   - Create frmPricingUpdater
   - Add all controls with properties
   - Design layout for usability

4. **Code Core Functionality** (6 hours)
   ```vba
   Main procedures needed:
   - LoadItems() ' Populate item listbox
   - PreviewChanges() ' Calculate & show preview
   - ApplyChanges() ' Write to price schedule
   - LogChanges() ' Write to change log
   - UndoLastUpdate() ' Revert last change
   - ValidateInputs() ' Check for errors
   ```

5. **Add Error Handling** (2 hours)
   - Validate all inputs
   - Handle missing price levels
   - Handle formula protection
   - User-friendly error messages

6. **Testing** (4 hours)
   - Test each update method
   - Test single item
   - Test multiple items
   - Test all price level combinations
   - Test undo functionality
   - Document test results

**Output:** Working Pricing Updater v2.0 in both BATs

---

### TASK 3: Incorporate Price Schedule into Richmond BAT

#### Current State:
- Holt BAT has schedule_PriceSchedule (332 rows)
- Richmond has "Item Pricing" but not structured as schedule
- Need unified structure

#### Recommended Structure:

```
Sheet Name: schedule_PriceSchedule

Columns:
A: Item_ID (unique identifier)
B: BFS_SKU (vendor SKU)
C: Item_Number (builder item #)
D: Description
E: Category
F: UOM (unit of measure)
G: Cost_Code
H: Base_Cost
I: Price_Level_1
J: Price_Level_2
K: Price_Level_3
L: Price_Level_4
M: Price_Level_5
N: Margin_Pct_L1
O: Margin_Pct_L2
P: Margin_Pct_L3
Q: Margin_Pct_L4
R: Margin_Pct_L5
S: Effective_Date
T: Last_Updated
U: Updated_By
V: Notes
```

#### Implementation:

1. **Analyze Holt's Price Schedule** (2 hours)
   - Current odd structure (1 column header?)
   - Extract actual data structure
   - Identify what works/doesn't work

2. **Design Richmond Structure** (2 hours)
   - Use recommended columns above
   - Map from Item Pricing sheet
   - Plan for quarterly updates

3. **Create Sheet & Import Data** (4 hours)
   - Create schedule_PriceSchedule sheet
   - Import from "Item Pricing"
   - Add calculated margin columns
   - Apply formatting

4. **Add Lookup Formulas** (3 hours)
   ```excel
   Add to each plan sheet's pricing section:
   =XLOOKUP(ItemNumber, schedule_PriceSchedule[Item_Number], 
            schedule_PriceSchedule[Price_Level_X])
   
   Or use INDEX/MATCH if XLOOKUP unavailable
   ```

5. **Test Integration** (3 hours)
   - Test lookups on 10 plan sheets
   - Verify prices match expected
   - Test with missing items
   - Document any issues

**Output:** schedule_PriceSchedule in Richmond BAT, linked to plans

---

### TASK 4: Map Out Table Types & Name Formats

#### Goal:
Every table should have a standardized, descriptive name that indicates:
- Table type
- Plan number
- Community (if applicable)
- Elevation (if applicable)

#### Naming Convention:

```
Format: tableType_planNumber_community_elevation

Table Types:
- bidtotals    : Quote summary tables
- materialist  : Material takeoff tables
- pricing      : Item pricing tables
- options      : Option pricing tables
- schedule     : Master schedules

Examples:
- bidtotals_1649_GG_A
- materialist_1555_CR_B
- options_1632_HH_CD
- pricing_1547_WR_base
- schedule_PriceSchedule (singular, master)
```

#### Implementation:

1. **Document Convention** (1 hour)
   - Write naming rules
   - Show examples
   - Define special cases

2. **Inventory All Tables** (4 hours)
   ```
   For each BAT:
   - List all worksheet names
   - Identify table types
   - Proposed new names
   - Flag conflicts
   ```
   
   **Output:** `Table_Inventory.xlsx`
   Columns: Current_Name | Sheet_Name | Table_Type | Plan | Community | Elevation | Proposed_Name | Status

3. **Create Rename VBA Tool** (4 hours)
   ```vba
   Features:
   - Read inventory Excel
   - Loop through each sheet
   - Rename tables (if they exist as named ranges)
   - Update formula references
   - Log results
   - Rollback capability
   ```

4. **Test on Copy** (2 hours)
   - Duplicate one BAT
   - Run rename tool
   - Verify formulas still work
   - Check for broken references

5. **Execute on Production** (2 hours)
   - Backup both BATs
   - Run rename tool on Richmond
   - Verify
   - Run rename tool on Holt
   - Verify

**Output:** All tables renamed to convention, rename tool for future use

---

### TASK 5: Create Holt Cross-Reference Sheets

#### Purpose:
Holt has community-specific plans and options. Need easy lookup:
- Which plans are in which community?
- Which elevations are available per community?
- Which options apply to which plans?

#### Sheets to Create:

**Sheet 1: xref_Plans**
```
Columns:
- Plan_Number
- Plan_Name  
- Community_Code
- Community_Name
- Elevations_Available
- Typical_Garage
- Living_Area_Total
- Status (Active/Inactive)
- Notes
```

**Sheet 2: xref_Options**
```
Columns:
- Option_Number
- Option_Description
- Applicable_Plans (comma-separated)
- Applicable_Communities (comma-separated)
- Price_Level_IWP
- Price_Level_RL
- Category
- Status
- Notes
```

**Sheet 3: xref_PlansByComm