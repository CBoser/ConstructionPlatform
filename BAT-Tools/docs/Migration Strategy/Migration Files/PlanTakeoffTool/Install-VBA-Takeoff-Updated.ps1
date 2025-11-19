<#
.SYNOPSIS
    RF Takeoff System v4.0 - Automatic VBA Installer (UPDATED)

.DESCRIPTION
    This script automatically installs all VBA code and creates the UserForm
    in your Excel workbook, saving you the manual setup time.

.PARAMETER ExcelPath
    Path to the RF_Takeoff_Database_System_v4.xlsx file

.EXAMPLE
    .\Install-VBA-Takeoff-Fixed.ps1 -ExcelPath "C:\Users\corey.boser\Documents\PlanTakeoffTool\RF_Takeoff_Database_System_v4.xlsx"

.NOTES
    REQUIREMENTS:
    - Windows OS
    - Excel installed
    - PowerShell 5.1 or later
    - Excel must have "Trust access to VBA project object model" enabled
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateScript({Test-Path $_ -PathType Leaf})]
    [string]$ExcelPath
)

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host "  RF TAKEOFF SYSTEM v4.0 - AUTOMATIC VBA INSTALLER" -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([int]$StepNum, [int]$TotalSteps, [string]$Message)
    $progress = "[$StepNum/$TotalSteps]"
    Write-Host "$progress " -NoNewline -ForegroundColor Yellow
    Write-Host "$Message..." -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "         * $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "         X $Message" -ForegroundColor Red
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host "         ! $Message" -ForegroundColor Yellow
}

