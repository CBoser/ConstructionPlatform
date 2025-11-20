# Database Design Patterns for Excel VBA

Patterns for creating normalized database structures within Excel workbooks.

## Why Use Database Patterns in Excel?

### Problems with Redundant Data
- Inconsistent data entry (e.g., "ACME Corp" vs "Acme Corporation")
- Maintenance overhead when customer info changes
- Data integrity issues
- Bloated file size
- Difficult reporting and analysis

### Benefits of Normalized Structure
- Single source of truth for reference data
- Consistent data across all sheets
- Easy to update (change in one place)
- Data validation via dropdowns
- Professional data management

## Pattern 1: Customer Database

Create a centralized customer database:

```vba
'====================================================================
' Initialize Customer Database Sheet
'====================================================================
Sub InitializeCustomerDatabase()
    Dim ws As Worksheet
    
    ' Create or get customer sheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add
        ws.Name = "Customer Database"
    Else
        ws.Cells.Clear
    End If
    
    ' Setup headers
    With ws
        .Cells(1, 1).Value = "Customer ID"
        .Cells(1, 2).Value = "Customer Name"
        .Cells(1, 3).Value = "Contact Person"
        .Cells(1, 4).Value = "Email"
        .Cells(1, 5).Value = "Phone"
        .Cells(1, 6).Value = "Address"
        .Cells(1, 7).Value = "City"
        .Cells(1, 8).Value = "State"
        .Cells(1, 9).Value = "ZIP"
        .Cells(1, 10).Value = "Active"
        .Cells(1, 11).Value = "Notes"
        .Cells(1, 12).Value = "Created Date"
        
        ' Format headers
        With .Range("A1:L1")
            .Font.Bold = True
            .Interior.Color = RGB(0, 112, 192)
            .Font.Color = RGB(255, 255, 255)
            .HorizontalAlignment = xlCenter
        End With
        
        ' Set column widths
        .Columns("A:A").ColumnWidth = 12  ' Customer ID
        .Columns("B:B").ColumnWidth = 25  ' Customer Name
        .Columns("C:C").ColumnWidth = 20  ' Contact
        .Columns("D:D").ColumnWidth = 25  ' Email
        .Columns("E:E").ColumnWidth = 15  ' Phone
        .Columns("F:F").ColumnWidth = 30  ' Address
        .Columns("G:G").ColumnWidth = 15  ' City
        .Columns("H:H").ColumnWidth = 8   ' State
        .Columns("I:I").ColumnWidth = 10  ' ZIP
        .Columns("J:J").ColumnWidth = 10  ' Active
        .Columns("K:K").ColumnWidth = 40  ' Notes
        .Columns("L:L").ColumnWidth = 15  ' Created Date
        
        ' Freeze header row
        .Rows(2).Select
        ActiveWindow.FreezePanes = True
        .Cells(1, 1).Select
    End With
    
    MsgBox "Customer Database initialized!", vbInformation
End Sub
```

### Adding Customer with Auto-ID

```vba
Public Function AddCustomer(customerName As String, contactPerson As String, _
                           email As String, phone As String, address As String, _
                           city As String, state As String, zip As String, _
                           notes As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim newID As String
    
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    ' Generate next customer ID
    If lastRow = 1 Then
        newID = "CUST001"
    Else
        Dim lastID As String
        Dim lastNum As Long
        lastID = ws.Cells(lastRow, 1).Value
        lastNum = CLng(Right(lastID, 3))
        newID = "CUST" & Format(lastNum + 1, "000")
    End If
    
    ' Add new customer
    With ws
        .Cells(lastRow + 1, 1).Value = newID
        .Cells(lastRow + 1, 2).Value = customerName
        .Cells(lastRow + 1, 3).Value = contactPerson
        .Cells(lastRow + 1, 4).Value = email
        .Cells(lastRow + 1, 5).Value = phone
        .Cells(lastRow + 1, 6).Value = address
        .Cells(lastRow + 1, 7).Value = city
        .Cells(lastRow + 1, 8).Value = state
        .Cells(lastRow + 1, 9).Value = zip
        .Cells(lastRow + 1, 10).Value = "Yes"
        .Cells(lastRow + 1, 11).Value = notes
        .Cells(lastRow + 1, 12).Value = Date
    End With
    
    AddCustomer = newID
End Function
```

