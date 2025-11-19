# DECISION 3: Internal Option Codes

**Decision Date:** November 13, 2025
**Status:** FINAL
**Impact:** User interface, database design, translation needs
**Approach:** Phased

---

## The Question

Richmond uses descriptive codes (XGREAT, 2CAR5XA).
Holt uses numeric codes (167010100).
What should OUR internal standard be?

## Decision

**PHASED APPROACH**

### Short-Term (Weeks 1-12): Hybrid/Translation
- Keep Richmond codes (192 codes)
- Keep Holt codes (225 codes)
- Build translation table (150-200 mappings)
- No retraining during migration
- Both teams productive immediately

### Long-Term (Post-Merger): Universal System
- Introduce OPT-[CAT]-[NUM] format
- Example: OPT-GAR-001, OPT-INT-001
- Gradual migration over 6-12 months
- Train both teams together
- Manor Homes adopts new standard

## Rationale

### Current State Analysis

**Richmond Codes (192 unique):**
```
Format: Descriptive alphanumeric
Examples:
- XGREAT = Extended great room
- 2CAR5XA = 2-car garage, 5' extension, elevation A
- FPSING01 = Fireplace single, option 01
- DENOPTB = Den option, elevation B

Characteristics:
✅ Human-readable
✅ Self-documenting
✅ Easy to remember
✅ Team knows them well
❌ No structure
❌ Collisions possible
❌ Hard to validate format
```

**Holt Codes (225 unique):**
```
Format: Numeric hierarchical
Pattern: [PLAN 4][PHASE 2][OPTION 2][ELEVATION 2]

Examples:
- 167010100 = Plan 1670, Phase 01, Option 01, Elevation A (100)
- 164910105 = Plan 1649, Phase 01, Option 01, Elevation A (100)
- 189010400 = Plan 1890, Phase 01, Option 04, All elevations

Characteristics:
✅ Systematic
✅ Plan embedded
✅ Phase grouping
✅ Easy to validate
✅ Team knows them well
❌ Not human-readable
❌ Long (9 digits)
❌ Requires decoder
```

### Why Phased Approach is Best

**Short-Term Benefits:**
- ✅ No retraining needed during critical migration
- ✅ Richmond team continues using XGREAT, 2CAR5XA
- ✅ Holt team continues using 167010100
- ✅ Translation table bridges gap
- ✅ Both teams productive immediately
- ✅ Preserves institutional knowledge

**Long-Term Benefits:**
- ✅ Unified system for merged company
- ✅ Neutral format (neither Richmond nor Holt)
- ✅ Manor Homes can adopt easily
- ✅ Short codes (11 characters)
- ✅ Category grouping clear
- ✅ Extensible for growth

## Database Implementation

### Short-Term Schema

```sql
-- Keep both coding systems, bridge with translation
CREATE TABLE option_translation (
    translation_id INTEGER PRIMARY KEY,
    richmond_code TEXT,                 -- 'XGREAT', '2CAR5XA'
    holt_code TEXT,                     -- '167010600', '167050100'
    universal_code TEXT,                -- 'OPT-INT-001' (future)
    description TEXT NOT NULL,
    category TEXT,                      -- 'GAR', 'INT', 'STR', 'EXT'
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    UNIQUE(richmond_code),
    UNIQUE(holt_code),
    UNIQUE(universal_code)
);

-- Link packs to translation table
CREATE TABLE pack_options (
    pack_option_id INTEGER PRIMARY KEY,
    pack_id TEXT NOT NULL,
    translation_id INTEGER NOT NULL,
    FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
    FOREIGN KEY (translation_id) REFERENCES option_translation(translation_id)
);
```

### Long-Term Format

**Universal Code Format: OPT-[CAT]-[NUM]**

**Categories:**
```
GAR = Garage options
INT = Interior options
STR = Structural options
EXT = Exterior options
ELE = Electrical options
PLU = Plumbing options
```

**Examples:**
```
OPT-GAR-001 = 2-car garage 4' extension
OPT-GAR-002 = 2-car garage 5' extension
OPT-INT-001 = Extended great room
OPT-INT-002 = Sunroom
OPT-STR-001 = Optional den
OPT-STR-002 = Optional den with full bath
```

## Translation Table Strategy

### Sample Mappings

```sql
INSERT INTO option_translation VALUES
(1, 'XGREAT', '167010600', 'OPT-INT-001', 'Extended Great Room', 'INT', 1),
(2, '2CAR5XA', '167050105', 'OPT-GAR-002', '2-Car Garage 5ft Ext Elev A', 'GAR', 1),
(3, 'DENOPTB', '167020200', 'OPT-STR-001', 'Optional Den Elevation B', 'STR', 1),
(4, 'FPSING01', '167030100', 'OPT-INT-003', 'Fireplace Single', 'INT', 1);
-- ... 150-200 total mappings
```

