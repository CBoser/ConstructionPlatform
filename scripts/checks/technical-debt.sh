#!/bin/bash
# =============================================================================
# Technical Debt Tracker Module
# Tracks TODOs, FIXMEs, HACKs, deprecated code, and other debt indicators
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

# Initialize counters
FIXME_COUNT=0
TODO_HIGH_COUNT=0
TODO_COUNT=0
HACK_COUNT=0
XXX_COUNT=0
DEPRECATED_COUNT=0
CONSOLE_LOG_COUNT=0
COMMENTED_CODE_COUNT=0

# Debt inventory
declare -a CRITICAL_ITEMS
declare -a HIGH_ITEMS
declare -a MEDIUM_ITEMS
declare -a LOW_ITEMS

# =============================================================================
# 1. SCAN FOR FIXME (Critical)
# =============================================================================
scan_fixme() {
    for dir in "frontend/src" "backend/src" "shared"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    FIXME_COUNT=$((FIXME_COUNT + 1))
                    local file=$(echo "$line" | cut -d':' -f1)
                    local line_num=$(echo "$line" | cut -d':' -f2)
                    local content=$(echo "$line" | cut -d':' -f3-)
                    local relative_file="${file#$PROJECT_ROOT/}"
                    CRITICAL_ITEMS+=("$relative_file:$line_num|${content:0:80}")
                fi
            done < <(grep -rnE 'FIXME|FIX ME|FIX-ME' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null || true)
        fi
    done
}

# =============================================================================
# 2. SCAN FOR TODO (with priority detection)
# =============================================================================
scan_todo() {
    for dir in "frontend/src" "backend/src" "shared"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    local file=$(echo "$line" | cut -d':' -f1)
                    local line_num=$(echo "$line" | cut -d':' -f2)
                    local content=$(echo "$line" | cut -d':' -f3-)
                    local relative_file="${file#$PROJECT_ROOT/}"

                    # Check for priority indicators
                    if echo "$content" | grep -qiE 'urgent|critical|important|high|priority|asap|!'; then
                        TODO_HIGH_COUNT=$((TODO_HIGH_COUNT + 1))
                        HIGH_ITEMS+=("$relative_file:$line_num|${content:0:80}")
                    else
                        TODO_COUNT=$((TODO_COUNT + 1))
                        MEDIUM_ITEMS+=("$relative_file:$line_num|${content:0:80}")
                    fi
                fi
            done < <(grep -rnE 'TODO|TO DO|TO-DO' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v 'FIXME' || true)
        fi
    done
}

# =============================================================================
# 3. SCAN FOR HACK/XXX (Workarounds)
# =============================================================================
scan_hacks() {
    for dir in "frontend/src" "backend/src" "shared"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # HACK comments
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    HACK_COUNT=$((HACK_COUNT + 1))
                    local file=$(echo "$line" | cut -d':' -f1)
                    local line_num=$(echo "$line" | cut -d':' -f2)
                    local content=$(echo "$line" | cut -d':' -f3-)
                    local relative_file="${file#$PROJECT_ROOT/}"
                    HIGH_ITEMS+=("$relative_file:$line_num|HACK: ${content:0:70}")
                fi
            done < <(grep -rnE 'HACK|WORKAROUND|KLUDGE' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null || true)

            # XXX comments
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    XXX_COUNT=$((XXX_COUNT + 1))
                    local file=$(echo "$line" | cut -d':' -f1)
                    local line_num=$(echo "$line" | cut -d':' -f2)
                    local content=$(echo "$line" | cut -d':' -f3-)
                    local relative_file="${file#$PROJECT_ROOT/}"
                    HIGH_ITEMS+=("$relative_file:$line_num|XXX: ${content:0:70}")
                fi
            done < <(grep -rnE '\bXXX\b' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null || true)
        fi
    done
}

