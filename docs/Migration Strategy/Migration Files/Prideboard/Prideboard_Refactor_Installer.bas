
Attribute VB_Name = "Prideboard_Refactor_Installer"
Option Explicit

' REQUIREMENT: Trust Center -> Macro Settings -> check "Trust access to the VBA project object model"

Public Sub InstallPrideboardRefactor()
    Dim vbproj As Object
    Set vbproj = ThisWorkbook.VBProject

    PutModule vbproj, "modConfig", Get_modConfig()
    PutModule vbproj, "modApp", Get_modApp()
    PutModule vbproj, "modWorkbookLocking", Get_modWorkbookLocking()
    PutModule vbproj, "StatusPalette", Get_StatusPalette()
    PutModule vbproj, "modAddStatusDropdown", Get_modAddStatusDropdown()
    PutModule vbproj, "Extractor", Get_Extractor()
    PutModule vbproj, "UpdateWhiteboard", Get_UpdateWhiteboard()
    PutThisWorkbook Get_ThisWorkbook()

    Application.Run "BuildStatusPalette"
    MsgBox "Prideboard refactor installed.", vbInformation
End Sub

Private Sub PutModule(vbproj As Object, ByVal name As String, ByVal codeText As String)
    Dim comp As Object, cm As Object
    On Error Resume Next
    Set comp = vbproj.VBComponents(name)
    On Error GoTo 0
    If comp Is Nothing Then
        Set comp = vbproj.VBComponents.Add(1)
        comp.Name = name
    End If
    Set cm = comp.CodeModule
    If cm.CountOfLines > 0 Then cm.DeleteLines 1, cm.CountOfLines
    cm.AddFromString codeText
End Sub

Private Sub PutThisWorkbook(ByVal codeText As String)
    Dim comp As Object, cm As Object
    Set comp = ThisWorkbook.VBProject.VBComponents("ThisWorkbook")
    Set cm = comp.CodeModule
    If cm.CountOfLines > 0 Then cm.DeleteLines 1, cm.CountOfLines
    cm.AddFromString codeText
End Sub

' ---- Code providers ----

Private Function Get_modConfig() As String
    Get_modConfig = _
