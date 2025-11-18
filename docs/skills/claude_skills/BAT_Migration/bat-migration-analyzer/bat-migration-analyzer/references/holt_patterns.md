# Holt Homes - System Patterns

## Overview
Holt's material management system uses a composite numeric code structure that encodes Plan, Phase, and Option/Elevation into a single identifier.

## Code Structure

### Core Format
**Format:** `{Plan}{Phase}{ItemNo} - {CostCode}`

**Example:** `154210100 - 4085`

| Component | Digits | Example | Description |
|-----------|--------|---------|-------------|
| Plan | 4 | 1542 | Plan number |
| Phase | 2 | 10 | Phase category |
| Item_No | 3 | 100 | Elevation + Option |
| Cost Code | 4 | 4085 | Material type |

### Item Number Encoding
The 3-digit Item_No encodes both elevation and option variant:

**First Digit = Elevation Category:**
- 1 = Elevation A
- 2 = Elevation B
- 3 = Elevation C
- 4 = Elevation D
- 5 = Corner Enhanced
- 6 = Rear Enhanced

**Last Two Digits = Option Variant:**
- 00 = Base
- 01 = Gable End Sheathing
- 05 = 3 Car Garage

## Cost Codes (8 Total)

| Code | Activity | Count |
|------|----------|-------|
| 4085 | Lumber | 356 |
| 4086 | Lumber - Barge Credit | 24 |
| 4120 | Trusses | 117 |
| 4140 | Window Supply | 177 |
| 4142 | Window Supply - U-22 Triple Pane | 56 |
| 4150 | Exterior Door Supply | 13 |
| 4155 | Siding Supply | 386 |
| 4320 | Interior Trim - Millwork | 260 |

## Phase Categories

| Phase | Category | Description |
|-------|----------|-------------|
| 0-9 | Base House | Plan-specific base definitions |
| 10 | Elevations | Standard A/B/C/D and enhanced |
| 11 | Siding Add-ons | Faux Wood, Masonry |
| 18-21 | Structural | Balconies, retreats, patios |
| 25 | Bath | Tub and shower options |
| 36 | Smart Home | Smart home packages |
| 40 | Windows | Frame color options |
| 83 | Doors & Trim | Interior doors, molding |

## Pack Structure
Holt uses similar pack ID format to Richmond: `|[Phase][Elevations] [Description]`

**Examples:**
- `|10ABCD FOUNDATION`
- `|11ABCD MAIN JOIST SYSTEM`
- `|12AB MAIN FLOOR SYSTEM`

**Integration Advantage:** 100% compatible with Richmond format.

## Elevation Encoding

### Single-Encoding Best Practice
Holt uses **one location** for elevation data - the first digit of the Item_No:
- Elevation stored in Item_No (100=A, 200=B, 300=C, 400=D)
- NOT triple-encoded like Richmond
- Clean architecture with no synchronization risk

### Advantages
- No data synchronization issues
- Minimal maintenance burden
- Consistent and predictable
- Easy to parse programmatically

## Migration Scope
- **Total Rows:** 1,309 cost code entries
- **Plans:** 28 unique plans
- **Phases:** 24 unique phase codes
- **Item Variants:** 106 unique elevation/option combinations

## System Characteristics

### Strengths
1. Systematic organization with composite codes
2. Clean architecture with single-encoding
3. Only 8 cost codes (standardized)
4. Predictable parsing pattern
5. Efficient (fewer items, well-organized)

### Considerations
1. Codes require parsing to understand
2. Not human-readable without reference
3. Plan number embedded in every code

## Comparison with Richmond

| Aspect | Richmond | Holt |
|--------|----------|------|
| Code Format | Mnemonic (XGREAT) | Numeric composite (154210100) |
| Elevation Storage | Triple-encoded | Single-encoded (Item_No) |
| Cost Codes | Vendor SKUs (288 prefixes) | Standardized (8 codes) |
| Total Items | ~55,604 | ~1,309 |
| Readability | Human-readable | Requires parsing |

## Integration Advantages
Holt's approach provides strong foundation for unified system:
- Already follows single-encoding best practices
- Less technical debt than Richmond
- Clean migration path
- Good model for unified design

## Unified System Recommendations
1. Adopt Holt's single-encoding for elevation
2. Use composite code structure for internal IDs
3. Maintain pack format compatibility
4. Standardize cost codes like Holt's 8 codes
5. Avoid inheriting Richmond's triple-encoding

---

**Document Updated:** 2025-11-18
**Source:** Holt_Cost_Codes_20251118.xlsx
**Status:** Corrected based on actual Holt data analysis
