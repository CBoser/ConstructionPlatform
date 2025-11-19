# 05_REFERENCE_DATA.md

**Analysis Findings & Reference Data**  
**BAT Integration Project**

---

**Consolidates:** item_numbering_patterns.txt, richmond_structure.txt, RICHMOND_REFERENCE_FILES_ANALYSIS.md, HOLT_REFERENCE_FILES_ANALYSIS.md, ANALYSIS_SUMMARY.md  
**Created:** November 10, 2025  
**Last Updated:** November 10, 2025  
**Version:** 2.0  
**Status:** Active - Analysis Archive

---

## 🎯 EXECUTIVE SUMMARY

### Purpose
This document archives the foundational analysis completed on Monday, November 10, 2025, along with comprehensive reference file analysis. This data informed Tuesday's architecture decisions and provides the evidence base for Week 1 decisions.

### What Was Analyzed
- **746 items** across both Richmond and Holt systems
- **6 reference files** (Richmond: 3, Holt: 3)
- **4,497 total records** documented
- **Richmond structure:** Pricing infrastructure mapped (20 pages)
- **Holt structure:** Community and pack systems mapped
- **Real 2025 pricing data** from active contracts

### Key Findings
1. **Richmond:** Hierarchical 6-digit item codes (confirmed)
2. **Holt:** 9-digit systematic codes with embedded plan/elevation
3. **Triple-encoding problem:** Elevation appears in 3 places (documented)
4. **Translation need:** 192 Richmond options ↔ 225 Holt options
5. **Community structure:** 5 active Holt communities (CR, GG, HA, HH, WR)
6. **Database readiness:** 44 Richmond plans + 47 Holt plans ready for import

### How This Data Was Used
- Informed Decision 1 (Plan-Pack Relationship)
- Solved Decision 2 (Plan-Elevation Model - triple-encoding)
- Guided Decision 3 (Internal Option Codes - translation strategy)
- Designed database schema (10 core tables)
- Created import mapping rules

---

## 📊 MONDAY'S ANALYSIS (November 10, 2025)

### Analysis Context
**Time Investment:** 4 hours  
**Deliverables:** 45 pages of documentation  
**Status:** ✅ Complete

### Morning Session: Item Numbering Audit (2 hours)

#### Richmond Item Numbering Analysis

**Sample Size:** 633 items examined

**Pattern Discovered: Hierarchical 6-Digit Codes**
```
Format: [CATEGORY 2][SUBCATEGORY 2][SEQUENCE 2]

Examples:
404001 - Lumber item
404027 - Lumber item (different)
404028 - Trusses item
406001 - Different category
406033 - Same category, different item

Structure:
- Digits 1-2: Major category (40 = Framing materials)
- Digits 3-4: Subcategory (40 = Lumber, 60 = Other)
- Digits 5-6: Sequential item within subcategory
```

**Categories Identified:**
```
40xxxx - Framing materials
  4040xx - Lumber
  4060xx - Other framing
  
[Additional categories exist but require full audit]
```

**Characteristics:**
- ✅ Consistent 6-digit format
- ✅ Hierarchical structure (category → subcategory → item)
- ✅ Sequential numbering within categories
- ⚠️ No elevation encoding in item numbers
- ⚠️ Documentation incomplete (need category guide)

**Key Finding:**
Richmond item numbers are **consistent and well-structured** but lack comprehensive documentation. Category meanings need to be validated with William during Week 1 Friday review.

---

#### Holt Item Numbering Analysis

**Sample Size:** 113 items examined

**Pattern Discovered: 9-Digit Systematic Codes**
```
Format: [PLAN 4][PACK 1][CATEGORY 2][SEQUENCE 2]

Examples:
167010504 - Plan 1670, Pack 1, Category 05, Sequence 04
164910105 - Plan 1649, Pack 1, Category 01, Sequence 05
189010400 - Plan 1890, Pack 1, Category 04, All elevations

Structure:
- Digits 1-4: Plan number (1670, 1649, 1890, etc.)
- Digit 5: Pack type (1-9)
- Digits 6-7: Category within pack
- Digits 8-9: Sequence within category

Elevation Encoding (Digits 6-7 special case):
- XX100XX = Elevation A
- XX200XX = Elevation B
- XX300XX = Elevation C
- XX400XX = Elevation D
- XX0XXXX = All elevations (no specific elevation)
```

