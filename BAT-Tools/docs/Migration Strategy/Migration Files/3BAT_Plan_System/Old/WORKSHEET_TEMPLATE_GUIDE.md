# PLAN OVERVIEW WORKSHEET TEMPLATE STRUCTURE

## Layout Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│ A                  │ B                                                   │
├────────────────────┴─────────────────────────────────────────────────────┤
│ 1  HOLT HOMES - PLAN OVERVIEW                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 2  Builder:        │ [builder_name] Holt Homes                          │
│ 3  Plan Code:      │ [plan_code] 30-1670                                │
│ 4  Plan Name:      │ [plan_name] Coyote Ridge                           │
│ 5  Model Display:  │ [model_display] 1670 - Coyote Ridge                │
│ 6  Created On:     │ [created_on] 10/6/2025                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 7  ELEVATIONS & CONFIGURATIONS                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ 8  Elevations:     │ [elevations] A (Northwest), B (Prairie), C (Mod)   │
│ 9  Garage:         │ [garage] 2-Car (L/R), optional 3-Car (L/R)         │
├─────────────────────────────────────────────────────────────────────────┤
│ 10 AREAS & DIMENSIONS                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 11 Living Area Total: │ [living_area_total] 2,450                       │
│ 12 Living Area Main:  │ [living_area_main] 1,670                        │
│ 13 Living Area Upper: │ [living_area_upper] 780                         │
│ 14 Garage Area:       │ [garage_area] 460                               │
├─────────────────────────────────────────────────────────────────────────┤
│ 15 SPECIFICATIONS                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 16 Stories:        │ [stories] Two                                       │
│ 17 Subfloor L1:    │ [subfloor_L1] 23/32                                │
│ 18 Subfloor L2:    │ [subfloor_L2] 23/32                                │
│ 19 Wall Height L1: │ [wall_h_L1] 9'                                     │
│ 20 Wall Height L2: │ [wall_h_L2] 9'                                     │
│ 21 Roof Load:      │ [roof_load] 30                                     │
│ 22 Siding:         │ [siding] Lap                                       │
│ 23 RF Required:    │ [rf_required] No                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 24 NOTES                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ 25 [notes]                                                               │
│    Special requirements, custom options, builder preferences, etc.       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Excel Setup Instructions

### Step 1: Create the Sheet
1. In your template workbook, create/rename a sheet to "Plan Overview"
2. Set column widths:
   - Column A: 25 characters
   - Column B: 50 characters

### Step 2: Format Headers
1. Row 1: Merge A1:B1
   - Text: "HOLT HOMES - PLAN OVERVIEW"
   - Font: Arial 16pt, Bold, White
   - Background: RGB(68, 114, 196) - Dark Blue
   - Alignment: Center

2. Section Headers (rows 7, 10, 15, 24):
   - Merge A:B
   - Font: Arial 12pt, Bold, White
   - Background: RGB(91, 155, 213) - Medium Blue
   - Text:
     - Row 7: "ELEVATIONS & CONFIGURATIONS"
     - Row 10: "AREAS & DIMENSIONS"
     - Row 15: "SPECIFICATIONS"
     - Row 24: "NOTES"

### Step 3: Format Labels (Column A)
- Font: Arial 10pt, Bold
- Background: RGB(217, 225, 242) - Light Blue
- Alignment: Right, Vertical Center
- Border: Thin box around each cell

### Step 4: Format Data Cells (Column B)
- Font: Arial 10pt, Regular
- Background: White
- Border: Thin box around each cell
- Row 25 (notes): Make it taller (60+ points) and wrap text

### Step 5: Create Named Ranges

**Option A: Manual Method**
For each cell in column B, select it and create named range:

| Cell | Named Range |
|------|-------------|
| B2 | builder_name |
| B3 | plan_code |
| B4 | plan_name |
| B5 | model_display |
| B6 | created_on |
| B8 | elevations |
| B9 | garage |
| B11 | living_area_total |
| B12 | living_area_main |
| B13 | living_area_upper |
| B14 | garage_area |
| B16 | stories |
| B17 | subfloor_L1 |
| B18 | subfloor_L2 |
| B19 | wall_h_L1 |
| B20 | wall_h_L2 |
| B21 | roof_load |
| B22 | siding |
| B23 | rf_required |
| B25 | notes |