### Customer Lookup Functions

```vba
Public Function GetCustomerName(customerID As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    For i = 2 To lastRow
        If ws.Cells(i, 1).Value = customerID Then
            GetCustomerName = ws.Cells(i, 2).Value
            Exit Function
        End If
    Next i
    
    GetCustomerName = "#NOT FOUND#"
End Function

Public Function GetCustomerIDFromName(customerName As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    For i = 2 To lastRow
        If UCase(Trim(ws.Cells(i, 2).Value)) = UCase(Trim(customerName)) Then
            GetCustomerIDFromName = ws.Cells(i, 1).Value
            Exit Function
        End If
    Next i
    
    GetCustomerIDFromName = ""
End Function

Public Function GetCustomerDropdownList() As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim customerList As String
    
    Set ws = ThisWorkbook.Worksheets("Customer Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    For i = 2 To lastRow
        If ws.Cells(i, 10).Value = "Yes" Then  ' Active customers only
            If customerList = "" Then
                customerList = ws.Cells(i, 2).Value
            Else
                customerList = customerList & "," & ws.Cells(i, 2).Value
            End If
        End If
    Next i
    
    GetCustomerDropdownList = customerList
End Function
```

## Pattern 2: Community/Subdivision Database

```vba
Sub InitializeCommunityDatabase()
    Dim ws As Worksheet
    
    Set ws = CreateOrGetSheet("Community Database")
    ws.Cells.Clear
    
    ' Headers
    With ws
        .Cells(1, 1).Value = "Community ID"
        .Cells(1, 2).Value = "Community Name"
        .Cells(1, 3).Value = "Customer ID"
        .Cells(1, 4).Value = "Customer Name"
        .Cells(1, 5).Value = "City"
        .Cells(1, 6).Value = "State"
        .Cells(1, 7).Value = "ZIP"
        .Cells(1, 8).Value = "Active"
        .Cells(1, 9).Value = "Notes"
        
        ' Format
        With .Range("A1:I1")
            .Font.Bold = True
            .Interior.Color = RGB(0, 112, 192)
            .Font.Color = RGB(255, 255, 255)
        End With
    End With
End Sub

Public Function AddCommunity(communityName As String, customerID As String, _
                            city As String, state As String, zip As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim newID As String
    Dim customerName As String
    
    Set ws = ThisWorkbook.Worksheets("Community Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    ' Generate ID
    If lastRow = 1 Then
        newID = "COMM001"
    Else
        Dim lastNum As Long
        lastNum = CLng(Right(ws.Cells(lastRow, 1).Value, 3))
        newID = "COMM" & Format(lastNum + 1, "000")
    End If
    
    ' Get customer name
    customerName = GetCustomerName(customerID)
    
    ' Add community
    With ws
        .Cells(lastRow + 1, 1).Value = newID
        .Cells(lastRow + 1, 2).Value = communityName
        .Cells(lastRow + 1, 3).Value = customerID
        .Cells(lastRow + 1, 4).Value = customerName
        .Cells(lastRow + 1, 5).Value = city
        .Cells(lastRow + 1, 6).Value = state
        .Cells(lastRow + 1, 7).Value = zip
        .Cells(lastRow + 1, 8).Value = "Yes"
    End With
    
    AddCommunity = newID
End Function

Public Function GetCommunitiesByCustomer(customerID As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim commList As String
    
    Set ws = ThisWorkbook.Worksheets("Community Database")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    For i = 2 To lastRow
        If ws.Cells(i, 3).Value = customerID And ws.Cells(i, 8).Value = "Yes" Then
            If commList = "" Then
                commList = ws.Cells(i, 2).Value
            Else
                commList = commList & "," & ws.Cells(i, 2).Value
            End If
        End If
    Next i
    
    GetCommunitiesByCustomer = commList
End Function
```

## Pattern 3: Plan/Template Database

