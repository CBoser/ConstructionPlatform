# MindFlow Cross-Reference Systems Guide
## Understanding Code Translation and Data Integration

**Version:** 1.0 | **Updated:** December 2025 | **Status:** Active

---

## Overview

MindFlow uses **5 cross-reference databases** to translate between different coding systems. This allows us to:
- Accept data from multiple builders (Holt, Richmond, custom)
- Work with multiple suppliers (HOLT Supply, BFS/STO, 84 Lumber, BlueLinx)
- Maintain a single unified internal system

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MINDFLOW UNIFIED SYSTEM                          │
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │ PhaseOption     │    │ InternalMaterial │    │ MaterialClass    │   │
│  │ Definition      │    │ Catalog          │    │ (1000, 2100)     │   │
│  │ (010.000-090)   │    │ (FRM-2X6-16-PT)  │    │                  │   │
│  └────────┬────────┘    └────────┬─────────┘    └────────┬─────────┘   │
│           │                      │                       │             │
└───────────┼──────────────────────┼───────────────────────┼─────────────┘
            │                      │                       │
    ┌───────┴───────┐      ┌───────┴───────┐       ┌───────┴───────┐
    │ CUSTOMER      │      │ SUPPLIER      │       │ ITEM TYPE     │
    │ CROSS-REFS    │      │ CROSS-REFS    │       │ CROSS-REFS    │
    │               │      │               │       │               │
    │ ┌───────────┐ │      │ ┌───────────┐ │       │ ┌───────────┐ │
    │ │ Holt      │ │      │ │ HOLT      │ │       │ │ Holt Cost │ │
    │ │ Phase     │ │      │ │ SKUs      │ │       │ │ Codes     │ │
    │ │ Xref      │ │      │ └───────────┘ │       │ │ → Classes │ │
    │ └───────────┘ │      │ ┌───────────┐ │       │ └───────────┘ │
    │ ┌───────────┐ │      │ │ BFS/STO   │ │       └───────────────┘
    │ │ Richmond  │ │      │ │ SKUs      │ │
    │ │ Option    │ │      │ └───────────┘ │
    │ │ Codes     │ │      │ ┌───────────┐ │
    │ └───────────┘ │      │ │ 84 Lumber │ │
    │ ┌───────────┐ │      │ │ SKUs      │ │
    │ │ Customer  │ │      │ └───────────┘ │
    │ │ Code Xref │ │      │ ┌───────────┐ │
    │ └───────────┘ │      │ │ BlueLinx  │ │
    └───────────────┘      │ │ SKUs      │ │
                           │ └───────────┘ │
                           └───────────────┘
```

---

## Cross-Reference Database Summary

| # | Database | Purpose | Connects |
|---|----------|---------|----------|
| 1 | **HoltPhaseXref** | Holt 5-digit → Unified Phases | `10100` → `010.000` |
| 2 | **RichmondOptionCode** | Richmond alpha → Unified Phases | `XGREAT` → `010.600` |
| 3 | **ItemTypeXref** | Cost codes → Material Classes | `4085` → `1000` |
| 4 | **CustomerCodeXref** | Any customer → Unified System | Generic mapper |
| 5 | **SupplierSkuXref** | Internal materials → Vendor SKUs | `FRM-2X6-16` → `2616HF3TICAG` |

---

## 1. HoltPhaseXref (Builder → Unified)

**Purpose:** Translates Holt Homes' 5-digit phase codes to unified phase codes.

### How Holt Codes Work
```
Holt Code: 10100
           │ ││└─ Elevation (A=00, B=01, C=02, D=03)
           │ │└── Option variant
           └─┴─── Phase group (10=Foundation, 20=Walls, 40=Roof)
```

### Translation Examples
| Holt Code | Unified Phase | Description |
|-----------|---------------|-------------|
| 10100 | 010.000-A | Foundation, Elevation A |
| 10200 | 010.000-B | Foundation, Elevation B |
| 20100 | 020.000-A | Main Walls, Elevation A |
| 40100 | 040.000-A | Roof, Elevation A |
| 10182 | 010.820-** | Den Foundation (all elev) |

### Database Fields
```
HoltPhaseXref
├── holtPhaseCode     "10100"           ← Holt's code
├── holtCostCode      "4085"            ← Trade/cost code
├── unifiedPhaseId    → PhaseOption     ← Links to unified
├── elevationCode     "A"               ← Extracted elevation
├── itemTypeCode      "1000"            ← Material class
└── batPackId         "|10"             ← Shipping pack
```

---

## 2. RichmondOptionCode (Builder → Unified)

**Purpose:** Translates Richmond American's mnemonic option codes to unified phases.

### How Richmond Codes Work
```
Richmond Pack: |10.82 OPT DEN FOUNDATION (B,C,D)
               ││ │└── Option code
               │└─┴─── Phase (10=Foundation)
               └────── Pack delimiter
