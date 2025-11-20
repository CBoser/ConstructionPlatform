# HTML Export Patterns - Complete Implementation

Complete patterns for exporting Excel data to modern, styled HTML reports.

## Full HTML Export System

### Main Export Function

```vba
'==============================================================================
' MODULE: mod_HTML_Export
' PURPOSE: Export Excel data to professional HTML reports
'==============================================================================
Option Explicit

Sub ExportToHTML()
    Dim htmlFile As String
    Dim fileNum As Integer
    Dim htmlContent As String
    Dim wsUpcoming As Worksheet
    Dim wsCompleted As Worksheet
    
    ' Get file path from user
    htmlFile = Application.GetSaveAsFilename( _
        InitialFileName:="Schedule_Report_" & Format(Date, "YYYY-MM-DD") & ".html", _
        FileFilter:="HTML Files (*.html), *.html")
    
    If htmlFile = "False" Then Exit Sub
    
    ' Get data worksheets
    On Error Resume Next
    Set wsUpcoming = ThisWorkbook.Worksheets("Upcoming Packs")
    Set wsCompleted = ThisWorkbook.Worksheets("Completed Packs")
    On Error GoTo 0
    
    If wsUpcoming Is Nothing Or wsCompleted Is Nothing Then
        MsgBox "Required worksheets not found!", vbCritical
        Exit Sub
    End If
    
    ' Build complete HTML document
    htmlContent = BuildHTMLHeader()
    htmlContent = htmlContent & BuildHTMLNavigation()
    htmlContent = htmlContent & "<div class='container'>" & vbNewLine
    htmlContent = htmlContent & BuildHTMLDashboard(wsUpcoming, wsCompleted)
    htmlContent = htmlContent & BuildHTMLSection("Upcoming Jobs", wsUpcoming)
    htmlContent = htmlContent & BuildHTMLSection("Completed Jobs", wsCompleted)
    htmlContent = htmlContent & "</div>" & vbNewLine
    htmlContent = htmlContent & BuildHTMLFooter()
    
    ' Write to file
    fileNum = FreeFile
    Open htmlFile For Output As #fileNum
    Print #fileNum, htmlContent
    Close #fileNum
    
    ' Open in default browser
    Shell "explorer.exe " & htmlFile, vbNormalFocus
    
    MsgBox "HTML export complete!" & vbNewLine & _
           "File: " & htmlFile, vbInformation
End Sub
```

### HTML Header with Modern CSS

