---
name: data-extraction-sync
description: Extract data from complex Excel layouts and synchronize across multiple sheets. Use when parsing non-standard Excel structures, extracting data from visual/formatted layouts, synchronizing data between sheets bidirectionally, detecting and tracking changes, mapping data between different structures, or maintaining consistency across related worksheets. Includes patterns for whiteboard extraction, change detection, update propagation, and data validation during sync.
---

# Data Extraction & Synchronization

This skill provides comprehensive patterns for extracting data from complex Excel layouts and keeping multiple sheets synchronized.

## Overview

Handle complex data extraction and synchronization scenarios:
- **Complex Layout Parsing**: Extract from visual/formatted sheets (whiteboards, calendars, matrices)
- **Multi-Sheet Synchronization**: Keep related sheets in sync bidirectionally
- **Change Detection**: Identify what changed between versions
- **Update Propagation**: Apply changes with validation
- **Data Mapping**: Transform between different structures

## Core Concepts

### The Challenge

Traditional Excel sheets are simple tables. But real-world workbooks often have:
- Visual layouts (whiteboards with grouped data)
- Multi-row records (header row + detail rows)
- Matrix structures (rows AND columns carry meaning)
- Denormalized data (repeated information)
- Multiple related sheets that must stay in sync

### The Solution

Use structured data types and systematic extraction/sync patterns.

## Pattern 1: Data Type Definitions

Define structures for your data:

```vba
'====================================================================
' Data structure types
'====================================================================

' Represents a single data record
Private Type SheetData
    jobID As String
    packName As String
    deliveryDate As String
    status As String
    orderDetails As String
    customer As String
    community As String
    lot As String
    rowNumber As Long           ' Source row in sheet
    whiteboardRow As Long       ' Target row in whiteboard
    whiteboardCol As Long       ' Target column in whiteboard
End Type

' Represents a detected change
Private Type ChangeInfo
    jobID As String
    packName As String
    fieldType As String         ' "Status", "Date", "OrderDetails"
    currentValue As String
    newValue As String
    targetRow As Long
    targetCol As Long
End Type

' Represents extraction results
Private Type ExtractionResult
    recordCount As Long
    records() As SheetData
    errors() As String
    errorCount As Long
    extractionTime As Date
End Type
```

## Pattern 2: Complex Layout Extraction

Extract from visual layouts where data location has meaning.

### Step 1: Understand the Layout

```vba
' Example: Whiteboard layout
' - Column headers are customer names (starting row 5)
' - First column (A) contains subdivision names
' - Data cells contain job information in a specific format
' - Each job spans 2 rows (date on row 1, order # on row 2)

' Layout visualization:
'     A          B           C           D
' 1  [Title]
' 2  [Header]
' 3  [Blank]
' 4  [Column]  Customer1   Customer2   Customer3
' 5  Subdiv1   JobID-Pack  JobID-Pack  JobID-Pack
' 6            Date/Order  Date/Order  Date/Order
' 7  Subdiv2   JobID-Pack  JobID-Pack  JobID-Pack
' 8            Date/Order  Date/Order  Date/Order
```

### Step 2: Map the Structure

```vba
Private Function MapWhiteboardStructure(ws As Worksheet) As Dictionary
    Dim layoutMap As New Dictionary
    Dim lastRow As Long, lastCol As Long
    Dim r As Long, c As Long
    
    ' Find boundaries
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = ws.Cells(5, ws.Columns.Count).End(xlToLeft).Column
    
    ' Map customer columns (row 4)
    For c = 2 To lastCol
        Dim customerName As String
        customerName = Trim(ws.Cells(4, c).Value)
        If customerName <> "" Then
            layoutMap.Add "Customer_Col" & c, customerName
        End If
    Next c
    
    ' Map subdivision rows
    For r = 5 To lastRow Step 2  ' Every 2 rows (job + details)
        Dim subdivName As String
        subdivName = Trim(ws.Cells(r, 1).Value)
        If subdivName <> "" Then
            layoutMap.Add "Subdiv_Row" & r, subdivName
        End If
    Next r
    
    Set MapWhiteboardStructure = layoutMap
End Function
```

### Step 3: Extract Data