"Option Explicit" & vbCrLf & _
"Public Const SHEET_WHITEBOARD As String = ""WHITE BOARD""" & vbCrLf & _
"Public Const SHEET_UPCOMING   As String = ""Upcoming Packs""" & vbCrLf & _
"Public Const SHEET_COMPLETED  As String = ""Completed Packs""" & vbCrLf & _
"" & vbCrLf & _
"' Adjust these to your layout (WHITE BOARD)" & vbCrLf & _
"Public Const COL_WB_JOBID As Long = 1" & vbCrLf & _
"Public Const COL_WB_PACK  As Long = 4" & vbCrLf & _
"Public Const COL_WB_DATE  As Long = 6" & vbCrLf & _
"Public Const COL_WB_STATUS As Long = 7" & vbCrLf & _
"" & vbCrLf & _
"Public Enum PackStatus" & vbCrLf & _
"    psNotDone = 1" & vbCrLf & _
"    psUpcomingOrders" & vbCrLf & _
"    psReadyToWrite" & vbCrLf & _
"    psNeedsRF" & vbCrLf & _
"    psConfirmDateAndSchedule" & vbCrLf & _
"    psScheduledCallToConfirm" & vbCrLf & _
"    psScheduled" & vbCrLf & _
"    psHold" & vbCrLf & _
"    psShippedDone" & vbCrLf & _
"    psReset" & vbCrLf & _
"End Enum" & vbCrLf & _
"" & vbCrLf & _
"Public Function StatusName(ByVal s As PackStatus) As String" & vbCrLf & _
"    Select Case s" & vbCrLf & _
"        Case psNotDone:                  StatusName = ""Not Done""" & vbCrLf & _
"        Case psUpcomingOrders:           StatusName = ""Upcoming Orders""" & vbCrLf & _
"        Case psReadyToWrite:             StatusName = ""Ready to Write""" & vbCrLf & _
"        Case psNeedsRF:                  StatusName = ""Needs RF""" & vbCrLf & _
"        Case psConfirmDateAndSchedule:   StatusName = ""Confirm Date and Schedule""" & vbCrLf & _
"        Case psScheduledCallToConfirm:   StatusName = ""Scheduled Call to Confirm""" & vbCrLf & _
"        Case psScheduled:                StatusName = ""Scheduled""" & vbCrLf & _
"        Case psHold:                     StatusName = ""Hold""" & vbCrLf & _
"        Case psShippedDone:              StatusName = ""Shipped/Done""" & vbCrLf & _
"        Case psReset:                    StatusName = ""Reset""" & vbCrLf & _
"    End Select" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Function StatusColor(ByVal s As PackStatus) As Long" & vbCrLf & _
"    Select Case s" & vbCrLf & _
"        Case psNotDone:                 StatusColor = RGB(255, 0, 0)" & vbCrLf & _
"        Case psUpcomingOrders:          StatusColor = RGB(255, 102, 204)" & vbCrLf & _
"        Case psReadyToWrite:            StatusColor = RGB(255, 192, 0)" & vbCrLf & _
"        Case psNeedsRF:                 StatusColor = RGB(131, 60, 12)" & vbCrLf & _
"        Case psConfirmDateAndSchedule:  StatusColor = RGB(0, 102, 255)" & vbCrLf & _
"        Case psScheduledCallToConfirm:  StatusColor = RGB(112, 48, 160)" & vbCrLf & _
"        Case psScheduled:               StatusColor = RGB(255, 255, 0)" & vbCrLf & _
"        Case psShippedDone:             StatusColor = RGB(146, 208, 80)" & vbCrLf & _
"        Case psHold:                    StatusColor = RGB(0, 176, 240)" & vbCrLf & _
"        Case psReset:                   StatusColor = RGB(191, 191, 191)" & vbCrLf & _
"    End Select" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Function StatusFromColor(ByVal color As Long) As PackStatus" & vbCrLf & _
"    Static map As Object" & vbCrLf & _
"    If map Is Nothing Then" & vbCrLf & _
"        Set map = CreateObject(""Scripting.Dictionary"")" & vbCrLf & _
"        Dim s As PackStatus" & vbCrLf & _
"        For s = psNotDone To psReset" & vbCrLf & _
"            map(StatusColor(s)) = s" & vbCrLf & _
"        Next" & vbCrLf & _
"    End If" & vbCrLf & _
"    If map.Exists(color) Then" & vbCrLf & _
"        StatusFromColor = map(color)" & vbCrLf & _
"    Else" & vbCrLf & _
"        StatusFromColor = psNotDone" & vbCrLf & _
"    End If" & vbCrLf & _
"End Function"
End Function

Private Function Get_modApp() As String
    Get_modApp = _
"Option Explicit" & vbCrLf & _
"" & vbCrLf & _
"Public Sub WithAppBatch(ByVal work As String, ByVal action As Variant)" & vbCrLf & _
"    Const PROC As String = ""WithAppBatch:""" & vbCrLf & _
"    Dim su As Boolean, ev As Boolean, calc As XlCalculation" & vbCrLf & _
"    su = Application.ScreenUpdating: ev = Application.EnableEvents: calc = Application.Calculation" & vbCrLf & _
"    On Error GoTo ErrHandler" & vbCrLf & _
"    Application.ScreenUpdating = False" & vbCrLf & _
"    Application.EnableEvents = False" & vbCrLf & _
"    Application.Calculation = xlCalculationManual" & vbCrLf & _
"    Application.Run action" & vbCrLf & _
"CleanExit:" & vbCrLf & _
"    Application.ScreenUpdating = su" & vbCrLf & _
"    Application.EnableEvents = ev" & vbCrLf & _
"    Application.Calculation = calc" & vbCrLf & _
"    Exit Sub" & vbCrLf & _
"ErrHandler:" & vbCrLf & _
"    LogError PROC & work, Err.Number, Err.Description" & vbCrLf & _
"    Resume CleanExit" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Public Sub LogError(ByVal proc As String, ByVal num As Long, ByVal desc As String)" & vbCrLf & _
"    Dim ws As Worksheet" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    Set ws = ThisWorkbook.Worksheets(""Logs"")" & vbCrLf & _
"    If ws Is Nothing Then" & vbCrLf & _
"        Set ws = ThisWorkbook.Worksheets.Add" & vbCrLf & _
"        ws.Name = ""Logs""" & vbCrLf & _
"        ws.Range(""A1:D1"").Value = Array(""When"", ""Procedure"", ""Err#"", ""Description"")" & vbCrLf & _
"    End If" & vbCrLf & _
"    On Error GoTo 0" & vbCrLf & _
"    With ws.Cells(ws.Rows.Count, 1).End(xlUp).Offset(1)" & vbCrLf & _
"        .Value = Now: .Offset(0, 1).Value = proc" & vbCrLf & _
"        .Offset(0, 2).Value = num: .Offset(0, 3).Value = desc" & vbCrLf & _
"    End With" & vbCrLf & _
"End Sub"
End Function

