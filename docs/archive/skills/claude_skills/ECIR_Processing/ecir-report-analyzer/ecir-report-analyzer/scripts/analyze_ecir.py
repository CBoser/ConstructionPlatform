#!/usr/bin/env python3
"""
ECIR Report Analyzer - Extract insights from ECIR Excel reports.

This script reads completed ECIR Excel workbooks and extracts key metrics,
patterns, and insights for analysis.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd


def load_ecir_report(path: Path) -> Dict[str, pd.DataFrame]:
    """
    Load all sheets from an ECIR Excel report.
    
    Args:
        path: Path to ECIR Excel file
    
    Returns:
        Dictionary mapping sheet names to DataFrames
    """
    if not path.exists():
        raise FileNotFoundError(f"ECIR report not found: {path}")
    
    try:
        sheets = pd.read_excel(path, sheet_name=None, engine='openpyxl')
        return sheets
    except Exception as e:
        raise ValueError(f"Error reading ECIR report '{path}': {e}")


def extract_header_metrics(header_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Extract key metrics from the Header sheet.
    
    Args:
        header_df: Header sheet DataFrame
    
    Returns:
        Dictionary of header metrics
    """
    if header_df.empty:
        return {}
    
    # Header sheet has one row with all metadata
    row = header_df.iloc[0]
    
    metrics = {
        'ecir_id': row.get('ECIR_ID', ''),
        'title': row.get('ECIR_Title', ''),
        'date_generated': row.get('Date_Generated', ''),
        'originator': row.get('Originator', ''),
        'status': row.get('Status', ''),
        'affected_models': row.get('Affected_Models', ''),
        'affected_categories': row.get('Affected_Categories', ''),
        'total_items': int(row.get('Total_Items', 0)),
        'changed_items': int(row.get('Changed_Items', 0)),
        'unchanged_items': int(row.get('Unchanged_Items', 0)),
        'change_reason': row.get('Change_Reason_Code', ''),
        'justification': row.get('Change_Justification_Narrative', ''),
        'plan_old': row.get('Plan_Set_ID_Old', ''),
        'plan_new': row.get('Plan_Set_ID_New', ''),
        'supplier_old': row.get('Supplier_Old', ''),
        'supplier_new': row.get('Supplier_New', ''),
        'overhead_pct': float(row.get('Overhead_Pct', 0)),
        'profit_pct': float(row.get('Profit_Pct', 0)),
        'direct_cost_old': float(row.get('Total_Direct_Old', 0)),
        'direct_cost_new': float(row.get('Total_Direct_New', 0)),
        'direct_variance_dollars': float(row.get('Total_Direct_Variance_$', 0)),
        'direct_variance_pct': float(row.get('Total_Direct_Variance_%', 0)),
        'total_with_op_old': float(row.get('Total_With_OP_Old', 0)),
        'total_with_op_new': float(row.get('Total_With_OP_New', 0)),
        'total_with_op_variance_dollars': float(row.get('Total_With_OP_Variance_$', 0)),
        'total_with_op_variance_pct': float(row.get('Total_With_OP_Variance_%', 0)),
    }
    
    return metrics