**Option B: VBA Macro** (Faster!)
Copy and run this macro once:

```vba
Sub SetupPlanOverviewSheet()
    Dim ws As Worksheet
    Dim rng As Range
    
    ' Create or get sheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Plan Overview")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = "Plan Overview"
    End If
    
    With ws
        ' Set column widths
        .Columns("A:A").ColumnWidth = 25
        .Columns("B:B").ColumnWidth = 50
        
        ' Title Row
        .Range("A1:B1").Merge
        .Range("A1").Value = "HOLT HOMES - PLAN OVERVIEW"
        With .Range("A1")
            .Font.Size = 16
            .Font.Bold = True
            .Font.Color = RGB(255, 255, 255)
            .Interior.Color = RGB(68, 114, 196)
            .HorizontalAlignment = xlCenter
        End With
        
        ' Basic Info Section
        .Range("A2").Value = "Builder:"
        .Range("A3").Value = "Plan Code:"
        .Range("A4").Value = "Plan Name:"
        .Range("A5").Value = "Model Display:"
        .Range("A6").Value = "Created On:"
        
        ' Section Header: Elevations
        .Range("A7:B7").Merge
        .Range("A7").Value = "ELEVATIONS & CONFIGURATIONS"
        FormatSectionHeader .Range("A7")
        
        .Range("A8").Value = "Elevations:"
        .Range("A9").Value = "Garage:"
        
        ' Section Header: Areas
        .Range("A10:B10").Merge
        .Range("A10").Value = "AREAS & DIMENSIONS"
        FormatSectionHeader .Range("A10")
        
        .Range("A11").Value = "Living Area Total:"
        .Range("A12").Value = "Living Area Main:"
        .Range("A13").Value = "Living Area Upper:"
        .Range("A14").Value = "Garage Area:"
        
        ' Section Header: Specifications
        .Range("A15:B15").Merge
        .Range("A15").Value = "SPECIFICATIONS"
        FormatSectionHeader .Range("A15")
        
        .Range("A16").Value = "Stories:"
        .Range("A17").Value = "Subfloor L1:"
        .Range("A18").Value = "Subfloor L2:"
        .Range("A19").Value = "Wall Height L1:"
        .Range("A20").Value = "Wall Height L2:"
        .Range("A21").Value = "Roof Load:"
        .Range("A22").Value = "Siding:"
        .Range("A23").Value = "RF Required:"
        
        ' Section Header: Notes
        .Range("A24:B24").Merge
        .Range("A24").Value = "NOTES"
        FormatSectionHeader .Range("A24")
        
        .Range("A25").Value = ""
        .Range("B25").WrapText = True
        .Rows(25).RowHeight = 60
        
        ' Format all labels
        Dim labelRng As Range
        Set labelRng = .Range("A2:A6,A8:A9,A11:A14,A16:A23,A25")
        With labelRng
            .Font.Bold = True
            .Interior.Color = RGB(217, 225, 242)
            .HorizontalAlignment = xlRight
            .VerticalAlignment = xlCenter
            .Borders.Weight = xlThin
        End With
        
        ' Format all data cells
        Dim dataRng As Range
        Set dataRng = .Range("B2:B6,B8:B9,B11:B14,B16:B23,B25")
        With dataRng
            .Interior.Color = RGB(255, 255, 255)
            .Borders.Weight = xlThin
        End With
        
        ' Create Named Ranges
        .Range("B2").Name = "builder_name"
        .Range("B3").Name = "plan_code"
        .Range("B4").Name = "plan_name"
        .Range("B5").Name = "model_display"
        .Range("B6").Name = "created_on"
        .Range("B8").Name = "elevations"
        .Range("B9").Name = "garage"
        .Range("B11").Name = "living_area_total"
        .Range("B12").Name = "living_area_main"
        .Range("B13").Name = "living_area_upper"
        .Range("B14").Name = "garage_area"
        .Range("B16").Name = "stories"
        .Range("B17").Name = "subfloor_L1"
        .Range("B18").Name = "subfloor_L2"
        .Range("B19").Name = "wall_h_L1"
        .Range("B20").Name = "wall_h_L2"
        .Range("B21").Name = "roof_load"
        .Range("B22").Name = "siding"
        .Range("B23").Name = "rf_required"
        .Range("B25").Name = "notes"
        
        ' Add default values
        .Range("B2").Value = "Holt Homes"
        .Range("B6").Formula = "=NOW()"
        .Range("B23").Value = "No"
        
    End With
    
    MsgBox "Plan Overview sheet created successfully!" & vbCrLf & _
           "All named ranges have been set up.", vbInformation, "Success"
End Sub

Sub FormatSectionHeader(rng As Range)
    With rng
        .Font.Size = 12
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(91, 155, 213)
        .HorizontalAlignment = xlCenter
    End With
End Sub
```

