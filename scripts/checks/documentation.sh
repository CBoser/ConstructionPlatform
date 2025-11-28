#!/bin/bash
# =============================================================================
# Documentation Check Module
# Analyzes documentation quality: README, code comments, API docs, types
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
README_SCORE=100
CODE_COMMENTS_SCORE=100
API_DOCS_SCORE=100
TYPE_DOCS_SCORE=100

# Metrics
README_SECTIONS=0
COMMENT_RATIO=0
DOCUMENTED_ENDPOINTS=0
TOTAL_ENDPOINTS=0
DOCUMENTED_TYPES=0
TOTAL_EXPORTS=0

# Missing documentation
declare -a MISSING_DOCS
declare -a RECOMMENDATIONS

# =============================================================================
# 1. README ANALYSIS
# =============================================================================
analyze_readme() {
    local score=0
    local sections_found=0
    local total_expected=10

    # Expected sections in a good README
    local expected_sections=(
        "installation|install|setup|getting started"
        "usage|how to use|quick start"
        "api|endpoints|routes"
        "configuration|config|environment"
        "development|contributing|developers"
        "testing|tests"
        "deployment|deploy|production"
        "architecture|structure|overview"
        "license"
        "features|capabilities"
    )

    if [ -f "$PROJECT_ROOT/README.md" ]; then
        local readme_content=$(cat "$PROJECT_ROOT/README.md" 2>/dev/null | tr '[:upper:]' '[:lower:]')

        for section in "${expected_sections[@]}"; do
            if echo "$readme_content" | grep -qiE "^#+ .*($section)"; then
                sections_found=$((sections_found + 1))
            fi
        done

        # Check README length (should be substantial)
        local readme_lines=$(wc -l < "$PROJECT_ROOT/README.md" 2>/dev/null || echo "0")

        if [ "$readme_lines" -lt 50 ]; then
            MISSING_DOCS+=("README.md is too short ($readme_lines lines) - expand documentation")
        fi

        # Check for code examples
        if ! grep -q '```' "$PROJECT_ROOT/README.md" 2>/dev/null; then
            MISSING_DOCS+=("README.md lacks code examples")
        fi

        # Check for badges (good practice)
        if ! grep -qE '\!\[.*\]\(.*badge' "$PROJECT_ROOT/README.md" 2>/dev/null; then
            RECOMMENDATIONS+=("Consider adding status badges to README.md")
        fi
    else
        MISSING_DOCS+=("No README.md found at project root")
        sections_found=0
    fi

    README_SECTIONS=$sections_found

    # Calculate score
    README_SCORE=$((sections_found * 100 / total_expected))
    [ "$README_SCORE" -gt 100 ] && README_SCORE=100

    echo "$README_SCORE|$sections_found|$total_expected"
}

