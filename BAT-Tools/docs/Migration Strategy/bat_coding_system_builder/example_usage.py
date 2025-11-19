#!/usr/bin/env python3
"""
BAT Material Importer - Example Usage
Demonstrates how to import Richmond materials into the unified system

This script shows how to:
1. Import materials from Richmond Excel files
2. Translate codes to unified format
3. Add materials to database
4. Generate reports
"""

import pandas as pd
from pathlib import Path
from bat_coding_system_builder import BATCodingSystemBuilder


def import_richmond_plan(builder: BATCodingSystemBuilder, 
                        plan_code: str,
                        excel_file: str):
    """
    Import a Richmond plan from Excel
    
    Args:
        builder: BATCodingSystemBuilder instance
        plan_code: Plan code (e.g., "1670", "G603")
        excel_file: Path to Richmond Excel file
    """
    print(f"\n{'='*80}")
    print(f"IMPORTING RICHMOND PLAN: {plan_code}")
    print(f"Source: {excel_file}")
    print(f"{'='*80}")
    
    # Add the plan to plans table
    cursor = builder.conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO plans (plan_code, plan_name, builder)
        VALUES (?, ?, 'Richmond')
    """, (plan_code, f"Plan {plan_code}"))
    builder.conn.commit()
    
    # Read Excel file
    # Note: This is example code - adjust sheet names and columns based on actual file
    try:
        df = pd.read_excel(excel_file, sheet_name=0)
        print(f"\n✓ Loaded {len(df):,d} rows from Excel")
    except Exception as e:
        print(f"\n✗ Error loading Excel: {e}")
        return
    
    # Expected columns (adjust based on actual Richmond file structure):
    # - Pack ID / Elevation(s) / Pack-Option Name
    # - Description
    # - Sku
    # - QTY
    # - Format1 (item type indicator)
    
    materials_added = 0
    errors = []
    
    for idx, row in df.iterrows():
        try:
            # Extract Richmond pack information
            richmond_pack_id = row.get('Pack ID / Elevation(s) / Pack-Option Name', '')
            
            # Skip if empty
            if not richmond_pack_id or pd.isna(richmond_pack_id):
                continue
            
            # Parse pack ID and elevation
            # Example: "|10.82 OPT DEN FOUNDATION     " or "|10.82BCD OPT DEN FOUNDATION"
            pack_clean = richmond_pack_id.strip()
            
            # Extract elevation from pack ID if present (e.g., "BCD" in "|10.82BCD")
            elevation_str = ""
            if any(c.isalpha() and c.isupper() for c in pack_clean.split()[0]):
                # Has elevation suffix
                import re
                match = re.search(r'[A-Z]+$', pack_clean.split()[0].replace('|', ''))
                if match:
                    elevation_str = match.group(0)
            
            # Get vendor SKU
            vendor_sku = str(row.get('Sku', ''))
            if pd.isna(vendor_sku):
                vendor_sku = ""
            
            # Get description
            description = str(row.get('Description', ''))
            
            # Get quantity
            quantity = row.get('QTY', 0)
            if pd.isna(quantity):
                quantity = 0
            
            # Get item type (from Format1 or other indicator)
            item_type = str(row.get('Format1', 'Framing'))
            if pd.isna(item_type):
                item_type = 'Framing'
            
            # Translate to unified code
            try:
                unified_code = builder.translate_richmond_code(
                    plan_code=plan_code,
                    richmond_pack_id=pack_clean.split()[0],  # Just the pack number part
                    elevation_str=elevation_str,
                    item_type=item_type
                )
                
                # Parse unified code to get components
                parts = unified_code.split('-')
                phase_code = parts[1]
                elevation_code = parts[2]
                item_type_code = parts[3]
                
                # Add material to database
                material_id = builder.add_material(
                    plan_code=plan_code,
                    phase_code=phase_code,
                    elevation_code=elevation_code,
                    item_type_code=item_type_code,
                    vendor_sku=vendor_sku,
                    description=description,
                    quantity=float(quantity),
                    unit='EA',
                    richmond_pack_id=pack_clean.split()[0],
                    notes=f"Imported from {excel_file}"
                )
                
                materials_added += 1
                
                if materials_added % 100 == 0:
                    print(f"  Processed {materials_added:,d} materials...")
                
            except ValueError as e:
                errors.append(f"Row {idx}: {str(e)}")
                
        except Exception as e:
            errors.append(f"Row {idx}: Unexpected error - {str(e)}")
    
    print(f"\n✓ Import complete:")
    print(f"  Materials added: {materials_added:,d}")
    print(f"  Errors: {len(errors)}")
    
    if errors and len(errors) <= 10:
        print("\nError details:")
        for error in errors:
            print(f"  {error}")
    elif len(errors) > 10:
        print(f"\nShowing first 10 errors (of {len(errors)} total):")
        for error in errors[:10]:
            print(f"  {error}")


def example_usage():
    """Example of how to use the BAT Coding System Builder"""
    
    print("="*80)
    print("BAT MATERIAL IMPORTER - EXAMPLE USAGE")
    print("="*80)
    
    # Initialize builder
    builder = BATCodingSystemBuilder("bat_unified.db")
    builder.connect()
    
    try:
        # Create schema if not exists
        builder.create_schema()
        
        # Load translation table
        builder.load_translation_table("coding_schema_translation_v2.csv")
        
        # Example 1: Add a single material manually
        print("\n" + "="*80)
        print("EXAMPLE 1: Adding a single material manually")
        print("="*80)
        
        # First add the plan
        cursor = builder.conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO plans (plan_code, plan_name, builder)
            VALUES ('1670', 'Plan 1670 - The Riverside', 'Richmond')
        """)
        builder.conn.commit()
        
        material_id = builder.add_material(
            plan_code="1670",
            phase_code="010.000",
            elevation_code="**",
            item_type_code="1000",
            vendor_sku="2616HF3TICAG",
            description="2x6x16 Hem Fir #3 Treated Incised Ground Contact",
            quantity=24.0,
            unit="EA",
            richmond_pack_id="|10.00",
            notes="Example foundation framing lumber"
        )
        
        print(f"\n✓ Added material ID: {material_id}")
        print(f"  Full code: 1670-010.000-**-1000")
        
        # Example 2: Query materials
        print("\n" + "="*80)
        print("EXAMPLE 2: Querying materials")
        print("="*80)
        
        # Get all materials for plan 1670
        materials_df = builder.get_materials_by_plan("1670")
        print(f"\n✓ Found {len(materials_df)} materials for plan 1670")
        if len(materials_df) > 0:
            print("\nFirst 5 materials:")
            print(materials_df[['full_code', 'vendor_sku', 'description', 'quantity']].head())
        
        # Example 3: Get materials by phase
        print("\n" + "="*80)
        print("EXAMPLE 3: Get materials by phase")
        print("="*80)
        
        phase_materials = builder.get_materials_by_phase("010.000")
        print(f"\n✓ Found {len(phase_materials)} materials for phase 010.000 (Foundation)")
        
        # Example 4: Get materials by elevation
        print("\n" + "="*80)
        print("EXAMPLE 4: Get materials by elevation")
        print("="*80)
        
        elev_materials = builder.get_materials_by_elevation("1670", "B")
        print(f"\n✓ Found {len(elev_materials)} materials for elevation B in plan 1670")
        
        # Example 5: Translate Richmond code
        print("\n" + "="*80)
        print("EXAMPLE 5: Code translation")
        print("="*80)
        
        examples = [
            ("1670", "|10.82", "B, C, D", "Framing"),
            ("G603", "|12.4x", "A, B, C", "Framing"),
            ("LE93", "|20.00", "", "Framing"),
        ]
        
        print("\nRichmond → Unified translations:")
        for plan, pack, elev, item_type in examples:
            try:
                unified = builder.translate_richmond_code(plan, pack, elev, item_type)
                print(f"  {plan} {pack:12s} {elev:12s} → {unified}")
            except ValueError as e:
                print(f"  {plan} {pack:12s} {elev:12s} → Error: {e}")
        
        # Example 6: Export report
        print("\n" + "="*80)
        print("EXAMPLE 6: Export materials report")
        print("="*80)
        
        output_file = "materials_report_1670.csv"
        builder.export_materials_report(output_file, plan_code="1670")
        
        # Example 7: Validate database
        print("\n" + "="*80)
        print("EXAMPLE 7: Database validation")
        print("="*80)
        
        validation_results = builder.validate_database()
        
        # Example 8: Generate summary
        print("\n" + "="*80)
        print("EXAMPLE 8: Generate summary report")
        print("="*80)
        
        summary = builder.generate_summary_report()
        print("\n" + summary)
        
        with open("example_summary.txt", "w") as f:
            f.write(summary)
        print("\n✓ Summary saved to: example_summary.txt")
        
        print("\n" + "="*80)
        print("✓ EXAMPLE USAGE COMPLETE")
        print("="*80)
        
    finally:
        builder.close()


