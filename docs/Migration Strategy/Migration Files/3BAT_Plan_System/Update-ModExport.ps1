param(
  [string]$WorkbookPath = 'C:\Users\corey.boser\Documents\HOLT BAT OCTOBER 2025 9-29-25 Updated 10-12-25 v1.xlsm',
  [string]$ModuleName   = 'modExport'
)

# VBIDE constants
$vbext_ct_StdModule = 1

function Release-ComObject {
  param([object]$obj)
  if ($null -ne $obj -and $obj -is [System.__ComObject]) {
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj)
  }
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
  throw "Workbook not found: $WorkbookPath"
}

# ---------------------- VBA MODULE CONTENT ----------------------
$moduleCode = @'
Option Explicit

'================= CONFIG =================
Private ExportCols() As Variant
Private Const KEY_COL_INDEX As Long = 1
Private Const EXPORT_INDIVIDUAL_CSVS As Boolean = False
'==========================================

Private Sub InitConfig()
    ' 2: Pack ID / Elevation(s) / Pack-Option Name
    ' 3: Description
    ' 7: Sku
    ' 8: Qty
    ' 9: Price
    ' 12: UOM
    ' 13: Online Description
    ' 14: Ext Price
    ExportCols = Array(2, 3, 7, 8, 9, 12, 13, 14)
End Sub

