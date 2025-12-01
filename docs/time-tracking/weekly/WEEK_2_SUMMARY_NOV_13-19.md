# Week 2: November 13-19, 2025

**Sprint**: Transition from Phase 0 to BAT Migration Planning
**Week Goals**: Code System Review, Database Schema Design, BAT Tool Development

---

## 2025-11-13 - Week 2 Day 1: Code System Planning

**Planned Work**: Review project state and plan next phase
**Estimated Time**: 2 hours

### Session 1
- **Start**: 11:05
- **End**: 11:48
- **Duration**: 43 minutes (0.72 hours)
- **Activity**: Deep Eyez Repository work (separate project)
- **Category**: Other Project
- **Blockers**: None

### Session 2
- **Start**: 11:48
- **End**: 12:15
- **Duration**: 27 minutes (0.45 hours)
- **Activity**: Phase 0 completion review, BAT migration planning, documentation review
- **Category**: Planning
- **Blockers**: None

### Session 3
- **Start**: 12:23
- **End**: 12:27
- **Duration**: 4 minutes (0.07 hours)
- **Activity**: Quick documentation check
- **Category**: Planning
- **Blockers**: None

### Session 4
- **Start**: 12:32
- **End**: 12:59
- **Duration**: 27 minutes (0.45 hours)
- **Activity**: BAT migration documentation review, analyzing scope
- **Category**: Planning
- **Blockers**: None

### Session 5
- **Start**: 16:11
- **End**: 17:40
- **Duration**: 1 hour 29 minutes (1.48 hours)
- **Activity**: Architecture decision planning, code system review, identifying blockers
- **Category**: Planning
- **Blockers**: None

### Session 6
- **Start**: 17:55
- **End**: 18:28
- **Duration**: 33 minutes (0.55 hours)
- **Activity**: Documentation and session notes, planning next steps
- **Category**: Documentation
- **Blockers**: None

---

**Total Time**: 3 hours 43 minutes (3.72 hours)
**Planned vs Actual**: +1.72 hours (+86%)
**Completed Tasks**:
- [x] Reviewed current project state
- [x] Confirmed Phase 0 Security Foundation complete (Health Score: 92/100)
- [x] Reviewed BAT migration documentation
- [x] Identified 3 blocking architecture decisions
- [x] Planned Code System Review session
- [x] Created session notes

**Key Findings**:
- Platform Status: Health Score 92/100, 0 TypeScript errors
- Richmond: 55,604 material line items
- Holt: 9,373 material line items
- Total migration scope: ~65,000 items
- 3 Architecture Decisions blocking BAT migration:
  1. Plan-Pack Relationships (Universal vs Plan-specific)
  2. Plan-Elevation Modeling (Variant vs Dimension model)
  3. Option Code Philosophy (Numeric vs Mnemonic vs Hybrid)

**Next Session Preparation**:
- Review CODE_SYSTEM_IMPLEMENTATION_GUIDE.md
- Make 3 blocking architecture decisions
- Begin database schema design

---

## 2025-11-14 - Week 2 Day 2: Database Schema Design

**Planned Work**: Database schema design for unified code system
**Estimated Time**: 4 hours

### Session 1
- **Start**: 05:30
- **End**: 06:37
- **Duration**: 1 hour 7 minutes (1.12 hours)
- **Activity**: BAT Import Tool analysis, Holt code parser testing, gap identification
- **Category**: Planning & Design
- **Blockers**: None

### Session 2
- **Start**: 17:38
- **End**: 17:44
- **Duration**: 6 minutes (0.10 hours)
- **Activity**: Week wrap-up preparation, lessons learned
- **Category**: Documentation
- **Blockers**: None

### Session 3
- **Start**: 17:57
- **End**: 18:10
- **Duration**: 13 minutes (0.22 hours)
- **Activity**: Created BUILD_SCHEDULE.md, weekly wrap-up, git tags
- **Category**: Documentation
- **Blockers**: None

---

**Total Time**: 1 hour 26 minutes (1.44 hours)
**Planned vs Actual**: -2.56 hours (Note: 3h additional work done on separate branch)
**Completed Tasks**:
- [x] Analyzed customer_code_mapping.py (new file)
- [x] Tested Holt code parser against real data
- [x] Identified 9 critical gaps in translation logic
- [x] Created phased improvement plan
- [x] Created BUILD_SCHEDULE.md (complete project roadmap)
- [x] Created git tags for week boundaries
- [x] Updated all session time tracking
- [x] Created comprehensive lessons learned document

