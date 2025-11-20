---
name: html-dashboard-export
description: Create professional Excel dashboards and export data to styled HTML reports. Use when users need to create interactive dashboards in Excel, export Excel data to HTML with modern CSS styling, generate reports with visualizations, create printable schedules, build responsive web reports from Excel data, or design data visualization interfaces. Includes patterns for stat cards, navigation bars, responsive tables, charts, and multi-page report layouts.
---

# HTML Dashboard & Export System

This skill provides patterns and code for creating professional dashboards in Excel and exporting data to modern, styled HTML reports.

## Overview

Transform Excel data into:
- **Interactive Dashboards**: Professional Excel-based dashboards with metrics, charts, and navigation
- **HTML Reports**: Modern web reports with responsive design and print support
- **Data Visualizations**: Charts, stat cards, and visual indicators
- **Printable Documents**: PDF-ready reports and schedules

## Dashboard Creation in Excel

### Pattern 1: Professional Dashboard Layout

Create a clean, organized dashboard sheet with distinct sections:

```vba
Sub CreateEnhancedDashboard()
    Dim wsDash As Worksheet
    Dim shp As Shape
    
    Application.ScreenUpdating = False
    
    ' Create or get dashboard sheet
    On Error Resume Next
    Set wsDash = ThisWorkbook.Worksheets("Dashboard")
    If wsDash Is Nothing Then
        Set wsDash = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Sheets(1))
        wsDash.Name = "Dashboard"
    Else
        wsDash.Cells.Clear
        For Each shp In wsDash.Shapes: shp.Delete: Next shp
    End If
    On Error GoTo 0
    
    With wsDash
        ' Light gray background
        .Cells.Interior.Color = RGB(245, 245, 245)
        
        ' Title Bar (Row 1-2)
        .Range("A1:M2").Merge
        .Range("A1:M2").Interior.Color = RGB(0, 112, 192)  ' Blue
        .Cells(1, 1).Value = "SCHEDULE MANAGEMENT SYSTEM"
        With .Cells(1, 1).Font
            .Size = 24
            .Bold = True
            .Color = RGB(255, 255, 255)
        End With
        .Cells(1, 1).HorizontalAlignment = xlCenter
        .Cells(1, 1).VerticalAlignment = xlCenter
        .Rows("1:2").RowHeight = 40
        
        ' Info Bar (Row 3)
        .Range("A3:M3").Interior.Color = RGB(200, 200, 200)
        .Cells(3, 1).Value = "User: " & Application.UserName
        .Cells(3, 5).Value = "Date: " & Format(Date, "MMMM DD, YYYY")
        .Cells(3, 10).Value = "Time: " & Format(Now, "HH:MM AM/PM")
        
        ' Section Headers
        Call CreateDashboardSection(wsDash, "Quick Actions", 5, 1, 4)
        Call CreateDashboardSection(wsDash, "Data Management", 5, 5, 4)
        Call CreateDashboardSection(wsDash, "Reports", 5, 9, 4)
        
        ' Action Buttons
        Call CreateActionButton(wsDash, "Extract Data", 7, 1, "ExtractData", RGB(0, 176, 80))
        Call CreateActionButton(wsDash, "Update Status", 9, 1, "UpdateStatus", RGB(0, 112, 192))
        Call CreateActionButton(wsDash, "Archive", 11, 1, "Archive", RGB(192, 0, 0))
        
        ' Data Buttons
        Call CreateActionButton(wsDash, "Customers", 7, 5, "OpenCustomers", RGB(0, 112, 192))
        Call CreateActionButton(wsDash, "Communities", 9, 5, "OpenCommunities", RGB(0, 112, 192))
        
        ' Report Buttons
        Call CreateActionButton(wsDash, "HTML Export", 7, 9, "ExportToHTML", RGB(255, 102, 204))
        Call CreateActionButton(wsDash, "Weekly Schedule", 9, 9, "GenerateWeekly", RGB(146, 208, 80))
        
        ' Metrics Section
        Call AddMetricsDisplay(wsDash, 14, 1)
        
        ' Chart Section
        Call AddScheduleChart(wsDash, 14, 5)
        
        .Columns("A:M").ColumnWidth = 15
    End With
    
    Application.ScreenUpdating = True
    MsgBox "Dashboard created successfully!", vbInformation
End Sub
```

