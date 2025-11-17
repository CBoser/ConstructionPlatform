<#
.SYNOPSIS
    RF Takeoff System v4.0 - VBA Installer (Controls Built During Install)

.PARAMETER ExcelPath
    Path to the RF_Takeoff_Database_System_v4.xlsm file

.EXAMPLE
    .\Install-VBA-Complete.ps1 -ExcelPath "C:\Users\corey.boser\Documents\PlanTakeoffTool\RF_Takeoff_Database_System_v4.xlsm"
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

function Get-ModMainCode {
    @'
Option Explicit

Public g_CurrentProjectID As String
Public g_CurrentProjectName As String

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
    ElseIf wallHeight <= 9 Then
        GetPanelHeight = "9"
    ElseIf wallHeight <= 10 Then
        GetPanelHeight = "10"
    Else
        GetPanelHeight = "12"
    End If
End Function

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
            errors.Add "Warning: Wall height exceeds 12 foot panel."
        End If
    End If
    
    If openingSF <> "" Then
        If Not IsValidNumber(openingSF, 0, 10000) Then
            errors.Add "Opening SF must be valid"
            isValid = False
        End If
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
    
    MsgBox "Project saved! ID: " & projectID, vbInformation
End Sub

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
    
    ClearWallFields
End Sub

Private Sub ClearWallFields()
    With frmMain
        .txtWallID.value = ""
        .txtLength.value = ""
        .txtHeight.value = ""
        .txtOpeningSF.value = ""
        .txtCorners.value = ""
        .txtHeaderLF.value = ""
    End With
End Sub
'@
}

function Get-UserFormCode {
    @'
Option Explicit

Private Sub UserForm_Initialize()
    On Error Resume Next
    
    cmbBuildingType.Clear
    cmbBuildingType.AddItem "Single Family Residential"
    cmbBuildingType.AddItem "Multi-Family Residential"
    cmbBuildingType.AddItem "Commercial"
    cmbBuildingType.AddItem "Industrial"
    
    cmbStories.Clear
    cmbStories.AddItem "1"
    cmbStories.AddItem "2"
    cmbStories.AddItem "3"
    cmbStories.AddItem "4+"
    
    cmbHasDeck.Clear
    cmbHasDeck.AddItem "Yes"
    cmbHasDeck.AddItem "No"
    
    cmbFloorLevel.Clear
    cmbFloorLevel.AddItem "Level 1"
    cmbFloorLevel.AddItem "Level 2"
    cmbFloorLevel.AddItem "Level 3"
    
    cmbElevation.Clear
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
        Me.MultiPage1.value = 1
    Else
        Dim msg As String
        msg = "Fix these errors:" & vbCrLf
        Dim err As Variant
        For Each err In errors
            msg = msg & vbCrLf & "- " & err
        Next
        MsgBox msg, vbExclamation
    End If
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    If g_CurrentProjectID = "" Then
        MsgBox "Save project first!", vbExclamation
        Me.MultiPage1.value = 0
        Exit Sub
    End If
    If ValidateWallEntry(txtLength.value, txtHeight.value, txtOpeningSF.value, errors) Then
        SaveWall
        MsgBox "Wall added!", vbInformation
    Else
        Dim msg As String
        msg = "Fix these errors:" & vbCrLf
        Dim err As Variant
        For Each err In errors
            msg = msg & vbCrLf & "- " & err
        Next
        MsgBox msg, vbExclamation
    End If
End Sub

Private Sub txtHeight_Change()
    If IsNumeric(txtHeight.value) And txtHeight.value <> "" Then
        Dim h As Double
        h = CDbl(txtHeight.value)
        lblPanelHeight.Caption = "Panel: " & GetPanelHeight(h) & "'"
    End If
End Sub
'@
}