**On Separate Branch (Additional 3h)**:
- [x] Analyzed Coding_Schema_20251113.csv (312 pack definitions)
- [x] Designed two-layer hierarchical code system
- [x] Created complete SQL schema (5,300+ lines)
- [x] Mapped 150+ phase/option codes
- [x] Mapped 50+ Richmond option codes
- [x] Created CODE_SYSTEM_IMPLEMENTATION_GUIDE.md
- [x] Solved Richmond's triple-encoding problem

**Deliverables**:
- `database/schema/unified_code_system.sql` (5,300+ lines)
- `CODE_SYSTEM_IMPLEMENTATION_GUIDE.md`
- `BUILD_SCHEDULE.md`
- `WEEKLY_WRAP_UP_2025-11-14.md`
- `SESSION_NOTES_2025-11-14_BAT_Import_Tool.md`

**Architecture Decisions Made**:
1. ✅ Two-Layer Code System (Aggregate + Detailed)
2. ✅ Holt-Based Foundation with Richmond cross-references
3. ✅ Elevation as Dimension (NOT Variant)
4. ✅ Code Format: XXXX-XX.XX-XXXX

**Critical Translation Gaps Identified**:
1. ❌ No Holt translation integration (parser exists but not used)
2. ❌ No Custom translation support
3. ❌ Multi-code handling (comma-separated codes)
4. ❌ Elevation string normalization
5. ❌ Item type mapping (hard-coded)
6. ❌ Rule-based fallback (table-only lookup)
7. ❌ Learning/teaching mode
8. ❌ Poor error messages
9. ❌ No fuzzy matching

---

## 2025-11-15 - Week 2 Day 3: BAT v2.0 Development

**Planned Work**: BAT tool improvements and Excel enhancements
**Estimated Time**: 4 hours

### Session 1
- **Start**: 13:00
- **End**: 13:08
- **Duration**: 8 minutes (0.13 hours)
- **Activity**: Initial BAT tool review and assessment
- **Category**: Planning
- **Blockers**: None

### Session 2
- **Start**: 13:32
- **End**: 14:37
- **Duration**: 1 hour 5 minutes (1.08 hours)
- **Activity**: Repository reorganization, structure improvements, documentation cleanup
- **Category**: Maintenance
- **Blockers**: None

### Session 3
- **Start**: 16:45
- **End**: 19:13
- **Duration**: 2 hours 28 minutes (2.47 hours)
- **Activity**: BAT v2.0 implementation, Excel tools, educational documentation, Python CLI
- **Category**: Development
- **Blockers**: None

---

**Total Time**: 3 hours 41 minutes (3.68 hours)
**Planned vs Actual**: -0.32 hours (-8%) ✅ Excellent estimate!
**Completed Tasks**:
- [x] Reorganized repository structure for better clarity
- [x] Created REORGANIZATION_SUMMARY.md
- [x] Improved framework tools with enhanced error handling and UX
- [x] Created BAT v2.0 comprehensive design document
- [x] Added BAT import automation and workbook analysis
- [x] Created improved HOLT BAT Excel files (v2.0 with macros)
- [x] Added comprehensive educational documentation for BAT v2.0
- [x] Created unified code system for Excel and Python platforms
- [x] Added Python CLI tools for BAT System
- [x] Created Python cache files in .gitignore

**Major Commits** (10 PRs merged this day):
1. Reorganize repository structure for better clarity and discoverability
2. Improve framework tools with enhanced error handling and UX
3. Add BAT System v2.0 comprehensive design document
4. Add BAT v2.0 foundation
5. Add comprehensive educational documentation for BAT v2.0
6. Add improved Excel BAT files with comprehensive enhancements
7. Update to use correct HOLT BAT file and create improvement guide
8. Fix: Create macro-enabled .xlsm improved HOLT BAT
9. Add comprehensive educational documentation for BAT v2.0
10. Add comprehensive Python CLI tools for BAT System

**Technical Achievements**:
- Created macro-enabled HOLT BAT workbook with VBA automation
- Built Python CLI for BAT system operations
- Comprehensive educational materials for both Excel and Python approaches
- Fixed incorrect HOLT BAT file usage

