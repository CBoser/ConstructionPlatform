# ReadyFrame Calculation Formulas

Complete reference for all ReadyFrame material calculations with examples and edge cases.

## Core Formulas

### Plate Calculations (2/3 Rule)

The 2/3 vs 1/3 rule is fundamental to ReadyFrame material division:

**ReadyFrame Plates (Bottom + First Top) = 2/3 of total:**
```
ReadyFrame Plates LF = 2 × Wall LF
```

**Loose Top Plate (Third/Outer) = 1/3 of total:**
```
Loose Top Plate LF = 1 × Wall LF
```

**Stock Length Conversion (16' sticks for Loose):**
```
Loose Top Plate Sticks = CEILING(Loose Top Plate LF ÷ 16)
```

**Examples:**

| Wall LF | ReadyFrame Plates | Loose Plate LF | Loose 16' Sticks |
|---------|-------------------|----------------|------------------|
| 30      | 60 LF             | 30 LF          | 2 sticks         |
| 84.5    | 169 LF            | 84.5 LF        | 6 sticks         |
| 12.5    | 25 LF             | 12.5 LF        | 1 stick          |

### Stud Count Calculations

**Base Formula (16" O.C.):**
```
Base Stud Count = 0.75 × Wall LF
```

**Adjusted for Openings:**
```
Adjusted Stud Count = Base Stud Count − Opening Reduction + King Studs
```

Where:
- Opening Reduction ≈ 1 stud per 4' of opening width
- King Studs = 2 per opening

**Spacing Conversion:**
```
24" O.C. Stud Count = Base Stud Count × 0.67
```

**Examples:**

| Wall LF | 16" O.C. Base | 24" O.C. Base | Notes |
|---------|---------------|---------------|-------|
| 30      | 23 (22.5)     | 15 (15.075)   | Round up |
| 84.5    | 64 (63.375)   | 43 (42.4625)  | Always round up |
| 12.5    | 10 (9.375)    | 7 (6.28125)   | Minimum 2 studs per panel |

### Opening Adjustments

**Stud Reduction for Opening:**
```
Stud Reduction = FLOOR(Opening Width ÷ 4)
```

**King Stud Addition:**
```
King Studs = 2 × Number of Openings
```

**Net Opening Adjustment:**
```
Net Adjustment = King Studs − Stud Reduction
```

**Example: 84.5 LF Wall with Two 3' Windows**
```
Base: 0.75 × 84.5 = 63.375 → 64 studs
Reduction: 2 openings × 1 stud/opening = −2 studs
Kings: 2 openings × 2 kings = +4 studs
Total: 64 − 2 + 4 = 66 studs
```

## Trimmer Calculations

### Standard Windows (≤5' Width)

**Formula:**
```
Trimmer Count = 2 per opening
Trimmer Height = Wall Height − (Floor to Sill + Window Height + Header Depth)
```

**Example: 4' Wide × 5' Tall Window in 104-5/8" Wall**
```
Assuming: 36" sill height, 2x6 header (5.5" actual depth)
Trimmer Height = 104.625 − (36 + 60 + 5.5) = 3.125"
Wait - this is wrong. Correct calculation:
Trimmer Height = 104.625 − 60 − 5.5 = 39.125" (from sill to header)
```

### Wide Windows (>5' Width)

**Formula:**
```
Trimmer Count = 2 + 2 × FLOOR((Width − 5) ÷ 5)
```

**Examples:**

| Width | Calculation | Trimmer Count |
|-------|-------------|---------------|
| 5'    | 2 + 0       | 2             |
| 6'    | 2 + 2×1     | 4             |
| 10'   | 2 + 2×1     | 4             |
| 11'   | 2 + 2×2     | 6             |

### Mulled Window Units

**Formula:**
```
Trimmer Count = Number of Window Units + 1
```

**Examples:**
- Double-mulled (2 windows): 3 trimmers
- Triple-mulled (3 windows): 4 trimmers
- Quad-mulled (4 windows): 5 trimmers

### Bay/Bow Windows

**Formula:**
```
Trimmer Count = 2 + 2 × (Number of Sections − 1)
```

**Examples:**
- 3-section bay: 2 + 2×(3−1) = 6 trimmers
- 5-section bow: 2 + 2×(5−1) = 10 trimmers

## Header Calculations

### Header Sizing by Span

**Standard Residential (2-ply):**

| Span    | 2x4 Wall | 2x6 Wall | 2x8 Wall |
|---------|----------|----------|----------|
| Up to 3'| 2×4      | 2×6      | 2×8      |
| 3'-4'   | 2×6      | 2×6      | 2×8      |
| 4'-5'   | 2×6      | 2×8      | 2×10     |
| 5'-6'   | 2×8      | 2×8      | 2×10     |
| 6'-8'   | 2×10     | 2×10     | 2×12     |
| Over 8' | LVL      | LVL      | LVL      |

**Header Length Calculation:**
```
Header Length = Opening Width + 2 × King Stud Thickness
```

For 2x6 framing:
```
Header Length = Opening Width + 2 × 1.5" = Opening Width + 3"
```

### Header Components

**Standard Header Assembly:**
- 2 pieces of dimensional lumber (2-ply)
- 1 spacer piece (usually 1/2" plywood for 2x4 wall, full width for 2x6)

**ReadyFrame Package Includes:**
- Pre-cut header lumber to exact length
- Spacer/filler if applicable

## Cripple Calculations

### Sill Cripples (Below Window)

**Count Calculation:**
```
Sill Cripple Count = FLOOR(Window Width ÷ Stud Spacing) + 1
```

**Example: 48" Window, 16" O.C.**
```
Count = FLOOR(48 ÷ 16) + 1 = 3 + 1 = 4 cripples
```

**Height Calculation:**
```
Sill Cripple Height = Floor to Sill Distance − Bottom Plate Height − Window Sill Thickness
```

### Header Cripples (Above Window)

**Count Calculation:**
```
Header Cripple Count = FLOOR(Window Width ÷ Stud Spacing) + 1
```

**Height Calculation:**
```
Header Cripple Height = Wall Height − (Floor to Sill + Window Height + Header Depth + Top Plate Height)
```

## Board Feet Calculations

### Formula
```
Board Feet = (Thickness" × Width" × Length') ÷ 12
```

### Common Conversions

**Linear Foot to Board Feet:**

| Size | Board Feet per LF |
|------|-------------------|
| 2x4  | 0.667             |
| 2x6  | 1.000             |
| 2x8  | 1.333             |
| 2x10 | 1.667             |
| 2x12 | 2.000             |

**Example: 169 LF of 2x6 Plates**
```
Board Feet = 169 LF × 1.0 BF/LF = 169 BF
```

## Stock Length Optimization

### Optimization Strategy

Given a required length, select stock lengths to minimize waste:

**Algorithm:**
1. Start with largest stock length ≤ required length
2. Add additional pieces to reach total
3. Prefer fewer pieces over more

**Example: 12.5 LF Required**
```
Option A: 1×12' + 1×2' = 14' (1.5' waste)
Option B: 1×10' + 1×4' = 14' (1.5' waste)
Option C: 1×14' = 14' (1.5' waste)

Select Option C: Fewest pieces, same waste
```

**Example: 84.5 LF Required**
```
Optimal: 4×20' + 1×6' = 86' (1.5' waste)
Alternative: 5×16' + 1×6' = 86' (1.5' waste)

Select first: Fewer pieces preferred
```

## Quality Assurance Formulas

### Plate Ratio Check

**Expected Ratio:**
```
ReadyFrame Plates : Loose Plates ≈ 2 : 1
```

**Validation:**
```
Ratio = ReadyFrame Plates LF ÷ Loose Plates LF
Valid if: 1.8 ≤ Ratio ≤ 2.2
```

### Total Plate Check

**Formula:**
```
Total Plates LF ÷ 3 ≈ Wall LF
```

**Validation:**
```
Calculated Wall LF = Total Plates ÷ 3
Variance = ABS(Calculated − Actual) ÷ Actual
Valid if: Variance < 0.05 (5%)
```

### Stud Density Check

**Expected Density (16" O.C.):**
```
Stud Density = Stud Count ÷ Wall LF ≈ 0.75
```

**Validation Range:**
```
Valid if: 0.65 ≤ Density ≤ 0.85
```

## Edge Cases

### Very Short Walls (<4')

**Minimum Requirements:**
- Minimum 2 studs per panel
- 1 at each end for nailing

**Example: 3' Wall**
```
Formula: 0.75 × 3 = 2.25 → 3 studs
Reality: 2 studs minimum (corner studs)
```

### Walls with Multiple Opening Types

**Approach:**
1. Calculate each opening independently
2. Sum trimmer counts
3. Adjust stud count for total opening width
4. Add king studs for each opening

**Example: Wall with Door + 2 Windows**
```
Door: 2 trimmers, 2 kings
Window 1: 2 trimmers, 2 kings
Window 2: 2 trimmers, 2 kings
Total: 6 trimmers, 6 kings
```

### Angled/Irregular Walls

**Approach:**
- Calculate longest dimension for stud count
- Calculate actual perimeter for plates
- Add extra studs at angle points

**Beveled Plate Ends:**
- ReadyFrame cuts include mitered/beveled ends
- Count as part of ReadyFrame package

## Summary Table

| Component | Formula | Grade | Category |
|-----------|---------|-------|----------|
| Bottom Plate | 1 × Wall LF | No.2 | ReadyFrame |
| First Top Plate | 1 × Wall LF | No.2 | ReadyFrame |
| Third Top Plate | 1 × Wall LF | DF Stud | Loose |
| Full-Length Studs | 0.75 × Wall LF | DF Stud | Loose |
| Trimmers | Varies by opening | No.2 | ReadyFrame |
| Headers | Per opening | No.2 | ReadyFrame |
| Cripples | Per opening | No.2 | ReadyFrame |
| King Studs | 2 per opening | DF Stud | Loose |

## Python Implementation Examples

### Basic Wall Calculation
```python
def calculate_basic_wall(wall_length_ft, stud_spacing=16):
    """Calculate materials for basic wall."""
    # Plates (2/3 rule)
    rf_plates_lf = 2 * wall_length_ft
    loose_plate_lf = 1 * wall_length_ft
    loose_plate_sticks = math.ceil(loose_plate_lf / 16)
    
    # Studs (0.75 per LF for 16" O.C.)
    stud_count = math.ceil(0.75 * wall_length_ft)
    
    return {
        'rf_plates_lf': rf_plates_lf,
        'loose_plate_lf': loose_plate_lf,
        'loose_plate_sticks': loose_plate_sticks,
        'stud_count': stud_count
    }
```

### Opening Adjustment
```python
def adjust_for_opening(base_stud_count, opening_width_ft, opening_count):
    """Adjust stud count for openings."""
    reduction = opening_count * math.floor(opening_width_ft / 4)
    kings = 2 * opening_count
    adjusted_count = base_stud_count - reduction + kings
    return adjusted_count
```

### Trimmer Calculation
```python
def calculate_trimmers(opening_type, width_ft, unit_count=1):
    """Calculate trimmer count by opening type."""
    if opening_type == 'standard_window' and width_ft <= 5:
        return 2
    elif opening_type == 'wide_window' and width_ft > 5:
        return 2 + 2 * math.floor((width_ft - 5) / 5)
    elif opening_type == 'mulled':
        return unit_count + 1
    elif opening_type == 'bay':
        return 2 + 2 * (unit_count - 1)
    else:
        return 2  # Default
```