```vba
Function ExtractFromWhiteboard(ws As Worksheet, _
                               ByRef extraction As ExtractionResult) As Boolean
    On Error GoTo ErrorHandler
    
    Dim layoutMap As Dictionary
    Dim lastRow As Long, lastCol As Long
    Dim r As Long, c As Long
    Dim recordCount As Long
    Dim tempRecords() As SheetData
    
    ' Map structure
    Set layoutMap = MapWhiteboardStructure(ws)
    
    ' Find boundaries
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = ws.Cells(4, ws.Columns.Count).End(xlToLeft).Column
    
    ' Initialize array
    ReDim tempRecords(1 To (lastRow - 4) * (lastCol - 1))
    recordCount = 0
    
    ' Extract data from each cell
    For r = 5 To lastRow Step 2  ' Job rows (every 2 rows)
        Dim subdivName As String
        subdivName = Trim(ws.Cells(r, 1).Value)
        
        If subdivName <> "" Then
            For c = 2 To lastCol
                Dim cellValue As String
                cellValue = Trim(ws.Cells(r, c).Value)
                
                If cellValue <> "" Then
                    recordCount = recordCount + 1
                    
                    ' Parse cell value (format: "JobID-PackName")
                    Dim parts() As String
                    parts = Split(cellValue, "-")
                    
                    If UBound(parts) >= 1 Then
                        With tempRecords(recordCount)
                            .jobID = Trim(parts(0))
                            .packName = Trim(parts(1))
                            .community = subdivName
                            .customer = layoutMap("Customer_Col" & c)
                            
                            ' Get date and order details from row below
                            Dim detailsCell As String
                            detailsCell = Trim(ws.Cells(r + 1, c).Value)
                            
                            ' Parse details (format: "MM/DD/YYYY / Order#")
                            Dim detailParts() As String
                            detailParts = Split(detailsCell, "/")
                            
                            If UBound(detailParts) >= 2 Then
                                .deliveryDate = Trim(detailParts(0)) & "/" & _
                                               Trim(detailParts(1)) & "/" & _
                                               Trim(detailParts(2))
                                If UBound(detailParts) >= 3 Then
                                    .orderDetails = Trim(detailParts(3))
                                End If
                            End If
                            
                            ' Store location
                            .whiteboardRow = r
                            .whiteboardCol = c
                            .rowNumber = recordCount
                        End With
                    End If
                End If
            Next c
        End If
    Next r
    
    ' Store results
    With extraction
        .recordCount = recordCount
        If recordCount > 0 Then
            ReDim .records(1 To recordCount)
            Dim i As Long
            For i = 1 To recordCount
                .records(i) = tempRecords(i)
            Next i
        End If
        .extractionTime = Now
        .errorCount = 0
    End With
    
    ExtractFromWhiteboard = True
    Exit Function
    
ErrorHandler:
    ExtractFromWhiteboard = False
    ' Log error details
End Function
```

## Pattern 3: Change Detection

Detect what changed between two data sets.

```vba
Function DetectChanges(sourceRecords() As SheetData, sourceCount As Long, _
                      targetRecords() As SheetData, targetCount As Long, _
                      ByRef changes() As ChangeInfo) As Long
    Dim changeCount As Long
    Dim i As Long, j As Long
    Dim found As Boolean
    
    ReDim changes(1 To sourceCount * 3)  ' Max 3 changes per record
    changeCount = 0
    
    ' Compare each source record with target
    For i = 1 To sourceCount
        found = False
        
        ' Find matching record in target
        For j = 1 To targetCount
            If sourceRecords(i).jobID = targetRecords(j).jobID And _
               sourceRecords(i).packName = targetRecords(j).packName Then
                found = True
                
                ' Compare fields
                ' Status change
                If sourceRecords(i).status <> targetRecords(j).status Then
                    changeCount = changeCount + 1
                    With changes(changeCount)
                        .jobID = sourceRecords(i).jobID
                        .packName = sourceRecords(i).packName
                        .fieldType = "Status"
                        .currentValue = targetRecords(j).status
                        .newValue = sourceRecords(i).status
                        .targetRow = targetRecords(j).whiteboardRow
                        .targetCol = targetRecords(j).whiteboardCol
                    End With
                End If
                
                ' Date change
                If sourceRecords(i).deliveryDate <> targetRecords(j).deliveryDate Then
                    changeCount = changeCount + 1
                    With changes(changeCount)
                        .jobID = sourceRecords(i).jobID
                        .packName = sourceRecords(i).packName
                        .fieldType = "Date"
                        .currentValue = targetRecords(j).deliveryDate
                        .newValue = sourceRecords(i).deliveryDate
                        .targetRow = targetRecords(j).whiteboardRow
                        .targetCol = targetRecords(j).whiteboardCol
                    End With
                End If
                
                ' Order details change
                If sourceRecords(i).orderDetails <> targetRecords(j).orderDetails Then
                    changeCount = changeCount + 1
                    With changes(changeCount)
                        .jobID = sourceRecords(i).jobID
                        .packName = sourceRecords(i).packName
                        .fieldType = "OrderDetails"
                        .currentValue = targetRecords(j).orderDetails
                        .newValue = sourceRecords(i).orderDetails
                        .targetRow = targetRecords(j).whiteboardRow + 1
                        .targetCol = targetRecords(j).whiteboardCol
                    End With
                End If
                
                Exit For
            End If
        Next j
        
        ' Record not found in target (new record)
        If Not found Then
            ' Handle new record creation
        End If
    Next i
    
    ' Resize array
    If changeCount > 0 Then
        ReDim Preserve changes(1 To changeCount)
    End If
    
    DetectChanges = changeCount
End Function
```

