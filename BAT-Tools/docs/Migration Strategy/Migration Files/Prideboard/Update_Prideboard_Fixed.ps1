
param(
    [string]$WorkbookPath = "C:\Users\corey.boser\Documents\Prideboard\ST1_Prideboard_Schedule_Extractor_06-06-25.xlsm",
    [string]$WhiteboardSheet = "WHITE BOARD",
    [string]$UpcomingSheet   = "Upcoming Packs",
    [string]$CompletedSheet  = "Completed Packs",
    [int]$ColWBJobID = 1,
    [int]$ColWBPack  = 4,
    [int]$ColWBDate  = 6,
    [int]$ColWBStatus= 7
)

function Remove-IfExists {
    param($vbproj, [string]$name)
    foreach ($c in $vbproj.VBComponents) {
        if ($c.Name -eq $name) {
            $vbproj.VBComponents.Remove($c)
            break
        }
    }
}
function Get-Or-AddModule {
    param($vbproj, [string]$name)
    foreach ($c in $vbproj.VBComponents) {
        if ($c.Name -eq $name) { return $c }
    }
    $comp = $vbproj.VBComponents.Add(1)
    $comp.Name = $name
    return $comp
}
function Set-Module-Code {
    param($vbcomp, [string]$code)
    $cm = $vbcomp.CodeModule
    $lines = $cm.CountOfLines
    if ($lines -gt 0) { $cm.DeleteLines(1, $lines) }
    $cm.AddFromString($code)
}

$modConfig = @'
Option Explicit
Public Const SHEET_WHITEBOARD As String = "__WB__"
Public Const SHEET_UPCOMING   As String = "__UP__"
Public Const SHEET_COMPLETED  As String = "__CP__"

Public Const COL_WB_JOBID As Long = __CJ__
Public Const COL_WB_PACK  As Long = __CPK__
Public Const COL_WB_DATE  As Long = __CD__
Public Const COL_WB_STATUS As Long = __CS__

Public Enum PackStatus
    psNotDone = 1
    psUpcomingOrders
    psReadyToWrite
    psNeedsRF
    psConfirmDateAndSchedule
    psScheduledCallToConfirm
    psScheduled
    psHold
    psShippedDone
    psReset
End Enum

Public Function StatusName(ByVal s As PackStatus) As String
    Select Case s
        Case psNotDone:                  StatusName = "Not Done"
        Case psUpcomingOrders:           StatusName = "Upcoming Orders"
        Case psReadyToWrite:             StatusName = "Ready to Write"
        Case psNeedsRF:                  StatusName = "Needs RF"
        Case psConfirmDateAndSchedule:   StatusName = "Confirm Date and Schedule"
        Case psScheduledCallToConfirm:   StatusName = "Scheduled Call to Confirm"
        Case psScheduled:                StatusName = "Scheduled"
        Case psHold:                     StatusName = "Hold"
        Case psShippedDone:              StatusName = "Shipped/Done"
        Case psReset:                    StatusName = "Reset"
    End Select
End Function

Public Function StatusColor(ByVal s As PackStatus) As Long
    Select Case s
        Case psNotDone:                 StatusColor = RGB(255, 0, 0)
        Case psUpcomingOrders:          StatusColor = RGB(255, 102, 204)
        Case psReadyToWrite:            StatusColor = RGB(255, 192, 0)
        Case psNeedsRF:                 StatusColor = RGB(131, 60, 12)
        Case psConfirmDateAndSchedule:  StatusColor = RGB(0, 102, 255)
        Case psScheduledCallToConfirm:  StatusColor = RGB(112, 48, 160)
        Case psScheduled:               StatusColor = RGB(255, 255, 0)
        Case psShippedDone:             StatusColor = RGB(146, 208, 80)
        Case psHold:                    StatusColor = RGB(0, 176, 240)
        Case psReset:                   StatusColor = RGB(191, 191, 191)
    End Select
End Function

Public Function StatusFromColor(ByVal color As Long) As PackStatus
    Static map As Object
    If map Is Nothing Then
        Set map = CreateObject("Scripting.Dictionary")
        Dim s As PackStatus
        For s = psNotDone To psReset
            map(StatusColor(s)) = s
        Next
    End If
    If map.Exists(color) Then
        StatusFromColor = map(color)
    Else
        StatusFromColor = psNotDone
    End If
End Function
'@