```vba
Private Function BuildHTMLHeader() As String
    Dim html As String
    
    html = "<!DOCTYPE html>" & vbNewLine
    html = html & "<html lang='en'>" & vbNewLine
    html = html & "<head>" & vbNewLine
    html = html & "<meta charset='UTF-8'>" & vbNewLine
    html = html & "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" & vbNewLine
    html = html & "<title>Schedule Management Report</title>" & vbNewLine
    html = html & "<style>" & vbNewLine
    
    ' Reset and base styles
    html = html & "* {" & vbNewLine
    html = html & "  margin: 0;" & vbNewLine
    html = html & "  padding: 0;" & vbNewLine
    html = html & "  box-sizing: border-box;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "body {" & vbNewLine
    html = html & "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" & vbNewLine
    html = html & "  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" & vbNewLine
    html = html & "  min-height: 100vh;" & vbNewLine
    html = html & "  padding: 20px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Container
    html = html & ".container {" & vbNewLine
    html = html & "  max-width: 1400px;" & vbNewLine
    html = html & "  margin: 0 auto;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Header
    html = html & ".header {" & vbNewLine
    html = html & "  background: white;" & vbNewLine
    html = html & "  border-radius: 10px;" & vbNewLine
    html = html & "  padding: 30px;" & vbNewLine
    html = html & "  margin-bottom: 30px;" & vbNewLine
    html = html & "  box-shadow: 0 10px 30px rgba(0,0,0,0.1);" & vbNewLine
    html = html & "  text-align: center;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "h1 {" & vbNewLine
    html = html & "  color: #0070C0;" & vbNewLine
    html = html & "  margin-bottom: 10px;" & vbNewLine
    html = html & "  font-size: 32px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "h2 {" & vbNewLine
    html = html & "  color: #333;" & vbNewLine
    html = html & "  margin: 20px 0;" & vbNewLine
    html = html & "  font-size: 24px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Navigation
    html = html & ".nav {" & vbNewLine
    html = html & "  background: #333;" & vbNewLine
    html = html & "  padding: 0;" & vbNewLine
    html = html & "  margin-bottom: 30px;" & vbNewLine
    html = html & "  border-radius: 10px;" & vbNewLine
    html = html & "  overflow: hidden;" & vbNewLine
    html = html & "  box-shadow: 0 4px 6px rgba(0,0,0,0.1);" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".nav ul {" & vbNewLine
    html = html & "  list-style: none;" & vbNewLine
    html = html & "  display: flex;" & vbNewLine
    html = html & "  margin: 0;" & vbNewLine
    html = html & "  padding: 0;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".nav li {" & vbNewLine
    html = html & "  flex: 1;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".nav a {" & vbNewLine
    html = html & "  display: block;" & vbNewLine
    html = html & "  color: white;" & vbNewLine
    html = html & "  text-decoration: none;" & vbNewLine
    html = html & "  padding: 15px;" & vbNewLine
    html = html & "  text-align: center;" & vbNewLine
    html = html & "  transition: background 0.3s ease;" & vbNewLine
    html = html & "  font-weight: 500;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".nav a:hover {" & vbNewLine
    html = html & "  background: #555;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Dashboard/Stats Cards
    html = html & ".dashboard {" & vbNewLine
    html = html & "  display: grid;" & vbNewLine
    html = html & "  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));" & vbNewLine
    html = html & "  gap: 20px;" & vbNewLine
    html = html & "  margin-bottom: 30px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".stat-card {" & vbNewLine
    html = html & "  background: white;" & vbNewLine
    html = html & "  padding: 20px;" & vbNewLine
    html = html & "  border-radius: 10px;" & vbNewLine
    html = html & "  text-align: center;" & vbNewLine
    html = html & "  box-shadow: 0 5px 15px rgba(0,0,0,0.1);" & vbNewLine
    html = html & "  transition: transform 0.3s ease, box-shadow 0.3s ease;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".stat-card:hover {" & vbNewLine
    html = html & "  transform: translateY(-5px);" & vbNewLine
    html = html & "  box-shadow: 0 8px 20px rgba(0,0,0,0.15);" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".stat-number {" & vbNewLine
    html = html & "  font-size: 36px;" & vbNewLine
    html = html & "  font-weight: bold;" & vbNewLine
    html = html & "  margin: 10px 0;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".stat-label {" & vbNewLine
    html = html & "  color: #666;" & vbNewLine
    html = html & "  font-size: 14px;" & vbNewLine
    html = html & "  text-transform: uppercase;" & vbNewLine
    html = html & "  letter-spacing: 1px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Sections
    html = html & ".section {" & vbNewLine
    html = html & "  background: white;" & vbNewLine
    html = html & "  border-radius: 10px;" & vbNewLine
    html = html & "  padding: 30px;" & vbNewLine
    html = html & "  margin-bottom: 30px;" & vbNewLine
    html = html & "  box-shadow: 0 10px 30px rgba(0,0,0,0.1);" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Tables
    html = html & "table {" & vbNewLine
    html = html & "  width: 100%;" & vbNewLine
    html = html & "  border-collapse: collapse;" & vbNewLine
    html = html & "  margin-top: 20px;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "th {" & vbNewLine
    html = html & "  background: #0070C0;" & vbNewLine
    html = html & "  color: white;" & vbNewLine
    html = html & "  padding: 12px;" & vbNewLine
    html = html & "  text-align: left;" & vbNewLine
    html = html & "  font-weight: 600;" & vbNewLine
    html = html & "  position: sticky;" & vbNewLine
    html = html & "  top: 0;" & vbNewLine
    html = html & "  z-index: 10;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "td {" & vbNewLine
    html = html & "  padding: 10px 12px;" & vbNewLine
    html = html & "  border-bottom: 1px solid #eee;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & "tr:hover {" & vbNewLine
    html = html & "  background: #f5f5f5;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Status badges
    html = html & ".status-scheduled {" & vbNewLine
    html = html & "  background: #FFFF00;" & vbNewLine
    html = html & "  color: #000;" & vbNewLine
    html = html & "  padding: 4px 12px;" & vbNewLine
    html = html & "  border-radius: 20px;" & vbNewLine
    html = html & "  font-size: 12px;" & vbNewLine
    html = html & "  font-weight: 600;" & vbNewLine
    html = html & "  display: inline-block;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".status-ready {" & vbNewLine
    html = html & "  background: #FFC000;" & vbNewLine
    html = html & "  color: #000;" & vbNewLine
    html = html & "  padding: 4px 12px;" & vbNewLine
    html = html & "  border-radius: 20px;" & vbNewLine
    html = html & "  font-size: 12px;" & vbNewLine
    html = html & "  font-weight: 600;" & vbNewLine
    html = html & "  display: inline-block;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".status-done {" & vbNewLine
    html = html & "  background: #92D050;" & vbNewLine
    html = html & "  color: #000;" & vbNewLine
    html = html & "  padding: 4px 12px;" & vbNewLine
    html = html & "  border-radius: 20px;" & vbNewLine
    html = html & "  font-size: 12px;" & vbNewLine
    html = html & "  font-weight: 600;" & vbNewLine
    html = html & "  display: inline-block;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    html = html & ".status-notdone {" & vbNewLine
    html = html & "  background: #FF0000;" & vbNewLine
    html = html & "  color: #FFF;" & vbNewLine
    html = html & "  padding: 4px 12px;" & vbNewLine
    html = html & "  border-radius: 20px;" & vbNewLine
    html = html & "  font-size: 12px;" & vbNewLine
    html = html & "  font-weight: 600;" & vbNewLine
    html = html & "  display: inline-block;" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Footer
    html = html & ".footer {" & vbNewLine
    html = html & "  background: white;" & vbNewLine
    html = html & "  border-radius: 10px;" & vbNewLine
    html = html & "  padding: 20px;" & vbNewLine
    html = html & "  margin-top: 30px;" & vbNewLine
    html = html & "  text-align: center;" & vbNewLine
    html = html & "  color: #666;" & vbNewLine
    html = html & "  box-shadow: 0 10px 30px rgba(0,0,0,0.1);" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Responsive design
    html = html & "@media (max-width: 768px) {" & vbNewLine
    html = html & "  .nav ul { flex-direction: column; }" & vbNewLine
    html = html & "  .dashboard { grid-template-columns: 1fr; }" & vbNewLine
    html = html & "  table { font-size: 12px; }" & vbNewLine
    html = html & "  th, td { padding: 8px 6px; }" & vbNewLine
    html = html & "  h1 { font-size: 24px; }" & vbNewLine
    html = html & "}" & vbNewLine & vbNewLine
    
    ' Print styles
    html = html & "@media print {" & vbNewLine
    html = html & "  body { background: white; padding: 0; }" & vbNewLine
    html = html & "  .nav { display: none; }" & vbNewLine
    html = html & "  .section { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; }" & vbNewLine
    html = html & "  .stat-card { box-shadow: none; border: 1px solid #ccc; }" & vbNewLine
    html = html & "}" & vbNewLine
    
    html = html & "</style>" & vbNewLine
    html = html & "</head>" & vbNewLine
    html = html & "<body>" & vbNewLine
    
    ' Header
    html = html & "<div class='header'>" & vbNewLine
    html = html & "<h1>📊 Schedule Management Report</h1>" & vbNewLine
    html = html & "<p>Generated: " & Format(Now, "MMMM DD, YYYY at HH:MM AM/PM") & "</p>" & vbNewLine
    html = html & "<p>Report by: " & Application.UserName & "</p>" & vbNewLine
    html = html & "</div>" & vbNewLine
    
    BuildHTMLHeader = html
End Function
```

