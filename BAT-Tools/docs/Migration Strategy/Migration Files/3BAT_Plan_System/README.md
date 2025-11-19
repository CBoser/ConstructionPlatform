# 🏗️ HOLT HOMES - COMPLETE VBA PLAN INTAKE SYSTEM

## 📦 Package Contents

This package contains everything you need to automate your Holt Homes plan intake process with VBA.

### Files Included:

1. **PlanIntakeForm.bas** - UserForm code (the main intake form)
2. **modPlanIntake.bas** - Helper functions module  
3. **SETUP_GUIDE.md** - Complete installation and setup instructions
4. **WORKSHEET_TEMPLATE_GUIDE.md** - How to create the Plan Overview worksheet
5. **README.md** - This file

---

## 🚀 QUICK START (5 Steps)

### Step 1: Read the Documentation
Start with **SETUP_GUIDE.md** - it has everything you need!

### Step 2: Setup Your Worksheet
Follow **WORKSHEET_TEMPLATE_GUIDE.md** to create the "Plan Overview" sheet with named ranges.

**SHORTCUT:** Just run the `SetupPlanOverviewSheet()` macro from the Worksheet Template Guide - it creates everything automatically!

### Step 3: Import the VBA Code
1. Open your Holt BAT Template (.xlsm)
2. Press ALT + F11 (VBA Editor)
3. Import `modPlanIntake.bas` (File → Import)
4. Create UserForm and paste `PlanIntakeForm.bas` code

### Step 4: Add Form Controls
The form needs textboxes, dropdowns, and checkboxes. See **SETUP_GUIDE.md** section "UserForm Design" for the complete list.

### Step 5: Test It!
```vba
Sub TestLaunch()
    modPlanIntake.ShowPlanIntakeForm
End Sub
```

---

## ✨ What This System Does

✅ **Single-screen plan intake** - No more jumping between sheets  
✅ **Automatic folder creation** - Organized structure for every plan  
✅ **BAT template automation** - Copy, rename, and populate automatically  
✅ **Pack sequencing** - Different schedules for Single Family vs Multifamily  
✅ **Named range integration** - Seamless data flow  
✅ **CSV export** - Share data with other systems  
✅ **Status tracking** - Visual pack schedule with color coding  

---

## 📋 Your Pack Structure

The system includes these packs with proper dependencies and timing:

### FRAMING
- P&B (Post & Beam) - Day 1
- Sus Gar Flr (Suspended Garage Floor) - Day 2
- 1st Walls - Day 2-4
- 1st Walls RF (ReadyFrame)
- 2nd Walls - Day 8
- 2nd Walls RF (ReadyFrame)
- Roof - Day 14-15

### ENVELOPE
- House Wrap - Day 21-23
- Siding - Day 27-30
- Post Wraps
- 2nd Siding Pack
- Densglass (Multifamily)
- Shearwall (Multifamily)

### OPTIONAL
- Deck Framing - Day 5-22
- Pony Walls P&B
- Deck Surface/Rail - Day 30-34

---

## 🎯 Customization Points

### Change Paths
Edit these in the code:
- Template location: `X:\BAT\_Templates\Holt_BAT_Template.xlsm`
- Output location: `X:\BAT\[Builder]\[PlanCode]\`

### Add Custom Packs
See `GetPackDefinitions()` in `modPlanIntake.bas`

### Modify Sequences
See `GetSingleFamilySequence()` and `GetMultiFamilySequence()`

### Add Fields
1. Add to UserForm
2. Add to Plan Overview sheet
3. Create named range
4. Update `PopulatePlanOverview()` function

---

## 🔧 Configuration Checklist

Before first use:

- [ ] Template file exists at `X:\BAT\_Templates\Holt_BAT_Template.xlsm`
- [ ] Plan Overview sheet has all named ranges
- [ ] UserForm has all controls (textboxes, dropdowns, checkboxes)
- [ ] Control names match the code
- [ ] Test plan creation works
- [ ] Folder structure creates correctly

---

## 📊 Expected Workflow

1. User clicks "New Plan Intake" button
2. Form opens with defaults populated
3. User enters plan details and selects packs
4. Click "Create Plan"
5. System:
   - Creates folder structure
   - Copies BAT template
   - Populates Plan Overview
   - Generates Pack Schedule with timing
   - Shows success message

---

## 🎨 Form Layout Preview

```
┌─────────────────────────────────────┐
│  PLAN BASICS                        │
│  [Builder] [Plan Code] [Name]       │
│  [Stories] [Elevations]             │
├─────────────────────────────────────┤
│  SPECIFICATIONS                     │
│  [Areas] [Subfloors] [Walls]        │
│  [Roof Load] [Siding]               │
├─────────────────────────────────────┤
│  PACKS TO INCLUDE                   │
│  ☑ Framing packs...                 │
│  ☑ Envelope packs...                │
│  ☐ Optional packs...                │
├─────────────────────────────────────┤
│  [Create Plan] [Cancel]             │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Template not found"
Check the path in `CopyBATTemplate()` - update to your server location