Private Function Get_modWorkbookLocking() As String
    Get_modWorkbookLocking = _
"Option Explicit" & vbCrLf & _
"Private Const NAME_LOCK As String = ""_WorkingModeSheet""" & vbCrLf & _
"" & vbCrLf & _
"Public Function IsSheetAccessible(ByVal sheetName As String) As Boolean" & vbCrLf & _
"    Dim cur$: cur = CurrentLockOwner()" & vbCrLf & _
"    IsSheetAccessible = (cur = vbNullString Or LCase$(cur) = LCase$(sheetName))" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Function CurrentLockOwner() As String" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    CurrentLockOwner = ThisWorkbook.Names(NAME_LOCK).RefersToRange.Value2" & vbCrLf & _
"    If Err.Number <> 0 Then" & vbCrLf & _
"        Err.Clear: CurrentLockOwner = vbNullString" & vbCrLf & _
"    End If" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Function AcquireWorkingMode(ByVal sheetName As String) As Boolean" & vbCrLf & _
"    If Not IsSheetAccessible(sheetName) Then Exit Function" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    If ThisWorkbook.Names(NAME_LOCK) Is Nothing Then" & vbCrLf & _
"        ThisWorkbook.Names.Add NAME_LOCK, "="""" & sheetName & """"" & vbCrLf & _
"    Else" & vbCrLf & _
"        ThisWorkbook.Names(NAME_LOCK).RefersTo = "="""" & sheetName & """"" & vbCrLf & _
"    End If" & vbCrLf & _
"    AcquireWorkingMode = True" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Sub ReleaseWorkingMode()" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    If Not ThisWorkbook.Names(NAME_LOCK) Is Nothing Then ThisWorkbook.Names(NAME_LOCK).Delete" & vbCrLf & _
"End Sub"
End Function

Private Function Get_StatusPalette() As String
    Get_StatusPalette = _
