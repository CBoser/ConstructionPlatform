#!/bin/bash
# =============================================================================
# MindFlow Platform Health Check System
# Comprehensive automated code and security health analysis
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECKS_DIR="$SCRIPT_DIR/checks"
CONFIG_FILE="$PROJECT_ROOT/config/health-check.config.json"
HISTORY_DIR="$PROJECT_ROOT/data/health-history"
REPORT_DIR="$PROJECT_ROOT/docs/health-reports"

# Command line options
OUTPUT_FORMAT="cli"
GENERATE_REPORT=false
JSON_OUTPUT=false
QUIET=false
SPECIFIC_CHECK=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            OUTPUT_FORMAT="json"
            JSON_OUTPUT=true
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --quiet|-q)
            QUIET=true
            shift
            ;;
        --check)
            SPECIFIC_CHECK="$2"
            shift 2
            ;;
        --help|-h)
            echo "MindFlow Platform Health Check System"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --json          Output results in JSON format"
            echo "  --report        Generate markdown report"
            echo "  --quiet, -q     Minimal output (just scores)"
            echo "  --check NAME    Run specific check only"
            echo "                  (code-quality, security, performance,"
            echo "                   test-coverage, documentation, scalability,"
            echo "                   technical-debt)"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    Run all checks with CLI output"
            echo "  $0 --json             Run all checks with JSON output"
            echo "  $0 --report           Run checks and generate report"
            echo "  $0 --check security   Run only security check"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Ensure directories exist
mkdir -p "$HISTORY_DIR" "$REPORT_DIR"

# Store results
declare -A SCORES
declare -A RESULTS
START_TIME=$(date +%s)

# =============================================================================
# PROGRESS BAR FUNCTION
# =============================================================================
draw_progress_bar() {
    local score=$1
    local width=20
    local filled=$((score * width / 100))
    local empty=$((width - filled))

    printf "["
    if [ "$score" -ge 80 ]; then
        printf "${GREEN}"
    elif [ "$score" -ge 60 ]; then
        printf "${YELLOW}"
    else
        printf "${RED}"
    fi

    for ((i=0; i<filled; i++)); do printf "█"; done
    printf "${NC}"
    for ((i=0; i<empty; i++)); do printf "░"; done
    printf "]"
}

