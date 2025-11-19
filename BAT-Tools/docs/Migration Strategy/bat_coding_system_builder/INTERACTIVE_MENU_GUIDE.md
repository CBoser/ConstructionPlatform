# BAT Interactive Menu - Quick Start Guide

## Overview

The Interactive Menu provides a user-friendly interface for reviewing and revising your BAT unified material database. No need to write code - just navigate menus and enter data.

## Launch the Menu

```bash
python interactive_menu.py
```

The menu will:
1. Check if database exists (creates one if not)
2. Load translation table automatically
3. Display the main menu

## Main Menu Structure

```
═══════════════════════════════════════════════════════════════════════
  BAT UNIFIED CODING SYSTEM - MAIN MENU
═══════════════════════════════════════════════════════════════════════

MATERIALS (View/Edit/Search)
1.  View Materials
2.  Search Materials
3.  Add New Material
4.  Edit Material
5.  Delete Material

REFERENCE DATA
6.  View Product Phases
7.  Add/Edit Phase
8.  View Item Types
9.  Add/Edit Item Type
10. View Plans
11. Add/Edit Plan

UTILITIES
12. Translate Richmond Code
13. Bulk Import from CSV

REPORTS & MAINTENANCE
14. Database Statistics
15. Validate Database
16. Export Reports
17. Backup Database
18. View Audit Trail

0.  Exit
```

## Common Workflows

### 1. Browse Materials

**Path:** Main Menu → 1 (View Materials)

**Submenu Options:**
- View all materials (paginated)
- View by plan (e.g., "1670")
- View by phase (e.g., "010.000" for foundation)
- View by elevation (e.g., plan "1670", elevation "B")
- View by item type (e.g., "1000" for framing)
- View recent additions (last 20)

**Navigation:**
- Use [N]ext/[P]revious to page through results
- Press [V] and enter material ID to view details
- Press [Q] to quit back to menu

### 2. Search for Specific Materials

**Path:** Main Menu → 2 (Search Materials)

**Search Types:**
1. **Vendor SKU** - Partial match (e.g., "2616" finds all 2x6x16)
2. **Description** - Partial match (e.g., "Hem Fir" finds all HF lumber)
3. **Full Code** - Exact match (e.g., "1670-010.000-**-1000")
4. **Richmond Pack ID** - Partial match (e.g., "|10.82")

**Example:**
```
Enter choice: 1
Enter search term: 2616

Found 24 materials:
ID     Full Code                 SKU             Qty      Description
─────────────────────────────────────────────────────────────────────
1      1670-010.000-**-1000      2616HF3TICAG    24.0 EA  2x6x16 Hem...
2      1670-010.820-BCD-1000     2616HF3TICAG    16.0 EA  2x6x16 Hem...
...
```

### 3. Add a New Material

**Path:** Main Menu → 3 (Add New Material)

**Two Options:**

**Option A: Translate from Richmond Code**
```
Enter material details:

Plan code: 1670
Translate from Richmond code? [y/N]: y
Richmond pack ID: |10.82
Elevation string: B, C, D
Item type: Framing

✓ Translated to: 1670-010.820-BCD-1000
  Phase: 010.820
  Elevation: BCD
  Item Type: 1000

Vendor SKU: 2616HF3TICAG
Description: 2x6x16 Hem Fir #3 Treated Incised Ground Contact
Quantity: 24
Unit: EA
Notes: Den foundation material

Add this material? [y/N]: y

✓ Material added successfully!
  Material ID: 1234
  Full code: 1670-010.820-BCD-1000
```

**Option B: Enter Unified Codes Directly**
```
Plan code: 1670
Translate from Richmond code? [y/N]: n
Phase code: 010.820
Elevation code: BCD
Item type code: 1000

Vendor SKU: 2616HF3TICAG
Description: 2x6x16 Hem Fir #3 Treated
Quantity: 24
Unit: EA
...
```

### 4. Edit Existing Material

**Path:** Main Menu → 4 (Edit Material)

**Steps:**
1. Enter material ID (or find via search first)
2. Press Enter to keep current value, or type new value
3. Confirm changes

