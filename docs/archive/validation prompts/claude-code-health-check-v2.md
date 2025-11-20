# Claude Code Health Check v2.0
## With Baseline Tracking & Scope Selection

**Purpose**: Track codebase health over time with targeted analysis

**Time Required**: 10-60 minutes (depends on scope)

**Frequency**: Weekly to Quarterly (depends on tier)

---

## 🎯 Choose Your Scope + Tier

### Scope Options
- **`full`** - Entire codebase
- **`changed`** - Only files changed since last commit
- **`focus=<path>`** - Specific directory (e.g., `focus=src/services/`)

### Tier Options
- **Weekly (15 min)** - Essential health indicators
- **Monthly (45 min)** - Comprehensive review
- **Quarterly (90 min)** - Deep architectural analysis

---

## 📋 THE PROMPT

**Copy and paste into Claude.ai:**

```
Run codebase health check with baseline tracking.

## EXECUTION PARAMETERS

Scope: [full | changed | focus=<path>]
Tier: [weekly | monthly | quarterly]
Baseline file: [path to previous health-check-baseline.md, if exists]

## PROJECT CONTEXT
Repository: [name]
Tech stack: [e.g., TypeScript/React/Node.js]
Last check: [date, if known]

---

## BASELINE TRACKING SETUP

### First Run (No Baseline)
This will become your baseline. Run full analysis and save output as:
`health-check-baseline-[YYYY-MM-DD].md`

### Subsequent Runs (With Baseline)
Compare current state to baseline and report:

**Format:**
```markdown
## METRIC TRENDS

| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| TypeScript Errors | 0 | 3 | +3 | ⚠️ Regression |
| Test Coverage | 75% | 78% | +3% | ✅ Improved |
| TODO Count | 45 | 38 | -7 | ✅ Improved |
| Files >500 lines | 3 | 5 | +2 | ⚠️ Regression |
```

**Focus on changes:** Only highlight what's different from baseline.

---

## WEEKLY TIER (15 min) - ESSENTIAL HEALTH

### 1. COMPILE STATUS (2 min)
```bash
npx tsc --noEmit 2>&1 | head -20
```

**Report:**
- Error count: ___ (Baseline: ___)
- Top 3 errors by file
- Trend: ✅ Improving | ⚠️ Stable | ❌ Degrading

### 2. CODE QUALITY SNAPSHOT (5 min)
```bash
# File count
find src -name "*.ts" -o -name "*.tsx" | wc -l

# Large files
find src -type f -size +500k

# TODO/FIXME count
grep -r "TODO\|FIXME" src/ | wc -l

# Console.log count
grep -r "console.log" src/ | wc -l
```

**Report:**
- Files: ___ (Baseline: ___)
- Large files: ___ (Baseline: ___)
- TODOs: ___ (Baseline: ___ | Trend: ___)
- Console.logs: ___ (Baseline: ___ | Trend: ___)

### 3. GIT HEALTH (3 min)
```bash
git status
git log --oneline -10
git branch -vv
```

**Report:**
- Uncommitted changes: Yes/No
- Recent commit quality: Good/Fair/Poor
- Branch status: Up to date / Behind / Ahead
- Stale branches: [list if any]

### 4. DEPENDENCY ALERTS (5 min)
```bash
npm audit
npm outdated | head -10
```

**Report:**
- Critical vulnerabilities: ___ (Baseline: ___)
- High vulnerabilities: ___ (Baseline: ___)
- Outdated packages: ___ (Baseline: ___)
- Action required: Yes/No

## WEEKLY OUTPUT

```markdown
# Weekly Health Check - [Date]
Baseline: [date of baseline]
Scope: [scope run]

## 🎯 EXECUTIVE SUMMARY
Overall Health: ✅ Healthy | ⚠️ Needs Attention | ❌ Critical Issues

### Changes Since Baseline
✅ Improvements: [count]
⚠️ Regressions: [count]
❌ Critical Issues: [count]

### Top 3 Priorities This Week
1. [Priority 1 with impact assessment]
2. [Priority 2 with impact assessment]
3. [Priority 3 with impact assessment]

### Quick Wins (< 30 min each)
- [Quick fix 1]
- [Quick fix 2]

## 📊 DETAILED METRICS
[4 sections above with baseline comparisons]

## 🎬 RECOMMENDED ACTIONS
**Do This Week:**
- [Action 1]

**Backlog:**
- [Technical debt item]

**Monitor:**
- [Trend to watch]
```

---

## MONTHLY TIER (45 min) - COMPREHENSIVE REVIEW

### Includes All Weekly Checks PLUS:

### 5. TEST COVERAGE ANALYSIS (10 min)
```bash
npm run test:coverage
```

**Report with baseline:**
- Overall: ___% (Baseline: ___% | Change: +/- ___%)
- Statements: ___% (Baseline: ___)
- Branches: ___% (Baseline: ___)
- Functions: ___% (Baseline: ___)
- Lines: ___% (Baseline: ___)

**Gap Analysis:**
- Critical uncovered: [list top 5 files]
- Coverage trend: ✅ Improving | ❌ Declining

### 6. PERFORMANCE INDICATORS (10 min)
```bash
npm run build
ls -lh dist/