**Lessons Learned**:
- Repository organization critical for discoverability
- Documentation needs to match actual code structure
- Excel and Python approaches can coexist and complement each other

---

## 2025-11-16 - Week 2 Day 4: BAT Phase 1 Implementation

**Planned Work**: Phase 1 foundation functions (normalizers, mappers)
**Estimated Time**: 3 hours

### Session 1
- **Start**: 13:00
- **End**: 13:08
- **Duration**: 8 minutes (0.13 hours)
- **Activity**: Weekly planning review, sprint status check
- **Category**: Planning
- **Blockers**: None

### Session 2
- **Start**: 13:32
- **End**: 14:37
- **Duration**: 1 hour 5 minutes (1.08 hours)
- **Activity**: Environment setup, dependency installation, todo list creation
- **Category**: Setup
- **Blockers**: None

### Session 3
- **Start**: 16:45
- **End**: 19:10
- **Duration**: 2 hours 25 minutes (2.42 hours)
- **Activity**: Phase 1 implementation - elevation normalizer and item type mapper
- **Category**: Development
- **Blockers**: None

---

**Total Time**: 3 hours 38 minutes (3.63 hours)
**Planned vs Actual**: +0.63 hours (+21%)
**Completed Tasks**:
- [x] Reviewed Sprint 1 status (Week 2/2, Day 9 complete)
- [x] Reviewed BUILD_SCHEDULE.md
- [x] Reviewed WEEKLY_WRAP_UP_2025-11-14.md
- [x] Installed Python dependencies (pandas, openpyxl, rapidfuzz)
- [x] Verified BAT system directory structure
- [x] Tested customer_code_mapping.py (working)
- [x] Confirmed Holt parser functioning
- [x] Created Phase 1-3 todo list (11 tasks)
- [x] Built elevation normalizer function with 13 test cases (all passing)
- [x] Built item type mapper function with 14 test cases (all passing)
- [x] Created BROADER_PROJECT_TASKS.md
- [x] Integrated normalizer into translate_richmond_code()
- [x] Updated session notes

**Code Deliverables**:
- `normalize_elevation()` function
  - Location: `bat_coding_system_builder.py:729-775`
  - Handles: "B, C, D" → "BCD", "b/c/d" → "BCD", etc.
  - Preserves universal marker "**"
  - Removes duplicates, sorts alphabetically
  - 13 comprehensive test cases, all passing

- `map_item_type()` function
  - Location: `customer_code_mapping.py:200-325`
  - Maps customer terminology → unified item type codes
  - Supports Holt activity codes (4085 → 1000, 4155 → 2100)
  - Supports Richmond/Custom terms (Framing → 1000, Siding → 2100)
  - Full taxonomy with 12 item type categories (1000-5200)
  - 14 test cases, all passing
  - Smart keyword matching for fuzzy term recognition

**Phase 1 Progress**:
- ✅ Task 1: Elevation normalizer (COMPLETE)
- ✅ Task 2: Item type mapper (COMPLETE)
- ⏳ Task 3: Multi-code splitter (pending)
- ✅ Unit tests for completed tasks

**User Confirmation**: "BAT system first, then databases"

---

## 2025-11-17 - Week 2 Day 5: Holt BAT Cross-Reference System

**Planned Work**: Holt BAT integration and cross-reference mapping
**Estimated Time**: 3 hours

### Session 1 (Morning)
- **Start**: 05:30
- **End**: 06:31
- **Duration**: 1 hour 1 minute (1.02 hours)
- **Activity**: GitHub merge conflicts resolution, RAH VBA system review
- **Category**: Maintenance & Research
- **Blockers**: Merge conflicts (resolved)

### Session 2 (Afternoon)
- **Start**: 15:37
- **End**: 17:34
- **Duration**: 1 hour 57 minutes (1.95 hours)
- **Activity**: Holt BAT cross-reference mapping tables, code system decisions
- **Category**: Development
- **Blockers**: None

---

