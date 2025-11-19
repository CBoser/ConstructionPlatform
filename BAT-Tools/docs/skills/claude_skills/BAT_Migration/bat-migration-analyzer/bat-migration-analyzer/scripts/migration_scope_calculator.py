#!/usr/bin/env python3
"""
Migration Scope Calculator
Quick validation of migration scope across material files
"""

import pandas as pd
from pathlib import Path
import sys

def calculate_scope(filepath):
    """Calculate total line items in a material file"""
    filepath = Path(filepath)
    
    try:
        xl_file = pd.ExcelFile(filepath)
        sheets = xl_file.sheet_names
        
        total_items = 0
        sheet_counts = {}
        
        print(f"\nAnalyzing: {filepath.name}")
        print("-" * 60)
        
        for sheet in sheets:
            try:
                df = xl_file.parse(sheet)
                count = len(df.dropna(how='all'))
                sheet_counts[sheet] = count
                total_items += count
            except Exception as e:
                sheet_counts[sheet] = f"Error: {str(e)}"
        
        print(f"\nSheet Breakdown:")
        sorted_sheets = sorted(sheet_counts.items(), 
                             key=lambda x: x[1] if isinstance(x[1], int) else 0, 
                             reverse=True)
        
        for sheet, count in sorted_sheets[:10]:
            if isinstance(count, int):
                print(f"  {sheet:40s} {count:>8,} rows")
            else:
                print(f"  {sheet:40s} {count}")
        
        if len(sorted_sheets) > 10:
            remaining = sum(c for _, c in sorted_sheets[10:] if isinstance(c, int))
            print(f"  ... and {len(sorted_sheets) - 10} more sheets    {remaining:>8,} rows")
        
        print("-" * 60)
        print(f"TOTAL LINE ITEMS: {total_items:,}")
        print("=" * 60)
        
        return total_items
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0


def calculate_multiple_files(filepaths):
    """Calculate scope across multiple files"""
    print("=" * 60)
    print("MIGRATION SCOPE CALCULATOR")
    print("=" * 60)
    
    file_scopes = {}
    total_scope = 0
    
    for filepath in filepaths:
        scope = calculate_scope(filepath)
        file_scopes[filepath] = scope
        total_scope += scope
    
    if len(filepaths) > 1:
        print("\n" + "=" * 60)
        print("COMBINED SCOPE SUMMARY")
        print("=" * 60)
        for filepath, scope in file_scopes.items():
            filename = Path(filepath).name
            print(f"{filename:40s} {scope:>12,} items")
        print("-" * 60)
        print(f"{'TOTAL MIGRATION SCOPE':40s} {total_scope:>12,} items")
        print("=" * 60)
    
    return total_scope


def main():
    if len(sys.argv) < 2:
        print("Usage: python migration_scope_calculator.py <file1> [file2] [file3] ...")
        print("\nCalculates total line items for BAT migration")
        sys.exit(1)
    
    filepaths = sys.argv[1:]
    total = calculate_multiple_files(filepaths)
    
    print(f"\n✅ Analysis complete: {total:,} total items identified for migration")


if __name__ == "__main__":
    main()
