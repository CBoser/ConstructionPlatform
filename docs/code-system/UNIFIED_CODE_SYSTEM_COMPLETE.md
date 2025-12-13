# Unified Code System - Complete Implementation

**Status**: Implementation Complete
**Date**: December 2025
**Version**: 2.0 - Updated Format

---

## Executive Summary

The MindFlow Unified Code System ties together three legacy systems into a single coherent framework:

| Source System | Format | Example | Status |
|---------------|--------|---------|--------|
| Holt | `XXXXX-XXXX` | `10100-4085` | Mapped |
| Richmond | `ALPHA` | `ELVA`, `3CARA` | Mapped |
| BAT Legacy | `\|XX` | `\|10`, `\|22` | Mapped |
| **Unified** | `PPPP-XXX.XXX-XX-XXXX` | `1670-020.001-AB-1000` | Active |

---

## 1. Code Format Standard (Decision 1 - RESOLVED)

### Unified Code Format v2.0

```
PPPP-XXX.XXX-XX-XXXX
│    │   │   │   │
│    │   │   │   └── Item Type (4 digits: 1000=Framing, 1100=Siding, 2100=Siding Alt)
│    │   │   └────── Elevation Code (1-2 chars: A, B, C, D, AB, **, etc.)
│    │   └────────── Option Suffix (.000=base, .001=rf, .008=tc, .011=ec, etc.)
│    └────────────── Phase Code (3 digits: 010=Foundation, 020=Main Walls, 060=Siding)
└──────────────────── Plan Code (4 digits: 1670, 1890, 2400, etc.)

Examples:
  1670-020.001-AB-1000  → Plan 1670, Main Walls ReadyFrame, Elevations A&B, Framing
  1890-060.011-A-1100   → Plan 1890, Exterior Siding Enhanced Corners, Elevation A, Siding
  2400-010.008-**-1000  → Plan 2400, Foundation Tall Crawl, All Elevations, Framing
```

### Format Rules

| Component | Width | Valid Values | Description |
|-----------|-------|--------------|-------------|
| Plan Code | 4 | 0000-9999 | Builder plan number |
| Phase Code | 3 | 009-090 | Phase/pack series |
| Option Suffix | 3 | .000-.083 | Option modifier (00=base, 01-83=options) |
| Elevation | 1-4 | A,B,C,D,AB,ABC,ABCD,** | Elevation designation |
| Item Type | 4 | 1000,1100,2100 | Material class |

### Option Extensions (84 Defined: .000-.083)

#### Core Structural Options (00-09)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .000 | base | Base/Standard | base |
| .001 | rf | ReadyFrame | structural |
| .002 | lo | Loft Option | structural |
| .003 | l | Loft | structural |
| .004 | nl | No Loft | structural |
| .005 | x | Extended | structural |
| .006 | sr | Sunroom | addition |
| .007 | pw | Post Wrap | exterior |
| .008 | tc | Tall Crawl | foundation |
| .009 | 9t | 9' Tall Walls | structural |

#### Wall & Exterior Options (10-19)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .010 | 10t | 10' Tall Walls | structural |
| .011 | ec | Enhanced Corners | exterior |
| .012 | er | Enhanced Rear | exterior |
| .013 | fw | Fauxwood Siding | exterior |
| .014 | ma | Masonry | exterior |
| .015 | pr | Porch Rail | exterior |
| .016 | dk | Deck | addition |
| .017 | cp | Covered Patio | addition |
| .018 | s | Exterior Stair | exterior |
| .019 | hw | Housewrap | exterior |

#### Room/Area Options (20-29)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .020 | fp | Fireplace | interior |
| .021 | dba | Deluxe Bath A | interior |
| .022 | dba2 | Deluxe Bath A2 | interior |
| .023 | dba3 | Deluxe Bath A3 | interior |
| .024 | br4 | Bedroom 4 | interior |
| .025 | br5 | Bedroom 5 | interior |
| .026 | stdy | Study | interior |
| .027 | den | Den | interior |
| .028 | denfb | Den w/ Full Bath | interior |
| .029 | pwdr | Powder Room | interior |

