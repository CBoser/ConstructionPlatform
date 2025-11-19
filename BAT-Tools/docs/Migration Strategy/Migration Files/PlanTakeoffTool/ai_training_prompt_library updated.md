# 🧠 MH 1708 Estimating Workflow – AI Training Guide

This guide transforms your existing takeoff videos into structured AI-training lessons and standardized estimator workflows. Each module builds on the last to create a fully documented digital estimator process.

---

## 🎯 Overview

**Purpose:** Train AI systems and new estimators to understand, replicate, and optimize your full takeoff and pricing workflow using standardized logic, terminology, and structure.

**Training Source Videos:**

1. *Building the Second Floor – Framing & Design Insights*
2. *Second Floor Joist System Overview and Planning*
3. *Roof Takeoffs and Elevation Planning*
4. *Inputting Pricing for the 1708 Exterior Unit*
5. *MH 1708 Elevation A Siding Takeoff*

**Core Objectives:**

* Standardize takeoff processes for repeatable accuracy.
* Train AI and staff to interpret patterns, materials, and plan logic.
* Reduce redundant manual entry and regenerate totals automatically.
* Establish a foundation for Power Automate and Excel/VBA integration.

---

## 🧩 Module 1 – Setup & Calibration

**Focus:** Preparing the workspace and plan environment before any measurement.

**Goal:** Ensure every takeoff starts from a calibrated, error-free foundation.

**Tools:** PlanSwift (Area & Linear Tools), Excel, Power Automate, SharePoint.

**Steps:**

1. Confirm correct scale on import (⅛″ per ft default).
2. Apply project template folder: `1708_Base_Template` → Floors / Walls / Roof / Siding / Hardware.
3. Verify naming conventions (Elevation A/B, Interior/Exterior Units).
4. Remove unnecessary packages and export filter logic.
5. Initialize ReadyFrame constant (0.45 default) in Excel for automated reference.

**AI Tag Goals:** `scale_verification`, `naming_standardization`, `data_filtering`, `template_initialization`.

**Common Errors:** Incorrect scale, duplicate package names, missing template linkage.

---

## 🏗️ Module 2 – Floor & Wall Framing

**Focus:** Constructing the second floor structure including joists, walls, and hardware.

**Goal:** Create accurate takeoffs for framing assemblies with automated quantity regeneration.

**Key Elements:**

* 2×12 floor joists @16” O.C.
* LSL rimboard integration.
* Blocking 48” O.C.
* MSTC40 straps, A35 connectors, LUS/HUS hangers.

**Workflow Highlights:**

1. Start from architectural “S7” sheet – confirm joist type & hanger schedule.
2. Use area tool for decking, linear for rimboard.
3. Label blocking zones (2×12, 48” O.C.) and mark double joist conditions.
4. Automate regeneration via macro or button-click event.
5. Save framing logic as `Component_Catalog` entry (for future automation reuse).

**AI Tag Goals:** `joist_logic`, `rimboard_validation`, `blocking_automation`, `hardware_insertion`.

**Common Errors:**

* Rimboard mismatch (2×10 vs 2×12).
* Missing hangers in double-joist conditions.
* Manual recalculation of totals instead of automated regeneration.

---

## 🏠 Module 3 – Roof Framing & Sheathing

**Focus:** Calculating roof structure, fire-treated zones, and shear wall hardware.

**Goal:** Standardize roof takeoff logic, slope-based sheathing rules, and LS50 placement.

**Core Data Points:**

* Elevation A: 5:12 pitch (main) / 8:12 pitch (overbuild).
* Waste Factors: 15% standard / 20–25% for complex cuts.
* Fire-Treated Plywood: within 4 ft of property line.
* Gable sheathing: 4×8 / 4×9 panels @ 10 ft wall height.

**Workflow Highlights:**

1. Separate Elevations A/B into unique roof packs.
2. Apply correct pitch before measuring.
3. Tag fire-treated areas; use color code for AI visibility.
4. Insert LS50 straps (A=48” OC, B=30”, D=16”, F=8”).
5. Confirm soffit type: vented vs solid (per plan proximity).

