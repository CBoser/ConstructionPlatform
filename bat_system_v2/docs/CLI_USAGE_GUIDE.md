# BAT System CLI - Usage Guide

Complete guide to using the BAT System command-line interface.

---

## Installation

### Quick Start (Development Mode)

```bash
cd /home/user/ConstructionPlatform
python3 bat_system_v2/cli/main.py --help
```

### Install Globally (Future)

```bash
cd /home/user/ConstructionPlatform
pip install -e .
bat --help
```

---

## Command Structure

```
bat <command> <subcommand> [arguments] [options]
```

**Available Commands:**
- `bat code` - Unified code operations
- `bat material` - Material management
- `bat pricing` - Pricing operations
- `bat plan` - Plan management

---

## Code Commands

Work with unified codes in format: `PPPP-PPP.000-EE-IIII`

### Parse a Code

Convert raw Excel codes to standard format:

```bash
# Parse raw code with spaces
python3 bat_system_v2/cli/main.py code parse "167010100 - 4085"

# Parse raw code without spaces
python3 bat_system_v2/cli/main.py code parse "167010100-4085"

# Parse already-formatted code
python3 bat_system_v2/cli/main.py code parse "1670-101.000-AB-4085"
```

**Output:**
```
╭──────────────────────────── Parsed Unified Code ─────────────────────────────╮
│ Unified Code: 1670-101.000-00-4085                                           │
│                                                                              │
│ Components:                                                                  │
│   Plan:      1670                                                            │
│   Phase:     101 (FOUNDATION)                                                │
│   Elevation: 00                                                              │
│   Item Type: 4085 (Hardware/fasteners)                                       │
│                                                                              │
│ Status: ✅ Valid                                                             │
╰──────────────────────────────────────────────────────────────────────────────╯
```

### Build a Code

Create a new unified code from components:

```bash
# Build code with all components
python3 bat_system_v2/cli/main.py code build --plan 1670 --phase 101 --elevation AB --item 4085

# Build code with short options
python3 bat_system_v2/cli/main.py code build -p 2336 -ph 200 -e CD -i 2085

# Build code with defaults (elevation=00, item=9000)
python3 bat_system_v2/cli/main.py code build --plan 1670 --phase 101
```

**Output:**
```
                      Built Unified Code
╭────────────────┬─────────────────────────┬─────────────────╮
│ Component      │ Value                   │ Description     │
├────────────────┼─────────────────────────┼─────────────────┤
│ Plan           │ 1670                    │ Plan number     │
│ Phase          │ 101 (FOUNDATION)        │ Phase/pack code │
│ Elevation      │ AB                      │ Elevation code  │
│ Item Type      │ 4085 (Hardware/         │ Item category   │
│                │ fasteners)              │                 │
│                │                         │                 │
│ Generated Code │ 1670-101.000-AB-4085    │                 │
╰────────────────┴─────────────────────────┴─────────────────╯

Copyable: 1670-101.000-AB-4085
```

### Validate a Code

Check if a code is valid:

```bash
# Validate correct code
python3 bat_system_v2/cli/main.py code validate "1670-101.000-AB-4085"

# Validate incorrect code
python3 bat_system_v2/cli/main.py code validate "invalid-code"
```

### List Pack Codes

Show all available phase/pack codes:

```bash
python3 bat_system_v2/cli/main.py code packs
```

**Output:**
```
                 Pack/Phase Codes
╭──────┬───────────────────┬──────────────────────╮
│ Code │ Pack Name         │ Example              │
├──────┼───────────────────┼──────────────────────┤
│ 101  │ FOUNDATION        │ 1670-101.000-AB-4085 │
│ 200  │ MAIN WALLS        │ 1670-200.000-AB-4085 │
│ 300  │ ROOF FRAMING      │ 1670-300.000-AB-4085 │
│ ...  │                   │                      │
╰──────┴───────────────────┴──────────────────────╯
```

### List Item Categories

Show item type categories:

```bash
python3 bat_system_v2/cli/main.py code categories
```

---

## Material Commands

Manage materials (SKUs, descriptions, categories).

