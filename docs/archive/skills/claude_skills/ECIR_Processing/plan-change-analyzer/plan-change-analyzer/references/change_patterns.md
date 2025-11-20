# Typical Change Patterns in Residential Construction Plans

This reference catalogs common engineering change patterns observed in production homebuilding, their typical cost impacts, and how they appear in plans.

## Supplier Transitions

### Pattern: Material Specification Change

**Common Example: Glulam → LVL Transition**

**How it appears in plans:**
- Beam schedule shows specification change
- Note added: "Use [New Supplier] or approved equal"
- Same quantities, different material
- May include size change (11.25" → 11.875")

**Plan locations:**
- Sheet S3.1 or S3.2 (Beam/Glulam schedule)
- Framing plans may reference new material
- Detail sheets may update connection notes

**BOM impact:**
- Delete all old supplier items
- Add equivalent new supplier items
- Quantities typically unchanged
- Unit costs different

**Typical cost variance:**
- 3-7% increase (supplier change)
- May be + or - depending on supplier
- Volume affects pricing

**ECIR classification:**
- Modified-Spec (if size/material changes)
- Modified-Cost (if only pricing changes)

**Example from real project:**
```
BEFORE: 88 EA 3.5x11.25 Glulam - Green Mountain @ $18.50
AFTER:  88 EA 3.5x11.875 LVL - Pliris PL-4 @ $22.75
CHANGE: +$374.00 (Modified-Spec)
```

---

## Code Updates

### Pattern: Structural Requirement Increase

**Common Example: Shear Wall Upgrade**

**How it appears in plans:**
- Shear wall schedule shows increased nail spacing
- Or: Increased sheathing thickness
- Or: Additional hold-downs required
- Note: "Per 2024 IBC Section 2305"

**Plan locations:**
- Sheet S2.2 or S2.3 (Shear wall schedule)
- Foundation plan (hold-down anchors)
- Framing plan (wall locations)

**BOM impact:**
- Increased hardware quantities
- Heavier hardware specifications
- Additional strapping
- More anchors/bolts

**Typical cost variance:**
- 2-5% increase (hardware only)
- 5-10% if walls added/enlarged
- Code-driven, non-negotiable

**ECIR classification:**
- Modified-Qty (more hardware)
- Modified-Spec (upgraded hardware)
- Added (new shear walls)

**Example patterns:**
```
NAIL SPACING:
BEFORE: 6/12 (6" edges, 12" field)
AFTER:  4/12 (4" edges, 12" field)
IMPACT: Increased labor, slightly more nails

HOLD-DOWNS:
BEFORE: Simpson HDU2 (2,925 lb capacity)
AFTER:  Simpson HDU4 (4,730 lb capacity)
IMPACT: +$15-25 per unit, 4-12 units typical

SHEATHING:
BEFORE: 15/32" OSB
AFTER:  19/32" OSB
IMPACT: Material cost + ~10% labor
```

---

## Design Refinement

### Pattern: Beam Size Optimization

**Common Example: Beam Size Increase**

**How it appears in plans:**
- Beam schedule shows size change only
- Same material, same supplier
- Quantity may or may not change
- Length may increase

**Plan locations:**
- Sheet S3.1 (Beam schedule)
- Framing plan (updated call-outs)
- Details (connection adjustments)

**BOM impact:**
- Replace smaller beam with larger
- May affect joist hangers
- May affect supporting posts
- Cascading changes possible

**Typical cost variance:**
- 1-3% per size increase
- 2x10 → 2x12 = ~25% cost increase
- Engineered lumber less variation

**ECIR classification:**
- Modified-Spec (size change)
- May trigger Modified-Qty (if lengths different)

**Example:**
```
BEFORE: 45 EA 2x10x12' SPF #2 @ $8.25
AFTER:  45 EA 2x12x12' SPF #2 @ $11.50
CHANGE: +$146.25 (Modified-Spec)

CASCADING:
Also need: Larger joist hangers (LUS210 → LUS212)
Impact: Additional $45 for hardware upgrade
```

---

## Layout Changes

### Pattern: Beam Length Adjustment

