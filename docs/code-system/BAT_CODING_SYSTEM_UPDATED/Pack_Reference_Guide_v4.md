# Pack Reference Guide
## BAT Unified Coding System v2.0 - Fluid Format

**Generated:** 2025-12-13 21:53:07

---

## Phase Code Format: `PPP.XXX` (Fluid)

The minor portion (XXX) is **fluid and combinable**:

```
PPP.XXX
│   │
│   └─ XXX = Fluid combination of option + suffix
└───── PPP = Major phase (010, 020, 060, etc.)
```

### XXX Patterns

| Pattern | Structure | Example | Meaning |
|---------|-----------|---------|---------|
| `XX0` | Option + base | 010.820 | Optional Den (82) base (0) |
| `XXS` | Option + single suffix | 010.821 | Optional Den (82) + ReadyFrame (1) |
| `0ZZ` | Base + two-digit suffix | 060.011 | Base (0) + Enhanced Corners (11) |
| `YZZ` | Context + two-digit suffix | 060.114 | Context 1 + Masonry (14) |
| `000` | Base pack | 020.000 | Main Walls base |

---

## Single-Digit Suffix Codes (S)

**Position:** Last digit in `PPP.XXS`

| S | Legacy | Description | Example |
|---|--------|-------------|---------|
| 1 | rf | ReadyFrame | 020.001 |
| 3 | lo, l | Loft variant | 020.003 |
| 4 | nl | No Loft variant | 020.004 |
| 5 | x | Extended | 034.615 |
| 6 | sr | Sunroom | 034.616 |
| 7 | pw | Post Wrap | 020.007 |
| 8 | tc | Tall Crawl | 020.008 |
| 9 | 9t | 9' Tall Walls | 034.619 |

---

## Two-Digit Suffix Codes (ZZ)

**Position:** Last two digits in `PPP.YZZ` or `PPP.0ZZ`

| ZZ | Legacy | Description | Example |
|----|--------|-------------|---------|
| 10 | 10t | 10' Tall Walls | 060.010 |
| 11 | ec | Enhanced Corners | 060.011 |
| 12 | er | Enhanced Rear | 060.012 |
| 13 | fw | Faux Wood | 060.013 |
| 14 | ma, m | Masonry | 060.014 |
| 15 | pr | Porch Rail | 060.015 |
| 18 | s | Exterior Stair | 060.018 |
| 19 | hw | Housewrap Options | 060.019 |

---

## Option Codes (XX)

**Position:** First two digits in `PPP.XX0` or `PPP.XXS`

| XX | Description | Base Example | Combined Example |
|----|-------------|--------------|------------------|
| 05 | 3rd Car / Enhanced B / Den (context dependent) | 010.050 | 010.051 |
| 10 | Bedroom 4/Loft / Enhanced C (context dependent) | 01.100 | 01.101 |
| 15 | Enhanced D | 01.150 | 01.151 |
| 20 | Covered Patio 2 / Bed w/ Bath | 02.200 | 02.201 |
| 24 | Bedroom 4 | 02.240 | 02.241 |
| 29 | Bedroom w/ Bath | 02.290 | 02.291 |
| 30 | Masonry D | 03.300 | 03.301 |
| 40 | 4 Car Tandem | 04.400 | 04.401 |
| 61 | Loft → Bedroom | 06.610 | 06.611 |
| 80 | Retreat | 08.800 | 08.801 |
| 82 | Optional Den | 08.820 | 08.821 |

---

## Combination Examples

### Example 1: Optional Den Variants
```
Base:       010.820  = Optional Den (82+0)
ReadyFrame: 010.821  = Optional Den + ReadyFrame (82+1)
Tall Crawl: 010.828  = Optional Den + Tall Crawl (82+8)
```

### Example 2: Loft→Bedroom Variants
```
Base:       034.610  = Loft→Bedroom (61+0)
+ Loft:     034.613  = Loft→Bedroom + Loft variant (61+3)
+ No Loft:  034.614  = Loft→Bedroom + No Loft variant (61+4)
```

### Example 3: Covered Patio Variants
```
Patio 2:        013.200  = Covered Patio 2 (20+0)
Patio 2 + PW:   013.207  = Covered Patio 2 + Post Wrap (20+7)
```

### Example 4: Siding Combinations
```
Base:               060.000  = Exterior Siding base
Enhanced Corners:   060.011  = Base + Enhanced Corners (0+11)
Masonry:            060.014  = Base + Masonry (0+14)
Post Wrap:          060.007  = Base + Post Wrap (00+7)
```

---

## Complete Phase Code Reference

### Trade 4085 / Unified 1000 (Framing)