**Pack Types Identified:**
```
1 = Foundation
2 = Framing
3 = Exterior
4 = Interior
5 = Garage
6 = Electrical
7 = Plumbing
8 = HVAC
9 = Special/Other
```

**Elevation Encoding Examples:**
```
Plan 1670, Elevation A:
167010100 - Foundation materials, Elev A
167010102 - Foundation materials, Elev A (different item)

Plan 1670, Elevation B:
167010200 - Foundation materials, Elev B
167010202 - Foundation materials, Elev B (different item)

Plan 1670, All Elevations:
167010504 - Materials common to all elevations
```

**Characteristics:**
- ✅ Highly systematic and structured
- ✅ Plan number embedded (easy validation)
- ✅ Pack type grouping (construction phases)
- ✅ Elevation encoded (but only when relevant)
- ✅ Self-documenting format
- ⚠️ Long codes (9 digits) - harder to remember
- ⚠️ Not human-readable without decoder

**Key Finding:**
Holt's 9-digit system is **sophisticated and information-rich** but requires understanding the encoding scheme. The elevation encoding is elegant but contributes to the triple-encoding problem when combined with pack names and option codes.

---

### Afternoon Session: Richmond Structure Audit (2 hours)

#### Pricing Sheet Structure

**Document:** richmond_structure.txt (750 lines, 20 pages)

**Sheets Analyzed:**
1. **"PRICING TAB"** - Main pricing interface
2. **"IWP RS"** - Random Sizes pricing
3. **"IWP S4S"** - Surfaced 4 Sides pricing
4. **"RL+ADDERS"** - Random Length + freight/margin
5. **"RL_AV"** - Historical price tracking
6. **"Customer Price Levels"** - Price level definitions

**Price Level Structure:**
```
Confirmed: 5 price levels (L1, L2, L3, L4, L5)

L1 = Base price level
L2 = Price level 2
L3 = Price level 3
L4 = Price level 4
L5 = Price level 5

Formula Pattern:
Base Cost + Freight + (Margin % × Base) = Customer Price

Each level has different margin percentages
```

**Column Structure (PRICING TAB):**
```
Column A: Item Number (6-digit code)
Column B: Description
Column C: Unit of Measure
Column D: Base Cost
Column E: Freight
Column F-J: L1, L2, L3, L4, L5 (calculated prices)
Column K: Last Updated Date
Column L: Vendor
```

**Freight Calculation:**
```
RL+ADDERS sheet contains:
- Freight rates by region
- Fuel surcharges
- Delivery fees
- Seasonal adjustments

Formula: Base freight + (Base cost × Fuel surcharge %)
```

**Margin Calculation:**
```
Each price level has margin %:
L1: [X]% margin
L2: [Y]% margin
L3: [Z]% margin
(Actual percentages in Customer Price Levels sheet)

Formula: Base Cost + Freight + (Margin % × Base Cost)
```

**VBA Macros Found:**
```
1. Price Update Macro (currently broken - Week 2 task)
2. Validation Macro (checks for errors)
3. Export Macro (generates reports)
```

**Key Finding for Week 2:**
The Richmond pricing structure is **well-organized and formula-based**. The Week 2 pricing updater can target specific columns (L1-L5) and update base costs systematically. The updater architecture from Holt (holt_updater.py) is directly applicable.

---

#### Plan-Elevation-Pack Relationships

**CRITICAL DISCOVERY: Triple-Encoding Problem**

**Example: Pack |10.82BCD OPT DEN FOUNDATION**

**Encoding Location 1: Pack Name**
```
Pack ID: |10.82BCD
"BCD" embedded in pack identifier
Meaning: Applies to elevations B, C, D
```

**Encoding Location 2: Location Column**
```
Material Location: "- ELVB - ELVC - ELVD"
Spells out which elevations
Redundant with pack name
```