### Navigation Bar

```vba
Private Function BuildHTMLNavigation() As String
    Dim html As String
    
    html = "<nav class='nav'>" & vbNewLine
    html = html & "<ul>" & vbNewLine
    html = html & "<li><a href='#dashboard'>📈 Dashboard</a></li>" & vbNewLine
    html = html & "<li><a href='#upcoming'>📋 Upcoming</a></li>" & vbNewLine
    html = html & "<li><a href='#completed'>✅ Completed</a></li>" & vbNewLine
    html = html & "<li><a href='javascript:window.print()'>🖨️ Print</a></li>" & vbNewLine
    html = html & "</ul>" & vbNewLine
    html = html & "</nav>" & vbNewLine
    
    BuildHTMLNavigation = html
End Function
```

### Dashboard with Metrics

```vba
Private Function BuildHTMLDashboard(wsUpcoming As Worksheet, wsCompleted As Worksheet) As String
    Dim html As String
    Dim upcomingCount As Long, completedCount As Long
    Dim scheduledCount As Long, thisWeekCount As Long
    
    ' Calculate metrics
    On Error Resume Next
    upcomingCount = Application.WorksheetFunction.CountA(wsUpcoming.Range("A:A")) - 1
    completedCount = Application.WorksheetFunction.CountA(wsCompleted.Range("A:A")) - 1
    scheduledCount = Application.WorksheetFunction.CountIf(wsUpcoming.Range("D:D"), "Scheduled")
    thisWeekCount = CountThisWeek(wsUpcoming)
    On Error GoTo 0
    
    html = "<div id='dashboard' class='dashboard'>" & vbNewLine
    
    ' Stat cards
    html = html & CreateStatCard("Upcoming Jobs", upcomingCount, "#0070C0")
    html = html & CreateStatCard("Scheduled", scheduledCount, "#FFC000")
    html = html & CreateStatCard("Completed", completedCount, "#92D050")
    html = html & CreateStatCard("This Week", thisWeekCount, "#764ba2")
    
    html = html & "</div>" & vbNewLine
    
    BuildHTMLDashboard = html
End Function

Private Function CreateStatCard(label As String, value As Long, color As String) As String
    Dim html As String
    html = "<div class='stat-card'>" & vbNewLine
    html = html & "<div class='stat-label'>" & label & "</div>" & vbNewLine
    html = html & "<div class='stat-number' style='color: " & color & ";'>" & value & "</div>" & vbNewLine
    html = html & "</div>" & vbNewLine
    CreateStatCard = html
End Function
```

