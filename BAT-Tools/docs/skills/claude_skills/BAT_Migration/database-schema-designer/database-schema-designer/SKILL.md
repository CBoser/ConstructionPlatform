---
name: database-schema-designer
description: Converts BAT architecture decisions into SQL database schemas. Use when user needs to create database schema, translate architecture decisions into SQL, generate CREATE statements, validate schema design, check normalization, or needs help with Week 2 database design. Also use when user mentions "database schema", "SQL", "tables", "schema design", "architecture decisions", "elevation model", "plan-pack relationship", or "code philosophy".
---

# Database Schema Designer

Converts your three critical architecture decisions into production-ready SQL database schemas for the BAT unified system.

## Quick Start

**Generate schema with decisions**:
```bash
python scripts/generate_schema.py <plan_pack> <elevation> <code_phil> [output.sql]
```

**Arguments**:
- `plan_pack`: 'universal' or 'plan_specific'
- `elevation`: 'dimension' or 'variant'
- `code_phil`: 'systematic', 'mnemonic', or 'hybrid'

**Example**:
```bash
python scripts/generate_schema.py universal dimension hybrid bat_schema.sql
```

**Validate generated schema**:
```bash
python scripts/validate_schema.py bat_schema.sql
```

## Core Capabilities

### 1. Schema Generation
Generates complete SQL schema including:
- Core entity tables (plans, materials, elevations)
- Relationship tables (plan_materials, pack_materials)
- Pricing tables (material_pricing, communities)
- Audit tables (change_history, knowledge_base)
- Views for common queries
- Indexes for performance
- Foreign key relationships
- Business rule constraints

**Adapts to decisions**: Schema structure changes based on your three architecture decisions.

### 2. Schema Validation
Checks for:
- Table structure completeness
- Primary key presence
- Foreign key integrity
- Index coverage on FKs
- Constraint definitions
- Normalization issues

**Use when**: After generating schema, before deployment

### 3. Decision Support
Helps make architecture decisions with:
- Evidence-based recommendations
- Trade-off analysis
- Implementation implications
- Best practices guidance

## Three Architecture Decisions

### Decision 1: Plan-Pack Relationships

**Universal Packs**:
- Single pack library shared across all plans
- Choose when: High pack reuse, centralized management
- Schema: packs table without plan_id

**Plan-Specific Packs**:
- Each plan has own pack definitions
- Choose when: Low reuse, plan customization needed
- Schema: packs table with plan_id FK

### Decision 2: Plan-Elevation Modeling

**Dimension Approach (RECOMMENDED)**:
- Elevation as dimensional attribute of plan
- Choose when: Elevations depend on parent plan
- Schema: elevations table with plan_id FK
- Fixes Richmond's triple-encoding problem

**Variant Approach**:
- Elevations as plan variants
- Choose when: Elevations are independent plans
- Schema: plan_variants table

### Decision 3: Code Philosophy

**Systematic (Holt-style)**:
- Hierarchical numeric codes (10.20.30.040)
- Choose when: Long-term maintainability priority
- Schema: Standard materials table

**Mnemonic (Richmond-style)**:
- Letter prefixes (CONC1234, ELEC5678)
- Choose when: Human-readability critical
- Schema: Standard materials table

**Hybrid (RECOMMENDED)**:
- Combine both approaches with mapping
- Choose when: Want best of both worlds
- Schema: Adds code_mappings table

## Schema Features

### Single-Encoding
**Fixes Richmond Problem**: Stores each fact in exactly one location
- Elevation in elevations table only
- No redundant storage
- No synchronization issues

### Foreign Key Discipline
**Enforces Integrity**: All relationships properly defined
- CASCADE for dependent children
- RESTRICT to protect data
- SET NULL for optional references

### Learning-First Support
**Institutional Knowledge**: Audit and learning tables
- change_history: Track all modifications
- knowledge_base: Preserve domain knowledge
- Notes fields throughout

### Performance Optimized
**Fast Queries**: Strategic indexing
- All foreign keys indexed
- Common filters indexed
- Composite indexes for complex queries

### Prism SQL Compatible
**Platform Integration**: Works with Construction Platform
- Standard SQLite3 syntax
- Clean relationships
- Well-documented structure

## Reference Documentation

### Load when needed:

**`references/architecture_decisions.md`**:
- Three decision framework
- Evidence requirements
- Trade-off analysis
- Recommended choices

**`references/bat_schema_patterns.md`**:
- Single-encoding principle
- Normalization guidelines
- Foreign key discipline
- Index strategy
- Anti-patterns to avoid

**`references/prism_integration.md`**:
- Prism SQL requirements
- Connection patterns
- Performance optimization
- Integration strategy

## Typical Workflow

### 1. Make Architecture Decisions
Review evidence from BAT Migration Analyzer:
- Richmond: triple-encoding, 288 prefixes
- Holt: single-encoding, hierarchical codes
- Pack format: already compatible

**Use references/architecture_decisions.md** for guidance

### 2. Generate Schema
```bash
python scripts/generate_schema.py universal dimension hybrid bat_schema.sql
```

Reviews generated SQL file for:
- Correct table structures
- Proper relationships
- All needed indexes

### 3. Validate Schema
```bash
python scripts/validate_schema.py bat_schema.sql
```

Check validation report:
- ✅ No critical issues
- ⚠️ Review warnings
- 📋 Note recommendations

### 4. Test Integration
- Deploy to test database
- Test Prism SQL connection
- Run sample queries
- Verify performance

### 5. Iterate if Needed
Modify decisions and regenerate until schema meets requirements

## Key Insights

### Richmond (Source System)
- Triple-encoding problem → Use single-encoding
- 288 prefixes → Consider hybrid approach
- Pack format compatible → Keep as-is

### Holt (Source System)
- Single-encoding → Adopt as best practice
- Hierarchical codes → Use as model
- Pack format compatible → Keep as-is

### Unified System Design
- **Elevation**: Dimension approach (fixes triple-encoding)
- **Packs**: Likely universal (pending evidence)
- **Codes**: Hybrid (best of both worlds)

## Output Format

When generating schema, Claude should:
1. **Run generator** with user's decisions
2. **Show key statistics** (table count, features)
3. **Highlight decisions** embedded in schema
4. **Run validator** automatically
5. **Provide download link** to .sql file
6. **Offer next steps** (test, deploy, iterate)

## Integration with Project

### Week 2 (Current - CRITICAL)
🎯 Convert architecture decisions → SQL schema
🎯 Validate schema design
🎯 Prepare for Week 3 migration

### Week 3+
📊 Deploy schema to production
📊 Begin data migration
📊 Integrate with Construction Platform

## Success Criteria

Schema is successful when:
✅ Reflects architecture decisions correctly
✅ Passes validation (no critical issues)
✅ Supports both legacy systems
✅ Includes learning-first features
✅ Optimized for performance
✅ Prism SQL compatible
✅ ~65,000 items can be migrated

## Learning-First Philosophy

This skill:
- **Explains** why decisions matter
- **Documents** rationale in schema comments
- **Preserves** institutional knowledge
- **Teaches** database design principles

Example: Generated schema includes comments explaining why single-encoding fixes Richmond's synchronization problems.
