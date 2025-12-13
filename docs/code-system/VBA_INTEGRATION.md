# VBA Integration Specifications

**Document**: Unified Code System VBA Integration
**Version**: 1.0
**Date**: December 2025

---

## Overview

This document provides VBA code and specifications for integrating the Unified Code System with Excel workbooks used for BAT pack management and estimating.

---

## 1. Cross-Reference Lookup Tables

### 1.1 Holt Phase Lookup

Create a named range `HoltPhaseXref` with the following structure:

| Holt Phase | Unified Phase | Elevation | Item Type | BAT Pack | Shipping Order |
|------------|---------------|-----------|-----------|----------|----------------|
| 10100 | 010.000 | A | 1000 | \|10 | 1 |
| 10200 | 010.000 | B | 1000 | \|10 | 1 |
| 10300 | 010.000 | C | 1000 | \|10 | 1 |
| ... | ... | ... | ... | ... | ... |

### 1.2 Richmond Code Lookup

Create a named range `RichmondXref` with the following structure:

| Richmond Code | Description | Is Multi-Phase | Primary Phase | Phases |
|---------------|-------------|----------------|---------------|--------|
| ELVA | Elevation A | FALSE | 010.000 | 010.000 |
| 3CARA | 3-Car Garage A | TRUE | 012.000 | 012,022,042,062 |
| COVP | Covered Patio | TRUE | 013.100 | 013,023,043,063 |
| ... | ... | ... | ... | ... |

### 1.3 Item Type Lookup

Create a named range `ItemTypeXref`:

| Holt Cost Code | Cost Name | Material Class | DART Category |
|----------------|-----------|----------------|---------------|
| 4085 | Lumber | 1000 | 1 |
| 4086 | Lumber - Barge Credit | 1000 | 1 |
| 4120 | Trusses | 1000 | 2 |
| 4140 | Window Supply | 1000 | 4 |
| 4155 | Siding Supply | 1100 | 3 |
| ... | ... | ... | ... |

### 1.4 Option Suffix Lookup

Create a named range `OptionSuffixes`:

| Suffix Code | Abbreviation | Full Name | Category |
|-------------|--------------|-----------|----------|
| 01 | rf | ReadyFrame | structural |
| 03 | l | Loft | structural |
| 04 | nl | No Loft | structural |
| 05 | x | Extended | structural |
| 06 | sr | Sunroom | addition |
| 07 | pw | Post Wrap | exterior |
| 08 | tc | Tall Crawl | foundation |
| ... | ... | ... | ... |

---

## 2. VBA Functions

### 2.1 Convert Holt Phase to Unified Code

```vba
' ============================================================================
' Function: HoltToUnified
' Purpose: Convert Holt 5-digit phase code to Unified code format
' Parameters:
'   holtPhase - Holt phase code (e.g., "10100")
'   planCode - 4-digit plan code (e.g., "1670")
' Returns: Unified code string (e.g., "1670-010.000-A-1000")
' ============================================================================
Public Function HoltToUnified(holtPhase As String, planCode As String) As String
    Dim xrefRange As Range
    Dim lookupResult As Variant
    Dim unifiedPhase As String
    Dim elevation As String
    Dim itemType As String

    On Error GoTo ErrorHandler

    ' Get the cross-reference range
    Set xrefRange = Range("HoltPhaseXref")

    ' Lookup unified phase (column 2)
    unifiedPhase = Application.VLookup(holtPhase, xrefRange, 2, False)
    If IsError(unifiedPhase) Then
        HoltToUnified = "#HOLT_NOT_FOUND"
        Exit Function
    End If

    ' Lookup elevation (column 3)
    elevation = Application.VLookup(holtPhase, xrefRange, 3, False)

    ' Lookup item type (column 4)
    itemType = Application.VLookup(holtPhase, xrefRange, 4, False)

    ' Build unified code
    HoltToUnified = planCode & "-" & unifiedPhase & "-" & elevation & "-" & itemType

    Exit Function

ErrorHandler:
    HoltToUnified = "#ERROR: " & Err.Description
End Function
```

### 2.2 Convert Richmond Code to Unified Phases

```vba
' ============================================================================
' Function: RichmondToPhases
' Purpose: Get all unified phases for a Richmond option code
' Parameters:
'   richmondCode - Richmond option code (e.g., "3CARA")
' Returns: Comma-separated list of phases (e.g., "012.000,022.000,042.000,062.000")
' ============================================================================
Public Function RichmondToPhases(richmondCode As String) As String
    Dim xrefRange As Range
    Dim isMultiPhase As Boolean
    Dim phases As String

    On Error GoTo ErrorHandler

    Set xrefRange = Range("RichmondXref")

    ' Check if multi-phase
    isMultiPhase = Application.VLookup(richmondCode, xrefRange, 3, False)

    If isMultiPhase Then
        ' Get multi-phase list (column 5)
        phases = Application.VLookup(richmondCode, xrefRange, 5, False)
    Else
        ' Get single phase (column 4)
        phases = Application.VLookup(richmondCode, xrefRange, 4, False)
    End If

    RichmondToPhases = phases

    Exit Function

ErrorHandler:
    RichmondToPhases = "#RICHMOND_NOT_FOUND"
End Function
```

