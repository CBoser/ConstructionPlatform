"""
Construction Purchase Order Reconciliation System
Automates reconciliation of BuildPro POs across Framing, Options, Siding, and Add-ons
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
import json


@dataclass
class POItem:
    """Individual purchase order"""
    po_number: str
    po_type: str  # 'FRAMING', 'OPTIONS', 'SIDING', 'ADD_ON'
    task_code: Optional[str]  # '44201' (Framing), '47100' (Siding)
    amount: Decimal
    tax: Decimal
    total: Decimal
    status: str
    line_items: List[Dict] = None


@dataclass
class LotPOSet:
    """Complete set of POs for a lot"""
    lot_number: str
    subdivision: str
    plan: str
    elevation: str
    options: List[str]
    
    combined_contract_po: str
    framing_po: Optional[POItem] = None
    options_po: Optional[POItem] = None
    siding_po: Optional[POItem] = None
    add_on_pos: List[POItem] = None
    
    expected_total: Optional[Decimal] = None  # From spreadsheet
    variance_threshold: Decimal = Decimal('100.00')


class POReconciliationEngine:
    """Engine for reconciling purchase orders"""
    
    def __init__(self):
        self.variance_rules = {
            'ACCEPTABLE': Decimal('50.00'),    # < $50 variance acceptable
            'MINOR': Decimal('200.00'),         # $50-200 needs review
            'SIGNIFICANT': Decimal('200.00')    # > $200 requires investigation
        }
    
    def reconcile_lot(self, lot: LotPOSet) -> Dict:
        """
        Reconcile all POs for a lot
        
        Args:
            lot: LotPOSet with all purchase orders
            
        Returns:
            Reconciliation report with status and variances
        """
        report = {
            'lot_number': lot.lot_number,
            'plan': lot.plan,
            'combined_contract': lot.combined_contract_po,
            'status': 'UNKNOWN',
            'issues': [],
            'financial_summary': {},
            'variances': []
        }
        
        # Calculate actual totals
        actual_total = Decimal('0.00')
        
        if lot.framing_po:
            actual_total += lot.framing_po.total
            report['financial_summary']['framing'] = float(lot.framing_po.total)
        
        if lot.options_po:
            actual_total += lot.options_po.total
            report['financial_summary']['options'] = float(lot.options_po.total)
        
        if lot.siding_po:
            actual_total += lot.siding_po.total
            report['financial_summary']['siding'] = float(lot.siding_po.total)
        
        if lot.add_on_pos:
            add_on_total = sum(po.total for po in lot.add_on_pos)
            actual_total += add_on_total
            report['financial_summary']['add_ons'] = float(add_on_total)
        
        report['financial_summary']['actual_total'] = float(actual_total)
        
        # Check for missing POs
        if not lot.framing_po:
            report['issues'].append('Missing Framing PO')
        
        if not lot.siding_po:
            report['issues'].append('Missing Siding PO')
        
        # Validate combined contract PO reuse
        if lot.framing_po and lot.siding_po:
            if lot.framing_po.po_number != lot.siding_po.po_number:
                report['issues'].append(
                    f'Framing and Siding have different PO numbers: '
                    f'{lot.framing_po.po_number} vs {lot.siding_po.po_number}'
                )
        
        # Compare against expected total
        if lot.expected_total:
            variance = actual_total - lot.expected_total
            report['financial_summary']['expected_total'] = float(lot.expected_total)
            report['financial_summary']['variance'] = float(variance)
            report['financial_summary']['variance_pct'] = float(
                (variance / lot.expected_total * 100) if lot.expected_total else 0
            )
            
            # Classify variance
            abs_variance = abs(variance)
            if abs_variance <= self.variance_rules['ACCEPTABLE']:
                variance_status = 'ACCEPTABLE'
            elif abs_variance <= self.variance_rules['MINOR']:
                variance_status = 'MINOR'
            else:
                variance_status = 'SIGNIFICANT'
            
            report['variances'].append({
                'type': 'EXPECTED_VS_ACTUAL',
                'amount': float(variance),
                'status': variance_status
            })
        
        # Determine overall status
        if len(report['issues']) == 0:
            if not report['variances']:
                report['status'] = 'MATCHED'
            else:
                # Get worst variance status
                variance_statuses = [v['status'] for v in report['variances']]
                if 'SIGNIFICANT' in variance_statuses:
                    report['status'] = 'SIGNIFICANT_VARIANCE'
                elif 'MINOR' in variance_statuses:
                    report['status'] = 'MINOR_VARIANCE'
                else:
                    report['status'] = 'MATCHED'
        else:
            report['status'] = 'INCOMPLETE'
        
        return report
    
    def check_option_pricing(
        self,
        option_code: str,
        plan: str,
        actual_cost: Decimal,
        historical_costs: Dict[str, Dict[str, Decimal]]
    ) -> Dict:
        """
        Check if option pricing is consistent with historical data
        
        Args:
            option_code: Option code (e.g., 'FIREWAL1', 'COVP')
            plan: Plan type (e.g., 'G892', 'G893')
            actual_cost: Actual cost charged
            historical_costs: Dict[option_code][plan] = cost
            
        Returns:
            Variance analysis
        """
        if option_code not in historical_costs:
            return {
                'status': 'NO_HISTORICAL_DATA',
                'message': f'No historical pricing for {option_code}'
            }
        
        if plan not in historical_costs[option_code]:
            return {
                'status': 'NO_PLAN_DATA',
                'message': f'No historical pricing for {option_code} on {plan}'
            }
        
        expected_cost = historical_costs[option_code][plan]
        variance = actual_cost - expected_cost
        variance_pct = (variance / expected_cost * 100) if expected_cost else 0
        
        return {
            'status': 'VARIANCE_DETECTED' if abs(variance) > Decimal('10.00') else 'MATCHED',
            'expected_cost': float(expected_cost),
            'actual_cost': float(actual_cost),
            'variance': float(variance),
            'variance_pct': float(variance_pct)
        }
    
    def detect_combined_contract_pattern(self, pos: List[POItem]) -> Optional[str]:
        """
        Detect which PO number is the combined contract
        (The PO number used for multiple task codes)
        
        Args:
            pos: List of purchase order items
            
        Returns:
            Combined contract PO number if detected
        """
        po_usage = {}
        
        for po in pos:
            if po.po_number not in po_usage:
                po_usage[po.po_number] = []
            po_usage[po.po_number].append(po.po_type)
        
        # Combined contract PO appears multiple times with different types
        for po_number, types in po_usage.items():
            if len(types) >= 2 and 'FRAMING' in types and 'SIDING' in types:
                return po_number
        
        return None


def parse_option_po_breakdown(option_po: POItem) -> Dict:
    """
    Parse option PO into base fee + individual options
    
    Standard structure:
    - Base Fee: $300.00
    - Option 1: Variable
    - Option 2: Variable
    - ...
    
    Args:
        option_po: Option purchase order
        
    Returns:
        Breakdown dictionary
    """
    breakdown = {
        'base_fee': Decimal('300.00'),  # Standard base fee
        'options': [],
        'subtotal': Decimal('0.00'),
        'tax': option_po.tax,
        'total': option_po.total
    }
    
    if option_po.line_items:
        for item in option_po.line_items:
            # Skip the "CONTRACT" line item (BFS Q4 Pricing)
            if item.get('sku') == 'CONTRACT':
                continue
            
            option_detail = {
                'code': item.get('code', 'UNKNOWN'),
                'description': item.get('description', ''),
                'cost': Decimal(str(item.get('cost', 0)))
            }
            breakdown['options'].append(option_detail)
    
    # Calculate subtotal
    breakdown['subtotal'] = breakdown['base_fee'] + sum(
        opt['cost'] for opt in breakdown['options']
    )
    
    return breakdown


# Example usage
if __name__ == "__main__":
    # Example: Lot 115 from Richmond Subdivision
    lot_115 = LotPOSet(
        lot_number="115",
        subdivision="North Haven",
        plan="G892",
        elevation="A",
        options=["COVP", "FIREWAL1", "FPSING02"],
        combined_contract_po="3417254",
        expected_total=Decimal("30672.76")
    )
    
    # Framing PO
    lot_115.framing_po = POItem(
        po_number="3417254",
        po_type="FRAMING",
        task_code="44201",
        amount=Decimal("17008.00"),
        tax=Decimal("1337.65"),
        total=Decimal("18345.65"),
        status="Accepted"
    )
    
    # Options PO
    lot_115.options_po = POItem(
        po_number="3417033",
        po_type="OPTIONS",
        task_code=None,
        amount=Decimal("4156.21"),
        tax=Decimal("324.19"),
        total=Decimal("4480.40"),
        status="Accepted",
        line_items=[
            {'code': 'COVP', 'description': '8x8 Covered Patio', 'cost': 1089.25},
            {'code': 'FIREWAL1', 'description': 'Fire Wall', 'cost': 2680.72},
            {'code': 'FPSING02', 'description': 'Fireplace', 'cost': 86.24},
        ]
    )
    
    # Siding PO (same PO# as framing, different task)
    lot_115.siding_po = POItem(
        po_number="3417254",
        po_type="SIDING",
        task_code="47100",
        amount=Decimal("7253.17"),
        tax=Decimal("574.29"),
        total=Decimal("7827.46"),
        status="Accepted"
    )
    
    # Add-on PO
    lot_115.add_on_pos = [
        POItem(
            po_number="3445234",
            po_type="ADD_ON",
            task_code=None,
            amount=Decimal("17.86"),
            tax=Decimal("1.42"),
            total=Decimal("19.28"),
            status="Accepted"
        )
    ]
    
    # Reconcile
    engine = POReconciliationEngine()
    report = engine.reconcile_lot(lot_115)
    
    print(json.dumps(report, indent=2))
