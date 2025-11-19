# PHASE 1: FOUNDATION - BAT Integration Plan
## Establish Standards + Coding System Architecture

**Project**: Richmond & Holt BAT Consolidation  
**Timeline**: Week 1 (Enhanced with Architecture Design)  
**Critical Success Factor**: Proper foundations prevent weeks of rework during data import

---

## 🎯 STRATEGIC OVERVIEW

### Why This Phase Matters
The coding system architecture is the **hidden foundation** that determines whether your unified BAT will be maintainable or become a nightmare of technical debt. Getting this right in Week 1 saves 4-8 weeks of rework during import and prevents permanent data quality issues.

### What We've Discovered

**Richmond System Characteristics:**
- **56 confirmed plans** across 5 communities
- **10-column Plan Index** structure already operational
- Simple plan sheet naming: `G603`, `G914`, `LE93 G603B`, `LE94 G603A`
- Elevation data embedded in sheet names (triple-encoding problem)
- Missing structured item numbering system
- Price levels L1-L5 structure needs mapping

**Holt System Characteristics:**
- **47 active plans** across 6 communities  
- **10-column Plan Index** structure (identical to Richmond!)
- **Sophisticated 9-digit item coding system** already in production:
  - Format: `[Plan 4][Pack 1][Category 2][Sequence 2]`
  - Example: `167010100` = Plan 1670, Pack 1, Category 01, Sequence 00
  - Multiple elevations encoded as variations: `167010100`, `167010200`, `167010300`, `167010400`
- Proven Python pricing updater tools operational
- Community-specific plan sheets: `1670ABCD CR`, `1890ABD GG`, etc.

**Triple-Encoding Problem Identified:**
Elevation data currently stored in THREE places:
1. Plan Sheet Name: `LE93 G603B`
2. Plan Index "Elevations" column: `"A, B, C"`
3. Community designators embedded in sheet names

This creates maintenance burden and data integrity risks.

---

## 📋 PHASE 1 TASK BREAKDOWN

### BLOCK 1: Foundational Audits (4 hours)

#### Task 1.1: Item Numbering Audit (2 hours)

**Richmond Analysis:**
```
Objective: Document current item numbering (or lack thereof)
Location: Sample plan sheets, Material Database

Checklist:
□ Open 5 sample Richmond plan sheets (G603, G914, LE93, LE94, TEMPLATE)
□ Document current item number format in column A
□ Check Material Database structure (Combined_A_to_G, RAH SKUs sheets)
□ Note: Richmond appears to lack structured item numbering
□ Identify any existing numbering patterns or conventions
□ Document which columns contain item data

Output: richmond_item_numbering.txt
```

**Holt Analysis:**
```
Objective: Document proven 9-digit system
Location: Active plan sheets (1670ABCD CR, 1890ABD CR, etc.)

Discovered Pattern:
Format: PPPPPCCCSS
  P = Plan number (4 digits)
  P = Pack type (1 digit)
  C = Category (2 digits)
  S = Sequence (2 digits)

Examples:
  167010100 = Plan 1670, Pack 1 (Foundation), Category 01, Item 00
  167010200 = Plan 1670, Pack 1 (Foundation), Category 02, Item 00
  167010300 = Plan 1670, Pack 1 (Foundation), Category 03, Item 00

Checklist:
□ Analyze 5-10 Holt plan sheets
□ Extract all unique 9-digit codes
□ Identify pack type digit meanings (1=Foundation, 2=Framing, etc.)
□ Document category codes by pack
□ Note elevation encoding strategy (100, 200, 300, 400 = A, B, C, D)
□ Map sequence numbering patterns

Output: holt_item_numbering_patterns.txt
```

**Deliverable Template:**
```
ITEM NUMBERING AUDIT REPORT
Date: [Date]
Auditor: [Name]

RICHMOND SYSTEM:
Current State: [Structured / Unstructured / Hybrid]
Item Format: [Describe format or note absence]
Sample Items:
  - [Item 1]
  - [Item 2]
  - [Item 3]
Observations:
  - [Key finding 1]
  - [Key finding 2]

HOLT SYSTEM:
Current State: Structured 9-digit system
Item Format: PPPPPCCCSS
Pack Types Identified:
  1 = [Pack name]
  2 = [Pack name]
  3 = [Pack name]
Category Codes (by pack):
  Pack 1 Categories:
    01 = [Category name]
    02 = [Category name]
Elevation Encoding:
  Method: [Describe]
  Example: [Show example]

COMPATIBILITY ANALYSIS:
Can Holt system extend to Richmond? [Yes/No/Partial]
Migration Path: [Describe approach]
```