**Note:** Database connection required for these commands.

### List Materials

```bash
# List all materials (default: 20 items)
python3 bat_system_v2/cli/main.py material list

# List with custom limit
python3 bat_system_v2/cli/main.py material list --limit 50

# Filter by category
python3 bat_system_v2/cli/main.py material list --category "Lumber"
```

### Search Materials

```bash
# Search by keyword
python3 bat_system_v2/cli/main.py material search "2x4"

# Exact match only
python3 bat_system_v2/cli/main.py material search "2X4-8" --exact
```

### Add Material

```bash
# Add new material
python3 bat_system_v2/cli/main.py material add \
  --sku "2X4-8" \
  --description "2x4 Stud 8ft" \
  --category "Lumber"

# With supplier
python3 bat_system_v2/cli/main.py material add \
  -s "PLY-4X8" \
  -d "Plywood 4x8 Sheet" \
  -c "Panels" \
  --supplier "Holt Lumber"
```

### Update Material

```bash
# Update description
python3 bat_system_v2/cli/main.py material update "2X4-8" --description "2x4 Stud 8ft Premium"

# Update category
python3 bat_system_v2/cli/main.py material update "PLY-4X8" --category "Sheathing"
```

### Show Material Details

```bash
python3 bat_system_v2/cli/main.py material show "2X4-8"
```

### Material Statistics

```bash
python3 bat_system_v2/cli/main.py material stats
```

---

## Pricing Commands

Manage material pricing across different price levels.

**Note:** Database connection required for these commands.

### Look Up Price

```bash
# Look up price at level 01
python3 bat_system_v2/cli/main.py pricing lookup "2X4-8" "01"

# Look up at different levels
python3 bat_system_v2/cli/main.py pricing lookup "PLY-4X8" "02"
python3 bat_system_v2/cli/main.py pricing lookup "NAIL-16D" "L5"
```

**Output:**
```
╭───────────────────── Price Lookup ─────────────────────╮
│ Material: 2X4-8                                        │
│ Description: 2x4 Stud 8ft (example)                    │
│                                                        │
│ Price Level 01:                                        │
│   Sell Price: $4.99                                    │
│   Cost:       $3.75                                    │
│   Margin:     24.8%                                    │
│                                                        │
│ Last Updated: 2025-11-16                               │
╰────────────────────────────────────────────────────────╯
```

### Compare Price Levels

```bash
# See all price levels for a material
python3 bat_system_v2/cli/main.py pricing compare "2X4-8"
```

**Output:**
```
           Price Comparison: 2X4-8
╭───────┬────────────┬──────┬──────────┬──────────╮
│ Level │ Sell Price │ Cost │ Margin % │ Margin $ │
├───────┼────────────┼──────┼──────────┼──────────┤
│ 01    │ $4.99      │ $3.75│ 24.8%    │ $1.24    │
│ 02    │ $4.75      │ $3.75│ 21.1%    │ $1.00    │
│ 03    │ $4.50      │ $3.75│ 16.7%    │ $0.75    │
│ L5    │ $4.25      │ $3.75│ 11.8%    │ $0.50    │
╰───────┴────────────┴──────┴──────────┴──────────╯
```

### Update Price

```bash
# Update sell price only
python3 bat_system_v2/cli/main.py pricing update "2X4-8" "01" 4.99

# Update price and cost
python3 bat_system_v2/cli/main.py pricing update "PLY-4X8" "02" 25.50 --cost 19.99
```

### Calculate Line Total

```bash
# Calculate total for quantity
python3 bat_system_v2/cli/main.py pricing calculate "2X4-8" 100 "01"
```

**Output:**
```
       Line Total Calculation
╭──────────────┬───────────────────╮
│ Item         │ Value             │
├──────────────┼───────────────────┤
│ Material     │ 2X4-8             │
│ Quantity     │ 100               │
│ Price Level  │ 01                │
│              │                   │
│ Price Per    │ $4.99             │
│ Unit         │                   │
│ Cost Per Unit│ $3.75             │
│              │                   │
│ Total Sell   │ $499.00           │
│ Total Cost   │ $375.00           │
│ Margin $     │ $124.00           │
│ Margin %     │ 24.8%             │
╰──────────────┴───────────────────╯
```