#### Garage & Covered Structures (30-39)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .030 | 3car | 3-Car Garage | garage |
| .031 | 4car | 4-Car Tandem | garage |
| .032 | gx2 | Garage 2' Ext | garage |
| .033 | gx4 | Garage 4' Ext | garage |
| .034 | gx5 | Garage 5' Ext | garage |
| .035 | cd | Covered Deck | addition |
| .036 | cd2 | Covered Deck 2 | addition |
| .037 | cd3 | Covered Deck 3 | addition |
| .038 | cp2 | Covered Patio 2 | addition |
| .039 | cp3 | Covered Patio 3 | addition |

#### Window & Door Options (40-49)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .040 | wgr | Great Room Windows | windows |
| .041 | wbr2 | Bedroom 2 Window | windows |
| .042 | wbr3 | Bedroom 3 Window | windows |
| .043 | wbr4 | Bedroom 4 Window | windows |
| .044 | wbr5 | Bedroom 5 Window | windows |
| .045 | wstd | Study Window | windows |
| .046 | ctr | Center Meet Door | doors |
| .047 | msl | Multi-Slide Door | doors |
| .048 | frd | French Double Door | doors |
| .049 | wflx | Flex Window | windows |

#### Foundation Options (50-59)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .050 | wo | Walk-Out Basement | foundation |
| .051 | wo2 | Walk-Out Basement 2 | foundation |
| .052 | bsmfw | Basement Full Wall | foundation |
| .053 | cfnd | Custom Foundation | foundation |
| .054 | slb | Slab Foundation | foundation |
| .055-.059 | - | Reserved | reserved |

#### Ceiling & Interior (60-69)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .060 | cofdr | Coffered Dining | interior |
| .061 | cofmb | Coffered Master BR | interior |
| .062 | cofent | Coffered Entry | interior |
| .063 | coflv | Coffered Living | interior |
| .064 | bkcs | Bookcase | interior |
| .065 | retrt | Retreat | interior |
| .066 | pkoff | Pocket Office | interior |
| .067-.069 | - | Reserved | reserved |

#### Specialty Options (70-79)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .070 | xgrt | Extended Great Room | structural |
| .071 | loft2 | Loft 2 | structural |
| .072 | sunwo | Sunroom Walk-Out | addition |
| .073 | fpsng | Fireplace Single | interior |
| .074 | fpdbl | Fireplace Double | interior |
| .075 | altkn | Alternate Kitchen | interior |
| .076-.079 | - | Reserved | reserved |

#### Elevation-Specific (80-83)

| Code | Abbr | Full Name | Category |
|------|------|-----------|----------|
| .080 | elva | Elevation A Specific | elevation |
| .081 | elvb | Elevation B Specific | elevation |
| .082 | elvc | Elevation C Specific | elevation |
| .083 | elvd | Elevation D Specific | elevation |

---

## 2. Phase/Pack Code Mapping (Decision 2 - RESOLVED)

### Unified Phase Codes

