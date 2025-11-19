# TABLE INVENTORY TEMPLATE
**For use during Week 1-2 when mapping and renaming tables**

---

## HOW TO USE THIS TEMPLATE

1. **Week 1, Day 5:** After coding standards are finalized, copy this template
2. **Week 2, Day 1:** Fill in the inventory for Richmond BAT
3. **Week 2, Day 2:** Fill in the inventory for Holt BAT
4. **Week 3:** Use this as your rename checklist

---

## NAMING CONVENTION REFERENCE

```
Format: tableType_planNumber_community_elevation

Table Types:
├─ bidtotals      : Quote summary tables
├─ materialist    : Material takeoff tables
├─ pricing        : Item pricing tables
├─ options        : Option pricing tables
├─ schedule       : Master schedule tables
└─ reference      : Lookup/reference tables

Examples:
├─ bidtotals_1649_GG_A
├─ materialist_1555_CR_B
├─ options_1632_HH_CD
├─ pricing_1547_WR_base
└─ schedule_PriceSchedule
```

---

## RICHMOND BAT - TABLE INVENTORY

### INSTRUCTIONS:
For each sheet with tables:
1. Note the sheet name
2. Identify any named tables/ranges
3. Determine table type
4. Propose new name following convention
5. Check off when renamed

---

### FORMAT (Copy this for each sheet):

```
Sheet: [SHEET_NAME]
Current Table Names: [list them]
Table Type: [bidtotals/materialist/pricing/options/schedule/reference]
Plan Number: [if applicable]
Community: [if applicable - Holt only]
Elevation: [if applicable]
Proposed New Name: [following convention]
Renamed? [ ]
Formulas Validated? [ ]
Notes: [any special considerations]
```

---

### EXAMPLE ENTRIES:

```
Sheet: 1649A PTO GG
Current Table Names: Table1, Table2, MaterialListTable
Table Type: bidtotals (Table1), materialist (MaterialListTable)
Plan Number: 1649
Community: GG (Golden Grove)
Elevation: A
Proposed New Names:
  - Table1 → bidtotals_1649_GG_A
  - MaterialListTable → materialist_1649_GG_A
Renamed? [X]
Formulas Validated? [X]
Notes: Two main tables on this sheet
```

```
Sheet: G603
Current Table Names: None visible (check for named ranges)
Table Type: N/A or needs investigation
Plan Number: 603 (non-standard, need to map)
Community: N/A (Richmond doesn't use communities)
Elevation: Unknown
Proposed New Names: TBD after investigation
Renamed? [ ]
Formulas Validated? [ ]
Notes: Check if G603 maps to standard plan number
```

---

### RICHMOND SHEETS TO INVENTORY:

Copy the format above for each of these:

**Plan Sheets (11 total):**
- [ ] 1520 END
- [ ] 1520 MID
- [ ] 1649A PTO GG
- [ ] 1890ABD CR
- [ ] G603
- [ ] G914
- [ ] IWP S4S
- [ ] LE93 G603B
- [ ] LE94 G603A
- [ ] LE95 G914A
- [ ] LE96 G603B

**Reference/Index Sheets:**
- [ ] Plan Index
- [ ] Plan Index Query
- [ ] indexMaterialListsbyPlan
- [ ] reference_Subdivisions

**Pricing Sheets:**
- [ ] PRICING UPDATE
- [ ] CINCH PRICING
- [ ] Customer Price Levels
- [ ] PRICING TAB

**Utility Sheets:**
- [ ] CONV
- [ ] DART
- [ ] Dev Page
- [ ] ItemNoDict
- [ ] Lumber Conversion Sheet
- [ ] [others as discovered]

---

## HOLT BAT - TABLE INVENTORY

### HOLT SHEETS TO INVENTORY:

**Plan Sheets (54 total) - Sample 10 here, add rest as you go:**
- [ ] 1547 (153e)
- [ ] 1555 (156e)
- [ ] 1559 (159e)
- [ ] 1626 (162i)
- [ ] 1632CD HH
- [ ] 1633BCD WR
- [ ] 1649 margin
- [ ] 1649ABC GG
- [ ] 1649ABC HA
- [ ] 1649ABC WR
- [ ] [continue for all 54...]

**Reference/Index Sheets:**
- [ ] Plan Index
- [ ] Plan Index Query
- [ ] indexMaterialListsbyPlan
- [ ] reference_Subdivisions
- [ ] schedule_PriceSchedule

**Pricing Sheets:**
- [ ] PRICING UPDATE
- [ ] CINCH PRICING
- [ ] Customer Price Levels
- [ ] HH Harmony Pricing
- [ ] WR1B Price Index
- [ ] OLD PRICING TAB
- [ ] PRICING TAB

