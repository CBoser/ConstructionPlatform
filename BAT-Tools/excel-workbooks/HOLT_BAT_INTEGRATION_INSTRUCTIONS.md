# Holt BAT Integration Instructions
**Date:** November 17, 2025
**Updated:** November 18, 2025
**Purpose:** Add unified code column to Holt BAT using cross-reference system

---

## Prerequisites

✅ You have: `HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx`
✅ You have: `HOLT_BAT_VBA_MODULE.bas`
✅ You're working with: `IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm`

---

## Step 1: Import Cross-Reference Sheets

### Option A: Copy Sheets Directly (Recommended)
1. Open both workbooks:
   - `HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx`
   - `IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm`

2. In the Cross-Reference workbook, right-click each sheet tab:
   - `Usage_Guide`
   - `Holt_Activity`
   - `Holt_Phase`
   - `Richmond_Pack`
   - `Plan_Master`

3. Select "Move or Copy..."

4. Choose:
   - **To book:** IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm
   - **Before sheet:** (move to end)
   - ☑ **Create a copy**

5. Click OK

6. Repeat for all 5 sheets

### Option B: Link to External Workbook
If you prefer to keep the cross-reference separate:
1. Keep `HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx` in the same folder
2. Reference it in formulas as: `'[HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx]Holt_Activity'!$A:$B`

---

## Step 2: Import VBA Module

1. In the Holt BAT workbook, press **Alt+F11** (opens VBA Editor)

2. In VBA Editor:
   - **File** → **Import File...**
   - Navigate to: `HOLT_BAT_VBA_MODULE.bas`
   - Click **Open**

3. You should see "UnifiedCodeGenerator" module appear in the Project Explorer

4. **Test the module:**
   - Press F5 or click Run
   - Select `TestUnifiedCodeGeneration`
   - Check the Immediate Window (Ctrl+G) for test results

5. Close VBA Editor

---

## Step 3: Add Unified Code Column

### A. Go to the indexMaterialListsbyPlan Sheet
1. Click on the `indexMaterialListsbyPlan` tab
2. This sheet has 9,374 rows of material data

### B. Insert New Column
1. Click on **Column E** header (to insert before Column E)
2. Right-click → **Insert**
3. A new blank column appears

### C. Add Column Header
1. In cell **E1**, type: `UnifiedCode`
2. Format to match other headers (bold, centered)

### D. Add Formula in E2

**If using VBA function:**
```excel
=IF(ROW()=1,"UnifiedCode",IF(A2="","",BuildUnifiedCode(A2,C2,D2)))
```

**If using Excel formulas only (without VBA):**

This is more complex. Here's a formula-only approach:

```excel
=IF(A2="","",
  LEFT(A2,FIND("_",A2&"_",6)-1) & "-" &
  IF(LEN(C2)>0,
    MID(TRIM(LEFT(SUBSTITUTE(C2,","," "),20)),6,3) & ".000",
    TEXT(VALUE(MID(D2,2,2)),"000") & ".000"
  ) & "-" &
  IF(LEN(C2)>0,
    CHOOSE(VALUE(MID(TRIM(LEFT(SUBSTITUTE(C2,","," "),20)),5,1))+1,"**","A","B","C","D"),
    SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(TRIM(MID(D2,FIND("|",D2)+1,10)),"A",""),"B",""),"C",""),"D","")
  ) & "-" &
  VLOOKUP(
    IF(LEN(C2)>0,
      TRIM(RIGHT(SUBSTITUTE(LEFT(C2,FIND(",",C2&",") -1)," - ","~"),LEN(C2)-LEN(SUBSTITUTE(C2," - ","")))),
      "1000"
    ),
    Holt_Activity!$A:$B,
    2,
    FALSE
  )
)
```

**Recommended:** Use the VBA function - it's much cleaner!

### E. Copy Formula Down
1. Select cell **E2**
2. Copy (Ctrl+C)
3. Select range **E3:E9375** (all rows with data)
4. Paste (Ctrl+V)

**Warning:** This will take a moment to calculate 9,374 formulas!

---

## Step 4: Verify Results

### Sample Validation
Check these rows manually:

**Row 2 (Holt Material):**
- PlanTable: `plan_1670ABCD_CR`
- OptionPhase: `167010100 - 4085 , 167010200 - 4085 , ...`
- Holt Code Breakdown:
  - `167010100 - 4085` = Plan 1670, Phase 10, Item_No 100 (Elev A Base), Cost 4085 (Lumber)
  - `167010200 - 4085` = Plan 1670, Phase 10, Item_No 200 (Elev B Base), Cost 4085 (Lumber)
- Expected UnifiedCode: Format TBD based on unified system decisions