### Import Prices from CSV

```bash
# Dry run (preview without importing)
python3 bat_system_v2/cli/main.py pricing import prices.csv --dry-run

# Actually import
python3 bat_system_v2/cli/main.py pricing import prices.csv
```

---

## Plan Commands

Manage construction plans (materials, phases, totals).

**Note:** Database connection required for these commands.

### List Plans

```bash
# List all plans
python3 bat_system_v2/cli/main.py plan list

# Limit results
python3 bat_system_v2/cli/main.py plan list --limit 50

# Filter by status
python3 bat_system_v2/cli/main.py plan list --status active
```

### Create Plan

```bash
# Create basic plan
python3 bat_system_v2/cli/main.py plan create --name "Smith Residence"

# Create with customer and plan number
python3 bat_system_v2/cli/main.py plan create \
  --name "Jones Home" \
  --customer "Bob Jones" \
  --plan-number 1670
```

### Show Plan Details

```bash
python3 bat_system_v2/cli/main.py plan show 123
```

**Output:**
```
╭──────────────────────── Plan Details: 123 ────────────────────────╮
│ Plan #: 123                                                       │
│ Name: Smith Residence                                             │
│ Customer: John Smith                                              │
│ Status: Active                                                    │
│                                                                   │
│ Summary:                                                          │
│   Materials: 279 items                                            │
│   Total Sell: $45,230.00                                          │
│   Total Cost: $34,180.00                                          │
│   Margin: $11,050.00 (24.4%)                                      │
│                                                                   │
│ Phases:                                                           │
│   Foundation (101):    45 items, $8,500                           │
│   Main Walls (200):    120 items, $18,200                         │
│   Roof Framing (300):  85 items, $14,100                          │
│   Other:               29 items, $4,430                           │
╰───────────────────────────────────────────────────────────────────╯
```

### Calculate Plan Totals

```bash
python3 bat_system_v2/cli/main.py plan calculate 123
```

### List Plan Materials

```bash
python3 bat_system_v2/cli/main.py plan materials 123
```

### Export Plan

```bash
# Export to Excel (default)
python3 bat_system_v2/cli/main.py plan export 123 --output smith_plan.xlsx

# Export to PDF
python3 bat_system_v2/cli/main.py plan export 123 -o plan.pdf -f pdf

# Export to CSV
python3 bat_system_v2/cli/main.py plan export 123 -o materials.csv -f csv
```

---

## Command Options

### Global Options

All commands support:

```bash
--help     Show command help
--version  Show version
```

### Common Patterns

```bash
# Short options
-l, --limit    Limit results
-o, --offset   Skip results
-c, --category Filter by category
-s, --status   Filter by status

# Output options
-o, --output   Output file path
-f, --format   Output format (xlsx, pdf, csv)

# Confirmation
--dry-run      Preview without making changes
-y, --yes      Auto-confirm (skip prompts)
```

---

## Examples: Real-World Workflows

### Workflow 1: Parse Excel Codes

You have raw codes from Excel and want to standardize them:

```bash
# Parse multiple codes
python3 bat_system_v2/cli/main.py code parse "167010100-4085"
python3 bat_system_v2/cli/main.py code parse "233620070"
python3 bat_system_v2/cli/main.py code parse "38310105 - 4085"

# Output:
# 1670-101.000-00-4085
# 2336-200.000-70-9000
# 0383-101.000-05-4085
```

### Workflow 2: Build Codes for New Materials

Creating materials for a new plan:

```bash
# Foundation materials (phase 101)
python3 bat_system_v2/cli/main.py code build -p 1670 -ph 101 -e 00 -i 4085

# Main wall studs (phase 200)
python3 bat_system_v2/cli/main.py code build -p 1670 -ph 200 -e AB -i 2085

# Roof framing (phase 300)
python3 bat_system_v2/cli/main.py code build -p 1670 -ph 300 -e CD -i 3085
```

### Workflow 3: Price Comparison

Compare prices to find best level for a customer:

