# Common Construction Plan Symbols and Callouts

This reference helps identify and interpret structural and framing elements in residential construction plans.

## Beam and Header Callouts

### Standard Format
```
[SIZE] [MATERIAL] [GRADE] @ [SPACING]
Example: 3.5x11.25 GLB DF #1 @ 16" O.C.
```

### Material Abbreviations
- **GLB** or **GLULAM** - Glue-laminated beam
- **LVL** - Laminated veneer lumber
- **PSL** - Parallel strand lumber
- **LSL** - Laminated strand lumber
- **SPF** - Spruce-Pine-Fir lumber
- **DF** - Douglas Fir
- **HEM-FIR** - Hemlock-Fir

### Grades
- **#1**, **#2**, **#3** - Lumber grades (higher is better)
- **SELECT STRUCTURAL** - Highest grade for lumber
- **2.0E**, **2.1E** - E-ratings for engineered lumber

### Common Sizes
- **3.5x9.25** - Typical LVL for residential
- **3.5x11.25** - Heavier load LVL
- **3.5x11.875** - Common glulam size
- **5.125x12** - Large beams for long spans
- **2x10**, **2x12** - Dimensional lumber headers

## Hardware Callouts

### Simpson Strong-Tie (Most Common)

**Hold-Downs:**
- **HDU2** - 2,925 lb capacity
- **HDU4** - 4,730 lb capacity
- **HDU8** - 7,425 lb capacity
- **HDQ8** - 9,425 lb capacity (heavy duty)

**Straps:**
- **ST12** - 12" strap, light duty
- **ST14** - 14" strap, standard
- **ST18** - 18" strap, heavy duty
- **MST** - Twisted straps for blocking

**Connectors:**
- **LUS** - Joist hanger (2x lumber)
- **HUS** - Heavy duty joist hanger
- **LSU** - Light joist hanger
- **HTT** - Top flange hanger

**Shear Clips:**
- **H1** - Single stud shear clip
- **H2.5** - Heavier shear clip
- **A35** - Framing angle/clip

**Post Bases/Caps:**
- **ABU** - Adjustable post base
- **BC** - Post cap
- **CB** - Column base

### Other Manufacturers
- **USP** - Similar product line to Simpson
- **MiTek** - Truss plates and connectors
- **TimberLOK** - Structural wood screws
- **GRK** - Structural screws

## Shear Wall Symbols

### Wall Types
```
⊞ or ╬ - Shear wall (cross-hatched)
╫ - Portal frame
⊟ - Window opening in shear wall
```

### Callouts Format
```
SW-1 (8x8) 15/32 WSP @ 4/12
│    │     │         │
│    │     │         └─ Nail spacing (edge/field)
│    │     └─ Sheathing material & thickness
│    └─ Dimensions (length x height in feet)
└─ Wall designation
```

### Common Sheathing
- **WSP** - Wood structural panel (OSB or plywood)
- **15/32** - Standard sheathing thickness
- **19/32** - Thicker sheathing for higher loads
- **7/16** - Thinner sheathing for light loads

### Nail Spacing
- **6/12** - 6" on edges, 12" in field (very strong)
- **4/12** - 4" on edges, 12" in field (strong)
- **3/12** - 3" on edges, 12" in field (very strong)
- **2/12** - 2" on edges, 12" in field (maximum)

## Portal Frame Symbols

```
┌─────────────┐
│  PF-1       │  Portal frame callout
│  HDU8 EA END│  Hold-down at each end
│  16' WIDE   │  Opening width
└─────────────┘
```

### Components
- **Header** - Beam over opening
- **King studs** - Full-height studs beside opening
- **Hold-downs** - Anchors at base of king studs
- **Straps** - At top of header

## Revision Symbols

### Revision Clouds
```
    ~~~~~~~~~~~
  ~~           ~~
 ~               ~
~   REVISED      ~
~   AREA         ~
 ~               ~
  ~~           ~~
    ~~~~~~~~~~~
```
- **Cloud** - Encloses changed area
- **Triangle** - Points to change
- **Note** - Usually nearby explaining change

### Revision Indicators
- **REVISED:** or **REV:** - Marks changed notes
- **BOLD** - New elements
- **STRIKETHROUGH** - Deleted elements
- **Dashed lines** - Removed in future phase

### Revision Deltas
```
△1  First revision
△2  Second revision
△3  Third revision
```

## Dimension Formats

### Feet and Inches
- **16'-0"** - 16 feet, zero inches
- **16'-6"** - 16 feet, 6 inches
- **8'-3 1/4"** - 8 feet, 3 and 1/4 inches

### Spacing Notation
- **@ 16" O.C.** - At 16 inches on center
- **@ 12" O.C.** - At 12 inches on center
- **@ 24" O.C.** - At 24 inches on center
- **@ 19.2" O.C.** - At 19.2 inches on center (for engineered)