### Data Section with Table

```vba
Private Function BuildHTMLSection(title As String, ws As Worksheet) As String
    Dim html As String
    Dim lastRow As Long, lastCol As Long
    Dim r As Long, c As Long
    Dim maxRows As Long
    
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = 8  ' Adjust based on your columns
    maxRows = 100  ' Limit rows for performance
    
    If lastRow > maxRows + 1 Then lastRow = maxRows + 1
    
    html = "<div id='" & LCase(Replace(title, " ", "")) & "' class='section'>" & vbNewLine
    html = html & "<h2>" & title & "</h2>" & vbNewLine
    
    If lastRow <= 1 Then
        html = html & "<p>No data available.</p>" & vbNewLine
    Else
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
                    cellValue = ws.Cells(r, c).Value
                    
                    ' Apply status styling if this is the status column
                    If c = 4 And cellValue <> "" Then
                        html = html & "<td>" & GetStyledStatus(cellValue) & "</td>"
                    Else
                        html = html & "<td>" & cellValue & "</td>"
                    End If
                Next c
                html = html & "</tr>" & vbNewLine
            End If
        Next r
        html = html & "</tbody>" & vbNewLine
        html = html & "</table>" & vbNewLine
        
        If lastRow >= maxRows + 1 Then
            html = html & "<p style='margin-top: 10px; color: #666;'><em>Showing first " & _
                   maxRows & " rows. Full data available in Excel.</em></p>" & vbNewLine
        End If
    End If
    
    html = html & "</div>" & vbNewLine
    
    BuildHTMLSection = html
End Function

Private Function GetStyledStatus(status As String) As String
    Dim statusClass As String
    
    Select Case status
        Case "Scheduled"
            statusClass = "status-scheduled"
        Case "Ready to Write"
            statusClass = "status-ready"
        Case "Shipped/Done"
            statusClass = "status-done"
        Case "Not Done"
            statusClass = "status-notdone"
        Case Else
            GetStyledStatus = status
            Exit Function
    End Select
    
    GetStyledStatus = "<span class='" & statusClass & "'>" & status & "</span>"
End Function
```

### Footer

```vba
Private Function BuildHTMLFooter() As String
    Dim html As String
    
    html = "<footer class='footer'>" & vbNewLine
    html = html & "<p>&copy; " & Year(Date) & " Schedule Management System</p>" & vbNewLine
    html = html & "<p style='font-size: 12px; margin-top: 5px;'>" & _
                  "Generated from Excel | Last Updated: " & Format(Now, "MM/DD/YYYY HH:MM") & "</p>" & vbNewLine
    html = html & "</footer>" & vbNewLine
    html = html & "</body>" & vbNewLine
    html = html & "</html>" & vbNewLine
    
    BuildHTMLFooter = html
End Function
```

### Helper Functions

```vba
Private Function CountThisWeek(ws As Worksheet) As Long
    Dim lastRow As Long, r As Long
    Dim deliveryDate As Date
    Dim weekStart As Date, weekEnd As Date
    Dim count As Long
    
    weekStart = Date - Weekday(Date) + 2  ' Monday
    weekEnd = weekStart + 6                ' Sunday
    
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    count = 0
    
    For r = 2 To lastRow
        On Error Resume Next
        deliveryDate = ws.Cells(r, 3).Value  ' Assuming column 3 is date
        If Err.Number = 0 Then
            If deliveryDate >= weekStart And deliveryDate <= weekEnd Then
                count = count + 1
            End If
        End If
        On Error GoTo 0
    Next r
    
    CountThisWeek = count
End Function
```

## Usage

```vba
' Export current data to HTML
ExportToHTML

' The function will:
' 1. Prompt for save location
' 2. Build complete HTML with CSS
' 3. Include dashboard metrics
' 4. Export data tables
' 5. Open in browser automatically
```

## Customization

### Change Colors
Modify RGB values in `BuildHTMLHeader` CSS section

### Add More Metrics
Add stat cards in `BuildHTMLDashboard` function

### Modify Table Columns
Adjust `lastCol` variable in `BuildHTMLSection`

### Add Charts
Use Chart.js or similar library (add script tag in header)

### Change Layout
Modify grid template in `.dashboard` CSS class
