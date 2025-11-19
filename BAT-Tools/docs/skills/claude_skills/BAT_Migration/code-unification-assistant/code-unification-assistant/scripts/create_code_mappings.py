#!/usr/bin/env python3
"""
BAT Code Mapping Generator
Creates unified code mappings between Richmond mnemonic and Holt hierarchical codes
"""

import pandas as pd
import sys
from pathlib import Path
from collections import defaultdict
import re

class CodeMapper:
    """Generate unified code mappings"""
    
    def __init__(self):
        self.richmond_codes = {}
        self.holt_codes = {}
        self.category_mappings = {}
        self.unified_codes = []
        
    def load_richmond_codes(self, filepath):
        """Load Richmond material codes from file"""
        print(f"Loading Richmond codes from {filepath}")
        
        try:
            xl_file = pd.ExcelFile(filepath)
            
            # Try to find the main data sheet
            for sheet in xl_file.sheet_names:
                try:
                    df = xl_file.parse(sheet)
                    
                    # Find item code column
                    item_col = None
                    for col in df.columns:
                        if 'ITEM' in str(col).upper() or 'CODE' in str(col).upper():
                            item_col = col
                            break
                    
                    if item_col is None:
                        continue
                    
                    # Find description column
                    desc_col = None
                    for col in df.columns:
                        if 'DESC' in str(col).upper():
                            desc_col = col
                            break
                    
                    items = df[item_col].dropna().astype(str)
                    descriptions = df[desc_col].dropna().astype(str) if desc_col else None
                    
                    for idx, item in enumerate(items):
                        desc = descriptions.iloc[idx] if descriptions is not None and idx < len(descriptions) else ""
                        
                        # Extract prefix
                        match = re.match(r'^([A-Za-z]+)', item)
                        if match:
                            prefix = match.group(1).upper()
                            
                            if prefix not in self.richmond_codes:
                                self.richmond_codes[prefix] = {
                                    'examples': [],
                                    'descriptions': [],
                                    'count': 0
                                }
                            
                            if len(self.richmond_codes[prefix]['examples']) < 5:
                                self.richmond_codes[prefix]['examples'].append(item)
                            if desc and len(self.richmond_codes[prefix]['descriptions']) < 3:
                                self.richmond_codes[prefix]['descriptions'].append(desc)
                            self.richmond_codes[prefix]['count'] += 1
                
                except Exception as e:
                    continue
            
            print(f"✅ Loaded {len(self.richmond_codes)} unique Richmond prefixes")
            print(f"   Total items: {sum(c['count'] for c in self.richmond_codes.values())}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading Richmond codes: {e}")
            return False
    
    def load_holt_codes(self, filepath):
        """Load Holt hierarchical codes from file"""
        print(f"\nLoading Holt codes from {filepath}")
        
        try:
            xl_file = pd.ExcelFile(filepath)
            
            for sheet in xl_file.sheet_names:
                try:
                    df = xl_file.parse(sheet)
                    
                    # Find item code column
                    item_col = None
                    for col in df.columns:
                        if 'ITEM' in str(col).upper() or 'CODE' in str(col).upper():
                            item_col = col
                            break
                    
                    if item_col is None:
                        continue
                    
                    # Find description column
                    desc_col = None
                    for col in df.columns:
                        if 'DESC' in str(col).upper():
                            desc_col = col
                            break
                    
                    items = df[item_col].dropna().astype(str)
                    descriptions = df[desc_col].dropna().astype(str) if desc_col else None
                    
                    for idx, item in enumerate(items):
                        desc = descriptions.iloc[idx] if descriptions is not None and idx < len(descriptions) else ""
                        
                        # Check for hierarchical pattern (e.g., 10.20.30)
                        if re.match(r'^\d+\.\d+', item):
                            # Extract top-level category
                            top_level = item.split('.')[0]
                            
                            if top_level not in self.holt_codes:
                                self.holt_codes[top_level] = {
                                    'examples': [],
                                    'descriptions': [],
                                    'count': 0,
                                    'subcategories': set()
                                }
                            
                            if len(self.holt_codes[top_level]['examples']) < 5:
                                self.holt_codes[top_level]['examples'].append(item)
                            if desc and len(self.holt_codes[top_level]['descriptions']) < 3:
                                self.holt_codes[top_level]['descriptions'].append(desc)
                            self.holt_codes[top_level]['count'] += 1
                            
                            # Track subcategories
                            if '.' in item:
                                parts = item.split('.')
                                if len(parts) >= 2:
                                    self.holt_codes[top_level]['subcategories'].add(parts[1])
                
                except Exception as e:
                    continue
            
            print(f"✅ Loaded {len(self.holt_codes)} Holt top-level categories")
            print(f"   Total items: {sum(c['count'] for c in self.holt_codes.values())}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading Holt codes: {e}")
            return False
    
    def infer_category_mappings(self):
        """Infer likely category mappings based on descriptions"""
        print("\n🔍 Inferring category mappings...")
        
        # Common material categories
        categories = {
            'concrete': ['CONC', 'concrete', 'foundation'],
            'framing': ['FRM', 'FRAM', 'framing', 'lumber', 'wood'],
            'electrical': ['ELEC', 'electrical', 'wiring', 'panel'],
            'plumbing': ['PLMB', 'plumbing', 'pipe', 'fixture'],
            'hvac': ['HVAC', 'heating', 'cooling', 'furnace'],
            'drywall': ['DRY', 'DRYWALL', 'gypsum', 'sheetrock'],
            'roofing': ['ROOF', 'roofing', 'shingle'],
            'flooring': ['FLOOR', 'flooring', 'carpet', 'tile'],
            'paint': ['PAINT', 'painting', 'primer'],
            'cabinets': ['CAB', 'cabinet', 'vanity'],
            'appliances': ['APPL', 'appliance'],
            'doors': ['DOOR', 'door', 'entry'],
            'windows': ['WIND', 'window', 'glazing'],
            'insulation': ['INSUL', 'insulation', 'batt'],
        }
        
        # Create reverse lookup
        for category, keywords in categories.items():
            for prefix, data in self.richmond_codes.items():
                # Check if prefix or descriptions match category
                prefix_match = any(kw.upper() in prefix for kw in keywords)
                desc_match = any(
                    any(kw.lower() in desc.lower() for kw in keywords)
                    for desc in data['descriptions']
                )
                
                if prefix_match or desc_match:
                    if category not in self.category_mappings:
                        self.category_mappings[category] = {
                            'richmond_prefixes': [],
                            'holt_categories': [],
                            'confidence': 'inferred'
                        }
                    self.category_mappings[category]['richmond_prefixes'].append(prefix)
        
        print(f"✅ Inferred {len(self.category_mappings)} category mappings")
    
    def generate_unified_codes(self, strategy='hybrid'):
        """Generate unified code system"""
        print(f"\n🔨 Generating unified codes (strategy: {strategy})...")
        
        if strategy == 'hybrid':
            # Create systematic codes with mnemonic hints
            category_counter = 10
            
            for category, mapping in self.category_mappings.items():
                richmond_prefixes = mapping['richmond_prefixes']
                
                for prefix in richmond_prefixes:
                    if prefix in self.richmond_codes:
                        unified_code = f"{category_counter:02d}.{prefix[:4]}"
                        
                        self.unified_codes.append({
                            'unified_code': unified_code,
                            'category': category,
                            'richmond_prefix': prefix,
                            'richmond_examples': self.richmond_codes[prefix]['examples'][:3],
                            'description': f"{category.title()} materials ({prefix} prefix)",
                            'item_count': self.richmond_codes[prefix]['count']
                        })
                
                category_counter += 10
        
        elif strategy == 'systematic':
            # Pure hierarchical numeric
            category_counter = 10
            
            for category, mapping in self.category_mappings.items():
                unified_code = f"{category_counter:02d}.00"
                
                self.unified_codes.append({
                    'unified_code': unified_code,
                    'category': category,
                    'richmond_prefix': ', '.join(mapping['richmond_prefixes']),
                    'description': f"{category.title()} materials",
                    'item_count': sum(
                        self.richmond_codes[p]['count'] 
                        for p in mapping['richmond_prefixes'] 
                        if p in self.richmond_codes
                    )
                })
                
                category_counter += 10
        
        elif strategy == 'mnemonic':
            # Keep Richmond prefixes as primary
            for prefix, data in self.richmond_codes.items():
                self.unified_codes.append({
                    'unified_code': prefix,
                    'category': self._guess_category(prefix, data),
                    'richmond_prefix': prefix,
                    'richmond_examples': data['examples'][:3],
                    'description': f"Richmond {prefix} items",
                    'item_count': data['count']
                })
        
        print(f"✅ Generated {len(self.unified_codes)} unified code mappings")
    
    def _guess_category(self, prefix, data):
        """Guess category from prefix and descriptions"""
        # Simple keyword matching
        keywords = {
            'concrete': ['CONC'],
            'framing': ['FRM', 'FRAM'],
            'electrical': ['ELEC'],
            'plumbing': ['PLMB'],
            'hvac': ['HVAC'],
            'drywall': ['DRY'],
        }
        
        for category, prefixes in keywords.items():
            if any(p in prefix for p in prefixes):
                return category
        
        return 'other'
    
    def export_to_csv(self, output_file):
        """Export unified codes to CSV"""
        print(f"\n💾 Exporting to {output_file}...")
        
        df = pd.DataFrame(self.unified_codes)
        df.to_csv(output_file, index=False)
        
        print(f"✅ Exported {len(df)} unified code mappings")
        print(f"\nColumns: {', '.join(df.columns)}")
        
        # Print summary
        print("\n📊 Summary:")
        print(f"   Total unified codes: {len(df)}")
        print(f"   Total items mapped: {df['item_count'].sum():,.0f}")
        print(f"   Unique categories: {df['category'].nunique()}")
        
        return output_file
    
    def generate_report(self):
        """Generate analysis report"""
        print("\n" + "="*80)
        print("CODE UNIFICATION ANALYSIS REPORT")
        print("="*80)
        
        print("\n📋 RICHMOND SYSTEM:")
        print(f"   Unique Prefixes: {len(self.richmond_codes)}")
        print(f"   Total Items: {sum(c['count'] for c in self.richmond_codes.values()):,}")
        print(f"\n   Top 10 Prefixes by Usage:")
        sorted_richmond = sorted(
            self.richmond_codes.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )[:10]
        for prefix, data in sorted_richmond:
            print(f"      {prefix:10s} - {data['count']:>6,} items")
        
        print("\n📋 HOLT SYSTEM:")
        print(f"   Top-Level Categories: {len(self.holt_codes)}")
        print(f"   Total Items: {sum(c['count'] for c in self.holt_codes.values()):,}")
        print(f"\n   Top Categories:")
        sorted_holt = sorted(
            self.holt_codes.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )[:10]
        for category, data in sorted_holt:
            print(f"      {category:10s} - {data['count']:>6,} items")
        
        print("\n📋 UNIFIED SYSTEM:")
        print(f"   Category Mappings: {len(self.category_mappings)}")
        print(f"   Unified Codes: {len(self.unified_codes)}")
        
        print("\n" + "="*80)