**Community-Specific Sheets:**
- [ ] 106 Golden Grove Lumber
- [ ] 106 Golden Grove Siding
- [ ] 107 Harmony Heights Lumber
- [ ] 107 Harmony Heights Siding
- [ ] 110 Willow Ridge Attach Lumber
- [ ] 110 Willow Ridge Attach Siding
- [ ] 111 Coyote Ridge Lumber
- [ ] 111 Coyote Ridge Siding
- [ ] 98 Willow Ridge Lumber
- [ ] 98 Willow Ridge Siding
- [ ] [others...]

---

## SPECIAL CASES TO HANDLE

### 1. No Standard Plan Number
```
Sheet: G603
Issue: Non-standard numbering (G prefix)
Solution: Map to standard plan number OR create reference
Proposed: Create mapping sheet that shows G603 = Plan [????]
```

### 2. Multiple Tables on One Sheet
```
Sheet: 1649A PTO GG
Issue: Has both bidtotals and materialist
Solution: Name each table distinctly
Proposed:
  - bidtotals_1649_GG_A
  - materialist_1649_GG_A
```

### 3. Multi-Elevation Sheets
```
Sheet: 1632CD HH
Issue: Covers elevations C and D
Solution: Use combined elevation in name
Proposed: bidtotals_1632_HH_CD
```

### 4. Community-Specific Utility Sheets
```
Sheet: 106 Golden Grove Lumber
Issue: Not a plan sheet, but community-specific
Solution: Use reference prefix
Proposed: reference_GG_106_Lumber
```

### 5. Master Schedules
```
Sheet: schedule_PriceSchedule
Issue: Not plan-specific
Solution: Keep descriptive name with schedule prefix
Proposed: schedule_PriceSchedule (no change)
```

### 6. Backup Sheets
```
Sheet: Plan Index Backup 0902-144151
Issue: Backup/archive sheet
Solution: Prefix with "archive_" and keep timestamp
Proposed: archive_PlanIndex_0902_144151
```

---

## PROGRESS TRACKING

### Richmond BAT:
```
Total Sheets: 38
├─ Plan Sheets: 11        [ ] Inventoried  [ ] Renamed
├─ Pricing Sheets: 4      [ ] Inventoried  [ ] Renamed
├─ Index Sheets: 4        [ ] Inventoried  [ ] Renamed
└─ Utility Sheets: 19     [ ] Inventoried  [ ] Renamed

Estimated Time:
├─ Inventory: 2 hours
├─ Rename: 3 hours
└─ Validate: 2 hours
Total: ~7 hours
```

### Holt BAT:
```
Total Sheets: 103
├─ Plan Sheets: 54        [ ] Inventoried  [ ] Renamed
├─ Pricing Sheets: 7      [ ] Inventoried  [ ] Renamed
├─ Index Sheets: 8        [ ] Inventoried  [ ] Renamed
├─ Community Sheets: 10   [ ] Inventoried  [ ] Renamed
└─ Utility Sheets: 24     [ ] Inventoried  [ ] Renamed

Estimated Time:
├─ Inventory: 4 hours
├─ Rename: 6 hours
└─ Validate: 4 hours
Total: ~14 hours
```

---

## VALIDATION CHECKLIST

After renaming, verify for EACH sheet:

