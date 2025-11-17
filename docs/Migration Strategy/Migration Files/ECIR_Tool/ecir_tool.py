#!/usr/bin/env python3
"""
Engineering Change Impact Report (ECIR) generator.

This script compares two bill‑of‑materials (BOM) CSV files—representing
"before" and "after" engineering revisions—and produces an Excel report
summarizing material quantity and cost variances. It computes total cost
changes and percentage differences by item and category and supports
attaching engineering notes for each item.

Usage:
    python ecir_tool.py --before before.csv --after after.csv --output report.xlsx

CSV input format:
    Each CSV file should contain the following columns:
        Category      : Broad category (e.g., glulams, hardware, strapping)
        Item          : Description of the material or hardware
        Quantity      : Numeric quantity of the item
        UnitCost      : Unit cost of the item (numeric)
        EngineeringNote (optional): Text note referencing plan sheet or detail

The script aligns items by Category and Item. If an item is only present
in one file, it treats the missing quantity and cost as zero. It then
computes variances in quantity, unit cost, and total cost, along with
percentage changes relative to the "before" values. A summary table
aggregates cost impacts by category for high‑level review.

Outputs:
    An Excel workbook with two sheets:
        Detailed  – line‑by‑line comparison of items with variances and notes.
        Summary   – cost impact summarized by category.

This script is designed for quick prototyping and can be integrated into
larger workflows or automated pipelines.
"""

import argparse
import pandas as pd


def parse_args() -> argparse.Namespace:
    """Parse command‑line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate an Engineering Change Impact Report by comparing two BOM CSV files."
    )
    parser.add_argument(
        "--before",
        required=True,
        help="Path to CSV file representing the original (before) materials list.",
    )
    parser.add_argument(
        "--after",
        required=True,
        help="Path to CSV file representing the revised (after) materials list.",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Path to Excel file (.xlsx) to write the ECIR report.",
    )
    return parser.parse_args()


def load_bom(csv_path: str, suffix: str) -> pd.DataFrame:
    """Read a BOM CSV and prepare it with suffixes for merging.

    Adds TotalCost = Quantity * UnitCost and renames columns with the suffix.
    """
    df = pd.read_csv(csv_path)
    # Ensure expected columns exist
    expected_cols = ["Category", "Item", "Quantity", "UnitCost"]
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column '{col}' in {csv_path}")
    # Compute total cost
    df["TotalCost"] = df["Quantity"] * df["UnitCost"]
    # Optionally keep engineering note
    if "EngineeringNote" not in df.columns:
        df["EngineeringNote"] = ""
    # Rename columns (except category/item) with suffix for merging
    rename_cols = {
        "Quantity": f"Quantity_{suffix}",
        "UnitCost": f"UnitCost_{suffix}",
        "TotalCost": f"TotalCost_{suffix}",
        "EngineeringNote": f"EngineeringNote_{suffix}",
    }
    df = df.rename(columns=rename_cols)
    return df


def generate_report(before_path: str, after_path: str, output_path: str) -> None:
    """Generate the ECIR report from before and after BOMs."""
    # Load the BOMs
    before_df = load_bom(before_path, "Before")
    after_df = load_bom(after_path, "After")
    # Merge on Category and Item
    merged = pd.merge(
        before_df,
        after_df,
        on=["Category", "Item"],
        how="outer",
    )
    # Fill missing values with zeros or empty strings
    for col in [
        "Quantity_Before",
        "UnitCost_Before",
        "TotalCost_Before",
        "Quantity_After",
        "UnitCost_After",
        "TotalCost_After",
    ]:
        if col in merged.columns:
            merged[col] = merged[col].fillna(0)
    for note_col in ["EngineeringNote_Before", "EngineeringNote_After"]:
        if note_col in merged.columns:
            merged[note_col] = merged[note_col].fillna("")
    # Compute variances
    merged["Quantity_Variance"] = merged["Quantity_After"] - merged["Quantity_Before"]
    merged["UnitCost_Variance"] = merged["UnitCost_After"] - merged["UnitCost_Before"]
    merged["Cost_Variance"] = merged["TotalCost_After"] - merged["TotalCost_Before"]
    # Percentage variances; avoid division by zero
    def safe_pct(numer, denom):
        return 0.0 if denom == 0 else numer / denom
    merged["Quantity_Variance_pct"] = merged.apply(
        lambda row: safe_pct(row["Quantity_Variance"], row["Quantity_Before"]), axis=1
    )
    merged["Cost_Variance_pct"] = merged.apply(
        lambda row: safe_pct(row["Cost_Variance"], row["TotalCost_Before"]), axis=1
    )
    # Consolidate engineering notes (show after note if exists, else before)
    merged["EngineeringReference"] = merged.apply(
        lambda row: row["EngineeringNote_After"]
        if row["EngineeringNote_After"]
        else row["EngineeringNote_Before"],
        axis=1,
    )
    # Sort by category and item for readability
    merged = merged.sort_values(["Category", "Item"]).reset_index(drop=True)
    # Prepare summary by category
    summary = (
        merged.groupby("Category")
        .agg(
            TotalCost_Before=("TotalCost_Before", "sum"),
            TotalCost_After=("TotalCost_After", "sum"),
            Cost_Variance=("Cost_Variance", "sum"),
        )
        .reset_index()
    )
    summary["Cost_Variance_pct"] = summary.apply(
        lambda row: safe_pct(row["Cost_Variance"], row["TotalCost_Before"]), axis=1
    )
    # Write to Excel
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        # Detailed sheet
        cols_order = [
            "Category",
            "Item",
            "Quantity_Before",
            "Quantity_After",
            "Quantity_Variance",
            "Quantity_Variance_pct",
            "UnitCost_Before",
            "UnitCost_After",
            "UnitCost_Variance",
            "TotalCost_Before",
            "TotalCost_After",
            "Cost_Variance",
            "Cost_Variance_pct",
            "EngineeringReference",
        ]
        merged[cols_order].to_excel(writer, sheet_name="Detailed", index=False)
        # Summary sheet
        summary_cols = [
            "Category",
            "TotalCost_Before",
            "TotalCost_After",
            "Cost_Variance",
            "Cost_Variance_pct",
        ]
        summary[summary_cols].to_excel(writer, sheet_name="Summary", index=False)
    print(f"Report written to {output_path}")


def main() -> None:
    args = parse_args()
    generate_report(args.before, args.after, args.output)


if __name__ == "__main__":
    main()