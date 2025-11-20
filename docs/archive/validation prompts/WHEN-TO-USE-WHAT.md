# 🎯 Prompt Index - When To Use What

**Quick decision guide for your entire prompt library**

---

## 🚦 Quick Decision Tree

```
┌─────────────────────────────────────┐
│  What are you doing RIGHT NOW?     │
└─────────────┬───────────────────────┘
              │
      ┌───────┴────────┐
      │                │
   BUILDING        FIXING/CHECKING
      │                │
      ▼                ▼
┌─────────────┐  ┌──────────────┐
│About to     │  │Something     │
│commit?      │  │broken?       │
└──────┬──────┘  └──────┬───────┘
       │                │
       ▼                ▼
 Validation      Diagnostic
 Checklist       Prompts
```

---

## 📅 BY FREQUENCY

### Multiple Times Daily

#### Implementation Validation Checklist v2
**When:** Before every commit or PR
**Mode Selection:**
- Small change (<20 lines)? → **Quick** (2 min)
- Normal commit? → **Standard** (5 min) ⭐ Default
- Before merge/deploy? → **Full** (10 min)

**Why this over others:** Catches bugs before they ship
**Skip if:** Only changing documentation (but still recommended)

---

#### Error Message Decoder
**When:** Hit an error you don't understand
**Use for:**
- Cryptic TypeScript errors
- Library errors you're unfamiliar with
- Stack traces that don't make sense
- Runtime errors with no clear cause

**Why this over others:** Fastest path from confusion to solution
**Skip if:** Error message is self-explanatory

---

#### PR Review Assistant
**When:** About to request review OR reviewing someone else's PR
**Use for:**
- Your own PRs (self-review before requesting)
- Teammate PRs (systematic review)
- Controversial PRs (need thorough analysis)

**Why this over others:** Catches issues reviewers will find anyway
**Skip if:** Trivial changes (<10 lines, obvious)

---

### Once Per Week

#### Claude Code Validation Quick (v2 with scopes)
**When:** Monday morning OR start of work session
**Scope Selection:**
- Normal week? → **changed** (10 min)
- After big merge? → **full** (15 min)
- Investigating issue? → **focus=src/path** (12 min)

**Why this over others:** Quick health pulse without deep dive
**Skip if:** You did full monthly check <3 days ago

---

#### Test Coverage Gap Finder
**When:** Mid-week, planning testing work
**Use for:**
- Sprint planning (what to test this sprint)
- After adding features (where are gaps now)
- Before release (is critical path covered)

**Why this over others:** Prioritizes testing work strategically
**Skip if:** Coverage >90% and stable

---

#### Performance Regression Detector
**When:** Before major merges, weekly monitoring
**Use for:**
- After dependency updates
- Before deploying to production
- When app "feels slower"
- Weekly performance tracking

**Why this over others:** Catches performance issues early
**Skip if:** No user-facing changes this week

---

### Monthly

#### Claude Code Health Check v2 (Monthly Tier)
**When:** First Friday of month
**Scope:** Usually **full**
**Use for:**
- Comprehensive health assessment
- Trend analysis vs baseline
- Planning next month's improvements

**Why this over others:** Strategic overview with trends
**Skip if:** Major crisis consuming all time (but catch up next month)

---

#### Security Vulnerability Scanner
**When:** Monthly security audit day
**Use for:**
- Compliance requirements
- Before production deploys
- After dependency updates
- When security news breaks

**Why this over others:** Systematic security review
**Skip if:** Recent security audit (<2 weeks)

---

#### Dependency Audit
**When:** Monthly maintenance day
**Use for:**
- Update planning
- Security vulnerability review
- Deprecation warnings
- Bundle size management

**Why this over others:** Safe dependency management
**Skip if:** No dependency changes in 2+ months

---

### Quarterly

#### Claude Code Health Check v2 (Quarterly Tier)
**When:** End of quarter
**Scope:** Always **full**
**Use for:**
- Strategic technical assessment
- Roadmap planning
- Technical debt evaluation
- Baseline establishment

