# Implementation Validation Checklist
## Universal Pre-Commit Validation Prompt

**Purpose**: Use this prompt before committing any code changes to catch issues early and ensure quality.

**Time Required**: 3-5 minutes (standard) | 2 minutes (quick mode)

**Frequency**: Before EVERY commit

---

## 🎯 When to Use This Prompt

### Always Use Before:
- ✅ Committing any code changes
- ✅ Creating a pull request
- ✅ Deploying to any environment
- ✅ Merging branches
- ✅ Adding new dependencies
- ✅ Modifying configuration files

### Especially Important For:
- 🔥 TypeScript projects (type system complexity)
- 🔥 Adding new dependencies (version conflicts)
- 🔥 Security-related changes (CORS, auth, rate limiting)
- 🔥 Database migrations or schema changes
- 🔥 API endpoint modifications
- 🔥 Build configuration changes

---

## 📋 The Validation Prompt

**Copy everything below this line and paste into Claude.ai:**

```
Before we commit these changes, let's validate the implementation thoroughly:

## 1. COMPILE & BUILD CHECK
- [ ] Run the build/compile command and verify zero errors
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Verify no new linting warnings/errors
- [ ] Confirm all imports resolve correctly

## 2. DEPENDENCY VERIFICATION
- [ ] List all packages that were installed: `npm list [package-name]`
- [ ] Verify package versions match what we intended
- [ ] Check for peer dependency warnings
- [ ] Confirm no conflicting package versions
- [ ] Verify package.json and package-lock.json are in sync

## 3. TYPE SYSTEM VALIDATION
- [ ] Verify custom type declarations don't shadow module imports
- [ ] Check that module augmentations use correct namespace structure
- [ ] Confirm type definitions are in correct directories
- [ ] Test that IDE autocomplete works for new types
- [ ] Verify no 'any' types were introduced unintentionally

## 4. RUNTIME VERIFICATION
- [ ] Start the application and verify it runs without crashes
- [ ] Check console output for errors or warnings
- [ ] Verify all new middleware/features are actually loaded
- [ ] Test the specific feature that was implemented
- [ ] Confirm no regression in existing features

## 5. FILE STRUCTURE CHECK
- [ ] Verify all new files are in correct directories
- [ ] Check that file naming follows project conventions
- [ ] Confirm no duplicate or conflicting files exist
- [ ] Verify imports use correct relative/absolute paths
- [ ] Check that configuration files are updated correctly

## 6. DOCUMENTATION VERIFICATION
- [ ] Verify README is updated if needed
- [ ] Check that comments explain "why" not just "what"
- [ ] Confirm any new API endpoints are documented
- [ ] Verify environment variables are documented in .env.example
- [ ] Check that complex logic has explanatory comments

## 7. GIT VERIFICATION
- [ ] Run `git status` and review all changed files
- [ ] Verify no unintended files are being committed
- [ ] Check that sensitive data is not being committed
- [ ] Confirm .gitignore is working correctly
- [ ] Review the git diff for each file

## 8. TESTING VALIDATION
- [ ] Verify test files exist for new functionality
- [ ] Run existing tests and confirm they still pass
- [ ] Check that new tests actually test the right behavior
- [ ] Verify test coverage didn't decrease significantly
- [ ] Confirm edge cases are tested

## Output Format:
For each section, provide:
✅ PASS - [brief explanation]
❌ FAIL - [what's wrong and how to fix it]
⚠️ WARNING - [potential issue to investigate]
ℹ️ INFO - [relevant detail to be aware of]

Show me the specific commands I should run and their expected output.
```

---

## ⚡ Quick Mode (2 minutes)

**For small changes (<50 lines), use this abbreviated version:**

```
Quick validation for this small change:

## ESSENTIAL CHECKS ONLY
1. Compile: `npx tsc --noEmit`
2. Runtime: `npm run dev` (verify starts)
3. Git: `git status && git diff --name-only`

Output:
✅ If all pass: "Ready to commit"
❌ If any fail: [specific fix needed]
```

---

## 📊 Example Usage

