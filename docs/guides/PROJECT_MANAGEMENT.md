# Project Management Guide

**MindFlow Construction Platform**
**Solo Developer + AI Assistant Project**

---

## Overview

This guide establishes the project management practices, review cadences, and documentation standards for the MindFlow platform development.

**Project Type**: Solo developer with AI assistant
**Methodology**: Agile/Sprint-based
**Sprint Duration**: 10 days per sprint
**Estimated Total Duration**: 200 days (20 sprints)

---

## Daily Workflow

### Start of Day (5 minutes)
1. Review yesterday's progress
2. Check technical debt register for blockers
3. Set 3 main goals for today
4. Estimate time for each goal

### During Work
1. **Log time as you work** - Use `docs/time-tracking/TEMPLATE.md`
2. **Track blockers immediately** - Don't wait until end of day
3. **Update technical debt register** - When creating workarounds
4. **Take breaks** - Pomodoro technique (25 min work, 5 min break)

### End of Day (10 minutes)
1. **Log today's time** - Update weekly time tracking file
2. **Document blockers** - What slowed you down
3. **Update progress** - Check off completed tasks
4. **Plan tomorrow** - What are the top 3 priorities

**Template**:
```markdown
## End of Day Notes - [Date]

**Time Today**: [X hours]
**Completed**:
- [x] Task 1
- [x] Task 2

**Blockers**: [Description - X hours lost]

**Tomorrow's Top 3**:
1. [ ] Task 3
2. [ ] Task 4
3. [ ] Task 5
```

---

## Weekly Review (Friday, 30 minutes)

**When**: Every Friday at end of work session
**Duration**: 30 minutes
**Location**: `docs/time-tracking/YYYY-MM-weekN.md`

### Agenda

#### 1. Time Analysis (10 min)
- Calculate total time vs. planned time
- Calculate velocity (actual / planned)
- Review time by category (planned, debugging, docs, research)
- Identify time sinks

**Questions to Ask**:
- Where did the time go?
- What took longer than expected and why?
- What was faster than expected?
- What can we do differently next week?

#### 2. Sprint Progress Review (10 min)
- Review sprint objectives for this week
- Check completion status
- Identify what's at risk
- Adjust next week's plan if needed

**Questions to Ask**:
- Are we on track for sprint completion?
- Do we need to reduce scope?
- Do we need to extend the sprint?
- What's blocking progress?

#### 3. Technical Debt Review (5 min)
- Review technical debt register
- Prioritize new debt items
- Check if any debt can be resolved next week
- Update debt metrics

**Questions to Ask**:
- Is technical debt accumulating too fast?
- Do we need to pause feature work to pay down debt?
- What's the highest priority debt item?

#### 4. Plan Next Week (5 min)
- Set next week's goals
- Estimate time with realistic buffers
- Identify risky tasks
- Schedule technical debt paydown if needed

**Template Output**:
```markdown
# Weekly Review - Week of [Date]

## Time Summary
- Planned: [X hours]
- Actual: [Y hours]
- Variance: [+/- Z hours]
- Velocity: [Y/X = 0.XX]

## Sprint Progress
- [X]% complete
- On track / At risk / Behind schedule

## Top Blockers This Week
1. [Blocker 1] - [X hours]
2. [Blocker 2] - [Y hours]

## Technical Debt
- New items: [N]
- Resolved items: [M]
- Total active: [P items, Q hours]

## Next Week Plan
- Goal 1: [Description] - [X hours]
- Goal 2: [Description] - [Y hours]
- Goal 3: [Description] - [Z hours]

## Action Items
- [ ] Action 1
- [ ] Action 2
```

---

## Sprint Retrospective (End of Sprint, 1 hour)

**When**: End of every 10-day sprint
**Duration**: 1 hour
**Location**: `docs/sprints/sprint-XX/RETROSPECTIVE.md`

### Agenda

#### 1. Sprint Summary (10 min)
- Review sprint goals
- Calculate completion percentage
- Review total time vs. planned time
- Review quality metrics (bugs, tech debt, etc.)

#### 2. What Went Well (15 min)
- List all positives
- Identify what to keep doing
- Celebrate wins

