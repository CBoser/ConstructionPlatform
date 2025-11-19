#!/usr/bin/env python3
"""
Advanced Engineering Change Impact Report (ECIR) generator.

This script extends the basic ECIR tool by incorporating additional
features inspired by industry best practices and the architectural
blueprint for a standardized ECIR system. Key enhancements include:

* Creation of a Unique Item Key (UIK) for reliable merging of "before"
  and "after" material lists, even when items are re‑ordered or added.
* Capture of header/metadata information such as ECIR ID, title,
  originator, change reason, affected plans and suppliers, and schedule
  impact. These fields are stored in a dedicated header sheet in the
  output workbook.
* Classification of item status (Added, Deleted, Modified-Qty,
  Modified-Cost, Modified-Spec, Unchanged) to aid quick analysis.
* Calculation of indirect costs (overhead and profit) as percentages
  applied to direct costs, with optional user‑defined rates.
* Optional inclusion of schedule impact in the header metadata.
* Generation of summary and detail sheets that clearly separate direct
  and indirect cost variances by category.

Usage:
    python ecir_advanced.py --before BEFORE.csv --after AFTER.csv \
        --output report.xlsx [options]

Required arguments:
    --before        Path to the original (before) materials CSV.
    --after         Path to the revised (after) materials CSV.
    --output        Path to the output Excel workbook.

Optional metadata arguments:
    --ecir-id       Unique identifier for the report (e.g., ECIR-2024-045).
    --title         Concise title describing the change.
    --originator    Person or department creating the report.
    --reason        Brief reason code or narrative (e.g., Supplier_Change).
    --plan-old      Identifier for the original plan set.
    --plan-new      Identifier for the revised plan set.
    --supplier-old  Name of the previous supplier.
    --supplier-new  Name of the new supplier.
    --schedule      Schedule impact (text or number of days).

Optional cost model arguments:
    --overhead-pct  Overhead percentage applied to direct costs (e.g., 0.20).
    --profit-pct    Profit percentage applied to (cost + overhead)
                    (e.g., 0.10).

Input file format:
    Both "before" and "after" CSVs should contain at least the following
    columns:
        Category        : Major grouping (e.g. "Glulams", "Hardware").
        Item            : Description or part identifier.
        Quantity        : Numeric quantity.
        UnitCost        : Unit cost (numeric).
    Optional columns (if present) will be used:
        EngineeringNote : Free text referencing plan sheets/details (e.g., "S3.2").
        Description     : A more verbose description of the item (if Item is
                          a code or part number).
        EngRef          : Alternate column name for engineering reference.

Outputs:
    The script writes an Excel workbook containing three sheets:

    1. Header: Lists all supplied metadata fields, total cost before and
       after (direct and indirect), total variance, and schedule impact.
    2. Summary: Aggregates direct and indirect cost impacts by category.
    3. Detail: Item-level comparison with UIK, status classification,
       description changes, quantity/cost variances, overhead/profit
       calculations, and engineering references.

Note:
    The UIK generated here defaults to the combination of Category and
    Item. For more robust identification (e.g. location-aware keys),
    customise the `_create_uik` function.
"""

import argparse
import datetime
import pandas as pd
from typing import Optional, Tuple


def _create_uik(category: str, item: str) -> str:
    """Generate a Unique Item Key (UIK) from category and item.

    This function can be customised to include additional fields such as
    location, model name, or assembly codes. For a simple prototype,
    concatenating the category and item ensures uniqueness within the
    dataset provided both CSVs use consistent naming.
    """
    return f"{category.strip()}::{item.strip()}"


