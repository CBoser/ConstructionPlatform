# ReadyFrame Validation Rules - Complete Reference

All validation rules with formulas, acceptable ranges, and error detection logic.

## Rule 1: Plate Ratio Validation

### Formula
```
Plate Ratio = ReadyFrame Plates LF / Loose Plates LF
```

### Expected Value
**2.0** (representing the 2/3 vs 1/3 rule)

### Acceptable Range
**1.8 to 2.2** (±10% tolerance)

### Severity Levels
- **PASS:** 1.8 ≤ ratio ≤ 2.2
- **WARNING:** 1.6 ≤ ratio < 1.8 or 2.2 < ratio ≤ 2.4
- **ERROR:** 1.3 ≤ ratio < 1.6 or 2.4 < ratio ≤ 3.0
- **CRITICAL:** ratio < 1.3 or ratio > 3.0

### Common Failure Modes

**Mode 1: Missing Third Top Plate**
```
Symptom: Ratio > 3.0
Cause: Third top plate not included in takeoff
Example: RF=169, Loose=0 → ratio=∞
Solution: Add third top plate to Loose package
```

**Mode 2: All Plates in ReadyFrame**
```
Symptom: Ratio = ∞ (div by zero)
Cause: Third top plate categorized as ReadyFrame
Example: RF=253.5, Loose=0
Solution: Recategorize third top plate as Loose
```

**Mode 3: Only Bottom Plate in ReadyFrame**
```
Symptom: Ratio < 1.0
Cause: Top plates incorrectly categorized as Loose
Example: RF=84.5, Loose=169 → ratio=0.5
Solution: Move first top plate to ReadyFrame
```

### Validation Logic
```python
def validate_plate_ratio(rf_plates_lf, loose_plates_lf):
    if loose_plates_lf == 0:
        return "CRITICAL", "Third top plate missing entirely"
    
    ratio = rf_plates_lf / loose_plates_lf
    
    if 1.8 <= ratio <= 2.2:
        return "PASS", f"Plate ratio {ratio:.2f} within acceptable range"
    elif 1.6 <= ratio < 1.8 or 2.2 < ratio <= 2.4:
        return "WARNING", f"Plate ratio {ratio:.2f} slightly outside ideal range"
    elif 1.3 <= ratio < 1.6 or 2.4 < ratio <= 3.0:
        return "ERROR", f"Plate ratio {ratio:.2f} indicates categorization issue"
    else:
        return "CRITICAL", f"Plate ratio {ratio:.2f} indicates fundamental error"
```

## Rule 2: Total Plate Verification

### Formula
```
Total Plates = ReadyFrame Plates + Loose Plates
Expected Total = Wall Length LF × 3
Variance = ABS(Total - Expected) / Expected
```

### Expected Value
**Variance < 0.05** (less than 5% difference)

### Acceptable Range
**0% to 5% variance**

### Severity Levels
- **PASS:** Variance ≤ 5%
- **WARNING:** 5% < Variance ≤ 10%
- **ERROR:** 10% < Variance ≤ 20%
- **CRITICAL:** Variance > 20%

### Common Failure Modes

**Mode 1: Missing Plate Category**
```
Symptom: Variance ~ 33%
Cause: One plate type completely missing
Example: Wall=84.5, Total=169 (missing third plate)
Expected: 253.5, Actual: 169, Variance: 33%
Solution: Add missing plate category
```

**Mode 2: Wrong Panel Lengths**
```
Symptom: Variance 5-15%
Cause: Incorrect panel length measurements
Example: Used CAD dimensions instead of framing dimensions
Solution: Verify panel lengths against placement drawings
```

**Mode 3: Forgetting Mitered Ends**
```
Symptom: Small variance (2-5%)
Cause: Mitered/beveled plate ends not included
Solution: Add extra length for angled cuts
```

