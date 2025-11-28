#!/bin/bash

# Weekly Valuation Report - Data Collection Script
# Automates metric collection for weekly shutdown/planning sessions

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Weekly Valuation Report - Data Collection Tool      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get current week info
WEEK_START=$(date -d "last monday" +%Y-%m-%d 2>/dev/null || date -v -Mon +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
WEEK_END=$(date +%Y-%m-%d)
REPORT_DATE=$(date +%Y-%m-%d)
WEEK_NUMBER=$(date +%U)

echo -e "${GREEN}Report Period:${NC} $WEEK_START to $WEEK_END (Week $WEEK_NUMBER)"
echo ""

# Create reports directory if it doesn't exist
REPORTS_DIR="docs/weekly-reports/$(date +%Y)"
mkdir -p "$REPORTS_DIR"

REPORT_FILE="$REPORTS_DIR/week-$WEEK_NUMBER-$REPORT_DATE.md"

echo -e "${YELLOW}Collecting metrics...${NC}"
echo ""

# ============================================================================
# CODE METRICS
# ============================================================================

echo -e "${BLUE}📊 Code Metrics${NC}"

# Count total lines of code
TOTAL_LOC=$(find frontend/src backend/src -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "  Total Lines of Code: $TOTAL_LOC"

# Count total files
TOTAL_FILES=$(find frontend/src backend/src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
echo "  Total Files: $TOTAL_FILES"

# Frontend metrics
FRONTEND_LOC=$(find frontend/src -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
FRONTEND_FILES=$(find frontend/src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
echo "  Frontend: $FRONTEND_LOC lines in $FRONTEND_FILES files"

# Backend metrics
BACKEND_LOC=$(find backend/src -name "*.ts" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
BACKEND_FILES=$(find backend/src -name "*.ts" 2>/dev/null | wc -l)
echo "  Backend: $BACKEND_LOC lines in $BACKEND_FILES files"

echo ""

# ============================================================================
# GIT ACTIVITY
# ============================================================================

echo -e "${BLUE}📝 Git Activity (Last 7 Days)${NC}"

# Commits this week
COMMITS_THIS_WEEK=$(git log --since="7 days ago" --oneline --no-merges 2>/dev/null | wc -l)
echo "  Commits: $COMMITS_THIS_WEEK"

# Files changed this week
FILES_CHANGED=$(git log --since="7 days ago" --name-only --pretty=format: 2>/dev/null | sort -u | grep -v "^$" | wc -l)
echo "  Files Modified: $FILES_CHANGED"

# Lines added/removed this week
GIT_STATS=$(git log --since="7 days ago" --pretty=tformat: --numstat 2>/dev/null | awk '{added+=$1; removed+=$2} END {print "+"added, "-"removed}')
echo "  Lines Changed: $GIT_STATS"

# Contributors this week
CONTRIBUTORS=$(git log --since="7 days ago" --format='%aN' 2>/dev/null | sort -u | wc -l)
echo "  Contributors: $CONTRIBUTORS"

echo ""

# ============================================================================
# DATABASE METRICS
# ============================================================================

echo -e "${BLUE}🗄️  Database Metrics${NC}"

# Count models in Prisma schema
if [ -f "backend/prisma/schema.prisma" ]; then
    MODELS=$(grep -c "^model " backend/prisma/schema.prisma 2>/dev/null || echo "0")
    echo "  Prisma Models: $MODELS"

    ENUMS=$(grep -c "^enum " backend/prisma/schema.prisma 2>/dev/null || echo "0")
    echo "  Enums: $ENUMS"
fi

echo ""

# ============================================================================
# DEPENDENCY METRICS
# ============================================================================

echo -e "${BLUE}📦 Dependencies${NC}"

# Frontend dependencies
if [ -f "frontend/package.json" ]; then
    FRONTEND_DEPS=$(grep -A 999 "\"dependencies\"" frontend/package.json | grep -c ":" || echo "0")
    FRONTEND_DEV_DEPS=$(grep -A 999 "\"devDependencies\"" frontend/package.json | grep -c ":" || echo "0")
    echo "  Frontend: $FRONTEND_DEPS dependencies, $FRONTEND_DEV_DEPS dev dependencies"
fi

# Backend dependencies
if [ -f "backend/package.json" ]; then
    BACKEND_DEPS=$(grep -A 999 "\"dependencies\"" backend/package.json | grep -c ":" || echo "0")
    BACKEND_DEV_DEPS=$(grep -A 999 "\"devDependencies\"" backend/package.json | grep -c ":" || echo "0")
    echo "  Backend: $BACKEND_DEPS dependencies, $BACKEND_DEV_DEPS dev dependencies"
fi

echo ""

# ============================================================================
# RECENT COMMITS
# ============================================================================

echo -e "${BLUE}📋 Recent Commits (Last 7 Days)${NC}"
git log --since="7 days ago" --oneline --no-merges --pretty=format:"  %h - %s (%ar)" 2>/dev/null | head -10
echo ""
echo ""

# ============================================================================
# DOCUMENTATION METRICS
# ============================================================================

echo -e "${BLUE}📚 Documentation${NC}"

DOC_FILES=$(find docs -name "*.md" 2>/dev/null | wc -l)
echo "  Documentation Files: $DOC_FILES"

DOC_LINES=$(find docs -name "*.md" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "  Documentation Lines: $DOC_LINES"

echo ""

# ============================================================================
# HEALTH CHECK METRICS
# ============================================================================

echo -e "${BLUE}🏥 Platform Health Check${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH_CHECK_SCRIPT="$SCRIPT_DIR/health-check.sh"

if [ -f "$HEALTH_CHECK_SCRIPT" ]; then
    echo "  Running comprehensive health analysis..."

    # Run health check and capture JSON output
    HEALTH_JSON=$("$HEALTH_CHECK_SCRIPT" --json 2>/dev/null || echo '{"overall_score":0}')

    # Extract scores
    HEALTH_OVERALL=$(echo "$HEALTH_JSON" | grep -o '"overall_score":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_CODE=$(echo "$HEALTH_JSON" | grep -o '"code_quality":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_SECURITY=$(echo "$HEALTH_JSON" | grep -o '"security":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_PERFORMANCE=$(echo "$HEALTH_JSON" | grep -o '"performance":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_TEST=$(echo "$HEALTH_JSON" | grep -o '"test_coverage":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_DOC=$(echo "$HEALTH_JSON" | grep -o '"documentation":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HEALTH_SCALE=$(echo "$HEALTH_JSON" | grep -o '"scalability":\s*[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

    echo "  Overall Health Score: $HEALTH_OVERALL/100"
    echo "  ├─ Code Quality:  $HEALTH_CODE/100"
    echo "  ├─ Security:      $HEALTH_SECURITY/100"
    echo "  ├─ Performance:   $HEALTH_PERFORMANCE/100"
    echo "  ├─ Test Coverage: $HEALTH_TEST/100"
    echo "  ├─ Documentation: $HEALTH_DOC/100"
    echo "  └─ Scalability:   $HEALTH_SCALE/100"

    # Generate full health report
    if [ -f "$SCRIPT_DIR/generate-health-report.sh" ]; then
        "$SCRIPT_DIR/generate-health-report.sh" >/dev/null 2>&1 || true
        HEALTH_REPORT="docs/health-reports/health-report-$(date +%Y-%m-%d).md"
        echo "  Health report: $HEALTH_REPORT"
    fi
else
    HEALTH_OVERALL="N/A"
    HEALTH_CODE="N/A"
    HEALTH_SECURITY="N/A"
    HEALTH_PERFORMANCE="N/A"
    HEALTH_TEST="N/A"
    HEALTH_DOC="N/A"
    HEALTH_SCALE="N/A"
    echo "  Health check system not found. Run from project root."
fi

echo ""

# ============================================================================
# GENERATE REPORT
# ============================================================================

echo -e "${YELLOW}Generating report...${NC}"

# Copy template and fill in collected data
cp docs/templates/WEEKLY_VALUATION_TEMPLATE.md "$REPORT_FILE"

# Replace placeholders (basic - manual editing still needed)
sed -i.bak "s/\[DATE\]/$REPORT_DATE/g" "$REPORT_FILE"
sed -i.bak "s/\[Start Date\]/$WEEK_START/g" "$REPORT_FILE"
sed -i.bak "s/\[End Date\]/$WEEK_END/g" "$REPORT_FILE"
rm "$REPORT_FILE.bak" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Report generated successfully!${NC}"
echo ""
echo -e "${BLUE}Report location:${NC} $REPORT_FILE"
echo ""

# ============================================================================
# SUMMARY CARD
# ============================================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  METRICS SUMMARY                       ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Total Lines of Code:" "$TOTAL_LOC"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Total Files:" "$TOTAL_FILES"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Commits This Week:" "$COMMITS_THIS_WEEK"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Files Changed:" "$FILES_CHANGED"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Database Models:" "$MODELS"
echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}             ${GREEN}PLATFORM HEALTH${NC}                           ${BLUE}║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Overall Health Score:" "$HEALTH_OVERALL/100"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Code Quality:" "$HEALTH_CODE/100"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Security:" "$HEALTH_SECURITY/100"
printf "${BLUE}║${NC} %-30s %25s ${BLUE}║${NC}\n" "Test Coverage:" "$HEALTH_TEST/100"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# NEXT STEPS
# ============================================================================

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Open the report: code $REPORT_FILE"
echo "  2. Fill in business metrics (customers, revenue, etc.)"
echo "  3. Calculate updated valuation"
echo "  4. Document key wins and learnings"
echo "  5. Set next week's priorities"
echo "  6. Commit the report to git"
echo ""

# ============================================================================
# OPTIONAL: OPEN IN EDITOR
# ============================================================================

read -p "Open report in default editor now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code "$REPORT_FILE"
    elif command -v nano &> /dev/null; then
        nano "$REPORT_FILE"
    elif command -v vim &> /dev/null; then
        vim "$REPORT_FILE"
    else
        echo "No editor found. Please open manually: $REPORT_FILE"
    fi
fi

echo -e "${GREEN}Done! 🚀${NC}"
