<#
.SYNOPSIS
    RF Takeoff System v4.0 - VBA Installer (Direct PowerShell Control Building)

.PARAMETER ExcelPath
    Path to the RF_Takeoff_Database_System_v4.xlsm file
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
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
    Write-Host "[$StepNum/$TotalSteps] $Message..." -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "         * $Message" -ForegroundColor Green
}

# [Previous Get-ModMainCode, Get-ModValidationCode, Get-ModDatabaseCode functions remain the same]

function Get-ModMainCode {
    @'
Option Explicit

Public g_CurrentProjectID As String
Public g_CurrentProjectName As String

Public Sub InitializeSystem()
    frmMain.Show
End Sub

Public Function GenerateEntryID(sheetName As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim prefix As String
    Set ws = ThisWorkbook.Sheets(sheetName)
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    Select Case sheetName
        Case "WallData": prefix = "WALL"
        Case "RoofData": prefix = "ROOF"
        Case Else: prefix = "ENTRY"
    End Select
    GenerateEntryID = prefix & "-" & Format(lastRow, "0000")
End Function

Public Function GenerateProjectID() As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Set ws = ThisWorkbook.Sheets("Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    GenerateProjectID = "PROJ-" & Format(lastRow, "000")
End Function

Public Function IsValidNumber(value As String, minVal As Double, maxVal As Double) As Boolean
    On Error GoTo ErrorHandler
    Dim numVal As Double
    numVal = CDbl(value)
    IsValidNumber = (numVal >= minVal And numVal <= maxVal)
    Exit Function
ErrorHandler:
    IsValidNumber = False
End Function

Public Function GetPanelHeight(wallHeight As Double) As String
    If wallHeight <= 8 Then
        GetPanelHeight = "8"
    ElseIf wallHeight <= 10 Then
        GetPanelHeight = "10"
    Else
        GetPanelHeight = "12"
    End If
End Function
'@
}

function Get-ModValidationCode {
    @'
Option Explicit

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
    End With
    ValidateProjectInfo = isValid
End Function

Public Function ValidateWallEntry(length As String, height As String, openingSF As String, ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    If Not IsValidNumber(length, 0.1, 1000) Then
        errors.Add "Length must be between 0.1 and 1000"
        isValid = False
    End If
    If Not IsValidNumber(height, 0.1, 20) Then
        errors.Add "Height must be between 0.1 and 20"
        isValid = False
    End If
    ValidateWallEntry = isValid
End Function
'@
}

function Get-ModDatabaseCode {
    @'
Option Explicit

Public Sub SaveProject()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim projectID As String
    Set ws = ThisWorkbook.Sheets("Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    projectID = GenerateProjectID()
    g_CurrentProjectID = projectID
    With frmMain
        ws.Cells(lastRow, 1).value = projectID
        ws.Cells(lastRow, 2).value = .txtProjectName.value
        ws.Cells(lastRow, 5).value = .txtEstimator.value
        ws.Cells(lastRow, 10).value = .cmbBuildingType.value
        ws.Cells(lastRow, 15).value = Date
    End With
    MsgBox "Project saved! ID: " & projectID, vbInformation
End Sub

Public Sub SaveWall()
    Dim ws As Worksheet
    Dim lastRow As Long
    Set ws = ThisWorkbook.Sheets("WallData")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    With frmMain
        ws.Cells(lastRow, 1).value = GenerateEntryID("WallData")
        ws.Cells(lastRow, 2).value = g_CurrentProjectID
        ws.Cells(lastRow, 7).value = .txtLength.value
        ws.Cells(lastRow, 8).value = .txtHeight.value
    End With
    MsgBox "Wall saved!", vbInformation
End Sub
'@
}

function Get-UserFormCode {
    @'
Option Explicit

Private Sub UserForm_Initialize()
    On Error Resume Next
    cmbBuildingType.AddItem "Single Family"
    cmbBuildingType.AddItem "Multi-Family"
    cmbBuildingType.AddItem "Commercial"
    cmbStories.AddItem "1"
    cmbStories.AddItem "2"
    cmbStories.AddItem "3"
    cmbFloorLevel.AddItem "Level 1"
    cmbFloorLevel.AddItem "Level 2"
    cmbElevation.AddItem "Front"
    cmbElevation.AddItem "Rear"
    cmbElevation.AddItem "Left"
    cmbElevation.AddItem "Right"
    On Error GoTo 0
End Sub

Private Sub btnSaveProject_Click()
    Dim errors As Collection
    If ValidateProjectInfo(errors) Then
        SaveProject
        MultiPage1.value = 1
    Else
        MsgBox "Please fill required fields", vbExclamation
    End If
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    If g_CurrentProjectID = "" Then
        MsgBox "Save project first!", vbExclamation
        MultiPage1.value = 0
        Exit Sub
    End If
    If ValidateWallEntry(txtLength.value, txtHeight.value, txtOpeningSF.value, errors) Then
        SaveWall
    Else
        MsgBox "Check wall dimensions", vbExclamation
    End If
End Sub

Private Sub txtHeight_Change()
    If IsNumeric(txtHeight.value) Then
        lblPanelHeight.Caption = "Panel: " & GetPanelHeight(CDbl(txtHeight.value)) & "'"
    End If
End Sub
'@
}

function Install-VBACode {
    param([string]$Path)
    
    try {
        Write-Header
        
        Write-Step 1 9 "Checking file"
        $fullPath = Resolve-Path $Path
        Write-Success "Found: $([System.IO.Path]::GetFileName($fullPath))"
        Write-Host ""
        
        Write-Step 2 9 "Creating backup"
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupPath = $fullPath -replace '\.xlsm$', "_backup_$timestamp.xlsm"
        Copy-Item -Path $fullPath -Destination $backupPath -Force
        Write-Success "Backup created"
        Write-Host ""
        
        Write-Step 3 9 "Opening Excel"
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        Write-Success "Excel opened"
        Write-Host ""
        
        Write-Step 4 9 "Opening workbook"
        $workbook = $excel.Workbooks.Open($fullPath, 0, $false)
        Write-Success "Workbook opened"
        Write-Host ""
        
        Write-Step 5 9 "Accessing VBA"
        $vbProject = $workbook.VBProject
        Write-Success "VBA access OK"
        Write-Host ""
        
        Write-Step 6 9 "Removing old modules"
        $toRemove = @("modMain", "modValidation", "modDatabase", "frmMain")
        foreach ($modName in $toRemove) {
            try {
                $existing = $vbProject.VBComponents.Item($modName)
                $vbProject.VBComponents.Remove($existing)
            } catch {}
        }
        Write-Success "Cleanup complete"
        Write-Host ""
        
        Write-Step 7 9 "Creating modules"
        $modules = @(
            @{Name="modMain"; Code=(Get-ModMainCode)},
            @{Name="modValidation"; Code=(Get-ModValidationCode)},
            @{Name="modDatabase"; Code=(Get-ModDatabaseCode)}
        )
        foreach ($mod in $modules) {
            $module = $vbProject.VBComponents.Add(1)
            $module.Name = $mod.Name
            $module.CodeModule.AddFromString($mod.Code)
        }
        Write-Success "Modules created"
        Write-Host ""
        
        Write-Step 8 9 "Building UserForm"
        
        # Create UserForm
        $uf = $vbProject.VBComponents.Add(3)
        $uf.Name = "frmMain"
        $uf.Properties.Item("Caption").Value = "RF Framing Takeoff"
        $uf.Properties.Item("Width").Value = 600
        $uf.Properties.Item("Height").Value = 450
        
        # Add MultiPage
        $mp = $uf.Designer.Controls.Add("Forms.MultiPage.1", "MultiPage1", $true)
        $mp.Left = 10
        $mp.Top = 10
        $mp.Width = 560
        $mp.Height = 380
        $mp.Pages.Item(0).Caption = "Project Info"
        [void]$mp.Pages.Add()
        $mp.Pages.Item(1).Caption = "Walls"
        [void]$mp.Pages.Add()
        $mp.Pages.Item(2).Caption = "Roof"
        
        Write-Success "UserForm and MultiPage created"
        
        # Page 0 - Project Info
        Write-Host "         Adding Project Info controls..." -ForegroundColor Gray
        $page0 = $mp.Pages.Item(0).Controls
        $y = 20
        
        # Project Name
        $lbl = $page0.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Project Name:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 100
        $txt = $page0.Add("Forms.TextBox.1", "txtProjectName", $true)
        $txt.Left = 130; $txt.Top = $y; $txt.Width = 200
        $y += 30
        
        # Estimator
        $lbl = $page0.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Estimator:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 100
        $txt = $page0.Add("Forms.TextBox.1", "txtEstimator", $true)
        $txt.Left = 130; $txt.Top = $y; $txt.Width = 200
        $y += 30
        
        # Building Type
        $lbl = $page0.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Building Type:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 100
        $cmb = $page0.Add("Forms.ComboBox.1", "cmbBuildingType", $true)
        $cmb.Left = 130; $cmb.Top = $y; $cmb.Width = 200
        $y += 30
        
        # Stories
        $lbl = $page0.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Stories:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 100
        $cmb = $page0.Add("Forms.ComboBox.1", "cmbStories", $true)
        $cmb.Left = 130; $cmb.Top = $y; $cmb.Width = 200
        
        # Save button
        $btn = $page0.Add("Forms.CommandButton.1", "btnSaveProject", $true)
        $btn.Caption = "Save Project"
        $btn.Left = 130; $btn.Top = 320; $btn.Width = 100; $btn.Height = 30
        
        Write-Success "Project Info page complete"
        
        # Page 1 - Walls
        Write-Host "         Adding Wall controls..." -ForegroundColor Gray
        $page1 = $mp.Pages.Item(1).Controls
        $y = 20
        
        # Floor Level
        $lbl = $page1.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Floor:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 80
        $cmb = $page1.Add("Forms.ComboBox.1", "cmbFloorLevel", $true)
        $cmb.Left = 110; $cmb.Top = $y; $cmb.Width = 120
        $y += 30
        
        # Elevation
        $lbl = $page1.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Side:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 80
        $cmb = $page1.Add("Forms.ComboBox.1", "cmbElevation", $true)
        $cmb.Left = 110; $cmb.Top = $y; $cmb.Width = 120
        $y += 30
        
        # Length
        $lbl = $page1.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Length (FT):"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 80
        $txt = $page1.Add("Forms.TextBox.1", "txtLength", $true)
        $txt.Left = 110; $txt.Top = $y; $txt.Width = 120
        $y += 30
        
        # Height
        $lbl = $page1.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Height (FT):"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 80
        $txt = $page1.Add("Forms.TextBox.1", "txtHeight", $true)
        $txt.Left = 110; $txt.Top = $y; $txt.Width = 120
        $y += 30
        
        # Opening SF
        $lbl = $page1.Add("Forms.Label.1", "", $true)
        $lbl.Caption = "Opening SF:"
        $lbl.Left = 20; $lbl.Top = $y; $lbl.Width = 80
        $txt = $page1.Add("Forms.TextBox.1", "txtOpeningSF", $true)
        $txt.Left = 110; $txt.Top = $y; $txt.Width = 120
        
        # Panel label
        $lbl = $page1.Add("Forms.Label.1", "lblPanelHeight", $true)
        $lbl.Caption = "Panel: --"
        $lbl.Left = 250; $lbl.Top = 100; $lbl.Width = 100
        
        # Add button
        $btn = $page1.Add("Forms.CommandButton.1", "btnAddWall", $true)
        $btn.Caption = "Add Wall"
        $btn.Left = 110; $btn.Top = 290; $btn.Width = 100; $btn.Height = 30
        
        Write-Success "Walls page complete"
        Write-Host ""
        
        Write-Step 9 9 "Adding code"
        $code = Get-UserFormCode
        $uf.CodeModule.AddFromString($code)
        Write-Success "Code installed"
        Write-Host ""
        
        Write-Host "Saving..." -ForegroundColor Yellow
        $workbook.Save()
        $workbook.Close($false)
        $excel.Quit()
        
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        
        Write-Host ""
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host "  INSTALLATION COMPLETE!" -ForegroundColor Green
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Open file, Enable macros, ALT+F8, Run InitializeSystem" -ForegroundColor Cyan
        Write-Host ""
        
        return $true
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($excel) { try { $excel.Quit() } catch {} }
        return $false
    }
}

$result = Install-VBACode -Path $ExcelPath
exit $(if ($result) { 0 } else { 1 })