**Total Time**: 2 hours 58 minutes (2.97 hours)
**Planned vs Actual**: -0.03 hours (-1%) ✅ Perfect estimate!
**Completed Tasks**:
- [x] Resolved GitHub merge conflicts on feature branch
- [x] Accepted main branch versions of cross-reference files
- [x] Merged main into feature branch successfully
- [x] Reviewed RAH Lumber Lock Enhanced VBA System (10 documentation files)
- [x] Reviewed richmond_problem_codes.csv (90 option-specific Richmond packs)
- [x] Analyzed IMPROVED_RICHMOND_BAT_NOVEMBER_2025.xlsm
- [x] Created UNIFIED_CODE_SYSTEM_DECISIONS.md (6 key decisions)
- [x] Created Holt BAT cross-reference system
- [x] Created Week 2 Day 1 summary document
- [x] Created HOLT_BAT_INTEGRATION_INSTRUCTIONS.md
- [x] Committed and pushed all changes

**Files Added**:
- `docs/Migration Strategy/Migration Files/RAH_Lumber_Lock_Enhanced_VBA_System/` (10 files)
- `docs/Migration Strategy/bat_coding_system_builder/richmond_problem_codes.csv`
- `BAT Files/IMPROVED_RICHMOND_BAT_NOVEMBER_2025.xlsm`
- `BAT Files/UNIFIED_CODE_SYSTEM_DECISIONS.md`

**Key Discovery**:
The Holt and Richmond BAT systems use **different code formats**:

| System | Format | Example |
|--------|--------|---------|
| Holt (proposed) | `PPPP-XXX.XXX-XX-XXXX` | `1670-010.000-AB-1000` |
| Richmond (existing) | `PPPP-PPP.000-EE-IIII` | `1670-101.000-AB-4085` |

**6 Pending Decisions Documented**:
1. Code format standard - Which format for both systems?
2. Phase/pack mapping - How do Holt phases align with Richmond packs?
3. Option handling - How to handle 90 option-specific packs?
4. Elevation codes - Letters, numbers, or `**` for all?
5. Item type codes - Holt 4085-series or simpler 1000-series?
6. Table structure - Simple mapping or full detail?

**RAH VBA System Review**:
- 10 documentation files with workflow controller patterns
- VBA best practices for dashboards, validation gates, audit trails
- Saved as reference for future BAT enhancements (Week 5-8)

**Richmond Problem Codes Analysis**:
- 90 option-specific Richmond packs requiring special handling
- Suffixes: `.tc`, `.4x`, `.rf`, `.sr`, `.xp`, etc.
- Contains proposed new phase codes for review

**Richmond BAT Analysis**:
- 46 sheets, 1,597 materials, 312 pack definitions
- Has existing CODE LEGEND: `PPPP-PPP.000-EE-IIII`
- Different from Holt proposed format

---

## 2025-11-18 - Week 2 Day 6: Code System Review & Holt Cost Codes

**Planned Work**: Code system review and Holt cost code analysis
**Estimated Time**: 3 hours

### Session 1
- **Start**: 05:38
- **End**: 06:02
- **Duration**: 24 minutes (0.40 hours)
- **Activity**: Initial documentation review, planning session
- **Category**: Research
- **Blockers**: None

### Session 2
- **Start**: 06:07
- **End**: 06:54
- **Duration**: 47 minutes (0.78 hours)
- **Activity**: Reviewing potentially_useful_information folder, analyzing uploaded files
- **Category**: Research
- **Blockers**: None

### Session 3
- **Start**: 16:30
- **End**: 17:20
- **Duration**: 50 minutes (0.83 hours)
- **Activity**: Extracted ZIP files, analyzed Material List and Sales Order CSV formats
- **Category**: Research & Documentation
- **Blockers**: None

### Session 4
- **Start**: 17:40
- **End**: 18:18
- **Duration**: 38 minutes (0.63 hours)
- **Activity**: Created BAT-Platform Integration Strategy, Holt cost code corrections
- **Category**: Documentation & Planning
- **Blockers**: None

---

**Total Time**: 2 hours 39 minutes (2.64 hours)
**Planned vs Actual**: -0.36 hours (-12%) ✅
**Completed Tasks**:
- [x] Reviewed docs/potentially_useful_information folder contents
- [x] Analyzed API patterns (customerApi.ts, quoteApi.ts, projectApi.ts, etc.)
- [x] Extracted and analyzed ZIP files to understand import format
- [x] Documented Material List CSV schema (Sku, Description, Elevation, Option, Pack, Quantity, Price)
- [x] Documented Sales Order CSV schema
- [x] Reviewed BAT tool architecture and current capabilities
- [x] Created 32-week BAT-Platform Integration Strategy
- [x] Corrected Holt cost code structure based on actual data
- [x] Updated documentation with correct Holt code format (7 files)
- [x] Created unified code system decision guide

