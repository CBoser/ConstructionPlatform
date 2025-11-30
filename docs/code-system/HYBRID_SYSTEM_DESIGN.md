# Hybrid Coding System Design

**Document**: Sprint 2 - Code System Review (Day 4)
**Date**: 2025-11-29
**Status**: Complete

---

## Executive Summary

This document defines a hybrid coding system for MindFlow Platform that combines:
- **Trade-based** primary categories (intuitive, vendor-aligned)
- **Phase awareness** for scheduling (optional prefix)
- **Industry references** for external compatibility (optional mapping)
- **Supplier SKUs** for ordering (required for EDI)

---

## 1. Design Principles

### 1.1 Guiding Requirements

| Requirement | Priority | Rationale |
|-------------|----------|-----------|
| Human-readable | Critical | Estimators need quick recognition |
| Easy entry | Critical | Reduce friction in daily use |
| Vendor mappable | High | Enable supplier integration |
| Hierarchical | High | Support grouping and reporting |
| Extensible | Medium | Allow future additions |
| Industry-compatible | Medium | Enable external integrations |

### 1.2 Design Constraints

- Maximum code length: 25 characters
- No special characters except hyphen (-)
- Case insensitive (stored uppercase)
- Must be unique within the system
- Should be self-documenting (readable without lookup)

---

## 2. Code Structure

### 2.1 Primary Format

```
[TRADE]-[CATEGORY]-[SUBCATEGORY]-[DETAIL]

Examples:
FRM-LUM-2X4-SPF-8      Framing - Lumber - 2x4 SPF 8ft
ROOF-SHG-ARCH-30Y      Roofing - Shingles - Architectural 30-year
SIDE-FBC-LAP-8         Siding - Fiber Cement - Lap 8"
```

### 2.2 Optional Phase Prefix

For scheduling and delivery planning, add phase prefix:

```
[PHASE]:[TRADE]-[CATEGORY]-[DETAIL]

Examples:
03:FRM-LUM-2X4-SPF-8   Phase 03 (Framing) - 2x4 Lumber
05:ROOF-SHG-ARCH-30Y   Phase 05 (Exterior) - Roof Shingles
```

### 2.3 Component Breakdown

| Component | Length | Values | Required |
|-----------|--------|--------|----------|
| TRADE | 3-4 | FRM, ROOF, SIDE, CONC, ELEC, PLMB, HVAC, INSL, DRYW, TRIM | Yes |
| CATEGORY | 2-4 | LUM, SHG, FBC, MIX, WIR, PIP, etc. | Yes |
| SUBCATEGORY | 2-6 | 2X4, ARCH, LAP, etc. | Optional |
| DETAIL | 2-6 | SPF-8, 30Y, 8, etc. | Optional |

---

## 3. Trade Codes (Level 1)

### 3.1 Primary Trade Categories

| Code | Trade Name | Description | DART Mapping |
|------|------------|-------------|--------------|
| FRM | Framing | Structural lumber, sheathing, hardware | 01-04 |
| CONC | Concrete | Ready-mix, rebar, forms | - |
| ROOF | Roofing | Shingles, underlayment, flashing | 06 |
| SIDE | Siding | Exterior cladding, trim | 07 |
| INSL | Insulation | Batt, blown, foam, vapor barrier | 08 |
| DRYW | Drywall | Gypsum board, mud, tape | 09 |
| ELEC | Electrical | Wire, panels, boxes, fixtures | - |
| PLMB | Plumbing | Pipe, fittings, fixtures | - |
| HVAC | HVAC | Ductwork, equipment, registers | - |
| TRIM | Trim/Finish | Millwork, doors, paint | - |
| HDWR | Hardware | Fasteners, connectors, misc | 05 |
| SITE | Site Work | Grading, utilities, landscaping | - |
| MISC | Miscellaneous | Other/uncategorized | 10+ |

### 3.2 Mapping to Existing Schema

```prisma
// Current MaterialCategory enum alignment
enum MaterialCategory {
  DIMENSIONAL_LUMBER    → FRM-LUM
  ENGINEERED_LUMBER     → FRM-ENG
  SHEATHING             → FRM-SHT
  PRESSURE_TREATED      → FRM-PTW
  HARDWARE              → HDWR
  CONCRETE              → CONC
  ROOFING               → ROOF
  SIDING                → SIDE
  INSULATION            → INSL
  DRYWALL               → DRYW
  OTHER                 → MISC
}
```

---

## 4. Category Codes (Level 2)

