---
name: readyframe-material-calculator
description: Calculate exact material quantities for ReadyFrame panelized wall framing systems using proven formulas for plates, studs, trimmers, headers, and opening components. Use when calculating ReadyFrame materials, determining quantities for takeoffs, computing stud counts, calculating plate requirements, sizing opening components, optimizing stock lengths, or validating material estimates. Also use for questions like "how many studs needed", "calculate plates for this wall", "what header size for opening", or "trimmer quantities for windows".
---

# ReadyFrame Material Calculator

## Overview

Calculate precise material quantities for ReadyFrame panelized wall framing systems using standardized formulas that account for the 2/3 ReadyFrame vs 1/3 Loose material division, stud spacing at 0.75 per linear foot, and opening-specific component counts.

## Quick Start

For a basic wall calculation, use `scripts/calculate_materials.py`:

```bash
python scripts/calculate_materials.py \
  --wall-length 84.5 \
  --wall-height 104.625 \
  --stud-size 2x6 \
  --spacing 16
```

For walls with openings, add opening data:

```bash
python scripts/calculate_materials.py \
  --wall-length 84.5 \
  --wall-height 104.625 \
  --stud-size 2x6 \
  --spacing 16 \
  --openings '{"type": "window", "width": 36, "height": 48, "count": 2}'
```

## Core Calculation Workflows

### 1. Basic Wall (No Openings)

**Input Required:**
- Wall length (linear feet)
- Wall height (inches)
- Stud size (2x4, 2x6, 2x8)
- Stud spacing (16" or 24" O.C.)

**Calculation Sequence:**
1. Calculate plates using 2/3 rule (see `references/formulas.md`)
2. Calculate stud count at 0.75 per LF for 16" O.C.
3. Determine lumber grades (No.2 for ReadyFrame, DF Stud for Loose)
4. Optimize stock lengths

**Formula:**
- ReadyFrame Plates LF = 2 × Wall LF
- Loose Top Plate LF = 1 × Wall LF
- Stud Count = 0.75 × Wall LF (for 16" O.C.)

### 2. Wall with Openings

**Input Required:**
- All basic wall inputs, plus:
- Opening type (window, door, etc.)
- Opening dimensions (width × height)
- Opening count

**Calculation Sequence:**
1. Calculate basic wall materials
2. Adjust stud count for openings (−1 stud per ~4' opening + 2 kings per opening)
3. Calculate trimmers (see `references/trimmer_specs.md` for rules)
4. Calculate headers based on span
5. Calculate cripples (sill and header)
6. Add pads/fillers as needed

**Opening Component Formulas:**
- Standard windows: 2 trimmers per opening
- Wide windows (>5'): 2 + 2×FLOOR((Width−5)/5)
- Mulled units: Number of units + 1
- Bay windows: 2 + 2×(Sections−1)

### 3. Multi-Panel Wall Assembly

**Input Required:**
- Individual panel data (dimensions, openings)
- Panel naming scheme (E-series, P-series, G-series)

**Calculation Sequence:**
1. Calculate each panel independently
2. Sum materials by category (ReadyFrame vs Loose)
3. Aggregate by lumber grade and size
4. Optimize stock length packaging
5. Generate panel-specific cutting lists

**Use:** `scripts/batch_calculate.py` for multi-panel assemblies

## Material Categories

### ReadyFrame (Precut) - 67% of Materials
- Bottom plates (cut to panel length)
- First/inner top plates (cut to panel length)
- Jack studs/trimmers (cut to exact opening heights)
- Headers (2-ply, sized per opening)
- Window sills and sill cripples
- Header cripples
- Pads and fillers
- Specialty blocking
- **Grade:** No.2 lumber

### Loose - 33% of Materials
- Third/outer top plate (16' lengths for field lapping)
- All full-length studs (common, king, critical)
- Flat studs (if full-length)
- **Grade:** DF Stud lumber

## Lumber Specifications

### Standard Dimensions
- **Main floor stud length:** 104-5/8" (8'-8 5/8")
- **Upper floor stud length:** 92-5/8" (7'-8 5/8")
- **Plate widths:** 2x4 (3-1/2"), 2x6 (5-1/2"), 2x8 (7-1/4")

### Stock Lengths (ReadyFrame Components)
2', 4', 6', 8', 10', 12', 14', 16', 20'

### Lumber Grades
- **No.2 grade:** All ReadyFrame precut components
- **DF Stud grade:** All Loose full-length studs

For complete specifications, see `references/lumber_specs.md`

## Special Calculations

### Trimmer Heights
```
Trimmer Height = Wall Height − (Floor to Sill Distance + Window Height + Header Depth)
```

### Header Sizing
- Consult `references/header_sizing.md` for span tables
- Default: 2-ply headers for residential
- Upgrade to LVL for spans >6'

### Stock Length Optimization
```python
# Example: Optimize 12.5 LF of bottom plate
12.5 LF → 1×12' + 1×2' (from stock lengths)
# Or use scripts/optimize_stock.py
```

## Validation Checks

After calculating materials, verify:

1. **Plate Ratio Check:** ReadyFrame:Loose ≈ 2:1
2. **Stud Density Check:** ~0.75 studs per LF for 16" O.C.
3. **Opening Component Check:** 2 kings + 2 trimmers minimum per opening
4. **Grade Assignment Check:** Full-length = DF Stud, Cut-to-size = No.2

Run `scripts/validate_takeoff.py` for automated validation.

## Common Patterns

### Example 1: 84.5 LF Wall, 104-5/8" Height, No Openings
```
ReadyFrame Plates: 169 LF (2 × 84.5)
Loose Top Plate: 84.5 LF (1 × 84.5) → 6 sticks of 16'
Studs: 64 (0.75 × 84.5, rounded up)
```

### Example 2: 30 LF Wall with 3'×4' Window
```
ReadyFrame Plates: 60 LF (2 × 30)
Loose Top Plate: 30 LF → 2 sticks of 16'
Studs: 23 (base) − 1 (opening) + 2 (kings) = 24
Trimmers: 2 (standard window)
Header: 1×4' (2-ply 2x6)
Sill: 1×4'
Cripples: 2 above header, 2 below sill
```

### Example 3: Mulled Triple Window Unit
```
Opening: Three 3' windows side-by-side (9' total span)
Trimmers: 4 (3 units + 1)
Headers: May require LVL for 9' span
Kings: 2 (terminal ends only)
```

## Resources

### scripts/
- `calculate_materials.py` - Main calculation engine
- `batch_calculate.py` - Multi-panel batch processor
- `optimize_stock.py` - Stock length optimizer
- `validate_takeoff.py` - Quality assurance validator

### references/
- `formulas.md` - Complete calculation formulas with examples
- `trimmer_specs.md` - Trimmer specifications by window type
- `lumber_specs.md` - Lumber grades, dimensions, and stock lengths
- `header_sizing.md` - Header span tables and sizing guide
- `material_rules.md` - ReadyFrame vs Loose categorization rules

### assets/
- No assets needed for this skill
