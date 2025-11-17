# Holt BAT Integration Plan - Week 2
**Date:** November 17, 2025
**Objective:** Integrate unified coding system into Holt BAT while maintaining existing functionality

---

## Current State Analysis

### Holt BAT Structure (107 sheets)
**File:** `IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm`

**Key Sheets:**
- `📋 CODE LEGEND` - Already has unified code format started!
- `📐 FORMULA GUIDE` - Documents current formulas
- `indexMaterialListsbyPlan` - 9,374 rows of material data
- `schedule_PriceSchedule` - 719 pricing records
- 90+ community-specific plan sheets (WR, GG, HA, HH, CR)

### Current Code Systems in Use

#### 1. Holt OptionPhase Format
```
OptionPhase: "167010100 - 4085 , 167010200 - 4085 , 167010300 - 4085 , 167010400 - 4085"

Breakdown:
- 167010100 = Plan 1670, Elevation 1 (A), Phase 010, Sequence 00
- 4085 = Activity code (Framing/Lumber)
- Comma-separated = one material used in multiple elevations
```

#### 2. Richmond PackID Format
```
PackID: "|10ABCD FOUNDATION"

Breakdown:
- |10 = Pack number
- ABCD = Elevations A, B, C, D
- FOUNDATION = Pack name
```

#### 3. Their Started Unified Format
```
Format: PPPP-PPP.000-EE-IIII
Example: 1670-101.000-AB-4085

Components:
- PPPP (1670) = Plan number
- PPP (101) = Phase/Pack code
- 000 = Padding (reserved)
- EE (AB) = Elevation code
- IIII (4085) = Item type code
```

### Our Python Tool Unified Format
```
Format: PPPP-XXX.XXX-XX-XXXX
Example: 1670-010.000-A-1000

Components:
- PPPP = Plan code
- XXX.XXX = Phase code (major.minor)
- XX = Elevation code (sorted, e.g., "BCD")
- XXXX = Item type code
```

---

## Integration Strategy

### Phase 1: Mapping & Cross-Reference (Days 1-2)

#### Task 1.1: Holt Activity → Item Type Mapper
**Already built in Python:** `customer_code_mapping.py:map_item_type()`

**Current mappings:**
```python
'4085': '1000',  # Framing/Lumber
'4155': '2100',  # Siding
'4215': '2200',  # Roofing
'4125': '2300',  # Windows/Doors
```

**Action:** Expand this mapping to cover all Holt activities found in the 9,374 material rows.

#### Task 1.2: Create Holt Phase → Unified Phase Mapper
**Holt phases found:**
- 010 = Foundation
- 020 = Main Walls
- 030 = Upper Walls
- 040 = Roof Trusses

**Action:** Build complete phase mapping table.

#### Task 1.3: Richmond PackID → Unified Phase Mapper
**Richmond packs:**
- |10 = Foundation (010.000)
- |20 = Main Floor (020.000)
- etc.

**Action:** Use existing `coding_schema_translation.csv` (311 rows).

### Phase 2: Build Cross-Reference Tables (Day 3)

#### Output: Excel Workbook with Cross-Reference Sheets

**Sheet 1: Holt_Activity_Lookup**
| Holt_Activity | Item_Type | Item_Name | Category |
|---------------|-----------|-----------|----------|
| 4085 | 1000 | Framing Lumber | Structural |
| 4155 | 2100 | Siding | Exterior Envelope |
| ... | ... | ... | ... |

**Sheet 2: Holt_Phase_Lookup**
| Holt_Phase | Unified_Phase | Phase_Name | Construction_Sequence |
|------------|---------------|------------|----------------------|
| 010 | 010.000 | Foundation | 1 |
| 020 | 020.000 | Main Walls | 2 |
| ... | ... | ... | ... |

**Sheet 3: Richmond_Pack_Lookup**
| Richmond_PackID | Unified_Phase | Pack_Name | Shipping_Order |
|-----------------|---------------|-----------|----------------|
| \|10 | 010.820 | Foundation | 10 |
| \|20 | 020.000 | Main Floor | 20 |
| ... | ... | ... | ... |

