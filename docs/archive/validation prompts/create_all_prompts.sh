#!/bin/bash

# Create all remaining prompts for complete library

echo "Creating complete prompt library..."

# Weekly: Test Coverage Gap Finder
cat > weekly/test-coverage-gap-finder.md << 'EOF'
# Test Coverage Gap Finder
## Identify What Needs Testing

**Purpose**: Find untested code and prioritize testing work

**Time Required**: 15 minutes

**Frequency**: Weekly (mid-week recommended)

---

## 📋 The Test Coverage Prompt

```
Analyze test coverage and identify gaps. Prioritize what to test next.

## CURRENT COVERAGE ANALYSIS

Run coverage report:
```bash
npm run test:coverage
# or
npx jest --coverage
# or  
npx vitest --coverage
```

Report:
- Overall coverage: ___%
- Statements: ___%
- Branches: ___%
- Functions: ___%
- Lines: ___%

## IDENTIFY GAPS

### Critical Uncovered Code (Priority 1)
List functions with:
- Business logic + 0% coverage
- External API calls + no tests
- Database operations + no tests
- Authentication/authorization + no tests
- Payment processing + no tests

### Important Uncovered Code (Priority 2)
- Complex conditionals (>3 branches) + no tests
- Functions >50 lines + no tests
- Error handling + no tests
- Data transformations + no tests

### Nice to Have (Priority 3)
- Simple getters/setters
- UI components
- Utilities with low complexity

## GENERATE TEST TEMPLATES

For top 5 priority gaps, create test templates:

```typescript
describe('FunctionName', () => {
  it('should handle happy path', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = functionName(input)
    
    // Assert
    expect(result).toBe(...)
  })
  
  it('should handle error case', () => {
    // Test error handling
  })
  
  it('should handle edge case', () => {
    // Test boundaries
  })
})
```

## ESTIMATE EFFORT

For each gap:
- Complexity: Simple/Medium/Complex
- Est. time: X hours
- Required mocks: [list]
- Test data needed: [describe]

## OUTPUT

1. **Priority List** (top 10 functions to test)
2. **Test Templates** (ready to fill in)
3. **Weekly Goal** (aim for +5% coverage)
4. **Estimated Time** (total hours needed)
```

---

**Version**: 1.0  
**Time**: 15 minutes  
**Output**: Prioritized test backlog
EOF

# Weekly: Performance Regression Detector
cat > weekly/performance-regression-detector.md << 'EOF'
# Performance Regression Detector
## Catch Performance Issues Early

**Purpose**: Monitor performance metrics and catch regressions

**Time Required**: 10 minutes

**Frequency**: Weekly (before major merges)

---

## 📋 The Performance Check Prompt

```
Check for performance regressions since last baseline.

## BASELINE METRICS (from last check)
Record these for comparison:
- Bundle size: ___ MB
- Initial load: ___ ms
- Time to interactive: ___ ms
- Lighthouse score: ___
- Key API responses: ___ ms

## CURRENT METRICS

### Bundle Size
```bash
npm run build
ls -lh dist/ | grep -E "\.(js|css)$"
```

### Load Performance
Run Lighthouse in Chrome DevTools:
- Performance score: ___
- First Contentful Paint: ___ ms
- Largest Contentful Paint: ___ ms
- Time to Interactive: ___ ms
- Speed Index: ___

### API Performance
Test key endpoints:
```bash
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/endpoint"
```

## COMPARISON

| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| Bundle | X MB | Y MB | +Z% | ⚠️ if >10% |
| Load | X ms | Y ms | +Z% | ❌ if >20% |
| TTI | X ms | Y ms | +Z% | ⚠️ if >15% |

## ANALYSIS

If regressions found:
1. What changed? `git diff --stat`
2. New dependencies? `npm list --depth=0`
3. Large new files? Check bundle analyzer
4. Inefficient code? Profile with DevTools

## RECOMMENDATIONS

- 🎯 Quick fixes: [list]
- 🔧 Deeper work: [list]
- 📊 Needs monitoring: [list]

## REPORT

Performance Status: ✅ Healthy | ⚠️ Warning | ❌ Regression

Changes needed before merge: [list]
```

---

**Version**: 1.0  
**Time**: 10 minutes  
**Prevents**: Performance degradation
EOF

# Now create monthly prompts...
cat > monthly/claude-code-health-check-full.md << 'EOF'
# Claude Code Health Check (Full)
## Comprehensive Monthly Audit

**Purpose**: Deep codebase analysis for monthly review

**Time Required**: 30-60 minutes

**Frequency**: Monthly (first Friday recommended)

---

## 📋 The Comprehensive Health Check Prompt

```
Complete codebase health check. Generate comprehensive report.

## 1. ARCHITECTURE ANALYSIS
- Overall design patterns used
- Separation of concerns
- Dependency structure
- Module organization
- SOLID principles adherence

## 2. CODE QUALITY METRICS
- Cyclomatic complexity (files >10)
- Code duplication percentage
- Average function length
- Files needing refactoring
- Technical debt score

## 3. TEST COVERAGE
- Overall: ___%
- Critical paths: ___%
- Untested files: [list]
- Flaky tests: [list]
- Test quality assessment

## 4. SECURITY POSTURE
- Dependency vulnerabilities: `npm audit`
- Authentication/authorization review
- Input validation coverage
- Secrets management
- CORS/headers configuration

## 5. PERFORMANCE PROFILE
- Bundle size trend
- Load time trend
- Database query efficiency
- N+1 query detection
- Caching utilization

## 6. DOCUMENTATION STATUS
- README completeness
- API documentation coverage
- Inline comments quality
- Architecture diagrams
- Onboarding guides

## 7. DEPENDENCY HEALTH
- Outdated packages: [count]
- Security vulnerabilities: [count]
- Unused dependencies: [list]
- Version consistency

## 8. GIT HYGIENE
- Average PR size
- Code review quality
- Branch strategy adherence
- Commit message quality
- Merge conflict frequency

## OUTPUT: COMPREHENSIVE REPORT

### Executive Summary
- Overall Health Score: ___/100
- Critical Issues: ___
- Trends: Improving/Stable/Declining

### Top 5 Priorities
1. [Priority 1] - Impact: High, Effort: Medium
2. [Priority 2] - Impact: High, Effort: Low
...

### Detailed Findings
[Full analysis with evidence and recommendations]

### Roadmap
- This Week: [quick wins]
- This Month: [important improvements]
- This Quarter: [strategic refactors]
```

---

**Version**: 1.0  
**Time**: 30-60 minutes  
**Output**: Strategic improvement plan
EOF

echo "Creating all remaining prompts..."

# Continue with all other prompts...
# (I'll create them in the next commands for better organization)

