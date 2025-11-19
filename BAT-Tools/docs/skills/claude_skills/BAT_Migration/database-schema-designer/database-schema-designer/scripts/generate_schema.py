#!/usr/bin/env python3
"""
BAT Database Schema Generator
Converts architecture decisions into SQL CREATE statements
"""

import sys
from pathlib import Path
from datetime import datetime

class SchemaGenerator:
    """Generate SQL schema based on architecture decisions"""
    
    def __init__(self, output_file="bat_schema.sql"):
        self.output_file = output_file
        self.schema_sql = []
        self.decisions = {
            'plan_pack_relationship': None,  # 'universal' or 'plan_specific'
            'elevation_model': None,  # 'dimension' or 'variant'
            'code_philosophy': None  # 'systematic', 'mnemonic', or 'hybrid'
        }
        
    def set_decision(self, decision_type, value):
        """Set an architecture decision"""
        if decision_type not in self.decisions:
            raise ValueError(f"Unknown decision type: {decision_type}")
        self.decisions[decision_type] = value
        
    def generate_header(self):
        """Generate SQL file header with metadata"""
        header = f"""-- ============================================================================
-- BAT (Build Analysis Tool) Database Schema
-- Richmond American Homes + Holt Homes Unified System
-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================================================
--
-- ARCHITECTURE DECISIONS:
--   Plan-Pack Relationship: {self.decisions['plan_pack_relationship'] or 'NOT SET'}
--   Elevation Model: {self.decisions['elevation_model'] or 'NOT SET'}
--   Code Philosophy: {self.decisions['code_philosophy'] or 'NOT SET'}
--
-- INTEGRATION SCOPE:
--   Richmond Items: ~55,604 (85%)
--   Holt Items: ~9,373 (15%)
--   Total Migration: ~65,000 line items
--
-- BEST PRACTICES ADOPTED:
--   - Single-encoding for elevation (Holt approach)
--   - Pack format: |[Major].[Minor] PACK_NAME (already compatible)
--   - Prism SQL integration ready
--
-- ============================================================================

"""
        self.schema_sql.append(header)
        
    def generate_core_tables(self):
        """Generate core entity tables"""
        
        # Plans table
        plans_table = """
-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Plans: Base house plans from both companies
CREATE TABLE IF NOT EXISTS plans (
    plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_code TEXT NOT NULL UNIQUE,
    plan_name TEXT NOT NULL,
    company TEXT NOT NULL CHECK(company IN ('Richmond', 'Holt', 'Unified')),
    active BOOLEAN NOT NULL DEFAULT 1,
    created_date TEXT NOT NULL DEFAULT (datetime('now')),
    modified_date TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    CONSTRAINT plan_code_format CHECK(length(plan_code) > 0)
);

CREATE INDEX idx_plans_company ON plans(company);
CREATE INDEX idx_plans_active ON plans(active);
"""
        self.schema_sql.append(plans_table)
        
        # Elevations table (dimension approach)
        if self.decisions['elevation_model'] == 'dimension':
            elevations_table = """
-- Elevations: Dimensional attribute of plans (single-encoding)
CREATE TABLE IF NOT EXISTS elevations (
    elevation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    elevation_code TEXT NOT NULL,
    elevation_name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    UNIQUE(plan_id, elevation_code)
);

CREATE INDEX idx_elevations_plan ON elevations(plan_id);
CREATE INDEX idx_elevations_active ON elevations(active);
"""
        else:
            # Variant approach (elevations as variants of plans)
            elevations_table = """
-- Plan Variants: Different elevations as plan variants
CREATE TABLE IF NOT EXISTS plan_variants (
    variant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_plan_id INTEGER NOT NULL,
    variant_code TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (base_plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    UNIQUE(base_plan_id, variant_code)
);

CREATE INDEX idx_variants_plan ON plan_variants(base_plan_id);
"""
        self.schema_sql.append(elevations_table)
        
        # Materials table
        materials_table = """
-- Materials: Individual material items (unified from both systems)
CREATE TABLE IF NOT EXISTS materials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    unit TEXT,
    cost_code TEXT,
    category TEXT,
    source_system TEXT CHECK(source_system IN ('Richmond', 'Holt', 'Unified')),
    vendor_sku TEXT,
    active BOOLEAN NOT NULL DEFAULT 1,
    created_date TEXT NOT NULL DEFAULT (datetime('now')),
    modified_date TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    CONSTRAINT item_code_format CHECK(length(item_code) > 0)
);

CREATE INDEX idx_materials_item_code ON materials(item_code);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_source ON materials(source_system);
CREATE INDEX idx_materials_active ON materials(active);
"""
        self.schema_sql.append(materials_table)
        
    def generate_pack_tables(self):
        """Generate pack-related tables based on decision"""
        
        if self.decisions['plan_pack_relationship'] == 'universal':
            # Universal packs - single library shared across all plans
            packs_table = """
-- ============================================================================
-- PACKS (Universal Library Approach)
-- ============================================================================

-- Packs: Universal pack library shared across plans
CREATE TABLE IF NOT EXISTS packs (
    pack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_code TEXT NOT NULL UNIQUE,
    pack_name TEXT NOT NULL,
    major_number INTEGER NOT NULL,
    minor_number INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT 1,
    created_date TEXT NOT NULL DEFAULT (datetime('now')),
    modified_date TEXT NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT pack_format CHECK(pack_code LIKE '|%')
);

CREATE INDEX idx_packs_code ON packs(pack_code);
CREATE INDEX idx_packs_major_minor ON packs(major_number, minor_number);

-- Pack Materials: Contents of universal packs
CREATE TABLE IF NOT EXISTS pack_materials (
    pack_material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 1.0,
    sequence_order INTEGER,
    notes TEXT,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE RESTRICT,
    UNIQUE(pack_id, material_id)
);

CREATE INDEX idx_pack_materials_pack ON pack_materials(pack_id);
CREATE INDEX idx_pack_materials_material ON pack_materials(material_id);
"""
        else:
            # Plan-specific packs
            packs_table = """
-- ============================================================================
-- PACKS (Plan-Specific Approach)
-- ============================================================================

-- Packs: Plan-specific pack definitions
CREATE TABLE IF NOT EXISTS packs (
    pack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    pack_code TEXT NOT NULL,
    pack_name TEXT NOT NULL,
    major_number INTEGER NOT NULL,
    minor_number INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    UNIQUE(plan_id, pack_code)
);

CREATE INDEX idx_packs_plan ON packs(plan_id);
CREATE INDEX idx_packs_code ON packs(pack_code);

-- Pack Materials: Contents of plan-specific packs
CREATE TABLE IF NOT EXISTS pack_materials (
    pack_material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 1.0,
    sequence_order INTEGER,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE RESTRICT,
    UNIQUE(pack_id, material_id)
);

CREATE INDEX idx_pack_materials_pack ON pack_materials(pack_id);
"""
        self.schema_sql.append(packs_table)
        
    def generate_relationship_tables(self):
        """Generate plan-material relationship tables"""
        
        relationships_table = """
-- ============================================================================
-- RELATIONSHIPS
-- ============================================================================

-- Plan Materials: Materials used in each plan/elevation
CREATE TABLE IF NOT EXISTS plan_materials (
    plan_material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
"""
        
        if self.decisions['elevation_model'] == 'dimension':
            relationships_table += """    elevation_id INTEGER,
    material_id INTEGER NOT NULL,
    pack_id INTEGER,
    quantity REAL NOT NULL DEFAULT 1.0,
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (elevation_id) REFERENCES elevations(elevation_id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE RESTRICT,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE SET NULL
);

CREATE INDEX idx_plan_materials_plan ON plan_materials(plan_id);
CREATE INDEX idx_plan_materials_elevation ON plan_materials(elevation_id);
"""
        else:
            relationships_table += """    variant_id INTEGER,
    material_id INTEGER NOT NULL,
    pack_id INTEGER,
    quantity REAL NOT NULL DEFAULT 1.0,
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES plan_variants(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE RESTRICT,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id) ON DELETE SET NULL
);

CREATE INDEX idx_plan_materials_plan ON plan_materials(plan_id);
CREATE INDEX idx_plan_materials_variant ON plan_materials(variant_id);
"""
        
        relationships_table += """CREATE INDEX idx_plan_materials_material ON plan_materials(material_id);
CREATE INDEX idx_plan_materials_pack ON plan_materials(pack_id);
"""
        self.schema_sql.append(relationships_table)
        
    def generate_pricing_tables(self):
        """Generate pricing and cost tables"""
        
        pricing_tables = """
-- ============================================================================
-- PRICING & COSTS
-- ============================================================================

-- Material Pricing: Pricing by community/location
CREATE TABLE IF NOT EXISTS material_pricing (
    pricing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    community_id INTEGER,
    effective_date TEXT NOT NULL,
    unit_cost REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    notes TEXT,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
);

CREATE INDEX idx_pricing_material ON material_pricing(material_id);
CREATE INDEX idx_pricing_date ON material_pricing(effective_date);

-- Communities: Different build locations
CREATE TABLE IF NOT EXISTS communities (
    community_id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_code TEXT NOT NULL UNIQUE,
    community_name TEXT NOT NULL,
    company TEXT NOT NULL CHECK(company IN ('Richmond', 'Holt', 'Unified')),
    location TEXT,
    active BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX idx_communities_company ON communities(company);
"""
        self.schema_sql.append(pricing_tables)
        
    def generate_audit_tables(self):
        """Generate audit and history tables for learning-first approach"""
        
        audit_tables = """
-- ============================================================================
-- AUDIT & LEARNING-FIRST TABLES
-- ============================================================================

-- Change History: Track all changes for learning/audit
CREATE TABLE IF NOT EXISTS change_history (
    change_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK(change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_by TEXT NOT NULL,
    change_date TEXT NOT NULL DEFAULT (datetime('now')),
    old_values TEXT,
    new_values TEXT,
    reason TEXT
);

CREATE INDEX idx_changes_table ON change_history(table_name, record_id);
CREATE INDEX idx_changes_date ON change_history(change_date);

-- Knowledge Base: Preserve institutional knowledge
CREATE TABLE IF NOT EXISTS knowledge_base (
    knowledge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    source_system TEXT CHECK(source_system IN ('Richmond', 'Holt', 'Unified')),
    category TEXT,
    created_date TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL
);

CREATE INDEX idx_knowledge_topic ON knowledge_base(topic);
CREATE INDEX idx_knowledge_category ON knowledge_base(category);
"""
        self.schema_sql.append(audit_tables)
        
    def generate_code_mapping_table(self):
        """Generate code mapping table based on philosophy decision"""
        
        if self.decisions['code_philosophy'] == 'hybrid':
            mapping_table = """
-- ============================================================================
-- CODE UNIFICATION (Hybrid Approach)
-- ============================================================================

-- Code Mappings: Map between Richmond mnemonic and Holt hierarchical codes
CREATE TABLE IF NOT EXISTS code_mappings (
    mapping_id INTEGER PRIMARY KEY AUTOINCREMENT,
    unified_code TEXT NOT NULL UNIQUE,
    richmond_code TEXT,
    holt_code TEXT,
    description TEXT NOT NULL,
    category TEXT,
    hierarchy_path TEXT,
    notes TEXT
);

CREATE INDEX idx_mappings_richmond ON code_mappings(richmond_code);
CREATE INDEX idx_mappings_holt ON code_mappings(holt_code);
CREATE INDEX idx_mappings_category ON code_mappings(category);
"""
            self.schema_sql.append(mapping_table)
        
    def generate_views(self):
        """Generate helpful views for common queries"""
        
        views = """
-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete Plan Materials: Full detail view
CREATE VIEW IF NOT EXISTS v_plan_materials_detail AS
SELECT 
    pm.plan_material_id,
    p.plan_code,
    p.plan_name,
    p.company AS plan_company,
"""
        
        if self.decisions['elevation_model'] == 'dimension':
            views += """    e.elevation_code,
    e.elevation_name,
"""
        else:
            views += """    pv.variant_code,
    pv.variant_name,
"""
        
        views += """    m.item_code,
    m.description AS material_description,
    m.unit,
    m.cost_code,
    pm.quantity,
    pk.pack_code,
    pk.pack_name
FROM plan_materials pm
JOIN plans p ON pm.plan_id = p.plan_id
"""
        
        if self.decisions['elevation_model'] == 'dimension':
            views += """LEFT JOIN elevations e ON pm.elevation_id = e.elevation_id
"""
        else:
            views += """LEFT JOIN plan_variants pv ON pm.variant_id = pv.variant_id
"""
        
        views += """JOIN materials m ON pm.material_id = m.material_id
LEFT JOIN packs pk ON pm.pack_id = pk.pack_id;

-- Pack Contents: What's in each pack
CREATE VIEW IF NOT EXISTS v_pack_contents AS
SELECT 
    p.pack_code,
    p.pack_name,
    p.major_number,
    p.minor_number,
    m.item_code,
    m.description,
    pm.quantity,
    m.unit
FROM packs p
JOIN pack_materials pm ON p.pack_id = pm.pack_id
JOIN materials m ON pm.material_id = m.material_id
ORDER BY p.major_number, p.minor_number, pm.sequence_order;
"""
        self.schema_sql.append(views)
        
    def generate_schema(self):
        """Generate complete schema"""
        
        # Validate decisions are set
        unset_decisions = [k for k, v in self.decisions.items() if v is None]
        if unset_decisions:
            print(f"⚠️  Warning: The following decisions are not set: {', '.join(unset_decisions)}")
            print("   Schema will be generated with default structure.")
            print("   Set decisions using set_decision() before generating.\n")
        
        self.schema_sql = []  # Reset
        
        self.generate_header()
        self.generate_core_tables()
        self.generate_pack_tables()
        self.generate_relationship_tables()
        self.generate_pricing_tables()
        self.generate_audit_tables()
        self.generate_code_mapping_table()
        self.generate_views()
        
        # Add footer
        footer = """
-- ============================================================================
-- SCHEMA GENERATION COMPLETE
-- ============================================================================
-- Next Steps:
--   1. Review architecture decisions match requirements
--   2. Validate table relationships
--   3. Test with sample data
--   4. Integrate with Prism SQL
--   5. Begin data migration
-- ============================================================================
"""
        self.schema_sql.append(footer)
        
        return '\n'.join(self.schema_sql)
        
    def save_schema(self):
        """Save schema to file"""
        schema_content = self.generate_schema()
        
        with open(self.output_file, 'w') as f:
            f.write(schema_content)
        
        print(f"✅ Schema generated: {self.output_file}")
        print(f"   Total size: {len(schema_content)} characters")
        print(f"\n📊 Architecture Decisions:")
        for decision, value in self.decisions.items():
            status = value if value else "NOT SET"
            print(f"   {decision}: {status}")
        
        return self.output_file


def main():
    """Main entry point"""
    if len(sys.argv) < 4:
        print("Usage: python generate_schema.py <plan_pack_rel> <elevation_model> <code_philosophy> [output_file]")
        print("\nArguments:")
        print("  plan_pack_rel: 'universal' or 'plan_specific'")
        print("  elevation_model: 'dimension' or 'variant'")
        print("  code_philosophy: 'systematic', 'mnemonic', or 'hybrid'")
        print("  output_file: Optional output filename (default: bat_schema.sql)")
        print("\nExample:")
        print("  python generate_schema.py universal dimension hybrid bat_schema.sql")
        sys.exit(1)
    
    plan_pack = sys.argv[1]
    elevation = sys.argv[2]
    code_phil = sys.argv[3]
    output_file = sys.argv[4] if len(sys.argv) > 4 else "bat_schema.sql"
    
    generator = SchemaGenerator(output_file)
    generator.set_decision('plan_pack_relationship', plan_pack)
    generator.set_decision('elevation_model', elevation)
    generator.set_decision('code_philosophy', code_phil)
    
    generator.save_schema()
    print(f"\n✅ Schema generation complete!")


if __name__ == "__main__":
    main()
