# Synchronization Patterns - Complete Implementation

Complete patterns for bidirectional synchronization between Excel sheets with validation and conflict resolution.

## Complete Synchronization System

Based on real-world whiteboard synchronization requirements.

### Main Synchronization Function

```vba
'==============================================================================
' MODULE: mod_Synchronization
' PURPOSE: Bidirectional synchronization between sheets
'==============================================================================
Option Explicit

' Type definitions
Private Type SheetData
    jobID As String
    packName As String
    deliveryDate As String
    status As String
    orderDetails As String
    customer As String
    community As String
    rowNumber As Long
    whiteboardRow As Long
    whiteboardCol As Long
End Type

Private Type ChangeInfo
    jobID As String
    packName As String
    fieldType As String        ' "Status", "Date", "OrderDetails"
    currentValue As String
    newValue As String
    targetRow As Long
    targetCol As Long
End Type

'------------------------------------------------------------------------------
' Main synchronization procedure
'------------------------------------------------------------------------------
Sub UpdateWhiteboardFromUpcoming()
    On Error GoTo ErrorHandler
    
    Dim wsWhiteboard As Worksheet
    Dim wsUpcoming As Worksheet
    Dim sourceRecords() As SheetData
    Dim changes() As ChangeInfo
    Dim recordCount As Long
    Dim changeCount As Long
    Dim debugInfo As String
    Dim colorDict As Object
    Dim response As VbMsgBoxResult
    
    debugInfo = "Starting Whiteboard update procedure" & vbNewLine
    
    ' Verify worksheets exist
    If Not WorksheetExists("WHITE BOARD") Or Not WorksheetExists("Upcoming Packs") Then
        MsgBox "Required worksheets not found.", vbExclamation
        Exit Sub
    End If
    
    ' Check if sheets are accessible (working mode check)
    If Not IsSheetAccessible("WHITE BOARD") Then Exit Sub
    If Not IsSheetAccessible("Upcoming Packs") Then Exit Sub
    
    ' Get worksheet references
    Set wsWhiteboard = ThisWorkbook.Worksheets("WHITE BOARD")
    Set wsUpcoming = ThisWorkbook.Worksheets("Upcoming Packs")
    
    ' Create color dictionary for status mapping
    Set colorDict = CreateColorDictionary()
    
    ' Step 1: Load source data from Upcoming Packs
    recordCount = LoadSourceData(wsUpcoming, sourceRecords, debugInfo)
    If recordCount = 0 Then
        MsgBox "No records found in Upcoming Packs.", vbExclamation
        Exit Sub
    End If
    
    ' Step 2: Map source records to Whiteboard locations
    FindTargetLocations wsWhiteboard, sourceRecords, recordCount, debugInfo
    
    ' Step 3: Detect changes between sheets
    changeCount = DetectChanges(wsWhiteboard, sourceRecords, recordCount, _
                                changes, colorDict, debugInfo)
    
    ' Step 4: Process changes if found
    If changeCount > 0 Then
        ' Validate changes (business rules)
        If ValidateChanges(changes, changeCount, sourceRecords, recordCount, debugInfo) Then
            ' Display changes and get confirmation
            response = DisplayChangesAndConfirm(changes, changeCount)
            
            If response = vbYes Then
                ' Apply changes
                If ApplyChanges(wsWhiteboard, changes, changeCount, colorDict, debugInfo) Then
                    MsgBox "All changes applied successfully!", vbInformation
                    
                    ' Log sync
                    LogSynchronization "Upcoming Packs", "WHITE BOARD", changeCount
                Else
                    MsgBox "Error applying changes. Changes rolled back.", vbCritical
                End If
            Else
                MsgBox "Update cancelled by user.", vbInformation
            End If
        Else
            MsgBox "Validation failed. Update cancelled.", vbExclamation
        End If
    Else
        MsgBox "No changes detected. Sheets are synchronized.", vbInformation
    End If
    
    Debug.Print debugInfo
    Exit Sub
    
ErrorHandler:
    MsgBox "Error occurred: " & Err.Description & vbNewLine & _
           "Correlation ID: " & CORRELATION_ID, vbCritical
    Debug.Print debugInfo
End Sub

'------------------------------------------------------------------------------
' Load source data from Upcoming Packs sheet
'------------------------------------------------------------------------------
Private Function LoadSourceData(ws As Worksheet, _
                                ByRef records() As SheetData, _
                                ByRef debugInfo As String) As Long
    Dim lastRow As Long
    Dim i As Long, count As Long
    
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    If lastRow <= 1 Then
        LoadSourceData = 0
        Exit Function
    End If
    
    ' Initialize array
    ReDim records(1 To lastRow - 1)
    count = 0
    
    debugInfo = debugInfo & "Loading source data..." & vbNewLine
    
    ' Load each row
    For i = 2 To lastRow
        If Not IsEmpty(ws.Cells(i, 1).Value) Then
            count = count + 1
            
            With records(count)
                .jobID = Trim(CStr(ws.Cells(i, 1).Value))
                .packName = Trim(CStr(ws.Cells(i, 2).Value))
                .deliveryDate = Trim(CStr(ws.Cells(i, 3).Value))
                .status = Trim(CStr(ws.Cells(i, 4).Value))
                .orderDetails = Trim(CStr(ws.Cells(i, 5).Value))
                .customer = Trim(CStr(ws.Cells(i, 6).Value))
                .community = Trim(CStr(ws.Cells(i, 7).Value))
                .rowNumber = i
                .whiteboardRow = 0
                .whiteboardCol = 0
            End With
            
            debugInfo = debugInfo & "  Loaded: " & records(count).jobID & _
                       " - " & records(count).packName & vbNewLine
        End If
    Next i
    
    ' Resize to actual count
    If count > 0 Then
        ReDim Preserve records(1 To count)
    End If
    
    debugInfo = debugInfo & "Total records loaded: " & count & vbNewLine & vbNewLine
    LoadSourceData = count
End Function

'------------------------------------------------------------------------------
' Find Whiteboard locations for each source record
'------------------------------------------------------------------------------
Private Sub FindTargetLocations(ws As Worksheet, _
                                ByRef records() As SheetData, _
                                recordCount As Long, _
                                ByRef debugInfo As String)
    Dim lastRow As Long, lastCol As Long
    Dim r As Long, c As Long
    Dim i As Long
    Dim currentCustomer As String
    Dim currentSubdiv As String
    Dim cellValue As String
    Dim foundCount As Long
    
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = ws.Cells(4, ws.Columns.Count).End(xlToLeft).Column
    
    debugInfo = debugInfo & "Finding Whiteboard locations..." & vbNewLine
    foundCount = 0
    
    ' Find customer header row (row 4)
    ' Find subdivision column (column A)
    ' Match each record to its location
    
    For i = 1 To recordCount
        debugInfo = debugInfo & "Searching for: " & records(i).jobID & _
                   " - " & records(i).packName & vbNewLine
        
        ' Find customer column
        For c = 2 To lastCol
            If UCase(Trim(ws.Cells(4, c).Value)) = UCase(Trim(records(i).customer)) Then
                
                ' Find subdivision row
                For r = 5 To lastRow Step 2  ' Job data every 2 rows
                    If UCase(Trim(ws.Cells(r, 1).Value)) = UCase(Trim(records(i).community)) Then
                        
                        ' Check if this cell contains our job
                        cellValue = Trim(ws.Cells(r, c).Value)
                        
                        ' Parse format: "JobID-PackName"
                        If InStr(cellValue, records(i).jobID) > 0 And _
                           InStr(cellValue, records(i).packName) > 0 Then
                            
                            records(i).whiteboardRow = r
                            records(i).whiteboardCol = c
                            foundCount = foundCount + 1
                            
                            debugInfo = debugInfo & "  Found at Row=" & r & _
                                       ", Col=" & c & vbNewLine
                            Exit For
                        End If
                    End If
                Next r
                
                If records(i).whiteboardRow > 0 Then Exit For
            End If
        Next c
        
        If records(i).whiteboardRow = 0 Then
            debugInfo = debugInfo & "  WARNING: Not found in Whiteboard" & vbNewLine
        End If
        
        debugInfo = debugInfo & vbNewLine
    Next i
    
    debugInfo = debugInfo & "Found " & foundCount & " out of " & _
               recordCount & " records in Whiteboard" & vbNewLine & vbNewLine
End Sub

'------------------------------------------------------------------------------
' Detect changes between source and target
'------------------------------------------------------------------------------
Private Function DetectChanges(ws As Worksheet, _
                              records() As SheetData, _
                              recordCount As Long, _
                              ByRef changes() As ChangeInfo, _
                              colorDict As Object, _
                              ByRef debugInfo As String) As Long
    Dim i As Long
    Dim changeCount As Long
    Dim currentDate As String
    Dim currentDetails As String
    Dim currentStatus As String
    Dim cellColor As Long
    
    ReDim changes(1 To recordCount * 3)  ' Max 3 changes per record
    changeCount = 0
    
    debugInfo = debugInfo & "Detecting changes..." & vbNewLine
    
    For i = 1 To recordCount
        If records(i).whiteboardRow > 0 And records(i).whiteboardCol > 0 Then
            
            ' Get current whiteboard values
            currentDate = Trim(CStr(ws.Cells(records(i).whiteboardRow, _
                                             records(i).whiteboardCol).Value))
            currentDetails = Trim(CStr(ws.Cells(records(i).whiteboardRow + 1, _
                                                records(i).whiteboardCol).Value))
            cellColor = ws.Cells(records(i).whiteboardRow, _
                                records(i).whiteboardCol).Interior.Color
            
            ' Get status from color
            currentStatus = GetStatusFromColor(cellColor, colorDict)
            
            ' Compare date
            If currentDate <> records(i).deliveryDate Then
                changeCount = changeCount + 1
                With changes(changeCount)
                    .jobID = records(i).jobID
                    .packName = records(i).packName
                    .fieldType = "Date"
                    .currentValue = currentDate
                    .newValue = records(i).deliveryDate
                    .targetRow = records(i).whiteboardRow
                    .targetCol = records(i).whiteboardCol
                End With
                
                debugInfo = debugInfo & "  Date change: " & currentDate & _
                           " -> " & records(i).deliveryDate & vbNewLine
            End If
            
            ' Compare status
            If currentStatus <> records(i).status Then
                changeCount = changeCount + 1
                With changes(changeCount)
                    .jobID = records(i).jobID
                    .packName = records(i).packName
                    .fieldType = "Status"
                    .currentValue = currentStatus
                    .newValue = records(i).status
                    .targetRow = records(i).whiteboardRow
                    .targetCol = records(i).whiteboardCol
                End With
                
                debugInfo = debugInfo & "  Status change: " & currentStatus & _
                           " -> " & records(i).status & vbNewLine
            End If
            
            ' Compare order details
            If currentDetails <> records(i).orderDetails Then
                changeCount = changeCount + 1
                With changes(changeCount)
                    .jobID = records(i).jobID
                    .packName = records(i).packName
                    .fieldType = "OrderDetails"
                    .currentValue = currentDetails
                    .newValue = records(i).orderDetails
                    .targetRow = records(i).whiteboardRow + 1  ' Details in row below
                    .targetCol = records(i).whiteboardCol
                End With
                
                debugInfo = debugInfo & "  Details change: " & currentDetails & _
                           " -> " & records(i).orderDetails & vbNewLine
            End If
        End If
    Next i
    
    ' Resize to actual count
    If changeCount > 0 Then
        ReDim Preserve changes(1 To changeCount)
    End If
    
    debugInfo = debugInfo & "Total changes detected: " & changeCount & vbNewLine & vbNewLine
    DetectChanges = changeCount
End Function

'------------------------------------------------------------------------------
' Validate changes against business rules
'------------------------------------------------------------------------------
Private Function ValidateChanges(changes() As ChangeInfo, _
                                changeCount As Long, _
                                records() As SheetData, _
                                recordCount As Long, _
                                ByRef debugInfo As String) As Boolean
    Dim i As Long, j As Long
    Dim jobsToValidate() As String
    Dim validateCount As Long
    Dim hasOrderNumber As Boolean
    Dim failed As Boolean
    
    debugInfo = debugInfo & "Validating changes..." & vbNewLine
    failed = False
    
    ' Find all jobs changing to "Scheduled" status
    ReDim jobsToValidate(1 To changeCount)
    validateCount = 0
    
    For i = 1 To changeCount
        If changes(i).fieldType = "Status" And _
           changes(i).newValue = "Scheduled" Then
            validateCount = validateCount + 1
            jobsToValidate(validateCount) = changes(i).jobID & "_" & changes(i).packName
        End If
    Next i
    
    ' Validate each scheduled job has order number
    If validateCount > 0 Then
        debugInfo = debugInfo & "Validating " & validateCount & _
                   " jobs changing to Scheduled..." & vbNewLine
        
        For i = 1 To validateCount
            Dim parts() As String
            parts = Split(jobsToValidate(i), "_")
            
            hasOrderNumber = False
            
            ' Check if order number exists in source records
            For j = 1 To recordCount
                If records(j).jobID = parts(0) And _
                   records(j).packName = parts(1) Then
                    If Trim(records(j).orderDetails) <> "" Then
                        hasOrderNumber = True
                        debugInfo = debugInfo & "  ✓ " & parts(0) & " - " & _
                                   parts(1) & " has order number" & vbNewLine
                    End If
                    Exit For
                End If
            Next j
            
            ' Validation failure
            If Not hasOrderNumber Then
                debugInfo = debugInfo & "  ✗ FAILED: " & parts(0) & " - " & _
                           parts(1) & " missing order number" & vbNewLine
                failed = True
                
                MsgBox "Validation Error: Job " & parts(0) & " - " & parts(1) & vbNewLine & _
                       "Cannot be Scheduled without an Order Number.", vbExclamation
            End If
        Next i
    End If
    
    If failed Then
        debugInfo = debugInfo & "Validation FAILED" & vbNewLine
        ValidateChanges = False
    Else
        debugInfo = debugInfo & "Validation PASSED" & vbNewLine & vbNewLine
        ValidateChanges = True
    End If
End Function

'------------------------------------------------------------------------------
' Display changes to user and get confirmation
'------------------------------------------------------------------------------
Private Function DisplayChangesAndConfirm(changes() As ChangeInfo, _
                                         changeCount As Long) As VbMsgBoxResult
    Dim dateChanges As Long, statusChanges As Long, detailChanges As Long
    Dim msg As String
    Dim i As Long
    
    ' Count change types
    For i = 1 To changeCount
        Select Case changes(i).fieldType
            Case "Date": dateChanges = dateChanges + 1
            Case "Status": statusChanges = statusChanges + 1
            Case "OrderDetails": detailChanges = detailChanges + 1
        End Select
    Next i
    
    ' Summary message
    msg = "Found " & changeCount & " changes:" & vbNewLine & vbNewLine & _
          "• " & dateChanges & " delivery date changes" & vbNewLine & _
          "• " & statusChanges & " status changes" & vbNewLine & _
          "• " & detailChanges & " order detail changes" & vbNewLine & vbNewLine & _
          "Apply these changes to Whiteboard?"
    
    DisplayChangesAndConfirm = MsgBox(msg, vbYesNo + vbQuestion, "Confirm Changes")
End Function

'------------------------------------------------------------------------------
' Apply changes to target sheet
'------------------------------------------------------------------------------
Private Function ApplyChanges(ws As Worksheet, _
                             changes() As ChangeInfo, _
                             changeCount As Long, _
                             colorDict As Object, _
                             ByRef debugInfo As String) As Boolean
    Dim i As Long
    Dim backup() As Variant
    
    On Error GoTo RollbackChanges
    
    ' Backup current values
    ReDim backup(1 To changeCount, 1 To 3)
    For i = 1 To changeCount
        backup(i, 1) = ws.Cells(changes(i).targetRow, changes(i).targetCol).Value
        backup(i, 2) = ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color
        backup(i, 3) = i
    Next i
    
    debugInfo = debugInfo & "Applying changes..." & vbNewLine
    Application.ScreenUpdating = False
    
    ' Apply each change
    For i = 1 To changeCount
        Select Case changes(i).fieldType
            Case "Date"
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = _
                    changes(i).newValue
                debugInfo = debugInfo & "  Applied date change" & vbNewLine
                
            Case "Status"
                Dim statusColor As Long
                statusColor = GetColorFromStatus(changes(i).newValue, colorDict)
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color = _
                    statusColor
                debugInfo = debugInfo & "  Applied status change" & vbNewLine
                
            Case "OrderDetails"
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = _
                    changes(i).newValue
                debugInfo = debugInfo & "  Applied detail change" & vbNewLine
        End Select
    Next i
    
    Application.ScreenUpdating = True
    debugInfo = debugInfo & "All changes applied successfully" & vbNewLine
    ApplyChanges = True
    Exit Function
    
RollbackChanges:
    ' Restore backup
    Application.ScreenUpdating = False
    For i = 1 To UBound(backup, 1)
        ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = backup(i, 1)
        ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color = backup(i, 2)
    Next i
    Application.ScreenUpdating = True
    
    debugInfo = debugInfo & "ERROR: Rolled back changes - " & Err.Description & vbNewLine
    ApplyChanges = False
End Function

'------------------------------------------------------------------------------
' Helper: Create color dictionary
'------------------------------------------------------------------------------
Private Function CreateColorDictionary() As Object
    Dim dict As Object
    Set dict = CreateObject("Scripting.Dictionary")
    
    ' Map status names to colors
    dict.Add "Not Done", RGB(255, 0, 0)
    dict.Add "Ready to Write", RGB(255, 192, 0)
    dict.Add "Scheduled", RGB(255, 255, 0)
    dict.Add "Shipped/Done", RGB(146, 208, 80)
    
    Set CreateColorDictionary = dict
End Function

'------------------------------------------------------------------------------
' Helper: Get status from color
'------------------------------------------------------------------------------
Private Function GetStatusFromColor(cellColor As Long, colorDict As Object) As String
    Dim key As Variant
    
    For Each key In colorDict.Keys
        If colorDict(key) = cellColor Then
            GetStatusFromColor = key
            Exit Function
        End If
    Next key
    
    GetStatusFromColor = "Unknown"
End Function

'------------------------------------------------------------------------------
' Helper: Get color from status
'------------------------------------------------------------------------------
Private Function GetColorFromStatus(statusText As String, colorDict As Object) As Long
    On Error Resume Next
    GetColorFromStatus = colorDict(statusText)
    If Err.Number <> 0 Then GetColorFromStatus = RGB(255, 255, 255)
    On Error GoTo 0
End Function

'------------------------------------------------------------------------------
' Helper: Log synchronization
'------------------------------------------------------------------------------
Private Sub LogSynchronization(sourceSheet As String, targetSheet As String, _
                              changeCount As Long)
    WriteToSysLog "mod_Synchronization", "UpdateWhiteboardFromUpcoming", _
                  "Synchronized " & changeCount & " changes from " & sourceSheet & _
                  " to " & targetSheet, "INFO"
End Sub
```

## Usage

```vba
' Synchronize Upcoming Packs to Whiteboard
UpdateWhiteboardFromUpcoming

' The process:
' 1. Loads source data
' 2. Maps to target locations
' 3. Detects changes
' 4. Validates business rules
' 5. Shows confirmation dialog
' 6. Applies changes with rollback support
' 7. Logs synchronization
```

## Key Features

- **Complete validation** before applying changes
- **Rollback capability** if errors occur
- **User confirmation** with change summary
- **Detailed logging** for debugging
- **Working mode integration** for safety
- **Business rule enforcement** (e.g., scheduled jobs need order numbers)

## Customization

Modify validation rules in `ValidateChanges` function to match your business logic.
