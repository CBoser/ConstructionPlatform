# Construction PO Structure Reference

## BuildPro Purchase Order Types

### 1. Framing PO (Base Contract)
**Task Code**: `44201`  
**Purpose**: Base framing materials for the house plan

**Example**:
```
PO Number: 3417254-000
Task: Framing Drop 1-Mat [44201][TO]
Amount: $18,345.65
Materials: Lumber, trusses, fasteners, wraps
```

### 2. Options PO
**Purpose**: Buyer-selected upgrades and modifications

**Standard Structure**:
```
Base Fee: $300.00 (always)
+ Option 1 Cost
+ Option 2 Cost
+ ...
= Subtotal
+ Tax (7.8%)
= Total
```

**Example (Lot 115)**:
```
PO Number: 3417033-000
Base Fee:     $300.00
COVP:       $1,089.25  (8'x8' Covered Patio)
FIREWAL1:   $2,680.72  (Fire Wall - One Side)
FPSING02:      $86.24  (Cosmo Fireplace)
-----------
Subtotal:   $4,156.21
Tax (7.8%):   $324.19
-----------
Total:      $4,480.40
```

### 3. Siding PO
**Task Code**: `47100`  
**Purpose**: Exterior siding and trim materials

**Key Characteristic**: Often uses SAME PO number as Framing PO, but different task code

**Example**:
```
PO Number: 3417254-000 (same as Framing!)
Task: Siding and Exterior Trim [47100][TO]
Amount: $7,827.46
```

### 4. Add-on PO
**Purpose**: Missed items or corrections after initial PO

**Example**:
```
PO Number: 3445234-000
Amount: $19.28
Reason: FM Hangers + Hex Nut (missed on original)
```

## Combined Contract Pattern

The "Combined Contract" is the master PO number that serves as the "bank account" for the entire job.

**Pattern**:
```
Combined Contract PO: 3417254
├─ Framing Task [44201]:  $18,345.65
├─ Siding Task [47100]:    $7,827.46
├─ Option PO 3417033:      $4,480.40  (separate PO)
└─ Add-on PO 3445234:         $19.28  (separate PO)
                          -----------
Total:                    $30,672.79
```

**Critical Rule**: Framing and Siding typically share the SAME PO number with different task codes.

## Option Code Pricing by Plan

**Critical Discovery**: Same option costs DIFFERENT amounts on different plans

**Example - FIREWAL1 (Fire Wall)**:
```
Plan G892 (Lot 115): $2,680.72
Plan G893 (Lot 116): $3,010.87
Variance: +$330.15 (+12.3%)
```

**Why?**: Different plans have different wall lengths and configurations

## Common Option Codes

| Code | Description | Typical Cost Range |
|------|-------------|-------------------|
| COVP | Covered Patio (varies by size) | $1,000 - $3,000 |
| FIREWAL1 | Fire Wall - One Side | $2,500 - $3,500 |
| FPSING02 | Fireplace (Single) | $80 - $150 |
| ELEV+ | Enhanced Elevation | $500 - $2,000 |
| TCRAWL | Tall Crawl Space | $1,000 - $2,500 |

## "W/OPTION PO" Notation

When spreadsheet shows:
```
READY FRAME PO: "W/OPTION PO 3417033"
FIRE PLACE PO:  "W/OPTION PO 3417033"
```

**Meaning**:
- Cost is INCLUDED in Option PO 3417033
- Don't create a separate PO
- Already accounted for in option total

## Material Quantity Differences by Plan

**Comparing G892 vs G893**:

| Material | G892 | G893 | Δ |
|----------|------|------|---|
| Foundation Vents | 9 EA | 11 EA | +2 |
| Plank Siding 5/16"x8-1/4"x12' | 324 EA | 346 EA | +22 |
| Panel Siding 5/16"x4'x9' | 5 EA | 8 EA | +3 |
| 4" Trim (LF) | 39 LF | 45 LF | +6 |

**Key Insight**: G893 uses MORE materials but costs LESS ($17,884 vs $18,346). This confirms **plan-based contract pricing** rather than pure material cost.

## BFS Q4 Pricing Abstraction

Option POs show a special "CONTRACT" line item:

```
Builder SKU: "CONTRACT"
Description: "BFS - Q4 Pricing - Lot: 0115 Pln: G892"
Order: 0
Received: 0
UOM: EA
Unit Price: $0.00
Total: $300.00  ← Price appears despite 0 qty!
```

This represents **quarterly contract pricing** - options are priced as packages, not individual materials.

## Reconciliation Variance Thresholds

**Acceptable**: < $50 variance  
**Minor**: $50 - $200 variance (needs review)  
**Significant**: > $200 variance (requires investigation)

## Tax Rate

Standard tax rate: **7.8%** (verify by location)
