# ✅ HOLT BAT VBA SYSTEM - INSTALLATION CHECKLIST

Print this page and check off each step as you complete it.

---

## 📋 PRE-INSTALLATION

- [ ] Have Excel 2016 or later installed
- [ ] Have access to X:\ drive (or network location)
- [ ] Downloaded all VBA files (PlanIntakeForm.bas, modPlanIntake.bas)
- [ ] Read README.md for overview
- [ ] Have 30-60 minutes available for setup

---

## 📂 STEP 1: FOLDER STRUCTURE

- [ ] Created template folder: `X:\BAT\_Templates\`
- [ ] Placed BAT template in: `X:\BAT\_Templates\Holt_BAT_Template.xlsm`
- [ ] Verified template opens without errors
- [ ] Template is saved as Macro-Enabled (.xlsm)

---

## 📝 STEP 2: WORKSHEET SETUP

### Option A: Automated (Recommended)
- [ ] Opened template file
- [ ] Pressed ALT+F11 to open VBA Editor
- [ ] Created new module (Insert → Module)
- [ ] Pasted code from WORKSHEET_TEMPLATE_GUIDE.md
- [ ] Ran `SetupPlanOverviewSheet()` macro
- [ ] Verified "Plan Overview" sheet created
- [ ] Ran `AddDataValidation()` macro
- [ ] Ran `TestNamedRanges()` - All passed ✓
- [ ] Deleted the temporary module
- [ ] Saved template

### Option B: Manual
- [ ] Created "Plan Overview" sheet
- [ ] Added all labels in Column A
- [ ] Created all named ranges in Column B (20 ranges)
- [ ] Formatted headers and sections
- [ ] Added data validation to dropdowns
- [ ] Verified all named ranges exist

---

## 💻 STEP 3: VBA CODE IMPORT

- [ ] Opened template file
- [ ] Pressed ALT+F11 (VBA Editor)
- [ ] Imported modPlanIntake.bas (File → Import File)
- [ ] Verified module appears in Modules folder
- [ ] Renamed module to "modPlanIntake" if needed

---

## 🎨 STEP 4: USERFORM CREATION

- [ ] In VBA Editor: Insert → UserForm
- [ ] Named form "frmPlanIntake" (F4 → Properties → Name)
- [ ] Set form properties:
  - [ ] Width: 650-700
  - [ ] Height: 750-800
  - [ ] Caption: "Holt Homes - Plan Intake & Overview"
  - [ ] StartUpPosition: CenterOwner

---

## 🔧 STEP 5: USERFORM CONTROLS

### Text Boxes (19)
- [ ] txtBuilder
- [ ] txtPlanCode
- [ ] txtPlanName
- [ ] txtElevations (MultiLine = True)
- [ ] txtGarage
- [ ] txtLivingTotal
- [ ] txtLivingMain
- [ ] txtLivingUpper
- [ ] txtGarageArea
- [ ] txtSubfloorL1
- [ ] txtSubfloorL2
- [ ] txtWallHL1
- [ ] txtWallHL2
- [ ] txtNotes (MultiLine = True, Height: 60)

### Combo Boxes (3)
- [ ] cboStories
- [ ] cboRoofLoad
- [ ] cboSiding

### Check Boxes (17)
- [ ] chkPB
- [ ] chkSusGarFlr
- [ ] chk1stWalls
- [ ] chk1stWallsRF
- [ ] chk2ndWalls
- [ ] chk2ndWallsRF
- [ ] chkRoof
- [ ] chkHouseWrap
- [ ] chkSiding
- [ ] chkPostWraps
- [ ] chk2ndSiding
- [ ] chkDeckFraming
- [ ] chkPonyWalls
- [ ] chkDeckSurface
- [ ] chkDensglass
- [ ] chkShearwall
- [ ] chkRFRequired

### Command Buttons (2)
- [ ] cmdSubmit (Caption: "Create Plan")
- [ ] cmdCancel (Caption: "Cancel")

---

## 📄 STEP 6: USERFORM CODE

- [ ] Double-clicked UserForm in VBA Editor
- [ ] Opened PlanIntakeForm.bas in Notepad
- [ ] Copied ALL code (including VERSION header)
- [ ] Deleted any default code in UserForm code window
- [ ] Pasted copied code
- [ ] Saved (Ctrl+S)

---

## 🧪 STEP 7: TESTING - BASIC

- [ ] In VBA Editor, added new module for testing
- [ ] Created test macro:
```vba
Sub TestForm()
    modPlanIntake.ShowPlanIntakeForm
