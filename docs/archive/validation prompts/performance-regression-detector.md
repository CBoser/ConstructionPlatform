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