### 4.1 Framing Categories (FRM)

| Code | Category | Examples |
|------|----------|----------|
| LUM | Dimensional Lumber | 2x4, 2x6, 2x8, 2x10, 2x12 |
| ENG | Engineered Wood | LVL, I-joists, glulam |
| SHT | Sheathing | OSB, plywood, ZIP |
| PTW | Pressure-Treated | Ground contact, decking |
| TRS | Trusses | Roof trusses, floor trusses |

### 4.2 Concrete Categories (CONC)

| Code | Category | Examples |
|------|----------|----------|
| MIX | Ready-Mix | 3000 PSI, 4000 PSI |
| REB | Rebar | #4, #5, mesh |
| FRM | Forming | Plywood, Sonotube |
| ANC | Anchors | J-bolts, wedge anchors |

### 4.3 Roofing Categories (ROOF)

| Code | Category | Examples |
|------|----------|----------|
| SHG | Shingles | 3-tab, architectural |
| UND | Underlayment | Felt, synthetic |
| FLS | Flashing | Step, valley, drip edge |
| VNT | Ventilation | Ridge vent, soffit vent |
| ACC | Accessories | Starter, hip/ridge caps |

### 4.4 Siding Categories (SIDE)

| Code | Category | Examples |
|------|----------|----------|
| VNL | Vinyl | Dutch lap, board & batten |
| FBC | Fiber Cement | Lap, panel, shingle |
| WOD | Wood | Cedar, pine lap |
| STN | Stone/Brick | Veneer, manufactured |
| TRM | Trim | Corner, J-channel |

### 4.5 Insulation Categories (INSL)

| Code | Category | Examples |
|------|----------|----------|
| BAT | Batt Insulation | R-13, R-19, R-30 |
| BLN | Blown Insulation | Cellulose, fiberglass |
| FOM | Foam | Spray foam, rigid foam |
| VBR | Vapor Barrier | 6 mil poly |

### 4.6 Drywall Categories (DRYW)

| Code | Category | Examples |
|------|----------|----------|
| SHT | Sheets | 1/2", 5/8", moisture resist |
| CMP | Compound | All-purpose, topping |
| TAP | Tape | Paper, mesh |
| CRN | Corner | Metal, vinyl bead |
| ACC | Accessories | Screws, furring |

---

## 5. Detail Codes (Level 3+)

### 5.1 Lumber Detail Format

```
[SIZE]-[SPECIES]-[LENGTH]

SIZE:     2X4, 2X6, 2X8, 2X10, 2X12
SPECIES:  SPF (Spruce-Pine-Fir), SYP (Southern Yellow Pine)
LENGTH:   8, 10, 12, 14, 16 (feet)

Examples:
FRM-LUM-2X4-SPF-8     2x4 SPF 8'
FRM-LUM-2X6-SYP-12    2x6 SYP 12'
FRM-LUM-2X12-SPF-16   2x12 SPF 16'
```

### 5.2 Engineered Wood Detail Format

```
[TYPE]-[DEPTH]-[SERIES]

TYPE:   LVL, IJT (I-Joist), GLM (Glulam), PSL
DEPTH:  9.5, 11.875, 14 (inches)
SERIES: Brand series code

Examples:
FRM-ENG-LVL-11.875    LVL 11-7/8"
FRM-ENG-IJT-9.5-TJI   TJI I-Joist 9-1/2"
FRM-ENG-GLM-5.5X12    Glulam 5-1/2 x 12"
```

### 5.3 Sheathing Detail Format

```
[TYPE]-[THICKNESS]-[SIZE]

TYPE:       OSB, PLY (Plywood), ZIP
THICKNESS:  7/16, 1/2, 5/8, 3/4
SIZE:       4X8, 4X9, 4X10

Examples:
FRM-SHT-OSB-7/16-4X8   7/16" OSB 4x8
FRM-SHT-ZIP-1/2-4X8    1/2" ZIP System 4x8
FRM-SHT-PLY-3/4-4X8    3/4" Plywood 4x8
```

### 5.4 Roofing Detail Format

```
[TYPE]-[STYLE]-[WARRANTY/SPEC]

Examples:
ROOF-SHG-ARCH-30Y      Architectural shingles 30-year
ROOF-SHG-3TAB-25Y      3-Tab shingles 25-year
ROOF-UND-SYN-30        Synthetic underlayment 30 lb
ROOF-FLS-DRIP-WHT      Drip edge white
```

