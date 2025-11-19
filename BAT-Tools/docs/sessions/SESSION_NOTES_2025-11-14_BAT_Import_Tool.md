# Session Notes: BAT Import Tool Development
**Date:** November 14, 2025 (05:30 start)
**Focus:** Customer material import and code translation system

---

## Session Summary

### What We Accomplished ✅

1. **Reviewed existing BAT coding system builder**
   - Located in: `docs/Migration Strategy/bat_coding_system_builder/`
   - 311-row translation table (Richmond → Unified)
   - Interactive menu system with customer import wizard
   - SQLite database with 8 tables

2. **Analyzed current translation logic**
   - Found: Richmond-only translation (`translate_richmond_code()`)
   - Missing: Holt and Custom translation functions
   - Identified: 9 critical gaps in customer code conversion

3. **Discovered new files added**
   - `customer_code_mapping.py` - Configuration-driven parser
   - `indexMaterialListbyPlanHolt20251114.xlsx` - Real Holt data
   - Updated `interactive_menu.py` with Holt parsing

4. **Validated against real data**
   - Tested Holt code parser against actual Excel data
   - Found multiple codes per row (comma-separated)
   - Confirmed elevation digit mapping (1=A, 2=B, 3=C, 4=D)

---

## Critical Findings ⚠️

### Holt Data Structure
```
Option/Phase Number: "167010100 - 4085 , 167010200 - 4085 , 167010300 - 4085 , 167010400 - 4085"
Pack ID: "|10ABCD FOUNDATION"
SKU: 2616HF3TICAG
Description: 2X6-16' #3 HF TRTD AG ICT
Qty: 12
```

**Key insight:** One Excel row = Multiple material entries (one per elevation)

### Holt Code Format (Validated)
```
167010100 - 4085
│││││││││   └──── Activity (4085 = Framing, 4155 = Siding)
││││││││└──────── Phase sequence (00, 01, 02...)
│││││└───────────── Phase category (010 = Foundation, 020 = Main Floor)
││││└────────────── Elevation digit (1=A, 2=B, 3=C, 4=D, 0=**)
└───┴─────────────── Plan base (1670, 1530, etc.)
```

### 9 Critical Gaps Identified

1. ❌ **Table-driven only** - No rule-based fallback
2. ❌ **Richmond-only logic** - No Holt/Custom functions
3. ❌ **Item type mapping** - Hard-coded in CSV
4. ❌ **Elevation normalization** - Expects exact "B, C, D" format
5. ❌ **Pack ID variations** - Can't handle embedded elevations
6. ❌ **No learning mode** - Can't teach new translations
7. ❌ **Poor error messages** - No suggestions
8. ❌ **No Holt support** - Different format entirely
9. ❌ **Multi-code handling** - Can't parse comma-separated codes

---

## Architecture Decision: Hybrid Approach ✅

**Decision:** Keep Python tool standalone, integrate with platform later

**Rationale:**
- Iterate quickly on translation logic
- Don't disrupt working MindFlow platform
- Add API sync later when tool is mature
- Progressive integration approach

**Path forward:**
1. Perfect Python translation logic (current phase)
2. Add PostgreSQL export capability
3. Build platform API endpoints
4. Full integration (Month 2-3)

---

## Phased Improvement Plan

### Phase 1: Foundation (Priority 1) - 1-2 hours
**Goal:** Make translation logic robust for all customer types

**Tasks:**
1. **Build elevation string normalizer**
   - Input: `"B, C, D"`, `"BCD"`, `"B/C/D"`, `"b-c-d"`
   - Output: `"BCD"` (alphabetical, uppercase)
   - Location: Add to `bat_coding_system_builder.py`

2. **Build item type mapper**
   - Map customer terminology → unified codes
   - Examples: "Framing"/"Lumber"/"Wood" → "1000"
   - Fuzzy matching for variations
   - Location: Add to `customer_code_mapping.py`

