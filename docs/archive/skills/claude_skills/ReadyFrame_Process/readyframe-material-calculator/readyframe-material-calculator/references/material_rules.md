# ReadyFrame Material Categorization Rules

Complete decision tree and rules for categorizing materials into ReadyFrame (Precut) vs Loose categories.

## Core Principle: 2/3 vs 1/3 Rule

```
Total Materials = ReadyFrame (67%) + Loose (33%)
```

This fundamental division optimizes the balance between factory precision and field flexibility.

## Decision Tree

```
START: Material Component
│
├─ Is it a PLATE?
│   ├─ Bottom Plate? → ReadyFrame (No.2 grade)
│   ├─ First Top Plate? → ReadyFrame (No.2 grade)
│   └─ Third Top Plate? → Loose (DF Stud grade, 16' lengths)
│
├─ Is it a STUD?
│   ├─ Full-length (92-5/8" or 104-5/8")? → Loose (DF Stud grade)
│   │   ├─ Common stud? → Loose
│   │   ├─ King stud? → Loose
│   │   ├─ Critical stud? → Loose
│   │   └─ Full-length flat stud? → Loose
│   └─ Cut to non-standard length? → ReadyFrame (No.2 grade)
│
├─ Is it an OPENING COMPONENT?
│   ├─ Trimmer/Jack Stud? → ReadyFrame (No.2 grade, cut to height)
│   ├─ Header? → ReadyFrame (No.2 grade, cut to span)
│   ├─ Window Sill? → ReadyFrame (No.2 grade, cut to width)
│   ├─ Sill Cripple? → ReadyFrame (No.2 grade, cut to height)
│   ├─ Header Cripple? → ReadyFrame (No.2 grade, cut to height)
│   └─ Pad/Filler? → ReadyFrame (No.2 grade, cut to size)
│
└─ Is it SPECIALTY COMPONENT?
    ├─ Blocking (called out)? → ReadyFrame (No.2 grade)
    ├─ Bottom nailer? → ReadyFrame (No.2 grade)
    ├─ Flat stud (non-standard length)? → ReadyFrame (No.2 grade)
    └─ Field-adjustment noted? → Loose (DF Stud grade)
```

## Detailed Component Rules

### Plates

**Bottom Plate:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Exact panel length
- **Special:** Includes mitered ends for angled walls
- **Quantity:** 1 per panel (single member)

**First/Inner Top Plate:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Exact panel length
- **Special:** Includes mitered ends for angled walls
- **Quantity:** 1 per panel (single member)