# If using Lighthouse
# Report scores
```

**Report with baseline:**
- Bundle size: ___ MB (Baseline: ___ | Change: ___)
- Build time: ___ sec (Baseline: ___ | Change: ___)
- Lighthouse score: ___ (Baseline: ___ | Change: ___)

### 7. ARCHITECTURE HEALTH (10 min)

**Analyze:**
- Circular dependencies
- Module coupling
- Layer violations
- Design pattern consistency

**Report:**
- Architectural issues: ___ (Baseline: ___)
- New circular deps: [list]
- Coupling hotspots: [top 3 files]

### 8. CODE COMPLEXITY (5 min)
```bash
# Find complex functions (if using complexity tool)
# Or manually identify files with deeply nested logic
```

**Report:**
- Functions >50 lines: ___ (Baseline: ___)
- Max nesting depth: ___ (Baseline: ___)
- Refactor candidates: [list top 5]

## MONTHLY OUTPUT

Includes everything from Weekly tier, plus trend analysis:

```markdown
# Monthly Health Check - [Date]

## 📈 TREND ANALYSIS (vs Baseline [date])

### Improving ✅
- Test coverage: +3% (great!)
- TODO count: -12 (good cleanup)
- Build time: -2 sec (optimization working)

### Stable ⚪
- File count: +5 (expected growth)
- Code complexity: ~same

### Degrading ❌
- TypeScript errors: +8 (needs immediate attention)
- Bundle size: +2.5 MB (investigate bloat)
- Large files: +3 (refactoring needed)

## 🎯 THIS MONTH'S PRIORITIES

### Must Fix (This Week)
1. **Resolve 8 new TypeScript errors**
   - Impact: Blocking type safety
   - Effort: ~4 hours
   - Owner: [assign]

### Should Fix (This Month)
2. **Reduce bundle size by 2 MB**
   - Impact: Performance degradation
   - Effort: ~8 hours (investigate + fix)
   - Approach: Analyze with webpack-bundle-analyzer

3. **Split 3 large files (>500 lines)**
   - Impact: Maintainability
   - Effort: ~6 hours
   - Files: [list]

### Nice to Have (Backlog)
- Increase test coverage to 80%
- Refactor 5 complex functions
- Update 10 outdated dependencies

## 📊 FULL METRICS
[All 8 sections with baseline comparisons]

## 🎬 ACTION PLAN

**Week 1:** Fix TypeScript errors
**Week 2:** Bundle size investigation
**Week 3:** Refactor large files
**Week 4:** Review progress, update baseline
```

---

## QUARTERLY TIER (90 min) - DEEP ARCHITECTURAL ANALYSIS

### Includes All Monthly Checks PLUS:

### 9. SECURITY POSTURE (15 min)
```bash
npm audit --production
# Check for common security issues
```

**Full security review:**
- Authentication/authorization audit
- Input validation coverage
- Secret management review
- CORS/headers configuration
- API security checklist

### 10. DOCUMENTATION COMPLETENESS (10 min)

**Audit:**
- README accuracy: Good/Fair/Poor
- API documentation: ___% coverage
- Architecture diagrams: Current/Outdated
- Onboarding guide: Exists/Missing
- Inline comments: Adequate/Sparse

### 11. TECHNICAL DEBT ASSESSMENT (15 min)

**Categorize all issues found:**
```markdown
## Technical Debt Register

| Item | Category | Impact | Effort | Priority | Age |
|------|----------|--------|--------|----------|-----|
| Split UserService | Maintainability | Med | 6h | P2 | 3mo |
| Fix TypeScript | Correctness | High | 4h | P0 | 2wk |
| Bundle bloat | Performance | Med | 8h | P1 | 1mo |
```

### 12. ROADMAP ALIGNMENT (10 min)

**Compare:**
- Current state vs 6-month roadmap
- Architectural goals vs reality
- Technical decisions vs original plan
- Areas diverging from strategy

## QUARTERLY OUTPUT

Includes everything from Monthly, plus strategic assessment:

```markdown
# Quarterly Health Check - Q[N] [Year]

## 📈 QUARTER SUMMARY

**Health Score: ___/100** (Baseline: ___)

### Quarter Highlights
✅ Major improvements: [list]
⚠️ Growing concerns: [list]
❌ Critical issues: [list]

### Trend Direction
- Overall: ✅ Improving | ⚪ Stable | ❌ Declining
- Code quality: [trend]
- Test coverage: [trend]
- Performance: [trend]
- Security: [trend]
- Documentation: [trend]

## 🎯 STRATEGIC PRIORITIES

### Q[N+1] Goals
1. **[Strategic Goal 1]**
   - Current state: [description]
   - Target state: [description]
   - Est. effort: [hours]
   - Success criteria: [measurable]

