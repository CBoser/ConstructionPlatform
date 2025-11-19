# Evidence Extraction Guide
How to Extract Decision-Making Evidence from BAT Material Files

## Purpose
This guide helps systematically extract concrete evidence from Richmond and Holt material files to support architecture decisions.

## Key Principle
**Look at the actual data, not estimates.** Real file structures reveal patterns that documentation may not capture.

## Critical Architecture Decisions Requiring Evidence

### 1. Plan-Pack Relationships
**Decision**: Are packs universal or plan-specific?

**Evidence to Extract:**
- Same pack name used across multiple plans?
- Same pack has different contents in different plans?
- Total unique packs vs total pack references

**What It Tells You:**
- High reuse ratio → Packs are universal
- Low reuse ratio → Packs are plan-specific

### 2. Plan-Elevation Modeling
**Decision**: Treat elevation as variant of plan or as separate dimension?

**Evidence to Extract:**
- How many places is elevation data stored?
- Sheet structure: plan-based or elevation-based?
- Do item codes embed elevation information?
- Plan Index structure: how are elevations organized?

**Key Questions:**
- Is elevation part of item's identity or a relationship?
- Can you describe an elevation without referencing a plan?

**Richmond-Specific Evidence:**
Plan Index shows plans as primary entities with elevations as attributes → suggests elevation is dimension, not base entity.

### 3. Internal Option Codes  
**Decision**: Systematic vs mnemonic vs hybrid approach?

**Evidence to Extract:**
- Sample 100+ option codes from each system
- Pattern analysis: numeric hierarchy vs letter prefixes
- Consistency check: how many different patterns?
- Hierarchy depth: flat vs multi-level

**What It Tells You:**
- Systematic = easier to expand, programmatically validate
- Mnemonic = human-readable, intuitive
- Hybrid = combine benefits, but requires careful design

## Evidence Extraction Workflow

### Step 1: Quick File Survey
```python
xl_file = pd.ExcelFile('material_file.xlsx')
print(f"Total sheets: {len(xl_file.sheet_names)}")
print(f"Columns: {df.columns.tolist()}")
```

### Step 2: Pattern Detection
```python
items = df['ITEM_CODE'].dropna()
prefixes = items.str.extract(r'^([A-Za-z]+)')[0]
print(f"Unique prefixes: {prefixes.nunique()}")
```

### Step 3: Cross-Reference Analysis
```python
# Pack reuse analysis
reuse_ratio = total_references / unique_packs
# High ratio (>10) suggests universal packs
# Low ratio (<3) suggests plan-specific packs
```

### Step 4: Document Findings
Record concrete evidence with specific numbers and implications.

## Evidence Quality Criteria

### High-Quality Evidence
✅ Based on actual data
✅ Statistically significant sample
✅ Consistent patterns
✅ Independently verifiable

### Low-Quality Evidence
❌ Based on assumptions
❌ Small sample size
❌ Inconsistent patterns
❌ Outdated or unverified

## Decision Validation Checklist
- [ ] Examined actual data files?
- [ ] Checked both Richmond AND Holt?
- [ ] Have quantitative metrics?
- [ ] Documented with specific examples?
- [ ] Validated across multiple sheets/files?
- [ ] Consulted domain experts?

## Summary
Evidence extraction is about **systematically examining actual data** to make informed architecture decisions. The time spent extracting solid evidence prevents weeks of rework from wrong architecture decisions.