# =============================================================================
# 4. SCAN FOR DEPRECATED CODE
# =============================================================================
scan_deprecated() {
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # @deprecated JSDoc tags
            while IFS= read -r line; do
                if [ -n "$line" ]; then
                    DEPRECATED_COUNT=$((DEPRECATED_COUNT + 1))
                    local file=$(echo "$line" | cut -d':' -f1)
                    local relative_file="${file#$PROJECT_ROOT/}"
                    MEDIUM_ITEMS+=("$relative_file|Uses deprecated code or @deprecated marker")
                fi
            done < <(grep -rlE '@deprecated|DEPRECATED' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" 2>/dev/null || true)
        fi
    done
}

# =============================================================================
# 5. SCAN FOR CONSOLE.LOG (Frontend only)
# =============================================================================
scan_console_logs() {
    if [ -d "$PROJECT_ROOT/frontend/src" ]; then
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                # Skip if it's a utility/logger file
                if echo "$line" | grep -qvE 'logger|debug|util'; then
                    CONSOLE_LOG_COUNT=$((CONSOLE_LOG_COUNT + 1))
                fi
            fi
        done < <(grep -rnE 'console\.(log|warn|error|info|debug)\(' "$PROJECT_ROOT/frontend/src" --include="*.ts" --include="*.tsx" 2>/dev/null || true)

        if [ "$CONSOLE_LOG_COUNT" -gt 10 ]; then
            LOW_ITEMS+=("frontend/src|$CONSOLE_LOG_COUNT console.log statements found")
        fi
    fi
}

# =============================================================================
# 6. SCAN FOR COMMENTED OUT CODE
# =============================================================================
scan_commented_code() {
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # Look for blocks of commented code (3+ consecutive comment lines with code patterns)
            while IFS= read -r -d '' file; do
                local commented_blocks=$(awk '
                    /^[[:space:]]*\/\// {
                        if (match($0, /function|const|let|var|if|for|while|return|import|export/)) {
                            count++
                        }
                    }
                    END { print count+0 }
                ' "$file" 2>/dev/null)

                if [ "$commented_blocks" -gt 5 ]; then
                    COMMENTED_CODE_COUNT=$((COMMENTED_CODE_COUNT + 1))
                    local relative_file="${file#$PROJECT_ROOT/}"
                    LOW_ITEMS+=("$relative_file|Contains $commented_blocks lines of commented-out code")
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*node_modules*" -print0 2>/dev/null)
        fi
    done
}

# =============================================================================
# 7. SCAN FOR TEMPORARY/DEBUG CODE
# =============================================================================
scan_temp_code() {
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # Look for debug/temp patterns
            local temp_patterns=$(grep -rcE 'debugger|\.only\(|\.skip\(|TEMP|TEMPORARY|DEBUG_' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

            if [ "$temp_patterns" -gt 0 ]; then
                LOW_ITEMS+=("$dir|$temp_patterns temporary/debug code patterns found")
            fi
        fi
    done
}

# =============================================================================
# 8. SCAN FOR ANY TYPE ABUSE
# =============================================================================
scan_any_abuse() {
    local any_count=0

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            any_count=$(grep -rcE ':\s*any\b|as\s+any\b|<any>' "$PROJECT_ROOT/$dir" --include="*.ts" --include="*.tsx" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        fi
    done

    if [ "$any_count" -gt 20 ]; then
        MEDIUM_ITEMS+=("project|$any_count uses of 'any' type - reduces type safety")
    fi
}

# =============================================================================
# CALCULATE DEBT SCORE
# =============================================================================
calculate_score() {
    # Weight: FIXME = 15, HACK/XXX = 10, TODO_HIGH = 8, TODO = 3, LOW = 1
    local debt_points=$((FIXME_COUNT * 15 + HACK_COUNT * 10 + XXX_COUNT * 10 + TODO_HIGH_COUNT * 8 + TODO_COUNT * 3 + DEPRECATED_COUNT * 5 + CONSOLE_LOG_COUNT / 5 + COMMENTED_CODE_COUNT * 2))

    # Score calculation (100 = no debt, 0 = lots of debt)
    local score=$((100 - debt_points))
    [ "$score" -lt 0 ] && score=0
    [ "$score" -gt 100 ] && score=100

    echo "$score"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all scans
    scan_fixme
    scan_todo
    scan_hacks
    scan_deprecated
    scan_console_logs
    scan_commented_code
    scan_temp_code
    scan_any_abuse

    local overall_score=$(calculate_score)

    local total_critical=${#CRITICAL_ITEMS[@]}
    local total_high=${#HIGH_ITEMS[@]}
    local total_medium=${#MEDIUM_ITEMS[@]}
    local total_low=${#LOW_ITEMS[@]}

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # Build items JSON arrays
        local critical_json="["
        local first=true
        for item in "${CRITICAL_ITEMS[@]}"; do
            local location=$(echo "$item" | cut -d'|' -f1)
            local message=$(echo "$item" | cut -d'|' -f2 | sed 's/"/\\"/g')
            if [ "$first" = true ]; then
                critical_json="$critical_json{\"location\":\"$location\",\"message\":\"$message\"}"
                first=false
            else
                critical_json="$critical_json,{\"location\":\"$location\",\"message\":\"$message\"}"
            fi
        done
        critical_json="$critical_json]"

        local high_json="["
        first=true
        for item in "${HIGH_ITEMS[@]}"; do
            local location=$(echo "$item" | cut -d'|' -f1)
            local message=$(echo "$item" | cut -d'|' -f2 | sed 's/"/\\"/g')
            if [ "$first" = true ]; then
                high_json="$high_json{\"location\":\"$location\",\"message\":\"$message\"}"
                first=false
            else
                high_json="$high_json,{\"location\":\"$location\",\"message\":\"$message\"}"
            fi
        done
        high_json="$high_json]"

        # JSON output
        cat << EOF
{
    "category": "technical_debt",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "inventory": {
        "critical": $total_critical,
        "high": $total_high,
        "medium": $total_medium,
        "low": $total_low,
        "total": $((total_critical + total_high + total_medium + total_low))
    },
    "breakdown": {
        "fixme": $FIXME_COUNT,
        "todo_high_priority": $TODO_HIGH_COUNT,
        "todo": $TODO_COUNT,
        "hack": $HACK_COUNT,
        "xxx": $XXX_COUNT,
        "deprecated": $DEPRECATED_COUNT,
        "console_log": $CONSOLE_LOG_COUNT,
        "commented_code": $COMMENTED_CODE_COUNT
    },
    "critical_items": $critical_json,
    "high_items": $high_json
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Technical Debt Tracker${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 80 ]; then
            echo -e "  ${GREEN}Technical Debt Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 60 ]; then
            echo -e "  ${YELLOW}Technical Debt Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Technical Debt Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Debt Inventory:"
        printf "  - [Critical] %d items (FIXME)\n" "$total_critical"
        printf "  - [High]     %d items (TODO priority, HACK, XXX)\n" "$total_high"
        printf "  - [Medium]   %d items (TODO, deprecated)\n" "$total_medium"
        printf "  - [Low]      %d items (console.log, commented code)\n" "$total_low"
        echo ""

        echo "  Breakdown:"
        printf "  ├─ FIXME:           %3d\n" "$FIXME_COUNT"
        printf "  ├─ TODO (priority): %3d\n" "$TODO_HIGH_COUNT"
        printf "  ├─ TODO:            %3d\n" "$TODO_COUNT"
        printf "  ├─ HACK/Workaround: %3d\n" "$HACK_COUNT"
        printf "  ├─ XXX:             %3d\n" "$XXX_COUNT"
        printf "  ├─ Deprecated:      %3d\n" "$DEPRECATED_COUNT"
        printf "  ├─ console.log:     %3d\n" "$CONSOLE_LOG_COUNT"
        printf "  └─ Commented code:  %3d files\n" "$COMMENTED_CODE_COUNT"

        # Show top critical and high priority items
        if [ ${#CRITICAL_ITEMS[@]} -gt 0 ]; then
            echo ""
            echo "  Top Critical Issues (FIXME):"
            local count=0
            for item in "${CRITICAL_ITEMS[@]}"; do
                if [ $count -lt 3 ]; then
                    local location=$(echo "$item" | cut -d'|' -f1)
                    local message=$(echo "$item" | cut -d'|' -f2)
                    echo -e "  ${RED}1.${NC} $location"
                    echo "     $message"
                    count=$((count + 1))
                fi
            done
        fi

        if [ ${#HIGH_ITEMS[@]} -gt 0 ]; then
            echo ""
            echo "  Top High Priority Issues:"
            local count=0
            for item in "${HIGH_ITEMS[@]}"; do
                if [ $count -lt 3 ]; then
                    local location=$(echo "$item" | cut -d'|' -f1)
                    local message=$(echo "$item" | cut -d'|' -f2)
                    echo -e "  ${YELLOW}$((count + 1)).${NC} $location"
                    echo "     $message"
                    count=$((count + 1))
                fi
            done
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    fi
}

main
