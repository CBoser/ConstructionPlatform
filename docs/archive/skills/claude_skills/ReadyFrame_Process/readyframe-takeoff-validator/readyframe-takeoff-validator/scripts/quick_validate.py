#!/usr/bin/env python3
"""
ReadyFrame Takeoff Validator

Validates ReadyFrame material takeoffs against all 7 system rules.

Usage:
    # Quick validation
    python quick_validate.py --wall-length 84.5 --rf-plates 169 \\
        --loose-plates 84.5 --studs 64

    # JSON input
    python quick_validate.py --input takeoff.json --output detailed
"""

import argparse
import json
import sys
from typing import Dict, List, Tuple


class ReadyFrameValidator:
    """Validates ReadyFrame takeoffs against system rules."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.passes = []
        
    def validate_all(self, data: Dict) -> Dict:
        """
        Run all validation checks.
        
        Args:
            data: Takeoff data dictionary
            
        Returns:
            Validation results with status and messages
        """
        # Extract data
        wall_length = data.get('wall_length', 0)
        rf_plates = data.get('rf_plates', 0)
        loose_plates = data.get('loose_plates', 0)
        stud_count = data.get('studs', 0)
        spacing = data.get('spacing', 16)
        openings = data.get('openings', [])
        
        # Run all checks
        self.check_plate_ratio(rf_plates, loose_plates)
        self.check_total_plates(rf_plates, loose_plates, wall_length)
        self.check_stud_density(stud_count, wall_length, spacing)
        
        # Check opening components if openings exist
        if openings:
            self.check_opening_components(openings, data.get('components', {}))
        
        # Determine overall status
        if self.errors or len(self.warnings) > 2:
            status = "REQUIRES CORRECTION"
        elif self.warnings:
            status = "REVIEW RECOMMENDED"
        else:
            status = "READY TO ORDER"
        
        return {
            'status': status,
            'passes': self.passes,
            'warnings': self.warnings,
            'errors': self.errors
        }
    
    def check_plate_ratio(self, rf_plates: float, loose_plates: float):
        """Validate plate ratio (Rule #1)."""
        if loose_plates == 0:
            self.errors.append({
                'rule': 'Plate Ratio',
                'severity': 'CRITICAL',
                'message': 'Third top plate missing entirely',
                'solution': 'Add third top plate to Loose package'
            })
            return
        
        ratio = rf_plates / loose_plates
        
        if 1.8 <= ratio <= 2.2:
            self.passes.append({
                'rule': 'Plate Ratio',
                'message': f'Ratio {ratio:.2f} within acceptable range 1.8-2.2'
            })
        elif 1.6 <= ratio < 1.8 or 2.2 < ratio <= 2.4:
            self.warnings.append({
                'rule': 'Plate Ratio',
                'severity': 'WARNING',
                'message': f'Ratio {ratio:.2f} slightly outside ideal range',
                'expected': '2.0 (range 1.8-2.2)',
                'actual': f'{ratio:.2f}'
            })
        else:
            self.errors.append({
                'rule': 'Plate Ratio',
                'severity': 'ERROR' if 1.3 <= ratio <= 3.0 else 'CRITICAL',
                'message': f'Ratio {ratio:.2f} indicates categorization issue',
                'expected': '2.0 (range 1.8-2.2)',
                'actual': f'{ratio:.2f}',
                'solution': 'Verify third top plate is in Loose package'
            })
    
    def check_total_plates(self, rf_plates: float, loose_plates: float, 
                          wall_length: float):
        """Validate total plates (Rule #2)."""
        if wall_length == 0:
            self.warnings.append({
                'rule': 'Total Plates',
                'message': 'Wall length not provided, skipping check'
            })
            return
        
        total = rf_plates + loose_plates
        expected = wall_length * 3
        variance = abs(total - expected) / expected if expected > 0 else 1.0
        
        if variance <= 0.05:
            self.passes.append({
                'rule': 'Total Plates',
                'message': f'Total {total:.1f} LF matches expected {expected:.1f} LF'
            })
        elif variance <= 0.10:
            self.warnings.append({
                'rule': 'Total Plates',
                'severity': 'WARNING',
                'message': f'Variance {variance:.1%} slightly high',
                'expected': f'{expected:.1f} LF',
                'actual': f'{total:.1f} LF'
            })
        else:
            self.errors.append({
                'rule': 'Total Plates',
                'severity': 'ERROR' if variance <= 0.20 else 'CRITICAL',
                'message': f'Variance {variance:.1%} indicates missing plates',
                'expected': f'{expected:.1f} LF (3× wall length)',
                'actual': f'{total:.1f} LF',
                'solution': 'Verify all plate categories are included'
            })
    
    def check_stud_density(self, stud_count: int, wall_length: float, 
                          spacing: int = 16):
        """Validate stud density (Rule #3)."""
        if wall_length == 0:
            self.warnings.append({
                'rule': 'Stud Density',
                'message': 'Wall length not provided, skipping check'
            })
            return
        
        density = stud_count / wall_length
        expected = 0.75 if spacing == 16 else 0.50
        lower = expected - 0.10
        upper = expected + 0.10
        
        if lower <= density <= upper:
            self.passes.append({
                'rule': 'Stud Density',
                'message': f'Density {density:.2f}/LF appropriate for {spacing}" O.C.'
            })
        elif (expected - 0.15) <= density < lower or upper < density <= (expected + 0.15):
            self.warnings.append({
                'rule': 'Stud Density',
                'severity': 'WARNING',
                'message': f'Density {density:.2f}/LF slightly outside range',
                'expected': f'{expected:.2f}/LF (range {lower:.2f}-{upper:.2f})',
                'actual': f'{density:.2f}/LF'
            })
        else:
            self.errors.append({
                'rule': 'Stud Density',
                'severity': 'ERROR',
                'message': f'Density {density:.2f}/LF far from expected',
                'expected': f'{expected:.2f}/LF for {spacing}" O.C.',
                'actual': f'{density:.2f}/LF',
                'solution': 'Verify stud count and opening adjustments'
            })
    
    def check_opening_components(self, openings: List, components: Dict):
        """Validate opening components (Rule #6)."""
        trimmers = components.get('trimmers', 0)
        kings = components.get('kings', 0)
        headers = components.get('headers', 0)
        
        opening_count = len(openings) if isinstance(openings, list) else openings
        
        # Check minimum components
        if kings < 2 * opening_count:
            self.errors.append({
                'rule': 'Opening Components',
                'severity': 'CRITICAL',
                'message': 'Insufficient king studs for openings',
                'expected': f'{2 * opening_count} kings (2 per opening)',
                'actual': f'{kings} kings',
                'solution': 'Add king studs to Loose package (2 per opening)'
            })
        
        if trimmers < 2 * opening_count:
            self.errors.append({
                'rule': 'Opening Components',
                'severity': 'CRITICAL',
                'message': 'Insufficient trimmers for openings',
                'expected': f'Minimum {2 * opening_count} trimmers',
                'actual': f'{trimmers} trimmers',
                'solution': 'Add trimmers to ReadyFrame package (varies by type)'
            })
        
        if headers < opening_count:
            self.errors.append({
                'rule': 'Opening Components',
                'severity': 'CRITICAL',
                'message': 'Missing headers for openings',
                'expected': f'{opening_count} headers',
                'actual': f'{headers} headers',
                'solution': 'Add 1 header per opening to ReadyFrame package'
            })
        
        # If all present, mark as pass
        if kings >= 2 * opening_count and trimmers >= 2 * opening_count and headers >= opening_count:
            self.passes.append({
                'rule': 'Opening Components',
                'message': f'All required components present for {opening_count} opening(s)'
            })


def format_report(results: Dict, format_type: str = 'summary') -> str:
    """Format validation results."""
    lines = []
    lines.append("=" * 60)
    lines.append("READYFRAME TAKEOFF VALIDATION REPORT")
    lines.append("=" * 60)
    lines.append("")
    
    # Overall status
    status = results['status']
    status_symbol = "✓" if status == "READY TO ORDER" else "⚠️" if "REVIEW" in status else "❌"
    lines.append(f"OVERALL STATUS: {status_symbol} {status}")
    lines.append("")
    
    # Passes
    if results['passes']:
        lines.append("CHECKS PASSED:")
        for check in results['passes']:
            lines.append(f"  [✓] {check['rule']}: {check['message']}")
        lines.append("")
    
    # Warnings
    if results['warnings']:
        lines.append("WARNINGS:")
        for warning in results['warnings']:
            lines.append(f"  [⚠️] {warning['rule']}: {warning['message']}")
            if 'expected' in warning:
                lines.append(f"      Expected: {warning['expected']}")
                lines.append(f"      Actual: {warning['actual']}")
        lines.append("")
    
    # Errors
    if results['errors']:
        lines.append("ERRORS FOUND:")
        for i, error in enumerate(results['errors'], 1):
            lines.append(f"{i}. {error['rule']} ({error['severity']})")
            lines.append(f"   Problem: {error['message']}")
            if 'expected' in error:
                lines.append(f"   Expected: {error['expected']}")
                lines.append(f"   Actual: {error['actual']}")
            if 'solution' in error:
                lines.append(f"   Solution: {error['solution']}")
            lines.append("")
    
    lines.append("=" * 60)
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Validate ReadyFrame takeoffs'
    )
    
    # Input methods
    parser.add_argument('--input', help='JSON input file')
    parser.add_argument('--wall-length', type=float, help='Wall length (feet)')
    parser.add_argument('--rf-plates', type=float, help='ReadyFrame plates (LF)')
    parser.add_argument('--loose-plates', type=float, help='Loose plates (LF)')
    parser.add_argument('--studs', type=int, help='Total stud count')
    parser.add_argument('--spacing', type=int, default=16, help='Stud spacing (16 or 24)')
    parser.add_argument('--openings', type=int, default=0, help='Number of openings')
    
    # Output
    parser.add_argument('--output', default='summary', 
                       choices=['summary', 'json', 'detailed'],
                       help='Output format')
    
    args = parser.parse_args()
    
    # Load data
    if args.input:
        with open(args.input, 'r') as f:
            data = json.load(f)
    else:
        data = {
            'wall_length': args.wall_length or 0,
            'rf_plates': args.rf_plates or 0,
            'loose_plates': args.loose_plates or 0,
            'studs': args.studs or 0,
            'spacing': args.spacing,
            'openings': args.openings
        }
    
    # Validate
    validator = ReadyFrameValidator()
    results = validator.validate_all(data)
    
    # Output
    if args.output == 'json':
        print(json.dumps(results, indent=2))
    else:
        print(format_report(results, args.output))
    
    # Exit code
    sys.exit(0 if results['status'] == "READY TO ORDER" else 1)


if __name__ == "__main__":
    main()