**Common Example: Opening Width Change**

**How it appears in plans:**
- Dimension changed on framing plan
- Beam schedule may show length update
- May be marked with revision cloud
- Note may reference architectural change

**Plan locations:**
- Floor framing plan (dimension change)
- Beam schedule (length column)
- Architectural plan (opening size)

**BOM impact:**
- Material cost for extra length
- Waste factor may increase
- May affect next size up
- Labor slightly higher

**Typical cost variance:**
- 0.5-2% depending on magnitude
- Small changes: <$100
- Large changes: $100-500

**ECIR classification:**
- Modified-Qty (if treating as more linear feet)
- Modified-Spec (if different product length)

**Example:**
```
BEFORE: 12 EA Beam @ 16'-0" = 192 LF
AFTER:  12 EA Beam @ 16'-6" = 198 LF
CHANGE: +6 LF material = ~$50-100 depending on beam type

NOTE: May force ordering next size up:
16' beams available stock
17' beams may be special order
Could add lead time and cost
```

---

## Hardware Additions

### Pattern: Increased Strapping/Clips

**Common Example: Top Plate Strap Addition**

**How it appears in plans:**
- Hardware schedule quantity increase
- New detail or note added
- May reference wind load requirements
- Revision cloud on framing plan

**Plan locations:**
- Sheet S4.0 (Hardware schedule)
- Framing plans (strap locations)
- Details (installation requirements)

**BOM impact:**
- Increased hardware count
- Labor increase (installation)
- May need additional fasteners

**Typical cost variance:**
- 1-3% (straps relatively cheap)
- Labor often > material cost
- May indicate larger issue

**ECIR classification:**
- Modified-Qty (more of existing item)
- Added (if new item type)

**Example:**
```
BEFORE: 220 EA Simpson ST14 Straps @ $1.05
AFTER:  240 EA Simpson ST14 Straps @ $1.05
CHANGE: +20 straps = $21.00 material
        +Labor: ~$40 (20 straps @ $2/EA labor)
TOTAL:  +$61.00
```

---

## Portal Frame Changes

### Pattern: Portal Frame Addition

**Common Example: Garage Door Opening Reinforcement**

**How it appears in plans:**
- New portal frame callout
- Heavy duty hold-downs specified
- Larger header beam
- Revision cloud at opening

**Plan locations:**
- Framing plan (portal frame location)
- Shear wall schedule (portal details)
- Foundation plan (anchor requirements)

**BOM impact:**
- Large beam (portal header)
- Heavy hold-downs (HDU8 or larger)
- Straps at top
- Installation hardware

**Typical cost variance:**
- 3-8% impact if multiple portals
- Single portal: $300-800 material
- Labor significant: $200-400

**ECIR classification:**
- Added (new portal frame)
- Modified-Spec (upgraded header)

**Example:**
```
PORTAL FRAME MATERIALS:
1 EA 5.125x16 LVL @ 18' = $450
2 EA Simpson HDU8 Hold-downs = $180
2 EA Simpson ST18 Straps = $25
Fasteners and misc = $45
TOTAL MATERIAL: $700
LABOR: ~$300
FULL IMPACT: ~$1,000
```

---

## Quantity Changes Without Spec Changes

### Pattern: Count Adjustment

**Common Example: More of Same Item**

**How it appears in plans:**
- Schedule shows quantity change only
- Everything else identical
- May have note: "Qty verified"
- Small revision note

**Plan locations:**
- Hardware or beam schedule
- Rarely visible on plans themselves
- May be in general notes

**BOM impact:**
- Simply more/less of item
- No specification change
- Straightforward adjustment

**Typical cost variance:**
- Varies with item cost
- Usually <5% of total
- May indicate design iteration

**ECIR classification:**
- Modified-Qty (only quantity changed)

**Example:**
```
BEFORE: 88 EA 3.5x11.875 LVL @ $22.75 = $2,002
AFTER:  92 EA 3.5x11.875 LVL @ $22.75 = $2,093
CHANGE: +4 EA = $91.00 (Modified-Qty)

TYPICAL REASONS:
- Recount/verification
- Small layout adjustment
- Mistake correction
- Additional beam added
```