#### Task 1.2: Richmond Structure Audit (2 hours)

**Objective**: Document Richmond pricing infrastructure for updater adaptation

```
Files to Examine:
□ PRICING TAB sheet
□ IWP RS, IWP S4S sheets
□ RL+ADDERS sheet
□ RL_AV sheet (Random Length price tracking)
□ Customer Price Levels sheet

Checklist:
□ Map all column headers in PRICING TAB
□ Identify price level columns (L1, L2, L3, L4, L5?)
□ Document freight calculation columns
□ Note margin calculation structure
□ Identify date-stamped price columns in RL_AV
□ Map IWP (Individual Wrapped Pieces) structure
□ Document RL (Random Length) + ADDERS structure
□ Screenshot key formula cells for reference

Critical Questions:
1. How many price levels does Richmond use? (Holt uses PL01-PL12)
2. Where are base costs stored?
3. How are freight and margin applied?
4. Which sheets must Python updater modify?
5. Are there any VBA macros that affect pricing?

Output: richmond_structure.txt
```

**Deliverable Template:**
```
RICHMOND PRICING STRUCTURE AUDIT
Date: [Date]
Auditor: [Name]

PRICING TAB STRUCTURE:
Columns: [List all columns with letter designations]
Price Levels: [L1, L2, L3, L4, L5]
Formula Patterns: [Describe key formulas]

IWP SHEETS:
Purpose: [Describe]
Structure: [Detail]
Used By: [Which plans/packs]

RL+ADDERS:
Purpose: Random Length lumber with freight adders
Columns: RL_TAG, Product Description, [Date], Freight (MBF), Margin
Update Frequency: [Daily/Weekly/As needed]

RL_AV (Random Length Average):
Purpose: Historical price tracking
Date Columns Found: [List date columns]
Averaging Method: [Describe]

PYTHON UPDATER ADAPTATION REQUIREMENTS:
□ Column mapping from Holt to Richmond
□ Price level conversion (PL01-PL12 → L1-L5)
□ Date format handling
□ Freight calculation differences
□ Margin application method

COMPATIBILITY WITH HOLT UPDATER:
[Assess whether Holt's proven Python tools can be adapted]
Blocker Issues: [List any incompatibilities]
Adaptation Plan: [Brief outline]
```

---

### BLOCK 2: Coding System Architecture Design (6-8 hours)

This is the **critical path** that unlocks everything else. We make three strategic decisions that define the database structure.

#### Session 2.1: Map Existing Hierarchies (2 hours)

**Richmond Hierarchy Mapping:**

```
Task: Create visual map of Richmond relationships

Key Questions:
1. Plan-to-Elevation Relationship
   Current: Elevations embedded in sheet names (LE93 G603B)
   Plan Index: Stores elevations in Column C ("A, B, C")
   Question: Should elevation be a separate dimension?

2. Plan-to-Pack Relationship
   Current: Unclear if packs exist as structured entities
   Community sheets: "106 Golden Grove Lumber" vs plan sheets
   Question: How do material groups relate to plans?

3. Plan-to-Option Relationship
   Current: Options may be embedded in elevation variations
   Question: How are interior options, garage options tracked?

4. Plan-to-Community Relationship
   Community sheets exist: "106 Golden Grove Lumber"
   Question: Are communities in Plan Index or separate?

Output Document: richmond_hierarchy_map.txt

Template:
PLAN
├── Has Base Model (G603, G914)
├── Has Elevations
│   ├── Method: [Embedded in sheet name / Separate dimension]
│   ├── Variants: A, B, C, D
│   └── Storage: [Where is this data definitive?]
├── Has Packs/Material Groups
│   ├── Foundation materials
│   ├── Framing materials
│   ├── [Other groups]
│   └── Relationship: [Universal / Plan-specific]
├── Has Options
│   ├── Interior options
│   ├── Garage configurations
│   └── [Other options]
└── Belongs To Community
    ├── Golden Grove
    ├── [Other communities]
    └── Storage: [Where tracked?]
```

**Holt Hierarchy Mapping:**