**Sheet 4: Plan_Master**
| Plan_Code | Plan_Name | Community | Available_Elevations |
|-----------|-----------|-----------|---------------------|
| 1670 | Plan 1670 | CR, WR, HA | A, B, C, D |
| 2336 | Plan 2336 | GG, WR | B, C, D |
| ... | ... | ... | ... |

### Phase 3: Excel Integration (Days 4-5)

#### Task 3.1: Add Unified Code Column
**Location:** `indexMaterialListsbyPlan` sheet

**New Column:** `UnifiedCode` (insert after Column D)

**Formula:**
```excel
=BuildUnifiedCode([@PlanTable], [@OptionPhase], [@PackID])
```

This VBA function will:
1. Parse OptionPhase Holt codes
2. Parse PackID Richmond codes
3. Look up mappings from cross-reference sheets
4. Return unified code: `PPPP-XXX.XXX-XX-XXXX`

#### Task 3.2: Create VBA Helper Functions
```vba
Function BuildUnifiedCode(planTable As String, optionPhase As String, packID As String) As String
    ' Parse plan number from planTable
    ' Parse Holt codes from optionPhase OR Richmond code from packID
    ' Lookup mappings
    ' Construct unified code
End Function

Function ParseHoltCode(holtCode As String) As Variant
    ' Returns array: [plan, phase, elevation, activity]
End Function

Function LookupItemType(activity As String) As String
    ' VLOOKUP from Holt_Activity_Lookup sheet
End Function
```

#### Task 3.3: Update Pricing Formulas
**Keep existing formulas working** + add unified code support

**Current:**
```excel
=IFERROR(VLOOKUP($F12,PriceData,2,0),"")
```

**Enhanced:**
```excel
=IFERROR(
    VLOOKUP($F12,PriceData,2,0),
    VLOOKUP([@UnifiedCode],UnifiedPriceData,2,0),
    ""
)
```

### Phase 4: Testing & Validation (Day 5)

#### Test Cases:
1. **Holt material with multi-elevation code:**
   - Input: `"167010100 - 4085 , 167010200 - 4085"`
   - Expected: `"1670-010.000-AB-1000"` (combined elevations)

2. **Richmond material:**
   - Input: `"|10.82BCD"`
   - Expected: `"1670-010.820-BCD-1000"`

3. **Pricing lookup still works**
4. **Material extraction exports both formats**

---

## Deliverables

### Documentation
- [x] This integration plan
- [ ] Cross-reference table documentation
- [ ] Updated formula guide
- [ ] User guide for dual-code system

### Code
- [ ] Python script to generate cross-reference tables
- [ ] VBA functions for unified code generation
- [ ] Excel workbook with cross-reference sheets

### Excel Workbook Updates
- [ ] Unified code column in indexMaterialListsbyPlan
- [ ] Cross-reference lookup sheets
- [ ] Updated formulas
- [ ] Backward compatibility maintained

---

## Success Criteria

✅ All 9,374 materials have valid unified codes
✅ Existing pricing formulas still work
✅ Can extract material lists in BOTH formats:
   - Holt format (for current workflow)
   - Unified format (for future customers)
✅ Cross-reference tables are complete and accurate
✅ Documentation updated
✅ Testing validates all conversions

---

## Timeline

**Day 1 (Today):** Analysis complete, build Holt activity mapper
**Day 2:** Complete all mapping tables
**Day 3:** Generate Excel cross-reference workbook
**Day 4:** Excel integration & VBA functions
**Day 5:** Testing & validation

---

## Next Steps

1. Run Python script to analyze all 9,374 rows and extract unique:
   - Holt activity codes
   - Holt phase codes
   - Richmond pack IDs
   - Plan numbers

2. Build complete mapping tables in Python

3. Export to Excel format for integration

---

**Status:** Analysis Complete ✅
**Next Task:** Extract unique codes from material data
