# BAT Coding System Builder

This directory contains the coding schema files for the BAT (Builder's Acceleration Tool) pricing system integration.

## Expected Files

- `Coding_Schema_v2_NEW_FORMAT.csv` - Latest coding schema in new format
- `Coding_Schema_20251113.csv` - Coding schema snapshot from November 2023

## Schema Structure

The coding schema implements a two-layer system:

### Layer 1: Aggregate Codes (Quoting)
- Format: `PLAN_ID-PHASE.OPTION-MATERIAL_CLASS`
- Example: `1670-010.000-1000`
- Used for customer-facing quotes and pricing

### Layer 2: Detailed Materials (Purchasing)
- Links to specific SKUs and vendor items
- Contains actual material specifications
- Used for procurement and inventory

## Related Files

- `database/schema/unified_code_system.sql` - SQL schema implementation
- `docs/archive/skills/SKILL_UNIFIED_CODING_SYSTEM.md` - Full documentation

## Phase Code Reference

| Phase Range | Description |
|-------------|-------------|
| 09.xx | Pre-construction |
| 10.xx | Foundation/Slab |
| 20.xx | Framing - Floor |
| 30.xx | Framing - Wall |
| 40.xx | Framing - Roof |
| 50.xx | Exterior |
| 60.xx | Roofing |
| 70.xx | Windows/Doors |
| 80.xx | Trim/Finish |
| 90.xx | Siding |