3. **Add rule-based fallback logic**
   - When table lookup fails, try pattern matching
   - Suggest similar codes (fuzzy match)
   - Graceful degradation vs hard failure

4. **Fix Holt multi-code splitter**
   - Parse: `"167010100 - 4085 , 167010200 - 4085"` → multiple codes
   - Create separate material entry per code
   - Location: Update `interactive_menu.py` line 1041

**Deliverables:**
- `normalize_elevation()` function
- `map_item_type()` function with taxonomy
- `split_holt_codes()` function
- Unit tests for each

---

### Phase 2: Customer Support (Priority 2) - 2-3 hours
**Goal:** Support Richmond, Holt, and Custom imports seamlessly

**Tasks:**
1. **Complete Holt translation engine**
   - Finish `translate_holt_code()` function
   - Handle multi-code parsing
   - Test against `indexMaterialListbyPlanHolt20251114.xlsx`
   - Location: `bat_coding_system_builder.py`

2. **Create custom/interactive translation engine**
   - `translate_custom_code()` with user prompts
   - "Teach me this code" workflow
   - Save learned mappings to database
   - Location: New class `CustomTranslationEngine`

3. **Update import wizard routing**
   - Line 1086-1088 in `interactive_menu.py`
   - Current: Always calls `translate_richmond_code()`
   - Fixed: Route based on customer_type (1=Richmond, 2=Holt, 3=Custom)

4. **Handle one-row-to-many-materials**
   - Holt: 1 Excel row → 4 material entries (ABCD)
   - Loop through parsed codes
   - Create unified code for each

**Deliverables:**
- `translate_holt_code()` function (complete)
- `translate_custom_code()` function
- Updated import wizard with proper routing
- Successful Holt Excel import

---

### Phase 3: Intelligence (Priority 3) - 2-3 hours
**Goal:** Make system smart, self-improving, helpful

**Tasks:**
1. **Add fuzzy matching**
   - Use `fuzzywuzzy` or `rapidfuzz` library
   - When lookup fails, suggest top 3 similar codes
   - Example: "`|99.99` not found. Did you mean: `|10.00`, `|09.20`, `|12.00`?"

2. **Add learning/teaching mode**
   - Interactive dialog for unknown codes
   - "I found `|99.99`. What unified code should this map to?"
   - Save to `custom_translations` table
   - Export updated CSV

3. **Improve error handling**
   - Replace generic `ValueError` with helpful messages
   - Show context: "Found in row 127 of 'Holt_Materials.xlsx'"
   - Suggest fixes: "Add to translation table or skip this row"
   - Continue import with errors logged

**Deliverables:**
- Fuzzy matching in translation functions
- Interactive teaching dialog
- Enhanced error messages with context
- Export learned translations

---

## Code Locations Reference

```
docs/Migration Strategy/bat_coding_system_builder/
├── bat_coding_system_builder.py      ← Core translation logic
├── customer_code_mapping.py          ← Customer-specific parsers (NEW)
├── interactive_menu.py               ← Import wizard
├── coding_schema_translation.csv     ← 311-row Richmond table
├── bat_unified.db                    ← SQLite database
└── example_usage.py                  ← Usage examples

Key Functions to Update:
- Line 356: translate_richmond_code()
- Line 1041: parse_holt_code() (interactive_menu.py)
- Line 1086: Import wizard translation routing
- NEW: translate_holt_code()
- NEW: translate_custom_code()
- NEW: normalize_elevation()
- NEW: map_item_type()
```

---

## Data Files

**Richmond:**
- Translation table: `coding_schema_translation.csv` (311 rows)
- Format: `|XX.XX` pack IDs
- Elevations: Separate column or embedded in pack ID

**Holt:**
- Sample data: `indexMaterialListbyPlanHolt20251114.xlsx`
- Format: `PPPPPCCCSS - AAAA` (comma-separated)
- Elevations: Digit in position 5 (1=A, 2=B, 3=C, 4=D)