| Phase | Name | Pack | Format Notes |
|-------|------|------|--------------|
| 010.000 | Foundation | |10 | Base foundation |
| 010.008 | Foundation Tall Crawl | |10tc | 00+8 (tc suffix) |
| 010.600 | Extended Great Room | |10.60 | 60+0 (extended option) |
| 010.820 | Optional Den | |10.82 | 82+0 (den option base) |
| 010.821 | Optional Den ReadyFrame | |10.82rf | 82+1 (den + rf) |
| 012.000 | 3rd Car Garage Foundation | |12 | Base 3rd car |
| 012.040 | 2 Car 4' Extension | |12.04 | 04+0 |
| 012.050 | 2 Car 5' Extension | |12.05 | 05+0 |
| 013.000 | Covered Patio Foundation | |13 | Base patio |
| 013.100 | Covered Patio Elev A | |13.10 | 10+0 (elev context) |
| 013.200 | Covered Patio 2 | |13.20 | 20+0 |
| 013.207 | Covered Patio 2 Post Wrap | |13.20pw | 20+7 (patio 2 + pw) |
| 014.000 | Deck Foundation | |14 | Base deck |
| 018.000 | Main Subfloor/Decking | |18 | Base subfloor |
| 020.000 | Main Walls | |20 | Base walls |
| 020.001 | Main Walls ReadyFrame | |20rf | 00+1 (rf suffix) |
| 020.014 | Main Walls Masonry | |20m | 0+14 (masonry suffix) |
| 020.290 | Bedroom w/ Bath | |20.29 | 29+0 (bed/bath option) |
| 022.000 | 3rd Car Garage Walls | |22 | Base garage walls |
| 023.000 | Covered Patio Framing | |23 | Base patio framing |
| 024.000 | Deck Framing | |24 | Base deck framing |
| 030.000 | 2nd Floor System | |30 | Base 2nd floor |
| 032.000 | 2nd Floor Subfloor | |32 | Base subfloor |
| 034.000 | 2nd Floor Walls | |34 | Base walls |
| 034.001 | 2nd Floor Walls ReadyFrame | |34rf | 00+1 |
| 034.003 | 2nd Floor Walls Loft | |34lo | 00+3 |
| 034.004 | 2nd Floor Walls No Loft | |34nl | 00+4 |
| 034.240 | Bedroom 4 | |34.24 | 24+0 |
| 034.610 | Loft → Bedroom | |34.61 | 61+0 (base) |
| 034.613 | Loft → Bedroom + Loft | |34.61lo | 61+3 (+ loft variant) |
| 034.800 | Retreat | |34.80 | 80+0 |
| 040.000 | Roof | |40 | Base roof |
| 040.100 | Gable Sheeting | |40gs | 10+0 (gable option) |
| 042.000 | 3rd Car Garage Roof | |42 | Base garage roof |
| 043.000 | Covered Patio Roof | |43 | Base patio roof |
| 044.000 | Deck Roof | |44 | Base deck roof |

### Trade 4155 / Unified 2100 (Siding/Exterior)

| Phase | Name | Pack | Format Notes |
|-------|------|------|--------------|
| 058.000 | Housewrap | |58 | Base housewrap |
| 058.019 | Housewrap Options | |58hw | 0+19 (hw suffix) |
| 060.000 | Exterior Siding | |60 | Base siding |
| 060.007 | Post Wrap | |60pw | 00+7 |
| 060.011 | Enhanced Corners | |60ec | 0+11 |
| 060.012 | Enhanced Rear | |60er | 0+12 |
| 060.013 | Faux Wood | |60fw | 0+13 |
| 060.014 | Masonry Siding | |60m | 0+14 |
| 060.050 | Enhanced Elevation B | |60.05 | 05+0 (Holt suffix) |
| 060.100 | Enhanced Elevation C | |60.10 | 10+0 (Holt suffix) |
| 060.150 | Enhanced Elevation D | |60.15 | 15+0 (Holt suffix) |
| 062.000 | 3rd Car Garage Siding | |62 | Base garage siding |
| 063.000 | Covered Patio Siding | |63 | Base patio siding |
| 063.007 | Covered Patio Post Wrap | |63pw | 00+7 |
| 074.000 | Deck Surface | |74 | Base deck surface |
| 074.018 | Exterior Stair | |74s | 0+18 |
| 075.000 | Deck Rail | |75 | Base deck rail |

---

## Item Type Cross-Reference

| Unified | Holt | Description | Pack Range |
|---------|------|-------------|------------|
| 1000 | 4085 | Framing/Lumber | \|00-49, \|80+ |
| 1100 | 4086 | Lumber - Barge Credit | — |
| 1200 | 4120 | Trusses | \|40-45 |
| 2000 | 4140 | Windows | \|40.xx |
| 2100 | 4155 | Siding/Exterior | \|58-79 |
| 2150 | 4150 | Exterior Doors | \|83.xx |
| 2200 | 4156 | Roofing | \|50-57 |
| 3000 | 4320 | Interior Trim | \|83+ |

---

## Full Unified Code Structure

```
PPPP-PPP.XXX-EE-IIII
│    │       │   │
│    │       │   └─ Item Type (1000, 2100, etc.)
│    │       └───── Elevation (A, B, **, etc.)
│    └─────────── Phase Code (PPP.XXX fluid)
└──────────────── Plan Code (G914, 1670, etc.)
```

### Full Code Examples

| Unified Code | Breakdown |
|--------------|-----------|
| G914-010.821-B-1000 | G914 + Optional Den ReadyFrame + Elev B + Framing |
| 1670-034.613-A-1000 | 1670 + Loft→Bedroom Loft + Elev A + Framing |
| G603-060.011-C-2100 | G603 + Enhanced Corners + Elev C + Siding |
| 2675-013.207-**-1000 | 2675 + Covered Patio 2 Post Wrap + All Elevs + Framing |

---

## Summary

| Component | Count |
|-----------|-------|
| Phase Codes | 53 |
| Single-Digit Suffixes | 8 |
| Two-Digit Suffixes | 8 |
| Option Codes | 11 |
| Unified Item Types | 9 |
| Elevation Codes | 11 |

---

*Sales Team One PDX - Builder's FirstSource*