**Example:**
```
Enter material ID to edit: 1234

Current values (press Enter to keep current value):

Vendor SKU [2616HF3TICAG]: 2616HF2TICAG
Description [2x6x16 Hem Fir #3...]: 2x6x16 Hem Fir #2 Treated
Quantity [24.0]: 32
Unit [EA]: 
Notes []: Updated to #2 grade per supplier change

CONFIRM CHANGES
────────────────────────────────────────────────────────────────────
Vendor SKU: 2616HF3TICAG → 2616HF2TICAG
Description: 2x6x16 Hem Fir #3 ... → 2x6x16 Hem Fir #2 ...
Quantity: 24.0 EA → 32.0 EA

Save changes? [y/N]: y

✓ Material updated successfully!
```

### 5. View Material Details

From any material list, you can press [V] and enter a material ID to see full details:

```
MATERIAL DETAIL - ID 1234
────────────────────────────────────────────────────────────────────
material_id              : 1234
plan_code                : 1670
phase_code               : 010.820
elevation_code           : BCD
item_type_code           : 1000
full_code                : 1670-010.820-BCD-1000
vendor_sku               : 2616HF3TICAG
description              : 2x6x16 Hem Fir #3 Treated Incised GC
quantity                 : 24.0
unit                     : EA
richmond_pack_id         : |10.82BCD
richmond_option_code     : (null)
created_date             : 2025-11-14
modified_date            : 2025-11-14
notes                    : Den foundation material

Commands: [E]dit, [D]elete, [B]ack
```

### 6. Translate Richmond Codes

**Path:** Main Menu → 12 (Translate Richmond Code)

Quickly translate Richmond codes to unified format without adding to database:

```
Enter Richmond code details:

Plan code: 1670
Richmond pack ID: |10.82
Elevation: B, C, D
Item type: Framing

═══════════════════════════════════════════════════════════════════
TRANSLATION RESULT
═══════════════════════════════════════════════════════════════════
Richmond Code: |10.82 + B, C, D
Unified Code:  1670-010.820-BCD-1000

  Plan:      1670
  Phase:     010.820
  Elevation: BCD
  Item Type: 1000
```

### 7. View Reference Data

**View Product Phases:** Main Menu → 6
- See all phase codes (010.000, 010.820, etc.)
- Shows Richmond pack ID mapping
- Shows material count per phase

**View Item Types:** Main Menu → 8
- See all item type codes (1000, 2100, etc.)
- Shows category grouping
- Shows material count per type

**View Plans:** Main Menu → 10
- See all plans in database
- Shows material count per plan
- Shows builder (Richmond/Holt)

### 8. Database Statistics

**Path:** Main Menu → 14 (Database Statistics)

Shows:
- Total counts (materials, plans, phases, item types)
- Unique values (elevations, SKUs)
- Top 5 plans by material count
- Top 5 phases by material count

```
Database Overview:
────────────────────────────────────────────
Total Materials:                1,234
Total Plans:                        5
Total Phases:                     156
Total Item Types:                  21
Unique Elevations:                 12
Unique SKUs:                      456
Total Quantity:               12,345.0

Top 5 Plans by Material Count:
────────────────────────────────────────────
  1670             567 materials
  G603             234 materials
  LE93             189 materials
  ...
```

### 9. Validate Database

**Path:** Main Menu → 15 (Validate Database)

Checks for:
- Orphaned materials (no plan reference)
- Missing phase definitions
- Missing item type definitions
- Duplicate full codes

**Output:**
```
VALIDATE DATABASE
════════════════════════════════════════════════════════════════════

Record Counts:
────────────────────────────────────────────
  plans                    :        5
  product_phases           :      156
  item_types               :       21
  materials                :    1,234

Integrity Checks:
────────────────────────────────────────────
  Orphaned materials:               0
  Missing phase codes:              0
  Missing item types:               0
  Duplicate full codes:             0

Recommendations:
────────────────────────────────────────────
✓ No issues found! Database is healthy.
```

### 10. Export Reports

**Path:** Main Menu → 16 (Export Reports)

