# Claude Code Validation (Quick Mode)
## Monday Morning Health Check

**Purpose**: Quick 10-15 minute codebase health check to start your week

**Time Required**: 10-15 minutes

**Frequency**: Weekly (Monday mornings recommended)

---

## 🎯 When to Use This Prompt

### Use For:
- ✅ Monday morning check-in
- ✅ After major weekend merges
- ✅ Before sprint planning
- ✅ Quick technical debt assessment

---

## 📋 The Quick Validation Prompt

```
Quick weekly health check - focusing on high-priority issues only.

## CONTEXT
Project: [name]
Last check: [date]
Recent changes: [brief summary if any]

## RUN THESE 3 SECTIONS ONLY

### 1. FILE STRUCTURE & ORGANIZATION (3 min)
Check for:
- [ ] Orphaned files (unused imports, dead code)
- [ ] Files in wrong directories
- [ ] Missing critical files
- [ ] Naming convention violations
- [ ] Large files (>500 lines) that should be split

Commands:
```bash
find src -name "*.ts" -o -name "*.tsx" | wc -l
find . -type f -name "*.ts" -size +500k
git ls-files --others --exclude-standard
```

### 2. CODE QUALITY QUICK CHECK (5 min)
Check for:
- [ ] TypeScript errors: `npx tsc --noEmit`
- [ ] Lint errors: `npm run lint`
- [ ] Obvious technical debt
- [ ] TODO/FIXME comments count
- [ ] Console.log statements in production code

Commands:
```bash
npx tsc --noEmit | head -20
grep -r "console.log" src/ | wc -l
grep -r "TODO\|FIXME" src/ | wc -l
```

### 3. GIT & VERSION CONTROL (2 min)
Check for:
- [ ] Uncommitted changes
- [ ] Large uncommitted files
- [ ] Branches ahead/behind main
- [ ] Recent commit quality
- [ ] PR waiting for review

Commands:
```bash
git status
git diff --stat
git log --oneline -10
git branch -vv
```

## OUTPUT FORMAT

For each section:
✅ HEALTHY - [brief status]
⚠️ ATTENTION NEEDED - [specific issue] 
❌ URGENT - [critical issue] → [action needed]

## WEEKLY PRIORITIES

Based on findings, suggest:
1. **This Week's Top Priority:** [highest impact fix]
2. **Quick Wins:** [things that take <30 min]
3. **Technical Debt:** [add to backlog]

## FOCUS AREAS FOR THE WEEK

Recommend 2-3 focus areas based on health check.
```

---

## ⚡ Ultra-Quick Mode (5 minutes)

```
Ultra-fast Monday check:

1. Compile: `npx tsc --noEmit`
2. Git: `git status && git log -5`
3. Lint: `npm run lint | head -10`

Report top 3 issues to address this week.
```

---

## 📊 Example Output

```
## WEEKLY HEALTH CHECK
Date: Monday, Nov 13, 2025
Last Check: Nov 6, 2025

### 1. FILE STRUCTURE
✅ HEALTHY - Good organization, no orphaned files
⚠️ ATTENTION - 3 files over 500 lines should be split:
   - src/services/UserService.ts (645 lines)
   - src/components/Dashboard.tsx (589 lines)
   - src/utils/helpers.ts (512 lines)

### 2. CODE QUALITY
❌ URGENT - 12 TypeScript errors must be fixed
   Most critical: Type mismatch in UserService.ts:45
✅ HEALTHY - Lint passing
⚠️ ATTENTION - 47 TODO comments (up from 32 last week)

### 3. GIT STATUS
✅ HEALTHY - No uncommitted changes
⚠️ ATTENTION - 2 PRs waiting for review (>3 days old)
✅ HEALTHY - Branch is up to date with main

## THIS WEEK'S PRIORITIES

1. **Top Priority:** Fix 12 TypeScript errors (est. 2 hours)
2. **Quick Wins:** 
   - Review 2 pending PRs (30 min)
   - Remove 10 oldest TODO comments (1 hour)
3. **Technical Debt:**
   - Split UserService.ts into smaller modules
   - Refactor Dashboard.tsx

## RECOMMENDED FOCUS
- Monday: Fix TypeScript errors
- Tuesday-Wednesday: Feature work
- Thursday: PR reviews + TODO cleanup  
- Friday: Refactoring session
```

---

## 🎯 What This Catches

### Critical Issues:
- ❌ Compilation errors blocking development
- ❌ Uncommitted work at risk of loss
- ❌ Stale PRs blocking team

### Important Issues:
- ⚠️ Growing technical debt
- ⚠️ Code quality degradation
- ⚠️ Organizational problems

### Nice to Know:
- ℹ️ Trends (TODO count increasing)
- ℹ️ Large files needing split
- ℹ️ Recent development activity

---

## 📈 Tracking Over Time

### Keep a Log:
```markdown
# Weekly Health Checks

## Week of Nov 6
- TypeScript errors: 3
- TODO count: 32
- Files >500 lines: 2
- Status: Healthy

## Week of Nov 13  
- TypeScript errors: 12 ⚠️ Increased
- TODO count: 47 ⚠️ Increased
- Files >500 lines: 3 ⚠️ Increased
- Status: Needs attention

## Trends
- Code quality declining - schedule refactor sprint
```

---

## 💡 Pro Tips

### Tip 1: Same Time Every Week
Run this every Monday at 9 AM to make it a habit

### Tip 2: Share with Team
Post summary in team chat for visibility

### Tip 3: Track Trends
Watch for patterns over 4+ weeks

### Tip 4: Act on Findings
Block 1 hour Monday afternoon to fix quick wins

---

## 🔄 Related Prompts

- **For full audit:** Use monthly/claude-code-health-check-full.md
- **Before committing:** Use daily/implementation-validation-checklist.md
- **For specific issues:** Use relevant as-needed prompts

---

**Time**: 10-15 minutes  
**Frequency**: Weekly  
**Value**: Catch issues before they become problems
