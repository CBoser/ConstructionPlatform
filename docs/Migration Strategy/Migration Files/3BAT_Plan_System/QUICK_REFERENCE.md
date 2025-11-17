# 📋 HOLT BAT - QUICK REFERENCE CARD

## 🚀 LAUNCH THE FORM

```vba
Sub QuickLaunch()
    modPlanIntake.ShowPlanIntakeForm
End Sub
```

---

## 📝 REQUIRED FIELDS

✅ **Must Fill:**
- Plan Code (e.g., 30-1670)
- Plan Name (e.g., Coyote Ridge)
- Stories (Single, Two, Three)

✅ **Recommended:**
- Living Areas
- Wall Heights (L1/L2)
- Subfloor Thickness (L1/L2)
- Roof Load
- Siding Type

---

## 📦 PACK SELECTION

### Single Family (Default)
✅ P&B → Day 1  
✅ 1st Walls → Day 4  
✅ 2nd Walls → Day 8  
✅ Roof → Day 14  
✅ House Wrap → Day 21  
✅ Siding → Day 27  
□ Deck Framing → Day 5  
□ Deck Surface/Rail → Day 30  

### Multifamily (NH Duplex)
✅ P&B → Day 1  
✅ 1st Walls → Day 2  
✅ 2nd Walls → Day 8  
✅ Roof → Day 15  
✅ Deck Framing → Day 22  
✅ House Wrap → Day 23  
✅ Densglass → Day 23  
✅ Siding → Day 30  
✅ Shearwall → Day 30  
✅ Deck Surface/Rail → Day 34  

---

## 🎯 COMMON SCENARIOS

**Standard Two-Story with Deck:**
- Stories: Two
- Check: P&B, 1st Walls, 2nd Walls, Roof, Deck Framing, House Wrap, Siding, Deck Surface/Rail

**Single-Story Ranch:**
- Stories: Single
- Check: P&B, 1st Walls, Roof, House Wrap, Siding
- Uncheck: 2nd Walls, 2nd Walls RF

**Multifamily with Pony Walls:**
- Stories: Two/Three
- Check: P&B, Pony Walls P&B, 1st Walls, 2nd Walls, Roof, House Wrap, Siding
- Check optional: Densglass, Shearwall

---

## 🗂️ FOLDER STRUCTURE

Created automatically at:
```
X:\BAT\Holt Homes\[PlanCode]\
  ├── BAT\          ← Your BAT file
  ├── Takeoff\      ← Takeoff files
  ├── RF\           ← ReadyFrame files
  └── Docs\         ← Supporting docs
```

---

## ✅ VALIDATION CHECKLIST

Before clicking "Create Plan":
- [ ] Plan Code is unique
- [ ] Plan Name is correct
- [ ] Elevations listed (A, B, C, D)
- [ ] All required packs selected
- [ ] RF Required checkbox (if needed)
- [ ] Notes added (if special requirements)

---

## 🎨 PACK CATEGORIES

**FRAMING** (Structure)
- P&B, Sus Gar Flr
- 1st Walls, 1st Walls RF
- 2nd Walls, 2nd Walls RF
- Roof

**ENVELOPE** (Exterior)
- House Wrap, Siding
- Post Wraps, 2nd Siding
- Densglass, Shearwall

**OPTIONAL** (Add-ons)
- Deck Framing
- Deck Surface/Rail
- Pony Walls P&B

---

## 🔍 QUICK TIPS

💡 **Auto-defaults:**
- Builder: "Holt Homes"
- Stories: "Two"
- Elevations: A, B, C, D

💡 **Stories Change:**
- Single → Auto-removes 2nd Walls
- Two/Three → Auto-adds 2nd Walls

💡 **Dependencies:**
- System tracks pack dependencies
- Lead times calculated automatically
- Day numbers adjust by plan type

💡 **Status Tracking:**
- Pack Schedule shows in new BAT
- Status: Pending → Ordered → Shipped → Delivered → Installed

---

## 🐛 QUICK FIXES

**Form won't open?**
→ `Application.Run "modPlanIntake.ShowPlanIntakeForm"`

**Plan Code already exists?**
→ Add version suffix: `30-1670-v2`

**Missing named range error?**
→ Run `SetupPlanOverviewSheet()` once

**Template not found?**
→ Check path: `X:\BAT\_Templates\Holt_BAT_Template.xlsm`

---

## 📊 STATUS COLORS

🟡 **Pending** - Not yet ordered  
🔵 **Ordered** - PO sent to supplier  
🟠 **Shipped** - In transit  
🟢 **Delivered** - On site  
✅ **Installed** - Complete  

---

## 🎯 TIMING REFERENCE

| Pack | Single Family | Multifamily |
|------|---------------|-------------|
| P&B | Day 1 | Day 1 |
| 1st Walls | Day 4 | Day 2 |
| 2nd Walls | Day 8 | Day 8 |
| Roof | Day 14 | Day 15 |
| Deck Framing | Day 5 | Day 22 |
| House Wrap | Day 21 | Day 23 |
| Siding | Day 27 | Day 30 |
| Deck Surface | Day 30 | Day 34 |

---

## 📞 HELP

**Read First:**
- README.md → Overview
- SETUP_GUIDE.md → Installation
- WORKSHEET_TEMPLATE_GUIDE.md → Sheet setup

**Debug Mode:**
Press Ctrl+G in VBA Editor to see debug messages

**Test Mode:**
Use Plan Code: TEST-001 for testing

---

## ⌨️ KEYBOARD SHORTCUTS

- `ALT + F11` → Open VBA Editor
- `F5` → Run macro
- `CTRL + G` → Immediate Window
- `F1` → VBA Help

---

## 🎓 WORKFLOW

1. **Open** BAT Template
2. **Click** "New Plan Intake" button
3. **Fill** required fields
4. **Select** packs for the plan type
5. **Review** selections
6. **Click** "Create Plan"
7. **Verify** folder and BAT created
8. **Continue** with takeoff/pricing

---

## 💾 FILE NAMING

**Generated BAT file:**
`[PlanCode]_[YYYY-MM-DD]_BAT.xlsm`

Example: `30-1670_2025-10-06_BAT.xlsm`

---

## 🌟 PRO SHORTCUTS

**Quick Test:**
```vba
Sub Test()
    modPlanIntake.ShowPlanIntakeForm
End Sub
```

**View Pack Definitions:**
```vba
Sub ViewPacks()
    Dim packs As Collection
    Set packs = modPlanIntake.GetPackDefinitions()
    MsgBox packs.Count & " packs defined"
End Sub
```

**Export Plan Data:**
```vba
Sub ExportData()
    modPlanIntake.ExportPlanToCSV planData, "C:\temp\plan.csv"
End Sub
```

---

**Print this card and keep it at your desk!**

---

*Holt Homes BAT Automation v1.0 - October 2025*