### Scenario 1: Added New Feature
```
You: I just added a new user authentication feature. Let me validate before committing.

[Paste full validation checklist]

Claude: Running validation...

## 1. COMPILE & BUILD CHECK
✅ PASS - TypeScript compilation successful (0 errors)
✅ PASS - No linting warnings
✅ PASS - All imports resolve correctly

## 2. DEPENDENCY VERIFICATION  
✅ PASS - bcrypt@5.1.0 installed correctly
✅ PASS - No peer dependency conflicts
✅ PASS - package.json and package-lock.json in sync

## 3. TYPE SYSTEM VALIDATION
⚠️ WARNING - New AuthUser type in /types/auth.ts could use more specific types (string → Email type)
✅ PASS - No 'any' types introduced
✅ PASS - IDE autocomplete working

## 4. RUNTIME VERIFICATION
✅ PASS - Application starts without errors
✅ PASS - Authentication middleware loaded
✅ PASS - Login/logout features working
✅ PASS - No regression in existing features

... [continues through all sections]

SUMMARY: 2 warnings, 0 critical issues. Safe to commit after reviewing warnings.
```

### Scenario 2: Dependency Added
```
You: Added express-rate-limit package. Validating before commit.

[Paste validation checklist]

Claude: 

## 2. DEPENDENCY VERIFICATION
❌ FAIL - Version mismatch detected
   Current: express-rate-limit@6.7.0
   Expected: express-rate-limit@7.1.0 (latest)
   
   Fix: npm install express-rate-limit@latest

❌ FAIL - @types/express-rate-limit is outdated
   Current: @types/express-rate-limit@5.2.0
   Should be: @types/express-rate-limit@6.0.0
   
   Fix: npm install --save-dev @types/express-rate-limit@latest

DO NOT COMMIT until these version issues are resolved.
```

---

## 🎨 Customization Guide

### For Python Projects
Replace TypeScript checks with:
```markdown
## 1. COMPILE & BUILD CHECK
- [ ] Run type check: `mypy src/`
- [ ] Check code format: `black --check src/`
- [ ] Run linter: `pylint src/`
- [ ] Verify imports: `python -m py_compile src/**/*.py`
```

### For Go Projects
Replace with:
```markdown
## 1. COMPILE & BUILD CHECK
- [ ] Run compiler: `go build ./...`
- [ ] Run vet: `go vet ./...`
- [ ] Run linter: `golangci-lint run`
- [ ] Check format: `gofmt -l .`
```

### Add Custom Checks
```markdown
## 9. PROJECT-SPECIFIC CHECKS
- [ ] Run custom linter: `npm run lint:custom`
- [ ] Validate API contracts: `npm run validate:api`
- [ ] Check database migrations: `npm run migrate:check`
- [ ] Verify environment variables: `npm run env:check`
```

---

## 🚨 Common Issues This Catches

### Issue 1: Type Definition Conflicts
**Symptoms**: `TS2349: This expression is not callable`

**Validation Catches**:
- Section 2: Version mismatches in @types packages
- Section 3: Custom declarations shadowing imports

### Issue 2: Runtime Errors After Clean Compile
**Symptoms**: TypeScript compiles, but app crashes at runtime

**Validation Catches**:
- Section 4: Runtime verification catches startup errors
- Section 5: Missing configuration files

### Issue 3: Accidental Commits
**Symptoms**: Sensitive data or temp files in git

**Validation Catches**:
- Section 7: Git verification reviews all changes
- Section 7: Checks for secrets pattern

### Issue 4: Breaking Changes
**Symptoms**: New code breaks existing features

**Validation Catches**:
- Section 4: Regression testing
- Section 8: Test suite verification

---

## 📈 Success Criteria

### Ready to Commit When:
- ✅ All sections show "PASS"
- ✅ Any ⚠️ WARNING items are understood and accepted
- ✅ Zero ❌ FAIL items remain
- ✅ Git diff reviewed and makes sense

### DO NOT Commit If:
- ❌ Any compilation errors
- ❌ Any runtime crashes
- ❌ Failing tests
- ❌ Security vulnerabilities detected
- ❌ Secrets or credentials in code

---

## 💡 Pro Tips