```
Task: Document Holt's sophisticated structure

Holt's Proven Structure:
PLAN (1670, 1890, 2321, etc.)
├── Plan Sheet Name: "1670ABCD CR" 
│   ├── Embeds: Plan number, elevations, community
│   └── Triple-encoding issue identified
├── Plan Index Entry
│   ├── Column B: "1670 - Coyote Ridge"
│   ├── Column C: "A (Northwest), B (Prairie), C (Modern), D (Farmhouse)"
│   └── Contains full elevation descriptions
├── Item Codes: 9-digit system
│   ├── Digits 1-4: Plan number (1670)
│   ├── Digit 5: Pack type (1, 2, 3...)
│   ├── Digits 6-7: Category within pack
│   ├── Digits 8-9: Sequence number
│   └── Elevation variants: 100, 200, 300, 400
└── Material Lists
    ├── Organized by pack on plan sheets
    ├── Each item: "167010100 - 4085" (Internal code - BFS SKU)
    └── Multiple elevations per row

Key Insights:
- Pack structure already defined (digit 5)
- Elevation encoded in category digit (01xx, 02xx, 03xx, 04xx)
- Same BFS SKU may have different internal codes per elevation

Output Document: holt_hierarchy_map.txt
```

#### Session 2.2: Make Three Critical Decisions (3-4 hours)

**DECISION 1: Plan-Pack Relationship**

```
The Question: Should packs be plan-specific or universal?

OPTION A: Plan-Specific Packs
Example: Plan 1670 has "1670_Foundation" pack
         Plan 1890 has "1890_Foundation" pack
Pros:
  + Complete independence between plans
  + Easy to customize per plan
  + Matches Holt's current item code structure (plan embedded)
Cons:
  - Duplicate materials across many plans
  - Cannot reuse pack definitions
  - Harder to update standard packs (foundation same for all)

OPTION B: Universal Packs
Example: "Foundation_Standard" pack used by multiple plans
Pros:
  + Single source of truth for standard components
  + Easy bulk updates (change Foundation once, all plans update)
  + Matches MindFlow's mental model
  + Reduces total material line items
Cons:
  - Need plan-specific pack variations for custom plans
  - More complex assignment logic

RECOMMENDATION: Hybrid Approach
- Universal packs for standardized components (Foundation, Framing)
- Plan-specific override capability for customizations
- Database tracks: Pack + Plan association table

Decision: [To be determined in session]
Rationale: [Document reasoning]

Output: DECISION_1_Plan_Pack_Relationship.md
```

**DECISION 2: Plan-Elevation Model**

```
The Question: How should we model elevations?

Current State Problem (Triple-Encoding):
1. Sheet Name: "LE93 G603B" (B = elevation)
2. Plan Index: Column C stores "A, B, C"  
3. Item Codes: 01xx, 02xx, 03xx, 04xx patterns

OPTION A: Elevation as Embedded Variant
Example: Plans are "G603A", "G603B", "G603C" (separate plans)
Pros:
  + Matches current sheet naming
  + Simple queries (one sheet = one plan variant)
Cons:
  - Creates many "pseudo-plans"
  - Harder to compare elevations of same plan
  - Must duplicate base plan data

OPTION B: Elevation as Separate Dimension
Example: Plan "G603" has Elevations ["A", "B", "C"]
Pros:
  + Matches Plan Index structure (Column C)
  + True relational model
  + Easy to compare elevation material differences
  + Supports elevation-specific pricing
Cons:
  + More complex material list storage
  + Requires elevation parameter in queries

OPTION C: Elevation as Material List Attribute
Example: Each material line has optional elevation code
Pros:
  + Extremely flexible
  + Supports elevation-specific and universal items
Cons:
  + Can become confusing
  + Requires careful query filters

RECOMMENDATION: Option B (Separate Dimension)
Why:
- Plan Index already models this way
- Supports future multi-elevation pricing
- Cleanest separation of concerns
- Fixes triple-encoding problem

Database Structure:
PLANS table
  plan_id, plan_name, base_sqft, garage_type...

ELEVATIONS table
  elevation_id, plan_id, elevation_code, elevation_name, notes

PLAN_MATERIALS table
  material_id, plan_id, elevation_id (nullable), pack_id, ...

Decision: [To be determined in session]
Rationale: [Document reasoning]

Output: DECISION_2_Plan_Elevation_Model.md
```