function Install-VBACode {
    param([string]$Path)
    
    try {
        Write-Header
        
        Write-Step 1 9 "Checking prerequisites"
        $fullPath = Resolve-Path $Path
        Write-Success "File found: $([System.IO.Path]::GetFileName($fullPath))"
        Write-Host ""
        
        Write-Step 2 9 "Creating backup"
        try {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $backupPath = $fullPath -replace '\.xlsm$', "_backup_$timestamp.xlsm"
            Copy-Item -Path $fullPath -Destination $backupPath -Force
            Write-Success "Backup: $([System.IO.Path]::GetFileName($backupPath))"
        } catch {
            Write-Host "         ! Backup failed, continuing..." -ForegroundColor Yellow
        }
        Write-Host ""
        
        Write-Step 3 9 "Opening Excel"
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        $excel.AskToUpdateLinks = $false
        Write-Success "Excel opened"
        Write-Host ""
        
        Write-Step 4 9 "Opening workbook"
        $workbook = $excel.Workbooks.Open($fullPath, 0, $false)
        Write-Success "Workbook opened"
        Write-Host ""
        
        Write-Step 5 9 "Checking VBA access"
        try {
            $vbProject = $workbook.VBProject
            Write-Success "VBA access OK"
        } catch {
            Write-Host "         X Cannot access VBA" -ForegroundColor Red
            Write-Host ""
            Write-Host "Enable VBA access:" -ForegroundColor Yellow
            Write-Host "  File > Options > Trust Center > Trust Center Settings" -ForegroundColor Gray
            Write-Host "  Macro Settings > Trust access to VBA project" -ForegroundColor Gray
            $workbook.Close($false)
            $excel.Quit()
            return $false
        }
        Write-Host ""
        
        Write-Step 6 9 "Creating VBA modules"
        
        # Remove existing modules
        $modulesToRemove = @("modMain", "modValidation", "modDatabase", "frmMain")
        foreach ($modName in $modulesToRemove) {
            try {
                $existingMod = $vbProject.VBComponents.Item($modName)
                if ($existingMod) {
                    $vbProject.VBComponents.Remove($existingMod)
                    Write-Host "         - Removed existing $modName" -ForegroundColor Gray
                }
            } catch {}
        }
        
        $modules = @(
            @{Name="modMain"; Code=(Get-ModMainCode)},
            @{Name="modValidation"; Code=(Get-ModValidationCode)},
            @{Name="modDatabase"; Code=(Get-ModDatabaseCode)}
        )
        
        foreach ($mod in $modules) {
            $module = $vbProject.VBComponents.Add(1)
            $module.Name = $mod.Name
            $module.CodeModule.AddFromString($mod.Code)
            Write-Success "$($mod.Name) created"
        }
        Write-Host ""
        
        Write-Step 7 9 "Creating UserForm"
        $userForm = $vbProject.VBComponents.Add(3)
        $userForm.Name = "frmMain"
        $userForm.Properties.Item("Caption").Value = "RF Framing Takeoff System"
        $userForm.Properties.Item("Width").Value = 600
        $userForm.Properties.Item("Height").Value = 450
        Write-Success "UserForm created"
        Write-Host ""
        
        Write-Step 8 9 "Adding MultiPage and controls"
        
        # Add MultiPage
        $multiPage = $userForm.Designer.Controls.Add("Forms.MultiPage.1", "MultiPage1", $true)
        $multiPage.Left = 10
        $multiPage.Top = 10
        $multiPage.Width = 560
        $multiPage.Height = 380
        
        # Configure pages
        $multiPage.Pages(0).Caption = "Project Info"
        [void]$multiPage.Pages.Add()
        $multiPage.Pages(1).Caption = "Walls"
        [void]$multiPage.Pages.Add()
        $multiPage.Pages(2).Caption = "Roof"
        
        Write-Success "MultiPage with 3 tabs added"
        
        # Build controls via VBA to avoid COM issues
        $buildScript = @'
Sub BuildControls()
    Dim uf As Object
    Set uf = VBA.UserForms.Add("frmMain")
    Dim mp As MSForms.MultiPage
    Dim pg As MSForms.Page
    Dim ctrl As MSForms.Control
    Dim y As Long
    Dim i As Integer
    
    Set mp = uf.Controls("MultiPage1")
    Set pg = mp.Pages(0)
    
    ' Project Info page controls
    y = 20
    Dim lbls As Variant, txts As Variant
    lbls = Array("Project Name:", "Project Number:", "Client:", "Estimator:", "Address:", "City:", "State:", "Zip:", "Total SF:", "Notes:")
    txts = Array("txtProjectName", "txtProjectNumber", "txtClientName", "txtEstimator", "txtAddress", "txtCity", "txtState", "txtZip", "txtTotalSF", "txtNotes")
    
    For i = 0 To 9
        Set ctrl = pg.Controls.Add("Forms.Label.1", , True)
        ctrl.Caption = lbls(i)
        ctrl.Left = 20
        ctrl.Top = y
        ctrl.Width = 100
        
        Set ctrl = pg.Controls.Add("Forms.TextBox.1", txts(i), True)
        ctrl.Left = 130
        ctrl.Top = y
        ctrl.Width = 200
        y = y + 30
    Next
    
    ' Combos
    y = 20
    Dim clbls As Variant, cnms As Variant
    clbls = Array("Type:", "Stories:", "Deck:")
    cnms = Array("cmbBuildingType", "cmbStories", "cmbHasDeck")
    
    For i = 0 To 2
        Set ctrl = pg.Controls.Add("Forms.Label.1", , True)
        ctrl.Caption = clbls(i)
        ctrl.Left = 350
        ctrl.Top = y
        ctrl.Width = 80
        
        Set ctrl = pg.Controls.Add("Forms.ComboBox.1", cnms(i), True)
        ctrl.Left = 440
        ctrl.Top = y
        ctrl.Width = 100
        y = y + 30
    Next
    
    Set ctrl = pg.Controls.Add("Forms.CommandButton.1", "btnSaveProject", True)
    ctrl.Caption = "Save Project"
    ctrl.Left = 130
    ctrl.Top = 320
    ctrl.Width = 100
    ctrl.Height = 30
    
    ' Walls page
    Set pg = mp.Pages(1)
    y = 20
    Dim wlbls As Variant, wnms As Variant, wtyp As Variant
    wlbls = Array("Floor:", "Plan:", "Side:", "ID:", "Length:", "Height:", "Opening:", "Corners:", "Header:")
    wnms = Array("cmbFloorLevel", "txtPlanNumber", "cmbElevation", "txtWallID", "txtLength", "txtHeight", "txtOpeningSF", "txtCorners", "txtHeaderLF")
    wtyp = Array("C", "T", "C", "T", "T", "T", "T", "T", "T")
    
    For i = 0 To 8
        Set ctrl = pg.Controls.Add("Forms.Label.1", , True)
        ctrl.Caption = wlbls(i)
        ctrl.Left = 20
        ctrl.Top = y
        ctrl.Width = 80
        
        If wtyp(i) = "C" Then
            Set ctrl = pg.Controls.Add("Forms.ComboBox.1", wnms(i), True)
        Else
            Set ctrl = pg.Controls.Add("Forms.TextBox.1", wnms(i), True)
        End If
        ctrl.Left = 110
        ctrl.Top = y
        ctrl.Width = 120
        y = y + 30
    Next
    
    Set ctrl = pg.Controls.Add("Forms.Label.1", "lblPanelHeight", True)
    ctrl.Caption = "Panel: --"
    ctrl.Left = 250
    ctrl.Top = 150
    ctrl.Width = 100
    
    Set ctrl = pg.Controls.Add("Forms.ListBox.1", "lstWalls", True)
    ctrl.Left = 250
    ctrl.Top = 20
    ctrl.Width = 280
    ctrl.Height = 120
    
    Set ctrl = pg.Controls.Add("Forms.CommandButton.1", "btnAddWall", True)
    ctrl.Caption = "Add Wall"
    ctrl.Left = 110
    ctrl.Top = 290
    ctrl.Width = 100
    ctrl.Height = 30
End Sub
'@
        
        $tempMod = $vbProject.VBComponents.Add(1)
        $tempMod.Name = "TempBuilder"
        $tempMod.CodeModule.AddFromString($buildScript)
        
        # Run the builder
        $excel.Run("BuildControls")
        
        # Remove temp module
        $vbProject.VBComponents.Remove($tempMod)
        
        Write-Success "All controls added to pages"
        Write-Host ""
        
        Write-Step 9 9 "Adding UserForm code"
        $code = Get-UserFormCode
        $userForm.CodeModule.AddFromString($code)
        Write-Success "Code installed"
        Write-Host ""
        
        Write-Host "Saving workbook..." -ForegroundColor Yellow
        $workbook.Save()
        $workbook.Close($false)
        $excel.Quit()
        
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        
        Write-Success "Saved successfully"
        Write-Host ""
        
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host "  INSTALLATION COMPLETE!" -ForegroundColor Green
        Write-Host ("=" * 70) -ForegroundColor Green
        Write-Host ""
        Write-Host "Your file: $fullPath" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Open the .xlsm file" -ForegroundColor White
        Write-Host "  2. Enable macros" -ForegroundColor White
        Write-Host "  3. Press ALT+F8" -ForegroundColor White
        Write-Host "  4. Run 'InitializeSystem'" -ForegroundColor White
        Write-Host ""
        
        return $true
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        if ($excel) {
            try { $excel.Quit() } catch {}
        }
        return $false
    }
}

$result = Install-VBACode -Path $ExcelPath
exit $(if ($result) { 0 } else { 1 })