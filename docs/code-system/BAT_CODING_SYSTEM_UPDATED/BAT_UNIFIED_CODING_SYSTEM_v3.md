# BAT Unified Coding System
## Complete Reference Guide

**Version:** 3.0  
**Updated:** December 2025  
**Status:** Architecture Decisions Confirmed + Fluid Format + STO Item Numbers

---

## Table of Contents

1. [Overview](#overview)
2. [Unified Code Structure](#unified-code-structure)
3. [Phase Code Format (Fluid)](#phase-code-format-fluid)
4. [STO Item Numbers](#sto-item-numbers)
5. [Suffix Codes](#suffix-codes)
6. [Item Type Cross-Reference](#item-type-cross-reference)
7. [Elevation Mapping](#elevation-mapping)
8. [Phase Code Reference](#phase-code-reference)
9. [Option Mappings](#option-mappings)
10. [Conversion Examples](#conversion-examples)
11. [Cross-Reference Tables](#cross-reference-tables)

---

## Overview

This is Sales Team One's **canonical code system** - a Rosetta Stone that translates any customer's codes (Holt, Richmond, Sekisui, future builders) to a single unified format. This enables:

- **Consistent data structure** across all builders
- **Bi-directional translation** between any customer system
- **Future-proof architecture** for new customers
- **Single source of truth** for material management
- **STO item numbers** for internal tracking

### Customer Code Comparison

| Customer | Their Format | Example | Notes |
|----------|--------------|---------|-------|
| Holt | \`PPPP-XXXXX-CCCC\` | \`1670-10100-4085\` | 9-digit phase + cost code |
| Richmond | \`\|PP.XX NAME - OPT\` | \`\|12.00 3RD CAR - 3CARA\` | Pipe + phase + alpha options |
| Legacy BAT | \`PP NAME - ELVA - ELVB\` | \`10 Foundation - ELVA - ELVB\` | Phase + name + elevation codes |
| **Unified** | \`PPPP-PPP.XXS-EE-IIII\` | \`G914-012.000-B-1000\` | Plan-Phase-Elev-ItemType |
| **STO Item** | \`STO-IIII-NNNN\` | \`STO-1000-0042\` | Internal material tracking |

---

## Unified Code Structure

\`\`\`
PPPP-PPP.XXS-EE-IIII
│    │       │   │
│    │       │   └─ Item Type Code (1000, 2100, 2200, etc.)
│    │       └───── Elevation Code (A, B, AB, BCD, **)
│    └─────────── Phase Code (PPP.XXS - Fluid Format)
└──────────────── Plan Code (G914, 1670, G603, etc.)
\`\`\`

### Component Breakdown

| Component | Format | Description | Examples |
|-----------|--------|-------------|----------|
| Plan Code | 4 chars | Builder plan number | G914, 1670, G603, GA35 |
| Phase Code | PPP.XXS | Major.Minor (Fluid) | 010.000, 010.821, 034.613 |
| Elevation | 1-4 chars | Elevation letter(s) or ** | A, B, AB, BCD, ABCD, ** |
| Item Type | 4 digits | Material category code | 1000, 2100, 2200, 3000 |

---

## Phase Code Format (Fluid)

The minor portion of the phase code (\`.XXS\`) is **fluid** - digits combine as needed:

\`\`\`
PPP.XXS
│   │││
│   ││└─ S  = Single suffix (1-9) OR last digit of ZZ (10-19)
│   │└── X  = Option digit OR first digit of ZZ
│   └─── X  = Option digit OR 0 (placeholder)
└─────── PPP = Major phase (010, 020, 060, etc.)
\`\`\`

### Pattern Types

| Pattern | Structure | Description | Example |
|---------|-----------|-------------|---------|
| \`.000\` | Base | No option, no suffix | \`010.000\` = Foundation |
| \`.00S\` | Suffix only | Single-digit suffix (S=1-9) | \`010.008\` = Foundation + Tall Crawl |
| \`.0ZZ\` | Suffix only | Two-digit suffix (ZZ=10-19) | \`060.011\` = Enhanced Corners |
| \`.XX0\` | Option only | Two-digit option code | \`010.820\` = Optional Den |
| \`.XXS\` | Combined | Option + single suffix | \`010.821\` = Optional Den + ReadyFrame |

### Fluid Combination Examples

| Legacy Pack | Phase Code | Breakdown | Meaning |
|-------------|------------|-----------|---------|
| \`\|10\` | \`010.000\` | base | Foundation |
| \`\|10tc\` | \`010.008\` | 00 + S=8 | Foundation + Tall Crawl |
| \`\|10.82\` | \`010.820\` | XX=82 + 0 | Optional Den |
| \`\|10.82rf\` | \`010.821\` | XX=82 + S=1 | Optional Den + ReadyFrame |
| \`\|34.61\` | \`034.610\` | XX=61 + 0 | Loft → Bedroom |
| \`\|34.61lo\` | \`034.613\` | XX=61 + S=3 | Loft → Bedroom + Loft variant |
| \`\|13.20\` | \`013.200\` | XX=20 + 0 | Covered Patio 2 |
| \`\|13.20pw\` | \`013.207\` | XX=20 + S=7 | Covered Patio 2 + Post Wrap |
| \`\|60ec\` | \`060.011\` | 0 + ZZ=11 | Enhanced Corners |
| \`\|60m\` | \`060.014\` | 0 + ZZ=14 | Masonry Siding |

---

## STO Item Numbers

### Format: \`STO-IIII-NNNN\`

Sales Team One internal item numbers for material tracking:

\`\`\`
STO-IIII-NNNN
│   │    │
│   │    └─ Sequential number within category (0001-9999)
│   └────── Unified Item Type (1000, 2100, etc.)
└────────── Sales Team One prefix
\`\`\`

### Item Type Ranges

| Unified Type | STO Range | Description | Count |
|--------------|-----------|-------------|-------|
| 1000 | STO-1000-0001 to STO-1000-0456 | Framing/Lumber | 456 |
| 1100 | STO-1100-0001 to STO-1100-xxxx | Lumber - Barge Credit | — |
| 1200 | STO-1200-0001 to STO-1200-xxxx | Trusses | — |
| 2000 | STO-2000-0001 to STO-2000-xxxx | Windows | — |
| 2100 | STO-2100-0001 to STO-2100-0060 | Siding/Exterior | 60 |
| 2200 | STO-2200-0001 to STO-2200-xxxx | Roofing | — |
| 3000 | STO-3000-0001 to STO-3000-xxxx | Interior Trim | — |

### Sample STO Numbers

| STO Item # | SKU | Description |
|------------|-----|-------------|
| STO-1000-0001 | 10114TJRIM20 | 1-1/4X9-1/2 TJ LSL RIM 20' |
| STO-1000-0042 | 24DF | 2X4 DF STD&BTR |
| STO-1000-0156 | LUS28 | LUS28 SIMPSON HANGER |
| STO-2100-0001 | 1220WWP | 1X2-20' WW PRIMED |
| STO-2100-0025 | HZ10814CMSP | HZ 8.25X144 SMOOTH CEDARMILL |

### STO Cross-Reference

| STO Item # | BFS SKU | RAH Item # | Holt Code |
|------------|---------|------------|-----------|
| STO-1000-0042 | 24DF | R4420001 | 4085 |
| STO-1000-0156 | LUS28 | R4420089 | 4085 |
| STO-2100-0025 | HZ10814CMSP | R4550012 | 4155 |

---

## Suffix Codes

### Single-Digit Suffixes (S = 1-9)

Used in \`.XXS\` format where option code takes first two positions.

| S | Legacy | Description |
|---|--------|-------------|
| 1 | rf | ReadyFrame |
| 2 | — | Reserved |
| 3 | lo, l | Loft variant |
| 4 | nl | No Loft variant |
| 5 | x | Extended |
| 6 | sr | Sunroom |
| 7 | pw | Post Wrap |
| 8 | tc | Tall Crawl |
| 9 | 9t | 9' Tall Walls |

### Two-Digit Suffixes (ZZ = 10-19)

Used in \`.0ZZ\` format where no option code is present.

| ZZ | Legacy | Description |
|----|--------|-------------|
| 10 | 10t | 10' Tall Walls |
| 11 | ec | Enhanced Corners |
| 12 | er | Enhanced Rear |
| 13 | fw | Faux Wood |
| 14 | ma, m | Masonry |
| 15 | pr | Porch Rail |
| 18 | s | Exterior Stair |
| 19 | hw | Housewrap Options |

---

## Item Type Cross-Reference

### Rosetta Stone: Unified ↔ Holt ↔ Richmond

| Unified | Description | Holt | Richmond | Pack Range |
|---------|-------------|------|----------|------------|
| 1000 | Framing/Lumber | 4085 | 4085 | \|00-49, \|80+ |
| 1100 | Lumber - Barge Credit | 4086 | 4086 | — |
| 1200 | Trusses | 4120 | 4120 | \|40-45 |
| 2000 | Windows | 4140 | 4140 | \|40.xx |
| 2050 | Windows - Triple Pane | 4142 | 4142 | — |
| 2100 | Siding/Exterior | 4155 | 4155 | \|58-79 |
| 2150 | Exterior Doors | 4150 | 4150 | \|83.xx |
| 2200 | Roofing | 4156 | 4156 | \|50-57 |
| 3000 | Interior Trim/Millwork | 4320 | 4320 | \|83+ |

---

## Elevation Mapping

| Letter | Digit | Letter | Digit |
|--------|-------|--------|-------|
| A | 1 | F | 6 |
| B | 2 | G | 7 |
| C | 3 | H | 8 |
| D | 4 | J | 9 |
| E | 5 | K | 10 |
| ** | ALL | | |

### Multi-Elevation Codes

| Code | Meaning |
|------|---------|
| AB | Elevations A and B |
| BCD | Elevations B, C, and D |
| ABCD | All four elevations |
| ** | Universal (all elevations) |

---

## Phase Code Reference

### Trade 4085 / Unified 1000 (Framing)

| Phase | Pack | Name | Format |
|-------|------|------|--------|
| \`010.000\` | \|10 | Foundation | base |
| \`010.008\` | \|10tc | Foundation Tall Crawl | .00S |
| \`010.600\` | \|10.60 | Extended Great Room | .XX0 |
| \`010.820\` | \|10.82 | Optional Den | .XX0 |
| \`010.821\` | \|10.82rf | Optional Den + ReadyFrame | .XXS |
| \`012.000\` | \|12 | 3rd Car Garage Foundation | base |
| \`013.000\` | \|13 | Covered Patio Foundation | base |
| \`013.200\` | \|13.20 | Covered Patio 2 | .XX0 |
| \`013.207\` | \|13.20pw | Covered Patio 2 + Post Wrap | .XXS |
| \`014.000\` | \|14 | Deck Foundation | base |
| \`018.000\` | \|18 | Main Subfloor | base |
| \`020.000\` | \|20 | Main Walls | base |
| \`020.001\` | \|20rf | Main Walls ReadyFrame | .00S |
| \`020.014\` | \|20m | Main Walls Masonry | .0ZZ |
| \`022.000\` | \|22 | 3rd Car Garage Walls | base |
| \`023.000\` | \|23 | Covered Patio Framing | base |
| \`024.000\` | \|24 | Deck Framing | base |
| \`030.000\` | \|30 | 2nd Floor System | base |
| \`032.000\` | \|32 | 2nd Floor Subfloor | base |
| \`034.000\` | \|34 | 2nd Floor Walls | base |
| \`034.001\` | \|34rf | 2nd Floor Walls ReadyFrame | .00S |
| \`034.003\` | \|34lo | 2nd Floor Walls Loft | .00S |
| \`034.610\` | \|34.61 | Loft → Bedroom | .XX0 |
| \`034.613\` | \|34.61lo | Loft → Bedroom + Loft | .XXS |
| \`040.000\` | \|40 | Roof | base |
| \`042.000\` | \|42 | 3rd Car Garage Roof | base |
| \`043.000\` | \|43 | Covered Patio Roof | base |

### Trade 4155 / Unified 2100 (Siding)

| Phase | Pack | Name | Format |
|-------|------|------|--------|
| \`058.000\` | \|58 | Housewrap | base |
| \`058.019\` | \|58hw | Housewrap Options | .0ZZ |
| \`060.000\` | \|60 | Exterior Siding | base |
| \`060.007\` | \|60pw | Exterior Post Wrap | .00S |
| \`060.011\` | \|60ec | Enhanced Corners | .0ZZ |
| \`060.012\` | \|60er | Enhanced Rear | .0ZZ |
| \`060.013\` | \|60fw | Faux Wood | .0ZZ |
| \`060.014\` | \|60m | Masonry Siding | .0ZZ |
| \`062.000\` | \|62 | 3rd Car Garage Siding | base |
| \`063.000\` | \|63 | Covered Patio Siding | base |
| \`063.007\` | \|63pw | Covered Patio Siding + Post Wrap | .00S |
| \`074.000\` | \|74 | Deck Surface | base |
| \`074.018\` | \|74s | Exterior Stair Material | .0ZZ |
| \`075.000\` | \|75 | Deck Rail | base |

---

## Option Mappings

### RAH Options with Unified Mapping

| RAH Option | Description | Unified Phase | Holt Suffix |
|------------|-------------|---------------|-------------|
| 3CARA | 3rd Car Elev A | 012.000 | 05 |
| 3CARB | 3rd Car Elev B | 012.000 | 05 |
| 3CARC | 3rd Car Elev C | 012.000 | 05 |
| COVP (A) | Covered Patio A | 013.100 | 03 |
| COVP (B) | Covered Patio B | 013.100 | 04 |
| COVP2 | Covered Patio 2 | 013.200 | 06 |
| ABR4 | Bedroom 4 | 034.240 | 10 |
| ABR6 | Bedroom 6 | 034.610 | 10 |
| LOFT | Loft Option | 034.610 | 10 |
| RETREAT | Retreat | 034.800 | 13 |
| DEN | Optional Den | 010.820 | 05 |
| ENHB | Enhanced Elev B | 060.050 | 05 |
| ENHC | Enhanced Elev C | 060.100 | 10 |
| ENHD | Enhanced Elev D | 060.150 | 15 |

---

## Conversion Examples

### Example 1: Optional Den with ReadyFrame

\`\`\`
Legacy Pack: |10.82rf OPTIONAL DEN READYFRAME

Breakdown:
  Major Phase: 010 (Foundation)
  Option Code: 82 (Optional Den)
  Suffix: 1 (rf = ReadyFrame)

Phase Code: 010.821 (XX=82, S=1)
Full Unified: G914-010.821-B-1000
STO Items: STO-1000-xxxx (framing materials for this pack)
\`\`\`

### Example 2: Covered Patio 2 with Post Wrap

\`\`\`
Legacy Pack: |13.20pw COVERED PATIO 2 POST WRAP

Breakdown:
  Major Phase: 013 (Covered Patio)
  Option Code: 20 (Covered Patio 2)
  Suffix: 7 (pw = Post Wrap)

Phase Code: 013.207 (XX=20, S=7)
Full Unified: 1670-013.207-A-1000
\`\`\`

### Example 3: Enhanced Corners (Two-digit suffix)

\`\`\`
Legacy Pack: |60ec ENHANCED CORNERS

Breakdown:
  Major Phase: 060 (Exterior Siding)
  Option Code: 0 (none)
  Suffix: 11 (ec = Enhanced Corners)

Phase Code: 060.011 (0 + ZZ=11)
Full Unified: G914-060.011-B-2100
STO Items: STO-2100-xxxx (siding materials)
\`\`\`

### Example 4: Holt Code to Unified

\`\`\`
Holt Code: 1670-10103-4085

Breakdown:
  Plan: 1670
  Phase+Elev+Suffix: 10103
  Cost Code: 4085

Extraction:
  Elevation digit: 1 → A
  Suffix: 03 → Covered Patio Elev A

Unified: 1670-013.100-A-1000
\`\`\`

---

## Cross-Reference Tables

### Quick Lookup: Legacy → Unified

| Legacy Pack | Unified Phase | Pattern |
|-------------|---------------|---------|
| \|10 | 010.000 | base |
| \|10tc | 010.008 | .00S |
| \|10.82 | 010.820 | .XX0 |
| \|10.82rf | 010.821 | .XXS |
| \|20 | 020.000 | base |
| \|20rf | 020.001 | .00S |
| \|20m | 020.014 | .0ZZ |
| \|34.61 | 034.610 | .XX0 |
| \|34.61lo | 034.613 | .XXS |
| \|60 | 060.000 | base |
| \|60ec | 060.011 | .0ZZ |
| \|60pw | 060.007 | .00S |
| \|13.20pw | 013.207 | .XXS |

### Holt Cost Code → Unified Item Type

| Holt | Unified | Description |
|------|---------|-------------|
| 4085 | 1000 | Framing/Lumber |
| 4086 | 1100 | Lumber - Barge Credit |
| 4120 | 1200 | Trusses |
| 4140 | 2000 | Windows |
| 4142 | 2050 | Windows - Triple Pane |
| 4150 | 2150 | Exterior Doors |
| 4155 | 2100 | Siding/Exterior |
| 4156 | 2200 | Roofing |
| 4320 | 3000 | Interior Trim |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Plans | 56 (43 Richmond + 13 Holt) |
| Phase Codes | 53+ |
| Suffix Codes | 17 (9 single + 8 two-digit) |
| Format Patterns | 5 |
| Unified Item Types | 9 |
| STO Items Assigned | 516 |
| Elevation Codes | 11 |

---

*Document Version 3.0 - December 2025*  
*Sales Team One PDX - Builder's FirstSource*  
*BAT Unified Coding System with Fluid Format + STO Item Numbers*