**Why this over others:** Deep strategic insights
**Skip if:** Never (this is critical)

---

### Per Project

#### Comprehensive Assessment Questionnaire
**When:** Starting new project OR major pivot
**Use for:**
- Project kickoff
- Adding major subsystem
- Significant scope change
- Stakeholder alignment

**Why this over others:** Prevents misalignment early
**Skip if:** Small feature addition to existing project

---

#### Onboarding Docs Generator
**When:** New team member joining OR docs are stale
**Use for:**
- Team scaling
- After major refactor
- When README is outdated
- Knowledge transfer

**Why this over others:** Auto-generates from codebase
**Skip if:** Docs are current (<3 months old)

---

## 🆘 BY PROBLEM TYPE

### "Something Is Broken"

#### Prisma Is Broken → Prisma Diagnostic Batch
**Symptoms:**
- `Cannot find module '@prisma/client'`
- Migration failures
- Connection errors
- Type generation errors

**Time:** 5 minutes to fix 80% of issues

---

#### Frontend/Backend Mismatch → API Contract Validator
**Symptoms:**
- `undefined property` errors from API
- Type mismatches in API responses
- Frontend expecting fields backend doesn't send
- API changes broke frontend

**Time:** 15 minutes to identify all mismatches

---

#### "Works On My Machine" → Environment Config Validator
**Symptoms:**
- Deploys fail but local works
- Missing environment variables
- Config differences between environments
- Team members can't run locally

**Time:** 10 minutes to audit all config

---

#### npm Install Failed → Dependency Conflict Resolver
**Symptoms:**
- Peer dependency errors
- Version conflicts
- `ERESOLVE unable to resolve dependency tree`
- Package installation hangs

**Time:** 10 minutes to resolve most conflicts

---

#### About to Run Migration → Database Migration Safety Check
**Symptoms:**
- Worried about data loss
- Destructive operations in migration
- Production deployment coming
- Never ran this migration before

**Time:** 15 minutes to assess risk + create rollback plan

---

### "Need to Understand/Decide"

#### Don't Know What This Error Means → Error Message Decoder
**Time:** 2-3 minutes to plain English + fix

#### Don't Know What to Test → Test Coverage Gap Finder
**Time:** 15 minutes to prioritized list

#### App Feels Slow → Performance Regression Detector
**Time:** 10 minutes to identify bottlenecks

#### Is This Code Ready? → Implementation Validation Checklist
**Time:** 2-10 minutes depending on mode

#### What's the State of This Codebase? → Claude Code Health Check
**Time:** 15-90 minutes depending on tier

---

## 🎨 BY SITUATION

### Situation: "I Just Joined This Project"
**Day 1:**
1. Onboarding Docs Generator (read the output)
2. Claude Code Health Check (full/weekly - understand current state)

**Week 1:**
3. Use Error Message Decoder as you hit unfamiliar errors
4. Start using Implementation Validation Checklist (quick mode)

**Month 1:**
5. Run full Comprehensive Health Check (understand deeply)
6. Customize prompts for this codebase

---

### Situation: "Sprint Planning Day"
**Do This:**
1. Claude Code Validation Quick (changed scope - 10 min)
2. Test Coverage Gap Finder (plan testing work - 15 min)
3. Review last Health Check baseline (trends - 5 min)
4. Create priority list for sprint

**Total time:** 30 minutes
**Output:** Clear technical priorities

---

### Situation: "Feature Branch Complete, Ready to Merge"
**Do This:**
1. Implementation Validation Checklist (FULL mode - 10 min)
2. PR Review Assistant (self-review - 10 min)
3. If API changes: API Contract Validator (15 min)
4. If DB changes: Migration Safety Check (15 min)

**Total time:** 10-50 minutes (depending on feature)
**Output:** Confidence in merge

---

### Situation: "Production Deploy Tomorrow"
**Do This:**
1. Security Vulnerability Scanner (20 min)
2. Implementation Validation Checklist (FULL mode - 10 min)
3. Performance Regression Detector (10 min)
4. If migrations: Migration Safety Check (15 min)
5. Dependency Audit (quick scan - 5 min)