```vba
Sub InitializePlanDatabase()
    Dim ws As Worksheet
    
    Set ws = CreateOrGetSheet("Plan Database")
    ws.Cells.Clear
    
    ' Headers
    With ws
        .Cells(1, 1).Value = "Plan ID"
        .Cells(1, 2).Value = "Plan Name"
        .Cells(1, 3).Value = "Category"
        .Cells(1, 4).Value = "Description"
        .Cells(1, 5).Value = "Default Quantity"
        .Cells(1, 6).Value = "Unit Price"
        .Cells(1, 7).Value = "Lead Time (Days)"
        .Cells(1, 8).Value = "Active"
        
        ' Format
        With .Range("A1:H1")
            .Font.Bold = True
            .Interior.Color = RGB(0, 112, 192)
            .Font.Color = RGB(255, 255, 255)
        End With
    End With
End Sub
```

## Pattern 4: Linking Data with Foreign Keys

### Job Table with Foreign Keys

```vba
Sub InitializeJobsTable()
    Dim ws As Worksheet
    
    Set ws = CreateOrGetSheet("Jobs")
    ws.Cells.Clear
    
    ' Headers with foreign key relationships
    With ws
        .Cells(1, 1).Value = "Job ID"
        .Cells(1, 2).Value = "Pack Name"
        .Cells(1, 3).Value = "Customer ID"        ' FK to Customer Database
        .Cells(1, 4).Value = "Customer Name"      ' Denormalized for display
        .Cells(1, 5).Value = "Community ID"       ' FK to Community Database
        .Cells(1, 6).Value = "Community Name"     ' Denormalized for display
        .Cells(1, 7).Value = "Plan ID"            ' FK to Plan Database
        .Cells(1, 8).Value = "Delivery Date"
        .Cells(1, 9).Value = "Status"
        .Cells(1, 10).Value = "Order Number"
        .Cells(1, 11).Value = "Lot Number"
    End With
End Sub
```

### Cascading Dropdowns

```vba
' When customer changes, update communities dropdown
Sub UpdateCommunitiesDropdown(targetCell As Range, customerID As String)
    Dim commList As String
    commList = GetCommunitiesByCustomer(customerID)
    
    ' Clear existing community selection
    targetCell.Offset(0, 2).Value = ""
    
    ' Update dropdown validation
    With targetCell.Offset(0, 2).Validation
        .Delete
        If commList <> "" Then
            .Add Type:=xlValidateList, _
                 AlertStyle:=xlValidAlert, _
                 Formula1:=commList
        End If
    End With
End Sub
```

## Pattern 5: Data Entry Form with Database Integration

```vba
Sub ShowNewJobForm()
    ' Assume UserForm named frmNewJob exists
    
    ' Load customers into dropdown
    frmNewJob.cboCustomer.List = Split(GetCustomerDropdownList(), ",")
    
    ' Show form
    frmNewJob.Show
End Sub

' In UserForm code:
Private Sub cboCustomer_Change()
    ' Update communities based on selected customer
    Dim customerID As String
    customerID = GetCustomerIDFromName(cboCustomer.Value)
    
    If customerID <> "" Then
        cboCommunity.List = Split(GetCommunitiesByCustomer(customerID), ",")
        cboCommunity.Enabled = True
    Else
        cboCommunity.Clear
        cboCommunity.Enabled = False
    End If
End Sub

Private Sub btnSave_Click()
    ' Create new job with database references
    Dim customerID As String, communityID As String
    
    customerID = GetCustomerIDFromName(cboCustomer.Value)
    communityID = GetCommunityIDFromName(cboCommunity.Value)
    
    ' Save job with FKs
    Call AddJob(txtJobID.Value, txtPackName.Value, customerID, communityID, _
               dtpDeliveryDate.Value, cboStatus.Value)
End Sub
```

## Pattern 6: Referential Integrity