**Encoding Location 3: Option Codes**
```
Option codes: ELVB, ELVC, ELVD
Yet another encoding of same information
Three separate codes for three elevations
```

**Problem Analysis:**
```
IF pack name says "BCD" BUT location says "AB"
AND option codes say "CD"
THEN which is truth?

This is triple-encoding: Same data in 3 places
Risk: Inconsistency, confusion, maintenance nightmare
```

**Solution Path:**
```
Decision 2 (Tuesday): Elevation as Dimension

NEW STRUCTURE:
- Pack ID: 10.82 (clean, no elevation)
- pack_elevations table:
  * pack_id: 10.82, elevation: B
  * pack_id: 10.82, elevation: C
  * pack_id: 10.82, elevation: D
- Single source of truth: pack_elevations table
- No redundancy, no conflicts possible
```

**Key Finding:**
The triple-encoding problem is **real and pervasive**. It must be solved in Week 1 (Decision 2) before any imports begin. The solution is architectural: Elevation as a separate dimension with dedicated tables.

---

### Analysis Summary Statistics

**Total Analysis Time:** 4 hours  
**Items Examined:** 746 (633 Richmond + 113 Holt)  
**Pages Documented:** 45  
**Patterns Identified:** 3 major (Richmond hierarchical, Holt systematic, triple-encoding)  
**Critical Issues Found:** 1 (triple-encoding)  
**Price Levels Mapped:** Richmond L1-L5, Holt PL01-PL12  
**Reference Files Identified:** 6 (3 Richmond + 3 Holt)

**Deliverables:**
- ✅ item_numbering_patterns.txt (739 lines)
- ✅ richmond_structure.txt (750 lines)
- ✅ Analysis notes and findings
- ✅ Problem identification
- ✅ Recommendations for Tuesday

---

## 📁 RICHMOND REFERENCE FILES

### Overview
Three critical reference files provide complete Richmond pack structure, option codes, and active contracts with real 2025 pricing data.

### File 1: Active_Contracts_-_BFS.xlsx

**Source:** Builder's FirstSource (BFS) - Major supplier  
**Records:** 1,697 active contract line items  
**Date:** Current (2025)  
**Coverage:** 46 plans, 192 unique option codes

**Structure:**
```
Key Columns:
- Bid Job Number: Job identifier
- Subcontractor Number: Vendor ID
- Phase: Construction phase
- Plan: Plan number (G603, G712, etc.)
- Elev: Elevation variant
- Option Number: Option code (2CAR5XA, XGREAT, etc.)
- Bid Total Unit Price: Contract price (real 2025 $)
- Description: Line item description
- Cost Code: Accounting code
- Trade Code: Trade category
```

**Plans Covered (46 plans):**
```
G01H, G17E, G17F, G18L, G21D, G22M, G23H, G250, G260, G29A,
G591, G592, G593, G601, G603, G639, G654, G698, G712, G730,
G760, G914, LE01, LE91, LE92, LE93, LE95, and others
```

**Option Codes (192 unique):**
```
Garage Options:
- 2CAR4XA, 2CAR4XB, 2CAR4XC (2-car garage 4' extension)
- 2CAR5XA, 2CAR5XB, 2CAR5XC (2-car garage 5' extension)
- 3CARA, 3CARB, 3CARC, 3CARD (3-car garage variants)
- 4CARTA, 4CARTB, 4CARTC (4-car tandem)

Interior Options:
- XGREAT (Extended great room)
- BENCH (Bench seating)
- BOOK1 (Built-in bookcase)
- CASEHS (Case height upgrade)

Structural Options:
- DENOPT (Den option)
- ABABA3 (Unknown - requires validation)
- ABAPWDR (Unknown - requires validation)

[Full list: 192 codes total]
```

**Value to Project:**
1. **Real pricing data** - Current market prices from actual contracts
2. **Option validation** - All 192 codes are actively used
3. **Plan coverage** - 46 of 44 database plans have active contracts
4. **Translation source** - Can map to Holt equivalents

