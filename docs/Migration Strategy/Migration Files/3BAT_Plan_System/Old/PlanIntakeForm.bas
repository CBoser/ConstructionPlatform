VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmPlanIntake 
   Caption         =   "Holt Homes - Plan Intake & Overview"
   ClientHeight    =   9840
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   11175
   OleObjectBlob   =   "frmPlanIntake.frx":0000
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "frmPlanIntake"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

'====================================================================
' HOLT HOMES - PLAN INTAKE FORM
' Purpose: Centralized plan intake with pack sequencing
' Created: October 2025
'====================================================================

Private Sub UserForm_Initialize()
    ' Set form defaults
    Me.txtBuilder.Value = "Holt Homes"
    Me.cboStories.AddItem "Single"
    Me.cboStories.AddItem "Two"
    Me.cboStories.AddItem "Three"
    Me.cboStories.Value = "Two"
    
    ' Populate Roof Load options
    Me.cboRoofLoad.AddItem "25"
    Me.cboRoofLoad.AddItem "30"
    Me.cboRoofLoad.AddItem "40"
    Me.cboRoofLoad.AddItem "60"
    
    ' Populate Siding options
    Me.cboSiding.AddItem "Lap"
    Me.cboSiding.AddItem "Board & Batten"
    Me.cboSiding.AddItem "Panel"
    Me.cboSiding.AddItem "Mixed"
    
    ' Default elevations
    Me.txtElevations.Value = "A (Northwest), B (Prairie), C (Modern), D (Farmhouse)"
    
    ' Initialize pack checkboxes (you'll need to add these to the form)
    InitializePackDefaults
End Sub

Private Sub InitializePackDefaults()
    ' Set default packs based on plan type
    ' Single Family defaults
    chkPB.Value = True
    chk1stWalls.Value = True
    chk2ndWalls.Value = True
    chkRoof.Value = True
    chkHouseWrap.Value = True
    chkSiding.Value = True
End Sub

Private Sub cboStories_Change()
    ' Adjust defaults based on stories
    If Me.cboStories.Value = "Single" Then
        chk2ndWalls.Value = False
        chk2ndWallsRF.Value = False
        chk2ndSiding.Value = False
    Else
        chk2ndWalls.Value = True
    End If
End Sub

Private Sub cmdSubmit_Click()
    ' Validate required fields
    If Trim(Me.txtPlanCode.Value) = "" Then
        MsgBox "Plan Code is required!", vbExclamation, "Missing Information"
        Me.txtPlanCode.SetFocus
        Exit Sub
    End If
    
    If Trim(Me.txtPlanName.Value) = "" Then
        MsgBox "Plan Name is required!", vbExclamation, "Missing Information"
        Me.txtPlanName.SetFocus
        Exit Sub
    End If
    
    ' Create the plan structure
    CreatePlanStructure
    
    ' Write to worksheet
    WritePlanToWorksheet
    
    ' Generate pack sequence
    GeneratePackSequence
    
    MsgBox "Plan intake complete! BAT has been created.", vbInformation, "Success"
    Unload Me
End Sub

Private Sub cmdCancel_Click()
    Unload Me
End Sub