'================ ENTRY POINT ================
Public Sub ExportCombined_ByPlanAndOptions_Prompt()
    Dim prevCalc As XlCalculation, prevScr As Boolean, prevEvents As Boolean
    On Error GoTo Fail

    ' Speed guards
    prevScr = Application.ScreenUpdating: Application.ScreenUpdating = False
    prevEvents = Application.EnableEvents: Application.EnableEvents = False
    prevCalc = Application.Calculation: Application.Calculation = xlCalculationManual

    InitConfig

    ' ---- Use the Plan Selection Sheet dialog ----
    Dim pickedTable As String
    Dim selOptions As Variant       ' 1-based array of full OptionPhaseItemNo (e.g., 167010100-4085)
    Dim selItemCodes As Variant     ' 1-based array of numbers (e.g., 4085, 4086, 4155)
    Dim elev As String

    If Not ShowPlanSelectionDialog(pickedTable, selOptions, selItemCodes, elev) Then GoTo TidyExit
    If Len(pickedTable) = 0 Or IsEmpty(selOptions) Then GoTo TidyExit

    ' Derive Plan Prefix from first selected option (before "-")
    Dim planPrefix As String
    planPrefix = GetPrefixFromFullCode(CStr(selOptions(LBound(selOptions))))

    ' Resolve ListObject
    Dim lo As ListObject
    Set lo = FindTableByName(pickedTable)
    If lo Is Nothing Then
        MsgBox "Could not find a table named: " & pickedTable, vbCritical
        GoTo TidyExit
    End If
    If lo.DataBodyRange Is Nothing Then
        MsgBox "The table '" & lo.Name & "' has no rows.", vbExclamation
        GoTo TidyExit
    End If

    ' If elevation from dialog is empty, try to pull from indexPlans
    If Len(Trim$(elev)) = 0 Then
        Dim elevFallback As String
        elevFallback = GetElevationsForTable(pickedTable)
        If Len(elevFallback) > 0 Then elev = elevFallback
    End If

    ' Subdivision = last two letters of table name (uppercased)
    Dim subdivAbbr As String
    subdivAbbr = UCase$(Right$(lo.Name, 2))

    ' --- Pull & filter ---
    Dim data As Variant
    data = lo.DataBodyRange.Value2

    Dim hdr() As Variant, k As Long
    ReDim hdr(1 To 1, 1 To UBound(ExportCols) - LBound(ExportCols) + 1)
    For k = LBound(ExportCols) To UBound(ExportCols)
        hdr(1, k - LBound(ExportCols) + 1) = CStr(lo.HeaderRowRange(1, ExportCols(k)).Value)
    Next k

    ' Build quick lookup for item code filters (suffixes like "-4085")
    Dim needItemFilter As Boolean: needItemFilter = Not IsEmpty(selItemCodes)
    Dim itemSuffixes As Collection
    If needItemFilter Then
        Set itemSuffixes = New Collection
        Dim ic As Long
        For ic = LBound(selItemCodes) To UBound(selItemCodes)
            itemSuffixes.Add "-" & CStr(selItemCodes(ic))
        Next ic
    End If

    ' Include if: cell contains any selected option code AND (if item filters present) cell also contains any selected item suffix
    Dim include() As Boolean, r As Long
    ReDim include(1 To UBound(data, 1)) As Boolean

    For r = 1 To UBound(data, 1)
        Dim cellTxt As String: cellTxt = NormalizeKey(data(r, KEY_COL_INDEX))

        ' Option match
        Dim matchedOption As Boolean: matchedOption = False
        Dim op As Long
        For op = LBound(selOptions) To UBound(selOptions)
            If CellHasCode(cellTxt, CStr(selOptions(op))) Then
                matchedOption = True
                Exit For
            End If
        Next op

        If matchedOption Then
            If needItemFilter Then
                Dim hasItem As Boolean: hasItem = False
                Dim s As Long
                For s = 1 To itemSuffixes.Count
                    If InStr(1, "," & cellTxt & ",", "," & NormalizeKey(itemSuffixes(s)) & ",", vbTextCompare) > 0 _
                       Or InStr(1, cellTxt, itemSuffixes(s), vbTextCompare) > 0 Then
                        hasItem = True: Exit For
                    End If
                Next s
                include(r) = hasItem
            Else
                include(r) = True
            End If
        End If
    Next r

    Dim rowsCount As Long
    For r = 1 To UBound(include)
        If include(r) Then rowsCount = rowsCount + 1
    Next r
    If rowsCount = 0 Then
        MsgBox "No matching rows found for the selected options / item codes.", vbInformation
        GoTo TidyExit
    End If

    ' --- Build output array ---
    Dim colsCount As Long: colsCount = UBound(ExportCols) - LBound(ExportCols) + 1
    Dim outArr() As Variant
    ReDim outArr(1 To rowsCount + 1, 1 To colsCount)

    For k = 1 To colsCount: outArr(1, k) = hdr(1, k): Next k

    Dim w As Long, iCol As Long, colPos As Long
    w = 2
    For r = 1 To UBound(data, 1)
        If include(r) Then
            For iCol = LBound(ExportCols) To UBound(ExportCols)
                colPos = iCol - LBound(ExportCols) + 1
                outArr(w, colPos) = data(r, ExportCols(iCol))
            Next iCol
            w = w + 1
        End If
    Next r

    ' --- Create workbook/sheet ---
    Dim outPath As String
    outPath = ThisWorkbook.Path
    If Len(outPath) = 0 Then outPath = Environ$("USERPROFILE") & "\Desktop"

    Dim wb As Workbook, ws As Worksheet
    Set wb = Application.Workbooks.Add(xlWBATWorksheet)
    Set ws = wb.Worksheets(1)

    ' Sheet tab: "<PlanNumber> <Elevation>"
    ws.Name = SanitizeSheetName(Trim$(planPrefix & IIf(Len(elev) > 0, " " & elev, "")))

    ' Row 1 header info
    ws.Range("A1").Value = "Plan:"
    ws.Range("B1").Value = planPrefix
    ws.Range("C1").Value = "Elevation(s):"
    ws.Range("D1").Value = elev
    ws.Range("A1:D1").Font.Bold = True

    ' Write table to Row 2+
    ws.Range("A2").Resize(UBound(outArr, 1), UBound(outArr, 2)).Value = outArr

    ' Sort by first exported column (Pack / Name)
    With ws.Sort
        .SortFields.Clear
        .SortFields.Add Key:=ws.Range("A2").Resize(UBound(outArr, 1), 1), _
                        SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal
        .SetRange ws.Range("A2").Resize(UBound(outArr, 1), UBound(outArr, 2))
        .Header = xlYes
        .Apply
    End With

    ' Formatting
    ws.Range("A2").Resize(1, colsCount).Font.Bold = True
    Dim usedRng As Range: Set usedRng = ws.Range("A1").CurrentRegion
    With usedRng.Borders
        .LineStyle = xlContinuous
        .Weight = xlThin
        .Color = vbBlack
    End With
    usedRng.EntireColumn.AutoFit
    On Error Resume Next
    ws.Columns("A").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("A").ColumnWidth, 34)
    ws.Columns("B").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("B").ColumnWidth, 44)
    ws.Columns("G").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("G").ColumnWidth, 60)
    ws.Columns("C").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("C").ColumnWidth, 14)
    ws.Columns("D").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("D").ColumnWidth, 10)
    ws.Columns("E").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("E").ColumnWidth, 12)
    ws.Columns("F").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("F").ColumnWidth, 10)
    ws.Columns("H").ColumnWidth = Application.WorksheetFunction.Max(ws.Columns("H").ColumnWidth, 14)
    On Error GoTo 0
    ws.Columns("B").WrapText = True
    ws.Columns("G").WrapText = True
    ws.Rows("2:" & ws.Rows.Count).EntireRow.AutoFit

    ' Freeze top two rows
    ws.Activate: ws.Range("A3").Select: ActiveWindow.FreezePanes = True

    ' Filename: SUBDIV_FIRST4PLAN_ELEV_MM-DD-YY (sections "_")
    Dim first4 As String: first4 = Left$(planPrefix, 4)
    Dim dateStr As String: dateStr = Format(Date, "mm-dd-yy")
    Dim baseName As String
    baseName = UCase$(Right$(lo.Name, 2)) & "_" & first4 & IIf(Len(elev) > 0, "_" & elev, "") & "_" & dateStr

    Dim savedPath As String
    savedPath = SaveWorkbookUnique(wb, outPath, SanitizeFileName(baseName), ".xlsx")

    ' Optional: per-option CSVs
    If EXPORT_INDIVIDUAL_CSVS Then
        Dim opt As Variant
        For Each opt In selOptions
            ExportOneCode CStr(opt), data, lo, hdr, outPath
        Next opt
    End If

    MsgBox "Export created from '" & lo.Name & "' and saved:" & vbCrLf & savedPath, vbInformation
    GoTo TidyExit