**Sample Data:**
```
Job: 12345
Plan: G603
Elev: B
Option: XGREAT
Price: $8,450.00
Description: Extended great room framing and finishing
Vendor: BFS
Date: 2025-Q4
```

---

### File 2: Options_Phase_Item_No.csv

**Records:** 311 pack entries with option code mappings  
**Purpose:** Complete pack structure with elevation details

**Structure:**
```
Columns:
- Pack ID: |10.82BCD OPT DEN FOUNDATION
- Location: - ELVB - ELVC - ELVD
- Option/Phase: ELVB, ELVC, ELVD
- Shipping Order: Display sequence (1-311)
```

**Key Finding: Triple-Encoding Documented**
```
Row 7 Example:
Pack ID: |10.82BCD OPT DEN FOUNDATION
Location: - ELVB - ELVC - ELVD
Option/Phase: ELVB, ELVC, ELVD

Elevation "B", "C", "D" appears THREE times!
This file DOCUMENTS the triple-encoding problem
```

**Pack Hierarchy (by shipping order):**
```
Order 1-50: Foundation packs (|09, |10 series)
Order 51-100: Framing packs (|11, |12, |13 series)
Order 101-150: Exterior packs (|14, |15 series)
Order 151-200: Interior packs (|16, |17 series)
Order 201-311: Finish/special packs (|18+ series)
```

**Elevation Mappings:**
```
Packs with no elevation suffix: Apply to all elevations
Packs with "A": Elevation A only
Packs with "BCD": Elevations B, C, D only
Packs with "ABCD": Explicitly all four elevations
```

**Value to Project:**
1. **Complete pack catalog** - All 311 packs documented
2. **Shipping order** - Construction sequence preserved
3. **Elevation mappings** - Which elevations per pack (despite triple-encoding)
4. **Option code reference** - Links packs to option codes

---

### File 3: Pack_Names.xlsx

**Records:** 315 pack names (master catalog)  
**Purpose:** Official pack naming reference

**Structure:**
```
Single column list of all pack names

Examples:
|09 WO BASEMENT WALLS - WO
|09.2 WO BASEMENT WALLS 2 - WO2
|10 FOUNDATION
|10.01 OPT FPSING01 FOUNDATION
|10.60x EXTENDED GREAT ROOM FOUNDATION - XGREAT
|10.61 SUNROOM FOUNDATION - SUN
|10.82 OPT DEN FOUNDATION
|10.82BCD OPT DEN FOUNDATION
|10.83BCD OPT DEN W/FULL BATH FOUNDATION
|10.tc TALLCRAWL FRAMING - TALLCRWL
|10BCD FOUNDATION
[... 315 total]
```

**Naming Convention Analysis:**
```
Format: |[PHASE].[VARIANT] [DESCRIPTION] - [OPTION_CODE]

Components:
- | (pipe): Pack indicator
- Phase: 2-digit (09, 10, 11, etc.)
- Variant: Optional (.82, .x5, .tc, etc.)
  - Numeric (.01, .02): Sequential options
  - Decimal (.x2, .x4, .x5): Extension depth (feet)
  - Alpha (.tc): Special abbreviations
- Description: Human-readable
- Option Code: Optional, after dash
- Elevation: Sometimes embedded (BCD, A, ABCD)
```

**Phase Structure:**
```
|09 = Basement/walkout
|10 = Foundation
|11 = Joist system
|12 = Garage
|13 = Framing
|14 = Exterior
|15 = Windows/doors
|16 = Interior walls
|17 = Interior finish
|18+ = Special/finishing
```

**Value to Project:**
1. **Official reference** - 315 packs is THE master list
2. **Naming standards** - Establishes format rules
3. **Validation source** - Import validation against this list
4. **UI population** - Dropdown menus use this data

**Cross-File Consistency Check:**
```
Options_Phase_Item_No.csv: 311 packs
Pack_Names.xlsx: 315 packs
Difference: 4 packs

Analysis: Pack_Names is more complete (master catalog)
Options_Phase has active subset + mappings
Use Pack_Names as source of truth for names
```

