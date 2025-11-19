---
name: code-unification-assistant
description: Maps and unifies Richmond mnemonic codes with Holt hierarchical codes. Use when user needs to create code mappings, detect conflicts between coding systems, generate unified codes, support hybrid code approach, or analyze Richmond's 288 prefixes vs Holt's systematic structure. Also use when user mentions "code mapping", "Richmond codes", "Holt codes", "mnemonic prefixes", "hierarchical codes", "code conflicts", or "unified codes".
---

# Code Unification Assistant

Bridges Richmond's 288 mnemonic prefixes with Holt's hierarchical numeric codes, creating unified code mappings for the BAT system.

## Quick Start

**Create code mappings**:
```bash
python scripts/create_code_mappings.py <richmond_file> <holt_file> [strategy] [output.csv]
```

**Strategies**:
- `hybrid` (recommended) - Best of both worlds
- `systematic` - Pure hierarchical (Holt-style)
- `mnemonic` - Letter prefixes (Richmond-style)

**Example**:
```bash
python scripts/create_code_mappings.py richmond.xlsx holt.xlsx hybrid mappings.csv
```

**Detect conflicts**:
```bash
python scripts/detect_conflicts.py mappings.csv
```

## Core Capabilities

### 1. Code Mapping Generation
Analyzes both systems and creates unified mappings:
- Extracts Richmond prefixes (288 patterns)
- Extracts Holt hierarchy (numeric categories)
- Infers category relationships
- Generates unified codes
- Exports to CSV

**Hybrid Output** (Recommended):
```csv
unified_code,category,richmond_prefix,holt_category,description
10.CONC,concrete,CONC,10,Concrete materials
20.FRAM,framing,FRAM,20,Framing lumber
30.ELEC,electrical,ELEC,30,Electrical materials
```

### 2. Conflict Detection
Identifies issues in code mappings:
- Duplicate unified codes
- Category overlaps
- Unmapped items
- Naming conflicts
- Coverage gaps

**Reports**:
- ❌ Critical conflicts (must fix)
- ⚠️ Warnings (should review)
- ✅ Clean mappings (ready to use)

### 3. Strategy Support
Provides guidance for three unification approaches:
- **Systematic**: Pure hierarchical (Holt model)
- **Mnemonic**: Letter prefixes (Richmond model)
- **Hybrid**: Combined approach (recommended)

## Unification Strategies

### Systematic (Holt-Style)
**Format**: 10.20.30.040
- Long-term maintainability
- Programmatic validation
- Easy expansion
- ❌ Less human-readable

### Mnemonic (Richmond-Style)
**Format**: CONC1234
- Human-readable
- No training needed
- Preserves knowledge
- ❌ Hard to manage 288 patterns

### Hybrid (RECOMMENDED)
**Format**: 10.CONC or 10.CONC.030.001
- Systematic structure + readable hints
- Supports both legacy systems
- Best long-term solution
- Creates mapping table

## Code Mapping Process

### Step 1: Load Source Files
```
Richmond: 288 mnemonic prefixes (~55,604 items)
Holt: Hierarchical categories (~9,373 items)
```

### Step 2: Analyze Patterns
```
Extract prefixes: CONC, FRAM, ELEC, PLMB...
Extract categories: 10, 20, 30, 40...
Identify relationships via descriptions
```

### Step 3: Create Mappings
```
Group by material category:
- Concrete: CONC → 10
- Framing: FRAM, FRM → 20
- Electrical: ELEC → 30
```

### Step 4: Generate Unified Codes
```
Hybrid: 10.CONC (division + mnemonic)
Systematic: 10.00 (division only)
Mnemonic: CONC (prefix only)
```

### Step 5: Validate & Export
```
Check for conflicts
Export to CSV
Ready for database import
```

## Richmond System (288 Prefixes)

### Common Prefixes
- **CONC** - Concrete (~3,500 items)
- **FRAM/FRM** - Framing (~8,200 items)
- **ELEC** - Electrical (~6,100 items)
- **PLMB** - Plumbing (~5,800 items)
- **HVAC** - HVAC (~3,200 items)
- **DRY/DRYWALL** - Drywall (~12,400 items)

