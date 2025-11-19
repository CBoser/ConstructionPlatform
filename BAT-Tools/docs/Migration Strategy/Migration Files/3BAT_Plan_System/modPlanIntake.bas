Attribute VB_Name = "modPlanIntake"
'====================================================================
' HOLT HOMES - PLAN INTAKE MODULE
' Purpose: Helper functions for plan intake and BAT automation
' Created: October 2025
'====================================================================

Option Explicit

' ===== MAIN ENTRY POINT =====
Public Sub ShowPlanIntakeForm()
    ' Launch the Plan Intake form
    frmPlanIntake.Show
End Sub

' ===== FOLDER STRUCTURE CREATION =====
Public Sub CreatePlanFolderStructure(builderName As String, planCode As String)
    Dim fso As Object
    Dim rootPath As String
    Dim planPath As String
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    ' Define paths
    rootPath = "X:\BAT\" & builderName & "\"
    planPath = rootPath & planCode & "\"
    
    ' Create folder structure
    On Error Resume Next
    If Not fso.FolderExists(rootPath) Then fso.CreateFolder rootPath
    If Not fso.FolderExists(planPath) Then fso.CreateFolder planPath
    If Not fso.FolderExists(planPath & "BAT\") Then fso.CreateFolder planPath & "BAT\"
    If Not fso.FolderExists(planPath & "Takeoff\") Then fso.CreateFolder planPath & "Takeoff\"
    If Not fso.FolderExists(planPath & "RF\") Then fso.CreateFolder planPath & "RF\"
    If Not fso.FolderExists(planPath & "Docs\") Then fso.CreateFolder planPath & "Docs\"
    On Error GoTo 0
    
    Set fso = Nothing
    
    Debug.Print "Folder structure created for: " & planCode
End Sub

' ===== BAT TEMPLATE COPY =====
Public Function CopyBATTemplate(builderName As String, planCode As String, _
                                planName As String) As String
    Dim templatePath As String
    Dim targetPath As String
    Dim fso As Object
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    ' Define paths
    templatePath = "C:\Users\corey.boser\Documents\3BAT_Plan_System\HOLT BAT OCTOBER 2025 9-29-25 Updated.xlsm"
    targetPath = "C:\Users\corey.boser\Documents\3BAT_Plan_System\" & _
                 planCode & "_" & Format(Now, "yyyy-mm-dd") & "_BAT.xlsm"
    
    ' Check if template exists
    If Not fso.FileExists(templatePath) Then
        MsgBox "Template not found at: " & templatePath, vbCritical, "Error"
        CopyBATTemplate = ""
        Exit Function
    End If
    
    ' Copy template
    On Error Resume Next
    fso.CopyFile templatePath, targetPath, True
    On Error GoTo 0
    
    If fso.FileExists(targetPath) Then
        CopyBATTemplate = targetPath
        Debug.Print "BAT created: " & targetPath
    Else
        MsgBox "Failed to create BAT at: " & targetPath, vbCritical, "Error"
        CopyBATTemplate = ""
    End If
    
    Set fso = Nothing
End Function

' ===== POPULATE BAT WITH PLAN DATA =====
Public Sub PopulatePlanOverview(wb As Workbook, planData As Object)
    Dim ws As Worksheet
    
    On Error Resume Next
    Set ws = wb.Sheets("Plan Overview")
    On Error GoTo 0
    
    If ws Is Nothing Then
        MsgBox "Plan Overview sheet not found!", vbExclamation, "Error"
        Exit Sub
    End If
    
    With ws
        ' Basic Info
        .Range("builder_name").Value = planData("builder")
        .Range("plan_code").Value = planData("planCode")
        .Range("plan_name").Value = planData("planName")
        .Range("model_display").Value = planData("modelDisplay")
        .Range("created_on").Value = Now
        
        ' Elevations & Areas
        .Range("elevations").Value = planData("elevations")
        .Range("garage").Value = planData("garage")
        .Range("living_area_total").Value = planData("livingTotal")
        .Range("living_area_main").Value = planData("livingMain")
        .Range("living_area_upper").Value = planData("livingUpper")
        .Range("garage_area").Value = planData("garageArea")
        
        ' Specifications
        .Range("stories").Value = planData("stories")
        .Range("subfloor_L1").Value = planData("subfloorL1")
        .Range("subfloor_L2").Value = planData("subfloorL2")
        .Range("wall_h_L1").Value = planData("wallHL1")
        .Range("wall_h_L2").Value = planData("wallHL2")
        .Range("roof_load").Value = planData("roofLoad")
        .Range("siding").Value = planData("siding")
        .Range("rf_required").Value = planData("rfRequired")
        .Range("notes").Value = planData("notes")
    End With
    
    Debug.Print "Plan Overview populated for: " & planData("planCode")
End Sub

' ===== GENERATE PACK SCHEDULE =====
Public Sub GeneratePackSchedule(wb As Workbook, isSingleFamily As Boolean, _
                                selectedPacks As Collection)
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim pack As Variant
    
    ' Check if Pack Schedule sheet exists, create if not
    On Error Resume Next
    Set ws = wb.Sheets("Pack Schedule")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        ws.Name = "Pack Schedule"
        
        ' Create headers
        With ws
            .Range("A1").Value = "Pack Code"
            .Range("B1").Value = "Category"
            .Range("C1").Value = "Description"
            .Range("D1").Value = "Day# (Intended)"
            .Range("E1").Value = "Dependencies"
            .Range("F1").Value = "Lead Time"
            .Range("G1").Value = "Duration"
            .Range("H1").Value = "Status"
            .Range("I1").Value = "Start Date"
            .Range("J1").Value = "Ship Date"
            
            ' Format headers
            .Range("A1:J1").Font.Bold = True
            .Range("A1:J1").Interior.Color = RGB(68, 114, 196)
            .Range("A1:J1").Font.Color = RGB(255, 255, 255)
        End With
    End If
    
    ' Clear existing data
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    If lastRow > 1 Then ws.Range("A2:J" & lastRow).ClearContents
    
    ' Write pack schedule
    lastRow = 2
    For Each pack In selectedPacks
        ws.Cells(lastRow, 1).Value = pack("code")
        ws.Cells(lastRow, 2).Value = pack("category")
        ws.Cells(lastRow, 3).Value = pack("description")
        ws.Cells(lastRow, 4).Value = pack("day")
        ws.Cells(lastRow, 5).Value = pack("deps")
        ws.Cells(lastRow, 6).Value = pack("lead")
        ws.Cells(lastRow, 7).Value = pack("duration")
        ws.Cells(lastRow, 8).Value = "Pending"
        lastRow = lastRow + 1
    Next pack
    
    ' Auto-fit columns
    ws.Columns("A:J").AutoFit
    
    ' Add conditional formatting for status
    Call FormatPackSchedule(ws, lastRow - 1)
    
    Debug.Print "Pack Schedule generated with " & selectedPacks.Count & " packs"
End Sub

' ===== FORMAT PACK SCHEDULE =====
Private Sub FormatPackSchedule(ws As Worksheet, lastRow As Long)
    Dim rng As Range
    
    If lastRow < 2 Then Exit Sub
    
    Set rng = ws.Range("H2:H" & lastRow)
    
    ' Add data validation for status
    With rng.Validation
        .Delete
        .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, _
             Formula1:="Pending,Ordered,Shipped,Delivered,Installed"
    End With
    
    ' Apply conditional formatting
    With rng
        .FormatConditions.Delete
        
        ' Pending = Yellow
        With .FormatConditions.Add(Type:=xlTextString, String:="Pending", TextOperator:=xlContains)
            .Interior.Color = RGB(255, 235, 156)
        End With
        
        ' Ordered = Light Blue
        With .FormatConditions.Add(Type:=xlTextString, String:="Ordered", TextOperator:=xlContains)
            .Interior.Color = RGB(180, 220, 255)
        End With
        
        ' Shipped = Orange
        With .FormatConditions.Add(Type:=xlTextString, String:="Shipped", TextOperator:=xlContains)
            .Interior.Color = RGB(255, 192, 128)
        End With
        
        ' Delivered = Light Green
        With .FormatConditions.Add(Type:=xlTextString, String:="Delivered", TextOperator:=xlContains)
            .Interior.Color = RGB(198, 239, 206)
        End With
        
        ' Installed = Green
        With .FormatConditions.Add(Type:=xlTextString, String:="Installed", TextOperator:=xlContains)
            .Interior.Color = RGB(146, 208, 80)
            .Font.Color = RGB(255, 255, 255)
        End With
    End With
End Sub

' ===== STRING NORMALIZATION =====
Public Function CleanString(inputStr As String) As String
    Dim result As String
    
    ' Trim, uppercase, remove extra spaces
    result = Trim(inputStr)
    result = UCase(result)
    result = Replace(result, Chr(160), " ") ' Non-breaking space
    result = Replace(result, vbTab, " ")
    
    ' Remove multiple spaces
    Do While InStr(result, "  ") > 0
        result = Replace(result, "  ", " ")
    Loop
    
    CleanString = result
End Function

' ===== PACK DEFINITIONS =====
Public Function GetPackDefinitions() As Collection
    Dim packs As New Collection
    Dim pack As Object
    
    ' P&B
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "P&B"
    pack("category") = "Framing"
    pack("description") = "Post & Beam"
    pack("deps") = ""
    pack("lead") = 3
    pack("duration") = 2
    packs.Add pack
    
    ' Sus Gar Flr
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Sus Gar Flr"
    pack("category") = "Framing"
    pack("description") = "Suspended Garage Floor"
    pack("deps") = "P&B"
    pack("lead") = 2
    pack("duration") = 1
    packs.Add pack
    
    ' 1st Walls
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "1st Walls"
    pack("category") = "Framing"
    pack("description") = "1st Walls"
    pack("deps") = "P&B"
    pack("lead") = 5
    pack("duration") = 3
    packs.Add pack
    
    ' 1st Walls RF
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "1st Walls RF"
    pack("category") = "Framing"
    pack("description") = "1st Walls ReadyFrame"
    pack("deps") = "1st Walls"
    pack("lead") = 0
    pack("duration") = 0
    packs.Add pack
    
    ' 2nd Walls
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "2nd Walls"
    pack("category") = "Framing"
    pack("description") = "2nd Walls"
    pack("deps") = "1st Walls"
    pack("lead") = 7
    pack("duration") = 2
    packs.Add pack
    
    ' 2nd Walls RF
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "2nd Walls RF"
    pack("category") = "Framing"
    pack("description") = "2nd Walls ReadyFrame"
    pack("deps") = "2nd Walls"
    pack("lead") = 0
    pack("duration") = 0
    packs.Add pack
    
    ' Roof
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Roof"
    pack("category") = "Framing"
    pack("description") = "Roof"
    pack("deps") = "1st Walls,2nd Walls"
    pack("lead") = 4
    pack("duration") = 2
    packs.Add pack
    
    ' House Wrap
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "House Wrap"
    pack("category") = "Envelope"
    pack("description") = "House Wrap"
    pack("deps") = "Roof"
    pack("lead") = 8
    pack("duration") = 1
    packs.Add pack
    
    ' Siding
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Siding"
    pack("category") = "Envelope"
    pack("description") = "Siding"
    pack("deps") = "House Wrap"
    pack("lead") = 14
    pack("duration") = 5
    packs.Add pack
    
    ' Post Wraps
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Post Wraps"
    pack("category") = "Envelope"
    pack("description") = "Post Wrap"
    pack("deps") = "Roof"
    pack("lead") = 0
    pack("duration") = 1
    packs.Add pack
    
    ' 2nd Siding
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "2nd Siding"
    pack("category") = "Envelope"
    pack("description") = "2nd Siding Pack"
    pack("deps") = "House Wrap"
    pack("lead") = 14
    pack("duration") = 2
    packs.Add pack
    
    ' Deck Framing
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Deck Framing"
    pack("category") = "Optional"
    pack("description") = "Deck Framing"
    pack("deps") = "1st Walls"
    pack("lead") = 5
    pack("duration") = 2
    packs.Add pack
    
    ' Pony Walls P&B
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Pony Walls P&B"
    pack("category") = "Optional"
    pack("description") = "Pony Walls P&B"
    pack("deps") = "P&B"
    pack("lead") = 3
    pack("duration") = 1
    packs.Add pack
    
    ' Deck Surface/Rail
    Set pack = CreateObject("Scripting.Dictionary")
    pack("code") = "Deck Surface/Rail"
    pack("category") = "Optional"
    pack("description") = "Deck Surface & Rail"
    pack("deps") = "Deck Framing"
    pack("lead") = 10
    pack("duration") = 2
    packs.Add pack
    
    Set GetPackDefinitions = packs
End Function

' ===== SINGLE FAMILY DEFAULT SEQUENCE =====
Public Function GetSingleFamilySequence() As Collection
    Dim sequence As New Collection
    
    sequence.Add Array("P&B", 1)
    sequence.Add Array("1st Walls", 4)
    sequence.Add Array("Deck Framing", 5)
    sequence.Add Array("2nd Walls", 8)
    sequence.Add Array("Roof", 14)
    sequence.Add Array("House Wrap", 21)
    sequence.Add Array("Siding", 27)
    sequence.Add Array("Deck Surface/Rail", 30)
    
    Set GetSingleFamilySequence = sequence
End Function

' ===== MULTIFAMILY DEFAULT SEQUENCE =====
Public Function GetMultiFamilySequence() As Collection
    Dim sequence As New Collection
    
    sequence.Add Array("P&B", 1)
    sequence.Add Array("1st Walls", 2)
    sequence.Add Array("Main Shaft Liner", 3)
    sequence.Add Array("2nd Walls", 8)
    sequence.Add Array("2nd Level Shaft Liner", 10)
    sequence.Add Array("Roof", 15)
    sequence.Add Array("Deck Framing", 22)
    sequence.Add Array("House Wrap", 23)
    sequence.Add Array("Densglass", 23)
    sequence.Add Array("Siding", 30)
    sequence.Add Array("Shearwall", 30)
    sequence.Add Array("Deck Surface/Rail", 34)
    
    Set GetMultiFamilySequence = sequence
End Function

' ===== EXPORT TO CSV =====
Public Sub ExportPlanToCSV(planData As Object, filePath As String)
    Dim fso As Object
    Dim ts As Object
    Dim csv As String
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set ts = fso.CreateTextFile(filePath, True)
    
    ' Header
    csv = "Builder,PlanCode,PlanName,ModelDisplay,Elevations,Garage," & _
          "LivingAreaTotal,LivingAreaMain,LivingAreaUpper,GarageArea," & _
          "Stories,Subfloor_L1,Subfloor_L2,WallH_L1,WallH_L2," & _
          "RoofLoad,Siding,RFRequired,Notes,CreatedOn" & vbCrLf
    
    ' Data row
    csv = csv & planData("builder") & "," & _
          planData("planCode") & "," & _
          planData("planName") & "," & _
          planData("modelDisplay") & "," & _
          """" & planData("elevations") & """," & _
          """" & planData("garage") & """," & _
          planData("livingTotal") & "," & _
          planData("livingMain") & "," & _
          planData("livingUpper") & "," & _
          planData("garageArea") & "," & _
          planData("stories") & "," & _
          planData("subfloorL1") & "," & _
          planData("subfloorL2") & "," & _
          planData("wallHL1") & "," & _
          planData("wallHL2") & "," & _
          planData("roofLoad") & "," & _
          planData("siding") & "," & _
          planData("rfRequired") & "," & _
          """" & planData("notes") & """," & _
          Now & vbCrLf
    
    ts.Write csv
    ts.Close
    
    Set ts = Nothing
    Set fso = Nothing
    
    Debug.Print "Plan exported to CSV: " & filePath
End Sub
