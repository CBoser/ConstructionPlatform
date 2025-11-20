# Daily Workflow - MindFlow Platform Development
**Version**: 1.0 (Merged from user workflow + SESSION_PROCEDURES)
**Last Updated**: 2025-11-11

---

## 🌅 Morning Startup (5-10 minutes)

### 1. Review Context (3 min)
```bash
# Check git status and recent commits
git status
git log --oneline -5

# Review yesterday's progress
cat docs/sprints/sprint-01/PROGRESS.md | tail -50
```

**Answer these questions**:
- What did I complete yesterday?
- Are there any outstanding blockers?
- What's the plan for today?

### 2. Check Today's Plan (3 min)
```bash
# Check current day objectives
cat docs/sprints/sprint-01/PLAN.md | grep -A 10 "Day [0-9]"

# Check for CRITICAL blockers
cat docs/technical-debt/REGISTER.md | grep -A 5 "CRITICAL"
```

**What to review**:
- **docs/sprints/sprint-01/PLAN.md** - Today's objectives and estimated time
- **docs/technical-debt/REGISTER.md** - Any CRITICAL blockers that need attention
- **docs/sprints/sprint-01/PROGRESS.md** - Outstanding blockers from yesterday

### 3. Start Session Log (2 min)
Open `docs/time-tracking/2025-11-week*.md` and log:
```markdown
### Session N
- **Start**: HH:MM
- **Planned Work**: <Brief description>
```

**Set 1-3 specific goals for this session**:
- Goal 1: [Specific, achievable task]
- Goal 2: [Optional second task]
- Goal 3: [Optional stretch goal]

---

## 🔧 During Work Session

### 1. Follow Current Task
- **Reference**: `docs/sprints/sprint-01/PLAN.md` for task details
- **Focus**: One task at a time from your session goals

### 2. Commit Frequently (Every 20-30 minutes)
```bash
git add <files>
git commit -m "type: brief description

Context: Why this change
Changes: What was modified
Impact: What this affects
"
```

**Commit Types**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### 3. Before Each Commit - Quality Gate
**Reference**: `docs/validation prompts/IMPLEMENTATION_VALIDATION_CHECKLIST.md`

Quick checklist:
- [ ] Code compiles without errors
- [ ] No new console errors/warnings
- [ ] Follows existing code patterns
- [ ] Security considerations addressed

### 4. Document Decisions Immediately
**When**: Making any technical decision (architecture, libraries, patterns, etc.)

**Update**: `docs/sprints/sprint-01/DECISIONS.md`

**Format**:
```markdown
### [Date] Decision Title

**Decision**: What was decided

**Rationale**: Why this decision was made

**Alternatives Considered**:
- Option 1: Why rejected
- Option 2: Why rejected

**Impact**: What this affects

**Code References**: Files and line numbers
```

### 5. Track Blockers Immediately
**When**: Encountering any blocker (error, dependency issue, unclear requirement)

**Update**: `docs/sprints/sprint-01/PROGRESS.md` (Blockers section)

**If technical debt**: Also create entry in `docs/technical-debt/REGISTER.md`

---

## 🌇 End of Session (10-15 minutes)

**CRITICAL**: Never skip this section! It saves hours later.

### 1. Log Time (2 min)
Update `docs/time-tracking/2025-11-week*.md`:
```markdown
### Session N
- **Start**: HH:MM
- **End**: HH:MM
- **Duration**: X minutes (X.XX hours)
- **Activity**: <What you worked on>
- **Category**: Planned Work | Debugging | Unplanned
- **Blockers**: <Any blockers encountered>
```

### 2. Update Sprint Progress (3 min)
Update `docs/sprints/sprint-01/PROGRESS.md`:

- **Check off**: Completed objectives
- **Document**: Work completed (bullet points)
- **Note**: Any blockers or decisions made
- **Update**: Day N section

### 3. Update Tracking Docs (3 min) - CONDITIONAL

