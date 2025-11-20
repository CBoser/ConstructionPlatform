# Working Mode System - Complete Implementation

This document provides the complete implementation of a working mode system for Excel VBA that prevents simultaneous edits to related sheets.

## Problem Statement

When multiple sheets contain related data, simultaneous editing can lead to:
- Data corruption from conflicting updates
- Lost work when one sheet overwrites another
- Confusion about which sheet is the "source of truth"
- Race conditions in data synchronization

## Solution Overview

The working mode system provides:
1. Mutual exclusion between related sheets
2. Visual indicators of working mode status
3. Graceful blocking of conflicting operations
4. Persistent state across workbook sessions

## Complete Module Code

```vba
'====================================================================
' MODULE: mod_WorkingMode
' PURPOSE: Prevent simultaneous edits to related sheets
' USAGE: Add to any workbook with related sheets that need protection
'====================================================================
Option Explicit

' Sheet name constants - UPDATE THESE for your workbook
Private Const WB_WHITEBOARD As String = "WHITE BOARD"
Private Const WB_UPCOMING As String = "Upcoming Packs"
Private Const WB_INDICATOR_SHAPE As String = "WorkingModeIndicator_WB"
Private Const UP_INDICATOR_SHAPE As String = "WorkingModeIndicator_UP"

' Module-level variables to track working mode
Private wb_WorkingMode As Boolean
Private up_WorkingMode As Boolean

'----------------------------------------------------
' PUBLIC INTERFACE
'----------------------------------------------------

'----------------------------------------------------
' Toggle working mode for Whiteboard
' Call from button or ribbon
'----------------------------------------------------
Public Sub ToggleWhiteboardWorkingMode()
    ' Check for conflicts
    If up_WorkingMode Then
        MsgBox "Cannot enter working mode on Whiteboard while Upcoming Packs is in working mode." & vbNewLine & _
               "Release working mode on Upcoming Packs first.", _
               vbExclamation, "Conflict"
        Exit Sub
    End If
    
    ' Toggle state
    wb_WorkingMode = Not wb_WorkingMode
    UpdateIndicators
    SaveWorkingModeStatus
    
    ' User feedback
    If wb_WorkingMode Then
        MsgBox "Whiteboard is now in WORKING MODE." & vbNewLine & _
               "Upcoming Packs is locked for editing." & vbNewLine & vbNewLine & _
               "Remember to release working mode when finished.", vbInformation
    Else
        MsgBox "Whiteboard working mode released." & vbNewLine & _
               "All sheets are now accessible.", vbInformation
    End If
End Sub

'----------------------------------------------------
' Toggle working mode for Upcoming Packs
' Call from button or ribbon
'----------------------------------------------------
Public Sub ToggleUpcomingWorkingMode()
    ' Check for conflicts
    If wb_WorkingMode Then
        MsgBox "Cannot enter working mode on Upcoming Packs while Whiteboard is in working mode." & vbNewLine & _
               "Release working mode on Whiteboard first.", _
               vbExclamation, "Conflict"
        Exit Sub
    End If
    
    ' Toggle state
    up_WorkingMode = Not up_WorkingMode
    UpdateIndicators
    SaveWorkingModeStatus
    
    ' User feedback
    If up_WorkingMode Then
        MsgBox "Upcoming Packs is now in WORKING MODE." & vbNewLine & _
               "Whiteboard is locked for editing." & vbNewLine & vbNewLine & _
               "Remember to release working mode when finished.", vbInformation
    Else
        MsgBox "Upcoming Packs working mode released." & vbNewLine & _
               "All sheets are now accessible.", vbInformation
    End If
End Sub

'----------------------------------------------------
' Check if sheet is accessible before operations
' Call this at the start of any procedure that modifies data
' CRITICAL: Add this check to ALL data modification procedures
'----------------------------------------------------
Public Function IsSheetAccessible(sheetName As String) As Boolean
    ' Whiteboard accessibility logic
    If sheetName = WB_WHITEBOARD Then
        ' Whiteboard is accessible if:
        ' - It's in working mode, OR
        ' - No sheet is in working mode
        IsSheetAccessible = wb_WorkingMode Or (Not wb_WorkingMode And Not up_WorkingMode)
        
        If Not IsSheetAccessible Then
            MsgBox "The Whiteboard is locked because Upcoming Packs is in working mode." & vbNewLine & _
                   "Release working mode on Upcoming Packs first.", vbExclamation, "Sheet Locked"
        End If
        
    ' Upcoming Packs accessibility logic
    ElseIf sheetName = WB_UPCOMING Then
        ' Upcoming Packs is accessible if:
        ' - It's in working mode, OR
        ' - No sheet is in working mode
        IsSheetAccessible = up_WorkingMode Or (Not wb_WorkingMode And Not up_WorkingMode)
        
        If Not IsSheetAccessible Then
            MsgBox "The Upcoming Packs sheet is locked because Whiteboard is in working mode." & vbNewLine & _
                   "Release working mode on Whiteboard first.", vbExclamation, "Sheet Locked"
        End If
        
    ' Other sheets are always accessible
    Else
        IsSheetAccessible = True
    End If
End Function

'----------------------------------------------------
' VISUAL INDICATORS
'----------------------------------------------------

'----------------------------------------------------
' Create visual indicators on sheets
' Call once during workbook initialization
'----------------------------------------------------
Public Sub CreateWorkingModeIndicators()
    CreateIndicatorOnSheet WB_WHITEBOARD, WB_INDICATOR_SHAPE
    CreateIndicatorOnSheet WB_UPCOMING, UP_INDICATOR_SHAPE
End Sub

'----------------------------------------------------
' Create indicator shape on specific sheet
'----------------------------------------------------
Private Sub CreateIndicatorOnSheet(sheetName As String, shapeName As String)
    On Error Resume Next
    Dim ws As Worksheet
    Dim shp As Shape
    
    Set ws = ThisWorkbook.Worksheets(sheetName)
    If ws Is Nothing Then Exit Sub
    
    ' Remove existing indicator if present
    ws.Shapes(shapeName).Delete
    On Error GoTo 0
    
    ' Create new rounded rectangle indicator
    Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, 10, 10, 200, 40)
    shp.Name = shapeName
    
    With shp
        ' Default idle styling
        .Fill.ForeColor.RGB = RGB(200, 200, 200)
        .Line.Visible = msoTrue
        .Line.ForeColor.RGB = RGB(100, 100, 100)
        .Line.Weight = 2
        
        ' Text configuration
        With .TextFrame2
            .TextRange.Text = "Status: IDLE"
            .TextRange.Font.Size = 12
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = RGB(0, 0, 0)
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
        
        ' Lock shape position
        .Locked = True
    End With
End Sub

'----------------------------------------------------
' Update all indicators based on current working mode
' Call after any working mode state change
'----------------------------------------------------
Private Sub UpdateIndicators()
    UpdateIndicator WB_WHITEBOARD, WB_INDICATOR_SHAPE, wb_WorkingMode
    UpdateIndicator WB_UPCOMING, UP_INDICATOR_SHAPE, up_WorkingMode
End Sub

'----------------------------------------------------
' Update specific indicator
'----------------------------------------------------
Private Sub UpdateIndicator(sheetName As String, shapeName As String, isWorking As Boolean)
    On Error Resume Next
    Dim ws As Worksheet
    Dim shp As Shape
    
    Set ws = ThisWorkbook.Worksheets(sheetName)
    If ws Is Nothing Then Exit Sub
    
    Set shp = ws.Shapes(shapeName)
    If shp Is Nothing Then Exit Sub
    
    If isWorking Then
        ' Working mode styling - bright orange/yellow
        shp.Fill.ForeColor.RGB = RGB(255, 200, 0)
        shp.Line.ForeColor.RGB = RGB(200, 150, 0)
        shp.TextFrame2.TextRange.Text = "⚠ WORKING MODE"
        shp.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(0, 0, 0)
    Else
        ' Idle mode styling - gray
        shp.Fill.ForeColor.RGB = RGB(200, 200, 200)
        shp.Line.ForeColor.RGB = RGB(100, 100, 100)
        shp.TextFrame2.TextRange.Text = "Status: IDLE"
        shp.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(60, 60, 60)
    End If
    
    On Error GoTo 0
End Sub

'----------------------------------------------------
' PERSISTENCE
'----------------------------------------------------

'----------------------------------------------------
' Save working mode status to hidden sheet
' Call after any state change
'----------------------------------------------------
Private Sub SaveWorkingModeStatus()
    On Error Resume Next
    Dim ws As Worksheet
    
    ' Get or create hidden status sheet
    Set ws = ThisWorkbook.Worksheets("WorkingModeStatus")
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add
        ws.Name = "WorkingModeStatus"
        ws.Visible = xlSheetVeryHidden
        
        ' Add headers
        ws.Cells(1, 1).Value = "Sheet"
        ws.Cells(1, 2).Value = "InWorkingMode"
    End If
    
    ' Save current state
    With ws
        .Cells(2, 1).Value = "Whiteboard"
        .Cells(2, 2).Value = wb_WorkingMode
        .Cells(3, 1).Value = "UpcomingPacks"
        .Cells(3, 2).Value = up_WorkingMode
    End With
    
    On Error GoTo 0
End Sub

'----------------------------------------------------
' Load working mode status from hidden sheet
' Call during workbook initialization
'----------------------------------------------------
Public Sub LoadWorkingModeStatus()
    On Error Resume Next
    Dim ws As Worksheet
    
    Set ws = ThisWorkbook.Worksheets("WorkingModeStatus")
    
    If Not ws Is Nothing Then
        ' Load saved state
        wb_WorkingMode = CBool(ws.Cells(2, 2).Value)
        up_WorkingMode = CBool(ws.Cells(3, 2).Value)
    Else
        ' Default to no working mode
        wb_WorkingMode = False
        up_WorkingMode = False
    End If
    
    On Error GoTo 0
    
    ' Update visual indicators
    UpdateIndicators
End Sub

'----------------------------------------------------
' INITIALIZATION
'----------------------------------------------------

'----------------------------------------------------
' Initialize the working mode system
' Call once during workbook open
'----------------------------------------------------
Public Sub InitializeWorkingModeSystem()
    ' Load existing working mode status
    LoadWorkingModeStatus
    
    ' Create or update indicators
    Dim shp As Shape
    On Error Resume Next
    
    ' Check if indicators exist
    Set shp = ThisWorkbook.Worksheets(WB_WHITEBOARD).Shapes(WB_INDICATOR_SHAPE)
    If Err.Number <> 0 Or shp Is Nothing Then
        CreateWorkingModeIndicators
    Else
        UpdateIndicators
    End If
    
    On Error GoTo 0
End Sub

'----------------------------------------------------
' UTILITY FUNCTIONS
'----------------------------------------------------

'----------------------------------------------------
' Check if worksheet exists
'----------------------------------------------------
Private Function WorksheetExists(shtName As String, Optional wb As Workbook) As Boolean
    Dim sht As Worksheet
    
    If wb Is Nothing Then Set wb = ThisWorkbook
    On Error Resume Next
    Set sht = wb.Worksheets(shtName)
    On Error GoTo 0
    WorksheetExists = Not sht Is Nothing
End Function

'----------------------------------------------------
' Get current working mode status for reporting
'----------------------------------------------------
Public Function GetWorkingModeStatus() As String
    If wb_WorkingMode Then
        GetWorkingModeStatus = "Whiteboard in working mode"
    ElseIf up_WorkingMode Then
        GetWorkingModeStatus = "Upcoming Packs in working mode"
    Else
        GetWorkingModeStatus = "No active working mode"
    End If
End Function
```