# =============================================================================
# STATUS INDICATOR
# =============================================================================
get_status_icon() {
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

get_status_text() {
    local score=$1
    if [ "$score" -ge 90 ]; then
        echo "Excellent"
    elif [ "$score" -ge 75 ]; then
        echo "Good"
    elif [ "$score" -ge 60 ]; then
        echo "Fair"
    else
        echo "Needs Attention"
    fi
}

# =============================================================================
# RUN INDIVIDUAL CHECKS
# =============================================================================
run_check() {
    local check_name=$1
    local check_script="$CHECKS_DIR/${check_name}.sh"

    if [ ! -f "$check_script" ]; then
        SCORES["$check_name"]=0
        RESULTS["$check_name"]="{}"
        return 1
    fi

    # Run the check and capture JSON output
    RESULTS["$check_name"]=$("$check_script" json 2>/dev/null || echo '{"overall_score":0}')
    local score=$(echo "${RESULTS[$check_name]}" | grep -o '"overall_score":\s*[0-9]*' | grep -o '[0-9]*' | head -1)

    # Store score
    SCORES["$check_name"]=${score:-0}
}

# =============================================================================
# CALCULATE OVERALL SCORE
# =============================================================================
calculate_overall_score() {
    # Weights from config (defaulting if config not parsed)
    local cq_weight=20
    local sec_weight=25
    local perf_weight=15
    local test_weight=15
    local doc_weight=10
    local scale_weight=10
    local debt_weight=5

    local cq_score=${SCORES["code-quality"]:-0}
    local sec_score=${SCORES["security"]:-0}
    local perf_score=${SCORES["performance"]:-0}
    local test_score=${SCORES["test-coverage"]:-0}
    local doc_score=${SCORES["documentation"]:-0}
    local scale_score=${SCORES["scalability"]:-0}
    local debt_score=${SCORES["technical-debt"]:-0}

    local total=$((cq_score * cq_weight + sec_score * sec_weight + perf_score * perf_weight + test_score * test_weight + doc_score * doc_weight + scale_score * scale_weight + debt_score * debt_weight))
    local overall=$((total / 100))

    echo "$overall"
}

# =============================================================================
# GET PREVIOUS SCORE (for comparison)
# =============================================================================
get_previous_score() {
    local latest_history=$(ls -t "$HISTORY_DIR"/*.json 2>/dev/null | head -1)
    if [ -f "$latest_history" ]; then
        local prev_score=$(grep -o '"overall_score":\s*[0-9]*' "$latest_history" | head -1 | grep -o '[0-9]*')
        echo "${prev_score:-0}"
    else
        echo "0"
    fi
}

# =============================================================================
# SAVE HISTORY
# =============================================================================
save_history() {
    local overall_score=$1
    local date_stamp=$(date +%Y-%m-%d)
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local history_file="$HISTORY_DIR/health-${date_stamp}.json"

    cat > "$history_file" << EOF
{
    "timestamp": "$timestamp",
    "date": "$date_stamp",
    "overall_score": $overall_score,
    "scores": {
        "code_quality": ${SCORES["code-quality"]:-0},
        "security": ${SCORES["security"]:-0},
        "performance": ${SCORES["performance"]:-0},
        "test_coverage": ${SCORES["test-coverage"]:-0},
        "documentation": ${SCORES["documentation"]:-0},
        "scalability": ${SCORES["scalability"]:-0},
        "technical_debt": ${SCORES["technical-debt"]:-0}
    },
    "details": {
        "code_quality": ${RESULTS["code-quality"]:-"{}"},
        "security": ${RESULTS["security"]:-"{}"},
        "performance": ${RESULTS["performance"]:-"{}"},
        "test_coverage": ${RESULTS["test-coverage"]:-"{}"},
        "documentation": ${RESULTS["documentation"]:-"{}"},
        "scalability": ${RESULTS["scalability"]:-"{}"},
        "technical_debt": ${RESULTS["technical-debt"]:-"{}"}
    }
}
EOF
}

# =============================================================================
# GENERATE TREND VISUALIZATION
# =============================================================================
generate_trend() {
    local history_files=($(ls -t "$HISTORY_DIR"/*.json 2>/dev/null | head -8 | tac))
    local count=${#history_files[@]}

    if [ "$count" -lt 2 ]; then
        echo "  (Not enough history for trend - need at least 2 data points)"
        return
    fi

    echo "  Health Score Trend (Last $count entries):"
    echo ""

    for file in "${history_files[@]}"; do
        local date=$(basename "$file" .json | sed 's/health-//')
        local score=$(grep -o '"overall_score":\s*[0-9]*' "$file" | head -1 | grep -o '[0-9]*')
        score=${score:-0}

        local bar_width=$((score * 32 / 100))
        local bar=""
        for ((i=0; i<bar_width; i++)); do bar+="█"; done
        for ((i=bar_width; i<32; i++)); do bar+="░"; done

        printf "  %s: %s %3d/100\n" "$date" "$bar" "$score"
    done
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Header
    if [ "$JSON_OUTPUT" = false ] && [ "$QUIET" = false ]; then
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}  🏥 MindFlow Platform Health Check${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "  Running checks... (this may take a few minutes)"
        echo ""
    fi

    # Define checks to run
    local checks=("code-quality" "security" "performance" "test-coverage" "documentation" "scalability" "technical-debt")

    # If specific check requested, only run that one
    if [ -n "$SPECIFIC_CHECK" ]; then
        checks=("$SPECIFIC_CHECK")
    fi

    # Run each check
    for check in "${checks[@]}"; do
        local display_name=$(echo "$check" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

        if [ "$JSON_OUTPUT" = false ] && [ "$QUIET" = false ]; then
            printf "  Running %-20s " "$display_name..."
        fi

        run_check "$check"
        local score=${SCORES["$check"]:-0}

        if [ "$JSON_OUTPUT" = false ] && [ "$QUIET" = false ]; then
            draw_progress_bar "$score"
            printf " %3d/100\n" "$score"
        fi
    done

    # Calculate overall score
    local overall_score=$(calculate_overall_score)
    local prev_score=$(get_previous_score)
    local score_change=$((overall_score - prev_score))

    # Get issue counts from results
    local critical_issues=0
    local high_issues=0
    local medium_issues=0
    local low_issues=0

    # Parse security results for vulnerability counts
    if [ -n "${RESULTS["security"]}" ]; then
        critical_issues=$(echo "${RESULTS["security"]}" | grep -o '"critical":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        high_issues=$(echo "${RESULTS["security"]}" | grep -o '"high":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    fi

    # Parse technical debt for issue counts
    if [ -n "${RESULTS["technical-debt"]}" ]; then
        local debt_critical=$(echo "${RESULTS["technical-debt"]}" | grep -o '"critical":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local debt_high=$(echo "${RESULTS["technical-debt"]}" | grep -o '"high":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local debt_medium=$(echo "${RESULTS["technical-debt"]}" | grep -o '"medium":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local debt_low=$(echo "${RESULTS["technical-debt"]}" | grep -o '"low":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

        critical_issues=$((critical_issues + debt_critical))
        high_issues=$((high_issues + debt_high))
        medium_issues=$((medium_issues + debt_medium))
        low_issues=$((low_issues + debt_low))
    fi

    # Save to history
    save_history "$overall_score"

    # Calculate execution time
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))

    # Extract scores to regular variables for JSON output
    local score_cq=${SCORES["code-quality"]:-0}
    local score_sec=${SCORES["security"]:-0}
    local score_perf=${SCORES["performance"]:-0}
    local score_test=${SCORES["test-coverage"]:-0}
    local score_doc=${SCORES["documentation"]:-0}
    local score_scale=${SCORES["scalability"]:-0}
    local score_debt=${SCORES["technical-debt"]:-0}

    # Output results
    if [ "$JSON_OUTPUT" = true ]; then
        # JSON output
        cat << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "previous_score": $prev_score,
    "score_change": $score_change,
    "status": "$(get_status_text $overall_score)",
    "execution_time_seconds": $duration,
    "scores": {
        "code_quality": $score_cq,
        "security": $score_sec,
        "performance": $score_perf,
        "test_coverage": $score_test,
        "documentation": $score_doc,
        "scalability": $score_scale,
        "technical_debt": $score_debt
    },
    "issues": {
        "critical": $critical_issues,
        "high": $high_issues,
        "medium": $medium_issues,
        "low": $low_issues
    },
    "report_path": "$REPORT_DIR/health-report-$(date +%Y-%m-%d).md"
}
EOF
    elif [ "$QUIET" = true ]; then
        # Quiet output - just scores
        echo "Overall: $overall_score/100"
        for check in "${checks[@]}"; do
            echo "$check: ${SCORES[$check]:-0}/100"
        done
    else
        # Full CLI output
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Overall score with status
        local status_icon=$(get_status_icon $overall_score)
        local status_text=$(get_status_text $overall_score)

        if [ "$overall_score" -ge 80 ]; then
            echo -e "  ${GREEN}Overall Platform Health: $overall_score/100${NC} $status_icon"
        elif [ "$overall_score" -ge 60 ]; then
            echo -e "  ${YELLOW}Overall Platform Health: $overall_score/100${NC} $status_icon"
        else
            echo -e "  ${RED}Overall Platform Health: $overall_score/100${NC} $status_icon"
        fi

        echo ""
        echo "  Status: $status_text"

        # Score change
        if [ "$prev_score" -gt 0 ]; then
            if [ "$score_change" -gt 0 ]; then
                echo -e "  Change from last check: ${GREEN}+$score_change points 📈${NC}"
            elif [ "$score_change" -lt 0 ]; then
                echo -e "  Change from last check: ${RED}$score_change points 📉${NC}"
            else
                echo "  Change from last check: No change ➡️"
            fi
        fi

        echo ""
        echo "  Issue Summary:"
        printf "  - Critical Issues:     %d\n" "$critical_issues"
        printf "  - High Priority:       %d\n" "$high_issues"
        printf "  - Medium Priority:     %d\n" "$medium_issues"
        printf "  - Low Priority:        %d\n" "$low_issues"

        # Top recommendations
        echo ""
        echo "  Top 3 Recommendations:"

        # Generate recommendations based on scores
        local rec_count=0
        if [ "${SCORES["test-coverage"]:-0}" -lt 60 ] && [ "$rec_count" -lt 3 ]; then
            echo "  1. Increase test coverage (current: ${SCORES["test-coverage"]:-0}%, target: 80%)"
            rec_count=$((rec_count + 1))
        fi
        if [ "${SCORES["security"]:-0}" -lt 90 ] && [ "$rec_count" -lt 3 ]; then
            echo "  $((rec_count + 1)). Address security vulnerabilities ($critical_issues critical, $high_issues high)"
            rec_count=$((rec_count + 1))
        fi
        if [ "${SCORES["technical-debt"]:-0}" -lt 80 ] && [ "$rec_count" -lt 3 ]; then
            echo "  $((rec_count + 1)). Reduce technical debt (resolve FIXME/TODO items)"
            rec_count=$((rec_count + 1))
        fi
        if [ "${SCORES["documentation"]:-0}" -lt 70 ] && [ "$rec_count" -lt 3 ]; then
            echo "  $((rec_count + 1)). Improve documentation coverage"
            rec_count=$((rec_count + 1))
        fi
        if [ "${SCORES["performance"]:-0}" -lt 70 ] && [ "$rec_count" -lt 3 ]; then
            echo "  $((rec_count + 1)). Optimize performance (bundle size, build time)"
            rec_count=$((rec_count + 1))
        fi

        if [ "$rec_count" -eq 0 ]; then
            echo "  Great job! All metrics are in good shape."
        fi

        # Show trend if history exists
        echo ""
        generate_trend

        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo "  Completed in ${duration}s"

        if [ "$GENERATE_REPORT" = true ]; then
            local report_path="$REPORT_DIR/health-report-$(date +%Y-%m-%d).md"
            echo "  Full report: $report_path"
        fi

        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
    fi

    # Generate report if requested
    if [ "$GENERATE_REPORT" = true ]; then
        "$SCRIPT_DIR/generate-health-report.sh" 2>/dev/null || true
    fi
}

main
