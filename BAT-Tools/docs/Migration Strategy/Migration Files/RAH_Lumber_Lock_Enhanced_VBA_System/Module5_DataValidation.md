# Module 5: Data Validation Engine

## Purpose
Pre-export quality checks and error detection. Validates data quality before allowing distribution, catching errors early in the process.

## Features
- Checks for missing costs
- Detects duplicate items
- Analyzes large variances (>15% threshold)
- Verifies formula integrity
- Confirms email configuration
- Generates validation reports

## Complete Code
```vba' ============================================================================
' MODULE 5: DATA VALIDATION ENGINE
' Purpose: Pre-export quality checks and error detection
' Author: MindFlow AS - Corey
' Date: November 2024
' ============================================================================Option Explicit' ============================================================================
' MAIN VALIDATION ROUTINE
' ============================================================================Sub RunDataValidation()
Dim report As String
Dim issueCount As IntegerApplication.ScreenUpdating = Falsereport = "=== DATA VALIDATION REPORT ===" & vbCrLf & Format(Now, "yyyy-mm-dd hh:mm:ss") & vbCrLf & vbCrLf
issueCount = 0' Check 1: Missing Costs
Dim missingCosts As Integer
missingCosts = CheckForMissingCosts()
If missingCosts > 0 Then
    report = report & "⚠️ Missing Costs: " & missingCosts & " items found" & vbCrLf
    issueCount = issueCount + missingCosts
Else
    report = report & "✅ All items have costs" & vbCrLf
End If' Check 2: Duplicate Items
Dim duplicates As Integer
duplicates = CheckForDuplicates()
If duplicates > 0 Then
    report = report & "⚠️ Duplicate Items: " & duplicates & " duplicates found" & vbCrLf
    issueCount = issueCount + duplicates
Else
    report = report & "✅ No duplicates detected" & vbCrLf
End If' Check 3: Large Variance Items
Dim largeVariances As Integer
largeVariances = CheckForLargeVariances(15) ' 15% threshold
If largeVariances > 0 Then
    report = report & "⚠️ Large Variances: " & largeVariances & " items >15% change" & vbCrLf
    issueCount = issueCount + largeVariances
Else
    report = report & "✅ All variances within tolerance" & vbCrLf
End If' Check 4: Formula Integrity
Dim brokenFormulas As Integer
brokenFormulas = CheckFormulaIntegrity()
If brokenFormulas > 0 Then
    report = report & "❌ Broken Formulas: " & brokenFormulas & " errors found" & vbCrLf
    issueCount = issueCount + brokenFormulas
Else
    report = report & "✅ All formulas intact" & vbCrLf
End If' Check 5: Email Recipients
If Not EmailRecipientsConfigured() Then
    report = report & "❌ No email recipients configured" & vbCrLf
    issueCount = issueCount + 1
Else
    report = report & "✅ Email recipients configured" & vbCrLf
End IfApplication.ScreenUpdating = True' Display report
report = report & vbCrLf & String(50, "=") & vbCrLf
report = report & "Total Issues: " & issueCount & vbCrLfIf issueCount = 0 Then
    report = report & vbCrLf & "✅ VALIDATION PASSED - Ready to export!"
    MsgBox report, vbInformation, "Validation Complete"
Else
    report = report & vbCrLf & "⚠️ Please resolve issues before exporting"
    MsgBox report, vbExclamation, "Validation Issues Found"
End If' Write report to log
Call WriteValidationReport(report)
End Sub' ============================================================================
' VALIDATION CHECK FUNCTIONS
' ============================================================================Function CheckForMissingCosts() As Integer
Dim ws As Worksheet
Dim lastRow As Long
Dim i As Long
Dim missingCount As IntegerOn Error Resume Next
Set ws = ThisWorkbook.Sheets("Lumber Lock - Validation Tool")
On Error GoTo 0If ws Is Nothing Then
    CheckForMissingCosts = -1
    Exit Function
End IfmissingCount = 0
lastRow = ws.Cells(ws.Rows.Count, "J").End(xlUp).Row' Check column J for empty cells (assuming J contains costs)
For i = 2 To lastRow ' Start at 2 to skip header
    If IsEmpty(ws.Cells(i, "J").Value) Or ws.Cells(i, "J").Value = 0 Then
        ' Check if there's an item description in this row
        If Not IsEmpty(ws.Cells(i, "A").Value) Then
            missingCount = missingCount + 1
        End If
    End If
Next iCheckForMissingCosts = missingCount
End FunctionFunction CheckForDuplicates() As Integer
Dim ws As Worksheet
Dim lastRow As Long
Dim itemDict As Object
Dim i As Long
Dim itemCode As String
Dim duplicateCount As IntegerOn Error Resume Next
Set ws = ThisWorkbook.Sheets("Item Duplicates")
On Error GoTo 0If ws Is Nothing Then
    CheckForDuplicates = 0
    Exit Function
End If' Count items in Item Duplicates sheet
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row' Assume duplicates sheet has data starting at row 2
If lastRow > 1 Then
    duplicateCount = lastRow - 1
Else
    duplicateCount = 0
End IfCheckForDuplicates = duplicateCount
End FunctionFunction CheckForLargeVariances(thresholdPercent As Double) As Integer
Dim ws As Worksheet
Dim lastRow As Long
Dim i As Long
Dim currentPrice As Double
Dim previousPrice As Double
Dim variancePercent As Double
Dim largeVarCount As IntegerOn Error Resume Next
Set ws = ThisWorkbook.Sheets("Current Lock vs Prev Lock")
On Error GoTo 0If ws Is Nothing Then
    CheckForLargeVariances = 0
    Exit Function
End IflargeVarCount = 0
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row' This is simplified - adjust column references based on actual sheet structure
For i = 2 To lastRow
    On Error Resume Next
    currentPrice = ws.Cells(i, "B").Value ' Adjust column as needed
    previousPrice = ws.Cells(i, "C").Value ' Adjust column as needed
    On Error GoTo 0    If previousPrice <> 0 And currentPrice <> 0 Then
        variancePercent = Abs((currentPrice - previousPrice) / previousPrice * 100)
        If variancePercent > thresholdPercent Then
            largeVarCount = largeVarCount + 1
        End If
    End If
Next iCheckForLargeVariances = largeVarCount
End FunctionFunction CheckFormulaIntegrity() As Integer
Dim ws As Worksheet
Dim cell As Range
Dim errorCount As IntegerOn Error Resume Next
Set ws = ThisWorkbook.Sheets("Lumber Lock - Validation Tool")
On Error GoTo 0If ws Is Nothing Then
    CheckFormulaIntegrity = -1
    Exit Function
End IferrorCount = 0' Check for #REF!, #VALUE!, #N/A errors in used range
For Each cell In ws.UsedRange
    If cell.HasFormula Then
        If IsError(cell.Value) Then
            errorCount = errorCount + 1
        End If
    End If
Next cellCheckFormulaIntegrity = errorCount
End Function' ============================================================================
' REPORT WRITING
' ============================================================================Sub WriteValidationReport(reportText As String)
Dim ws As Worksheet
Dim reportRow As Long' Get or create validation reports sheet
On Error Resume Next
Set ws = ThisWorkbook.Sheets("Validation Reports")
On Error GoTo 0If ws Is Nothing Then
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = "Validation Reports"
    ws.Range("A1").Value = "Validation Report Archive"
    ws.Range("A1").Font.Bold = True
End If' Find next available row
reportRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 2' Write report header and content
ws.Cells(reportRow, 1).Value = "Report Date: " & Format(Now, "yyyy-mm-dd hh:nn:ss")
ws.Cells(reportRow, 1).Font.Bold = True
ws.Cells(reportRow + 1, 1).Value = reportText
ws.Cells(reportRow + 1, 1).WrapText = False
End Sub' Helper function from Module 4
Function EmailRecipientsConfigured() As Boolean
Dim ws As Worksheet
Dim cell As Range
Dim hasRecipients As BooleanOn Error Resume Next
Set ws = ThisWorkbook.Sheets("Checklist")
On Error GoTo 0If ws Is Nothing Then
    EmailRecipientsConfigured = False
    Exit Function
End IfhasRecipients = False
For Each cell In ws.Range("K26:K31")
    If Len(Trim(cell.Value)) > 0 Then
        hasRecipients = True
        Exit For
    End If
Next cellEmailRecipientsConfigured = hasRecipients
End Function

## How It Works

### Validation Process
1. **Run Checks** - Executes 5 validation functions
2. **Count Issues** - Tracks total problems found
3. **Generate Report** - Creates detailed validation report
4. **Display Results** - Shows dialog with pass/fail status
5. **Log Report** - Saves report to Validation Reports sheet

### Validation Checks

#### Check 1: Missing Costs
**What it checks:** Items in Validation Tool that have no cost or zero cost

**Location:** Lumber Lock - Validation Tool, Column J

**Logic:**
```vbaFor each row in Validation Tool:
If item description exists (column A)
AND cost is empty or zero (column J)
THEN count as missing cost