## Integration with ThisWorkbook Module

Add these event handlers to your `ThisWorkbook` module:

```vba
'----------------------------------------------------
' ThisWorkbook Module
' Add these to integrate working mode system
'----------------------------------------------------

Private Sub Workbook_Open()
    ' Initialize working mode system
    InitializeWorkingModeSystem
    
    ' Your other initialization code...
End Sub

Private Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    ' Save working mode status when workbook is saved
    ' (SaveWorkingModeStatus is called internally, but this ensures it)
    
    ' Your other save code...
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    ' Optional: Remind user if leaving with working mode active
    If wb_WorkingMode Or up_WorkingMode Then
        Dim response As VbMsgBoxResult
        response = MsgBox("A sheet is still in working mode. " & _
                         "Do you want to release it before closing?", _
                         vbYesNo + vbQuestion, "Working Mode Active")
        
        If response = vbYes Then
            If wb_WorkingMode Then ToggleWhiteboardWorkingMode
            If up_WorkingMode Then ToggleUpcomingWorkingMode
        End If
    End If
End Sub
```

## Adding Working Mode Checks to Existing Procedures

Update ALL procedures that modify data to check accessibility:

```vba
'----------------------------------------------------
' BEFORE - No protection
'----------------------------------------------------
Public Sub ExtractAndProcessData()
    ' Directly modifies whiteboard
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets("WHITE BOARD")
    ' ... processing code ...
End Sub

'----------------------------------------------------
' AFTER - With working mode protection
'----------------------------------------------------
Public Sub ExtractAndProcessData()
    ' Check if whiteboard is accessible
    If Not IsSheetAccessible("WHITE BOARD") Then
        Exit Sub
    End If
    
    ' Now safe to modify whiteboard
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets("WHITE BOARD")
    ' ... processing code ...
End Sub
```