| Series | Phase Range | Description | Shipping Order |
|--------|-------------|-------------|----------------|
| 009 | 009.000-009.200 | Basement Walls | 1 |
| 010 | 010.000-010.830 | Foundation | 1 |
| 011 | 011.000-011.620 | Main Joist System | 1 |
| 012 | 012.000-012.505 | Garage Foundation | 1 |
| 013 | 013.100-013.300 | Covered Patio Foundation | 1 |
| 014 | 014.100-014.300 | Deck Foundation | 1 |
| 015 | 015.100-015.300 | Covered Deck Foundation | 1 |
| 016 | 016.100-016.610 | Main Floor Over Basement | 1 |
| 018 | 018.000-018.830 | Main Subfloor | 2 |
| 020 | 020.000-020.830 | Main Floor Walls | 3 |
| 022 | 022.000-022.505 | Garage Walls | 3 |
| 023 | 023.000-023.610 | Covered Patio Framing | 3 |
| 024 | 024.000-024.605 | Deck Framing | 3 |
| 025 | 025.008-025.300 | Covered Deck Framing | 3 |
| 030 | 030.000-030.620 | 2nd Floor System | 3 |
| 032 | 032.000-032.623 | 2nd Floor Subfloor | 4 |
| 034 | 034.000-034.909 | 2nd Floor Walls | 4 |
| 040 | 040.000-040.800 | Roof | 5 |
| 042 | 042.000-042.505 | Garage Roof | 5 |
| 043 | 043.000-043.920 | Covered Patio Roof | 5 |
| 045 | 045.000-045.300 | Covered Deck Roof | 5 |
| 058 | 058.000 | Housewrap | 6 |
| 060 | 060.000-060.800 | Exterior Siding | 7 |
| 062 | 062.000-062.505 | Garage Exterior | 7 |
| 063 | 063.000-063.610 | Covered Patio Exterior | 7 |
| 065 | 065.100-065.307 | Covered Deck Exterior | 7 |
| 074 | 074.005-074.605 | Deck Exterior | 7 |
| 075 | 075.100-075.908 | Exterior Stair | 7 |

### Holt Phase Mapping

| Holt Code | Unified Phase | Elevation | BAT Pack | Shipping |
|-----------|---------------|-----------|----------|----------|
| 10100 | 010.000 | A | \|10 | 1 |
| 10200 | 010.000 | B | \|10 | 1 |
| 10300 | 010.000 | C | \|10 | 1 |
| 10400 | 010.000 | D | \|10 | 1 |
| 11100 | 060.000 | A | \|60 | 7 |
| 20100 | 020.000 | A | \|20 | 3 |
| 40100 | 040.000 | A | \|40 | 5 |
| 83100 | 060.000 | A | \|83 | 7 |

---

## 3. Item Type Codes (Decision 5 - RESOLVED)

### Decision: Preserve Holt Cost Codes with Unified Material Class Mapping

| Holt Cost Code | Holt Name | Unified Class | DART Category |
|----------------|-----------|---------------|---------------|
| 4085 | Lumber | 1000 (Framing) | 1 - Dimensional |
| 4086 | Lumber - Barge Credit | 1000 (Framing) | 1 - Dimensional |
| 4120 | Trusses | 1000 (Framing) | 2 - Engineered |
| 4140 | Window Supply | 1000 (Framing)* | 4 - Windows |
| 4142 | Window - Triple Pane | 1000 (Framing)* | 4 - Windows |
| 4150 | Exterior Door Supply | 1000 (Framing)* | 5 - Doors |
| 4155 | Siding Supply | 1100 (Siding) | 3 - Siding |
| 4320 | Interior Trim - Millwork | 1100 (Siding) | 6 - Trim |

*Note: Windows and Doors temporarily use 1000 until 1200/1300 classes are implemented.

---

## 4. Cross-Reference Table Structure (Decision 6 - RESOLVED)

### Database Models

```prisma
// Holt Phase Cross-Reference
model HoltPhaseXref {
  holtPhaseCode   String   @unique  // "10100"
  holtCostCode    String?           // "4085"
  unifiedPhaseId  String?           // FK to PhaseOptionDefinition
  elevationCode   String?           // "A", "B", "**"
  itemTypeCode    String?           // "1000"
  batPackId       String?           // "|10"
  shippingOrder   Int?
}

// Item Type Cross-Reference
model ItemTypeXref {
  holtCostCode      String   @unique  // "4085"
  holtCostName      String?           // "Lumber"
  materialClassId   String?           // FK to MaterialClass
  dartCategory      Int?              // 1
  dartCategoryName  String?           // "Dimensional Lumber"
}

// BAT Pack Definition
model BatPackDefinition {
  packId          String   @unique  // "|10"
  packName        String            // "Foundation"
  packTitle       String?           // "10 Foundation"
  richmondCodes   String?           // "ELVA,ELVB,ELVC"
  shippingOrder   Int
  materialClassId String?
}
```

---

## 5. Elevation Code Handling (Decision 4 - RESOLVED)