def analyze_status_distribution(detail_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze the distribution of change statuses.
    
    Args:
        detail_df: Detail sheet DataFrame
    
    Returns:
        Dictionary with status distribution and insights
    """
    if 'Item_Status' not in detail_df.columns:
        return {'error': 'Item_Status column not found'}
    
    status_counts = detail_df['Item_Status'].value_counts().to_dict()
    total = len(detail_df)
    
    # Calculate percentages
    status_pcts = {
        status: (count / total * 100) 
        for status, count in status_counts.items()
    }
    
    return {
        'counts': status_counts,
        'percentages': status_pcts,
        'total_items': total,
        'most_common_status': max(status_counts.items(), key=lambda x: x[1])[0],
    }


def analyze_category_impacts(summary_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze cost impacts by category.
    
    Args:
        summary_df: Summary sheet DataFrame
    
    Returns:
        Dictionary with category analysis
    """
    # Remove GRAND TOTAL row
    data = summary_df[summary_df['Category'] != 'GRAND TOTAL'].copy()
    
    if data.empty:
        return {'error': 'No category data found'}
    
    # Find categories with largest variance
    top_increases = data.nlargest(5, 'Direct_Variance_$')[
        ['Category', 'Direct_Variance_$', 'Direct_Variance_%']
    ].to_dict('records')
    
    top_decreases = data.nsmallest(5, 'Direct_Variance_$')[
        ['Category', 'Direct_Variance_$', 'Direct_Variance_%']
    ].to_dict('records')
    
    # Categories with most items
    top_item_counts = data.nlargest(5, 'Item_Count')[
        ['Category', 'Item_Count']
    ].to_dict('records')
    
    return {
        'top_cost_increases': top_increases,
        'top_cost_decreases': top_decreases,
        'categories_with_most_items': top_item_counts,
        'total_categories': len(data),
    }


def identify_outliers(detail_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Identify items with unusually large variances.
    
    Args:
        detail_df: Detail sheet DataFrame
    
    Returns:
        Dictionary with outlier information
    """
    # Only look at changed items
    changed = detail_df[detail_df['Item_Status'] != 'Unchanged'].copy()
    
    if changed.empty:
        return {'outliers': []}
    
    # Find top variance items by absolute dollar amount
    top_dollar_variance = changed.nlargest(10, 'Cost_Variance_$')[
        ['UIK', 'Category', 'Item_Status', 'Cost_Variance_$', 'Cost_Variance_%']
    ].to_dict('records')
    
    # Find items with very high percentage variance (excluding infinity)
    finite_variance = changed[
        (changed['Cost_Variance_%'].notna()) & 
        (changed['Cost_Variance_%'] != float('inf'))
    ].copy()
    
    if not finite_variance.empty:
        top_pct_variance = finite_variance.nlargest(10, 'Cost_Variance_%')[
            ['UIK', 'Category', 'Item_Status', 'Cost_Variance_$', 'Cost_Variance_%']
        ].to_dict('records')
    else:
        top_pct_variance = []
    
    return {
        'top_dollar_variances': top_dollar_variance,
        'top_percentage_variances': top_pct_variance,
    }


def generate_insights(analysis: Dict[str, Any]) -> List[str]:
    """
    Generate human-readable insights from analysis.
    
    Args:
        analysis: Complete analysis dictionary
    
    Returns:
        List of insight strings
    """
    insights = []
    
    header = analysis.get('header_metrics', {})
    status_dist = analysis.get('status_distribution', {})
    categories = analysis.get('category_impacts', {})
    
    # Overall impact insight
    if header:
        variance_pct = header.get('direct_variance_pct', 0)
        variance_dollars = header.get('direct_variance_dollars', 0)
        
        if abs(variance_pct) > 5:
            direction = "increased" if variance_pct > 0 else "decreased"
            insights.append(
                f"⚠️ Major cost impact: Direct costs {direction} by "
                f"{abs(variance_pct):.1f}% (${abs(variance_dollars):,.2f})"
            )
        else:
            insights.append(
                f"✓ Minor cost impact: Direct costs changed by {variance_pct:.1f}%"
            )
    
    # Status distribution insights
    if status_dist:
        pcts = status_dist.get('percentages', {})
        
        if pcts.get('Modified-Spec', 0) > 30:
            insights.append(
                f"📝 High specification change rate: "
                f"{pcts['Modified-Spec']:.1f}% of items had spec changes (substitutions)"
            )
        
        if pcts.get('Added', 0) > 20:
            insights.append(
                f"➕ Significant scope increase: "
                f"{pcts['Added']:.1f}% of items were added"
            )
        
        if pcts.get('Deleted', 0) > 20:
            insights.append(
                f"➖ Significant scope reduction: "
                f"{pcts['Deleted']:.1f}% of items were deleted"
            )
    
    # Category insights
    if categories:
        top_increases = categories.get('top_cost_increases', [])
        if top_increases:
            top = top_increases[0]
            insights.append(
                f"📊 Largest cost increase in {top['Category']}: "
                f"${top['Direct_Variance_$']:,.2f} ({top['Direct_Variance_%']:.1f}%)"
            )
    
    # Change reason insight
    if header:
        reason = header.get('change_reason', '')
        if reason and reason != '':
            insights.append(f"🔍 Change reason: {reason}")
    
    return insights


def analyze_ecir(path: Path, output_format: str = 'json') -> str:
    """
    Perform complete analysis of an ECIR report.
    
    Args:
        path: Path to ECIR Excel file
        output_format: Output format ('json' or 'text')
    
    Returns:
        Formatted analysis string
    """
    # Load ECIR report
    sheets = load_ecir_report(path)
    
    # Validate expected sheets exist
    expected_sheets = ['Header', 'Summary', 'Detail_All']
    missing = [s for s in expected_sheets if s not in sheets]
    if missing:
        raise ValueError(f"ECIR report missing expected sheets: {missing}")
    
    # Extract analysis from each component
    analysis = {
        'file_path': str(path),
        'file_name': path.name,
        'header_metrics': extract_header_metrics(sheets['Header']),
        'status_distribution': analyze_status_distribution(sheets['Detail_All']),
        'category_impacts': analyze_category_impacts(sheets['Summary']),
        'outliers': identify_outliers(sheets['Detail_All']),
    }
    
    # Generate insights
    analysis['insights'] = generate_insights(analysis)
    
    # Format output
    if output_format == 'json':
        return json.dumps(analysis, indent=2, default=str)
    else:
        # Text format
        lines = [
            "=" * 70,
            f"ECIR ANALYSIS: {analysis['header_metrics']['ecir_id']}",
            "=" * 70,
            "",
            f"Title: {analysis['header_metrics']['title']}",
            f"Date: {analysis['header_metrics']['date_generated']}",
            f"Originator: {analysis['header_metrics']['originator']}",
            f"Status: {analysis['header_metrics']['status']}",
            "",
            "INSIGHTS:",
            "-" * 70,
        ]
        
        for insight in analysis['insights']:
            lines.append(f"  {insight}")
        
        lines.extend([
            "",
            "COST SUMMARY:",
            "-" * 70,
            f"  Direct Cost (Old): ${analysis['header_metrics']['direct_cost_old']:,.2f}",
            f"  Direct Cost (New): ${analysis['header_metrics']['direct_cost_new']:,.2f}",
            f"  Variance: ${analysis['header_metrics']['direct_variance_dollars']:,.2f} "
            f"({analysis['header_metrics']['direct_variance_pct']:.2f}%)",
            "",
            f"  Total with O&P (Old): ${analysis['header_metrics']['total_with_op_old']:,.2f}",
            f"  Total with O&P (New): ${analysis['header_metrics']['total_with_op_new']:,.2f}",
            f"  Variance: ${analysis['header_metrics']['total_with_op_variance_dollars']:,.2f} "
            f"({analysis['header_metrics']['total_with_op_variance_pct']:.2f}%)",
            "",
            "CHANGE DISTRIBUTION:",
            "-" * 70,
        ])
        
        status_dist = analysis['status_distribution']
        for status, count in status_dist['counts'].items():
            pct = status_dist['percentages'][status]
            lines.append(f"  {status:20s}: {count:4d} ({pct:5.1f}%)")
        
        lines.extend([
            "",
            "TOP COST IMPACTS BY CATEGORY:",
            "-" * 70,
        ])
        
        for cat in analysis['category_impacts']['top_cost_increases'][:3]:
            lines.append(
                f"  {cat['Category']:30s}: ${cat['Direct_Variance_$']:>12,.2f} "
                f"({cat['Direct_Variance_%']:>6.1f}%)"
            )
        
        lines.append("")
        lines.append("=" * 70)
        
        return "\n".join(lines)


def main():
    """Main entry point for ECIR analyzer CLI."""
    parser = argparse.ArgumentParser(
        description="Analyze ECIR Excel reports and extract insights"
    )
    parser.add_argument(
        'ecir_file',
        type=Path,
        help='Path to ECIR Excel file (.xlsx)'
    )
    parser.add_argument(
        '--format',
        choices=['json', 'text'],
        default='text',
        help='Output format (default: text)'
    )
    parser.add_argument(
        '--output',
        type=Path,
        help='Output file path (default: print to stdout)'
    )
    
    args = parser.parse_args()
    
    try:
        # Analyze ECIR
        result = analyze_ecir(args.ecir_file, args.format)
        
        # Output results
        if args.output:
            args.output.write_text(result)
            print(f"Analysis saved to: {args.output}")
        else:
            print(result)
        
        return 0
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    import sys
    sys.exit(main())
