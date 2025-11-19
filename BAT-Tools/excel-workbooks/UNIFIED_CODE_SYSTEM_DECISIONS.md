# Unified Code System - Key Decisions Required

## Overview
Before proceeding with the cross-reference tables and VBA integration, the following architectural decisions need to be made to ensure consistency across Holt and Richmond BAT systems.

---

## Decision 1: Code Format Standard

**Current Conflict:**

| System | Format | Example |
|--------|--------|---------|
| Holt BAT (proposed) | `PPPP-XXX.XXX-XX-XXXX` | `1670-010.000-AB-1000` |
| Richmond BAT (existing) | `PPPP-PPP.000-EE-IIII` | `1670-101.000-AB-4085` |

**Key Differences:**
- Holt uses decimal phases (010.000, 020.000)
- Richmond uses 3-digit pack codes (101, 200, 300)
- Item type codes differ (1000 vs 4085)

**Question:** Which format should be the standard?
- [ ] Adopt Richmond's existing format for both
- [ ] Adopt Holt's proposed format for both
- [ ] Create a new unified format that works for both
- [ ] Keep separate formats per customer

---

## Decision 2: Phase/Pack Code Mapping

**Holt Phases** (from OptionPhase column):
- Uses 2-digit phase codes: 10, 11, 18-21, 25, 40, 83
- Phase 10 = Elevations, Phase 11 = Siding add-ons, Phase 40 = Windows, Phase 83 = Doors & Trim
- Cost codes are separate: 4085, 4086, 4120, 4140, 4142, 4150, 4155, 4320

**Richmond Packs** (from PackID column):
- Uses |10, |11, |12, |20, |22, |30, |34, |40, |42, etc.
- Has 312 pack variations including options

**Question:** How should these map to unified phase codes?

| Richmond Pack | Holt Phase | Description |
|---------------|------------|-------------|
| \|10 Foundation | 10 Elevations | Base house options |
| \|20 Main Walls | 11 Siding | Siding add-ons |
| \|30 2nd Floor | 20 Structural | Structural options |
| \|40 Roof | 83 Doors/Trim | Doors & trim |

**Note:** Holt and Richmond phases don't directly align - they use different categorization systems.

---

## Decision 3: Option-Specific Pack Handling

The `richmond_problem_codes.csv` contains 90 option-specific packs with suffixes:

**Suffix Types:**
- `.tc` = Tall Crawl
- `.2x/.4x/.5x` = Garage extensions (2'/4'/5')
- `.lo/.nl` = Loft/No Loft variants
- `.rf` = ReadyFrame
- `.sr` = Sunroom
- `.xc/.xp` = Extended covered patio
- `.pw/.1p/.2p/.3p` = Post wraps

**Question:** How should option suffixes map to unified codes?

Options:
- [ ] **Decimal extension:** `010.900` for tall crawl, `012.040` for 4' garage ext
- [ ] **Separate code range:** 900-999 for all options
- [ ] **Flag in elevation field:** Keep base phase, note option elsewhere
- [ ] **Lookup table:** Map each option to its base pack code

---

## Decision 4: Elevation Code Handling

**Current patterns:**

| Source | Elevations | Code |
|--------|------------|------|
| Holt | Single digit in code (1=A, 2=B, etc.) | Extract from position |
| Richmond | Letters in PackID (\|10ABCD) | Parse from string |
| Options | Sometimes `**` for all elevations | Universal marker |

**Question:** Should elevation codes be:
- [ ] Always letters (A, B, C, D, AB, ABCD)
- [ ] Allow `**` or `00` for "all elevations"
- [ ] Numeric (01, 02, 03, 04)

---

## Decision 5: Item Type Codes

**Holt Cost Codes (8 total - CORRECTED):**
- 4085 = Lumber
- 4086 = Lumber - Barge Credit
- 4120 = Trusses
- 4140 = Window Supply
- 4142 = Window Supply - U-22 Triple Pane (WA)
- 4150 = Exterior Door Supply
- 4155 = Siding Supply
- 4320 = Interior Trim Supply - Millwork

**Richmond Item Types:**
- 1000 = Framing
- 1100 = Siding
- (others TBD)

**Question:** Which item type numbering to use?
- [ ] Keep Holt's 4-digit cost codes (4085, 4086, 4120, etc.)
- [ ] Use simpler categories (1000, 2000, 3000)
- [ ] Create new unified item type codes

---

## Decision 6: Cross-Reference Table Structure

**Question:** What should the lookup tables contain?

**Option A - Simple mapping:**
```
Richmond_Pack → Unified_Phase
Holt_Phase → Unified_Phase
```

**Option B - Full detail:**
```
Source_Code → Unified_Phase, Phase_Name, Shipping_Order, Item_Type
```

**Option C - With options:**
```
Source_Code + Option_Code → Unified_Phase, Elevation, Item_Type
```

---

## Immediate Action Items

1. [ ] Review Richmond CODE LEGEND sheet for existing definitions
2. [ ] Compare Holt and Richmond phase sequences (do they align?)
3. [ ] Decide on option suffix handling strategy
4. [ ] Choose unified format for both systems
5. [ ] Update cross-reference workbook with correct mappings

---

## Files to Reference

- `BAT Files/IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm` - Holt source data
- `BAT Files/IMPROVED_RICHMOND_BAT_NOVEMBER_2025.xlsm` - Richmond source data
- `docs/Migration Strategy/bat_coding_system_builder/richmond_problem_codes.csv` - Option codes
- `BAT Files/HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx` - Current (incorrect) mappings

---

## Notes

_Use this space for your decisions and notes:_

```
Decision 1 (Format):

Decision 2 (Phase Mapping):

Decision 3 (Options):

Decision 4 (Elevations):

Decision 5 (Item Types):

Decision 6 (Table Structure):
```

---

*Created: November 2025*
*Status: Awaiting decisions before proceeding with integration*
