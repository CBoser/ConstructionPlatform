#!/bin/bash
# =============================================================================
# Code Quality Check Module
# Analyzes code quality metrics: complexity, maintainability, duplication, style
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
COMPLEXITY_SCORE=100
MAINTAINABILITY_SCORE=100
DUPLICATION_SCORE=100
STYLE_SCORE=100
TYPE_SAFETY_SCORE=100

# Issue counts
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Detailed issues array
declare -a ISSUES

# Function to calculate score based on threshold
calculate_score() {
    local value=$1
    local max=$2
    local is_inverse=${3:-false}

    if [ "$is_inverse" = true ]; then
        # Lower is better (e.g., errors, complexity)
        if [ "$value" -le 0 ]; then
            echo 100
        elif [ "$value" -ge "$max" ]; then
            echo 0
        else
            echo $(( 100 - (value * 100 / max) ))
        fi
    else
        # Higher is better
        if [ "$value" -ge "$max" ]; then
            echo 100
        elif [ "$value" -le 0 ]; then
            echo 0
        else
            echo $(( value * 100 / max ))
        fi
    fi
}

# =============================================================================
# 1. COMPLEXITY ANALYSIS
# =============================================================================
analyze_complexity() {
    local high_complexity_count=0
    local very_high_complexity_count=0
    local total_functions=0
    local max_complexity=0

    # Analyze TypeScript/JavaScript files for complexity indicators
    # Count nested structures (if, for, while, switch, catch, &&, ||, ?)

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                if [ -f "$file" ]; then
                    # Count complexity indicators in file
                    local if_count=$(grep -c '\bif\s*(' "$file" 2>/dev/null || echo "0")
                    local for_count=$(grep -c '\bfor\s*(' "$file" 2>/dev/null || echo "0")
                    local while_count=$(grep -c '\bwhile\s*(' "$file" 2>/dev/null || echo "0")
                    local switch_count=$(grep -c '\bswitch\s*(' "$file" 2>/dev/null || echo "0")
                    local catch_count=$(grep -c '\bcatch\s*(' "$file" 2>/dev/null || echo "0")
                    local ternary_count=$(grep -o '?' "$file" 2>/dev/null | wc -l || echo "0")
                    local and_count=$(grep -o '&&' "$file" 2>/dev/null | wc -l || echo "0")
                    local or_count=$(grep -o '||' "$file" 2>/dev/null | wc -l || echo "0")

                    # Estimate file complexity
                    local file_complexity=$((if_count + for_count + while_count + switch_count + catch_count + ternary_count/2 + and_count/2 + or_count/2))

                    # Count functions in file
                    local func_count=$(grep -cE '(function\s+\w+|const\s+\w+\s*=\s*(\([^)]*\)|async\s*\([^)]*\))\s*=>|^\s*(async\s+)?[a-zA-Z_]\w*\s*\([^)]*\)\s*(\{|:))' "$file" 2>/dev/null || echo "1")
                    [ "$func_count" -lt 1 ] && func_count=1

                    # Average complexity per function
                    local avg_complexity=$((file_complexity / func_count))

                    if [ "$avg_complexity" -gt 15 ]; then
                        very_high_complexity_count=$((very_high_complexity_count + 1))
                        ISSUES+=("HIGH|Complexity|$file|Very high complexity (~$avg_complexity per function)")
                        HIGH_ISSUES=$((HIGH_ISSUES + 1))
                    elif [ "$avg_complexity" -gt 10 ]; then
                        high_complexity_count=$((high_complexity_count + 1))
                        ISSUES+=("MEDIUM|Complexity|$file|High complexity (~$avg_complexity per function)")
                        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
                    fi

                    [ "$avg_complexity" -gt "$max_complexity" ] && max_complexity=$avg_complexity
                    total_functions=$((total_functions + func_count))
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*node_modules*" ! -path "*dist*" -print0)
        fi
    done

    # Calculate complexity score
    local complexity_issues=$((very_high_complexity_count * 2 + high_complexity_count))
    COMPLEXITY_SCORE=$(calculate_score $complexity_issues 20 true)

    echo "$COMPLEXITY_SCORE|$high_complexity_count|$very_high_complexity_count|$max_complexity"
}