**Total time:** 45-60 minutes
**Output:** Deploy with confidence

---

### Situation: "Everything Is On Fire"
**Priority Order:**
1. Error Message Decoder (understand the error)
2. Specific diagnostic (Prisma/API/Config based on error)
3. Implementation Validation (quick mode after fix)
4. STOP - don't skip validation just because it's urgent

**Anti-pattern:** "No time to validate, just ship the fix"
**Reality:** That fix will cause 3 more fires

---

### Situation: "Slow Month, Time for Improvement"
**Do This:**
1. Claude Code Health Check (full/quarterly - 90 min)
2. Comprehensive Assessment for next big feature (60 min)
3. Review ALL prompts with Reusability Analysis (30 min)
4. Create custom prompts for your specific pain points (60 min)
5. Update documentation (30 min)

**Total investment:** 4.5 hours
**Return:** Next 3 months run smoother

---

## 🎯 BY ROLE

### Solo Developer
**Daily:**
- Implementation Validation (standard mode)
- Error Decoder (as needed)

**Weekly:**
- Code Validation (changed scope)
- Test Coverage OR Performance (alternate)

**Monthly:**
- Health Check (monthly tier)
- Security Scanner
- Dependency Audit

**Why:** Lightweight but comprehensive coverage

---

### Team Lead
**Daily:**
- PR Review Assistant (for team's PRs)
- Implementation Validation (your commits)

**Weekly:**
- Code Validation (full scope - know team's work)
- Review team's validation results

**Monthly:**
- Health Check (monthly tier) → share with team
- Plan improvements based on trends

**Quarterly:**
- Health Check (quarterly tier) → strategic planning
- Roadmap alignment

**Why:** Balance individual work with team oversight

---

### Senior/Staff Engineer
**Weekly:**
- Health Check (focus on architecture areas)
- Review critical PRs with PR Assistant

**Monthly:**
- Comprehensive Health Check
- Technical debt assessment
- Mentor team on prompt usage

**Quarterly:**
- Deep architectural analysis
- Establish new baselines
- Strategic tech planning

**Why:** Strategic focus, influence through standards

---

## 💡 SMART COMBINATIONS

### Combo 1: "The Daily Double"
```
Morning:
1. Code Validation Quick (changed scope) - 10 min

Before Committing:
2. Implementation Validation (standard mode) - 5 min

Total: 15 min/day
Catches: 90% of issues
```

---

### Combo 2: "The Weekly Triple"
```
Monday:
1. Code Validation Quick (full scope) - 15 min

Wednesday:
2. Test Coverage Gap Finder - 15 min

Friday:
3. Performance Regression Detector - 10 min

Total: 40 min/week
Benefit: Proactive quality management
```

---

### Combo 3: "The Monthly Stack"
```
First Friday:
1. Health Check (monthly tier) - 45 min
2. Security Scanner - 20 min
3. Dependency Audit - 15 min

Total: 80 min/month
Benefit: Comprehensive monthly review
```

---

### Combo 4: "The Feature Complete Stack"
```
Before Marking Done:
1. Implementation Validation (FULL) - 10 min
2. PR Review Assistant - 10 min
3. API Contract Validator (if applicable) - 15 min
4. Test Coverage Gap Finder - 15 min

Total: 35-50 min
Benefit: Ship with confidence
```

---

## 🚫 ANTI-PATTERNS

### ❌ Don't Do This

**Anti-Pattern 1: "I'll validate later"**
- Reality: You won't, and bugs will ship
- Instead: Make validation non-negotiable

**Anti-Pattern 2: "Always use the same mode"**
- Reality: Quick mode misses things, full mode too slow
- Instead: Match mode to situation

**Anti-Pattern 3: "Skip validation when in a hurry"**
- Reality: Urgency is when bugs happen
- Instead: Use quick mode minimum

**Anti-Pattern 4: "Run all prompts all the time"**
- Reality: You'll burn out and stop using them
- Instead: Use this guide to pick right prompts

**Anti-Pattern 5: "Never update baselines"**
- Reality: Comparisons become meaningless
- Instead: Update quarterly or after major releases

---

## ✅ BEST PRACTICES

### Do This:

**Practice 1: Start Small**
- Week 1: Just implementation validation
- Week 2: Add error decoder
- Month 1: Add weekly validation
- Month 2: Add monthly health check

**Practice 2: Make It Automatic**
- Create shell aliases
- Add git hooks
- Schedule calendar reminders
- Track in project management

**Practice 3: Measure Impact**
- Track bugs caught
- Measure time saved
- Document wins
- Share with team

**Practice 4: Customize Over Time**
- Add project-specific checks
- Remove irrelevant sections
- Create custom prompts
- Evolve with project

**Practice 5: Review Quarterly**
- Which prompts are most valuable?
- Which aren't being used?
- What new prompts needed?
- Update this guide

---

## 📊 DECISION MATRIX

```
┌────────────────┬─────────┬──────────┬──────────┬─────────┐
│ Prompt         │ Speed   │ Depth    │ Freq     │ Value   │
├────────────────┼─────────┼──────────┼──────────┼─────────┤
│ Validation     │ ⚡⚡⚡   │ ⭐⭐     │ Daily    │ 🔥🔥🔥  │
│ Error Decoder  │ ⚡⚡⚡   │ ⭐       │ As-need  │ 🔥🔥🔥  │
│ PR Review      │ ⚡⚡     │ ⭐⭐⭐   │ Daily    │ 🔥🔥🔥  │
│ Quick Health   │ ⚡⚡     │ ⭐⭐     │ Weekly   │ 🔥🔥    │
│ Prisma Diag    │ ⚡⚡     │ ⭐⭐     │ As-need  │ 🔥🔥🔥  │
│ API Contract   │ ⚡       │ ⭐⭐⭐   │ As-need  │ 🔥🔥    │
│ Monthly Health │ ⚡       │ ⭐⭐⭐⭐ │ Monthly  │ 🔥🔥    │
│ Security Scan  │ ⚡       │ ⭐⭐⭐   │ Monthly  │ 🔥🔥    │
│ Comprehensive  │ 🐌       │ ⭐⭐⭐⭐⭐│ Quarter  │ 🔥🔥🔥  │
└────────────────┴─────────┴──────────┴──────────┴─────────┘

⚡ = Fast  │  ⭐ = Shallow → Deep  │  🔥 = Value (ROI)
```

---

## 🎓 MASTERY PATH

### Month 1: Foundation
- Master implementation validation
- Use error decoder instinctively
- Establish weekly rhythm

### Month 2: Expansion
- Add weekly health checks
- Use PR review systematically
- First monthly comprehensive

### Month 3: Optimization
- Quarterly deep dive
- Establish baselines
- Custom prompts created

### Quarter 2+: Excellence
- Full prompt library integrated
- Team adoption (if applicable)
- Continuous improvement culture

---

## 📞 STILL NOT SURE?

### Ask Yourself:

**Q: "What am I about to do?"**
- Commit? → Validation Checklist
- Review code? → PR Assistant
- Deploy? → Security + Validation
- Plan? → Health Check

**Q: "What just broke?"**
- Prisma? → Prisma Diagnostic
- API? → API Contract Validator
- Config? → Environment Validator
- Unknown? → Error Decoder

**Q: "What should I focus on?"**
- Today? → Validation + Error Decoder
- This week? → + Weekly Health Check
- This month? → + Monthly Stack
- This quarter? → + Comprehensive Review

---

**Remember:** The goal isn't using every prompt every time. It's using the RIGHT prompt at the RIGHT time.

**Start here:** Implementation Validation Checklist (standard mode) before every commit for one week. Build from there.

---

**Version**: 2.0  
**Last Updated**: November 2025  
**Prompt Count**: 23 (6 core daily/weekly + 17 specialized)