**IF you completed a significant feature**:
```markdown
# Update: docs/CHANGELOG.md
- [x] **Day N**: <Feature name> (<file path>)
  - Issue: <What problem was solved>
  - Impact: <What changed>
  - Fix: <How it was fixed>
```

**IF you encountered or resolved technical debt**:
```markdown
# Update: docs/technical-debt/REGISTER.md

# If NEW debt:
- Create TD-XXX entry with priority
- Document impact and resolution plan

# If RESOLVED:
- Move to "Resolved Technical Debt" section
- Document lessons learned
- Update metrics
```

### 4. Write Shutdown Notes (2 min)
**Purpose**: Help yourself start faster next session

**Location**: In commit message OR bottom of PROGRESS.md Day N section

**Format**:
```markdown
## Shutdown Notes - Day N Session X

✅ Completed:
- <Item 1>
- <Item 2>

🚧 In Progress:
- <Item>: <Current state>

⚠️ Blockers:
- <Blocker>: <Details>

📋 Next Session:
1. <Priority 1>
2. <Priority 2>
```

### 5. Final Commit & Push (2 min)
```bash
# Add all changes
git add .

# Final commit
git commit -m "docs: End of Day N session - <summary>

<Include shutdown notes from above>
"

# Push to branch
git push -u origin <branch-name>
```

---

## 📅 Weekly Review (Every Friday, 30 minutes)

### 1. Calculate Velocity (5 min)
**Review**: `docs/time-tracking/2025-11-week*.md`

Calculate:
- **Total hours**: Actual vs planned
- **Velocity ratio**: Actual ÷ Planned
- **Time distribution**: Planned vs Debug vs Unplanned
- **Patterns**: Where did time go? What caused overruns?

### 2. Review Technical Debt (10 min)
**Review**: `docs/technical-debt/REGISTER.md`

Actions:
- [ ] Review all active debt items
- [ ] Resolve any stale items
- [ ] Re-prioritize based on current work
- [ ] Update metrics
- [ ] Document new patterns or learnings

### 3. Update Project Backlog (5 min)
**Review**: `Complete_Prioritized_Backlog.md` (if exists)

Actions:
- [ ] Move completed items
- [ ] Adjust priorities based on learnings
- [ ] Add new items discovered during week

### 4. Update Sprint Retrospective (5 min)
**Update**: `docs/sprints/sprint-01/RETROSPECTIVE.md`

Add:
- **Key learnings** from the week
- **What went well**
- **What needs improvement**
- **Blockers encountered** and how resolved

### 5. Plan Next Week (5 min)
**Review**: `docs/sprints/sprint-01/PLAN.md` for upcoming days

Actions:
- [ ] Review upcoming sprint days
- [ ] Adjust estimates based on velocity
- [ ] Identify dependencies or blockers
- [ ] Block calendar time

---

## 🚨 Emergency Procedures

### Session Interrupted Unexpectedly
```bash
# Quick save current state
git add .
git commit -m "WIP: Session interrupted - <what you were doing>"
git push

# Add note to PROGRESS.md
echo "⚠️ Session interrupted at $(date)" >> docs/sprints/sprint-01/PROGRESS.md
git add docs/sprints/sprint-01/PROGRESS.md
git commit -m "docs: Session interrupted"
git push
```

### Forgot to Track Time
Use git history to reconstruct:
```bash
# See commits from today with timestamps
git log --since="today" --pretty=format:"%h %ad | %s" --date=format:'%H:%M'

# Estimate time between first and last commit
# Add entry to time tracking document
```

### Lost Context
**Recovery steps**:
1. Check last commit message for shutdown notes
2. Read `docs/sprints/sprint-01/PROGRESS.md` current day
3. Check `docs/time-tracking/2025-11-week*.md` last entry
4. Review recent git diff: `git diff HEAD~3..HEAD`

---

## ✅ Session Checklist

