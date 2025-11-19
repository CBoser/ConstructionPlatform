Attribute VB_Name = "UnifiedCodeGenerator"
'==============================================================================
' UNIFIED CODE GENERATOR MODULE
' Purpose: Generate unified codes (PPPP-XXX.XXX-XX-XXXX) from Holt/Richmond codes
' Created: November 17, 2025
' Author: BAT Integration Project
'==============================================================================

Option Explicit

'------------------------------------------------------------------------------
' MAIN FUNCTION: BuildUnifiedCode
' Generates a unified code from either Holt or Richmond source data
'
' Parameters:
'   planTable - Plan identifier (e.g., "plan_1670ABCD_CR")
'   optionPhase - Holt codes (e.g., "167010100 - 4085 , 167010200 - 4085")
'   packID - Richmond pack ID (e.g., "|10ABCD FOUNDATION")
'
' Returns: Unified code string (e.g., "1670-010.000-AB-1000")
'------------------------------------------------------------------------------
Function BuildUnifiedCode(planTable As String, optionPhase As String, packID As String) As String
    On Error GoTo ErrorHandler

    Dim planCode As String
    Dim phaseCode As String
    Dim elevCode As String
    Dim itemType As String

    ' Extract plan number from planTable
    planCode = ExtractPlanNumber(planTable)

    ' Determine if this is Holt or Richmond material
    If Len(Trim(optionPhase)) > 0 Then
        ' HOLT MATERIAL
        Dim holtCodes() As String
        holtCodes = Split(optionPhase, ",")

        ' Parse first Holt code
        Dim holtResult As Variant
        holtResult = ParseHoltCode(Trim(holtCodes(0)))

        If holtResult(0) = True Then
            ' Successful parse
            phaseCode = holtResult(2)  ' Phase code
            elevCode = holtResult(3)   ' Elevation code
            itemType = holtResult(4)   ' Item type

            ' If multiple codes, combine elevations
            If UBound(holtCodes) > 0 Then
                elevCode = CombineElevations(holtCodes)
            End If
        Else
            ' Parse error
            BuildUnifiedCode = "ERROR: " & holtResult(1)
            Exit Function
        End If

    ElseIf Len(Trim(packID)) > 0 Then
        ' RICHMOND MATERIAL
        Dim richResult As Variant
        richResult = ParseRichmondPack(packID)

        If richResult(0) = True Then
            phaseCode = richResult(1)  ' Phase code
            elevCode = richResult(2)   ' Elevation code
            itemType = "1000"  ' Default for Richmond (would need more logic for actual type)
        Else
            BuildUnifiedCode = "ERROR: " & richResult(1)
            Exit Function
        End If

    Else
        BuildUnifiedCode = "ERROR: No Holt or Richmond code provided"
        Exit Function
    End If

    ' Build unified code
    BuildUnifiedCode = planCode & "-" & phaseCode & "-" & elevCode & "-" & itemType

    Exit Function

ErrorHandler:
    BuildUnifiedCode = "ERROR: " & Err.Description
End Function

'------------------------------------------------------------------------------
' Extract plan number from plan table name
' Input: "plan_1670ABCD_CR" -> Output: "1670"
'------------------------------------------------------------------------------
Private Function ExtractPlanNumber(planTable As String) As String
    On Error Resume Next
    Dim parts() As String
    parts = Split(planTable, "_")
    If UBound(parts) >= 1 Then
        ' Remove non-numeric characters
        Dim i As Integer
        Dim result As String
        result = ""
        For i = 1 To Len(parts(1))
            If IsNumeric(Mid(parts(1), i, 1)) Then
                result = result & Mid(parts(1), i, 1)
            End If
        Next i
        ExtractPlanNumber = result
    Else
        ExtractPlanNumber = "0000"
    End If
End Function

'------------------------------------------------------------------------------
' Parse Holt Code
' Input: "167010100 - 4085"
' Returns: Array(Success, Plan, Phase, Elevation, ItemType)
'------------------------------------------------------------------------------
Private Function ParseHoltCode(holtCode As String) As Variant
    On Error GoTo ParseError

    Dim parts() As String
    Dim mainPart As String
    Dim activity As String
    Dim plan As String
    Dim elevDigit As String
    Dim phase As String
    Dim elevCode As String
    Dim itemType As String

    ' Split on " - "
    parts = Split(holtCode, " - ")
    If UBound(parts) < 1 Then GoTo ParseError

    mainPart = Trim(parts(0))
    activity = Trim(parts(1))

    ' Extract components from main part (e.g., "167010100")
    If Len(mainPart) < 9 Then GoTo ParseError

    plan = Mid(mainPart, 1, 4)           ' Characters 1-4
    elevDigit = Mid(mainPart, 5, 1)      ' Character 5
    phase = Mid(mainPart, 6, 3) & ".000" ' Characters 6-8 + ".000"

    ' Map elevation digit to letter
    Select Case elevDigit
        Case "1": elevCode = "A"
        Case "2": elevCode = "B"
        Case "3": elevCode = "C"
        Case "4": elevCode = "D"
        Case "0": elevCode = "**"  ' Universal
        Case Else: elevCode = "**"
    End Select

    ' Lookup item type from activity
    itemType = LookupItemType(activity)

    ' Return success with data
    ParseHoltCode = Array(True, plan, phase, elevCode, itemType)
    Exit Function

ParseError:
    ParseHoltCode = Array(False, "Parse error: " & holtCode)
End Function

