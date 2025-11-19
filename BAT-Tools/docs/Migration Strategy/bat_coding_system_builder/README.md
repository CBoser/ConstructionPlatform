# BAT Unified Coding System Builder

## Overview

Python toolkit for building and managing the unified **XXXX-XXX.XXX-XX-XXXX** material coding system for the BAT (Build Analysis Tool) migration project.

**Code Structure:**
```
XXXX-XXX.XXX-XX-XXXX
│    │       │   │
│    │       │   └─ Item Type Code (1000=Framing, 2100=Siding, etc.)
│    │       └───── Elevation Code (A, B, BCD, **, etc.)
│    └─────────── Product Phase/Option Code (010.820, 012.040, etc.)
└──────────────── Plan Code (1670, G603, LE93, etc.)
```

## Files Included

### Core System
- **`bat_coding_system_builder.py`** - Main builder class with database schema and translation logic
- **`example_usage.py`** - Complete examples showing how to use the builder
- **`coding_schema_translation_v2.csv`** - 313-line translation table (Richmond → Unified)
- **`coding_schema_translation_summary.txt`** - Complete documentation of the coding system

### Generated Files
- **`bat_unified.db`** - SQLite database (created on first run)
- **`bat_system_summary.txt`** - Summary report with statistics
- **`materials_report_*.csv`** - Exported material lists

## Installation

### Prerequisites
```bash
# Python 3.8 or higher required
python --version

# Install required packages
pip install pandas openpyxl --break-system-packages
```

### Setup
```bash
# 1. Ensure all files are in the same directory:
#    - bat_coding_system_builder.py
#    - example_usage.py
#    - coding_schema_translation_v2.csv

# 2. Make scripts executable (optional)
chmod +x bat_coding_system_builder.py
chmod +x example_usage.py
```

## Quick Start

### 1. Create Database Schema
```bash
python bat_coding_system_builder.py
```

This will:
- Create `bat_unified.db` with complete schema (8 tables)
- Load translation table
- Populate product_phases and item_types
- Validate database integrity
- Generate summary report

### 2. Run Examples
```bash
python example_usage.py
```

This demonstrates:
- Adding materials manually
- Querying materials by plan/phase/elevation
- Code translation
- Exporting reports
- Database validation

## Usage Examples

### Example 1: Initialize Builder
```python
from bat_coding_system_builder import BATCodingSystemBuilder

# Create builder instance
builder = BATCodingSystemBuilder("bat_unified.db")
builder.connect()

# Create schema and load translations
builder.create_schema()
builder.load_translation_table("coding_schema_translation_v2.csv")
```

### Example 2: Add a Material
```python
# Add material with unified code
material_id = builder.add_material(
    plan_code="1670",
    phase_code="010.820",      # Den foundation
    elevation_code="BCD",       # Elevations B, C, D
    item_type_code="1000",      # Framing lumber
    vendor_sku="2616HF3TICAG",
    description="2x6x16 Hem Fir #3 Treated Incised Ground Contact",
    quantity=24.0,
    unit="EA",
    richmond_pack_id="|10.82BCD",  # For traceability
    notes="Imported from Richmond BAT file"
)

print(f"Added material ID: {material_id}")
print(f"Full code: 1670-010.820-BCD-1000")
```

### Example 3: Translate Richmond Code
```python
# Translate Richmond pack to unified format
unified_code = builder.translate_richmond_code(
    plan_code="1670",
    richmond_pack_id="|10.82",
    elevation_str="B, C, D",
    item_type="Framing"
)

print(unified_code)  # Output: 1670-010.820-BCD-1000
```

### Example 4: Query Materials
```python
# Get all materials for a plan
materials = builder.get_materials_by_plan("1670")
print(f"Found {len(materials)} materials for plan 1670")

# Get materials by phase (across all plans)
foundation_materials = builder.get_materials_by_phase("010.000")
print(f"Found {len(foundation_materials)} foundation materials")

# Get materials for specific elevation
elev_b_materials = builder.get_materials_by_elevation("1670", "B")
print(f"Found {len(elev_b_materials)} materials for elevation B")
```