### "Named range not found"  
Run `SetupPlanOverviewSheet()` to create all ranges automatically

### Form won't show
1. Check UserForm name is `frmPlanIntake`
2. Verify module name is `modPlanIntake`
3. Try: `Application.Run "modPlanIntake.ShowPlanIntakeForm"`

### Packs not generating
1. Verify checkbox names (e.g., `chkPB`, `chk1stWalls`)
2. Check `GeneratePackSequence()` function
3. Look at Immediate Window (Ctrl+G) for debug messages

---

## 📁 Folder Structure Created

For each plan, the system creates:

```
X:\BAT\[Builder]\[PlanCode]\
├── BAT\
│   └── [PlanCode]_[Date]_BAT.xlsm
├── Takeoff\
├── RF\
└── Docs\
```

---

## 💡 Pro Tips

1. **Add a ribbon button** for quick access:
   - Developer → Customize Ribbon
   - Add button linked to `ShowPlanIntakeForm`

2. **Use the auto-setup macro**:
   - Run `SetupPlanOverviewSheet()` once
   - Creates the entire worksheet structure
   - Sets up all named ranges automatically

3. **Test with fake data first**:
   - Plan Code: TEST-001
   - Check folder creation before going live

4. **Export settings**:
   - System can export to CSV for sharing
   - See `ExportPlanToCSV()` function

5. **Add community overrides later**:
   - The system is ready for community-specific rules
   - Just add the logic to pack selection

---

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** for detailed instructions
2. Review **WORKSHEET_TEMPLATE_GUIDE.md** for sheet setup
3. Look at Debug.Print statements in code
4. Test each component separately

---

## ✅ Success Criteria

You'll know it's working when:

✅ Form opens without errors  
✅ All dropdowns populate  
✅ Folder structure creates automatically  
✅ BAT file appears in correct location  
✅ Plan Overview is populated with your data  
✅ Pack Schedule shows correct timing  
✅ Status tracking works  

---

## 🎓 Learning the Code

The code is organized into logical sections:

### PlanIntakeForm.bas
- `UserForm_Initialize()` - Sets up defaults
- `cmdSubmit_Click()` - Main submission handler
- `CreatePlanStructure()` - Creates folders
- `WritePlanToWorksheet()` - Populates BAT
- `GeneratePackSequence()` - Creates schedule

### modPlanIntake.bas
- `ShowPlanIntakeForm()` - Launch point
- `CreatePlanFolderStructure()` - Folder creation
- `CopyBATTemplate()` - Template handling
- `PopulatePlanOverview()` - Data population
- `GeneratePackSchedule()` - Schedule creation
- `GetPackDefinitions()` - Pack catalog
- Helper functions (CleanString, Export, etc.)

---

## 🚀 Next Steps After Setup

1. **Test thoroughly** with sample plans
2. **Train your team** on the new workflow
3. **Customize** pack definitions for your needs
4. **Add** community-specific rules if needed
5. **Consider** Power Automate integration later

---

## 📄 File Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| SETUP_GUIDE.md | Complete installation instructions | Start here |
| WORKSHEET_TEMPLATE_GUIDE.md | Plan Overview sheet setup | Creating template |
| modPlanIntake.bas | Helper functions | Import first |
| PlanIntakeForm.bas | Main form code | Import second |
| README.md | Overview and quick start | Reference |

---

## 🎉 You're Ready!

Follow the **SETUP_GUIDE.md** step-by-step and you'll have a working system in less than an hour.

The form will save you hours every week by automating:
- ❌ Manual folder creation
- ❌ Template copying and renaming  
- ❌ Repetitive data entry
- ❌ Pack schedule building
- ❌ Dependency tracking

Good luck! 🚀

---

**System:** Holt Homes BAT Automation  
**Created:** October 2025  
**Version:** 1.0  
**Language:** VBA (Excel 2016+)