#### 3. What Didn't Go Well (15 min)
- List all negatives
- Identify root causes
- No blame - focus on learning

#### 4. Lessons Learned (10 min)
- Technical lessons
- Process lessons
- Estimation lessons
- Tool lessons

#### 5. Action Items (10 min)
- Specific, actionable improvements
- Assign to next sprint
- Prioritize by impact

**Template**: See `docs/sprints/sprint-01/RETROSPECTIVE.md`

---

## Monthly Review (Optional, 1 hour)

**When**: End of every 3rd sprint (~30 days)
**Duration**: 1 hour
**Purpose**: Big picture alignment

### Agenda

#### 1. Roadmap Review (20 min)
- Are we on track for overall goals?
- Do we need to adjust the roadmap?
- What's the next major milestone?

#### 2. Velocity Trend Analysis (20 min)
- Review velocity across multiple sprints
- Identify patterns
- Adjust estimation models

#### 3. Technical Debt Trends (10 min)
- Is debt increasing or decreasing?
- Do we need a dedicated cleanup sprint?
- What's the debt paydown strategy?

#### 4. Process Improvements (10 min)
- Is the process working?
- Do we need to adjust workflows?
- What tools would help?

---

## Review Cadence Summary

| Review Type | Frequency | Duration | When | Purpose |
|-------------|-----------|----------|------|---------|
| End of Day Notes | Daily | 10 min | End of day | Track progress, plan tomorrow |
| Weekly Review | Weekly | 30 min | Friday | Analyze time, adjust plans |
| Sprint Retrospective | Every 10 days | 1 hour | End of sprint | Deep dive, lessons learned |
| Monthly Review | Every 30 days | 1 hour | End of month | Big picture alignment |

---

## Documentation Standards

### Required Documentation

#### 1. Time Tracking (Daily)
- **Location**: `docs/time-tracking/YYYY-MM-weekN.md`
- **Format**: See `docs/time-tracking/TEMPLATE.md`
- **Update Frequency**: Daily (end of day)

#### 2. Technical Debt Register (As Needed)
- **Location**: `docs/technical-debt/REGISTER.md`
- **Format**: See template in register
- **Update Frequency**: Immediately when creating workarounds
- **Review Frequency**: Weekly (Friday)

#### 3. Sprint Retrospectives (End of Sprint)
- **Location**: `docs/sprints/sprint-XX/RETROSPECTIVE.md`
- **Format**: See `docs/sprints/sprint-01/RETROSPECTIVE.md`
- **Update Frequency**: End of sprint

#### 4. Sprint Daily Logs (Optional but Recommended)
- **Location**: `docs/sprints/sprint-XX/day-YY.md`
- **Format**: Brief summary of day's work
- **Update Frequency**: Daily

### Optional Documentation

#### 1. Architecture Decision Records (ADRs)
- **Location**: `docs/architecture/ADR-NNN-title.md`
- **When**: Making significant architectural decisions
- **Format**: Context, Decision, Consequences

#### 2. Runbooks
- **Location**: `docs/runbooks/`
- **When**: Complex operational procedures
- **Format**: Step-by-step instructions

#### 3. Incident Reports
- **Location**: `docs/incidents/YYYY-MM-DD-title.md`
- **When**: Major production issues
- **Format**: Timeline, Root Cause, Resolution, Prevention

---

## Estimation Guidelines

### Based on Sprint 1 Data

