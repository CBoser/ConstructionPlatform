#!/usr/bin/env python3
"""
BAT System Comparison Tool
Compares Richmond and Holt material management approaches side-by-side
"""

import pandas as pd
from pathlib import Path
import sys

class SystemComparator:
    """Compare Richmond vs Holt material management systems"""
    
    def __init__(self, richmond_file, holt_file):
        self.richmond_file = Path(richmond_file)
        self.holt_file = Path(holt_file)
        self.richmond_data = {}
        self.holt_data = {}
        
    def load_files(self):
        """Load both system files"""
        try:
            self.richmond_xl = pd.ExcelFile(self.richmond_file)
            self.holt_xl = pd.ExcelFile(self.holt_file)
            return True
        except Exception as e:
            print(f"Error loading files: {e}")
            return False
    
    def compare_structure(self):
        """Compare file structures"""
        richmond_sheets = self.richmond_xl.sheet_names
        holt_sheets = self.holt_xl.sheet_names
        
        print("="*80)
        print("FILE STRUCTURE COMPARISON")
        print("="*80)
        print(f"\nRichmond American Homes:")
        print(f"  Total Sheets: {len(richmond_sheets)}")
        print(f"  Sheet Names: {richmond_sheets[:10]}")
        if len(richmond_sheets) > 10:
            print(f"  ... and {len(richmond_sheets) - 10} more")
        
        print(f"\nHolt Homes:")
        print(f"  Total Sheets: {len(holt_sheets)}")
        print(f"  Sheet Names: {holt_sheets[:10]}")
        if len(holt_sheets) > 10:
            print(f"  ... and {len(holt_sheets) - 10} more")
        
        print(f"\n📊 Sheet Count: Richmond ({len(richmond_sheets)}) vs Holt ({len(holt_sheets)})")
    
    def compare_scope(self):
        """Compare migration scope"""
        richmond_total = sum(len(self.richmond_xl.parse(sheet).dropna(how='all')) 
                           for sheet in self.richmond_xl.sheet_names)
        holt_total = sum(len(self.holt_xl.parse(sheet).dropna(how='all')) 
                        for sheet in self.holt_xl.sheet_names)
        
        print("\n" + "="*80)
        print("MIGRATION SCOPE COMPARISON")
        print("="*80)
        print(f"\nRichmond American Homes:")
        print(f"  Total Line Items: {richmond_total:,}")
        
        print(f"\nHolt Homes:")
        print(f"  Total Line Items: {holt_total:,}")
        
        print(f"\n📊 Combined Migration Scope: {richmond_total + holt_total:,} line items")
    
    def run_comparison(self):
        """Run full comparison analysis"""
        if not self.load_files():
            return False
        
        print("\n" + "="*80)
        print("BAT SYSTEM COMPARISON REPORT")
        print("Richmond American Homes vs Holt Homes")
        print("="*80)
        
        self.compare_structure()
        self.compare_scope()
        
        print("\n" + "="*80)
        print("Comparison complete.")
        print("="*80)
        return True


def main():
    if len(sys.argv) < 3:
        print("Usage: python compare_systems.py <richmond_file> <holt_file>")
        sys.exit(1)
    
    richmond_file = sys.argv[1]
    holt_file = sys.argv[2]
    
    comparator = SystemComparator(richmond_file, holt_file)
    
    if comparator.run_comparison():
        print("\n✅ Comparison completed successfully")
    else:
        print("\n❌ Comparison failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
