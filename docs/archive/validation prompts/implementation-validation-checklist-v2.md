# Implementation Validation Checklist v2.0
## Pre-Commit Guardrail with Quick/Standard/Full Modes

**Purpose**: Catch bugs before they ship - now with flexible execution modes

**Time Required**: 2-10 minutes (depends on mode)

**Frequency**: Before EVERY commit (choose appropriate mode)

---

## 🎯 Choose Your Mode

### Quick Mode (2-3 minutes)
**Use for:** Small changes, bug fixes, documentation updates
**Runs:** Compile + Git + Critical checks only

### Standard Mode (4-6 minutes) ⭐ RECOMMENDED
**Use for:** Normal feature work, typical commits
**Runs:** Quick + Runtime + Tests + Dependencies

### Full Mode (8-10 minutes)
**Use for:** Before merge to main, before deploy, major refactors
**Runs:** Everything - complete validation

---

## 📋 THE PROMPT

**Copy everything below and paste into Claude.ai:**

```
Before committing, validate this implementation.

## EXECUTION MODE

Choose one:
- [ ] QUICK (2-3 min) - Small changes only
- [ ] STANDARD (4-6 min) - Normal commits ⭐ Default
- [ ] FULL (8-10 min) - Before merge/deploy

## PROJECT CONTEXT (Optional - helps with custom checks)
Project type: [TypeScript/Python/Go/etc]
Changed files: [list if known]
Custom checks: [any project-specific validations]

---

## QUICK MODE CHECKS (Sections 1, 3, 7)

### 1. COMPILE & BUILD ✓
```bash
# TypeScript
npx tsc --noEmit

# Python
mypy src/

# Go
go build ./...
```

**Pass criteria:** Zero errors

### 3. GIT STATUS ✓
```bash
git status
git diff --stat
```

**Check for:**
- [ ] Only intended files changed
- [ ] No secrets/credentials
- [ ] .gitignore working correctly

### 7. CRITICAL SAFETY ✓
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets/API keys
- [ ] No `TODO` items that block merge

---

## STANDARD MODE ADDS (+ Sections 2, 4, 8)

### 2. DEPENDENCY VERIFICATION ✓
```bash
npm list [package-name-if-added]
npm audit --production
```

**Check for:**
- [ ] New packages installed correctly
- [ ] No critical vulnerabilities
- [ ] Versions match intentions

### 4. RUNTIME VERIFICATION ✓
```bash
npm run dev
# Let it start, check console for errors
```

**Check for:**
- [ ] Application starts without crashes
- [ ] No console errors on startup
- [ ] New features load correctly

### 8. TEST VALIDATION ✓
```bash
npm test
# or
npm run test:changed
```

**Check for:**
- [ ] All tests pass
- [ ] New features have tests
- [ ] No flaky tests introduced

---

## FULL MODE ADDS (+ Sections 5, 6, 9)

### 5. FILE STRUCTURE CHECK ✓
```bash
find src -type f -name "*.ts" -size +500k
git ls-files --others --exclude-standard
```

**Check for:**
- [ ] Files in correct directories
- [ ] No orphaned/unused files
- [ ] Naming conventions followed
- [ ] No files >500 lines (should be split)

### 6. DOCUMENTATION CHECK ✓
**Check for:**
- [ ] README updated if needed
- [ ] API changes documented
- [ ] Complex logic has comments (why, not what)
- [ ] Breaking changes noted

### 9. INTEGRATION CHECK ✓
**Check for:**
- [ ] API contracts maintained
- [ ] Database migrations safe
- [ ] Environment variables documented
- [ ] Backwards compatibility considered

---

## OUTPUT FORMAT

For each section run:
✅ PASS - [brief confirmation]
❌ FAIL - [specific issue] → [exact fix command]
⚠️ WARNING - [potential issue] → [recommendation]

## FINAL VERDICT

Based on mode selected:
- **QUICK**: ✅ Safe to commit (for small changes)
- **STANDARD**: ✅ Ready to commit (normal work)
- **FULL**: ✅ Ready to merge/deploy (major changes)

Or:
- ❌ DO NOT COMMIT - Fix [count] issues first

## QUICK FIX COMMANDS

If failures found, provide exact commands to run.
```

---

## 🎨 Mode Selection Guide

### When to Use QUICK (2-3 min)
```
✓ Documentation changes
✓ Small bug fixes (<20 lines)
✓ Configuration tweaks
✓ CSS/styling updates
✓ Comment updates

✗ New features
✗ Dependency changes
✗ Refactors
✗ API changes
```