### Validation Logic
```python
def validate_total_plates(rf_plates, loose_plates, wall_length):
    total_plates = rf_plates + loose_plates
    expected = wall_length * 3
    variance = abs(total_plates - expected) / expected
    
    if variance <= 0.05:
        return "PASS", f"Total plates {total_plates:.1f} LF matches expected {expected:.1f} LF"
    elif variance <= 0.10:
        return "WARNING", f"Variance {variance:.1%} slightly high"
    elif variance <= 0.20:
        return "ERROR", f"Variance {variance:.1%} indicates missing plates"
    else:
        return "CRITICAL", f"Variance {variance:.1%} indicates major calculation error"
```

## Rule 3: Stud Density Validation

### Formula
```
Stud Density = Total Studs / Wall Length LF
```

### Expected Values
- **16" O.C.:** 0.75 studs/LF
- **24" O.C.:** 0.50 studs/LF

### Acceptable Ranges
- **16" O.C.:** 0.65 to 0.85 studs/LF
- **24" O.C.:** 0.42 to 0.58 studs/LF

### Adjustments for Openings
```
Reduction: ~1 stud per 4' of opening width
Addition: 2 kings per opening
Net effect: Varies by opening size
```

### Severity Levels (16" O.C.)
- **PASS:** 0.65 ≤ density ≤ 0.85
- **WARNING:** 0.60 ≤ density < 0.65 or 0.85 < density ≤ 0.90
- **ERROR:** 0.50 ≤ density < 0.60 or 0.90 < density ≤ 1.00
- **CRITICAL:** density < 0.50 or density > 1.00

### Common Failure Modes

**Mode 1: Forgot Opening Adjustments**
```
Symptom: Density too low for wall with openings
Cause: Didn't add king studs back after reduction
Example: 30 LF wall, 2 windows, only 20 studs (0.67/LF)
Should be: 23 - 2 + 4 = 25 studs (0.83/LF)
```

**Mode 2: Used 24" Spacing Incorrectly**
```
Symptom: Density ~0.50 when 16" O.C. specified
Cause: Calculated for 24" O.C. instead of 16" O.C.
Solution: Recalculate with correct spacing factor
```

**Mode 3: Double-Counted Kings**
```
Symptom: Density too high
Cause: Kings counted in both base and opening additions
Example: Base 23 + kings 4 + more kings 4 = 31 (should be 25)
```

### Validation Logic
```python
def validate_stud_density(stud_count, wall_length, spacing=16):
    density = stud_count / wall_length
    expected = 0.75 if spacing == 16 else 0.50
    lower = expected - 0.10
    upper = expected + 0.10
    
    if lower <= density <= upper:
        return "PASS", f"Stud density {density:.2f}/LF appropriate for {spacing}\" O.C."
    elif (expected - 0.15) <= density < lower or upper < density <= (expected + 0.15):
        return "WARNING", f"Stud density {density:.2f}/LF slightly outside range"
    elif (expected - 0.25) <= density < (expected - 0.15) or (expected + 0.15) < density <= (expected + 0.25):
        return "ERROR", f"Stud density {density:.2f}/LF indicates calculation issue"
    else:
        return "CRITICAL", f"Stud density {density:.2f}/LF far from expected {expected:.2f}/LF"
```

## Rule 4: Material Categorization Validation

### Decision Tree
```
Component → Check Type → Assign Category

Plate:
  Bottom → ReadyFrame (No.2)
  First Top → ReadyFrame (No.2)
  Third Top → Loose (DF Stud, 16' lengths)

Stud:
  Full-length? YES → Loose (DF Stud)
  Full-length? NO → ReadyFrame (No.2)
  
Opening Component:
  Trimmer → ReadyFrame (No.2)
  Header → ReadyFrame (No.2)
  Sill → ReadyFrame (No.2)
  Cripple → ReadyFrame (No.2)
  King → Loose (DF Stud, full-length)

Specialty:
  Blocking → ReadyFrame (No.2)
  Flat Stud (full-length) → Loose (DF Stud)
  Flat Stud (cut) → ReadyFrame (No.2)
```

### Common Errors

