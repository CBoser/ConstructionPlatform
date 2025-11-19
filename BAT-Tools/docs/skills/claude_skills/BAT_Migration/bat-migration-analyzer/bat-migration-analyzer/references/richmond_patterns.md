# Richmond American Homes - System Patterns

## Overview
Richmond's material management system uses Excel-based Material_List_Index files with a vendor SKU passthrough philosophy and mnemonic prefix codes.

## Item Coding Philosophy

### Core Approach
- **Philosophy**: Vendor SKU Passthrough with Mnemonic Prefixes
- **Total Prefix Types**: 288 different patterns documented
- **Code Structure**: Mnemonic letters + vendor SKU numbers

### Advantages
- Human-readable at a glance
- Easy to understand material categories
- Maintains vendor SKU for reference

### Disadvantages
- 288 different prefixes creates complexity
- No systematic hierarchy
- Difficult to enforce consistency

## Pack Structure
Richmond uses the standard format: `|[Major].[Minor] PACK_NAME`

## Elevation Encoding

### Triple-Encoding Problem
Richmond stores elevation data in **three locations simultaneously**:

1. Sheet Names: Separate sheets per elevation
2. Column Names: ELEVATION column within each sheet  
3. Item Codes: Elevation prefix in item numbers

### Issues
- Synchronization risk
- Maintenance burden
- Inconsistency potential
- Data redundancy

**Recommendation**: Treat elevation as a separate dimension in unified system (single-encoding approach).

## Migration Scope
- **Total Plans**: 56 documented plans
- **Total Line Items**: ~55,604 items
- **Percentage**: ~85% of total migration

## System Characteristics

### Strengths
1. Visual clarity with mnemonic codes
2. Vendor integration maintains SKUs
3. Pack standardization

### Weaknesses
1. Triple-encoding elevation issues
2. 288 different prefix patterns
3. Manual maintenance intensive

## Integration Recommendations
1. Elevation: Plan Index suggests treating as separate dimension
2. Pack Format: Keep existing |Major.Minor format
3. Item Codes: Opportunity to improve on prefix complexity
