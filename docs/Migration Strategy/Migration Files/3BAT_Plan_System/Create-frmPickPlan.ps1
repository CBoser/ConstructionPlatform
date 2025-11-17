param(
  [string]$WorkbookPath = 'C:\Users\corey.boser\Documents\HOLT BAT OCTOBER 2025 9-29-25 Updated 10-12-25 v1.xlsm'
)

# VBIDE component type constants
$vbext_ct_StdModule = 1
$vbext_ct_MSForm   = 3

function Release-ComObject {
  param([object]$obj)
  if ($null -ne $obj -and $obj -is [System.__ComObject]) {
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj)
  }
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
  throw "Workbook not found: $WorkbookPath"
}

$excel   = $null
$wb      = $null
$vbproj  = $null
$formComp= $null
$designer= $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $wb = $excel.Workbooks.Open($WorkbookPath)

  # Access VBProject (requires Excel option: Trust access to the VBA project object model)
  try {
    $vbproj = $wb.VBProject
  } catch {
    throw "Cannot access VBProject. In Excel: File > Options > Trust Center > Trust Center Settings > Macro Settings > enable 'Trust access to the VBA project object model'. Close Excel and run again."
  }

  # Find existing frmPickPlan
  foreach ($c in @($vbproj.VBComponents)) {
    if ($c.Type -eq $vbext_ct_MSForm -and $c.Name -eq 'frmPickPlan') { $formComp = $c; break }
  }

  if ($null -eq $formComp) {
    $formComp = $vbproj.VBComponents.Add($vbext_ct_MSForm)
    $formComp.Name = 'frmPickPlan'
  }

  # Get the designer surface
  try {
    $designer = $formComp.Designer
  } catch {
    throw "Could not access form designer. Make sure Excel is installed with VBA and MSForms, and that macros are enabled."
  }

  # Clear existing controls (ignore errors on locked built-ins)
  try {
    $toRemove = @()
    foreach ($ctl in @($designer.Controls)) { $toRemove += $ctl.Name }
    foreach ($nm in $toRemove) { $designer.Controls.Remove($nm) }
  } catch { }

  # Add controls
  $lblPlan = $designer.Controls.Add("Forms.Label.1","lblPlan",$true)
  $lblPlan.Caption = "Plan:"
  $lblPlan.Left = 12
  $lblPlan.Top  = 18
  $lblPlan.Width = 50

  $cbo = $designer.Controls.Add("Forms.ComboBox.1","cboPlan",$true)
  $cbo.Left  = 70
  $cbo.Top   = 14
  $cbo.Width = 300
  $cbo.Height = 18
  $cbo.Style = 2  # fmStyleDropDownList

  $btnOK = $designer.Controls.Add("Forms.CommandButton.1","cmdOK",$true)
  $btnOK.Caption = "OK"
  $btnOK.Left = 200
  $btnOK.Top  = 70
  $btnOK.Width = 80
  $btnOK.Height = 24

  $btnCancel = $designer.Controls.Add("Forms.CommandButton.1","cmdCancel",$true)
  $btnCancel.Caption = "Cancel"
  $btnCancel.Left = 290
  $btnCancel.Top  = 70
  $btnCancel.Width = 80
  $btnCancel.Height = 24

  # Inject code-behind
$code = @'
Option Explicit

Public SelectedTableName As String

' plans: 1-based 2D array -> [row,1]=Model (shown), [row,2]=Plan Sheet (shown), [row,3]=Resolved TableName (hidden)
Public Sub LoadPlans(plans As Variant)
    With cboPlan
        .Clear
        .ColumnCount = 3
        .BoundColumn = 3                     ' return TableName
        .ColumnWidths = "220 pt;100 pt;0 pt" ' show Model + Plan Sheet, hide TableName
        Dim r As Long
        For r = 1 To UBound(plans, 1)
            .AddItem plans(r, 1)                              ' Model
            .List(.ListCount - 1, 1) = NzStr(plans(r, 2))     ' Plan Sheet
            .List(.ListCount - 1, 2) = NzStr(plans(r, 3))     ' TableName (hidden)
        Next r
        If .ListCount > 0 Then .ListIndex = 0
    End With
End Sub

Private Sub cmdOK_Click()
    If cboPlan.ListIndex >= 0 And Len(Trim$(NzStr(cboPlan.Value))) > 0 Then
        SelectedTableName = CStr(cboPlan.Value) ' BoundColumn=3 -> table name
        Me.Hide
    Else
        MsgBox "Please pick a plan.", vbExclamation
    End If
End Sub

Private Sub cmdCancel_Click()
    SelectedTableName = ""
    Me.Hide
End Sub

Private Function NzStr(v As Variant) As String
    If IsError(v) Or IsEmpty(v) Or IsNull(v) Then
        NzStr = ""
    Else
        NzStr = CStr(v)
    End If
End Function
'@

  $cm = $formComp.CodeModule
  if ($cm.CountOfLines -gt 0) { $cm.DeleteLines(1, $cm.CountOfLines) }
  $cm.AddFromString($code)

  $wb.Save()
  Write-Host "UserForm frmPickPlan created or updated in:"
  Write-Host "  $WorkbookPath"

} catch {
  Write-Error ("ERROR: " + $_.Exception.Message)
} finally {
  try { if ($wb) { $wb.Close($true) | Out-Null } } catch {}
  try { if ($excel) { $excel.Quit() | Out-Null } } catch {}
  Release-ComObject $designer
  Release-ComObject $formComp
  Release-ComObject $vbproj
  Release-ComObject $wb
  Release-ComObject $excel
}
