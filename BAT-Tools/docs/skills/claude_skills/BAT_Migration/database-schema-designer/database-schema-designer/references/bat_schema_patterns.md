# BAT Schema Design Patterns

## Best Practices for Material Management Databases

### Single-Encoding Principle
**Rule**: Store each piece of information in exactly one location

**Why**: Prevents synchronization problems and maintenance burden

**Richmond's Triple-Encoding Problem**:
```
❌ BAD (Richmond Current):
- Elevation in sheet name
- Elevation in column
- Elevation in item code
= 3 places to update, 3 places to maintain

✅ GOOD (Unified System):
- Elevation as FK in plan_materials table
= 1 place to update, clean relationships
```

**Application**:
- Elevation: Single dimension table
- Pack references: Single relationship
- Item codes: Single materials table

### Dimensional Modeling
**Rule**: Separate entities from their dimensions

**Entities vs Dimensions**:
```
Entity: Can exist independently
Dimension: Attribute of entity

Example:
- Plan = Entity (exists independently)
- Elevation = Dimension (attribute of plan)
- Material = Entity (exists independently)
- Price = Dimension (attribute of material + community)
```

**Test**: Can you describe X without mentioning Y?
- Can you describe elevation without plan? NO → Dimension
- Can you describe material without plan? YES → Entity

### Normalization Guidelines

**1NF**: Atomic values, no repeating groups
**2NF**: No partial dependencies on composite keys
**3NF**: No transitive dependencies

**For BAT Schema**:
- Materials table: Fully normalized
- No calculated fields (derive from relationships)
- Each fact appears once

**Example**:
```sql
-- ✅ GOOD: Normalized
CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    item_code TEXT UNIQUE,
    description TEXT
);

CREATE TABLE material_pricing (
    pricing_id INTEGER PRIMARY KEY,
    material_id INTEGER,
    community_id INTEGER,
    unit_cost REAL
);

-- ❌ BAD: Denormalized
CREATE TABLE materials (
    material_id INTEGER PRIMARY KEY,
    item_code TEXT,
    description TEXT,
    community1_price REAL,
    community2_price REAL,
    community3_price REAL  -- What about community 4?
);
```

### Foreign Key Discipline
**Rule**: All relationships must have proper foreign keys

**Benefits**:
- Referential integrity enforced
- Cascade deletes controlled
- Clear relationship documentation

**Cascade Rules**:
```sql
-- Child depends on parent: CASCADE
FOREIGN KEY (plan_id) REFERENCES plans(plan_id) 
    ON DELETE CASCADE

-- Protect data: RESTRICT
FOREIGN KEY (material_id) REFERENCES materials(material_id) 
    ON DELETE RESTRICT

-- Optional reference: SET NULL
FOREIGN KEY (pack_id) REFERENCES packs(pack_id) 
    ON DELETE SET NULL
```

### Index Strategy
**Rule**: Index all foreign keys and common query columns

**Performance Impact**:
- Unindexed FK: O(n) scan
- Indexed FK: O(log n) lookup

**BAT Indexes**:
```sql
-- Foreign keys (always)
CREATE INDEX idx_plan_materials_plan ON plan_materials(plan_id);
CREATE INDEX idx_plan_materials_material ON plan_materials(material_id);

-- Common filters
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_active ON materials(active);

-- Composite for common queries
CREATE INDEX idx_pricing_material_date 
    ON material_pricing(material_id, effective_date);
```

### Audit Trail Pattern
**Rule**: Track changes for learning-first philosophy

**Implementation**:
```sql
-- Base table
CREATE TABLE materials (
    ...
    created_date TEXT DEFAULT (datetime('now')),
    modified_date TEXT DEFAULT (datetime('now')),
    ...
);

-- Change history
CREATE TABLE change_history (
    change_id INTEGER PRIMARY KEY,
    table_name TEXT,
    record_id INTEGER,
    change_type TEXT,
    changed_by TEXT,
    change_date TEXT,
    old_values TEXT,
    new_values TEXT,
    reason TEXT
);
```

**Benefits**:
- Learning from mistakes
- Compliance/audit requirements
- Undo capability
- Understanding evolution

### View Design
**Rule**: Create views for common complex queries

**BAT Views**:
```sql
-- Complete material detail
CREATE VIEW v_plan_materials_detail AS
SELECT 
    plans.plan_name,
    elevations.elevation_name,
    materials.item_code,
    materials.description,
    plan_materials.quantity
FROM plan_materials
JOIN plans ON plan_materials.plan_id = plans.plan_id
JOIN elevations ON plan_materials.elevation_id = elevations.elevation_id
JOIN materials ON plan_materials.material_id = materials.material_id;
```

**Benefits**:
- Simpler application queries
- Consistent business logic
- Abstraction from schema changes

### Migration-Friendly Design
**Rule**: Support gradual migration from legacy systems

**Strategies**:
```sql
-- Source system tracking
source_system TEXT CHECK(source_system IN ('Richmond', 'Holt', 'Unified'))

-- Code mapping for hybrid approach
CREATE TABLE code_mappings (
    unified_code TEXT PRIMARY KEY,
    richmond_code TEXT,
    holt_code TEXT,
    description TEXT
);

-- Active flags for deprecation
active BOOLEAN DEFAULT 1
```

### Prism SQL Integration
**Rule**: Design for Construction Platform integration

**Considerations**:
- Standard SQLite3 syntax
- No exotic features
- Clean primary/foreign keys
- Documented relationships

**Connection Pattern**:
```python
# Prism SQL connection
conn = prism_sql.connect('bat_database.db')
cursor = conn.cursor()
```

## Anti-Patterns to Avoid

### ❌ Generic Columns
```sql
-- BAD
custom_field1 TEXT,
custom_field2 TEXT,
custom_field3 TEXT
```

### ❌ Polymorphic Associations
```sql
-- BAD
reference_type TEXT,  -- 'plan' or 'material'
reference_id INTEGER  -- could be plan_id or material_id
```

### ❌ Comma-Separated Values
```sql
-- BAD
elevation_codes TEXT  -- 'A,B,C'
```

### ❌ Redundant Storage
```sql
-- BAD: Storing both
material_id INTEGER,
material_code TEXT  -- Already in materials table
```

## Schema Evolution Strategy

**Phase 1**: Core tables (plans, materials, elevations)
**Phase 2**: Relationships (plan_materials, pack_materials)
**Phase 3**: Pricing and communities
**Phase 4**: Audit and knowledge base
**Phase 5**: Optimization (indexes, views)

## Testing Strategy

1. **Structure Validation**: Use validate_schema.py
2. **Sample Data**: Insert test records
3. **Query Testing**: Verify common queries work
4. **Performance**: Check index usage
5. **Integration**: Test Prism SQL connection

## Success Criteria

✅ All foreign keys defined
✅ All FK columns indexed
✅ No redundant data storage
✅ Audit trail implemented
✅ Views for common queries
✅ Passes validation script
✅ Supports both legacy systems
✅ Learning-first features included