def import_from_csv_template():
    """
    Example of importing from a CSV template
    Useful for bulk imports of pre-processed data
    """
    print("\n" + "="*80)
    print("EXAMPLE: Import from CSV template")
    print("="*80)
    
    # Create example CSV template
    template_data = {
        'plan_code': ['1670', '1670', '1670'],
        'richmond_pack_id': ['|10.00', '|10.00', '|11.00'],
        'elevation_str': ['', '', ''],
        'item_type': ['Framing', 'Framing', 'Framing'],
        'vendor_sku': ['2616HF3TICAG', '2410HF2TICAG', '12TJI110'],
        'description': [
            '2x6x16 Hem Fir #3 Treated',
            '2x4x10 Hem Fir #2 Treated',
            '12" TJI 110 Joist'
        ],
        'quantity': [24, 48, 16],
        'unit': ['EA', 'EA', 'EA']
    }
    
    df = pd.DataFrame(template_data)
    template_file = "import_template.csv"
    df.to_csv(template_file, index=False)
    print(f"\n✓ Created template file: {template_file}")
    
    # Now import it
    builder = BATCodingSystemBuilder("bat_unified.db")
    builder.connect()
    
    try:
        builder.load_translation_table("coding_schema_translation_v2.csv")
        
        # Add plan
        cursor = builder.conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO plans (plan_code, plan_name, builder)
            VALUES ('1670', 'Plan 1670', 'Richmond')
        """)
        builder.conn.commit()
        
        # Import each row
        materials_added = 0
        for _, row in df.iterrows():
            try:
                unified_code = builder.translate_richmond_code(
                    plan_code=row['plan_code'],
                    richmond_pack_id=row['richmond_pack_id'],
                    elevation_str=row['elevation_str'],
                    item_type=row['item_type']
                )
                
                parts = unified_code.split('-')
                
                builder.add_material(
                    plan_code=parts[0],
                    phase_code=parts[1],
                    elevation_code=parts[2],
                    item_type_code=parts[3],
                    vendor_sku=row['vendor_sku'],
                    description=row['description'],
                    quantity=float(row['quantity']),
                    unit=row['unit'],
                    richmond_pack_id=row['richmond_pack_id']
                )
                materials_added += 1
                
            except Exception as e:
                print(f"  Error importing row: {e}")
        
        print(f"\n✓ Imported {materials_added} materials from CSV")
        
    finally:
        builder.close()


if __name__ == "__main__":
    # Run example usage
    example_usage()
    
    # Uncomment to run CSV import example
    # import_from_csv_template()