### Example 5: Export Reports
```python
# Export all materials to CSV
builder.export_materials_report("all_materials.csv")

# Export specific plan only
builder.export_materials_report("plan_1670.csv", plan_code="1670")

# Generate summary report
summary = builder.generate_summary_report()
print(summary)

# Validate database
results = builder.validate_database()
print(f"Total materials: {results['materials_count']:,d}")
print(f"Orphaned records: {results['orphaned_materials']}")
```

### Example 6: Bulk Import from Excel
```python
import pandas as pd

# Read Richmond Excel file
df = pd.read_excel("Plan_1670.xlsx", sheet_name="Materials")

# Add plan to database
cursor = builder.conn.cursor()
cursor.execute("""
    INSERT OR IGNORE INTO plans (plan_code, plan_name, builder)
    VALUES ('1670', 'Plan 1670', 'Richmond')
""")
builder.conn.commit()

# Import each material
for _, row in df.iterrows():
    # Extract data from Richmond format
    richmond_pack = row['Pack ID']
    vendor_sku = row['Sku']
    description = row['Description']
    quantity = row['QTY']
    
    # Translate to unified format
    unified_code = builder.translate_richmond_code(
        plan_code="1670",
        richmond_pack_id=richmond_pack,
        elevation_str="",  # Parse from pack ID if needed
        item_type="Framing"  # Determine from data
    )
    
    # Parse unified code
    parts = unified_code.split('-')
    
    # Add to database
    builder.add_material(
        plan_code=parts[0],
        phase_code=parts[1],
        elevation_code=parts[2],
        item_type_code=parts[3],
        vendor_sku=vendor_sku,
        description=description,
        quantity=quantity,
        richmond_pack_id=richmond_pack
    )

print("Import complete!")
```

## Database Schema

### Core Tables
- **`plans`** - Plan definitions (1670, G603, etc.)
- **`product_phases`** - Phase/option codes (010.820, 012.040, etc.)
- **`item_types`** - Item type codes (1000, 2100, etc.)
- **`materials`** - Main materials table with full codes
- **`elevation_mappings`** - Which elevations apply to which phases

### Supporting Tables
- **`option_translation`** - Richmond ↔ Holt ↔ Universal code mappings
- **`vendors`** - Vendor information
- **`audit_trail`** - Change history (learning-first philosophy)

### Key Indexes
- `idx_materials_full_code` - Fast full code lookups
- `idx_materials_plan` - Query by plan
- `idx_materials_phase` - Query by phase
- `idx_materials_elevation` - Query by plan + elevation

## Code Translation Patterns

### Pattern 1: Alphabetic Suffixes → Numeric
```
Richmond              Unified Phase Code
|12.2x (2' ext)    → 012.020
|12.4x (4' ext)    → 012.040
|12.5x (5' ext)    → 012.050
|10.tc (tallcrawl) → 010.900
```

### Pattern 2: Triple-Encoding → Single Segment
```
OLD Richmond (3 places):
  Pack ID:   |10.82BCD
  Location:  - ELVB - ELVC - ELVD
  Option:    ELVB, ELVC, ELVD

NEW Unified (1 place):
  Full Code: 1670-010.820-BCD-1000
                           ^^^
                    Elevation only here
```

### Pattern 3: Sub-Variants
```
063.100  Base (covered patio siding)
063.101  Sub-variant (post wrap)

075.100  Base (deck surface)
075.101  Sub-variant (stairs)
```

## Phase Code Taxonomy

### Foundation & Site (000-019)
- `009.000` - WO Basement Walls
- `010.000` - Foundation (base)
- `010.820` - Den foundation
- `011.000` - Main joist system
- `012.040` - 2 car garage 4' extension

### Main Floor (020-029)
- `020.000` - Main floor walls
- `020.600` - Extended great room
- `020.820` - Den framing

### Upper Floor (030-039)
- `030.000` - Upper walls
- `032.000` - Upper floor headers

### Roof (040-059)
- `040.000` - Roof trusses
- `050.000` - Roofing

