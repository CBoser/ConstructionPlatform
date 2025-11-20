#!/usr/bin/env python3
"""
BOM CSV Validator and Fixer for ECIR Tool

Validates and optionally fixes BOM CSV files before running ECIR comparison.
Checks for required columns, data types, duplicates, and common issues.
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import pandas as pd


# Constants from ECIR tool
REQUIRED_COLUMNS = ["Category", "Item", "Quantity", "UnitCost"]
OPTIONAL_COLUMNS = ["Description", "EngRef", "EngineeringNote", "UIK"]

# Column aliases that can be normalized
COLUMN_ALIASES = {
    "quantity": ["qty", "quantity"],
    "unitcost": ["unit_cost", "unitcost", "unit_price", "unitprice", "price"],
    "category": ["category", "cat", "type"],
    "item": ["item", "item_name", "part"],
    "description": ["item_description", "description", "desc"],
    "engref": ["eng_ref", "engref", "sheet", "sheet_ref", "drawing"],
    "engineeringnote": ["note", "engineering_note", "eng_note", "notes"],
    "uik": ["uik", "unique_key", "item_key"],
}


class ValidationIssue:
    """Represents a validation issue found in the CSV."""
    
    SEVERITY_ERROR = "ERROR"
    SEVERITY_WARNING = "WARNING"
    SEVERITY_INFO = "INFO"
    
    def __init__(self, severity: str, message: str, fixable: bool = False, fix_description: str = ""):
        self.severity = severity
        self.message = message
        self.fixable = fixable
        self.fix_description = fix_description
    
    def __str__(self):
        fix_note = f" [FIXABLE: {self.fix_description}]" if self.fixable else ""
        return f"[{self.severity}] {self.message}{fix_note}"


class CSVValidator:
    """Validates BOM CSV files for ECIR tool compatibility."""
    
    def __init__(self, csv_path: Path):
        self.csv_path = csv_path
        self.df: Optional[pd.DataFrame] = None
        self.issues: List[ValidationIssue] = []
        self.column_mapping: Dict[str, str] = {}
    
    def validate(self) -> bool:
        """
        Run all validation checks.
        
        Returns:
            True if no errors found, False otherwise
        """
        # Check 1: File exists
        if not self._check_file_exists():
            return False
        
        # Check 2: Load CSV
        if not self._load_csv():
            return False
        
        # Check 3: Column validation
        self._validate_columns()
        
        # Check 4: Data type validation
        self._validate_data_types()
        
        # Check 5: Check for duplicates
        self._check_duplicates()
        
        # Check 6: Check for empty values
        self._check_empty_values()
        
        # Check 7: Check for negative values
        self._check_negative_values()
        
        # Check 8: Check for zero quantities
        self._check_zero_quantities()
        
        # Determine if there are any errors
        has_errors = any(issue.severity == ValidationIssue.SEVERITY_ERROR for issue in self.issues)
        return not has_errors
    
    def _check_file_exists(self) -> bool:
        """Check if the CSV file exists."""
        if not self.csv_path.exists():
            self.issues.append(ValidationIssue(
                ValidationIssue.SEVERITY_ERROR,
                f"File not found: {self.csv_path}",
                fixable=False
            ))
            return False
        return True
    
    def _load_csv(self) -> bool:
        """Load the CSV file."""
        try:
            self.df = pd.read_csv(self.csv_path)
            if self.df.empty:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_ERROR,
                    "CSV file is empty (no data rows)",
                    fixable=False
                ))
                return False
            return True
        except pd.errors.EmptyDataError:
            self.issues.append(ValidationIssue(
                ValidationIssue.SEVERITY_ERROR,
                "CSV file is completely empty",
                fixable=False
            ))
            return False
        except Exception as e:
            self.issues.append(ValidationIssue(
                ValidationIssue.SEVERITY_ERROR,
                f"Failed to read CSV: {e}",
                fixable=False
            ))
            return False
    
    def _normalize_column_name(self, col: str) -> Optional[str]:
        """Normalize a column name to standard format."""
        col_lower = col.lower().replace(" ", "_").strip()
        
        for standard_name, aliases in COLUMN_ALIASES.items():
            if col_lower in aliases:
                # Return the proper case version
                if standard_name == "quantity":
                    return "Quantity"
                elif standard_name == "unitcost":
                    return "UnitCost"
                elif standard_name == "category":
                    return "Category"
                elif standard_name == "item":
                    return "Item"
                elif standard_name == "description":
                    return "Description"
                elif standard_name == "engref":
                    return "EngRef"
                elif standard_name == "engineeringnote":
                    return "EngineeringNote"
                elif standard_name == "uik":
                    return "UIK"
        
        return None
    
    def _validate_columns(self):
        """Validate that required columns are present or can be normalized."""
        current_cols = [c.strip() for c in self.df.columns]
        
        # Try to normalize column names
        for col in current_cols:
            normalized = self._normalize_column_name(col)
            if normalized:
                self.column_mapping[col] = normalized
        
        # Check for required columns
        normalized_cols = set(self.column_mapping.values())
        missing_required = [col for col in REQUIRED_COLUMNS if col not in normalized_cols]
        
        if missing_required:
            available = ", ".join(current_cols)
            self.issues.append(ValidationIssue(
                ValidationIssue.SEVERITY_ERROR,
                f"Missing required columns: {missing_required}. Available columns: {available}",
                fixable=False
            ))
        else:
            # Suggest normalization if columns need renaming
            needs_rename = [orig for orig, norm in self.column_mapping.items() if orig != norm]
            if needs_rename:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_WARNING,
                    f"Columns can be normalized: {needs_rename}",
                    fixable=True,
                    fix_description="Rename columns to standard names"
                ))
    
    def _get_column(self, standard_name: str) -> Optional[str]:
        """Get the actual column name for a standard column."""
        for orig, norm in self.column_mapping.items():
            if norm == standard_name:
                return orig
        return None
    
    def _validate_data_types(self):
        """Validate that numeric columns contain valid numbers."""
        qty_col = self._get_column("Quantity")
        cost_col = self._get_column("UnitCost")
        
        if qty_col:
            # Check if Quantity is numeric
            non_numeric_qty = pd.to_numeric(self.df[qty_col], errors='coerce').isna().sum()
            if non_numeric_qty > 0:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_ERROR,
                    f"{non_numeric_qty} rows have non-numeric Quantity values",
                    fixable=True,
                    fix_description="Convert to 0.0 or remove invalid rows"
                ))
        
        if cost_col:
            # Check if UnitCost is numeric
            non_numeric_cost = pd.to_numeric(self.df[cost_col], errors='coerce').isna().sum()
            if non_numeric_cost > 0:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_ERROR,
                    f"{non_numeric_cost} rows have non-numeric UnitCost values",
                    fixable=True,
                    fix_description="Convert to 0.0 or remove invalid rows"
                ))
    
    def _check_duplicates(self):
        """Check for duplicate UIKs or Category|Item combinations."""
        cat_col = self._get_column("Category")
        item_col = self._get_column("Item")
        uik_col = self._get_column("UIK")
        
        if cat_col and item_col:
            # Create composite key
            composite_key = (
                self.df[cat_col].astype(str).str.strip() + "|" + 
                self.df[item_col].astype(str).str.strip()
            )
            duplicates = composite_key.duplicated().sum()
            
            if duplicates > 0:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_WARNING,
                    f"{duplicates} duplicate Category|Item combinations found (last duplicate will win in ECIR)",
                    fixable=True,
                    fix_description="Add UIK column with unique values or modify Items to be unique"
                ))
        
        if uik_col and uik_col in self.df.columns:
            # Check UIK duplicates
            uik_dupes = self.df[uik_col].duplicated().sum()
            if uik_dupes > 0:
                self.issues.append(ValidationIssue(
                    ValidationIssue.SEVERITY_WARNING,
                    f"{uik_dupes} duplicate UIK values found",
                    fixable=True,
                    fix_description="Ensure each UIK is unique"
                ))
    
    def _check_empty_values(self):
        """Check for empty required values."""
        for col_name in REQUIRED_COLUMNS:
            actual_col = self._get_column(col_name)
            if actual_col:
                empty_count = self.df[actual_col].isna().sum() + (self.df[actual_col].astype(str).str.strip() == "").sum()
                if empty_count > 0:
                    self.issues.append(ValidationIssue(
                        ValidationIssue.SEVERITY_ERROR,
                        f"{empty_count} rows have empty {col_name} values",
                        fixable=True,
                        fix_description="Remove rows or fill with default values"
                    ))
    
    def _check_negative_values(self):
        """Check for negative quantities or costs."""
        qty_col = self._get_column("Quantity")
        cost_col = self._get_column("UnitCost")
        
        if qty_col:
            try:
                negative_qty = (pd.to_numeric(self.df[qty_col], errors='coerce') < 0).sum()
                if negative_qty > 0:
                    self.issues.append(ValidationIssue(
                        ValidationIssue.SEVERITY_WARNING,
                        f"{negative_qty} rows have negative Quantity values",
                        fixable=True,
                        fix_description="Set to 0 or use absolute value"
                    ))
            except:
                pass
        
        if cost_col:
            try:
                negative_cost = (pd.to_numeric(self.df[cost_col], errors='coerce') < 0).sum()
                if negative_cost > 0:
                    self.issues.append(ValidationIssue(
                        ValidationIssue.SEVERITY_WARNING,
                        f"{negative_cost} rows have negative UnitCost values",
                        fixable=True,
                        fix_description="Review pricing data"
                    ))
            except:
                pass
    
    def _check_zero_quantities(self):
        """Check for zero quantities (informational)."""
        qty_col = self._get_column("Quantity")
        
        if qty_col:
            try:
                zero_qty = (pd.to_numeric(self.df[qty_col], errors='coerce') == 0).sum()
                if zero_qty > 0:
                    self.issues.append(ValidationIssue(
                        ValidationIssue.SEVERITY_INFO,
                        f"{zero_qty} rows have zero Quantity (will appear as 'Deleted' in ECIR if in BEFORE file)",
                        fixable=False
                    ))
            except:
                pass
    
    def get_report(self) -> str:
        """Generate a validation report."""
        lines = []
        lines.append("=" * 70)
        lines.append("BOM CSV VALIDATION REPORT")
        lines.append("=" * 70)
        lines.append(f"File: {self.csv_path}")
        
        if self.df is not None:
            lines.append(f"Rows: {len(self.df)}")
            lines.append(f"Columns: {len(self.df.columns)}")
        
        lines.append("")
        
        # Group issues by severity
        errors = [i for i in self.issues if i.severity == ValidationIssue.SEVERITY_ERROR]
        warnings = [i for i in self.issues if i.severity == ValidationIssue.SEVERITY_WARNING]
        infos = [i for i in self.issues if i.severity == ValidationIssue.SEVERITY_INFO]
        
        if not self.issues:
            lines.append("✅ NO ISSUES FOUND - CSV is valid for ECIR tool")
        else:
            lines.append(f"SUMMARY: {len(errors)} errors, {len(warnings)} warnings, {len(infos)} info")
            lines.append("")
            
            if errors:
                lines.append("ERRORS (must fix before running ECIR):")
                for issue in errors:
                    lines.append(f"  {issue}")
                lines.append("")
            
            if warnings:
                lines.append("WARNINGS (recommended to fix):")
                for issue in warnings:
                    lines.append(f"  {issue}")
                lines.append("")
            
            if infos:
                lines.append("INFO (for your awareness):")
                for issue in infos:
                    lines.append(f"  {issue}")
                lines.append("")
        
        lines.append("=" * 70)
        
        return "\n".join(lines)
    
    def fix(self, output_path: Path) -> bool:
        """
        Apply automatic fixes to the CSV.
        
        Args:
            output_path: Path to write the fixed CSV
        
        Returns:
            True if fixes were applied, False otherwise
        """
        if self.df is None:
            print("ERROR: CSV not loaded, cannot fix")
            return False
        
        fixed_df = self.df.copy()
        fixes_applied = []
        
        # Fix 1: Normalize column names
        if self.column_mapping:
            rename_map = {orig: norm for orig, norm in self.column_mapping.items() if orig != norm}
            if rename_map:
                fixed_df = fixed_df.rename(columns=rename_map)
                fixes_applied.append(f"Renamed columns: {list(rename_map.keys())}")
        
        # Fix 2: Convert non-numeric values to 0
        qty_col = "Quantity" if "Quantity" in fixed_df.columns else self._get_column("Quantity")
        cost_col = "UnitCost" if "UnitCost" in fixed_df.columns else self._get_column("UnitCost")
        
        if qty_col and qty_col in fixed_df.columns:
            before_count = len(fixed_df)
            fixed_df[qty_col] = pd.to_numeric(fixed_df[qty_col], errors='coerce').fillna(0.0)
            fixes_applied.append(f"Converted {qty_col} to numeric (invalid values → 0)")
        
        if cost_col and cost_col in fixed_df.columns:
            fixed_df[cost_col] = pd.to_numeric(fixed_df[cost_col], errors='coerce').fillna(0.0)
            fixes_applied.append(f"Converted {cost_col} to numeric (invalid values → 0)")
        
        # Fix 3: Remove rows with empty required values
        required_cols = []
        for req in REQUIRED_COLUMNS:
            actual = self._get_column(req)
            if actual and actual in fixed_df.columns:
                required_cols.append(actual)
        
        if required_cols:
            before_count = len(fixed_df)
            for col in required_cols:
                fixed_df = fixed_df[fixed_df[col].notna() & (fixed_df[col].astype(str).str.strip() != "")]
            removed = before_count - len(fixed_df)
            if removed > 0:
                fixes_applied.append(f"Removed {removed} rows with empty required values")
        
        # Fix 4: Convert negative values to positive (for quantities)
        if qty_col and qty_col in fixed_df.columns:
            negative_count = (fixed_df[qty_col] < 0).sum()
            if negative_count > 0:
                fixed_df[qty_col] = fixed_df[qty_col].abs()
                fixes_applied.append(f"Converted {negative_count} negative quantities to positive")
        
        # Write fixed CSV
        try:
            fixed_df.to_csv(output_path, index=False)
            print(f"\n✅ Fixed CSV written to: {output_path}")
            print(f"\nFixes applied:")
            for fix in fixes_applied:
                print(f"  - {fix}")
            return True
        except Exception as e:
            print(f"\n❌ Failed to write fixed CSV: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description="Validate BOM CSV files for ECIR tool compatibility",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("csv_file", help="Path to CSV file to validate")
    parser.add_argument("--fix", help="Path to write fixed CSV (applies automatic fixes)")
    parser.add_argument("--quiet", action="store_true", help="Only show summary, not full report")
    
    args = parser.parse_args()
    
    csv_path = Path(args.csv_file)
    
    # Run validation
    validator = CSVValidator(csv_path)
    is_valid = validator.validate()
    
    # Print report
    if not args.quiet:
        print(validator.get_report())
    else:
        errors = sum(1 for i in validator.issues if i.severity == ValidationIssue.SEVERITY_ERROR)
        warnings = sum(1 for i in validator.issues if i.severity == ValidationIssue.SEVERITY_WARNING)
        if is_valid:
            print(f"✅ VALID ({warnings} warnings)")
        else:
            print(f"❌ INVALID ({errors} errors, {warnings} warnings)")
    
    # Apply fixes if requested
    if args.fix:
        fix_path = Path(args.fix)
        validator.fix(fix_path)
    
    # Exit code
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()
