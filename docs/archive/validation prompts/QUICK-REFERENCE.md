# 🚀 Prompt Library - Quick Reference

**One-page cheat sheet for rapid access**

---

## 🎯 "I Need To..." Decision Guide

| I Need To... | Use This Prompt | Time | Location |
|-------------|-----------------|------|----------|
| **Commit code safely** | Implementation Validation Checklist | 3-5 min | `daily/` |
| **Fix Prisma error** | Prisma Diagnostic Batch | 5 min | `as-needed/` |
| **Understand cryptic error** | Error Message Decoder | 2-3 min | `daily/` |
| **Review PR** | PR Review Assistant | 5-10 min | `daily/` |
| **Start my week** | Claude Code Validation (Quick) | 10-15 min | `weekly/` |
| **Check test coverage** | Test Coverage Gap Finder | 15 min | `weekly/` |
| **Measure performance** | Performance Regression Detector | 10 min | `weekly/` |
| **Monthly health check** | Claude Code Health Check (Full) | 30-60 min | `monthly/` |
| **Security audit** | Security Vulnerability Scanner | 20 min | `monthly/` |
| **Update dependencies** | Dependency Audit | 15 min | `monthly/` |
| **Start new project** | Comprehensive Assessment | 45-60 min | `per-project/` |
| **Onboard teammate** | Onboarding Docs Generator | 30 min | `per-project/` |
| **Debug API mismatch** | API Contract Validator | 15 min | `as-needed/` |
| **Fix env var issues** | Environment Config Validator | 10 min | `as-needed/` |
| **Check migration safety** | DB Migration Safety Check | 15 min | `as-needed/` |
| **Resolve dependency conflicts** | Dependency Conflict Resolver | 10 min | `as-needed/` |
| **Improve a prompt** | Use any meta-prompt | 10-30 min | `meta/` |

---

## ⚡ Ultra-Quick Commands

### Before Every Commit (3 min)
```
Copy: daily/implementation-validation-checklist.md
Paste into Claude
Run all checks
Fix ❌ issues
Commit
```

### When You're Stuck (2 min)
```
Copy: as-needed/error-message-decoder.md
Paste error message
Get plain English explanation + fix
Apply solution
```

### Monday Morning (10 min)
```
Copy: weekly/claude-code-validation-quick.md
Run sections 1, 4, 8 only
Review findings
Plan week
```

---

## 📊 Frequency Guide

### ⚡ Multiple Times Daily
- Implementation Validation Checklist (before every commit)
- Error Message Decoder (when stuck)
- PR Review Assistant (before requesting review)

### 📅 Once Weekly
- Claude Code Validation (Monday morning)
- Test Coverage Gap Finder (mid-week)
- Performance Check (before major merges)

### 📆 Once Monthly
- Full Health Check (first Friday)
- Security Scan (monthly audit)
- Dependency Audit (maintenance day)

### 🎯 Once Per Project
- Assessment Questionnaire (project kickoff)
- Onboarding Docs Generator (when needed)

### 🆘 As Problems Arise
- Prisma Diagnostic (Prisma errors)
- API Contract Validator (API issues)
- Environment Config Validator (env issues)
- Migration Safety Check (before migrations)
- Dependency Conflict Resolver (install fails)

---

## 🎨 Quick Customization

### Adapt for Your Stack

**TypeScript → Python:**
```
Replace:
  npx tsc --noEmit
With:
  mypy src/ && black --check src/
```

**TypeScript → Go:**
```
Replace:
  npx tsc --noEmit
With:
  go vet ./... && golint ./...
```

**TypeScript → Rust:**
```
Replace:
  npx tsc --noEmit
With:
  cargo check && cargo clippy
```

---

## 🔥 Emergency Protocols

### Something's Broken Right Now

**1. Identify Problem Type:**
```
Prisma/Database?     → prisma-diagnostic-batch.md
API not working?     → api-contract-validator.md
Dependencies broke?  → dependency-conflict-resolver.md
No idea what's wrong? → error-message-decoder.md
```

**2. Run Diagnostic**
**3. Apply Fix**
**4. Validate Fix:**
```
Use: implementation-validation-checklist.md
Ensure no new issues introduced
```

---

## 💪 Power User Tips

### Combine Prompts
```
1. Run health check → identify issues
2. Use specific diagnostic → deep dive
3. Apply fixes
4. Run validation → confirm
```

### Create Aliases
```bash
# In your shell config:
alias validate="cat ~/prompts/daily/validation-checklist.md | pbcopy"
alias prisma-fix="cat ~/prompts/as-needed/prisma-diagnostic.md | pbcopy"
alias error-help="cat ~/prompts/daily/error-decoder.md | pbcopy"
```

### Keyboard Shortcuts
```
VS Code: Create snippets for each prompt
Alfred/Raycast: Quick access to prompt files
TextExpander: Expand shortcuts to full prompts
```

---

## 📈 Success Metrics to Track

| Metric | Before Prompts | Target After 1 Month |
|--------|----------------|----------------------|
| Bugs in code review | ___ | -50% |
| Time debugging (hrs/week) | ___ | -30% |
| Failed deployments | ___ | -70% |
| Rework percentage | ___ | -40% |
| Confidence in commits | ___ | +80% |

