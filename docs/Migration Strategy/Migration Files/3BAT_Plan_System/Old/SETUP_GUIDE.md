# HOLT HOMES - VBA PLAN INTAKE SYSTEM
## Complete Setup Guide

---

## 📋 TABLE OF CONTENTS
1. [Overview](#overview)
2. [Files Included](#files-included)
3. [Installation Steps](#installation-steps)
4. [Worksheet Setup](#worksheet-setup)
5. [UserForm Design](#userform-design)
6. [Named Ranges](#named-ranges)
7. [Testing](#testing)
8. [Customization](#customization)

---

## 🎯 OVERVIEW

This VBA system automates your Holt Homes plan intake process with:
- ✅ Single-screen plan intake form
- ✅ Automatic folder structure creation
- ✅ BAT template copying and population
- ✅ Pack sequence generation (Single Family vs Multifamily)
- ✅ CSV export capability
- ✅ Named range integration for automation

---

## 📦 FILES INCLUDED

1. **PlanIntakeForm.bas** - UserForm code
2. **modPlanIntake.bas** - Helper functions module
3. **This guide** - Setup instructions

---

## 🔧 INSTALLATION STEPS

### Step 1: Open Your BAT Template
1. Open your Holt BAT Template file (`Holt_BAT_Template.xlsm`)
2. Press `ALT + F11` to open VBA Editor

### Step 2: Import the Module
1. In VBA Editor, go to **File → Import File**
2. Select `modPlanIntake.bas`
3. The module will appear in your Modules folder

### Step 3: Create the UserForm
1. In VBA Editor, go to **Insert → UserForm**
2. Name it `frmPlanIntake` (F4 to open Properties window)
3. Open `PlanIntakeForm.bas` in Notepad
4. Copy ALL the code (including the VERSION header)
5. In VBA Editor, double-click the UserForm
6. Delete any default code
7. Paste the copied code

### Step 4: Add Controls to UserForm

**CRITICAL: You must manually add these controls to the form**

#### Text Boxes:
- txtBuilder (default: "Holt Homes")
- txtPlanCode (e.g., "30-1670")
- txtPlanName (e.g., "Coyote Ridge")
- txtElevations (multi-line)
- txtGarage
- txtLivingTotal
- txtLivingMain
- txtLivingUpper
- txtGarageArea
- txtSubfloorL1
- txtSubfloorL2
- txtWallHL1
- txtWallHL2
- txtNotes (multi-line)

#### Combo Boxes:
- cboStories (Single, Two, Three)
- cboRoofLoad (25, 30, 40, 60)
- cboSiding (Lap, Board & Batten, Panel, Mixed)

#### Check Boxes (Packs):
- chkPB (Post & Beam)
- chkSusGarFlr (Suspended Garage Floor)
- chk1stWalls (1st Walls)
- chk1stWallsRF (1st Walls ReadyFrame)
- chk2ndWalls (2nd Walls)
- chk2ndWallsRF (2nd Walls ReadyFrame)
- chkRoof (Roof)
- chkHouseWrap (House Wrap)
- chkSiding (Siding)
- chkPostWraps (Post Wraps)
- chk2ndSiding (2nd Siding)
- chkDeckFraming (Deck Framing)
- chkPonyWalls (Pony Walls P&B)
- chkDeckSurface (Deck Surface/Rail)
- chkDensglass (Densglass - Multifamily)
- chkShearwall (Shearwall - Multifamily)
- chkRFRequired (RF Required)

#### Command Buttons:
- cmdSubmit (Caption: "Create Plan")
- cmdCancel (Caption: "Cancel")

---

## 📊 WORKSHEET SETUP

### Required Sheets in Template:

#### 1. **Plan Overview** Sheet
This sheet holds the main plan data.

**Required Named Ranges:**
```
builder_name        → Cell B2
plan_code           → Cell B3
plan_name           → Cell B4
model_display       → Cell B5
created_on          → Cell B6
elevations          → Cell B8
garage              → Cell B9
living_area_total   → Cell B10
living_area_main    → Cell B11
living_area_upper   → Cell B12
garage_area         → Cell B13
stories             → Cell B14
subfloor_L1         → Cell B15
subfloor_L2         → Cell B16
wall_h_L1           → Cell B17
wall_h_L2           → Cell B18
roof_load           → Cell B19
siding              → Cell B20
rf_required         → Cell B21
notes               → Cell B22
```

**To Create Named Ranges:**
1. Select cell B2
2. Click in Name Box (left of formula bar)
3. Type `builder_name`
4. Press Enter
5. Repeat for all cells

#### 2. **Pack Schedule** Sheet
This will be created automatically by the form, but you can pre-create it:

**Columns:**
- A: Pack Code
- B: Category
- C: Description
- D: Day# (Intended)
- E: Dependencies
- F: Lead Time
- G: Duration
- H: Status
- I: Start Date
- J: Ship Date

---

## 🖼️ USERFORM DESIGN LAYOUT

### Suggested Layout (3 Sections):

```
┌─────────────────────────────────────────────────────────┐
│  HOLT HOMES - PLAN INTAKE & OVERVIEW                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─ PLAN BASICS ──────────────────────────────────────┐ │
│  │ Builder: [txtBuilder          ]                     │ │
│  │ Plan Code: [txtPlanCode      ]                      │ │
│  │ Plan Name: [txtPlanName      ]                      │ │
│  │ Stories: [cboStories ▼]                             │ │
│  │ Elevations: [txtElevations (multi-line)          ]  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ SPECIFICATIONS ───────────────────────────────────┐ │
│  │ Living Area Total: [txtLivingTotal  ]               │ │
│  │ Living Area Main:  [txtLivingMain   ]               │ │
│  │ Living Area Upper: [txtLivingUpper  ]               │ │
│  │ Garage: [txtGarage                                ] │ │
│  │ Garage Area: [txtGarageArea ]                       │ │
│  │ Subfloor L1: [txtSubfloorL1] L2: [txtSubfloorL2]    │ │
│  │ Wall Height L1: [txtWallHL1] L2: [txtWallHL2]       │ │
│  │ Roof Load: [cboRoofLoad ▼]  Siding: [cboSiding ▼]  │ │
│  │ □ RF Required                                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ PACKS (Select All That Apply) ────────────────────┐ │
│  │  FRAMING:                                            │ │
│  │  ☑ P&B               ☐ Sus Gar Flr                  │ │
│  │  ☑ 1st Walls         ☐ 1st Walls RF                 │ │
│  │  ☑ 2nd Walls         ☐ 2nd Walls RF                 │ │
│  │  ☑ Roof                                              │ │
│  │                                                       │ │
│  │  ENVELOPE:                                            │ │
│  │  ☑ House Wrap        ☑ Siding                        │ │
│  │  ☐ Post Wraps        ☐ 2nd Siding                    │ │
│  │  ☐ Densglass         ☐ Shearwall                     │ │
│  │                                                       │ │
│  │  OPTIONAL:                                            │ │
│  │  ☐ Deck Framing      ☐ Pony Walls P&B               │ │
│  │  ☐ Deck Surface/Rail                                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Notes: [txtNotes (multi-line)                        ]  │
│                                                           │
│  [  Create Plan  ]  [  Cancel  ]                         │
└─────────────────────────────────────────────────────────┘
```

**Form Properties:**
- Width: 600-700
- Height: 700-800
- Caption: "Holt Homes - Plan Intake & Overview"
- StartUpPosition: CenterOwner

---

## 🔐 NAMED RANGES QUICK REFERENCE

### To Create All Named Ranges at Once:

1. Copy this list to a temporary sheet:
```
B2    builder_name
B3    plan_code
B4    plan_name
B5    model_display
B6    created_on
B8    elevations
B9    garage
B10   living_area_total
B11   living_area_main
B12   living_area_upper
B13   garage_area
B14   stories
B15   subfloor_L1
B16   subfloor_L2
B17   wall_h_L1
B18   wall_h_L2
B19   roof_load
B20   siding
B21   rf_required
B22   notes
```

2. Run this macro once:
```vba
Sub CreateNamedRanges()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Plan Overview")
    
    ws.Range("B2").Name = "builder_name"
    ws.Range("B3").Name = "plan_code"
    ws.Range("B4").Name = "plan_name"
    ws.Range("B5").Name = "model_display"
    ws.Range("B6").Name = "created_on"
    ws.Range("B8").Name = "elevations"
    ws.Range("B9").Name = "garage"
    ws.Range("B10").Name = "living_area_total"
    ws.Range("B11").Name = "living_area_main"
    ws.Range("B12").Name = "living_area_upper"
    ws.Range("B13").Name = "garage_area"
    ws.Range("B14").Name = "stories"
    ws.Range("B15").Name = "subfloor_L1"
    ws.Range("B16").Name = "subfloor_L2"
    ws.Range("B17").Name = "wall_h_L1"
    ws.Range("B18").Name = "wall_h_L2"
    ws.Range("B19").Name = "roof_load"
    ws.Range("B20").Name = "siding"
    ws.Range("B21").Name = "rf_required"
    ws.Range("B22").Name = "notes"
    
    MsgBox "Named ranges created!", vbInformation
End Sub
```

---

## 🧪 TESTING

### Test Procedure:

1. **Open Template**
   ```vba
   Sub TestForm()
       modPlanIntake.ShowPlanIntakeForm
   End Sub
   ```

2. **Fill in Test Data:**
   - Plan Code: TEST-001
   - Plan Name: Test Plan
   - Stories: Two
   - Check: P&B, 1st Walls, 2nd Walls, Roof, House Wrap, Siding

3. **Click "Create Plan"**

4. **Verify:**
   - ✅ Folders created at `X:\BAT\Holt Homes\TEST-001\`
   - ✅ BAT file copied to folder
   - ✅ Plan Overview populated
   - ✅ Pack Schedule created

---

## 🎨 CUSTOMIZATION

### Add Custom Packs:

Edit `GetPackDefinitions()` in `modPlanIntake`:
```vba
' Add new pack
Set pack = CreateObject("Scripting.Dictionary")
pack("code") = "Your Pack"
pack("category") = "Category"
pack("description") = "Description"
pack("deps") = "Dependency1,Dependency2"
pack("lead") = 5
pack("duration") = 2
packs.Add pack
```

### Change Default Sequences:

Edit `GetSingleFamilySequence()` or `GetMultiFamilySequence()`:
```vba
sequence.Add Array("Pack Name", DayNumber)
```

### Change Folder Structure:

Edit `CreatePlanFolderStructure()` in `modPlanIntake`:
```vba
If Not fso.FolderExists(planPath & "YourFolder\") Then 
    fso.CreateFolder planPath & "YourFolder\"
```

---

## 🚀 QUICK START BUTTON

Add a button to your Excel ribbon:

1. Go to **Developer → Insert → Button**
2. Draw button on worksheet
3. Assign macro: `modPlanIntake.ShowPlanIntakeForm`
4. Label: "New Plan Intake"

---

## 📝 TEMPLATE PATH CONFIGURATION

**IMPORTANT:** Update the template path in the code to match your server:

Current setting:
```vba
templatePath = "X:\BAT\_Templates\Holt_BAT_Template.xlsm"
```

Change to your actual path in:
- `frmPlanIntake.WritePlanToWorksheet()`
- `modPlanIntake.CopyBATTemplate()`

---

## 🔧 TROUBLESHOOTING

### Error: "Template not found"
→ Check template path in `CopyBATTemplate()` function

### Error: "Named range not found"
→ Run `CreateNamedRanges()` macro

### Form doesn't show
→ Check UserForm name is exactly `frmPlanIntake`

### Packs not generating
→ Verify checkbox names match code exactly

---

## 📞 SUPPORT

For additional help:
1. Check VBA Immediate Window (Ctrl+G) for debug messages
2. Review the Debug.Print statements in the code
3. Test each function individually

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] Template file exists at correct path
- [ ] All named ranges created in Plan Overview sheet
- [ ] UserForm controls added with correct names
- [ ] Test plan creation successful
- [ ] Folder structure creates correctly
- [ ] Pack Schedule generates correctly
- [ ] CSV export works (if needed)

---

**Created:** October 2025  
**Version:** 1.0  
**System:** Holt Homes BAT Automation