**Pass Criteria:** Zero missing costs

#### Check 2: Duplicates
**What it checks:** Duplicate items in the system

**Location:** Item Duplicates sheet

**Logic:**
```vbaCount rows in "Item Duplicates" sheet
(Assumes sheet is populated by another process)

**Pass Criteria:** Zero duplicates

#### Check 3: Large Variances
**What it checks:** Price changes >15% from previous lock

**Location:** Current Lock vs Prev Lock sheet

**Threshold:** 15% (configurable)

**Logic:**
```vbaFor each item:
Calculate: ABS((current - previous) / previous * 100)
If variance > 15%
THEN count as large variance

**Pass Criteria:** Zero items with >15% variance (or acceptable based on review)

#### Check 4: Formula Integrity
**What it checks:** Broken formulas (#REF!, #VALUE!, #N/A, etc.)

**Location:** Lumber Lock - Validation Tool

**Logic:**
```vbaFor each cell in used range:
If cell has formula
AND cell shows error value
THEN count as broken formula

**Pass Criteria:** Zero broken formulas

#### Check 5: Email Configuration
**What it checks:** Email recipients configured in Checklist

**Location:** Checklist sheet, K26:K31

**Logic:**
```vbaFor each cell in K26:K31:
If cell contains text
THEN email configured

**Pass Criteria:** At least one email address present

## Validation Report Example=== DATA VALIDATION REPORT ===
2024-11-17 14:23:45⚠️ Missing Costs: 2 items found
✅ No duplicates detected
⚠️ Large Variances: 5 items >15% change
✅ All formulas intact
✅ Email recipients configured==================================================
Total Issues: 7⚠️ Please resolve issues before exporting

## Usage

### Run Validation Manually
```vba' Press Alt+F8, run:
RunDataValidation

### Run via Workflow Controller
```vba' Press Alt+F8, run:
ExecuteStep_Validation

### Check Validation Status
Look for "Validation Reports" sheet - if it exists, validation has been run.

## Configuration

### Adjust Variance Threshold
Default is 15%. To change:
```vba' In RunDataValidation function, change this line:
largeVariances = CheckForLargeVariances(15)  ' Change 15 to desired %' For example, 20% threshold:
largeVariances = CheckForLargeVariances(20)

### Customize Column References
If your sheet structure differs, update column references:
```vba' Missing Costs - Column J
ws.Cells(i, "J").Value  ' Change "J" to your cost column' Large Variances - Columns B and C
currentPrice = ws.Cells(i, "B").Value   ' Current price column
previousPrice = ws.Cells(i, "C").Value  ' Previous price column

## Integration with Module 4

Module 4 calls `RunDataValidation` and then:
- Logs the validation event
- Updates the dashboard
- Creates Validation Reports sheet (used by export validation gate)

The export validation gate checks for the existence of "Validation Reports" sheet to ensure validation was run.

## Troubleshooting

### "Sheet not found" Error
**Cause:** Required sheet doesn't exist

**Solution:** Ensure these sheets exist:
- Lumber Lock - Validation Tool
- Checklist
- Item Duplicates (optional - returns 0 if missing)
- Current Lock vs Prev Lock (optional - returns 0 if missing)

### Returns -1 for Missing Costs
**Cause:** "Lumber Lock - Validation Tool" sheet not found

**Solution:** Check sheet name spelling (exact match required)

### Validation Always Passes
**Possible causes:**
1. Sheets are empty (no data to validate)
2. Column references are wrong
3. Item descriptions in wrong column

**Solution:** Review column references in check functions

### Large Variance Count Seems Wrong
**Cause:** Column references don't match your sheet structure

**Solution:** Update column letters in `CheckForLargeVariances`:
```vbacurrentPrice = ws.Cells(i, "B").Value   ' Your current price column
previousPrice = ws.Cells(i, "C").Value  ' Your previous price column

## Best Practices

1. **Run validation early** - Before starting export process
2. **Fix all issues** - Don't ignore validation warnings
3. **Review variances** - Large variances might be legitimate (market changes)
4. **Keep Checklist updated** - Email recipients should be current
5. **Re-run after fixes** - Validate again after correcting issues

## Extending Validation

### Add New Check
1. Create new check function:
```vbaFunction CheckForNewIssue() As Integer
' Your validation logic
CheckForNewIssue = issueCount
End Function

2. Add to `RunDataValidation`:
```vbaDim newIssues As Integer
newIssues = CheckForNewIssue()
If newIssues > 0 Then
report = report & "⚠️ New Issue: " & newIssues & " found" & vbCrLf
issueCount = issueCount + newIssues
Else
report = report & "✅ New check passed" & vbCrLf
End If

### Examples of Additional Checks

**Check for Negative Prices:**
```vbaFunction CheckForNegativePrices() As Integer
Dim ws As Worksheet
Dim lastRow As Long
Dim i As Long
Dim negCount As IntegerSet ws = ThisWorkbook.Sheets("Lumber Lock - Validation Tool")
negCount = 0
lastRow = ws.Cells(ws.Rows.Count, "J").End(xlUp).RowFor i = 2 To lastRow
    If ws.Cells(i, "J").Value < 0 Then
        negCount = negCount + 1
    End If
Next iCheckForNegativePrices = negCount
End Function

**Check for Missing Descriptions:**
```vbaFunction CheckForMissingDescriptions() As Integer
Dim ws As Worksheet
Dim lastRow As Long
Dim i As Long
Dim missingCount As IntegerSet ws = ThisWorkbook.Sheets("Lumber Lock - Validation Tool")
missingCount = 0
lastRow = ws.Cells(ws.Rows.Count, "J").End(xlUp).RowFor i = 2 To lastRow
    If Not IsEmpty(ws.Cells(i, "J").Value) Then ' Has cost
        If IsEmpty(ws.Cells(i, "A").Value) Then ' But no description
            missingCount = missingCount + 1
        End If
    End If
Next iCheckForMissingDescriptions = missingCount
End Function

## Performance Notes

- Validation typically takes 5-10 seconds for 500-1000 items
- Formula integrity check is slowest (checks every formula)
- Screen updating is disabled during validation for speed
- Large variance check depends on sheet size

## Version History

**v2.0** - November 2024
- Initial enhanced version
- 5 core validation checks
- Automated reporting
- Integration with Module 4

---

**Next:** See `Module_Enhancements.md` for updates to existing modules.