### Angles
- **90°** - Right angle
- **45°** - Common roof pitch angle
- **12/12** - Roof pitch (rise/run)

## Sheet Naming Conventions

### Discipline Codes
- **A** - Architectural
- **S** - Structural
- **M** - Mechanical
- **E** - Electrical
- **P** - Plumbing
- **L** - Landscape
- **C** - Civil

### Common Structural Sheets
- **S1.0 or S1.1** - Foundation plan
- **S2.0 or S2.1** - Floor framing plan
- **S2.2 or S2.3** - Shear wall schedule
- **S3.0 or S3.1** - Beam schedule
- **S3.2** - Glulam/LVL schedule
- **S4.0** - Hardware schedule
- **S4.1 or S4.2** - Details
- **S5.0** - Roof framing plan

## Detail References

### Format
```
4/S4.1
│ │
│ └─ Sheet number
└─ Detail number on that sheet
```

### Common Detail Types
- **1/S4.1** - Typical detail 1 on sheet S4.1
- **HD-1** - Hold-down detail 1
- **BM-3** - Beam connection detail 3
- **SW-2** - Shear wall detail 2

## Schedule Reading

### Beam Schedule Format
```
LINE | SIZE      | MATERIAL | QTY | LENGTH | NOTES
-----|-----------|----------|-----|--------|-------
1    | 3.5x11.25 | GLB DF   | 88  | 16'-0" | Note A
2    | 3.5x9.25  | LVL      | 45  | 12'-6" | Note B
```

### Hardware Schedule Format
```
LINE | ITEM        | QTY | LOCATION        | SHEET
-----|-------------|-----|-----------------|-------
1    | Simpson HDU2| 12  | At shear walls  | S2.3
2    | Simpson ST14| 220 | Top plates typ. | S4.1
```

### Shear Wall Schedule Format
```
MARK | SIZE  | SHEATHING   | NAILING | ANCHORS
-----|-------|-------------|---------|--------
SW-1 | 8x8   | 15/32 WSP   | 4/12    | HDU4 EA END
SW-2 | 12x10 | 19/32 WSP   | 3/12    | HDU8 EA END
```

## Load Path Indicators

### Symbols
- **↓** - Load bearing from above
- **↑** - Support/reaction from below
- **⟂** - Post or column
- **═** - Beam (plan view)
- **║** - Wall (plan view)

### Load Transfer
```
ROOF → RAFTERS → BEAM → POST → FOUNDATION
  ↓       ↓        ↓      ↓         ↓
Load  Transfer  Support Point  Ground
```

## Common Notes and Callouts

### Material Notes
- **"TYP."** - Typical (applies to similar conditions)
- **"EA"** or **"EACH"** - Each location
- **"SIM."** - Similar
- **"U.N.O."** - Unless noted otherwise
- **"N.T.S."** - Not to scale

### Construction Notes
- **"VERIFY IN FIELD"** - Contractor to confirm dimensions
- **"SEE STRUCTURAL"** - Refer to structural engineer
- **"CONTINUOUS"** - Extends full length
- **"BLOCKING REQ'D"** - Blocking required at location

### Specification Notes
- **"OR APPROVED EQUAL"** - Similar product acceptable
- **"PER MANUFACTURER"** - Follow product instructions
- **"MIN."** - Minimum requirement
- **"MAX."** - Maximum allowed

## Color Codes (When Used)

Some plan sets use color:
- **Red** - Demolition or removal
- **Blue** - New construction
- **Green** - Existing to remain
- **Purple/Magenta** - Revisions/changes
- **Yellow** - Highlights or attention areas

## Common Change Patterns

### What Triggers Cost Changes

**High Impact:**
- Glulam → LVL (specification upgrade)
- Beam size increase (2x10 → 2x12)
- Hardware upgrade (HDU2 → HDU4)
- Shear wall addition or upgrade
- Increased nail spacing (6/12 → 3/12)

**Medium Impact:**
- Quantity increases (220 → 240 straps)
- Length changes (16'-0" → 16'-6")
- Additional hold-downs
- Portal frame additions

**Low Impact:**
- Note clarifications
- Detail reference changes
- Dimension call-outs (same actual size)
- Non-structural elements

## Tips for Reading Plans

### Start With
1. **Title block** - Project name, date, revision
2. **General notes** - Overall requirements
3. **Legend** - Symbols specific to this plan
4. **Key plan** - Overall building orientation

### Then Review
1. **Floor plans** - Framing layout, beam locations
2. **Schedules** - Beam, hardware, shear wall
3. **Details** - Connection specifications
4. **Sections** - Vertical load path

### Look For
- **Revision clouds** - Changed areas
- **Bold text** - New items
- **Strikethrough** - Deleted items
- **Notes** - Clarifications and changes
- **Date in title block** - Plan version
