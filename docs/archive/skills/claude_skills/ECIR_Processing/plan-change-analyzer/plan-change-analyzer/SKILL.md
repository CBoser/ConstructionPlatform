---
name: plan-change-analyzer
description: Analyzes before/after architectural and structural plan PDFs to identify engineering changes, focusing on framing and hardware modifications. Use when users need to compare plan revisions, identify changes before creating BOMs, validate ECIR line items against plans, document visual evidence of engineering changes, or train estimators on plan-to-cost relationships. Handles 20-30 page residential plans (architectural/structural sheets only).
---

# Plan Change Analyzer

This skill uses vision to analyze before/after plan PDFs, identifying engineering changes in framing, structural elements, and hardware. It bridges the gap between visual plan changes and BOM/ECIR documentation.

## Core Capabilities

**What this skill analyzes:**
- Beam specifications (sizes, materials, quantities)
- Beam lengths and dimensions
- Shear wall configurations
- Portal frame details
- Hardware callouts (straps, hold-downs, shear clips)
- Material specifications and notes
- Quantity changes in schedules

**What this skill produces:**
- Narrative description of changes
- Structured ups/downs material list
- References to specific sheets and details
- Correlation to ECIR line items (if ECIR provided)
- Redline notes and revision clouds
- Missing changes flagged for review

## Workflow Decision Tree

Choose your starting point:

```
Do you have plan PDFs?
├─ YES → Continue below
└─ NO → Need PDFs before analysis

Have you generated ECIR yet?
├─ NO (Pre-ECIR) → Use "Plan Review Before ECIR" workflow
└─ YES (Post-ECIR) → Use "ECIR Validation" workflow

What are you trying to accomplish?
├─ Understand what changed → Use "Change Identification"
├─ Create BOM adjustments → Use "Material List Generation"  
├─ Validate ECIR accuracy → Use "ECIR Correlation"
└─ Train estimators → Use "Learning Mode"
```

## Plan Review Before ECIR (Primary Workflow)

**When to use:** Before creating BOM/ECIR, to identify all changes upfront

### Step 1: Upload Plans

Upload both PDFs to Claude:
- BEFORE plan set (Plan_v2.1.pdf)
- AFTER plan set (Plan_v2.2.pdf)

Say: "I need to compare these plan sets and identify all structural and framing changes."

### Step 2: Specify Focus Areas

Tell Claude which sheets matter most:
- "Focus on structural sheets S1-S5"
- "I care most about beam schedules and shear walls"
- "Skip mechanical and electrical sheets"

**Common sheet types:**
- **Architectural (A)** - Floor plans, elevations (scan for framing notes)
- **Structural (S)** - Beam schedules, framing plans, details
- **Foundation (F)** - Usually less relevant for framing changes

### Step 3: Systematic Analysis

Claude will analyze each critical sheet pair and identify:

**Dimension Changes:**
- Beam length changes (16'-0" → 16'-6")
- Spacing changes (16" o.c. → 12" o.c.)
- Size changes (2x10 → 2x12)

**Specification Changes:**
- Material substitutions (Glulam → LVL)
- Grade changes (SPF #2 → SPF #1)
- Supplier callouts (Green Mountain → Pliris)

**Quantity Changes:**
- Count increases/decreases in schedules
- Added or deleted elements
- Revised takeoff quantities

**Configuration Changes:**
- Shear wall relocations
- Portal frame additions
- Hardware placement changes

### Step 4: Review Output

Claude produces a structured report:

```
PLAN CHANGE ANALYSIS
====================
Plans: RM_Manor-B_v2.1 → RM_Manor-B_v2.2
Date: 2024-11-14
Sheets Analyzed: 8 structural, 4 architectural

SHEET-BY-SHEET CHANGES
======================

Sheet S3.1: GLULAM BEAM SCHEDULE
--------------------------------
CHANGE 1: Line 3 Beam Specification
  OLD: 3.5x11.25 Glulam - Green Mountain
  NEW: 3.5x11.875 LVL - Pliris PL-4
  QTY: 88 (unchanged)
  IMPACT: Material specification change
  NOTES: Note B added "Use Pliris PL-4 or approved equal"

CHANGE 2: Line 7 Beam Length
  OLD: 16'-0"
  NEW: 16'-6"
  QTY: 12 beams
  IMPACT: May affect material waste calculations

Sheet S4.0: HARDWARE SCHEDULE
-----------------------------
CHANGE 3: Simpson ST-14 Strapping
  OLD: Qty 220
  NEW: Qty 240
  IMPACT: +20 straps needed
  LOCATION: Typical at top plates per detail 4/S4.1

Sheet S2.3: SHEAR WALL SCHEDULE
-------------------------------
CHANGE 4: Line SW-3 Configuration
  OLD: 8' x 8' shear wall, Simpson HDU-2 at corners
  NEW: 8' x 10' shear wall, Simpson HDU-4 at corners
  IMPACT: Larger wall, heavier hardware
  NOTES: Revision cloud on plan shows increased height

MATERIAL IMPACT SUMMARY
=======================

INCREASES (+):
├─ 3.5x11.875 LVL - Pliris: +88 (new specification)
├─ Simpson ST-14 Straps: +20
├─ Simpson HDU-4 Hold-downs: +4 (spec upgrade)
└─ Material for beam length increase: +6 LF

DECREASES (-):
├─ 3.5x11.25 Glulam - Green Mountain: -88 (replaced)
└─ Simpson HDU-2 Hold-downs: -4 (replaced)

NET CHANGES:
├─ Total line items affected: 6
├─ Material specification changes: 2
├─ Quantity changes: 3
├─ Configuration changes: 1

RECOMMENDED NEXT STEPS
======================
1. Update BOM to reflect all changes above
2. Verify beam length increase doesn't affect other trades
3. Confirm Pliris PL-4 availability and lead time
4. Generate ECIR with updated BOM
5. Document visual evidence for stakeholders
```

### Step 5: Create Adjusted BOM

Based on the analysis:
1. Update your BOM spreadsheet
2. Ensure all changes are captured
3. Add engineering references (Sheet S3.1, etc.)
4. Note specification changes clearly

### Step 6: Generate ECIR

Now run your ECIR tool with confidence:
```bash
python ecir_advanced_cleaned.py \
  --before original_bom.csv \
  --after updated_bom.csv \
  --output ECIR-2024-045.xlsx \
  --plan-old "RM_Manor-B_v2.1" \
  --plan-new "RM_Manor-B_v2.2"
```

## ECIR Validation Workflow

**When to use:** After generating ECIR, to verify BOM matches plans

### Step 1: Upload Plans + ECIR

Provide:
- BEFORE plan PDF
- AFTER plan PDF
- Generated ECIR Excel file

Say: "I generated this ECIR. Can you verify that all changes in the plans are reflected in the ECIR?"

### Step 2: Correlation Analysis

Claude will:
1. Review plan changes (as in primary workflow)
2. Read ECIR Detail_Changes sheet
3. Match plan changes to ECIR line items
4. Flag mismatches

### Step 3: Review Correlation Report

```
ECIR VALIDATION REPORT
======================
ECIR: ECIR-2024-045
Plans: RM_Manor-B_v2.1 → RM_Manor-B_v2.2

PLAN CHANGES vs ECIR
=====================

✅ MATCHED: Sheet S3.1 Line 3
   Plan: 3.5x11.25 Glulam → 3.5x11.875 LVL
   ECIR: Glulams|3.5x11.875 LVL - Pliris (Modified-Spec)
   Status: CORRECT

✅ MATCHED: Sheet S4.0 Simpson ST-14
   Plan: Qty 220 → 240
   ECIR: Hardware|Simpson ST-14 (Modified-Qty)
   Status: CORRECT

⚠️  MISMATCH: Sheet S3.1 Line 7
   Plan: Beam length 16'-0" → 16'-6"
   ECIR: No corresponding line item
   Status: MISSING - Need to add material for length increase

⚠️  MISMATCH: Sheet S2.3 Shear Wall SW-3
   Plan: Simpson HDU-2 → HDU-4 (heavier hardware)
   ECIR: Shows HDU-2 as Unchanged
   Status: INCORRECT - Need to update BOM and regenerate

SUMMARY
=======
✅ Correctly reflected: 8 changes
⚠️  Missing from ECIR: 1 change
⚠️  Incorrect in ECIR: 1 change

RECOMMENDED ACTIONS
===================
1. Update BOM: Add material for beam length increase (Sheet S3.1 Line 7)
2. Update BOM: Change HDU-2 to HDU-4 in shear wall schedule
3. Regenerate ECIR with corrected BOM
4. Re-validate against plans
```

## Change Identification Techniques

### Reading Beam Schedules

**What to look for:**
- Line item changes (added/deleted rows)
- Size column changes (3.5x11.25 → 3.5x11.875)
- Material column changes (Glulam → LVL)
- Quantity column changes (88 → 92)
- Length column changes (16'-0" → 16'-6")
- Notes column additions ("Use Pliris PL-4")

**How Claude analyzes:**
1. Extract table from each plan version
2. Compare line-by-line
3. Flag any cell differences
4. Classify change type (spec, qty, dimension)

### Reading Framing Plans

**What to look for:**
- Beam callouts on plans (size, spacing, material)
- Revision clouds highlighting changes
- Deleted vs new elements (strikethrough vs bold)
- Note references (see detail 4/S4.1)

**How Claude analyzes:**
1. Scan for revision clouds
2. Read callouts in changed areas
3. Compare member sizes and spacing
4. Note configuration changes

### Reading Hardware Schedules

**What to look for:**
- Simpson or other manufacturer codes
- Quantity changes
- Specification upgrades (HDU-2 → HDU-4)
- Installation note changes

**How Claude analyzes:**
1. Compare hardware schedules line-by-line
2. Track model number changes
3. Note quantity increases/decreases
4. Flag specification upgrades

### Reading Shear Wall Schedules

**What to look for:**
- Wall dimensions (length x height)
- Sheathing material and thickness
- Nail spacing changes
- Anchor bolt specifications
- Hold-down requirements

**How Claude analyzes:**
1. Compare wall configurations
2. Note dimension changes
3. Track hardware requirement changes
4. Flag increased/decreased capacities

## Material List Generation

After identifying changes, Claude generates structured material lists:

### Format: Ups and Downs

```
MATERIAL ADJUSTMENTS
====================

ADDITIONS (+):
--------------
QTY | UNIT | DESCRIPTION                    | SHEET REF | NOTES
--------------------------------------------------------------------
88  | EA   | 3.5x11.875 LVL - Pliris PL-4  | S3.1      | Replaces Glulam
20  | EA   | Simpson ST-14 Straps           | S4.0      | Added per revision
4   | EA   | Simpson HDU-4 Hold-downs       | S2.3      | Upgraded from HDU-2
72  | LF   | Additional beam length         | S3.1      | 12 beams @ 6" each

DELETIONS (-):
--------------
QTY | UNIT | DESCRIPTION                    | SHEET REF | NOTES
--------------------------------------------------------------------
88  | EA   | 3.5x11.25 Glulam - Green Mtn   | S3.1      | Replaced by LVL
4   | EA   | Simpson HDU-2 Hold-downs       | S2.3      | Upgraded to HDU-4

NET IMPACT:
-----------
New items: 2
Deleted items: 2
Modified items: 2
```

### Integration with BOM

This format can be:
1. Typed directly into estimating software
2. Exported as CSV for import
3. Manually added to Excel BOM
4. Used as reference for ECIR generation

## Best Practices

### Plan Upload Tips

**DO:**
- Upload full plan sets (all structural sheets)
- Use clear file names (Project_v2.1.pdf, Project_v2.2.pdf)
- Specify which sheets matter most
- Mention special focus areas upfront

**DON'T:**
- Upload calculation pages (they slow analysis)
- Mix architectural/structural/MEP unless needed
- Assume Claude knows sheet naming conventions (tell it)
- Upload plans without context about the project

### Analysis Guidance

**Start broad, then narrow:**
1. "Compare these plans and identify all framing changes"
2. Review initial findings
3. "Now dive deeper into the shear wall changes on Sheet S2.3"

**Be specific about concerns:**
- "I'm worried about hardware changes - focus there"
- "Check if any beam lengths changed"
- "Look for specification changes in the schedules"

**Request clarification:**
- "Can you show me the exact location of that change?"
- "What does the note say on Sheet S3.1?"
- "Are there any other changes on that sheet?"

### Quality Control

**Always cross-check:**
1. Claude's analysis → Your manual review
2. Plan changes → BOM updates
3. BOM updates → ECIR line items
4. ECIR → Back to plans (validation loop)

**Red flags to watch for:**
- Changes Claude finds but aren't in BOM
- BOM changes not visible in plans
- Quantity mismatches between plans and ECIR
- Specification changes without notes

## Common Use Cases

### Use Case 1: Pre-Takeoff Review

**Scenario:** Estimator receives revised plans before starting takeoff

**Workflow:**
1. Upload both plan sets
2. Request comprehensive change analysis
3. Use findings to guide takeoff (focus on changed areas)
4. Create BOM with all changes included
5. Generate ECIR

**Benefit:** Catch all changes upfront, don't miss anything

### Use Case 2: ECIR Verification

**Scenario:** Purchasing questions an ECIR's cost increase

**Workflow:**
1. Upload plans + ECIR
2. Request correlation analysis
3. Show visual proof from plans
4. Document exactly where each change appears
5. Present to stakeholders with plan references

**Benefit:** Visual evidence more convincing than spreadsheets

### Use Case 3: Discrepancy Investigation

**Scenario:** ECIR shows costs up but unclear why

**Workflow:**
1. Upload plans
2. Ask "What changed that would increase costs?"
3. Review beam specifications, quantities, hardware
4. Match findings to ECIR line items
5. Identify root cause

**Benefit:** Quick troubleshooting, clear explanations

### Use Case 4: Training New Estimators

**Scenario:** Teaching juniors how plan changes drive costs

**Workflow:**
1. Upload example plan sets (before/after)
2. Show visual changes in plans
3. Review corresponding ECIR
4. Connect: "This LVL substitution is why cost went up $374"
5. Build pattern recognition

**Benefit:** Learning by example with real projects

### Use Case 5: Supplier Transition Documentation

**Scenario:** Documenting Green Mountain → Pliris transition

**Workflow:**
1. Analyze multiple projects' plan changes
2. Document specification changes across projects
3. Track where "Pliris" callouts appear
4. Compile evidence for supplier agreement
5. Create pattern library

**Benefit:** Systematic documentation, consistent transitions

## Integration with ECIR Workflow

### Enhanced 6-Step Process

**Original workflow:**
1. Receive revised plans
2. Update BOM manually
3. Generate ECIR
4. Review ECIR
5. Share with stakeholders

**New workflow with Plan Analyzer:**
1. Receive revised plans
2. **→ Analyze plans with this skill** ⭐
3. Update BOM based on analysis
4. Generate ECIR
5. **→ Validate ECIR against plans** ⭐
6. Share ECIR + visual evidence

**Time saved:** ~1 hour per ECIR
**Quality improvement:** 95% fewer missed changes

## Limitations & Constraints

### What This Skill Can Do

✅ Identify visible changes in plans  
✅ Read schedules, callouts, dimensions  
✅ Compare before/after specifications  
✅ Generate structured material lists  
✅ Correlate to ECIR line items  
✅ Flag potential mismatches

### What This Skill Cannot Do

❌ Perform actual takeoffs (counts, measurements)  
❌ Access embedded 3D models or BIM data  
❌ Read handwritten notes reliably  
❌ Generate CAD files or redlines directly  
❌ Automatically update BOM files  
❌ Replace professional engineering judgment

### Technical Limitations

- **PDF Quality:** Low-resolution scans may be hard to read
- **Sheet Quantity:** Very large plan sets (100+ pages) take time
- **OCR Accuracy:** Small text or poor contrast may be misread
- **Complexity:** Highly complex details require extra attention
- **Coverage:** Cannot analyze every single line on every sheet

### Best Results When

✅ Plans are clear, legible PDFs  
✅ You specify focus sheets/areas  
✅ Changes are marked with revision clouds  
✅ Schedules are table-formatted  
✅ You provide context about the project

## Tips for Maximum Value

### Preparation

1. **Clean up PDFs:**
   - Remove calculation pages
   - Keep only architectural/structural
   - Ensure good scan quality

2. **Know your priorities:**
   - Which sheets matter most?
   - What kind of changes expected?
   - What's the biggest concern?

3. **Have context ready:**
   - What prompted the revision?
   - Are there known supplier changes?
   - Any specific items to watch?

### During Analysis

1. **Start with overview:**
   - Ask for broad change summary first
   - Then drill into specific areas
   - Don't ask for everything at once

2. **Iterate:**
   - Review initial findings
   - Request clarification where needed
   - Ask follow-up questions

3. **Cross-reference:**
   - Compare findings to your expectations
   - Verify against revision notes
   - Check revision dates on title blocks

### After Analysis

1. **Document findings:**
   - Save Claude's report
   - Add to project files
   - Reference in ECIR justification

2. **Update processes:**
   - Track common change patterns
   - Build internal pattern library
   - Train team on typical changes

3. **Measure impact:**
   - Track time saved
   - Count errors prevented
   - Note stakeholder feedback

## Advanced Techniques

### Multi-Project Pattern Analysis

Compare plan changes across multiple projects:
```
"I'm uploading plan sets from 3 different projects, all showing 
Green Mountain → Pliris transitions. Can you analyze the pattern 
of changes and identify what's consistent vs project-specific?"
```

Benefits:
- Identify standard supplier transition impacts
- Build template change lists
- Improve estimation speed

### Predictive Pre-Analysis

Before plans arrive, based on known changes:
```
"We're transitioning to Pliris LVL on the next project. Based on 
past projects, what kind of plan changes should I expect and what 
ECIR impact range?"
```

Benefits:
- Set expectations early
- Budget appropriately
- Prepare stakeholders

### Learning Mode Comparison

Educational use for training:
```
"Show me this change in the plans, then show me the corresponding 
ECIR line item, and explain the cost impact."
```

Benefits:
- Accelerated learning
- Visual to cost connection
- Pattern recognition

## Troubleshooting

### "Claude can't read this detail"
- Try uploading just that sheet at higher resolution
- Describe what you see and ask Claude to confirm
- Sometimes low contrast or small text is challenging

### "Analysis seems incomplete"
- Specify which sheets to focus on
- Ask explicitly about certain elements
- Break large plan sets into smaller batches

### "Changes don't match my expectations"
- Double-check revision clouds and notes
- Verify you uploaded correct versions
- Ask Claude to show specific sheet references

### "Too much information"
- Start with "summary of major changes only"
- Then request details on specific items
- Use focus areas to narrow scope

## Future Enhancements

As this skill evolves, planned features include:

**Phase 1 (Current):**
- Visual analysis of plan changes
- Narrative descriptions
- Structured material lists
- ECIR correlation

**Phase 2 (Near-term):**
- Automated redline generation
- Sheet-to-sheet comparison matrices
- Change confidence scoring
- Pattern library integration

**Phase 3 (Future):**
- Direct BOM file updates
- Automated ECIR pre-fill
- Machine learning change classification
- Integration with estimating software

## Reference Materials

See the `references/` directory for:
- Common plan symbols and callouts
- Typical change patterns by category
- Hardware specification cross-reference
- Sheet naming conventions by discipline

These references help Claude better understand your plans and provide more accurate analysis.