```

### Translation Examples
| Richmond Code | Unified Phase | Description |
|---------------|---------------|-------------|
| XGREAT | 010.600, 020.600, 040.600 | Extended Great Room (multi-phase) |
| SUN | 010.610 | Sunroom Foundation |
| 3CARA | 012.000 | 3-Car Garage Option A |
| TALLCRWL | 010.008 | Tall Crawl Space |
| DBA | 020.210 | Deluxe Bath A |

### Database Fields
```
RichmondOptionCode
├── optionCode         "XGREAT"         ← Richmond's code
├── optionDescription  "Ext Great Room" ← Description
├── phaseId            → PhaseOption    ← Links to unified (if single phase)
├── isMultiPhase       true             ← Spans multiple phases?
└── layer1CodeOptions  []               ← Which Layer1 codes use this
```

---

## 3. ItemTypeXref (Cost Code → Material Class)

**Purpose:** Translates trade/cost codes to unified material classification.

### Translation Examples
| Holt Cost Code | Material Class | DART Category | Description |
|----------------|----------------|---------------|-------------|
| 4085 | 1000 | 1 | Lumber → Framing |
| 4086 | 1100 | 2 | EWP → Engineered |
| 4120 | 1100 | 2 | Trusses → Engineered |
| 4155 | 2100 | 4 | Siding Supply → Siding |
| 4082 | 1200 | 8 | Hardware → Hardware |

### Database Fields
```
ItemTypeXref
├── holtCostCode       "4085"           ← Trade code
├── holtCostName       "Lumber"         ← Trade name
├── materialClassId    → MaterialClass  ← Links to 1000, 2100
├── dartCategory       1                ← DART pricing tier
└── dartCategoryName   "Dim Lumber"     ← Category name
```

---

## 4. CustomerCodeXref (Any Customer → Unified)

**Purpose:** Generic translator for any builder's coding system.

### Use Cases
- New builder onboarding
- Custom coding schemes
- Legacy system migration
- Temporary mappings during transition

### Translation Examples
| Customer | Their Code | Code Type | Our Unified Code |
|----------|------------|-----------|------------------|
| Builder X | FND-001 | PHASE | 010.000 |
| Builder Y | OPTION-3CAR | OPTION | 012.000 |
| Builder Z | MAT-STUD-24 | MATERIAL | FRM-2X4-92-SPF-STUD |

### Database Fields
```
CustomerCodeXref
├── customerId          → Customer       ← Which customer
├── customerCode        "FND-001"        ← Their code
├── customerDescription "Foundation"     ← Their description
├── codeType            "PHASE"          ← Type (PHASE/OPTION/MATERIAL/PACK)
├── unifiedCode         "010.000"        ← Our equivalent
├── unifiedPhaseId      → PhaseOption    ← Links to phase (if applicable)
├── batPackId           "|10"            ← Links to pack (if applicable)
├── isValidated         true             ← Human verified?
└── validatedBy         "John D."        ← Who verified
```

---

## 5. SupplierSkuXref (Internal → Vendor SKUs)

**Purpose:** Maps our internal material catalog to supplier-specific SKUs.

### Architecture
```
InternalMaterial (Our Catalog)
       │
       ├── SupplierSkuXref → HOLT SKU (BAT Pack system)
       ├── SupplierSkuXref → BFS/STO SKU (Descriptive codes)
       ├── SupplierSkuXref → 84 Lumber SKU
       └── SupplierSkuXref → BlueLinx SKU
```

### Current Suppliers
| Code | Name | Code System | Format |
|------|------|-------------|--------|
| HOLT | Holt Homes Supply | BAT Pack | Compact alphanumeric (`2616HF3TICAG`) |
| BFS | Builder's FirstSource | STO | Descriptive (`2X4-92-5/8-SPF`) |
| 84LBR | 84 Lumber | BOM | Traditional (`PT-2X6-16`) |
| BLUELINX | BlueLinx | Custom | Vendor-specific |

### BFS/STO Code Format
```
PREFIX-DIMENSION-SPEC[-VARIANT][-SEQ]

