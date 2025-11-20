---
name: readyframe-takeoff-validator
description: Validates ReadyFrame material takeoffs against all system rules and specifications to catch errors before materials are ordered. Use when validating takeoffs, checking material quantities, reviewing ReadyFrame compliance, verifying plate ratios, checking stud counts, validating opening components, ensuring grade assignments are correct, or when asked to "check this takeoff", "validate materials", "review for errors", or "does this look right". Critical for quality assurance before ordering materials.
---

# ReadyFrame Takeoff Validator

## Overview

Validate ReadyFrame material takeoffs against comprehensive system rules to catch errors before materials are ordered. Performs 7 critical quality assurance checks and provides detailed feedback on compliance issues.

## Quick Validation

For a complete takeoff validation, provide:
- Wall dimensions (length and height)
- Material quantities (plates, studs, opening components)
- Material grades and categories

The validator will check:
1. **Plate Ratio** (2:1 ReadyFrame:Loose)
2. **Stud Density** (~0.75 per LF for 16" O.C.)
3. **Material Categorization** (ReadyFrame vs Loose)
4. **Grade Assignments** (No.2 vs DF Stud)
5. **Opening Components** (completeness and counts)
6. **Documentation Consistency** (matching across sources)
7. **Layout Integrity** (stud spacing and critical studs)

## Validation Workflows

### 1. Quick Validation (Basic Checks)

**When to use:** Rapid validation of overall takeoff accuracy

**Required inputs:**
- Wall length (LF)
- ReadyFrame plates (LF)
- Loose plates (LF)
- Total stud count
- Number of openings

**Validates:**
- Plate ratio check (Expected: 2:1, Range: 1.8-2.2)
- Total plates check (Should equal 3× wall length)
- Stud density check (Expected: ~0.75 per LF for 16" O.C.)

**Usage:**
```
python scripts/quick_validate.py \
  --wall-length 84.5 \
  --rf-plates 169 \
  --loose-plates 84.5 \
  --studs 64 \
  --openings 0
```

### 2. Comprehensive Validation (All Checks)

**When to use:** Complete validation before ordering materials

**Required inputs:**
- All basic inputs, plus:
- Complete material breakdown by component
- Grade assignments for each component
- Panel elevations or cutting lists
- Opening specifications

**Validates:**
- All quick validation checks
- Material categorization (each component)
- Grade assignments (No.2 vs DF Stud)
- Opening component completeness
- Trimmer quantities by opening type
- Documentation consistency

**Usage:**
```
python scripts/comprehensive_validate.py --input takeoff_data.json
```

### 3. Panel-by-Panel Validation

**When to use:** Validating individual panel specifications

**Required inputs:**
- Panel ID and dimensions
- Panel cutting list
- Component specifications

**Validates:**
- Panel material consistency
- Component labeling accuracy
- Dimensional accuracy
- Grade specifications

## Seven Critical Validation Checks

### Check 1: Plate Ratio Validation

**Rule:** ReadyFrame plates : Loose plates ≈ 2:1

**Formula:**
```
Plate Ratio = ReadyFrame Plates LF / Loose Plates LF
```

**Acceptable Range:** 1.8 to 2.2

**Common Errors:**
- ❌ All 3 plates categorized as ReadyFrame (ratio = ∞)
- ❌ Only bottom plate in ReadyFrame (ratio = 0.5)
- ❌ Forgetting third top plate entirely

**Example Validation:**
```
Input:
- Wall: 84.5 LF
- ReadyFrame plates: 169 LF
- Loose plates: 84.5 LF

Calculation:
- Ratio = 169 / 84.5 = 2.0

Result: ✓ PASS (within 1.8-2.2 range)
```

**Error Messages:**
- **Warning:** "Plate ratio 2.3 outside expected range 1.8-2.2"
- **Critical:** "Plate ratio 3.5 indicates incorrect categorization"

### Check 2: Total Plate Verification

**Rule:** Total plates / 3 ≈ Wall length

**Formula:**
```
Total Plates LF = ReadyFrame Plates + Loose Plates
Expected = Wall Length LF × 3
Variance = ABS(Total - Expected) / Expected
```

**Acceptable Variance:** < 5%

**Purpose:** Catches missing plates or calculation errors

**Example Validation:**
```
Input:
- Wall: 84.5 LF
- Total plates: 253.5 LF (169 + 84.5)

Calculation:
- Expected: 84.5 × 3 = 253.5 LF
- Variance: 0%

Result: ✓ PASS
```

**Common Errors:**
- ❌ Forgetting one plate type
- ❌ Miscalculating panel lengths
- ❌ Not accounting for mitered ends

### Check 3: Stud Density Validation

**Rule:** ~0.75 studs per linear foot (16" O.C.)

**Formula:**
```
Stud Density = Total Studs / Wall Length LF
```

**Acceptable Range:** 0.65 to 0.85 studs/LF

**Accounts For:**
- Opening adjustments
- Panel seam requirements
- Corner conditions

**Example Validation:**
```
Input:
- Wall: 84.5 LF
- Total studs: 64

Calculation:
- Density = 64 / 84.5 = 0.757 studs/LF

Result: ✓ PASS (within 0.65-0.85 range)
```

**Spacing Adjustments:**
- 16" O.C.: 0.75 studs/LF baseline
- 24" O.C.: 0.50 studs/LF baseline
- With openings: Adjust for reductions and kings

### Check 4: Material Categorization

**Rule:** Components must be correctly categorized as ReadyFrame or Loose

**Decision Tree:** See `references/categorization_rules.md`

**Validates:**
- ✓ Bottom plates → ReadyFrame
- ✓ First top plates → ReadyFrame
- ✓ Third top plates → Loose
- ✓ Full-length studs → Loose
- ✓ Trimmers → ReadyFrame
- ✓ Headers → ReadyFrame
- ✓ King studs → Loose

**Common Errors:**
- ❌ King studs in ReadyFrame package
- ❌ Third top plate in ReadyFrame
- ❌ Trimmers in Loose package

**Validation Script:** `scripts/validate_categorization.py`

### Check 5: Grade Assignment Validation

**Rule:** Proper lumber grade for each component category

**No.2 Grade (ReadyFrame):**
- All plates in ReadyFrame package
- Trimmers (cut to exact heights)
- Headers (cut to exact spans)
- Cripples (calculated heights)
- Custom-cut components

**DF Stud Grade (Loose):**
- All full-length studs
- Third top plates (16' lengths)
- King studs (full standard height)
- Critical studs

**Common Errors:**
- ❌ Trimmers specified as DF Stud
- ❌ King studs specified as No.2
- ❌ Mixing grades within same category

### Check 6: Opening Component Completeness

**Rule:** Every opening must have all required components

**Minimum Requirements Per Opening:**
- 2 king studs (Loose, DF Stud, full height)
- Minimum 2 trimmers (ReadyFrame, No.2, cut height)
- 1 header (ReadyFrame, No.2, 2-ply)
- 1 sill if window (ReadyFrame, No.2)
- Cripples as needed (ReadyFrame, No.2)

**Trimmer Count Validation:**
See `references/trimmer_validation.md` for complete rules

**Standard Window:** 2 trimmers
**Wide Window (>5'):** 2 + 2×FLOOR((W-5)/5)
**Mulled Units:** # units + 1
**Bay Windows:** 2 + 2×(sections-1)

**Validation Example:**
```
Opening: 6' wide window
Expected trimmers: 2 (standard, ≤5' gets 2)
Wait - 6' > 5', recalculate:
2 + 2×FLOOR((6-5)/5) = 2 + 2×0 = 2 trimmers

Actually still 2 because (6-5)/5 = 0.2, floor = 0
```

### Check 7: Documentation Consistency

**Rule:** All documents must match and be complete

**Cross-Reference Validation:**
- Panel IDs on placement match elevation sheets
- Panel dimensions consistent across documents
- Cutting lists match material sheets
- Header sizes appropriate for spans

**Common Inconsistencies:**
- ❌ Panel shown on placement but no elevation
- ❌ Dimensions don't match between documents
- ❌ Missing panels in sequence (E101, E103... where's E102?)
- ❌ Header size inadequate for span width

## Validation Severity Levels

### PASS ✓
All checks within acceptable ranges. Takeoff ready for ordering.

### WARNING ⚠️
Minor deviations that should be reviewed but may be acceptable:
- Plate ratio 1.75-1.79 or 2.21-2.25
- Stud density 0.62-0.64 or 0.86-0.88
- Minor documentation formatting issues

### ERROR ❌
Significant issues that must be corrected before ordering:
- Plate ratio < 1.5 or > 2.5
- Stud density < 0.55 or > 0.95
- Missing opening components
- Incorrect grade assignments
- Material categorization errors

### CRITICAL 🚨
Major errors indicating fundamental misunderstanding:
- Missing entire plate categories
- No trimmers for openings
- All materials in wrong category
- Grade specifications completely reversed

## Validation Output Format

### Summary Report
```
READYFRAME TAKEOFF VALIDATION REPORT
====================================

PROJECT: HH-1890A
WALL: E102 (84-1/2" length)
DATE: 2025-11-15

VALIDATION RESULTS:
[✓] Plate Ratio: 2.00 (PASS)
[✓] Total Plates: 253.5 LF vs 253.5 expected (PASS)
[✓] Stud Density: 0.76 studs/LF (PASS)
[✓] Material Categories: All correct (PASS)
[✓] Grade Assignments: All correct (PASS)
[✓] Opening Components: N/A - No openings (PASS)
[✓] Documentation: Consistent (PASS)

OVERALL STATUS: ✓ READY TO ORDER

No issues found. Takeoff validated against all ReadyFrame rules.
```

### Detailed Error Report
```
READYFRAME TAKEOFF VALIDATION REPORT
====================================

PROJECT: Sample Project
WALL: P105 (30' length)
DATE: 2025-11-15

VALIDATION RESULTS:
[❌] Plate Ratio: 3.00 (ERROR)
[⚠️] Stud Density: 0.87 studs/LF (WARNING)
[❌] Material Categories: 2 errors found (ERROR)
[✓] Grade Assignments: All correct (PASS)
[❌] Opening Components: Missing trimmers (CRITICAL)
[✓] Documentation: Consistent (PASS)

OVERALL STATUS: ❌ REQUIRES CORRECTION

ERRORS FOUND:

1. PLATE RATIO ERROR (CRITICAL)
   Problem: Ratio of 3.00 indicates missing Loose plates
   Expected: ~2.0 (range 1.8-2.2)
   Actual: ReadyFrame 60 LF, Loose 20 LF
   Solution: Verify third top plate is categorized as Loose
   
2. MATERIAL CATEGORIZATION ERROR
   Problem: King studs listed in ReadyFrame package
   Component: 4 king studs
   Expected Category: Loose (DF Stud grade)
   Actual Category: ReadyFrame (No.2 grade)
   Solution: Move king studs to Loose package
   
3. OPENING COMPONENTS ERROR (CRITICAL)
   Problem: Opening specified but no trimmers found
   Opening: 4'×5' window
   Required: Minimum 2 trimmers (ReadyFrame, No.2)
   Found: 0 trimmers
   Solution: Add 2 trimmers at proper height to cutting list

RECOMMENDATIONS:
- Recategorize third top plate as Loose
- Move 4 king studs to Loose package  
- Add 2 trimmers for window opening
- Revalidate after corrections
```

## Using the Validation Scripts

### Quick Validation Script

```bash
python scripts/quick_validate.py \
  --wall-length 84.5 \
  --rf-plates 169 \
  --loose-plates 84.5 \
  --studs 64 \
  --openings 0 \
  --output summary
```

### Comprehensive Validation

```bash
python scripts/comprehensive_validate.py \
  --input takeoff.json \
  --output detailed \
  --check-all
```

### Batch Validation

```bash
python scripts/batch_validate.py \
  --folder /path/to/takeoffs/ \
  --format excel \
  --output validation_results.xlsx
```

## Integration with Workflow

### Pre-Order Checklist

Before ordering materials:
1. ✓ Run quick validation on totals
2. ✓ Run comprehensive validation on details
3. ✓ Review any warnings or errors
4. ✓ Make corrections as needed
5. ✓ Revalidate after changes
6. ✓ Generate final validation report
7. ✓ Attach report to purchase order

### Quality Gate

Use as quality gate in workflow:
- Takeoff creation → Quick validation
- Corrections → Comprehensive validation  
- Final review → Full validation report
- Only proceed if STATUS = READY TO ORDER

## Common Validation Scenarios

### Scenario 1: Basic Wall (No Openings)

**Input:**
- 84.5 LF wall, 104-5/8" height, 2x6 @ 16" O.C.
- RF plates: 169 LF
- Loose plates: 84.5 LF
- Studs: 64

**Expected Result:** ✓ All checks pass

### Scenario 2: Wall with Windows

**Input:**
- 30 LF wall with two 4'×5' windows
- RF plates: 60 LF
- Loose plates: 30 LF
- Studs: 25 (21 common + 4 kings)
- Trimmers: 4
- Headers: 2
- Sills: 2

**Expected Result:** ✓ All checks pass

### Scenario 3: Common Error - Missing Third Plate

**Input:**
- 30 LF wall
- RF plates: 90 LF (all three plates!)
- Loose plates: 0 LF

**Expected Result:** ❌ ERROR
- Plate ratio: ∞ (division by zero)
- Error: "Third top plate missing from Loose package"

## Resources

### scripts/
- `quick_validate.py` - Fast validation of basic checks
- `comprehensive_validate.py` - Complete validation engine
- `batch_validate.py` - Validate multiple takeoffs
- `validate_categorization.py` - Check material categories
- `validate_grades.py` - Verify lumber grade assignments

### references/
- `validation_rules.md` - Complete validation rule set
- `categorization_rules.md` - Material categorization decision tree
- `trimmer_validation.md` - Trimmer count validation by type
- `error_messages.md` - All error messages with solutions
- `validation_examples.md` - Real-world validation examples

---

**CRITICAL:** Always validate takeoffs before ordering materials. Catching errors early saves time and money!
