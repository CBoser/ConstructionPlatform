# QUICK START - VBA PLAN INTAKE SETUP

## Your File Locations
- **Template File**: `C:\Users\corey.boser\Documents\3BAT_Plan_System\HOLT BAT OCTOBER 2025 9-29-25 Updated.xlsm`
- **Working Folder**: `C:\Users\corey.boser\Documents\3BAT_Plan_System`
- **New BATs will be created**: In the same folder with format: `[PlanCode]_[Date]_BAT.xlsm`

---

## Step 1: Open Your Template (5 minutes)

1. Open `HOLT BAT OCTOBER 2025 9-29-25 Updated.xlsm`
2. Press `ALT + F11` to open VBA Editor
3. If you see a security warning, click **Enable Content**

---

## Step 2: Import the Module (2 minutes)

1. In VBA Editor, go to **File → Import File**
2. Browse to where you saved `modPlanIntake.bas`
3. Click **Open**
4. You should see "modPlanIntake" appear in the Modules folder on the left

---

## Step 3: Create Named Ranges (10 minutes)

### Option A: Automated Setup (RECOMMENDED)

1. In VBA Editor, go to **Insert → Module**
2. Copy and paste this code:

```vba
Sub SetupPlanOverviewSheet()
    Dim ws As Worksheet
    
    ' Check if sheet exists, create if not
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Plan Overview")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        ws.Name = "Plan Overview"
    End If
    
    With ws
        ' Set column widths
        .Columns("A:A").ColumnWidth = 25
        .Columns("B:B").ColumnWidth = 50
        
        ' Create labels and named ranges
        .Range("A1").Value = "PLAN OVERVIEW"
        .Range("A2").Value = "Builder:"
        .Range("A3").Value = "Plan Code:"
        .Range("A4").Value = "Plan Name:"
        .Range("A5").Value = "Model Display:"
        .Range("A6").Value = "Created On:"
        .Range("A8").Value = "Elevations:"
        .Range("A9").Value = "Garage:"
        .Range("A10").Value = "Living Area Total:"
        .Range("A11").Value = "Living Area Main:"
        .Range("A12").Value = "Living Area Upper:"
        .Range("A13").Value = "Garage Area:"
        .Range("A14").Value = "Stories:"
        .Range("A15").Value = "Subfloor L1:"
        .Range("A16").Value = "Subfloor L2:"
        .Range("A17").Value = "Wall Height L1:"
        .Range("A18").Value = "Wall Height L2:"
        .Range("A19").Value = "Roof Load:"
        .Range("A20").Value = "Siding:"
        .Range("A21").Value = "RF Required:"
        .Range("A22").Value = "Notes:"
        
        ' Create named ranges
        .Range("B2").Name = "builder_name"
        .Range("B3").Name = "plan_code"
        .Range("B4").Name = "plan_name"
        .Range("B5").Name = "model_display"
        .Range("B6").Name = "created_on"
        .Range("B8").Name = "elevations"
        .Range("B9").Name = "garage"
        .Range("B10").Name = "living_area_total"
        .Range("B11").Name = "living_area_main"
        .Range("B12").Name = "living_area_upper"
        .Range("B13").Name = "garage_area"
        .Range("B14").Name = "stories"
        .Range("B15").Name = "subfloor_L1"
        .Range("B16").Name = "subfloor_L2"
        .Range("B17").Name = "wall_h_L1"
        .Range("B18").Name = "wall_h_L2"
        .Range("B19").Name = "roof_load"
        .Range("B20").Name = "siding"
        .Range("B21").Name = "rf_required"
        .Range("B22").Name = "notes"
        
        ' Set default values
        .Range("B2").Value = "Holt Homes"
        .Range("B21").Value = "No"
    End With
    
    MsgBox "Plan Overview sheet created with all named ranges!", vbInformation
End Sub
```

3. Press `F5` to run this macro (or click Run button)
4. You should see "Plan Overview sheet created with all named ranges!"
5. Delete this temporary module

### Option B: Manual Setup

If automated doesn't work, see the WORKSHEET_TEMPLATE_GUIDE.md file for manual steps.

---

## Step 4: Test the Module (2 minutes)

1. In VBA Editor, press `CTRL + G` to open Immediate Window
2. Type this and press Enter:
   ```
   modPlanIntake.ShowPlanIntakeForm
   ```
3. You should see an error because we haven't created the form yet - that's OK!

---

## Step 5: Create the UserForm (15 minutes)

1. In VBA Editor, go to **Insert → UserForm**
2. In Properties window (press F4 if not visible):
   - Set **Name** to: `frmPlanIntake`
   - Set **Caption** to: `Holt Homes - Plan Intake`
   - Set **Width** to: `600`
   - Set **Height** to: `500`

3. **Add Controls** (from Toolbox):

