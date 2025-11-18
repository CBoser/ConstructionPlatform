# Unified Code System - Complete Specification

## Overview

The **Unified Code System** provides a standardized way to identify and track every material in every plan across both Richmond and Holt operations. This code appears in Excel, Python, and the database, ensuring consistent tracking throughout the system.

---

## Code Format

### Standard Format: `PPPP-PPP.000-EE-IIII`

**Example:** `1670-101.000-AB-4085`

**Breakdown:**
```
┌────────┬────────┬─────┬────────┬──────────┐
│  PPPP  │  PPP   │ 000 │   EE   │   IIII   │
├────────┼────────┼─────┼────────┼──────────┤
│  Plan  │ Phase  │ Pad │ Elev   │ Item Type│
│  1670  │  101   │ 000 │   AB   │   4085   │
└────────┴────────┴─────┴────────┴──────────┘
```

### Component Details

#### 1. PPPP - Plan Number (4 digits)
**Purpose:** Identifies the house plan/model

**Format:**
- Always 4 digits
- Left-padded with zeros if needed
- Examples:
  - `1670` - Plan 1670
  - `0383` - Plan 383 (padded)
  - `2336` - Plan 2336

**Richmond Plans:**
- Letter plans: G603, G715, G813, etc.
- These are mapped to numeric codes

**Holt Plans:**
- Numeric plans: 1670, 2314, 2336, etc.
- Used directly

---

#### 2. PPP - Phase/Pack Code (3 digits)
**Purpose:** Identifies which construction phase/pack

**Format:**
- Always 3 digits
- Matches pack codes from `packs` table

**Common Codes:**
```
101 = FOUNDATION
102 = MAIN FLOOR SYSTEM
200 = MAIN WALLS
201 = PARTITION WALLS
300 = ROOF FRAMING
400 = EXTERIOR TRIM
500 = INTERIOR TRIM
```

**Full List (from auto_import_bat.py):**
```python
PACK_CODES = {
    '05': 'UNDERFLOOR',
    '10': 'FOUNDATION',
    '20': 'MAIN WALLS',
    '30': 'ROOF FRAMING',
    '40': 'EXTERIOR TRIM',
    '50': 'INTERIOR TRIM',
    '60': 'STAIRS',
    '70': 'MISC',
    '80': 'GARAGE',
    '82': 'PORCH',
    '85': 'DECK',
    '90': 'HARDWARE',
    '101': 'FOUNDATION',
    '200': 'MAIN WALLS',
    '300': 'ROOF FRAMING'
}
```

---

#### 3. 000 - Padding (3 digits)
**Purpose:** Reserved for future use, always "000"

**Format:**
- Always exactly "000"
- Originally intended for sub-phases
- Currently not used
- Keep for format consistency

---

#### 4. EE - Elevation Code (2 characters)
**Purpose:** Identifies which elevation/side of house

**Format:**
- 2 characters (letters or numbers)
- Can be alphanumeric

**Common Codes:**
```
00 = No specific elevation (applies to all)
AB = Elevations A and B
CD = Elevations C and D
A  = Elevation A only (stored as "A ")
B  = Elevation B only (stored as "B ")
C  = Elevation C only
D  = Elevation D only
```

**Richmond Elevations:**
- Uses letters: A, B, C, D
- Combined: AB, CD, ABCD

**Holt Elevations:**
- Encoded in Item_No first digit (not separate field)
- 1=A, 2=B, 3=C, 4=D, 5=Corner Enhanced, 6=Rear Enhanced
- Example: Item_No 100 = Elevation A Base, 200 = Elevation B Base

---

#### 5. IIII - Item Type Code (4 digits)
**Purpose:** Categorizes the type of material

**Format:**
- 4 digits
- Based on Richmond item numbering system

**Common Categories:**
```
1000-1999 = Lumber (structural)
2000-2999 = Lumber (framing)
3000-3999 = Lumber (trim)
4000-4999 = Hardware/fasteners
5000-5999 = Panels/sheathing
6000-6999 = Doors/windows
7000-7999 = Roofing
8000-8999 = Misc materials
9000-9999 = Unclassified/default
```

**Examples:**
```
4085 = Lumber (Holt)
4086 = Lumber - Barge Credit (Holt)
4120 = Trusses (Holt)
4140 = Window Supply (Holt)
4155 = Siding Supply (Holt)
4320 = Interior Trim - Millwork (Holt)
9000 = Default/unknown
```

