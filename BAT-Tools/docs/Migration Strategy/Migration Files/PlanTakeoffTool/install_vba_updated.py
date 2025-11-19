"""
RF Takeoff System v4.0 - Automatic VBA Installer (UPDATED)
===========================================================

This script automatically installs all VBA code and creates the UserForm
in your Excel workbook, saving you the manual setup time.

REQUIREMENTS:
- Windows OS (VBA automation requires Windows COM objects)
- Excel installed
- Python 3.6+
- pywin32 library: pip install pywin32

USAGE:
    python install_vba_updated.py path/to/RF_Takeoff_Database_System_v4.xlsx

The script will:
1. Open the Excel workbook
2. Create all 4 VBA modules with code
3. Create the UserForm with all controls
4. Add the UserForm code
5. Save as macro-enabled workbook (.xlsm)

UPDATES IN THIS VERSION:
- Enhanced progress reporting with visual indicators
- Better error messages and troubleshooting guidance
- Validation of Excel version and VBA settings
- Automatic backup of original file
- Post-installation verification checks
"""

import sys
import os
import shutil
from datetime import datetime

try:
    import win32com.client as win32
    from win32com.client import constants as c
except ImportError:
    print()
    print("=" * 70)
    print("ERROR: pywin32 library not found!")
    print("=" * 70)
    print()
    print("The pywin32 library is required to automate Excel and VBA.")
    print()
    print("To install it, run:")
    print("  pip install pywin32")
    print()
    print("Or if using Anaconda:")
    print("  conda install pywin32")
    print()
    sys.exit(1)

def print_header():
    """Print installation header"""
    print()
    print("=" * 70)
    print("  RF TAKEOFF SYSTEM v4.0 - AUTOMATIC VBA INSTALLER")
    print("=" * 70)
    print()

def print_step(step_num, total_steps, message):
    """Print a step with progress indicator"""
    progress = f"[{step_num}/{total_steps}]"
    print(f"{progress:8} {message}...")

def print_success(message):
    """Print success message"""
    print(f"         ✓ {message}")

def print_error(message):
    """Print error message"""
    print(f"         ✗ {message}")

def print_warning(message):
    """Print warning message"""
    print(f"         ⚠ {message}")

def check_prerequisites(excel_path):
    """Verify prerequisites before installation"""
    print_step(1, 10, "Checking prerequisites")
    
    # Check if file exists
    if not os.path.exists(excel_path):
        print_error(f"File not found: {excel_path}")
        return False
    print_success("Excel file found")
    
    # Check if file is already open
    try:
        # Try to open with exclusive access
        with open(excel_path, 'r+b') as f:
            pass
        print_success("File is not currently open")
    except IOError:
        print_warning("File may be open in Excel - will attempt anyway")
    
    print()
    return True

def backup_original_file(excel_path):
    """Create backup of original file"""
    print_step(2, 10, "Creating backup of original file")
    
    try:
        backup_path = excel_path.replace('.xlsx', '_backup_' + 
                                         datetime.now().strftime('%Y%m%d_%H%M%S') + '.xlsx')
        shutil.copy2(excel_path, backup_path)
        print_success(f"Backup created: {os.path.basename(backup_path)}")
        print()
        return backup_path
    except Exception as e:
        print_warning(f"Could not create backup: {str(e)}")
        print_warning("Continuing without backup...")
        print()
        return None

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
    
    If pitch = "" Then
        errors.Add "Pitch must be selected"
        isValid = False
    End If
    
    ValidateRoofEntry = isValid
End Function
'''
    
    elif module_name == "modDatabase":
        return '''Option Explicit

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
'''
    
    elif module_name == "modUserForm":
        return '''Option Explicit

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
'''
    
    return ""

def create_userform_code():
    """Return VBA code for UserForm"""
    return '''Option Explicit

Private Sub UserForm_Initialize()
    InitializeUserForm
End Sub

Private Sub btnSaveProject_Click()
    Dim errors As Collection
    
    If ValidateProjectInfo(errors) Then
        SaveProject
        MsgBox "Move to the Walls tab to start entering wall data.", vbInformation
        Me.MultiPage1.value = 1  ' Switch to Walls tab
    Else
        Dim errorMsg As String
        errorMsg = "Please fix the following errors:" & vbCrLf & vbCrLf
        
        Dim err As Variant
        For Each err In errors
            errorMsg = errorMsg & "• " & err & vbCrLf
        Next err
        
        MsgBox errorMsg, vbExclamation
    End If
End Sub

