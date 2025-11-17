# USERFORM CONTROL NAMES - QUICK REFERENCE

Use this as a checklist when building your UserForm.

---

## FORM PROPERTIES
- **Name**: `frmPlanIntake`
- **Caption**: `Holt Homes - Plan Intake`
- **Width**: `600`
- **Height**: `500` (adjust as needed)

---

## TEXT BOXES

| Control Name | Label Text | Notes |
|--------------|-----------|-------|
| txtBuilder | Builder | Default: "Holt Homes" |
| txtPlanCode | Plan Code * | Required |
| txtPlanName | Plan Name * | Required |
| txtElevations | Elevations | Default: "A, B, C, D" |
| txtGarage | Garage | Optional |
| txtLivingTotal | Living Area Total | Optional |
| txtLivingMain | Living Area Main | Optional |
| txtLivingUpper | Living Area Upper | Optional |
| txtGarageArea | Garage Area | Optional |
| txtSubfloorL1 | Subfloor L1 | Optional |
| txtSubfloorL2 | Subfloor L2 | Optional |
| txtWallHL1 | Wall Height L1 | Optional |
| txtWallHL2 | Wall Height L2 | Optional |
| txtNotes | Notes | MultiLine = True |

---

## COMBO BOXES (DROPDOWNS)

| Control Name | Label Text | Items to Add |
|--------------|-----------|--------------|
| cboStories | Stories * | Single, Two, Three |
| cboRoofLoad | Roof Load | 25, 30, 40, 60 |
| cboSiding | Siding | Lap, Board & Batten, Panel, Mixed |

---

## CHECK BOXES - PACKS

### Framing Packs
| Control Name | Caption |
|--------------|---------|
| chkPB | P&B |
| chkSusGarFlr | Sus Gar Flr |
| chk1stWalls | 1st Walls |
| chk1stWallsRF | 1st Walls RF |
| chk2ndWalls | 2nd Walls |
| chk2ndWallsRF | 2nd Walls RF |
| chkRoof | Roof |

### Envelope Packs
| Control Name | Caption |
|--------------|---------|
| chkHouseWrap | House Wrap |
| chkSiding | Siding |
| chkPostWraps | Post Wraps |
| chk2ndSiding | 2nd Siding |
| chkDensglass | Densglass |
| chkShearwall | Shearwall |

### Optional Packs
| Control Name | Caption |
|--------------|---------|
| chkDeckFraming | Deck Framing |
| chkPonyWalls | Pony Walls |
| chkDeckSurface | Deck Surface/Rail |

### Other
| Control Name | Caption |
|--------------|---------|
| chkRFRequired | RF Required |

---

## COMMAND BUTTONS

| Control Name | Caption | Notes |
|--------------|---------|-------|
| cmdSubmit | Create Plan | Main action button |
| cmdCancel | Cancel | Closes form |

---

## MINIMUM SETUP (For Quick Testing)

If you're short on time, add ONLY these controls first:

**Essential:**
- txtPlanCode
- txtPlanName
- cboStories
- cmdSubmit
- cmdCancel

**Basic Packs:**
- chkPB
- chk1stWalls
- chk2ndWalls
- chkRoof
- chkHouseWrap
- chkSiding

You can add more controls later!

---

## LAYOUT TIPS

### Organize by Sections:

**Section 1: Basic Info** (Top)
- txtBuilder, txtPlanCode, txtPlanName, cboStories

**Section 2: Specs** (Middle-Top)
- txtSubfloorL1, txtSubfloorL2, txtWallHL1, txtWallHL2
- cboRoofLoad, cboSiding, chkRFRequired

**Section 3: Packs** (Middle)
- Group checkboxes by category (Framing, Envelope, Optional)

**Section 4: Notes** (Bottom-Middle)
- txtNotes (make this tall: Height ~60)

**Section 5: Buttons** (Bottom)
- cmdSubmit, cmdCancel (align horizontally at bottom)

---

## QUICK ADD INSTRUCTIONS

1. **Add Label**: Toolbox → Label → Draw on form → Set Caption
2. **Add TextBox**: Toolbox → TextBox → Draw on form → Set Name
3. **Add ComboBox**: Toolbox → ComboBox → Draw on form → Set Name
4. **Add CheckBox**: Toolbox → CheckBox → Draw on form → Set Name & Caption
5. **Add Button**: Toolbox → CommandButton → Draw on form → Set Name & Caption

---

## PROPERTIES TO CHECK

For each control, press F4 to open Properties window:

**TextBox:**
- Name: `txtXXXXX`
- Text: (leave blank or set default)
- Font: Calibri, 11

**ComboBox:**
- Name: `cboXXXXX`
- Style: 2 - fmStyleDropDownList

**CheckBox:**
- Name: `chkXXXXX`
- Caption: Display text
- Value: False (default)

**CommandButton:**
- Name: `cmdXXXXX`
- Caption: Display text
- Font: Calibri, 11, Bold

---

## TESTING CHECKLIST

After adding controls, verify:

- [ ] All control names match the list above (case-sensitive!)
- [ ] All required controls added (marked with *)
- [ ] ComboBox items added (Stories, Roof Load, Siding)
- [ ] Default values set (Builder, Elevations)
- [ ] MultiLine enabled for txtNotes
- [ ] Form saved

---

## IF YOU GET ERRORS

**"Object required" or "Variable not defined"**
→ Control name doesn't match the code
→ Check spelling and capitalization

**"Invalid use of property"**
→ Wrong control type (e.g., TextBox instead of ComboBox)

**Form opens but is blank**
→ Controls were deleted or not saved
→ Rebuild controls

---

## CONTROL COUNT

**Minimum**: ~15 controls (for testing)
**Full Version**: ~35 controls (complete form)

Start with minimum, test it works, then add more!

---

**File**: frmPlanIntake
**Code File**: PlanIntakeForm.bas
**Helper Module**: modPlanIntake.bas
