# MindFlow Platform: PO & EPO System Analysis

**Project:** Contract & Purchase Order Tracker Module  
**Date:** November 14, 2025  
**Purpose:** Comprehensive analysis of BuildPro PO/EPO integration for MindFlow Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Data Structure Discoveries](#data-structure-discoveries)
4. [Business Rules & Patterns](#business-rules--patterns)
5. [Database Schema Design](#database-schema-design)
6. [Core Features & Workflows](#core-features--workflows)
7. [Implementation Priorities](#implementation-priorities)
8. [Integration Architecture](#integration-architecture)
9. [Learning Algorithm Design](#learning-algorithm-design)
10. [Questions for Resolution](#questions-for-resolution)

---

## Executive Summary

### The Problem

Currently managing purchase orders for production homebuilders using **fragile Excel spreadsheets** that require:
- Manual data entry from BuildPro PO PDFs
- Time-consuming reconciliation across multiple PO types
- Option code impact tracking across different plans
- Variance analysis between predicted (EPO) and actual (PO) costs

### The Solution

MindFlow's **Contract & PO Tracker** will:
1. **Automate PO reconciliation** - Parse PDFs, auto-match to spreadsheet
2. **Learn option pricing** - Build intelligence from historical data
3. **Predict EPO costs** - Use plan + option combinations for accurate estimates
4. **Eliminate manual tracking** - Single source of truth with BuildPro sync

### Key Metrics

- **Current Process:** ~20 lots/month, scaling to 50+
- **Plans Managed:** 40 house plans with 567 option combinations
- **PO Types per Lot:** 3-6 separate POs (Framing, Siding, Options, Add-ons)
- **Time Savings Target:** 80% reduction in reconciliation time

---

## Current State Analysis

### Current Workflow

```
1. BuildPro generates POs → 2. Download PDFs → 3. Manual Excel entry → 
4. Track option codes → 5. Reconcile totals → 6. Identify variances
```

**Pain Points:**
- Time spent in spreadsheets
- Option code impact unclear
- PO reconciliation errors
- No learning from historical data

### Example: Lot 115 (North Haven Subdivision)

```
Plan: G892, Elevation A
Options: 8'x8' Covered Patio (COVP), Fire Wall (FIREWAL1), Fireplace (FPSING02)

Purchase Orders:
├─ Framing PO: 3417254 = $18,345.65
├─ Option PO: 3417033 = $4,480.40
│  ├─ Base Fee: $300.00
│  ├─ COVP: $1,089.25
│  ├─ FIREWAL1: $2,680.72
│  └─ FPSING02: $86.24
├─ Add-on PO: 3445234 = $19.28 (missed items)
└─ Siding PO: 3417254 = $7,827.46 (same PO#, different task)

Combined Contract: 3417254
Total Investment: $30,672.76
```

---

## Data Structure Discoveries

### 1. PO Number Reuse Pattern

**Critical Finding:** The same PO number is used for multiple task types.

```typescript
PO 3417254-000 appears in TWO documents:
  ├─ Task: Framing Drop 1-Mat [44201][TO]  → $18,345.65
  └─ Task: Siding and Exterior Trim [47100][TO] → $7,827.46
```

**Implication:** The "Combined Contract" PO number is a multi-task purchase order that acts as a "bank account" for the entire job.

### 2. Task Code System

```
[AccountNumber - PONumber - TaskCode][OrderType]

Examples:
[1332200 - 3417254-000 - 44201][TO]  ← Framing Trade Order
[1332200 - 3417254-000 - 47100][TO]  ← Siding Trade Order
[1332200 - 3417092-000 - 44201][ON]  ← Options Order

Task Codes:
- 44201 = Framing materials
- 47100 = Siding materials
- [TO] = Trade Order
- [ON] = Options
```

### 3. Option Pricing Structure

**Every Option PO follows this pattern:**

```typescript
interface OptionPO {
  baseFee: 300.00;              // Always $300
  options: Array<{
    code: string;               // "COVP", "FIREWAL1", "FPSING02"
    price: number;              // Plan-specific pricing
  }>;
  subtotal: number;             // $300 + sum(options)
  tax: number;
  total: number;
}

// Example: Lot 115
baseFee:     $300.00
COVP:      $1,089.25
FIREWAL1:  $2,680.72
FPSING02:     $86.24
----------
Subtotal:  $4,156.21
Tax:         $324.19
----------
Total:     $4,480.40
```

### 4. "BFS - Q4 Pricing" Abstraction Layer

**Critical Discovery:** Option line items show ZERO quantity but full pricing.

```
BuildPro Option Line Item:
Builder SKU: "CONTRACT"
Description: "BFS - Q4 Pricing - Lot: 0115 Pln: G892"
Order: 0
Received: 0
UOM: EA
Unit Price: $0.00
Total: $300.00  // ← Price appears despite 0 qty!
```

**This is quarterly contract pricing** - options are priced as packages, not individual materials.

### 5. Option Pricing Variance by Plan

**Same option code costs different amounts on different plans:**

```typescript
FIREWAL1 (Fire Wall - One Side):
  Lot 115 (G892): $2,680.72
  Lot 116 (G893): $3,010.87
  Variance: +$330.15 (+12.3%)
```

**Why?** Different plans have different wall lengths/configurations.

### 6. Material Quantity Differences by Plan

**Comparing Lot 115 (G892) vs Lot 116 (G893):**

| Material | G892 Qty | G893 Qty | Variance |
|----------|----------|----------|----------|
| Foundation Vents | 9 EA | 11 EA | +2 |
| Plank Siding (5/16"x8-1/4"x12') | 324 EA | 346 EA | +22 |
| 4" Trim | 39 LF | 45 LF | +6 LF |
| 2x4x9' Studs | 111 EA | 111 EA | 0 |
| **Total Framing Cost** | **$18,345.65** | **$17,884.03** | **-$461.62** |

**Key Insight:** G893 uses MORE materials but costs LESS. This reveals pricing is plan-based contract pricing, not pure material cost.

---

## Business Rules & Patterns

### Rule 1: Combined Contract Structure

```
Combined Contract PO (e.g., 3417254):
├─ Framing Task [44201]
├─ Siding Task [47100]  
├─ Option PO (separate number, rolls into combined)
└─ Add-on POs (separate numbers, roll into combined)

Total = Sum of all tasks and related POs
```

### Rule 2: "W/OPTION PO" Notation

```
Spreadsheet shows:
READY FRAME PO: "W/OPTION PO 3417033"
FIRE PLACE PO:  "W/OPTION PO 3417033"

Meaning:
- Cost is INCLUDED in Option PO 3417033
- Don't create separate PO
- Already accounted for
```

### Rule 3: Option Code Materialization

**From EPO Screenshots:** *"Automatically pulls QUANTITY and COST information from Option Code setup"*

```typescript
Option Code Setup:
  COVP (8'x8' Covered Patio)
    → Triggers material deltas:
       + Additional framing lumber
       + Additional fasteners
       + Roofing materials
       + Etc.
    → Each delta is plan-specific
```

### Rule 4: EPO → PO Workflow

```
Timeline:
1. EPO Generated (X days before job start)
   ↓
2. EPO Review & Approval
   ↓
3. Job Start Date
   ↓
4. Actual PO Received (BuildPro)
   ↓
5. Variance Analysis (EPO vs PO)
   ↓
6. Learning Update (feed back to system)
```

---

## Database Schema Design

### Core Entities

```prisma
// schema.prisma

model Subdivision {
  id          String   @id @default(cuid())
  name        String   // "North Haven Phase 4"
  phase       String?  // "Phase 1 - All Lots"
  builder     Builder  @relation(fields: [builderId], references: [id])
  builderId   String
  lots        Lot[]
  
  @@index([builderId])
}

model Lot {
  id              String        @id @default(cuid())
  lotNumber       String        // "115"
  subdivision     Subdivision   @relation(fields: [subdivisionId], references: [id])
  subdivisionId   String
  
  // Plan Information
  planType        String        // "G892", "G893", etc.
  elevation       String?       // "A", "B", "C", "D"
  swing           String?       // "S" (standard)
  enhancedElev    Boolean       @default(false)
  garageType      String?       // "2", "3" car
  
  // Job Information (from BuildPro)
  jobId           String?       @unique // "33750115"
  jobNumber       String?       // BuildPro internal
  address         String?
  permitNumber    String?       // "NHC202501119"
  jobStartDate    DateTime?
  
  // Options
  options         LotOption[]
  
  // Purchase Orders
  epos            EPO[]
  purchaseOrders  PurchaseOrder[]
  
  // Calculated totals
  totalInvestment Decimal       @default(0)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([subdivisionId, lotNumber])
  @@index([subdivisionId])
  @@index([planType])
}

model LotOption {
  id          String   @id @default(cuid())
  lot         Lot      @relation(fields: [lotId], references: [id])
  lotId       String
  
  optionCode  String   // "TALLCRAWL", "COVP", "FIREWAL1", etc.
  isSelected  Boolean  @default(false)
  
  // Price tracking
  predictedPrice  Decimal?  // From EPO
  actualPrice     Decimal?  // From actual PO
  variance        Decimal?  // actual - predicted
  
  @@unique([lotId, optionCode])
  @@index([lotId])
  @@index([optionCode])
}

model PurchaseOrder {
  id                    String        @id @default(cuid())
  
  lot                   Lot           @relation(fields: [lotId], references: [id])
  lotId                 String
  
  // PO Identification
  poNumber              String        // "3417254-000"
  taskCode              String        // "44201", "47100"
  taskDescription       String        // "Framing Drop 1-Mat"
  taskType              TaskType      // FRAMING, SIDING, OPTIONS
  orderType             OrderType     // PURCHASE_ORDER, CHANGE_ORDER
  
  // Dates
  requestedStartDate    DateTime
  requestedEndDate      DateTime
  submittedDate         DateTime
  
  // Status
  builderStatus         String?
  orderStatus           POStatus      @default(RECEIVED)
  
  // Financial
  subtotal              Decimal
  tax                   Decimal
  total                 Decimal
  
  // Relationship Management
  isCombinedContract    Boolean       @default(false)
  parentPONumber        String?       // If this is an option/add-on PO
  combinedContractPO    String?       // The "bank account" PO
  
  // Link to EPO (for variance tracking)
  relatedEPO            EPO?          @relation(fields: [epoId], references: [id])
  epoId                 String?
  
  // Line Items
  lineItems             POLineItem[]
  
  // Options (if this is an option PO)
  options               POOption[]
  
  // History tracking
  history               POHistory[]
  
  // Document link
  pdfUrl                String?
  
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  @@unique([poNumber])
  @@index([lotId])
  @@index([taskType])
  @@index([combinedContractPO])
}

enum TaskType {
  FRAMING          // 44201
  SIDING           // 47100
  OPTIONS          // Options package
  FIREPLACE
  READY_FRAME
  DECK
  ADD_ON
}

enum OrderType {
  PURCHASE_ORDER   // [TO]
  OPTION_ORDER     // [ON]
  CHANGE_ORDER
  ADD_ON
}

enum POStatus {
  PENDING
  RECEIVED
  SUBMITTED
  ACKNOWLEDGED
  IN_PROGRESS
  COMPLETE
  CANCELLED
}

model POLineItem {
  id                String        @id @default(cuid())
  
  purchaseOrder     PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  poId              String
  
  // From BuildPro
  builderSKU        String        // "CONTRACT", "R44204384"
  description       String        // Full description
  
  // Quantities
  quantityOrdered   Int
  quantityReceived  Int           @default(0)
  
  // Pricing
  unitOfMeasure     String        // "EA", "LF"
  unitPrice         Decimal
  totalPrice        Decimal
  
  // Special handling for "BFS - Q4 Pricing" items
  isPricingPackage  Boolean       @default(false)
  relatedOption     String?       // "COVP", "FIREWAL1"
  
  // Variance tracking (link to EPO)
  predictedQty      Int?          // From EPO
  varianceQty       Int?          // actual - predicted
  
  @@index([poId])
  @@index([builderSKU])
}

model POOption {
  id                String        @id @default(cuid())
  
  purchaseOrder     PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  poId              String
  
  // Option Details
  optionCode        String        // "COVP", "FIREWAL1", "FPSING02"
  optionType        String        // "Customizing"
  optionName        String        // "Optional 8'x8' Covered Patio"
  description1      String        // "Optional 8'x8' Covered Patio"
  description2      String?       // "at Great Room"
  
  // Pricing (from "BFS - Q4 Pricing" line)
  optionPrice       Decimal       // $1,089.25, $2,680.72, etc.
  
  @@index([poId])
  @@index([optionCode])
}

model POHistory {
  id                String        @id @default(cuid())
  
  purchaseOrder     PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  poId              String
  
  // History Event
  from              String        // "Jeff Coughlin", "System"
  action            String        // "Order Submitted", "Order Updated Via Integration"
  builderStatus     String        // "Submitted"
  supplierStatus    String        // "Received"
  notes             String?
  eventDate         DateTime
  
  @@index([poId])
}

// EPO (Estimated Purchase Order) - The prediction layer
model EPO {
  id                String        @id @default(cuid())
  
  lot               Lot           @relation(fields: [lotId], references: [id])
  lotId             String
  
  // EPO Identification
  epoNumber         String        @unique
  generatedDate     DateTime      @default(now())
  
  // Status
  status            EPOStatus     @default(DRAFT)
  approvedBy        String?
  approvedDate      DateTime?
  
  // Financial Predictions
  predictedSubtotal Decimal
  predictedTax      Decimal
  predictedTotal    Decimal
  
  // Confidence
  overallConfidence Decimal       // 0-1 score based on historical data
  
  // Line Items
  lineItems         EPOLineItem[]
  
  // Actual POs (for variance tracking)
  actualPOs         PurchaseOrder[]
  
  // Document
  pdfUrl            String?
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([lotId])
  @@index([status])
}

enum EPOStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  CONVERTED_TO_PO
}

model EPOLineItem {
  id                String        @id @default(cuid())
  
  epo               EPO           @relation(fields: [epoId], references: [id], onDelete: Cascade)
  epoId             String
  
  // Material Details
  builderSKU        String
  description       String
  
  // Predicted Quantities
  predictedQty      Int
  unitOfMeasure     String
  predictedUnitPrice Decimal
  predictedTotal    Decimal
  
  // Confidence & Source
  confidence        Decimal       // 0-1 based on historical accuracy
  source            String        // "Plan Baseline", "Option COVP", etc.
  
  // Actual comparison (populated after PO received)
  actualQty         Int?
  actualUnitPrice   Decimal?
  actualTotal       Decimal?
  variance          Decimal?
  
  @@index([epoId])
  @@index([builderSKU])
}

// Material Learning Layer
model PlanMaterialBaseline {
  id              String   @id @default(cuid())
  
  planType        String   // "G892", "G893"
  taskType        TaskType // FRAMING, SIDING
  
  materialSKU     String   // "R471205160814"
  description     String   // "5/16"x8-1/4"x12' Plank Lap"
  
  // Baseline quantities (learned from historical data)
  baseQuantity    Int      // 324 for G892, 346 for G893
  unitOfMeasure   String   // "EA"
  avgUnitPrice    Decimal  // $11.27
  
  // Learning metrics
  sampleSize      Int      @default(0)
  avgVariance     Decimal? // Track over/under ordering
  stdDeviation    Decimal?
  lastUpdated     DateTime @default(now())
  
  // Option impacts
  optionModifiers OptionMaterialModifier[]
  
  @@unique([planType, taskType, materialSKU])
  @@index([planType])
  @@index([taskType])
}

model OptionMaterialModifier {
  id                String                  @id @default(cuid())
  
  baseline          PlanMaterialBaseline    @relation(fields: [baselineId], references: [id], onDelete: Cascade)
  baselineId        String
  
  optionCode        String                  // "COVP", "FIREWAL1"
  quantityDelta     Int                     // How much this option changes the quantity
  
  // Learning
  sampleSize        Int                     @default(0)
  confidence        Decimal                 @default(0) // 0-1 score
  lastUpdated       DateTime                @default(now())
  
  @@unique([baselineId, optionCode])
}

model OptionPricingTemplate {
  id              String   @id @default(cuid())
  
  optionCode      String   // "COVP"
  optionName      String   // "8'x8' Covered Patio"
  optionType      String   // "Customizing"
  
  // Pricing by plan
  planPricing     OptionPlanPricing[]
  
  @@unique([optionCode])
}

model OptionPlanPricing {
  id              String                  @id @default(cuid())
  
  template        OptionPricingTemplate   @relation(fields: [templateId], references: [id], onDelete: Cascade)
  templateId      String
  
  planType        String                  // "G892"
  avgPrice        Decimal                 // $1,089.25
  minPrice        Decimal
  maxPrice        Decimal
  
  // Learning
  sampleSize      Int                     @default(0)
  confidence      Decimal                 @default(0)
  lastUpdated     DateTime                @default(now())
  
  @@unique([templateId, planType])
}
```

---

## Core Features & Workflows

### Feature 1: PO Reconciliation Dashboard

**Purpose:** Single view of all POs for a lot with auto-reconciliation

```typescript
interface LotReconciliationView {
  lotNumber: string;
  planType: string;
  elevation: string;
  
  // All POs for this lot
  purchaseOrders: {
    combined: {
      poNumber: string;
      tasks: Array<{
        type: 'FRAMING' | 'SIDING';
        taskCode: string;
        amount: number;
        status: string;
        pdfLink: string;
      }>;
      subtotal: number;
    };
    
    options: Array<{
      poNumber: string;
      baseFee: number;
      items: Array<{
        code: string;
        name: string;
        price: number;
      }>;
      total: number;
      pdfLink: string;
    }>;
    
    addOns: Array<{
      poNumber: string;
      reason: string;
      total: number;
      pdfLink: string;
    }>;
  };
  
  // Totals
  totals: {
    predicted: number;      // From EPO
    actual: number;         // From POs
    variance: number;
    variancePercent: number;
    status: 'MATCHED' | 'VARIANCE' | 'UNDER_REVIEW';
  };
  
  // Reconciliation with spreadsheet
  spreadsheetComparison: {
    spreadsheetTotal: number;
    systemTotal: number;
    match: boolean;
    discrepancies: string[];
  };
}
```

### Feature 2: EPO Generation Engine

**Purpose:** Predict material costs before job starts

```typescript
async function generateEPO(lotId: string): Promise<EPO> {
  // 1. Get lot details
  const lot = await db.lot.findUnique({
    where: { id: lotId },
    include: { options: true }
  });
  
  // 2. Get plan baseline materials
  const planBaseline = await db.planMaterialBaseline.findMany({
    where: { 
      planType: lot.planType,
      taskType: { in: ['FRAMING', 'SIDING'] }
    },
    include: { optionModifiers: true }
  });
  
  // 3. Apply option modifiers
  const selectedOptions = lot.options
    .filter(o => o.isSelected)
    .map(o => o.optionCode);
  
  const finalMaterials = planBaseline.map(material => {
    let finalQty = material.baseQuantity;
    let confidence = 1.0;
    const sources = [`Plan ${lot.planType} baseline`];
    
    // Apply each selected option's modifier
    selectedOptions.forEach(optionCode => {
      const modifier = material.optionModifiers.find(
        m => m.optionCode === optionCode
      );
      
      if (modifier) {
        finalQty += modifier.quantityDelta;
        confidence = Math.min(confidence, modifier.confidence);
        sources.push(`Option ${optionCode}`);
      }
    });
    
    return {
      materialSKU: material.materialSKU,
      description: material.description,
      predictedQty: finalQty,
      unitOfMeasure: material.unitOfMeasure,
      predictedUnitPrice: material.avgUnitPrice,
      predictedTotal: finalQty * material.avgUnitPrice,
      confidence,
      source: sources.join(', ')
    };
  });
  
  // 4. Calculate totals
  const subtotal = finalMaterials.reduce(
    (sum, m) => sum + m.predictedTotal, 
    0
  );
  const tax = subtotal * 0.078; // WA tax rate
  const total = subtotal + tax;
  
  // 5. Create EPO record
  const epo = await db.epo.create({
    data: {
      lotId: lot.id,
      epoNumber: `EPO-${lot.jobNumber || lot.lotNumber}-${Date.now()}`,
      predictedSubtotal: subtotal,
      predictedTax: tax,
      predictedTotal: total,
      overallConfidence: calculateOverallConfidence(finalMaterials),
      lineItems: {
        create: finalMaterials
      }
    },
    include: { lineItems: true }
  });
  
  return epo;
}

function calculateOverallConfidence(materials: any[]): number {
  // Weighted by dollar value
  const totalValue = materials.reduce((sum, m) => sum + m.predictedTotal, 0);
  
  const weightedConfidence = materials.reduce((sum, m) => {
    const weight = m.predictedTotal / totalValue;
    return sum + (m.confidence * weight);
  }, 0);
  
  return weightedConfidence;
}
```

### Feature 3: Variance Learning System

**Purpose:** Improve predictions over time by learning from variances

```typescript
async function analyzeVariance(
  epoId: string, 
  actualPOId: string
): Promise<VarianceReport> {
  
  const epo = await db.epo.findUnique({
    where: { id: epoId },
    include: { lineItems: true, lot: { include: { options: true } } }
  });
  
  const po = await db.purchaseOrder.findUnique({
    where: { id: actualPOId },
    include: { lineItems: true }
  });
  
  // Match EPO line items to PO line items
  const variances = epo.lineItems.map(epoItem => {
    const poItem = po.lineItems.find(
      item => item.builderSKU === epoItem.builderSKU
    );
    
    if (!poItem) {
      return {
        sku: epoItem.builderSKU,
        description: epoItem.description,
        predicted: epoItem.predictedQty,
        actual: 0,
        variance: -epoItem.predictedQty,
        type: 'MISSING_IN_PO',
        impact: -epoItem.predictedTotal
      };
    }
    
    const qtyVariance = poItem.quantityOrdered - epoItem.predictedQty;
    const priceVariance = poItem.unitPrice - epoItem.predictedUnitPrice;
    const totalVariance = poItem.totalPrice - epoItem.predictedTotal;
    
    return {
      sku: epoItem.builderSKU,
      description: epoItem.description,
      predicted: epoItem.predictedQty,
      actual: poItem.quantityOrdered,
      variance: qtyVariance,
      variancePercent: (qtyVariance / epoItem.predictedQty) * 100,
      priceVariance,
      impact: totalVariance,
      type: Math.abs(qtyVariance) > (epoItem.predictedQty * 0.1) 
        ? 'SIGNIFICANT_VARIANCE' 
        : 'MINOR_VARIANCE'
    };
  });
  
  // Feed back into learning system
  await updateLearningModels(epo, po, variances);
  
  return {
    epoNumber: epo.epoNumber,
    poNumber: po.poNumber,
    lotNumber: epo.lot.lotNumber,
    planType: epo.lot.planType,
    
    totals: {
      predictedTotal: epo.predictedTotal,
      actualTotal: po.total,
      variance: po.total - epo.predictedTotal,
      variancePercent: ((po.total - epo.predictedTotal) / epo.predictedTotal) * 100
    },
    
    lineItemVariances: variances,
    
    significantVariances: variances.filter(v => v.type === 'SIGNIFICANT_VARIANCE'),
    
    recommendations: generateRecommendations(variances, epo.lot)
  };
}

async function updateLearningModels(
  epo: EPO,
  po: PurchaseOrder,
  variances: VarianceItem[]
) {
  
  const lot = epo.lot;
  const selectedOptions = lot.options.filter(o => o.isSelected);
  
  for (const variance of variances) {
    // Update plan baseline
    const baseline = await db.planMaterialBaseline.findUnique({
      where: {
        planType_taskType_materialSKU: {
          planType: lot.planType,
          taskType: po.taskType,
          materialSKU: variance.sku
        }
      }
    });
    
    if (baseline) {
      // Exponential moving average
      const alpha = 0.3; // Learning rate
      const newAvg = baseline.baseQuantity * (1 - alpha) + variance.actual * alpha;
      
      await db.planMaterialBaseline.update({
        where: { id: baseline.id },
        data: {
          baseQuantity: Math.round(newAvg),
          sampleSize: baseline.sampleSize + 1,
          lastUpdated: new Date()
        }
      });
    }
    
    // Update option modifiers
    for (const option of selectedOptions) {
      const modifier = await db.optionMaterialModifier.findUnique({
        where: {
          baselineId_optionCode: {
            baselineId: baseline.id,
            optionCode: option.optionCode
          }
        }
      });
      
      if (modifier) {
        // Update confidence based on variance
        const accuracyScore = 1 - Math.abs(variance.variancePercent / 100);
        const newConfidence = modifier.confidence * 0.8 + accuracyScore * 0.2;
        
        await db.optionMaterialModifier.update({
          where: { id: modifier.id },
          data: {
            confidence: newConfidence,
            sampleSize: modifier.sampleSize + 1,
            lastUpdated: new Date()
          }
        });
      }
    }
  }
}
```

### Feature 4: Combined Contract Dashboard

**Purpose:** Visual rollup of all POs per lot

```typescript
interface CombinedContractDashboard {
  jobNumber: string;
  lotNumber: string;
  address: string;
  plan: string;
  
  combinedContractPO: string;
  
  financialRollup: {
    framing: {
      base: number;
      options: number;
      addOns: number;
      subtotal: number;
    };
    
    siding: {
      base: number;
      options: number;
      addOns: number;
      subtotal: number;
    };
    
    other: {
      fireplace: number;
      readyFrame: number;
      deck: number;
    };
    
    grandTotal: number;
  };
  
  poSummary: Array<{
    poNumber: string;
    type: 'BASE' | 'OPTION' | 'ADD_ON';
    taskType: string;
    amount: number;
    status: string;
    submittedDate: Date;
    pdfLink: string;
  }>;
  
  reconciliation: {
    spreadsheetTotal: number;
    systemTotal: number;
    epoTotal: number;
    
    variances: {
      vsSpreadsheet: number;
      vsEPO: number;
    };
    
    status: 'MATCHED' | 'MINOR_VARIANCE' | 'SIGNIFICANT_VARIANCE';
    issues: string[];
  };
  
  timeline: Array<{
    date: Date;
    event: string;
    poNumber?: string;
    amount?: number;
  }>;
}
```

---

## Implementation Priorities

### Sprint 1: Core Data Foundation (Week 1-2)

**Goal:** Get actual data into the system

**Tasks:**

1. **PDF Parser Service**
   ```typescript
   class POPdfParser {
     async parsePO(pdfFile: File): Promise<PurchaseOrderData> {
       // Extract:
       // - PO number
       // - Task code & type
       // - Line items
       // - Totals
       // - Options (if option PO)
       // - History events
     }
   }
   ```

2. **Excel Importer**
   ```typescript
   class RichmondSpreadsheetImporter {
     async importSpreadsheet(xlsxFile: File): Promise<ImportResult> {
       // Parse Richmond subdivision spreadsheet
       // Create Lot records
       // Link PO numbers
       // Calculate baselines
     }
   }
   ```

3. **Database Setup**
   - Implement Prisma schema
   - Run migrations
   - Seed with plan types (G892, G893, etc.)

4. **Lot Detail View (UI)**
   - Display all POs for a lot
   - Show combined contract rollup
   - Link to PDF documents
   - Basic reconciliation status

**Deliverable:** Can import PDFs + spreadsheet and view all POs in one place

---

### Sprint 2: Reconciliation Engine (Week 3-4)

**Goal:** Automate PO reconciliation

**Tasks:**

1. **Auto-Reconciliation Service**
   ```typescript
   async function reconcileLot(lotId: string): Promise<ReconciliationReport>
   ```

2. **Variance Detection**
   - Flag missing POs
   - Identify amount mismatches
   - Detect unexpected add-on POs

3. **Bulk Reconciliation**
   - Run for entire subdivision
   - Generate variance report
   - Export to Excel (backup workflow)

4. **Reconciliation Dashboard (UI)**
   - Subdivision-level view
   - Lot-level drill-down
   - Filter by variance status
   - Export capabilities

**Deliverable:** Automated reconciliation replaces manual spreadsheet checking

---

### Sprint 3: Intelligence Layer (Week 5-6)

**Goal:** Learn from historical data

**Tasks:**

1. **Plan Material Baseline Builder**
   ```typescript
   async function buildPlanBaselines(planType: string): Promise<void> {
     // Analyze all historical POs for this plan
     // Calculate avg quantities by material
     // Store in PlanMaterialBaseline table
   }
   ```

2. **Option Pricing Learning**
   ```typescript
   async function learnOptionPricing(optionCode: string): Promise<void> {
     // Analyze all historical option POs
     // Calculate avg price by plan type
     // Build confidence scores
   }
   ```

3. **Option Material Impact Learning**
   ```typescript
   async function learnOptionMaterialDeltas(
     optionCode: string,
     planType: string
   ): Promise<void> {
     // Compare POs with/without this option
     // Calculate material quantity deltas
     // Store in OptionMaterialModifier table
   }
   ```

4. **Confidence Scoring**
   - Calculate based on sample size
   - Weight by recency
   - Flag low-confidence predictions

**Deliverable:** System can predict materials and costs based on learned patterns

---

### Sprint 4: EPO Prediction Engine (Week 7-8)

**Goal:** Generate accurate EPO predictions

**Tasks:**

1. **EPO Generation Service**
   ```typescript
   async function generateEPO(lotId: string): Promise<EPO>
   ```

2. **EPO Review UI**
   - Show predicted materials with confidence
   - Highlight low-confidence items
   - Allow manual adjustments
   - Export to Excel (BuildPro format)

3. **EPO Approval Workflow**
   - Submit for approval
   - Track approval status
   - Version history

4. **Variance Analysis**
   ```typescript
   async function analyzeEPOVariance(
     epoId: string,
     actualPOId: string
   ): Promise<VarianceReport>
   ```

**Deliverable:** Can generate EPOs with confidence scores, track variances

---

### Sprint 5: Learning Feedback Loop (Week 9-10)

**Goal:** Continuous improvement from variances

**Tasks:**

1. **Automated Learning Updates**
   - When actual PO received → compare to EPO
   - Update plan baselines
   - Update option modifiers
   - Improve confidence scores

2. **Variance Reporting**
   - Weekly variance summary
   - Trending analysis
   - Outlier detection

3. **Recommendation Engine**
   - Suggest baseline adjustments
   - Flag systematic over/under ordering
   - Identify option price inconsistencies

**Deliverable:** System improves predictions automatically over time

---

### Sprint 6: BuildPro Integration (Week 11-12)

**Goal:** Bi-directional sync with BuildPro

**Tasks:**

1. **BuildPro API Integration**
   - Pull job data
   - Pull PO data
   - Push EPOs
   - Sync status updates

2. **Document Management**
   - Download PO PDFs
   - Upload EPO documents
   - Sync job files

3. **Real-time Updates**
   - Webhook for PO status changes
   - Auto-trigger reconciliation
   - Alert on new POs

**Deliverable:** Seamless integration with BuildPro eliminates manual data entry

---

## Integration Architecture

### System Architecture

```
┌─────────────────────────────────────────────────┐
│           MindFlow Platform                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Frontend (React/TypeScript)       │  │
│  │  - Lot Dashboard                          │  │
│  │  - PO Reconciliation                      │  │
│  │  - EPO Generation                         │  │
│  │  - Variance Analysis                      │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │      API Layer (Express/TypeScript)       │  │
│  │  - PO Management                          │  │
│  │  - EPO Generation                         │  │
│  │  - Learning Engine                        │  │
│  │  - BuildPro Sync                          │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │    Database (PostgreSQL + Prisma ORM)    │  │
│  │  - Lots & Jobs                            │  │
│  │  - Purchase Orders                        │  │
│  │  - EPOs                                   │  │
│  │  - Learning Models                        │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         External Integrations                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐    ┌──────────────┐          │
│  │  BuildPro    │    │  Excel       │          │
│  │  - Jobs      │    │  - Import    │          │
│  │  - POs       │    │  - Export    │          │
│  │  - Options   │    │  - Backup    │          │
│  └──────────────┘    └──────────────┘          │
│                                                  │
│  ┌──────────────┐    ┌──────────────┐          │
│  │  PDF Parser  │    │  Document    │          │
│  │  - Extract   │    │  Storage     │          │
│  │  - OCR       │    │  - S3/Cloud  │          │
│  └──────────────┘    └──────────────┘          │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Data Flow: EPO Generation

```
1. User selects lot + options
         │
         ▼
2. System retrieves plan baseline
   (PlanMaterialBaseline table)
         │
         ▼
3. For each selected option:
   - Get OptionMaterialModifier
   - Apply quantity deltas
   - Update confidence
         │
         ▼
4. Calculate predicted totals
   - Material quantities
   - Unit prices
   - Tax
         │
         ▼
5. Generate EPO record
   (EPO + EPOLineItem tables)
         │
         ▼
6. Export to Excel/PDF
         │
         ▼
7. Upload to BuildPro (optional)
```

### Data Flow: Variance Learning

```
1. Actual PO received from BuildPro
         │
         ▼
2. Match to corresponding EPO
         │
         ▼
3. Compare line-by-line:
   - Predicted qty vs Actual qty
   - Predicted price vs Actual price
         │
         ▼
4. Calculate variances
         │
         ▼
5. Update learning models:
   - PlanMaterialBaseline (exponential moving avg)
   - OptionMaterialModifier (confidence adjustment)
   - OptionPlanPricing (price updates)
         │
         ▼
6. Generate variance report
         │
         ▼
7. Next EPO uses improved predictions
```

---

## Learning Algorithm Design

### Exponential Moving Average for Baselines

```typescript
function updateBaseline(
  currentBaseline: number,
  actualValue: number,
  learningRate: number = 0.3
): number {
  return currentBaseline * (1 - learningRate) + actualValue * learningRate;
}

// Example:
// Current baseline for plank siding on G892: 324 EA
// Actual PO shows: 330 EA
// Updated baseline: 324 * 0.7 + 330 * 0.3 = 326.8 ≈ 327 EA
```

### Confidence Score Calculation

```typescript
function calculateConfidence(
  sampleSize: number,
  avgVariancePercent: number
): number {
  // Confidence increases with sample size (asymptotic to 1.0)
  const sampleConfidence = 1 - Math.exp(-sampleSize / 10);
  
  // Confidence decreases with high variance
  const accuracyConfidence = Math.max(0, 1 - Math.abs(avgVariancePercent / 100));
  
  // Combined score (weighted average)
  return sampleConfidence * 0.4 + accuracyConfidence * 0.6;
}

// Example:
// sampleSize = 15 lots
// avgVariancePercent = 8% (average 8% off)
// 
// sampleConfidence = 1 - e^(-15/10) = 0.777
// accuracyConfidence = 1 - 0.08 = 0.92
// 
// confidence = 0.777 * 0.4 + 0.92 * 0.6 = 0.863 (86.3%)
```

### Outlier Detection

```typescript
function detectOutliers(
  values: number[],
  threshold: number = 2.0
): { outliers: number[]; cleaned: number[] } {
  
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0
  ) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const outliers: number[] = [];
  const cleaned: number[] = [];
  
  values.forEach(val => {
    const zScore = Math.abs((val - mean) / stdDev);
    if (zScore > threshold) {
      outliers.push(val);
    } else {
      cleaned.push(val);
    }
  });
  
  return { outliers, cleaned };
}

// Use case: Remove anomalous POs before calculating baseline
// Example: [320, 324, 328, 322, 500, 326, 324]
// Mean: 349.1, StdDev: 63.7
// 500 has z-score of 2.37 → outlier
// Cleaned: [320, 324, 328, 322, 326, 324]
// New mean: 324 (much more accurate)
```

---

## Questions for Resolution

### Critical Questions

1. **Historical Data Access**
   - ❓ Do you have historical EPO reports accessible?
   - ❓ How far back does PO history go?
   - ❓ Are there any known data quality issues?

2. **EPO Timeline**
   - ❓ How many days before job start is EPO generated?
   - ❓ What triggers EPO generation (auto or manual)?
   - ❓ Who reviews/approves EPOs?
   - ❓ Are EPOs ever revised after initial generation?

3. **Approval Workflows**
   - ❓ What's the approval chain for EPOs?
   - ❓ Who can override predictions?
   - ❓ How are revisions tracked?

4. **BuildPro Integration**
   - ❓ Does BuildPro have an API or is it manual export?
   - ❓ Can we push EPOs back to BuildPro?
   - ❓ Is there webhook support for PO updates?

5. **Option Code Details**
   - ❓ Complete list of all option codes?
   - ❓ Are option codes standardized across subdivisions?
   - ❓ How often do new options get added?

6. **Variance Thresholds**
   - ❓ What's acceptable variance percentage?
   - ❓ At what threshold should system alert?
   - ❓ Who investigates significant variances?

### Business Rules to Confirm

1. **Tax Calculation**
   - ❓ Is tax always 7.8% (WA state)?
   - ❓ Are there tax exemptions for certain materials?

2. **Option Base Fee**
   - ❓ Is it always exactly $300?
   - ❓ Does it ever change?

3. **Combined Contract Rules**
   - ❓ Always uses framing PO number?
   - ❓ Are there exceptions?

4. **Document Retention**
   - ❓ How long to keep historical POs?
   - ❓ PDF storage location/duration?

---

## Next Steps

### Immediate Actions

1. **Confirm Sprint 1 Priorities**
   - PDF Parser + Lot Dashboard?
   - Or EPO Generator first?

2. **Data Access**
   - Provide access to historical EPOs (if available)
   - Share additional PO PDFs for parser testing
   - Export Richmond spreadsheet in Excel format

3. **Requirements Clarification**
   - Answer critical questions above
   - Define acceptance criteria for Sprint 1

4. **Development Environment**
   - Set up database (PostgreSQL)
   - Initialize Prisma
   - Create base API structure

### Success Criteria

**Sprint 1 Success:**
- ✅ Can import PO PDFs and extract all data
- ✅ Can import Richmond spreadsheet
- ✅ Lot dashboard shows all POs with totals
- ✅ Basic reconciliation flags variances

**Overall Project Success:**
- ✅ 80% reduction in manual reconciliation time
- ✅ EPO predictions within 10% of actual POs
- ✅ Automated variance learning improves accuracy over time
- ✅ Single source of truth eliminates spreadsheet errors

---

## Appendix

### Richmond Subdivision Data Summary

**Total Lots Analyzed:** 2 (Lots 115-116)

**Lot 115 (G892 Plan A):**
- Options: COVP, FIREWAL1, FPSING02
- Framing: $18,345.65
- Options: $4,480.40
- Add-on: $19.28
- Siding: $7,827.46
- **Total: $30,672.76**

**Lot 116 (G893 Plan A):**
- Options: FIREWAL1, FPSING02
- Framing: $17,884.03
- Options: $3,662.09
- Siding: $8,457.45
- **Total: $30,003.57**

**Key Variance:**
- G893 framing is $461.62 LESS than G892 despite using MORE materials
- This confirms plan-based contract pricing vs pure material cost

### Material Quantity Comparison (G892 vs G893)

| Material | G892 | G893 | Δ |
|----------|------|------|---|
| Foundation Vents | 9 | 11 | +2 |
| Plank Siding 5/16"x8-1/4"x12' | 324 | 346 | +22 |
| Panel Siding 5/16"x4'x9' | 5 | 8 | +3 |
| 4" Trim (LF) | 39 | 45 | +6 |
| 2.5" Trim (LF) | 8 | 18 | +10 |
| 2x2" RL (EA) | 4 | 6 | +2 |

---

**Document Version:** 1.0  
**Last Updated:** November 14, 2025  
**Next Review:** After Sprint 1 completion