## Pattern 4: Update Propagation

Apply detected changes with validation.

See `references/sync-patterns.md` for complete implementation including:
- Validation before updates
- Transaction-like updates (all or nothing)
- Rollback capability
- Update logging
- Conflict resolution

Basic pattern:
```vba
Function ApplyChanges(ws As Worksheet, changes() As ChangeInfo, _
                     changeCount As Long, Optional validate As Boolean = True) As Boolean
    Dim i As Long
    Dim backupValues() As Variant
    
    ' Backup current values for rollback
    ReDim backupValues(1 To changeCount, 1 To 2)
    For i = 1 To changeCount
        backupValues(i, 1) = ws.Cells(changes(i).targetRow, changes(i).targetCol).Value
        backupValues(i, 2) = ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color
    Next i
    
    ' Apply changes
    Application.ScreenUpdating = False
    On Error GoTo RollbackChanges
    
    For i = 1 To changeCount
        Select Case changes(i).fieldType
            Case "Status"
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color = _
                    GetStatusColor(changes(i).newValue)
                    
            Case "Date"
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = _
                    changes(i).newValue
                    
            Case "OrderDetails"
                ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = _
                    changes(i).newValue
        End Select
    Next i
    
    Application.ScreenUpdating = True
    ApplyChanges = True
    Exit Function
    
RollbackChanges:
    ' Restore backup values
    For i = 1 To changeCount
        ws.Cells(changes(i).targetRow, changes(i).targetCol).Value = backupValues(i, 1)
        ws.Cells(changes(i).targetRow, changes(i).targetCol).Interior.Color = backupValues(i, 2)
    Next i
    Application.ScreenUpdating = True
    ApplyChanges = False
End Function
```

## Pattern 5: Bidirectional Synchronization

Keep two sheets in sync regardless of where changes occur.

```vba
Sub SynchronizeSheets(sheet1 As Worksheet, sheet2 As Worksheet)
    Dim extraction1 As ExtractionResult
    Dim extraction2 As ExtractionResult
    Dim changes() As ChangeInfo
    Dim changeCount As Long
    
    ' Extract from both sheets
    ExtractFromSheet1 sheet1, extraction1
    ExtractFromSheet2 sheet2, extraction2
    
    ' Detect changes from sheet1 to sheet2
    changeCount = DetectChanges(extraction1.records, extraction1.recordCount, _
                                extraction2.records, extraction2.recordCount, changes)
    
    If changeCount > 0 Then
        ' Show changes to user
        Dim response As VbMsgBoxResult
        response = DisplayChangesForConfirmation(changes, changeCount)
        
        If response = vbYes Then
            ' Apply changes to sheet2
            ApplyChanges sheet2, changes, changeCount
            
            ' Log sync
            LogSynchronization sheet1.Name, sheet2.Name, changeCount
        End If
    Else
        MsgBox "Sheets are already synchronized", vbInformation
    End If
End Sub
```

## Best Practices

### Extraction
1. **Map Structure First**: Understand layout before extracting
2. **Handle Blanks**: Empty cells are common in visual layouts
3. **Validate Format**: Check if data matches expected format
4. **Log Failures**: Track which cells couldn't be parsed
5. **Test Edge Cases**: Empty rows, merged cells, formulas

### Synchronization
1. **Detect Before Apply**: Always show user what will change
2. **Validate Changes**: Check business rules before applying
3. **Backup Before Update**: Enable rollback if something fails
4. **Lock During Sync**: Use working mode to prevent conflicts
5. **Log Everything**: Track all syncs for debugging

### Performance
1. **Batch Operations**: Group similar changes
2. **Turn Off Screen Updating**: Speeds up updates
3. **Limit Scope**: Only process necessary rows/columns
4. **Use Arrays**: Faster than cell-by-cell operations
5. **Minimize Worksheet Access**: Read once, process in memory

## Quick Reference

```vba
' Define data structures
Private Type SheetData: ...: End Type
Private Type ChangeInfo: ...: End Type

' Extract from complex layout
ExtractFromWhiteboard ws, extraction

' Detect changes
changeCount = DetectChanges(source, sourceCount, target, targetCount, changes)

' Apply changes
ApplyChanges ws, changes, changeCount

' Full synchronization
SynchronizeSheets sheet1, sheet2
```

## Additional Resources

- `references/sync-patterns.md` - Complete sync implementation
- `references/extraction-examples.md` - Real-world extraction patterns
- `references/conflict-resolution.md` - Handling sync conflicts