**Options:**
1. Export all materials to CSV
2. Export materials by plan
3. Export materials by phase
4. Generate summary report

**Example:**
```
Enter choice: 1

✓ Exported to: all_materials_20251114_091530.csv
```

Files include:
- Full material details
- Phase names
- Item type names
- All metadata

### 11. Backup Database

**Path:** Main Menu → 17 (Backup Database)

Creates timestamped backup:
```
Creating backup: bat_unified_backup_20251114_091530.db

✓ Backup created successfully!
  File: bat_unified_backup_20251114_091530.db
  Size: 2,457,600 bytes
```

## Tips & Tricks

### Quick Material Lookup
1. Main Menu → 2 (Search)
2. Search by SKU or description
3. Press [V] to view details
4. Press [E] to edit directly

### Bulk Data Review
1. Main Menu → 14 (Statistics) - Get overview
2. Main Menu → 1 → 2 (View by plan) - Review specific plan
3. Main Menu → 16 (Export) - Export for Excel review

### Find Translation Issues
1. Main Menu → 15 (Validate) - Check integrity
2. Main Menu → 2 (Search) - Search for problematic items
3. Main Menu → 4 (Edit) - Fix issues

### Regular Maintenance
1. Main Menu → 17 (Backup) - Daily backups
2. Main Menu → 15 (Validate) - Weekly validation
3. Main Menu → 16 (Export) - Weekly reports

## Keyboard Shortcuts

**In Pagination Views:**
- `N` - Next page
- `P` - Previous page
- `V` - View material detail
- `Q` - Quit to menu

**In Detail Views:**
- `E` - Edit material
- `D` - Delete material
- `B` - Back to list

**In Forms:**
- `q` - Quit/Cancel (in most prompts)
- `Enter` - Keep current value (in edit mode)

## Common Scenarios

### Scenario 1: "I need to review all foundation materials"
```
Path: 1 → 3 (View by phase) → Enter "010.000"
Result: List of all foundation materials across all plans
```

### Scenario 2: "Find that 2x6x16 treated lumber"
```
Path: 2 (Search) → 1 (by SKU) → Enter "2616"
Result: All materials with 2616 in SKU
```

### Scenario 3: "Add materials from a Richmond spreadsheet"
```
For each material:
  Path: 3 (Add) → y (translate) → Enter Richmond details
Alternative:
  Path: 13 (Bulk import) - Import CSV with all materials
```

### Scenario 4: "Export plan 1670 for pricing review"
```
Path: 16 (Export) → 2 (by plan) → Enter "1670"
Result: CSV file with all 1670 materials
```

### Scenario 5: "What's in elevation B for plan 1670?"
```
Path: 1 → 4 (View by elevation) → Enter "1670" → Enter "B"
Result: All materials that apply to elevation B
```

## Error Messages

**"Material ID not found"**
- The ID doesn't exist in database
- Check ID spelling or search for material first

**"No translation found"**
- Richmond pack ID not in translation table
- Check pack ID format (should start with |)
- Verify elevation string format

**"Foreign key constraint failed"**
- Trying to add material with non-existent plan/phase/item type
- Add the parent record first (plan, phase, or item type)

**"Database locked"**
- Another process has database open
- Close other connections and try again

## Best Practices

1. **Search before adding** - Avoid duplicates
2. **Use Richmond translation** - Maintains traceability
3. **Add notes** - Document why changes were made
4. **Backup regularly** - Before major changes
5. **Validate after imports** - Check integrity
6. **Export for review** - Share reports with team

## Support

Need help?
- Press `0` to exit any menu
- Type `q` to cancel most operations
- Review README.md for detailed documentation
- Check example_usage.py for code examples

## Quick Reference

```
Main Actions:
  View:      1, 6, 8, 10, 14, 18
  Search:    2
  Add:       3, 7, 9, 11
  Edit:      4, 7, 9, 11
  Delete:    5
  Translate: 12
  Import:    13
  Reports:   16
  Backup:    17
  Validate:  15
  Exit:      0
```

Ready to start managing your BAT database? Launch the menu:

```bash
python interactive_menu.py
```