2. **[Strategic Goal 2]**
   [same format]

3. **[Strategic Goal 3]**
   [same format]

### Technical Debt Repayment Plan
- Total debt items: ___
- P0 (critical): ___ items
- P1 (high): ___ items
- Proposed sprint allocation: ___% (e.g., 20% of sprint capacity)

## 📊 COMPREHENSIVE METRICS
[All 12 sections with baseline comparisons + trend charts]

## 🎬 QUARTERLY ROADMAP

**Month 1:**
- [Strategic initiative]
- [Debt reduction goal]

**Month 2:**
- [Strategic initiative]
- [Debt reduction goal]

**Month 3:**
- [Strategic initiative]
- Review and establish new baseline

## 🔄 BASELINE UPDATE
This report becomes the new baseline for next quarter.
Save as: `health-check-baseline-[YYYY-MM-DD].md`
```

---

## 🎨 Scope Selection Examples

### Scope: Full
```
Analyze entire codebase
Use for: Regular scheduled checks, comprehensive reviews
```

### Scope: Changed
```bash
# Analyze only files changed since last commit
git diff --name-only HEAD~1
```

```
Use for: After feature branch merge, before PR review
Focus on: What actually changed vs running full analysis
```

### Scope: Focus=src/services/
```
Analyze only src/services/ directory
Use for: Module-specific deep dive, investigating specific area
```

**Example:**
```
"Run monthly health check with scope=focus=src/services/plan"

This will:
- Run all monthly checks
- BUT only on files in src/services/plan/
- Compare to baseline (if that directory was tracked)
- Report trends specific to that module
```

---

## 💡 Smart Usage Patterns

### Startup Pattern (First 3 Months)
```
Week 1: Full/Weekly → establish baseline
Weeks 2-4: Changed/Weekly → track weekly changes
Month 2: Full/Monthly → comprehensive check
Month 3: Full/Quarterly → strategic review → NEW BASELINE
```

### Maintenance Pattern (Ongoing)
```
Every Monday: Changed/Weekly (10 min)
First Friday: Full/Monthly (45 min)
Quarter-end: Full/Quarterly (90 min) → NEW BASELINE
```

### Crisis Pattern (When Issues Emerge)
```
Day 1: Focus/Weekly on problem area
Day 3: Full/Weekly to check for related issues
Week 2: Full/Monthly to assess impact
```

### Feature Development Pattern
```
Start of feature: Full/Weekly (know starting state)
During feature: Changed/Weekly (track changes)
End of feature: Full/Monthly (comprehensive check before merge)
```

---

## 📊 Baseline Management

### Creating Your First Baseline
```
1. Run: Full/Quarterly tier
2. Save output as: health-check-baseline-2025-11-13.md
3. Note in project docs: "Baseline established [date]"
4. Commit to repo for team visibility
```

### When to Update Baseline
```
✅ After major releases
✅ After significant refactors
✅ Quarterly (recommended)
✅ When current state becomes "new normal"

❌ Don't update after every small change
❌ Keep at least 2 historical baselines for comparison
```

### Baseline Comparison Format
```markdown
## COMPARISON TO BASELINE

Baseline: 2025-11-13 (3 months ago)
Current: 2025-02-13

### Key Changes
| Metric | Baseline | Current | Δ | Status |
|--------|----------|---------|---|--------|
| TS Errors | 5 | 2 | -3 | ✅ -60% |
| Test Cov | 72% | 78% | +6% | ✅ Improved |
| Files | 147 | 163 | +16 | ⚪ Expected |
| TODOs | 52 | 48 | -4 | ✅ -8% |
| Bundle | 2.1MB | 2.8MB | +0.7MB | ⚠️ +33% |

### Alarming Trends
- Bundle size grew 33% - investigate immediately
- [Other concerning trends]

### Positive Trends
- TypeScript errors down 60%
- Test coverage increased 6%
- TODO cleanup happening
```

---

## 🎓 Mastery Path

**Week 1: Setup**
- [ ] Run first Full/Weekly
- [ ] Save as baseline
- [ ] Understand each metric

**Month 1: Rhythm**
- [ ] Weekly checks become habit
- [ ] Track trends in spreadsheet
- [ ] First monthly review complete

**Quarter 1: Strategic**
- [ ] Quarterly review complete
- [ ] Baseline updated
- [ ] Technical debt plan created
- [ ] Team aligned on priorities

**Quarter 2+: Optimization**
- [ ] Automated checks integrated
- [ ] Trend dashboards created
- [ ] Predictive insights gained
- [ ] Continuous improvement culture

---

## 🔄 Related Prompts

- **Weekly quick check:** claude-code-validation-quick.md
- **Before commits:** implementation-validation-checklist.md
- **Specific issues:** Various as-needed prompts

---

**Remember**: The goal is tracking trends, not perfection. Focus on whether you're improving over time, not absolute scores.

**Version**: 2.0  
**Last Updated**: November 2025  
**New Features**: Baseline tracking, scope selection, tiered execution, trend analysis
