# Holt Code Structure

## Overview
Holt uses a composite numeric code structure that encodes Plan, Phase, and Option/Elevation information into a single identifier, paired with a Cost Code.

## Composite Code Format

**Format:** `{Plan}{Phase}{ItemNo} - {CostCode}`

**Example:** `154210100 - 4085`

| Component | Digits | Example | Description |
|-----------|--------|---------|-------------|
| Plan | 4 | 1542 | Plan number |
| Phase | 2 | 10 | Phase category |
| Item_No | 3 | 100 | Elevation + Option variant |
| Cost Code | 4 | 4085 | Material/Activity type |

## Code Components Breakdown

### 1. Plan Number (4 digits)
The plan identifier, representing distinct house plans.

**Examples:**
- 1542, 1632, 1633, 1649, 1656, 1669, 1670
- 1816, 1890, 1987, 2009, 2157, 2184, 2260
- 2299, 2321, 2336, 2383, 2414, 2674, 2676
- 2978, 3297, 3370, 8000, 8021, 8022, 8023

### 2. Phase Number (2 digits)
Categorizes the type of option or construction phase.

| Phase | Category | Description |
|-------|----------|-------------|
| 0-9 | Base House | Plan-specific base house definitions |
| 10 | Elevations | Standard elevations (A, B, C, D) and enhanced versions |
| 11 | Siding Add-ons | Faux Wood colors, Masonry finishes |
| 12-13 | Base/Specialty | Base house or specialty siding |
| 18 | SH Balconies | Covered rear balconies, soffits |
| 19 | Retreats | Optional retreats with patios |
| 20 | Structural Add-ons | Covered patios, dens, bedrooms |
| 21 | Floor/Storage | Open web joists, storage options |
| 25 | Bath Options | Tub at primary, mudset showers |
| 36 | Smart Home | Smart home packages |
| 40 | Windows | Window frame color options |
| 49 | Transom Windows | Above entry door |
| 80 | Fireplaces | Double-sided gas fireplace |
| 83 | Doors & Trim | 8' interior doors, crown molding, baseboards |

### 3. Item Number (3 digits)
Encodes both the Elevation and the Option variant.

**Structure:** First digit = Elevation Category, Last two digits = Option Variant

#### Elevation Categories (First Digit)

| First Digit | Elevation Category | Description |
|-------------|-------------------|-------------|
| 1 | Elevation A | Standard Elevation A options |
| 2 | Elevation B | Standard Elevation B options |
| 3 | Elevation C | Standard Elevation C options |
| 4 | Elevation D | Standard Elevation D options |
| 5 | Corner Enhanced | Corner enhanced options |
| 6 | Rear Enhanced | Rear enhanced options |
| 7+ | Other Options | Various other options |

#### Option Variants (Last Two Digits)

| Last Two | Option | Example |
|----------|--------|---------|
| 00 | Base | 100 = Elevation A Base |
| 01 | Gable End Sheathing | 101 = Elevation A Gable |
| 05 | 3 Car Garage | 105 = Elevation A 3-Car |

**Special Pattern for Enhanced Options (5xx, 6xx):**

For Corner Enhanced (5xx) and Rear Enhanced (6xx), the last two digits encode which elevation:
- 00 = Elevation A
- 05 = Elevation B
- 10 = Elevation C
- 15 = Elevation D

**Examples:**
- 500 = Corner Enhanced - Elevation A
- 505 = Corner Enhanced - Elevation B
- 510 = Corner Enhanced - Elevation C
- 515 = Corner Enhanced - Elevation D

### 4. Cost Code (4 digits)
Identifies the material/activity type.

| Code | Activity | Description | Count |
|------|----------|-------------|-------|
| 4085 | Lumber | Structural lumber | 356 |
| 4086 | Lumber - Barge Credit | Transportation credit | 24 |
| 4120 | Trusses | Roof trusses | 117 |
| 4140 | Window Supply | Standard windows | 177 |
| 4142 | Window Supply - U-22 | WA triple pane upgrade | 56 |
| 4150 | Exterior Door Supply | Entry/garage doors | 13 |
| 4155 | Siding Supply | Exterior siding | 386 |
| 4320 | Interior Trim - Millwork | Interior trim | 260 |

## Complete Code Examples