function Get-ModMainCode {
    @'
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

function Get-ModValidationCode {
    @'
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
Public Function ValidateWallEntry(length As String, height As String, openingSF As String, ByRef errors As Collection) As Boolean
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
            errors.Add "Warning: Wall height exceeds standard 12 foot panel. Review design."
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
Public Function ValidateRoofEntry(run As String, depth As String, pitch As String, ByRef errors As Collection) As Boolean
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
        errors.Add "Pitch must be selected"
        isValid = False
    End If
    
    ValidateRoofEntry = isValid
End Function
'@
}

function Get-ModDatabaseCode {
    @'
Option Explicit

' Save project to Database sheet
Public Sub SaveProject()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim projectID As String
    
    Set ws = ThisWorkbook.Sheets("Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    projectID = GenerateProjectID()
    g_CurrentProjectID = projectID
    
    With frmMain
        g_CurrentProjectName = .txtProjectName.value
        ws.Cells(lastRow, 1).value = projectID
        ws.Cells(lastRow, 2).value = .txtProjectName.value
        ws.Cells(lastRow, 3).value = .txtProjectNumber.value
        ws.Cells(lastRow, 4).value = .txtClientName.value
        ws.Cells(lastRow, 5).value = .txtEstimator.value
        ws.Cells(lastRow, 6).value = .txtAddress.value
        ws.Cells(lastRow, 7).value = .txtCity.value
        ws.Cells(lastRow, 8).value = .txtState.value
        ws.Cells(lastRow, 9).value = .txtZip.value
        ws.Cells(lastRow, 10).value = .cmbBuildingType.value
        ws.Cells(lastRow, 11).value = .cmbStories.value
        ws.Cells(lastRow, 12).value = .cmbHasDeck.value
        ws.Cells(lastRow, 13).value = .txtTotalSF.value
        ws.Cells(lastRow, 14).value = .txtNotes.value
        ws.Cells(lastRow, 15).value = Date
        ws.Cells(lastRow, 16).value = "Active"
    End With
    
    MsgBox "Project saved successfully!" & vbCrLf & "Project ID: " & projectID, vbInformation
End Sub

' Save wall entry
Public Sub SaveWall()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim entryID As String
    
    Set ws = ThisWorkbook.Sheets("WallData")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    entryID = GenerateEntryID("WallData")
    
    With frmMain
        ws.Cells(lastRow, 1).value = entryID
        ws.Cells(lastRow, 2).value = g_CurrentProjectID
        ws.Cells(lastRow, 3).value = .cmbFloorLevel.value
        ws.Cells(lastRow, 4).value = .txtPlanNumber.value
        ws.Cells(lastRow, 5).value = .cmbElevation.value
        ws.Cells(lastRow, 6).value = .txtWallID.value
        ws.Cells(lastRow, 7).value = CDbl(.txtLength.value)
        ws.Cells(lastRow, 8).value = CDbl(.txtHeight.value)
        ws.Cells(lastRow, 9).value = GetPanelHeight(CDbl(.txtHeight.value))
        
        Dim openingSF As Double
        openingSF = 0
        If .txtOpeningSF.value <> "" Then openingSF = CDbl(.txtOpeningSF.value)
        ws.Cells(lastRow, 10).value = openingSF
        
        Dim netSF As Double
        netSF = CDbl(.txtLength.value) * CDbl(.txtHeight.value) - openingSF
        ws.Cells(lastRow, 11).value = netSF
        
        ws.Cells(lastRow, 12).value = .txtCorners.value
        ws.Cells(lastRow, 13).value = .txtHeaderLF.value
        ws.Cells(lastRow, 14).value = Date
    End With
    
    .lstWalls.AddItem entryID & " - " & .txtWallID.value & " (" & .txtLength.value & "' x " & .txtHeight.value & "')"
    
    ClearWallFields
End Sub

' Clear wall input fields
Private Sub ClearWallFields()
    With frmMain
        .txtWallID.value = ""
        .txtLength.value = ""
        .txtHeight.value = ""
        .txtOpeningSF.value = ""
        .txtCorners.value = ""
        .txtHeaderLF.value = ""
        .lblPanelHeight.Caption = "Panel Height: --"
        .lblPanelQty.Caption = "Panel Qty: --"
    End With
End Sub
'@
}

function Get-ModUserFormCode {
    @'
Option Explicit

' Initialize UserForm
Public Sub InitializeUserForm()
    With frmMain
        ' Populate Building Type dropdown
        .cmbBuildingType.Clear
        .cmbBuildingType.AddItem "Single Family Residential"
        .cmbBuildingType.AddItem "Multi-Family Residential"
        .cmbBuildingType.AddItem "Commercial"
        .cmbBuildingType.AddItem "Industrial"
        .cmbBuildingType.AddItem "Mixed Use"
        
        ' Populate Stories dropdown
        .cmbStories.Clear
        .cmbStories.AddItem "1"
        .cmbStories.AddItem "2"
        .cmbStories.AddItem "3"
        .cmbStories.AddItem "4+"
        
        ' Populate Has Deck dropdown
        .cmbHasDeck.Clear
        .cmbHasDeck.AddItem "Yes"
        .cmbHasDeck.AddItem "No"
        
        ' Populate Floor Level dropdown
        .cmbFloorLevel.Clear
        .cmbFloorLevel.AddItem "Level 1"
        .cmbFloorLevel.AddItem "Level 2"
        .cmbFloorLevel.AddItem "Level 3"
        .cmbFloorLevel.AddItem "Level 4"
        
        ' Populate Elevation dropdown
        .cmbElevation.Clear
        .cmbElevation.AddItem "Front"
        .cmbElevation.AddItem "Rear"
        .cmbElevation.AddItem "Left"
        .cmbElevation.AddItem "Right"
        .cmbElevation.AddItem "Interior"
    End With
End Sub
'@
}

function Get-UserFormCode {
    @'
Option Explicit

Private Sub UserForm_Initialize()
    InitializeUserForm
End Sub

Private Sub btnSaveProject_Click()
    Dim errors As Collection
    
    If ValidateProjectInfo(errors) Then
        SaveProject
        MsgBox "Move to the Walls tab to start entering wall data.", vbInformation
        Me.MultiPage1.value = 1
    Else
        Dim errorMsg As String
        errorMsg = "Please fix the following errors:" & vbCrLf & vbCrLf
        
        Dim err As Variant
        For Each err In errors
            errorMsg = errorMsg & "- " & err & vbCrLf
        Next err
        
        MsgBox errorMsg, vbExclamation
    End If
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    
    If g_CurrentProjectID = "" Then
        MsgBox "Please save project information first.", vbExclamation
        Me.MultiPage1.value = 0
        Exit Sub
    End If
    
    If ValidateWallEntry(txtLength.value, txtHeight.value, txtOpeningSF.value, errors) Then
        SaveWall
        MsgBox "Wall added successfully!", vbInformation
    Else
        Dim errorMsg As String
        errorMsg = "Please fix the following errors:" & vbCrLf & vbCrLf
        
        Dim err As Variant
        For Each err In errors
            errorMsg = errorMsg & "- " & err & vbCrLf
        Next err
        
        MsgBox errorMsg, vbExclamation
    End If
End Sub

Private Sub txtHeight_Change()
    If IsNumeric(txtHeight.value) And txtHeight.value <> "" Then
        Dim height As Double
        height = CDbl(txtHeight.value)
        
        lblPanelHeight.Caption = "Panel Height: " & GetPanelHeight(height) & "'"
        
        If IsNumeric(txtLength.value) And txtLength.value <> "" Then
            Dim length As Double
            length = CDbl(txtLength.value)
            Dim panelHeight As Double
            panelHeight = CDbl(GetPanelHeight(height))
            
            Dim panelQty As Long
            panelQty = Application.WorksheetFunction.RoundUp(length / 4, 0)
            lblPanelQty.Caption = "Panel Qty: " & panelQty
        End If
    Else
        lblPanelHeight.Caption = "Panel Height: --"
        lblPanelQty.Caption = "Panel Qty: --"
    End If
End Sub

Private Sub txtLength_Change()
    Call txtHeight_Change
End Sub
'@
}

function Install-VBACode {
    param([string]$Path)
    
    try {
        Write-Header
        
        # Step 1
        Write-Step 1 10 "Checking prerequisites"
        $fullPath = Resolve-Path $Path
        Write-Success "Excel file found: $([System.IO.Path]::GetFileName($fullPath))"
        Write-Host ""
        
        # Step 2
        Write-Step 2 10 "Creating backup of original file"
        try {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupPath = $fullPath -replace '\.xlsx$', "_backup_$timestamp.xlsx"
            Copy-Item -Path $fullPath -Destination $backupPath -Force
            Write-Success "Backup created: $([System.IO.Path]::GetFileName($backupPath))"
        } catch {
            Write-Warning2 "Could not create backup: $($_.Exception.Message)"
            Write-Warning2 "Continuing without backup..."
        }
        Write-Host ""
        
        # Step 3
        Write-Step 3 10 "Opening Excel application"
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        Write-Success "Excel opened successfully"
        Write-Host ""
        
        # Step 4
        Write-Step 4 10 "Opening workbook"
        $workbook = $excel.Workbooks.Open($fullPath)
        Write-Success "Opened: $([System.IO.Path]::GetFileName($fullPath))"
        Write-Host ""
        
        # Step 5
        Write-Step 5 10 "Verifying VBA project access"
        try {
            $vbProject = $workbook.VBProject
            Write-Success "VBA project access confirmed"
        } catch {
            Write-Failure "Cannot access VBA project"
            Write-Host ""
            Write-Host "SOLUTION:" -ForegroundColor Yellow
            Write-Host "  Enable 'Trust access to the VBA project object model' in Excel" -ForegroundColor White
            Write-Host "  File -> Options -> Trust Center -> Trust Center Settings" -ForegroundColor Gray
            Write-Host "  Macro Settings -> Check the box -> OK" -ForegroundColor Gray
            Write-Host ""
            $workbook.Close($false)
            $excel.Quit()
            return $false
        }
        Write-Host ""
        
        # Step 6
        Write-Step 6 10 "Creating VBA modules"
        $modules = @(
            @{Name="modMain"; Code=(Get-ModMainCode)},
            @{Name="modValidation"; Code=(Get-ModValidationCode)},
            @{Name="modDatabase"; Code=(Get-ModDatabaseCode)},
            @{Name="modUserForm"; Code=(Get-ModUserFormCode)}
        )
        
        foreach ($mod in $modules) {
            $module = $vbProject.VBComponents.Add(1)
            $module.Name = $mod.Name
            $module.CodeModule.AddFromString($mod.Code)
            Write-Success "$($mod.Name) created and populated"
        }
        Write-Host ""
        
        # Step 7
        Write-Step 7 10 "Creating UserForm"
        $userForm = $vbProject.VBComponents.Add(3)
        $userForm.Name = "frmMain"
        $userForm.Properties.Item("Caption").Value = "RF Framing Takeoff System"
        $userForm.Properties.Item("Width").Value = 600
        $userForm.Properties.Item("Height").Value = 450
        Write-Success "UserForm component created"
        Write-Host ""
        
        # Step 8
        Write-Step 8 10 "Adding controls to UserForm"
        
        $multiPage = $userForm.Designer.Controls.Add("Forms.MultiPage.1")
        $multiPage.Name = "MultiPage1"
        $multiPage.Left = 10
        $multiPage.Top = 10
        $multiPage.Width = 560
        $multiPage.Height = 380
        
        $multiPage.Pages.Item(0).Caption = "Project Info"
        $multiPage.Pages.Add() | Out-Null
        $multiPage.Pages.Item(1).Caption = "Walls"
        $multiPage.Pages.Add() | Out-Null
        $multiPage.Pages.Item(2).Caption = "Roof"
        Write-Success "MultiPage control with 3 tabs added"
        
        $page0 = $multiPage.Pages.Item(0)
        $controlsY = 20
        $labels = @("Project Name:", "Project Number:", "Client Name:", "Estimator:", 
                   "Address:", "City:", "State:", "Zip:", "Total SF:", "Notes:")
        $textboxes = @("txtProjectName", "txtProjectNumber", "txtClientName", "txtEstimator",
                      "txtAddress", "txtCity", "txtState", "txtZip", "txtTotalSF", "txtNotes")
        
        for ($i = 0; $i -lt $labels.Count; $i++) {
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
            $lbl.Caption = $labels[$i]
            $lbl.Left = 20
            $lbl.Top = $controlsY
            $lbl.Width = 100
            
            $txt = $userForm.Designer.Controls.Add("Forms.TextBox.1", $page0)
            $txt.Name = $textboxes[$i]
            $txt.Left = 130
            $txt.Top = $controlsY
            $txt.Width = 200
            
            $controlsY += 30
        }
        
        $combosY = 20
        $comboLabels = @("Building Type:", "Stories:", "Has Deck:")
        $comboNames = @("cmbBuildingType", "cmbStories", "cmbHasDeck")
        
        for ($i = 0; $i -lt $comboLabels.Count; $i++) {
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
            $lbl.Caption = $comboLabels[$i]
            $lbl.Left = 350
            $lbl.Top = $combosY
            $lbl.Width = 80
            
            $cmb = $userForm.Designer.Controls.Add("Forms.ComboBox.1", $page0)
            $cmb.Name = $comboNames[$i]
            $cmb.Left = 440
            $cmb.Top = $combosY
            $cmb.Width = 100
            
            $combosY += 30
        }
        
        $checklistLbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page0)
        $checklistLbl.Name = "lblChecklistProject"
        $checklistLbl.Left = 350
        $checklistLbl.Top = 120
        $checklistLbl.Width = 180
        $checklistLbl.Height = 200
        $checklistLbl.Caption = "Checklist will appear here"
        
        $btnSave = $userForm.Designer.Controls.Add("Forms.CommandButton.1", $page0)
        $btnSave.Name = "btnSaveProject"
        $btnSave.Caption = "Save Project"
        $btnSave.Left = 130
        $btnSave.Top = 320
        $btnSave.Width = 100
        $btnSave.Height = 30
        Write-Success "Project Info controls added (10 fields + 3 dropdowns)"
        
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
            $lbl = $userForm.Designer.Controls.Add("Forms.Label.1", $page1)
            $lbl.Caption = $wallLabels[$i]
            $lbl.Left = 20
            $lbl.Top = $wallY
            $lbl.Width = 100
            
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
        
        $lstWalls = $userForm.Designer.Controls.Add("Forms.ListBox.1", $page1)
        $lstWalls.Name = "lstWalls"
        $lstWalls.Left = 270
        $lstWalls.Top = 20
        $lstWalls.Width = 260
        $lstWalls.Height = 140
        
        $btnAddWall = $userForm.Designer.Controls.Add("Forms.CommandButton.1", $page1)
        $btnAddWall.Name = "btnAddWall"
        $btnAddWall.Caption = "Add Wall"
        $btnAddWall.Left = 130
        $btnAddWall.Top = 290
        $btnAddWall.Width = 100
        $btnAddWall.Height = 30
        Write-Success "Wall controls added (9 fields + calculation labels)"
        Write-Host ""
        
        # Step 9
        Write-Step 9 10 "Installing UserForm code"
        $formCode = Get-UserFormCode
        $userForm.CodeModule.AddFromString($formCode)
        Write-Success "UserForm event handlers installed"
        Write-Host ""
        
        # Step 10
        Write-Step 10 10 "Saving macro-enabled workbook"
        $outputPath = $fullPath -replace '\.xlsx$', '.xlsm'
        if ($outputPath -eq $fullPath) {
            $outputPath = $fullPath -replace '\.xlsm$', '_with_vba.xlsm'
        }
        
        $workbook.SaveAs($outputPath, 52)
        $workbook.Close($false)
        $excel.Quit()
        Write-Success "Saved as: $([System.IO.Path]::GetFileName($outputPath))"
        Write-Host ""
        
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host "  * INSTALLATION COMPLETE!" -ForegroundColor Green
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host ""
        Write-Host "Your file is ready:" -ForegroundColor Cyan
        Write-Host "  $outputPath" -ForegroundColor White
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "  1. Open the .xlsm file" -ForegroundColor White
        Write-Host "  2. Enable macros when prompted" -ForegroundColor White
        Write-Host "  3. Press ALT+F8" -ForegroundColor White
        Write-Host "  4. Run 'InitializeSystem'" -ForegroundColor White
        Write-Host ""
        
        return $true
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

$result = Install-VBACode -Path $ExcelPath
if ($result) { exit 0 } else { exit 1 }