# =============================================================================
# 2. CODE COMMENTS ANALYSIS
# =============================================================================
analyze_code_comments() {
    local total_lines=0
    local comment_lines=0
    local jsdoc_count=0
    local files_without_comments=0

    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                local file_lines=$(wc -l < "$file" 2>/dev/null || echo "0")
                total_lines=$((total_lines + file_lines))

                # Count single-line comments
                local single_comments=$(grep -cE '^\s*//' "$file" 2>/dev/null || echo "0")

                # Count multi-line comment lines
                local multi_comments=$(grep -cE '^\s*\*|^\s*/\*|\*/' "$file" 2>/dev/null || echo "0")

                local file_comments=$((single_comments + multi_comments))
                comment_lines=$((comment_lines + file_comments))

                # Count JSDoc blocks
                local file_jsdoc=$(grep -cE '^\s*/\*\*' "$file" 2>/dev/null || echo "0")
                jsdoc_count=$((jsdoc_count + file_jsdoc))

                # Flag files with no comments (and >50 lines)
                if [ "$file_lines" -gt 50 ] && [ "$file_comments" -lt 3 ]; then
                    files_without_comments=$((files_without_comments + 1))
                    local relative_file="${file#$PROJECT_ROOT/}"
                    if [ "$files_without_comments" -le 5 ]; then
                        MISSING_DOCS+=("$relative_file has no comments ($file_lines lines)")
                    fi
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.d.ts" ! -path "*node_modules*" -print0 2>/dev/null)
        fi
    done

    # Calculate comment ratio
    if [ "$total_lines" -gt 0 ]; then
        COMMENT_RATIO=$((comment_lines * 100 / total_lines))
    fi

    # Calculate score (target: 10-20% comments)
    if [ "$COMMENT_RATIO" -ge 15 ]; then
        CODE_COMMENTS_SCORE=100
    elif [ "$COMMENT_RATIO" -ge 10 ]; then
        CODE_COMMENTS_SCORE=90
    elif [ "$COMMENT_RATIO" -ge 5 ]; then
        CODE_COMMENTS_SCORE=70
    elif [ "$COMMENT_RATIO" -ge 2 ]; then
        CODE_COMMENTS_SCORE=50
    else
        CODE_COMMENTS_SCORE=$((COMMENT_RATIO * 25))
    fi

    if [ "$jsdoc_count" -lt 10 ]; then
        RECOMMENDATIONS+=("Add JSDoc comments to public functions and classes")
    fi

    echo "$CODE_COMMENTS_SCORE|$COMMENT_RATIO|$jsdoc_count|$files_without_comments"
}