### Pattern 2: Dashboard Components

#### Section Headers
```vba
Sub CreateDashboardSection(ws As Worksheet, title As String, _
                          row As Long, col As Long, colspan As Long)
    With ws
        .Range(.Cells(row, col), .Cells(row, col + colspan - 1)).Merge
        .Cells(row, col).Value = title
        With .Cells(row, col)
            .Font.Size = 14
            .Font.Bold = True
            .Interior.Color = RGB(70, 130, 180)  ' Steel Blue
            .Font.Color = RGB(255, 255, 255)
            .HorizontalAlignment = xlCenter
            .VerticalAlignment = xlCenter
        End With
        .Rows(row).RowHeight = 30
    End With
End Sub
```

#### Action Buttons
```vba
Sub CreateActionButton(ws As Worksheet, caption As String, _
                      row As Long, col As Long, macroName As String, _
                      buttonColor As Long)
    Dim btn As Shape
    Dim cellRange As Range
    
    Set cellRange = ws.Range(ws.Cells(row, col), ws.Cells(row + 1, col + 1))
    
    ' Create rounded rectangle button
    Set btn = ws.Shapes.AddShape(msoShapeRoundedRectangle, _
                                 cellRange.Left, cellRange.Top, _
                                 cellRange.Width, cellRange.Height)
    
    With btn
        .Name = "btn" & Replace(caption, " ", "")
        .Fill.ForeColor.RGB = buttonColor
        .Line.Visible = msoTrue
        .Line.ForeColor.RGB = RGB(100, 100, 100)
        .Line.Weight = 2
        .OnAction = macroName
        
        ' Add text
        With .TextFrame2
            .TextRange.Text = caption
            .TextRange.Font.Size = 12
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
        
        ' Shadow effect
        With .Shadow
            .Type = msoShadow6
            .ForeColor.RGB = RGB(0, 0, 0)
            .Transparency = 0.5
        End With
    End With
End Sub
```

#### Metrics Display
```vba
Sub AddMetricsDisplay(ws As Worksheet, startRow As Long, startCol As Long)
    Dim metrics(1 To 4) As Variant
    Dim metricValues(1 To 4) As Long
    Dim metricColors(1 To 4) As Long
    Dim i As Long
    
    ' Get metrics from data
    metricValues(1) = GetUpcomingCount()
    metricValues(2) = GetScheduledCount()
    metricValues(3) = GetCompletedCount()
    metricValues(4) = GetThisWeekCount()
    
    metrics(1) = "Upcoming"
    metrics(2) = "Scheduled"
    metrics(3) = "Completed"
    metrics(4) = "This Week"
    
    metricColors(1) = RGB(0, 112, 192)
    metricColors(2) = RGB(255, 192, 0)
    metricColors(3) = RGB(146, 208, 80)
    metricColors(4) = RGB(112, 48, 160)
    
    ' Create metric cards
    For i = 1 To 4
        Dim cardCol As Long
        cardCol = startCol + (i - 1) * 3
        
        ' Card background
        With ws.Range(ws.Cells(startRow, cardCol), ws.Cells(startRow + 3, cardCol + 2))
            .Interior.Color = RGB(255, 255, 255)
            .BorderAround LineStyle:=xlContinuous, Weight:=xlMedium, _
                          Color:=metricColors(i)
        End With
        
        ' Metric value
        ws.Cells(startRow + 1, cardCol + 1).Value = metricValues(i)
        With ws.Cells(startRow + 1, cardCol + 1).Font
            .Size = 36
            .Bold = True
            .Color = metricColors(i)
        End With
        ws.Cells(startRow + 1, cardCol + 1).HorizontalAlignment = xlCenter
        
        ' Metric label
        ws.Cells(startRow + 2, cardCol + 1).Value = metrics(i)
        With ws.Cells(startRow + 2, cardCol + 1).Font
            .Size = 12
            .Color = RGB(100, 100, 100)
        End With
        ws.Cells(startRow + 2, cardCol + 1).HorizontalAlignment = xlCenter
    Next i
End Sub
```

