<#
.SYNOPSIS
    RF Takeoff System v4.0 - Automatic VBA Installer (PowerShell Version)

.DESCRIPTION
    This script automatically installs all VBA code and creates the UserForm
    in your Excel workbook, saving you the manual setup time.

.PARAMETER ExcelPath
    Path to the RF_Takeoff_Database_System_v4.xlsx file

.EXAMPLE
    .\Install-VBA-Takeoff.ps1 -ExcelPath "C:\Users\corey.boser\Documents\PlanTakeoffTool\RF_Takeoff_Database_System_v4.xlsx"

.NOTES
    REQUIREMENTS:
    - Windows OS
    - Excel installed
    - PowerShell 5.1 or later
    - Excel must have "Trust access to VBA project object model" enabled
      (File → Options → Trust Center → Trust Center Settings → Macro Settings)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateScript({Test-Path $_ -PathType Leaf})]
    [string]$ExcelPath
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host (" " * 68) -NoNewline
Write-Host "=" -ForegroundColor Cyan
Write-Host "  RF TAKEOFF SYSTEM v4.0 - AUTOMATIC VBA INSTALLER" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host (" " * 68) -NoNewline
Write-Host "=" -ForegroundColor Cyan
Write-Host ""

# Function to get VBA code for modMain
function Get-ModMainCode {
    return @'
Option Explicit

' Global variable for current project
Public g_CurrentProjectID As String
Public g_CurrentProjectName As String

' Initialize the system
Public Sub InitializeSystem()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Database")
    On Error GoTo 0
    
    If ws Is Nothing Then
        MsgBox "Database sheet not found. Please check workbook structure.", vbCritical
        Exit Sub
    End If
    
    frmMain.Show
End Sub

' Generate unique Entry ID
Public Function GenerateEntryID(sheetName As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim prefix As String
    
    Set ws = ThisWorkbook.Sheets(sheetName)
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    Select Case sheetName
        Case "WallData": prefix = "WALL"
        Case "RoofData": prefix = "ROOF"
        Case "PostBeamData": prefix = "PB"
        Case "FloorSystemData": prefix = "FLR"
        Case "DeckFramingData": prefix = "DECK"
        Case "DeckSurfaceData": prefix = "SURF"
        Case Else: prefix = "ENTRY"
    End Select
    
    GenerateEntryID = prefix & "-" & Format(lastRow, "0000")
End Function

' Generate unique Project ID
Public Function GenerateProjectID() As String
    Dim ws As Worksheet
    Dim lastRow As Long
    
    Set ws = ThisWorkbook.Sheets("Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    GenerateProjectID = "PROJ-" & Format(lastRow, "000")
End Function

' Validate numeric input
Public Function IsValidNumber(value As String, minVal As Double, maxVal As Double) As Boolean
    On Error GoTo ErrorHandler
    
    Dim numVal As Double
    numVal = CDbl(value)
    
    IsValidNumber = (numVal >= minVal And numVal <= maxVal)
    Exit Function
    
ErrorHandler:
    IsValidNumber = False
End Function

' Auto-select panel height based on wall height
Public Function GetPanelHeight(wallHeight As Double) As String
    If wallHeight <= 8 Then
        GetPanelHeight = "8"
    ElseIf wallHeight <= 9 Then
        GetPanelHeight = "9"
    ElseIf wallHeight <= 10 Then
        GetPanelHeight = "10"
    Else
        GetPanelHeight = "12"
    End If
End Function

' Calculate joist quantity based on spacing
Public Function CalculateJoistQty(spanLength As Double, spacing As String) As Long
    Select Case spacing
        Case "12"" O.C.", "12"
            CalculateJoistQty = Application.WorksheetFunction.RoundUp(spanLength + 1, 0)
        Case "16"" O.C.", "16"
            CalculateJoistQty = Application.WorksheetFunction.RoundUp(spanLength / 1.33 + 1, 0)
        Case "19.2"" O.C.", "19.2"
            CalculateJoistQty = Application.WorksheetFunction.RoundUp(spanLength / 1.6 + 1, 0)
        Case "24"" O.C.", "24"
            CalculateJoistQty = Application.WorksheetFunction.RoundUp(spanLength / 2 + 1, 0)
        Case Else
            CalculateJoistQty = 0
    End Select
End Function

' Get slope factor from pitch
Public Function GetSlopeFactor(pitch As String) As Double
    Select Case pitch
        Case "3/12": GetSlopeFactor = 1.031
        Case "4/12": GetSlopeFactor = 1.054
        Case "5/12": GetSlopeFactor = 1.083
        Case "6/12": GetSlopeFactor = 1.118
        Case "7/12": GetSlopeFactor = 1.158
        Case "8/12": GetSlopeFactor = 1.202
        Case "9/12": GetSlopeFactor = 1.25
        Case "10/12": GetSlopeFactor = 1.302
        Case "12/12": GetSlopeFactor = 1.414
        Case Else: GetSlopeFactor = 1
    End Select
End Function
'@
}

# Function to get VBA code for modValidation
function Get-ModValidationCode {
    return @'
Option Explicit

' Validate project information
Public Function ValidateProjectInfo(ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    
    With frmMain
        If Trim(.txtProjectName.value) = "" Then
            errors.Add "Project name is required"
            isValid = False
        End If
        
        If Trim(.txtEstimator.value) = "" Then
            errors.Add "Estimator name is required"
            isValid = False
        End If
        
        If .cmbBuildingType.ListIndex = -1 Then
            errors.Add "Building type must be selected"
            isValid = False
        End If
        
        If .cmbStories.ListIndex = -1 Then
            errors.Add "Number of stories must be selected"
            isValid = False
        End If
    End With
    
    ValidateProjectInfo = isValid
End Function

' Validate wall entry
Public Function ValidateWallEntry(length As String, height As String, _
                                openingSF As String, ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    
    If Not IsValidNumber(length, 0.1, 1000) Then
        errors.Add "Length must be between 0.1 and 1000 feet"
        isValid = False
    End If
    
    If Not IsValidNumber(height, 0.1, 20) Then
        errors.Add "Height must be between 0.1 and 20 feet"
        isValid = False
    Else
        Dim h As Double
        h = CDbl(height)
        If h > 12 Then
            errors.Add "Warning: Wall height exceeds standard 12' panel. Review design."
        End If
    End If
    
    If openingSF <> "" Then
        If Not IsValidNumber(openingSF, 0, 10000) Then
            errors.Add "Opening SF must be a valid number"
            isValid = False
        End If
    End If
    
    ValidateWallEntry = isValid
End Function

' Validate roof entry
Public Function ValidateRoofEntry(run As String, depth As String, _
                                pitch As String, ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    
    If Not IsValidNumber(run, 0.1, 500) Then
        errors.Add "Run must be between 0.1 and 500 feet"
        isValid = False
    End If
    
    If Not IsValidNumber(depth, 0.1, 500) Then
        errors.Add "Depth must be between 0.1 and 500 feet"
        isValid = False
    End If
    
    If pitch = "" Then
        errors.Add "Roof pitch must be selected"
        isValid = False
    End If
    
    ValidateRoofEntry = isValid
End Function
'@
}

# Function to get VBA code for modDatabase
function Get-ModDatabaseCode {
    return @'
Option Explicit

' Save project to Database
Public Sub SaveProjectToDatabase(projectData As Dictionary)
    Dim ws As Worksheet
    Dim nextRow As Long
    
    Set ws = ThisWorkbook.Sheets("Database")
    nextRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    ws.Cells(nextRow, 1).value = projectData("ProjectID")
    ws.Cells(nextRow, 2).value = projectData("ProjectName")
    ws.Cells(nextRow, 3).value = projectData("ProjectNumber")
    ws.Cells(nextRow, 4).value = projectData("ClientName")
    ws.Cells(nextRow, 5).value = Date
    ws.Cells(nextRow, 6).value = projectData("Estimator")
    ws.Cells(nextRow, 7).value = projectData("BuildingType")
    ws.Cells(nextRow, 8).value = projectData("Stories")
    ws.Cells(nextRow, 9).value = projectData("TotalSF")
    
    g_CurrentProjectID = projectData("ProjectID")
    g_CurrentProjectName = projectData("ProjectName")
End Sub

' Save wall entry
Public Sub SaveWallEntry(wallData As Dictionary)
    Dim ws As Worksheet
    Dim nextRow As Long
    
    Set ws = ThisWorkbook.Sheets("WallData")
    nextRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    ws.Cells(nextRow, 1).value = wallData("EntryID")
    ws.Cells(nextRow, 2).value = g_CurrentProjectID
    ws.Cells(nextRow, 3).value = wallData("FloorLevel")
    ws.Cells(nextRow, 4).value = wallData("PlanNumber")
    ws.Cells(nextRow, 5).value = wallData("Elevation")
    ws.Cells(nextRow, 6).value = wallData("WallID")
    ws.Cells(nextRow, 7).value = wallData("Length")
    ws.Cells(nextRow, 8).value = wallData("Height")
    ws.Cells(nextRow, 9).value = wallData("WallSF")
    ws.Cells(nextRow, 10).value = wallData("PanelHeight")
    ws.Cells(nextRow, 11).value = wallData("PanelQty")
    ws.Cells(nextRow, 12).value = wallData("OpeningSF")
    ws.Cells(nextRow, 13).value = wallData("NetSF")
    ws.Cells(nextRow, 14).value = wallData("Corners")
    ws.Cells(nextRow, 15).value = wallData("HeaderLF")
End Sub

' Save roof entry
Public Sub SaveRoofEntry(roofData As Dictionary)
    Dim ws As Worksheet
    Dim nextRow As Long
    
    Set ws = ThisWorkbook.Sheets("RoofData")
    nextRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    ws.Cells(nextRow, 1).value = roofData("EntryID")
    ws.Cells(nextRow, 2).value = g_CurrentProjectID
    ws.Cells(nextRow, 3).value = roofData("FloorLevel")
    ws.Cells(nextRow, 4).value = roofData("PlanNumber")
    ws.Cells(nextRow, 5).value = roofData("RoofID")
    ws.Cells(nextRow, 6).value = roofData("Run")
    ws.Cells(nextRow, 7).value = roofData("Depth")
    ws.Cells(nextRow, 8).value = roofData("Pitch")
    ws.Cells(nextRow, 9).value = roofData("HorizSF")
    ws.Cells(nextRow, 10).value = roofData("SlopeFactor")
    ws.Cells(nextRow, 11).value = roofData("ActualSF")
    ws.Cells(nextRow, 12).value = roofData("RidgeLF")
    ws.Cells(nextRow, 13).value = roofData("ValleyLF")
    ws.Cells(nextRow, 14).value = roofData("HipLF")
End Sub
'@
}

# Function to get VBA code for modCalculations
function Get-ModCalculationsCode {
    return @'
Option Explicit

' Calculate wall square footage
Public Function CalculateWallSF(length As Double, height As Double) As Double
    CalculateWallSF = length * height
End Function

' Calculate net wall SF (wall SF - opening SF)
Public Function CalculateNetSF(wallSF As Double, openingSF As Double) As Double
    CalculateNetSF = wallSF - openingSF
    If CalculateNetSF < 0 Then CalculateNetSF = 0
End Function

' Calculate panel quantity
Public Function CalculatePanelQty(length As Double, panelHeight As String) As Long
    Dim panelWidth As Double
    panelWidth = 4  ' Standard 4' wide panels
    
    CalculatePanelQty = Application.WorksheetFunction.RoundUp(length / panelWidth, 0)
End Function

' Calculate horizontal roof SF
Public Function CalculateHorizontalSF(run As Double, depth As Double) As Double
    CalculateHorizontalSF = run * depth
End Function

' Calculate actual roof SF with slope
Public Function CalculateActualRoofSF(horizSF As Double, slopeFactor As Double) As Double
    CalculateActualRoofSF = horizSF * slopeFactor
End Function
'@
}

# Function to get UserForm code
function Get-UserFormCode {
    return @'
Option Explicit

Private Sub UserForm_Initialize()
    ' Initialize combo boxes
    With Me.cmbBuildingType
        .AddItem "Single Family"
        .AddItem "Multi-Family"
        .AddItem "Commercial"
        .AddItem "Industrial"
    End With
    
    With Me.cmbStories
        .AddItem "1"
        .AddItem "2"
        .AddItem "3"
        .AddItem "4+"
    End With
    
    With Me.cmbHasDeck
        .AddItem "Yes"
        .AddItem "No"
    End With
    
    With Me.cmbFloorLevel
        .AddItem "1st Floor"
        .AddItem "2nd Floor"
        .AddItem "3rd Floor"
        .AddItem "Basement"
    End With
    
    With Me.cmbElevation
        .AddItem "North"
        .AddItem "South"
        .AddItem "East"
        .AddItem "West"
        .AddItem "Interior"
    End With
    
    ' Clear all lists
    Me.lstWalls.Clear
End Sub

Private Sub btnSaveProject_Click()
    Dim errors As Collection
    
    If Not ValidateProjectInfo(errors) Then
        MsgBox "Please correct the following errors:" & vbCrLf & vbCrLf & _
               Join(CollectionToArray(errors), vbCrLf), vbExclamation
        Exit Sub
    End If
    
    Dim projectData As Object
    Set projectData = CreateObject("Scripting.Dictionary")
    
    projectData.Add "ProjectID", GenerateProjectID()
    projectData.Add "ProjectName", Me.txtProjectName.value
    projectData.Add "ProjectNumber", Me.txtProjectNumber.value
    projectData.Add "ClientName", Me.txtClientName.value
    projectData.Add "Estimator", Me.txtEstimator.value
    projectData.Add "BuildingType", Me.cmbBuildingType.value
    projectData.Add "Stories", Me.cmbStories.value
    projectData.Add "TotalSF", Me.txtTotalSF.value
    
    SaveProjectToDatabase projectData
    
    MsgBox "Project saved successfully!" & vbCrLf & _
           "Project ID: " & g_CurrentProjectID, vbInformation
    
    Me.MultiPage1.value = 1
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    
    If g_CurrentProjectID = "" Then
        MsgBox "Please save project information first!", vbExclamation
        Exit Sub
    End If
    
    If Not ValidateWallEntry(Me.txtLength.value, Me.txtHeight.value, _
                            Me.txtOpeningSF.value, errors) Then
        MsgBox "Please correct the following errors:" & vbCrLf & vbCrLf & _
               Join(CollectionToArray(errors), vbCrLf), vbExclamation
        Exit Sub
    End If
    
    Dim wallData As Object
    Set wallData = CreateObject("Scripting.Dictionary")
    
    Dim length As Double, height As Double
    Dim openingSF As Double
    Dim wallSF As Double, netSF As Double
    Dim panelHeight As String
    Dim panelQty As Long
    
    length = CDbl(Me.txtLength.value)
    height = CDbl(Me.txtHeight.value)
    
    If Me.txtOpeningSF.value = "" Then
        openingSF = 0
    Else
        openingSF = CDbl(Me.txtOpeningSF.value)
    End If
    
    wallSF = CalculateWallSF(length, height)
    netSF = CalculateNetSF(wallSF, openingSF)
    panelHeight = GetPanelHeight(height)
    panelQty = CalculatePanelQty(length, panelHeight)
    
    wallData.Add "EntryID", GenerateEntryID("WallData")
    wallData.Add "FloorLevel", Me.cmbFloorLevel.value
    wallData.Add "PlanNumber", Me.txtPlanNumber.value
    wallData.Add "Elevation", Me.cmbElevation.value
    wallData.Add "WallID", Me.txtWallID.value
    wallData.Add "Length", length
    wallData.Add "Height", height
    wallData.Add "WallSF", wallSF
    wallData.Add "PanelHeight", panelHeight
    wallData.Add "PanelQty", panelQty
    wallData.Add "OpeningSF", openingSF
    wallData.Add "NetSF", netSF
    wallData.Add "Corners", Me.txtCorners.value
    wallData.Add "HeaderLF", Me.txtHeaderLF.value
    
    SaveWallEntry wallData
    
    Me.lstWalls.AddItem wallData("WallID") & " - " & length & "' x " & height & "'"
    
    ClearWallInputs
    
    MsgBox "Wall added successfully!", vbInformation
End Sub

Private Sub txtHeight_Change()
    If IsNumeric(Me.txtHeight.value) And Me.txtHeight.value <> "" Then
        Dim height As Double
        height = CDbl(Me.txtHeight.value)
        Me.lblPanelHeight.Caption = "Panel Height: " & GetPanelHeight(height) & "'"
        
        If IsNumeric(Me.txtLength.value) And Me.txtLength.value <> "" Then
            Dim length As Double
            length = CDbl(Me.txtLength.value)
            Me.lblPanelQty.Caption = "Panel Qty: " & CalculatePanelQty(length, GetPanelHeight(height))
        End If
    End If
End Sub

Private Sub txtLength_Change()
    If IsNumeric(Me.txtLength.value) And Me.txtLength.value <> "" And _
       IsNumeric(Me.txtHeight.value) And Me.txtHeight.value <> "" Then
        Dim length As Double, height As Double
        length = CDbl(Me.txtLength.value)
        height = CDbl(Me.txtHeight.value)
        Me.lblPanelQty.Caption = "Panel Qty: " & CalculatePanelQty(length, GetPanelHeight(height))
    End If
End Sub

Private Sub ClearWallInputs()
    Me.txtPlanNumber.value = ""
    Me.txtWallID.value = ""
    Me.txtLength.value = ""
    Me.txtHeight.value = ""
    Me.txtOpeningSF.value = ""
    Me.txtCorners.value = ""
    Me.txtHeaderLF.value = ""
    Me.lblPanelHeight.Caption = "Panel Height: --"
    Me.lblPanelQty.Caption = "Panel Qty: --"
End Sub

Private Function CollectionToArray(col As Collection) As Variant
    Dim arr() As String
    Dim i As Long
    
    ReDim arr(1 To col.Count)
    For i = 1 To col.Count
        arr(i) = col(i)
    Next i
    
    CollectionToArray = arr
End Function
'@
}

# Main installation function
function Install-VBACode {
    param([string]$Path)
    
    try {
        Write-Host "Starting VBA installation process..." -ForegroundColor Yellow
        Write-Host ""
        
        # Resolve full path
        $fullPath = Resolve-Path $Path
        Write-Host "  Target file: $fullPath" -ForegroundColor Gray
        Write-Host ""
        
        # Create Excel application
        Write-Host "  • Opening Excel application..." -ForegroundColor Cyan
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        Write-Host "    ✓ Excel opened" -ForegroundColor Green
        Write-Host ""
        
        # Open workbook
        Write-Host "  • Opening workbook..." -ForegroundColor Cyan
        $workbook = $excel.Workbooks.Open($fullPath)
        Write-Host "    ✓ Workbook opened" -ForegroundColor Green
        Write-Host ""
        
        # Get VBA project
        $vbProject = $workbook.VBProject
        
        # Install modules
        Write-Host "  • Installing VBA modules..." -ForegroundColor Cyan
        
        # Module 1: modMain
        Write-Host "    - Creating modMain..." -ForegroundColor Gray
        $module1 = $vbProject.VBComponents.Add(1)  # 1 = vbext_ct_StdModule
        $module1.Name = "modMain"
        $module1.CodeModule.AddFromString((Get-ModMainCode))
        Write-Host "      ✓ modMain installed" -ForegroundColor Green
        
        # Module 2: modValidation
        Write-Host "    - Creating modValidation..." -ForegroundColor Gray
        $module2 = $vbProject.VBComponents.Add(1)
        $module2.Name = "modValidation"
        $module2.CodeModule.AddFromString((Get-ModValidationCode))
        Write-Host "      ✓ modValidation installed" -ForegroundColor Green
        
        # Module 3: modDatabase
        Write-Host "    - Creating modDatabase..." -ForegroundColor Gray
        $module3 = $vbProject.VBComponents.Add(1)
        $module3.Name = "modDatabase"
        $module3.CodeModule.AddFromString((Get-ModDatabaseCode))
        Write-Host "      ✓ modDatabase installed" -ForegroundColor Green
        
        # Module 4: modCalculations
        Write-Host "    - Creating modCalculations..." -ForegroundColor Gray
        $module4 = $vbProject.VBComponents.Add(1)
        $module4.Name = "modCalculations"
        $module4.CodeModule.AddFromString((Get-ModCalculationsCode))
        Write-Host "      ✓ modCalculations installed" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "    ✓ All modules installed successfully" -ForegroundColor Green
        Write-Host ""
        
        # Create UserForm
        Write-Host "  • Creating UserForm..." -ForegroundColor Cyan
        $userForm = $vbProject.VBComponents.Add(3)  # 3 = vbext_ct_MSForm
        $userForm.Name = "frmMain"
        $userForm.Properties.Item("Caption").Value = "RF Framing Takeoff System"
        $userForm.Properties.Item("Width").Value = 600
        $userForm.Properties.Item("Height").Value = 450
        Write-Host "    ✓ UserForm component created" -ForegroundColor Green
        Write-Host ""
        
        # Add controls to UserForm
        Write-Host "  • Adding controls to UserForm..." -ForegroundColor Cyan
        
        # Add MultiPage control
        $multiPage = $userForm.Designer.Controls.Add("Forms.MultiPage.1")
        $multiPage.Name = "MultiPage1"
        $multiPage.Left = 10
        $multiPage.Top = 10
        $multiPage.Width = 560
        $multiPage.Height = 380
        
        # Configure pages
        $multiPage.Pages.Item(0).Caption = "Project Info"
        $multiPage.Pages.Add() | Out-Null
        $multiPage.Pages.Item(1).Caption = "Walls"
        $multiPage.Pages.Add() | Out-Null
        $multiPage.Pages.Item(2).Caption = "Roof"
        
        Write-Host "    ✓ MultiPage control added with 3 tabs" -ForegroundColor Green
        Write-Host ""
        
        # Add Project Info controls (Page 0)
        Write-Host "  • Adding Project Info controls..." -ForegroundColor Cyan
        $page0 = $multiPage.Pages.Item(0)
        
        # Labels and TextBoxes for project info
        $controlsY = 20
        $labels = @("Project Name:", "Project Number:", "Client Name:", "Estimator:", 
                    "Address:", "City:", "State:", "Zip:", "Total SF:", "Notes:")
        $textboxes = @("txtProjectName", "txtProjectNumber", "txtClientName", "txtEstimator",
                       "txtAddress", "txtCity", "txtState", "txtZip", "txtTotalSF", "txtNotes")
        
        for ($i = 0; $i -lt $labels.Count; $i++) {
            # Add label
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
            $lbl.Caption = $labels[$i]
            $lbl.Left = 20
            $lbl.Top = $controlsY
            $lbl.Width = 100
            
            # Add textbox
            $txt = $userForm.Designer.Controls.Add("Forms.TextBox.1", $page0)
            $txt.Name = $textboxes[$i]
            $txt.Left = 130
            $txt.Top = $controlsY
            $txt.Width = 200
            
            $controlsY += 30
        }
        
        # Add combo boxes
        $combosY = 20
        $comboLabels = @("Building Type:", "Stories:", "Has Deck:")
        $comboNames = @("cmbBuildingType", "cmbStories", "cmbHasDeck")
        
        for ($i = 0; $i -lt $comboLabels.Count; $i++) {
            # Add label
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
            $lbl.Caption = $comboLabels[$i]
            $lbl.Left = 350
            $lbl.Top = $combosY
            $lbl.Width = 80
            
            # Add combobox
            $cmb = $userForm.Designer.Controls.Add("Forms.ComboBox.1", $page0)
            $cmb.Name = $comboNames[$i]
            $cmb.Left = 440
            $cmb.Top = $combosY
            $cmb.Width = 100
            
            $combosY += 30
        }
        
        # Add checklist label
        $checklistLbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
        $checklistLbl.Name = "lblChecklistProject"
        $checklistLbl.Left = 350
        $checklistLbl.Top = 120
        $checklistLbl.Width = 180
        $checklistLbl.Height = 200
        $checklistLbl.Caption = "Checklist will appear here"
        
        # Add Save Project button
        $btnSave = $userForm.Designer.Controls.Add("Forms.CommandButton.1", $page0)
        $btnSave.Name = "btnSaveProject"
        $btnSave.Caption = "Save Project"
        $btnSave.Left = 130
        $btnSave.Top = 320
        $btnSave.Width = 100
        $btnSave.Height = 30
        
        Write-Host "    ✓ Project Info controls added" -ForegroundColor Green
        Write-Host ""
        
        # Add Wall controls (Page 1)
        Write-Host "  • Adding Wall controls..." -ForegroundColor Cyan
        $page1 = $multiPage.Pages.Item(1)
        
        $wallY = 20
        $wallLabels = @("Floor Level:", "Plan #:", "Elevation:", "Wall ID:", "Length (FT):",
                        "Height (FT):", "Opening SF:", "Corners:", "Header LF:")
        $wallControls = @(
            @("cmbFloorLevel", "ComboBox"),
            @("txtPlanNumber", "TextBox"),
            @("cmbElevation", "ComboBox"),
            @("txtWallID", "TextBox"),
            @("txtLength", "TextBox"),
            @("txtHeight", "TextBox"),
            @("txtOpeningSF", "TextBox"),
            @("txtCorners", "TextBox"),
            @("txtHeaderLF", "TextBox")
        )
        
        for ($i = 0; $i -lt $wallLabels.Count; $i++) {
            # Add label
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page1)
            $lbl.Caption = $wallLabels[$i]
            $lbl.Left = 20
            $lbl.Top = $wallY
            $lbl.Width = 100
            
            # Add control
            if ($wallControls[$i][1] -eq "ComboBox") {
                $ctrl = $userForm.Designer.Controls.Add("Forms.ComboBox.1", $page1)
            } else {
                $ctrl = $userForm.Designer.Controls.Add("Forms.TextBox.1", $page1)
            }
            $ctrl.Name = $wallControls[$i][0]
            $ctrl.Left = 130
            $ctrl.Top = $wallY
            $ctrl.Width = 120
            
            $wallY += 30
        }
        
        # Add panel height and quantity labels
        $lblPanelHt = $userForm.Designer.Controls.Add("Forms.Label.1", $page1)
        $lblPanelHt.Name = "lblPanelHeight"
        $lblPanelHt.Left = 270
        $lblPanelHt.Top = 170
        $lblPanelHt.Width = 100
        $lblPanelHt.Caption = "Panel Height: --"
        
        $lblPanelQty = $userForm.Designer.Controls.Add("Forms.Label.1", $page1)
        $lblPanelQty.Name = "lblPanelQty"
        $lblPanelQty.Left = 270
        $lblPanelQty.Top = 200
        $lblPanelQty.Width = 100
        $lblPanelQty.Caption = "Panel Qty: --"
        
        # Add walls listbox
        $lstWalls = $userForm.Designer.Controls.Add("Forms.ListBox.1", $page1)
        $lstWalls.Name = "lstWalls"
        $lstWalls.Left = 270
        $lstWalls.Top = 20
        $lstWalls.Width = 260
        $lstWalls.Height = 140
        
        # Add wall button
        $btnAddWall = $userForm.Designer.Controls.Add("Forms.CommandButton.1", $page1)
        $btnAddWall.Name = "btnAddWall"
        $btnAddWall.Caption = "Add Wall"
        $btnAddWall.Left = 130
        $btnAddWall.Top = 290
        $btnAddWall.Width = 100
        $btnAddWall.Height = 30
        
        Write-Host "    ✓ Wall controls added" -ForegroundColor Green
        Write-Host ""
        
        # Add UserForm code
        Write-Host "  • Adding UserForm code..." -ForegroundColor Cyan
        $formCode = Get-UserFormCode
        $userForm.CodeModule.AddFromString($formCode)
        Write-Host "    ✓ UserForm code installed" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "✓ UserForm created successfully" -ForegroundColor Green
        Write-Host ""
        
        # Save as macro-enabled workbook
        $outputPath = $fullPath -replace '\.xlsx$', '.xlsm'
        if ($outputPath -eq $fullPath) {
            $outputPath = $fullPath -replace '\.xlsm$', '_with_vba.xlsm'
        }
        
        Write-Host "Saving as macro-enabled workbook..." -ForegroundColor Yellow
        Write-Host "  Output: $outputPath" -ForegroundColor Gray
        Write-Host ""
        
        $workbook.SaveAs($outputPath, 52)  # 52 = xlOpenXMLWorkbookMacroEnabled
        $workbook.Close($false)
        $excel.Quit()
        
        # Release COM objects
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        
        Write-Host ""
        Write-Host "=" -NoNewline -ForegroundColor Green
        Write-Host (" " * 68) -NoNewline
        Write-Host "=" -ForegroundColor Green
        Write-Host "  ✓ INSTALLATION COMPLETE!" -ForegroundColor Green
        Write-Host "=" -NoNewline -ForegroundColor Green
        Write-Host (" " * 68) -NoNewline
        Write-Host "=" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your macro-enabled workbook is ready:" -ForegroundColor Cyan
        Write-Host "  $outputPath" -ForegroundColor White
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "  1. Open the .xlsm file in Excel" -ForegroundColor White
        Write-Host "  2. Enable macros when prompted" -ForegroundColor White
        Write-Host "  3. Go to Dashboard sheet" -ForegroundColor White
        Write-Host "  4. Press ALT+F8 and run 'InitializeSystem' to open the UserForm" -ForegroundColor White
        Write-Host ""
        Write-Host "NOTE:" -ForegroundColor Yellow
        Write-Host "  You may need to add a button to Dashboard manually:" -ForegroundColor White
        Write-Host "    • Developer tab → Insert → Button" -ForegroundColor Gray
        Write-Host "    • Assign macro: InitializeSystem" -ForegroundColor Gray
        Write-Host "    • Label: 'Start New Takeoff'" -ForegroundColor Gray
        Write-Host ""
        
        return $true
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
        Write-Host "  1. Make sure Excel is installed" -ForegroundColor White
        Write-Host "  2. Enable 'Trust access to the VBA project object model' in Excel:" -ForegroundColor White
        Write-Host "     File → Options → Trust Center → Trust Center Settings" -ForegroundColor Gray
        Write-Host "     → Macro Settings → Check 'Trust access to VBA project object model'" -ForegroundColor Gray
        Write-Host "  3. Close all Excel instances and try again" -ForegroundColor White
        Write-Host "  4. Run PowerShell as Administrator" -ForegroundColor White
        Write-Host ""
        
        # Cleanup
        if ($excel) {
            try {
                $excel.Quit()
                [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
            } catch {}
        }
        
        return $false
    }
}

# Run the installation
$result = Install-VBACode -Path $ExcelPath

if ($result) {
    exit 0
} else {
    exit 1
}