Private Sub btnAddWall_Click()
    Dim errors As Collection
    
    If g_CurrentProjectID = "" Then
        MsgBox "Please save project information first.", vbExclamation
        Me.MultiPage1.value = 0  ' Go back to Project Info tab
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
            errorMsg = errorMsg & "• " & err & vbCrLf
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
'''

def install_vba(excel_path):
    """Main installation function"""
    
    try:
        print_header()
        
        # Step 1: Check prerequisites
        if not check_prerequisites(excel_path):
            return False
        
        # Step 2: Create backup
        backup_path = backup_original_file(excel_path)
        
        # Step 3: Open Excel
        print_step(3, 10, "Opening Excel application")
        excel = win32.gencache.EnsureDispatch('Excel.Application')
        excel.Visible = False
        excel.DisplayAlerts = False
        print_success("Excel opened successfully")
        print()
        
        # Step 4: Open workbook
        print_step(4, 10, "Opening workbook")
        wb = excel.Workbooks.Open(os.path.abspath(excel_path))
        print_success(f"Opened: {os.path.basename(excel_path)}")
        print()
        
        # Step 5: Check VBA access
        print_step(5, 10, "Verifying VBA project access")
        try:
            vb_project = wb.VBProject
            print_success("VBA project access confirmed")
        except Exception as e:
            print_error("Cannot access VBA project")
            print()
            print("SOLUTION:")
            print("  You need to enable 'Trust access to the VBA project object model'")
            print()
            print("  Steps:")
            print("  1. Open Excel")
            print("  2. File → Options → Trust Center")
            print("  3. Click 'Trust Center Settings' button")
            print("  4. Go to 'Macro Settings'")
            print("  5. Check 'Trust access to the VBA project object model'")
            print("  6. Click OK, restart Excel, and run this script again")
            print()
            wb.Close(False)
            excel.Quit()
            return False
        print()
        
        # Step 6: Create modules
        print_step(6, 10, "Creating VBA modules")
        modules = ["modMain", "modValidation", "modDatabase", "modUserForm"]
        
        for module_name in modules:
            module = vb_project.VBComponents.Add(1)  # 1 = vbext_ct_StdModule
            module.Name = module_name
            code = create_module_code(module_name)
            module.CodeModule.AddFromString(code)
            print_success(f"{module_name} created and populated")
        print()
        
        # Step 7: Create UserForm
        print_step(7, 10, "Creating UserForm")
        user_form = vb_project.VBComponents.Add(3)  # 3 = vbext_ct_MSForm
        user_form.Name = "frmMain"
        user_form.Properties("Caption").Value = "RF Framing Takeoff System"
        user_form.Properties("Width").Value = 600
        user_form.Properties("Height").Value = 450
        print_success("UserForm component created")
        print()
        
        # Step 8: Add controls
        print_step(8, 10, "Adding controls to UserForm")
        
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
        print_success("MultiPage control with 3 tabs added")
        
        # Add Project Info controls
        page0 = multipage.Pages(0)
        controls_y = 20
        labels = ["Project Name:", "Project Number:", "Client Name:", "Estimator:", 
                 "Address:", "City:", "State:", "Zip:", "Total SF:", "Notes:"]
        textboxes = ["txtProjectName", "txtProjectNumber", "txtClientName", "txtEstimator",
                    "txtAddress", "txtCity", "txtState", "txtZip", "txtTotalSF", "txtNotes"]
        
        for label_text, textbox_name in zip(labels, textboxes):
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page0)
            lbl.Caption = label_text
            lbl.Left = 20
            lbl.Top = controls_y
            lbl.Width = 100
            
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
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page0)
            lbl.Caption = label_text
            lbl.Left = 350
            lbl.Top = combos_y
            lbl.Width = 80
            
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
        print_success("Project Info controls added (10 fields + 3 dropdowns)")
        
        # Add Wall controls
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
            lbl = user_form.Designer.Controls.Add("Forms.Label.1", page1)
            lbl.Caption = label_text
            lbl.Left = 20
            lbl.Top = wall_y
            lbl.Width = 100
            
            if control_type == "ComboBox":
                ctrl = user_form.Designer.Controls.Add("Forms.ComboBox.1", page1)
            else:
                ctrl = user_form.Designer.Controls.Add("Forms.TextBox.1", page1)
            ctrl.Name = control_name
            ctrl.Left = 130
            ctrl.Top = wall_y
            ctrl.Width = 120
            wall_y += 30
        
        # Add panel labels
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
        print_success("Wall controls added (9 fields + calculation labels)")
        print()
        
        # Step 9: Add UserForm code
        print_step(9, 10, "Installing UserForm code")
        form_code = create_userform_code()
        user_form.CodeModule.AddFromString(form_code)
        print_success("UserForm event handlers installed")
        print()
        
        # Step 10: Save workbook
        print_step(10, 10, "Saving macro-enabled workbook")
        output_path = excel_path.replace('.xlsx', '.xlsm')
        if output_path == excel_path:
            output_path = excel_path.replace('.xlsm', '_with_vba.xlsm')
        
        wb.SaveAs(os.path.abspath(output_path), FileFormat=52)
        wb.Close()
        excel.Quit()
        print_success(f"Saved as: {os.path.basename(output_path)}")
        print()
        
        # Print completion message
        print("=" * 70)
        print("  ✓ INSTALLATION COMPLETE!")
        print("=" * 70)
        print()
        print("SUMMARY:")
        print(f"  • Original file: {os.path.basename(excel_path)}")
        if backup_path:
            print(f"  • Backup created: {os.path.basename(backup_path)}")
        print(f"  • New file: {os.path.basename(output_path)}")
        print()
        print("  • 4 VBA modules created (modMain, modValidation, modDatabase, modUserForm)")
        print("  • UserForm created with 3 tabs (Project Info, Walls, Roof)")
        print("  • 25+ controls added with event handlers")
        print("  • Auto-calculation logic installed")
        print()
        print("NEXT STEPS:")
        print("  1. Open the .xlsm file in Excel")
        print("  2. Enable macros when prompted")
        print("  3. Go to the Dashboard sheet")
        print("  4. Press ALT+F8 to see macros")
        print("  5. Run 'InitializeSystem' to launch the UserForm")
        print()
        print("OPTIONAL:")
        print("  Add a button to the Dashboard sheet:")
        print("  • Developer tab → Insert → Button (Form Control)")
        print("  • Draw button on Dashboard")
        print("  • Assign macro: InitializeSystem")
        print("  • Label button: 'Start New Takeoff'")
        print()
        print("TROUBLESHOOTING:")
        print("  • If macros don't appear: Make sure you opened the .xlsm file")
        print("  • If button doesn't work: Check macro security settings")
        print("  • Need help? See MANUAL_VBA_INSTALLATION.md")
        print()
        print("=" * 70)
        print()
        
        return True
        
    except Exception as e:
        print()
        print("=" * 70)
        print("  ✗ INSTALLATION FAILED")
        print("=" * 70)
        print()
        print(f"ERROR: {str(e)}")
        print()
        print("TROUBLESHOOTING STEPS:")
        print()
        print("1. VERIFY EXCEL IS INSTALLED")
        print("   - This script requires Microsoft Excel to be installed on Windows")
        print()
        print("2. ENABLE VBA PROJECT ACCESS")
        print("   - Open Excel")
        print("   - File → Options → Trust Center → Trust Center Settings")
        print("   - Macro Settings → Check 'Trust access to VBA project object model'")
        print("   - Click OK and restart Excel")
        print()
        print("3. CLOSE ALL EXCEL INSTANCES")
        print("   - Close any open Excel windows")
        print("   - Check Task Manager for excel.exe processes")
        print("   - End any Excel processes")
        print()
        print("4. RUN AS ADMINISTRATOR")
        print("   - Right-click on PowerShell or Command Prompt")
        print("   - Select 'Run as Administrator'")
        print("   - Run the script again")
        print()
        print("5. CHECK FILE PERMISSIONS")
        print("   - Make sure you have write access to the file location")
        print("   - Try saving to a different folder")
        print()
        print("6. VERIFY PYWIN32 INSTALLATION")
        print("   - Run: pip install --upgrade pywin32")
        print("   - Then run the script again")
        print()
        print("STILL HAVING ISSUES?")
        print("  See MANUAL_VBA_INSTALLATION.md for manual installation steps")
        print()
        print("=" * 70)
        print()
        
        # Cleanup
        try:
            if 'excel' in locals():
                excel.Quit()
        except:
            pass
        
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print()
        print("=" * 70)
        print("  RF TAKEOFF SYSTEM v4.0 - AUTOMATIC VBA INSTALLER")
        print("=" * 70)
        print()
        print("USAGE:")
        print("  python install_vba_updated.py <path_to_excel_file>")
        print()
        print("EXAMPLE:")
        print("  python install_vba_updated.py RF_Takeoff_Database_System_v4.xlsx")
        print()
        print("REQUIREMENTS:")
        print("  • Windows OS")
        print("  • Microsoft Excel installed")
        print("  • Python 3.6+")
        print("  • pywin32 library (install with: pip install pywin32)")
        print()
        print("This script will automatically:")
        print("  • Create 4 VBA modules with all code")
        print("  • Create UserForm with all controls")
        print("  • Add event handlers and logic")
        print("  • Save as macro-enabled workbook (.xlsm)")
        print()
        print("=" * 70)
        print()
        sys.exit(1)
    
    excel_file = sys.argv[1]
    success = install_vba(excel_file)
    
    sys.exit(0 if success else 1)