### Morning Startup
- [ ] Check git status and recent commits (1 min)
- [ ] Review yesterday's PROGRESS.md (2 min)
- [ ] Check today's PLAN.md objectives (2 min)
- [ ] Quick scan of CRITICAL blockers (1 min)
- [ ] Log session start time (1 min)
- [ ] Set 1-3 specific session goals (2 min)

### During Session
- [ ] Commit after each meaningful unit (20-30 min)
- [ ] Use VALIDATION_CHECKLIST before commits
- [ ] Document decisions as they happen (DECISIONS.md)
- [ ] Track blockers immediately (PROGRESS.md + REGISTER.md if tech debt)

### End of Session (DON'T SKIP!)
- [ ] Log session end time and duration (2 min)
- [ ] Update sprint PROGRESS.md (3 min)
- [ ] Update CHANGELOG.md if feature complete (2 min)
- [ ] Update REGISTER.md if debt created/resolved (2 min)
- [ ] Write shutdown notes for next session (2 min)
- [ ] Final commit and push all changes (2 min)

### Friday Weekly Review
- [ ] Calculate velocity and time distribution (5 min)
- [ ] Review and update technical debt register (10 min)
- [ ] Update project backlog (5 min)
- [ ] Update sprint retrospective (5 min)
- [ ] Plan next week and adjust estimates (5 min)

---

## 📊 What to Update When

### Update EVERY Session (5-10 min total)
1. **docs/time-tracking/2025-11-week*.md** - Time log (START and END)
2. **docs/sprints/sprint-01/PROGRESS.md** - Progress and completed tasks

### Update WHEN RELEVANT (5 min each)
3. **docs/CHANGELOG.md** - When completing significant features
4. **docs/technical-debt/REGISTER.md** - When creating/resolving tech debt
5. **docs/sprints/sprint-01/DECISIONS.md** - When making technical decisions

### Update WEEKLY (30 min)
6. **docs/sprints/sprint-01/RETROSPECTIVE.md** - Friday learnings
7. **docs/technical-debt/REGISTER.md** - Friday debt review
8. **Complete_Prioritized_Backlog.md** - Friday backlog updates (if exists)

### DON'T Update Mid-Sprint (wait until sprint end)
- Planning docs (SPRINT_PLAN.md)
- Setup guides (unless changed)
- Architecture docs (unless changed)

---

## 💡 Workflow Philosophy

**Keep It Simple**:
- Morning: Review context (10 min)
- During: Focus on coding, commit frequently
- Evening: Update docs (10-15 min)
- Friday: Reflect and plan (30 min)

**Key Principles**:
1. **Document as you go** - Don't defer to end of sprint
2. **Commit frequently** - Every 20-30 minutes
3. **Track blockers immediately** - Don't wait
4. **End-of-session is sacred** - Never skip it
5. **Use validation checklist** - Quality gate before commits

**Time Investment**:
- Daily overhead: ~20-25 minutes (10 morning + 10-15 evening)
- Weekly overhead: 30 minutes (Friday review)
- **Benefit**: Prevents hours of context recovery and doc cleanup

---

## 📂 Key File Locations

### Daily Use
- `docs/sprints/sprint-01/PLAN.md` - Today's objectives
- `docs/sprints/sprint-01/PROGRESS.md` - Current progress
- `docs/time-tracking/2025-11-week*.md` - Time log
- `docs/validation prompts/IMPLEMENTATION_VALIDATION_CHECKLIST.md` - Quality gate

### Frequent Use
- `docs/technical-debt/REGISTER.md` - Tech debt tracking
- `docs/sprints/sprint-01/DECISIONS.md` - Technical decisions
- `docs/CHANGELOG.md` - Feature completion log

### Weekly Use
- `docs/sprints/sprint-01/RETROSPECTIVE.md` - Sprint learnings
- `Complete_Prioritized_Backlog.md` - Overall backlog (if exists)

---

**Remember**: This workflow exists to help you, not burden you. If something isn't working, adjust it. The goal is sustainable, documented progress—not perfect documentation.

---

**Last Updated**: 2025-11-11
**Next Review**: End of Sprint 1 or when workflow needs adjustment