def load_materials(csv_path: str, suffix: str) -> pd.DataFrame:
    """Load a materials CSV and prepare it for merging.

    Adds computed columns and renames to avoid collisions. Creates
    Quantity, UnitCost, Description, EngineeringReference fields as
    needed. Calculates TotalCost for direct cost (Quantity * UnitCost).
    Computes Overhead and Profit for indirect costs.
    """
    df = pd.read_csv(csv_path)
    # Normalise column names for flexibility
    cols = {c.lower(): c for c in df.columns}
    # Required fields
    category_col = cols.get("category")
    item_col = cols.get("item")
    qty_col = cols.get("quantity")
    unit_cost_col = cols.get("unitcost")
    if not all([category_col, item_col, qty_col, unit_cost_col]):
        raise ValueError(
            f"Input file {csv_path} must contain Category, Item, Quantity, and UnitCost columns."
        )
    # Optional fields
    eng_note_col = cols.get("engineeringnote") or cols.get("engref") or None
    descr_col = cols.get("description") or None
    # Create working DataFrame
    mat = pd.DataFrame()
    mat["Category"] = df[category_col].astype(str)
    mat["Item"] = df[item_col].astype(str)
    mat["Quantity"] = pd.to_numeric(df[qty_col], errors="coerce").fillna(0.0)
    mat["UnitCost"] = pd.to_numeric(df[unit_cost_col], errors="coerce").fillna(0.0)
    mat["Description"] = df[descr_col].astype(str) if descr_col else mat["Item"]
    if eng_note_col:
        mat["EngRef"] = df[eng_note_col].astype(str)
    else:
        mat["EngRef"] = ""
    # Compute UIK
    mat["UIK"] = mat.apply(lambda row: _create_uik(row["Category"], row["Item"]), axis=1)
    # Compute direct TotalCost
    mat["TotalCost"] = mat["Quantity"] * mat["UnitCost"]
    # Append suffix to numerical columns for merging later
    rename_cols = {
        "Quantity": f"Quantity_{suffix}",
        "UnitCost": f"UnitCost_{suffix}",
        "TotalCost": f"TotalCost_{suffix}",
        "Description": f"Description_{suffix}",
        "EngRef": f"EngRef_{suffix}",
    }
    return mat.rename(columns=rename_cols)


def compute_indirect_costs(total_cost: float, overhead_pct: float, profit_pct: float) -> Tuple[float, float, float]:
    """Given a direct cost, compute overhead, profit, and total cost with overhead and profit.

    Overhead is calculated as total_cost * overhead_pct.
    Profit is calculated on cost plus overhead: (total_cost + overhead) * profit_pct.
    Returns (overhead, profit, total_with_oh_profit).
    """
    overhead = total_cost * overhead_pct
    profit = (total_cost + overhead) * profit_pct
    total = total_cost + overhead + profit
    return overhead, profit, total


def classify_item(
    qty_old: float,
    qty_new: float,
    desc_old: str,
    desc_new: str,
    unit_old: float,
    unit_new: float,
) -> str:
    """Determine the status of an item based on quantity, description, and cost changes."""
    if pd.isna(qty_old) or qty_old == 0:
        if pd.notna(qty_new) and qty_new > 0:
            return "Added"
    if pd.isna(qty_new) or qty_new == 0:
        if pd.notna(qty_old) and qty_old > 0:
            return "Deleted"
    if desc_old != desc_new:
        return "Modified-Spec"
    if qty_old != qty_new:
        return "Modified-Qty"
    if unit_old != unit_new:
        return "Modified-Cost"
    return "Unchanged"


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Advanced ECIR generator with metadata and indirect cost calculations"
    )
    parser.add_argument("--before", required=True, help="Original (before) materials CSV file")
    parser.add_argument("--after", required=True, help="Revised (after) materials CSV file")
    parser.add_argument("--output", required=True, help="Output Excel file path")
    # Metadata options
    parser.add_argument("--ecir-id", default="", help="ECIR unique identifier")
    parser.add_argument("--title", default="", help="Report title/description")
    parser.add_argument("--originator", default="", help="Name of report originator")
    parser.add_argument("--reason", default="", help="Reason for change")
    parser.add_argument("--plan-old", default="", help="Identifier of original plan set")
    parser.add_argument("--plan-new", default="", help="Identifier of revised plan set")
    parser.add_argument("--supplier-old", default="", help="Name of old supplier")
    parser.add_argument("--supplier-new", default="", help="Name of new supplier")
    parser.add_argument("--schedule", default="", help="Schedule impact (e.g., '+2 days' or 'No impact')")
    # Cost model options
    parser.add_argument("--overhead-pct", type=float, default=0.0, help="Overhead percentage (e.g., 0.20 for 20%)")
    parser.add_argument("--profit-pct", type=float, default=0.0, help="Profit percentage (e.g., 0.10 for 10%)")
    return parser.parse_args()


