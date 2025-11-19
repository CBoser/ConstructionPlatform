# BAT UPDATE - QUICK START CHECKLIST
## Your To-Do List → Prioritized Action Plan
**Start Date:** Week of November 11, 2025

---

## YOUR TASK → STATUS & PRIORITY

### ⭐ START WEEK 1 (Nov 11-15)

#### 1. Determine a base code for all customers, plans, elevations, options
**→ Your Task:** "Determine a base code for all customers, plans, elevations, options"  
**→ Sub-tasks:** "Review current code systems, review documentation and adjust as needed"

**Status:** 🔴 NOT STARTED - **BLOCKS EVERYTHING ELSE**  
**Time:** 12 hours (spread over 3 days)  
**Priority:** CRITICAL - Do this FIRST

**Action Steps:**
- [Week 1, Day 1-2] Audit Richmond Item Pricing sheet numbering
- [Week 1, Day 1-2] Audit Holt IWP/RL sheet numbering  
- [Week 1, Day 2] Document elevation codes from Plan Index
- [Week 1, Day 3] Review Q1-Q4 Options Pricing for option numbers
- [Week 1, Day 3] Draft coding standard document
- [Week 1, Day 4] Review with team (William, Alicia)
- [Week 1, Day 5] Finalize and add reference sheet to both BATs

**Deliverable:** `BAT_Coding_Standards.docx`

---

#### 2. Map out table types and their name formats
**→ Your Task:** "Map out table types and their name formats"

**Status:** 🔴 NOT STARTED - Depends on Task #1  
**Time:** 8 hours  
**Priority:** CRITICAL

**Action Steps:**
- [Week 1, Day 5] Define naming convention (after coding system done)
  ```
  Format: tableType_planNumber_community_elevation
  Types: bidtotals, materialist, pricing, options, schedule
  ```
- [Week 2, Day 1] Inventory all current table names (use script)
- [Week 2, Day 2] Map each to new convention

**Deliverable:** `Table_Naming_Convention.docx` + `Table_Inventory.xlsx`

---

### ⭐ START WEEK 2 (Nov 18-22)

#### 3. Review, update, and test pricing updater tool
**→ Your Task:** "Review, update, and test pricing updater tool"  
**→ Sub-task:** "Fix price level situation (currently unable to read and change specific columns...)"  
**→ Sub-task:** "Add price change functionality"

**Status:** 🟡 TOOL EXISTS BUT BROKEN  
**Time:** 16 hours  
**Priority:** CRITICAL