---

## Foundation Changes

### Pattern: Footing Size Increase

**Common Example: Increased Load Requirements**

**How it appears in plans:**
- Foundation plan shows larger footings
- May show additional piers
- Anchor bolt schedule may change
- Note references increased loads

**Plan locations:**
- Sheet S1.0 or S1.1 (Foundation plan)
- Detail sheets (footing details)
- May reference S3 beam changes

**BOM impact:**
- More concrete
- Larger anchor bolts
- More rebar
- Excavation change

**Typical cost variance:**
- 1-4% (foundation changes expensive)
- Concrete: ~$150/CY
- Labor significant
- Often done early

**ECIR classification:**
- Modified-Spec (larger footings)
- Modified-Qty (more concrete)

**Example:**
```
BEFORE: 12" x 24" footing
AFTER:  18" x 24" footing
IMPACT: 50% more concrete per LF
        Heavier rebar
        Wider excavation
TYPICAL: $200-500 per footing
```

---

## Multi-Change Events

### Pattern: Cascading Changes

**Common Example: Supplier Change + Code Update + Layout Change**

**How it appears in plans:**
- Multiple revision clouds
- Several sheets affected
- Complex revision note
- May span multiple disciplines

**Plan locations:**
- Multiple structural sheets
- May affect architectural too
- Coordination notes added

**BOM impact:**
- Compound effect of all changes
- May have synergies or conflicts
- Requires careful tracking
- Often highest cost impact

**Typical cost variance:**
- 8-15% (major revision)
- Each change adds
- May have economies of scale
- Requires full re-estimate

**ECIR classification:**
- Multiple status types
- Complex to categorize
- May need special handling

**Example:**
```
PROJECT: Manor-B Revision 2.2

CHANGES:
1. Supplier: Green Mountain → Pliris (+$374)
2. Code: Shear wall upgrade (+$280)
3. Layout: Beam lengths increased (+$125)
4. Hardware: Additional straps (+$61)
5. Foundation: Larger footings (+$340)

TOTAL DIRECT: +$1,180
WITH O&P (25%): +$1,475
PERCENTAGE: 7.2% increase

COMBINED EFFECT:
Individual changes manageable
Compound impact significant
Multiple sheets revised
Long revision note in plans
```

---

## Timing-Based Patterns

### Early Changes (Before Construction)
- Usually design optimization
- Lower cost to implement
- More flexibility
- Often cost-reducing

### Mid-Construction Changes
- Usually code-driven
- Higher urgency
- May have demolition costs
- Schedule impact

### Late Changes
- Usually corrections
- Highest cost
- Least flexibility
- Most disruptive

---

## Geographic/Climate Patterns

### High Wind Areas
- More shear walls
- Heavier hardware
- Additional straps
- Portal frames

### Seismic Areas
- Hold-down upgrades
- Closer nail spacing
- Foundation anchoring
- Shear wall requirements

### Snow Load Areas
- Larger beams
- Heavier trusses
- Increased spacing
- Foundation depth

---

## Builder-Specific Patterns

### Production Builders (Richmond, Holt)
- Standardization efforts
- Supplier consolidation
- Value engineering
- Consistent patterns

### Custom Builders
- More variation
- Client-driven changes
- Higher spec materials
- Less predictable

---

## Seasonal Patterns

### Spring/Summer (High Volume)
- Material shortages
- Substitutions common
- Price increases
- Delivery delays

### Fall/Winter (Lower Volume)
- Better pricing
- More availability
- Fewer changes
- Standard specs

---

## Using These Patterns

### For Estimators
1. Recognize pattern early
2. Estimate impact quickly
3. Check for cascading effects
4. Apply historical data

### For Reviewers
1. Validate pattern fit
2. Check for missed items
3. Verify quantities
4. Confirm pricing

### For Training
1. Show real examples
2. Connect to cost impact
3. Build pattern library
4. Document lessons learned

### For Analysis
1. Track pattern frequency
2. Measure typical impacts
3. Identify root causes
4. Improve processes
