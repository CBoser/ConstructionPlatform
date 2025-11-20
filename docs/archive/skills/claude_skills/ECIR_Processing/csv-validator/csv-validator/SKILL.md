---
name: csv-validator
description: Validates and fixes BOM CSV files for ECIR tool compatibility. Use when users need to check CSV files before running ECIR comparisons, fix CSV formatting issues, ensure required columns exist, or diagnose why ECIR tool fails to process a CSV file.
---

# BOM CSV Validator for ECIR Tool

This skill validates BOM/takeoff CSV files to ensure they're compatible with the ECIR tool before running comparisons. It checks for required columns, data types, duplicates, and common issues that would cause ECIR generation to fail.

## Core Validation Checks

The validator performs these checks automatically:

1. **Required columns** - Ensures Category, Item, Quantity, UnitCost exist (or their aliases)
2. **Column normalization** - Maps common aliases to standard names
3. **Data types** - Validates numeric fields contain valid numbers
4. **Duplicates** - Detects duplicate Category|Item combinations or UIKs
5. **Empty values** - Finds missing required data
6. **Negative values** - Flags negative quantities or costs
7. **Zero quantities** - Notes items with zero quantity (informational)

## Using the Validator Script

The `scripts/validate_bom_csv.py` script provides validation and auto-fixing:

**Basic validation:**
```bash
python scripts/validate_bom_csv.py path/to/bom.csv
```

**Validate and auto-fix issues:**
```bash
python scripts/validate_bom_csv.py path/to/bom.csv --fix path/to/fixed_bom.csv
```

**Quiet mode (summary only):**
```bash
python scripts/validate_bom_csv.py path/to/bom.csv --quiet
```

## What Gets Auto-Fixed

When using `--fix`, the script automatically:

- Renames columns to standard names (e.g., "qty" → "Quantity")
- Converts non-numeric values to 0.0 in Quantity and UnitCost
- Removes rows with empty required values
- Converts negative quantities to positive (absolute value)

## Validation Report Format

The validator generates reports with three severity levels:

- **ERROR** - Must fix before running ECIR (e.g., missing required columns)
- **WARNING** - Recommended to fix (e.g., duplicate UIKs)
- **INFO** - For awareness only (e.g., zero quantities)

Each issue indicates if it's fixable and how.

## Common Use Cases

**Before running ECIR tool:**
```bash
# Validate both files first
python scripts/validate_bom_csv.py before.csv
python scripts/validate_bom_csv.py after.csv

# If validation passes, proceed with ECIR
python ecir_advanced_cleaned.py --before before.csv --after after.csv --output report.xlsx
```

**Fix problematic CSV:**
```bash
# User reports: "ECIR tool says missing UnitCost column"
python scripts/validate_bom_csv.py problem.csv
# Report shows: "Column 'Price' can be normalized to 'UnitCost'"

python scripts/validate_bom_csv.py problem.csv --fix problem_fixed.csv
# Now use problem_fixed.csv with ECIR tool
```

**Batch validation:**
```bash
# Check all CSVs in a directory
for file in *.csv; do
  python scripts/validate_bom_csv.py "$file" --quiet
done
```

## Integration with ECIR Workflow

Recommended workflow:

1. Export BOMs from estimating system
2. Run validator on both BEFORE and AFTER files
3. Fix any errors using `--fix` or manually
4. Run ECIR tool with validated CSVs
5. Review generated Excel report

## Supported Column Aliases

The validator recognizes these common variations:

- **Quantity**: qty, quantity
- **UnitCost**: unit_cost, unitcost, unit_price, unitprice, price
- **Category**: category, cat, type
- **Item**: item, item_name, part
- **Description**: item_description, description, desc
- **EngRef**: eng_ref, engref, sheet, sheet_ref, drawing
- **EngineeringNote**: note, engineering_note, eng_note, notes
- **UIK**: uik, unique_key, item_key

## Exit Codes

The script uses standard exit codes:
- `0` - Validation passed (no errors)
- `1` - Validation failed (has errors)

Useful for scripting and automation.