**DECISION 3: Internal Option Codes**

```
The Question: How do we code interior options, garage options, etc.?

Background:
Holt's 9-digit system handles elevations via category codes (01xx, 02xx)
But what about:
- Garage side (left/right): "2-Car (L/R)"
- Optional 3rd car bay
- Interior options (fireplace, built-ins)
- Structural options (bonus room, extended patio)

OPTION A: Extend 9-digit system with option suffix
Example: 167010100-G3L (Garage 3-car Left)
Pros:
  + Keeps item code as primary key
  + Easy to filter by option
Cons:
  - Creates combinatorial explosion
  - Code becomes complex: 167010100-E02-G3L-OPT05

OPTION B: Option as Database Relationship
Example: Item 167010100 linked to Options table
Pros:
  + Clean relational model
  + Easy to query "all items affected by option X"
  + Supports option groups
Cons:
  + More complex queries
  + Requires proper foreign keys

OPTION C: Pack-Level Options
Example: "Foundation_3CarGarage" pack vs "Foundation_2CarGarage" pack
Pros:
  + Matches builder mental model
  + Easy to price option delta
Cons:
  + Pack proliferation
  - Harder to show base + option separately

RECOMMENDATION: Option B (Relational)
Why:
- Supports complex option combinations
- Matches how options are sold (line items on contract)
- Clean separation between base item and option modifier
- Enables option costing reports

Database Structure:
OPTIONS table
  option_id, option_code, option_name, option_category

ITEM_OPTIONS table (junction)
  item_option_id, item_id, option_id, quantity_modifier

Query Example:
"Show me all foundation items for Plan 1670, Elevation A, with 3-Car Garage option"

Decision: [To be determined in session]
Rationale: [Document reasoning]

Output: DECISION_3_Internal_Option_Codes.md
```

#### Session 2.3: Database Schema Design (2 hours)

**Task**: Translate decisions into SQL schema

```
Based on decisions from Session 2.2, design core tables:

CORE TABLES:

1. PLANS
   - plan_id (PK)
   - plan_code (e.g., "1670", "G603")
   - plan_name
   - base_sqft
   - main_floor_sqft
   - upper_floor_sqft
   - garage_sqft
   - default_garage_config
   - created_date
   - updated_date
   - notes

2. ELEVATIONS
   - elevation_id (PK)
   - plan_id (FK)
   - elevation_code (e.g., "A", "B", "C", "D")
   - elevation_name (e.g., "Northwest", "Prairie", "Modern")
   - elevation_description
   - is_active

3. COMMUNITIES
   - community_id (PK)
   - community_code (e.g., "GG", "CR", "HH")
   - community_name (e.g., "Golden Grove", "Coyote Ridge")
   - builder (e.g., "Holt", "Richmond")
   - is_active

4. PLAN_COMMUNITY_ASSOCIATION
   - association_id (PK)
   - plan_id (FK)
   - community_id (FK)
   - elevation_id (FK, nullable)
   - is_active
   - effective_date

5. PACKS
   - pack_id (PK)
   - pack_code (e.g., "FOUND", "FRAME", "ROOF")
   - pack_name (e.g., "Foundation", "Framing", "Roofing")
   - pack_type_digit (maps to Holt's digit 5)
   - is_universal (true/false per Decision 1)
   - description

6. PACK_ASSIGNMENTS
   - assignment_id (PK)
   - plan_id (FK)
   - pack_id (FK)
   - is_active

7. MATERIAL_ITEMS
   - item_id (PK)
   - item_code (9-digit internal code)
   - plan_id (FK, nullable if universal)
   - pack_id (FK)
   - category_code (2 digits from item_code)
   - sequence_number (2 digits from item_code)
   - bfs_sku (BFS material database SKU)
   - description
   - unit_of_measure
   - notes

8. ITEM_ELEVATIONS
   - item_elevation_id (PK)
   - item_id (FK)
   - elevation_id (FK)
   - quantity
   - notes
   (If elevation_id is NULL, item applies to all elevations)

9. OPTIONS
   - option_id (PK)
   - option_code
   - option_name
   - option_category (e.g., "GARAGE", "INTERIOR", "STRUCTURAL")
   - description

10. ITEM_OPTIONS
    - item_option_id (PK)
    - item_id (FK)
    - option_id (FK)
    - quantity_modifier (e.g., +1, -1, *2)
    - is_required

11. BFS_MATERIALS (Master Material Database)
    - bfs_sku (PK)
    - description
    - unit
    - category
    - subcategory
    - [Additional fields from Material Database]

12. PRICING_HISTORY
    - pricing_id (PK)
    - bfs_sku (FK)
    - price_level (e.g., "PL01", "L1")
    - effective_date
    - base_price
    - freight
    - margin_percent
    - final_price

KEY INDEXES:
- item_code (for fast lookups)
- plan_id + elevation_id (for plan queries)
- bfs_sku (for pricing updates)
- pack_id (for pack-level operations)

VIEWS TO CREATE:
- vw_plan_full_details (joins plans, elevations, communities)
- vw_material_lists (complete material list with pricing)
- vw_plan_pricing (rolled-up plan costs by elevation and option)

Output: schema_design_v1.sql
```