"Option Explicit" & vbCrLf & _
"" & vbCrLf & _
"Sub BuildStatusPalette()" & vbCrLf & _
"    If Not IsSheetAccessible(SHEET_WHITEBOARD) Then Exit Sub" & vbCrLf & _
"    Dim ws As Worksheet: Set ws = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)" & vbCrLf & _
"" & vbCrLf & _
"    Dim shp As Shape" & vbCrLf & _
"    For Each shp In ws.Shapes" & vbCrLf & _
"        If shp.Name Like ""btn_*"" Then shp.Delete" & vbCrLf & _
"    Next" & vbCrLf & _
"" & vbCrLf & _
"    Const R As Long = 2, START_COL As Long = 4, H As Double = 20, W As Double = 100, GAP As Double = 5" & vbCrLf & _
"    Dim x As Double: x = ws.Cells(R, START_COL).Left" & vbCrLf & _
"    Dim y As Double: y = ws.Cells(R, 1).Top + (ws.Cells(R, 1).Height - H) / 2" & vbCrLf & _
"" & vbCrLf & _
"    Dim s As PackStatus" & vbCrLf & _
"    For s = psNotDone To psReset" & vbCrLf & _
"        Dim label$: label = StatusName(s)" & vbCrLf & _
"        Dim w As Double: w = IIf(Len(label) > 15, W * 1.3, W)" & vbCrLf & _
"        Set shp = ws.Shapes.AddShape(msoShapeRectangle, x, y, w, H)" & vbCrLf & _
"        With shp" & vbCrLf & _
"            .Name = ""btn_"" & Replace(label, "" "", ""_"")" & vbCrLf & _
"            .OnAction = ""ApplyStatus""" & vbCrLf & _
"            .Fill.ForeColor.RGB = StatusColor(s)" & vbCrLf & _
"            .Line.ForeColor.RGB = RGB(105, 105, 105)" & vbCrLf & _
"            .Line.Weight = 0.75" & vbCrLf & _
"            With .TextFrame2" & vbCrLf & _
"                .TextRange.Characters.Text = label" & vbCrLf & _
"                .TextRange.ParagraphFormat.Alignment = msoAlignCenter" & vbCrLf & _
"                .VerticalAnchor = msoAnchorMiddle" & vbCrLf & _
"                .TextRange.Font.Size = 9" & vbCrLf & _
"                .TextRange.Font.Bold = msoTrue" & vbCrLf & _
"                .TextRange.Font.Fill.ForeColor.RGB = RGB(0, 0, 0)" & vbCrLf & _
"            End With" & vbCrLf & _
"        End With" & vbCrLf & _
"        x = x + w + GAP" & vbCrLf & _
"    Next" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Sub ApplyStatus()" & vbCrLf & _
"    If ActiveSheet.Name <> SHEET_WHITEBOARD Then" & vbCrLf & _
"        MsgBox ""Status colors can only be applied on "" & SHEET_WHITEBOARD & ""."", vbExclamation" & vbCrLf & _
"        Exit Sub" & vbCrLf & _
"    End If" & vbCrLf & _
"    Dim label As String: label = Replace(Mid$(Application.Caller, 5), ""_"", "" "")" & vbCrLf & _
"    Dim s As PackStatus, found As Boolean" & vbCrLf & _
"    For s = psNotDone To psReset" & vbCrLf & _
"        If StatusName(s) = label Then found = True: Exit For" & vbCrLf & _
"    Next" & vbCrLf & _
"    If Not found Then" & vbCrLf & _
"        MsgBox ""Unknown status: "" & label, vbCritical: Exit Sub" & vbCrLf & _
"    End If" & vbCrLf & _
"    If TypeName(Selection) <> ""Range"" Then" & vbCrLf & _
"        MsgBox ""Select cell(s) first."", vbInformation: Exit Sub" & vbCrLf & _
"    End If" & vbCrLf & _
"    With Selection" & vbCrLf & _
"        .Interior.Color = StatusColor(s)" & vbCrLf & _
"        .Font.Color = vbBlack" & vbCrLf & _
"    End With" & vbCrLf & _
"End Sub"
End Function

Private Function Get_modAddStatusDropdown() As String
    Get_modAddStatusDropdown = _
"Option Explicit" & vbCrLf & _
"Public Sub AddStatusDropdownToUpcomingPacks()" & vbCrLf & _
"    On Error GoTo EH" & vbCrLf & _
"    Dim ws As Worksheet: Set ws = ThisWorkbook.Worksheets(SHEET_UPCOMING)" & vbCrLf & _
"    Dim items() As String, s As PackStatus, i As Long" & vbCrLf & _
"    ReDim items(psShippedDone - psNotDone)" & vbCrLf & _
"    For s = psNotDone To psShippedDone" & vbCrLf & _
"        items(i) = StatusName(s): i = i + 1" & vbCrLf & _
"    Next" & vbCrLf & _
"    Dim list As String: list = Join(items, "","")" & vbCrLf & _
"    With ws.UsedRange" & vbCrLf & _
"        With .Columns(""E"")" & vbCrLf & _
"            .Validation.Delete" & vbCrLf & _
"            .Validation.Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:=xlBetween, Formula1:=list" & vbCrLf & _
"        End With" & vbCrLf & _
"    End With" & vbCrLf & _
"    Exit Sub" & vbCrLf & _
"EH:" & vbCrLf & _
"    LogError ""AddStatusDropdownToUpcomingPacks"", Err.Number, Err.Description" & vbCrLf & _
"End Sub"
End Function

Private Function Get_Extractor() As String
    Get_Extractor = _
