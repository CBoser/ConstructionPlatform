# Corey Dev Framework - Tools & Quick Reference

Complete guide to the development framework tools for sustainable, high-quality construction platform development.

## 🎯 Framework Overview

The Corey Dev Framework is designed for:
- **Sustainable pace**: 30-minute sessions, 60-90 min/day
- **High quality**: 10-step validation, 70%+ test coverage
- **Clear progress**: Comprehensive documentation and tracking
- **Predictable velocity**: Time tracking and sprint metrics

## 🛠️ Available Tools

### 1. Sprint Template Generator (`create_sprint.py`)

Creates complete sprint directory structure with all required documentation.

**Usage:**
```bash
python create_sprint.py <sprint_number> [project_root]
```

**Examples:**
```bash
# Create Sprint 8 in current directory
python create_sprint.py 8

# Create Sprint 8 in specific project
python create_sprint.py 8 /path/to/my-project
```

**What It Creates:**
```
docs/sprints/sprint-XX/
├── PLAN.md                   # Sprint plan with DoD
├── PROGRESS.md               # Daily progress tracking
├── DECISIONS.md              # Technical decisions log
├── CHANGELOG.md              # User-facing changes
├── LEARNINGS.md              # Lessons learned
└── VALIDATION_CHECKLIST.md   # End of sprint validation
```

**When to Use:**
- Start of every new sprint
- Before planning next iteration
- When setting up new project

---

### 2. Time Tracking Helper (`log_time.py`)

Tracks development sessions and helps maintain 30-minute focus periods.

**Commands:**

**Start a Session:**
```bash
python log_time.py start
```
- Logs start time
- Sets 30-minute timer reminder
- Prompts focus mode

**End a Session:**
```bash
python log_time.py end
python log_time.py end "Fixed customer validation bug"
```
- Logs end time and duration
- Warns if session > 30 minutes
- Prompts for what was accomplished
- Updates PROGRESS.md

**Daily Summary:**
```bash
python log_time.py summary
```
- Prompts for daily accomplishments
- Lists blockers
- Plans next day
- Calculates total hours

**Velocity Metrics:**
```bash
python log_time.py velocity
```
- Shows sessions logged
- Calculates estimated hours
- Displays task completion rate
- Identifies velocity trends

**When to Use:**
- Every development session (start/end)
- End of each day (summary)
- Friday sprint review (velocity)

---

### 3. Validation Runner (`run_validation.py`)

Automates the 10-step validation process to ensure quality before sprint close.

**Commands:**

**Quick Validation** (5-10 minutes):
```bash
python run_validation.py quick
```
Runs automated checks:
- Step 1: Analyze current state (type-check, build, test)
- Step 5: Test compilation
- Step 9: Run automated tests
- Generates validation report

**Full Validation** (with manual steps):
```bash
python run_validation.py full
```
Runs automated checks + reminds about manual steps:
- Steps 2-4: Review, prioritize, fix
- Steps 6-8: Startup, features, integration testing
- Step 10: Documentation

**Individual Steps:**
```bash
python run_validation.py step1  # Analyze state
python run_validation.py step5  # Test compilation
python run_validation.py step9  # Run tests
```

**When to Use:**
- End of every sprint (full validation)
- After major changes (quick validation)
- Before demos/releases (full validation)
- Daily commit checks (quick validation)

---

## 📅 Daily Workflow

### Morning Routine (10 minutes)

```bash
# 1. Check yesterday's progress
cd docs/sprints/sprint-XX
cat PROGRESS.md

# 2. Plan today's tasks
# Review PLAN.md for today's goals

# 3. Start first session
python log_time.py start
```

### During Development

```bash
# Work for 20-30 minutes
# Make changes, write code, fix bugs

# Commit frequently
git add .
git commit -m "feat: add customer validation"

# End session
python log_time.py end "Implemented customer validation"

# Take 5-minute break

# Start next session (if time/energy)
python log_time.py start
```

### End of Day (10 minutes)

```bash
# Create daily summary
python log_time.py summary

# Final commit
git add .
git commit -m "docs: update progress log"
git push

# Quick validation check (optional)
python run_validation.py quick
```

---

## 📊 Friday Review Routine (30 minutes)

### 1. Calculate Velocity (5 min)

```bash
python log_time.py velocity
```

Document in PROGRESS.md:
- Total hours this week
- Tasks completed vs planned
- Completion rate percentage

### 2. Review Blockers (10 min)

Answer in LEARNINGS.md:
- What blocked progress?
- How to avoid blockers next week?
- Any technical debt accumulated?

### 3. Plan Next Week (15 min)

Update next sprint's PLAN.md:
- Review backlog
- Select tasks based on this week's velocity
- Write specific Monday goals
- Identify dependencies

---

## 🔄 Sprint Lifecycle

### Sprint Start (Session 1-3)

```bash
# Create sprint structure
python create_sprint.py 8

# Review and customize PLAN.md
cd docs/sprints/sprint-08
vi PLAN.md

# Start first development session
python log_time.py start
```

### During Sprint (Daily)

```bash
# Morning: Review PLAN.md, start session
python log_time.py start

# During day: Code, commit, track
python log_time.py end "Task completed"

# Evening: Summary and push
python log_time.py summary
git push
```

### Sprint End (Last 2 Days)

```bash
# Run full validation
python run_validation.py full

# Fix any validation failures
# (use 10-step process)

# Update documentation
# - CHANGELOG.md
# - PROGRESS.md summary
# - LEARNINGS.md

# Final check
python run_validation.py quick
```

