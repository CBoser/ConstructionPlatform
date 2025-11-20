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
