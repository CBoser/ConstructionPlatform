"""
RF Takeoff System v4.0 - Automatic VBA Installer
================================================

This script automatically installs all VBA code and creates the UserForm
in your Excel workbook, saving you the manual setup time.

REQUIREMENTS:
- Windows OS (VBA automation requires Windows COM objects)
- Excel installed
- Python 3.6+
- pywin32 library: pip install pywin32

USAGE:
    python install_vba.py path/to/RF_Takeoff_Database_System_v4.xlsx

The script will:
1. Open the Excel workbook
2. Create all 4 VBA modules with code
3. Create the UserForm with all controls
4. Add the UserForm code
5. Save as macro-enabled workbook (.xlsm)
"""

import sys
import os

try:
    import win32com.client as win32
    from win32com.client import constants as c
except ImportError:
    print("ERROR: pywin32 library not found!")
    print("Install it with: pip install pywin32")
    sys.exit(1)

def create_module_code(module_name):
    """Return VBA code for each module"""
    
    if module_name == "modMain":
        return '''Option Explicit

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
'''
    
    elif module_name == "modValidation":
        return '''Option Explicit

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
    
    If Not pitch Like "#/##" And Not pitch Like "##/##" Then
        errors.Add "Pitch must be in format X/12 (e.g., 6/12)"
        isValid = False
    End If
    
    ValidateRoofEntry = isValid
End Function

' Validate deck hardware is Z-MAX
Public Function ValidateDeckHardware(hardwareType As String, ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    
    If InStr(1, UCase(hardwareType), "Z-MAX") = 0 And _
       InStr(1, UCase(hardwareType), "ZMAX") = 0 Then
        errors.Add "WARNING: All deck hardware must be Z-MAX corrosion resistant!"
        isValid = False
    End If
    
    ValidateDeckHardware = isValid
End Function

' Validate floor blocking
Public Function ValidateFloorBlocking(blockingLF As String, ByRef errors As Collection) As Boolean
    Dim isValid As Boolean
    isValid = True
    Set errors = New Collection
    
    If Trim(blockingLF) = "" Or CDbl(blockingLF) = 0 Then
        errors.Add "CRITICAL: Blocking required at ALL beams and walls! Do not forget!"
        isValid = False
    End If
    
    ValidateFloorBlocking = isValid
End Function
'''
    
    elif module_name == "modDatabase":
        return '''Option Explicit

' Save project to database
Public Function SaveProject(projName As String, projNum As String, clientName As String, _
                          estimator As String, addr As String, city As String, _
                          state As String, zip As String, buildingType As String, _
                          stories As Integer, hasDeck As String, totalSF As Double, _
                          notes As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim projectID As String
    
    Set ws = ThisWorkbook.Sheets("Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    projectID = GenerateProjectID()
    
    With ws
        .Cells(lastRow, 1) = projectID
        .Cells(lastRow, 2) = projName
        .Cells(lastRow, 3) = projNum
        .Cells(lastRow, 4) = clientName
        .Cells(lastRow, 5) = estimator
        .Cells(lastRow, 6) = Format(Date, "yyyy-mm-dd")
        .Cells(lastRow, 7) = addr
        .Cells(lastRow, 8) = city
        .Cells(lastRow, 9) = state
        .Cells(lastRow, 10) = zip
        .Cells(lastRow, 11) = buildingType
        .Cells(lastRow, 12) = "Active"
        .Cells(lastRow, 13) = stories
        .Cells(lastRow, 14) = hasDeck
        .Cells(lastRow, 15) = totalSF
        .Cells(lastRow, 16) = notes
    End With
    
    g_CurrentProjectID = projectID
    g_CurrentProjectName = projName
    
    SaveProject = projectID
End Function

' Save wall entry to database
Public Sub SaveWallEntry(floorLevel As String, planNum As String, elevation As String, _
                        wallID As String, length As Double, height As Double, _
                        openingSF As Double, corners As Integer, headerLF As Double)
    Dim ws As Worksheet
    Dim lastRow As Long
    
    Set ws = ThisWorkbook.Sheets("WallData")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    With ws
        .Cells(lastRow, 1) = GenerateEntryID("WallData")
        .Cells(lastRow, 2) = g_CurrentProjectID
        .Cells(lastRow, 3) = floorLevel
        .Cells(lastRow, 4) = planNum
        .Cells(lastRow, 5) = elevation
        .Cells(lastRow, 6) = wallID
        .Cells(lastRow, 7) = length
        .Cells(lastRow, 8) = height
        .Cells(lastRow, 9) = length * height
        .Cells(lastRow, 10) = openingSF
        .Cells(lastRow, 11) = (length * height) - openingSF
        .Cells(lastRow, 12) = corners
        .Cells(lastRow, 13) = headerLF
        .Cells(lastRow, 14) = GetPanelHeight(height)
        .Cells(lastRow, 15) = "=K" & lastRow & "/" & _
            "(IF(N" & lastRow & "=8,32,IF(N" & lastRow & "=9,36,IF(N" & lastRow & "=10,40,48))))"
        .Cells(lastRow, 16) = Format(Date, "yyyy-mm-dd")
        .Cells(lastRow, 17) = "Yes"
    End With
End Sub

' Save roof entry to database
Public Sub SaveRoofEntry(planNum As String, section As String, run As Double, _
                        depth As Double, pitch As String, eaveOH As Double, _
                        rakeOH As Double, ridgeLF As Double, hipLF As Double, valleyLF As Double)
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim slopeFactor As Double
    
    Set ws = ThisWorkbook.Sheets("RoofData")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    slopeFactor = GetSlopeFactor(pitch)
    
    With ws
        .Cells(lastRow, 1) = GenerateEntryID("RoofData")
        .Cells(lastRow, 2) = g_CurrentProjectID
        .Cells(lastRow, 3) = planNum
        .Cells(lastRow, 4) = section
        .Cells(lastRow, 5) = run
        .Cells(lastRow, 6) = depth
        .Cells(lastRow, 7) = pitch
        .Cells(lastRow, 8) = slopeFactor
        .Cells(lastRow, 9) = run * depth * slopeFactor
        .Cells(lastRow, 10) = eaveOH
        .Cells(lastRow, 11) = rakeOH
        .Cells(lastRow, 12) = ridgeLF
        .Cells(lastRow, 13) = hipLF
        .Cells(lastRow, 14) = valleyLF
        .Cells(lastRow, 15) = Format(Date, "yyyy-mm-dd")
        .Cells(lastRow, 16) = "Yes"
    End With
End Sub
'''
    
    elif module_name == "modTypes":
        return '''Option Explicit

' Type definitions are not needed in VBA when using individual parameters
' This module is kept for compatibility but can be left empty
'''
    
    return ""

