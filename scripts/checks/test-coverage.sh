#!/bin/bash
# =============================================================================
# Test Coverage Check Module
# Analyzes test coverage, test structure, and identifies untested areas
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Output format (cli or json)
OUTPUT_FORMAT="${1:-cli}"

# Initialize scores
LINE_COVERAGE_SCORE=0
BRANCH_COVERAGE_SCORE=0
FUNCTION_COVERAGE_SCORE=0
STATEMENT_COVERAGE_SCORE=0

# Coverage percentages
LINE_COVERAGE=0
BRANCH_COVERAGE=0
FUNCTION_COVERAGE=0
STATEMENT_COVERAGE=0

# Test metrics
TOTAL_TESTS=0
TEST_FILES=0
UNTESTED_FILES=0

# Critical untested areas
declare -a UNTESTED_CRITICAL
declare -a RECOMMENDATIONS

# =============================================================================
# 1. ANALYZE TEST INFRASTRUCTURE
# =============================================================================
analyze_test_infrastructure() {
    local has_jest=false
    local has_vitest=false
    local has_test_config=false
    local test_framework="none"

    # Check frontend for test framework
    if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        if grep -q '"vitest"' "$PROJECT_ROOT/frontend/package.json" 2>/dev/null; then
            has_vitest=true
            test_framework="vitest"
        fi
        if grep -q '"jest"' "$PROJECT_ROOT/frontend/package.json" 2>/dev/null; then
            has_jest=true
            test_framework="jest"
        fi

        # Check for test config files
        if [ -f "$PROJECT_ROOT/frontend/vitest.config.ts" ] || [ -f "$PROJECT_ROOT/frontend/jest.config.js" ]; then
            has_test_config=true
        fi
    fi

    # Check backend for test framework
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        if grep -q '"vitest"' "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
            has_vitest=true
            test_framework="vitest"
        fi
        if grep -q '"jest"' "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
            has_jest=true
            test_framework="jest"
        fi
    fi

    # Count existing test files
    TEST_FILES=$(find "$PROJECT_ROOT" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) ! -path "*node_modules*" 2>/dev/null | wc -l || echo "0")

    if [ "$TEST_FILES" -eq 0 ]; then
        RECOMMENDATIONS+=("No test files found - set up testing infrastructure with Vitest or Jest")
    fi

    if [ "$has_test_config" = false ] && [ "$TEST_FILES" -gt 0 ]; then
        RECOMMENDATIONS+=("Add test configuration file (vitest.config.ts or jest.config.js)")
    fi

    echo "$test_framework|$TEST_FILES|$has_test_config"
}

