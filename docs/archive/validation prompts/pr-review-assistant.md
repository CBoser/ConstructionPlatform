# PR Review Assistant
## Comprehensive Pull Request Review Checklist

**Purpose**: Systematically review pull requests before requesting review or when reviewing others' PRs

**Time Required**: 5-10 minutes

**Frequency**: Before every PR submission or when reviewing PRs

---

## 🎯 When to Use This Prompt

### Use Before:
- ✅ Requesting code review from team
- ✅ Merging your own PR
- ✅ Reviewing teammate's PR
- ✅ Approving any code changes

### Especially Important For:
- 🔥 Changes to critical code paths
- 🔥 Security-related changes
- 🔥 Database schema modifications
- 🔥 API contract changes
- 🔥 Dependency updates

---

## 📋 The PR Review Prompt

**Copy everything below and paste into Claude.ai:**

```
Please review this pull request thoroughly. Analyze the git diff and provide comprehensive feedback.

## PR CONTEXT
Repository: [repo name]
Branch: [feature-branch] → [target-branch]
PR Title: [title]
Description: [summary]

## AUTOMATED CHECKS
First, verify these pass:
- [ ] All CI/CD tests passing
- [ ] TypeScript/compilation successful  
- [ ] No merge conflicts
- [ ] Branch up to date with target

## CODE QUALITY REVIEW

### Structure & Organization
- [ ] Functions are focused and <50 lines
- [ ] No commented-out code (remove or explain)
- [ ] Logical code organization
- [ ] Consistent naming conventions
- [ ] No code duplication

### Error Handling
- [ ] Error handling present for external calls
- [ ] Errors provide useful context
- [ ] No silent failures
- [ ] Proper error propagation
- [ ] User-friendly error messages

### Code Clarity
- [ ] Variable names are meaningful
- [ ] Complex logic has explanatory comments
- [ ] Magic numbers replaced with named constants
- [ ] No overly clever code (prefer readable)
- [ ] Functions have clear single responsibility

## TESTING REVIEW

### Test Coverage
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] Error conditions tested
- [ ] Happy path tested
- [ ] Integration points tested

### Test Quality
- [ ] Tests are readable and clear
- [ ] Mock data is realistic
- [ ] Tests don't depend on execution order
- [ ] No flaky tests introduced
- [ ] Test names describe what they test

## SECURITY REVIEW

### Data Security
- [ ] No secrets/credentials in code
- [ ] User input is validated
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS vulnerabilities addressed
- [ ] CSRF protection where needed

### Authentication & Authorization
- [ ] Proper authentication checks
- [ ] Authorization validated for actions
- [ ] Session handling secure
- [ ] API keys properly managed
- [ ] Sensitive data encrypted

## DOCUMENTATION REVIEW

### Code Documentation
- [ ] README updated if needed
- [ ] Comments explain "why" not "what"
- [ ] API changes documented
- [ ] Breaking changes clearly flagged
- [ ] Migration guide provided (if needed)

### User-Facing Changes
- [ ] Changelog updated
- [ ] User documentation updated
- [ ] Help text added for new features
- [ ] Error messages are clear

## PERFORMANCE REVIEW

### Efficiency
- [ ] No N+1 queries introduced
- [ ] Proper indexing for DB queries
- [ ] Efficient algorithms used
- [ ] No unnecessary re-renders (React)
- [ ] Lazy loading where appropriate

### Resource Usage
- [ ] No memory leaks introduced
- [ ] Large files handled efficiently
- [ ] API calls batched when possible
- [ ] Caching used appropriately

## COMPATIBILITY REVIEW

### Breaking Changes
- [ ] Breaking changes documented
- [ ] Migration path provided
- [ ] Backward compatibility considered
- [ ] Deprecation warnings added

### Integration Points
- [ ] API contracts maintained
- [ ] Database migrations safe
- [ ] Third-party integrations tested
- [ ] Environment variables documented

## OUTPUT FORMAT

Provide feedback in these categories:

### 🔴 MUST FIX (Blocking Issues)
- [Critical issues that must be addressed before merge]

### 🟡 SHOULD FIX (Important Improvements)
- [Significant issues that should be fixed]

### 🟢 NICE TO HAVE (Suggestions)
- [Optional improvements for consideration]

### 💚 PRAISE (What's Done Well)
- [Highlight good practices and excellent code]

### 📝 QUESTIONS
- [Anything unclear that needs clarification]

## FINAL RECOMMENDATION
- ✅ APPROVE - Ready to merge
- ⚠️ APPROVE WITH COMMENTS - Can merge but consider suggestions
- 🔄 REQUEST CHANGES - Must address issues before merge
- ❌ REJECT - Fundamental problems require rework

Include specific file:line references for all feedback.
```

