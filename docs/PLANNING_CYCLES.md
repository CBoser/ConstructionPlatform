# MindFlow Platform - Planning Cycles Overview

**Your Complete Planning System**

This document outlines your weekly shutdown, weekly planning, and monthly review cycles - designed to keep you focused on high-value work while tracking platform growth.

---

## Table of Contents

1. [Weekly Planning Cycle](#weekly-planning-cycle)
2. [Monthly Planning Cycle](#monthly-planning-cycle)
3. [How They Connect](#how-they-connect)
4. [Time Investment](#time-investment)
5. [Example Schedules](#example-schedules)
6. [Tools & Templates](#tools--templates)

---

## Weekly Planning Cycle

### Overview

**Duration:** 45-60 minutes per week
**Recommended Time:** Friday 3:30-4:30 PM
**Purpose:** Close the week with clarity, plan the next week strategically

### The Weekly Shutdown & Planning Session

#### Part 1: Data Collection (5 minutes)

**Run the automated metrics script:**
```bash
./scripts/weekly-valuation.sh
```

**What it collects:**
- Total lines of code (frontend + backend)
- Git activity (commits, files changed, contributors)
- Database models and schema changes
- Documentation metrics
- Recent commits summary

**Output:** Pre-filled weekly report in `docs/weekly-reports/[YEAR]/week-[NUMBER]-[DATE].md`

---

#### Part 2: Week Review (15 minutes)

**Open your weekly report and complete these sections:**

##### A. Development Progress (5 min)
- [ ] List features shipped this week
- [ ] Document technical improvements
- [ ] Note code quality changes
- [ ] Update phase completion percentages

**Questions to answer:**
- What did we ship this week?
- What technical debt did we address?
- What's our progress on current phase?

##### B. Customer & Business Metrics (5 min)
- [ ] Update customer acquisition funnel
- [ ] Record demos/conversations
- [ ] Track trial starts and conversions
- [ ] Calculate MRR/ARR if applicable
- [ ] Note pipeline changes

**Questions to answer:**
- Who did we talk to this week?
- Any new leads or opportunities?
- Customer feedback received?
- Revenue changes?

##### C. Key Wins & Learnings (5 min)
- [ ] Document major achievements (celebrate!)
- [ ] Note key learnings
- [ ] Identify what worked well
- [ ] Capture what didn't work
- [ ] List blockers encountered

**Questions to answer:**
- What are we most proud of this week?
- What surprised us?
- What should we do differently?

---

#### Part 3: Valuation Update (10 minutes)

**Calculate updated platform valuation:**

##### Development Cost Method
```
Current total investment: $______
IP Multiplier (1.5-2.5x): ______
Valuation: $______
```

##### Revenue Multiple Method (if customers exist)
```
Current ARR: $______
Multiple (3-6x): ______
Valuation: $______
```

##### Comparable Companies
```
Current stage: [Pre-revenue / First customers / etc.]
Typical range: $______ - $______
Your position: $______
```

**Record in report:**
- [ ] Update all three valuation methods
- [ ] Calculate recommended valuation range
- [ ] Note change from last week
- [ ] Identify key value drivers

**Questions to answer:**
- How much value did we create this week?
- What drove the change?
- Are we on track to hit next milestone?

---

#### Part 4: Strategic Assessment (10 minutes)

**Review strategic initiatives:**

- [ ] Check progress on each active initiative
- [ ] Update milestone roadmap
- [ ] Assess if priorities need adjustment
- [ ] Identify risks or blockers
- [ ] Note market intelligence

**Questions to answer:**
- Are we working on the right things?
- Any strategic pivots needed?
- Competitive landscape changes?
- Partnership opportunities?

---

#### Part 5: Next Week Planning (15 minutes)

**Set next week's priorities:**

##### The "Top 3" Framework

**Priority 1: Highest Valuation Impact**
- Objective: [What will you achieve?]
- Estimated value impact: +$______
- Success criteria: [How will you know it's done?]
- Time allocation: [X hours]

**Priority 2: Medium Valuation Impact**
- Objective: [What will you achieve?]
- Estimated value impact: +$______
- Success criteria: [How will you know it's done?]
- Time allocation: [X hours]

**Priority 3: Foundation/Necessary Work**
- Objective: [What will you achieve?]
- Estimated value impact: +$______
- Success criteria: [How will you know it's done?]
- Time allocation: [X hours]

**Additional tasks (if time permits):**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Questions to answer:**
- What will move the needle most next week?
- What customer conversations should happen?
- What features should ship?
- What blockers need mitigation?

**Time allocation planning:**
```
Development:        [X] hours (___%)
Customer Development: [X] hours (___%)
Sales/Marketing:    [X] hours (___%)
Admin/Operations:   [X] hours (___%)
Total:              40 hours (100%)
```

---

#### Part 6: Commit & Close (5 minutes)

**Save your work:**

```bash
# Commit this week's report
git add docs/weekly-reports/
git commit -m "docs: weekly valuation report week $(date +%U)"
git push
```

**Mental closure:**
- [ ] Review next week's top 3 priorities
- [ ] Acknowledge this week's wins
- [ ] Release any incomplete items (they'll be there Monday)
- [ ] Close laptop
- [ ] Enjoy weekend with clear mind! 🎉

---

## Weekly Planning Session Summary

| Section | Time | Activity |
|---------|------|----------|
| Data Collection | 5 min | Run automation script |
| Week Review | 15 min | Document progress, wins, learnings |
| Valuation Update | 10 min | Calculate current platform value |
| Strategic Assessment | 10 min | Review initiatives, roadmap |
| Next Week Planning | 15 min | Set top 3 priorities |
| Commit & Close | 5 min | Save report, mental closure |
| **Total** | **60 min** | **Complete weekly cycle** |

---

## Monthly Planning Cycle

### Overview

**Duration:** 2-3 hours per month
**Recommended Time:** Last Sunday of the month
**Purpose:** Strategic review, roadmap adjustment, quarterly planning

### The Monthly Review & Planning Session

#### Part 1: Data Aggregation (20 minutes)

**Compile 4-5 weekly reports into monthly summary:**

```bash
# Review all weekly reports from the month
ls docs/weekly-reports/$(date +%Y)/
```

**Create monthly summary document:**
`docs/monthly-reviews/[YEAR]/[MONTH]-monthly-review.md`

**Aggregate these metrics:**

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Total/Avg |
|--------|--------|--------|--------|--------|-----------|
| Valuation | $___K | $___K | $___K | $___K | Change: +$___K |
| Customers | X | X | X | X | Net: +X |
| ARR | $___K | $___K | $___K | $___K | Change: +$___K |
| Features Shipped | X | X | X | X | Total: X |
| LOC Added | X | X | X | X | Total: X |

---

#### Part 2: Month-in-Review (30 minutes)

**Development Progress**

- [ ] Total features shipped this month: [X]
- [ ] Lines of code added: [X]
- [ ] Phase completion progress: [X%]
- [ ] Technical debt addressed: [X issues]
- [ ] Major technical wins: [List]

**Customer & Revenue Progress**

- [ ] New customers acquired: [X]
- [ ] Demos completed: [X]
- [ ] Conversion rate: [X%]
- [ ] MRR growth: +$[X]
- [ ] ARR at month end: $[X]
- [ ] Pipeline value: $[X]

**Valuation Growth**

| Method | Start of Month | End of Month | Change |
|--------|----------------|--------------|--------|
| Development Cost | $___,___ | $___,___ | +$___,___ (+__%) |
| Revenue Multiple | $___,___ | $___,___ | +$___,___ (+__%) |
| Recommended Range | $___K-$___K | $___K-$___K | +$___K |

**Key Value Drivers:**
1. [Driver 1] - Impact: +$___K
2. [Driver 2] - Impact: +$___K
3. [Driver 3] - Impact: +$___K

---

#### Part 3: Strategic Review (40 minutes)

**Milestone Progress**

Review progress on strategic milestones:

| Milestone | Target Date | Status | Progress | Next Actions |
|-----------|-------------|--------|----------|--------------|
| Complete Phase 1 | [Date] | 🟡 | 75% | [Actions] |
| First 5 Customers | [Date] | 🟢 | 100% | ✅ DONE |
| Reach $50K ARR | [Date] | 🟡 | 60% | [Actions] |

**Roadmap Assessment**

- [ ] Review current phase objectives
- [ ] Assess if timeline is realistic
- [ ] Identify scope creep or delays
- [ ] Adjust priorities if needed
- [ ] Update estimated completion dates

**Competitive Landscape**

- [ ] Document competitor movements
- [ ] Note market trends
- [ ] Identify new opportunities
- [ ] Assess competitive positioning
- [ ] Strategic adjustments needed?

**Customer Insights**

Themes from customer conversations:
- **Most requested features:**
  1. [Feature 1] - Mentioned by X customers
  2. [Feature 2] - Mentioned by X customers
  3. [Feature 3] - Mentioned by X customers

- **Pain points identified:**
  1. [Pain 1]
  2. [Pain 2]
  3. [Pain 3]

- **Value proposition validation:**
  - What's resonating: [Feedback]
  - What's not landing: [Feedback]
  - Messaging adjustments: [Changes]

---

#### Part 4: Next Month Objectives (30 minutes)

**Big Goals (3-5 major objectives)**

1. **[Objective 1]**
   - Target outcome: [Specific result]
   - Success metrics: [How measured]
   - Estimated value impact: +$___K
   - Key milestones:
     - Week 1: [Milestone]
     - Week 2: [Milestone]
     - Week 3: [Milestone]
     - Week 4: [Milestone]

2. **[Objective 2]**
   - Target outcome: [Specific result]
   - Success metrics: [How measured]
   - Estimated value impact: +$___K
   - Key milestones:
     - Week 1: [Milestone]
     - Week 2: [Milestone]
     - Week 3: [Milestone]
     - Week 4: [Milestone]

3. **[Objective 3]**
   - Target outcome: [Specific result]
   - Success metrics: [How measured]
   - Estimated value impact: +$___K
   - Key milestones:
     - Week 1: [Milestone]
     - Week 2: [Milestone]
     - Week 3: [Milestone]
     - Week 4: [Milestone]

**Target Metrics for Month End**

| Metric | Current | Target | Required Growth |
|--------|---------|--------|-----------------|
| Valuation | $___K | $___K | +$___K (+__%) |
| Customers | X | X | +X |
| ARR | $___K | $___K | +$___K |
| Phase Completion | __% | __% | +__% |
| Features Shipped | X | X | +X |

---

#### Part 5: Resource Planning (20 minutes)

**Time Allocation Review**

How did you actually spend time last month?

| Activity | Planned % | Actual % | Adjustment Needed? |
|----------|-----------|----------|-------------------|
| Development | 60% | __% | |
| Customer Development | 20% | __% | |
| Sales/Marketing | 10% | __% | |
| Admin/Operations | 10% | __% | |

**Next month's allocation:**

| Activity | Target % | Hours/Week |
|----------|----------|------------|
| Development | __% | __ hours |
| Customer Development | __% | __ hours |
| Sales/Marketing | __% | __ hours |
| Admin/Operations | __% | __ hours |

**Investment Budget**

Last month's spending:
- Infrastructure: $___
- Tools/Software: $___
- Marketing: $___
- Other: $___
- **Total:** $___

Next month's budget:
- Infrastructure: $___
- Tools/Software: $___
- Marketing: $___
- Other: $___
- **Total:** $___

**Help Needed?**

- [ ] Areas where you're bottlenecked
- [ ] Skills to learn or hire for
- [ ] Tools/automation to invest in
- [ ] Strategic partnerships to pursue

---

#### Part 6: Documentation & Communication (20 minutes)

**Investor/Stakeholder Update**

Prepare monthly update (even if pre-revenue):

```markdown
## [Month] Update

### TL;DR
[3 sentences summarizing the month]

### Key Metrics
- Valuation: $___K → $___K (+__%)
- Customers: X → X (+X)
- ARR: $___K → $___K (+__%)
- Development: Phase X at __% complete

### Major Achievements
1. [Achievement 1]
2. [Achievement 2]
3. [Achievement 3]

### Customer Traction
- [Highlight customer wins]
- [Feature feedback]
- [Market validation]

### Next Month Focus
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Ask
[What you need: intros, feedback, resources, etc.]
```

**Internal Documentation**

- [ ] Update README if major changes
- [ ] Document architectural decisions (ADRs)
- [ ] Update roadmap visuals
- [ ] Archive completed sprint docs
- [ ] Clean up technical debt backlog

---

## Monthly Review Session Summary

| Section | Time | Activity |
|---------|------|----------|
| Data Aggregation | 20 min | Compile weekly reports |
| Month-in-Review | 30 min | Analyze progress and metrics |
| Strategic Review | 40 min | Roadmap, competition, customers |
| Next Month Objectives | 30 min | Set 3-5 big goals |
| Resource Planning | 20 min | Time/budget allocation |
| Documentation | 20 min | Updates and communication |
| **Total** | **2.5-3 hrs** | **Complete monthly cycle** |

---

## How They Connect

### The Planning Hierarchy

```
┌─────────────────────────────────────────────────┐
│  QUARTERLY PLANNING (4 hours)                   │
│  • 90-day strategic objectives                  │
│  • Major milestone targets                      │
│  • Resource allocation                          │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │                    │
    ┌────▼────┐         ┌────▼────┐         ┌─────────┐
    │ Month 1 │         │ Month 2 │         │ Month 3 │
    │ 3 hours │         │ 3 hours │         │ 3 hours │
    └────┬────┘         └────┬────┘         └────┬────┘
         │                   │                    │
    ┌────▼─────┬─────┬─────┐│                   │
    │ Week 1   │ W 2 │ W 3 ││ W 4                │
    │ 1 hour   │1 hr │1 hr ││1 hr                │
    └──────────┴─────┴─────┘│                    │
         │                   │                    │
    ┌────▼──────────────┐   │                    │
    │ Daily Work        │   │                    │
    │ • Execute on      │   │                    │
    │   weekly top 3    │   │                    │
    │ • Track progress  │   │                    │
    │ • Adjust as needed│   │                    │
    └───────────────────┘   │                    │
                            ...                  ...
```

### Information Flow

**Weekly → Monthly:**
- 4-5 weekly reports aggregate into monthly summary
- Weekly wins become monthly achievements
- Weekly blockers inform monthly strategy adjustments
- Weekly valuations show monthly growth trend

**Monthly → Quarterly:**
- 3 monthly reviews compile into quarterly assessment
- Monthly objectives ladder up to quarterly goals
- Monthly learnings inform quarterly pivots
- Monthly metrics validate quarterly trajectory

**Quarterly → Annual:**
- 4 quarterly reviews create annual retrospective
- Quarterly milestones track annual vision
- Quarterly pivots document company evolution
- Quarterly valuations show annual growth

---

## Time Investment

### Weekly Time Commitment

| Activity | Frequency | Duration |
|----------|-----------|----------|
| Weekly shutdown/planning | 1x/week | 60 min |
| **Total** | | **1 hour/week** |

### Monthly Time Commitment

| Activity | Frequency | Duration |
|----------|-----------|----------|
| Weekly shutdown/planning | 4x/month | 4 hours |
| Monthly review/planning | 1x/month | 3 hours |
| **Total** | | **7 hours/month** |

### Annual Time Investment

- **Weekly sessions:** 52 hours/year
- **Monthly sessions:** 36 hours/year
- **Quarterly sessions:** 16 hours/year
- **Total:** ~104 hours/year (~2 hours/week average)

### ROI on Planning Time

**Time invested:** 2 hours/week
**Benefits:**
- ✅ Strategic clarity (reduce wasted effort by 20-30%)
- ✅ Faster decision-making (data readily available)
- ✅ Investor-ready updates (save 10+ hours per fundraise)
- ✅ Historical knowledge (onboard team faster)
- ✅ Course correction (catch issues early)

**Estimated value:** 5-10x return on time invested

---

## Example Schedules

### Option 1: Friday Shutdown Routine

**Best for:** People who like to close the week cleanly

**Friday:**
- **3:30 PM:** Start wrapping up work
- **4:00 PM:** Run `./scripts/weekly-valuation.sh`
- **4:05 PM:** Complete weekly report (business metrics)
- **4:20 PM:** Calculate valuation update
- **4:30 PM:** Review strategic initiatives
- **4:40 PM:** Plan next week's top 3 priorities
- **5:00 PM:** Commit report, close laptop
- **5:01 PM:** Weekend starts with clear mind! 🎉

**Last Sunday of Month:**
- **2:00 PM:** Monthly review session
- **2:20 PM:** Aggregate weekly reports
- **2:50 PM:** Strategic review
- **3:30 PM:** Set next month objectives
- **4:00 PM:** Resource planning
- **4:30 PM:** Documentation
- **5:00 PM:** Month closed, ready for new month!

---

### Option 2: Sunday Evening Planning

**Best for:** People who like to prep for the week ahead

**Sunday Evening:**
- **7:00 PM:** Review last week
- **7:10 PM:** Run `./scripts/weekly-valuation.sh`
- **7:15 PM:** Complete weekly report
- **7:30 PM:** Update valuation
- **7:40 PM:** Plan next week's top 3
- **8:00 PM:** Commit report, week planned!

**Last Sunday of Month:**
- **6:00 PM:** Extended monthly session
- **6:20 PM:** Month review
- **7:00 PM:** Strategic assessment
- **7:40 PM:** Next month planning
- **8:20 PM:** Resource allocation
- **8:40 PM:** Documentation
- **9:00 PM:** Month complete!

---

### Option 3: Monday Morning Kickoff

**Best for:** Morning people who like fresh starts

**Monday Morning:**
- **8:00 AM:** Coffee + review last week
- **8:10 AM:** Run `./scripts/weekly-valuation.sh`
- **8:15 AM:** Complete weekly report
- **8:30 AM:** Update valuation
- **8:40 AM:** Set this week's top 3
- **9:00 AM:** Start work on priority #1!

**First Monday of Month:**
- **7:00 AM:** Extended monthly session
- **7:30 AM:** Last month review
- **8:00 AM:** Strategic planning
- **8:40 AM:** This month objectives
- **9:10 AM:** Ready to crush the month!

---

## Tools & Templates

### Weekly Planning Tools

| Tool | Location | Purpose |
|------|----------|---------|
| **Weekly Template** | `docs/templates/WEEKLY_VALUATION_TEMPLATE.md` | Structured weekly report format |
| **Automation Script** | `scripts/weekly-valuation.sh` | Auto-collect code metrics |
| **Quick Start Guide** | `docs/guides/WEEKLY_VALUATION_GUIDE.md` | How-to instructions |

### Monthly Planning Tools

| Tool | Location | Purpose |
|------|----------|---------|
| **Monthly Template** | `docs/templates/MONTHLY_REVIEW_TEMPLATE.md` | *(Create if needed)* |
| **Reports Archive** | `docs/weekly-reports/[YEAR]/` | Historical weekly reports |
| **Monthly Reviews** | `docs/monthly-reviews/[YEAR]/` | *(Create directory)* |

### Supporting Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Platform Valuation Report** | `docs/PLATFORM_VALUATION_REPORT_2025-11-28.md` | Baseline valuation analysis |
| **README** | `README.md` | Overall project context |
| **Sprint Plans** | `docs/sprints/` | Development roadmap |
| **Architecture Decisions** | `docs/architecture/` | ADRs for reference |

---

## Quick Reference Commands

### Weekly Routine

```bash
# Friday shutdown
./scripts/weekly-valuation.sh        # Generate weekly report
code docs/weekly-reports/2025/week-*.md  # Edit report
git add docs/weekly-reports/
git commit -m "docs: weekly valuation report week $(date +%U)"
git push
```

### Monthly Routine

```bash
# Review all weekly reports
ls -lh docs/weekly-reports/$(date +%Y)/

# Create monthly summary
code docs/monthly-reviews/$(date +%Y)/$(date +%B)-monthly-review.md

# Commit monthly review
git add docs/monthly-reviews/
git commit -m "docs: monthly review for $(date +%B)"
git push
```

### Quick Metrics Check

```bash
# Lines of code
find frontend/src backend/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# Commits this week
git log --since="7 days ago" --oneline | wc -l

# Files changed this week
git log --since="7 days ago" --name-only --pretty=format: | sort -u | wc -l
```

---

## Customization Tips

### Make It Your Own

✅ **Adjust timing:**
- Move sessions to match your energy patterns
- Split into shorter sessions if needed
- Batch similar activities together

✅ **Modify sections:**
- Focus on sections most valuable to you
- Add custom metrics you care about
- Remove sections that don't apply (yet)

✅ **Automate more:**
- Create additional scripts for your workflow
- Build dashboards from report data
- Integrate with other tools

✅ **Evolve over time:**
- Start simple, add complexity as needed
- Adjust based on stage (pre-revenue vs. growth)
- Refine based on what's actually useful

---

## Summary: Your Planning Rhythm

### Weekly (60 minutes)
- ✅ Close last week (wins, learnings, metrics)
- ✅ Update valuation
- ✅ Plan next week (top 3 priorities)
- ✅ Mental clarity and closure

### Monthly (3 hours)
- ✅ Aggregate 4-5 weeks of data
- ✅ Strategic review (roadmap, competition, customers)
- ✅ Set big objectives for next month
- ✅ Resource allocation

### Quarterly (4 hours)
- ✅ 90-day strategic planning
- ✅ Major milestone assessment
- ✅ Pivot or persevere decisions
- ✅ Fundraising prep (if applicable)

### Benefits
- 📈 Track platform value growth
- 🎯 Stay focused on high-value work
- 💡 Make data-driven decisions
- 🚀 Always fundraising-ready
- 🧘 Peace of mind from clarity

---

**Ready to start?**

```bash
./scripts/weekly-valuation.sh
```

**Set your first weekly planning session in calendar:**
- ⏰ When: [Your chosen time]
- ⏱️ Duration: 60 minutes
- 🔁 Repeat: Weekly
- 📝 Description: Run ./scripts/weekly-valuation.sh, complete report, plan next week

**You've got this! 🚀**
