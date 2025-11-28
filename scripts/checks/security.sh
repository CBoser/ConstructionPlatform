#!/bin/bash
# =============================================================================
# Security Check Module
# Analyzes security: vulnerabilities, secrets, configs, auth patterns
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
DEPENDENCY_SCORE=100
CODE_SECURITY_SCORE=100
CONFIG_SECURITY_SCORE=100
SECRET_DETECTION_SCORE=100
AUTH_SECURITY_SCORE=100

# Vulnerability counts
CRITICAL_VULNS=0
HIGH_VULNS=0
MEDIUM_VULNS=0
LOW_VULNS=0

# Detailed findings array
declare -a FINDINGS
declare -a ACTIONS

# =============================================================================
# 1. DEPENDENCY VULNERABILITY SCAN (npm audit)
# =============================================================================
analyze_dependencies() {
    local total_critical=0
    local total_high=0
    local total_medium=0
    local total_low=0
    local outdated_count=0

    # Check frontend dependencies
    if [ -d "$PROJECT_ROOT/frontend" ]; then
        cd "$PROJECT_ROOT/frontend"

        # Run npm audit
        local audit_result=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')

        # Parse vulnerability counts
        local fe_critical=$(echo "$audit_result" | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local fe_high=$(echo "$audit_result" | grep -o '"high":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local fe_medium=$(echo "$audit_result" | grep -o '"moderate":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local fe_low=$(echo "$audit_result" | grep -o '"low":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

        total_critical=$((total_critical + ${fe_critical:-0}))
        total_high=$((total_high + ${fe_high:-0}))
        total_medium=$((total_medium + ${fe_medium:-0}))
        total_low=$((total_low + ${fe_low:-0}))

        # Check for outdated packages
        local outdated=$(npm outdated --json 2>/dev/null || echo '{}')
        local fe_outdated=$(echo "$outdated" | grep -c '"current"' || echo "0")
        outdated_count=$((outdated_count + fe_outdated))
    fi

    # Check backend dependencies
    if [ -d "$PROJECT_ROOT/backend" ]; then
        cd "$PROJECT_ROOT/backend"

        # Run npm audit
        local audit_result=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')

        # Parse vulnerability counts
        local be_critical=$(echo "$audit_result" | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local be_high=$(echo "$audit_result" | grep -o '"high":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local be_medium=$(echo "$audit_result" | grep -o '"moderate":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
        local be_low=$(echo "$audit_result" | grep -o '"low":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

        total_critical=$((total_critical + ${be_critical:-0}))
        total_high=$((total_high + ${be_high:-0}))
        total_medium=$((total_medium + ${be_medium:-0}))
        total_low=$((total_low + ${be_low:-0}))

        # Check for outdated packages
        local outdated=$(npm outdated --json 2>/dev/null || echo '{}')
        local be_outdated=$(echo "$outdated" | grep -c '"current"' || echo "0")
        outdated_count=$((outdated_count + be_outdated))
    fi

    cd "$PROJECT_ROOT"

    CRITICAL_VULNS=$total_critical
    HIGH_VULNS=$total_high
    MEDIUM_VULNS=$total_medium
    LOW_VULNS=$total_low

    # Record findings
    if [ "$total_critical" -gt 0 ]; then
        FINDINGS+=("CRITICAL|Dependencies|npm audit|$total_critical critical vulnerabilities found")
        ACTIONS+=("Run 'npm audit fix' or manually update affected packages")
    fi
    if [ "$total_high" -gt 0 ]; then
        FINDINGS+=("HIGH|Dependencies|npm audit|$total_high high severity vulnerabilities found")
    fi

    # Calculate score (critical = -40, high = -15, medium = -5, low = -1)
    local penalty=$((total_critical * 40 + total_high * 15 + total_medium * 5 + total_low))
    DEPENDENCY_SCORE=$((100 - penalty))
    [ "$DEPENDENCY_SCORE" -lt 0 ] && DEPENDENCY_SCORE=0

    echo "$DEPENDENCY_SCORE|$total_critical|$total_high|$total_medium|$total_low|$outdated_count"
}

# =============================================================================
# 2. SECRET DETECTION SCAN
# =============================================================================
analyze_secrets() {
    local secrets_found=0
    local potential_secrets=0

    # Patterns to detect secrets
    local patterns=(
        # API Keys
        "(?i)(api[_-]?key|apikey)[\"']?\s*[:=]\s*[\"']?[a-zA-Z0-9_-]{20,}"
        # Passwords/Secrets
        "(?i)(secret|password|passwd|pwd)[\"']?\s*[:=]\s*[\"']?[^\\s\"']{8,}"
        # Tokens
        "(?i)(token|bearer)[\"']?\s*[:=]\s*[\"']?[a-zA-Z0-9_.-]{20,}"
        # AWS Keys
        "AKIA[0-9A-Z]{16}"
        # GitHub Tokens
        "gh[pso]_[a-zA-Z0-9]{36}"
        # Private Keys
        "-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----"
        # Database URLs with credentials
        "postgres(ql)?://[^:]+:[^@]+@[^/]+/"
        # JWT secrets
        "(?i)jwt[_-]?secret[\"']?\s*[:=]\s*[\"']?[^\\s\"']{16,}"
    )

    for dir in "frontend/src" "backend/src" "shared"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            for pattern in "${patterns[@]}"; do
                local matches=$(grep -rElP "$pattern" "$PROJECT_ROOT/$dir" \
                    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
                    2>/dev/null | grep -v "node_modules" | grep -v ".example" | grep -v ".sample" || true)

                if [ -n "$matches" ]; then
                    while IFS= read -r file; do
                        if [ -n "$file" ]; then
                            # Exclude example files and env templates
                            if [[ ! "$file" =~ \.(example|sample|template|md)$ ]]; then
                                secrets_found=$((secrets_found + 1))
                                local relative_file="${file#$PROJECT_ROOT/}"
                                FINDINGS+=("CRITICAL|Secrets|$relative_file|Potential secret/credential detected")
                                ACTIONS+=("Review and remove secret from $relative_file")
                            fi
                        fi
                    done <<< "$matches"
                fi
            done
        fi
    done

    # Check for .env files in repo (should be in .gitignore)
    local env_files=$(find "$PROJECT_ROOT" -name ".env" -type f ! -path "*node_modules*" 2>/dev/null || true)
    if [ -n "$env_files" ]; then
        while IFS= read -r env_file; do
            if [ -n "$env_file" ]; then
                # Check if .env is in .gitignore
                if [ -f "$PROJECT_ROOT/.gitignore" ]; then
                    if ! grep -q "^\.env$" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
                        potential_secrets=$((potential_secrets + 1))
                        FINDINGS+=("HIGH|Secrets|.gitignore|.env files may not be properly gitignored")
                    fi
                fi
            fi
        done <<< "$env_files"
    fi

    # Calculate score
    SECRET_DETECTION_SCORE=$((100 - secrets_found * 50 - potential_secrets * 10))
    [ "$SECRET_DETECTION_SCORE" -lt 0 ] && SECRET_DETECTION_SCORE=0

    echo "$SECRET_DETECTION_SCORE|$secrets_found|$potential_secrets"
}

# =============================================================================
# 3. CODE SECURITY PATTERNS
# =============================================================================
analyze_code_security() {
    local sql_injection_risk=0
    local xss_risk=0
    local eval_usage=0
    local unsafe_patterns=0

    # Check for SQL injection vulnerabilities (raw queries)
    for dir in "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # Raw SQL queries (not using Prisma properly)
            sql_injection_risk=$(grep -rEc '\$executeRaw|\$queryRaw|\.raw\(' "$PROJECT_ROOT/$dir" \
                --include="*.ts" 2>/dev/null | awk '{s+=$1} END {print s+0}')

            # String concatenation in queries (potential SQL injection)
            local concat_queries=$(grep -rE '\$\{.*\}.*WHERE|WHERE.*\$\{' "$PROJECT_ROOT/$dir" \
                --include="*.ts" 2>/dev/null | wc -l || echo "0")
            sql_injection_risk=$((sql_injection_risk + concat_queries))
        fi
    done

    # Check for XSS vulnerabilities
    for dir in "frontend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            # dangerouslySetInnerHTML usage
            xss_risk=$(grep -rc 'dangerouslySetInnerHTML' "$PROJECT_ROOT/$dir" \
                --include="*.tsx" --include="*.jsx" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

            # innerHTML usage
            local innerhtml=$(grep -rc '\.innerHTML\s*=' "$PROJECT_ROOT/$dir" \
                --include="*.ts" --include="*.tsx" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
            xss_risk=$((xss_risk + innerhtml))
        fi
    done

    # Check for eval/Function usage (code injection risk)
    for dir in "frontend/src" "backend/src"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            local evals=$(grep -rcE '\beval\s*\(|new\s+Function\s*\(' "$PROJECT_ROOT/$dir" \
                --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
            eval_usage=$((eval_usage + evals))
        fi
    done

    # Record findings
    if [ "$sql_injection_risk" -gt 0 ]; then
        FINDINGS+=("HIGH|CodeSecurity|backend|$sql_injection_risk potential SQL injection risks (raw queries)")
        ACTIONS+=("Review raw SQL queries and ensure proper parameterization")
    fi

    if [ "$xss_risk" -gt 0 ]; then
        FINDINGS+=("MEDIUM|CodeSecurity|frontend|$xss_risk potential XSS risks (dangerouslySetInnerHTML/innerHTML)")
        ACTIONS+=("Review innerHTML usage and sanitize user input")
    fi

    if [ "$eval_usage" -gt 0 ]; then
        FINDINGS+=("HIGH|CodeSecurity|project|$eval_usage eval/Function usage detected (code injection risk)")
        ACTIONS+=("Remove eval() usage and use safer alternatives")
    fi

    # Calculate score
    local penalty=$((sql_injection_risk * 15 + xss_risk * 10 + eval_usage * 20))
    CODE_SECURITY_SCORE=$((100 - penalty))
    [ "$CODE_SECURITY_SCORE" -lt 0 ] && CODE_SECURITY_SCORE=0

    echo "$CODE_SECURITY_SCORE|$sql_injection_risk|$xss_risk|$eval_usage"
}

# =============================================================================
# 4. CONFIGURATION SECURITY
# =============================================================================
analyze_config_security() {
    local issues=0
    local helmet_configured=false
    local cors_configured=false
    local rate_limiting=false
    local https_enforced=false

    # Check for Helmet.js configuration
    if grep -rq "helmet" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        helmet_configured=true
    else
        issues=$((issues + 1))
        FINDINGS+=("HIGH|ConfigSecurity|backend|Helmet.js security headers not detected")
        ACTIONS+=("Install and configure helmet for security headers")
    fi

    # Check for CORS configuration
    if grep -rq "cors" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        cors_configured=true
        # Check if CORS is properly restricted
        if grep -rqE "origin:\s*['\"]?\*['\"]?" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
            issues=$((issues + 1))
            FINDINGS+=("HIGH|ConfigSecurity|backend|CORS allows all origins (*)")
            ACTIONS+=("Restrict CORS to specific allowed origins")
        fi
    else
        issues=$((issues + 1))
        FINDINGS+=("MEDIUM|ConfigSecurity|backend|CORS configuration not detected")
    fi

    # Check for rate limiting
    if grep -rqE "rate-limit|rateLimit|express-rate-limit" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        rate_limiting=true
    else
        issues=$((issues + 1))
        FINDINGS+=("HIGH|ConfigSecurity|backend|Rate limiting not implemented")
        ACTIONS+=("Implement rate limiting to prevent DoS attacks")
    fi

    # Check for body parser size limits
    if ! grep -rqE "limit:\s*['\"][0-9]+" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        issues=$((issues + 1))
        FINDINGS+=("MEDIUM|ConfigSecurity|backend|Body size limit not explicitly set")
    fi

    # Check JWT configuration
    if [ -f "$PROJECT_ROOT/backend/.env.example" ]; then
        if grep -q "JWT_SECRET" "$PROJECT_ROOT/backend/.env.example" 2>/dev/null; then
            # Check for minimum secret length recommendation
            if ! grep -qE "32|64|characters" "$PROJECT_ROOT/backend/.env.example" 2>/dev/null; then
                FINDINGS+=("LOW|ConfigSecurity|backend|JWT_SECRET length requirement not documented")
            fi
        fi
    fi

    # Calculate score
    CONFIG_SECURITY_SCORE=$((100 - issues * 15))
    [ "$CONFIG_SECURITY_SCORE" -lt 0 ] && CONFIG_SECURITY_SCORE=0

    echo "$CONFIG_SECURITY_SCORE|$helmet_configured|$cors_configured|$rate_limiting|$issues"
}

# =============================================================================
# 5. AUTHENTICATION SECURITY
# =============================================================================
analyze_auth_security() {
    local issues=0
    local bcrypt_used=false
    local jwt_implemented=false
    local session_security=false

    # Check for password hashing (bcrypt)
    if grep -rq "bcrypt" "$PROJECT_ROOT/backend" --include="*.ts" 2>/dev/null; then
        bcrypt_used=true
    else
        issues=$((issues + 1))
        FINDINGS+=("CRITICAL|AuthSecurity|backend|bcrypt password hashing not detected")
        ACTIONS+=("Implement bcrypt for secure password hashing")
    fi

    # Check for JWT implementation
    if grep -rq "jsonwebtoken\|jwt" "$PROJECT_ROOT/backend" --include="*.ts" 2>/dev/null; then
        jwt_implemented=true

        # Check for JWT expiration
        if ! grep -rqE "expiresIn|exp" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
            issues=$((issues + 1))
            FINDINGS+=("HIGH|AuthSecurity|backend|JWT expiration may not be configured")
        fi
    fi

    # Check for authentication middleware
    if [ -f "$PROJECT_ROOT/backend/src/middleware/auth.ts" ]; then
        # Check for proper token verification
        if grep -q "verify" "$PROJECT_ROOT/backend/src/middleware/auth.ts" 2>/dev/null; then
            session_security=true
        fi
    else
        issues=$((issues + 1))
        FINDINGS+=("HIGH|AuthSecurity|backend|Authentication middleware not found at expected location")
    fi

    # Check for password validation (minimum length, complexity)
    if ! grep -rqE "password.*length|minLength.*password|password.*[0-9]+" "$PROJECT_ROOT/backend/src" --include="*.ts" 2>/dev/null; then
        issues=$((issues + 1))
        FINDINGS+=("MEDIUM|AuthSecurity|backend|Password validation rules may not be implemented")
        ACTIONS+=("Implement password strength requirements")
    fi

    # Calculate score
    AUTH_SECURITY_SCORE=$((100 - issues * 15))
    [ "$AUTH_SECURITY_SCORE" -lt 0 ] && AUTH_SECURITY_SCORE=0

    echo "$AUTH_SECURITY_SCORE|$bcrypt_used|$jwt_implemented|$session_security|$issues"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    # Run all analyses
    local dep_result=$(analyze_dependencies)
    local secret_result=$(analyze_secrets)
    local code_result=$(analyze_code_security)
    local config_result=$(analyze_config_security)
    local auth_result=$(analyze_auth_security)

    # Calculate overall security score (weighted)
    local overall_score=$(( (DEPENDENCY_SCORE * 30 + SECRET_DETECTION_SCORE * 25 + CODE_SECURITY_SCORE * 20 + CONFIG_SECURITY_SCORE * 15 + AUTH_SECURITY_SCORE * 10) / 100 ))

    if [ "$OUTPUT_FORMAT" = "json" ]; then
        # JSON output
        cat << EOF
{
    "category": "security",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "overall_score": $overall_score,
    "subscores": {
        "dependency_vulnerabilities": $DEPENDENCY_SCORE,
        "secret_detection": $SECRET_DETECTION_SCORE,
        "code_security": $CODE_SECURITY_SCORE,
        "configuration_security": $CONFIG_SECURITY_SCORE,
        "authentication_security": $AUTH_SECURITY_SCORE
    },
    "vulnerabilities": {
        "critical": $CRITICAL_VULNS,
        "high": $HIGH_VULNS,
        "medium": $MEDIUM_VULNS,
        "low": $LOW_VULNS
    },
    "details": {
        "dependencies": {
            "score": $DEPENDENCY_SCORE,
            "critical": $(echo "$dep_result" | cut -d'|' -f2),
            "high": $(echo "$dep_result" | cut -d'|' -f3),
            "medium": $(echo "$dep_result" | cut -d'|' -f4),
            "low": $(echo "$dep_result" | cut -d'|' -f5),
            "outdated_packages": $(echo "$dep_result" | cut -d'|' -f6)
        },
        "secrets": {
            "score": $SECRET_DETECTION_SCORE,
            "secrets_found": $(echo "$secret_result" | cut -d'|' -f2),
            "potential_secrets": $(echo "$secret_result" | cut -d'|' -f3)
        },
        "code_security": {
            "score": $CODE_SECURITY_SCORE,
            "sql_injection_risks": $(echo "$code_result" | cut -d'|' -f2),
            "xss_risks": $(echo "$code_result" | cut -d'|' -f3),
            "eval_usage": $(echo "$code_result" | cut -d'|' -f4)
        },
        "config_security": {
            "score": $CONFIG_SECURITY_SCORE,
            "helmet_configured": $(echo "$config_result" | cut -d'|' -f2),
            "cors_configured": $(echo "$config_result" | cut -d'|' -f3),
            "rate_limiting": $(echo "$config_result" | cut -d'|' -f4)
        },
        "auth_security": {
            "score": $AUTH_SECURITY_SCORE,
            "bcrypt_used": $(echo "$auth_result" | cut -d'|' -f2),
            "jwt_implemented": $(echo "$auth_result" | cut -d'|' -f3)
        }
    }
}
EOF
    else
        # CLI output
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Security Analysis${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Overall score with color
        if [ "$overall_score" -ge 90 ]; then
            echo -e "  ${GREEN}Security Score: $overall_score/100${NC}"
        elif [ "$overall_score" -ge 75 ]; then
            echo -e "  ${YELLOW}Security Score: $overall_score/100${NC}"
        else
            echo -e "  ${RED}Security Score: $overall_score/100${NC}"
        fi

        echo ""
        echo "  Subscores:"
        printf "  ├─ Dependency Vulns:  %3d/100\n" "$DEPENDENCY_SCORE"
        printf "  ├─ Secret Detection:  %3d/100\n" "$SECRET_DETECTION_SCORE"
        printf "  ├─ Code Security:     %3d/100\n" "$CODE_SECURITY_SCORE"
        printf "  ├─ Config Security:   %3d/100\n" "$CONFIG_SECURITY_SCORE"
        printf "  └─ Auth Security:     %3d/100\n" "$AUTH_SECURITY_SCORE"
        echo ""

        echo "  Vulnerabilities:"
        printf "  - [Critical] %d found\n" "$CRITICAL_VULNS"
        printf "  - [High]     %d found\n" "$HIGH_VULNS"
        printf "  - [Medium]   %d found\n" "$MEDIUM_VULNS"
        printf "  - [Low]      %d found\n" "$LOW_VULNS"

        # Show findings
        if [ ${#FINDINGS[@]} -gt 0 ]; then
            echo ""
            echo "  Security Findings:"
            local count=0
            for finding in "${FINDINGS[@]}"; do
                if [ $count -lt 8 ]; then
                    local severity=$(echo "$finding" | cut -d'|' -f1)
                    local category=$(echo "$finding" | cut -d'|' -f2)
                    local location=$(echo "$finding" | cut -d'|' -f3)
                    local message=$(echo "$finding" | cut -d'|' -f4)

                    case $severity in
                        CRITICAL) echo -e "  ${RED}[$severity]${NC} $message" ;;
                        HIGH) echo -e "  ${YELLOW}[$severity]${NC} $message" ;;
                        *) echo "  [$severity] $message" ;;
                    esac
                    count=$((count + 1))
                fi
            done
        fi

        # Show required actions
        if [ ${#ACTIONS[@]} -gt 0 ]; then
            echo ""
            echo "  Action Required:"
            local action_count=0
            for action in "${ACTIONS[@]}"; do
                if [ $action_count -lt 5 ]; then
                    echo "  - $action"
                    action_count=$((action_count + 1))
                fi
            done
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    fi
}

main
