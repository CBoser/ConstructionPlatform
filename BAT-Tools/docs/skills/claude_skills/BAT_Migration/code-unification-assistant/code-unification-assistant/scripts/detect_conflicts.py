#!/usr/bin/env python3
"""
BAT Code Conflict Detector
Detects overlapping or conflicting codes between Richmond and Holt systems
"""

import pandas as pd
import sys
from pathlib import Path

class ConflictDetector:
    """Detect code conflicts and overlaps"""
    
    def __init__(self, mappings_file):
        self.mappings_file = Path(mappings_file)
        self.conflicts = []
        self.warnings = []
        self.info = []
        
    def load_mappings(self):
        """Load code mappings CSV"""
        try:
            self.df = pd.read_csv(self.mappings_file)
            print(f"✅ Loaded {len(self.df)} code mappings")
            return True
        except Exception as e:
            print(f"❌ Error loading mappings: {e}")
            return False
    
    def check_duplicate_unified_codes(self):
        """Check for duplicate unified codes"""
        duplicates = self.df[self.df.duplicated(subset=['unified_code'], keep=False)]
        
        if len(duplicates) > 0:
            self.conflicts.append({
                'type': 'DUPLICATE_UNIFIED_CODES',
                'count': len(duplicates),
                'codes': duplicates['unified_code'].unique().tolist()
            })
            print(f"\n❌ CONFLICT: {len(duplicates)} duplicate unified codes found")
            for code in duplicates['unified_code'].unique():
                print(f"   {code} appears multiple times")
        else:
            self.info.append("✅ No duplicate unified codes")
    
    def check_category_overlaps(self):
        """Check for category overlaps"""
        category_counts = self.df['category'].value_counts()
        
        print(f"\n📊 Category Distribution:")
        for category, count in category_counts.items():
            print(f"   {category:20s}: {count:>4} codes")
        
        # Check for overcrowded categories
        overcrowded = category_counts[category_counts > 50]
        if len(overcrowded) > 0:
            self.warnings.append({
                'type': 'OVERCROWDED_CATEGORIES',
                'categories': overcrowded.to_dict()
            })
            print(f"\n⚠️  WARNING: {len(overcrowded)} overcrowded categories")
            for cat, count in overcrowded.items():
                print(f"   {cat}: {count} codes (consider subdivision)")
    
    def check_unmapped_items(self):
        """Check for items without mappings"""
        if 'item_count' in self.df.columns:
            total_items = self.df['item_count'].sum()
            print(f"\n📋 Total Items Mapped: {total_items:,.0f}")
            
            # Check for low coverage categories
            low_coverage = self.df[self.df['item_count'] < 10]
            if len(low_coverage) > 0:
                self.warnings.append({
                    'type': 'LOW_COVERAGE_CODES',
                    'count': len(low_coverage)
                })
                print(f"\n⚠️  WARNING: {len(low_coverage)} codes with <10 items")
    
    def check_naming_conflicts(self):
        """Check for potential naming conflicts"""
        # Check if richmond prefixes are used in multiple unified codes
        if 'richmond_prefix' in self.df.columns:
            prefix_usage = self.df.groupby('richmond_prefix')['unified_code'].count()
            multi_use = prefix_usage[prefix_usage > 1]
            
            if len(multi_use) > 0:
                self.warnings.append({
                    'type': 'MULTI_USE_PREFIXES',
                    'prefixes': multi_use.to_dict()
                })
                print(f"\n⚠️  WARNING: {len(multi_use)} Richmond prefixes map to multiple unified codes")
    
    def suggest_resolutions(self):
        """Suggest conflict resolutions"""
        print("\n" + "="*80)
        print("CONFLICT RESOLUTION SUGGESTIONS")
        print("="*80)
        
        if self.conflicts:
            print("\n❌ CRITICAL CONFLICTS (Must Fix):")
            for conflict in self.conflicts:
                if conflict['type'] == 'DUPLICATE_UNIFIED_CODES':
                    print(f"\n   Duplicate Unified Codes:")
                    print(f"   → Assign unique codes to each mapping")
                    print(f"   → Consider adding subcategory suffixes")
        
        if self.warnings:
            print("\n⚠️  WARNINGS (Should Review):")
            for warning in self.warnings:
                if warning['type'] == 'OVERCROWDED_CATEGORIES':
                    print(f"\n   Overcrowded Categories:")
                    print(f"   → Consider creating subcategories")
                    print(f"   → Use hierarchical codes (e.g., 10.10, 10.20)")
                
                elif warning['type'] == 'MULTI_USE_PREFIXES':
                    print(f"\n   Richmond Prefix Conflicts:")
                    print(f"   → Review category assignments")
                    print(f"   → Ensure prefixes map to single category")
        
        if not self.conflicts and not self.warnings:
            print("\n✅ No conflicts detected!")
            print("   Code mappings are clean and ready for use.")
    
    def generate_report(self):
        """Generate full conflict report"""
        print("\n" + "="*80)
        print("CODE CONFLICT ANALYSIS REPORT")
        print("="*80)
        
        self.check_duplicate_unified_codes()
        self.check_category_overlaps()
        self.check_unmapped_items()
        self.check_naming_conflicts()
        self.suggest_resolutions()
        
        print("\n" + "="*80)
        if self.conflicts:
            print("❌ CONFLICTS DETECTED - Review and fix before deployment")
            return False
        elif self.warnings:
            print("⚠️  WARNINGS PRESENT - Review recommended")
            return True
        else:
            print("✅ NO CONFLICTS - Mappings ready for use")
            return True
        print("="*80)


def main():
    if len(sys.argv) < 2:
        print("Usage: python detect_conflicts.py <code_mappings.csv>")
        print("\nDetects conflicts in unified code mappings")
        sys.exit(1)
    
    mappings_file = sys.argv[1]
    
    if not Path(mappings_file).exists():
        print(f"❌ File not found: {mappings_file}")
        sys.exit(1)
    
    detector = ConflictDetector(mappings_file)
    
    if not detector.load_mappings():
        sys.exit(1)
    
    success = detector.generate_report()
    
    if not success:
        print("\n❌ Conflict detection complete - issues found")
        sys.exit(1)
    else:
        print("\n✅ Conflict detection complete - no critical issues")
        sys.exit(0)


if __name__ == "__main__":
    main()