### 5.5 Siding Detail Format

```
[TYPE]-[PROFILE]-[SIZE/COLOR]

Examples:
SIDE-FBC-LAP-8.25      Fiber cement lap 8.25"
SIDE-VNL-DLAP-D4       Vinyl Dutch lap D4
SIDE-WOD-BVLD-1X8      Wood bevel 1x8
```

---

## 6. Phase Codes

### 6.1 Construction Phase Prefixes

| Phase | Code | Description | Typical Duration |
|-------|------|-------------|------------------|
| Site Preparation | 01 | Clearing, grading, utilities | Week 1 |
| Foundation | 02 | Footings, walls, slab | Week 2-3 |
| Framing | 03 | Structure, sheathing | Week 4-6 |
| MEP Rough | 04 | Electrical, plumbing, HVAC rough | Week 7-8 |
| Exterior | 05 | Roofing, siding, windows/doors | Week 8-10 |
| Insulation | 06 | All insulation | Week 10-11 |
| Drywall | 07 | Hang, tape, finish | Week 11-13 |
| Interior Finish | 08 | Trim, paint, flooring | Week 14-16 |
| MEP Finish | 09 | Fixtures, devices | Week 16-17 |
| Final | 10 | Punch, cleanup | Week 18 |

### 6.2 Phase Usage

Phase prefix is **optional** and used for:
- Delivery scheduling
- Material staging
- Phase-based reporting
- Variance analysis by phase

---

## 7. Sample Code Database

### 7.1 Dimensional Lumber (50 samples)

| Code | Description | UOM |
|------|-------------|-----|
| FRM-LUM-2X4-SPF-8 | 2x4 SPF #2 8' | EA |
| FRM-LUM-2X4-SPF-10 | 2x4 SPF #2 10' | EA |
| FRM-LUM-2X4-SPF-12 | 2x4 SPF #2 12' | EA |
| FRM-LUM-2X4-SPF-14 | 2x4 SPF #2 14' | EA |
| FRM-LUM-2X4-SPF-16 | 2x4 SPF #2 16' | EA |
| FRM-LUM-2X6-SPF-8 | 2x6 SPF #2 8' | EA |
| FRM-LUM-2X6-SPF-10 | 2x6 SPF #2 10' | EA |
| FRM-LUM-2X6-SPF-12 | 2x6 SPF #2 12' | EA |
| FRM-LUM-2X6-SPF-14 | 2x6 SPF #2 14' | EA |
| FRM-LUM-2X6-SPF-16 | 2x6 SPF #2 16' | EA |
| FRM-LUM-2X8-SPF-10 | 2x8 SPF #2 10' | EA |
| FRM-LUM-2X8-SPF-12 | 2x8 SPF #2 12' | EA |
| FRM-LUM-2X8-SPF-14 | 2x8 SPF #2 14' | EA |
| FRM-LUM-2X8-SPF-16 | 2x8 SPF #2 16' | EA |
| FRM-LUM-2X10-SPF-10 | 2x10 SPF #2 10' | EA |
| FRM-LUM-2X10-SPF-12 | 2x10 SPF #2 12' | EA |
| FRM-LUM-2X10-SPF-14 | 2x10 SPF #2 14' | EA |
| FRM-LUM-2X10-SPF-16 | 2x10 SPF #2 16' | EA |
| FRM-LUM-2X12-SPF-10 | 2x12 SPF #2 10' | EA |
| FRM-LUM-2X12-SPF-12 | 2x12 SPF #2 12' | EA |
| FRM-LUM-2X12-SPF-14 | 2x12 SPF #2 14' | EA |
| FRM-LUM-2X12-SPF-16 | 2x12 SPF #2 16' | EA |

### 7.2 Engineered Lumber (15 samples)

| Code | Description | UOM |
|------|-------------|-----|
| FRM-ENG-LVL-1.75X9.5 | LVL 1-3/4 x 9-1/2" | LF |
| FRM-ENG-LVL-1.75X11.875 | LVL 1-3/4 x 11-7/8" | LF |
| FRM-ENG-LVL-1.75X14 | LVL 1-3/4 x 14" | LF |
| FRM-ENG-LVL-3.5X9.5 | LVL 3-1/2 x 9-1/2" | LF |
| FRM-ENG-LVL-3.5X11.875 | LVL 3-1/2 x 11-7/8" | LF |
| FRM-ENG-IJT-9.5-TJI | TJI I-Joist 9-1/2" | LF |
| FRM-ENG-IJT-11.875-TJI | TJI I-Joist 11-7/8" | LF |
| FRM-ENG-IJT-14-TJI | TJI I-Joist 14" | LF |
| FRM-ENG-RIM-9.5 | Rim Board 9-1/2" | LF |
| FRM-ENG-RIM-11.875 | Rim Board 11-7/8" | LF |