End Sub
```
- [ ] Ran test macro (F5)
- [ ] Form opened without errors ✓
- [ ] All controls visible ✓
- [ ] Dropdowns populate ✓
- [ ] Defaults show correctly ✓
- [ ] Cancel button closes form ✓

---

## 🧪 STEP 8: TESTING - FUNCTIONALITY

- [ ] Clicked "Create Plan" with empty fields
- [ ] Verified validation error messages appear ✓
- [ ] Filled in test data:
  - [ ] Plan Code: TEST-001
  - [ ] Plan Name: Test Plan
  - [ ] Stories: Two
  - [ ] Living Total: 2000
  - [ ] Checked: P&B, 1st Walls, 2nd Walls, Roof, House Wrap, Siding
- [ ] Clicked "Create Plan"
- [ ] Verified no errors ✓
- [ ] Success message appeared ✓

---

## 📁 STEP 9: OUTPUT VERIFICATION

- [ ] Checked folder created: `X:\BAT\Holt Homes\TEST-001\`
- [ ] Subfolders exist:
  - [ ] BAT\
  - [ ] Takeoff\
  - [ ] RF\
  - [ ] Docs\
- [ ] BAT file exists: `TEST-001_[DATE]_BAT.xlsm`
- [ ] Opened BAT file successfully
- [ ] Plan Overview sheet populated:
  - [ ] Builder = "Holt Homes"
  - [ ] Plan Code = "TEST-001"
  - [ ] Plan Name = "Test Plan"
  - [ ] Stories = "Two"
  - [ ] Created date shows
- [ ] Pack Schedule sheet exists
- [ ] Packs listed correctly:
  - [ ] P&B - Day 1
  - [ ] 1st Walls - Day 4
  - [ ] 2nd Walls - Day 8
  - [ ] Roof - Day 14
  - [ ] House Wrap - Day 21
  - [ ] Siding - Day 27

---

## 🎨 STEP 10: FINISHING TOUCHES

- [ ] Deleted test plan folder (TEST-001)
- [ ] Deleted test module from VBA Editor
- [ ] Added Quick Launch button to template (optional):
  - [ ] Developer → Insert → Button
  - [ ] Assigned macro: `modPlanIntake.ShowPlanIntakeForm`
  - [ ] Label: "New Plan Intake"
- [ ] Protected Plan Overview sheet (optional)
- [ ] Saved and closed template
- [ ] Tested template from file system (not open in Excel)

---

## 📚 STEP 11: DOCUMENTATION

- [ ] Saved all documentation files to shared location:
  - [ ] README.md
  - [ ] SETUP_GUIDE.md
  - [ ] WORKSHEET_TEMPLATE_GUIDE.md
  - [ ] QUICK_REFERENCE.md
  - [ ] This checklist
- [ ] Printed QUICK_REFERENCE.md for desk reference
- [ ] Bookmarked documentation folder
- [ ] Shared location with team (if applicable)

---

## 👥 STEP 12: TEAM TRAINING (If Applicable)

- [ ] Scheduled training session
- [ ] Demonstrated form usage
- [ ] Showed folder structure
- [ ] Explained pack selection logic
- [ ] Walked through test plan creation
- [ ] Answered questions
- [ ] Shared documentation links
- [ ] Set up support channel

---

## 🔐 STEP 13: BACKUP & VERSION CONTROL

- [ ] Created backup of original template
- [ ] Saved working template with version number
- [ ] Documented any customizations made
- [ ] Noted any path changes from defaults
- [ ] Stored backup in safe location

---

## ⚙️ STEP 14: CUSTOMIZATION (Optional)

- [ ] Updated pack definitions if needed
- [ ] Modified default sequences
- [ ] Adjusted folder structure
- [ ] Changed default values
- [ ] Added custom validation rules
- [ ] Documented all changes

---

## 🚀 STEP 15: GO LIVE

- [ ] Created first real plan (not TEST)
- [ ] Verified all outputs correct
- [ ] Confirmed folder permissions
- [ ] Tested from different user account (if multi-user)
- [ ] Monitored for issues in first week
- [ ] Gathered user feedback
- [ ] Made minor adjustments as needed

---

## ✅ FINAL VERIFICATION

**Run through this complete workflow:**

1. [ ] Open template
2. [ ] Click "New Plan Intake" button
3. [ ] Fill in real plan data
4. [ ] Select appropriate packs
5. [ ] Click "Create Plan"
6. [ ] Verify folder created
7. [ ] Open generated BAT
8. [ ] Check Plan Overview populated
9. [ ] Check Pack Schedule correct
10. [ ] Use BAT for actual work

**If all steps work:** ✅ **INSTALLATION COMPLETE!**

---

## 📊 POST-INSTALLATION

- [ ] Monitor system usage for 1 week
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Make refinements
- [ ] Update documentation if needed
- [ ] Consider additional features:
  - [ ] Community-specific rules
  - [ ] Power Automate integration
  - [ ] Email notifications
  - [ ] Reporting dashboard

---

## 🐛 TROUBLESHOOTING CHECKLIST

**If something doesn't work, check:**

- [ ] All files saved
- [ ] Macros enabled in Excel
- [ ] Template in correct location
- [ ] Named ranges exist
- [ ] Control names match code
- [ ] No typos in control names
- [ ] VBA references not broken
- [ ] Network drive accessible
- [ ] Permissions correct
- [ ] Excel not in Protected View

---

## 📞 SUPPORT RESOURCES

- [ ] Saved SETUP_GUIDE.md location: _______________
- [ ] Saved QUICK_REFERENCE.md location: _______________
- [ ] Template backup location: _______________
- [ ] VBA backup location: _______________
- [ ] Team support contact: _______________

---

## 🎉 SUCCESS METRICS

After 1 week of use, you should see:

- [ ] Fewer errors in plan setup
- [ ] Faster plan intake process
- [ ] Consistent folder structure
- [ ] Better pack tracking
- [ ] Time savings on repetitive tasks
- [ ] Fewer missing files
- [ ] More accurate scheduling

---

**Installation Date:** _______________  
**Installed By:** _______________  
**Version:** 1.0  
**Template Path:** _______________  

---

**CONGRATULATIONS! Your Holt BAT VBA System is ready to use! 🎉**

Keep this checklist for reference and future updates.

---

*Holt Homes BAT Automation - October 2025*