```vba
' Prevent deletion of customer with active jobs
Public Function CanDeleteCustomer(customerID As String, ByRef reason As String) As Boolean
    Dim ws As Worksheet
    Dim lastRow As Long, i As Long
    Dim activeJobs As Long
    
    Set ws = ThisWorkbook.Worksheets("Jobs")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    
    activeJobs = 0
    For i = 2 To lastRow
        If ws.Cells(i, 3).Value = customerID Then
            If ws.Cells(i, 9).Value <> "Shipped/Done" Then
                activeJobs = activeJobs + 1
            End If
        End If
    Next i
    
    If activeJobs > 0 Then
        reason = "Cannot delete customer with " & activeJobs & " active job(s)." & vbNewLine & _
                "Complete or archive jobs first."
        CanDeleteCustomer = False
    Else
        CanDeleteCustomer = True
    End If
End Function
```

## Pattern 7: Audit Trail

```vba
Sub InitializeAuditTrail()
    Dim ws As Worksheet
    
    Set ws = CreateOrGetSheet("Audit Trail")
    ws.Visible = xlSheetVeryHidden
    ws.Cells.Clear
    
    With ws
        .Cells(1, 1).Value = "Timestamp"
        .Cells(1, 2).Value = "User"
        .Cells(1, 3).Value = "Action"
        .Cells(1, 4).Value = "Table"
        .Cells(1, 5).Value = "Record ID"
        .Cells(1, 6).Value = "Changes"
    End With
End Sub

Public Sub LogDatabaseChange(action As String, tableName As String, _
                            recordID As String, changes As String)
    Dim ws As Worksheet
    Dim lastRow As Long
    
    Set ws = ThisWorkbook.Worksheets("Audit Trail")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    
    With ws
        .Cells(lastRow, 1).Value = Now
        .Cells(lastRow, 2).Value = Environ("USERNAME")
        .Cells(lastRow, 3).Value = action
        .Cells(lastRow, 4).Value = tableName
        .Cells(lastRow, 5).Value = recordID
        .Cells(lastRow, 6).Value = changes
    End With
End Sub

' Usage:
' LogDatabaseChange "INSERT", "Customer Database", newID, "New customer: " & customerName
' LogDatabaseChange "UPDATE", "Jobs", jobID, "Status: Not Done -> Scheduled"
' LogDatabaseChange "DELETE", "Community Database", commID, "Deleted: " & commName
```

## Pattern 8: Database Backup

```vba
Sub BackupDatabases()
    Dim backupSheet As Worksheet
    Dim sourceTables As Variant
    Dim i As Long
    Dim backupName As String
    
    sourceTables = Array("Customer Database", "Community Database", "Plan Database")
    backupName = "DB_Backup_" & Format(Now, "YYYYMMDD_HHNNSS")
    
    ' Create backup workbook
    Dim backupWB As Workbook
    Set backupWB = Workbooks.Add
    
    For i = LBound(sourceTables) To UBound(sourceTables)
        ThisWorkbook.Worksheets(sourceTables(i)).Copy After:=backupWB.Sheets(backupWB.Sheets.Count)
    Next i
    
    ' Delete default sheets
    Application.DisplayAlerts = False
    For i = 1 To 3
        If backupWB.Sheets.Count > UBound(sourceTables) + 1 Then
            backupWB.Sheets(1).Delete
        End If
    Next i
    Application.DisplayAlerts = True
    
    ' Save backup
    backupWB.SaveAs ThisWorkbook.Path & "\" & backupName & ".xlsx"
    backupWB.Close
    
    MsgBox "Database backup created: " & backupName & ".xlsx", vbInformation
End Sub
```

## Best Practices

1. **Use Unique IDs**: Always use auto-generated unique IDs, not names
2. **Denormalize for Display**: Store both ID and name for user convenience
3. **Enforce Referential Integrity**: Check FK constraints before deletes
4. **Log Changes**: Maintain audit trail for important tables
5. **Regular Backups**: Automate database backups
6. **Data Validation**: Use dropdowns linked to database tables
7. **Cascading Updates**: Update related records when master data changes
8. **Hide Technical Sheets**: Keep database sheets hidden from users
9. **Document Relationships**: Comment your foreign key relationships
10. **Test Thoroughly**: Verify FK relationships and cascading behavior