### 7.3 Sheathing (10 samples)

| Code | Description | UOM |
|------|-------------|-----|
| FRM-SHT-OSB-7/16-4X8 | OSB 7/16" 4x8 | SHT |
| FRM-SHT-OSB-1/2-4X8 | OSB 1/2" 4x8 | SHT |
| FRM-SHT-PLY-1/2-4X8 | Plywood 1/2" 4x8 | SHT |
| FRM-SHT-PLY-3/4-4X8 | Plywood 3/4" 4x8 | SHT |
| FRM-SHT-ZIP-1/2-4X8 | ZIP System 1/2" 4x8 | SHT |
| FRM-SHT-ZIP-7/16-4X8 | ZIP System 7/16" 4x8 | SHT |
| FRM-SHT-RFDCK-5/8-4X8 | Roof Deck 5/8" 4x8 | SHT |

### 7.4 Roofing (15 samples)

| Code | Description | UOM |
|------|-------------|-----|
| ROOF-SHG-ARCH-30Y-BLK | Architectural 30-yr Black | BDL |
| ROOF-SHG-ARCH-30Y-GRY | Architectural 30-yr Gray | BDL |
| ROOF-SHG-ARCH-30Y-BRN | Architectural 30-yr Brown | BDL |
| ROOF-SHG-3TAB-25Y-BLK | 3-Tab 25-yr Black | BDL |
| ROOF-UND-FLT-15 | Felt Underlayment 15# | RL |
| ROOF-UND-FLT-30 | Felt Underlayment 30# | RL |
| ROOF-UND-SYN | Synthetic Underlayment | RL |
| ROOF-FLS-DRIP-WHT | Drip Edge White | EA |
| ROOF-FLS-STEP | Step Flashing | EA |
| ROOF-FLS-VALLEY | Valley Flashing | LF |
| ROOF-VNT-RIDGE | Ridge Vent | LF |
| ROOF-ACC-STARTER | Starter Strip | EA |
| ROOF-ACC-HIPRDG | Hip & Ridge Caps | BDL |

### 7.5 Siding (10 samples)

| Code | Description | UOM |
|------|-------------|-----|
| SIDE-FBC-LAP-8.25 | HardiePlank 8.25" | EA |
| SIDE-FBC-LAP-7.25 | HardiePlank 7.25" | EA |
| SIDE-FBC-SHK-STG | HardieShingle Staggered | EA |
| SIDE-VNL-DLAP-D4 | Vinyl Dutch Lap D4 | SQ |
| SIDE-VNL-DLAP-D5 | Vinyl Dutch Lap D5 | SQ |
| SIDE-TRM-CORNER | Corner Trim 10' | EA |
| SIDE-TRM-JCHAN | J-Channel 12' | EA |

### 7.6 Insulation (10 samples)

| Code | Description | UOM |
|------|-------------|-----|
| INSL-BAT-R13-15IN | R-13 Batt 15" | SF |
| INSL-BAT-R19-15IN | R-19 Batt 15" | SF |
| INSL-BAT-R19-23IN | R-19 Batt 23" | SF |
| INSL-BAT-R30-16IN | R-30 Batt 16" | SF |
| INSL-BAT-R38-16IN | R-38 Batt 16" | SF |
| INSL-BLN-CELL | Cellulose Blown | BAG |
| INSL-FOM-SPRAY-CC | Spray Foam Closed Cell | BF |
| INSL-FOM-SPRAY-OC | Spray Foam Open Cell | BF |
| INSL-FOM-RGD-2IN | Rigid Foam 2" | SHT |
| INSL-VBR-6MIL | Vapor Barrier 6 mil | SF |

### 7.7 Drywall (10 samples)