### Standard Elevation Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| A | Elevation A only | Single elevation pack |
| B | Elevation B only | Single elevation pack |
| C | Elevation C only | Single elevation pack |
| D | Elevation D only | Single elevation pack |
| AB | Elevations A and B | Combined pack |
| ABC | Elevations A, B, and C | Combined pack |
| ABCD | All four elevations | Full elevation set |
| ** | Universal (all elevations) | Common materials |

### Database Model

```prisma
model Layer1CodeElevation {
  layer1CodeId  String
  elevationCode String   // "A", "B", "**"
  @@unique([layer1CodeId, elevationCode])
}
```

---

## 6. Richmond Option Code Mappings

### 80+ Richmond Codes Mapped

| Category | Codes | Example Mapping |
|----------|-------|-----------------|
| Garage | 3CARA, 3CARB, 3CARC, 4CARTA | Multi-phase (12, 22, 42, 62) |
| Patio | COVP, COVP2, COVP3 | Multi-phase (13, 23, 43, 63) |
| Deck | DECK, DECK2, DECK3 | Multi-phase (14, 24, 74) |
| Covered Deck | COVD, COVD2, COVD3 | Multi-phase (15, 25, 45, 65) |
| Bathroom | DBA, DBA2, DBA3 | Phase 020.210-020.230 |
| Bedroom | ABR4, ABR5BA | Phase 020.240-020.250 |
| Windows | WDWGREAT, WDWBR2-5 | Multi-phase |
| Structural | XGREAT, SUN, TALLCRWL | Multi-phase |

---

## 7. Implementation Files

### Schema Files
- `backend/prisma/schema.prisma` - All models defined

### Seed Files
- `backend/prisma/seeds/codeSystem.seed.ts` - Core code system (130+ phases, 80+ Richmond codes)
- `backend/prisma/seeds/holtXref.seed.ts` - Holt cross-reference (30+ mappings, 30+ BAT packs)

### Documentation
- `docs/code-system/DECISION.md` - Final decision document
- `docs/code-system/UNIFIED_CODE_SYSTEM_COMPLETE.md` - This file
- `docs/code-system/VBA_INTEGRATION.md` - VBA integration specs

---

## 8. Lookup Functions

### Get Unified Code from Holt

```sql
-- SQL Query
SELECT
  h.holt_phase_code,
  p.phase_code AS unified_phase,
  h.elevation_code,
  mc.class_code AS item_type,
  CONCAT(
    'PLAN-',
    p.phase_code,
    '-',
    h.elevation_code,
    '-',
    mc.class_code
  ) AS full_unified_code
FROM holt_phase_xref h
JOIN phase_option_definitions p ON h.unified_phase_id = p.id
JOIN material_classes mc ON p.material_class_id = mc.id
WHERE h.holt_phase_code = '10100';
```

### Get Unified Code from Richmond

```sql
-- SQL Query
SELECT
  r.option_code AS richmond_code,
  p.phase_code AS unified_phase,
  p.phase_name,
  mc.class_code AS item_type
FROM richmond_option_codes r
JOIN phase_option_definitions p ON r.phase_id = p.id
JOIN material_classes mc ON p.material_class_id = mc.id
WHERE r.option_code = 'COVP';
```

---

## 9. Summary Statistics

| Component | Count |
|-----------|-------|
| Material Classes | 2 |
| Option Suffixes | 18 |
| Phase Definitions | 130+ |
| Richmond Option Codes | 80+ |
| Holt Phase Mappings | 30+ |
| BAT Pack Definitions | 30+ |
| Item Type Mappings | 8 |

---

## 10. Next Steps

1. **Run Database Migration** - Apply schema changes
2. **Execute Seed Scripts** - Populate reference tables
3. **Validate Data** - Run validation queries
4. **Build VBA Integration** - Connect Excel workbooks
5. **Test End-to-End** - Verify Holt/Richmond data flows correctly

---

**Document Status**: Complete
**Implementation Status**: Schema + Seeds Ready
**Next Action**: Database migration and seed execution
