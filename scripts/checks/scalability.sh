#!/bin/bash
# =============================================================================
# Scalability Check Module
# Analyzes scalability: database optimization, caching, API design, infrastructure
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
DATABASE_SCORE=100
CACHING_SCORE=100
API_DESIGN_SCORE=100
INFRASTRUCTURE_SCORE=100

# Metrics
INDEXED_RELATIONS=0
TOTAL_RELATIONS=0
PAGINATED_ENDPOINTS=0
RATE_LIMITED_ROUTES=0

# Issues and recommendations
declare -a ISSUES
declare -a RECOMMENDATIONS

# =============================================================================
# 1. DATABASE OPTIMIZATION ANALYSIS
# =============================================================================
analyze_database_optimization() {
    local score=100
    local indexes_found=0
    local relations_found=0
    local composite_indexes=0
    local unique_constraints=0

    if [ -f "$PROJECT_ROOT/backend/prisma/schema.prisma" ]; then
        local schema="$PROJECT_ROOT/backend/prisma/schema.prisma"

        # Count relations
        relations_found=$(grep -cE '@relation' "$schema" 2>/dev/null || echo "0")
        TOTAL_RELATIONS=$relations_found

        # Count indexes
        indexes_found=$(grep -cE '@@index|@unique' "$schema" 2>/dev/null || echo "0")
        INDEXED_RELATIONS=$indexes_found

        # Count composite indexes
        composite_indexes=$(grep -cE '@@index\(\[' "$schema" 2>/dev/null || echo "0")

        # Count unique constraints
        unique_constraints=$(grep -cE '@unique|@@unique' "$schema" 2>/dev/null || echo "0")

        # Check for missing indexes on foreign keys
        local foreign_keys=$(grep -E 'Int\s+@default|String\s+@default' "$schema" | grep -c 'Id' 2>/dev/null || echo "0")

        if [ "$indexes_found" -lt "$((relations_found / 2))" ]; then
            score=$((score - 20))
            ISSUES+=("LOW|Database|schema.prisma|Missing indexes on $((relations_found - indexes_found)) relations")
            RECOMMENDATIONS+=("Add indexes to frequently queried relation fields in Prisma schema")
        fi

        # Check for connection pooling config
        if [ -f "$PROJECT_ROOT/backend/.env.example" ]; then
            if ! grep -q "connection_limit\|pool" "$PROJECT_ROOT/backend/.env.example" 2>/dev/null; then
                score=$((score - 10))
                RECOMMENDATIONS+=("Configure database connection pooling for better scalability")
            fi
        fi

        # Check for soft deletes (better for large datasets)
        local soft_deletes=$(grep -c 'deletedAt' "$schema" 2>/dev/null || echo "0")
        if [ "$soft_deletes" -lt 3 ]; then
            RECOMMENDATIONS+=("Consider implementing soft deletes for critical models")
        fi

        # Check for timestamp fields
        local timestamps=$(grep -cE 'createdAt|updatedAt' "$schema" 2>/dev/null || echo "0")
        local models=$(grep -c '^model ' "$schema" 2>/dev/null || echo "1")
        if [ "$timestamps" -lt "$((models * 2))" ]; then
            score=$((score - 5))
            ISSUES+=("LOW|Database|schema.prisma|Some models missing timestamp fields")
        fi
    else
        score=50
        ISSUES+=("HIGH|Database|project|No Prisma schema found")
    fi

    DATABASE_SCORE=$score
    [ "$DATABASE_SCORE" -lt 0 ] && DATABASE_SCORE=0

    echo "$DATABASE_SCORE|$indexes_found|$relations_found|$composite_indexes|$unique_constraints"
}