### When to Use STANDARD (4-6 min) ⭐
```
✓ New features
✓ Bug fixes with logic changes
✓ Refactoring
✓ Most commits (this is your default)

Use this 80% of the time
```

### When to Use FULL (8-10 min)
```
✓ Before merge to main
✓ Before production deploy
✓ After dependency updates
✓ Major refactors
✓ Breaking changes
✓ Security-related changes

Use this before any high-risk action
```

---

## 💡 Smart Usage Patterns

### Daily Workflow
```
Morning: Pull main, QUICK mode check (verify nothing broke)
During work: STANDARD mode before each commit
End of day: If pushing to main, FULL mode
```

### Team Workflow
```
Feature branch commits: STANDARD mode
Before requesting PR: FULL mode
After PR feedback: STANDARD mode
Before merge: FULL mode (team lead)
```

### Solo Developer
```
Small iterations: QUICK mode (move fast)
Normal commits: STANDARD mode
Before deploy: FULL mode (be safe)
```

---

## 📊 Example Outputs by Mode

### Quick Mode Output (2 min)
```
## QUICK MODE VALIDATION

### 1. COMPILE CHECK
✅ PASS - TypeScript: 0 errors

### 3. GIT STATUS  
✅ PASS - 2 files changed (both intended)
✅ PASS - No secrets detected

### 7. CRITICAL SAFETY
✅ PASS - No console.log statements
✅ PASS - No hardcoded secrets
⚠️ WARNING - 1 TODO comment added (acceptable for quick fix)

VERDICT: ✅ Safe to commit
```

### Standard Mode Output (5 min)
```
## STANDARD MODE VALIDATION

[All QUICK checks above, plus...]

### 2. DEPENDENCIES
✅ PASS - No new dependencies
✅ PASS - 0 vulnerabilities

### 4. RUNTIME
✅ PASS - Server starts in 3.2s
✅ PASS - No console errors
✅ PASS - New login feature loads correctly

### 8. TESTS
✅ PASS - 47/47 tests passing
✅ PASS - New feature has 3 tests
✅ PASS - Coverage maintained at 82%

VERDICT: ✅ Ready to commit
Time spent: 4min 30sec
```

### Full Mode Output (9 min)
```
## FULL MODE VALIDATION

[All STANDARD checks above, plus...]

### 5. FILE STRUCTURE
✅ PASS - All files in correct directories
⚠️ WARNING - UserService.ts is 587 lines (consider splitting)
✅ PASS - No orphaned files

### 6. DOCUMENTATION
✅ PASS - README updated with new auth flow
✅ PASS - API endpoints documented
❌ FAIL - Breaking change not noted in CHANGELOG

### 9. INTEGRATION
✅ PASS - API contracts maintained
✅ PASS - Database migration is safe (reviewed)
⚠️ WARNING - New env var AUTH_SECRET not in .env.example

VERDICT: ❌ DO NOT MERGE YET
Fix 1 critical issue:
1. Add breaking change to CHANGELOG.md

Fix 2 warnings (recommended):
1. Add AUTH_SECRET to .env.example
2. Consider splitting UserService.ts (backlog item)

After fixes: Re-run STANDARD mode to verify
```

---

## 🔄 Progressive Validation Strategy

### Start of Feature
```
QUICK mode × 10 commits = 30 min total
(Rapid iteration, catch obvious issues)
```

### Mid-Feature
```
STANDARD mode × 5 commits = 25 min total
(More thorough, catch integration issues)
```

### End of Feature
```
FULL mode × 1 time = 10 min
(Complete verification before PR)
```

**Total time investment: 65 minutes**
**Bugs prevented: 8-12 average**
**Time saved debugging: 4-6 hours**

**ROI: 4x time saved vs invested**

---

## 🎓 Mastery Checklist

**Level 1: Beginner (Week 1)**
- [ ] Use QUICK mode before every commit
- [ ] Understand what each section checks
- [ ] Fix issues when prompted

**Level 2: Competent (Week 2-3)**
- [ ] Use STANDARD mode as default
- [ ] Use FULL mode before PRs
- [ ] Can choose correct mode intuitively

**Level 3: Proficient (Month 2)**
- [ ] Modes feel natural
- [ ] Catching 80%+ of bugs before review
- [ ] Customized for your tech stack