**AI Tag Goals:** `roof_pitch_detection`, `fire_zone_mapping`, `soffit_type_classification`, `hardware_distribution`.

**Common Errors:**

* Incorrect scale at roof plan.
* Unmarked fire-treated zones.
* Mixed soffit conditions in shared elevation packs.

---

## 🪚 Module 4 – Siding, Trim & Soffit

**Focus:** Measuring siding areas, trim runs, and soffit details for Elevation A.

**Goal:** Automate separation of material categories and apply standard waste logic.

**Workflow Highlights:**

1. Verify scale and pitch alignment (8 ft wall, 10 ft gables).
2. Area tool for SmartSide siding – apply 15% waste.
3. Linear tool for trim (5/4×4, 5/4×6, fascia, corner boards).
4. Separate vented vs solid soffits.
5. Export totals into Excel categories:

   * Smart Lap Siding (SF)
   * Smart Trim (LF)
   * Smart Soffit (SF)
   * Accessories (EA)

**AI Tag Goals:** `siding_area_measurement`, `trim_classification`, `soffit_segmentation`, `waste_factor_standardization`.

**Common Errors:**

* Double-counted gables.
* Missed fire-rated soffit under 4 ft proximity rule.
* Trim overlap mismatch (e.g., 5/4×6 used instead of 5/4×4).

---

## 💲 Module 5 – Pricing Integration

**Focus:** Cleaning, consolidating, and pricing material exports.

**Goal:** Streamline manual entry and reduce redundancy across Exterior/Interior scopes.

**Workflow Highlights:**

1. Export to Excel using “Use SKU to consolidate tallied items.”
2. Filter by Exterior vs Interior scope.
3. Apply formulas:

   * ReadyFrame = `SquareFootage * 0.45`
   * Ext Price = `Qty * Unit Price`
4. Auto-check for missing unit prices (highlight blank cells red).
5. Duplicate and adjust Interior Units sheet (apply 0.5x or 2x logic where needed).

**AI Tag Goals:** `pricing_cleanup`, `scope_filtering`, `readyframe_calc`, `cost_validation`.

**Common Errors:**

* Misapplied scope filters.
* Duplicate ReadyFrame constants.
* Missing hangers or hardware in export sheet.

---

## 🔍 Module 6 – QA & Continuous Improvement

**Focus:** Validation, optimization, and iterative AI training.

**Goal:** Establish automated QA loops to verify material accuracy and learn from corrections.

**Verification Checklist:**

* [ ] All elevations calibrated and named correctly.
* [ ] Hardware matches structural sheet (A35 → LS50 substitutions logged).
* [ ] Fire-treated sheathing only where required.
* [ ] Waste %s consistent across trades.
* [ ] No double-counted or orphan assemblies.

**Automation Opportunities:**

* Power Automate triggers on file export → auto QA summary.
* VBA macro: “Regenerate Totals + Color-Code Errors.”
* AI model retraining every 10 projects using logged corrections.

**AI Tag Goals:** `error_detection`, `pattern_learning`, `process_refinement`.

---

## 🧭 Next Steps

1. **Refine Inputs:** Segment each video into 2–4 minute topic clips for micro-learning.
2. **Add Reference Tables:** Include SKUs, hardware lists, and waste factors in a linked Excel knowledge base.
3. **Train the AI:** Upload labeled datasets per module with voiceover transcription for contextual cues.
4. **Integrate Power Automate:** Use Flow triggers to pull data from Excel exports for training reinforcement.

---

### ⚙️ Long-Term Vision

* Every takeoff video becomes an automated, teachable blueprint.
* The AI learns framing, siding, and pricing logic directly from your voice and cursor behavior.
* Estimators can interact with an AI assistant trained on your process, asking:

  > “Show me the LS50 spacing logic for Elevation A roofs.”
  > “What’s the ReadyFrame multiplier for the 1708 plan?”

---

**Author:** Corey Boser  
**Version:** v1.0  
**Date:** October 2025

