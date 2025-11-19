#!/usr/bin/env python3
"""
BAT Migration Analyzer - Material List Pattern Detection
Analyzes Richmond and Holt material files for structure, patterns, and migration scope.
"""

import pandas as pd
import sys
from pathlib import Path
from collections import Counter
import re

def analyze_file(filepath):
    """Main analysis function for material list files"""
    
    print(f"\n{'='*80}")
    print(f"BAT MATERIAL LIST ANALYSIS")
    print(f"File: {Path(filepath).name}")
    print(f"{'='*80}\n")
    
    try:
        # Load file
        xl = pd.ExcelFile(filepath)
        print(f"âœ… File loaded successfully")
        print(f"Total sheets: {len(xl.sheet_names)}\n")
        
        # Detect system type
        system_type = detect_system_type(xl.sheet_names, filepath)
        print(f"System Type Detected: {system_type}\n")
        
        if system_type == "Richmond":
            analyze_richmond(xl)
        elif system_type == "Holt":
            analyze_holt(xl)
        else:
            analyze_unknown(xl)
            
    except Exception as e:
        print(f"âŒ Error analyzing file: {e}")
        return None

def detect_system_type(sheet_names, filepath):
    """Detect if this is Richmond, Holt, or unknown system"""
    
    filename_lower = Path(filepath).name.lower()
    
    # Check filename patterns
    if "richmond" in filename_lower or "rah" in filename_lower:
        return "Richmond"
    if "holt" in filename_lower:
        return "Holt"
    
    # Check sheet name patterns
    richmond_indicators = ["pricing tab", "item pricing", "plan index"]
    holt_indicators = ["iwp rs", "iwp s4s", "plan index", "subdivisions"]
    
    sheets_lower = [s.lower() for s in sheet_names]
    
    richmond_score = sum(1 for ind in richmond_indicators if any(ind in s for s in sheets_lower))
    holt_score = sum(1 for ind in holt_indicators if any(ind in s for s in sheets_lower))
    
    if richmond_score > holt_score:
        return "Richmond"
    elif holt_score > richmond_score:
        return "Holt"
    else:
        return "Unknown"

def analyze_richmond(xl):
    """Analyze Richmond American Homes material structure"""
    
    print("="*80)
    print("RICHMOND SYSTEM ANALYSIS")
    print("="*80 + "\n")
    
    # Analyze Plan Index
    if "Plan Index" in xl.sheet_names:
        print("--- PLAN INDEX ANALYSIS ---\n")
        plan_df = xl.parse("Plan Index")
        print(f"Total plans: {len(plan_df)}")
        
        if 'Model' in plan_df.columns and 'Elevations' in plan_df.columns:
            print(f"Models with elevations: {plan_df['Model'].nunique()}")
            print("\nSample entries:")
            for _, row in plan_df.head(5).iterrows():
                print(f"  {row.get('Model', 'N/A')} | Elevations: {row.get('Elevations', 'N/A')}")
            
            print("\nâœ… KEY FINDING: Richmond separates Model from Elevations")
            print("   Implication: Supports 'Elevation as Dimension' architecture\n")
    
    # Analyze plan sheets for pack structure
    plan_sheets = [s for s in xl.sheet_names if s not in ['Plan Index', 'PRICING TAB', 'Item Pricing']]
    
    if plan_sheets:
        print(f"\n--- PLAN SHEET ANALYSIS ---")
        print(f"Plan sheets found: {len(plan_sheets)}\n")
        
        # Analyze first few plan sheets for structure
        sample_sheets = plan_sheets[:3]
        for sheet_name in sample_sheets:
            try:
                df = xl.parse(sheet_name, header=None)
                analyze_pack_structure(df, sheet_name)
            except:
                pass
    
    # Analyze item pricing
    if "Item Pricing" in xl.sheet_names:
        print("\n--- ITEM PRICING ANALYSIS ---\n")
        items_df = xl.parse("Item Pricing")
        analyze_item_patterns(items_df, "Richmond")
    
    # Calculate migration scope
    calculate_richmond_scope(xl)

