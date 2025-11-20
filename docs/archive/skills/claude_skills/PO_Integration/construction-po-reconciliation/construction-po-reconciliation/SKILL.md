---
name: construction-po-reconciliation
description: Automated reconciliation of construction purchase orders across multiple PO types (Framing, Options, Siding, Add-ons). Use when working with BuildPro POs, tracking combined contracts, analyzing option pricing variance by plan, detecting missing POs, calculating EPO estimates, or reconciling actual vs expected costs for residential construction projects.
---

# Construction PO Reconciliation

Automate reconciliation of construction purchase orders across Framing, Options, Siding, and Add-on POs for residential building projects.

## Quick Start

```python
from scripts.po_reconciliation import POReconciliationEngine, LotPOSet, POItem
from decimal import Decimal

# Create lot with POs
lot = LotPOSet(
    lot_number="115",
    subdivision="North Haven",
    plan="G892",
    elevation="A",
    options=["COVP", "FIREWAL1"],
    combined_contract_po="3417254",
    expected_total=Decimal("30672.76")
)

# Add POs
lot.framing_po = POItem(
    po_number="3417254",
    po_type="FRAMING",
    task_code="44201",
    total=Decimal("18345.65"),
    ...
)

# Reconcile
engine = POReconciliationEngine()
report = engine.reconcile_lot(lot)
```

## PO Types & Structure

### 1. Framing PO (Base Contract)
- **Task Code**: `44201`
- **Contains**: Base framing materials
- **Typically**: Uses combined contract PO number

### 2. Options PO
- **Structure**: $300 base fee + option costs
- **Pricing**: Plan-specific (G892 ≠ G893)
- **Separate PO**: Different from framing/siding

### 3. Siding PO
- **Task Code**: `47100`
- **Critical**: Often SAME PO number as Framing (different task code)
- **Contains**: Exterior siding and trim

### 4. Add-on POs
- **Purpose**: Missed items or corrections
- **Frequency**: 0-2 per lot
- **Separate PO numbers**: Each add-on gets own PO

See `references/po_structure.md` for detailed breakdowns and examples.

## Combined Contract Pattern

The "combined contract" PO is reused across tasks:

```
PO 3417254:
├─ Task 44201 (Framing):  $18,345.65
├─ Task 47100 (Siding):    $7,827.46
├─ Related Option PO 3417033: $4,480.40
└─ Related Add-on PO 3445234:    $19.28
                          -----------
Total:                    $30,672.79
```

## Key Reconciliation Checks

### 1. Missing PO Detection
```python
if not lot.framing_po:
    issues.append('Missing Framing PO')
if not lot.siding_po:
    issues.append('Missing Siding PO')
```

### 2. PO Number Validation
```python
# Framing and Siding should share PO number
if framing_po.po_number != siding_po.po_number:
    issues.append('PO number mismatch')
```

### 3. Variance Analysis
```python
variance = actual_total - expected_total
if abs(variance) > $200:
    status = 'SIGNIFICANT_VARIANCE'
elif abs(variance) > $50:
    status = 'MINOR_VARIANCE'
else:
    status = 'MATCHED'
```

### 4. Option Pricing Validation
```python
# Check if option price matches historical data for plan
result = engine.check_option_pricing(
    option_code="FIREWAL1",
    plan="G892",
    actual_cost=Decimal("2680.72"),
    historical_costs=history_db
)
```

## Option Pricing Intelligence

**Critical Insight**: Option costs vary by plan

```
FIREWAL1 (Fire Wall):
- Plan G892: $2,680.72
- Plan G893: $3,010.87
- Variance: +12.3%
```

Track historical pricing to predict costs:

```python
option_history = {
    'FIREWAL1': {
        'G892': Decimal('2680.72'),
        'G893': Decimal('3010.87')
    },
    'COVP': {
        'G892': Decimal('1089.25')
    }
}
```

## Common Patterns

### "W/OPTION PO" Notation
When spreadsheet shows `W/OPTION PO 3417033`:
- Cost is INCLUDED in that option PO
- Don't create separate PO
- Already accounted for

### Base Option Fee
ALL option POs have $300 base fee:
```
Options Subtotal = $300 + Σ(option costs)
```

## Variance Thresholds

- **Acceptable**: < $50
- **Minor**: $50 - $200 (needs review)
- **Significant**: > $200 (investigation required)

## Reconciliation Report Structure

```json
{
  "lot_number": "115",
  "plan": "G892",
  "status": "MATCHED | MINOR_VARIANCE | SIGNIFICANT_VARIANCE | INCOMPLETE",
  "financial_summary": {
    "framing": 18345.65,
    "options": 4480.40,
    "siding": 7827.46,
    "add_ons": 19.28,
    "actual_total": 30672.79,
    "expected_total": 30672.76,
    "variance": 0.03
  },
  "issues": [],
  "variances": []
}
```

## Integration Points

### With SupplyPro API
Use reconciliation data to validate orders before sending responses:
```python
# After reconciliation, send order acceptance
from supplypro_api import SupplyProClient
client.send_order_response(
    order_id=lot.framing_po.order_id,
    response_type="Accepted"
)
```

### With Azure Data Lake
Store reconciliation results for analytics:
```python
# Log to ADLS for Power BI
reconciliation_data = {
    'lot': lot.lot_number,
    'timestamp': datetime.now(),
    'report': report
}
# Upload to Azure Blob Storage
```

## Troubleshooting

**Total doesn't match**: Check if all add-on POs are included

**Plan pricing wrong**: Verify plan type is correct (G892 vs G893)

**Missing siding PO**: Check if it shares PO number with framing

**Option cost unexpected**: Compare to historical data for that plan

## Resources

- **PO Structure Guide**: `references/po_structure.md` - Detailed PO patterns
- **Reconciliation Script**: `scripts/po_reconciliation.py` - Core logic