**Holt Cost Codes (8 total):** 4085, 4086, 4120, 4140, 4142, 4150, 4155, 4320

---

## Code Examples

### Example 1: Foundation Sill Plate
```
Code: 1670-101.000-00-4085
Breakdown:
  Plan: 1670 (Holt plan 1670)
  Phase: 101 (Foundation)
  Padding: 000 (standard)
  Elevation: 00 (applies to all elevations)
  Item Type: 4085 (hardware/fasteners)

Meaning: "Fasteners for foundation on plan 1670, all elevations"
```

### Example 2: Main Wall Studs - Elevation A/B
```
Code: 2336-200.000-AB-2085
Breakdown:
  Plan: 2336 (Holt plan 2336)
  Phase: 200 (Main walls)
  Padding: 000 (standard)
  Elevation: AB (front and back elevations)
  Item Type: 2085 (framing studs)

Meaning: "Studs for main walls on plan 2336, elevations A and B"
```

### Example 3: Roof Framing - Elevation C
```
Code: 0383-300.000-C -3085
Breakdown:
  Plan: 0383 (Plan 383, padded to 4 digits)
  Phase: 300 (Roof framing)
  Padding: 000 (standard)
  Elevation: C  (elevation C, space-padded)
  Item Type: 3085 (trim lumber for roof)

Meaning: "Roof trim for plan 383, elevation C only"
```

---

## Where Codes Are Used

### 1. Excel BAT Files
**Column:** Usually Column A or embedded in Location string

**Current Format (Raw):**
```
167010100 - 4085
233620070
38310105 - 4085 - 4085  (duplicate item type)
```

**Parsed Format (What we want):**
```
1670-101.000-00-4085
2336-200.000-70-9000
0383-101.000-05-4085
```

**Implementation:**
- Add new column: "Unified Code"
- Parse from existing Location column
- Use Excel formulas or VBA to extract components
- Display formatted code

---

### 2. Python Database
**Table:** `plan_materials`
**Column:** `unified_code` (VARCHAR 50)

**SQL Example:**
```sql
SELECT
  unified_code,
  location_string,
  quantity
FROM plan_materials
WHERE unified_code LIKE '1670-101%'  -- All foundation items for plan 1670
ORDER BY unified_code;
```

**Query Examples:**
```sql
-- Find all materials for plan 1670
WHERE unified_code LIKE '1670-%'

-- Find all foundation materials across all plans
WHERE unified_code LIKE '%-101.%'

-- Find all elevation AB materials
WHERE unified_code LIKE '%-AB-%'

-- Find all fasteners (4085)
WHERE unified_code LIKE '%-4085'
```

---

### 3. Python Code
**Module:** `bat_system_v2/services/unified_code_parser.py` (to be created)

**Usage:**
```python
from bat_system_v2.services.unified_code_parser import UnifiedCodeParser

# Parse a code
parser = UnifiedCodeParser()
code_info = parser.parse("1670-101.000-AB-4085")

print(code_info)
# Output:
# {
#     'plan': '1670',
#     'phase': '101',
#     'padding': '000',
#     'elevation': 'AB',
#     'item_type': '4085',
#     'full_code': '1670-101.000-AB-4085',
#     'is_valid': True
# }

# Build a code
new_code = parser.build(
    plan=1670,
    phase=101,
    elevation='AB',
    item_type=4085
)
print(new_code)
# Output: "1670-101.000-AB-4085"

# Validate a code
is_valid = parser.validate("1670-101.000-AB-4085")
print(is_valid)  # True
```

---

## Integration Plan

### Phase 1: Excel Integration

#### Option A: New Column with Formula
Add a "Unified Code" column that extracts from existing Location column

**Excel Formula (Column Z):**
```excel
=IF(A5<>"",
    TEXT(LEFT(A5,4),"0000") & "-" &
    TEXT(MID(A5,5,3),"000") & ".000-" &
    MID(A5,8,2) & "-" &
    RIGHT(A5,4),
    ""
)
```

**Visual:**
```
   A (Location)        Z (Unified Code - NEW)
┌─────────────────┬────────────────────────┐
│ 167010100-4085  │ =Formula...            │
│                 │ → 1670-101.000-00-4085 │
├─────────────────┼────────────────────────┤
│ 233620070       │ =Formula...            │
│                 │ → 2336-200.000-70-9000 │
└─────────────────┴────────────────────────┘
```

#### Option B: VBA Parser Function
Create a custom Excel function

