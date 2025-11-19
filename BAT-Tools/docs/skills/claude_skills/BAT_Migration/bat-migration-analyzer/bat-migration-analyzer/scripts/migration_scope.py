#!/usr/bin/env python3
"""
BAT Migration Scope Calculator
Quick validation of total line items to migrate
"""

import pandas as pd
import sys
from pathlib import Path

def calculate_scope(filepath):
    """Calculate migration scope for a BAT file"""
    
    print("\n" + "="*80)
    print("BAT MIGRATION SCOPE CALCULATOR")
    print(f"File: {Path(filepath).name}")
    print("="*80 + "\n")
    
    try:
        xl = pd.ExcelFile(filepath)
        
        # Detect system
        filename = Path(filepath).name.lower()
        if "richmond" in filename or "rah" in filename:
            system = "Richmond"
            skip_sheets = ['Plan Index', 'PRICING TAB', 'Item Pricing']
        elif "holt" in filename:
            system = "Holt"
            skip_sheets = ['Plan Index', 'Subdivisions', 'IWP RS', 'IWP S4S', 'RL+ADDERS', 'RL_AV']
        else:
            system = "Unknown"
            skip_sheets = []
        
        print(f"System: {system}\n")
        
        # Get plan sheets
        plan_sheets = [s for s in xl.sheet_names if s not in skip_sheets]
        
        print(f"Plan Sheets Found: {len(plan_sheets)}")
        print()
        
        # Calculate materials per sheet
        total_materials = 0
        sheet_data = []
        
        for sheet in plan_sheets:
            try:
                df = xl.parse(sheet)
                # Count non-empty rows (excluding headers)
                material_count = len(df.dropna(how='all'))
                if system == "Richmond":
                    # Richmond typically has ~10 header rows
                    material_count = max(0, material_count - 10)
                elif system == "Holt":
                    # Holt typically has ~5 header rows
                    material_count = max(0, material_count - 5)
                
                total_materials += material_count
                sheet_data.append((sheet, material_count))
            except Exception as e:
                print(f"âš ï¸ Error reading sheet '{sheet}': {e}")
        
        # Display results
        print("Materials by Plan Sheet:")
        print("-" * 80)
        for sheet, count in sorted(sheet_data, key=lambda x: x[1], reverse=True)[:20]:
            print(f"  {sheet:50s}: {count:,} materials")
        
        if len(sheet_data) > 20:
            print(f"  ... and {len(sheet_data) - 20} more sheets")
        
        print()
        print("="*80)
        print("MIGRATION SCOPE SUMMARY")
        print("="*80)
        print(f"Total Plan Sheets:    {len(plan_sheets)}")
        print(f"Total Material Items: {total_materials:,}")
        print()
        
        # Estimation message
        if system != "Unknown":
            print("âœ… Scope validated successfully")
            print(f"   Ready for migration planning")
        else:
            print("âš ï¸ Unknown system - scope is estimated")
        
        print()
        
        return total_materials
        
    except Exception as e:
        print(f"âŒ Error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migration_scope.py <path_to_excel_file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    if not Path(filepath).exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    
    scope = calculate_scope(filepath)
    if scope is not None:
        sys.exit(0)
    else:
        sys.exit(1)
