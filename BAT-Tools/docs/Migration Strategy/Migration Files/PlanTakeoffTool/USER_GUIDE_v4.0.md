# RF FRAMING TAKEOFF SYSTEM v4.0
## UserForm-Driven Database Edition - Complete User Guide

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Installation](#installation)
4. [Getting Started](#getting-started)
5. [Project Workflow](#project-workflow)
6. [Database Structure](#database-structure)
7. [Validation & Quality Control](#validation)
8. [Material Generation](#material-generation)
9. [Historical Analysis](#historical-analysis)
10. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

The RF Framing Takeoff System v4.0 represents a complete evolution of the takeoff process, moving from manual spreadsheet entry to a **guided UserForm interface** with **centralized database storage**. This system:

- **Guides you through each stage** with checklists
- **Validates all inputs** before saving
- **Auto-calculates** quantities and dimensions
- **Stores everything in a database** for instant retrieval
- **Tracks project history** for future analysis
- **Generates material lists** from any historical project

### What's Different from v3.0?

| Feature | v3.0 (Manual) | v4.0 (UserForm) |
|---------|--------------|-----------------|
| Data Entry | Type into cells | Guided form interface |
| Validation | Manual checking | Automatic before save |
| Checklists | Separate sheet | Built into forms |
| Project Tracking | One project per file | Unlimited projects in database |
| Material Lists | Manual formulas | Auto-generated from database |
| Historical Data | Save multiple files | Query centralized database |
| Error Prevention | Easy to skip steps | Impossible to skip required fields |

---

## KEY FEATURES

### 1. **UserForm Interface**
- Multi-tab form guides you through each stage
- Checklists visible on every tab
- Auto-calculating fields (panel heights, quantities, etc.)
- Input validation prevents errors
- Progress tracking

### 2. **Centralized Database**
- All projects stored in one workbook
- Unique Project IDs for tracking
- Unlimited project capacity
- Easy to query historical data
- Data integrity maintained

### 3. **Stage-by-Stage Workflow**
```
Project Setup → Post & Beam → Floor Systems → Walls → Roof → Deck
```
Each stage has:
- Required field validation
- Built-in checklists
- Auto-calculations
- Critical reminders

### 4. **Smart Calculations**
- **Panel Heights**: Auto-selected based on wall height
- **Joist Quantities**: Calculated from spacing (12", 16", 19.2", 24")
- **Slope Factors**: Automatic from roof pitch
- **Material Quantities**: Formulas reference database
- **Composite Blocking**: Auto-calculated for deck surface

### 5. **Quality Control**
- ⚠️ **CRITICAL WARNINGS** for common mistakes:
  - Floor blocking required at all beams/walls
  - Deck hardware must be Z-MAX
  - Composite decking requires blocking
  - Wall height dictates panel height
  - Stair posts must be taller than deck posts

### 6. **Material Summary Generator**
- Enter Project ID → instant material list
- Auto-populates from database queries
- Organized by system (Walls, Roof, Post/Beam, etc.)
- Calculates extended costs
- Export to purchase orders

---

## INSTALLATION

### Step 1: Prepare the Workbook

The Excel file `RF_Takeoff_Database_System_v4.xlsx` contains the complete database structure. To add the UserForm functionality:

1. **Open the file** in Excel
2. **Enable Macros** when prompted (required for UserForm)

### Step 2: Install VBA Code

1. **Open VBA Editor**:
   - Windows: Press `ALT + F11`
   - Mac: Tools → Macro → Visual Basic Editor

2. **Create Modules**:
   - Insert → Module (create 4 modules)
   - Copy code from `VBA_UserForm_Code.txt`:
     - Module1: modMain
     - Module2: modValidation
     - Module3: modDatabase
     - Module4: modTypes

3. **Create UserForm**:
   - Insert → UserForm
   - Name it: `frmMain`
   - Design the form (see Form Layout section below)
   - Copy UserForm code from `VBA_UserForm_Code.txt`

### Step 3: Add Dashboard Button

1. Go to **Dashboard** sheet
2. Developer tab → Insert → Button
3. Assign macro: `InitializeSystem`
4. Label button: "**Start New Takeoff**"

### Step 4: Save as Macro-Enabled

1. File → Save As
2. **Save as type**: Excel Macro-Enabled Workbook (*.xlsm)
3. Name: `RF_Takeoff_System_v4.xlsm`

**Installation complete!**

---

## GETTING STARTED

### First Time Setup

1. **Open the workbook**
2. **Enable macros** when prompted
3. **Click Dashboard** to see system overview
4. **Review the sheets**:
   - Database: Master project list
   - WallData, RoofData, etc.: Individual system databases
   - MaterialSummary: Auto-generating material lists
   - Checklists: Reference checklists for each stage
   - ValidationRules: Data validation requirements
   - LookupTables: Reference tables (pitch, spacing, etc.)

### Understanding the Database

The system uses **relational database concepts**:

```
Database (Projects)
    ├── Project ID (Primary Key)
    └── Project Details
         ↓
    ┌────┴────┬─────────┬─────────┬──────────┐
    │         │         │         │          │
WallData  RoofData  PostBeam  FloorData  DeckData
    │         │         │         │          │
 Entry ID  Entry ID  Entry ID  Entry ID  Entry ID
(Links to Project ID)
```

Every entry is linked to a Project ID, allowing:
- Query all walls for Project X
- Generate materials for Project Y
- Compare projects historically
- Track estimating accuracy

---

## PROJECT WORKFLOW

### Complete Workflow (6-9 hours typical)

```
┌─────────────────────────────────────────────────────────┐
│ STAGE 1: PROJECT SETUP (5-10 minutes)                  │
├─────────────────────────────────────────────────────────┤
│ ☐ Click "Start New Takeoff"                           │
│ ☐ Enter project information                            │
│ ☐ Assign project number                                │
│ ☐ Select building type                                 │
│ ☐ Define scope (stories, deck yes/no)                  │
│ ☐ Click "Save Project" → Project ID generated          │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 2: POST & BEAM (30-60 minutes if applicable)     │
├─────────────────────────────────────────────────────────┤
│ ☐ Identify all beams from plans                        │
│ ☐ Select beam type (LVL, PSL, dimensional, etc.)       │
│ ☐ Enter beam sizes and lengths                         │
│ ☐ Count posts at ALL supports                          │
│ ☐ Enter post sizes and heights                         │
│ ☐ Verify bearing plates = post count                   │
│ ☐ Verify hangers = beam count                          │
│ ☐ Click "Add Entry" for each beam/post group           │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 3: FLOOR SYSTEMS (45-90 minutes)                 │
├─────────────────────────────────────────────────────────┤
│ ⚠️ CRITICAL: Blocking at ALL beams and walls!          │
│ ☐ Select floor level (Foundation, 1st, 2nd, etc.)      │
│ ☐ Identify area (Living, Kitchen, Garage, etc.)        │
│ ☐ Select joist type (dimensional, I-joist, OWT)        │
│ ☐ Enter joist size and spacing                         │
│ ☐ Measure span length and depth                        │
│ ☐ **Enter blocking LF** (NEVER SKIP!)                  │
│ ☐ Joist quantity auto-calculated                       │
│ ☐ Sheathing SF auto-calculated                         │
│ ☐ Subfloor glue auto-calculated                        │
│ ☐ Click "Add Entry" for each floor area                │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 4: WALLS (60-120 minutes)                        │
├─────────────────────────────────────────────────────────┤
│ ⚠️ CRITICAL: Wall height DICTATES panel height!        │
│ ☐ Select floor level (Basement, 1st, 2nd, etc.)        │
│ ☐ Enter plan # and elevation (N, S, E, W)              │
│ ☐ Assign wall ID (W1, W2, W3...)                       │
│ ☐ Measure length from plans                            │
│ ☐ Get height from building sections                    │
│ ☐ Calculate door/window opening SF                     │
│ ☐ Count corners                                        │
│ ☐ Measure header lengths                               │
│ ☐ Panel height auto-selected (8', 9', 10', 12')        │
│ ☐ Panel quantity auto-calculated                       │
│ ☐ Click "Add Entry" for each wall                      │
│ ☐ Review floor subtotals                               │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 5: ROOF (30-60 minutes)                          │
├─────────────────────────────────────────────────────────┤
│ ☐ Identify all roof sections                           │
│ ☐ Enter plan # and section name                        │
│ ☐ Verify pitch from plans                              │
│ ☐ Measure run (horizontal)                             │
│ ☐ Measure depth (perpendicular)                        │
│ ☐ Slope factor auto-calculated                         │
│ ☐ Include eave overhangs                               │
│ ☐ Include rake overhangs                               │
│ ☐ Measure ridge length                                 │
│ ☐ Measure hip lengths (if applicable)                  │
│ ☐ Measure valley lengths (if applicable)               │
│ ☐ Click "Add Entry" for each roof section              │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 6: DECK FRAMING (30-60 minutes if applicable)    │
├─────────────────────────────────────────────────────────┤
│ ⚠️ CRITICAL: ALL hardware MUST be Z-MAX!               │
│ ☐ Identify deck area (Main, Upper, Landing)            │
│ ☐ Count deck posts (typically 6x6 PT)                  │
│ ☐ Measure beam sizes and lengths                       │
│ ☐ Select joist size and spacing                        │
│ ☐ Measure area length and depth                        │
│ ☐ Joist quantity auto-calculated                       │
│ ☐ Ledger size = joist depth                            │
│ ☐ Ledger length = area length                          │
│ ☐ **Specify Z-MAX for hardware type**                  │
│ ☐ Click "Add Entry" for each deck area                 │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 7: DECK SURFACE (30-60 minutes if applicable)    │
├─────────────────────────────────────────────────────────┤
│ ⚠️ CRITICAL: Composite requires blocking!              │
│ ☐ Select decking type (PT, Composite, Cedar, etc.)     │
│ ☐ Enter area SF                                        │
│ ☐ Select board length (12', 16', 20')                  │
│ ☐ Board quantity auto-calculated                       │
│ ☐ Measure fascia LF (all exposed edges)                │
│ ☐ **Blocking auto-calculated for composite**           │
│ ☐ Screws auto-calculated (SF ÷ 100)                    │
│ ☐ Measure handrail length                              │
│ ☐ Count posts (corners + ends + line posts)            │
│ ☐ **Stair posts HEIGHT ADJUSTED** (taller!)            │
│ ☐ Baluster quantity auto-calculated (LF × 40)          │
│ ☐ Click "Add Entry" for each deck area                 │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 8: MATERIAL GENERATION (15-30 minutes)           │
├─────────────────────────────────────────────────────────┤
│ ☐ Go to MaterialSummary sheet                          │
│ ☐ Enter Project ID in cell B3                          │
│ ☐ Material list auto-populates                         │
│ ☐ Review quantities for reasonableness                 │
│ ☐ Enter unit prices (optional)                         │
│ ☐ Extended costs calculate automatically               │
│ ☐ Export to purchase order or proposal                 │
└─────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ STAGE 9: FINAL VERIFICATION (20-40 minutes)            │
├─────────────────────────────────────────────────────────┤
│ ☐ Review Dashboard statistics                          │
│ ☐ Check all database sheets for completeness           │
│ ☐ Verify floor subtotals (if multi-story)              │
│ ☐ Confirm panel heights appropriate                    │
│ ☐ Verify all deck hardware is Z-MAX                    │
│ ☐ Check composite blocking calculated                  │
│ ☐ Review material summary                              │
│ ☐ Update project status to "Complete"                  │
└─────────────────────────────────────────────────────────┘
```

---

## DATABASE STRUCTURE

### Master Database (Projects)

**Sheet**: `Database`

| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| A | Project ID | Unique identifier | PROJ-001 |
| B | Project Name | Descriptive name | Smith Residence |
| C | Project Number | Internal tracking | 2025-042 |
| D | Client Name | Client or company | ABC Construction |
| E | Estimator | Who did the takeoff | John Smith |
| F | Date Created | Creation date | 2025-10-18 |
| G | Address | Street address | 123 Main St |
| H | City | City | Springfield |
| I | State | State | CA |
| J | Zip | Zip code | 12345 |
| K | Building Type | Residential, Commercial | Residential |
| L | Status | Active, Complete, On Hold | Active |
| M | Stories | Number of floors | 2 |
| N | Has Deck | Yes or No | Yes |
| O | Total SF | Total building SF | 2400 |
| P | Notes | Additional notes | Custom design |

### Wall Data

**Sheet**: `WallData`

Stores all wall entries with auto-calculated gross SF, net SF, panel heights, and quantities.

**Key Fields**:
- Entry ID: WALL-0001, WALL-0002, etc.
- Project ID: Links to master database
- Floor Level: Basement, 1st, 2nd, 3rd, 4th
- Auto-calculated: Gross SF, Net SF, Panel Height, Panel Qty

### Roof Data

**Sheet**: `RoofData`

Stores all roof sections with auto-calculated slope factors and gross SF.

**Key Fields**:
- Entry ID: ROOF-0001, ROOF-0002, etc.
- Pitch: Format X/12 (e.g., 6/12)
- Auto-calculated: Slope Factor, Gross SF

### Post & Beam Data

**Sheet**: `PostBeamData`

Tracks all structural beams and posts.

**Key Fields**:
- Beam types: Dimensional, LVL, PSL, Glulam, Steel
- Auto-calculated: Total beam LF, Bearing plates, Hangers

### Floor System Data

**Sheet**: `FloorSystemData`

⚠️ **CRITICAL**: Blocking LF is required input!

**Key Fields**:
- Joist types: Dimensional, I-Joist, Open Web Truss
- Spacing: 12", 16", 19.2", 24" O.C.
- Auto-calculated: Joist Qty, Sheathing SF, Glue Tubes

### Deck Framing Data

**Sheet**: `DeckFramingData`

⚠️ **CRITICAL**: All hardware must be Z-MAX!

**Key Fields**:
- Post Size: Typically 6x6 PT
- Hardware Type: MUST contain "Z-MAX"
- Auto-calculated: Joist Qty, Ledger LF

### Deck Surface Data

**Sheet**: `DeckSurfaceData`

⚠️ **CRITICAL**: Composite requires blocking!

**Key Fields**:
- Decking Type: PT, Composite, Cedar, Trex, etc.
- Auto-calculated: Board Qty, Blocking (for composite), Balusters

---

## VALIDATION & QUALITY CONTROL

### Automatic Validations

The system validates inputs **before** saving to the database:

#### Project Level
```
✓ Project name cannot be blank
✓ Estimator name required
✓ Building type must be selected
✓ Stories must be 1-4
```

#### Wall Level
```
✓ Length: 0.1 to 1000 feet
✓ Height: 0.1 to 20 feet
✓ Warning if height > 12 feet (exceeds standard panel)
✓ Opening SF must be numeric
✓ Floor level must be valid
```

#### Roof Level
```
✓ Run: 0.1 to 500 feet
✓ Depth: 0.1 to 500 feet
✓ Pitch format: X/12 or XX/12
✓ Slope factor auto-calculated from lookup
```

#### Floor Level
```
⚠️ Blocking LF REQUIRED (cannot be zero)
✓ Span length must be numeric
✓ Span depth must be numeric
✓ Joist spacing must be: 12, 16, 19.2, or 24
```

#### Deck Level
```
⚠️ Hardware type MUST contain "Z-MAX"
✓ Post size appropriate for deck
✓ Joist spacing correct for decking type
✓ Area measurements valid
```

### Critical Reminders

The system displays **warnings** for common mistakes:

| Stage | Warning | Why It's Critical |
|-------|---------|-------------------|
| Floor Systems | "BLOCKING REQUIRED at ALL beams and walls!" | Structural requirement; often forgotten |
| Walls | "Wall height exceeds 12 feet - review design" | Standard panels max at 12' |
| Deck Framing | "ALL hardware MUST be Z-MAX!" | Corrosion resistance for outdoor use |
| Deck Surface | "Composite requires blocking every 12-18 inches!" | Manufacturer requirement; 200+ pieces |
| Deck Surface | "Stair posts must be taller than deck posts!" | Code requirement for rake angle |

---

## MATERIAL GENERATION

### How It Works

The `MaterialSummary` sheet uses **database queries** to auto-generate material lists:

1. **Enter Project ID** in cell B3 (e.g., "PROJ-001")
2. **Material formulas** query the database:
   ```excel
   =SUMIF(WallData!B:B,$B$3,WallData!O:O)
   ```
   This reads: "Sum column O (Panel Qty) from WallData where column B (Project ID) matches B3"

3. **Materials auto-populate**:
   - Wall panels by height (8', 9', 10', 12')
   - Plate material (4.5 LF per wall LF)
   - Headers, corners, sheathing
   - Roof materials
   - Floor joists, sheathing, glue
   - Deck posts, beams, joists, hardware
   - Decking boards, fascia, blocking, rails

### Material Categories

**Walls**:
- RF Wall Panels (by height)
- Plate Material (2x4 SPF)
- Headers (2x10 or 2x12)
- Corner Hardware (Simpson L90)

**Roof**:
- Roof Sheathing (7/16" OSB)
- Ridge Board
- Hip Material
- Valley Material

**Post/Beam**:
- Structural Beams (LVL/PSL/Glulam)
- Posts (4x4, 4x6, 6x6)
- Bearing Plates
- Beam Hangers

**Floors**:
- Floor Joists (2x10, 2x12, I-Joist)
- Floor Sheathing (3/4" T&G OSB)
- Subfloor Adhesive
- Joist Hangers
- **Blocking Material** (CRITICAL!)

**Deck Framing**:
- Deck Posts (6x6 PT)
- Deck Beams (2x8, 2x10 PT)
- Deck Joists (2x6, 2x8 PT)
- Ledger Board
- **Z-MAX Hardware** (all corrosion resistant)

**Deck Surface**:
- Decking Boards (PT, Composite, Cedar)
- Fascia Board
- **Blocking Pieces** (for composite)
- Deck Screws (coated/stainless)
- Rail Posts (4x4 PT)
- Balusters

### Adding Unit Prices

To get extended costs:

1. Enter unit prices in column G
2. Extended cost (column H) calculates automatically:
   ```excel
   =E × G
   (Quantity × Unit Price)
   ```

### Exporting Material Lists

**For Purchase Orders**:
1. Copy material list
2. Paste into PO template
3. Include SKUs and specs

**For Proposals**:
1. Copy summary totals
2. Add markup
3. Include in client proposal

**For Cost Tracking**:
1. Save material list with project
2. Compare estimated vs actual costs
3. Improve future estimates

---

## HISTORICAL ANALYSIS

### Querying Past Projects

The database structure allows powerful analysis:

**Find all projects by client**:
```excel
=FILTER(Database!A:P, Database!D:D="ABC Construction")
```

**Average wall panels per project**:
```excel
=AVERAGEIF(Database!A:A, "*PROJ*", 
    SUMIF(WallData!B:B, Database!A:A, WallData!O:O))
```

**Compare similar projects**:
1. Filter by building type and stories
2. Compare panel counts, roof SF, material costs
3. Identify estimating patterns

### Estimating Accuracy

Track your accuracy over time:

**Create tracking sheet**:
| Project ID | Estimated Panels | Actual Used | Variance | % Accuracy |
|------------|-----------------|-------------|----------|------------|
| PROJ-001 | 45 | 47 | +2 | 95.7% |
| PROJ-002 | 52 | 50 | -2 | 103.8% |

**Analyze trends**:
- Are you consistently over or under?
- Which systems have largest variance?
- Improve future estimates

### Building Estimating Database

Over time, your database becomes invaluable:

**Benchmark data**:
- Typical panel count per SF of wall
- Typical roof sheathing per SF of plan
- Typical joist count per floor area
- Deck material per SF of deck

**Quick estimates**:
- "2400 SF house with 2 stories and deck"
- Query similar projects
- Calculate average material usage
- Generate rough estimate in minutes

---

## TROUBLESHOOTING

### Common Issues

#### Issue: UserForm won't open
**Solution**:
1. Check macros are enabled
2. Verify VBA code is properly installed
3. Check for typos in module names
4. Ensure form is named `frmMain`

#### Issue: Validation errors won't clear
**Solution**:
1. Review error messages carefully
2. Check numeric fields have numbers only
3. Verify dropdowns have selections
4. Clear and re-enter problematic fields

#### Issue: Formulas showing #REF!
**Solution**:
1. Check sheet names match exactly
2. Verify Project ID is correct
3. Ensure database sheets have data
4. Review formula syntax

#### Issue: Panel quantity seems wrong
**Solution**:
1. Verify wall height is correct
2. Check opening SF is accurate
3. Confirm panel height auto-selected correctly
   - Up to 8' → 8' panels
   - 8.01-9' → 9' panels
   - 9.01-10' → 10' panels
   - 10.01-12' → 12' panels

#### Issue: Material list is empty
**Solution**:
1. Check Project ID in cell B3 is correct
2. Verify project has data entered
3. Check database sheets have entries
4. Ensure formulas reference correct sheets

### Best Practices

✅ **Save frequently** during data entry
✅ **Use consistent naming** (wall IDs, area names)
✅ **Review checklists** before moving to next stage
✅ **Verify auto-calculations** make sense
✅ **Check floor subtotals** (multi-story projects)
✅ **Document special conditions** in notes
✅ **Back up workbook** regularly
✅ **Test material list** before completing project

### Getting Help

If you encounter issues:

1. **Review this documentation** thoroughly
2. **Check Checklists sheet** for stage requirements
3. **Review ValidationRules sheet** for field requirements
4. **Check VBA code** for typos or missing sections
5. **Test with sample project** to isolate issues
6. **Contact support** with specific error messages

---

## APPENDIX A: KEYBOARD SHORTCUTS

### VBA Editor
- `ALT + F11` - Open/close VBA Editor (Windows)
- `ALT + F8` - Macro dialog
- `F5` - Run macro
- `F8` - Step through code

### UserForm
- `TAB` - Move to next field
- `SHIFT + TAB` - Move to previous field
- `ENTER` - Activate default button
- `ESC` - Cancel and close form

### Excel
- `CTRL + HOME` - Go to A1
- `CTRL + END` - Go to last used cell
- `CTRL + F` - Find
- `CTRL + S` - Save

---

## APPENDIX B: LOOKUP TABLES REFERENCE

### Roof Pitch to Slope Factor

| Pitch | Slope Factor | Description |
|-------|--------------|-------------|
| 3/12 | 1.031 | Low slope |
| 4/12 | 1.054 | Standard |
| 5/12 | 1.083 | Standard |
| 6/12 | 1.118 | Standard (most common) |
| 7/12 | 1.158 | Steep |
| 8/12 | 1.202 | Steep |
| 9/12 | 1.250 | Very steep |
| 10/12 | 1.302 | Very steep |
| 12/12 | 1.414 | Maximum (45°) |

### Wall Height to Panel Height

| Wall Height Range | Order Panel Height |
|-------------------|-------------------|
| Up to 8.00 feet | 8 ft panels |
| 8.01 to 9.00 feet | 9 ft panels |
| 9.01 to 10.00 feet | 10 ft panels |
| 10.01 to 12.00 feet | 12 ft panels |

**CRITICAL**: You CANNOT use 8' panels for 9' walls!

### Joist Spacing Calculations

| Spacing | Formula | Example (20' span) |
|---------|---------|-------------------|
| 12" O.C. | Length + 1 | 20 + 1 = 21 joists |
| 16" O.C. | Length ÷ 1.33 + 1 | 20 ÷ 1.33 + 1 = 16 joists |
| 19.2" O.C. | Length ÷ 1.6 + 1 | 20 ÷ 1.6 + 1 = 14 joists |
| 24" O.C. | Length ÷ 2 + 1 | 20 ÷ 2 + 1 = 11 joists |

### Panel SF by Height

| Panel Height | Width | SF per Panel |
|-------------|-------|--------------|
| 8 ft | 4 ft | 32 SF |
| 9 ft | 4 ft | 36 SF |
| 10 ft | 4 ft | 40 SF |
| 12 ft | 4 ft | 48 SF |

---

## APPENDIX C: FIELD REFERENCE GUIDE

### Project Fields

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| Project Name | Text | Yes | Max 100 chars | Smith Residence |
| Project Number | Text | No | Any format | 2025-042 |
| Client Name | Text | No | Max 100 chars | ABC Construction |
| Estimator | Text | Yes | Max 50 chars | John Smith |
| Address | Text | No | Max 200 chars | 123 Main St |
| Building Type | Dropdown | Yes | Predefined list | Residential |
| Stories | Dropdown | Yes | 1, 2, 3, 4 | 2 |
| Has Deck | Dropdown | Yes | Yes, No | Yes |

### Wall Fields

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| Floor Level | Dropdown | Yes | Basement, 1st-4th | 1st |
| Plan # | Text | No | Any format | 1 |
| Elevation | Dropdown | No | N, S, E, W, etc. | N |
| Wall ID | Text | Yes | Max 10 chars | W1 |
| Length (LF) | Number | Yes | 0.1 to 1000 | 24.5 |
| Height (FT) | Number | Yes | 0.1 to 20 | 9.0 |
| Opening SF | Number | No | 0 to 10000 | 40.5 |
| Corners | Number | No | 0 to 100 | 2 |
| Header LF | Number | No | 0 to 1000 | 12.0 |

### Roof Fields

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| Plan # | Text | No | Any format | 1 |
| Section | Text | Yes | Max 50 chars | Main |
| Run (FT) | Number | Yes | 0.1 to 500 | 30.0 |
| Depth (FT) | Number | Yes | 0.1 to 500 | 40.0 |
| Pitch | Text | Yes | X/12 format | 6/12 |
| Eave OH | Number | No | 0 to 60 inches | 12 |
| Rake OH | Number | No | 0 to 60 inches | 12 |
| Ridge LF | Number | No | 0 to 1000 | 30.0 |
| Hip LF | Number | No | 0 to 1000 | 0 |
| Valley LF | Number | No | 0 to 1000 | 15.0 |

---

## VERSION HISTORY

### v4.0 (October 2025)
- **NEW**: UserForm-driven data entry
- **NEW**: Centralized database structure
- **NEW**: Automatic validation before save
- **NEW**: Built-in checklists on every form
- **NEW**: Material generation from database queries
- **NEW**: Historical project tracking
- **NEW**: Project ID system
- **NEW**: Auto-calculating fields throughout
- **IMPROVED**: Error prevention with validation
- **IMPROVED**: Data integrity with database design

### v3.0
- Complete building takeoff (Post/Beam to Deck)
- Manual spreadsheet entry
- All systems in one file

### v2.5
- Multi-story wall tracking
- Floor subtotals
- Panel height guide

### v2.4
- Basic wall and roof takeoff
- Material summaries
- Workflow guide

---

## SUPPORT & FEEDBACK

For questions, issues, or suggestions:

1. Review this complete documentation
2. Check the Checklists sheet in the workbook
3. Review ValidationRules for field requirements
4. Test with sample data to isolate issues
5. Contact your system administrator

---

**RF FRAMING TAKEOFF SYSTEM v4.0**  
*Empowering accurate, efficient takeoffs through guided workflow and centralized data*

---
