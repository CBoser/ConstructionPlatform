# MindFlow Platform Health Check System

A comprehensive automated code and security health analysis system for the MindFlow Platform.

## Overview

The Health Check System provides automated analysis of your codebase across seven key dimensions:

1. **Code Quality** - Complexity, maintainability, duplication, style compliance
2. **Security** - Vulnerabilities, secrets detection, configuration security
3. **Performance** - Bundle size, build time, dependencies, efficiency
4. **Test Coverage** - Line, branch, function, and statement coverage
5. **Documentation** - README, code comments, API docs, type documentation
6. **Scalability** - Database optimization, caching, API design, infrastructure
7. **Technical Debt** - TODOs, FIXMEs, deprecated code, workarounds

## Quick Start

### Run All Checks

```bash
./scripts/health-check.sh
```

### Generate Weekly Report

```bash
./scripts/health-check.sh --report
```

### JSON Output (for CI/CD)

```bash
./scripts/health-check.sh --json
```

### Run Specific Check

```bash
./scripts/health-check.sh --check security
./scripts/health-check.sh --check code-quality
./scripts/health-check.sh --check performance
```

## Command Reference

```
Usage: ./scripts/health-check.sh [OPTIONS]

Options:
  --json          Output results in JSON format
  --report        Generate markdown report
  --quiet, -q     Minimal output (just scores)
  --check NAME    Run specific check only
  --help, -h      Show help message

Available checks:
  - code-quality
  - security
  - performance
  - test-coverage
  - documentation
  - scalability
  - technical-debt
```

## Understanding Scores

### Score Ranges

| Range | Status | Icon | Description |
|-------|--------|------|-------------|
| 90-100 | Excellent | 🟢 | Production-ready, best practices followed |
| 75-89 | Good | 🟡 | Minor improvements recommended |
| 60-74 | Fair | 🟠 | Several areas need attention |
| 0-59 | Needs Work | 🔴 | Critical issues to address |

### Overall Score Calculation

The overall health score is a weighted average:

| Category | Weight |
|----------|--------|
| Security | 25% |
| Code Quality | 20% |
| Performance | 15% |
| Test Coverage | 15% |
| Documentation | 10% |
| Scalability | 10% |
| Technical Debt | 5% |

## Check Modules

### 1. Code Quality (`code-quality.sh`)

**Analyzes:**
- Cyclomatic complexity per function
- File and function length
- Code duplication patterns
- ESLint errors and warnings
- TypeScript strict mode compliance
- `any` type usage

**Scoring Factors:**
- Files with complexity >15: HIGH penalty
- Files with complexity >10: MEDIUM penalty
- Files >500 lines: penalty
- Functions >80 lines: penalty
- ESLint errors: CRITICAL penalty
- ESLint warnings: LOW penalty

**How to Improve:**
```bash
# Run ESLint auto-fix
npm run lint --fix

# Check TypeScript errors
npm run typecheck

# Review complex files
./scripts/checks/code-quality.sh
```

### 2. Security (`security.sh`)

**Analyzes:**
- npm audit vulnerabilities
- Secrets in code (API keys, passwords, tokens)
- SQL injection patterns
- XSS vulnerabilities
- Security header configuration (Helmet.js)
- CORS configuration
- Rate limiting
- Authentication patterns

**Scoring Factors:**
- Critical vulnerabilities: -40 points each
- High vulnerabilities: -15 points each
- Secrets in code: -50 points each
- Missing security headers: penalty
- Missing rate limiting: penalty

**How to Improve:**
```bash
# Fix npm vulnerabilities
npm audit fix

# Review security findings
./scripts/checks/security.sh

# Update dependencies
npm update
```

### 3. Performance (`performance.sh`)

**Analyzes:**
- Frontend bundle size (total and gzipped)
- TypeScript/build time
- Total dependency count
- Large source files
- Database query patterns (N+1)
- Lazy loading implementation

**Target Metrics:**
- Bundle size: <500KB gzipped
- Build time: <60 seconds
- Dependencies: <100 total

**How to Improve:**
```bash
# Analyze bundle
npm run build --analyze

# Check for large dependencies
npm ls --all | head -50

# Review performance metrics
./scripts/checks/performance.sh
```

### 4. Test Coverage (`test-coverage.sh`)

**Analyzes:**
- Test framework presence (Jest/Vitest)
- Test file count
- Line/branch/function coverage
- Critical untested files
- Test quality indicators

**Target Metrics:**
- Line coverage: 80%
- Branch coverage: 70%
- Function coverage: 80%

**How to Improve:**
```bash
# Set up testing (if not present)
npm install -D vitest @vitest/coverage-v8

# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

### 5. Documentation (`documentation.sh`)

**Analyzes:**
- README completeness (expected sections)
- Code comment ratio
- JSDoc coverage on exports
- API endpoint documentation
- Architecture documentation

**Expected README Sections:**
- Installation/Setup
- Usage/Quick Start
- API/Endpoints
- Configuration
- Development/Contributing
- Testing
- Deployment
- Architecture
- License
- Features

**How to Improve:**
```bash
# Check documentation gaps
./scripts/checks/documentation.sh

# Generate API docs (if using tools)
npm run docs:generate
```

### 6. Scalability (`scalability.sh`)

**Analyzes:**
- Database indexes on relations
- Connection pooling configuration
- Pagination implementation
- API versioning
- Rate limiting
- Caching strategy
- Docker/CI-CD presence
- Health check endpoints

**How to Improve:**
```bash
# Add indexes in Prisma schema
# Add @@index([fieldName]) to frequently queried fields

# Implement pagination
# Use skip/take in Prisma queries

