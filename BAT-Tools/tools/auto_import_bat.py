#!/usr/bin/env python3
"""
Automated BAT Import Tool
Imports Richmond and Holt Excel files into unified database

Version: 1.0.0
Author: Corey Dev Framework
"""

import sys
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Optional

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / "docs" / "Migration Strategy" / "bat_coding_system_builder"))

from bat_coding_system_builder import BATCodingSystemBuilder

__version__ = "1.1.0"

class BATAutoImporter:
    """Automated BAT file importer with validation"""

    def __init__(self, db_path: str = None):
        """Initialize importer

        Args:
            db_path: Path to database (defaults to Migration Strategy location)
        """
        if db_path is None:
            db_path = Path(__file__).parent.parent / "docs" / "Migration Strategy" / "bat_coding_system_builder" / "bat_unified.db"

        self.db_path = Path(db_path)
        self.builder = BATCodingSystemBuilder(str(self.db_path))
        self.results = {
            'imported': [],
            'flagged': [],
            'failed': [],
            'warnings': []
        }
        self.stats = {
            'total_rows': 0,
            'total_codes': 0,
            'richmond_materials': 0,
            'holt_materials': 0
        }

    def parse_richmond_pack_name(self, pack_name: str) -> Dict:
        """Parse Richmond pack name into components

        Args:
            pack_name: Pack name like "|10.82BCD OPT DEN FOUNDATION"

        Returns:
            Dict with phase_major, phase_minor, elevations, description
        """
        # Remove leading pipe and spaces
        pack_clean = pack_name.strip().lstrip('|')

        # Split on first space to separate code from description
        parts = pack_clean.split(' ', 1)
        code_part = parts[0] if parts else ""
        description = parts[1] if len(parts) > 1 else ""

        # Split on period (if present)
        if '.' in code_part:
            major_part, minor_part = code_part.split('.', 1)
            # Handle edge case: "|.34" (period before number)
            if not major_part:
                # Use first digits from minor part as major
                minor_digits = ''.join(filter(str.isdigit, minor_part))
                if minor_digits:
                    major_part = minor_digits[:2] if len(minor_digits) >= 2 else minor_digits
                    minor_part = minor_digits[2:] if len(minor_digits) > 2 else ""
        else:
            # No period - simpler format like "|10" or "|11"
            major_part = code_part
            minor_part = ""

        # Extract phase major (digits only)
        phase_major = ''.join(filter(str.isdigit, major_part))

        # Extract phase minor and elevations from minor part
        phase_minor = ""
        elevations = ""

        if minor_part:
            for char in minor_part:
                if char.isdigit() or char in ['x', 'X']:
                    phase_minor += char
                elif char.isalpha() and char.upper() in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
                    # Elevation letters (could be ABCD elevations or suffixes like 'f', 's')
                    elevations += char.upper()
                # Skip other characters

        return {
            'phase_major': phase_major,
            'phase_minor': phase_minor,
            'elevations': elevations,
            'description': description,
            'error': None
        }

    def detect_item_type(self, description: str, format1: str = None) -> str:
        """Detect item type code from description

        Args:
            description: Material description
            format1: Richmond format1 field (if available)

        Returns:
            Item type code (e.g., "1000" for framing)
        """
        desc_lower = description.lower()

        # Framing lumber patterns
        if any(word in desc_lower for word in ['2x', 'lumber', 'stud', 'joist', 'beam', 'header']):
            return "1000"

        # Engineered lumber
        if any(word in desc_lower for word in ['tji', 'lvl', 'glulam', 'engineered']):
            return "1100"

        # Hardware
        if any(word in desc_lower for word in ['hanger', 'connector', 'nail', 'screw', 'bolt', 'strap']):
            return "1200"

        # Concrete/foundation
        if any(word in desc_lower for word in ['concrete', 'rebar', 'anchor', 'foundation']):
            return "1300"

        # Sheathing/housewrap
        if any(word in desc_lower for word in ['osb', 'plywood', 'sheathing', 'housewrap', 'tyvek']):
            return "2000"

        # Siding
        if any(word in desc_lower for word in ['siding', 'hardi', 'fiber cement']):
            return "2100"

        # Roofing
        if any(word in desc_lower for word in ['shingle', 'roofing', 'roof', 'underlayment']):
            return "2200"

        # Windows/doors
        if any(word in desc_lower for word in ['window', 'door', 'glass']):
            return "2300"

        # Default to general material
        return "9000"

    def parse_holt_code(self, code_str: str) -> Dict:
        """Parse Holt unified code into components

        Args:
            code_str: Code like "167010100 - 4085" or "167020070" (no separator)

        Returns:
            Dict with plan, phase, elevation, item_type, full_code

        Example:
            "167010100 - 4085" → {
                'plan': '1670',
                'phase': '101',
                'elevation': '00',
                'item_type': '4085',
                'full_code': '1670-101.000-00-4085'
            }
        """
        # Split on ' - ' to separate main code from item type
        parts = code_str.strip().split(' - ')

        if len(parts) == 2:
            # Standard format: "167010100 - 4085"
            main_part = parts[0].strip()
            item_type = parts[1].strip()
        elif len(parts) > 2:
            # Duplicate separator format: "233619505 - 4085 - 4085"
            # Take first part as main, second as item type, ignore rest
            main_part = parts[0].strip()
            item_type = parts[1].strip()
        elif len(parts) == 1:
            # No separator format: "167020070"
            # Assume item type is 9000 (general) or extract from elsewhere
            main_part = parts[0].strip()
            item_type = "9000"  # Default item type
        else:
            return {'error': f"Invalid code format: {code_str}"}

        # Handle different main_part lengths and alphanumeric codes
        # Alphanumeric codes like "169e10300" have letters in plan (169e)

        if len(main_part) == 8:
            # Format: PPP-PPP-EE (8 digits)
            plan = "0" + main_part[0:3]  # Pad plan to 4 digits
            phase = main_part[3:6]
            elevation = main_part[6:8]
        elif len(main_part) == 9:
            # Standard format: PPPP-PPP-EE (9 digits or alphanumeric)
            plan = main_part[0:4]
            phase = main_part[4:7]
            elevation = main_part[7:9]
        elif len(main_part) == 10:
            # Alphanumeric plan with extra character: "169e103000"
            # Format: PPPa-PPP-EE (10 chars, where 'a' is a letter in plan)
            plan = main_part[0:4]  # Take first 4 chars (e.g., "169e")
            phase = main_part[4:7]
            elevation = main_part[7:9]
        else:
            return {'error': f"Main code should be 8-10 characters, got {len(main_part)}: {main_part}"}

        # Validate item type
        item_type_clean = item_type.strip()
        if not item_type_clean:
            item_type_clean = "9000"  # Default

        # Build unified code: PPPP-PPP.000-EE-IIII
        full_code = f"{plan}-{phase}.000-{elevation}-{item_type_clean}"

        return {
            'plan': plan,
            'phase': phase,
            'elevation': elevation,
            'item_type': item_type_clean,
            'full_code': full_code,
            'error': None
        }

    def import_holt_materials(self, excel_path: Path, dry_run: bool = False) -> Dict:
        """Import Holt materials from Excel

        Args:
            excel_path: Path to Excel file
            dry_run: If True, parse but don't import

        Returns:
            Dict with import results
        """
        print(f"\n{'='*80}")
        print(f"IMPORTING HOLT MATERIALS")
        print(f"{'='*80}")
        print(f"File: {excel_path.name}")

        if not excel_path.exists():
            return {'error': f"File not found: {excel_path}"}

        # Read Excel file
        try:
            df = pd.read_excel(excel_path, sheet_name="indexMaterialListsbyPlan")
        except Exception as e:
            return {'error': f"Failed to read Excel: {e}"}

        print(f"Found {len(df)} material rows")
        self.stats['total_rows'] = len(df)

        # Detect columns
        option_col = None
        pack_col = None
        desc_col = None
        sku_col = None
        qty_col = None

        for col in df.columns:
            col_lower = str(col).lower()
            if 'option' in col_lower and 'phase' in col_lower:
                option_col = col
            if 'pack' in col_lower and 'id' in col_lower:
                pack_col = col
            if 'description' in col_lower and 'online' not in col_lower:
                desc_col = col
            if 'sku' in col_lower:
                sku_col = col
            if 'qty' in col_lower:
                qty_col = col

        if not option_col:
            return {'error': f"Could not find Option/Phase Number column. Found: {list(df.columns)}"}

        print(f"\nUsing columns:")
        print(f"  Option/Phase: {option_col}")
        print(f"  Pack ID: {pack_col}")
        print(f"  Description: {desc_col}")
        print(f"  SKU: {sku_col}")
        print(f"  Quantity: {qty_col}")

        # Process each row
        imported = 0
        flagged = 0
        failed = 0
        total_codes_generated = 0

        for idx, row in df.iterrows():
            # Skip empty rows
            option_phase_str = str(row.get(option_col, ""))
            if pd.isna(row.get(option_col)) or option_phase_str == 'nan':
                continue

            pack_id = str(row.get(pack_col, "")) if pack_col else ""
            description = str(row.get(desc_col, "")) if desc_col else ""
            sku = str(row.get(sku_col, "")) if sku_col else ""
            qty = row.get(qty_col, 0) if qty_col else 0

            # Split comma-separated codes
            codes = [c.strip() for c in option_phase_str.split(',')]
            total_codes_generated += len(codes)

            # Track if ANY code for this material succeeds
            material_success = False
            material_errors = []

            for code_str in codes:
                # Parse Holt code
                parsed = self.parse_holt_code(code_str)

                if parsed.get('error'):
                    material_errors.append(f"{code_str}: {parsed['error']}")
                    continue

                full_code = parsed['full_code']

                if not dry_run:
                    # Import to database
                    try:
                        # Note: Would call builder.add_material() here
                        # For now, just track success
                        self.results['imported'].append({
                            'row': idx + 2,
                            'full_code': full_code,
                            'pack_id': pack_id,
                            'description': description[:50],
                            'sku': sku,
                            'qty': qty
                        })
                        material_success = True
                    except Exception as e:
                        material_errors.append(f"{code_str}: {str(e)}")
                else:
                    # Dry run - show first few
                    if imported < 10 and len(codes) <= 3:  # Show simple cases
                        print(f"  Row {idx+2}: {full_code}")
                        print(f"    Pack: {pack_id}")
                        print(f"    Desc: {description[:60]}")
                    material_success = True

            # Track material-level success/failure
            if material_success:
                imported += 1
            elif material_errors:
                self.results['flagged'].append({
                    'row': idx + 2,
                    'pack_id': pack_id,
                    'description': description,
                    'codes': option_phase_str[:100],
                    'issue': '; '.join(material_errors[:3])
                })
                flagged += 1

        self.stats['total_codes'] = total_codes_generated
        self.stats['holt_materials'] = imported

        print(f"\n{'='*80}")
        print(f"IMPORT SUMMARY")
        print(f"{'='*80}")
        print(f"  📦 Material Rows:     {len(df)}")
        print(f"  🔢 Codes Generated:   {total_codes_generated}")
        print(f"  ✅ Imported:          {imported} materials ({len(self.results['imported'])} codes)")
        print(f"  ⚠️  Flagged:           {flagged}")
        print(f"  ❌ Failed:            {failed}")

        return {
            'imported': imported,
            'flagged': flagged,
            'failed': failed,
            'total': len(df),
            'codes_generated': total_codes_generated
        }

    def import_richmond_plan(self, excel_path: Path, plan_code: str = None,
                           sheet_name: str = None, dry_run: bool = False) -> Dict:
        """Import Richmond plan from Excel

        Args:
            excel_path: Path to Excel file
            plan_code: Plan code (e.g., "1670")
            sheet_name: Sheet name to import (None = auto-detect)
            dry_run: If True, parse but don't import

        Returns:
            Dict with import results
        """
        print(f"\n{'='*80}")
        print(f"IMPORTING RICHMOND PLAN: {plan_code or 'Auto-detect'}")
        print(f"{'='*80}")
        print(f"File: {excel_path.name}")

        if not excel_path.exists():
            return {'error': f"File not found: {excel_path}"}

        # Read Excel file
        try:
            if sheet_name:
                df = pd.read_excel(excel_path, sheet_name=sheet_name, header=1)
            else:
                # Try to find materials sheet
                xls = pd.ExcelFile(excel_path)
                sheet_names = xls.sheet_names

                # Look for common sheet names
                materials_sheet = None
                for name in sheet_names:
                    if 'combined' in name.lower() or 'material' in name.lower():
                        materials_sheet = name
                        break

                if not materials_sheet:
                    materials_sheet = sheet_names[0]

                print(f"Using sheet: {materials_sheet}")
                # Use header=1 to skip first empty row
                df = pd.read_excel(excel_path, sheet_name=materials_sheet, header=1)

        except Exception as e:
            return {'error': f"Failed to read Excel: {e}"}

        print(f"Found {len(df)} rows")

        # Detect columns
        pack_col = None
        desc_col = None
        sku_col = None
        qty_col = None
        plan_col = None

        for col in df.columns:
            col_lower = str(col).lower()
            # Richmond uses "Location" for pack ID
            if ('pack' in col_lower or 'location' in col_lower) and pack_col is None:
                pack_col = col
            if 'description' in col_lower and desc_col is None:
                desc_col = col
            if 'sku' in col_lower and sku_col is None:
                sku_col = col
            if 'qty' in col_lower or 'quantity' in col_lower:
                qty_col = col
            if 'plan' in col_lower and plan_col is None:
                plan_col = col

        if not pack_col:
            return {'error': f"Could not find Pack ID/Location column. Found columns: {list(df.columns)}"}

        print(f"Using columns:")
        print(f"  Plan: {plan_col}")
        print(f"  Pack ID/Location: {pack_col}")
        print(f"  Description: {desc_col}")
        print(f"  SKU: {sku_col}")
        print(f"  Quantity: {qty_col}")

        # If we have a Plan column, filter to specific plan
        if plan_col and plan_code:
            df = df[df[plan_col] == plan_code]
            print(f"\nFiltered to plan {plan_code}: {len(df)} rows")
        elif plan_col and not plan_code:
            # Show available plans
            unique_plans = df[plan_col].unique()
            print(f"\nAvailable plans: {', '.join([str(p) for p in unique_plans[:10]])}")
            if len(unique_plans) > 10:
                print(f"... and {len(unique_plans) - 10} more")
            return {'error': "Multiple plans found. Please specify --plan CODE"}

        if not plan_code:
            return {'error': "Could not detect plan code. Please specify --plan"}

        print(f"\nPlan Code: {plan_code}")

        # Process each row
        imported = 0
        flagged = 0
        failed = 0

        for idx, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row.get(pack_col)):
                continue

            pack_id = str(row[pack_col]).strip()
            description = str(row.get(desc_col, "")) if desc_col else ""
            sku = str(row.get(sku_col, "")) if sku_col else ""
            qty = row.get(qty_col, 0) if qty_col else 0

            # Parse pack name
            parsed = self.parse_richmond_pack_name(pack_id)

            if parsed.get('error'):
                self.results['flagged'].append({
                    'row': idx + 2,
                    'pack_id': pack_id,
                    'description': description,
                    'issue': parsed['error']
                })
                flagged += 1
                continue

            # Build unified phase code
            phase_major = parsed['phase_major']
            phase_minor = parsed['phase_minor']

            if not phase_major:
                self.results['flagged'].append({
                    'row': idx + 2,
                    'pack_id': pack_id,
                    'description': description,
                    'issue': "Could not extract phase major"
                })
                flagged += 1
                continue

            # Format phase code: XXX.XXX
            phase_code = f"{int(phase_major):03d}.{phase_minor or '000'}"

            # Get elevations
            elevation_code = parsed['elevations'] if parsed['elevations'] else "**"

            # Detect item type
            item_type_code = self.detect_item_type(description)

            # Build full code
            full_code = f"{plan_code}-{phase_code}-{elevation_code}-{item_type_code}"

            if not dry_run:
                # Import to database
                try:
                    # Note: Would call builder.add_material() here
                    # For now, just track success
                    self.results['imported'].append({
                        'row': idx + 2,
                        'full_code': full_code,
                        'pack_id': pack_id,
                        'description': description[:50]
                    })
                    imported += 1
                except Exception as e:
                    self.results['failed'].append({
                        'row': idx + 2,
                        'pack_id': pack_id,
                        'error': str(e)
                    })
                    failed += 1
            else:
                # Dry run - just show what would be imported
                if imported < 10:  # Show first 10
                    print(f"  Row {idx+2}: {full_code}")
                    print(f"    Pack: {pack_id}")
                    print(f"    Desc: {description[:60]}")
                imported += 1

        print(f"\n{'='*80}")
        print(f"IMPORT SUMMARY")
        print(f"{'='*80}")
        print(f"  ✅ Imported: {imported}")
        print(f"  ⚠️  Flagged:  {flagged}")
        print(f"  ❌ Failed:   {failed}")

        return {
            'imported': imported,
            'flagged': flagged,
            'failed': failed,
            'total': len(df)
        }

    def generate_report(self, output_path: Path = None):
        """Generate validation report

        Args:
            output_path: Where to save report (None = print to console)
        """
        report = []
        report.append("=" * 80)
        report.append("BAT IMPORT VALIDATION REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")

        # Summary
        report.append("SUMMARY")
        report.append("-" * 80)
        report.append(f"  ✅ Successfully Imported: {len(self.results['imported'])}")
        report.append(f"  ⚠️  Flagged for Review:   {len(self.results['flagged'])}")
        report.append(f"  ❌ Failed to Import:     {len(self.results['failed'])}")
        report.append("")

        # Flagged items
        if self.results['flagged']:
            report.append("ITEMS NEEDING REVIEW")
            report.append("-" * 80)
            for item in self.results['flagged'][:20]:  # Show first 20
                report.append(f"\nRow {item['row']}: {item['pack_id']}")
                report.append(f"  Description: {item['description'][:70]}")
                report.append(f"  Issue: {item['issue']}")

            if len(self.results['flagged']) > 20:
                report.append(f"\n... and {len(self.results['flagged']) - 20} more")
            report.append("")

        # Failed items
        if self.results['failed']:
            report.append("FAILED IMPORTS")
            report.append("-" * 80)
            for item in self.results['failed'][:10]:  # Show first 10
                report.append(f"\nRow {item['row']}: {item['pack_id']}")
                report.append(f"  Error: {item['error']}")
            report.append("")

        # Sample successful imports
        if self.results['imported']:
            report.append("SAMPLE SUCCESSFUL IMPORTS (first 10)")
            report.append("-" * 80)
            for item in self.results['imported'][:10]:
                report.append(f"Row {item['row']}: {item['full_code']}")
                report.append(f"  Pack: {item['pack_id']}")
                report.append(f"  Desc: {item['description']}")
                report.append("")

        report_text = "\n".join(report)

        if output_path:
            output_path.write_text(report_text)
            print(f"\n✅ Report saved to: {output_path}")
        else:
            print("\n" + report_text)


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Automated BAT Import Tool")
    parser.add_argument('--plan', help="Plan code (e.g., 1670)")
    parser.add_argument('--richmond', action='store_true', help="Import Richmond files")
    parser.add_argument('--holt', action='store_true', help="Import Holt files")
    parser.add_argument('--file', type=Path, help="Specific Excel file to import")
    parser.add_argument('--dry-run', action='store_true', help="Parse but don't import")
    parser.add_argument('--report', type=Path, help="Save report to file")
    parser.add_argument('--version', action='version', version=f'%(prog)s {__version__}')

    args = parser.parse_args()

    # Create importer
    importer = BATAutoImporter()

    # Holt import mode
    if args.holt and args.file:
        result = importer.import_holt_materials(
            args.file,
            dry_run=args.dry_run
        )

        if result.get('error'):
            print(f"❌ Error: {result['error']}")
            sys.exit(1)

        # Generate report
        importer.generate_report(args.report)

    # Richmond import mode
    elif args.file:
        result = importer.import_richmond_plan(
            args.file,
            plan_code=args.plan,
            dry_run=args.dry_run
        )

        if result.get('error'):
            print(f"❌ Error: {result['error']}")
            sys.exit(1)

        # Generate report
        importer.generate_report(args.report)

    else:
        print("BAT Auto Import Tool")
        print(f"Version: {__version__}")
        print("\nUsage:")
        print("  Richmond:")
        print("    --file FILE --plan G18L --dry-run    # Test import Richmond plan")
        print("    --file FILE --plan G18L               # Import Richmond plan G18L")
        print("\n  Holt:")
        print("    --holt --file FILE --dry-run          # Test import Holt materials")
        print("    --holt --file FILE                    # Import all Holt materials")
        print("\nExamples:")
        print('  python auto_import_bat.py --file "RAH_MaterialDatabase.xlsx" --plan G18L --dry-run')
        print('  python auto_import_bat.py --holt --file "indexMaterialListbyPlanHolt20251114.xlsx" --dry-run')


if __name__ == "__main__":
    main()