## HTML Export System

### Pattern 3: Complete HTML Export

Export Excel data to a modern, styled HTML report. See `references/html-export-patterns.md` for complete implementation.

Basic structure:
```vba
Sub ExportToHTML()
    Dim htmlFile As String
    Dim htmlContent As String
    
    ' Get save location
    htmlFile = Application.GetSaveAsFilename( _
        InitialFileName:="Report_" & Format(Date, "YYYY-MM-DD") & ".html", _
        FileFilter:="HTML Files (*.html), *.html")
    
    If htmlFile = "False" Then Exit Sub
    
    ' Build HTML
    htmlContent = BuildHTMLHeader()
    htmlContent = htmlContent & BuildHTMLNavigation()
    htmlContent = htmlContent & "<div class='container'>" & vbNewLine
    htmlContent = htmlContent & BuildHTMLDashboard()
    htmlContent = htmlContent & BuildHTMLDataSection("Upcoming Jobs", "Upcoming Packs")
    htmlContent = htmlContent & BuildHTMLDataSection("Completed Jobs", "Completed Packs")
    htmlContent = htmlContent & "</div>" & vbNewLine
    htmlContent = htmlContent & BuildHTMLFooter()
    
    ' Write to file
    Dim fileNum As Integer
    fileNum = FreeFile
    Open htmlFile For Output As #fileNum
    Print #fileNum, htmlContent
    Close #fileNum
    
    ' Open in browser
    Shell "explorer.exe " & htmlFile, vbNormalFocus
    
    MsgBox "HTML export complete!", vbInformation
End Sub
```

### Pattern 4: Modern CSS Styling

Include modern, responsive CSS. See `references/css-patterns.md` for complete styles.

Key CSS patterns:
- Gradient backgrounds
- Card-based layouts
- Responsive grid systems
- Hover effects
- Print-friendly styles
- Status badges
- Sticky headers

### Pattern 5: Data Visualization in HTML

Convert Excel data to HTML tables with styling:

```vba
Private Function BuildHTMLDataSection(title As String, sheetName As String) As String
    Dim ws As Worksheet
    Dim html As String
    Dim lastRow As Long, lastCol As Long
    Dim r As Long, c As Long
    
    Set ws = ThisWorkbook.Worksheets(sheetName)
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = 10  ' Adjust based on your data
    
    html = "<div class='section'>" & vbNewLine
    html = html & "<h2>" & title & "</h2>" & vbNewLine
    html = html & "<table>" & vbNewLine
    
    ' Headers
    html = html & "<thead><tr>" & vbNewLine
    For c = 1 To lastCol
        html = html & "<th>" & ws.Cells(1, c).Value & "</th>"
    Next c
    html = html & "</tr></thead>" & vbNewLine
    
    ' Data rows
    html = html & "<tbody>" & vbNewLine
    For r = 2 To lastRow
        If Not IsEmpty(ws.Cells(r, 1).Value) Then
            html = html & "<tr>" & vbNewLine
            For c = 1 To lastCol
                Dim cellValue As String
                Dim statusClass As String
                
                cellValue = ws.Cells(r, c).Value
                
                ' Apply status badge styling for status column
                If c = 4 And cellValue <> "" Then  ' Assuming column 4 is status
                    statusClass = GetStatusClass(cellValue)
                    html = html & "<td><span class='" & statusClass & "'>" & _
                           cellValue & "</span></td>"
                Else
                    html = html & "<td>" & cellValue & "</td>"
                End If
            Next c
            html = html & "</tr>" & vbNewLine
        End If
    Next r
    html = html & "</tbody>" & vbNewLine
    html = html & "</table>" & vbNewLine
    html = html & "</div>" & vbNewLine
    
    BuildHTMLDataSection = html
End Function

Private Function GetStatusClass(status As String) As String
    Select Case status
        Case "Scheduled"
            GetStatusClass = "status-scheduled"
        Case "Ready to Write"
            GetStatusClass = "status-ready"
        Case "Shipped/Done"
            GetStatusClass = "status-done"
        Case "Not Done"
            GetStatusClass = "status-notdone"
        Case Else
            GetStatusClass = "status-default"
    End Select
End Function
```