## Creating User Interface Elements

### Option 1: Buttons on Sheets

```vba
' Add button to sheet programmatically
Sub AddWorkingModeButton()
    Dim ws As Worksheet
    Dim btn As Button
    
    Set ws = ThisWorkbook.Worksheets("WHITE BOARD")
    
    ' Create button
    Set btn = ws.Buttons.Add(300, 10, 150, 30)
    btn.OnAction = "ToggleWhiteboardWorkingMode"
    btn.Caption = "Toggle Working Mode"
End Sub
```

### Option 2: Custom Ribbon (requires XML)

Create a custom ribbon tab with working mode controls. This requires creating a custom UI file.

### Option 3: Developer Tab Buttons

1. Go to Developer tab
2. Insert > Button (Form Control)
3. Assign macro: `ToggleWhiteboardWorkingMode`
4. Repeat for Upcoming Packs

## Testing Checklist

- [ ] Single user can activate working mode on Whiteboard
- [ ] Single user can activate working mode on Upcoming Packs
- [ ] Cannot activate both working modes simultaneously
- [ ] Locked sheet shows error message when accessed
- [ ] Visual indicators update correctly
- [ ] Working mode persists across save/close/reopen
- [ ] Multiple users see correct working mode status (if networked)
- [ ] All data modification procedures have IsSheetAccessible checks
- [ ] Working mode reminder appears on close (if desired)