**Action Steps:**
- [Week 2, Day 1] Export and review current PRICING UPDATE VBA code
- [Week 2, Day 1] Document specific issues (can't target columns)
- [Week 2, Day 2] Design new UserForm interface
- [Week 2, Day 3] Rebuild VBA with:
  - Column-specific targeting (L1, L2, L3, L4, L5, IWP, RL)
  - Item selection (single or multi)
  - Update methods (flat $, %, replace)
  - Preview before apply
- [Week 2, Day 4] Add change logging to new sheet
- [Week 2, Day 4] Add undo capability
- [Week 2, Day 5] Test all scenarios

**Deliverable:** Working `Pricing_Updater_v2.0` + `price_change_log` sheet in both BATs

---

#### 4. Incorporate price schedule into BAT
**→ Your Task:** "Incorporate price schedule into BAT"

**Status:** 🟡 PARTIAL - Holt has schedule_PriceSchedule, Richmond doesn't  
**Time:** 12 hours  
**Priority:** HIGH

**Action Steps:**
- [Week 2, Day 1] Review Holt's schedule_PriceSchedule structure
- [Week 2, Day 2] Fix odd column header issue in Holt
- [Week 2, Day 3] Create schedule_PriceSchedule in Richmond BAT
- [Week 2, Day 4] Import Item Pricing data into schedule
- [Week 2, Day 5] Add lookup formulas linking to plan sheets
- [Week 2, Day 5] Test price retrieval on 10 plans

**Deliverable:** `schedule_PriceSchedule` in Richmond, enhanced in Holt

---

### WEEK 3-4 (Nov 25 - Dec 6)

#### 5. Update any table necessary
**→ Your Task:** "Update any table necessary"

**Status:** 🔴 NOT STARTED - Depends on naming convention (Task #2)  
**Time:** 8 hours  
**Priority:** HIGH

**Action Steps:**
- [Week 3, Day 1] Create VBA table rename tool
- [Week 3, Day 2-3] Test rename tool on BAT copy
- [Week 3, Day 4] Execute rename on Richmond BAT
- [Week 3, Day 5] Execute rename on Holt BAT
- [Week 3, Day 5] Validate all formulas still work

**Deliverable:** All tables renamed to standard convention

---

#### 6. Create cross reference sheet for Holt specific plans and options
**→ Your Task:** "Create cross reference sheet for Holt specific plans and options"

**Status:** 🔴 NOT STARTED  
**Time:** 6 hours  
**Priority:** HIGH

**Action Steps:**
- [Week 3, Day 1] Create xref_Plans sheet (plan → community mapping)
- [Week 3, Day 2] Create xref_Options sheet (options → plans/communities)
- [Week 3, Day 3] Create xref_PlansByCommunity (grouped view)
- [Week 3, Day 4] Add lookup formulas for easy reference
- [Week 3, Day 5] Test cross-reference lookups

**Deliverable:** 3 cross-reference sheets in Holt BAT

---

#### 7. Update all plan details and add arch and engineering dates
**→ Your Task:** "Update all plan details and add arch and engineering dates"  
**→ Sub-task:** "Which details are necessary?"

**Status:** 🟡 PARTIAL - Plan Index exists but missing arch/eng dates  
**Time:** 8 hours  
**Priority:** MEDIUM

**Details Currently in Plan Index:**
✅ Plan Sheet, Model, Elevations, Garage, Living Areas, Garage Area, Date, Bid Number

**Details to Add:**
- Arch Date (when architectural plans finalized)
- Engineering Date (when engineering complete)
- Status (Active/Inactive/Pending)
- Last Updated (tracking)

**Action Steps:**
- [Week 4, Day 1] Add Arch_Date column to Plan Index (both BATs)
- [Week 4, Day 1] Add Engineering_Date column
- [Week 4, Day 1] Add Status column
- [Week 4, Day 2-3] Research actual dates (from files, emails, records)
- [Week 4, Day 4] Populate known dates, flag TBD
- [Week 4, Day 5] Add data validation rules

**Deliverable:** Enhanced Plan Index with 13 columns (from 10)

---

### WEEK 5-8 (Dec 9 - Jan 3)

#### 8. Add all plans and format them to this workbook
**→ Your Task:** "Add all plans and format them to this workbook"

**Status:** 🟡 PARTIAL  
- Richmond: 9/80+ plans (11% complete)
- Holt: 47/50+ plans (94% complete)

**Time:** 40 hours (Richmond), 4 hours (Holt)  
**Priority:** MEDIUM

**Action Steps - Richmond (Primary Focus):**
- [Week 5, Day 1] List all missing plans (from actual jobs)
- [Week 5, Day 2] Prioritize by usage frequency
- [Week 5-6] Add 30 high-priority plans (10 per week)
- [Week 7-8] Add remaining 40+ plans
- [Week 8, Day 5] Update Plan Index with all new plans

**Action Steps - Holt (Quick finish):**
- [Week 5, Day 1] Identify 3-5 missing plans
- [Week 5, Day 2] Add missing plans

**Deliverable:** Complete plan coverage in both BATs

---

#### 9. Format all tables using the conventions/theme
**→ Your Task:** "Format all tables using the conventions/theme"

**Status:** 🔴 NOT STARTED - Should wait until tables renamed  
**Time:** 8 hours  
**Priority:** MEDIUM

**Action Steps:**
- [Week 6, Day 1] Define formatting standards (colors, fonts, borders)
- [Week 6, Day 2] Create formatting VBA macro
- [Week 6, Day 3] Apply to Richmond tables
- [Week 6, Day 4] Apply to Holt tables
- [Week 6, Day 5] Visual QA review

**Deliverable:** Consistently formatted tables in both BATs

---

### WEEK 9-10 (Jan 6-17)

#### 10. Incorporate all plans into a material list index
**→ Your Task:** "Incorporate all plans into a material list index"

**Status:** ✅ DONE - `indexMaterialListsbyPlan` exists!  
- Richmond: 1,596 line items indexed
- Holt: 9,373 line items indexed

**Maintenance Action:**
- [Week 9, Day 1] Verify all plans are in index
- [Week 9, Day 2] Add any new plans as they're created
- [Week 9, Day 2] Add search/filter functionality if needed
- [Week 9, Day 3] Test index accuracy on 20 plans

**Deliverable:** Verified and enhanced material list index

---

#### 11. Figure out database storage and sync strategy
**→ Your Task:** "Figure out how and where the database will be stored, if not in this workbook, how do we ensure that it is always up to date?"

**Status:** 🔴 NOT STARTED  
**Time:** 8 hours  
**Priority:** MEDIUM

**Options to Evaluate:**
1. **Embedded in BAT** (Current state)
   - ✅ Self-contained
   - ❌ Large file size
   - ❌ Harder version control

2. **Separate Excel Database File**
   - ✅ Cleaner separation
   - ❌ Must ensure both files together
   - ❌ Manual sync needed

3. **SharePoint Lists** (RECOMMENDED)
   - ✅ Multi-user access
   - ✅ Auto-sync
   - ✅ Version control
   - ✅ Always up to date
   - ❌ Requires SharePoint setup

4. **SQLite + ODBC**
   - ✅ Most robust
   - ✅ Query-able
   - ❌ Technical setup required

**Action Steps:**
- [Week 9, Day 3] Document requirements (multi-user? size? access?)
- [Week 9, Day 4] Test SharePoint List connectivity
- [Week 9, Day 4] Evaluate IT/infrastructure constraints
- [Week 9, Day 5] Make decision and document strategy
- [Week 10] Implement chosen solution

**Deliverable:** Database strategy document + implementation

---

### WEEK 11-12 (Jan 20-31)

#### 12. Determine extraction method and information needed
**→ Your Task:** "Figure out what information needs to be extracted from workbook and in what fashion"  
**→ Sub-task:** "Determine method for extraction - use extractor VBA as starter, then iterate (log updates)"

**Status:** 🔴 NOT STARTED  
**Time:** 12 hours  
**Priority:** MEDIUM

**Information to Extract:**
- Quote summaries (by plan/elevation/options)
- Material lists (by plan, filtered by category)
- Price sheets (by customer, price level)
- Job packages (complete material + pricing)

**Action Steps:**
- [Week 11, Day 1] Document extraction requirements
- [Week 11, Day 2] Review existing extractor VBA
- [Week 11, Day 3] Design new interface (UserForm)
- [Week 11, Day 4] Add filtering capabilities
- [Week 11, Day 5] Add export formats (Excel, CSV, PDF)
- [Week 12, Day 1] Add batch extraction
- [Week 12, Day 2] Add extraction logging
- [Week 12, Day 3] Test all scenarios

**Deliverable:** Enhanced Extractor v2.0 with logging

---

#### 13. Create testing rubric and log
**→ Your Task:** "Create testing rubric"  
**→ Sub-task:** "Find, research, or build testing log"  
**→ Sub-task:** "Begin testing and log success/failures"

**Status:** 🔴 NOT STARTED  
**Time:** 16 hours  
**Priority:** HIGH (Do throughout, but formal at end)

**Testing Categories:**
1. Data Integrity
2. Calculation Accuracy
3. Functionality
4. Performance
5. User Experience

**Action Steps:**
- [Week 12, Day 1] Create testing rubric spreadsheet
- [Week 12, Day 2] Define 50+ test scenarios
- [Week 12, Day 3] Create testing log template
- [Week 12, Day 4] Execute comprehensive tests
- [Week 12, Day 5] Document results and remaining issues

**Deliverable:** `BAT_Testing_Rubric.xlsx` + `Testing_Log.xlsx`

---

## SUMMARY: PHASED APPROACH

### PHASE 1: FOUNDATION (Weeks 1-4) ← START HERE
**Goal:** Establish standards and fix critical tools
- ✅ Week 1: Base coding system
- ✅ Week 1: Table naming convention  
- ✅ Week 2: Fix pricing updater
- ✅ Week 2: Price schedule integration
- ✅ Week 3: Rename all tables
- ✅ Week 3: Holt cross-reference
- ✅ Week 4: Plan Index enhancement

**Checkpoint:** Standards documented, tools working, structure consistent

---

### PHASE 2: CONTENT (Weeks 5-8)
**Goal:** Add all plans and apply formatting
- ✅ Week 5-6: Add 30 priority Richmond plans
- ✅ Week 6: Apply formatting theme
- ✅ Week 7-8: Add remaining Richmond plans
- ✅ Week 8: Final plan validation

**Checkpoint:** All plans present, consistently formatted

---

### PHASE 3: INFRASTRUCTURE (Weeks 9-10)
**Goal:** Database strategy and extraction tools
- ✅ Week 9: Database storage decision & implementation
- ✅ Week 9: Verify material list index
- ✅ Week 10: Build extraction tool enhancements
- ✅ Week 10: Test extraction scenarios

**Checkpoint:** Data management strategy in place, extraction working

---

### PHASE 4: TESTING & POLISH (Weeks 11-12)
**Goal:** Comprehensive validation
- ✅ Week 11: Continue extraction tool
- ✅ Week 11: Begin testing rubric creation
- ✅ Week 12: Execute full test plan
- ✅ Week 12: Fix critical issues
- ✅ Week 12: Document everything

**Checkpoint:** Production-ready, tested, documented BATs

---

## QUICK WINS (Do These Early!)

These tasks deliver immediate value:

1. **Fix Pricing Updater** (Week 2)
   - High frustration factor with current broken tool
   - Immediate time savings once working
   - **Impact:** 75% reduction in price update time

2. **Add Price Schedule to Richmond** (Week 2)
   - Creates consistency between both BATs
   - Enables standardized pricing updates
   - **Impact:** Single source of truth for all pricing

3. **Document Coding Standards** (Week 1)
   - Unblocks all other work
   - Prevents future inconsistencies
   - **Impact:** Foundation for automation

4. **Cross-Reference Sheets** (Week 3)
   - Immediate usability improvement for Holt
   - Answers "which plans in which community?" quickly
   - **Impact:** Faster quote generation

---

## WEEKLY CHECKPOINTS

Use these to track progress:

**Week 1 Checkpoint:**
- [ ] Coding standards document complete
- [ ] Team reviewed and approved coding
- [ ] Reference sheets added to both BATs
- [ ] Table naming convention defined

**Week 2 Checkpoint:**
- [ ] Pricing updater working and tested
- [ ] Richmond has schedule_PriceSchedule
- [ ] Holt price schedule fixed/enhanced
- [ ] Price change logging operational

**Week 4 Checkpoint:**
- [ ] All tables renamed to convention
- [ ] Holt cross-reference sheets complete
- [ ] Plan Index has arch/eng date columns
- [ ] Foundation phase COMPLETE

**Week 8 Checkpoint:**
- [ ] Richmond has 80+ plans
- [ ] All plans consistently formatted
- [ ] All Plan Index entries complete
- [ ] Content phase COMPLETE

**Week 10 Checkpoint:**
- [ ] Database strategy decided & implemented
- [ ] Material list index verified
- [ ] Extraction tool enhanced
- [ ] Infrastructure phase COMPLETE

**Week 12 Checkpoint:**
- [ ] All tests passed
- [ ] Critical issues fixed
- [ ] Documentation complete
- [ ] BATs in production

---

## NEXT ACTIONS (This Week!)

**Monday, November 11:**
1. Block 2 hours on calendar
2. Open Richmond "Item Pricing" sheet
3. Open Holt IWP/RL sheets
4. Start documenting numbering patterns
5. Take notes in Google Doc

**Tuesday-Wednesday, November 12-13:**
1. Continue coding audit
2. Document elevation codes
3. Review options pricing sheets
4. Draft coding standard document

**Thursday, November 14:**
1. Review draft with team
2. Get feedback from William (Richmond) and Alicia (Holt)
3. Incorporate feedback

**Friday, November 15:**
1. Finalize coding standards document
2. Create reference sheet in each BAT
3. Share with team
4. ✅ PHASE 1, Week 1 COMPLETE

---

## RESOURCES NEEDED

**Time Commitment:**
- Weeks 1-4: ~20 hours/week (critical foundation)
- Weeks 5-8: ~15 hours/week (content addition)
- Weeks 9-12: ~10 hours/week (finishing touches)

**Skills Needed:**
- Excel: Intermediate to Advanced
- VBA: Intermediate (for tool updates)
- Documentation: Basic (for standards)

**Team Input Needed:**
- Week 1: Coding standards review
- Week 4: Plan Index date research
- Week 12: User acceptance testing

---

## SUCCESS METRICS

**Technical Success:**
- [ ] 100% of tables follow naming convention
- [ ] 100% of plans in Plan Index with complete details
- [ ] Pricing updater works for all price levels
- [ ] <5% error rate in testing
- [ ] Both BATs structurally consistent

**Business Success:**
- [ ] Quote generation time reduced 50%
- [ ] Price update time reduced 75%
- [ ] Zero pricing errors in production
- [ ] Team satisfaction >4/5

**Merger Readiness:**
- [ ] Both BATs use identical structure
- [ ] Single price schedule format
- [ ] Unified coding system
- [ ] Ready 4 months before March 2026 merger

---

## QUESTIONS TO ANSWER THIS WEEK

Before Week 2 starts, answer these:

1. **Who should review the coding standards?**
   - William Hatley (Richmond)?
   - Alicia Vandehey (Holt)?
   - Dave Templeton?

2. **Where are arch/engineering dates stored?**
   - In plan files themselves?
   - In project management system?
   - In emails?
   - Need to establish source

3. **What price levels does Richmond actually use?**
   - Currently shows L1-L5
   - Are all 5 levels active?
   - Any deprecated?

4. **What's the SharePoint situation?**
   - Do we have SharePoint access?
   - Can we create lists?
   - Who's the admin?

---

## NOTES & OBSERVATIONS

**From November 2025 BAT Analysis:**

✅ **Good Progress Made:**
- Plan Index exists (10 columns, good structure)
- Material List Index exists (indexMaterialListsbyPlan)
- Subdivision reference exists
- Pricing updater exists (needs fixing)
- Holt has 47/50 plans (94% complete)
- Holt has price schedule started

❌ **Critical Gaps:**
- Richmond only has 9/80 plans (11% complete) ← BIG WORK ITEM
- No table naming convention applied
- No cross-reference for Holt
- Pricing updater broken (can't target columns)
- No price change logging
- Richmond missing price schedule

**Priority Order Makes Sense Because:**
1. Coding system blocks everything else
2. Pricing tool is causing daily pain
3. Table naming enables automation
4. Plans can be added systematically once structure is right
5. Testing validates everything works

---

## LET'S GET STARTED! 

**Your First Task:** Spend 2 hours this week auditing the item numbering in both BATs.

Open these sheets and start taking notes:
- Richmond: "Item Pricing"
- Holt: IWP sheet, RL sheet  
- Both: Plan Index (elevation codes)

Document patterns, prefixes, ranges, inconsistencies.

That's your Week 1, Day 1 task. Everything else flows from there.

**Questions? Concerns? Ready to dive in?**