---

## 💡 Framework Principles

### Sustainability Over Speed
- **Never** work more than 30 min per session
- **Always** take breaks between sessions
- **Protect** Wednesday for caregiving
- **Stop** if exhausted (skip evening session)

### Quality Over Quantity
- **70%+ test coverage** required
- **All tests passing** before sprint close
- **No TypeScript errors** tolerated
- **Validation checklist** must pass

### Documentation Over Memory
- **Log daily** in PROGRESS.md
- **Document decisions** in DECISIONS.md
- **Track learnings** in LEARNINGS.md
- **Update changelog** for users

### Predictability Over Uncertainty
- **Track velocity** every Friday
- **Adjust capacity** based on data
- **Break large tasks** into 30-60 min chunks
- **Plan conservatively** (5 hours/week, not 7.5)

---

## 📋 Checklists

### Daily Checklist
- [ ] Morning: Read yesterday's PROGRESS.md
- [ ] Morning: Review today's tasks in PLAN.md
- [ ] Session: Start timer with `python log_time.py start`
- [ ] Session: Work for 30 minutes max
- [ ] Session: End timer with `python log_time.py end`
- [ ] Session: Commit changes with clear message
- [ ] Evening: Run `python log_time.py summary`
- [ ] Evening: Push all changes

### Friday Checklist
- [ ] Run `python log_time.py velocity`
- [ ] Calculate completion rate
- [ ] Review blockers in LEARNINGS.md
- [ ] Update technical debt log
- [ ] Plan next week's tasks
- [ ] Adjust capacity if needed
- [ ] Write Monday goals

### Sprint End Checklist
- [ ] Run `python run_validation.py full`
- [ ] Fix all validation failures
- [ ] All tests passing
- [ ] 70%+ code coverage
- [ ] Update CHANGELOG.md
- [ ] Complete PROGRESS.md summary
- [ ] Document learnings in LEARNINGS.md
- [ ] Mark sprint complete

---

## 🎯 Common Scenarios

### Scenario: Starting New Project

```bash
# 1. Create project directory
mkdir my-project && cd my-project

# 2. Initialize git
git init

# 3. Create first sprint
python /path/to/create_sprint.py 1

# 4. Customize PLAN.md
vi docs/sprints/sprint-01/PLAN.md

# 5. Start development
python /path/to/log_time.py start
```

### Scenario: Mid-Sprint Check

```bash
# Check progress
cd docs/sprints/sprint-XX
cat PROGRESS.md

# Check velocity
python /path/to/log_time.py velocity

# Quick validation
python /path/to/run_validation.py quick

# Adjust remaining tasks if behind
vi PLAN.md
```

### Scenario: Validation Failed

```bash
# Run validation
python run_validation.py full

# Read error report
cat validation_report.md

# Fix errors one by one
# Start with critical (imports, types)
# Then important (properties, methods)
# Then minor (warnings, console.logs)

# Re-validate
python run_validation.py quick
```

### Scenario: Scope Creep

```markdown
Richmond: "Can you add just one more feature?"

Response: "Great idea! Let's add it to Sprint [X+2] backlog
and prioritize after current sprint is validated and complete."

Actions:
1. Add to backlog in docs/backlog.md
2. Continue current sprint plan
3. No changes to current PLAN.md
```

---

## 🔧 Configuration

### Project Setup

Ensure your project has this structure:
```
my-project/
├── backend/           # Backend code
│   ├── package.json
│   └── src/
├── frontend/          # Frontend code
│   ├── package.json
│   └── src/
├── docs/              # Documentation
│   └── sprints/       # Sprint docs
│       ├── sprint-01/
│       ├── sprint-02/
│       └── ...
└── README.md
```

### Required npm Scripts

**backend/package.json**:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc",
    "test": "jest",
    "dev": "ts-node-dev src/server.ts"
  }
}
```

**frontend/package.json**:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "vite build",
    "test": "vitest",
    "start": "vite"
  }
}
```

---

## 📚 Additional Resources

**Framework Documentation:**
- Corey Dev Framework skill: `Updated Construction Management Platform skills/corey-dev-framework.skill`
- Validation checklist: `corey-dev-framework/references/validation_checklist_complete.md`

**Related Tools:**
- Skills Manager: `python skill_manager.py`
- Quick Export: `python quick_export.py`

---

## 🎓 Tips & Best Practices

**Time Management:**
- Set phone timer for 30 minutes
- Use Do Not Disturb mode
- One browser tab, one file at a time
- Walk away when timer goes off (even mid-task)

**Task Breakdown:**
- No task larger than 60 minutes
- Break into concrete, testable chunks
- Write specific acceptance criteria
- Estimate conservatively

**Velocity Tracking:**
- Track actual vs estimated every Friday
- Adjust next sprint based on data
- 70% completion = reduce scope 30%
- 90% completion = can add small tasks

**Documentation:**
- Write DECISIONS.md immediately (don't trust memory)
- Update PROGRESS.md daily (prevents context loss)
- Keep LEARNINGS.md for retrospective
- CHANGELOG.md is for users (what changed, not how)

**Quality Gates:**
- Never skip tests "just this once"
- 70% coverage is minimum, not target
- All TypeScript errors must be fixed
- Validation checklist is non-negotiable

---

**Version:** 1.0.0
**Framework:** Corey Dev Framework
**Tools:** Sprint Generator, Time Tracker, Validation Runner

**Sustainable development with measurable quality!** 🚀