**Error 1: King Studs in ReadyFrame**
```
Status: ERROR (common mistake)
Problem: Kings are full-length, should be Loose
Correct: Move to Loose package, DF Stud grade
Impact: Grade and category both wrong
```

**Error 2: Trimmers in Loose**
```
Status: ERROR
Problem: Trimmers are cut-to-height, should be ReadyFrame
Correct: Move to ReadyFrame, No.2 grade
Impact: Won't be precut at factory
```

**Error 3: Third Top Plate in ReadyFrame**
```
Status: CRITICAL
Problem: Violates 2/3 rule, affects plate ratio
Correct: Move to Loose, 16' lengths
Impact: Major categorization error, ratio check fails
```

### Validation Logic
```python
def validate_categorization(component_list):
    errors = []
    
    for component in component_list:
        expected_category = determine_category(component)
        
        if component.category != expected_category:
            errors.append({
                'component': component.name,
                'expected': expected_category,
                'actual': component.category,
                'severity': 'CRITICAL' if 'plate' in component.name.lower() else 'ERROR'
            })
    
    return errors
```

## Rule 5: Grade Assignment Validation

### Grade Rules

**No.2 Grade Assignment:**
- All ReadyFrame precut components
- Requires precision dimensioning
- Tighter tolerances needed

**DF Stud Grade Assignment:**
- All Loose full-length components
- Standard lengths acceptable
- Cost-effective option

### Validation Matrix

| Component | Category | Grade | Common Error |
|-----------|----------|-------|--------------|
| Bottom Plate | ReadyFrame | No.2 | ✓ Usually correct |
| First Top Plate | ReadyFrame | No.2 | ✓ Usually correct |
| Third Top Plate | Loose | DF Stud | ❌ Sometimes marked No.2 |
| Common Studs | Loose | DF Stud | ✓ Usually correct |
| King Studs | Loose | DF Stud | ❌ Often marked No.2 |
| Trimmers | ReadyFrame | No.2 | ✓ Usually correct |
| Headers | ReadyFrame | No.2 | ✓ Usually correct |

### Common Errors

**Error 1: Kings Specified as No.2**
```
Problem: King studs marked No.2 instead of DF Stud
Severity: ERROR
Impact: Wrong material ordered, higher cost
Solution: Change to DF Stud grade
```

**Error 2: Third Plate as No.2**
```
Problem: Loose top plate specified as No.2
Severity: WARNING (not critical but costly)
Impact: Unnecessary premium grade
Solution: Change to DF Stud (unless special requirement)
```

### Validation Logic
```python
def validate_grades(component_list):
    errors = []
    
    for component in component_list:
        expected_grade = determine_grade(component)
        
        if component.grade != expected_grade:
            errors.append({
                'component': component.name,
                'expected_grade': expected_grade,
                'actual_grade': component.grade,
                'impact': calculate_cost_impact(component, expected_grade)
            })
    
    return errors
```

## Rule 6: Opening Component Completeness

### Required Components Per Opening

**Minimum Set:**
- 2 king studs (Loose, full-length)
- 2+ trimmers (ReadyFrame, varies by type)
- 1 header (ReadyFrame, 2-ply)
- 1 sill if window (ReadyFrame)
- Cripples as needed (ReadyFrame)

### Trimmer Count Validation