---

## 🎯 30-Day Challenge

### Week 1: Foundation
- [ ] Day 1: Save 3 daily prompts
- [ ] Days 2-7: Use validation before EVERY commit
- [ ] End of week: Count bugs caught

### Week 2: Expansion  
- [ ] Add error decoder to daily workflow
- [ ] Use weekly health check (Monday)
- [ ] Track: Time saved debugging

### Week 3: Deep Dive
- [ ] Run first comprehensive health check
- [ ] Use test coverage finder
- [ ] Create improvement roadmap

### Week 4: Customization
- [ ] Create 1 custom prompt
- [ ] Optimize 1 existing prompt
- [ ] Calculate ROI: time saved vs invested

---

## 🔄 The Perfect Daily Flow

### Morning (2 min)
```
1. Pull latest code
2. Quick sanity check (git status, npm install)
3. Plan: What am I building today?
```

### During Development (as needed)
```
Hit error? → error-message-decoder.md
API issue? → api-contract-validator.md
Prisma problem? → prisma-diagnostic-batch.md
```

### Before Commit (4 min)
```
1. implementation-validation-checklist.md
2. Fix all ❌ issues
3. Review git diff
4. Write clear commit message
5. Commit with confidence ✅
```

### Before PR (8 min)
```
1. pr-review-assistant.md
2. Address all findings
3. Write PR description
4. Request review
```

### End of Day (1 min)
```
1. Quick reflection: What worked? What didn't?
2. Note any prompt improvements needed
3. Tomorrow's priorities
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This
- Skip validation "just this once" (that's when bugs ship)
- Ignore ⚠️ warnings (they become ❌ problems)
- Run prompts but don't read results
- Use comprehensive prompts for trivial changes
- Commit code that fails validation

### ✅ Do This Instead
- Be consistent (every commit gets validated)
- Investigate warnings (understand before proceeding)
- Actually read and act on results
- Use quick modes for small changes
- Only commit code that passes validation

---

## 🎓 Graduation Checklist

**You've mastered the prompt library when you can:**

- [ ] Use validation checklist without looking at guide
- [ ] Choose correct prompt for any situation in <30 seconds
- [ ] Customize prompts for your tech stack
- [ ] Create custom prompts for specific needs
- [ ] Teach someone else to use the library
- [ ] Measure ROI (time saved vs invested)
- [ ] Catch 80%+ of bugs before code review

**Bonus Mastery:**
- [ ] Prompts integrated into git hooks
- [ ] Team has adopted prompts
- [ ] Created 3+ custom prompts
- [ ] Zero failed deployments this month

---

## 📞 Quick Help

### "This prompt isn't working"
→ Use: `meta/make-prompt-reusable.md`

### "Takes too long"
→ Use: `meta/optimize-prompt-speed.md`

### "Getting errors"
→ Use: `meta/add-error-handling.md`

### "Don't understand output"
→ Use: `meta/create-usage-examples.md`

---

## 🎁 Starter Pack

**New to the library? Start with these 3:**

1. **daily/implementation-validation-checklist.md**
   - Use before every commit
   - Catches 90% of common issues
   - 3-5 minute investment

2. **as-needed/error-message-decoder.md**
   - Use when stuck on errors
   - Plain English explanations
   - 2-3 minute turnaround

3. **as-needed/prisma-diagnostic-batch.md**
   - Use for Prisma/DB issues
   - Systematic troubleshooting
   - 5 minute resolution

**Master these 3 first, then expand gradually.**

---

## 💡 Pro Tips

### Tip #1: Create Quick Modes
Every comprehensive prompt should have a "quick" version for common cases.

### Tip #2: Document Custom Checks
Add your project-specific validations to standard prompts.

### Tip #3: Measure Everything
Track bugs caught, time saved, confidence gained.

### Tip #4: Share Wins
When a prompt catches a critical bug, tell your team.

### Tip #5: Iterate Weekly
Spend 10 minutes each Friday improving one prompt.

---

## 🚀 Next-Level Usage

### Integrate with Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "Running validation checklist..."
# Your validation logic here
```

### Create Custom Workflows
```
Feature Development:
1. Design phase → assessment-questionnaire.md
2. Implementation → daily validation
3. Testing → test-coverage-finder.md
4. Review → pr-review-assistant.md
5. Deploy → security-scanner.md

Bug Fix:
1. Understand → error-message-decoder.md
2. Diagnose → specific diagnostic prompt
3. Fix → implement solution
4. Validate → validation-checklist.md
5. Test → ensure no regression
```

---

## 📚 Learn More

- **Full Documentation**: See main README.md
- **Individual Prompts**: Each has detailed usage guide
- **Meta-Prompts**: Learn to create custom prompts
- **Community**: Share your improvements

---

**Remember: The best prompt is the one you actually use. Start simple, build habits, scale gradually.**

**Your Next Action:** Pick ONE prompt and use it THREE times this week. Then expand.

---

**Version:** 1.0  
**Print this page and keep it next to your monitor!**
