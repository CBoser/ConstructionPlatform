#!/usr/bin/env python3
"""
BAT Schema Validator
Validates schema design for normalization, relationships, and best practices
"""

import sqlite3
import sys
from pathlib import Path

class SchemaValidator:
    """Validate database schema"""
    
    def __init__(self, schema_file):
        self.schema_file = Path(schema_file)
        self.issues = []
        self.warnings = []
        self.info = []
        
    def validate(self):
        """Run all validation checks"""
        print(f"🔍 Validating schema: {self.schema_file.name}")
        print("=" * 60)
        
        # Create in-memory database
        try:
            conn = sqlite3.connect(':memory:')
            cursor = conn.cursor()
            
            # Execute schema
            with open(self.schema_file, 'r') as f:
                schema_sql = f.read()
            
            cursor.executescript(schema_sql)
            
            # Run validation checks
            self._check_tables(cursor)
            self._check_foreign_keys(cursor)
            self._check_indexes(cursor)
            self._check_constraints(cursor)
            
            conn.close()
            
            # Report results
            self._print_results()
            
            return len(self.issues) == 0
            
        except Exception as e:
            print(f"❌ Error validating schema: {e}")
            return False
    
    def _check_tables(self, cursor):
        """Check table structure"""
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        self.info.append(f"Found {len(tables)} tables")
        
        # Check for expected core tables
        expected = ['plans', 'materials', 'packs', 'pack_materials', 'plan_materials']
        missing = [t for t in expected if t not in tables]
        
        if missing:
            self.issues.append(f"Missing expected tables: {', '.join(missing)}")
        else:
            self.info.append("✅ All core tables present")
        
        # Check for primary keys
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            has_pk = any(col[5] for col in columns)  # col[5] is pk flag
            
            if not has_pk:
                self.warnings.append(f"Table '{table}' has no primary key")
    
    def _check_foreign_keys(self, cursor):
        """Check foreign key relationships"""
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        total_fks = 0
        for table in tables:
            cursor.execute(f"PRAGMA foreign_key_list({table})")
            fks = cursor.fetchall()
            total_fks += len(fks)
            
            # Check referential integrity
            for fk in fks:
                ref_table = fk[2]
                if ref_table not in tables:
                    self.issues.append(
                        f"Table '{table}' references non-existent table '{ref_table}'"
                    )
        
        self.info.append(f"Found {total_fks} foreign key relationships")
        
        if total_fks > 0:
            self.info.append("✅ Foreign key relationships defined")
    
    def _check_indexes(self, cursor):
        """Check indexes"""
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
        indexes = cursor.fetchall()
        
        self.info.append(f"Found {len(indexes)} indexes")
        
        # Check if foreign keys are indexed
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        for table in tables:
            cursor.execute(f"PRAGMA foreign_key_list({table})")
            fks = cursor.fetchall()
            
            for fk in fks:
                from_col = fk[3]
                # Check if this FK column has an index
                cursor.execute(f"PRAGMA index_list({table})")
                table_indexes = cursor.fetchall()
                
                indexed = False
                for idx in table_indexes:
                    cursor.execute(f"PRAGMA index_info({idx[1]})")
                    idx_cols = cursor.fetchall()
                    if any(col[2] == from_col for col in idx_cols):
                        indexed = True
                        break
                
                if not indexed:
                    self.warnings.append(
                        f"Foreign key '{table}.{from_col}' is not indexed (performance impact)"
                    )
    
    def _check_constraints(self, cursor):
        """Check constraints"""
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        for table in tables:
            cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,))
            create_sql = cursor.fetchone()[0]
            
            # Check for NOT NULL constraints on important columns
            if 'NOT NULL' in create_sql:
                self.info.append(f"✅ Table '{table}' has NOT NULL constraints")
            
            # Check for CHECK constraints
            if 'CHECK' in create_sql:
                self.info.append(f"✅ Table '{table}' has CHECK constraints")
    
    def _print_results(self):
        """Print validation results"""
        print("\n" + "=" * 60)
        print("VALIDATION RESULTS")
        print("=" * 60)
        
        if self.info:
            print("\n📋 Information:")
            for item in self.info:
                print(f"   {item}")
        
        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   {warning}")
        
        if self.issues:
            print(f"\n❌ Issues ({len(self.issues)}):")
            for issue in self.issues:
                print(f"   {issue}")
        else:
            print("\n✅ No critical issues found!")
        
        print("\n" + "=" * 60)
        if self.issues:
            print("❌ VALIDATION FAILED")
        else:
            print("✅ VALIDATION PASSED")
        print("=" * 60)


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_schema.py <schema_file.sql>")
        sys.exit(1)
    
    schema_file = sys.argv[1]
    
    if not Path(schema_file).exists():
        print(f"❌ Schema file not found: {schema_file}")
        sys.exit(1)
    
    validator = SchemaValidator(schema_file)
    
    if validator.validate():
        print("\n✅ Schema validation complete - no critical issues")
        sys.exit(0)
    else:
        print("\n❌ Schema validation failed - please review issues")
        sys.exit(1)


if __name__ == "__main__":
    main()