Private Sub CreatePlanStructure()
    Dim fso As Object
    Dim rootPath As String
    Dim planPath As String
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    ' Define paths
    rootPath = "X:\BAT\" & Me.txtBuilder.Value & "\"
    planPath = rootPath & Me.txtPlanCode.Value & "\"
    
    ' Create folder structure
    On Error Resume Next
    If Not fso.FolderExists(rootPath) Then fso.CreateFolder rootPath
    If Not fso.FolderExists(planPath) Then fso.CreateFolder planPath
    If Not fso.FolderExists(planPath & "Takeoff\") Then fso.CreateFolder planPath & "Takeoff\"
    If Not fso.FolderExists(planPath & "RF\") Then fso.CreateFolder planPath & "RF\"
    If Not fso.FolderExists(planPath & "Docs\") Then fso.CreateFolder planPath & "Docs\"
    On Error GoTo 0
    
    Set fso = Nothing
End Sub

Private Sub WritePlanToWorksheet()
    Dim ws As Worksheet
    Dim templatePath As String
    Dim targetPath As String
    Dim newWb As Workbook
    
    ' Copy template
    templatePath = "X:\BAT\_Templates\Holt_BAT_Template.xlsm"
    targetPath = "X:\BAT\" & Me.txtBuilder.Value & "\" & Me.txtPlanCode.Value & "\" & _
                 Me.txtPlanCode.Value & "_" & Format(Now, "yyyy-mm-dd") & "_BAT.xlsm"
    
    On Error Resume Next
    FileCopy templatePath, targetPath
    On Error GoTo 0
    
    ' Open and populate
    Set newWb = Workbooks.Open(targetPath)
    Set ws = newWb.Sheets("Plan Overview")
    
    With ws
        .Range("builder_name").Value = Me.txtBuilder.Value
        .Range("plan_code").Value = Me.txtPlanCode.Value
        .Range("plan_name").Value = Me.txtPlanName.Value
        .Range("model_display").Value = Me.txtPlanCode.Value & " - " & Me.txtPlanName.Value
        .Range("elevations").Value = Me.txtElevations.Value
        .Range("garage").Value = Me.txtGarage.Value
        .Range("living_area_total").Value = Me.txtLivingTotal.Value
        .Range("living_area_main").Value = Me.txtLivingMain.Value
        .Range("living_area_upper").Value = Me.txtLivingUpper.Value
        .Range("garage_area").Value = Me.txtGarageArea.Value
        .Range("stories").Value = Me.cboStories.Value
        .Range("subfloor_L1").Value = Me.txtSubfloorL1.Value
        .Range("subfloor_L2").Value = Me.txtSubfloorL2.Value
        .Range("wall_h_L1").Value = Me.txtWallHL1.Value
        .Range("wall_h_L2").Value = Me.txtWallHL2.Value
        .Range("roof_load").Value = Me.cboRoofLoad.Value
        .Range("siding").Value = Me.cboSiding.Value
        .Range("rf_required").Value = IIf(Me.chkRFRequired.Value, "Yes", "No")
        .Range("notes").Value = Me.txtNotes.Value
        .Range("created_on").Value = Now
    End With
    
    newWb.Save
    newWb.Close False
    Set newWb = Nothing
    Set ws = Nothing
End Sub

Private Sub GeneratePackSequence()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim dayNum As Long
    Dim isSingle As Boolean
    
    ' Open the newly created BAT
    Dim batPath As String
    batPath = "X:\BAT\" & Me.txtBuilder.Value & "\" & Me.txtPlanCode.Value & "\" & _
              Me.txtPlanCode.Value & "_" & Format(Now, "yyyy-mm-dd") & "_BAT.xlsm"
    
    Dim wb As Workbook
    Set wb = Workbooks.Open(batPath)
    
    ' Check if Pack Schedule sheet exists, create if not
    On Error Resume Next
    Set ws = wb.Sheets("Pack Schedule")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        ws.Name = "Pack Schedule"
        
        ' Create headers
        ws.Range("A1").Value = "Pack Code"
        ws.Range("B1").Value = "Category"
        ws.Range("C1").Value = "Description"
        ws.Range("D1").Value = "Day# (Intended)"
        ws.Range("E1").Value = "Dependencies"
        ws.Range("F1").Value = "Lead Time"
        ws.Range("G1").Value = "Duration"
        ws.Range("H1").Value = "Status"
        
        ' Format headers
        With ws.Range("A1:H1")
            .Font.Bold = True
            .Interior.Color = RGB(68, 114, 196)
            .Font.Color = RGB(255, 255, 255)
        End With
    End If
    
    ' Determine if single or multifamily
    isSingle = (Me.cboStories.Value = "Single")
    
    ' Clear existing data
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    If lastRow > 1 Then ws.Range("A2:H" & lastRow).ClearContents
    
    ' Write pack schedule based on template
    lastRow = 2
    
    ' Add packs based on selection and type
    If chkPB.Value Then
        Call AddPackRow(ws, lastRow, "P&B", "Framing", "Post & Beam", IIf(isSingle, 1, 1), "", 3, 2)
    End If
    
    If chkSusGarFlr.Value Then
        Call AddPackRow(ws, lastRow, "Sus Gar Flr", "Framing", "Suspended Garage Floor", 2, "P&B", 2, 1)
    End If
    
    If chk1stWalls.Value Then
        Call AddPackRow(ws, lastRow, "1st Walls", "Framing", "1st Walls", IIf(isSingle, 4, 2), "P&B", 5, 3)
    End If
    
    If chk1stWallsRF.Value Then
        Call AddPackRow(ws, lastRow, "1st Walls RF", "Framing", "1st Walls ReadyFrame", 0, "1st Walls", 0, 0)
    End If
    
    If chk2ndWalls.Value And Not isSingle Then
        Call AddPackRow(ws, lastRow, "2nd Walls", "Framing", "2nd Walls", IIf(isSingle, 8, 8), "1st Walls", 7, 2)
    End If
    
    If chk2ndWallsRF.Value And Not isSingle Then
        Call AddPackRow(ws, lastRow, "2nd Walls RF", "Framing", "2nd Walls ReadyFrame", 10, "2nd Walls", 0, 0)
    End If
    
    If chkRoof.Value Then
        Call AddPackRow(ws, lastRow, "Roof", "Framing", "Roof", IIf(isSingle, 14, 15), "1st Walls,2nd Walls", 4, 2)
    End If
    
    If chkDeckFraming.Value Then
        Call AddPackRow(ws, lastRow, "Deck Framing", "Optional", "Deck Framing", IIf(isSingle, 5, 22), "1st Walls", 5, 2)
    End If
    
    If chkHouseWrap.Value Then
        Call AddPackRow(ws, lastRow, "House Wrap", "Envelope", "House Wrap", IIf(isSingle, 21, 23), "Roof", 8, 1)
    End If
    
    If chkDensglass.Value Then
        Call AddPackRow(ws, lastRow, "Densglass", "Envelope", "Densglass", 23, "Roof", 8, 1)
    End If
    
    If chkSiding.Value Then
        Call AddPackRow(ws, lastRow, "Siding", "Envelope", "Siding", IIf(isSingle, 27, 30), "House Wrap", 14, 5)
    End If
    
    If chkPostWraps.Value Then
        Call AddPackRow(ws, lastRow, "Post Wraps", "Envelope", "Post Wrap", 30, "Roof", 0, 1)
    End If
    
    If chk2ndSiding.Value Then
        Call AddPackRow(ws, lastRow, "2nd Siding", "Envelope", "2nd Siding Pack", 30, "House Wrap", 14, 2)
    End If
    
    If chkShearwall.Value Then
        Call AddPackRow(ws, lastRow, "Shearwall", "Envelope", "Shearwall", 30, "Roof", 0, 1)
    End If
    
    If chkPonyWalls.Value Then
        Call AddPackRow(ws, lastRow, "Pony Walls P&B", "Optional", "Pony Walls P&B", 1, "P&B", 3, 1)
    End If
    
    If chkDeckSurface.Value Then
        Call AddPackRow(ws, lastRow, "Deck Surface/Rail", "Optional", "Deck Surface & Rail", IIf(isSingle, 30, 34), "Deck Framing", 10, 2)
    End If
    
    ' Auto-fit columns
    ws.Columns("A:H").AutoFit
    
    ' Save and close
    wb.Save
    wb.Close False
    Set wb = Nothing
    Set ws = Nothing
End Sub

Private Sub AddPackRow(ws As Worksheet, ByRef rowNum As Long, _
                       packCode As String, category As String, _
                       description As String, dayNum As Long, _
                       deps As String, lead As Long, duration As Long)
    ws.Cells(rowNum, 1).Value = packCode
    ws.Cells(rowNum, 2).Value = category
    ws.Cells(rowNum, 3).Value = description
    ws.Cells(rowNum, 4).Value = dayNum
    ws.Cells(rowNum, 5).Value = deps
    ws.Cells(rowNum, 6).Value = lead
    ws.Cells(rowNum, 7).Value = duration
    ws.Cells(rowNum, 8).Value = "Pending"
    rowNum = rowNum + 1
End Sub
