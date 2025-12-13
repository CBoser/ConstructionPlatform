# BAT Unified Coding System
## Central Material Database Reference Guide

**Version:** 2.0
**Generated:** 2025-12-13
**Total SKUs:** 516
**Phase Codes:** 53
**Status:** Architecture Decisions Confirmed

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Unique SKUs | 516 |
| RICHMOND Materials | 400 |
| HOLT Materials | 278 |
| Phase Codes | 53 |
| Suffix Codes | 17 |
| Item Types | 9 |

---

## Table of Contents

1. [Overview](#overview)
2. [Unified Code Structure](#unified-code-structure)
3. [Architecture Decisions](#architecture-decisions)
4. [Numeric Suffix Extensions](#numeric-suffix-extensions)
5. [Item Type Cross-Reference](#item-type-cross-reference)
6. [Elevation Mapping](#elevation-mapping)
7. [Phase Code Reference](#phase-code-reference)
8. [Option Mappings](#option-mappings)
9. [Holt Suffix Reference](#holt-suffix-reference)
10. [Plan Reference](#plan-reference)
11. [Conversion Examples](#conversion-examples)
12. [Cross-Reference Tables](#cross-reference-tables)

---

## Overview

This is Sales Team One's **canonical code system** - a Rosetta Stone that translates any customer's codes (Holt, Richmond, Sekisui, future builders) to a single unified format. This enables:

- **Consistent data structure** across all builders
- **Bi-directional translation** between any customer system
- **Future-proof architecture** for new customers
- **Single source of truth** for material management

### Customer Code Comparison

| Customer | Their Format | Example | Notes |
|----------|--------------|---------|-------|
| Holt | `PPPP-XXXXX-CCCC` | `1670-10100-4085` | 9-digit phase + cost code |
| Richmond | `\|PP.XX NAME - OPT` | `\|12.00 3RD CAR - 3CARA` | Pipe + phase + alpha options |
| Legacy BAT | `PP NAME - ELVA - ELVB` | `10 Foundation - ELVA - ELVB` | Phase + name + elevation codes |
| **Unified** | `PPPP-PPP.XXX-EE-IIII` | `G914-012.000-B-1000` | Plan-Phase-Elev-ItemType |

---

## Unified Code Structure

```
PPPP-PPP.XXX-EE-IIII
│    │       │   │
│    │       │   └─ Item Type Code (1000, 2100, 2200, etc.)
│    │       └───── Elevation Code (A, B, AB, BCD, **)
│    └─────────── Phase Code (010.820, 012.000, etc.)
└──────────────── Plan Code (G914, 1670, G603, etc.)
```

### Component Breakdown

| Component | Format | Description | Examples |
|-----------|--------|-------------|----------|
| Plan Code | 4 chars | Builder plan number | G914, 1670, G603, GA35 |
| Phase Code | PPP.XXX | Major.Minor phase identifier | 010.000, 012.000, 034.610 |
| Elevation | 1-4 chars | Elevation letter(s) or ** | A, B, AB, BCD, ABCD, ** |
| Item Type | 4 digits | Material category code | 1000, 2100, 2200, 3000 |

### Full Code Examples

| Unified Code | Plan | Phase | Elevation | Item Type | Meaning |
|--------------|------|-------|-----------|-----------|---------|
| `G914-012.000-B-1000` | G914 | 012.000 | B | 1000 | 3rd Car Garage Foundation, Elev B, Framing |
| `1670-020.x01-AB-1000` | 1670 | 020.x01 | AB | 1000 | Main Walls ReadyFrame, Elevs A+B, Framing |
| `G603-034.610-**-1000` | G603 | 034.610 | ** | 1000 | Loft→Bedroom, All Elevations, Framing |
| `2675-060.x11-C-2100` | 2675 | 060.x11 | C | 2100 | Enhanced Corners, Elev C, Siding |

---

## Architecture Decisions

### Decision 1: Code Format Standard ✓

**Goal:** Tie legacy BAT system with Holt system using unified format

**Resolution:** Adopt `PPPP-PPP.XXX-EE-IIII` format
- Plan codes preserved from source system
- Phase codes use 3-digit major + 3-digit minor
- Elevation uses letters (not digits)
- Item types use unified 4-digit codes

---

### Decision 2: Phase/Pack Code Mapping ✓

**Goal:** Map and cross-reference each system into unified phase codes

**Resolution:** 
- Richmond pack IDs (|10, |20, etc.) → Phase codes (010.xxx, 020.xxx)
- Holt 5-digit phases → Unified phases via suffix lookup
- Complete mapping in [Phase Code Reference](#phase-code-reference)

---

### Decision 3: Option-Specific Pack Handling ✓

**Goal:** Standardize option suffix handling

**Resolution:** Convert all legacy alpha suffixes to numeric extensions

| Numeric | Alpha | Description |
|---------|-------|-------------|
| .x01 | rf | ReadyFrame |
| .x03 | l, lo | Loft |
| .x04 | nl | No Loft |
| .x05 | x | Extended |
| .x06 | sr | Sunroom |
| .x07 | pw | Post Wrap |
| .x08 | tc | Tall Crawl |
| .x09 | 9t | 9' Tall Walls |
| .x10 | 10t | 10' Tall Walls |
| .x11 | ec | Enhanced Corners |
| .x12 | er | Enhanced Rear |
| .x13 | fw | Fauxwood Siding |
| .x14 | ma | Masonry |
| .x15 | pr | Porch Rail |
| .x18 | s | Exterior Stair |
| .x19 | — | Housewrap (Options) |

---

### Decision 4: Elevation Code Handling ✓

**Goal:** Standardize elevation representation

**Resolution:**
- Always use letters in unified system (A, B, C, D, etc.)
- Allow `**` for "all elevations" / universal
- Multi-elevation codes: AB, BCD, ABCD, etc.
- Holt digit extraction: position 7 of 9-digit code (1=A, 2=B, etc.)

---

### Decision 5: Item Type Codes ✓

**Goal:** Create unified item type system with customer cross-reference

**Resolution:** Use our own unified codes as the Rosetta Stone:

| Unified | Description | Holt | Richmond |
|---------|-------------|------|----------|
| 1000 | Framing/Lumber | 4085 | 4085 |
| 1100 | Lumber - Barge Credit | 4086 | 4086 |
| 1200 | Trusses | 4120 | 4120 |
| 2000 | Windows | 4140 | 4140 |
| 2050 | Windows - Triple Pane | 4142 | 4142 |
| 2100 | Siding/Exterior | 4155 | 4155 |
| 2150 | Exterior Doors | 4150 | 4150 |
| 2200 | Roofing | 4156 | 4156 |
| 3000 | Interior Trim/Millwork | 4320 | 4320 |

---

### Decision 6: Cross-Reference Table Structure ✓

**Goal:** Define lookup table structure

**Resolution:** Full detail with customer mapping (Option B + C combined)
```
Source_Code + Option_Code → Unified_Phase, Elevation, Item_Type, Phase_Name, Shipping_Order
```

---

## Numeric Suffix Extensions

Legacy alpha suffixes converted to numeric for database consistency:

| Numeric | Legacy Alpha | Description | Example Old | Example New |
|---------|--------------|-------------|-------------|-------------|
| .x01 | rf | ReadyFrame | \|20.rf | \|20.x01 |
| .x02 | — | Reserved | — | — |
| .x03 | l, lo | Loft variant | \|34.lo | \|34.x03 |
| .x04 | nl | No Loft variant | \|34.nl | \|34.x04 |
| .x05 | x | Extended | \|10.60 | \|10.x05 |
| .x06 | sr | Sunroom | \|10.61 | \|10.x06 |
| .x07 | pw | Post Wrap | \|63.pw | \|63.x07 |
| .x08 | tc | Tall Crawl | \|10.tc | \|10.x08 |
| .x09 | 9t | 9' Tall Walls | \|34.9t | \|34.x09 |
| .x10 | 10t | 10' Tall Walls | \|20.10t | \|20.x10 |
| .x11 | ec | Enhanced Corners | \|60.ec | \|60.x11 |
| .x12 | er | Enhanced Rear | \|60.er | \|60.x12 |
| .x13 | fw | Fauxwood Siding | \|60.fw | \|60.x13 |
| .x14 | ma | Masonry | \|20.ma | \|20.x14 |
| .x15 | pr | Porch Rail | \|60.pr | \|60.x15 |
| .x16 | — | Reserved | — | — |
| .x17 | — | Reserved | — | — |
| .x18 | s | Exterior Stair Material | \|74.s | \|74.x18 |
| .x19 | — | Housewrap for Options | \|58.hw | \|58.x19 |

### Suffix Application Examples

```
Old: |20.rf MAIN WALLS READYFRAME
New: |20.x01 MAIN WALLS READYFRAME
Unified: XXXX-020.x01-**-1000

Old: |10.tc TALLCRAWL FRAMING  
New: |10.x08 TALLCRAWL FRAMING
Unified: XXXX-010.x08-**-1000

Old: |34.lo 2ND FLOOR WALLS (LOFT)
New: |34.x03 2ND FLOOR WALLS (LOFT)
Unified: XXXX-034.x03-**-1000

Old: |60.ec ENHANCED CORNERS
New: |60.x11 ENHANCED CORNERS
Unified: XXXX-060.x11-B-2100
```

---

## Item Type Cross-Reference

### Unified Item Type System

| Unified Code | Description | Pack Range | Holt Cost Code | Holt Description |
|--------------|-------------|------------|----------------|------------------|
| 1000 | Framing/Lumber | \|00-49, \|80+ | 4085 | Lumber |
| 1100 | Lumber - Barge Credit | — | 4086 | Lumber - Barge Credit |
| 1200 | Trusses | \|40-45 | 4120 | Trusses |
| 2000 | Windows | \|40.xx windows | 4140 | Window Supply |
| 2050 | Windows - Triple Pane | — | 4142 | Window Supply - U-22 Triple Pane (WA) |
| 2100 | Siding/Exterior | \|58-79 | 4155 | Siding Supply |
| 2150 | Exterior Doors | \|83.xx | 4150 | Exterior Door Supply |
| 2200 | Roofing | \|50-57 | 4156 | Roofing |
| 3000 | Interior Trim/Millwork | \|83+ | 4320 | Interior Trim Supply - Millwork |

### Pack Range to Item Type

| Pack Range | Item Type | Category |
|------------|-----------|----------|
| \|00-09 | 1000 | Foundation Framing |
| \|10-19 | 1000 | Foundation/Joist Framing |
| \|20-29 | 1000 | Wall Framing |
| \|30-39 | 1000 | 2nd Floor Framing |
| \|40-49 | 1000/1200 | Roof Framing/Trusses |
| \|50-57 | 2200 | Roofing Materials |
| \|58-60 | 2100 | Housewrap/Siding |
| \|61-69 | 2100 | Siding/Exterior |
| \|70-79 | 2100 | Deck/Exterior |
| \|80-89 | 1000 | Special Framing |
| \|83+ | 3000 | Interior Trim |

---

## Elevation Mapping

### Letter to Digit Conversion

| Letter | Holt Digit | Unified Code | Richmond Code | Notes |
|--------|------------|--------------|---------------|-------|
| U | 0 | ** | — | Universal/all elevations |
| A | 1 | A | ELVA | Base elevation (often default) |
| B | 2 | B | ELVB | Most common alternate |
| C | 3 | C | ELVC | Common alternate |
| D | 4 | D | ELVD | Less common |
| E | 5 | E | ELVE | Limited plans |
| F | 6 | F | ELVF | Limited plans |
| G | 7 | G | ELVG | G892, G893 only |
| H | 8 | H | ELVH | G769, G770 only |
| I | 9 | I | — | Maximum standard digit |
| J | 10 | J | ELVJ | Extended range (special handling) |
| K | 11 | K | ELVK | Extended range (special handling) |

### Multi-Elevation Codes

| Unified | Meaning | Holt Equivalent | Use Case |
|---------|---------|-----------------|----------|
| ** | All elevations | x0xx (digit 0) | Universal packs |
| AB | Elevations A and B | Multiple codes | 2-elevation options |
| BC | Elevations B and C | Multiple codes | Common alternate pair |
| BCD | Elevations B, C, D | Multiple codes | 3-elevation options |
| ABCD | All four standard | Multiple codes | Full coverage |

### Plans with Extended Elevations

| Plan | Available Elevations | Notes |
|------|---------------------|-------|
| G260 | B, C, D, E, F | Multi-elevation |
| G29A | B, C, D, E, F | Multi-elevation |
| G593 | B, C, D, E, F | Ranch multi-elevation |
| G601 | B, C, D, E, F | Multi-elevation |
| G639 | B, C, D, E, F | Multi-elevation |
| G892 | B, C, F, G | Extended range |
| G893 | B, C, F, G | Extended range |
| G769 | B, C, H, J, K | Maximum range |
| G770 | B, C, H, J, K | Maximum range |

---

## Phase Code Reference

### Phase Ranges by Category

| Range | Category | Description |
|-------|----------|-------------|
| 009.xxx | Walkout Basement | WO, WO2 |
| 010.xxx | Foundation | Base, DEN, TALLCRWL, SUN |
| 011.xxx | Joist System | Base, FPSING, LOFT2 |
| 012.xxx | Garage Foundation | 3CAR, GAREXT, 4CART |
| 013.xxx | Covered Patio Foundation | COVP, COVP2, COVP3 |
| 014.xxx | Deck Foundation | DECK, DECK2, DECK3 |
| 015.xxx | Covered Deck Foundation | COVD, COVD2, COVD3 |
| 016.xxx | Trussed Main Floor | WO variants |
| 018.xxx | Subfloor | Base, DEN |
| 020.xxx | Main Floor Walls | Windows, Doors, Study, Dining |
| 022.xxx | 3rd Car Garage Walls | 3CAR, WDWGAR |
| 023.xxx | Covered Patio Framing | COVP variants |
| 024.xxx | Covered Deck Framing | COVD variants |
| 030.xxx | 2nd Floor System | Base |
| 034.xxx | 2nd Floor Walls | ABR4-6, LOFT, RETREAT |
| 040.xxx | Roof | Base, Gable |
| 042.xxx | 3rd Car Garage Roof | 3CAR variants |
| 043.xxx | Covered Patio Roof | COVP, COVP2 |
| 050.xxx | Roofing Materials | Base |
| 058.xxx | Housewrap | Base |
| 060.xxx | Exterior Trim/Siding | Base, ENH B/C/D |
| 062.xxx | 3rd Car Garage Siding | 3CAR variants |
| 063.xxx | Covered Patio Siding | COVP variants |
| 065.xxx | Covered Deck Siding | COVD variants |
| 074.xxx | Deck Surface & Rail | DECK variants |
| 075.xxx | Covered Deck Surface | COVD variants |
| 080.xxx | Tall Crawl Framing | TALLCRWL |
| 090.xxx | Tall Crawl Siding | TALLCRWL |

### Complete Phase Code List

| Phase Code | Description | RAH Options | Item Type |
|------------|-------------|-------------|-----------|
| 009.000 | WO Basement Walls | WO | 1000 |
| 009.200 | WO Basement Walls 2 | WO2 | 1000 |
| 010.000 | Foundation | Base | 1000 |
| 010.010 | Optional Foundation (Fireplace) | FPSING01 | 1000 |
| 010.600 | Extended Great Room Foundation | XGREAT | 1000 |
| 010.610 | Sunroom Foundation | SUN | 1000 |
| 010.620 | Sunroom 2 Foundation | SUN2 | 1000 |
| 010.820 | Optional Den Foundation | DEN | 1000 |
| 010.830 | Optional Den w/Full Bath Foundation | DENBATH | 1000 |
| 010.900 | Tall Crawl Foundation | TALLCRWL | 1000 |
| 010.x01 | Foundation ReadyFrame | — | 1000 |
| 010.x08 | Tall Crawl Framing | TALLCRWL | 1000 |
| 011.000 | Main Joist System @ Foundation | Base | 1000 |
| 011.010 | Joist System Fireplace Add-On | FPSING | 1000 |
| 011.600 | Joist System @ Extended Great Room | XGREAT | 1000 |
| 011.620 | Joist System Loft 2 Add-On | LOFT2 | 1000 |
| 012.000 | 3rd Car Garage Foundation | 3CARA/B/C/D | 1000 |
| 012.020 | 2 Car Garage 2' Extension Foundation | GAREXT2 | 1000 |
| 012.040 | 2 Car Garage 4' Extension Foundation | 2CAR4XA/B/C | 1000 |
| 012.050 | 2 Car Garage 5' Extension Foundation | 2CAR5XA/B | 1000 |
| 012.400 | 4 Car Garage Tandem Foundation | 4CARTA/B/C | 1000 |
| 013.100 | Covered Patio Foundation | COVP | 1000 |
| 013.200 | Covered Patio 2 Foundation | COVP2 | 1000 |
| 013.300 | Covered Patio 3 Foundation | COVP3 | 1000 |
| 014.100 | Deck Foundation | DECK | 1000 |
| 014.200 | Deck 2 Foundation | DECK2 | 1000 |
| 014.300 | Deck 3 Foundation | DECK3 | 1000 |
| 015.100 | Covered Deck Foundation | COVD | 1000 |
| 015.200 | Covered Deck 2 Foundation | COVD2 | 1000 |
| 015.300 | Covered Deck 3 Foundation | COVD3 | 1000 |
| 020.000 | Main Floor Walls | Base | 1000 |
| 020.010 | Optional Double-Sided Fireplace | SIDED FIREPLACE | 1000 |
| 020.020 | Optional Great Room Windows | WDWGREAT | 1000 |
| 020.100 | French Doors | FRENCHDB | 1000 |
| 020.110 | Sliding Glass Door | SGD | 1000 |
| 020.120 | Multi-Slide Door 1 | MSLIDE1 | 1000 |
| 020.130 | Multi-Slide Door 2 | MSLIDE2 | 1000 |
| 020.290 | Bedroom with Bathroom ILO Den | ABR4BA/5BA/6BA | 1000 |
| 020.340 | Pocket Office | Pocket Office | 1000 |
| 020.x01 | Main Walls ReadyFrame | — | 1000 |
| 020.x03 | Main Walls (Loft) | — | 1000 |
| 020.x04 | Main Walls (No Loft) | — | 1000 |
| 020.x14 | Main Walls Masonry | — | 1000 |
| 022.000 | 3rd Car Garage Walls | 3CARA/B/C | 1000 |
| 022.100 | Garage Windows | WDWGAR | 1000 |
| 034.000 | 2nd Floor Walls | Base | 1000 |
| 034.240 | Optional Bedroom 4 | ABR4 | 1000 |
| 034.250 | Optional Bedroom 5 | ABR5 | 1000 |
| 034.610 | Loft Becomes Bedroom | ABR6, LOFT | 1000 |
| 034.800 | Optional Retreat | RETREAT | 1000 |
| 034.850 | MBR Sitting | SITTING | 1000 |
| 034.x01 | 2nd Floor Walls ReadyFrame | — | 1000 |
| 034.x03 | 2nd Floor Walls (Loft) | — | 1000 |
| 034.x04 | 2nd Floor Walls (No Loft) | — | 1000 |
| 034.x09 | 2nd Floor Walls 9' | 92L | 1000 |
| 040.000 | Roof | Base | 1000 |
| 040.100 | Roof Gable Sheeting | Gable | 1000 |
| 060.000 | Exterior Trim and Siding | Base | 2100 |
| 060.050 | Enhanced Elevation B | ENHB | 2100 |
| 060.100 | Enhanced Elevation C | ENHC | 2100 |
| 060.150 | Enhanced Elevation D | ENHD | 2100 |
| 060.x11 | Enhanced Corners | — | 2100 |
| 060.x12 | Enhanced Rear | — | 2100 |
| 060.x13 | Fauxwood Siding | — | 2100 |
| 060.x14 | Masonry Framing | — | 2100 |

---

## Option Mappings

### Options with All Three Systems Mapped

| RAH Option | Description | Unified Phase | Holt Suffix | Elevation Lock |
|------------|-------------|---------------|-------------|----------------|
| 3CARA | 3 Car Garage - Elv A | 012.000 | 05 | A |
| 3CARB | 3 Car Garage - Elv B | 012.000 | 05 | B |
| 3CARC | 3 Car Garage - Elv C | 012.000 | 05 | C |
| 3CARD | 3 Car Garage - Elv D | 012.000 | 05 | D |
| COVP | Covered Patio | 013.100 | 03/04/06 | by elev |
| COVP2 | Covered Patio 2 | 013.200 | 06 | — |
| ABR4 | Bedroom 4 | 034.240 | 10 | — |
| ABR6 | Bedroom 6 / Loft→BR | 034.610 | 10 | — |
| LOFT | Loft Option | 034.610 | 10 | — |
| ABR4BA | Bedroom 4 + Bath | 020.290 | 20 | — |
| ABR5BA | Bedroom 5 + Bath | 020.290 | 20 | — |
| ABR6BA | Bedroom 6 + Bath | 020.290 | 20 | — |
| RETREAT | MBR Retreat | 034.800 | 13 | — |
| ENHB | Enhanced Elevation B | 060.050 | 05 | B |
| ENHC | Enhanced Elevation C | 060.100 | 10 | C |
| ENHD | Enhanced Elevation D | 060.150 | 15 | D |
| DEN | Optional Den | 010.820 | 05 | — |
| DENBATH | Den with Full Bath | 010.830 | 00 | — |

### Options with RAH + Unified Only

| RAH Option | Description | Unified Phase | Category |
|------------|-------------|---------------|----------|
| 4CARTA/B/C | 4 Car Tandem | 012.400 | Garage |
| 2CAR4XA/B/C | 2 Car 4' Extension | 012.040 | Garage |
| 2CAR5XA/B | 2 Car 5' Extension | 012.050 | Garage |
| GAREXT2 | 2 Car 2' Extension | 012.020 | Garage |
| COVP3 | Covered Patio 3 | 013.300 | Patio |
| COVD/D2/D3 | Covered Deck | 015.xxx | Deck |
| DECK/2/3 | Optional Deck | 014.xxx | Deck |
| ABR5 | Bedroom 5 | 034.250 | Bedroom |
| WO/WO2 | Walkout Basement | 009.xxx | Foundation |
| TALLCRWL | Tall Crawl | 010.900 | Foundation |
| XGREAT | Extended Great Room | 010.600 | Interior |
| SUN/SUN2 | Sunroom | 010.6xx | Sunroom |
| WDWGREAT | Great Room Windows | 020.020 | Windows |
| MSLIDE1/2 | Multi-Slide Doors | 020.1xx | Doors |

### Options Without Mapping (RAH Only)

| Category | Options | Count |
|----------|---------|-------|
| Ceiling | 92L, 101L, COF* | 10+ |
| Bathroom | DBA*, ABABA3, ABAPWDR | 8+ |
| Fireplace | FPELEC*, FPSING*, FPSINGBR/ST/TL | 25+ |
| Misc | ABAWC, FIREWAL*, BOOK1, PORRAIL | 10+ |

---

## Holt Suffix Reference

### Suffix to Phase Mapping

| Suffix | Count | Primary Use | Unified Phase | RAH Options |
|--------|-------|-------------|---------------|-------------|
| 00 | 68 | Base/Standard | 010.000, 020.000, etc. | ELVB, ELVC, ELVD |
| 01 | 34 | Gable Sheeting | 040.100 | Gable variant |
| 02 | 4 | Masonry variant A | 060.020 | — |
| 03 | 8 | Covered Patio Elev A | 013.100 | COVP + ELVA |
| 04 | 2 | Covered Patio Elev B | 013.100 | COVP + ELVB |
| 05 | 48 | 3rd Car / OPT DEN / Enhanced B | 012.000, 010.820, 060.050 | 3CAR, DEN, ENHB |
| 06 | 6 | Covered Patio C / Extended | 013.100, 013.200 | COVP + ELVC, COVP2 |
| 10 | 38 | Bedroom 4/Loft / Enhanced C | 034.240, 034.610, 060.100 | ABR4, ABR6, LOFT, ENHC |
| 13 | 1 | Retreat | 034.800 | RETREAT |
| 15 | 16 | Enhanced D | 060.150 | ENHD |
| 20 | 9 | Bed w/ Bath / Masonry C | 020.290 | ABR4BA, ABR5BA, ABR6BA |
| 23 | 2 | Covered Patio B Framing | 023.100 | COVP + ELVB (framing) |
| 30 | 7 | Masonry D | 060.300 | — |
| 70 | 4 | REG3 Variants | Various | REG3 structural |
| 77 | 1 | Pocket Office | 020.340 | Pocket Office |

### Multi-Meaning Suffixes

Some Holt suffixes have multiple meanings depending on context:

| Suffix | Context | Meaning | Phase |
|--------|---------|---------|-------|
| 05 | \|12.xx pack | 3rd Car Garage | 012.000 |
| 05 | \|10.82 pack | Optional Den | 010.820 |
| 05 | \|60.xx pack | Enhanced Elevation B | 060.050 |
| 10 | \|34.24 pack | Bedroom 4 | 034.240 |
| 10 | \|34.61 pack | Loft → Bedroom | 034.610 |
| 10 | \|60.xx pack | Enhanced Elevation C | 060.100 |

---

## Plan Reference

### Richmond Plans (43 total)

| Plan | Elevations | Option Count | Notes |
|------|------------|--------------|-------|
| G914 | B, C | 18 | 2-story flagship |
| G721 | B, C | 28 | 2-story extensive options |
| G723 | B, C | 35 | Most comprehensive |
| G603 | A, B, C | 16 | 3-elevation |
| G260 | B, C, D, E, F | 24 | Multi-elevation with enhanced |
| G769 | B, C, H, J, K | 8 | Extended elevation range |
| G770 | B, C, H, J, K | 8 | Extended elevation range |
| G892 | B, C, F, G | 6 | Multi-elevation |
| G893 | B, C, F, G | 6 | Multi-elevation |

### Holt Plans (13 total)

| Plan | Elevations | Pack Count | Notes |
|------|------------|------------|-------|
| 2675 | A, B | 480 | Highest option count |
| 1670 | A, B | 450 | Primary Holt plan |
| 1890 | A, B, D | 420 | Multi-elevation |
| 2676 | A, B, C | 420 | 3-elevation |
| 2383 | A, B, C, D | 390 | 4-elevation with REG3 |
| 1649 | A, B, C | 380 | 3rd car options |
| 1987 | A, B, C, D | 350 | 4-elevation |
| 2336 | A, B, C, D | 340 | 4-elevation |
| 1633 | B, C, D | 320 | 3-elevation |
| 2299 | A, B, C | 310 | 3-elevation |
| 2184 | A, B, C, D | 280 | 4-elevation |
| 2414 | A, B, C, D | 260 | 4-elevation |
| 2321 | A, B, C | 180 | Smaller plan |

---

## Conversion Examples

### Example 1: RAH to Unified and Holt

**Input:** Option `3CARB` on plan `G914`

```
Step 1: Look up option
        3CAR* → Phase 012.000, Holt Suffix 05

Step 2: Extract elevation
        3CARB → Elevation B

Step 3: Determine item type
        Foundation pack → 1000

Step 4: Build codes
        Unified: G914-012.000-B-1000
        Holt: G91410205-4085
```

---

### Example 2: Holt to Unified and RAH

**Input:** Holt code `267510103-4085`

```
Step 1: Parse Holt code
        Plan: 2675
        Phase+Elev+Suffix: 10103
        Cost Code: 4085

Step 2: Extract components
        Elevation digit: 1 → A
        Suffix: 03 → Covered Patio Elev A

Step 3: Map to unified
        Phase: 013.100
        Item Type: 4085 → 1000

Step 4: Build codes
        Unified: 2675-013.100-A-1000
        RAH: COVP + Elevation A
```

---

### Example 3: Unified to Both Systems

**Input:** Unified code `G914-034.610-B-1000`

```
Step 1: Parse unified code
        Plan: G914
        Phase: 034.610 → LOFT/ABR6
        Elevation: B
        Item Type: 1000

Step 2: Look up mappings
        Phase 034.610 → Holt suffix 10
        Elevation B → Holt digit 2

Step 3: Build codes
        RAH: ABR6 on plan G914, Elevation B
        Holt: G91410210-4085
```

---

### Example 4: ReadyFrame Conversion

**Input:** Richmond pack `|20.rf MAIN WALLS READYFRAME`

```
Step 1: Identify suffix
        .rf → .x01 (ReadyFrame)

Step 2: Build phase code
        |20 → 020
        .x01 → .x01

Step 3: Assign elevation (if universal)
        All elevations → **

Step 4: Build unified code
        Unified: XXXX-020.x01-**-1000
        
For plan G914, Elevation B:
        Unified: G914-020.x01-B-1000
```

---

## Cross-Reference Tables

### Quick Lookup: RAH Option → Unified → Holt

| RAH | Unified Phase | Holt Suffix | Holt Code Pattern |
|-----|---------------|-------------|-------------------|
| 3CARA | 012.000 | 05 | PPPP10105 |
| 3CARB | 012.000 | 05 | PPPP10205 |
| 3CARC | 012.000 | 05 | PPPP10305 |
| COVP (A) | 013.100 | 03 | PPPP10103 |
| COVP (B) | 013.100 | 04 | PPPP10204 |
| COVP (C) | 013.100 | 06 | PPPP10306 |
| COVP2 | 013.200 | 06 | PPPP10x06 |
| ABR4 | 034.240 | 10 | PPPP10x10 |
| ABR6 | 034.610 | 10 | PPPP10x10 |
| LOFT | 034.610 | 10 | PPPP10x10 |
| ABR4BA | 020.290 | 20 | PPPP10x20 |
| RETREAT | 034.800 | 13 | PPPP10x13 |
| ENHB | 060.050 | 05 | PPPP10205 |
| ENHC | 060.100 | 10 | PPPP10310 |
| ENHD | 060.150 | 15 | PPPP10415 |
| DEN | 010.820 | 05 | PPPP10x05 |

### Quick Lookup: Holt Cost Code → Unified Item Type

| Holt Cost Code | Unified Item Type | Description |
|----------------|-------------------|-------------|
| 4085 | 1000 | Framing/Lumber |
| 4086 | 1100 | Lumber - Barge Credit |
| 4120 | 1200 | Trusses |
| 4140 | 2000 | Windows |
| 4142 | 2050 | Windows - Triple Pane |
| 4150 | 2150 | Exterior Doors |
| 4155 | 2100 | Siding/Exterior |
| 4156 | 2200 | Roofing |
| 4320 | 3000 | Interior Trim/Millwork |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Plans | 56 (43 Richmond + 13 Holt) |
| Unique Options | 125+ |
| Phase Codes | 95+ |
| Holt Suffix Patterns | 28 |
| Numeric Suffix Extensions | 19 |
| Unified Item Types | 9 |
| Pack Variations | 312+ |

---

*Document Version 2.0 - December 2025*
*Sales Team One PDX - Builder's FirstSource*