### 2.3 Build Full Unified Code

```vba
' ============================================================================
' Function: BuildUnifiedCode
' Purpose: Build a complete unified code from components
' Parameters:
'   planCode - 4-digit plan code (e.g., "1670")
'   phaseCode - 3-digit phase (e.g., "020")
'   optionExt - Option extension (e.g., ".001" for ReadyFrame, ".000" for base)
'   elevation - Elevation code (e.g., "A", "AB", "**")
'   itemType - Item type code (e.g., "1000", "1100")
' Returns: Full unified code (e.g., "1670-020.001-AB-1000")
' ============================================================================
Public Function BuildUnifiedCode( _
    planCode As String, _
    phaseCode As String, _
    optionExt As String, _
    elevation As String, _
    itemType As String) As String

    ' Validate inputs
    If Len(planCode) <> 4 Then
        BuildUnifiedCode = "#INVALID_PLAN"
        Exit Function
    End If

    If Len(phaseCode) <> 3 Then
        BuildUnifiedCode = "#INVALID_PHASE"
        Exit Function
    End If

    ' Build the code
    BuildUnifiedCode = planCode & "-" & phaseCode & optionExt & "-" & elevation & "-" & itemType

End Function
```

### 2.4 Parse Unified Code Components

```vba
' ============================================================================
' Function: ParseUnifiedCode
' Purpose: Extract a component from a unified code
' Parameters:
'   unifiedCode - Full unified code (e.g., "1670-020.001-AB-1000")
'   component - Which component to extract:
'               "PLAN" = Plan code
'               "PHASE" = Phase code (without extension)
'               "OPTION" = Option extension
'               "ELEVATION" = Elevation code
'               "ITEMTYPE" = Item type code
' Returns: Extracted component value
' ============================================================================
Public Function ParseUnifiedCode(unifiedCode As String, component As String) As String
    Dim parts() As String
    Dim phaseParts() As String

    On Error GoTo ErrorHandler

    ' Split by dash
    parts = Split(unifiedCode, "-")

    If UBound(parts) < 3 Then
        ParseUnifiedCode = "#INVALID_CODE"
        Exit Function
    End If

    Select Case UCase(component)
        Case "PLAN"
            ParseUnifiedCode = parts(0)

        Case "PHASE"
            ' Phase is before the dot in second part
            phaseParts = Split(parts(1), ".")
            ParseUnifiedCode = phaseParts(0)

        Case "OPTION"
            ' Option extension is after the first dot
            phaseParts = Split(parts(1), ".")
            If UBound(phaseParts) >= 1 Then
                ParseUnifiedCode = "." & phaseParts(1)
            Else
                ParseUnifiedCode = ".000"
            End If

        Case "ELEVATION"
            ParseUnifiedCode = parts(2)

        Case "ITEMTYPE"
            ParseUnifiedCode = parts(3)

        Case Else
            ParseUnifiedCode = "#UNKNOWN_COMPONENT"
    End Select

    Exit Function

ErrorHandler:
    ParseUnifiedCode = "#PARSE_ERROR"
End Function
```

### 2.5 Get Option Suffix Details

```vba
' ============================================================================
' Function: GetOptionSuffix
' Purpose: Get option suffix details from numeric code
' Parameters:
'   suffixCode - Numeric suffix code (e.g., "01", "08")
'   returnField - What to return: "ABBR", "NAME", or "CATEGORY"
' Returns: Requested field value
' ============================================================================
Public Function GetOptionSuffix(suffixCode As String, returnField As String) As String
    Dim xrefRange As Range
    Dim colIndex As Integer

    On Error GoTo ErrorHandler

    Set xrefRange = Range("OptionSuffixes")

    Select Case UCase(returnField)
        Case "ABBR"
            colIndex = 2
        Case "NAME"
            colIndex = 3
        Case "CATEGORY"
            colIndex = 4
        Case Else
            GetOptionSuffix = "#INVALID_FIELD"
            Exit Function
    End Select

    GetOptionSuffix = Application.VLookup(suffixCode, xrefRange, colIndex, False)

    Exit Function

ErrorHandler:
    GetOptionSuffix = "#SUFFIX_NOT_FOUND"
End Function
```

### 2.6 Lookup Item Type Name

```vba
' ============================================================================
' Function: GetItemTypeName
' Purpose: Get the name for an item type code
' Parameters:
'   holtCostCode - Holt cost code (e.g., "4085")
' Returns: Item type name (e.g., "Lumber")
' ============================================================================
Public Function GetItemTypeName(holtCostCode As String) As String
    Dim xrefRange As Range

    On Error GoTo ErrorHandler

    Set xrefRange = Range("ItemTypeXref")
    GetItemTypeName = Application.VLookup(holtCostCode, xrefRange, 2, False)

    Exit Function

ErrorHandler:
    GetItemTypeName = "#ITEM_NOT_FOUND"
End Function
```

---