**Standard Window (≤5'):** 2 trimmers
**Wide Window (>5'):** 2 + 2×FLOOR((W-5)/5)
**Mulled Units:** # of units + 1
**Bay Windows:** 2 + 2×(sections-1)

### Validation Checks

1. **Kings Present:** 2 per opening minimum
2. **Trimmers Match Type:** Count matches opening type
3. **Header Specified:** 1 per opening
4. **Sill Present:** If window type
5. **Cripples Calculated:** Based on dimensions

### Common Errors

**Error 1: Missing Trimmers**
```
Severity: CRITICAL
Problem: Opening specified but no trimmers
Impact: Cannot frame opening
Example: 4'×5' window listed, 0 trimmers
Solution: Add 2 trimmers to cutting list
```

**Error 2: Wrong Trimmer Count**
```
Severity: ERROR
Problem: Wide window with only 2 trimmers
Impact: Insufficient support
Example: 11' window needs 4 trimmers, has 2
Solution: Add 2 more trimmers per formula
```

**Error 3: Missing Kings**
```
Severity: CRITICAL
Problem: No king studs specified for opening
Impact: Opening cannot maintain layout
Solution: Add 2 king studs per opening
```

### Validation Logic
```python
def validate_opening_components(opening_list, component_list):
    for opening in opening_list:
        # Check kings
        kings = count_components(component_list, 'king', opening)
        if kings < 2:
            yield error("Missing king studs", opening, expected=2, actual=kings)
        
        # Check trimmers
        expected_trimmers = calculate_trimmer_count(opening)
        actual_trimmers = count_components(component_list, 'trimmer', opening)
        if actual_trimmers != expected_trimmers:
            yield error("Incorrect trimmer count", opening, 
                       expected=expected_trimmers, actual=actual_trimmers)
        
        # Check header
        headers = count_components(component_list, 'header', opening)
        if headers < 1:
            yield error("Missing header", opening)
```

## Rule 7: Documentation Consistency

### Cross-Reference Checks

1. **Panel ID Consistency**
   - All panels on placement have elevations
   - Panel IDs match across documents
   - No missing panels in sequence

2. **Dimension Consistency**
   - Panel lengths match across docs
   - Wall heights consistent
   - Opening dimensions match specs

3. **Component Labeling**
   - Cutting list labels match callouts
   - Component descriptions consistent
   - Quantities add up correctly

### Validation Checks

```python
def validate_documentation(placement_panels, elevation_panels, material_sheets):
    # Check all panels have elevations
    for panel_id in placement_panels:
        if panel_id not in elevation_panels:
            yield error(f"Panel {panel_id} missing elevation sheet")
    
    # Check dimensions match
    for panel_id in placement_panels:
        placement_dims = get_dimensions(placement_panels[panel_id])
        elevation_dims = get_dimensions(elevation_panels[panel_id])
        if not dimensions_match(placement_dims, elevation_dims):
            yield error(f"Dimension mismatch for panel {panel_id}")
    
    # Check component totals
    for material_type in material_sheets:
        panel_total = sum_from_elevations(elevation_panels, material_type)
        sheet_total = material_sheets[material_type].total
        if panel_total != sheet_total:
            yield warning(f"Total mismatch for {material_type}")
```

## Validation Workflow

### Step-by-Step Process

1. **Load Takeoff Data**
   - Parse all input files
   - Extract material quantities
   - Identify components and categories

2. **Run Basic Checks**
   - Plate ratio validation
   - Total plate verification
   - Stud density check

3. **Run Component Checks**
   - Material categorization
   - Grade assignments
   - Opening components

4. **Run Documentation Checks**
   - Cross-reference consistency
   - Dimension verification
   - Labeling accuracy

5. **Generate Report**
   - Summarize all findings
   - Classify by severity
   - Provide correction guidance

6. **Quality Gate Decision**
   - PASS: Proceed to ordering
   - WARNING: Review and approve
   - ERROR: Correct and revalidate
   - CRITICAL: Major corrections needed

## Summary Validation Checklist

Use this checklist for manual validation:

- [ ] Plate ratio between 1.8 and 2.2
- [ ] Total plates = 3× wall length (±5%)
- [ ] Stud density ~0.75/LF for 16" O.C.
- [ ] Bottom plate in ReadyFrame (No.2)
- [ ] First top plate in ReadyFrame (No.2)
- [ ] Third top plate in Loose (DF Stud)
- [ ] Full-length studs in Loose (DF Stud)
- [ ] Trimmers in ReadyFrame (No.2)
- [ ] Kings in Loose (DF Stud)
- [ ] All openings have required components
- [ ] Trimmer counts match opening types
- [ ] Documentation is consistent
- [ ] Panel IDs match across documents

**If all checks pass → READY TO ORDER**