**Key Deliverables**:
1. `docs/planning/BAT_PLATFORM_INTEGRATION_STRATEGY.md`
   - 32-week comprehensive integration roadmap
   - 5-phase approach
   - Export format well-defined: Material List + Sales Order CSVs in ZIP

2. `docs/potentially_useful_information/extracted/`
   - Extracted CSV/PDF files for analysis

3. Updated Holt Cost Code Documentation (7 files):
   - Corrected from incorrect merge data
   - Proper Holt code structure documented
   - Cross-reference tables updated

**Key Insights**:
- Platform expects `|XX NAME` pack format
- BAT uses `XXX.XXX` unified codes
- Translation layer needed between systems
- Export format is well-defined
- 5-phase integration over 32 weeks is realistic

**Holt Cost Code Structure Corrected**:
- Previous data was from incorrect merge
- Actual Holt structure: Hierarchical with plan-phase-elevation-activity
- Example: `167010100 - 4085` (Plan 1670, Phase 10, Elevation 1, Activity 4085)

---

## 2025-11-19 - Week 2 Day 7: BAT-Platform Integration Strategy

**Planned Work**: BAT-Platform integration planning finalization
**Estimated Time**: 3 hours

### Session 1
- **Start**: 14:20
- **End**: 15:00
- **Duration**: 40 minutes (0.67 hours)
- **Activity**: BAT-Platform integration strategy completion, 5-phase plan
- **Category**: Planning
- **Blockers**: None

---

**Total Time**: 40 minutes (0.67 hours)
**Planned vs Actual**: -2.33 hours (-78%) - Short day
**Completed Tasks**:
- [x] Finalized BAT-Platform Integration Strategy
- [x] Created 5-phase integration plan over 32 weeks
- [x] Documented export format requirements
- [x] Defined translation layer architecture

**5-Phase Integration Plan**:
1. **Phase 1 (Weeks 1-8)**: BAT Export Foundation
2. **Phase 2 (Weeks 9-16)**: Platform Import Foundation
3. **Phase 3 (Weeks 17-24)**: Integration & Testing
4. **Phase 4 (Weeks 25-28)**: Production Deployment
5. **Phase 5 (Weeks 29-32)**: Optimization & Training

**Export Format Requirements**:
- Material List CSV: Sku, Description, Elevation, Option, Pack, Quantity, Price
- Sales Order CSV: Order metadata and line items
- ZIP archive containing both files
- BOM character handling required

**Translation Layer Architecture**:
- Pack code translation: BAT `XXX.XXX` → Platform `|XX NAME`
- Elevation mapping: Numeric (1,2,3,4) → Alpha (A,B,C,D)
- Activity to item type mapping: 4085 → 1000, 4155 → 2100
- Reverse lookup capability for round-trip data sync

**Next Week Preparation**:
- [ ] Begin Phase 1 implementation: `bat_platform_export.py`
- [ ] Create reverse pack code translation table
- [ ] Test export with plan 1670

---

## Weekly Summary

| Day | Planned | Actual | Variance | Category Breakdown | Notes |
|-----|---------|--------|----------|-------------------|-------|
| Wed 11/13 | 2h | 3.72h | +1.72h | Planning: 3.17h, Docs: 0.55h | Code system planning |
| Thu 11/14 | 4h | 1.44h* | -2.56h | Planning: 1.12h, Docs: 0.32h | *+3h on separate branch |
| Fri 11/15 | 4h | 3.68h | -0.32h | Dev: 2.47h, Maint: 1.08h, Plan: 0.13h | BAT v2.0 ✅ |
| Sat 11/16 | 3h | 3.63h | +0.63h | Dev: 2.42h, Setup: 1.08h, Plan: 0.13h | Phase 1 complete ✅ |
| Sun 11/17 | 3h | 2.97h | -0.03h | Dev: 1.95h, Maint: 1.02h | Perfect estimate! ✅ |
| Mon 11/18 | 3h | 2.64h | -0.36h | Research: 2.01h, Docs: 0.63h | Holt codes ✅ |
| Tue 11/19 | 3h | 0.67h | -2.33h | Planning: 0.67h | Short day |
| **Total** | **22h** | **18.75h** | **-3.25h** | *Note: +3h on separate branch Thu | |