Fail:
    MsgBox "Error: " & Err.Description, vbCritical

TidyExit:
    ' Restore app state
    Application.ScreenUpdating = prevScr
    Application.EnableEvents = prevEvents
    Application.Calculation = prevCalc
End Sub
'===========================================

' ---------- Helpers ----------
Private Function GetPrefixFromFullCode(ByVal fullCode As String) As String
    Dim p As Long: p = InStr(1, fullCode, "-", vbTextCompare)
    If p > 0 Then GetPrefixFromFullCode = Left$(fullCode, p - 1)
End Function

' Look up "Elevations" text from indexPlans for a given table name (if that column exists)
Private Function GetElevationsForTable(ByVal tableName As String) As String
    Dim loIdx As ListObject
    Set loIdx = FindTableByExactName("indexPlans")
    If loIdx Is Nothing Then Exit Function
    If loIdx.DataBodyRange Is Nothing Then Exit Function

    Dim cPlanSheet As Long, cPlanTable As Long, cElev As Long, j As Long
    For j = 1 To loIdx.ListColumns.Count
        Select Case UCase$(Trim$(CStr(loIdx.HeaderRowRange(1, j).Value)))
            Case "PLAN SHEET": cPlanSheet = j
            Case "PLAN TABLE": cPlanTable = j
            Case "ELEVATIONS": cElev = j
        End Select
    Next j

    Dim src As Variant: src = loIdx.DataBodyRange.Value2
    Dim r As Long, resolved As String

    For r = 1 To UBound(src, 1)
        If cPlanTable > 0 Then
            If StrComp(NzStr(src(r, cPlanTable)), tableName, vbTextCompare) = 0 Then
                If cElev > 0 Then GetElevationsForTable = NzStr(src(r, cElev))
                Exit Function
            End If
        ElseIf cPlanSheet > 0 Then
            resolved = ResolveTableNameFromPlanSheet(NzStr(src(r, cPlanSheet)))
            If StrComp(resolved, tableName, vbTextCompare) = 0 Then
                If cElev > 0 Then GetElevationsForTable = NzStr(src(r, cElev))
                Exit Function
            End If
        End If
    Next r