def create_userform_code():
    """Return UserForm VBA code"""
    return '''Option Explicit

Private Sub UserForm_Initialize()
    ' Initialize Project tab
    With cmbBuildingType
        .AddItem "Residential"
        .AddItem "Commercial"
        .AddItem "Multi-Family"
        .AddItem "Industrial"
    End With
    
    With cmbStories
        .AddItem "1"
        .AddItem "2"
        .AddItem "3"
        .AddItem "4"
    End With
    
    With cmbHasDeck
        .AddItem "Yes"
        .AddItem "No"
    End With
    
    ' Initialize Wall tab
    With cmbFloorLevel
        .AddItem "Basement"
        .AddItem "1st"
        .AddItem "2nd"
        .AddItem "3rd"
        .AddItem "4th"
    End With
    
    With cmbElevation
        .AddItem "N"
        .AddItem "S"
        .AddItem "E"
        .AddItem "W"
    End With
    
    ' Display checklists
    Call DisplayProjectChecklist
End Sub

Private Sub btnSaveProject_Click()
    Dim errors As Collection
    Dim projectID As String
    
    If Not ValidateProjectInfo(errors) Then
        Dim msg As String
        msg = "Please correct the following errors:" & vbCrLf & vbCrLf
        Dim err As Variant
        For Each err In errors
            msg = msg & "• " & err & vbCrLf
        Next
        MsgBox msg, vbExclamation, "Validation Errors"
        Exit Sub
    End If
    
    projectID = SaveProject(Me.txtProjectName.value, Me.txtProjectNumber.value, _
                           Me.txtClientName.value, Me.txtEstimator.value, _
                           Me.txtAddress.value, Me.txtCity.value, _
                           Me.txtState.value, Me.txtZip.value, _
                           Me.cmbBuildingType.value, CInt(Me.cmbStories.value), _
                           Me.cmbHasDeck.value, CDbl(Me.txtTotalSF.value), _
                           Me.txtNotes.value)
    
    MsgBox "Project saved successfully!" & vbCrLf & vbCrLf & _
           "Project ID: " & projectID & vbCrLf & _
           "You can now proceed with takeoff data entry.", _
           vbInformation, "Success"
    
    ' Enable other tabs
    Me.MultiPage1.Pages(1).Enabled = True
    Me.MultiPage1.Pages(2).Enabled = True
End Sub

Private Sub txtHeight_Change()
    If IsNumeric(Me.txtHeight.value) Then
        Dim height As Double
        height = CDbl(Me.txtHeight.value)
        Me.lblPanelHeight.Caption = GetPanelHeight(height) & " ft"
        
        If IsNumeric(Me.txtLength.value) Then
            Dim length As Double
            Dim openingSF As Double
            Dim netSF As Double
            Dim panelSF As Double
            
            length = CDbl(Me.txtLength.value)
            openingSF = IIf(IsNumeric(Me.txtOpeningSF.value), CDbl(Me.txtOpeningSF.value), 0)
            netSF = (length * height) - openingSF
            
            Select Case GetPanelHeight(height)
                Case "8": panelSF = 32
                Case "9": panelSF = 36
                Case "10": panelSF = 40
                Case "12": panelSF = 48
            End Select
            
            Me.lblPanelQty.Caption = Format(netSF / panelSF, "0.0") & " panels"
        End If
    End If
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    
    If Not ValidateWallEntry(Me.txtLength.value, Me.txtHeight.value, _
                            Me.txtOpeningSF.value, errors) Then
        Dim msg As String
        msg = "Please correct the following errors:" & vbCrLf & vbCrLf
        Dim err As Variant
        For Each err In errors
            msg = msg & "• " & err & vbCrLf
        Next
        MsgBox msg, vbExclamation, "Validation Errors"
        Exit Sub
    End If
    
    Call SaveWallEntry(Me.cmbFloorLevel.value, Me.txtPlanNumber.value, _
                       Me.cmbElevation.value, Me.txtWallID.value, _
                       CDbl(Me.txtLength.value), CDbl(Me.txtHeight.value), _
                       IIf(IsNumeric(Me.txtOpeningSF.value), CDbl(Me.txtOpeningSF.value), 0), _
                       IIf(IsNumeric(Me.txtCorners.value), CInt(Me.txtCorners.value), 0), _
                       IIf(IsNumeric(Me.txtHeaderLF.value), CDbl(Me.txtHeaderLF.value), 0))
    
    Me.lstWalls.AddItem Me.cmbFloorLevel.value & " - " & Me.txtWallID.value & _
                        " (" & Me.txtLength.value & "' × " & Me.txtHeight.value & "')"
    
    Call ClearWallForm
    
    MsgBox "Wall entry saved successfully!", vbInformation
End Sub

Private Sub ClearWallForm()
    Me.txtPlanNumber.value = ""
    Me.cmbElevation.ListIndex = -1
    Me.txtWallID.value = ""
    Me.txtLength.value = ""
    Me.txtHeight.value = ""
    Me.txtOpeningSF.value = ""
    Me.txtCorners.value = ""
    Me.txtHeaderLF.value = ""
    Me.lblPanelHeight.Caption = ""
    Me.lblPanelQty.Caption = ""
End Sub

Private Sub DisplayProjectChecklist()
    Dim checklist As String
    checklist = "PROJECT SETUP CHECKLIST:" & vbCrLf & vbCrLf
    checklist = checklist & "☐ Project name entered" & vbCrLf
    checklist = checklist & "☐ Project number assigned" & vbCrLf
    checklist = checklist & "☐ Client information complete" & vbCrLf
    checklist = checklist & "☐ Estimator name recorded" & vbCrLf
    checklist = checklist & "☐ Building type selected" & vbCrLf
    checklist = checklist & "☐ Number of stories confirmed" & vbCrLf
    
    Me.lblChecklistProject.Caption = checklist
End Sub
'''