### Building the Translation Table

**Week 2 (Initial):**
- Identify 50 most common options
- Create initial mappings
- Test translation logic

**Weeks 3-4 (Expansion):**
- Expand to 100+ mappings
- Validate with William and Alicia
- Document any ambiguous cases

**Weeks 5-8 (During Imports):**
- Add mappings as encountered
- Identify gaps during import
- Complete to 150-200 mappings

**Week 9-10 (Validation):**
- Complete all mappings
- Test bidirectional translation
- Document any unmapped codes

## Query Examples

**Translate Richmond code to Holt:**
```sql
SELECT holt_code, description
FROM option_translation
WHERE richmond_code = 'XGREAT';
-- Result: 167010600, Extended Great Room
```

**Translate Holt code to Richmond:**
```sql
SELECT richmond_code, description
FROM option_translation
WHERE holt_code = '167050105';
-- Result: 2CAR5XA, 2-Car Garage 5ft Ext Elev A
```

**Show all garage options (any code):**
```sql
SELECT richmond_code, holt_code, universal_code, description
FROM option_translation
WHERE category = 'GAR';
```

**Find pack by any option code:**
```sql
SELECT p.pack_id, p.pack_name
FROM packs p
JOIN pack_options po ON p.pack_id = po.pack_id
JOIN option_translation ot ON po.translation_id = ot.translation_id
WHERE ot.richmond_code = 'XGREAT'
   OR ot.holt_code = '167010600'
   OR ot.universal_code = 'OPT-INT-001';
```

## Migration Impact

### Import Logic

**Richmond Import:**
```python
# Parse Richmond option code
richmond_code = "XGREAT"

# Look up in translation table
translation = get_translation(richmond_code=richmond_code)

# Link pack to translation
link_pack_to_option(pack_id, translation.translation_id)
```

**Holt Import:**
```python
# Parse Holt option code
holt_code = "167010600"

# Look up in translation table
translation = get_translation(holt_code=holt_code)

# Link pack to translation (same mechanism!)
link_pack_to_option(pack_id, translation.translation_id)
```

### User Interface

**Short-Term (Weeks 1-12):**
```
Richmond UI: Shows Richmond codes (XGREAT)
Holt UI: Shows Holt codes (167010600)
Admin UI: Shows all three columns
```

**Long-Term (Post-Merger):**
```
Unified UI: Shows universal codes (OPT-INT-001)
With description: "OPT-INT-001 - Extended Great Room"
Old codes available in parentheses if needed
```

## Team Training Plan

### Phase 1: Migration (Weeks 1-12)
- No training needed
- Teams use familiar codes
- Translation happens behind the scenes

### Phase 2: Introduction (Post-Merger +1 month)
- Introduce universal code concept
- Show examples: OPT-GAR-001
- Explain benefits of new system

### Phase 3: Parallel Use (Months 2-6)
- Universal codes appear in UI
- Old codes still work (translation)
- Team can use either

### Phase 4: Transition (Months 7-12)
- Universal codes become primary
- Old codes shown in parentheses
- Encourage universal code use

### Phase 5: Deprecation (Month 13+)
- Old codes deprecated (still work)
- Universal codes standard
- Manor Homes uses universal from start

## Validation Rules

### Short-Term
1. All Richmond codes in translation table
2. All Holt codes in translation table
3. Every code has description
4. Category assigned to each code
5. No duplicate codes within system

### Long-Term
1. Universal codes follow OPT-[CAT]-[NUM] format
2. Categories standardized (GAR, INT, STR, EXT)
3. Numbers sequential within category
4. Old codes preserved for reference
5. Translation works bidirectionally

## Success Criteria

**Short-Term Success:**
- ✅ 150-200 mappings complete
- ✅ Both teams use familiar codes
- ✅ Translation works bidirectionally
- ✅ No training required
- ✅ Zero productivity loss

**Long-Term Success:**
- ✅ Universal code system adopted
- ✅ Both teams trained
- ✅ Manor Homes using universal codes
- ✅ Old codes still accessible
- ✅ Single unified standard

## Team Validation

**William (Richmond):** Confirmed Richmond codes are working well, no need to change during migration
**Alicia (Holt):** Similar feedback on Holt codes
**Both:** Agreed translation table is best approach
**Decision:** Phased approach allows smooth transition ✅

---

**This decision enables:** Smooth migration, no retraining, future unification
**Dependencies:** Decisions 1 & 2 define pack and plan structure that this builds on