Examples:
  2X4-8-SPF           → 2x4 x 8' SPF #2
  2X6-92-5/8-DF       → 2x6 x 92-5/8" DF Stud Grade
  OSB-7/16-4X8-TG     → 7/16" OSB 4x8 Tongue & Groove
  HANGER-LUS28        → Simpson LUS28 Joist Hanger
  GLB-5X18            → Glulam Beam 5" x 18"
```

### Translation Examples
| Our Internal Code | HOLT SKU | BFS/STO SKU | Description |
|-------------------|----------|-------------|-------------|
| FRM-2X6-16-PT-SILL | 2616HF3TICAG | 2X6-16-PT-GC | 2x6x16 PT Sill |
| FRM-2X4-92-SPF-STUD | 2492SPF2 | 2X4-92-5/8-SPF | 2x4 Precut Stud |
| SID-LAP-HZ-8.25-12 | HZ10814CMSP | SID-HZ-LAP-8.25 | HardiePlank 8.25" |
| HW-HGR-LUS28 | LUS28 | HANGER-LUS28 | Simpson LUS28 Hanger |
| HW-HD-HD5A | HD5A | ANCHOR-HD5A | Simpson HD5A Hold-Down |

### Database Fields
```
SupplierSkuXref
├── internalMaterialId  → InternalMaterial  ← Our material
├── supplierId          "HOLT"              ← Vendor code
├── supplierName        "Holt Supply"       ← Vendor name
├── supplierSku         "2616HF3TICAG"      ← Their SKU
├── supplierPackId      "|10"               ← Their pack system
├── supplierCategory    1                   ← Their pricing tier
├── listPrice           2.45                ← Published price
├── contractPrice       2.10                ← Our negotiated price
├── isPrimary           true                ← Default vendor?
└── priceEffectiveDate  2025-01-01          ← Price valid from
```

---

## Data Flow: Complete Example

### Scenario: Import a Holt BAT Pack

**Input:** Holt delivers Pack |10 with SKU `2616HF3TICAG`

```
Step 1: Identify the material
        2616HF3TICAG → SupplierSkuXref → InternalMaterial
        Result: FRM-2X6-16-PT-SILL (2x6x16 PT Sill Plate)

Step 2: Determine the phase
        Pack |10 → HoltPhaseXref → 010.000 (Foundation)

Step 3: Get material classification
        Cost Code 4085 → ItemTypeXref → 1000 (Framing)

Step 4: Build unified code
        Plan 1670 + Phase 010.000 + Elev A + Class 1000
        Result: 1670-010.000-A-1000
```

### Scenario: Translate a Richmond Pack ID

**Input:** Richmond Pack `|20.82 OPT DEN WALLS (B,C,D)`

```
Step 1: Parse the pack ID
        |20 = Phase 020 (Main Walls)
        .82 = Option suffix

Step 2: Look up option code
        82 → RichmondOptionCode → DEN (Den Option)

Step 3: Get unified phase
        020 + DEN → 020.820 (Den Walls)

Step 4: Build unified code
        Plan G603 + Phase 020.820 + Elev BCD + Class 1000
        Result: G603-020.820-BCD-1000
```

---

## Validation Status Workflow

For CustomerCodeXref mappings:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  PENDING    │───▶│  VALIDATED   │───▶│   ACTIVE    │
│ isValidated │    │ isValidated  │    │ Used in     │
│ = false     │    │ = true       │    │ production  │
└─────────────┘    └──────────────┘    └─────────────┘
      │                   │
      │    ┌──────────────┘
      ▼    ▼
   Human review required
   - Check mapping accuracy
   - Verify descriptions match
   - Confirm no duplicates
```

---

## Quick Reference Card

### For Customer Code Entry (Implementation Intake)
1. Select the customer
2. Enter their code and description
3. Select code type (Phase/Option/Material/Pack)
4. Map to unified phase or material
5. Mark for validation

### For Supplier SKU Mapping
1. Find/create internal material
2. Add supplier cross-reference
3. Enter supplier SKU and pack ID
4. Set pricing if available
5. Mark as primary if default vendor

### For Holt Import
1. System auto-matches via HoltPhaseXref
2. Unmatched codes flagged for review
3. New codes added to cross-reference
4. Material SKUs linked via SupplierSkuXref

---

## Database Statistics

Run `devops.py → C → 5` (Code System → View Stats) to see:
- Total phases defined
- Total customer cross-references
- Validation completion percentage
- Supplier SKU coverage

---

*Document maintained by MindFlow Development Team*
*For questions: See Implementation Intake page in MindFlow*