# Review scalability issues
./scripts/checks/scalability.sh
```

### 7. Technical Debt (`technical-debt.sh`)

**Tracks:**
- `FIXME` comments (Critical)
- `TODO` with priority keywords (High)
- `HACK`, `XXX`, workarounds (High)
- Regular `TODO` comments (Medium)
- `@deprecated` markers (Medium)
- `console.log` statements (Low)
- Commented-out code blocks (Low)

**Priority Keywords:**
- urgent, critical, important, high, priority, asap, !

**How to Reduce:**
```bash
# Find all debt items
./scripts/checks/technical-debt.sh

# Search for specific patterns
grep -rn "FIXME" frontend/src backend/src
grep -rn "TODO.*priority" frontend/src backend/src
```

## Configuration

### Config File: `config/health-check.config.json`

```json
{
  "thresholds": {
    "codeQuality": {
      "complexity": { "max": 10 },
      "maintainability": { "min": 70 }
    },
    "security": {
      "criticalVulns": { "max": 0 },
      "highVulns": { "max": 2 }
    }
  },
  "paths": {
    "frontend": "frontend/src",
    "backend": "backend/src",
    "ignore": ["node_modules", "dist"]
  }
}
```

### Customizing Thresholds

Edit `config/health-check.config.json` to adjust:
- Maximum acceptable values
- Scoring weights
- Paths to scan/ignore
- Alert conditions

## Output Formats

### CLI Output (Default)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏥 MindFlow Platform Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Running checks...

  Running Code Quality...     [████████████████░░░░] 82/100
  Running Security...         [██████████████████░░] 92/100
  ...

  Overall Platform Health: 77/100 🟡
```

### JSON Output

```json
{
  "overall_score": 77,
  "scores": {
    "code_quality": 82,
    "security": 92,
    "performance": 78,
    "test_coverage": 45,
    "documentation": 88,
    "scalability": 80,
    "technical_debt": 75
  }
}
```

### Markdown Report

Generated at: `docs/health-reports/health-report-YYYY-MM-DD.md`

Includes:
- Executive summary
- Detailed metrics tables
- Security vulnerability breakdown
- Technical debt inventory
- Historical trend chart
- Formatted section for weekly valuation

## Historical Tracking

### Data Storage

Health metrics are stored in `data/health-history/` as JSON files:
- `health-2024-01-15.json`
- `health-2024-01-22.json`
- etc.

### Viewing Trends

The CLI output includes a trend visualization:

```
Health Score Trend (Last 8 entries):
  2024-01-01: ████████████████████████████░░░░ 75/100
  2024-01-08: ██████████████████████████████░░ 80/100
  2024-01-15: ████████████████████████████████ 85/100
```

### Data Retention

By default, reports are retained for:
- Health reports: 52 weeks (1 year)
- History JSON: 365 days

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/health-check.yml
name: Health Check

on:
  schedule:
    - cron: '0 9 * * 5'  # Every Friday at 9am
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install --prefix frontend
          npm install --prefix backend

      - name: Run Health Check
        run: ./scripts/health-check.sh --json > health-results.json

      - name: Check Thresholds
        run: |
          SCORE=$(jq '.overall_score' health-results.json)
          if [ "$SCORE" -lt 70 ]; then
            echo "Health score below threshold: $SCORE"
            exit 1
          fi

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: |
            health-results.json
            docs/health-reports/
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run quick health check
SCORE=$(./scripts/health-check.sh --quiet | grep "Overall:" | grep -o '[0-9]*')

if [ "$SCORE" -lt 60 ]; then
    echo "⚠️  Health score too low: $SCORE/100"
    echo "Run ./scripts/health-check.sh for details"
    exit 1
fi
```

## Troubleshooting

### Common Issues

**"Permission denied" when running scripts**
```bash
chmod +x scripts/health-check.sh
chmod +x scripts/checks/*.sh
chmod +x scripts/generate-health-report.sh
```

**"npm: command not found"**
- Ensure Node.js is installed
- Check PATH includes node/npm

**"ESLint errors during check"**
- This is expected behavior
- The check reports ESLint issues as part of code quality

**Slow execution**
- First run may be slower (npm installing, TypeScript compiling)
- Subsequent runs use cached data

### Debug Mode

```bash
# Run with verbose output
bash -x ./scripts/health-check.sh

# Run individual check with debug
bash -x ./scripts/checks/security.sh
```

## Best Practices

### Weekly Routine

1. Run health check every Friday
2. Review the generated report
3. Address critical/high issues before next week
4. Track trends over time

### Before Major Releases

1. Run full health check
2. Ensure security score >90
3. Resolve all critical issues
4. Generate report for documentation

### Code Review Integration

Include health metrics in PR reviews:
- Did the PR introduce new technical debt?
- Are tests included for new code?
- Does security score remain stable?

## File Structure

```
mindflow-platform/
├── scripts/
│   ├── health-check.sh           # Main orchestrator
│   ├── generate-health-report.sh # Report generator
│   └── checks/
│       ├── code-quality.sh
│       ├── security.sh
│       ├── performance.sh
│       ├── test-coverage.sh
│       ├── documentation.sh
│       ├── scalability.sh
│       └── technical-debt.sh
├── config/
│   └── health-check.config.json  # Configuration
├── data/
│   └── health-history/           # Historical data
│       └── health-YYYY-MM-DD.json
└── docs/
    ├── HEALTH_CHECK_SYSTEM.md    # This file
    └── health-reports/           # Generated reports
        └── health-report-YYYY-MM-DD.md
```

## Contributing

To add a new check module:

1. Create `scripts/checks/your-check.sh`
2. Implement the check logic
3. Support `json` output format parameter
4. Return `overall_score` in JSON output
5. Update weights in main health-check.sh
6. Document in this file

---

*MindFlow Health Check System v1.0*
*For issues or suggestions, contact the development team.*