"Option Explicit" & vbCrLf & _
"" & vbCrLf & _
"Public Sub ExtractAndProcessData_Safe()" & vbCrLf & _
"    WithAppBatch ""ExtractAndProcessData"", AddressOf ExtractAndProcessData_Core" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Private Sub ExtractAndProcessData_Core()" & vbCrLf & _
"    On Error GoTo EH" & vbCrLf & _
"" & vbCrLf & _
"    If Not WorksheetExists(SHEET_WHITEBOARD) Then" & vbCrLf & _
"        MsgBox ""'"" & SHEET_WHITEBOARD & ""' not found."", vbExclamation: Exit Sub" & vbCrLf & _
"    End If" & vbCrLf & _
"" & vbCrLf & _
"    Dim src As Worksheet: Set src = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)" & vbCrLf & _
"    Dim up As Worksheet:  Set up = CreateOrReuseSheet(SHEET_UPCOMING, 2)" & vbCrLf & _
"    Dim dn As Worksheet:  Set dn = CreateOrReuseSheet(SHEET_COMPLETED, 3)" & vbCrLf & _
"" & vbCrLf & _
"    SetupHeaders up, True" & vbCrLf & _
"    SetupHeaders dn, False" & vbCrLf & _
"" & vbCrLf & _
"    Dim ur As Range: Set ur = src.UsedRange" & vbCrLf & _
"    Dim A As Variant: A = ur.Value2" & vbCrLf & _
"" & vbCrLf & _
"    Dim outU() As Variant, outD() As Variant" & vbCrLf & _
"    Dim r As Long, u As Long, d As Long" & vbCrLf & _
"    ReDim outU(1 To UBound(A, 1), 1 To 10)" & vbCrLf & _
"    ReDim outD(1 To UBound(A, 1), 1 To 10)" & vbCrLf & _
"" & vbCrLf & _
"    For r = 2 To UBound(A, 1)" & vbCrLf & _
"        Dim jobId$, pack$, dt, st As PackStatus" & vbCrLf & _
"        jobId = A(r, COL_WB_JOBID)" & vbCrLf & _
"        pack = A(r, COL_WB_PACK)" & vbCrLf & _
"        dt = A(r, COL_WB_DATE)" & vbCrLf & _
"        st = StatusFromColor(src.Cells(ur.Row + r - 1, COL_WB_STATUS).Interior.Color)" & vbCrLf & _
"" & vbCrLf & _
"        If Len(jobId) > 0 And Len(pack) > 0 Then" & vbCrLf & _
"            If st = psShippedDone Then" & vbCrLf & _
"                d = d + 1" & vbCrLf & _
"                outD(d, 1) = jobId: outD(d, 2) = pack: outD(d, 3) = dt: outD(d, 4) = StatusName(st)" & vbCrLf & _
"            Else" & vbCrLf & _
"                u = u + 1" & vbCrLf & _
"                outU(u, 1) = jobId: outU(u, 2) = pack: outU(u, 3) = dt: outU(u, 4) = StatusName(st)" & vbCrLf & _
"            End If" & vbCrLf & _
"        End If" & vbCrLf & _
"    Next r" & vbCrLf & _
"" & vbCrLf & _
"    If u > 0 Then up.Range(""A2"").Resize(u, 10).Value2 = outU" & vbCrLf & _
"    If d > 0 Then dn.Range(""A2"").Resize(d, 10).Value2 = outD" & vbCrLf & _
"" & vbCrLf & _
"    SortWorksheetByDateAndPack up" & vbCrLf & _
"    SortWorksheetByDateAndPack dn" & vbCrLf & _
"" & vbCrLf & _
"    RemoveSortableDateColumn up" & vbCrLf & _
"    RemoveSortableDateColumn dn" & vbCrLf & _
"" & vbCrLf & _
"    Exit Sub" & vbCrLf & _
"EH:" & vbCrLf & _
"    LogError ""ExtractAndProcessData_Core"", Err.Number, Err.Description" & vbCrLf & _
"    MsgBox ""Error: "" & Err.Description, vbCritical" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Public Function WorksheetExists(ByVal name As String) As Boolean" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    WorksheetExists = Not ThisWorkbook.Worksheets(name) Is Nothing" & vbCrLf & _
"    On Error GoTo 0" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Function CreateOrReuseSheet(ByVal name As String, Optional ByVal position As Long = 1) As Worksheet" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    Set CreateOrReuseSheet = ThisWorkbook.Worksheets(name)" & vbCrLf & _
"    On Error GoTo 0" & vbCrLf & _
"    If CreateOrReuseSheet Is Nothing Then" & vbCrLf & _
"        Set CreateOrReuseSheet = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(position))" & vbCrLf & _
"        CreateOrReuseSheet.Name = name" & vbCrLf & _
"    Else" & vbCrLf & _
"        CreateOrReuseSheet.UsedRange.Offset(1).ClearContents" & vbCrLf & _
"    End If" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Sub SetupHeaders(ByVal ws As Worksheet, ByVal isUpcoming As Boolean)" & vbCrLf & _
"    ws.Rows(1).EntireRow.ClearContents" & vbCrLf & _
"    ws.Range(""A1:J1"").Value = Array(""JobID"",""Pack"",""Date"",""Status"","""","""","""","""","""","""")" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Public Sub SortWorksheetByDateAndPack(ByVal ws As Worksheet)" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    ws.Sort.SortFields.Clear" & vbCrLf & _
"    ws.Sort.SortFields.Add Key:=ws.Range(""C1:C1048576""), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal" & vbCrLf & _
"    ws.Sort.SortFields.Add Key:=ws.Range(""B1:B1048576""), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal" & vbCrLf & _
"    With ws.Sort" & vbCrLf & _
"        .SetRange ws.UsedRange" & vbCrLf & _
"        .Header = xlYes" & vbCrLf & _
"        .Apply" & vbCrLf & _
"    End With" & vbCrLf & _
"End Sub" & vbCrLf & _
"" & vbCrLf & _
"Public Sub RemoveSortableDateColumn(ByVal ws As Worksheet)" & vbCrLf & _
"End Sub"
End Function

