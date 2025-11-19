# Customer Database Import - Quick Reference

## Overview

The BAT system now supports importing materials from any customer database (Richmond, Holt, or custom) with **human-in-the-loop review** before final approval.

## Launch Import Wizard

From main menu: **Option 13 - Import Customer Database (with review)**

## 7-Step Import Process

### Step 1: Select Source File
```
Supported formats: Excel (.xlsx, .xlsm), CSV (.csv)

Enter file path: /path/to/customer_materials.xlsx
```

**Examples:**
- Richmond: `Richmond_Plan_G603.xlsx`
- Holt: `HOLT_BAT_OCTOBER_2025.xlsm`
- Custom: `Customer_Materials.csv`

### Step 2: Identify Customer System
```
1. Richmond American Homes (uses |XX.XX pack format)
2. Holt Homes (uses Activity XX format)
3. Other (custom mapping)

Select customer type [1-3]: 1
```

This helps the system understand the source format.

### Step 3: Load and Preview Data
```
✓ Loaded 1,234 rows

Columns found: Plan, Pack_ID, Elevation, SKU, Description, QTY, Unit, Type

First 5 rows:
  Plan  Pack_ID  Elevation  SKU            Description           QTY  Unit  Type
  G603  |10.00              2616HF3TICAG   2x6x16 Hem Fir #3     24   EA    Framing
  G603  |10.82   B, C, D    2616HF3TICAG   2x6x16 Hem Fir #3     16   EA    Framing
  ...
```

Review the data to ensure it loaded correctly.

### Step 4: Map Columns
```
Enter the column name for each field:

  Plan code column: Plan
  Pack/Activity ID column: Pack_ID
  Elevation column: Elevation
  Vendor SKU column: SKU
  Description column: Description
  Quantity column: QTY
  Unit column: Unit
  Item type column: Type
```

**Required fields:** Plan code, Pack ID, SKU, Description, Quantity

**Optional fields:** Elevation, Unit, Item type (defaults to "Framing")

### Step 5: Process Sample Translations

The system processes the **first 10 rows** and shows you the results:

```
SAMPLE TRANSLATIONS:
────────────────────────────────────────────────────────────────────
Row   Customer Code        Unified Code              SKU             Qty
────────────────────────────────────────────────────────────────────
0     |10.00 +              G603-010.000-**-1000      2616HF3TICAG    24.0 EA
1     |10.82 + B, C, D      G603-010.820-BCD-1000     2616HF3TICAG    16.0 EA
2     |11.00 +              G603-011.000-**-1000      12TJI110        16.0 EA
3     |12.40 + A, B, C      G603-012.040-ABC-1000     2410HF2TICAG    48.0 EA
...

Sample Results:
  Successful: 9/10 (90.0%)
  Errors:     1/10
```

**If errors occur:**
```
ERRORS IN SAMPLE:
────────────────────────────────────────────────────────────────────
Row 5: No translation found for |99.99 with type Framing
```

### Step 6: Review and Decide

Based on the sample results, you have options:

```
Sample Results:
  Successful: 9/10 (90.0%)
  Errors:     1/10

Options:
  [C] Continue with full import        ← Proceed if satisfied
  [A] Adjust column mappings          ← Fix column names
  [E] Export errors to review         ← Save errors to CSV
  [Q] Quit without importing          ← Cancel

Enter choice:
```

**Recommendations:**
- **90%+ success:** Continue with full import
- **50-90% success:** Review errors, consider continuing
- **<50% success:** Adjust mappings or check translation table

### Step 7: Full Import (if approved)

If you choose to continue:

```
Import ALL 1,234 rows? Type 'IMPORT' to confirm: IMPORT

Processing 1,234 rows...
  Processed 100 rows...
  Processed 200 rows...
  Processed 300 rows...
  ...
  Processed 1,200 rows...

════════════════════════════════════════════════════════════════════
IMPORT COMPLETE
════════════════════════════════════════════════════════════════════
  Successfully imported: 1,189
  Failed:                45
  Success rate:          96.4%

  Errors exported to: import_errors_20251114_143000.csv

✓ Import complete! Added 1,189 materials to database.
```

---

## Key Features

### ✅ **Human Review Before Import**
- See sample translations first (10 rows)
- Review success rate
- Identify errors before committing
- Make informed decision

### ✅ **Flexible Column Mapping**
- Works with any spreadsheet format
- Map your column names to unified fields
- Optional fields (elevation, unit)
- Defaults for missing data

### ✅ **Multi-Customer Support**
```
Richmond Examples:
  Plan: G603, 1670, LE93
  Pack: |10.82, |12.4x, |20.00
  Elevation: "B, C, D" or blank

Holt Examples:
  Plan: 153e, 156i
  Activity: Activity 10, Activity 20
  Community: "Arbor Creek" or blank

Custom Examples:
  Your own format - system will attempt translation
```

### ✅ **Error Handling**
- Errors don't stop import
- Failed rows exported to CSV
- Review and fix later
- Re-import corrected rows

### ✅ **Progress Tracking**
- Real-time progress updates
- Shows every 100 rows
- Final success/failure count
- Time to completion

### ✅ **Traceability**
- Original customer pack ID preserved
- Import source file name recorded
- Customer system identified
- Timestamp in notes

---

## Common Scenarios

### Scenario 1: Richmond Excel File
```
File: Richmond_Plan_G603.xlsx
Customer Type: 1 (Richmond)

Column Mapping:
  Plan code: Plan
  Pack ID: Pack ID / Elevation(s) / Pack-Option Name
  Elevation: Elevation Letter Combined
  SKU: Sku
  Description: Description
  Quantity: QTY
  Unit: (blank - will default to EA)
  Item Type: Type

Result: 95% success rate, import approved
```

