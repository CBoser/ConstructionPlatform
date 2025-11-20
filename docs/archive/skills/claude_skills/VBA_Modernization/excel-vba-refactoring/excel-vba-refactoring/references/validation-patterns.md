# Validation Patterns for Excel VBA

Common validation patterns for enforcing business rules and data integrity.

## Core Validation Principles

1. **Validate Early**: Check data before committing changes
2. **Fail Fast**: Stop processing on first critical error
3. **Clear Messages**: Tell users exactly what's wrong and how to fix it
4. **Centralize Rules**: Keep validation logic in one module
5. **Log Validation**: Track validation failures for debugging

## Pattern 1: Required Field Validation

Ensure critical fields are not empty:

```vba
Public Function ValidateRequiredFields(jobID As String, packName As String, _
                                      customer As String, _
                                      ByRef errorMsg As String) As Boolean
    If Trim(jobID) = "" Then
        errorMsg = "Job ID is required"
        ValidateRequiredFields = False
        Exit Function
    End If
    
    If Trim(packName) = "" Then
        errorMsg = "Pack Name is required"
        ValidateRequiredFields = False
        Exit Function
    End If
    
    If Trim(customer) = "" Then
        errorMsg = "Customer is required"
        ValidateRequiredFields = False
        Exit Function
    End If
    
    ValidateRequiredFields = True
End Function
```

## Pattern 2: Conditional Required Fields

Fields required based on other field values:

```vba
Public Function ValidateScheduledHasOrderNumber(status As String, orderNumber As String, _
                                               ByRef errorMsg As String) As Boolean
    ' Order number required if status is Scheduled
    If status = "Scheduled" Then
        If Trim(orderNumber) = "" Then
            errorMsg = "Order Number is required when Status is Scheduled"
            ValidateScheduledHasOrderNumber = False
            Exit Function
        End If
    End If
    
    ValidateScheduledHasOrderNumber = True
End Function
```

## Pattern 3: Date Validation

Ensure dates are valid and logical:

```vba
Public Function ValidateDeliveryDate(deliveryDate As Variant, _
                                    ByRef errorMsg As String) As Boolean
    ' Check if date is valid
    If Not IsDate(deliveryDate) Then
        errorMsg = "Invalid delivery date format"
        ValidateDeliveryDate = False
        Exit Function
    End If
    
    ' Check if date is not in the past
    If CDate(deliveryDate) < Date Then
        errorMsg = "Delivery date cannot be in the past"
        ValidateDeliveryDate = False
        Exit Function
    End If
    
    ' Check if date is not too far in future (e.g., 2 years)
    If CDate(deliveryDate) > DateAdd("yyyy", 2, Date) Then
        errorMsg = "Delivery date cannot be more than 2 years in the future"
        ValidateDeliveryDate = False
        Exit Function
    End If
    
    ValidateDeliveryDate = True
End Function
```

## Pattern 4: Format Validation

Validate data matches expected format:

```vba
Public Function ValidateJobIDFormat(jobID As String, ByRef errorMsg As String) As Boolean
    ' Job ID should be format: CUST-####
    ' Example: ACME-1234
    
    Dim pattern As String
    Dim regex As Object
    
    pattern = "^[A-Z]{3,6}-[0-9]{4}$"
    
    Set regex = CreateObject("VBScript.RegExp")
    regex.pattern = pattern
    regex.IgnoreCase = False
    
    If Not regex.Test(jobID) Then
        errorMsg = "Job ID must be in format: CUST-####" & vbNewLine & _
                  "Example: ACME-1234"
        ValidateJobIDFormat = False
        Exit Function
    End If
    
    ValidateJobIDFormat = True
End Function

Public Function ValidatePhoneNumber(phone As String, ByRef errorMsg As String) As Boolean
    ' Simple North American phone validation
    Dim digits As String
    Dim i As Long
    
    ' Extract only digits
    For i = 1 To Len(phone)
        If IsNumeric(Mid(phone, i, 1)) Then
            digits = digits & Mid(phone, i, 1)
        End If
    Next i
    
    ' Should have 10 digits
    If Len(digits) <> 10 Then
        errorMsg = "Phone number must have 10 digits"
        ValidatePhoneNumber = False
        Exit Function
    End If
    
    ValidatePhoneNumber = True
End Function
```

## Pattern 5: Range Validation

Ensure numeric values are within acceptable range:

```vba
Public Function ValidateQuantity(quantity As Variant, _
                                minQty As Long, maxQty As Long, _
                                ByRef errorMsg As String) As Boolean
    If Not IsNumeric(quantity) Then
        errorMsg = "Quantity must be a number"
        ValidateQuantity = False
        Exit Function
    End If
    
    If CLng(quantity) < minQty Then
        errorMsg = "Quantity must be at least " & minQty
        ValidateQuantity = False
        Exit Function
    End If
    
    If CLng(quantity) > maxQty Then
        errorMsg = "Quantity cannot exceed " & maxQty
        ValidateQuantity = False
        Exit Function
    End If
    
    ValidateQuantity = True
End Function
```