Private Function Get_UpdateWhiteboard() As String
    Get_UpdateWhiteboard = _
"Option Explicit" & vbCrLf & _
"" & vbCrLf & _
"Private Function KeyOf(ByVal jobId As String, ByVal packName As String) As String" & vbCrLf & _
"    KeyOf = LCase$(Trim$(jobId)) & ""§"" & LCase$(Trim$(packName))" & vbCrLf & _
"End Function" & vbCrLf & _
"" & vbCrLf & _
"Public Sub Example_ReverseSync()" & vbCrLf & _
"    On Error GoTo EH" & vbCrLf & _
"    Dim wb As Worksheet: Set wb = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)" & vbCrLf & _
"    Dim idx As Object: Set idx = CreateObject(""Scripting.Dictionary"")" & vbCrLf & _
"    idx.CompareMode = vbTextCompare" & vbCrLf & _
"" & vbCrLf & _
"    Dim rg As Range: Set rg = wb.UsedRange" & vbCrLf & _
"    Dim V As Variant: V = rg.Value2" & vbCrLf & _
"    Dim r As Long" & vbCrLf & _
"    For r = 2 To UBound(V, 1)" & vbCrLf & _
"        Dim k$: k = KeyOf(V(r, COL_WB_JOBID), V(r, COL_WB_PACK))" & vbCrLf & _
"        If Not idx.Exists(k) Then idx.Add k, wb.Cells(rg.Row + r - 1, COL_WB_JOBID)" & vbCrLf & _
"    Next r" & vbCrLf & _
"" & vbCrLf & _
"    Dim jobId$, pack$: jobId = ""ABC123"": pack = ""Framing""" & vbCrLf & _
"    If idx.Exists(KeyOf(jobId, pack)) Then" & vbCrLf & _
"        Dim anchor As Range: Set anchor = idx(KeyOf(jobId, pack))" & vbCrLf & _
"        Application.EnableEvents = False" & vbCrLf & _
"        anchor.Offset(0, COL_WB_STATUS - COL_WB_JOBID).Interior.Color = StatusColor(psScheduled)" & vbCrLf & _
"        Application.EnableEvents = True" & vbCrLf & _
"    End If" & vbCrLf & _
"    Exit Sub" & vbCrLf & _
"EH:" & vbCrLf & _
"    LogError ""Example_ReverseSync"", Err.Number, Err.Description" & vbCrLf & _
"End Sub"
End Function

Private Function Get_ThisWorkbook() As String
    Get_ThisWorkbook = _
"Option Explicit" & vbCrLf & _
"" & vbCrLf & _
"Private Sub Workbook_Open()" & vbCrLf & _
"    On Error Resume Next" & vbCrLf & _
"    If WorksheetExists(SHEET_WHITEBOARD) Then" & vbCrLf & _
"        BuildStatusPalette" & vbCrLf & _
"    End If" & vbCrLf & _
"End Sub"
End Function
