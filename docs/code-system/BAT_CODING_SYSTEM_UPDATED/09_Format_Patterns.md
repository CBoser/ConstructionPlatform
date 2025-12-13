# Format Patterns
## Fluid Phase Code Structure

---

## Phase Code Format: `PPP.XXS` (Fluid)

The minor portion (`.XXS`) is **fluid** - digits combine as needed:

```
PPP.XXS
│   │││
│   ││└─ S  = Single suffix (1-9) OR last digit of ZZ
│   │└── X  = Option digit OR first digit of ZZ
│   └─── X  = Option digit OR 0 (placeholder)
└─────── PPP = Major phase (010, 020, 060)
```

---

## Pattern Types

| Pattern | Structure | Description |
|---------|-----------|-------------|
| `.000` | Base | No option, no suffix |
| `.00S` | Suffix only | Single-digit suffix (S=1-9) |
| `.0ZZ` | Suffix only | Two-digit suffix (ZZ=10-19) |
| `.XX0` | Option only | Two-digit option code |
| `.XXS` | Combined | Two-digit option + single suffix |

---

## Pattern Examples

### `.000` - Base (No option, no suffix)
```
010.000 = Foundation
020.000 = Main Walls
060.000 = Exterior Siding
```

### `.00S` - Single-digit suffix only
```
010.008 = Foundation + Tall Crawl (S=8)
020.001 = Main Walls + ReadyFrame (S=1)
034.003 = 2nd Floor Walls + Loft (S=3)
060.007 = Siding + Post Wrap (S=7)
```

### `.0ZZ` - Two-digit suffix only
```
020.014 = Main Walls + Masonry (ZZ=14)
060.011 = Siding + Enhanced Corners (ZZ=11)
060.012 = Siding + Enhanced Rear (ZZ=12)
060.013 = Siding + Faux Wood (ZZ=13)
074.018 = Deck + Exterior Stair (ZZ=18)
```

### `.XX0` - Two-digit option code only
```
010.820 = Optional Den (XX=82)
010.600 = Extended Great Room (XX=60)
013.200 = Covered Patio 2 (XX=20)
034.610 = Loft → Bedroom (XX=61)
034.240 = Bedroom 4 (XX=24)
060.050 = Enhanced Elevation B (XX=05)
```

### `.XXS` - Combined (Option + single suffix)
```
010.821 = Optional Den + ReadyFrame (XX=82, S=1)
034.613 = Loft → Bedroom + Loft variant (XX=61, S=3)
013.207 = Covered Patio 2 + Post Wrap (XX=20, S=7)
023.101 = Covered Patio Framing Elev A + RF (XX=10, S=1)
```

---

## Conversion Guide

### Legacy Pack → Unified Phase Code

| Legacy Pack | → | Phase Code | Pattern |
|-------------|---|------------|---------|
| `\|10` | → | `010.000` | base |
| `\|10tc` | → | `010.008` | .00S |
| `\|10.82` | → | `010.820` | .XX0 |
| `\|10.82rf` | → | `010.821` | .XXS |
| `\|20rf` | → | `020.001` | .00S |
| `\|20m` | → | `020.014` | .0ZZ |
| `\|34.61` | → | `034.610` | .XX0 |
| `\|34.61lo` | → | `034.613` | .XXS |
| `\|60ec` | → | `060.011` | .0ZZ |
| `\|60pw` | → | `060.007` | .00S |
| `\|13.20pw` | → | `013.207` | .XXS |

---

## Full Unified Code Structure

```
PPPP-PPP.XXS-EE-IIII
│    │       │   │
│    │       │   └─ Item Type (1000, 2100, etc.)
│    │       └───── Elevation (A, B, **, etc.)
│    └─────────── Phase Code (PPP.XXS fluid)
└──────────────── Plan Code (G914, 1670, etc.)

Full Example:
  G914-010.821-B-1000
  │    │       │  │
  │    │       │  └─ Framing/Lumber
  │    │       └──── Elevation B
  │    └──────────── Optional Den + ReadyFrame
  └─────────────── Plan G914
```