**Current Velocity**: 0.62 (we're 62% as fast as planned)

**Recommended Approach**:
1. **Estimate the ideal time** (no blockers, no interruptions)
2. **Add 50% buffer** for blockers and debugging
3. **Round up** to nearest hour

**Example**:
- Task: "Implement CORS middleware"
- Ideal time: 2 hours
- With buffer: 2 × 1.5 = 3 hours
- Rounded: 3 hours

### Task Sizing

- **Small Task**: 1-2 hours
- **Medium Task**: 3-4 hours
- **Large Task**: 5-8 hours
- **Too Large**: Break into smaller tasks

**Rule**: If a task is >8 hours, break it down further.

### Risk Categories

**Low Risk**: Well-understood, done before
- Buffer: +25%

**Medium Risk**: Some unknowns, new but similar
- Buffer: +50%

**High Risk**: Many unknowns, completely new
- Buffer: +100%
- Consider research spike first

---

## Tools and Processes

### Time Tracking
- **Tool**: Markdown files (simple, version controlled)
- **Location**: `docs/time-tracking/`
- **Format**: See `TEMPLATE.md`
- **Backup**: Git commits serve as timestamps

### Technical Debt Management
- **Tool**: Markdown register (simple, searchable)
- **Location**: `docs/technical-debt/REGISTER.md`
- **Priority**: HIGH / MEDIUM / LOW
- **Review**: Weekly on Fridays

### Communication
- **With AI Assistant**: Clear, specific requests
- **Documentation**: Write as if explaining to future self
- **Comments**: Why, not what (code explains what)

### Version Control
- **Commit Frequency**: Small, logical commits
- **Commit Messages**: Clear, descriptive
- **Branching**: Feature branches for significant work
- **Main Branch**: Always deployable

---

## Red Flags - When to Pause and Reassess

🚨 **Stop and reassess if any of these occur:**

1. **Velocity drops below 0.5** - Something is wrong
2. **Technical debt > 40 hours** - Need cleanup sprint
3. **Same blocker 3+ days in a row** - Need different approach
4. **Burnout feelings** - Take a break, reduce scope
5. **Lost sight of end goal** - Review roadmap, refocus

---

## Success Metrics

### Sprint Success
- ✅ 80%+ of sprint objectives completed
- ✅ Velocity between 0.6-1.2 (sustainable pace)
- ✅ No P1/P2 bugs introduced
- ✅ Technical debt stable or decreasing

### Project Success
- ✅ On track for 200-day timeline (or adjusted timeline)
- ✅ High quality code (passing all tests)
- ✅ Good documentation (future you says thanks)
- ✅ Sustainable pace (not burning out)

### Personal Success
- ✅ Learning and growing
- ✅ Enjoying the process
- ✅ Proud of the work
- ✅ Work-life balance maintained

---

## Recommended Friday Review Checklist

```markdown
## Friday Weekly Review - [Date]

### 1. Time Analysis
- [ ] Calculate total time this week
- [ ] Calculate velocity
- [ ] Review time by category
- [ ] Identify time sinks

### 2. Sprint Progress
- [ ] Review sprint objectives
- [ ] Calculate completion %
- [ ] Identify risks
- [ ] Adjust next week if needed

### 3. Technical Debt
- [ ] Review new debt items
- [ ] Update priorities
- [ ] Check total debt hours
- [ ] Plan debt paydown if needed

### 4. Plan Next Week
- [ ] Set 3 main goals
- [ ] Estimate with buffers
- [ ] Identify risky tasks
- [ ] Schedule time for debt paydown

### 5. Reflection
- [ ] What went well this week?
- [ ] What needs improvement?
- [ ] What did I learn?
- [ ] Am I enjoying this?

### 6. Self-Care Check
- [ ] Am I getting enough rest?
- [ ] Am I taking breaks?
- [ ] Is the pace sustainable?
- [ ] Do I need to adjust anything?
```

---

## Getting Started with This System

### This Week (First Friday)
1. ✅ Read this guide
2. ✅ Review Sprint 1 Retrospective (already created)
3. ✅ Review Time Tracking for Week 1 (already created)
4. ✅ Review Technical Debt Register (already created)
5. [ ] Do your first Friday weekly review
6. [ ] Plan next week with realistic estimates

### Going Forward
1. **Daily**: Log time at end of day (10 min)
2. **Friday**: Weekly review (30 min)
3. **End of Sprint**: Retrospective (1 hour)
4. **Monthly**: Optional big-picture review (1 hour)

---

## Questions?

If you're unsure about any process:
1. Start simple - logging time is most important
2. Iterate - adjust the process as you learn
3. Be honest - don't fudge the numbers
4. Be kind to yourself - estimates will improve with data

Remember: **The goal is to deliver quality work at a sustainable pace, not to work yourself into the ground.**

---

**Last Updated**: 2025-11-09
**Next Review**: After Sprint 1 completion