def install_vba(excel_path):
    """Install VBA code and create UserForm in Excel workbook"""
    
    print("=" * 70)
    print("RF TAKEOFF SYSTEM v4.0 - VBA INSTALLER")
    print("=" * 70)
    print()
    
    # Check if file exists
    if not os.path.exists(excel_path):
        print(f"ERROR: File not found: {excel_path}")
        return False
    
    print(f"Opening workbook: {excel_path}")
    
    try:
        # Start Excel
        excel = win32.gencache.EnsureDispatch('Excel.Application')
        excel.Visible = False
        excel.DisplayAlerts = False
        
        # Open workbook
        wb = excel.Workbooks.Open(os.path.abspath(excel_path))
        vb_project = wb.VBProject
        
        print("✓ Workbook opened successfully")
        print()
        
        # Install modules
        print("Installing VBA modules...")
        modules_to_create = ["modMain", "modValidation", "modDatabase", "modTypes"]
        
        for module_name in modules_to_create:
            print(f"  • Creating {module_name}...")
            
            # Create module
            vb_module = vb_project.VBComponents.Add(1)  # 1 = vbext_ct_StdModule
            vb_module.Name = module_name
            
            # Add code
            code = create_module_code(module_name)
            if code:
                vb_module.CodeModule.AddFromString(code)
            
            print(f"    ✓ {module_name} installed")
        
        print()
        print("✓ All modules installed successfully")
        print()
        
        # Create UserForm
        print("Creating UserForm...")
        print("  • Adding UserForm component...")
        
        user_form = vb_project.VBComponents.Add(3)  # 3 = vbext_ct_MSForm
        user_form.Name = "frmMain"
        user_form.Properties("Caption").Value = "RF Framing Takeoff System"
        user_form.Properties("Width").Value = 600
        user_form.Properties("Height").Value = 450
        
        print("    ✓ UserForm component created")
        print()
        
        # Add controls to UserForm
        print("  • Adding controls to UserForm...")
        
        # Add MultiPage control
        multipage = user_form.Designer.Controls.Add("Forms.MultiPage.1")
        multipage.Name = "MultiPage1"
        multipage.Left = 10
        multipage.Top = 10
        multipage.Width = 560
        multipage.Height = 380
        
        # Configure pages
        multipage.Pages(0).Caption = "Project Info"
        multipage.Pages.Add()
        multipage.Pages(1).Caption = "Walls"
        multipage.Pages.Add()
        multipage.Pages(2).Caption = "Roof"
        
        print("    ✓ MultiPage control added with 3 tabs")
        print()
        
        # Add Project Info controls (Page 0)
        print("  • Adding Project Info controls...")
        page0 = multipage.Pages(0)
        
        # Labels and TextBoxes for project info
        controls_y = 20
        labels = ["Project Name:", "Project Number:", "Client Name:", "Estimator:", 
                 "Address:", "City:", "State:", "Zip:", "Total SF:", "Notes:"]
        textboxes = ["txtProjectName", "txtProjectNumber", "txtClientName", "txtEstimator",
                    "txtAddress", "txtCity", "txtState", "txtZip", "txtTotalSF", "txtNotes"]
        
        for i, (label_text, textbox_name) in enumerate(zip(labels, textboxes)):
            # Add label
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page0)
            lbl.Caption = label_text
            lbl.Left = 20
            lbl.Top = controls_y
            lbl.Width = 100
            
            # Add textbox
            txt = user_form.Designer.Controls.Add("Forms.TextBox.1", page0)
            txt.Name = textbox_name
            txt.Left = 130
            txt.Top = controls_y
            txt.Width = 200
            
            controls_y += 30
        
        # Add combo boxes
        combos_y = 20
        combo_labels = ["Building Type:", "Stories:", "Has Deck:"]
        combo_names = ["cmbBuildingType", "cmbStories", "cmbHasDeck"]
        
        for label_text, combo_name in zip(combo_labels, combo_names):
            # Add label
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page0)
            lbl.Caption = label_text
            lbl.Left = 350
            lbl.Top = combos_y
            lbl.Width = 80
            
            # Add combobox
            cmb = user_form.Designer.Controls.Add("Forms.ComboBox.1", page0)
            cmb.Name = combo_name
            cmb.Left = 440
            cmb.Top = combos_y
            cmb.Width = 100
            
            combos_y += 30
        
        # Add checklist label
        checklist_lbl = user_form.Designer.Controls.Add("Forms.Label.1", page0)
        checklist_lbl.Name = "lblChecklistProject"
        checklist_lbl.Left = 350
        checklist_lbl.Top = 120
        checklist_lbl.Width = 180
        checklist_lbl.Height = 200
        checklist_lbl.Caption = "Checklist will appear here"
        
        # Add Save Project button
        btn_save = user_form.Designer.Controls.Add("Forms.CommandButton.1", page0)
        btn_save.Name = "btnSaveProject"
        btn_save.Caption = "Save Project"
        btn_save.Left = 130
        btn_save.Top = 320
        btn_save.Width = 100
        btn_save.Height = 30
        
        print("    ✓ Project Info controls added")
        print()
        
        # Add Wall controls (Page 1)
        print("  • Adding Wall controls...")
        page1 = multipage.Pages(1)
        
        wall_y = 20
        wall_labels = ["Floor Level:", "Plan #:", "Elevation:", "Wall ID:", "Length (FT):",
                      "Height (FT):", "Opening SF:", "Corners:", "Header LF:"]
        wall_controls = [("cmbFloorLevel", "ComboBox"), ("txtPlanNumber", "TextBox"),
                        ("cmbElevation", "ComboBox"), ("txtWallID", "TextBox"),
                        ("txtLength", "TextBox"), ("txtHeight", "TextBox"),
                        ("txtOpeningSF", "TextBox"), ("txtCorners", "TextBox"),
                        ("txtHeaderLF", "TextBox")]
        
        for label_text, (control_name, control_type) in zip(wall_labels, wall_controls):
            # Add label
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page1)
            lbl.Caption = label_text
            lbl.Left = 20
            lbl.Top = wall_y
            lbl.Width = 100
            
            # Add control
            if control_type == "ComboBox":
                ctrl = user_form.Designer.Controls.Add("Forms.ComboBox.1", page1)
            else:
                ctrl = user_form.Designer.Controls.Add("Forms.TextBox.1", page1)
            ctrl.Name = control_name
            ctrl.Left = 130
            ctrl.Top = wall_y
            ctrl.Width = 120
            
            wall_y += 30
        
        # Add panel height and quantity labels
        lbl_panel_ht = user_form.Designer.Controls.Add("Forms.Label.1", page1)
        lbl_panel_ht.Name = "lblPanelHeight"
        lbl_panel_ht.Left = 270
        lbl_panel_ht.Top = 170
        lbl_panel_ht.Width = 100
        lbl_panel_ht.Caption = "Panel Height: --"
        
        lbl_panel_qty = user_form.Designer.Controls.Add("Forms.Label.1", page1)
        lbl_panel_qty.Name = "lblPanelQty"
        lbl_panel_qty.Left = 270
        lbl_panel_qty.Top = 200
        lbl_panel_qty.Width = 100
        lbl_panel_qty.Caption = "Panel Qty: --"
        
        # Add walls listbox
        lst_walls = user_form.Designer.Controls.Add("Forms.ListBox.1", page1)
        lst_walls.Name = "lstWalls"
        lst_walls.Left = 270
        lst_walls.Top = 20
        lst_walls.Width = 260
        lst_walls.Height = 140
        
        # Add wall button
        btn_add_wall = user_form.Designer.Controls.Add("Forms.CommandButton.1", page1)
        btn_add_wall.Name = "btnAddWall"
        btn_add_wall.Caption = "Add Wall"
        btn_add_wall.Left = 130
        btn_add_wall.Top = 290
        btn_add_wall.Width = 100
        btn_add_wall.Height = 30
        
        print("    ✓ Wall controls added")
        print()
        
        # Add UserForm code
        print("  • Adding UserForm code...")
        form_code = create_userform_code()
        user_form.CodeModule.AddFromString(form_code)
        
        print("    ✓ UserForm code installed")
        print()
        
        print("✓ UserForm created successfully")
        print()
        
        # Save as macro-enabled workbook
        output_path = excel_path.replace('.xlsx', '.xlsm')
        if output_path == excel_path:
            output_path = excel_path.replace('.xlsm', '_with_vba.xlsm')
        
        print(f"Saving as macro-enabled workbook...")
        print(f"  Output: {output_path}")
        
        wb.SaveAs(os.path.abspath(output_path), FileFormat=52)  # 52 = xlOpenXMLWorkbookMacroEnabled
        wb.Close()
        excel.Quit()
        
        print()
        print("=" * 70)
        print("✓ INSTALLATION COMPLETE!")
        print("=" * 70)
        print()
        print(f"Your macro-enabled workbook is ready: {output_path}")
        print()
        print("NEXT STEPS:")
        print("1. Open the .xlsm file in Excel")
        print("2. Enable macros when prompted")
        print("3. Go to Dashboard sheet")
        print("4. Press ALT+F8 and run 'InitializeSystem' to open the UserForm")
        print()
        print("NOTE: You may need to add a button to Dashboard manually:")
        print("  • Developer tab → Insert → Button")
        print("  • Assign macro: InitializeSystem")
        print("  • Label: 'Start New Takeoff'")
        print()
        
        return True
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure Excel is installed")
        print("2. Enable 'Trust access to the VBA project object model' in Excel:")
        print("   File → Options → Trust Center → Trust Center Settings")
        print("   → Macro Settings → Check 'Trust access to VBA project object model'")
        print("3. Make sure pywin32 is installed: pip install pywin32")
        return False

if __name__ == "__main__":
    print()
    
    if len(sys.argv) < 2:
        print("Usage: python install_vba.py path/to/RF_Takeoff_Database_System_v4.xlsx")
        print()
        print("This script will automatically install all VBA code and create the UserForm")
        print("in your Excel workbook.")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    success = install_vba(excel_file)
    
    sys.exit(0 if success else 1)
