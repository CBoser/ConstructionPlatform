#!/bin/bash
# =============================================================================
# Health Report Generator
# Generates comprehensive markdown report for weekly valuation
# =============================================================================

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECKS_DIR="$SCRIPT_DIR/checks"
HISTORY_DIR="$PROJECT_ROOT/data/health-history"
REPORT_DIR="$PROJECT_ROOT/docs/health-reports"

# Ensure directories exist
mkdir -p "$REPORT_DIR" "$HISTORY_DIR"

# Date variables
DATE_STAMP=$(date +%Y-%m-%d)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
WEEK_NUMBER=$(date +%V)
YEAR=$(date +%Y)

# Report file
REPORT_FILE="$REPORT_DIR/health-report-${DATE_STAMP}.md"

# Collect data from each check
echo "Collecting health check data..."

# Run checks and capture JSON output
CQ_RESULT=$("$CHECKS_DIR/code-quality.sh" json 2>/dev/null || echo '{"overall_score":0}')
SEC_RESULT=$("$CHECKS_DIR/security.sh" json 2>/dev/null || echo '{"overall_score":0}')
PERF_RESULT=$("$CHECKS_DIR/performance.sh" json 2>/dev/null || echo '{"overall_score":0}')
TEST_RESULT=$("$CHECKS_DIR/test-coverage.sh" json 2>/dev/null || echo '{"overall_score":0}')
DOC_RESULT=$("$CHECKS_DIR/documentation.sh" json 2>/dev/null || echo '{"overall_score":0}')
SCALE_RESULT=$("$CHECKS_DIR/scalability.sh" json 2>/dev/null || echo '{"overall_score":0}')
DEBT_RESULT=$("$CHECKS_DIR/technical-debt.sh" json 2>/dev/null || echo '{"overall_score":0}')

