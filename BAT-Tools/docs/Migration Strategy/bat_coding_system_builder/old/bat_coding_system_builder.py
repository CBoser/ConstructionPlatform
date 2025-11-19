#!/usr/bin/env python3
"""
BAT Coding System Builder
XXXX-XXX.XXX-XX-XXXX Unified Material Coding System

This program builds the complete unified coding system including:
- Database schema creation
- Translation table loading
- Material code generation
- Validation and reporting
- Export capabilities

Author: BAT Migration Project
Date: November 13, 2025
"""

import sqlite3
import pandas as pd
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Tuple, Dict
import csv


class BATCodingSystemBuilder:
    """Main class for building and managing the unified coding system"""
    
    def __init__(self, db_path: str = "bat_unified.db"):
        """
        Initialize the coding system builder
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = Path(db_path)
        self.conn = None
        self.translation_df = None
        
    def connect(self):
        """Establish database connection"""
        self.conn = sqlite3.connect(self.db_path)
        print(f"✓ Connected to database: {self.db_path}")
        
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print(f"✓ Database connection closed")
    
    def create_schema(self):
        """Create complete database schema"""
        print("\n" + "="*80)
        print("CREATING DATABASE SCHEMA")
        print("="*80)
        
        cursor = self.conn.cursor()
        
        # 1. Plans table
        print("\n1. Creating plans table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS plans (
                plan_code TEXT PRIMARY KEY,
                plan_name TEXT,
                builder TEXT CHECK(builder IN ('Richmond', 'Holt')),
                plan_type TEXT,
                square_feet INTEGER,
                bedrooms INTEGER,
                bathrooms REAL,
                stories REAL,
                active BOOLEAN DEFAULT 1,
                created_date DATE DEFAULT CURRENT_DATE,
                notes TEXT
            )
        """)
        print("   ✓ plans table created")
        
        # 2. Product phases table
        print("\n2. Creating product_phases table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_phases (
                phase_code TEXT PRIMARY KEY,
                phase_name TEXT NOT NULL,
                phase_major INTEGER,
                phase_minor INTEGER,
                richmond_pack_id TEXT,
                holt_activity TEXT,
                construction_sequence INTEGER,
                category TEXT,
                description TEXT,
                teaching_notes TEXT,
                created_date DATE DEFAULT CURRENT_DATE
            )
        """)
        print("   ✓ product_phases table created")
        
        # 3. Item types table
        print("\n3. Creating item_types table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS item_types (
                type_code TEXT PRIMARY KEY,
                type_name TEXT NOT NULL,
                category_major INTEGER,
                category_minor INTEGER,
                category_name TEXT,
                description TEXT,
                teaching_notes TEXT,
                created_date DATE DEFAULT CURRENT_DATE
            )
        """)
        print("   ✓ item_types table created")
        
        # 4. Elevation mappings table
        print("\n4. Creating elevation_mappings table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS elevation_mappings (
                mapping_id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_code TEXT,
                phase_code TEXT,
                elevation_code TEXT NOT NULL,
                is_universal BOOLEAN DEFAULT 0,
                notes TEXT,
                FOREIGN KEY (plan_code) REFERENCES plans(plan_code),
                FOREIGN KEY (phase_code) REFERENCES product_phases(phase_code),
                UNIQUE(plan_code, phase_code, elevation_code)
            )
        """)
        print("   ✓ elevation_mappings table created")
        
        # 5. Materials table (THE BIG ONE)
        print("\n5. Creating materials table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS materials (
                material_id INTEGER PRIMARY KEY AUTOINCREMENT,
                
                -- Code segments
                plan_code TEXT NOT NULL,
                phase_code TEXT NOT NULL,
                elevation_code TEXT NOT NULL,
                item_type_code TEXT NOT NULL,
                
                -- Full code (computed)
                full_code TEXT GENERATED ALWAYS AS 
                    (plan_code || '-' || phase_code || '-' || 
                     elevation_code || '-' || item_type_code) STORED,
                
                -- Material details
                vendor_sku TEXT,
                description TEXT,
                quantity REAL,
                unit TEXT,
                
                -- Pricing (separate from material definition)
                cost_per_unit REAL,
                freight_per_unit REAL,
                margin_pct REAL,
                
                -- Richmond legacy references
                richmond_pack_id TEXT,
                richmond_option_code TEXT,
                richmond_shipping_order INTEGER,
                
                -- Holt legacy references
                holt_item_number TEXT,
                holt_activity TEXT,
                holt_community TEXT,
                
                -- Metadata
                created_date DATE DEFAULT CURRENT_DATE,
                modified_date DATE DEFAULT CURRENT_DATE,
                created_by TEXT,
                notes TEXT,
                
                -- Foreign keys
                FOREIGN KEY (plan_code) REFERENCES plans(plan_code),
                FOREIGN KEY (phase_code) REFERENCES product_phases(phase_code),
                FOREIGN KEY (item_type_code) REFERENCES item_types(type_code)
            )
        """)
        print("   ✓ materials table created")
        
        # 6. Option codes translation table
        print("\n6. Creating option_translation table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS option_translation (
                translation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                richmond_code TEXT,
                holt_code TEXT,
                universal_phase_code TEXT,
                option_name TEXT,
                description TEXT,
                applies_to_elevations TEXT,
                FOREIGN KEY (universal_phase_code) REFERENCES product_phases(phase_code)
            )
        """)
        print("   ✓ option_translation table created")
        
        # 7. Vendors table
        print("\n7. Creating vendors table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendors (
                vendor_id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_code TEXT UNIQUE,
                vendor_name TEXT NOT NULL,
                vendor_type TEXT,
                contact_name TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                active BOOLEAN DEFAULT 1,
                notes TEXT
            )
        """)
        print("   ✓ vendors table created")
        
        # 8. Audit trail table (for learning-first)
        print("\n8. Creating audit_trail table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')),
                old_values TEXT,
                new_values TEXT,
                changed_by TEXT,
                changed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reason TEXT,
                teaching_note TEXT
            )
        """)
        print("   ✓ audit_trail table created")
        
        # Create indexes
        print("\n9. Creating indexes...")
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_materials_full_code ON materials(full_code)",
            "CREATE INDEX IF NOT EXISTS idx_materials_plan ON materials(plan_code)",
            "CREATE INDEX IF NOT EXISTS idx_materials_phase ON materials(phase_code)",
            "CREATE INDEX IF NOT EXISTS idx_materials_elevation ON materials(plan_code, elevation_code)",
            "CREATE INDEX IF NOT EXISTS idx_materials_item_type ON materials(item_type_code)",
            "CREATE INDEX IF NOT EXISTS idx_materials_richmond ON materials(richmond_pack_id)",
            "CREATE INDEX IF NOT EXISTS idx_materials_vendor_sku ON materials(vendor_sku)",
            "CREATE INDEX IF NOT EXISTS idx_elevation_mappings ON elevation_mappings(plan_code, phase_code)",
        ]
        
        for idx_sql in indexes:
            cursor.execute(idx_sql)
        print(f"   ✓ {len(indexes)} indexes created")
        
        self.conn.commit()
        print("\n✓ SCHEMA CREATION COMPLETE")
        
    def load_translation_table(self, csv_path: str):
        """
        Load the translation table from CSV
        
        Args:
            csv_path: Path to translation CSV file
        """
        print("\n" + "="*80)
        print("LOADING TRANSLATION TABLE")
        print("="*80)
        
        csv_file = Path(csv_path)
        if not csv_file.exists():
            raise FileNotFoundError(f"Translation table not found: {csv_path}")
        
        self.translation_df = pd.read_csv(csv_path)
        print(f"\n✓ Loaded {len(self.translation_df)} translation records")
        print(f"✓ Columns: {', '.join(self.translation_df.columns)}")
        
        # Populate product_phases from translation table
        self._populate_product_phases()
        
        # Populate item_types from translation table
        self._populate_item_types()
        
        print("\n✓ TRANSLATION TABLE LOADED")
        
    def _populate_product_phases(self):
        """Populate product_phases table from translation data"""
        print("\nPopulating product_phases table...")
        
        cursor = self.conn.cursor()
        
        # Get unique phase codes
        unique_phases = self.translation_df[[
            'New_Phase_Code', 'Pack_Name', 'Richmond_Pack_ID', 'Shipping_Order'
        ]].drop_duplicates(subset=['New_Phase_Code'])
        
        for _, row in unique_phases.iterrows():
            phase_code = row['New_Phase_Code']
            phase_parts = phase_code.split('.')
            phase_major = int(phase_parts[0])
            phase_minor = int(phase_parts[1]) if len(phase_parts) > 1 else 0
            
            cursor.execute("""
                INSERT OR IGNORE INTO product_phases 
                (phase_code, phase_name, phase_major, phase_minor, richmond_pack_id, construction_sequence)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                phase_code,
                row['Pack_Name'],
                phase_major,
                phase_minor,
                row['Richmond_Pack_ID'],
                row['Shipping_Order']
            ))
        
        self.conn.commit()
        count = cursor.execute("SELECT COUNT(*) FROM product_phases").fetchone()[0]
        print(f"   ✓ {count} product phases loaded")
        
    def _populate_item_types(self):
        """Populate item_types table from translation data"""
        print("Populating item_types table...")
        
        cursor = self.conn.cursor()
        
        # Define item type taxonomy
        item_types = [
            ('1000', 'Framing Lumber', 1, 0, 'Structural', 'Dimensional lumber for framing'),
            ('1100', 'Engineered Lumber', 1, 1, 'Structural', 'TJI, LVL, LSL, glulam'),
            ('1200', 'Structural Hardware', 1, 2, 'Structural', 'Hangers, connectors, fasteners'),
            ('1300', 'Concrete/Foundation', 1, 3, 'Structural', 'Concrete, rebar, forms'),
            ('2000', 'Sheathing/Housewrap', 2, 0, 'Exterior Envelope', 'OSB, plywood, housewrap'),
            ('2100', 'Siding', 2, 1, 'Exterior Envelope', 'All siding materials and trim'),
            ('2200', 'Roofing', 2, 2, 'Exterior Envelope', 'Shingles, underlayment, flashing'),
            ('2300', 'Windows/Doors', 2, 3, 'Exterior Envelope', 'Windows, doors, hardware'),
            ('2400', 'Exterior Trim', 2, 4, 'Exterior Envelope', 'Fascia, soffit, decorative trim'),
            ('3000', 'Plumbing Rough', 3, 0, 'Rough Mechanicals', 'Pipes, fittings, rough-in'),
            ('3100', 'Electrical Rough', 3, 1, 'Rough Mechanicals', 'Wire, boxes, rough-in'),
            ('3200', 'HVAC Rough', 3, 2, 'Rough Mechanicals', 'Ductwork, venting'),
            ('4000', 'Drywall', 4, 0, 'Interior Finish', 'Drywall, mud, tape'),
            ('4100', 'Interior Trim', 4, 1, 'Interior Finish', 'Baseboards, casings, crown'),
            ('4200', 'Flooring', 4, 2, 'Interior Finish', 'Carpet, tile, hardwood'),
            ('4300', 'Cabinets', 4, 3, 'Interior Finish', 'Kitchen and bath cabinets'),
            ('5000', 'Fixtures', 5, 0, 'Final/Appliances', 'Plumbing and lighting fixtures'),
            ('5100', 'Appliances', 5, 1, 'Final/Appliances', 'Kitchen appliances'),
            ('5200', 'Hardware', 5, 2, 'Final/Appliances', 'Door hardware, accessories'),
            ('9000', 'Custom Items', 9, 0, 'Special/Teaching', 'Custom or unusual items'),
            ('9900', 'Legacy Examples', 9, 9, 'Special/Teaching', 'Archived for teaching purposes'),
        ]
        
        for item_type in item_types:
            cursor.execute("""
                INSERT OR IGNORE INTO item_types 
                (type_code, type_name, category_major, category_minor, category_name, description)
                VALUES (?, ?, ?, ?, ?, ?)
            """, item_type)
        
        self.conn.commit()
        count = cursor.execute("SELECT COUNT(*) FROM item_types").fetchone()[0]
        print(f"   ✓ {count} item types loaded")
    
    def translate_richmond_code(self, plan_code: str, richmond_pack_id: str, 
                                elevation_str: str, item_type: str) -> str:
        """
        Translate Richmond code to unified format
        
        Args:
            plan_code: Plan identifier (e.g., "1670")
            richmond_pack_id: Richmond pack ID (e.g., "|10.82")
            elevation_str: Elevation letters (e.g., "B, C, D")
            item_type: Item type (e.g., "Framing")
            
        Returns:
            Unified code (e.g., "1670-010.820-BCD-1000")
        """
        if self.translation_df is None:
            raise ValueError("Translation table not loaded. Call load_translation_table() first.")
        
        # Normalize elevation string for matching
        elevation_str = elevation_str.strip() if elevation_str else ""
        
        # Look up in translation table
        match = self.translation_df[
            (self.translation_df['Richmond_Pack_ID'] == richmond_pack_id) &
            (self.translation_df['Elevation_Letters'] == elevation_str) &
            (self.translation_df['Item_Type'] == item_type)
        ]
        
        if len(match) == 0:
            # Try without elevation match
            match = self.translation_df[
                (self.translation_df['Richmond_Pack_ID'] == richmond_pack_id) &
                (self.translation_df['Item_Type'] == item_type)
            ]
            
            if len(match) == 0:
                raise ValueError(f"No translation found for {richmond_pack_id} with type {item_type}")
            
            # Use first match
            match = match.iloc[0:1]
        
        row = match.iloc[0]
        
        return f"{plan_code}-{row['New_Phase_Code']}-{row['New_Elevation_Code']}-{row['New_Item_Code']}"
    
    def add_material(self, plan_code: str, phase_code: str, elevation_code: str,
                    item_type_code: str, vendor_sku: str, description: str,
                    quantity: float, unit: str = "EA",
                    richmond_pack_id: str = None, richmond_option_code: str = None,
                    notes: str = None) -> int:
        """
        Add a material to the database
        
        Args:
            plan_code: Plan identifier
            phase_code: Phase code (e.g., "010.820")
            elevation_code: Elevation code (e.g., "BCD" or "**")
            item_type_code: Item type code (e.g., "1000")
            vendor_sku: Vendor SKU
            description: Material description
            quantity: Quantity
            unit: Unit of measure
            richmond_pack_id: Original Richmond pack ID (for traceability)
            richmond_option_code: Original Richmond option code
            notes: Additional notes
            
        Returns:
            material_id of inserted record
        """
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO materials 
            (plan_code, phase_code, elevation_code, item_type_code,
             vendor_sku, description, quantity, unit,
             richmond_pack_id, richmond_option_code, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            plan_code, phase_code, elevation_code, item_type_code,
            vendor_sku, description, quantity, unit,
            richmond_pack_id, richmond_option_code, notes
        ))
        
        self.conn.commit()
        return cursor.lastrowid
    
    def get_materials_by_plan(self, plan_code: str) -> pd.DataFrame:
        """Get all materials for a specific plan"""
        query = """
            SELECT 
                material_id,
                full_code,
                phase_code,
                elevation_code,
                item_type_code,
                vendor_sku,
                description,
                quantity,
                unit,
                richmond_pack_id,
                richmond_option_code
            FROM materials
            WHERE plan_code = ?
            ORDER BY phase_code, elevation_code, item_type_code
        """
        return pd.read_sql_query(query, self.conn, params=[plan_code])
    
    def get_materials_by_phase(self, phase_code: str) -> pd.DataFrame:
        """Get all materials for a specific phase across all plans"""
        query = """
            SELECT 
                material_id,
                plan_code,
                full_code,
                elevation_code,
                item_type_code,
                vendor_sku,
                description,
                quantity,
                unit
            FROM materials
            WHERE phase_code = ?
            ORDER BY plan_code, elevation_code
        """
        return pd.read_sql_query(query, self.conn, params=[phase_code])
    
    def get_materials_by_elevation(self, plan_code: str, elevation_letter: str) -> pd.DataFrame:
        """Get all materials for a specific elevation in a plan"""
        query = """
            SELECT 
                material_id,
                full_code,
                phase_code,
                item_type_code,
                vendor_sku,
                description,
                quantity,
                unit
            FROM materials
            WHERE plan_code = ?
              AND (elevation_code = ? 
                   OR elevation_code LIKE '%' || ? || '%'
                   OR elevation_code = '**')
            ORDER BY phase_code, item_type_code
        """
        return pd.read_sql_query(query, self.conn, params=[plan_code, elevation_letter, elevation_letter])
    
    def validate_database(self) -> Dict[str, any]:
        """
        Validate database integrity and return statistics
        
        Returns:
            Dictionary with validation results
        """
        print("\n" + "="*80)
        print("DATABASE VALIDATION")
        print("="*80)
        
        cursor = self.conn.cursor()
        results = {}
        
        # Count records in each table
        tables = [
            'plans', 'product_phases', 'item_types', 'elevation_mappings',
            'materials', 'option_translation', 'vendors', 'audit_trail'
        ]
        
        print("\nRecord Counts:")
        print("-" * 40)
        for table in tables:
            count = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            results[f"{table}_count"] = count
            print(f"  {table:25s}: {count:>8,d}")
        
        # Check for orphaned records
        print("\nIntegrity Checks:")
        print("-" * 40)
        
        orphaned_materials = cursor.execute("""
            SELECT COUNT(*) FROM materials m
            WHERE NOT EXISTS (SELECT 1 FROM plans p WHERE p.plan_code = m.plan_code)
        """).fetchone()[0]
        results['orphaned_materials'] = orphaned_materials
        print(f"  Orphaned materials:       {orphaned_materials:>8,d}")
        
        # Check for missing phase codes
        missing_phases = cursor.execute("""
            SELECT COUNT(*) FROM materials m
            WHERE NOT EXISTS (SELECT 1 FROM product_phases p WHERE p.phase_code = m.phase_code)
        """).fetchone()[0]
        results['missing_phases'] = missing_phases
        print(f"  Missing phase codes:      {missing_phases:>8,d}")
        
        # Check for missing item types
        missing_item_types = cursor.execute("""
            SELECT COUNT(*) FROM materials m
            WHERE NOT EXISTS (SELECT 1 FROM item_types i WHERE i.type_code = m.item_type_code)
        """).fetchone()[0]
        results['missing_item_types'] = missing_item_types
        print(f"  Missing item types:       {missing_item_types:>8,d}")
        
        # Get unique plan codes
        unique_plans = cursor.execute("SELECT COUNT(DISTINCT plan_code) FROM materials").fetchone()[0]
        results['unique_plans'] = unique_plans
        print(f"  Unique plans:             {unique_plans:>8,d}")
        
        # Get unique phase codes
        unique_phases = cursor.execute("SELECT COUNT(DISTINCT phase_code) FROM materials").fetchone()[0]
        results['unique_phases'] = unique_phases
        print(f"  Unique phases:            {unique_phases:>8,d}")
        
        # Get unique elevation codes
        unique_elevations = cursor.execute("SELECT COUNT(DISTINCT elevation_code) FROM materials").fetchone()[0]
        results['unique_elevations'] = unique_elevations
        print(f"  Unique elevations:        {unique_elevations:>8,d}")
        
        # Check for duplicate full codes
        duplicates = cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT full_code, COUNT(*) as cnt
                FROM materials
                GROUP BY full_code
                HAVING cnt > 1
            )
        """).fetchone()[0]
        results['duplicate_codes'] = duplicates
        print(f"  Duplicate full codes:     {duplicates:>8,d}")
        
        print("\n✓ VALIDATION COMPLETE")
        
        return results
    
    def export_materials_report(self, output_path: str, plan_code: str = None):
        """
        Export materials report to CSV
        
        Args:
            output_path: Path to output CSV file
            plan_code: Optional plan code to filter by
        """
        query = """
            SELECT 
                m.material_id,
                m.full_code,
                m.plan_code,
                m.phase_code,
                p.phase_name,
                m.elevation_code,
                m.item_type_code,
                i.type_name,
                m.vendor_sku,
                m.description,
                m.quantity,
                m.unit,
                m.richmond_pack_id,
                m.richmond_option_code,
                m.created_date
            FROM materials m
            LEFT JOIN product_phases p ON m.phase_code = p.phase_code
            LEFT JOIN item_types i ON m.item_type_code = i.type_code
        """
        
        if plan_code:
            query += f" WHERE m.plan_code = '{plan_code}'"
        
        query += " ORDER BY m.plan_code, m.phase_code, m.elevation_code, m.item_type_code"
        
        df = pd.read_sql_query(query, self.conn)
        df.to_csv(output_path, index=False)
        
        print(f"\n✓ Exported {len(df):,d} materials to: {output_path}")
        
        return df
    
    def generate_summary_report(self) -> str:
        """Generate a text summary report"""
        cursor = self.conn.cursor()
        
        report = []
        report.append("="*80)
        report.append("BAT UNIFIED CODING SYSTEM - SUMMARY REPORT")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("="*80)
        
        # Materials by plan
        report.append("\n\nMATERIALS BY PLAN")
        report.append("-"*80)
        plan_stats = cursor.execute("""
            SELECT 
                plan_code,
                COUNT(*) as material_count,
                COUNT(DISTINCT phase_code) as phase_count,
                COUNT(DISTINCT elevation_code) as elevation_count,
                SUM(quantity) as total_quantity
            FROM materials
            GROUP BY plan_code
            ORDER BY plan_code
        """).fetchall()
        
        report.append(f"{'Plan':<10} {'Materials':>10} {'Phases':>10} {'Elevations':>12} {'Total Qty':>15}")
        report.append("-"*80)
        for row in plan_stats:
            report.append(f"{row[0]:<10} {row[1]:>10,d} {row[2]:>10,d} {row[3]:>12,d} {row[4]:>15,.2f}")
        
        # Materials by phase
        report.append("\n\nTOP 10 PHASES BY MATERIAL COUNT")
        report.append("-"*80)
        phase_stats = cursor.execute("""
            SELECT 
                m.phase_code,
                p.phase_name,
                COUNT(*) as material_count
            FROM materials m
            LEFT JOIN product_phases p ON m.phase_code = p.phase_code
            GROUP BY m.phase_code, p.phase_name
            ORDER BY material_count DESC
            LIMIT 10
        """).fetchall()
        
        report.append(f"{'Phase':<12} {'Phase Name':<40} {'Materials':>12}")
        report.append("-"*80)
        for row in phase_stats:
            phase_name = row[1] if row[1] else "Unknown"
            report.append(f"{row[0]:<12} {phase_name[:40]:<40} {row[2]:>12,d}")
        
        # Materials by item type
        report.append("\n\nMATERIALS BY ITEM TYPE")
        report.append("-"*80)
        item_stats = cursor.execute("""
            SELECT 
                m.item_type_code,
                i.type_name,
                COUNT(*) as material_count,
                SUM(quantity) as total_quantity
            FROM materials m
            LEFT JOIN item_types i ON m.item_type_code = i.type_code
            GROUP BY m.item_type_code, i.type_name
            ORDER BY material_count DESC
        """).fetchall()
        
        report.append(f"{'Type':<10} {'Type Name':<30} {'Materials':>12} {'Total Qty':>15}")
        report.append("-"*80)
        for row in item_stats:
            type_name = row[1] if row[1] else "Unknown"
            report.append(f"{row[0]:<10} {type_name[:30]:<30} {row[2]:>12,d} {row[3]:>15,.2f}")
        
        # Elevation distribution
        report.append("\n\nELEVATION CODE DISTRIBUTION")
        report.append("-"*80)
        elev_stats = cursor.execute("""
            SELECT 
                elevation_code,
                COUNT(*) as material_count
            FROM materials
            GROUP BY elevation_code
            ORDER BY material_count DESC
        """).fetchall()
        
        report.append(f"{'Elevation':<15} {'Materials':>12}")
        report.append("-"*80)
        for row in elev_stats:
            report.append(f"{row[0]:<15} {row[1]:>12,d}")
        
        report.append("\n" + "="*80)
        report.append("END OF SUMMARY REPORT")
        report.append("="*80)
        
        return "\n".join(report)


def main():
    """Main execution function"""
    print("="*80)
    print("BAT UNIFIED CODING SYSTEM BUILDER")
    print("XXXX-XXX.XXX-XX-XXXX Format")
    print("="*80)
    
    # Initialize builder
    builder = BATCodingSystemBuilder("bat_unified.db")
    builder.connect()
    
    try:
        # Create schema
        builder.create_schema()
        
        # Load translation table
        translation_file = "coding_schema_translation_v2.csv"
        if Path(translation_file).exists():
            builder.load_translation_table(translation_file)
        else:
            print(f"\n⚠ Warning: Translation file not found: {translation_file}")
            print("  Schema created, but no data loaded.")
        
        # Validate database
        validation_results = builder.validate_database()
        
        # Generate summary report
        print("\n" + "="*80)
        print("GENERATING SUMMARY REPORT")
        print("="*80)
        summary = builder.generate_summary_report()
        
        # Save summary report
        with open("bat_system_summary.txt", "w") as f:
            f.write(summary)
        print("\n✓ Summary report saved to: bat_system_summary.txt")
        
        print("\n" + "="*80)
        print("✓ CODING SYSTEM BUILD COMPLETE")
        print("="*80)
        print(f"\nDatabase: {builder.db_path}")
        print(f"Materials: {validation_results.get('materials_count', 0):,d}")
        print(f"Phases: {validation_results.get('product_phases_count', 0):,d}")
        print(f"Item Types: {validation_results.get('item_types_count', 0):,d}")
        
    finally:
        builder.close()


if __name__ == "__main__":
    main()