**Row with Richmond Material:**
- PlanTable: (varies)
- PackID: `|10ABCD FOUNDATION`
- Expected UnifiedCode: `XXXX-010.000-ABCD-1000` (XXXX = plan number)

**Note:** Holt code format is `{Plan 4}{Phase 2}{ItemNo 3} - {CostCode}`
- Item_No first digit = elevation (1=A, 2=B, 3=C, 4=D, 5=Corner, 6=Rear)
- Holt Cost Codes: 4085, 4086, 4120, 4140, 4142, 4150, 4155, 4320

### Check for Errors
1. Filter Column E for cells containing "ERROR"
2. Investigate any errors:
   - Missing lookups?
   - Malformed codes?
   - Update mappings in cross-reference sheets if needed

### Statistics
Run this in a blank cell to count successful codes:
```excel
=COUNTIF(E:E,"<>ERROR*")-1
```
Should return: ~9,373 (total materials minus header)

---

## Step 5: Create Named Range (Optional but Recommended)

1. Select the **E** column (click column header)
2. In the Name Box (left of formula bar), type: `UnifiedCodes`
3. Press Enter

This makes it easier to reference in other formulas.

---

## Step 6: Add to Existing Formulas (Optional)

If you want pricing or other lookups to use unified codes:

### Example: Lookup Price by Unified Code
```excel
=IFERROR(
  VLOOKUP(E2, UnifiedPriceData!$A:$C, 3, FALSE),
  VLOOKUP(F2, OriginalPriceData!$A:$C, 3, FALSE)
)
```

This tries unified code first, falls back to original SKU.

---

## Step 7: Test Material Extraction

### Export Test
1. Create a new sheet: "Test_Export"
2. Copy columns A through E (including new UnifiedCode column)
3. Paste values only
4. Sort by UnifiedCode
5. Verify codes are properly formatted

### Sample Export Format
```
PlanTable | ItemID | OptionPhase | PackID | UnifiedCode
plan_1670ABCD_CR | 24DF | 167010100 - 4085 , ... | |10ABCD... | 1670-010.000-ABCD-1000
```

---

## Step 8: Save and Backup

1. **Save As** a new copy:
   - `IMPROVED_HOLT_BAT_WITH_UNIFIED_CODES_INTEGRATED.xlsm`

2. Keep original as backup:
   - Move `IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm` to Archive folder

3. Test the new version thoroughly before replacing production file

---

## Troubleshooting

### "BuildUnifiedCode" function not found
- **Solution:** VBA module not imported. Repeat Step 2.

### #VALUE! errors in column E
- **Solution:** Check that cross-reference sheets are imported (Holt_Activity, etc.)

### Slow calculation
- **Solution:** Set calculation to Manual temporarily:
  - **Formulas** tab → **Calculation Options** → **Manual**
  - Calculate when needed: F9

### Wrong phase codes
- **Solution:** Update mappings in `Holt_Phase` or `Richmond_Pack` sheets

### Missing elevations
- **Solution:** Check elevation parsing in VBA function or review source data

---

## Next Steps After Integration

1. **Validate all 9,374 codes** - Check for errors
2. **Update pricing formulas** - Use unified codes where beneficial
3. **Create dual exports** - Both Holt format and unified format
4. **Document changes** - Update user guides
5. **Train users** - Show how to use new unified codes

---

## Formula-Only Alternative (No VBA)

If you can't use VBA, here's a simpler formula approach:

### Column E: Plan Code
```excel
=IF(A2="","",VALUE(MID(A2,FIND("_",A2)+1,4)))
```

### Column F: Phase Code (from Holt)
```excel
=IF(C2="","",MID(TRIM(LEFT(SUBSTITUTE(C2,","," "),25)),6,3) & ".000")
```

### Column G: Elevation Code
```excel
=IF(C2="","",CHOOSE(VALUE(MID(TRIM(LEFT(SUBSTITUTE(C2,","," "),25)),5,1))+1,"**","A","B","C","D"))
```

### Column H: Item Type
```excel
=VLOOKUP(TRIM(RIGHT(SUBSTITUTE(LEFT(C2,FIND(",",C2&",")-1)," - ","~"),20)),Holt_Activity!$A:$B,2,FALSE)
```

### Column I: Unified Code (combine)
```excel
=E2 & "-" & F2 & "-" & G2 & "-" & H2
```

Then copy Column I to Column E (paste values) and delete helper columns F-I.

---

## Support

If you encounter issues:
1. Check `docs/sessions/HOLT_BAT_INTEGRATION_PLAN.md` for detailed background
2. Review test results from VBA module
3. Validate cross-reference mappings
4. Check source data format (OptionPhase and PackID columns)

---

**Integration Status:** Ready to implement
**Estimated Time:** 30-45 minutes
**Difficulty:** Moderate (requires Excel knowledge)

**Good luck! The system is designed to be robust and handle all your materials.**