---

### BLOCK 3: Import Mapping Rules (2 hours)

**Task**: Define how to translate existing BAT data into new schema

```
RICHMOND IMPORT MAPPING:

Source: Plan Index sheet
Destination: PLANS, ELEVATIONS, COMMUNITIES tables

Field Mapping:
Plan Index Column A → PLANS.plan_code (extract base plan)
Plan Index Column B → PLANS.plan_name
Plan Index Column C → Parse to create ELEVATIONS records
Plan Index Column D → PLANS.default_garage_config
Plan Index Column E → PLANS.base_sqft
Plan Index Column F → PLANS.main_floor_sqft
Plan Index Column G → PLANS.upper_floor_sqft
Plan Index Column H → PLANS.garage_sqft

Elevation Parsing Logic:
Input: "A, B, C"
Output: Create 3 ELEVATIONS records with elevation_code 'A', 'B', 'C'

Special Cases:
- "LE93 G603B" → Plan "G603", Elevation "B", Community "LE" (Luden Estates)
- Multi-elevation sheets like "G603" with "A, B, C" → Create elevation variations

HOLT IMPORT MAPPING:

Source: Plan Index sheet, Plan Sheets
Destination: PLANS, ELEVATIONS, COMMUNITIES, MATERIAL_ITEMS tables

Field Mapping (Plan Index):
Similar to Richmond, but:
Sheet Name parsing: "1670ABCD CR"
  → Plan: 1670
  → Elevations: A, B, C, D
  → Community: CR (Coyote Ridge)

Material Items Import:
Source: Plan sheet rows with 9-digit codes
Parse: "167010100 - 4085"
  → item_code: 167010100
  → plan_id: lookup/create for 1670
  → pack_id: lookup/create for pack_type '1'
  → category_code: 01
  → sequence: 00
  → bfs_sku: 4085

Elevation Detection:
Codes 167010100, 167010200, 167010300, 167010400 on same row
→ Create 4 ITEM_ELEVATIONS records (A, B, C, D)

VALIDATION RULES:
□ All plan_codes must be unique
□ All elevation_codes per plan must be A, B, C, D (or subset)
□ All bfs_skus must exist in BFS_MATERIALS table (or flag for review)
□ All item_codes must be 9 digits
□ All pack_type_digits must be 1-9

ERROR HANDLING:
- Missing BFS SKU → Add to "materials_to_research" table
- Duplicate item_code → Log warning, use latest
- Invalid elevation code → Log error, skip record

Output: import_mapping_rules.md
```

---

### BLOCK 4: Draft Coding Standards (2 hours)

**Task**: Create human-readable coding standards document