# =============================================================================
# 3. API DOCUMENTATION ANALYSIS
# =============================================================================
analyze_api_docs() {
    local documented=0
    local total=0
    local has_swagger=false
    local has_api_docs=false

    # Check for Swagger/OpenAPI
    if [ -f "$PROJECT_ROOT/backend/swagger.json" ] || [ -f "$PROJECT_ROOT/backend/openapi.yaml" ] || [ -f "$PROJECT_ROOT/docs/api/openapi.yaml" ]; then
        has_swagger=true
    fi

    # Check for API documentation folder
    if [ -d "$PROJECT_ROOT/docs/api" ]; then
        has_api_docs=true
    fi

    # Count API endpoints (routes)
    if [ -d "$PROJECT_ROOT/backend/src/routes" ]; then
        # Count route handlers
        total=$(grep -rcE '\.(get|post|put|patch|delete)\s*\(' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

        # Count documented endpoints (with comments before them)
        documented=$(grep -rcEB1 '\.(get|post|put|patch|delete)\s*\(' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | grep -c '//' || echo "0")

        TOTAL_ENDPOINTS=$total
        DOCUMENTED_ENDPOINTS=$documented
    fi

    # Check for route-level JSDoc
    local route_jsdocs=$(grep -rcE '^\s*/\*\*[\s\S]*?\*/[\s\n]*\w+\.(get|post|put|delete)' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

    # Calculate score
    if [ "$total" -gt 0 ]; then
        local doc_ratio=$((documented * 100 / total))
        API_DOCS_SCORE=$doc_ratio
    else
        API_DOCS_SCORE=50  # No endpoints found
    fi

    # Adjust score for Swagger presence
    if [ "$has_swagger" = true ]; then
        API_DOCS_SCORE=$((API_DOCS_SCORE + 20))
    else
        RECOMMENDATIONS+=("Consider adding OpenAPI/Swagger documentation for API endpoints")
    fi

    [ "$API_DOCS_SCORE" -gt 100 ] && API_DOCS_SCORE=100

    if [ "$total" -gt 0 ] && [ "$documented" -lt "$((total / 2))" ]; then
        MISSING_DOCS+=("Only $documented of $total API endpoints are documented")
    fi

    echo "$API_DOCS_SCORE|$documented|$total|$has_swagger|$has_api_docs"
}

# =============================================================================
# 4. TYPE DOCUMENTATION ANALYSIS
# =============================================================================
analyze_type_docs() {
    local documented_types=0
    local total_types=0
    local exports_with_jsdoc=0
    local total_exports=0

    # Analyze TypeScript types and interfaces
    for dir in "frontend/src" "backend/src" "shared"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                # Count type/interface declarations
                local types=$(grep -cE '^\s*(export\s+)?(type|interface)\s+\w+' "$file" 2>/dev/null || echo "0")
                total_types=$((total_types + types))

                # Count documented types (JSDoc before type)
                local doc_types=$(grep -cEB1 '^\s*(export\s+)?(type|interface)\s+\w+' "$file" 2>/dev/null | grep -c '/\*\*' || echo "0")
                documented_types=$((documented_types + doc_types))

                # Count exports
                local exports=$(grep -cE '^\s*export\s+(const|function|class|type|interface|enum)' "$file" 2>/dev/null || echo "0")
                total_exports=$((total_exports + exports))

                # Count exports with JSDoc
                local doc_exports=$(grep -cEB1 '^\s*export\s+(const|function|class)' "$file" 2>/dev/null | grep -c '/\*\*' || echo "0")
                exports_with_jsdoc=$((exports_with_jsdoc + doc_exports))
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.d.ts" ! -path "*node_modules*" -print0 2>/dev/null)
        fi
    done

    DOCUMENTED_TYPES=$documented_types
    TOTAL_EXPORTS=$total_exports

    # Calculate score
    if [ "$total_exports" -gt 0 ]; then
        TYPE_DOCS_SCORE=$((exports_with_jsdoc * 100 / total_exports))
    else
        TYPE_DOCS_SCORE=50
    fi

    [ "$TYPE_DOCS_SCORE" -gt 100 ] && TYPE_DOCS_SCORE=100

    if [ "$total_exports" -gt 0 ] && [ "$exports_with_jsdoc" -lt "$((total_exports / 4))" ]; then
        MISSING_DOCS+=("Only $exports_with_jsdoc of $total_exports exports have JSDoc documentation")
    fi

    # Check for dedicated types documentation
    if [ ! -d "$PROJECT_ROOT/docs/types" ] && [ ! -f "$PROJECT_ROOT/docs/TYPES.md" ]; then
        RECOMMENDATIONS+=("Consider creating type documentation (docs/TYPES.md)")
    fi

    echo "$TYPE_DOCS_SCORE|$documented_types|$total_types|$exports_with_jsdoc|$total_exports"
}

# =============================================================================
# 5. ARCHITECTURE DOCUMENTATION
# =============================================================================
analyze_architecture_docs() {
    local arch_score=0

    # Check for architecture documentation
    local arch_files=(
        "docs/ARCHITECTURE.md"
        "docs/architecture.md"
        "ARCHITECTURE.md"
        "docs/guides/architecture.md"
    )

    for file in "${arch_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            arch_score=$((arch_score + 30))
            break
        fi
    done

    # Check for ADRs (Architecture Decision Records)
    if [ -d "$PROJECT_ROOT/docs/adr" ] || [ -d "$PROJECT_ROOT/docs/ADR" ]; then
        arch_score=$((arch_score + 20))
    else
        RECOMMENDATIONS+=("Consider adding Architecture Decision Records (ADRs)")
    fi

    # Check for database schema documentation
    if [ -f "$PROJECT_ROOT/docs/database.md" ] || [ -f "$PROJECT_ROOT/docs/schema.md" ]; then
        arch_score=$((arch_score + 25))
    elif [ -f "$PROJECT_ROOT/backend/prisma/schema.prisma" ]; then
        # Check if schema has comments
        local schema_comments=$(grep -c '//' "$PROJECT_ROOT/backend/prisma/schema.prisma" 2>/dev/null || echo "0")
        if [ "$schema_comments" -gt 10 ]; then
            arch_score=$((arch_score + 15))
        else
            MISSING_DOCS+=("Prisma schema lacks documentation comments")
        fi
    fi

    # Check for contributing guide
    if [ -f "$PROJECT_ROOT/CONTRIBUTING.md" ]; then
        arch_score=$((arch_score + 15))
    else
        RECOMMENDATIONS+=("Add CONTRIBUTING.md for developer onboarding")
    fi

    # Check for changelog
    if [ -f "$PROJECT_ROOT/CHANGELOG.md" ]; then
        arch_score=$((arch_score + 10))
    fi

    [ "$arch_score" -gt 100 ] && arch_score=100

    echo "$arch_score"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local readme_result=$(analyze_readme)
    local comments_result=$(analyze_code_comments)
    local api_result=$(analyze_api_docs)
    local types_result=$(analyze_type_docs)
    local arch_score=$(analyze_architecture_docs)

    # Calculate overall score (weighted)
    local overall_score=$(( (README_SCORE * 25 + CODE_COMMENTS_SCORE * 25 + API_DOCS_SCORE * 25 + TYPE_DOCS_SCORE * 15 + arch_score * 10) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # Build missing docs JSON array
        local missing_json="["
        local first=true
        for item in "${MISSING_DOCS[@]}"; do
            if [ "$first" = true ]; then
                missing_json="$missing_json\"$(echo "$item" | sed 's/"/\\"/g')\""
                first=false
            else
                missing_json="$missing_json, \"$(echo "$item" | sed 's/"/\\"/g')\""
            fi
        done
        missing_json="$missing_json]"

        # JSON output
        cat << EOF
{
    "category": "documentation",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "subscores": {
        "readme_quality": $README_SCORE,
        "code_comments": $CODE_COMMENTS_SCORE,
        "api_documentation": $API_DOCS_SCORE,
        "type_documentation": $TYPE_DOCS_SCORE,
        "architecture_docs": $arch_score
    },
    "metrics": {
        "readme_sections": $README_SECTIONS,
        "comment_ratio": $COMMENT_RATIO,
        "documented_endpoints": $DOCUMENTED_ENDPOINTS,
        "total_endpoints": $TOTAL_ENDPOINTS,
        "documented_types": $DOCUMENTED_TYPES,
        "total_exports": $TOTAL_EXPORTS
    },
    "details": {
        "readme": {
            "sections_found": $(echo "$readme_result" | cut -d'|' -f2),
            "sections_expected": $(echo "$readme_result" | cut -d'|' -f3)
        },
        "comments": {
            "ratio_percent": $(echo "$comments_result" | cut -d'|' -f2),
            "jsdoc_count": $(echo "$comments_result" | cut -d'|' -f3),
            "files_without_comments": $(echo "$comments_result" | cut -d'|' -f4)
        },
        "api": {
            "documented": $(echo "$api_result" | cut -d'|' -f2),
            "total": $(echo "$api_result" | cut -d'|' -f3),
            "has_swagger": $(echo "$api_result" | cut -d'|' -f4)
        }
    },
    "missing_documentation": $missing_json
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Documentation Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 80 ]; then
            echo -e "  ${GREEN}Documentation Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 60 ]; then
            echo -e "  ${YELLOW}Documentation Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Documentation Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Subscores:"
        printf "  ├─ README Quality:      %3d/100\n" "$README_SCORE"
        printf "  ├─ Code Comments:       %3d/100 (%d%% ratio)\n" "$CODE_COMMENTS_SCORE" "$COMMENT_RATIO"
        printf "  ├─ API Documentation:   %3d/100\n" "$API_DOCS_SCORE"
        printf "  ├─ Type Documentation:  %3d/100\n" "$TYPE_DOCS_SCORE"
        printf "  └─ Architecture Docs:   %3d/100\n" "$arch_score"
        echo ""

        echo "  Statistics:"
        printf "  ├─ README Sections:     %d/10\n" "$README_SECTIONS"
        printf "  ├─ API Endpoints:       %d/%d documented\n" "$DOCUMENTED_ENDPOINTS" "$TOTAL_ENDPOINTS"
        printf "  └─ Exports Documented:  %d/%d\n" "$DOCUMENTED_TYPES" "$TOTAL_EXPORTS"

        # Show missing documentation
        if [ ${#MISSING_DOCS[@]} -gt 0 ]; then
            echo ""
            echo "  Missing Documentation:"
            local count=0
            for item in "${MISSING_DOCS[@]}"; do
                if [ $count -lt 5 ]; then
                    echo "  - $item"
                    count=$((count + 1))
                fi
            done
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