**Third/Outer Top Plate:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** 16' standard lengths
- **Special:** Field-cut and lapped at splices (minimum 48" lap)
- **Quantity:** Calculate total LF, convert to 16' stick count

**Calculation:**
```python
rf_plates_lf = 2 * panel_length  # Bottom + First Top
loose_plate_lf = 1 * panel_length  # Third Top
loose_sticks = math.ceil(loose_plate_lf / 16)
```

### Studs

**Full-Length Studs (Loose):**

**Common Studs:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** 92-5/8" or 104-5/8" (by floor)
- **Count:** Base = 0.75 × Wall LF (16" O.C.)
- **Purpose:** Wall field framing

**King Studs:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** Full height (92-5/8" or 104-5/8")
- **Count:** 2 per opening
- **Purpose:** Frame opening sides, maintain layout

**Critical Studs:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** Full height (92-5/8" or 104-5/8")
- **Purpose:** Preserve 16" O.C. layout module
- **Location:** Panel seams, layout reset points

**Full-Length Flat Studs:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** Full height (92-5/8" or 104-5/8")
- **Purpose:** Nailing surface at corners/seams

**Non-Standard Length Studs (ReadyFrame):**

**Short Flat Studs:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Length:** Cut to specific dimension < full height
- **Purpose:** Special nailing surfaces, returns

**Field-Adjustment Studs:**
- **Category:** Loose
- **Grade:** DF Stud
- **Length:** Full height (field-cut as needed)
- **Note:** Explicitly called out on plans

### Opening Components (All ReadyFrame)

**Trimmers/Jack Studs:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Exact height (floor to header)
- **Count:** Varies by opening type (see trimmer_specs.md)
- **Purpose:** Support header, define RO sides

**Headers:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Opening width + 3" (for 2x6 wall)
- **Configuration:** Typically 2-ply
- **Sizes:** 2×4 through 2×12, or LVL for large spans

**Window Sills:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Opening width (matches header)
- **Purpose:** Bottom of window RO

**Sill Cripples:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Floor to sill distance - plates
- **Count:** Based on opening width and stud spacing
- **Purpose:** Support below window sill

**Header Cripples:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Height from header to top plate
- **Count:** Based on opening width and stud spacing
- **Purpose:** Fill space above header

**Pads and Fillers:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Typical:** 1/2" × 5-1/2" pieces
- **Purpose:** Align header depths, thickness adjustments

### Specialty Components

**Blocking:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Cut:** Per plan specifications
- **Note:** Only when explicitly called out on elevations

**Bottom Nailers:**
- **Category:** ReadyFrame
- **Grade:** No.2
- **Purpose:** Attachment surface at bottom of walls

**Corner/Return Assemblies:**
- **Evaluate per component:**
  - Full-length members → Loose
  - Cut pieces → ReadyFrame

## Grade Assignment Rules

### No.2 Grade Assignment

Use No.2 grade for components that are:
1. Cut to specific non-standard lengths
2. Require precision dimensioning
3. Part of ReadyFrame precut package
4. Need tighter tolerances for assembly

**Examples:**
- All plates in ReadyFrame package
- Trimmers (exact heights)
- Headers (exact spans)
- Cripples (calculated heights)
- Custom-cut blocking
- Non-standard flat studs

### DF Stud Grade Assignment

Use DF Stud grade for components that are:
1. Full standard lengths
2. Field-cut as needed
3. Part of Loose package
4. Allow minor dimensional variance

**Examples:**
- All full-length studs (common, king, critical)
- Third top plates (16' lengths)
- Full-length flat studs
- Field-adjustment pieces

## Validation Rules

### Material Balance Check

**Plate Ratio:**
```
ReadyFrame Plates / Loose Plates ≈ 2.0

Acceptable Range: 1.8 to 2.2
```

**Total Plate Verification:**
```
(ReadyFrame Plates + Loose Plates) / 3 ≈ Wall LF

Variance < 5% acceptable
```

### Component Completeness

**Every Panel Must Have:**
- ✓ 1 bottom plate (ReadyFrame)
- ✓ 1 first top plate (ReadyFrame)
- ✓ Studs (primarily Loose, except special cuts)
- ✓ Provision for third top plate (Loose, from aggregate)

**Every Opening Must Have:**
- ✓ Minimum 2 trimmers (ReadyFrame)
- ✓ 2 king studs (Loose)
- ✓ 1 header (ReadyFrame)
- ✓ Sill (if window) (ReadyFrame)
- ✓ Appropriate cripples (ReadyFrame)

### Common Errors to Avoid

**Error 1: Misclassifying Full-Length Studs**
```
WRONG: King studs as ReadyFrame
RIGHT: King studs as Loose (DF Stud, full-length)
```

**Error 2: Wrong Grade Assignment**
```
WRONG: Trimmers as DF Stud
RIGHT: Trimmers as No.2 (precut components)
```

**Error 3: Plate Count Error**
```
WRONG: All 3 plates as ReadyFrame
RIGHT: 2 plates ReadyFrame, 1 plate Loose
```

**Error 4: Flat Stud Confusion**
```
Scenario: 104-5/8" flat stud
WRONG: Categorize as ReadyFrame (non-standard)
RIGHT: Categorize as Loose (full standard height)

Scenario: 72" flat stud
WRONG: Categorize as Loose (full-length)
RIGHT: Categorize as ReadyFrame (non-standard cut)
```

## Material Sheet Organization

### ReadyFrame Section Format

```
READYFRAME MATERIALS (Precut - No.2 Grade)

PLATES (2x6):
- Bottom Plates: 169 LF (various panel lengths)
- Top Plates: 169 LF (various panel lengths)

OPENING COMPONENTS (2x6):
- Trimmers: Qty 8, various heights
- Headers: Qty 4, various lengths (2x8 2-ply)
- Window Sills: Qty 4, various lengths
- Cripples: Qty 24, various heights

SPECIALTY:
- Flat Studs (non-standard): Qty 3, specified lengths
- Blocking: Per cutting lists
```

### Loose Section Format

```
LOOSE MATERIALS (Field Cut - DF Stud Grade)

TOP PLATES (2x6):
- Third/Outer Plate: 169 LF → 11 sticks @ 16'

STUDS (2x6 @ 104-5/8"):
- Common Studs: 56 EA
- King Studs: 8 EA (4 openings × 2)
- Critical Studs: 4 EA
- Full-Length Flat Studs: 2 EA
TOTAL STUDS: 70 EA @ 104-5/8"
```

## Python Implementation

### Categorization Function

```python
def categorize_component(component_type, is_full_length=False, 
                         is_standard_height=False, **kwargs):
    """
    Categorize a component as ReadyFrame or Loose.
    
    Returns: ('ReadyFrame', 'No.2') or ('Loose', 'DF Stud')
    """
    # Plates
    if component_type in ['bottom_plate', 'first_top_plate']:
        return ('ReadyFrame', 'No.2')
    elif component_type == 'third_top_plate':
        return ('Loose', 'DF Stud')
    
    # Studs
    elif component_type in ['common_stud', 'king_stud', 'critical_stud']:
        if is_full_length and is_standard_height:
            return ('Loose', 'DF Stud')
        else:
            return ('ReadyFrame', 'No.2')
    
    # Opening components
    elif component_type in ['trimmer', 'header', 'sill', 
                           'cripple', 'pad', 'filler']:
        return ('ReadyFrame', 'No.2')
    
    # Flat studs
    elif component_type == 'flat_stud':
        if is_full_length and is_standard_height:
            return ('Loose', 'DF Stud')
        else:
            return ('ReadyFrame', 'No.2')
    
    # Specialty
    elif component_type in ['blocking', 'nailer']:
        return ('ReadyFrame', 'No.2')
    
    # Default to ReadyFrame for safety (can review manually)
    return ('ReadyFrame', 'No.2')
```

### Validation Function

```python
def validate_categorization(rf_plates_lf, loose_plate_lf, 
                           total_studs, wall_lf):
    """
    Validate material categorization follows ReadyFrame rules.
    
    Returns: (is_valid, list of warnings)
    """
    warnings = []
    
    # Check plate ratio
    plate_ratio = rf_plates_lf / loose_plate_lf if loose_plate_lf > 0 else 0
    if not (1.8 <= plate_ratio <= 2.2):
        warnings.append(
            f"Plate ratio {plate_ratio:.2f} outside expected range 1.8-2.2"
        )
    
    # Check total plates
    total_plates = rf_plates_lf + loose_plate_lf
    expected_plates = wall_lf * 3
    variance = abs(total_plates - expected_plates) / expected_plates
    if variance > 0.05:
        warnings.append(
            f"Total plates {total_plates:.1f} LF doesn't match "
            f"expected {expected_plates:.1f} LF (variance {variance:.1%})"
        )
    
    # Check stud density
    stud_density = total_studs / wall_lf
    if not (0.65 <= stud_density <= 0.85):
        warnings.append(
            f"Stud density {stud_density:.2f}/LF outside expected range "
            f"0.65-0.85 for 16\" O.C."
        )
    
    is_valid = len(warnings) == 0
    return is_valid, warnings
```

## Summary Checklist

Use this checklist when categorizing materials:

**ReadyFrame (Precut - No.2 Grade):**
- [ ] Bottom plates (exact panel lengths)
- [ ] First top plates (exact panel lengths)
- [ ] All trimmers (cut to opening heights)
- [ ] All headers (cut to opening widths)
- [ ] Window sills (cut to opening widths)
- [ ] All cripples (sill and header)
- [ ] Pads and fillers
- [ ] Non-standard flat studs
- [ ] Called-out blocking
- [ ] Bottom nailers

**Loose (Field Cut - DF Stud Grade):**
- [ ] Third top plates (16' lengths)
- [ ] Common studs (full standard height)
- [ ] King studs (full standard height)
- [ ] Critical studs (full standard height)
- [ ] Full-length flat studs
- [ ] Field-adjustment components

**Validation:**
- [ ] ReadyFrame plates : Loose plates ≈ 2:1
- [ ] Total plates / 3 ≈ Wall LF
- [ ] Stud density ≈ 0.75 per LF (16" O.C.)
- [ ] Every opening has required components
- [ ] Grades properly assigned
