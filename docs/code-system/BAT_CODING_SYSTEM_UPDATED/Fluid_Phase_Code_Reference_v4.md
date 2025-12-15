# BAT Unified Coding System - Fluid Phase Code Reference
## Version 2.0 (Complete)

**Generated:** 2025-12-13 21:56:01
**Phase Codes:** 53
**Suffix Codes:** 17 (9 single-digit + 8 two-digit)

---

## Phase Code Format: PPP.XXS (Fluid)

The minor portion (`.XXS`) is **fluid** - digits combine as needed:

| Pattern | Structure | Description | Example |
|---------|-----------|-------------|---------|
| `.000` | Base | No option, no suffix | `010.000` = Foundation |
| `.00S` | Suffix only | Single-digit suffix (S=1-9) | `010.008` = Foundation + Tall Crawl |
| `.0ZZ` | Suffix only | Two-digit suffix (ZZ=10-19) | `060.011` = Enhanced Corners |
| `.XX0` | Option only | Two-digit option code | `010.820` = Optional Den |
| `.XXS` | Combined | Option + single suffix | `010.821` = Optional Den + ReadyFrame |

### How It Works

```
PPP.XXS
│   │││
│   ││└─ S  = Single-digit suffix (1-9) OR last digit of ZZ
│   │└── X  = Second digit of option code OR first digit of ZZ
│   └─── X  = First digit of option code OR 0 (placeholder)
└─────── PPP = Major phase (010, 020, 060, etc.)
```

### Combination Examples

| Phase Code | Breakdown | Meaning |
|------------|-----------|---------|
| `010.000` | base | Foundation |
| `010.008` | 00 + S=8 | Foundation + Tall Crawl |
| `010.820` | XX=82 + 0 | Optional Den |
| `010.821` | XX=82 + S=1 | Optional Den + ReadyFrame |
| `034.610` | XX=61 + 0 | Loft → Bedroom |
| `034.613` | XX=61 + S=3 | Loft → Bedroom + Loft variant |
| `013.200` | XX=20 + 0 | Covered Patio 2 |
| `013.207` | XX=20 + S=7 | Covered Patio 2 + Post Wrap |
| `060.011` | 0 + ZZ=11 | Enhanced Corners |
| `060.014` | 0 + ZZ=14 | Masonry Siding |

---

## Suffix Codes

### Single-Digit (S = 1-9)

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

### Two-Digit (ZZ = 10-19)

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

## Complete Phase Codes

### Trade 4085 / Unified 1000 (Framing/Lumber)

| Phase | Pack | Name | Format |
|-------|------|------|--------|
| 010.000 | |10 | Foundation | base |
| 010.008 | |10tc | Foundation Tall Crawl | .00S (S=8 tc) |
| 010.600 | |10.60 | Extended Great Room | .XX0 (XX=60) |
| 010.820 | |10.82 | Optional Den | .XX0 (XX=82) |
| 010.821 | |10.82rf | Optional Den + ReadyFrame | .XXS (XX=82, S=1 rf) |
| 012.000 | |12 | 3rd Car Garage Foundation | base |
| 012.040 | |12.04 | 2 Car 4' Extension | .XX0 (XX=04) |
| 013.000 | |13 | Covered Patio Foundation | base |
| 013.100 | |13.10 | Covered Patio Elev A | .XX0 (XX=10) |
| 013.200 | |13.20 | Covered Patio 2 | .XX0 (XX=20) |
| 013.207 | |13.20pw | Covered Patio 2 + Post Wrap | .XXS (XX=20, S=7 pw) |
| 014.000 | |14 | Deck Foundation | base |
| 018.000 | |18 | Main Subfloor/Decking | base |
| 020.000 | |20 | Main Walls | base |
| 020.001 | |20rf | Main Walls ReadyFrame | .00S (S=1 rf) |
| 020.014 | |20m | Main Walls Masonry | .0ZZ (ZZ=14 ma) |
| 020.290 | |20.29 | Bedroom w/ Bath | .XX0 (XX=29) |
| 022.000 | |22 | 3rd Car Garage Walls | base |
| 023.000 | |23 | Covered Patio Framing | base |
| 023.100 | |23.10 | Covered Patio Framing Elev A | .XX0 (XX=10) |
| 024.000 | |24 | Deck Framing | base |
| 030.000 | |30 | 2nd Floor System | base |
| 032.000 | |32 | 2nd Floor Subfloor | base |
| 034.000 | |34 | 2nd Floor Walls | base |
| 034.001 | |34rf | 2nd Floor Walls ReadyFrame | .00S (S=1 rf) |
| 034.003 | |34lo | 2nd Floor Walls Loft | .00S (S=3 lo) |
| 034.004 | |34nl | 2nd Floor Walls No Loft | .00S (S=4 nl) |
| 034.240 | |34.24 | Bedroom 4 | .XX0 (XX=24) |
| 034.610 | |34.61 | Loft → Bedroom | .XX0 (XX=61) |
| 034.613 | |34.61lo | Loft → Bedroom + Loft variant | .XXS (XX=61, S=3 lo) |
| 034.800 | |34.80 | Retreat | .XX0 (XX=80) |
| 040.000 | |40 | Roof | base |
| 040.010 | |40gs | Gable Sheeting | .XX0 (XX=01) |
| 042.000 | |42 | 3rd Car Garage Roof | base |
| 043.000 | |43 | Covered Patio Roof | base |
| 044.000 | |44 | Deck Roof | base |

