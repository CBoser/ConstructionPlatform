#!/usr/bin/env python3
"""
ECIR Trend Analyzer - Compare multiple ECIR reports to identify patterns.

This script analyzes a collection of ECIR reports to find trends over time,
common change patterns, and variance patterns.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import pandas as pd


def load_multiple_ecirs(paths: List[Path]) -> List[Dict[str, Any]]:
    """
    Load and analyze multiple ECIR reports.
    
    Args:
        paths: List of paths to ECIR Excel files
    
    Returns:
        List of analysis dictionaries
    """
    from analyze_ecir import load_ecir_report, extract_header_metrics
    
    results = []
    for path in paths:
        try:
            sheets = load_ecir_report(path)
            metrics = extract_header_metrics(sheets['Header'])
            
            # Add summary stats
            detail = sheets.get('Detail_All', pd.DataFrame())
            if not detail.empty and 'Item_Status' in detail.columns:
                status_counts = detail['Item_Status'].value_counts().to_dict()
            else:
                status_counts = {}
            
            results.append({
                'file': path.name,
                'path': str(path),
                'metrics': metrics,
                'status_counts': status_counts,
            })
        except Exception as e:
            print(f"Warning: Could not load {path}: {e}")
    
    return results


def analyze_trends(ecirs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze trends across multiple ECIRs.
    
    Args:
        ecirs: List of ECIR analysis dictionaries
    
    Returns:
        Dictionary with trend analysis
    """
    if not ecirs:
        return {}
    
    # Sort by date if available
    dated_ecirs = []
    for ecir in ecirs:
        date_str = ecir['metrics'].get('date_generated', '')
        if date_str:
            try:
                # Try to parse date
                date = pd.to_datetime(date_str)
                dated_ecirs.append((date, ecir))
            except:
                dated_ecirs.append((None, ecir))
        else:
            dated_ecirs.append((None, ecir))
    
    # Sort by date (None dates go to end)
    dated_ecirs.sort(key=lambda x: x[0] if x[0] is not None else datetime.max)
    sorted_ecirs = [e for _, e in dated_ecirs]
    
    # Calculate aggregate statistics
    total_ecirs = len(sorted_ecirs)
    
    # Cost variance statistics
    variances = [e['metrics']['direct_variance_dollars'] for e in sorted_ecirs 
                 if 'direct_variance_dollars' in e['metrics']]
    
    variance_pcts = [e['metrics']['direct_variance_pct'] for e in sorted_ecirs 
                     if 'direct_variance_pct' in e['metrics']]
    
    # Change reason frequency
    reasons = [e['metrics'].get('change_reason', '') for e in sorted_ecirs]
    reason_counts = pd.Series(reasons).value_counts().to_dict()
    
    # Status distribution across all ECIRs
    all_status_counts = {}
    for ecir in sorted_ecirs:
        for status, count in ecir.get('status_counts', {}).items():
            all_status_counts[status] = all_status_counts.get(status, 0) + count
    
    # Supplier changes
    supplier_changes = []
    for ecir in sorted_ecirs:
        old = ecir['metrics'].get('supplier_old', '')
        new = ecir['metrics'].get('supplier_new', '')
        if old and new and old != new:
            supplier_changes.append({
                'ecir_id': ecir['metrics'].get('ecir_id', ''),
                'from': old,
                'to': new,
            })
    
    # Models affected
    all_models = set()
    for ecir in sorted_ecirs:
        models_str = ecir['metrics'].get('affected_models', '')
        if models_str:
            models = [m.strip() for m in models_str.split(';')]
            all_models.update(models)
    
    return {
        'total_ecirs': total_ecirs,
        'date_range': {
            'earliest': str(dated_ecirs[0][0]) if dated_ecirs[0][0] else 'Unknown',
            'latest': str(dated_ecirs[-1][0]) if dated_ecirs[-1][0] else 'Unknown',
        },
        'cost_variance_stats': {
            'mean_dollars': sum(variances) / len(variances) if variances else 0,
            'median_dollars': sorted(variances)[len(variances)//2] if variances else 0,
            'min_dollars': min(variances) if variances else 0,
            'max_dollars': max(variances) if variances else 0,
            'mean_pct': sum(variance_pcts) / len(variance_pcts) if variance_pcts else 0,
        },
        'change_reasons': reason_counts,
        'status_distribution_aggregate': all_status_counts,
        'supplier_changes': supplier_changes,
        'unique_models_affected': list(all_models),
        'ecirs_chronological': [
            {
                'ecir_id': e['metrics'].get('ecir_id', ''),
                'date': e['metrics'].get('date_generated', ''),
                'variance_dollars': e['metrics'].get('direct_variance_dollars', 0),
                'variance_pct': e['metrics'].get('direct_variance_pct', 0),
            }
            for e in sorted_ecirs
        ],
    }


def identify_patterns(ecirs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Identify common patterns across ECIRs.
    
    Args:
        ecirs: List of ECIR analysis dictionaries
    
    Returns:
        Dictionary with identified patterns
    """
    patterns = {
        'high_variance_ecirs': [],
        'common_change_types': {},
        'recurring_suppliers': {},
    }
    
    # Find ECIRs with high variance (>5%)
    for ecir in ecirs:
        variance_pct = abs(ecir['metrics'].get('direct_variance_pct', 0))
        if variance_pct > 5:
            patterns['high_variance_ecirs'].append({
                'ecir_id': ecir['metrics'].get('ecir_id', ''),
                'variance_pct': variance_pct,
                'variance_dollars': ecir['metrics'].get('direct_variance_dollars', 0),
                'reason': ecir['metrics'].get('change_reason', ''),
            })
    
    # Aggregate status types to find most common
    status_totals = {}
    for ecir in ecirs:
        for status, count in ecir.get('status_counts', {}).items():
            status_totals[status] = status_totals.get(status, 0) + count
    
    if status_totals:
        total_changes = sum(status_totals.values())
        patterns['common_change_types'] = {
            status: {
                'count': count,
                'percentage': (count / total_changes * 100) if total_changes > 0 else 0
            }
            for status, count in sorted(status_totals.items(), 
                                       key=lambda x: x[1], 
                                       reverse=True)
        }
    
    # Track supplier changes
    for ecir in ecirs:
        new_supplier = ecir['metrics'].get('supplier_new', '')
        if new_supplier:
            if new_supplier not in patterns['recurring_suppliers']:
                patterns['recurring_suppliers'][new_supplier] = 0
            patterns['recurring_suppliers'][new_supplier] += 1
    
    return patterns


def generate_trend_report(trends: Dict[str, Any], patterns: Dict[str, Any]) -> str:
    """
    Generate human-readable trend report.
    
    Args:
        trends: Trend analysis dictionary
        patterns: Pattern analysis dictionary
    
    Returns:
        Formatted report string
    """
    lines = [
        "=" * 70,
        "ECIR TREND ANALYSIS REPORT",
        "=" * 70,
        "",
        f"Total ECIRs Analyzed: {trends['total_ecirs']}",
        f"Date Range: {trends['date_range']['earliest']} to {trends['date_range']['latest']}",
        "",
        "COST VARIANCE STATISTICS:",
        "-" * 70,
        f"  Mean Variance: ${trends['cost_variance_stats']['mean_dollars']:,.2f} "
        f"({trends['cost_variance_stats']['mean_pct']:.2f}%)",
        f"  Median Variance: ${trends['cost_variance_stats']['median_dollars']:,.2f}",
        f"  Min Variance: ${trends['cost_variance_stats']['min_dollars']:,.2f}",
        f"  Max Variance: ${trends['cost_variance_stats']['max_dollars']:,.2f}",
        "",
        "CHANGE REASONS:",
        "-" * 70,
    ]
    
    for reason, count in list(trends['change_reasons'].items())[:5]:
        if reason:
            lines.append(f"  {reason:40s}: {count:3d} ECIRs")
    
    lines.extend([
        "",
        "OVERALL CHANGE TYPE DISTRIBUTION:",
        "-" * 70,
    ])
    
    for status, data in list(patterns['common_change_types'].items())[:10]:
        lines.append(
            f"  {status:30s}: {data['count']:5d} items ({data['percentage']:5.1f}%)"
        )
    
    lines.extend([
        "",
        "HIGH VARIANCE ECIRs (>5%):",
        "-" * 70,
    ])
    
    for ecir in patterns['high_variance_ecirs'][:10]:
        lines.append(
            f"  {ecir['ecir_id']:25s}: ${ecir['variance_dollars']:>12,.2f} "
            f"({ecir['variance_pct']:>6.1f}%) - {ecir['reason']}"
        )
    
    if trends['supplier_changes']:
        lines.extend([
            "",
            "SUPPLIER CHANGES:",
            "-" * 70,
        ])
        for change in trends['supplier_changes'][:10]:
            lines.append(
                f"  {change['ecir_id']:25s}: {change['from']} → {change['to']}"
            )
    
    if trends['unique_models_affected']:
        lines.extend([
            "",
            f"UNIQUE MODELS AFFECTED ({len(trends['unique_models_affected'])}):",
            "-" * 70,
        ])
        for model in sorted(trends['unique_models_affected'])[:20]:
            if model:
                lines.append(f"  • {model}")
    
    lines.extend([
        "",
        "=" * 70,
    ])
    
    return "\n".join(lines)


def main():
    """Main entry point for ECIR trend analyzer CLI."""
    parser = argparse.ArgumentParser(
        description="Analyze trends across multiple ECIR reports"
    )
    parser.add_argument(
        'ecir_files',
        type=Path,
        nargs='+',
        help='Paths to ECIR Excel files (.xlsx)'
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
        # Load all ECIRs
        print(f"Loading {len(args.ecir_files)} ECIR reports...")
        ecirs = load_multiple_ecirs(args.ecir_files)
        print(f"Successfully loaded {len(ecirs)} reports")
        
        # Analyze trends
        trends = analyze_trends(ecirs)
        patterns = identify_patterns(ecirs)
        
        # Generate output
        if args.format == 'json':
            result = json.dumps({
                'trends': trends,
                'patterns': patterns,
            }, indent=2, default=str)
        else:
            result = generate_trend_report(trends, patterns)
        
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