```
BAT CODING STANDARDS v1.0

PURPOSE:
Establish consistent naming and numbering conventions across Richmond 
and Holt BATs for the unified system.

SECTION 1: PLAN CODING

Format: Numeric plan code (no elevation suffix)
Examples:
  ✓ Correct: 1670, 1890, 2321, 2383
  ✓ Correct: G603, G914 (Richmond legacy)
  ✗ Incorrect: 1670A, G603-B (elevation in plan code)

Rationale: Elevation is separate dimension (Decision 2)

SECTION 2: ELEVATION CODING

Format: Single letter A, B, C, D, E
Storage: ELEVATIONS table
Description: Stored in elevation_name field

Examples:
  A - Northwest
  B - Prairie  
  C - Modern
  D - Farmhouse

Multi-Elevation References:
  Format: "ABCD" or "A, B, C, D"
  Usage: Plan Index, sheet names for documentation only
  Database: Store as separate ELEVATIONS records

SECTION 3: PACK CODING

Format: [Plan Code][Pack Type Digit]
Examples:
  16701 = Plan 1670, Pack Type 1 (Foundation)
  16702 = Plan 1670, Pack Type 2 (Framing)
  18901 = Plan 1890, Pack Type 1 (Foundation)

Pack Type Digit Definitions:
  1 = Foundation / Below Grade
  2 = Framing / Structural
  3 = Roofing
  4 = Exterior Finishes
  5 = Interior Finishes
  6 = Specialties
  7 = [Reserve]
  8 = [Reserve]
  9 = Options / Upgrades

Universal Pack Codes (per Decision 1):
  Format: XXXXX where X = pack category
  Examples:
    00001 = Universal Foundation Pack
    00002 = Universal Framing Pack

SECTION 4: ITEM NUMBERING (9-Digit System)

Format: PPPP-P-CC-SS
  PPPP = Plan code (4 digits, left-padded with zeros if needed)
  P = Pack type digit (1 digit)
  CC = Category within pack (2 digits)
  SS = Sequence number (2 digits)

Examples:
  167010100 = Plan 1670, Pack 1, Category 01, Sequence 00
  G60310205 = Plan G603, Pack 1, Category 02, Sequence 05 (if we extend to alpha)

Elevation Handling in Item Codes:
  Method: Category digit increments
  167010100 = Elevation A
  167010200 = Elevation B
  167010300 = Elevation C
  167010400 = Elevation D

When to Use Same Sequence Across Elevations:
  - When the material is same BFS SKU but different quantity
  - Example: All elevations use 4085 (sill plate) but Elevation B needs more

When to Use Different Sequences:
  - When elevations use different BFS SKUs
  - Example: Elevation A uses brick, Elevation C uses siding

SECTION 5: OPTION CODING

Format: OPT-[Category]-[Number]
Examples:
  OPT-GAR-301 = Garage Option: 3-Car Left
  OPT-GAR-302 = Garage Option: 3-Car Right
  OPT-INT-101 = Interior Option: Gas Fireplace
  OPT-INT-205 = Interior Option: Built-in Shelving
  OPT-STR-401 = Structural Option: Bonus Room

Category Codes:
  GAR = Garage configurations
  INT = Interior options
  STR = Structural options
  EXT = Exterior options

SECTION 6: COMMUNITY CODES

Format: 2-3 letter abbreviations
Examples:
  GG = Golden Grove
  CR = Coyote Ridge
  HH = Harmony Heights
  HA = Heartwood Acres
  WR = Willow Ridge
  WRA = Willow Ridge Attached
  LE = Luden Estates (Richmond)

SECTION 7: SHEET NAMING CONVENTIONS

Database Plan Sheets:
  Format: [Plan Code][Elevations][Community]
  Examples:
    1670ABCD CR = Plan 1670, Elevations A-D, Coyote Ridge
    2321ABC CR = Plan 2321, Elevations A-C, Coyote Ridge
    G603 = Plan G603 (Richmond, all elevations)

Reference Sheets:
  Plan Index = Master plan directory
  PRICING TAB = Pricing formulas and calculations
  IWP RS / IWP S4S = Individual Wrapped Pieces pricing
  RL+ADDERS = Random Length lumber with freight
  RL_AV = Random Length historical averages

Community Sheets:
  Format: [Community Number] [Community Name] [Material Type]
  Examples:
    106 Golden Grove Lumber
    111 Coyote Ridge Siding

SECTION 8: VALIDATION RULES

All codes must pass these checks before database entry:

Plan Codes:
  □ 4 digits numeric or 4 characters alphanumeric
  □ No spaces or special characters
  □ Unique across all plans

Item Codes:
  □ Exactly 9 digits
  □ First 4 digits match existing plan
  □ 5th digit is 1-9
  □ Digits 6-9 are numeric

BFS SKUs:
  □ Match existing BFS Material Database
  □ If not found, add to research queue

Elevation Codes:
  □ Must be A, B, C, D, or E
  □ Case-insensitive on input, stored as uppercase

Output: BAT_Coding_Standards.docx
```

---

### BLOCK 5: Team Review (2 hours)