## Report Generation Patterns

### Pattern 6: Weekly Schedule Report

Generate formatted schedule reports:

```vba
Sub GenerateWeeklySchedule()
    Dim wsSchedule As Worksheet
    Dim wsUpcoming As Worksheet
    Dim weekStart As Date, weekEnd As Date
    Dim r As Long
    
    ' Calculate week range
    weekStart = Date - Weekday(Date) + 2  ' Monday
    weekEnd = weekStart + 6                ' Sunday
    
    ' Create schedule sheet
    Set wsSchedule = CreateOrReuseSheet("Weekly Schedule")
    Set wsUpcoming = ThisWorkbook.Worksheets("Upcoming Packs")
    
    With wsSchedule
        .Cells.Clear
        
        ' Title
        .Range("A1:G1").Merge
        .Cells(1, 1).Value = "WEEKLY SCHEDULE"
        .Cells(1, 1).Font.Size = 18
        .Cells(1, 1).Font.Bold = True
        .Cells(1, 1).HorizontalAlignment = xlCenter
        
        ' Date range
        .Range("A2:G2").Merge
        .Cells(2, 1).Value = Format(weekStart, "MMMM DD") & " - " & _
                            Format(weekEnd, "MMMM DD, YYYY")
        .Cells(2, 1).HorizontalAlignment = xlCenter
        .Cells(2, 1).Font.Size = 12
        
        ' Day headers
        Dim dayCol As Long
        For dayCol = 1 To 7
            Dim currentDate As Date
            currentDate = weekStart + dayCol - 1
            
            .Cells(4, dayCol).Value = Format(currentDate, "dddd")
            .Cells(5, dayCol).Value = Format(currentDate, "MM/DD")
            
            With .Range(.Cells(4, dayCol), .Cells(5, dayCol))
                .Font.Bold = True
                .Interior.Color = RGB(200, 200, 200)
                .HorizontalAlignment = xlCenter
            End With
        Next dayCol
        
        ' Filter and display jobs by day
        Call PopulateWeeklyJobs(wsSchedule, wsUpcoming, weekStart, weekEnd)
        
        ' Format columns
        .Columns("A:G").ColumnWidth = 20
        .Columns("A:G").WrapText = True
    End With
    
    MsgBox "Weekly schedule generated!", vbInformation
    wsSchedule.Activate
End Sub
```

## Best Practices

### Dashboard Design
1. **Consistent Layout**: Use grid-based layout (13 columns works well)
2. **Visual Hierarchy**: Title > Sections > Actions > Data
3. **Color Coding**: Use consistent colors for action types
4. **White Space**: Don't overcrowd - leave breathing room
5. **Navigation**: Make it obvious where things are

### HTML Export
1. **Responsive Design**: Use CSS grid and flexbox
2. **Print Styles**: Include @media print rules
3. **Accessibility**: Use semantic HTML and proper contrast
4. **File Size**: Inline CSS for portability
5. **Browser Testing**: Test in Chrome, Firefox, Edge

### Performance
1. **Screen Updating**: Turn off during dashboard creation
2. **Batch Operations**: Group formatting operations
3. **Minimize Shapes**: Shapes slow down Excel
4. **Limit Data**: Export reasonable data volumes (< 1000 rows)
5. **Progress Indicators**: Show progress for long exports

## Quick Reference

```vba
' Create dashboard
CreateEnhancedDashboard

' Export to HTML
ExportToHTML

' Generate report
GenerateWeeklySchedule

' Add metric card
AddMetricsDisplay ws, row, col

' Create button
CreateActionButton ws, "Button Text", row, col, "MacroName", RGB(0,112,192)
```

## Additional Resources

- `references/html-export-patterns.md` - Complete HTML export implementation
- `references/css-patterns.md` - Modern CSS styling patterns
- `references/chart-integration.md` - Excel charts in dashboards and HTML
- `assets/dashboard-template.xlsm` - Pre-built dashboard template