---

## 💡 Example Usage

### Reviewing Your Own PR

```
You: I'm about to request review on my authentication feature PR.

[Paste PR review prompt]

Git diff:
[paste git diff output]

Claude: 

## CODE QUALITY REVIEW

🔴 MUST FIX
1. src/auth/login.ts:42 - Password stored in plain text
   Fix: Use bcrypt.hash() before storing
   
2. src/api/routes.ts:15 - No rate limiting on login endpoint
   Fix: Add express-rate-limit middleware

🟡 SHOULD FIX
1. src/auth/validate.ts:23 - Function is 75 lines, should be split
   Suggestion: Extract validation logic into separate functions
   
2. src/types/user.ts:10 - Using 'any' type for user roles
   Fix: Create UserRole enum type

🟢 NICE TO HAVE
1. src/auth/login.ts:30 - Could add login attempt logging
   Consider: Track failed login attempts for security monitoring

💚 PRAISE
- Excellent test coverage (95%)!
- Clear separation of concerns in middleware
- Well-documented API endpoints
- Good error messages for users

## FINAL RECOMMENDATION
🔄 REQUEST CHANGES - Must fix the 2 critical security issues before merge.
After fixes, this will be ready to merge!
```

---

## 🎨 Quick Review Mode

**For small PRs (<100 lines):**

```
Quick PR review for small change:

## ESSENTIAL CHECKS
1. Code Quality: Any obvious issues?
2. Tests: Are changes tested?
3. Security: Any red flags?
4. Documentation: Updated if needed?

Output:
✅ LGTM (Looks Good To Me) - specific strengths
❌ Issues Found - specific problems
```

---

## 🔍 Reviewing Others' PRs

### Respectful Feedback Template

```
When providing feedback on someone else's PR:

🔴 CRITICAL (use sparingly):
"This has a security vulnerability: [specific issue]"
"This will cause data loss: [explain]"

🟡 SUGGESTION (be helpful):
"Consider extracting this into a function for reusability"
"What do you think about [alternative approach]?"

🟢 QUESTION (stay curious):
"Can you help me understand why we chose [approach]?"
"Have you considered [edge case]?"

💚 PRAISE (be specific):
"I really like how you handled [specific thing]"
"This is a clever solution to [problem]"
```

---

## 📊 Self-Review Checklist

**Before requesting review, ask yourself:**

```
Have I:
- [ ] Reviewed my own diff carefully?
- [ ] Run all tests locally?
- [ ] Updated relevant documentation?
- [ ] Considered edge cases?
- [ ] Added tests for new code?
- [ ] Removed debug code/console.logs?
- [ ] Written a clear PR description?
- [ ] Linked related issues?
- [ ] Considered performance impact?
- [ ] Thought about rollback plan?
```

---

## 🎯 PR Description Template

**Use this template for your PR descriptions:**

```markdown
## What does this PR do?
[Brief description of changes]

## Why are we making this change?
[Problem being solved or feature being added]

## How has this been tested?
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manually tested scenarios: [list]

## Screenshots (if UI changes)
[Add screenshots]

## Breaking changes?
- [ ] Yes (explain below)
- [ ] No

## Deployment notes
[Anything special needed for deployment]

## Related issues
Closes #[issue-number]
Related to #[issue-number]
```

---

## 🚨 Red Flags to Watch For