```
Review Session Agenda:

PARTICIPANTS:
- Corey (Process Owner)
- William Hatley (Richmond expertise)
- Alicia Vandehey (Holt expertise)

MATERIALS TO REVIEW:
1. Richmond & Holt hierarchy maps
2. Three critical decisions (with recommendations)
3. Proposed database schema
4. Import mapping rules
5. Draft coding standards

REVIEW CHECKLIST:

□ Richmond Hierarchy Accuracy
  Ask William:
  - Does this map match how you think about Richmond plans?
  - Are there elevation combinations we missed?
  - How do options currently get tracked?
  - Any hidden relationships not documented?

□ Holt Hierarchy Accuracy
  Ask Alicia:
  - Does the 9-digit code breakdown match your understanding?
  - Are pack types complete? Missing any?
  - How do you currently handle options/upgrades?
  - Community coding correct?

□ Decision Validation
  For each decision:
  - Do you agree with the recommendation?
  - Can you think of edge cases that break it?
  - Will this work in daily operations?
  - Any concerns about complexity?

□ Schema Review
  - Can you query what you need?
  - Are any key fields missing?
  - Will this support future features (pricing, reporting)?

□ Coding Standards Usability
  - Are codes memorable and logical?
  - Will new team members understand them?
  - Any naming conflicts with existing systems?

CAPTURE FEEDBACK:
Create feedback_notes.txt with:
- Concerns raised
- Suggested changes
- Edge cases identified
- Action items

Output: team_review_feedback.txt
```

---

### BLOCK 6: Finalize Foundation (2 hours)

```
Tasks:

□ Incorporate Team Feedback
  - Update hierarchy maps
  - Revise decisions if needed
  - Adjust schema based on concerns
  - Refine coding standards

□ Create Final Decision Documents
  - DECISION_1_Plan_Pack_Relationship.md (FINAL)
  - DECISION_2_Plan_Elevation_Model.md (FINAL)
  - DECISION_3_Internal_Option_Codes.md (FINAL)

□ Finalize Database Schema
  - schema_design_v1.sql → schema_design_FINAL.sql
  - Add team-requested fields
  - Include all indexes and views
  - Document table relationships diagram

□ Publish Coding Standards
  - BAT_Coding_Standards.docx (FINAL)
  - Add examples based on team feedback
  - Create quick reference sheet

□ Create Reference Sheets
  - Add "Coding Standards" sheet to Richmond BAT
  - Add "Coding Standards" sheet to Holt BAT
  - Include lookup tables for pack types, option categories

□ Document Foundation Decisions
  - Create Phase_1_Foundation_Summary.md
  - Include: Final decisions, rationale, schema diagram
  - Distribute to team

□ Prepare for Week 2
  - Week 2 will focus on data migration scripts
  - Foundation is now LOCKED unless critical issue found
  - Any changes after Week 1 require formal review process
```

---

## 📦 DELIVERABLES CHECKLIST

### Required Outputs (Must Complete All)

**Audit Documents:**
- [ ] `item_numbering_patterns.txt` - Richmond & Holt item numbering analysis
- [ ] `richmond_structure.txt` - Pricing infrastructure documentation
- [ ] `richmond_hierarchy_map.txt` - Visual plan/pack/option relationships
- [ ] `holt_hierarchy_map.txt` - Visual plan/pack/option relationships

**Decision Documents (Critical!):**
- [ ] `DECISION_1_Plan_Pack_Relationship.md` - Universal vs plan-specific packs
- [ ] `DECISION_2_Plan_Elevation_Model.md` - How to model elevations in database
- [ ] `DECISION_3_Internal_Option_Codes.md` - Option tracking methodology

**Technical Specifications:**
- [ ] `schema_design_v1.sql` - Initial database schema
- [ ] `schema_design_FINAL.sql` - Approved schema after team review
- [ ] `import_mapping_rules.md` - Field-by-field translation guide

**Standards Documents:**
- [ ] `BAT_Coding_Standards.docx` - Human-readable coding conventions
- [ ] Reference sheets added to both Richmond and Holt BAT workbooks

**Process Documents:**
- [ ] `team_review_feedback.txt` - Documented team input
- [ ] `Phase_1_Foundation_Summary.md` - Executive summary of decisions

---

## ⚡ CRITICAL SUCCESS FACTORS