## 3. Usage Examples

### 3.1 Excel Formula Examples

```excel
' Convert Holt phase to unified code
=HoltToUnified(A2, "1670")
' Result: "1670-010.000-A-1000"

' Get all phases for a Richmond option
=RichmondToPhases("3CARA")
' Result: "012.000,022.000,042.000,062.000"

' Build a unified code manually
=BuildUnifiedCode("1670", "020", ".001", "AB", "1000")
' Result: "1670-020.001-AB-1000"

' Extract plan code from unified code
=ParseUnifiedCode(B2, "PLAN")
' Result: "1670"

' Get option suffix name
=GetOptionSuffix("01", "NAME")
' Result: "ReadyFrame"
```

### 3.2 Batch Conversion Macro

```vba
' ============================================================================
' Sub: ConvertAllHoltCodes
' Purpose: Convert all Holt codes in a column to unified codes
' ============================================================================
Public Sub ConvertAllHoltCodes()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim holtCode As String
    Dim planCode As String
    Dim unifiedCode As String

    Set ws = ActiveSheet
    planCode = InputBox("Enter Plan Code (4 digits):", "Plan Code", "1670")

    If Len(planCode) <> 4 Then
        MsgBox "Invalid plan code. Must be 4 digits.", vbExclamation
        Exit Sub
    End If

    ' Assume Holt codes in column A, output to column B
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    For i = 2 To lastRow ' Skip header
        holtCode = ws.Cells(i, "A").Value
        If Len(holtCode) > 0 Then
            unifiedCode = HoltToUnified(holtCode, planCode)
            ws.Cells(i, "B").Value = unifiedCode
        End If
    Next i

    MsgBox "Conversion complete! " & (lastRow - 1) & " codes converted.", vbInformation
End Sub
```

---

## 4. Workbook Setup

### 4.1 Required Named Ranges

| Name | Location | Description |
|------|----------|-------------|
| HoltPhaseXref | Setup!A2:F100 | Holt to Unified mapping |
| RichmondXref | Setup!H2:L200 | Richmond to Unified mapping |
| ItemTypeXref | Setup!N2:Q20 | Item type mapping |
| OptionSuffixes | Setup!S2:V25 | Option suffix definitions |

### 4.2 Module Import

1. Open the VBA Editor (Alt+F11)
2. Insert > Module
3. Paste all functions from Section 2
4. Save as macro-enabled workbook (.xlsm)

### 4.3 Cross-Reference Data Import

The cross-reference tables can be imported from:
- `backend/prisma/seeds/holtXref.seed.ts` - Extract arrays
- Database export after running seeds
- CSV export from platform

---

## 5. Error Handling

### Error Codes

| Error | Meaning | Resolution |
|-------|---------|------------|
| #HOLT_NOT_FOUND | Holt phase code not in lookup | Add to HoltPhaseXref |
| #RICHMOND_NOT_FOUND | Richmond code not in lookup | Add to RichmondXref |
| #INVALID_PLAN | Plan code not 4 digits | Correct input |
| #INVALID_PHASE | Phase code not 3 digits | Correct input |
| #INVALID_CODE | Unified code malformed | Check format |
| #SUFFIX_NOT_FOUND | Option suffix unknown | Add to OptionSuffixes |
| #ITEM_NOT_FOUND | Item type unknown | Add to ItemTypeXref |

---

## 6. Integration with Platform API

### 6.1 API Endpoints (Future)

```
GET /api/v1/codes/holt/{holtCode}
GET /api/v1/codes/richmond/{richmondCode}
GET /api/v1/codes/unified/{unifiedCode}
POST /api/v1/codes/convert
```

### 6.2 VBA HTTP Request (Future Enhancement)

```vba
' Future: Direct API integration
Public Function APILookupHolt(holtCode As String) As String
    Dim http As Object
    Dim url As String
    Dim response As String

    Set http = CreateObject("MSXML2.XMLHTTP")
    url = "https://api.mindflow.com/api/v1/codes/holt/" & holtCode

    http.Open "GET", url, False
    http.setRequestHeader "Authorization", "Bearer " & GetAPIKey()
    http.Send

    If http.Status = 200 Then
        APILookupHolt = http.responseText
    Else
        APILookupHolt = "#API_ERROR"
    End If
End Function
```

---

## 7. Testing

### Test Cases

| Test | Input | Expected Output |
|------|-------|-----------------|
| Holt Foundation A | HoltToUnified("10100", "1670") | 1670-010.000-A-1000 |
| Holt Siding A | HoltToUnified("11100", "1670") | 1670-060.000-A-1100 |
| Richmond 3-Car | RichmondToPhases("3CARA") | 012.000,022.000,042.000,062.000 |
| Parse Plan | ParseUnifiedCode("1670-020.001-AB-1000", "PLAN") | 1670 |
| Parse Option | ParseUnifiedCode("1670-020.001-AB-1000", "OPTION") | .001 |
| Suffix Name | GetOptionSuffix("01", "NAME") | ReadyFrame |

---

**Document Status**: Complete
**Ready for Implementation**: Yes