# =============================================================================
# 2. ESTIMATE COVERAGE (when coverage reports not available)
# =============================================================================
estimate_coverage() {
    local total_source_files=0
    local files_with_tests=0
    local critical_files_tested=0
    local critical_files_total=0

    # Count source files
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            local src_files=$(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.d.ts" ! -path "*__tests__*" 2>/dev/null | wc -l || echo "0")
            total_source_files=$((total_source_files + src_files))
        fi
    done

    # Count files that have corresponding test files
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                local base_name=$(basename "$file" | sed 's/\.[^.]*$//')
                # Check for corresponding test file
                if find "$PROJECT_ROOT" -type f \( -name "${base_name}.test.ts" -o -name "${base_name}.test.tsx" -o -name "${base_name}.spec.ts" \) ! -path "*node_modules*" 2>/dev/null | grep -q .; then
                    files_with_tests=$((files_with_tests + 1))
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.d.ts" ! -path "*__tests__*" -print0 2>/dev/null)
        fi
    done

    # Identify critical files (auth, services, utils)
    local critical_patterns=("auth" "service" "util" "helper" "api" "middleware" "validator")

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            for pattern in "${critical_patterns[@]}"; do
                while IFS= read -r -d '' file; do
                    critical_files_total=$((critical_files_total + 1))
                    local base_name=$(basename "$file" | sed 's/\.[^.]*$//')

                    # Check if this critical file has tests
                    if find "$PROJECT_ROOT" -type f \( -name "${base_name}.test.ts" -o -name "${base_name}.test.tsx" -o -name "${base_name}.spec.ts" \) ! -path "*node_modules*" 2>/dev/null | grep -q .; then
                        critical_files_tested=$((critical_files_tested + 1))
                    else
                        local relative_file="${file#$PROJECT_ROOT/}"
                        UNTESTED_CRITICAL+=("$relative_file (0% coverage)")
                    fi
                done < <(find "$PROJECT_ROOT/$dir" -type f -name "*${pattern}*.ts" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.d.ts" -print0 2>/dev/null)
            done
        fi
    done

    UNTESTED_FILES=$((total_source_files - files_with_tests))

    # Estimate coverage percentages based on test file ratio
    if [ "$total_source_files" -gt 0 ]; then
        LINE_COVERAGE=$((files_with_tests * 100 / total_source_files))
        BRANCH_COVERAGE=$((LINE_COVERAGE * 70 / 100))  # Branch coverage typically lower
        FUNCTION_COVERAGE=$((LINE_COVERAGE * 90 / 100))  # Function coverage typically higher than line
        STATEMENT_COVERAGE=$((LINE_COVERAGE))
    fi

    echo "$total_source_files|$files_with_tests|$critical_files_tested|$critical_files_total"
}

# =============================================================================
# 3. CHECK FOR EXISTING COVERAGE REPORTS
# =============================================================================
check_coverage_reports() {
    local has_coverage=false
    local coverage_file=""

    # Check for coverage reports
    for coverage_path in "coverage/lcov-report" "coverage" ".nyc_output" "frontend/coverage" "backend/coverage"; do
        if [ -d "$PROJECT_ROOT/$coverage_path" ]; then
            has_coverage=true
            coverage_file="$PROJECT_ROOT/$coverage_path"
            break
        fi
    done

    # Try to parse coverage from lcov or json
    if [ -f "$PROJECT_ROOT/coverage/coverage-summary.json" ]; then
        LINE_COVERAGE=$(node -e "console.log(Math.round(require('$PROJECT_ROOT/coverage/coverage-summary.json').total.lines.pct))" 2>/dev/null || echo "0")
        BRANCH_COVERAGE=$(node -e "console.log(Math.round(require('$PROJECT_ROOT/coverage/coverage-summary.json').total.branches.pct))" 2>/dev/null || echo "0")
        FUNCTION_COVERAGE=$(node -e "console.log(Math.round(require('$PROJECT_ROOT/coverage/coverage-summary.json').total.functions.pct))" 2>/dev/null || echo "0")
        STATEMENT_COVERAGE=$(node -e "console.log(Math.round(require('$PROJECT_ROOT/coverage/coverage-summary.json').total.statements.pct))" 2>/dev/null || echo "0")
    fi

    echo "$has_coverage|$coverage_file"
}

# =============================================================================
# 4. ANALYZE TEST QUALITY
# =============================================================================
analyze_test_quality() {
    local assertions_count=0
    local mocks_count=0
    local async_tests=0
    local describe_blocks=0

    # Analyze test files for quality indicators
    for test_file in $(find "$PROJECT_ROOT" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" \) ! -path "*node_modules*" 2>/dev/null); do
        # Count assertions
        local file_assertions=$(grep -cE 'expect\(|assert\(|should\.' "$test_file" 2>/dev/null || echo "0")
        assertions_count=$((assertions_count + file_assertions))

        # Count mocks
        local file_mocks=$(grep -cE 'mock\(|jest\.mock|vi\.mock|spy' "$test_file" 2>/dev/null || echo "0")
        mocks_count=$((mocks_count + file_mocks))

        # Count async tests
        local file_async=$(grep -cE 'async.*it\(|it\(.*async|await' "$test_file" 2>/dev/null || echo "0")
        async_tests=$((async_tests + file_async))

        # Count describe blocks
        local file_describes=$(grep -cE 'describe\(' "$test_file" 2>/dev/null || echo "0")
        describe_blocks=$((describe_blocks + file_describes))
    done

    # Estimate total tests from assertions
    if [ "$assertions_count" -gt 0 ]; then
        TOTAL_TESTS=$((assertions_count / 2))  # Rough estimate: 2 assertions per test
    fi

    if [ "$TEST_FILES" -gt 0 ] && [ "$assertions_count" -lt "$((TEST_FILES * 3))" ]; then
        RECOMMENDATIONS+=("Test files have few assertions - add more comprehensive test cases")
    fi

    echo "$assertions_count|$mocks_count|$async_tests|$describe_blocks"
}

# =============================================================================
# 5. CALCULATE SCORES
# =============================================================================
calculate_scores() {
    # Score based on coverage percentage (target: 80%)
    LINE_COVERAGE_SCORE=$((LINE_COVERAGE * 100 / 80))
    [ "$LINE_COVERAGE_SCORE" -gt 100 ] && LINE_COVERAGE_SCORE=100

    BRANCH_COVERAGE_SCORE=$((BRANCH_COVERAGE * 100 / 70))
    [ "$BRANCH_COVERAGE_SCORE" -gt 100 ] && BRANCH_COVERAGE_SCORE=100

    FUNCTION_COVERAGE_SCORE=$((FUNCTION_COVERAGE * 100 / 80))
    [ "$FUNCTION_COVERAGE_SCORE" -gt 100 ] && FUNCTION_COVERAGE_SCORE=100

    STATEMENT_COVERAGE_SCORE=$((STATEMENT_COVERAGE * 100 / 80))
    [ "$STATEMENT_COVERAGE_SCORE" -gt 100 ] && STATEMENT_COVERAGE_SCORE=100

    # Add recommendations based on coverage
    if [ "$LINE_COVERAGE" -lt 50 ]; then
        RECOMMENDATIONS+=("Line coverage is low ($LINE_COVERAGE%) - target is 80%")
    fi

    if [ "$BRANCH_COVERAGE" -lt 40 ]; then
        RECOMMENDATIONS+=("Branch coverage is low ($BRANCH_COVERAGE%) - add tests for conditional logic")
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local infra_result=$(analyze_test_infrastructure)
    local coverage_result=$(check_coverage_reports)
    local estimate_result=$(estimate_coverage)
    local quality_result=$(analyze_test_quality)

    # Calculate scores
    calculate_scores

    # Calculate overall score (weighted average)
    local overall_score=$(( (LINE_COVERAGE_SCORE * 30 + BRANCH_COVERAGE_SCORE * 25 + FUNCTION_COVERAGE_SCORE * 25 + STATEMENT_COVERAGE_SCORE * 20) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # Build untested critical JSON array
        local untested_json="["
        local first=true
        for item in "${UNTESTED_CRITICAL[@]}"; do
            if [ "$first" = true ]; then
                untested_json="$untested_json\"$item\""
                first=false
            else
                untested_json="$untested_json, \"$item\""
            fi
        done
        untested_json="$untested_json]"

        # JSON output
        cat << EOF
{
    "category": "test_coverage",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "coverage": {
        "line": $LINE_COVERAGE,
        "branch": $BRANCH_COVERAGE,
        "function": $FUNCTION_COVERAGE,
        "statement": $STATEMENT_COVERAGE
    },
    "subscores": {
        "line_coverage": $LINE_COVERAGE_SCORE,
        "branch_coverage": $BRANCH_COVERAGE_SCORE,
        "function_coverage": $FUNCTION_COVERAGE_SCORE,
        "statement_coverage": $STATEMENT_COVERAGE_SCORE
    },
    "metrics": {
        "total_tests": $TOTAL_TESTS,
        "test_files": $TEST_FILES,
        "untested_files": $UNTESTED_FILES,
        "test_framework": "$(echo "$infra_result" | cut -d'|' -f1)"
    },
    "details": {
        "infrastructure": {
            "framework": "$(echo "$infra_result" | cut -d'|' -f1)",
            "test_files": $(echo "$infra_result" | cut -d'|' -f2),
            "has_config": $(echo "$infra_result" | cut -d'|' -f3)
        },
        "quality": {
            "assertions": $(echo "$quality_result" | cut -d'|' -f1),
            "mocks": $(echo "$quality_result" | cut -d'|' -f2),
            "async_tests": $(echo "$quality_result" | cut -d'|' -f3),
            "describe_blocks": $(echo "$quality_result" | cut -d'|' -f4)
        },
        "untested_critical": $untested_json
    }
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Test Coverage Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 80 ]; then
            echo -e "  ${GREEN}Test Coverage Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 50 ]; then
            echo -e "  ${YELLOW}Test Coverage Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Test Coverage Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Coverage Metrics:"
        printf "  ├─ Line Coverage:      %3d%%\n" "$LINE_COVERAGE"
        printf "  ├─ Branch Coverage:    %3d%%\n" "$BRANCH_COVERAGE"
        printf "  ├─ Function Coverage:  %3d%%\n" "$FUNCTION_COVERAGE"
        printf "  └─ Statement Coverage: %3d%%\n" "$STATEMENT_COVERAGE"
        echo ""

        echo "  Test Statistics:"
        printf "  ├─ Test Files:        %d\n" "$TEST_FILES"
        printf "  ├─ Estimated Tests:   %d\n" "$TOTAL_TESTS"
        printf "  └─ Untested Files:    %d\n" "$UNTESTED_FILES"

        # Show critical untested areas
        if [ ${#UNTESTED_CRITICAL[@]} -gt 0 ]; then
            echo ""
            echo "  Critical Untested Areas:"
            local count=0
            for item in "${UNTESTED_CRITICAL[@]}"; do
                if [ $count -lt 5 ]; then
                    echo "  - $item"
                    count=$((count + 1))
                fi
            done
            if [ ${#UNTESTED_CRITICAL[@]} -gt 5 ]; then
                echo "  ... and $((${#UNTESTED_CRITICAL[@]} - 5)) more"
            fi
        fi

        # Show recommendations
        if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
            echo ""
            echo "  Recommendations:"
            for rec in "${RECOMMENDATIONS[@]}"; do
                echo "  - $rec"
            done
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    fi
}

main
