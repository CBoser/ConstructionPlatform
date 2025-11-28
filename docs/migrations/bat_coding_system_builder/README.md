# BAT Coding System Builder

Documentation for the BAT (Builder's Acceleration Tool) unified coding system.

## Schema Files Location

All coding schema files are in `database/schema/`:
- `Coding_Schema_v2_NEW_FORMAT.csv` - 312 pack definitions with elevation/option mappings
- `Coding_Schema_20251113.csv` - Original schema snapshot
- `coding_schema_translation.csv` - Full Richmond → Unified translation table
- `coding_schema_translation_summary.txt` - Implementation guide
- `bat_unified.db` - SQLite database with translated schema
- `unified_code_system.sql` - SQL schema implementation

## Unified Code Format

`PLAN-PHASE.OPTION-ELEVATION-ITEMTYPE`

Example: `1670-010.820-BCD-1000`

## Item Type Codes

| Code | Category | Includes |
|------|----------|----------|
| **1000** | Framing | Lumber, sheathing, structural |
| **1100** | Siding | Exterior finish, house wrap, trim |
| **1200** | Deck | Deck framing, surface, railing |

## Phase Code Reference

| Phase Range | Description | Item Type |
|-------------|-------------|-----------|
| 009.xx | Walkout Basement | 1000 |
| 010.xx | Foundation | 1000 |
| 011.xx | Joist System | 1000 |
| 012.xx | Garage Foundation | 1000 |
| 013.xx | Covered Patio Foundation | 1000 |
| 014.xx | Deck Foundation | 1200 |
| 015.xx | Covered Deck Foundation | 1200 |
| 016.xx | Trussed Floor | 1000 |
| 018.xx | Subfloor | 1000 |
| 020.xx | Main Floor Walls | 1000 |
| 022.xx | Main Floor Headers | 1000 |
| 024.xx | Deck Framing | 1200 |
| 025.xx | Covered Deck Framing | 1200 |
| 030.xx | Upper Floor Walls | 1000 |
| 032.xx | Upper Floor Headers | 1000 |
| 034.xx | Upper Floor Doors/Windows | 1000 |
| 040.xx | Roof Trusses | 1000 |
| 042.xx | Garage Trusses | 1000 |
| 043.xx | Covered Patio Trusses | 1000 |
| 045.xx | Covered Deck Trusses | 1200 |
| 058.xx | Housewrap | 1100 |
| 060.xx | Exterior Trim/Siding | 1100 |
| 062.xx | Garage Siding | 1100 |
| 063.xx | Covered Patio Siding | 1100 |
| 065.xx | Covered Deck Siding | 1200 |
| 074.xx | Deck Surface & Rail | 1200 |
| 075.xx | Covered Deck Surface & Rail | 1200 |
| 080.xx | Tall Crawl | 1000 |
| 090.xx | Tall Crawl Siding | 1100 |

## Elevation Codes

| Code | Meaning |
|------|---------|
| A, B, C, D, E | Single elevation |
| ABC, BCD, etc. | Multiple elevations (alphabetical) |
| ** | Universal (all elevations)
