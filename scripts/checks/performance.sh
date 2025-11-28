#!/bin/bash
# =============================================================================
# Performance Check Module
# Analyzes performance: bundle size, build time, dependencies, efficiency
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
BUNDLE_SIZE_SCORE=100
BUILD_TIME_SCORE=100
DEPENDENCY_SCORE=100
DATABASE_SCORE=100
LOAD_ESTIMATE_SCORE=100

# Metrics
BUNDLE_SIZE_KB=0
BUILD_TIME_SECONDS=0
TOTAL_DEPENDENCIES=0
LARGE_FILES_COUNT=0

# Detailed recommendations
declare -a RECOMMENDATIONS

# =============================================================================
# 1. BUNDLE SIZE ANALYSIS
# =============================================================================
analyze_bundle_size() {
    local total_size=0
    local gzipped_size=0
    local chunk_count=0
    local large_chunks=0

    # Check if dist exists, if not try to build
    if [ -d "$PROJECT_ROOT/frontend/dist" ]; then
        # Analyze existing build
        if [ -d "$PROJECT_ROOT/frontend/dist/assets" ]; then
            # Calculate total JS size
            local js_size=$(find "$PROJECT_ROOT/frontend/dist/assets" -name "*.js" -exec du -cb {} + 2>/dev/null | tail -1 | cut -f1 || echo "0")
            total_size=$((js_size / 1024)) # Convert to KB

            # Count chunks
            chunk_count=$(find "$PROJECT_ROOT/frontend/dist/assets" -name "*.js" 2>/dev/null | wc -l || echo "0")

            # Find large chunks (>100KB)
            while IFS= read -r -d '' file; do
                local file_size=$(du -k "$file" 2>/dev/null | cut -f1 || echo "0")
                if [ "$file_size" -gt 100 ]; then
                    large_chunks=$((large_chunks + 1))
                    local filename=$(basename "$file")
                    RECOMMENDATIONS+=("Consider code-splitting for large chunk: $filename (${file_size}KB)")
                fi
            done < <(find "$PROJECT_ROOT/frontend/dist/assets" -name "*.js" -print0 2>/dev/null)

            # Estimate gzipped size (typically 30% of original)
            gzipped_size=$((total_size * 30 / 100))
        fi
    else
        # Estimate based on source files
        local src_size=$(find "$PROJECT_ROOT/frontend/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) -exec du -cb {} + 2>/dev/null | tail -1 | cut -f1 || echo "0")
        # Source typically compiles to 50-70% of size after minification
        total_size=$((src_size * 60 / 100 / 1024))
        gzipped_size=$((total_size * 30 / 100))
        RECOMMENDATIONS+=("Run 'npm run build' in frontend to get accurate bundle metrics")
    fi

    BUNDLE_SIZE_KB=$total_size

    # Score calculation (target: <500KB total, <150KB gzipped)
    if [ "$gzipped_size" -le 100 ]; then
        BUNDLE_SIZE_SCORE=100
    elif [ "$gzipped_size" -le 150 ]; then
        BUNDLE_SIZE_SCORE=90
    elif [ "$gzipped_size" -le 200 ]; then
        BUNDLE_SIZE_SCORE=80
    elif [ "$gzipped_size" -le 300 ]; then
        BUNDLE_SIZE_SCORE=70
    elif [ "$gzipped_size" -le 400 ]; then
        BUNDLE_SIZE_SCORE=60
    elif [ "$gzipped_size" -le 500 ]; then
        BUNDLE_SIZE_SCORE=50
    else
        BUNDLE_SIZE_SCORE=$((100 - (gzipped_size - 500) / 10))
        [ "$BUNDLE_SIZE_SCORE" -lt 0 ] && BUNDLE_SIZE_SCORE=0
    fi

    echo "$BUNDLE_SIZE_SCORE|$total_size|$gzipped_size|$chunk_count|$large_chunks"
}

# =============================================================================
# 2. BUILD TIME ANALYSIS
# =============================================================================
analyze_build_time() {
    local frontend_build_time=0
    local backend_build_time=0

    # Measure frontend build time (if possible)
    if [ -d "$PROJECT_ROOT/frontend" ] && [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        cd "$PROJECT_ROOT/frontend"

        # Check for TypeScript config
        if [ -f "tsconfig.json" ]; then
            # Measure TypeScript check time
            local start_time=$(date +%s%N)
            npx tsc --noEmit 2>/dev/null || true
            local end_time=$(date +%s%N)
            frontend_build_time=$(( (end_time - start_time) / 1000000000 ))
        fi
    fi

    # Measure backend build time
    if [ -d "$PROJECT_ROOT/backend" ] && [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        cd "$PROJECT_ROOT/backend"

        if [ -f "tsconfig.json" ]; then
            local start_time=$(date +%s%N)
            npx tsc --noEmit 2>/dev/null || true
            local end_time=$(date +%s%N)
            backend_build_time=$(( (end_time - start_time) / 1000000000 ))
        fi
    fi

    cd "$PROJECT_ROOT"

    local total_build_time=$((frontend_build_time + backend_build_time))
    BUILD_TIME_SECONDS=$total_build_time

    # Score calculation (target: <30s excellent, <60s good)
    if [ "$total_build_time" -le 15 ]; then
        BUILD_TIME_SCORE=100
    elif [ "$total_build_time" -le 30 ]; then
        BUILD_TIME_SCORE=90
    elif [ "$total_build_time" -le 45 ]; then
        BUILD_TIME_SCORE=80
    elif [ "$total_build_time" -le 60 ]; then
        BUILD_TIME_SCORE=70
    elif [ "$total_build_time" -le 90 ]; then
        BUILD_TIME_SCORE=60
    elif [ "$total_build_time" -le 120 ]; then
        BUILD_TIME_SCORE=50
    else
        BUILD_TIME_SCORE=$((100 - (total_build_time - 120) / 5))
        [ "$BUILD_TIME_SCORE" -lt 0 ] && BUILD_TIME_SCORE=0
    fi

    if [ "$total_build_time" -gt 60 ]; then
        RECOMMENDATIONS+=("Build time is slow (${total_build_time}s). Consider incremental builds or caching")
    fi

    echo "$BUILD_TIME_SCORE|$frontend_build_time|$backend_build_time|$total_build_time"
}

# =============================================================================
# 3. DEPENDENCY ANALYSIS
# =============================================================================
analyze_dependencies() {
    local frontend_deps=0
    local frontend_dev_deps=0
    local backend_deps=0
    local backend_dev_deps=0
    local duplicate_deps=0
    local large_deps=0

    # Analyze frontend dependencies
    if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
        frontend_deps=$(grep -c '"[^"]*":' "$PROJECT_ROOT/frontend/package.json" 2>/dev/null | head -1 || echo "0")
        # More accurate count
        frontend_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/frontend/package.json').dependencies || {}).length)" 2>/dev/null || echo "0")
        frontend_dev_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/frontend/package.json').devDependencies || {}).length)" 2>/dev/null || echo "0")
    fi

    # Analyze backend dependencies
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        backend_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/backend/package.json').dependencies || {}).length)" 2>/dev/null || echo "0")
        backend_dev_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/backend/package.json').devDependencies || {}).length)" 2>/dev/null || echo "0")
    fi

    TOTAL_DEPENDENCIES=$((frontend_deps + frontend_dev_deps + backend_deps + backend_dev_deps))

    # Check for potentially large/unused dependencies
    local heavy_deps=("moment" "lodash" "jquery" "bootstrap" "material-ui" "antd")
    for dep in "${heavy_deps[@]}"; do
        if grep -rq "\"$dep\"" "$PROJECT_ROOT/frontend/package.json" "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
            large_deps=$((large_deps + 1))
            RECOMMENDATIONS+=("Consider lighter alternative for '$dep' or use tree-shaking")
        fi
    done

    # Check for duplicate dependencies between frontend and backend
    if [ -f "$PROJECT_ROOT/frontend/package.json" ] && [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        local fe_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/frontend/package.json').dependencies || {}).join('\n'))" 2>/dev/null || true)
        local be_deps=$(node -e "console.log(Object.keys(require('$PROJECT_ROOT/backend/package.json').dependencies || {}).join('\n'))" 2>/dev/null || true)

        if [ -n "$fe_deps" ] && [ -n "$be_deps" ]; then
            duplicate_deps=$(echo -e "$fe_deps\n$be_deps" | sort | uniq -d | wc -l || echo "0")
            if [ "$duplicate_deps" -gt 5 ]; then
                RECOMMENDATIONS+=("Consider moving $duplicate_deps shared dependencies to root package.json")
            fi
        fi
    fi

    # Score calculation (target: <80 total deps)
    if [ "$TOTAL_DEPENDENCIES" -le 50 ]; then
        DEPENDENCY_SCORE=100
    elif [ "$TOTAL_DEPENDENCIES" -le 80 ]; then
        DEPENDENCY_SCORE=90
    elif [ "$TOTAL_DEPENDENCIES" -le 100 ]; then
        DEPENDENCY_SCORE=80
    elif [ "$TOTAL_DEPENDENCIES" -le 120 ]; then
        DEPENDENCY_SCORE=70
    elif [ "$TOTAL_DEPENDENCIES" -le 150 ]; then
        DEPENDENCY_SCORE=60
    else
        DEPENDENCY_SCORE=$((100 - (TOTAL_DEPENDENCIES - 150) / 5))
        [ "$DEPENDENCY_SCORE" -lt 0 ] && DEPENDENCY_SCORE=0
    fi

    echo "$DEPENDENCY_SCORE|$frontend_deps|$backend_deps|$TOTAL_DEPENDENCIES|$duplicate_deps|$large_deps"
}

# =============================================================================
# 4. DATABASE EFFICIENCY ANALYSIS
# =============================================================================
analyze_database_efficiency() {
    local n_plus_one_risk=0
    local missing_indexes=0
    local unoptimized_queries=0
    local model_count=0

    # Check Prisma schema for potential issues
    if [ -f "$PROJECT_ROOT/backend/prisma/schema.prisma" ]; then
        # Count models
        model_count=$(grep -c "^model " "$PROJECT_ROOT/backend/prisma/schema.prisma" 2>/dev/null || echo "0")

        # Check for relations without indexes
        local relations=$(grep -cE "@relation" "$PROJECT_ROOT/backend/prisma/schema.prisma" 2>/dev/null || echo "0")
        local indexes=$(grep -cE "@@index|@@unique" "$PROJECT_ROOT/backend/prisma/schema.prisma" 2>/dev/null || echo "0")

        if [ "$relations" -gt "$((indexes * 2))" ]; then
            missing_indexes=$((relations - indexes * 2))
            RECOMMENDATIONS+=("Consider adding indexes for $missing_indexes relation fields")
        fi
    fi

    # Check for N+1 query patterns in code
    for dir in "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # Look for findMany followed by individual finds (N+1 pattern)
            n_plus_one_risk=$(grep -rEc "findMany|findAll" "$PROJECT_ROOT/$dir" --include="*.ts" 2>/dev/null || echo "0")

            # Check if includes are used (good practice)
            local includes_used=$(grep -rEc "include:\s*{" "$PROJECT_ROOT/$dir" --include="*.ts" 2>/dev/null || echo "0")

            if [ "$n_plus_one_risk" -gt "$((includes_used * 2))" ]; then
                RECOMMENDATIONS+=("Review queries for N+1 patterns - use 'include' to eager load relations")
            fi

            # Check for raw queries (potential optimization issues)
            unoptimized_queries=$(grep -rcE '\$executeRaw|\$queryRaw' "$PROJECT_ROOT/$dir" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        fi
    done

    # Score calculation
    local issues=$((missing_indexes + n_plus_one_risk / 5 + unoptimized_queries * 2))
    DATABASE_SCORE=$((100 - issues * 5))
    [ "$DATABASE_SCORE" -lt 0 ] && DATABASE_SCORE=0

    echo "$DATABASE_SCORE|$model_count|$missing_indexes|$n_plus_one_risk|$unoptimized_queries"
}

# =============================================================================
# 5. LOAD TIME ESTIMATE
# =============================================================================
estimate_load_time() {
    local estimated_score=80
    local issues=0

    # Check for lazy loading implementation
    local lazy_loading=$(grep -rcE "React.lazy|lazy\(" "$PROJECT_ROOT/frontend/src" --include="*.tsx" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

    if [ "$lazy_loading" -lt 3 ]; then
        issues=$((issues + 1))
        RECOMMENDATIONS+=("Implement React.lazy() for code splitting - improves initial load time")
    fi

    # Check for image optimization
    local image_imports=$(grep -rcE "import.*\.(png|jpg|jpeg|gif|svg)" "$PROJECT_ROOT/frontend/src" --include="*.tsx" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

    if [ "$image_imports" -gt 20 ]; then
        RECOMMENDATIONS+=("Consider lazy loading images or using next-gen formats (WebP, AVIF)")
    fi

    # Check for PWA/service worker
    if [ -f "$PROJECT_ROOT/frontend/vite.config.ts" ]; then
        if grep -q "VitePWA" "$PROJECT_ROOT/frontend/vite.config.ts" 2>/dev/null; then
            estimated_score=$((estimated_score + 10))
        else
            RECOMMENDATIONS+=("Consider implementing PWA for offline support and faster subsequent loads")
        fi
    fi

    # Check for preloading critical assets
    if [ -f "$PROJECT_ROOT/frontend/index.html" ]; then
        local preloads=$(grep -c "rel=\"preload\"" "$PROJECT_ROOT/frontend/index.html" 2>/dev/null || echo "0")
        if [ "$preloads" -lt 2 ]; then
            RECOMMENDATIONS+=("Add preload hints for critical CSS/fonts in index.html")
        fi
    fi

    LOAD_ESTIMATE_SCORE=$((estimated_score - issues * 10))
    [ "$LOAD_ESTIMATE_SCORE" -lt 0 ] && LOAD_ESTIMATE_SCORE=0
    [ "$LOAD_ESTIMATE_SCORE" -gt 100 ] && LOAD_ESTIMATE_SCORE=100

    echo "$LOAD_ESTIMATE_SCORE|$lazy_loading|$image_imports"
}

# =============================================================================
# LARGE FILES ANALYSIS
# =============================================================================
find_large_files() {
    local large_count=0

    # Find large source files (>100KB)
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            while IFS= read -r -d '' file; do
                local file_size=$(du -k "$file" 2>/dev/null | cut -f1 || echo "0")
                if [ "$file_size" -gt 100 ]; then
                    large_count=$((large_count + 1))
                    local relative_file="${file#$PROJECT_ROOT/}"
                    RECOMMENDATIONS+=("Consider splitting large file: $relative_file (${file_size}KB)")
                fi
            done < <(find "$PROJECT_ROOT/$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -print0 2>/dev/null)
        fi
    done

    LARGE_FILES_COUNT=$large_count
    echo "$large_count"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local bundle_result=$(analyze_bundle_size)
    local build_result=$(analyze_build_time)
    local dep_result=$(analyze_dependencies)
    local db_result=$(analyze_database_efficiency)
    local load_result=$(estimate_load_time)
    local large_files=$(find_large_files)

    # Calculate overall performance score (weighted)
    local overall_score=$(( (BUNDLE_SIZE_SCORE * 30 + BUILD_TIME_SCORE * 20 + DEPENDENCY_SCORE * 15 + DATABASE_SCORE * 20 + LOAD_ESTIMATE_SCORE * 15) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # JSON output
        cat << EOF
{
    "category": "performance",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "subscores": {
        "bundle_size": $BUNDLE_SIZE_SCORE,
        "build_time": $BUILD_TIME_SCORE,
        "dependencies": $DEPENDENCY_SCORE,
        "database_efficiency": $DATABASE_SCORE,
        "load_time_estimate": $LOAD_ESTIMATE_SCORE
    },
    "metrics": {
        "bundle_size_kb": $BUNDLE_SIZE_KB,
        "build_time_seconds": $BUILD_TIME_SECONDS,
        "total_dependencies": $TOTAL_DEPENDENCIES,
        "large_files_count": $LARGE_FILES_COUNT
    },
    "details": {
        "bundle": {
            "total_kb": $(echo "$bundle_result" | cut -d'|' -f2),
            "gzipped_kb": $(echo "$bundle_result" | cut -d'|' -f3),
            "chunk_count": $(echo "$bundle_result" | cut -d'|' -f4),
            "large_chunks": $(echo "$bundle_result" | cut -d'|' -f5)
        },
        "build": {
            "frontend_seconds": $(echo "$build_result" | cut -d'|' -f2),
            "backend_seconds": $(echo "$build_result" | cut -d'|' -f3),
            "total_seconds": $(echo "$build_result" | cut -d'|' -f4)
        },
        "dependencies": {
            "frontend": $(echo "$dep_result" | cut -d'|' -f2),
            "backend": $(echo "$dep_result" | cut -d'|' -f3),
            "total": $(echo "$dep_result" | cut -d'|' -f4),
            "duplicates": $(echo "$dep_result" | cut -d'|' -f5)
        },
        "database": {
            "model_count": $(echo "$db_result" | cut -d'|' -f2),
            "missing_indexes": $(echo "$db_result" | cut -d'|' -f3),
            "n_plus_one_risk": $(echo "$db_result" | cut -d'|' -f4)
        }
    }
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Performance Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 90 ]; then
            echo -e "  ${GREEN}Performance Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 75 ]; then
            echo -e "  ${YELLOW}Performance Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Performance Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Subscores:"
        printf "  ├─ Bundle Size:       %3d/100 (Current: %d KB)\n" "$BUNDLE_SIZE_SCORE" "$BUNDLE_SIZE_KB"
        printf "  ├─ Build Time:        %3d/100 (Current: %d seconds)\n" "$BUILD_TIME_SCORE" "$BUILD_TIME_SECONDS"
        printf "  ├─ Dependencies:      %3d/100 (Total: %d)\n" "$DEPENDENCY_SCORE" "$TOTAL_DEPENDENCIES"
        printf "  ├─ Database Efficiency: %3d/100\n" "$DATABASE_SCORE"
        printf "  └─ Load Time Est.:    %3d/100\n" "$LOAD_ESTIMATE_SCORE"
        echo ""

        # Show recommendations
        if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
            echo "  Recommendations:"
            local count=0
            for rec in "${RECOMMENDATIONS[@]}"; do
                if [ $count -lt 6 ]; then
                    echo "  - $rec"
                    count=$((count + 1))
                fi
            done
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    fi
}

main
