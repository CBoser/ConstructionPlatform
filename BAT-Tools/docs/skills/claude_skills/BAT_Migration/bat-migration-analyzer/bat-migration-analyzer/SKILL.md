---
name: bat-migration-analyzer
description: Analyzes Richmond American Homes and Holt Homes material lists for BAT migration. Use when the user uploads Excel material files (.xlsx, .xlsm), asks to analyze material lists, compare Richmond vs Holt systems, check migration scope, detect item numbering patterns, analyze pack structure, examine elevation encoding, or extract evidence for architecture decisions. Also use when user mentions "material file", "BAT", "Richmond", "Holt", "migration scope", "item codes", "pack structure", or "elevation encoding".
---

# BAT Migration Analyzer

This skill provides automated analysis of Richmond American Homes and Holt Homes material management systems to support the BAT migration project.

## Quick Start

When a user uploads a material file or asks for analysis, immediately run the appropriate analyzer script:

**Single file analysis:**
```bash
python scripts/analyze_material_list.py <path_to_file>
```

**System comparison:**
```bash
python scripts/compare_systems.py <richmond_file> <holt_file>
```

**Migration scope calculation:**
```bash
python scripts/migration_scope_calculator.py <file1> [file2] [file3]
```

## Core Analysis Capabilities

### 1. Material List Analysis
Provides comprehensive analysis of individual material files including system detection, file structure, migration scope, item numbering patterns, pack structure, elevation encoding detection, and evidence extraction.

**Use when:** User uploads material file, asks "analyze this file", or needs architecture decision evidence.

### 2. System Comparison
Side-by-side comparison of Richmond and Holt approaches including structure, scope, code philosophy, pack format compatibility, elevation handling, and unified recommendations.

**Use when:** User asks to "compare Richmond and Holt", needs to understand differences, or is planning unified architecture.

### 3. Migration Scope Calculator
Quick validation of migration scope with sheet breakdown, total calculation, and percentage distribution.

**Use when:** User asks "how many items?", needs quick validation, or is verifying estimates.

## Key Insights

### Richmond American Homes
- Code Philosophy: Vendor SKU passthrough with 288 mnemonic prefixes
- Critical Issue: Triple-encoding of elevation data
- Pack Format: Standard `|[Major].[Minor] PACK_NAME` (compatible)
- Volume: ~55,604 line items (~85% of migration)

### Holt Homes
- Code Philosophy: Hierarchical numeric internal codes
- Best Practice: Single-encoding for elevation (clean architecture)
- Pack Format: Standard `|[Major].[Minor] PACK_NAME` (compatible)
- Volume: ~9,373 line items (~15% of migration)

### Critical Integration Points
1. Pack Structure: ✅ Already compatible
2. Elevation Handling: ⚠️ Must choose single-encoding (Holt approach)
3. Item Codes: ⚠️ CRITICAL DECISION needed (unification philosophy)
4. Total Scope: ~65,000 combined line items

## Reference Documentation

Load these references as needed:

- **`references/richmond_patterns.md`**: Richmond specifics, triple-encoding issue, mnemonic codes, 288 prefixes
- **`references/holt_patterns.md`**: Holt specifics, hierarchical codes, single-encoding, systematic organization
- **`references/evidence_guide.md`**: Architecture decision support, evidence extraction methodology

## Output Format

Always:
1. Lead with system type identification
2. Highlight key metrics and critical issues
3. Flag architecture problems (triple-encoding, technical debt)
4. Offer next steps

## Learning-First Philosophy

Explain WHY patterns matter, connect findings to architecture decisions, preserve institutional knowledge, and teach design principles. Don't just report data—explain implications.