$modConfig = $modConfig.Replace('__WB__',$WhiteboardSheet).Replace('__UP__',$UpcomingSheet).Replace('__CP__',$CompletedSheet) `
                       .Replace('__CJ__',$ColWBJobID).Replace('__CPK__',$ColWBPack).Replace('__CD__',$ColWBDate).Replace('__CS__',$ColWBStatus)

$statusPalette = @'
Option Explicit

Sub BuildStatusPalette()
    If Not modWorkbookLocking.IsSheetAccessible(SHEET_WHITEBOARD) Then Exit Sub
    Dim ws As Worksheet: Set ws = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)

    Dim shp As Shape
    For Each shp In ws.Shapes
        If shp.Name Like "btn_*" Then shp.Delete
    Next

    Const R As Long = 2, START_COL As Long = 4, H As Double = 20, W As Double = 100, GAP As Double = 5
    Dim x As Double: x = ws.Cells(R, START_COL).Left
    Dim y As Double: y = ws.Cells(R, 1).Top + (ws.Cells(R, 1).Height - H) / 2

    Dim s As PackStatus
    For s = psNotDone To psReset
        Dim label As String: label = StatusName(s)
        Dim w As Double: w = IIf(Len(label) > 15, W * 1.3, W)
        Set shp = ws.Shapes.AddShape(msoShapeRectangle, x, y, w, H)
        With shp
            .Name = "btn_" & Replace(label, " ", "_")
            .OnAction = "ApplyStatus"
            .Fill.ForeColor.RGB = StatusColor(s)
            .Line.ForeColor.RGB = RGB(105, 105, 105)
            .Line.Weight = 0.75
            With .TextFrame2
                .TextRange.Characters.Text = label
                .TextRange.ParagraphFormat.Alignment = msoAlignCenter
                .VerticalAnchor = msoAnchorMiddle
                .TextRange.Font.Size = 9
                .TextRange.Font.Bold = msoTrue
                .TextRange.Font.Fill.ForeColor.RGB = RGB(0, 0, 0)
            End With
        End With
        x = x + w + GAP
    Next
End Sub

Sub ApplyStatus()
    If ActiveSheet.Name <> SHEET_WHITEBOARD Then
        MsgBox "Status colors can only be applied on " & SHEET_WHITEBOARD & ".", vbExclamation
        Exit Sub
    End If
    Dim label As String: label = Replace(Mid$(Application.Caller, 5), "_", " ")
    Dim s As PackStatus, found As Boolean
    For s = psNotDone To psReset
        If StatusName(s) = label Then found = True: Exit For
    Next
    If Not found Then
        MsgBox "Unknown status: " & label, vbCritical: Exit Sub
    End If
    If TypeName(Selection) <> "Range" Then
        MsgBox "Select cell(s) first.", vbInformation: Exit Sub
    End If
    With Selection
        .Interior.Color = StatusColor(s)
        .Font.Color = vbBlack
    End With
End Sub
'@

$modApp = @'
Option Explicit
Public Sub WithAppBatch(ByVal work As String, ByVal action As Variant)
    Const PROC As String = "WithAppBatch:"
    Dim su As Boolean, ev As Boolean, calc As XlCalculation
    su = Application.ScreenUpdating: ev = Application.EnableEvents: calc = Application.Calculation
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    Application.Run action
CleanExit:
    Application.ScreenUpdating = su
    Application.EnableEvents = ev
    Application.Calculation = calc
    Exit Sub
ErrHandler:
    LogError PROC & work, Err.Number, Err.Description
    Resume CleanExit
End Sub
Public Sub LogError(ByVal proc As String, ByVal num As Long, ByVal desc As String)
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Logs")
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add
        ws.Name = "Logs"
        ws.Range("A1:D1").Value = Array("When", "Procedure", "Err#", "Description")
    End If
    On Error GoTo 0
    With ws.Cells(ws.Rows.Count, 1).End(xlUp).Offset(1)
        .Value = Now: .Offset(0, 1).Value = proc
        .Offset(0, 2).Value = num: .Offset(0, 3).Value = desc
    End With
End Sub
'@

$modWorkbookLocking = @'
Option Explicit
Private Const NAME_LOCK As String = "_WorkingModeSheet"
Public Function IsSheetAccessible(ByVal sheetName As String) As Boolean
    Dim cur As String: cur = CurrentLockOwner()
    IsSheetAccessible = (cur = vbNullString Or LCase$(cur) = LCase$(sheetName))
End Function
Public Function CurrentLockOwner() As String
    On Error Resume Next
    CurrentLockOwner = ThisWorkbook.Names(NAME_LOCK).RefersToRange.Value2
    If Err.Number <> 0 Then
        Err.Clear: CurrentLockOwner = vbNullString
    End If
End Function
Public Function AcquireWorkingMode(ByVal sheetName As String) As Boolean
    If Not IsSheetAccessible(sheetName) Then Exit Function
    On Error Resume Next
    If ThisWorkbook.Names(NAME_LOCK) Is Nothing Then
        ThisWorkbook.Names.Add NAME_LOCK, "=""" & sheetName & """"
    Else
        ThisWorkbook.Names(NAME_LOCK).RefersTo = "=""" & sheetName & """"
    End If
    AcquireWorkingMode = True
End Function
Public Sub ReleaseWorkingMode()
    On Error Resume Next
    If Not ThisWorkbook.Names(NAME_LOCK) Is Nothing Then ThisWorkbook.Names(NAME_LOCK).Delete
End Sub
'@

$modAddStatusDropdown = @'
Option Explicit
Public Sub AddStatusDropdownToUpcomingPacks()
    On Error GoTo EH
    Dim ws As Worksheet: Set ws = ThisWorkbook.Worksheets(SHEET_UPCOMING)
    Dim items() As String, s As PackStatus, i As Long
    ReDim items(psShippedDone - psNotDone)
    For s = psNotDone To psShippedDone
        items(i) = StatusName(s): i = i + 1
    Next
    Dim list As String: list = Join(items, ",")
    With ws.UsedRange
        With .Columns("E")
            .Validation.Delete
            .Validation.Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:=xlBetween, Formula1:=list
        End With
    End With
    Exit Sub
EH:
    LogError "AddStatusDropdownToUpcomingPacks", Err.Number, Err.Description
End Sub
'@

$extractor = @'
Option Explicit
Public Sub ExtractAndProcessData_Safe()
    WithAppBatch "ExtractAndProcessData", AddressOf ExtractAndProcessData_Core
End Sub
Private Sub ExtractAndProcessData_Core()
    On Error GoTo EH
    If Not WorksheetExists(SHEET_WHITEBOARD) Then
        MsgBox "'" & SHEET_WHITEBOARD & "' not found.", vbExclamation: Exit Sub
    End If
    Dim src As Worksheet: Set src = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)
    Dim up As Worksheet:  Set up = CreateOrReuseSheet(SHEET_UPCOMING, 2)
    Dim dn As Worksheet:  Set dn = CreateOrReuseSheet(SHEET_COMPLETED, 3)
    SetupHeaders up, True
    SetupHeaders dn, False
    Dim ur As Range: Set ur = src.UsedRange
    Dim A As Variant: A = ur.Value2
    Dim outU() As Variant, outD() As Variant
    Dim r As Long, u As Long, d As Long
    ReDim outU(1 To UBound(A, 1), 1 To 10)
    ReDim outD(1 To UBound(A, 1), 1 To 10)
    For r = 2 To UBound(A, 1)
        Dim jobId As String, pack As String, dt, st As PackStatus
        jobId = A(r, COL_WB_JOBID)
        pack = A(r, COL_WB_PACK)
        dt = A(r, COL_WB_DATE)
        st = StatusFromColor(src.Cells(ur.Row + r - 1, COL_WB_STATUS).Interior.Color)
        If Len(jobId) > 0 And Len(pack) > 0 Then
            If st = psShippedDone Then
                d = d + 1
                outD(d, 1) = jobId: outD(d, 2) = pack: outD(d, 3) = dt: outD(d, 4) = StatusName(st)
            Else
                u = u + 1
                outU(u, 1) = jobId: outU(u, 2) = pack: outU(u, 3) = dt: outU(u, 4) = StatusName(st)
            End If
        End If
    Next r
    If u > 0 Then up.Range("A2").Resize(u, 10).Value2 = outU
    If d > 0 Then dn.Range("A2").Resize(d, 10).Value2 = outD
    SortWorksheetByDateAndPack up
    SortWorksheetByDateAndPack dn
    RemoveSortableDateColumn up
    RemoveSortableDateColumn dn
    Exit Sub
EH:
    LogError "ExtractAndProcessData_Core", Err.Number, Err.Description
    MsgBox "Error: " & Err.Description, vbCritical
End Sub
Private Function WorksheetExists(ByVal name As String) As Boolean
    On Error Resume Next
    WorksheetExists = Not ThisWorkbook.Worksheets(name) Is Nothing
    On Error GoTo 0
End Function
Private Function CreateOrReuseSheet(ByVal name As String, Optional ByVal position As Long = 1) As Worksheet
    On Error Resume Next
    Set CreateOrReuseSheet = ThisWorkbook.Worksheets(name)
    On Error GoTo 0
    If CreateOrReuseSheet Is Nothing Then
        Set CreateOrReuseSheet = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(position))
        CreateOrReuseSheet.Name = name
    Else
        CreateOrReuseSheet.UsedRange.Offset(1).ClearContents
    End If
End Function
Private Sub SetupHeaders(ByVal ws As Worksheet, ByVal isUpcoming As Boolean)
    ws.Rows(1).EntireRow.ClearContents
    ws.Range("A1:J1").Value = Array("JobID","Pack","Date","Status","","","","","","")
End Sub
Private Sub SortWorksheetByDateAndPack(ByVal ws As Worksheet)
    On Error Resume Next
    ws.Sort.SortFields.Clear
    ws.Sort.SortFields.Add Key:=ws.Range("C1:C1048576"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal
    ws.Sort.SortFields.Add Key:=ws.Range("B1:B1048576"), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal
    With ws.Sort
        .SetRange ws.UsedRange
        .Header = xlYes
        .Apply
    End With
End Sub
Private Sub RemoveSortableDateColumn(ByVal ws As Worksheet)
End Sub
'@

$updateWhiteboard = @'
Option Explicit
Private Function KeyOf(ByVal jobId As String, ByVal packName As String) As String
    KeyOf = LCase$(Trim$(jobId)) & "§" & LCase$(Trim$(packName))
End Function
Public Sub Example_ReverseSync()
    On Error GoTo EH
    Dim wb As Worksheet: Set wb = ThisWorkbook.Worksheets(SHEET_WHITEBOARD)
    Dim idx As Object: Set idx = CreateObject("Scripting.Dictionary")
    idx.CompareMode = vbTextCompare
    Dim rg As Range: Set rg = wb.UsedRange
    Dim V As Variant: V = rg.Value2
    Dim r As Long
    For r = 2 To UBound(V, 1)
        Dim k As String: k = KeyOf(V(r, COL_WB_JOBID), V(r, COL_WB_PACK))
        If Not idx.Exists(k) Then idx.Add k, wb.Cells(rg.Row + r - 1, COL_WB_JOBID)
    Next r
    Dim jobId As String, pack As String: jobId = "ABC123": pack = "Framing"
    If idx.Exists(KeyOf(jobId, pack)) Then
        Dim anchor As Range: Set anchor = idx(KeyOf(jobId, pack))
        Application.EnableEvents = False
        anchor.Offset(0, COL_WB_STATUS - COL_WB_JOBID).Interior.Color = StatusColor(psScheduled)
        Application.EnableEvents = True
    End If
    Exit Sub
EH:
    LogError "Example_ReverseSync", Err.Number, Err.Description
End Sub
'@

$thisWorkbook = @'
Option Explicit
Private Sub Workbook_Open()
    On Error Resume Next
    StatusPalette.BuildStatusPalette
End Sub
'@

# injection block
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    if (-not (Test-Path $WorkbookPath)) { throw "Workbook not found: $WorkbookPath" }
    $wb = $excel.Workbooks.Open($WorkbookPath, $false, $false)
    $vbproj = $wb.VBProject
    Remove-IfExists $vbproj 'WorkbookLocking'
    Remove-IfExists $vbproj 'WOrkbookLocking'
    Remove-IfExists $vbproj 'modWorkbookLock'
    $mConfig = Get-Or-AddModule -vbproj $vbproj -name 'modConfig'; Set-Module-Code $mConfig $modConfig
    $mApp    = Get-Or-AddModule -vbproj $vbproj -name 'modApp'; Set-Module-Code $mApp $modApp
    $mLock   = Get-Or-AddModule -vbproj $vbproj -name 'modWorkbookLocking'; Set-Module-Code $mLock $modWorkbookLocking
    $mPal    = Get-Or-AddModule -vbproj $vbproj -name 'StatusPalette'; Set-Module-Code $mPal $statusPalette
    $mDrop   = Get-Or-AddModule -vbproj $vbproj -name 'modAddStatusDropdown'; Set-Module-Code $mDrop $modAddStatusDropdown
    $mExt    = Get-Or-AddModule -vbproj $vbproj -name 'Extractor'; Set-Module-Code $mExt $extractor
    $mUpd    = Get-Or-AddModule -vbproj $vbproj -name 'UpdateWhiteboard'; Set-Module-Code $mUpd $updateWhiteboard
    foreach ($c in $vbproj.VBComponents) {
        if ($c.Type -eq 100 -and $c.Name -eq 'ThisWorkbook') { Set-Module-Code $c $thisWorkbook }
    }
    $wb.Save()
    try { $excel.Run("StatusPalette.BuildStatusPalette") | Out-Null } catch {}
    $wb.Save()
    "OK - Prideboard modules updated."
} catch {
    Write-Error $_
} finally {
    if ($wb) { $wb.Close($true) | Out-Null }
    $excel.Quit() | Out-Null
}