### Scenario 2: Holt XLSM File
```
File: HOLT_BAT_OCTOBER_2025.xlsm
Customer Type: 2 (Holt)
Sheet: Materials (specify sheet name)

Column Mapping:
  Plan code: Plan
  Pack ID: Activity
  Elevation: Community
  SKU: Item_Code
  Description: Description
  Quantity: Quantity
  Unit: Unit
  Item Type: Category

Result: 88% success rate, export errors for review
```

### Scenario 3: Custom CSV File
```
File: custom_materials.csv
Customer Type: 3 (Custom)

Column Mapping:
  Plan code: PlanNumber
  Pack ID: PhaseCode
  SKU: MaterialSKU
  Description: ItemDescription
  Quantity: Qty
  Item Type: MaterialType

Result: 65% success rate, adjust mappings
```

---

## Decision Matrix

| Success Rate | Action | Recommendation |
|--------------|--------|----------------|
| 95-100% | Continue | Excellent - proceed |
| 80-94% | Continue or Review | Good - check errors |
| 50-79% | Export & Review | Review translation table |
| <50% | Adjust Mappings | Check column names |

---

## Error Types and Solutions

### Error: "No translation found for..."
**Cause:** Pack ID not in translation table  
**Solution:** Add pack to `coding_schema_translation_v2.csv` or adjust pack ID format

### Error: "Column not found"
**Cause:** Column name doesn't match spreadsheet  
**Solution:** Check exact column name (case-sensitive), restart and adjust mapping

### Error: "Invalid data type"
**Cause:** Non-numeric quantity or missing required field  
**Solution:** Clean source data, ensure required fields have values

### Error: "Foreign key constraint"
**Cause:** Plan doesn't exist in database  
**Solution:** Add plan first (Main Menu → 11)

---

## Best Practices

### Before Import
1. ✅ **Backup database** (Main Menu → 17)
2. ✅ **Review source file** - ensure data is clean
3. ✅ **Check translation table** - verify all pack IDs exist
4. ✅ **Add plans first** - ensure all plan codes exist in database

### During Import
1. ✅ **Review sample carefully** - check translations make sense
2. ✅ **Export errors** - if success rate < 90%
3. ✅ **Take notes** - document any issues
4. ✅ **Don't rush** - review before confirming

### After Import
1. ✅ **Validate database** (Main Menu → 15)
2. ✅ **Review errors CSV** - fix and re-import failed rows
3. ✅ **Export report** (Main Menu → 16) - verify results
4. ✅ **Backup again** - save successful import

---

## Sample Import Session

```
═══════════════════════════════════════════════════════════════════════
  IMPORT CUSTOMER DATABASE
═══════════════════════════════════════════════════════════════════════

Step 1: Select source file
────────────────────────────────────────────────────────────────────
Enter file path: Richmond_G603.xlsx

Step 2: Identify customer system
────────────────────────────────────────────────────────────────────
Select customer type [1-3]: 1

Step 3: Load and preview data
────────────────────────────────────────────────────────────────────
✓ Loaded 567 rows

Step 4: Map columns
────────────────────────────────────────────────────────────────────
  Plan code column: Plan
  Pack ID column: Pack_ID
  [etc...]

Step 5: Process sample
────────────────────────────────────────────────────────────────────
SAMPLE TRANSLATIONS:
  Row 0: |10.00 → G603-010.000-**-1000 ✓
  Row 1: |10.82 + B,C,D → G603-010.820-BCD-1000 ✓
  [etc...]

Sample Results:
  Successful: 10/10 (100.0%)
  Errors:     0/10

Step 6: Review and decide
────────────────────────────────────────────────────────────────────
Options: [C] Continue, [A] Adjust, [E] Export errors, [Q] Quit
Enter choice: C

Step 7: Full import
────────────────────────────────────────────────────────────────────
Import ALL 567 rows? Type 'IMPORT': IMPORT

Processing 567 rows...
  Processed 100 rows...
  Processed 200 rows...
  [etc...]

════════════════════════════════════════════════════════════════════
IMPORT COMPLETE
════════════════════════════════════════════════════════════════════
  Successfully imported: 567
  Failed:                0
  Success rate:          100.0%

✓ Import complete! Added 567 materials to database.
```

---

## Quick Commands

```
From Main Menu:
  13 → Import Customer Database

During Import:
  q  → Quit at file selection
  C  → Continue with full import (after review)
  A  → Adjust column mappings
  E  → Export errors to CSV
  Q  → Quit without importing

Type to Confirm:
  IMPORT → Confirm full import
```

---

## Tips for Success

1. **Start with small file** - Test with 100 rows first
2. **Know your columns** - Have spreadsheet open for reference
3. **Review translation table** - Ensure all pack IDs are mapped
4. **Watch the sample** - It predicts full import success
5. **Export errors early** - Don't wait for full import to fail
6. **Document mappings** - Save column names for next import
7. **Backup frequently** - Before and after imports

---

## Support Files

After import, check these files:
- `import_errors_YYYYMMDD_HHMMSS.csv` - Failed rows
- `bat_unified.db` - Updated database
- Main Menu → 14 - See new statistics
- Main Menu → 15 - Validate integrity

---

**Ready to import your customer database?**

```bash
python interactive_menu.py
# Select option 13
```

Human-in-the-loop ensures you're in control every step of the way! 🎯