- [ ] All formulas still work (no #REF errors)
- [ ] Named ranges updated (if used in formulas)
- [ ] VBA code references updated (if any)
- [ ] Plan Index links still work
- [ ] Material List Index still references correctly
- [ ] Pricing lookups still function
- [ ] No duplicate table names
- [ ] New names follow convention

**Test Method:**
1. Open sheet
2. Press Ctrl+~ to show formulas
3. Look for any #REF errors
4. Press F9 to recalculate
5. Verify values match expected

---

## RENAME AUTOMATION SCRIPT

### VBA Macro Starter Code:

```vba
Sub RenameTablesFromInventory()
    '
    ' This macro reads the table inventory and renames tables accordingly
    ' Use with caution - backup file first!
    '
    Dim ws As Worksheet
    Dim inventoryWS As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim sheetName As String
    Dim oldName As String
    Dim newName As String
    
    ' Set reference to inventory sheet (adjust name as needed)
    Set inventoryWS = ThisWorkbook.Sheets("Table_Inventory")
    
    ' Find last row in inventory
    lastRow = inventoryWS.Cells(inventoryWS.Rows.Count, "A").End(xlUp).Row
    
    ' Loop through each inventory entry
    For i = 2 To lastRow ' Assuming row 1 is headers
        sheetName = inventoryWS.Cells(i, 1).Value ' Column A: Sheet Name
        oldName = inventoryWS.Cells(i, 2).Value   ' Column B: Old Table Name
        newName = inventoryWS.Cells(i, 3).Value   ' Column C: New Table Name
        
        ' Skip if any value is empty
        If sheetName = "" Or oldName = "" Or newName = "" Then
            GoTo NextIteration
        End If
        
        ' Try to rename
        On Error Resume Next
        Set ws = ThisWorkbook.Sheets(sheetName)
        If Not ws Is Nothing Then
            ' Check if it's a table object
            If ws.ListObjects.Count > 0 Then
                Dim tbl As ListObject
                For Each tbl In ws.ListObjects
                    If tbl.Name = oldName Then
                        tbl.Name = newName
                        inventoryWS.Cells(i, 4).Value = "SUCCESS"
                        Exit For
                    End If
                Next tbl
            End If
            
            ' Check if it's a named range
            If ThisWorkbook.Names.Count > 0 Then
                Dim nm As Name
                For Each nm In ThisWorkbook.Names
                    If nm.Name = oldName Then
                        nm.Name = newName
                        inventoryWS.Cells(i, 4).Value = "SUCCESS"
                        Exit For
                    End If
                Next nm
            End If
        Else
            inventoryWS.Cells(i, 4).Value = "SHEET NOT FOUND"
        End If
        On Error GoTo 0
        
NextIteration:
    Next i
    
    MsgBox "Rename process complete! Check Column D for results.", vbInformation
    
End Sub
```

**To Use:**
1. Create "Table_Inventory" sheet with columns: Sheet Name | Old Name | New Name | Status
2. Fill in your inventory
3. Run macro
4. Check Status column for results

---

## NOTES & TIPS

**Before You Start:**
- [ ] Backup both BAT files
- [ ] Save backups with date (e.g., Richmond_BAT_Backup_2025_11_15.xlsm)
- [ ] Test rename process on ONE sheet first
- [ ] Keep inventory file open while renaming

**During Renaming:**
- Rename in batches (10 sheets at a time)
- Validate each batch before continuing
- Keep notes on any issues encountered
- Take breaks to avoid mistakes

**After Renaming:**
- Test all major functions (pricing lookups, material lists, quotes)
- Have William test Richmond BAT
- Have Alicia test Holt BAT
- Document any broken links and fix immediately

**Common Issues:**
- Named ranges vs table objects (handle differently)
- VBA code may reference old names (search VBA for old names)
- External links may break (shouldn't apply here)
- Array formulas may need extra care

---

## EXAMPLE COMPLETED INVENTORY ENTRY

```
═══════════════════════════════════════════════════════════
Sheet: 1649ABC GG
═══════════════════════════════════════════════════════════

Current Table Names:
├─ Table1 (named range)
├─ MaterialList (table object)
└─ PricingTable (table object)

Table Types:
├─ Table1 → bidtotals
├─ MaterialList → materialist
└─ PricingTable → pricing

Plan Information:
├─ Plan Number: 1649
├─ Community: GG (Golden Grove)
└─ Elevations: A, B, C

Proposed New Names:
├─ Table1 → bidtotals_1649_GG_ABC
├─ MaterialList → materialist_1649_GG_ABC
└─ PricingTable → pricing_1649_GG_ABC

Renamed? [X] Yes - Completed 11/20/2025
Formulas Validated? [X] Yes - All working
VBA References? [ ] None found

Notes:
- Had to update 3 formulas on the "Plan Index" sheet
- Material List Index auto-updated correctly
- No issues with pricing lookups

Updated By: Corey
Date: November 20, 2025
═══════════════════════════════════════════════════════════
```

---

## FINAL DELIVERABLE

When complete, you should have:
- [ ] Inventory spreadsheet with all sheets documented
- [ ] All tables renamed following convention
- [ ] Validation completed for all renames
- [ ] Any issues documented and resolved
- [ ] Team tested both BATs
- [ ] Rename VBA macro saved for future use

**This inventory becomes a reference document for:**
- Future plan additions (follow same naming)
- Training new team members
- Troubleshooting formula issues
- Database integration (know all table names)

---

## READY TO START?

**Week 2, Day 1 (November 18):**
1. Duplicate this template
2. Open Richmond BAT
3. Start documenting sheet by sheet
4. Allow 2-4 hours
5. Tomorrow: Do the same for Holt

**Week 3, Day 1-2 (November 25-26):**
1. Finalize inventory
2. Run rename automation
3. Validate all changes
4. Get team to test

**You've got this!** 🎯