# =============================================================================
# 2. CACHING STRATEGY ANALYSIS
# =============================================================================
analyze_caching() {
    local score=50  # Start at 50 (no caching is baseline)
    local has_redis=false
    local has_in_memory_cache=false
    local has_http_cache=false
    local cache_headers=0

    # Check for Redis/caching dependencies
    if [ -f "$PROJECT_ROOT/backend/package.json" ]; then
        if grep -qE '"redis"|"ioredis"|"cache-manager"' "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
            has_redis=true
            score=$((score + 30))
        fi
    fi

    # Check for in-memory caching patterns
    if [ -d "$PROJECT_ROOT/backend/src" ]; then
        # Look for Map/WeakMap based caching
        local memory_cache=$(grep -rcE 'new Map\(\)|new WeakMap\(\)|cache\s*=\s*\{' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        if [ "$memory_cache" -gt 0 ]; then
            has_in_memory_cache=true
            score=$((score + 10))
        fi

        # Check for cache headers
        cache_headers=$(grep -rcE 'Cache-Control|ETag|max-age' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        if [ "$cache_headers" -gt 0 ]; then
            has_http_cache=true
            score=$((score + 10))
        fi
    fi

    # Check frontend for caching strategies
    if [ -d "$PROJECT_ROOT/frontend/src" ]; then
        # Check for React Query (has built-in caching)
        if grep -rq '@tanstack/react-query\|react-query' "$PROJECT_ROOT/frontend/package.json" 2>/dev/null; then
            score=$((score + 15))
        fi

        # Check for service worker caching
        if grep -rq 'workbox\|service-worker\|sw.js' "$PROJECT_ROOT/frontend" 2>/dev/null; then
            score=$((score + 10))
        fi
    fi

    # Recommendations based on findings
    if [ "$has_redis" = false ]; then
        RECOMMENDATIONS+=("Consider implementing Redis for distributed caching")
    fi

    if [ "$cache_headers" -lt 3 ]; then
        RECOMMENDATIONS+=("Add HTTP cache headers (Cache-Control, ETag) to API responses")
    fi

    CACHING_SCORE=$score
    [ "$CACHING_SCORE" -gt 100 ] && CACHING_SCORE=100

    echo "$CACHING_SCORE|$has_redis|$has_in_memory_cache|$has_http_cache|$cache_headers"
}

# =============================================================================
# 3. API DESIGN ANALYSIS
# =============================================================================
analyze_api_design() {
    local score=100
    local paginated=0
    local total_list_endpoints=0
    local rate_limited=0
    local versioned=false

    if [ -d "$PROJECT_ROOT/backend/src/routes" ]; then
        # Count list/get-all endpoints
        total_list_endpoints=$(grep -rcE '\.(get)\s*\([^)]*["\x27]/[^"]+["\x27]\s*,' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

        # Count paginated endpoints (checking for skip/take, limit/offset, page)
        paginated=$(grep -rcE 'skip|take|limit|offset|page|per_page|pageSize' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        PAGINATED_ENDPOINTS=$paginated

        # Check for API versioning
        if grep -rqE '/api/v[0-9]|/v[0-9]/' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null; then
            versioned=true
        else
            score=$((score - 10))
            RECOMMENDATIONS+=("Implement API versioning (e.g., /api/v1/) for backwards compatibility")
        fi

        # Check for rate limiting
        if [ -f "$PROJECT_ROOT/backend/src/middleware/rateLimiter.ts" ] || grep -rqE 'rate-limit|rateLimit' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
            rate_limited=1
            RATE_LIMITED_ROUTES=1
        else
            score=$((score - 15))
            ISSUES+=("HIGH|API|backend|Rate limiting not implemented")
            RECOMMENDATIONS+=("Implement rate limiting to prevent API abuse")
        fi

        # Check for proper HTTP methods
        local improper_methods=$(grep -rcE '\.get\s*\([^)]*delete|\.get\s*\([^)]*create|\.get\s*\([^)]*update' "$PROJECT_ROOT/backend/src/routes" --include="*.ts" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
        if [ "$improper_methods" -gt 0 ]; then
            score=$((score - 10))
            ISSUES+=("MEDIUM|API|backend|$improper_methods endpoints may use incorrect HTTP methods")
        fi

        # Check for response compression
        if ! grep -rqE 'compression|gzip' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
            score=$((score - 5))
            RECOMMENDATIONS+=("Enable response compression (gzip) for API responses")
        fi
    fi

    # Check pagination ratio
    if [ "$total_list_endpoints" -gt 0 ] && [ "$paginated" -lt "$((total_list_endpoints / 2))" ]; then
        score=$((score - 15))
        ISSUES+=("MEDIUM|API|backend|Many list endpoints may lack pagination")
        RECOMMENDATIONS+=("Implement pagination for all list endpoints to handle large datasets")
    fi

    API_DESIGN_SCORE=$score
    [ "$API_DESIGN_SCORE" -lt 0 ] && API_DESIGN_SCORE=0

    echo "$API_DESIGN_SCORE|$paginated|$total_list_endpoints|$rate_limited|$versioned"
}

# =============================================================================
# 4. INFRASTRUCTURE READINESS
# =============================================================================
analyze_infrastructure() {
    local score=100
    local has_docker=false
    local has_ci_cd=false
    local has_env_config=false
    local has_health_check=false

    # Check for Docker configuration
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ] || [ -f "$PROJECT_ROOT/Dockerfile" ]; then
        has_docker=true
    else
        score=$((score - 15))
        RECOMMENDATIONS+=("Add Docker configuration for containerized deployment")
    fi

    # Check for CI/CD configuration
    if [ -d "$PROJECT_ROOT/.github/workflows" ] || [ -f "$PROJECT_ROOT/.gitlab-ci.yml" ] || [ -f "$PROJECT_ROOT/Jenkinsfile" ]; then
        has_ci_cd=true
    else
        score=$((score - 15))
        RECOMMENDATIONS+=("Set up CI/CD pipeline for automated testing and deployment")
    fi

    # Check for environment configuration
    if [ -f "$PROJECT_ROOT/backend/.env.example" ] || [ -f "$PROJECT_ROOT/.env.example" ]; then
        has_env_config=true

        # Check for production-ready env vars
        if ! grep -qE 'NODE_ENV|PRODUCTION' "$PROJECT_ROOT/backend/.env.example" 2>/dev/null; then
            score=$((score - 5))
        fi
    else
        score=$((score - 10))
        RECOMMENDATIONS+=("Create .env.example for environment configuration documentation")
    fi

    # Check for health check endpoint
    if grep -rqE '/health|/ready|/live' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        has_health_check=true
    else
        score=$((score - 10))
        RECOMMENDATIONS+=("Add /health endpoint for container orchestration")
    fi

    # Check for graceful shutdown handling
    if ! grep -rqE 'SIGTERM|SIGINT|process\.on' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        score=$((score - 10))
        RECOMMENDATIONS+=("Implement graceful shutdown handling for zero-downtime deployments")
    fi

    # Check for logging infrastructure
    if ! grep -rqE 'winston|pino|bunyan|morgan' "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
        score=$((score - 5))
        RECOMMENDATIONS+=("Consider structured logging (winston, pino) for production observability")
    fi

    # Check for file upload limits
    if grep -rqE 'multer|upload|fileSize' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        if ! grep -rqE 'limits|maxFileSize|fileSize' "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
            score=$((score - 5))
            ISSUES+=("MEDIUM|Infrastructure|backend|File upload limits may not be configured")
        fi
    fi

    INFRASTRUCTURE_SCORE=$score
    [ "$INFRASTRUCTURE_SCORE" -lt 0 ] && INFRASTRUCTURE_SCORE=0

    echo "$INFRASTRUCTURE_SCORE|$has_docker|$has_ci_cd|$has_env_config|$has_health_check"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local db_result=$(analyze_database_optimization)
    local cache_result=$(analyze_caching)
    local api_result=$(analyze_api_design)
    local infra_result=$(analyze_infrastructure)

    # Calculate overall score (weighted)
    local overall_score=$(( (DATABASE_SCORE * 30 + CACHING_SCORE * 20 + API_DESIGN_SCORE * 30 + INFRASTRUCTURE_SCORE * 20) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # Build issues JSON array
        local issues_json="["
        local first=true
        for item in "${ISSUES[@]}"; do
            local severity=$(echo "$item" | cut -d'|' -f1)
            local category=$(echo "$item" | cut -d'|' -f2)
            local location=$(echo "$item" | cut -d'|' -f3)
            local message=$(echo "$item" | cut -d'|' -f4)
            if [ "$first" = true ]; then
                issues_json="$issues_json{\"severity\":\"$severity\",\"category\":\"$category\",\"location\":\"$location\",\"message\":\"$message\"}"
                first=false
            else
                issues_json="$issues_json,{\"severity\":\"$severity\",\"category\":\"$category\",\"location\":\"$location\",\"message\":\"$message\"}"
            fi
        done
        issues_json="$issues_json]"

        # JSON output
        cat << EOF
{
    "category": "scalability",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "subscores": {
        "database_optimization": $DATABASE_SCORE,
        "caching_strategy": $CACHING_SCORE,
        "api_design": $API_DESIGN_SCORE,
        "infrastructure_ready": $INFRASTRUCTURE_SCORE
    },
    "metrics": {
        "indexed_relations": $INDEXED_RELATIONS,
        "total_relations": $TOTAL_RELATIONS,
        "paginated_endpoints": $PAGINATED_ENDPOINTS,
        "rate_limited_routes": $RATE_LIMITED_ROUTES
    },
    "details": {
        "database": {
            "indexes": $(echo "$db_result" | cut -d'|' -f2),
            "relations": $(echo "$db_result" | cut -d'|' -f3),
            "composite_indexes": $(echo "$db_result" | cut -d'|' -f4),
            "unique_constraints": $(echo "$db_result" | cut -d'|' -f5)
        },
        "caching": {
            "has_redis": $(echo "$cache_result" | cut -d'|' -f2),
            "has_in_memory": $(echo "$cache_result" | cut -d'|' -f3),
            "has_http_cache": $(echo "$cache_result" | cut -d'|' -f4)
        },
        "api": {
            "paginated": $(echo "$api_result" | cut -d'|' -f2),
            "total_list_endpoints": $(echo "$api_result" | cut -d'|' -f3),
            "rate_limited": $(echo "$api_result" | cut -d'|' -f4),
            "versioned": $(echo "$api_result" | cut -d'|' -f5)
        },
        "infrastructure": {
            "has_docker": $(echo "$infra_result" | cut -d'|' -f2),
            "has_ci_cd": $(echo "$infra_result" | cut -d'|' -f3),
            "has_health_check": $(echo "$infra_result" | cut -d'|' -f5)
        }
    },
    "issues": $issues_json
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Scalability Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 80 ]; then
            echo -e "  ${GREEN}Scalability Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 60 ]; then
            echo -e "  ${YELLOW}Scalability Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Scalability Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Subscores:"
        printf "  ├─ Database Optimization: %3d/100\n" "$DATABASE_SCORE"
        printf "  ├─ Caching Strategy:      %3d/100\n" "$CACHING_SCORE"
        printf "  ├─ API Design:            %3d/100\n" "$API_DESIGN_SCORE"
        printf "  └─ Infrastructure Ready:  %3d/100\n" "$INFRASTRUCTURE_SCORE"
        echo ""

        echo "  Metrics:"
        printf "  ├─ Database Indexes:      %d/%d relations\n" "$INDEXED_RELATIONS" "$TOTAL_RELATIONS"
        printf "  ├─ Paginated Endpoints:   %d\n" "$PAGINATED_ENDPOINTS"
        printf "  └─ Rate Limited Routes:   %s\n" "$( [ "$RATE_LIMITED_ROUTES" -gt 0 ] && echo 'Yes' || echo 'No' )"

        # Show issues
        if [ ${#ISSUES[@]} -gt 0 ]; then
            echo ""
            echo "  Scalability Issues:"
            local count=0
            for issue in "${ISSUES[@]}"; do
                if [ $count -lt 5 ]; then
                    local severity=$(echo "$issue" | cut -d'|' -f1)
                    local message=$(echo "$issue" | cut -d'|' -f4)
                    case $severity in
                        HIGH) echo -e "  ${YELLOW}[$severity]${NC} $message" ;;
                        *) echo "  [$severity] $message" ;;
                    esac
                    count=$((count + 1))
                fi
            done
        fi

        # Show recommendations
        if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
            echo ""
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