---

## Testing Plan

### Phase 1 Testing
```bash
cd "docs/Migration Strategy/bat_coding_system_builder"

# Test elevation normalizer
python3 << EOF
from bat_coding_system_builder import normalize_elevation
assert normalize_elevation("B, C, D") == "BCD"
assert normalize_elevation("b/c/d") == "BCD"
assert normalize_elevation("BCD") == "BCD"
print("✓ Elevation normalizer tests passed")
EOF

# Test item type mapper
python3 << EOF
from customer_code_mapping import map_item_type
assert map_item_type("Framing") == "1000"
assert map_item_type("Lumber") == "1000"
assert map_item_type("Siding") == "2100"
print("✓ Item type mapper tests passed")
EOF
```

### Phase 2 Testing
```bash
# Test Holt import with real data
python3 interactive_menu.py
# Select Option 13 - Import Customer Database
# Choose Holt (option 2)
# Load: indexMaterialListbyPlanHolt20251114.xlsx
# Verify: 4 material entries created per row
```

### Phase 3 Testing
```bash
# Test fuzzy matching
# Import file with unknown code |99.99
# Verify: System suggests similar codes
# Accept suggestion or teach new mapping
```

---

## Next Session Prep

### Before Next Session
1. ☐ Review this document
2. ☐ Decide which phase to start with (recommend Phase 1)
3. ☐ Have Holt Excel file ready for testing
4. ☐ Backup current database: `cp bat_unified.db bat_unified_backup.db`

### Session Start Checklist
```bash
cd /home/user/ConstructionPlatform
git pull origin main
cd "docs/Migration Strategy/bat_coding_system_builder"
python3 customer_code_mapping.py  # Verify it works
python3 interactive_menu.py       # Test current state
```

### Quick Wins to Start With
1. **Elevation normalizer** (30 min) - Easy, high impact
2. **Item type mapper** (45 min) - Clear requirements
3. **Multi-code splitter** (30 min) - Solves Holt import

**Total:** ~2 hours to Phase 1 complete

---

## Questions for Next Session

1. Do you want to handle partial imports (skip errors, continue)?
2. Should we create audit trail of translations (for review)?
3. Export format preference: CSV, Excel, or both?
4. How to handle duplicate codes (overwrite, skip, merge)?

---

## Resources

**Python Libraries Needed:**
```bash
pip install pandas openpyxl fuzzywuzzy rapidfuzz --break-system-packages
```

**Documentation:**
- Customer Import Guide: `CUSTOMER_IMPORT_GUIDE.md`
- Translation Summary: `coding_schema_translation_summary.txt`
- Deliverables Summary: `DELIVERABLES_SUMMARY.txt`

---

## Time Tracking

**Morning Session (05:30-06:37):**
- Duration: 1h 7m
- Focus: Analysis, design, testing, documentation

**Afternoon Session (17:38-18:10):**
- Duration: 32 minutes (17:38-17:44, 17:57-18:10)
- Focus: Week wrap-up, lessons learned, file organization, build schedule

**Total Time Today:** 1h 39m (Morning: 1h 7m + Afternoon: 32m)

**Estimated Remaining:**
- Phase 1: 1-2 hours
- Phase 2: 2-3 hours
- Phase 3: 2-3 hours
- **Total: 5-8 hours** to complete all improvements

---

## Status Summary

**Current State:**
- ✅ Richmond import works (with 311-row table)
- ⚠️ Holt import partially implemented (parser exists, not integrated)
- ❌ Custom import not implemented
- ⚠️ Error handling is basic

**Target State:**
- ✅ All three customer types supported
- ✅ Robust normalization and mapping
- ✅ Smart error handling with suggestions
- ✅ Learning mode for unknown codes
- ✅ Ready to integrate with MindFlow platform

**Confidence:** High - Clear path forward, well-defined tasks, working foundation

---

**End of Session Notes**