### Step 6: Add Data Validation (Optional)

```vba
Sub AddDataValidation()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Plan Overview")
    
    With ws
        ' Stories dropdown
        With .Range("B16").Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:="Single,Two,Three"
        End With
        
        ' Roof Load dropdown
        With .Range("B21").Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:="25,30,40,60"
        End With
        
        ' Siding dropdown
        With .Range("B22").Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:="Lap,Board & Batten,Panel,Mixed"
        End With
        
        ' RF Required dropdown
        With .Range("B23").Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:="Yes,No"
        End With
    End With
    
    MsgBox "Data validation added!", vbInformation
End Sub
```

## Quick Test

After setup, test the named ranges:

```vba
Sub TestNamedRanges()
    Dim names As Variant
    Dim name As Variant
    Dim missingNames As String
    
    names = Array("builder_name", "plan_code", "plan_name", "model_display", _
                  "created_on", "elevations", "garage", "living_area_total", _
                  "living_area_main", "living_area_upper", "garage_area", _
                  "stories", "subfloor_L1", "subfloor_L2", "wall_h_L1", _
                  "wall_h_L2", "roof_load", "siding", "rf_required", "notes")
    
    For Each name In names
        On Error Resume Next
        If Range(name).Address = "" Then
            missingNames = missingNames & name & vbCrLf
        End If
        On Error GoTo 0
    Next name
    
    If missingNames = "" Then
        MsgBox "All named ranges are set up correctly!", vbInformation, "Success"
    Else
        MsgBox "Missing named ranges:" & vbCrLf & missingNames, vbExclamation, "Error"
    End If
End Sub
```

## Color Reference

| Element | RGB Color | Hex |
|---------|-----------|-----|
| Title Background | RGB(68, 114, 196) | #4472C4 |
| Section Headers | RGB(91, 155, 213) | #5B9BD5 |
| Label Background | RGB(217, 225, 242) | #D9E1F2 |
| Data Cells | RGB(255, 255, 255) | #FFFFFF |

## Protection (Optional)

After setup, protect the sheet but allow specific ranges:

```vba
Sub ProtectPlanOverview()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Plan Overview")
    
    ' Unlock data entry cells
    ws.Range("B2:B6,B8:B9,B11:B14,B16:B23,B25").Locked = False
    
    ' Protect sheet
    ws.Protect Password:="", _
               DrawingObjects:=True, _
               Contents:=True, _
               Scenarios:=True, _
               AllowFormattingCells:=False
    
    MsgBox "Sheet protected! Data cells are still editable.", vbInformation
End Sub
```

## Next Steps

1. Run `SetupPlanOverviewSheet()` to create the layout
2. Run `AddDataValidation()` to add dropdowns
3. Run `TestNamedRanges()` to verify setup
4. Optional: Run `ProtectPlanOverview()` to lock formatting
5. Save as template (.xltm or .xlsm)

---

**Note:** This template integrates with the PlanIntakeForm VBA code provided separately.