End Function

Private Function ResolveTableNameFromPlanSheet(ByVal sheetName As String) As String
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(sheetName)
    On Error GoTo 0
    If ws Is Nothing Then Exit Function
    If ws.ListObjects.Count > 0 Then
        ResolveTableNameFromPlanSheet = ws.ListObjects(1).Name
    End If
End Function

Private Function FindTableByName(ByVal tableName As String) As ListObject
    Dim ws As Worksheet, lo As ListObject
    For Each ws In ThisWorkbook.Worksheets
        For Each lo In ws.ListObjects
            If StrComp(lo.Name, tableName, vbTextCompare) = 0 Then
                Set FindTableByName = lo
                Exit Function
            End If
        Next lo
    Next ws
End Function

Private Function FindTableByExactName(ByVal tableName As String) As ListObject
    Dim ws As Worksheet, lo As ListObject
    For Each ws In ThisWorkbook.Worksheets
        For Each lo In ws.ListObjects
            If lo.Name = tableName Then
                Set FindTableByExactName = lo
                Exit Function
            End If
        Next lo
    Next ws
End Function

Private Function CellHasCode(ByVal cellTextNormalized As String, ByVal code As String) As Boolean
    ' cellTextNormalized should already be NormalizeKey(...)
    Dim hay As String, needle As String
    hay = "," & Replace$(Replace$(Replace$(Replace$(cellTextNormalized, ";", ","), "|", ","), "/", ","), vbLf, ",") & ","
    needle = "," & NormalizeKey(code) & ","
    CellHasCode = (InStr(1, hay, needle, vbTextCompare) > 0)
End Function

Private Function NormalizeKey(ByVal v As Variant) As String
    NormalizeKey = Replace$(Replace$(Trim$(CStr(v)), " ", ""), vbTab, "")
End Function