### Tip 1: Create Aliases
```bash
# Add to .bashrc or .zshrc
alias validate="cat ~/prompts/daily/validation-checklist.md | pbcopy && echo 'Validation prompt copied!'"
```

### Tip 2: Git Hook Integration
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "🔍 Running validation checklist..."
npx tsc --noEmit || exit 1
npm test || exit 1
echo "✅ Validation passed!"
```

### Tip 3: Keep a Log
```bash
# Track what validation catches
echo "$(date): Validation caught [issue]" >> ~/validation-log.txt
```

### Tip 4: Use Quick Mode Wisely
Quick mode is for:
- Documentation changes
- Minor fixes (<50 lines)
- Configuration tweaks

Full validation is for:
- New features
- Dependency changes
- Refactors
- Bug fixes affecting logic

---

## 📊 Measuring Impact

### Track These Metrics

**Week 1:**
- Commits made: ___
- Validation checks run: ___
- Issues caught: ___
- Time spent validating: ___
- Time saved debugging: ___

**Goal**: Use validation before 100% of commits

**ROI Calculation:**
```
Average bug found in code review: 30 min to fix
Average validation time: 4 min
Bugs caught by validation: 3 per week

Time invested: 20 commits × 4 min = 80 min/week
Time saved: 3 bugs × 30 min = 90 min/week
Net benefit: +10 min/week + higher quality code
```

---

## 🔄 Continuous Improvement

### Weekly Review
Every Friday, review:
- What did validation catch this week?
- Were there any false positives?
- What additional checks would help?
- Can any checks be automated?

### Monthly Update
- Add new checks based on recent bugs
- Remove checks that never fail
- Update commands for new tools
- Share improvements with team

---

## 📝 Commit Message Template

After validation passes:

```
<type>(scope): <short summary>

<detailed description>

## Validation Results
✅ TypeScript: 0 errors
✅ Tests: 24/24 passing
✅ Runtime: No errors
✅ Security: No issues found

## Changes Made
- Feature X: [description]
- Fixed Y: [description]

## Testing
- Tested [specific scenarios]
- Verified [specific behavior]

Closes #[issue-number]
```

---

## 🎓 Mastery Checklist

You've mastered this prompt when you:
- [ ] Use it before every commit (100% compliance)
- [ ] Can run through it in <5 minutes
- [ ] Know which checks to prioritize for different changes
- [ ] Have customized it for your tech stack
- [ ] Have caught a critical bug with it
- [ ] Have trained others to use it
- [ ] Track metrics (bugs caught, time saved)

---

## 🆘 Troubleshooting

### "Validation takes too long"
**Solution**: Use quick mode for small changes, full mode for significant changes

### "Getting false positives"
**Solution**: Add "known warnings" section to your custom version

### "Forgetting to run it"
**Solution**: Create git hook or alias to make it automatic

### "Team won't adopt it"
**Solution**: Show concrete examples of bugs it caught

---

## 📚 Related Prompts

- **After validation fails**: Use `error-message-decoder.md`
- **For code review**: Use `pr-review-assistant.md`
- **For comprehensive audit**: Use `claude-code-health-check-full.md`

---

## 💬 Example Conversations

### Good Usage:
```
You: "About to commit rate limiting feature. Running validation."
[Paste checklist]
Claude: [Runs all checks systematically]
You: [Fixes any issues found]
You: "Re-running validation after fixes."
[Paste checklist again]
Claude: [Confirms all pass]
You: [Commits with confidence]
```

### What NOT to Do:
```
You: "Running validation but I'm in a hurry so just check compile."
❌ Don't skip sections - that's when bugs slip through

You: "Validation found 3 warnings but I'll commit anyway."
❌ Don't ignore warnings - investigate first

You: "Validation passed! [commits without reviewing git diff]"
❌ Don't skip the git diff review
```

---

**Remember**: This 4-minute investment prevents hours of debugging. Use it consistently, customize it for your needs, and watch your code quality improve.

**Your Next Action**: Use this prompt RIGHT NOW before your next commit!

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Estimated Time**: 3-5 minutes (full) | 2 minutes (quick)  
**Success Rate**: Catches 80%+ of common issues