**VBA Code:**
```vba
Function ParseUnifiedCode(rawCode As String) As String
    ' Remove spaces and separators
    Dim cleaned As String
    cleaned = Replace(rawCode, " ", "")
    cleaned = Replace(cleaned, "-", "")

    ' Extract components
    Dim plan As String
    Dim phase As String
    Dim elevation As String
    Dim itemType As String

    If Len(cleaned) >= 9 Then
        plan = Format(Left(cleaned, 4), "0000")
        phase = Format(Mid(cleaned, 5, 3), "000")
        elevation = Mid(cleaned, 8, 2)

        ' Find item type (after last separator in original)
        itemType = Right(cleaned, 4)
        If itemType = "" Then itemType = "9000"

        ' Build unified code
        ParseUnifiedCode = plan & "-" & phase & ".000-" & elevation & "-" & itemType
    Else
        ParseUnifiedCode = "INVALID"
    End If
End Function
```

**Usage in Excel:**
```excel
=ParseUnifiedCode(A5)
```

---

### Phase 2: Python Integration

#### Step 1: Create UnifiedCodeParser Service
**File:** `bat_system_v2/services/unified_code_parser.py`

**Features:**
- Parse raw codes from Excel
- Build codes from components
- Validate code format
- Extract individual components
- Query helper methods

#### Step 2: Add to MaterialService
**File:** `bat_system_v2/services/material_service.py`

**New Methods:**
```python
def find_by_unified_code(self, code: str) -> List[PlanMaterial]:
    """Find all materials with this unified code"""

def find_by_plan(self, plan_number: str) -> List[PlanMaterial]:
    """Find all materials for a plan"""

def find_by_phase(self, phase_code: str) -> List[PlanMaterial]:
    """Find all materials in a phase across all plans"""
```

#### Step 3: Add to CLI Tools
**Command:** `bat code parse <code>`

```bash
$ bat code parse "167010100-4085"

Unified Code: 1670-101.000-00-4085
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan:      1670
Phase:     101 (FOUNDATION)
Elevation: 00 (All elevations)
Item Type: 4085 (Hardware/Fasteners)

Valid: ✅ Yes
```

**Command:** `bat code build`

```bash
$ bat code build --plan 1670 --phase 101 --elevation AB --item 4085

Generated Code: 1670-101.000-AB-4085
```

---

### Phase 3: Web Integration

#### API Endpoints
```python
# Parse code
POST /api/codes/parse
Body: { "raw_code": "167010100-4085" }
Response: {
  "plan": "1670",
  "phase": "101",
  "elevation": "00",
  "item_type": "4085",
  "full_code": "1670-101.000-00-4085"
}

# Build code
POST /api/codes/build
Body: {
  "plan": 1670,
  "phase": 101,
  "elevation": "AB",
  "item_type": 4085
}
Response: {
  "code": "1670-101.000-AB-4085"
}

# Find materials by code
GET /api/materials?unified_code=1670-101.000-AB-4085
```

#### Web UI Component
```javascript
// Code input with validation
<input
  type="text"
  placeholder="1670-101.000-AB-4085"
  onBlur={validateCode}
/>

// Code builder interface
<div className="code-builder">
  <select name="plan">
    <option value="1670">Plan 1670</option>
    <option value="2336">Plan 2336</option>
  </select>

  <select name="phase">
    <option value="101">Foundation</option>
    <option value="200">Main Walls</option>
  </select>

  <select name="elevation">
    <option value="00">All</option>
    <option value="AB">A & B</option>
    <option value="CD">C & D</option>
  </select>

  <input name="itemType" placeholder="4085" />

  <button onClick={buildCode}>Generate Code</button>

  <output>1670-101.000-AB-4085</output>
</div>
```

---

## Validation Rules

### Format Validation
```python
def validate_format(code: str) -> bool:
    """
    Validate unified code format

    Valid: PPPP-PPP.000-EE-IIII
    Examples:
      ✅ 1670-101.000-AB-4085
      ✅ 0383-200.000-00-9000
      ❌ 1670-101-AB-4085 (missing .000)
      ❌ 1670-1.000-AB-4085 (phase not 3 digits)
    """
    import re
    pattern = r'^\d{4}-\d{3}\.\d{3}-[A-Z0-9]{2}-\d{4}$'
    return bool(re.match(pattern, code))
```