**Level 4: Advanced (Quarter 1)**
- [ ] Integrated into git hooks
- [ ] Team adoption
- [ ] Custom project-specific checks added

---

## 🛠️ Customization for Other Stacks

### Python
```markdown
### 1. COMPILE CHECK (Python)
```bash
# Type check
mypy src/

# Lint
pylint src/

# Format check
black --check src/
```

### Go
```markdown
### 1. COMPILE CHECK (Go)
```bash
# Build
go build ./...

# Vet
go vet ./...

# Format
go fmt ./...

# Lint
golangci-lint run
```

### Rust
```markdown
### 1. COMPILE CHECK (Rust)
```bash
# Check
cargo check

# Clippy
cargo clippy -- -D warnings

# Format
cargo fmt --check
```

---

## 📈 Track Your Impact

### Weekly Log Template
```markdown
# Week of [Date]

Mode usage:
- QUICK: ___ times
- STANDARD: ___ times
- FULL: ___ times

Bugs caught: ___
False positives: ___
Time invested: ___ min
Estimated time saved: ___ hours

Top issue caught: [description]
```

### Monthly Review
```markdown
# Month of [Month]

Total validations: ___
Issues prevented: ___
Time invested: ___ hours
Time saved: ___ hours
ROI: ___x

Trends:
- Issue types most common: [list]
- Areas needing improvement: [list]
- Custom checks to add: [list]
```

---

## 🚨 Common Pitfalls

### Don't Do This:
❌ Always use QUICK mode (too shallow)
❌ Always use FULL mode (too slow, you'll skip it)
❌ Skip validation when "in a hurry" (that's when bugs happen)
❌ Ignore warnings (they become errors)

### Do This:
✅ Use STANDARD as your default
✅ Escalate to FULL before risky operations
✅ Drop to QUICK only for truly small changes
✅ Investigate warnings before dismissing

---

## 💪 Pro Tips

### Tip 1: Create Shell Aliases
```bash
# .bashrc or .zshrc
alias vq="echo 'QUICK mode' && [validation commands]"
alias vs="echo 'STANDARD mode' && [validation commands]"
alias vf="echo 'FULL mode' && [validation commands]"
```

### Tip 2: Git Hook Integration
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Auto-detect appropriate mode based on changes
CHANGED_LINES=$(git diff --cached --numstat | awk '{sum+=$1+$2} END {print sum}')

if [ $CHANGED_LINES -lt 20 ]; then
    echo "Running QUICK mode (small change detected)"
    # Run QUICK validation
elif [ $CHANGED_LINES -lt 200 ]; then
    echo "Running STANDARD mode"
    # Run STANDARD validation
else
    echo "Large change detected - recommend FULL mode"
    read -p "Run FULL validation? (y/n) " -n 1 -r
    # Run based on response
fi
```

### Tip 3: VS Code Task
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Validate: Quick",
      "type": "shell",
      "command": "npx tsc --noEmit && git status",
      "group": "test"
    },
    {
      "label": "Validate: Standard",
      "type": "shell",
      "command": "npx tsc --noEmit && npm test && npm run dev",
      "group": "test"
    },
    {
      "label": "Validate: Full",
      "type": "shell",
      "command": "[all validation commands]",
      "group": "test"
    }
  ]
}
```

---

## 🔄 Related Prompts

- **After validation fails:** error-message-decoder.md
- **Before requesting review:** pr-review-assistant.md
- **For comprehensive audit:** claude-code-health-check-full.md

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  IMPLEMENTATION VALIDATION MODES             │
├─────────────────────────────────────────────┤
│                                             │
│  QUICK (2-3 min)                           │
│  • Compile only                            │
│  • Git check                               │
│  • Critical safety                         │
│  ➜ Small changes only                     │
│                                             │
│  STANDARD (4-6 min) ⭐ DEFAULT             │
│  • Everything in Quick +                   │
│  • Dependencies                            │
│  • Runtime test                            │
│  • Tests run                               │
│  ➜ Normal feature work                    │
│                                             │
│  FULL (8-10 min)                           │
│  • Everything in Standard +                │
│  • File structure                          │
│  • Documentation                           │
│  • Integration checks                      │
│  ➜ Before merge/deploy                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

**Remember**: The goal isn't perfection - it's catching bugs before they cost hours. Choose the right mode for the situation and use it consistently.

**Version**: 2.0  
**Last Updated**: November 2025  
**New Features**: Quick/Standard/Full modes, smart defaults, progressive validation