### Trade 4155 / Unified 2100 (Siding/Exterior)

| Phase | Pack | Name | Format |
|-------|------|------|--------|
| 058.000 | |58 | Housewrap | base |
| 058.019 | |58hw | Housewrap Options | .0ZZ (ZZ=19 hw) |
| 060.000 | |60 | Exterior Siding | base |
| 060.007 | |60pw | Exterior Post Wrap | .00S (S=7 pw) |
| 060.011 | |60ec | Enhanced Corners | .0ZZ (ZZ=11 ec) |
| 060.012 | |60er | Enhanced Rear | .0ZZ (ZZ=12 er) |
| 060.013 | |60fw | Faux Wood | .0ZZ (ZZ=13 fw) |
| 060.014 | |60m | Masonry Siding | .0ZZ (ZZ=14 ma) |
| 060.050 | |60.05 | Enhanced Elevation B | .XX0 (XX=05) |
| 060.100 | |60.10 | Enhanced Elevation C | .XX0 (XX=10) |
| 060.150 | |60.15 | Enhanced Elevation D | .XX0 (XX=15) |
| 062.000 | |62 | 3rd Car Garage Siding | base |
| 063.000 | |63 | Covered Patio Siding | base |
| 063.007 | |63pw | Covered Patio Siding + Post Wrap | .00S (S=7 pw) |
| 074.000 | |74 | Deck Surface | base |
| 074.018 | |74s | Exterior Stair Material | .0ZZ (ZZ=18 s) |
| 075.000 | |75 | Deck Rail | base |

---

## Item Type Cross-Reference (Rosetta Stone)

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

## Full Unified Code Structure

```
PPPP-PPP.XXS-EE-IIII
│    │       │   │
│    │       │   └─ Item Type (1000, 2100, etc.)
│    │       └───── Elevation (A, B, **, etc.)
│    └─────────── Phase Code (PPP.XXS fluid)
└──────────────── Plan Code (G914, 1670, etc.)
```

---

## Conversion Examples

### Example 1: Optional Den with ReadyFrame
```
Legacy Pack: |10.82rf OPTIONAL DEN READYFRAME

Breakdown:
  Major Phase: 010 (Foundation)
  Option Code: 82 (Optional Den)
  Suffix: 1 (rf = ReadyFrame)

Phase Code: 010.821 (XX=82, S=1)
Full Unified: G914-010.821-B-1000
```

### Example 2: Covered Patio 2 with Post Wrap
```
Legacy Pack: |13.20pw COVERED PATIO 2 POST WRAP

Breakdown:
  Major Phase: 013 (Covered Patio)
  Option Code: 20 (Covered Patio 2)
  Suffix: 7 (pw = Post Wrap)

Phase Code: 013.207 (XX=20, S=7)
Full Unified: 1670-013.207-A-1000
```

### Example 3: Loft to Bedroom with Loft Variant
```
Legacy Pack: |34.61lo LOFT TO BEDROOM (LOFT)

Breakdown:
  Major Phase: 034 (2nd Floor Walls)
  Option Code: 61 (Loft → Bedroom)
  Suffix: 3 (lo = Loft variant)

Phase Code: 034.613 (XX=61, S=3)
Full Unified: G721-034.613-C-1000
```

### Example 4: Enhanced Corners (Two-digit suffix)
```
Legacy Pack: |60ec ENHANCED CORNERS

Breakdown:
  Major Phase: 060 (Exterior Siding)
  Option Code: 0 (none)
  Suffix: 11 (ec = Enhanced Corners)

Phase Code: 060.011 (0 + ZZ=11)
Full Unified: G914-060.011-B-2100
```

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

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Phase Codes | 53 |
| Framing Phases (4085) | 36 |
| Siding Phases (4155) | 17 |
| Single-digit Suffixes | 9 |
| Two-digit Suffixes | 8 |
| Unified Item Types | 9 |
| Elevation Codes | 11 |
| Format Patterns | 5 |

---

*Sales Team One PDX - Builder's FirstSource*
*BAT Unified Coding System v2.0*