### Critical Issues
- ❌ Credentials or secrets in code
- ❌ SQL injection vulnerabilities
- ❌ Authentication bypasses
- ❌ Data loss risks
- ❌ Infinite loops or recursion without limits
- ❌ Unsafe deserialization

### Major Concerns
- ⚠️ No tests for new functionality
- ⚠️ Breaking API changes without versioning
- ⚠️ Database migrations without rollback
- ⚠️ Hardcoded values that should be configurable
- ⚠️ Performance regressions (N+1 queries, etc.)

---

## 💻 Code Review Best Practices

### DO:
- ✅ Be specific with feedback (file:line references)
- ✅ Explain WHY something is an issue
- ✅ Suggest solutions, not just problems
- ✅ Praise good code
- ✅ Ask questions to understand intent
- ✅ Focus on objective issues (bugs, security, performance)

### DON'T:
- ❌ Nitpick style if it matches team standards
- ❌ Block PRs for subjective preferences
- ❌ Be condescending or dismissive
- ❌ Approve without actually reviewing
- ❌ Let perfect be the enemy of good
- ❌ Review when tired or rushed

---

## 🎓 Mastery Checklist

You've mastered PR reviews when you:
- [ ] Can spot common issues in <5 minutes
- [ ] Provide actionable, specific feedback
- [ ] Balance catching bugs with unblocking teammates
- [ ] Know when to approve with suggestions vs request changes
- [ ] Write feedback that helps people learn
- [ ] Self-review catches 90% of issues before team review

---

## 🔧 Integration Ideas

### GitHub PR Template
```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Pre-Review Checklist
Before requesting review, I have:
- [ ] Reviewed my own changes
- [ ] Run validation checklist
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Considered security implications

## Description
[Your PR description]
```

### Git Hook for PR Description
```bash
# .git/hooks/prepare-pr
#!/bin/bash
echo "📝 Generating PR description template..."
cat PR_TEMPLATE.md
```

---

## 📈 Measuring Review Quality

### Track These Metrics
- **Bugs found in review**: Target >80% before merge
- **Review turnaround time**: Target <24 hours
- **Revisions needed**: Target <2 rounds
- **Bugs found post-merge**: Target <10%

---

## 🆘 Common Scenarios

### Scenario 1: Large PR (>500 lines)
```
Strategy:
1. Ask for PR to be split into smaller chunks
2. Review in logical sections (feature-by-feature)
3. Focus on architecture/approach first
4. Deep dive into critical sections
5. Request changes in batches (not one-by-one)
```

### Scenario 2: Urgent Hotfix
```
Priority review:
1. Security issues? (critical)
2. Data integrity? (critical)
3. Will it fix the bug? (verify)
4. Will it break anything else? (test)
5. Can we rollback if needed? (verify)

Style/refactoring can wait for follow-up PR
```

### Scenario 3: Dependency Update
```
Special checks:
1. Check changelog for breaking changes
2. Verify no security vulnerabilities
3. Test critical user flows
4. Check bundle size impact
5. Verify no deprecated API usage
```

---

## 💬 Example Feedback

### Good Feedback:
```
🟡 SUGGESTION (src/api/users.ts:45)
Consider adding pagination here. With 10,000+ users, this query 
could timeout. Suggest: 
```typescript
const users = await db.users.findMany({
  take: 100,
  skip: page * 100
});
```
```

### Bad Feedback:
```
❌ "This code is bad"
❌ "Why didn't you use [my preferred library]?"
❌ "I would have done this differently"
```

---

## 🔄 Continuous Improvement

### After Each Review:
- What bugs did I miss?
- What feedback was most helpful?
- How can I review faster without sacrificing quality?
- What patterns should I add to this checklist?

### Monthly:
- Review bugs found post-merge
- Update checklist based on common issues
- Share learning with team

---

**Remember**: Good code review is about:
1. **Catching bugs** before they ship
2. **Knowledge sharing** across the team
3. **Maintaining standards** without being pedantic
4. **Learning together** and improving code quality

**Your Next Action**: Use this prompt on your next PR!

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Estimated Time**: 5-10 minutes  
**Focus**: Quality + Speed + Respect