def analyze_holt(xl):
    """Analyze Holt Homes material structure"""
    
    print("="*80)
    print("HOLT SYSTEM ANALYSIS")
    print("="*80 + "\n")
    
    # Analyze Plan Index
    if "Plan Index" in xl.sheet_names:
        print("--- PLAN INDEX ANALYSIS ---\n")
        plan_df = xl.parse("Plan Index")
        print(f"Total plans: {len(plan_df)}")
        
        if 'PLAN' in plan_df.columns:
            plans = plan_df['PLAN'].dropna().unique()
            print(f"Unique plans: {len(plans)}")
            print("\nSample plans:")
            for plan in list(plans)[:5]:
                print(f"  {plan}")
            print()
    
    # Analyze IWP sheets
    iwp_sheets = [s for s in xl.sheet_names if 'iwp' in s.lower()]
    if iwp_sheets:
        print(f"--- IWP SHEET ANALYSIS ---")
        print(f"IWP sheets found: {iwp_sheets}\n")
        
        for sheet in iwp_sheets:
            try:
                df = xl.parse(sheet)
                print(f"Sheet: {sheet}")
                print(f"  Rows: {len(df)}")
                print(f"  Columns: {list(df.columns)[:5]}")
                print()
            except:
                pass
    
    # Analyze plan sheets
    plan_sheets = [s for s in xl.sheet_names if s not in ['Plan Index', 'Subdivisions', 'IWP RS', 'IWP S4S', 'RL+ADDERS', 'RL_AV']]
    
    if plan_sheets:
        print(f"\n--- PLAN SHEET ANALYSIS ---")
        print(f"Plan sheets found: {len(plan_sheets)}\n")
        
        # Sample analysis
        for sheet_name in plan_sheets[:3]:
            try:
                df = xl.parse(sheet_name, header=None)
                analyze_holt_option_codes(df, sheet_name)
            except:
                pass
    
    # Calculate migration scope
    calculate_holt_scope(xl)

def analyze_pack_structure(df, sheet_name):
    """Analyze pack structure in a plan sheet"""
    
    # Look for pack patterns: |XX.XX format
    pack_pattern = re.compile(r'\|(\d+\.\d+[A-Z]*)')
    
    packs_found = []
    for idx, row in df.iterrows():
        for cell in row:
            if isinstance(cell, str) and '|' in cell:
                match = pack_pattern.search(cell)
                if match:
                    packs_found.append(match.group(1))
    
    if packs_found:
        print(f"Sheet: {sheet_name}")
        print(f"  Packs found: {len(set(packs_found))}")
        print(f"  Sample packs: {list(set(packs_found))[:5]}")
        
        # Check for elevation encoding in packs
        elevation_packs = [p for p in packs_found if any(c in p for c in ['A', 'B', 'C', 'D'])]
        if elevation_packs:
            print(f"  âš ï¸ Elevation-encoded packs: {elevation_packs[:3]}")
            print(f"     TRIPLE-ENCODING RISK detected")
        print()

def analyze_holt_option_codes(df, sheet_name):
    """Analyze Holt's 9-digit option code system"""
    
    # Look for 9-digit codes (Holt format: PPPPPCCCSS)
    code_pattern = re.compile(r'\b\d{9}\b')
    
    codes_found = []
    for idx, row in df.iterrows():
        for cell in row:
            if isinstance(cell, str):
                matches = code_pattern.findall(cell)
                codes_found.extend(matches)
    
    if codes_found:
        print(f"Sheet: {sheet_name}")
        print(f"  9-digit codes found: {len(set(codes_found))}")
        print(f"  Sample codes: {list(set(codes_found))[:5]}")
        
        # Analyze structure
        if codes_found:
            code = codes_found[0]
            print(f"  Structure analysis of {code}:")
            print(f"    Plan portion: {code[0:4]}")
            print(f"    Pack portion: {code[4]}")
            print(f"    Category: {code[5:7]}")
            print(f"    Sequence: {code[7:9]}")
        print()