### Example 1: Base Elevation
```
154210100 - 4085
│   │ │     │
│   │ │     └── 4085 = Lumber
│   │ └──────── 100 = Elevation A Base (1=A, 00=base)
│   └────────── 10 = Phase 10 (Elevations)
└────────────── 1542 = Plan Number
```

**Description:** Plan 1542, Elevation A Base, Lumber

### Example 2: Option Variant
```
163210205 - 4120
│   │ │     │
│   │ │     └── 4120 = Trusses
│   │ └──────── 205 = Elevation B, 3-Car Garage (2=B, 05=3-car)
│   └────────── 10 = Phase 10 (Elevations)
└────────────── 1632 = Plan Number
```

**Description:** Plan 1632, Elevation B, 3-Car Garage Option, Trusses

### Example 3: Corner Enhanced
```
154210505 - 4155
│   │ │     │
│   │ │     └── 4155 = Siding Supply
│   │ └──────── 505 = Corner Enhanced - Elevation B
│   └────────── 10 = Phase 10 (Elevations)
└────────────── 1542 = Plan Number
```

**Description:** Plan 1542, Corner Enhanced Elevation B, Siding Supply

### Example 4: Door/Trim Option
```
163283069 - 4085
│   │ │     │
│   │ │     └── 4085 = Lumber
│   │ └──────── 69 = 8' Interior Swing Doors
│   └────────── 83 = Phase 83 (Doors & Trim)
└────────────── 1632 = Plan Number
```

**Description:** Plan 1632, 8' Interior Swing Doors Option, Lumber

## Parsing Logic

### Code Parser Function
```python
def parse_holt_code(code_str: str) -> dict:
    """Parse Holt code into components

    Args:
        code_str: Code like "154210100 - 4085"

    Returns:
        Dict with plan, phase, item_no, elevation, option, cost_code
    """
    parts = code_str.strip().split(' - ')
    if len(parts) != 2:
        return {'error': f"Invalid format: {code_str}"}

    main_part = parts[0].strip()
    cost_code = parts[1].strip()

    if len(main_part) != 9:
        return {'error': f"Main code should be 9 digits: {main_part}"}

    plan = main_part[0:4]      # First 4 digits
    phase = main_part[4:6]     # Next 2 digits
    item_no = main_part[6:9]   # Last 3 digits

    # Parse Item_No for elevation info
    first_digit = int(item_no[0])
    last_two = int(item_no[1:3])

    # Determine elevation category
    elevation_map = {
        1: 'A', 2: 'B', 3: 'C', 4: 'D',
        5: 'Corner Enhanced', 6: 'Rear Enhanced'
    }
    elevation = elevation_map.get(first_digit, f'Other ({first_digit})')

    return {
        'plan': plan,
        'phase': phase,
        'item_no': item_no,
        'elevation_category': elevation,
        'option_variant': last_two,
        'cost_code': cost_code,
        'full_code': code_str
    }
```

## Comparison to Richmond

| Aspect | Holt | Richmond |
|--------|------|----------|
| Format | Numeric composite | Mnemonic abbreviations |
| Example | 154210100 - 4085 | XGREAT, 3CARA |
| Plan Encoding | In code (1542) | Separate field |
| Elevation | In Item_No (1xx=A) | Letter suffix (A, B, C) |
| Readability | Requires parsing | Human-readable |
| Consistency | Systematic | Ad-hoc |

## Key Advantages

### Systematic Structure
- Plan number always in same position
- Phase always 2 digits
- Item_No always 3 digits
- Predictable parsing

### Elevation Encoding
- Single location (Item_No first digit)
- No triple-encoding like Richmond
- Clear and consistent

### Cost Code Standardization
- Only 8 cost codes
- Same meaning across all plans
- Easy to categorize materials

## Best Practices

### Code Generation
1. Validate plan number exists (4 digits)
2. Validate phase is known (2 digits)
3. Build Item_No from elevation + option
4. Append appropriate cost code

### Code Validation
1. Check total length (9 digits + separator + 4 digits)
2. Verify plan number is valid
3. Verify phase exists in system
4. Verify cost code is one of 8 valid codes

### Database Storage
Store both parsed components and full code:
- `full_code`: "154210100 - 4085"
- `plan`: "1542"
- `phase`: "10"
- `item_no`: "100"
- `cost_code`: "4085"

---

**Document Updated:** 2025-11-18
**Source:** Holt_Cost_Codes_20251118.xlsx (1,309 rows)
**Status:** Corrected based on actual Holt data analysis