### 1. Make Informed Decisions
Don't rush the three critical decisions. Each one affects:
- Data migration complexity (Weeks 5-8)
- Query performance
- Team usability
- Future feature support

### 2. Validate with Team Early
William and Alicia know edge cases you don't. Their input during Week 1 prevents rework during Week 5.

### 3. Document Everything
Six months from now, you'll need to remember why you made these decisions. Future team members will too.

### 4. Lock the Foundation
After Phase 1, the foundation is LOCKED. Changing it later is expensive and risky. Get it right now.

---

## 🔄 INTEGRATION WITH OVERALL PROJECT

**This Phase Unlocks:**
- Week 2: Python migration scripts (need schema + mapping rules)
- Week 3: Database setup (need final schema)
- Week 5-8: Data import (need item numbering system + coding standards)
- Week 9-12: Tool development (need stable data structure)

**Dependencies:**
- None! This is the true starting point.

**Risk If Skipped:**
- Import data with inconsistent structure → months of cleanup
- Discover elevation modeling doesn't work → full database rebuild
- Option tracking doesn't match contracts → billing errors

**Time Investment:**
- 16-18 hours in Week 1
- Saves: 4-8 weeks of rework later
- ROI: 10-20x

---

## 📊 PHASE 1 TIMELINE

```
Monday (4 hours):
  Morning: Item Numbering Audit (Task 1.1)
  Afternoon: Richmond Structure Audit (Task 1.2)

Tuesday (4 hours):
  Morning: Hierarchy Mapping (Session 2.1)
  Afternoon: Begin Critical Decisions (Session 2.2)

Wednesday (4 hours):
  Morning: Complete Critical Decisions (Session 2.2)
  Afternoon: Schema Design (Session 2.3)

Thursday (4 hours):
  Morning: Import Mapping Rules (Block 3)
  Afternoon: Draft Coding Standards (Block 4)

Friday (4 hours):
  Morning: Team Review Session (Block 5)
  Afternoon: Finalize & Publish (Block 6)

Total: 20 hours (4 hours/day × 5 days)
```

---

## 🎓 LEARNING-FIRST APPROACH

### Documentation Philosophy
Every decision document should include:
1. **The Question** - What are we deciding?
2. **The Options** - What choices do we have?
3. **Pros & Cons** - Honest assessment of each path
4. **Recommendation** - What do we think is best?
5. **Rationale** - Why did we choose this?
6. **Examples** - Show it in action
7. **Edge Cases** - What might break this?

### Why This Matters
This isn't just for the current team. This is for:
- Future Corey (6 months from now, debugging something)
- New team members (understanding system design)
- Manor Homes integration (reusing these decisions)
- External auditors (demonstrating proper process)

### Teaching Through Structure
The coding standards aren't just rules. They explain:
- **What** the code means
- **Why** it's structured this way  
- **When** to use each pattern
- **How** to validate entries

This transforms tribal knowledge into institutional knowledge.

---

## 🚀 READY TO BEGIN?

### Pre-Flight Checklist
Before starting Phase 1:

- [ ] Both BAT files accessible
- [ ] Material Database files available
- [ ] Corey has 4 hours/day for 5 days
- [ ] William and Alicia scheduled for Friday review
- [ ] Text editor or Word ready for documentation
- [ ] SQL editor for schema design (or just text file)
- [ ] Whiteboard/diagramming tool for hierarchy maps

### First Action
Open both BAT files side-by-side and start Task 1.1: Item Numbering Audit.

The foundation you build this week determines whether this project succeeds or becomes technical debt. 

**Let's build it right.**

---

## 📞 QUESTIONS TO CONSIDER

As you work through Phase 1, keep these questions in mind:

1. **Scalability**: Will this structure handle Manor Homes integration?
2. **Query Performance**: Can we retrieve a plan's full material list in <1 second?
3. **Maintainability**: Can someone understand this system in 6 months?
4. **Flexibility**: Can we add new communities without schema changes?
5. **Auditability**: Can we trace every material back to its source?
6. **Pricing Support**: Does this enable multiple price levels and date-based pricing?
7. **Reporting**: Can we generate cost comparisons between elevations?
8. **User Experience**: Will the team find codes intuitive or confusing?

The answers should be "YES" to all eight questions by the end of Phase 1.

---

*Document Version: 1.0*  
*Created: November 2025*  
*Next Review: After Phase 1 Completion*