## Pattern 6: Reference Data Validation

Validate against lookup tables:

```vba
Public Function ValidateCustomerExists(customerName As String, _
                                      ByRef errorMsg As String) As Boolean
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim found As Boolean
    
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    found = False
    For i = 2 To lastRow
        If UCase(Trim(ws.Cells(i, 1).Value)) = UCase(Trim(customerName)) Then
            found = True
            Exit For
        End If
    Next i
    
    If Not found Then
        errorMsg = "Customer '" & customerName & "' not found in database." & vbNewLine & _
                  "Please add customer before creating job."
        ValidateCustomerExists = False
        Exit Function
    End If
    
    ValidateCustomerExists = True
End Function
```

## Pattern 7: Duplicate Detection

Prevent duplicate entries:

```vba
Public Function ValidateNoDuplicate(ws As Worksheet, jobID As String, packName As String, _
                                   currentRow As Long, ByRef errorMsg As String) As Boolean
    Dim lastRow As Long, i As Long
    Dim checkJobID As String, checkPackName As String
    
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    For i = 2 To lastRow
        If i <> currentRow Then  ' Don't compare to self
            checkJobID = Trim(CStr(ws.Cells(i, 1).Value))
            checkPackName = Trim(CStr(ws.Cells(i, 2).Value))
            
            If UCase(checkJobID) = UCase(jobID) And _
               UCase(checkPackName) = UCase(packName) Then
                errorMsg = "Duplicate entry found: Job " & jobID & " - Pack " & packName & _
                          " already exists at row " & i
                ValidateNoDuplicate = False
                Exit Function
            End If
        End If
    Next i
    
    ValidateNoDuplicate = True
End Function
```

## Pattern 8: Business Rule Validation

Complex business logic validation:

```vba
Public Function ValidateStatusTransition(currentStatus As String, newStatus As String, _
                                        ByRef errorMsg As String) As Boolean
    ' Define allowed status transitions
    ' Not Done -> Ready to Write -> Scheduled -> Shipped/Done
    
    Select Case currentStatus
        Case "Not Done"
            ' Can go to any status
            ValidateStatusTransition = True
            
        Case "Ready to Write"
            ' Can go forward or back to Not Done
            If newStatus = "Scheduled" Or newStatus = "Not Done" Then
                ValidateStatusTransition = True
            Else
                errorMsg = "Cannot change from 'Ready to Write' to '" & newStatus & "'" & vbNewLine & _
                          "Allowed: Scheduled, Not Done"
                ValidateStatusTransition = False
            End If
            
        Case "Scheduled"
            ' Can only go forward to Shipped or back one step
            If newStatus = "Shipped/Done" Or newStatus = "Ready to Write" Then
                ValidateStatusTransition = True
            Else
                errorMsg = "Cannot change from 'Scheduled' to '" & newStatus & "'" & vbNewLine & _
                          "Allowed: Shipped/Done, Ready to Write"
                ValidateStatusTransition = False
            End If
            
        Case "Shipped/Done"
            ' Cannot move backwards from completed
            errorMsg = "Cannot change status of completed job." & vbNewLine & _
                      "Move to Archive instead."
            ValidateStatusTransition = False
            
        Case Else
            ValidateStatusTransition = True
    End Select
End Function
```

## Pattern 9: Batch Validation

Validate multiple records at once:

```vba
Public Function ValidateBatch(ws As Worksheet, startRow As Long, endRow As Long, _
                              ByRef errors() As String) As Boolean
    Dim i As Long, errorCount As Long
    Dim tempError As String
    
    ReDim errors(1 To endRow - startRow + 1)
    errorCount = 0
    
    For i = startRow To endRow
        If Not IsEmpty(ws.Cells(i, 1).Value) Then
            ' Run all validations
            If Not ValidateRequiredFields(ws.Cells(i, 1), ws.Cells(i, 2), _
                                         ws.Cells(i, 6), tempError) Then
                errorCount = errorCount + 1
                errors(errorCount) = "Row " & i & ": " & tempError
            End If
            
            ' Add more validations as needed
        End If
    Next i
    
    If errorCount > 0 Then
        ReDim Preserve errors(1 To errorCount)
        ValidateBatch = False
    Else
        ValidateBatch = True
    End If
End Function
```

## Pattern 10: Validation Framework

Central validation coordinator:

```vba
'====================================================================
' MODULE: mod_Validation
' Central validation system
'====================================================================
Option Explicit

' Validation result type
Public Type ValidationResult
    IsValid As Boolean
    ErrorCount As Long
    Errors() As String
    Warnings() As String
End Type

Public Function ValidateJobEntry(jobID As String, packName As String, _
                                 deliveryDate As Variant, status As String, _
                                 orderNumber As String, customer As String) As ValidationResult
    Dim result As ValidationResult
    Dim tempError As String
    Dim errorCount As Long, warningCount As Long
    
    ReDim result.Errors(1 To 10)
    ReDim result.Warnings(1 To 10)
    errorCount = 0
    warningCount = 0
    result.IsValid = True
    
    ' Run all validations
    If Not ValidateRequiredFields(jobID, packName, customer, tempError) Then
        errorCount = errorCount + 1
        result.Errors(errorCount) = tempError
        result.IsValid = False
    End If
    
    If Not ValidateDeliveryDate(deliveryDate, tempError) Then
        errorCount = errorCount + 1
        result.Errors(errorCount) = tempError
        result.IsValid = False
    End If
    
    If Not ValidateScheduledHasOrderNumber(status, orderNumber, tempError) Then
        errorCount = errorCount + 1
        result.Errors(errorCount) = tempError
        result.IsValid = False
    End If
    
    If Not ValidateCustomerExists(customer, tempError) Then
        warningCount = warningCount + 1
        result.Warnings(warningCount) = tempError
        ' This is a warning, not an error, so don't set IsValid = False
    End If
    
    ' Resize arrays to actual counts
    If errorCount > 0 Then
        ReDim Preserve result.Errors(1 To errorCount)
    Else
        ReDim result.Errors(0)
    End If
    
    If warningCount > 0 Then
        ReDim Preserve result.Warnings(1 To warningCount)
    Else
        ReDim result.Warnings(0)
    End If
    
    result.ErrorCount = errorCount
    
    ValidateJobEntry = result
End Function

' Show validation results to user
Public Sub ShowValidationResults(result As ValidationResult)
    Dim msg As String
    Dim i As Long
    
    If result.IsValid Then
        msg = "✓ Validation passed"
        
        If UBound(result.Warnings) > 0 Then
            msg = msg & vbNewLine & vbNewLine & "Warnings:" & vbNewLine
            For i = 1 To UBound(result.Warnings)
                msg = msg & "• " & result.Warnings(i) & vbNewLine
            Next i
        End If
        
        MsgBox msg, vbInformation, "Validation Complete"
    Else
        msg = "✗ Validation failed with " & result.ErrorCount & " error(s):" & vbNewLine & vbNewLine
        
        For i = 1 To UBound(result.Errors)
            msg = msg & i & ". " & result.Errors(i) & vbNewLine
        Next i
        
        If UBound(result.Warnings) > 0 Then
            msg = msg & vbNewLine & "Warnings:" & vbNewLine
            For i = 1 To UBound(result.Warnings)
                msg = msg & "• " & result.Warnings(i) & vbNewLine
            Next i
        End If
        
        MsgBox msg, vbCritical, "Validation Failed"
    End If
End Sub
```

## Usage Example

```vba
Sub CreateNewJob()
    Dim result As ValidationResult
    
    ' Get data from user form
    Dim jobID As String, packName As String, customer As String
    jobID = txtJobID.Value
    packName = txtPackName.Value
    customer = txtCustomer.Value
    ' ... etc
    
    ' Validate
    result = ValidateJobEntry(jobID, packName, txtDeliveryDate.Value, _
                             cboStatus.Value, txtOrderNumber.Value, customer)
    
    ' Show results
    ShowValidationResults result
    
    ' Only proceed if valid
    If result.IsValid Then
        ' Create the job
        ' ...
    End If
End Sub
```

## Best Practices

1. **Validate at Entry Point**: Check data when user enters it, not when saving
2. **Provide Context**: Tell users which field failed and why
3. **Suggest Solutions**: Include helpful guidance in error messages
4. **Don't Over-Validate**: Balance safety with usability
5. **Log Validation Failures**: Track patterns for system improvement
6. **Use Type Definitions**: Create custom types for complex validation results
7. **Separate Warnings from Errors**: Allow warnings but block errors
8. **Test Edge Cases**: Validate with boundary values and invalid data

## Testing Validation

```vba
Sub TestValidation()
    Dim result As ValidationResult
    
    ' Test Case 1: All valid
    result = ValidateJobEntry("ACME-1234", "Pack A", Date + 7, _
                             "Not Done", "", "ACME Corp")
    Debug.Assert result.IsValid = True
    
    ' Test Case 2: Missing required field
    result = ValidateJobEntry("", "Pack A", Date + 7, "Not Done", "", "ACME Corp")
    Debug.Assert result.IsValid = False
    Debug.Assert result.ErrorCount = 1
    
    ' Test Case 3: Scheduled without order number
    result = ValidateJobEntry("ACME-1234", "Pack A", Date + 7, _
                             "Scheduled", "", "ACME Corp")
    Debug.Assert result.IsValid = False
    
    ' Test Case 4: Date in past
    result = ValidateJobEntry("ACME-1234", "Pack A", Date - 7, _
                             "Not Done", "", "ACME Corp")
    Debug.Assert result.IsValid = False
    
    MsgBox "All validation tests passed!", vbInformation
End Sub
```