### Text Boxes (Add these labels and textboxes):
```
Label: "Plan Code"      → TextBox: Name = txtPlanCode
Label: "Plan Name"      → TextBox: Name = txtPlanName
Label: "Stories"        → ComboBox: Name = cboStories
Label: "Subfloor L1"    → TextBox: Name = txtSubfloorL1
Label: "Subfloor L2"    → TextBox: Name = txtSubfloorL2
Label: "Notes"          → TextBox: Name = txtNotes (MultiLine = True)
```

### Check Boxes (Packs):
```
CheckBox: Name = chkPB,           Caption = "P&B"
CheckBox: Name = chk1stWalls,     Caption = "1st Walls"
CheckBox: Name = chk2ndWalls,     Caption = "2nd Walls"
CheckBox: Name = chkRoof,         Caption = "Roof"
CheckBox: Name = chkHouseWrap,    Caption = "House Wrap"
CheckBox: Name = chkSiding,       Caption = "Siding"
CheckBox: Name = chkRFRequired,   Caption = "RF Required"
```

### Command Buttons:
```
Button: Name = cmdSubmit,  Caption = "Create Plan"
Button: Name = cmdCancel,  Caption = "Cancel"
```

4. **Paste the Form Code**:
   - Double-click the UserForm
   - Delete any default code
   - Open `PlanIntakeForm.bas` in Notepad
   - Copy ALL the code
   - Paste it into the UserForm code window

5. Save your work: **File → Save** or `CTRL + S`

---

## Step 6: Create a Launch Button (5 minutes)

1. Go back to Excel (press `ALT + F11`)
2. On any sheet, go to **Developer → Insert → Button**
3. Draw a button on the sheet
4. In the "Assign Macro" dialog, select: `modPlanIntake.ShowPlanIntakeForm`
5. Click OK
6. Right-click button → Edit Text → Type: **"New Plan Intake"**

**Don't see Developer tab?**
- File → Options → Customize Ribbon
- Check "Developer" on the right side
- Click OK

---

## Step 7: Test It! (2 minutes)

1. Click your "New Plan Intake" button
2. The form should open
3. Try filling in:
   - Plan Code: `TEST-001`
   - Plan Name: `Test Plan`
   - Check a few packs
4. Click "Create Plan"

### Expected Result:
- New file created: `C:\Users\corey.boser\Documents\3BAT_Plan_System\TEST-001_[Today's Date]_BAT.xlsm`
- File opens with Plan Overview populated
- Success message appears

---

## Troubleshooting

### "Compile Error: Sub or Function not defined"
- Make sure you imported `modPlanIntake.bas`
- Make sure the UserForm is named exactly `frmPlanIntake`

### "Named range not found"
- Run the `SetupPlanOverviewSheet()` macro from Step 3

### "Template file not found"
- Check that your template file exists at:
  `C:\Users\corey.boser\Documents\3BAT_Plan_System\HOLT BAT OCTOBER 2025 9-29-25 Updated.xlsm`

### Form doesn't show all controls
- The form code expects specific control names
- Make sure control names match exactly (case-sensitive!)

---

## What You'll Have When Done

✅ A "New Plan Intake" button in your workbook
✅ A form that opens when clicked
✅ Automatic file creation in your folder
✅ Plan Overview auto-populated
✅ Pack Schedule auto-generated

---

## Minimal Form Setup (If Short on Time)

If you want to test quickly with minimal controls:

**Required Controls:**
- txtPlanCode (TextBox)
- txtPlanName (TextBox)
- cboStories (ComboBox)
- chkPB (CheckBox)
- chk1stWalls (CheckBox)
- chkRoof (CheckBox)
- chkHouseWrap (CheckBox)
- chkSiding (CheckBox)
- cmdSubmit (CommandButton)
- cmdCancel (CommandButton)

You can add more controls later!

---

## Next Steps

After you have the basic form working:

1. **Add more controls** to match the full design
2. **Test with real plans** (not TEST-001)
3. **Customize pack list** in modPlanIntake.GetPackDefinitions()
4. **Add validation** for required fields
5. **Create backup** of your template

---

## Quick Reference

**Open VBA Editor**: `ALT + F11`
**Run Macro**: `F5`
**Immediate Window**: `CTRL + G`
**Properties Window**: `F4`
**Save**: `CTRL + S`

**Test Command**:
```vba
modPlanIntake.ShowPlanIntakeForm
```

---

## Files You Need

✅ `modPlanIntake.bas` - Helper functions (updated with your paths)
✅ `PlanIntakeForm.bas` - Form code (updated with your paths)
✅ This Quick Start guide

---

**Estimated Total Time**: 30-40 minutes

**Questions?** Check the full SETUP_GUIDE.md for detailed explanations.

---

Last Updated: October 2025
Your Template: HOLT BAT OCTOBER 2025 9-29-25 Updated.xlsm