---

### Richmond Reference Files Summary

**Total Records:** 1,697 (contracts) + 311 (packs) + 315 (names) = 2,323

**Key Insights:**
1. **Triple-encoding confirmed** - Options_Phase file documents it
2. **Real pricing available** - Active_Contracts has 2025 prices
3. **Complete pack catalog** - Pack_Names is authoritative
4. **Option codes validated** - All 192 codes actively used
5. **Translation table possible** - Can map to Holt equivalents

**Database Population Strategy:**
```
1. Import Pack_Names.xlsx → packs table (315 records)
2. Import Options_Phase → pack_elevations table (solve triple-encoding)
3. Import Active_Contracts → pricing table (1,697 records)
4. Create option_translation table → richmond_code mappings
5. Validate all imports against Pack_Names master list
```

---

## 📁 HOLT REFERENCE FILES

### Overview
Three critical Holt reference files provide complete cost structure, option-elevation mappings, and community-based bidding data.

### File 1: Holt_Cost_Codes_20251103.xlsx

**Date:** November 3, 2025 (very recent!)  
**Records:** 1,309 cost line items  
**Activities:** 6 categories  
**Coverage:** All Holt plans

**Structure:**
```
Columns:
- # Activity: Category code (4085, 4120, 4140, etc.)
- Option/Phase - Item No.: Format "167010100 - 4085"
- Option/Phase Description: Human-readable (e.g., "Elevation A")
- Item: Item code (4085, 4086, etc.)
- Description: Line item description
- Amount: Cost amount
```

**Activity Types (6 categories):**
```
4085 - Lumber Supply
4086 - Lumber - Barge Credit (discount/adjustment)
4120 - Trusses Supply
4140 - Window Supply
4142 - Window Supply - Additional U-22 Triple Pane
4150 - Exterior Door Supply
4155 - Siding Supply
4320 - Interior Trim Supply - Millwork
```

**Pattern: Elevation-Specific Codes**
```
Plan 1670, Elevation A:
167010100 - 4085 (Lumber - Elevation A)
167010100 - 4086 (Lumber - Barge Credit)
167010100 - 4120 (Trusses - Elevation A)
167010100 - 4140 (Window Supply)
167010100 - 4155 (Siding Supply)

Plan 1670, Elevation B:
167010200 - 4085 (Lumber - Elevation B)
167010200 - 4086 (Lumber - Barge Credit)
167010200 - 4120 (Trusses - Elevation B)
[etc.]

Every elevation has parallel codes for each activity type
```

**Barge Credit Pattern:**
```
Every lumber item (4085) has corresponding barge credit (4086):
167010100 - 4085    Lumber - Elevation A          $42,156.67
167010100 - 4086    Lumber - Barge Credit         $0.00

This is a cost adjustment mechanism (transportation credit)
Applied consistently across all plans
```

**Value to Project:**
1. **Complete cost structure** - All 6 activity types documented
2. **Item codes standardized** - Consistent across plans
3. **Elevation encoding systematic** - Pattern is clear
4. **Translation table source** - Can map to Richmond categories
5. **Recent data** - November 2025 pricing

---

### File 2: Holt_Option_Elevation_Dictionary.xlsx

**Records:** 225 option mappings  
**Plans:** 10 Holt plans  
**Elevations:** 5 types (A, B, C, D, All)

**Structure:**
```
Columns:
- OptionNumber: Numeric code (167010100, etc.)
- Plan No: Plan number (1670, 1649, etc.)
- Elevation: Which elevation (A, B, C, D, All)
- OptionDescription: Human-readable description
```

**Plan Coverage:**
```
Plan 1649: 16 options
Plan 1656: 18 options
Plan 1670: 32 options (most complex)
Plan 1890: 24 options
Plan 1987: 19 options
Plan 2260: 22 options
Plan 2336: 21 options
Plan 2414: 20 options
Plan 2676: 25 options
All Plans: 8 universal options

Total: 225 option mappings
```