'------------------------------------------------------------------------------
' Parse Richmond Pack ID
' Input: "|10ABCD FOUNDATION"
' Returns: Array(Success, PhaseCode, ElevationCode)
'------------------------------------------------------------------------------
Private Function ParseRichmondPack(packID As String) As Variant
    On Error GoTo ParseError

    Dim packNum As String
    Dim elevCode As String
    Dim phaseCode As String
    Dim i As Integer

    ' Extract pack number after |
    packNum = ""
    elevCode = ""

    For i = 2 To Len(packID)
        Dim ch As String
        ch = Mid(packID, i, 1)

        If IsNumeric(ch) And Len(packNum) < 3 Then
            packNum = packNum & ch
        ElseIf ch Like "[A-D]" Then
            elevCode = elevCode & ch
        ElseIf ch = " " Then
            Exit For  ' Stop at space
        End If
    Next i

    ' Lookup phase code from pack number
    phaseCode = LookupPhaseFromPack(packNum)

    ' Normalize elevation
    If Len(elevCode) = 0 Then elevCode = "**"

    ParseRichmondPack = Array(True, phaseCode, elevCode)
    Exit Function

ParseError:
    ParseRichmondPack = Array(False, "Parse error")
End Function

'------------------------------------------------------------------------------
' Combine elevations from multiple Holt codes
' Input: Array("167010100 - 4085", "167010200 - 4085", "167010300 - 4085")
' Output: "ABC" (combined elevations from all codes)
'------------------------------------------------------------------------------
Private Function CombineElevations(holtCodes() As String) As String
    Dim elevs As String
    Dim i As Integer
    Dim code As String
    Dim result As Variant

    elevs = ""
    For i = LBound(holtCodes) To UBound(holtCodes)
        code = Trim(holtCodes(i))
        result = ParseHoltCode(code)
        If result(0) = True Then
            Dim elev As String
            elev = result(3)  ' Elevation code
            If InStr(elevs, elev) = 0 And elev <> "**" Then
                elevs = elevs & elev
            End If
        End If
    Next i

    ' Sort alphabetically
    CombineElevations = SortString(elevs)
End Function

'------------------------------------------------------------------------------
' Sort string alphabetically (for elevations)
' Input: "DBA" -> Output: "ABD"
'------------------------------------------------------------------------------
Private Function SortString(text As String) As String
    Dim arr() As String
    Dim i As Integer, j As Integer
    Dim temp As String

    If Len(text) <= 1 Then
        SortString = text
        Exit Function
    End If

    ReDim arr(1 To Len(text))
    For i = 1 To Len(text)
        arr(i) = Mid(text, i, 1)
    Next i

    ' Bubble sort
    For i = 1 To UBound(arr) - 1
        For j = i + 1 To UBound(arr)
            If arr(i) > arr(j) Then
                temp = arr(i)
                arr(i) = arr(j)
                arr(j) = temp
            End If
        Next j
    Next i

    ' Rebuild string
    SortString = ""
    For i = 1 To UBound(arr)
        SortString = SortString & arr(i)
    Next i
End Function

'------------------------------------------------------------------------------
' Lookup item type from Holt activity code
' Uses the Holt_Activity sheet from cross-reference workbook
'------------------------------------------------------------------------------
Private Function LookupItemType(activity As String) As String
    On Error Resume Next

    Dim result As Variant
    result = Application.VLookup(activity, Sheets("Holt_Activity").Range("A:B"), 2, False)

    If IsError(result) Then
        LookupItemType = "9999"  ' Unknown
    Else
        LookupItemType = result
    End If
End Function

'------------------------------------------------------------------------------
' Lookup phase code from Richmond pack number
' Uses the Richmond_Pack sheet from cross-reference workbook
'------------------------------------------------------------------------------
Private Function LookupPhaseFromPack(packNum As String) As String
    On Error Resume Next

    Dim lookupValue As String
    Dim result As Variant

    lookupValue = "|" & packNum
    result = Application.VLookup(lookupValue, Sheets("Richmond_Pack").Range("A:B"), 2, False)

    If IsError(result) Then
        ' Default to pack number + ".000"
        LookupPhaseFromPack = Format(Val(packNum), "000") & ".000"
    Else
        LookupPhaseFromPack = result
    End If
End Function

'==============================================================================
' TESTING FUNCTION
' Run this to test the code generation
'==============================================================================
Sub TestUnifiedCodeGeneration()
    Debug.Print "="& String(79, "=")
    Debug.Print "TESTING UNIFIED CODE GENERATION"
    Debug.Print "=" & String(79, "=")

    ' Test 1: Holt single code
    Debug.Print vbNewLine & "Test 1: Holt Single Code"
    Debug.Print "Input: plan_1670ABCD_CR, 167010100 - 4085, (empty)"
    Debug.Print "Output: " & BuildUnifiedCode("plan_1670ABCD_CR", "167010100 - 4085", "")
    Debug.Print "Expected: 1670-010.000-A-1000"

    ' Test 2: Holt multiple codes
    Debug.Print vbNewLine & "Test 2: Holt Multiple Codes"
    Debug.Print "Input: plan_1670ABCD_CR, 167010100 - 4085 , 167010200 - 4085, (empty)"
    Debug.Print "Output: " & BuildUnifiedCode("plan_1670ABCD_CR", "167010100 - 4085 , 167010200 - 4085", "")
    Debug.Print "Expected: 1670-010.000-AB-1000"

    ' Test 3: Richmond pack
    Debug.Print vbNewLine & "Test 3: Richmond Pack"
    Debug.Print "Input: plan_1670ABCD_CR, (empty), |10ABCD FOUNDATION"
    Debug.Print "Output: " & BuildUnifiedCode("plan_1670ABCD_CR", "", "|10ABCD FOUNDATION")
    Debug.Print "Expected: 1670-010.000-ABCD-1000"

    Debug.Print vbNewLine & "=" & String(79, "=")
    Debug.Print "✓ TESTS COMPLETE"
End Sub