Private Function SanitizeFileName(ByVal s As String) As String
    Dim bad As Variant, ch As Variant
    bad = Array("\", "/", ":", "*", "?", """", "<", ">", "|")
    For Each ch In bad: s = Replace$(s, CStr(ch), "_"): Next ch
    SanitizeFileName = s
End Function

Private Function SanitizeSheetName(ByVal s As String) As String
    Dim bad As Variant, ch As Variant
    bad = Array("\", "/", ":", "*", "?", "[", "]")
    For Each ch In bad: s = Replace$(s, CStr(ch), " "): Next ch
    If Len(s) = 0 Then s = "Sheet1"
    If Len(s) > 31 Then s = Left$(s, 31)
    SanitizeSheetName = s
End Function

Private Function SaveWorkbookUnique(ByVal wb As Workbook, _
                                    ByVal folder As String, _
                                    ByVal baseName As String, _
                                    ByVal ext As String) As String
    Dim nameOnly As String, fullPath As String, i As Long
    nameOnly = baseName & ext
    fullPath = folder & "\" & nameOnly
    Do While FileExists(fullPath) Or WorkbookNameOpen(nameOnly)
        i = i + 1
        nameOnly = baseName & " (" & i & ")" & ext
        fullPath = folder & "\" & nameOnly
    Loop
    Application.DisplayAlerts = False
    If LCase(ext) = ".xlsx" Then
        wb.SaveAs Filename:=fullPath, FileFormat:=xlOpenXMLWorkbook
    Else
        wb.SaveAs Filename:=fullPath, FileFormat:=xlCSVUTF8
    End If
    Application.DisplayAlerts = True
    SaveWorkbookUnique = fullPath
End Function

Private Function FileExists(ByVal fullPath As String) As Boolean
    FileExists = (Len(Dir$(fullPath)) > 0)
End Function

Private Function WorkbookNameOpen(ByVal nameOnly As String) As Boolean
    Dim wb As Workbook
    For Each wb In Application.Workbooks
        If StrComp(wb.Name, nameOnly, vbTextCompare) = 0 Then
            WorkbookNameOpen = True
            Exit Function
        End If
    Next wb
End Function

Private Function NzStr(v As Variant) As String
    If IsError(v) Or IsEmpty(v) Or IsNull(v) Then
        NzStr = ""
    Else
        NzStr = CStr(v)
    End If
End Function

' -------- Optional: export single code to CSV (used if EXPORT_INDIVIDUAL_CSVS = True) -----
Private Sub ExportOneCode(ByVal Code As String, _
                          ByRef data As Variant, _
                          ByVal lo As ListObject, _
                          ByRef hdr As Variant, _
                          ByVal outPath As String)

    Dim r As Long, i As Long, colPos As Long, iCol As Long
    Dim rowsCount As Long

    ' Count matches in key column
    For r = 1 To UBound(data, 1)
        If CellHasCode(NormalizeKey(data(r, KEY_COL_INDEX)), Code) Then rowsCount = rowsCount + 1
    Next r
    If rowsCount = 0 Then Exit Sub

    Dim colsCount As Long
    colsCount = UBound(ExportCols) - LBound(ExportCols) + 1

    ' Build output array (header + matches)
    Dim outArr() As Variant
    ReDim outArr(1 To rowsCount + 1, 1 To colsCount)

    For i = 1 To colsCount
        outArr(1, i) = hdr(1, i)
    Next i

    Dim w As Long: w = 2
    For r = 1 To UBound(data, 1)
        If CellHasCode(NormalizeKey(data(r, KEY_COL_INDEX)), Code) Then
            For iCol = LBound(ExportCols) To UBound(ExportCols)
                colPos = iCol - LBound(ExportCols) + 1
                outArr(w, colPos) = data(r, ExportCols(iCol))
            Next iCol
            w = w + 1
        End If
    Next r

    ' Write to a temp workbook and save as CSV (UTF-8)
    Dim tmpWB As Workbook, tmpWS As Worksheet
    Set tmpWB = Application.Workbooks.Add(xlWBATWorksheet)
    Set tmpWS = tmpWB.Worksheets(1)

    With tmpWS.Range("A1").Resize(UBound(outArr, 1), UBound(outArr, 2))
        .Value = outArr
        .EntireColumn.AutoFit
    End With

    Dim base As String
    base = "Export_" & SanitizeFileName(Code)
    Call SaveWorkbookUnique(tmpWB, outPath, base, ".csv")

    tmpWB.Close SaveChanges:=False
End Sub
'@
# ---------------------- END MODULE CONTENT ----------------------

$excel = $null; $wb = $null; $vbproj = $null; $stdComp = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $wb = $excel.Workbooks.Open($WorkbookPath)

  try { $vbproj = $wb.VBProject } catch {
    throw "Cannot access VBProject. In Excel: File > Options > Trust Center > Trust Center Settings > Macro Settings > enable 'Trust access to the VBA project object model'."
  }

  # Find or create the std module
  foreach ($c in @($vbproj.VBComponents)) {
    if ($c.Type -eq $vbext_ct_StdModule -and $c.Name -eq $ModuleName) { $stdComp = $c; break }
  }
  if ($null -eq $stdComp) {
    $stdComp = $vbproj.VBComponents.Add($vbext_ct_StdModule)
    $stdComp.Name = $ModuleName
  }

  # Replace the code
  $cm = $stdComp.CodeModule
  if ($cm.CountOfLines -gt 0) { $cm.DeleteLines(1, $cm.CountOfLines) }
  $cm.AddFromString($moduleCode)

  $wb.Save()
  Write-Host "✅ Updated VBA module '$ModuleName' in:"
  Write-Host "   $WorkbookPath"

} catch {
  Write-Error ("❌ " + $_.Exception.Message)
} finally {
  try { if ($wb) { $wb.Close($true) | Out-Null } } catch {}
  try { if ($excel) { $excel.Quit() | Out-Null } } catch {}
  Release-ComObject $stdComp
  Release-ComObject $vbproj
  Release-ComObject $wb
  Release-ComObject $excel
}