# Extract scores
CQ_SCORE=$(echo "$CQ_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
SEC_SCORE=$(echo "$SEC_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
PERF_SCORE=$(echo "$PERF_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
TEST_SCORE=$(echo "$TEST_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DOC_SCORE=$(echo "$DOC_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
SCALE_SCORE=$(echo "$SCALE_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DEBT_SCORE=$(echo "$DEBT_RESULT" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

# Calculate overall score (weighted)
OVERALL_SCORE=$(( (CQ_SCORE * 20 + SEC_SCORE * 25 + PERF_SCORE * 15 + TEST_SCORE * 15 + DOC_SCORE * 10 + SCALE_SCORE * 10 + DEBT_SCORE * 5) / 100 ))

# Get previous week's data for comparison
PREV_HISTORY=$(ls -t "$HISTORY_DIR"/*.json 2>/dev/null | head -2 | tail -1)
PREV_OVERALL=0
if [ -f "$PREV_HISTORY" ]; then
    PREV_OVERALL=$(grep -o '"overall_score":\s*[0-9]*' "$PREV_HISTORY" | head -1 | grep -o '[0-9]*' || echo "0")
fi
SCORE_CHANGE=$((OVERALL_SCORE - PREV_OVERALL))

# Extract detailed metrics
# Security
SEC_CRITICAL=$(echo "$SEC_RESULT" | grep -o '"critical":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
SEC_HIGH=$(echo "$SEC_RESULT" | grep -o '"high":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
SEC_MEDIUM=$(echo "$SEC_RESULT" | grep -o '"medium":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
SEC_LOW=$(echo "$SEC_RESULT" | grep -o '"low":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

# Technical Debt
DEBT_CRITICAL=$(echo "$DEBT_RESULT" | grep -o '"critical":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DEBT_HIGH=$(echo "$DEBT_RESULT" | grep -o '"high":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DEBT_MEDIUM=$(echo "$DEBT_RESULT" | grep -o '"medium":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DEBT_LOW=$(echo "$DEBT_RESULT" | grep -o '"low":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
DEBT_TOTAL=$((DEBT_CRITICAL + DEBT_HIGH + DEBT_MEDIUM + DEBT_LOW))

# Test Coverage
TEST_LINE=$(echo "$TEST_RESULT" | grep -o '"line":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
TEST_BRANCH=$(echo "$TEST_RESULT" | grep -o '"branch":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

# Performance
BUNDLE_SIZE=$(echo "$PERF_RESULT" | grep -o '"bundle_size_kb":\s*[0-9]*' | grep -o '[0-9]*' || echo "0")
BUILD_TIME=$(echo "$PERF_RESULT" | grep -o '"build_time_seconds":\s*[0-9]*' | grep -o '[0-9]*' || echo "0")

# Helper function for status emoji
get_status_emoji() {
    local score=$1
    if [ "$score" -ge 90 ]; then
        echo "🟢"
    elif [ "$score" -ge 75 ]; then
        echo "🟡"
    elif [ "$score" -ge 60 ]; then
        echo "🟠"
    else
        echo "🔴"
    fi
}

# Helper function for status notes
get_status_notes() {
    local category=$1
    local score=$2

    case $category in
        "code_quality")
            if [ "$score" -ge 90 ]; then
                echo "Excellent code quality"
            elif [ "$score" -ge 75 ]; then
                echo "Good maintainability, low duplication"
            else
                echo "Review complexity and duplication"
            fi
            ;;
        "security")
            if [ "$score" -ge 90 ]; then
                echo "OWASP compliant, secure"
            elif [ "$score" -ge 75 ]; then
                echo "$SEC_HIGH high-priority issues to address"
            else
                echo "Critical security review needed"
            fi
            ;;
        "performance")
            if [ "$score" -ge 80 ]; then
                echo "Optimized, fast builds"
            elif [ "$score" -ge 60 ]; then
                echo "Bundle size could be optimized"
            else
                echo "Performance optimization needed"
            fi
            ;;
        "test_coverage")
            if [ "$score" -ge 80 ]; then
                echo "Good coverage across codebase"
            elif [ "$score" -ge 50 ]; then
                echo "Below target of 80%"
            else
                echo "Critical: Testing infrastructure needed"
            fi
            ;;
        "documentation")
            if [ "$score" -ge 80 ]; then
                echo "Comprehensive documentation"
            elif [ "$score" -ge 60 ]; then
                echo "Minor gaps in documentation"
            else
                echo "Documentation improvements needed"
            fi
            ;;
        "scalability")
            if [ "$score" -ge 80 ]; then
                echo "Production-ready architecture"
            elif [ "$score" -ge 60 ]; then
                echo "Some optimization needed"
            else
                echo "Scalability concerns to address"
            fi
            ;;
    esac
}

# Generate history trend
generate_trend_table() {
    local history_files=($(ls -t "$HISTORY_DIR"/*.json 2>/dev/null | head -8 | tac))
    local count=${#history_files[@]}

    if [ "$count" -lt 1 ]; then
        echo "| *No historical data available yet* | | |"
        return
    fi

    for file in "${history_files[@]}"; do
        local date=$(basename "$file" .json | sed 's/health-//')
        local score=$(grep -o '"overall_score":\s*[0-9]*' "$file" | head -1 | grep -o '[0-9]*' || echo "0")
        local emoji=$(get_status_emoji $score)
        echo "| $date | $score/100 | $emoji |"
    done
}

# Generate the report
echo "Generating health report..."

cat > "$REPORT_FILE" << EOF
# MindFlow Platform Health Report

**Generated:** $TIMESTAMP
**Report Period:** Week $WEEK_NUMBER, $YEAR
**Report Date:** $DATE_STAMP

---

## Executive Summary

**Overall Platform Health Score: $OVERALL_SCORE/100** $(get_status_emoji $OVERALL_SCORE)

EOF

# Add score change
if [ "$PREV_OVERALL" -gt 0 ]; then
    if [ "$SCORE_CHANGE" -gt 0 ]; then
        echo "**Week-over-Week Change:** +$SCORE_CHANGE points 📈" >> "$REPORT_FILE"
    elif [ "$SCORE_CHANGE" -lt 0 ]; then
        echo "**Week-over-Week Change:** $SCORE_CHANGE points 📉" >> "$REPORT_FILE"
    else
        echo "**Week-over-Week Change:** No change ➡️" >> "$REPORT_FILE"
    fi
fi

cat >> "$REPORT_FILE" << EOF

---

## Health Metrics Dashboard

| Category | Score | Status | Notes |
|----------|-------|--------|-------|
| **Code Quality** | $CQ_SCORE/100 | $(get_status_emoji $CQ_SCORE) | $(get_status_notes "code_quality" $CQ_SCORE) |
| **Security** | $SEC_SCORE/100 | $(get_status_emoji $SEC_SCORE) | $(get_status_notes "security" $SEC_SCORE) |
| **Performance** | $PERF_SCORE/100 | $(get_status_emoji $PERF_SCORE) | $(get_status_notes "performance" $PERF_SCORE) |
| **Test Coverage** | $TEST_SCORE/100 | $(get_status_emoji $TEST_SCORE) | $(get_status_notes "test_coverage" $TEST_SCORE) |
| **Documentation** | $DOC_SCORE/100 | $(get_status_emoji $DOC_SCORE) | $(get_status_notes "documentation" $DOC_SCORE) |
| **Scalability** | $SCALE_SCORE/100 | $(get_status_emoji $SCALE_SCORE) | $(get_status_notes "scalability" $SCALE_SCORE) |

---

## Security Overview

### Vulnerability Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | $SEC_CRITICAL | $( [ "$SEC_CRITICAL" -eq 0 ] && echo "✅" || echo "⚠️" ) |
| High | $SEC_HIGH | $( [ "$SEC_HIGH" -le 2 ] && echo "✅" || echo "⚠️" ) |
| Medium | $SEC_MEDIUM | $( [ "$SEC_MEDIUM" -le 10 ] && echo "✅" || echo "⚠️" ) |
| Low | $SEC_LOW | ✅ |

EOF

# Add security notes if there are issues
if [ "$SEC_CRITICAL" -gt 0 ] || [ "$SEC_HIGH" -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF

### Security Action Items

EOF
    [ "$SEC_CRITICAL" -gt 0 ] && echo "- 🔴 **CRITICAL:** $SEC_CRITICAL critical vulnerabilities require immediate attention" >> "$REPORT_FILE"
    [ "$SEC_HIGH" -gt 0 ] && echo "- 🟠 **HIGH:** $SEC_HIGH high-severity issues should be addressed this week" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

---

## Technical Debt

### Debt Inventory

| Priority | Count | Description |
|----------|-------|-------------|
| **Critical** | $DEBT_CRITICAL | FIXME items requiring immediate attention |
| **High** | $DEBT_HIGH | Priority TODOs, HACKs, workarounds |
| **Medium** | $DEBT_MEDIUM | Standard TODOs, deprecated code |
| **Low** | $DEBT_LOW | Console.log, commented code |

**Total Debt Items:** $DEBT_TOTAL

EOF

# Calculate debt change if we have previous data
if [ -f "$PREV_HISTORY" ]; then
    PREV_DEBT_TOTAL=$(grep -o '"total":\s*[0-9]*' "$PREV_HISTORY" 2>/dev/null | tail -1 | grep -o '[0-9]*' || echo "$DEBT_TOTAL")
    DEBT_CHANGE=$((DEBT_TOTAL - PREV_DEBT_TOTAL))

    cat >> "$REPORT_FILE" << EOF

### Technical Debt Change This Week

- **Previous Week:** $PREV_DEBT_TOTAL items
- **Current Week:** $DEBT_TOTAL items
- **Net Change:** $( [ "$DEBT_CHANGE" -le 0 ] && echo "$DEBT_CHANGE items ✅" || echo "+$DEBT_CHANGE items ⚠️" )

EOF
fi

cat >> "$REPORT_FILE" << EOF

---

## Performance Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Bundle Size | ${BUNDLE_SIZE}KB | <500KB | $( [ "$BUNDLE_SIZE" -lt 500 ] && echo "✅" || echo "⚠️" ) |
| Build Time | ${BUILD_TIME}s | <60s | $( [ "$BUILD_TIME" -lt 60 ] && echo "✅" || echo "⚠️" ) |
| Load Time Est. | ~${PERF_SCORE}% | >80% | $(get_status_emoji $PERF_SCORE) |

---

## Test Coverage

| Metric | Coverage | Target | Status |
|--------|----------|--------|--------|
| Line Coverage | ${TEST_LINE}% | 80% | $( [ "$TEST_LINE" -ge 80 ] && echo "✅" || echo "⚠️" ) |
| Branch Coverage | ${TEST_BRANCH}% | 70% | $( [ "$TEST_BRANCH" -ge 70 ] && echo "✅" || echo "⚠️" ) |

EOF

if [ "$TEST_SCORE" -lt 60 ]; then
    cat >> "$REPORT_FILE" << EOF

### Test Coverage Recommendations

- Set up comprehensive testing infrastructure (Vitest/Jest)
- Focus on critical paths: authentication, API routes, business logic
- Target 80% line coverage for production readiness

EOF
fi

cat >> "$REPORT_FILE" << EOF

---

## Historical Trend

| Date | Score | Status |
|------|-------|--------|
$(generate_trend_table)

---

## Recommendations

### High Priority

EOF

# Generate recommendations based on scores
REC_NUM=1

if [ "$SEC_SCORE" -lt 90 ]; then
    echo "$REC_NUM. **Security:** Address $((SEC_CRITICAL + SEC_HIGH)) critical/high security vulnerabilities" >> "$REPORT_FILE"
    REC_NUM=$((REC_NUM + 1))
fi

if [ "$TEST_SCORE" -lt 60 ]; then
    echo "$REC_NUM. **Testing:** Increase test coverage from ${TEST_LINE}% to 80% target" >> "$REPORT_FILE"
    REC_NUM=$((REC_NUM + 1))
fi

if [ "$DEBT_CRITICAL" -gt 0 ]; then
    echo "$REC_NUM. **Technical Debt:** Resolve $DEBT_CRITICAL critical FIXME items" >> "$REPORT_FILE"
    REC_NUM=$((REC_NUM + 1))
fi

cat >> "$REPORT_FILE" << EOF

### Medium Priority

EOF

if [ "$DOC_SCORE" -lt 80 ]; then
    echo "- Improve documentation coverage (currently ${DOC_SCORE}%)" >> "$REPORT_FILE"
fi

if [ "$PERF_SCORE" -lt 80 ]; then
    echo "- Optimize bundle size and build performance" >> "$REPORT_FILE"
fi

if [ "$SCALE_SCORE" -lt 80 ]; then
    echo "- Review scalability patterns (caching, pagination, indexes)" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

---

## Integration with Weekly Valuation

This section is formatted for direct inclusion in the weekly valuation report:

\`\`\`markdown
## 11. Health Metrics

### Platform Health Score: $OVERALL_SCORE/100

| Category | Score | Status | Notes |
|----------|-------|--------|-------|
| **Code Quality** | $CQ_SCORE/100 | $(get_status_emoji $CQ_SCORE) | $(get_status_notes "code_quality" $CQ_SCORE) |
| **Security** | $SEC_SCORE/100 | $(get_status_emoji $SEC_SCORE) | $(get_status_notes "security" $SEC_SCORE) |
| **Performance** | $PERF_SCORE/100 | $(get_status_emoji $PERF_SCORE) | $(get_status_notes "performance" $PERF_SCORE) |
| **Test Coverage** | $TEST_SCORE/100 | $(get_status_emoji $TEST_SCORE) | $(get_status_notes "test_coverage" $TEST_SCORE) |
| **Documentation** | $DOC_SCORE/100 | $(get_status_emoji $DOC_SCORE) | $(get_status_notes "documentation" $DOC_SCORE) |
| **Scalability** | $SCALE_SCORE/100 | $(get_status_emoji $SCALE_SCORE) | $(get_status_notes "scalability" $SCALE_SCORE) |

### Technical Debt
- **Critical Issues:** $DEBT_CRITICAL
- **High Priority:** $DEBT_HIGH
- **Medium Priority:** $DEBT_MEDIUM
- **Low Priority:** $DEBT_LOW

**Technical Debt Reduction This Week:**
- Previous: $PREV_DEBT_TOTAL items
- Current: $DEBT_TOTAL items
- Net change: $( [ "$DEBT_CHANGE" -le 0 ] && echo "$DEBT_CHANGE items ✅" || echo "+$DEBT_CHANGE items" )
\`\`\`

---

*Report generated by MindFlow Health Check System v1.0*
*Run \`./scripts/health-check.sh\` for real-time analysis*
EOF

echo ""
echo "Health report generated: $REPORT_FILE"

# Also save current data to history
HISTORY_FILE="$HISTORY_DIR/health-${DATE_STAMP}.json"
cat > "$HISTORY_FILE" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$DATE_STAMP",
    "week": $WEEK_NUMBER,
    "year": $YEAR,
    "overall_score": $OVERALL_SCORE,
    "scores": {
        "code_quality": $CQ_SCORE,
        "security": $SEC_SCORE,
        "performance": $PERF_SCORE,
        "test_coverage": $TEST_SCORE,
        "documentation": $DOC_SCORE,
        "scalability": $SCALE_SCORE,
        "technical_debt": $DEBT_SCORE
    },
    "security": {
        "critical": $SEC_CRITICAL,
        "high": $SEC_HIGH,
        "medium": $SEC_MEDIUM,
        "low": $SEC_LOW
    },
    "debt": {
        "critical": $DEBT_CRITICAL,
        "high": $DEBT_HIGH,
        "medium": $DEBT_MEDIUM,
        "low": $DEBT_LOW,
        "total": $DEBT_TOTAL
    },
    "performance": {
        "bundle_size_kb": $BUNDLE_SIZE,
        "build_time_seconds": $BUILD_TIME
    },
    "test_coverage": {
        "line": $TEST_LINE,
        "branch": $TEST_BRANCH
    }
}
EOF

echo "History saved: $HISTORY_FILE"