**Elevation Distribution:**
```
Elevation A: 48 options
Elevation B: 46 options
Elevation C: 42 options
Elevation D: 38 options
All Elevations: 51 options (universal)

Pattern: More options for earlier elevations
Some options span multiple elevations
```

**Option Code Pattern:**
```
167010100 - Plan 1670, Phase 01, Option 01, Elevation A (100)
167010200 - Plan 1670, Phase 01, Option 02, Elevation B (200)
167010300 - Plan 1670, Phase 01, Option 03, Elevation C (300)
167010400 - Plan 1670, Phase 01, Option 04, Elevation D (400)
167010000 - Plan 1670, Phase 01, Option 00, All Elevations

Last 2 digits encode elevation:
- 00 = All elevations
- 100 = Elevation A
- 200 = Elevation B
- 300 = Elevation C
- 400 = Elevation D
```

**Value to Project:**
1. **Complete option catalog** - All 225 Holt options documented
2. **Elevation mappings clear** - No triple-encoding (clean!)
3. **Plan coverage** - 10 major plans included
4. **Translation source** - Can map to Richmond option codes
5. **Validation data** - Import validation against this dictionary

---

### File 3: Holt_Phase-Option_Dictionary.xlsx

**Records:** 944 bid records  
**Communities:** 5 (CR, GG, HA, HH, WR)  
**Purpose:** Community-specific bidding and pricing

**Structure:**
```
Columns:
- Plan: Plan number
- Community: CR, GG, HA, HH, or WR
- Phase: Construction phase
- Option: Option code
- Description: Bid description
- Amount: Bid amount
- Date: Bid date
```

**Community Coverage:**
```
CR (Community 1): 198 bids
GG (Community 2): 215 bids
HA (Community 3): 187 bids
HH (Community 4): 176 bids
WR (Community 5): 168 bids

Total: 944 community-specific bids
```

**Community-Specific Pricing Pattern:**
```
Same Plan + Option in different communities = different prices

Example:
Plan 1670, Option 167010100:
- CR community: $42,156.67
- GG community: $43,200.00
- WR community: $41,800.00

Reason: Regional labor costs, material availability, local codes
```

**Phase Distribution:**
```
Phase 01 (Foundation): 215 bids
Phase 02 (Framing): 198 bids
Phase 03 (Exterior): 187 bids
Phase 04 (Interior): 165 bids
Phase 05+ (Finish): 179 bids
```

**Value to Project:**
1. **Community pricing** - Essential for Holt operations
2. **Complete bid history** - 944 records for validation
3. **Regional variations** - Documents price differences
4. **Database design input** - Need communities table
5. **Translation complexity** - Community affects pricing, not materials

---

### Holt Reference Files Summary

**Total Records:** 1,309 (costs) + 225 (options) + 944 (bids) = 2,478

**Key Insights:**
1. **No triple-encoding** - Holt system is cleaner (elevation in code only)
2. **Community pricing** - Essential feature for Holt operations
3. **Systematic codes** - 9-digit system is consistent
4. **Complete documentation** - All options and costs mapped
5. **Recent data** - November 2025 pricing available

**Database Population Strategy:**
```
1. Import Holt_Option_Elevation_Dictionary → options_holt table (225 records)
2. Import Holt_Cost_Codes → items + pricing tables (1,309 records)
3. Import Holt_Phase-Option_Dictionary → community_pricing table (944 records)
4. Create communities table → CR, GG, HA, HH, WR
5. Build translation table → Holt ↔ Richmond mappings
```

---

## 🔄 TRANSLATION STRATEGY

### Richmond ↔ Holt Option Code Mapping

**Challenge:**
```
Richmond: 192 unique option codes (descriptive)
Holt: 225 unique option codes (numeric)
Need: Bidirectional translation table
```

**Sample Mappings (to be completed Week 2):**
```
Richmond Code | Holt Code   | Description                | Category
--------------|-------------|----------------------------|----------
XGREAT        | 167010600   | Extended Great Room        | INT
2CAR5XA       | 167010205   | 2-Car Garage 5ft Ext Elev A| GAR
2CAR5XB       | 167010210   | 2-Car Garage 5ft Ext Elev B| GAR
FPSING01      | 167030100   | Fireplace Single Option    | INT
DENOPTB       | 167020200   | Den Option Elevation B     | STR
[... 150+ more mappings to create]
```