```bash
python3 bat_system_v2/cli/main.py pricing compare "2X4-8"
python3 bat_system_v2/cli/main.py pricing compare "PLY-4X8"
python3 bat_system_v2/cli/main.py pricing compare "NAIL-16D"
```

### Workflow 4: Plan Creation and Export

Create a new plan and export it:

```bash
# 1. Create plan
python3 bat_system_v2/cli/main.py plan create --name "Smith Residence" --customer "John Smith"

# 2. Add materials (future feature)
# bat plan add-item 123 --sku "2X4-8" --qty 100 --level "01"

# 3. Calculate totals
python3 bat_system_v2/cli/main.py plan calculate 123

# 4. Export to Excel
python3 bat_system_v2/cli/main.py plan export 123 --output smith_plan.xlsx
```

---

## Tips and Tricks

### 1. Use Tab Completion (Future)

When installed, the CLI will support tab completion:

```bash
bat <TAB>          # Shows: code, material, pricing, plan
bat code <TAB>     # Shows: parse, build, validate, packs, categories
```

### 2. Pipe Output

Use standard Unix pipes:

```bash
# Parse multiple codes from file
cat codes.txt | while read code; do
    python3 bat_system_v2/cli/main.py code parse "$code"
done
```

### 3. Save Output

Redirect output to file:

```bash
python3 bat_system_v2/cli/main.py code packs > pack_codes.txt
python3 bat_system_v2/cli/main.py material list > materials.txt
```

### 4. Use in Scripts

Create bash scripts that use the CLI:

```bash
#!/bin/bash
# parse_all_codes.sh

for code in "167010100-4085" "233620070" "38310105-4085"; do
    python3 bat_system_v2/cli/main.py code parse "$code"
done
```

---

## Current Limitations

### Database Required

These commands require database connection:
- Most `material` commands
- Most `pricing` commands
- Most `plan` commands

### Code Commands Work Offline

These commands work without database:
- `bat code parse`
- `bat code build`
- `bat code validate`
- `bat code packs`
- `bat code categories`

---

## Next Steps

### Coming Soon

1. **Database Integration**
   - MaterialService.list() implementation
   - PlanService.create() implementation
   - Full CRUD operations

2. **Import/Export**
   - Excel import for bulk materials
   - CSV export for pricing
   - PDF reports for plans

3. **Interactive Mode**
   - `bat interactive` - Interactive shell
   - Auto-complete suggestions
   - Command history

4. **Batch Operations**
   - `bat material import materials.csv`
   - `bat pricing bulk-update prices.csv`
   - `bat plan clone 123 --new-name "Copy of Plan 123"`

---

## Getting Help

### Command Help

Every command has built-in help:

```bash
python3 bat_system_v2/cli/main.py --help
python3 bat_system_v2/cli/main.py code --help
python3 bat_system_v2/cli/main.py code parse --help
```

### Documentation

- This guide: `bat_system_v2/docs/CLI_USAGE_GUIDE.md`
- Unified codes: `bat_system_v2/docs/UNIFIED_CODE_SYSTEM.md`
- System overview: `bat_system_v2/docs/SYSTEM_OVERVIEW.md`

### Examples

See example output above for each command.

---

## Troubleshooting

### "Module not found" Error

Make sure you're in the correct directory:

```bash
cd /home/user/ConstructionPlatform
python3 bat_system_v2/cli/main.py --help
```

### "Database connection required"

Some commands need database. Make sure:
1. PostgreSQL is running
2. Database credentials are configured
3. Services are implemented (some are placeholders)

### "Invalid code" Error

Check code format:
- Standard: `PPPP-PPP.000-EE-IIII`
- Raw: `PPPPPPPEE-IIII` or `PPPPPPPEE - IIII`

---

## Summary

The BAT CLI provides:
- ✅ **Code operations** - Parse, build, validate unified codes
- ✅ **Material management** - Add, update, search materials
- ✅ **Pricing operations** - Lookup, compare, calculate prices
- ✅ **Plan management** - Create, calculate, export plans

All with beautiful formatted output and comprehensive help!

Happy building! 🏗️