### Characteristics
- Mnemonic (readable)
- Vendor SKU passthrough
- No hierarchy
- 288 different patterns
- Institutional knowledge

## Holt System (Hierarchical)

### Structure
```
10.xx.xx.xxx - Concrete & Foundations
20.xx.xx.xxx - Framing & Structure
30.xx.xx.xxx - Electrical
40.xx.xx.xxx - Plumbing
50.xx.xx.xxx - HVAC
60.xx.xx.xxx - Finishes
70.xx.xx.xxx - Fixtures
80.xx.xx.xxx - Openings
90.xx.xx.xxx - Roofing
```

### Characteristics
- Systematic hierarchy
- 4 levels deep
- Easy to expand
- Programmatically enforceable
- ~9,373 items (fewer but efficient)

## Typical Workflow

### User Says: "Create unified code mappings"

**Claude**:
1. Checks for Richmond and Holt files
2. Runs `create_code_mappings.py` with hybrid strategy
3. Generates mappings CSV
4. Runs `detect_conflicts.py` automatically
5. Reports results with statistics
6. Provides download link

### Output Includes
- Unified code mappings (CSV)
- Conflict detection report
- Category distribution
- Coverage analysis
- Recommendations

## Reference Documentation

### Load when needed:

**`references/unification_strategies.md`**:
- Three approaches compared
- Decision matrix
- Implementation workflow
- Conflict resolution

**`references/richmond_code_catalog.md`**:
- All 288 prefixes documented
- Category groupings
- Usage frequency
- Migration challenges

**`references/holt_code_hierarchy.md`**:
- 4-level hierarchy explained
- Division details
- Systematic benefits
- Best practices

## Integration with Other Skills

### With Skill #1 (BAT Migration Analyzer)
- Analyzer extracts actual codes from files
- Unification Assistant maps them

### With Skill #2 (Database Schema Designer)
- If hybrid approach chosen, schema includes code_mappings table
- Unified codes populate materials table

### Complete Workflow
```
Skill #1: Extract codes from files
  ↓
Skill #3: Create unified mappings
  ↓
Skill #2: Generate schema with mapping table
  ↓
Ready for data migration
```

## Key Insights

### Richmond Challenges
- 288 patterns difficult to manage
- No systematic structure
- Risk of prefix proliferation
- Manual maintenance

### Holt Advantages
- Systematic hierarchy
- Easy to expand
- Programmatic validation
- Efficient (fewer items, more organization)

### Hybrid Benefits
✅ Preserves Richmond knowledge (CONC, ELEC, PLMB)
✅ Adds Holt structure (10, 20, 30)
✅ Supports both legacy systems
✅ Enables gradual migration
✅ Best long-term solution

## Output Format

**Code Mappings CSV**:
- unified_code
- category
- richmond_prefix
- holt_category (if applicable)
- description
- item_count
- richmond_examples

**Conflict Report**:
- Duplicate codes flagged
- Category overlaps noted
- Coverage gaps identified
- Resolution suggestions

## Success Criteria

Unified codes are successful when:
✅ No duplicate unified codes
✅ All ~65,000 items mapped
✅ Categories logically organized
✅ Both systems supported
✅ No critical conflicts
✅ Human-readable + systematic
✅ Ready for database import

## Common Use Cases

**Use Case 1**: Create initial mappings
- Upload Richmond & Holt files
- Generate hybrid mappings
- Review for conflicts

**Use Case 2**: Validate mappings
- Upload existing mappings CSV
- Run conflict detection
- Fix issues

**Use Case 3**: Strategy comparison
- Generate mappings with different strategies
- Compare results
- Choose best approach

## Learning-First Philosophy

This skill:
- **Explains** Richmond's 288 prefixes
- **Documents** Holt's systematic approach
- **Preserves** institutional knowledge
- **Teaches** code design principles

Example: Generated mappings include descriptions explaining why CONC maps to division 10 (concrete category in both systems).