**Translation Table Structure:**
```sql
CREATE TABLE option_translation (
    translation_id INTEGER PRIMARY KEY,
    richmond_code TEXT UNIQUE,
    holt_code TEXT UNIQUE,
    universal_code TEXT,              -- Future OPT-CAT-NUM format
    description TEXT NOT NULL,
    category TEXT,                    -- GAR, INT, STR, EXT
    notes TEXT,
    is_active INTEGER DEFAULT 1
);
```

**Population Strategy:**
1. **Week 2:** Create initial mappings (50+ common options)
2. **Weeks 3-4:** Expand to 100+ mappings
3. **Weeks 5-8:** Complete during imports (identify gaps)
4. **Week 9-10:** Validate all 150-200 mappings
5. **Post-merger:** Introduce universal codes (OPT-CAT-NUM)

---

## 📈 DATA VOLUME SUMMARY

### Richmond Data
```
Plans: 44 total (9 active, 35 to import)
Materials: 55,604 line items
Unique SKUs: 581
Packs: 315 (master catalog)
Option Codes: 192 (actively used)
Price Levels: 5 (L1-L5)
Active Contracts: 1,697 (2025 pricing)
```

### Holt Data
```
Plans: 47 active (50 total)
Materials: 9,373 line items
Communities: 5 (CR, GG, HA, HH, WR)
Packs: Similar to Richmond (shared structure)
Option Codes: 225 (documented)
Price Levels: 12 (PL01-PL12)
Cost Records: 1,309 (November 2025)
Bid Records: 944 (community-specific)
```

### Combined Database
```
Total Plans: 94 (44 Richmond + 50 Holt)
Total Materials: 64,977 line items (55,604 + 9,373)
Total SKUs: ~700+ unique
Total Option Codes: 417 (192 Richmond + 225 Holt)
Translation Mappings: 150-200 (estimated overlap)
Database Records: ~70,000+ total
```

---

## 🎯 IMPLICATIONS FOR ARCHITECTURE DECISIONS

### Decision 1: Plan-Pack Relationship

**Evidence from Reference Files:**
```
Richmond Pack_Names.xlsx shows:
- Some packs appear on multiple plans (universal candidates)
- Some packs are plan-specific (custom variants)
- Pack hierarchy suggests both types exist

Conclusion: Hybrid approach is correct
- Foundation packs: Universal (standard across plans)
- Interior packs: Often customized (plan-specific)
- Need override_materials flag to handle both
```

### Decision 2: Plan-Elevation Model

**Evidence from Reference Files:**
```
Richmond Options_Phase_Item_No.csv:
- Row 7: |10.82BCD in THREE places
- Elevation in pack name, location, and option codes
- PROVES triple-encoding problem exists

Holt Option_Elevation_Dictionary:
- Clean elevation encoding (in code only)
- No triple-encoding
- Shows proper way to handle elevations

Conclusion: Elevation as Dimension solves triple-encoding
- Separate plan_elevations table
- pack_elevations table for applicability
- Single source of truth
```

### Decision 3: Internal Option Codes

**Evidence from Reference Files:**
```
Richmond Active_Contracts:
- 192 codes actively used (all descriptive)
- Teams familiar with XGREAT, 2CAR5XA format
- Human-readable, self-documenting

Holt dictionaries:
- 225 codes (all numeric)
- Systematic structure
- Plan number embedded

Conclusion: Hybrid short-term, Universal long-term
- Keep both during migration (no retraining)
- Translation table bridges gap (150-200 mappings)
- Future: OPT-CAT-NUM format for Manor Homes
```

---

## ✅ VALIDATION CHECKLIST

### Data Quality Verified

**Richmond:**
- [x] 44 plans confirmed in RAH_MaterialDatabase.xlsx
- [x] 55,604 materials counted
- [x] 581 unique SKUs validated
- [x] 315 packs in master catalog
- [x] 192 option codes in active use
- [x] Triple-encoding documented
- [x] Price structure mapped (L1-L5)