### Exterior (060-079)
- `060.000` - Main housewrap
- `063.100` - Covered patio 1 siding
- `070.000` - Main siding

## Item Type Codes

### Structural (1000-1999)
- `1000` - Framing lumber
- `1100` - Engineered lumber (TJI, LVL)
- `1200` - Structural hardware
- `1300` - Concrete/foundation

### Exterior Envelope (2000-2999)
- `2000` - Sheathing/housewrap
- `2100` - Siding
- `2200` - Roofing
- `2300` - Windows/doors

### Mechanicals (3000-3999)
- `3000` - Plumbing rough
- `3100` - Electrical rough
- `3200` - HVAC rough

### Interior (4000-4999)
- `4000` - Drywall
- `4100` - Interior trim
- `4200` - Flooring

## Elevation Codes

### Single Elevation
- `A` - Elevation A only
- `B` - Elevation B only
- `C` - Elevation C only
- `D` - Elevation D only
- `E` - Elevation E only (Holt)

### Multiple Elevations
- `AB` - Elevations A and B
- `ABC` - Elevations A, B, and C
- `BCD` - Elevations B, C, and D
- `ABCD` - All four elevations

### Universal
- `**` - Applies to all elevations

**Rule:** Always alphabetical order (ABC not CBA)

## Validation & Reports

### Validate Database Integrity
```python
results = builder.validate_database()

# Check results
print(f"Materials: {results['materials_count']:,d}")
print(f"Orphaned records: {results['orphaned_materials']}")
print(f"Duplicate codes: {results['duplicate_codes']}")
```

### Generate Summary Report
```python
summary = builder.generate_summary_report()

# Shows:
# - Materials by plan
# - Top phases by count
# - Materials by item type
# - Elevation distribution
```

## Troubleshooting

### Error: "No translation found"
- Check that `coding_schema_translation_v2.csv` is in the same directory
- Verify Richmond pack ID format (e.g., "|10.82" not "10.82")
- Check elevation string format ("B, C, D" not "BCD")

### Error: "Foreign key constraint failed"
- Ensure plan exists in `plans` table before adding materials
- Verify phase_code exists in `product_phases` table
- Verify item_type_code exists in `item_types` table

### Database locked error
- Close any other connections to the database
- Ensure `builder.close()` is called when done

## Best Practices

1. **Always close connections:**
   ```python
   try:
       builder.connect()
       # ... do work ...
   finally:
       builder.close()
   ```

2. **Validate after imports:**
   ```python
   builder.validate_database()
   ```

3. **Use Richmond pack IDs for traceability:**
   ```python
   builder.add_material(
       ...
       richmond_pack_id="|10.82BCD",  # Keep original
       richmond_option_code="XGREAT",
       ...
   )
   ```

4. **Export reports regularly:**
   ```python
   builder.export_materials_report("backup_materials.csv")
   ```

## Architecture Decisions

This system solves the three critical architecture decisions:

### ✅ Decision 1: Plan-Pack Relationship
**Answer:** Plan-specific with universal product taxonomy
- Plan code (XXXX) is always specific
- Phase codes (XXX.XXX) are universal across all plans

### ✅ Decision 2: Plan-Elevation Model
**Answer:** Elevation as explicit code segment
- Elevation stored once in the -XX- segment
- No more triple-encoding

### ✅ Decision 3: Internal Option Code Philosophy
**Answer:** Phase codes ARE the options
- Richmond XGREAT → 010.600, 020.600, 050.600
- Holt communities → .001, .002, .003 minor codes

## Next Steps

1. **Review with team** - William Hatley (Richmond), Alicia Vandehey (Holt)
2. **Import Richmond materials** - Use bulk import from Excel
3. **Import Holt materials** - Adapt for Holt structure
4. **Integrate with pricing updater** - Update Python pricing tool
5. **Generate reports** - Material lists, cost summaries

## Support

For questions or issues:
- Review `coding_schema_translation_summary.txt` for complete documentation
- Check `example_usage.py` for working code examples
- Review translation table in `coding_schema_translation_v2.csv`

## Version History

- **v1.0** (2025-11-13) - Initial release with complete schema and translation