### Component Validation
```python
def validate_plan(plan: str) -> bool:
    """Plan must be 4 digits"""
    return len(plan) == 4 and plan.isdigit()

def validate_phase(phase: str) -> bool:
    """Phase must be 3 digits"""
    return len(phase) == 3 and phase.isdigit()

def validate_elevation(elevation: str) -> bool:
    """Elevation must be 2 alphanumeric characters"""
    return len(elevation) == 2 and elevation.isalnum()

def validate_item_type(item_type: str) -> bool:
    """Item type must be 4 digits"""
    return len(item_type) == 4 and item_type.isdigit()
```

---

## Migration Strategy

### From Raw Codes to Unified Codes

**Current State (Excel):**
```
Column A: 167010100 - 4085
Column A: 233620070
Column A: 38310105 - 4085 - 4085
```

**Target State:**
```
Column A: Original (preserved)
Column Z: 1670-101.000-00-4085 (parsed)
Column Z: 2336-200.000-70-9000 (parsed)
Column Z: 0383-101.000-05-4085 (parsed, duplicates removed)
```

**Migration Steps:**

1. **Add Column Z to Excel** - "Unified Code"
2. **Add Parsing Formula** - Extract from Column A
3. **Validate Results** - Check 100 random rows
4. **Import to Database** - Populate `unified_code` column
5. **Create Indexes** - Speed up code-based queries
6. **Update Python Services** - Use unified codes
7. **Test Queries** - Verify search functionality

---

## Benefits of Unified Code System

### 1. Consistent Tracking
✅ Same code format across Excel, Python, and Web
✅ No ambiguity about what material belongs where
✅ Easy to query and filter

### 2. Fast Queries
```sql
-- OLD WAY: Multiple joins, slow
SELECT * FROM materials m
JOIN plan_materials pm ON m.id = pm.material_id
JOIN plans p ON pm.plan_id = p.id
WHERE p.plan_number = '1670'
  AND pm.pack_id IN (SELECT id FROM packs WHERE code LIKE '101%');

-- NEW WAY: Single indexed column, fast
SELECT * FROM plan_materials
WHERE unified_code LIKE '1670-101%';
```

### 3. Human Readable
- `1670-101.000-AB-4085` immediately tells you:
  - Plan 1670
  - Foundation phase
  - Elevations A & B
  - Hardware/fasteners

### 4. Future-Proof
- Reserved `.000` padding for sub-phases
- Can extend without breaking existing codes
- Compatible with both Richmond and Holt systems

---

## Common Queries Using Unified Codes

### Find all materials for a specific plan
```sql
SELECT * FROM plan_materials
WHERE unified_code LIKE '1670-%'
ORDER BY unified_code;
```

```python
# Python
materials = plan_service.find_by_unified_code_prefix("1670-")
```

```bash
# CLI
$ bat materials find --code "1670-*"
```

### Find all foundation materials across all plans
```sql
SELECT * FROM plan_materials
WHERE unified_code LIKE '%-101.%'
ORDER BY unified_code;
```

### Find all elevation AB materials
```sql
SELECT * FROM plan_materials
WHERE unified_code LIKE '%-AB-%'
ORDER BY unified_code;
```

### Find specific material on specific plan/phase/elevation
```sql
SELECT * FROM plan_materials
WHERE unified_code = '1670-101.000-AB-4085';
```

---

## Next Steps

1. **Review this specification** - Make sure format meets your needs
2. **Choose integration approach:**
   - Excel: Formula vs VBA
   - Python: Service class implementation
   - Web: API endpoints
3. **Test with sample data** - Validate parsing accuracy
4. **Create documentation sheet in Excel** - Explain codes to users
5. **Build Python parser** - Implement UnifiedCodeParser class
6. **Add CLI commands** - `bat code parse/build/validate`
7. **Update database** - Populate unified_code column from imports

---

## Questions to Consider

1. Should we support wildcards in queries? (`1670-*` vs `1670-%`)
2. Do we need sub-phase codes? (Currently `.000` is unused)
3. Should elevation codes be standardized? (Letters only? Numbers only?)
4. Do we need a code generator UI in Excel?
5. Should codes be auto-generated or manually entered?

---

## Conclusion

The Unified Code System provides a **single source of truth** for identifying materials across your entire operation. By implementing this in Excel, Python, and Web, you'll have:

- **Faster queries** (indexed lookups)
- **Easier reporting** (filter by code patterns)
- **Better tracking** (know exactly what material is where)
- **Reduced errors** (validated format)
- **Cross-system compatibility** (same codes everywhere)

Let's start by adding this to your improved Excel BAT file and building the Python parser!