**Holt:**
- [x] 47 active plans confirmed
- [x] 9,373 materials counted
- [x] 5 communities validated (CR, GG, HA, HH, WR)
- [x] 225 options in dictionary
- [x] 1,309 cost codes documented
- [x] 944 bids analyzed
- [x] Price structure mapped (PL01-PL12)

**Reference Files:**
- [x] All 6 files analyzed (3 Richmond + 3 Holt)
- [x] 4,497 total records documented
- [x] Cross-file consistency checked
- [x] Translation needs identified
- [x] Database implications clear

---

## 🚀 NEXT STEPS

### Tuesday (Architecture Decisions)
Use this reference data to:
1. Test Decision 1 options with real pack examples
2. Validate Decision 2 solution against triple-encoding
3. Design Decision 3 translation table structure
4. Create database schema with evidence-based choices

### Wednesday-Thursday (Documentation)
Reference this data when:
1. Writing coding standards
2. Creating import mapping rules
3. Documenting validation procedures
4. Preparing team review materials

### Friday (Team Validation)
Present this data to:
1. William (validate Richmond findings)
2. Alicia (validate Holt findings)
3. Confirm translation approach
4. Verify database requirements

### Weeks 2-12 (Ongoing)
Continue to reference:
1. Pack catalogs during imports
2. Option codes during translation
3. Pricing data during updater work
4. Community structure for Holt operations

---

## 📚 DOCUMENT REFERENCES

### Monday Analysis Outputs
- item_numbering_patterns.txt (739 lines)
- richmond_structure.txt (750 lines)
- Monday summary notes

### Reference File Analyses
- RICHMOND_REFERENCE_FILES_ANALYSIS.md (815 lines)
- HOLT_REFERENCE_FILES_ANALYSIS.md (1,461 lines)
- Cross-file analysis notes

### Source Files (in /mnt/project)
- Active_Contracts_-_BFS.xlsx
- Options_Phase_Item_No.csv
- Pack_Names.xlsx
- Holt_Cost_Codes_20251103.xlsx
- Holt_Option_Elevation_Dictionary.xlsx
- Holt_Phase-Option_Dictionary.xlsx

---

## 💡 KEY TAKEAWAYS

### What We Learned

1. **Both systems are well-structured** but in different ways
   - Richmond: 6-digit hierarchical, descriptive options
   - Holt: 9-digit systematic, numeric options

2. **Triple-encoding is real** and must be solved
   - Documented in Options_Phase_Item_No.csv
   - Elevation appears in 3 places
   - Solution: Elevation as Dimension (Decision 2)

3. **Translation is essential** but achievable
   - 192 Richmond + 225 Holt = ~150-200 unique options
   - Hybrid approach allows both during migration
   - Universal codes phase in post-merger

4. **Reference files are gold** for database population
   - Real 2025 pricing data
   - Complete pack catalogs
   - Option dictionaries
   - Community structures

5. **Database readiness confirmed**
   - 44 Richmond plans ready
   - 47 Holt plans ready
   - 64,977 materials ready for import
   - Schema can accommodate both systems

### What Enabled Tuesday's Decisions

This Monday analysis provided:
- ✅ Evidence for Decision 1 (both universal and plan-specific packs exist)
- ✅ Problem statement for Decision 2 (triple-encoding documented)
- ✅ Data for Decision 3 (192 + 225 codes = translation need)
- ✅ Schema requirements (communities, elevations, translations)
- ✅ Validation data (reference files for testing)

**Without Monday's work, Tuesday's decisions would be guesswork.**  
**With Monday's work, Tuesday's decisions are evidence-based.**

---

**Document Owner:** Corey Boser  
**Analysis Date:** November 10, 2025  
**Last Updated:** November 10, 2025  
**Status:** Active - Analysis Archive  
**Next Use:** Tuesday architecture decisions

---

**This data informed every architecture decision. Keep it as reference throughout the project.**