| Code | Description | UOM |
|------|-------------|-----|
| DRYW-SHT-1/2-4X8 | Drywall 1/2" 4x8 | SHT |
| DRYW-SHT-1/2-4X12 | Drywall 1/2" 4x12 | SHT |
| DRYW-SHT-5/8-4X8 | Drywall 5/8" 4x8 | SHT |
| DRYW-SHT-5/8-4X12 | Drywall 5/8" 4x12 | SHT |
| DRYW-SHT-MR-1/2-4X8 | Moisture Resistant 1/2" 4x8 | SHT |
| DRYW-CMP-AP-5GAL | All-Purpose Mud 5 gal | EA |
| DRYW-CMP-TOP-5GAL | Topping Compound 5 gal | EA |
| DRYW-TAP-PPR | Paper Tape 500' | RL |
| DRYW-TAP-MSH | Mesh Tape 300' | RL |
| DRYW-CRN-MTL | Metal Corner Bead | EA |

---

## 8. Validation Rules

### 8.1 Code Format Validation

```javascript
// Regex pattern for code validation
const codePattern = /^[A-Z]{3,4}-[A-Z]{2,4}(-[A-Z0-9\/.-]+)*$/;

// Examples:
// Valid:   FRM-LUM-2X4-SPF-8
// Valid:   ROOF-SHG-ARCH-30Y
// Invalid: frm-lum-2x4  (lowercase)
// Invalid: FRM_LUM_2X4  (underscores)
// Invalid: AB-C-D       (trade too short)
```

### 8.2 Required Fields

| Field | Required | Validation |
|-------|----------|------------|
| Trade Code | Yes | Must match trade enum |
| Category Code | Yes | Must exist in category list |
| Description | Yes | Non-empty string |
| Unit of Measure | Yes | Standard UOM codes |

### 8.3 Code Generation

```javascript
function generateMaterialCode(trade, category, ...details) {
  const parts = [trade.toUpperCase(), category.toUpperCase()];

  for (const detail of details) {
    if (detail) {
      parts.push(detail.toUpperCase());
    }
  }

  return parts.join('-');
}

// Example:
// generateMaterialCode('FRM', 'LUM', '2X4', 'SPF', '8')
// Returns: 'FRM-LUM-2X4-SPF-8'
```

---

## 9. Schema Updates

### 9.1 Proposed Material Model Extensions

```prisma
model Material {
  id          String   @id @default(uuid())

  // Primary identifier
  code        String   @unique  // e.g., FRM-LUM-2X4-SPF-8

  // Parsed code components
  tradeCode       String    // FRM
  categoryCode    String    // LUM
  subcategoryCode String?   // 2X4
  detailCode      String?   // SPF-8

  // Description
  description String
  sku         String   @unique  // Internal SKU

  // Keep existing categorization
  category    MaterialCategory
  subcategory String?

  // DART integration (existing)
  dartCategory     Int?
  dartCategoryName String?

  // Phase association (optional)
  primaryPhase     ConstructionPhase?

  // Industry standard references (optional)
  csiDivision      String?   // "06"
  csiSection       String?   // "06 11 00"
  uniformatElement String?   // "B1010"

  // ... rest of existing fields
}

enum ConstructionPhase {
  SITE_PREP
  FOUNDATION
  FRAMING
  MEP_ROUGH
  EXTERIOR
  INSULATION
  DRYWALL
  INTERIOR_FINISH
  MEP_FINISH
  FINAL
}
```

### 9.2 New Lookup Tables

```prisma
model TradeCategory {
  code        String   @id    // FRM
  name        String          // Framing
  description String?
  sortOrder   Int
}

model MaterialCodeCategory {
  code        String   @id    // LUM
  tradeCode   String          // FRM
  name        String          // Dimensional Lumber
  description String?

  trade       TradeCategory @relation(fields: [tradeCode], references: [code])
}
```

---

## 10. Migration Strategy

### 10.1 Existing Data

1. **Audit current materials** - Count by existing category
2. **Map to new codes** - Generate codes for existing materials
3. **Add code field** - Database migration to add `code` column
4. **Populate codes** - Script to generate codes from existing data
5. **Validate** - Verify all materials have valid codes

### 10.2 Code Generation Script

```javascript
// Pseudocode for migration
for (const material of existingMaterials) {
  const trade = mapCategoryToTrade(material.category);
  const category = determineCategory(material);
  const details = parseDescription(material.description);

  material.code = generateMaterialCode(trade, category, ...details);
}
```

---

## Conclusion

This hybrid coding system provides:

1. **Intuitive trade-based organization** for daily use
2. **Hierarchical structure** for reporting and filtering
3. **Optional phase prefixes** for scheduling
4. **Flexibility** for future expansion
5. **Compatibility** with existing DART categories
6. **Industry reference mapping** for external integrations

The system balances simplicity for end-users with the flexibility needed for enterprise-scale operations.