def generate_ecir(
    before_path: str,
    after_path: str,
    output_path: str,
    metadata: dict,
    overhead_pct: float,
    profit_pct: float,
) -> None:
    """Generate the advanced ECIR and save it to an Excel workbook."""
    # Load materials
    before_df = load_materials(before_path, "Old")
    after_df = load_materials(after_path, "New")
    # Merge on UIK
    merged = pd.merge(before_df, after_df, on=["UIK", "Category"], how="outer")
    # Fill NaNs for numeric columns
    num_cols = [
        "Quantity_Old",
        "Quantity_New",
        "UnitCost_Old",
        "UnitCost_New",
        "TotalCost_Old",
        "TotalCost_New",
    ]
    for col in num_cols:
        if col in merged.columns:
            merged[col] = pd.to_numeric(merged[col], errors="coerce").fillna(0.0)
    # Fill textual columns with empty strings
    text_cols = ["Description_Old", "Description_New", "EngRef_Old", "EngRef_New"]
    for col in text_cols:
        if col in merged.columns:
            merged[col] = merged[col].fillna("")
    # Compute variances
    merged["Quantity_Variance"] = merged["Quantity_New"] - merged["Quantity_Old"]
    merged["UnitCost_Variance"] = merged["UnitCost_New"] - merged["UnitCost_Old"]
    merged["DirectCost_Variance"] = merged["TotalCost_New"] - merged["TotalCost_Old"]
    # Compute percentage variances safely
    merged["Quantity_Variance_pct"] = merged.apply(
        lambda row: 0.0
        if row["Quantity_Old"] == 0
        else row["Quantity_Variance"] / row["Quantity_Old"],
        axis=1,
    )
    merged["DirectCost_Variance_pct"] = merged.apply(
        lambda row: 0.0
        if row["TotalCost_Old"] == 0
        else row["DirectCost_Variance"] / row["TotalCost_Old"],
        axis=1,
    )
    # Classify item status
    merged["Item_Status"] = merged.apply(
        lambda row: classify_item(
            row["Quantity_Old"],
            row["Quantity_New"],
            row["Description_Old"],
            row["Description_New"],
            row["UnitCost_Old"],
            row["UnitCost_New"],
        ),
        axis=1,
    )
    # Compute indirect costs and totals for Old and New
    def apply_indirect(total_cost: float) -> Tuple[float, float, float]:
        return compute_indirect_costs(total_cost, overhead_pct, profit_pct)
    merged[["Overhead_Old", "Profit_Old", "TotalCostWithOH_Profit_Old"]] = merged[
        ["TotalCost_Old"]
    ].apply(lambda x: apply_indirect(x.iloc[0]), result_type="expand", axis=1)
    merged[["Overhead_New", "Profit_New", "TotalCostWithOH_Profit_New"]] = merged[
        ["TotalCost_New"]
    ].apply(lambda x: apply_indirect(x.iloc[0]), result_type="expand", axis=1)
    # Compute indirect variances
    merged["Overhead_Variance"] = merged["Overhead_New"] - merged["Overhead_Old"]
    merged["Profit_Variance"] = merged["Profit_New"] - merged["Profit_Old"]
    merged["IndirectCost_Variance"] = merged["Overhead_Variance"] + merged["Profit_Variance"]
    merged["TotalCostWithOH_Profit_Variance"] = merged[
        "TotalCostWithOH_Profit_New"
    ] - merged["TotalCostWithOH_Profit_Old"]
    # Summary by category
    summary = (
        merged.groupby("Category")
        .agg(
            DirectCost_Old=("TotalCost_Old", "sum"),
            DirectCost_New=("TotalCost_New", "sum"),
            DirectCost_Variance=("DirectCost_Variance", "sum"),
            Overhead_Old=("Overhead_Old", "sum"),
            Overhead_New=("Overhead_New", "sum"),
            Overhead_Variance=("Overhead_Variance", "sum"),
            Profit_Old=("Profit_Old", "sum"),
            Profit_New=("Profit_New", "sum"),
            Profit_Variance=("Profit_Variance", "sum"),
            IndirectCost_Variance=("IndirectCost_Variance", "sum"),
            Total_Old=("TotalCostWithOH_Profit_Old", "sum"),
            Total_New=("TotalCostWithOH_Profit_New", "sum"),
            Total_Variance=("TotalCostWithOH_Profit_Variance", "sum"),
        )
        .reset_index()
    )
    # Compute summary percentages safely
    summary["DirectCost_Variance_pct"] = summary.apply(
        lambda row: 0.0
        if row["DirectCost_Old"] == 0
        else row["DirectCost_Variance"] / row["DirectCost_Old"],
        axis=1,
    )
    summary["Total_Variance_pct"] = summary.apply(
        lambda row: 0.0
        if row["Total_Old"] == 0
        else row["Total_Variance"] / row["Total_Old"],
        axis=1,
    )
    # Overall totals for header
    direct_old_total = merged["TotalCost_Old"].sum()
    direct_new_total = merged["TotalCost_New"].sum()
    direct_variance_total = merged["DirectCost_Variance"].sum()
    overhead_old_total = merged["Overhead_Old"].sum()
    overhead_new_total = merged["Overhead_New"].sum()
    overhead_variance_total = merged["Overhead_Variance"].sum()
    profit_old_total = merged["Profit_Old"].sum()
    profit_new_total = merged["Profit_New"].sum()
    profit_variance_total = merged["Profit_Variance"].sum()
    total_old = merged["TotalCostWithOH_Profit_Old"].sum()
    total_new = merged["TotalCostWithOH_Profit_New"].sum()
    total_variance = merged["TotalCostWithOH_Profit_Variance"].sum()
    # Populate header DataFrame
    header_keys = [
        "ECIR_ID",
        "Title",
        "DateGenerated",
        "Originator",
        "Reason",
        "Plan_Set_Old",
        "Plan_Set_New",
        "Supplier_Old",
        "Supplier_New",
        "Overhead_Pct",
        "Profit_Pct",
        "DirectCost_Old",
        "DirectCost_New",
        "DirectCost_Variance",
        "Overhead_Old",
        "Overhead_New",
        "Overhead_Variance",
        "Profit_Old",
        "Profit_New",
        "Profit_Variance",
        "TotalCost_Old",
        "TotalCost_New",
        "TotalCost_Variance",
        "ScheduleImpact",
    ]
    header_values = [
        metadata.get("ecir_id", ""),
        metadata.get("title", ""),
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        metadata.get("originator", ""),
        metadata.get("reason", ""),
        metadata.get("plan_old", ""),
        metadata.get("plan_new", ""),
        metadata.get("supplier_old", ""),
        metadata.get("supplier_new", ""),
        overhead_pct,
        profit_pct,
        direct_old_total,
        direct_new_total,
        direct_variance_total,
        overhead_old_total,
        overhead_new_total,
        overhead_variance_total,
        profit_old_total,
        profit_new_total,
        profit_variance_total,
        total_old,
        total_new,
        total_variance,
        metadata.get("schedule", ""),
    ]
    header_df = pd.DataFrame({"Field": header_keys, "Value": header_values})
    # Write to Excel
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        header_df.to_excel(writer, sheet_name="Header", index=False)
        summary.to_excel(writer, sheet_name="Summary", index=False)
        # Order detail columns for clarity
        detail_cols = [
            "UIK",
            "Category",
            "Item_Status",
            "Description_Old",
            "Description_New",
            "EngRef_Old",
            "EngRef_New",
            "Quantity_Old",
            "Quantity_New",
            "Quantity_Variance",
            "Quantity_Variance_pct",
            "UnitCost_Old",
            "UnitCost_New",
            "UnitCost_Variance",
            "TotalCost_Old",
            "TotalCost_New",
            "DirectCost_Variance",
            "DirectCost_Variance_pct",
            "Overhead_Old",
            "Overhead_New",
            "Overhead_Variance",
            "Profit_Old",
            "Profit_New",
            "Profit_Variance",
            "IndirectCost_Variance",
            "TotalCostWithOH_Profit_Old",
            "TotalCostWithOH_Profit_New",
            "TotalCostWithOH_Profit_Variance",
        ]
        # Ensure all columns exist even if optional fields are missing
        for col in detail_cols:
            if col not in merged.columns:
                merged[col] = "" if merged[col].dtype == object else 0
        merged[detail_cols].to_excel(writer, sheet_name="Detail", index=False)


def main() -> None:
    args = parse_args()
    metadata = {
        "ecir_id": args.ecir_id,
        "title": args.title,
        "originator": args.originator,
        "reason": args.reason,
        "plan_old": args.plan_old,
        "plan_new": args.plan_new,
        "supplier_old": args.supplier_old,
        "supplier_new": args.supplier_new,
        "schedule": args.schedule,
    }
    generate_ecir(
        before_path=args.before,
        after_path=args.after,
        output_path=args.output,
        metadata=metadata,
        overhead_pct=args.overhead_pct,
        profit_pct=args.profit_pct,
    )
    print(f"Advanced ECIR written to {args.output}")


if __name__ == "__main__":
    main()