def main():
    if len(sys.argv) < 3:
        print("Usage: python create_code_mappings.py <richmond_file> <holt_file> [strategy] [output.csv]")
        print("\nArguments:")
        print("  richmond_file: Richmond material list Excel file")
        print("  holt_file: Holt material list Excel file")
        print("  strategy: 'hybrid' (default), 'systematic', or 'mnemonic'")
        print("  output.csv: Output CSV file (default: code_mappings.csv)")
        print("\nExample:")
        print("  python create_code_mappings.py richmond.xlsx holt.xlsx hybrid mappings.csv")
        sys.exit(1)
    
    richmond_file = sys.argv[1]
    holt_file = sys.argv[2]
    strategy = sys.argv[3] if len(sys.argv) > 3 else 'hybrid'
    output_file = sys.argv[4] if len(sys.argv) > 4 else 'code_mappings.csv'
    
    mapper = CodeMapper()
    
    # Load codes
    if not mapper.load_richmond_codes(richmond_file):
        sys.exit(1)
    
    if not mapper.load_holt_codes(holt_file):
        sys.exit(1)
    
    # Generate mappings
    mapper.infer_category_mappings()
    mapper.generate_unified_codes(strategy)
    
    # Export
    mapper.export_to_csv(output_file)
    mapper.generate_report()
    
    print(f"\n✅ Code mapping complete!")
    print(f"   Output file: {output_file}")


if __name__ == "__main__":
    main()