# =============================================================================
# 2. MAINTAINABILITY ANALYSIS
# =============================================================================
analyze_maintainability() {
    local long_files=0
    local very_long_files=0
    local long_functions=0
    local total_files=0

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                if [ -f "$file" ]; then
                    total_files=$((total_files + 1))
                    local line_count=$(wc -l < "$file")

                    if [ "$line_count" -gt 800 ]; then
                        very_long_files=$((very_long_files + 1))
                        ISSUES+=("HIGH|Maintainability|$file|Very long file ($line_count lines)")
                        HIGH_ISSUES=$((HIGH_ISSUES + 1))
                    elif [ "$line_count" -gt 500 ]; then
                        long_files=$((long_files + 1))
                        ISSUES+=("MEDIUM|Maintainability|$file|Long file ($line_count lines)")
                        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
                    fi

                    # Check for long functions (simplified detection)
                    local func_lengths=$(awk '
                        /^[[:space:]]*(export\s+)?(async\s+)?function\s+\w+|^[[:space:]]*(export\s+)?const\s+\w+\s*=\s*(async\s*)?\(/ {
                            start=NR;
                            brace=0
                        }
                        /{/ {brace++}
                        /}/ {
                            brace--;
                            if(brace==0 && start>0) {
                                len=NR-start;
                                if(len>80) print len;
                                start=0
                            }
                        }
                    ' "$file" 2>/dev/null | wc -l)

                    if [ "$func_lengths" -gt 0 ]; then
                        long_functions=$((long_functions + func_lengths))
                        ISSUES+=("LOW|Maintainability|$file|Contains $func_lengths long functions (>80 lines)")
                        LOW_ISSUES=$((LOW_ISSUES + 1))
                    fi
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*node_modules*" ! -path "*dist*" -print0)
        fi
    done

    # Calculate maintainability score
    local maintainability_issues=$((very_long_files * 3 + long_files * 2 + long_functions))
    MAINTAINABILITY_SCORE=$(calculate_score $maintainability_issues 30 true)

    echo "$MAINTAINABILITY_SCORE|$long_files|$very_long_files|$long_functions"
}

# =============================================================================
# 3. DUPLICATION ANALYSIS
# =============================================================================
analyze_duplication() {
    local duplicate_blocks=0
    local potential_duplicates=0

    # Find potential duplicate code blocks (simplified approach)
    # Look for identical multi-line patterns

    # Create temp file for analysis
    local temp_file=$(mktemp)

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # Extract function signatures and code blocks
            find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*node_modules*" ! -path "*dist*" -exec cat {} \; 2>/dev/null | \
                grep -v '^[[:space:]]*$' | \
                grep -v '^[[:space:]]*//' | \
                grep -v '^[[:space:]]*\*' | \
                grep -v '^[[:space:]]*import' | \
                grep -v '^[[:space:]]*export' >> "$temp_file"
        fi
    done

    if [ -f "$temp_file" ] && [ -s "$temp_file" ]; then
        # Count duplicate lines (lines appearing more than 3 times)
        duplicate_blocks=$(sort "$temp_file" | uniq -c | awk '$1 > 3 {count++} END {print count+0}')

        # Check for similar patterns
        potential_duplicates=$(grep -cE '^\s*(if|for|while|try)\s*\(' "$temp_file" 2>/dev/null || echo "0")
    fi

    rm -f "$temp_file"

    # Estimate duplication percentage
    local duplication_pct=$((duplicate_blocks * 100 / (potential_duplicates + 1)))
    [ "$duplication_pct" -gt 100 ] && duplication_pct=100
    [ "$duplication_pct" -lt 0 ] && duplication_pct=0

    # Lower duplication is better
    if [ "$duplication_pct" -gt 15 ]; then
        ISSUES+=("HIGH|Duplication|project|High code duplication (~$duplication_pct%)")
        HIGH_ISSUES=$((HIGH_ISSUES + 1))
    elif [ "$duplication_pct" -gt 10 ]; then
        ISSUES+=("MEDIUM|Duplication|project|Moderate code duplication (~$duplication_pct%)")
        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
    fi

    DUPLICATION_SCORE=$((100 - duplication_pct))

    echo "$DUPLICATION_SCORE|$duplicate_blocks|$duplication_pct"
}

# =============================================================================
# 4. STYLE COMPLIANCE (ESLint)
# =============================================================================
analyze_style() {
    local eslint_errors=0
    local eslint_warnings=0
    local prettier_issues=0

    # Run ESLint on frontend
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        cd "$PROJECT_ROOT/frontend"
        local frontend_result=$(npx eslint . --format json 2>/dev/null || true)
        if [ -n "$frontend_result" ]; then
            local fe_errors=$(echo "$frontend_result" | grep -o '"errorCount":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s+0}')
            local fe_warnings=$(echo "$frontend_result" | grep -o '"warningCount":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s+0}')
            eslint_errors=$((eslint_errors + fe_errors))
            eslint_warnings=$((eslint_warnings + fe_warnings))
        fi
    fi

    # Run ESLint on backend
    if [ -d "$PROJECT_ROOT/backend" ]; then
        cd "$PROJECT_ROOT/backend"
        local backend_result=$(npx eslint . --format json 2>/dev/null || true)
        if [ -n "$backend_result" ]; then
            local be_errors=$(echo "$backend_result" | grep -o '"errorCount":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s+0}')
            local be_warnings=$(echo "$backend_result" | grep -o '"warningCount":[0-9]*' | grep -o '[0-9]*' | awk '{s+=$1} END {print s+0}')
            eslint_errors=$((eslint_errors + be_errors))
            eslint_warnings=$((eslint_warnings + be_warnings))
        fi
    fi

    cd "$PROJECT_ROOT"

    # Score calculation
    if [ "$eslint_errors" -gt 0 ]; then
        ISSUES+=("CRITICAL|Style|project|$eslint_errors ESLint errors found")
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    fi

    if [ "$eslint_warnings" -gt 20 ]; then
        ISSUES+=("MEDIUM|Style|project|$eslint_warnings ESLint warnings found")
        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
    elif [ "$eslint_warnings" -gt 0 ]; then
        ISSUES+=("LOW|Style|project|$eslint_warnings ESLint warnings found")
        LOW_ISSUES=$((LOW_ISSUES + 1))
    fi

    # Calculate style score
    local style_penalty=$((eslint_errors * 10 + eslint_warnings))
    STYLE_SCORE=$(calculate_score $style_penalty 100 true)

    echo "$STYLE_SCORE|$eslint_errors|$eslint_warnings"
}

# =============================================================================
# 5. TYPE SAFETY (TypeScript)
# =============================================================================
analyze_type_safety() {
    local ts_errors=0
    local any_usage=0
    local strict_mode=true

    # Check TypeScript errors
    cd "$PROJECT_ROOT"

    # Check frontend TypeScript
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        cd "$PROJECT_ROOT/frontend"
        local fe_ts_output=$(npx tsc --noEmit 2>&1 || true)
        local fe_ts_errors=$(echo "$fe_ts_output" | grep -c "error TS" || echo "0")
        ts_errors=$((ts_errors + fe_ts_errors))
    fi

    # Check backend TypeScript
    if [ -d "$PROJECT_ROOT/backend" ]; then
        cd "$PROJECT_ROOT/backend"
        local be_ts_output=$(npx tsc --noEmit 2>&1 || true)
        local be_ts_errors=$(echo "$be_ts_output" | grep -c "error TS" || echo "0")
        ts_errors=$((ts_errors + be_ts_errors))
    fi

    cd "$PROJECT_ROOT"

    # Count 'any' usage (excluding legitimate cases)
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            local any_count=$(grep -rE '\bany\b' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" 2>/dev/null | \
                grep -v "// eslint-disable" | \
                grep -v "node_modules" | \
                wc -l || echo "0")
            any_usage=$((any_usage + any_count))
        fi
    done

    # Check strict mode in tsconfig
    if [ -f "$PROJECT_ROOT/backend/tsconfig.json" ]; then
        if ! grep -q '"strict":\s*true' "$PROJECT_ROOT/backend/tsconfig.json" 2>/dev/null; then
            strict_mode=false
        fi
    fi

    if [ "$ts_errors" -gt 0 ]; then
        ISSUES+=("CRITICAL|TypeSafety|project|$ts_errors TypeScript errors found")
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    fi

    if [ "$any_usage" -gt 50 ]; then
        ISSUES+=("MEDIUM|TypeSafety|project|High 'any' usage: $any_usage occurrences")
        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
    elif [ "$any_usage" -gt 20 ]; then
        ISSUES+=("LOW|TypeSafety|project|Moderate 'any' usage: $any_usage occurrences")
        LOW_ISSUES=$((LOW_ISSUES + 1))
    fi

    if [ "$strict_mode" = false ]; then
        ISSUES+=("MEDIUM|TypeSafety|project|TypeScript strict mode not enabled")
        MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1))
    fi

    # Calculate type safety score
    local type_penalty=$((ts_errors * 15 + any_usage / 5))
    TYPE_SAFETY_SCORE=$(calculate_score $type_penalty 100 true)

    echo "$TYPE_SAFETY_SCORE|$ts_errors|$any_usage|$strict_mode"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local complexity_result=$(analyze_complexity)
    local maintainability_result=$(analyze_maintainability)
    local duplication_result=$(analyze_duplication)
    local style_result=$(analyze_style)
    local type_result=$(analyze_type_safety)

    # Calculate overall code quality score
    local overall_score=$(( (COMPLEXITY_SCORE * 20 + MAINTAINABILITY_SCORE * 20 + DUPLICATION_SCORE * 20 + STYLE_SCORE * 25 + TYPE_SAFETY_SCORE * 15) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # JSON output
        cat << EOF
{
    "category": "code_quality",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "subscores": {
        "complexity": $COMPLEXITY_SCORE,
        "maintainability": $MAINTAINABILITY_SCORE,
        "duplication": $DUPLICATION_SCORE,
        "style_compliance": $STYLE_SCORE,
        "type_safety": $TYPE_SAFETY_SCORE
    },
    "issues": {
        "critical": $CRITICAL_ISSUES,
        "high": $HIGH_ISSUES,
        "medium": $MEDIUM_ISSUES,
        "low": $LOW_ISSUES
    },
    "details": {
        "complexity": {
            "score": $COMPLEXITY_SCORE,
            "high_complexity_files": $(echo "$complexity_result" | cut -d'|' -f2),
            "very_high_complexity_files": $(echo "$complexity_result" | cut -d'|' -f3),
            "max_complexity": $(echo "$complexity_result" | cut -d'|' -f4)
        },
        "maintainability": {
            "score": $MAINTAINABILITY_SCORE,
            "long_files": $(echo "$maintainability_result" | cut -d'|' -f2),
            "very_long_files": $(echo "$maintainability_result" | cut -d'|' -f3),
            "long_functions": $(echo "$maintainability_result" | cut -d'|' -f4)
        },
        "duplication": {
            "score": $DUPLICATION_SCORE,
            "duplicate_blocks": $(echo "$duplication_result" | cut -d'|' -f2),
            "duplication_percentage": $(echo "$duplication_result" | cut -d'|' -f3)
        },
        "style": {
            "score": $STYLE_SCORE,
            "eslint_errors": $(echo "$style_result" | cut -d'|' -f2),
            "eslint_warnings": $(echo "$style_result" | cut -d'|' -f3)
        },
        "type_safety": {
            "score": $TYPE_SAFETY_SCORE,
            "typescript_errors": $(echo "$type_result" | cut -d'|' -f2),
            "any_usage": $(echo "$type_result" | cut -d'|' -f3),
            "strict_mode": $(echo "$type_result" | cut -d'|' -f4)
        }
    }
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Code Quality Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 90 ]; then
            echo -e "  ${GREEN}Code Quality Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 75 ]; then
            echo -e "  ${YELLOW}Code Quality Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Code Quality Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Subscores:"
        printf "  ├─ Complexity:        %3d/100\n" "$COMPLEXITY_SCORE"
        printf "  ├─ Maintainability:   %3d/100\n" "$MAINTAINABILITY_SCORE"
        printf "  ├─ Duplication:       %3d/100\n" "$DUPLICATION_SCORE"
        printf "  ├─ Style Compliance:  %3d/100\n" "$STYLE_SCORE"
        printf "  └─ Type Safety:       %3d/100\n" "$TYPE_SAFETY_SCORE"
        echo ""

        echo "  Issues Found:"
        printf "  - [Critical] %d issues\n" "$CRITICAL_ISSUES"
        printf "  - [High]     %d issues\n" "$HIGH_ISSUES"
        printf "  - [Medium]   %d issues\n" "$MEDIUM_ISSUES"
        printf "  - [Low]      %d issues\n" "$LOW_ISSUES"

        # Show top issues
        if [ ${#ISSUES[@]} -gt 0 ]; then
            echo ""
            echo "  Top Issues:"
            local count=0
            for issue in "${ISSUES[@]}"; do
                if [ $count -lt 5 ]; then
                    local severity=$(echo "$issue" | cut -d'|' -f1)
                    local category=$(echo "$issue" | cut -d'|' -f2)
                    local location=$(echo "$issue" | cut -d'|' -f3 | sed "s|$PROJECT_ROOT/||")
                    local message=$(echo "$issue" | cut -d'|' -f4)

                    case $severity in
                        CRITICAL) echo -e "  ${RED}[$severity]${NC} $category: $message ($location)" ;;
                        HIGH) echo -e "  ${YELLOW}[$severity]${NC} $category: $message ($location)" ;;
                        *) echo "  [$severity] $category: $message ($location)" ;;
                    esac
                    count=$((count + 1))
                fi
            done
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    fi
}

main