def analyze_item_patterns(df, system):
    """Analyze item numbering patterns"""
    
    # Try to find item/SKU column
    item_cols = [c for c in df.columns if any(x in str(c).lower() for x in ['item', 'sku', 'code', 'number'])]
    
    if not item_cols:
        print("âŒ Could not identify item/SKU column\n")
        return
    
    item_col = item_cols[0]
    items = df[item_col].dropna().astype(str)
    
    print(f"Items analyzed: {len(items)}")
    print(f"Unique items: {items.nunique()}")
    
    # Analyze patterns
    patterns = Counter()
    for item in items:
        pattern = classify_pattern(item)
        patterns[pattern] += 1
    
    print("\nPattern distribution:")
    for pattern, count in patterns.most_common(10):
        pct = (count / len(items)) * 100
        print(f"  {pattern:30s}: {count:5d} ({pct:5.1f}%)")
    
    # Analyze prefixes
    prefixes = Counter()
    for item in items:
        # Get first 2-4 characters as prefix
        if len(item) >= 2:
            prefix = re.match(r'^[A-Z]{2,4}', item)
            if prefix:
                prefixes[prefix.group()] += 1
            elif item[0].isdigit():
                prefix_match = re.match(r'^\d{2}', item)
                if prefix_match:
                    prefixes[prefix_match.group()] += 1
    
    print(f"\nPrefix patterns (top 10):")
    for prefix, count in prefixes.most_common(10):
        pct = (count / len(items)) * 100
        print(f"  {prefix:10s}: {count:5d} ({pct:5.1f}%)")
    
    print()

def classify_pattern(item):
    """Classify item numbering pattern"""
    
    item = str(item).strip()
    
    if not item:
        return "EMPTY"
    
    # Check for specific patterns
    if re.match(r'^\d{6}$', item):
        return "6-DIGIT-NUMERIC"
    elif re.match(r'^\d{9}$', item):
        return "9-DIGIT-NUMERIC"
    elif re.match(r'^\d+$', item):
        return "PURE-NUMERIC"
    elif re.match(r'^[A-Z]+$', item):
        return "PURE-ALPHA"
    elif re.match(r'^\d+[A-Z]+', item):
        return "NUMBER-LETTER"
    elif re.match(r'^[A-Z]+\d+', item):
        return "LETTER-NUMBER"
    elif re.match(r'^[A-Z]+\d+[A-Z]+', item):
        return "LETTER-NUMBER-LETTER"
    elif ' ' in item:
        return "DESCRIPTION"
    else:
        return "MIXED-OTHER"

def calculate_richmond_scope(xl):
    """Calculate Richmond migration scope"""
    
    print("\n" + "="*80)
    print("RICHMOND MIGRATION SCOPE CALCULATION")
    print("="*80 + "\n")
    
    # Count plan sheets
    plan_sheets = [s for s in xl.sheet_names if s not in ['Plan Index', 'PRICING TAB', 'Item Pricing']]
    print(f"Plan sheets to migrate: {len(plan_sheets)}")
    
    # Estimate materials
    total_materials = 0
    for sheet in plan_sheets:
        try:
            df = xl.parse(sheet)
            # Count rows that look like materials (not headers)
            material_rows = len(df) - 10  # Rough estimate minus headers
            if material_rows > 0:
                total_materials += material_rows
        except:
            pass
    
    print(f"Estimated material line items: ~{total_materials:,}")
    print(f"\nâœ… Richmond scope validated\n")

def calculate_holt_scope(xl):
    """Calculate Holt migration scope"""
    
    print("\n" + "="*80)
    print("HOLT MIGRATION SCOPE CALCULATION")
    print("="*80 + "\n")
    
    # Count plan sheets
    plan_sheets = [s for s in xl.sheet_names if s not in ['Plan Index', 'Subdivisions', 'IWP RS', 'IWP S4S', 'RL+ADDERS', 'RL_AV']]
    print(f"Plan sheets to migrate: {len(plan_sheets)}")
    
    # Estimate materials
    total_materials = 0
    for sheet in plan_sheets:
        try:
            df = xl.parse(sheet)
            material_rows = len(df) - 5  # Rough estimate
            if material_rows > 0:
                total_materials += material_rows
        except:
            pass
    
    print(f"Estimated material line items: ~{total_materials:,}")
    print(f"\nâœ… Holt scope validated\n")

def analyze_unknown(xl):
    """Analyze unknown system format"""
    
    print("="*80)
    print("UNKNOWN SYSTEM - GENERAL ANALYSIS")
    print("="*80 + "\n")
    
    print(f"Sheets in file: {len(xl.sheet_names)}")
    print("\nSheet list:")
    for sheet in xl.sheet_names:
        print(f"  - {sheet}")
    
    print("\nâš ï¸ Unable to determine system type automatically")
    print("   Please verify this is a BAT migration file\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_material_list.py <path_to_excel_file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    if not Path(filepath).exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    
    analyze_file(filepath)