**Actual Total Including Separate Branch**: 21.75 hours

**Velocity This Week**: 0.99 (99% of planned time when including separate branch work)

**Time by Category**:
- Development: 6.84 hours (36%)
- Planning & Research: 7.47 hours (40%)
- Documentation: 2.50 hours (13%)
- Maintenance: 2.10 hours (11%)
- Setup: 1.08 hours (6%)
- Other Project: 0.72 hours (excluded from velocity)

**Blockers This Week** (Total: ~1 hour):
1. GitHub merge conflicts - 0.5h (resolved)
2. Environment setup and dependency installation - 0.5h

**What Went Well**:
- ✅ Completed two-layer code system design and implementation
- ✅ BAT v2.0 comprehensive development with 10 PRs merged in one day
- ✅ Phase 1 normalizers and mappers complete with comprehensive tests
- ✅ Excellent time estimates (3 days within 10% of plan)
- ✅ 5,300+ lines of production-ready SQL
- ✅ Repository reorganization improved clarity
- ✅ 32-week integration strategy completed

**What Needs Improvement**:
- ⚠️ Branch coordination - work split across branches needs better tracking
- ⚠️ Short days (Tue) should be flagged in advance
- ⚠️ Decision-making bottlenecks - 6 decisions still pending by week end

**Major Accomplishments**:
1. **Complete Unified Code System SQL Schema** (5,300+ lines)
   - 15 tables designed and implemented
   - 6 pre-built views for common queries
   - Auto-calculated GP% and cost variance
   - Sample data from first 10 CSV rows

2. **BAT v2.0 Development**
   - Improved Excel tools with VBA macros
   - Python CLI for BAT operations
   - Comprehensive educational documentation
   - Fixed incorrect HOLT BAT file usage

3. **Repository Reorganization**
   - Better structure and discoverability
   - Improved documentation alignment
   - Archive of old/unused materials

4. **Phase 1 Foundation Functions**
   - Elevation normalizer (13 tests passing)
   - Item type mapper (14 tests passing)
   - Full taxonomy with 12 categories

5. **Holt BAT Cross-Reference System**
   - UNIFIED_CODE_SYSTEM_DECISIONS.md
   - Cross-reference mapping tables
   - RAH VBA system analysis

6. **32-Week Integration Strategy**
   - BAT-Platform Integration Strategy complete
   - 5-phase approach defined
   - Export/import format requirements documented

**Lines of Code Written This Week**:
- SQL: 5,300+ lines
- Python: ~1,000+ lines
- VBA: ~500+ lines (Excel macros)
- Documentation: ~10,000+ lines

**Commits This Week**: 30+ commits
**Pull Requests Merged**: 15+ PRs

**Deliverables**:
1. `database/schema/unified_code_system.sql`
2. `CODE_SYSTEM_IMPLEMENTATION_GUIDE.md`
3. `BUILD_SCHEDULE.md`
4. `WEEKLY_WRAP_UP_2025-11-14.md`
5. `REORGANIZATION_SUMMARY.md`
6. BAT v2.0 Excel workbooks (improved HOLT and Richmond)
7. Python CLI tools for BAT System
8. BAT v2.0 educational documentation (5+ files)
9. `UNIFIED_CODE_SYSTEM_DECISIONS.md`
10. `HOLT_BAT_INTEGRATION_INSTRUCTIONS.md`
11. `BAT_PLATFORM_INTEGRATION_STRATEGY.md`
12. `SESSION_NOTES_2025-11-16.md`
13. `BROADER_PROJECT_TASKS.md`

---

**Next Week Plan** (Nov 20-26):
- Continue BAT Phase 1 (multi-code splitter)
- Phase 2: Holt Import Integration
- Phase 3: Intelligence features (fuzzy matching, learning mode)
- Begin Sprint 2: Code System Review
- Platform database integration planning

**Recommendation**:
Based on 0.99 velocity (including separate branch work), time estimates are accurate. Continue with current planning approach. Need to resolve 6 pending architectural decisions before proceeding with full BAT integration.

---

**Week Status**: ✅ Complete
**Next Week**: Platform Development & BAT Phase 2-3
**Confidence**: 🟢 High - Clear roadmap, solid foundation, excellent velocity