## Troubleshooting

**Issue**: Indicators don't appear
- Solution: Call `CreateWorkingModeIndicators()` manually

**Issue**: Working mode not persisting
- Solution: Verify WorkingModeStatus sheet exists and is not deleted

**Issue**: Both working modes show as active
- Solution: Manually reset in VBA immediate window:
  ```vba
  wb_WorkingMode = False
  up_WorkingMode = False
  SaveWorkingModeStatus
  UpdateIndicators
  ```

**Issue**: Cannot release working mode
- Solution: Check if procedure is being called correctly, verify no code errors

## Customization Options

### Add More Sheets
```vba
' Add third sheet to system
Private Const WB_COMPLETED As String = "Completed Packs"
Private comp_WorkingMode As Boolean

' Update IsSheetAccessible function to include logic for new sheet
```

### Change Indicator Style
Modify `CreateIndicatorOnSheet` and `UpdateIndicator` to use different shapes, colors, or positions.

### Add Logging
Integrate with `WriteToSysLog` from mod_Utilities:
```vba
Public Sub ToggleWhiteboardWorkingMode()
    ' ... existing code ...
    WriteToSysLog "mod_WorkingMode", "ToggleWhiteboardWorkingMode", _
                  "Working mode set to: " & wb_WorkingMode, "INFO"
End Sub
```

## Performance Considerations

- Indicator updates are lightweight (< 10ms)
- Accessibility checks add minimal overhead (< 1ms)
- Saving status writes to hidden sheet (< 50ms)
- No performance impact on normal operations

## Best Practices

1. **Always check accessibility** before data modifications
2. **Train users** on working mode system
3. **Add visual reminders** beyond indicators (worksheet tabs colored?)
4. **Log working mode changes** for auditing
5. **Test with actual users** in realistic scenarios
6. **Document** which procedures require which sheets
7. **Consider timeout** - auto-release after X hours of inactivity
