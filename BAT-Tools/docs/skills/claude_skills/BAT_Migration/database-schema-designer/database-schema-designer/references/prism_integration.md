# Prism SQL Integration Requirements

## Overview
Prism SQL is the Construction Platform's database integration layer. The BAT schema must be compatible with Prism SQL for seamless integration.

## Technical Requirements

### SQLite Compatibility
**Required**: Standard SQLite3 syntax only

**Supported Features**:
- Standard data types (INTEGER, REAL, TEXT, BLOB)
- Foreign keys
- Indexes
- Views
- Triggers (basic)

**Not Supported**:
- Custom extensions
- Exotic data types
- Some advanced SQLite features

**Safe Approach**: Use only standard SQL-92 compliant syntax

### Connection Pattern
```python
import prism_sql

# Connect to BAT database
connection = prism_sql.connect('bat_database.db')
cursor = connection.cursor()

# Query example
cursor.execute("""
    SELECT plan_name, COUNT(*) as material_count
    FROM v_plan_materials_detail
    GROUP BY plan_name
""")

results = cursor.fetchall()
connection.close()
```

### Data Types Mapping

| BAT Schema | Prism SQL | Notes |
|------------|-----------|-------|
| INTEGER PRIMARY KEY | INTEGER | Auto-increment |
| TEXT | TEXT | UTF-8 strings |
| REAL | REAL | Floating point |
| BOOLEAN | INTEGER | 0=false, 1=true |
| datetime('now') | TEXT | ISO 8601 format |

## Integration Points

### Read Operations
**Common Queries**:
- Get materials for plan+elevation
- Calculate plan costs
- List available packs
- Search material catalog

**Optimization**:
- Use views for complex queries
- Index all query columns
- Minimize joins where possible

### Write Operations
**Common Updates**:
- Update material pricing
- Add new community
- Modify quantities
- Track changes

**Transaction Safety**:
```python
connection.begin()
try:
    # Multiple operations
    cursor.execute(...)
    cursor.execute(...)
    connection.commit()
except:
    connection.rollback()
```

### Batch Operations
**Large Data Imports**:
```python
# Use executemany for bulk inserts
data = [(code1, desc1), (code2, desc2), ...]
cursor.executemany(
    "INSERT INTO materials (item_code, description) VALUES (?, ?)",
    data
)
```

## Performance Considerations

### Query Optimization
**Best Practices**:
1. Use views for repeated complex queries
2. Index foreign keys and filter columns
3. Avoid SELECT * (specify columns)
4. Use EXPLAIN QUERY PLAN for optimization

**Example**:
```sql
-- Check query performance
EXPLAIN QUERY PLAN
SELECT * FROM v_plan_materials_detail
WHERE plan_code = 'PLAN123';
```

### Index Strategy
**Required Indexes**:
- All foreign keys
- Common filter columns (company, active, category)
- Date columns used in ranges

**Composite Indexes**:
```sql
-- For queries filtering by multiple columns
CREATE INDEX idx_pricing_lookup 
ON material_pricing(material_id, effective_date, community_id);
```

## Security Considerations

### Access Control
**Read-Only Views**:
```sql
-- Expose only safe columns
CREATE VIEW v_public_materials AS
SELECT item_code, description, category
FROM materials
WHERE active = 1;
```

### Data Validation
**Constraints**:
```sql
-- Enforce business rules at database level
CHECK(quantity > 0)
CHECK(unit_cost >= 0)
CHECK(company IN ('Richmond', 'Holt', 'Unified'))
```

## Migration Strategy

### Phase 1: Schema Deployment
1. Generate schema with generate_schema.py
2. Validate with validate_schema.py
3. Deploy to test environment
4. Verify Prism SQL connection

### Phase 2: Data Migration
1. Export Richmond data → staging
2. Export Holt data → staging
3. Transform to unified format
4. Import via batch operations
5. Validate data integrity

### Phase 3: Application Integration
1. Update Construction Platform queries
2. Test all CRUD operations
3. Verify performance
4. Deploy to production

## Testing Checklist

- [ ] Schema deploys without errors
- [ ] Prism SQL connects successfully
- [ ] All views return data correctly
- [ ] Foreign keys enforce integrity
- [ ] Indexes improve query performance
- [ ] Batch operations complete quickly
- [ ] Transactions rollback properly
- [ ] No SQL injection vulnerabilities

## Monitoring & Maintenance

### Health Checks
```sql
-- Check database integrity
PRAGMA integrity_check;

-- Check foreign key integrity
PRAGMA foreign_key_check;

-- View index usage
PRAGMA index_info(index_name);
```

### Backup Strategy
**Regular Backups**:
- Daily full backups
- Transaction log backups
- Test restore procedures

**Before Major Changes**:
```bash
# Backup before schema changes
cp bat_database.db bat_database_backup_$(date +%Y%m%d).db
```

## Error Handling

### Common Issues

**Foreign Key Violations**:
```python
try:
    cursor.execute("INSERT INTO plan_materials ...")
except sqlite3.IntegrityError as e:
    if 'FOREIGN KEY constraint' in str(e):
        # Handle missing reference
        pass
```

**Connection Issues**:
```python
import time

def connect_with_retry(max_attempts=3):
    for attempt in range(max_attempts):
        try:
            return prism_sql.connect('bat_database.db')
        except Exception as e:
            if attempt < max_attempts - 1:
                time.sleep(1)
            else:
                raise
```

## Best Practices Summary

✅ Use standard SQLite3 syntax
✅ Index all foreign keys
✅ Create views for complex queries
✅ Use transactions for multi-step operations
✅ Validate constraints at database level
✅ Test with realistic data volumes
✅ Monitor query performance
✅ Plan for backup and recovery

## Resources

- Prism SQL Documentation: [Internal Link]
- SQLite Documentation: https://www.sqlite.org/docs.html
- Construction Platform API: [Internal Link]
