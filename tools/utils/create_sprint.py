#!/usr/bin/env python3
"""
Sprint Template Generator - Creates sprint structure following Corey Dev Framework
Generates complete sprint directory with all required documentation files

Version: 1.1.0
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

__version__ = "1.1.0"

def create_sprint_structure(sprint_number: int, project_root: Path = None) -> Path:
    """Create complete sprint directory structure

    Args:
        sprint_number: Sprint number (must be positive integer)
        project_root: Project root directory (defaults to current directory)

    Returns:
        Path to created sprint directory

    Raises:
        ValueError: If sprint_number is invalid
        PermissionError: If unable to create directories or write files
    """
    if project_root is None:
        project_root = Path.cwd()

    # Validate sprint number
    if sprint_number < 1:
        raise ValueError(f"Sprint number must be positive (got {sprint_number})")

    # Create sprint directory
    sprint_dir = project_root / "docs" / "sprints" / f"sprint-{sprint_number:02d}"

    # Check if sprint already exists
    if sprint_dir.exists() and any(sprint_dir.iterdir()):
        print(f"⚠️  Warning: Sprint {sprint_number} directory already exists and is not empty")
        response = input("Overwrite existing files? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return sprint_dir

    try:
        sprint_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError as e:
        print(f"❌ Error: Cannot create directory {sprint_dir}")
        print(f"   {e}")
        raise

    # Calculate dates (2 weeks, excluding Wednesdays)
    start_date = datetime.now()
    # Skip to Monday if not already
    while start_date.weekday() != 0:
        start_date += timedelta(days=1)

    end_date = start_date + timedelta(days=14)

    print(f"Creating Sprint {sprint_number} structure...")
    print(f"Sprint Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

    # Create PLAN.md
    plan_content = f"""# Sprint {sprint_number} - Plan

**Sprint Duration**: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}
**Capacity**: 5-7.5 hours (10 working days, Wed excluded)

## Sprint Goal

[One sentence describing the main objective of this sprint]

## User Stories

### Story 1: [Feature Name]
**As a** [role]
**I want** [feature]
**So that** [benefit]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Success Metrics**:
- [How to measure success]

### Story 2: [Feature Name]
[Repeat structure above]

## Technical Specifications

### Database Changes
```prisma
// Schema changes needed
model NewModel {{
  id        String   @id @default(uuid())
  field1    String
  createdAt DateTime @default(now())
}}
```

### API Endpoints

**POST /api/resource**
```typescript
Request: {{
  field1: string,
  field2: number
}}

Response: {{
  id: string,
  field1: string,
  field2: number
}}
```

**GET /api/resource/:id**
```typescript
Response: {{
  id: string,
  field1: string,
  field2: number
}}
```

### Frontend Components
- [ ] ComponentName - Purpose
- [ ] AnotherComponent - Purpose

### Integration Points
- [ ] Service A → Service B
- [ ] Component X → API Y

## Task Breakdown

All tasks sized to 30-60 minutes (1-2 focused sessions)

### Day 1-2: [Phase Name]
- [ ] Task 1 (30 min)
- [ ] Task 2 (60 min - 2 sessions)
- [ ] Task 3 (30 min)

### Day 3-4: [Phase Name]
- [ ] Task 4 (30 min)
- [ ] Task 5 (60 min - 2 sessions)

### Day 5-6: [Phase Name]
- [ ] Task 6 (30 min)
- [ ] Task 7 (30 min)

### Day 7-8: [Phase Name]
- [ ] Task 8 (60 min - 2 sessions)
- [ ] Task 9 (30 min)

### Day 9-10: Testing & Validation
- [ ] Write unit tests (60 min)
- [ ] Write integration tests (60 min)
- [ ] Run full validation checklist (180 min - 6 sessions)
- [ ] Fix validation issues (varies)
- [ ] Update documentation (30 min)

## Testing Requirements

### Unit Tests
- [ ] Test service A
- [ ] Test service B
- [ ] Test utility C
**Target**: 70%+ coverage

### Integration Tests
- [ ] Test API endpoint 1
- [ ] Test API endpoint 2
- [ ] Test workflow integration

### Manual Testing Scenarios
1. Scenario 1: [Description]
   - Steps: [...]
   - Expected: [...]
2. Scenario 2: [Description]
   - Steps: [...]
   - Expected: [...]

## Documentation Requirements

- [ ] API documentation updated
- [ ] README updated (if needed)
- [ ] Code comments for complex logic
- [ ] DECISIONS.md for technical choices
- [ ] CHANGELOG.md with user-facing changes

## Definition of Done

**Feature Complete**:
- [ ] All acceptance criteria met
- [ ] Code compiles without errors
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated

**Quality**:
- [ ] 70%+ test coverage
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Follows code standards

**Integration**:
- [ ] Works with previous sprints
- [ ] No regression in existing features
- [ ] Validation checklist complete

## Dependencies

**Required From Previous Sprints**:
- Sprint X: [Feature needed]
- Sprint Y: [Feature needed]

**Blocks Future Sprints**:
- Sprint Z depends on this

## Out of Scope

Explicitly NOT included in this sprint:
- [ ] Feature A (planned for Sprint X)
- [ ] Feature B (planned for Sprint Y)
- [ ] Optimization C (nice-to-have)

## Risk Assessment

**Technical Risks**:
- Risk 1: [Description] - Mitigation: [Plan]
- Risk 2: [Description] - Mitigation: [Plan]

**Capacity Risks**:
- Risk: Task underestimated - Mitigation: Break into smaller tasks
- Risk: Unexpected complexity - Mitigation: Move to next sprint if needed

## Success Criteria

Sprint is successful if:
1. Primary user story complete and tested
2. All acceptance criteria met
3. No regression in previous features
4. Documentation complete
5. Validation checklist passed

---

**Created**: {datetime.now().strftime('%Y-%m-%d')}
**Status**: Planning
"""

    try:
        (sprint_dir / "PLAN.md").write_text(plan_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing PLAN.md: {e}")
        raise

    # Create PROGRESS.md
    progress_content = f"""# Sprint {sprint_number} - Progress Log

## Summary
**Start Date**: {start_date.strftime('%Y-%m-%d')}
**End Date**: {end_date.strftime('%Y-%m-%d')}
**Total Hours Logged**: 0.0 hours
**Completion**: 0%

## Daily Logs

### Day 1 - {start_date.strftime('%Y-%m-%d')}

**Time**: [start] - [end] = [X.X hours]

**Goals Set**:
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

**Work Completed**:
- ✅ Completed task with details
- ⚠️ Partial task with remaining work
- ❌ Blocked task with reason

**Blockers Encountered**:
- None / [Description of blocker]

**Decisions Made**:
- [Brief decision or link to DECISIONS.md]

**Next Session**:
1. [Specific next task]
2. [Any setup needed]
3. [Expected duration]

**Notes**:
[Any observations, learnings, or reminders for next session]

---

### Day 2 - {(start_date + timedelta(days=1)).strftime('%Y-%m-%d')}

**Time**: [start] - [end] = [X.X hours]

[Use same structure as Day 1]

---

[Add entries for each working day]

## Weekly Summary

### Week 1 ({start_date.strftime('%Y-%m-%d')} to {(start_date + timedelta(days=6)).strftime('%Y-%m-%d')})

**Total Hours**: X.X hours
**Tasks Completed**: X / Y
**Completion Rate**: XX%

**Highlights**:
- Major accomplishment 1
- Major accomplishment 2

**Blockers**:
- Blocker 1 and resolution
- Blocker 2 and status

**Velocity**:
- Estimated: X hours
- Actual: Y hours
- Variance: +/- Z%

---

## Sprint Completion Summary

**Final Stats**:
- Total hours: X.X hours
- Tasks completed: X / Y (Z%)
- Tests written: X
- Coverage achieved: XX%

**What Went Well**:
- Success 1
- Success 2

**What Didn't Go Well**:
- Challenge 1
- Challenge 2

**Lessons Learned**:
- Learning 1
- Learning 2

**Recommendations for Next Sprint**:
- Recommendation 1
- Recommendation 2
"""

    try:
        (sprint_dir / "PROGRESS.md").write_text(progress_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing PROGRESS.md: {e}")
        raise

    # Create DECISIONS.md
    decisions_content = f"""# Sprint {sprint_number} - Technical Decisions

This document records all significant technical decisions made during the sprint with rationale and consequences.

## Decision Template

```markdown
## Decision: [Short Title]

**Date**: YYYY-MM-DD
**Context**: Why we needed to make this decision

**Options Considered**:
1. **Option A**:
   - Pros: [...]
   - Cons: [...]
2. **Option B**:
   - Pros: [...]
   - Cons: [...]

**Decision**: [What we chose]

**Rationale**: [Why we chose it]

**Consequences**:
- Positive: [Benefits]
- Negative: [Tradeoffs]
- Technical Debt: [If any]

**Revisit Trigger**: [What would make us reconsider]
```

---

## Decisions Made

### Decision 1: [Title]

**Date**: {datetime.now().strftime('%Y-%m-%d')}
**Context**: [Why this decision was needed]

**Options Considered**:
1. **Option A**: [Description]
2. **Option B**: [Description]

**Decision**: [Choice made]

**Rationale**: [Reasoning]

**Consequences**:
- Positive: [Benefits]
- Negative: [Tradeoffs]

**Revisit Trigger**: [Condition to reconsider]

---

[Add more decisions as needed]

## Decision Index

Quick reference to all decisions:

1. [Decision 1 Title](#decision-1-title)
2. [Decision 2 Title](#decision-2-title)

"""

    try:
        (sprint_dir / "DECISIONS.md").write_text(decisions_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing DECISIONS.md: {e}")
        raise

    # Create CHANGELOG.md
    changelog_content = f"""# Sprint {sprint_number} - Changelog

User-facing changes and release notes for this sprint.

## Sprint {sprint_number} - {end_date.strftime('%Y-%m-%d')}

### Added
- New feature 1
- New feature 2
- New API endpoint: POST /api/resource

### Changed
- Improved feature X
- Updated component Y behavior

### Fixed
- Bug fix 1
- Bug fix 2
- Resolved TypeScript compilation issues

### Deprecated
- Old API endpoint /api/old-resource (use /api/new-resource)

### Removed
- Unused feature Z

### Security
- Security improvement 1

### Performance
- Optimization 1
- Optimization 2

## Known Issues

- Issue 1: [Description] - Planned fix: Sprint X
- Issue 2: [Description] - Workaround: [...]

## Migration Notes

**For Upgraders**:
```bash
# Run new migrations
npm run prisma:migrate

# Update environment variables
# Add NEW_VAR=value to .env
```

**Breaking Changes**:
- API endpoint X changed from GET to POST
- Response format changed for endpoint Y

---

**Release Date**: {end_date.strftime('%Y-%m-%d')}
**Version**: Sprint {sprint_number}
"""

    try:
        (sprint_dir / "CHANGELOG.md").write_text(changelog_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing CHANGELOG.md: {e}")
        raise

    # Create LEARNINGS.md
    learnings_content = f"""# Sprint {sprint_number} - Learnings

Lessons learned during this sprint for future reference.

## What We Learned

### Technical Learnings

**1. [Technical Lesson Title]**
- **What we learned**: [Description]
- **Why it matters**: [Impact]
- **How to apply**: [Future use]

**2. [Another Technical Lesson]**
- **What we learned**: [Description]
- **Why it matters**: [Impact]
- **How to apply**: [Future use]

### Process Learnings

**1. [Process Lesson Title]**
- **What we learned**: [Description]
- **Impact on workflow**: [How it affected us]
- **Recommendation**: [What to do differently]

**2. [Another Process Lesson]**
- **What we learned**: [Description]
- **Impact on workflow**: [How it affected us]
- **Recommendation**: [What to do differently]

### Estimation Learnings

**Task Estimation Accuracy**:
- Tasks underestimated: [List]
- Tasks overestimated: [List]
- Estimation improvement: [How to estimate better]

**Velocity Insights**:
- Planned: X hours
- Actual: Y hours
- Variance: +/- Z%
- Reason: [Why the variance]

### Scope Management

**Scope Creep Prevention**:
- What worked: [Successful boundary setting]
- What didn't: [Where scope expanded]
- For next sprint: [How to prevent]

## Mistakes Made

**1. [Mistake Title]**
- **What happened**: [Description]
- **Why it happened**: [Root cause]
- **Impact**: [Consequences]
- **How we fixed it**: [Resolution]
- **Prevention**: [How to avoid in future]

**2. [Another Mistake]**
[Same structure]

## Wins & Successes

**1. [Success Title]**
- **What went well**: [Description]
- **Why it worked**: [Factors that contributed]
- **How to replicate**: [Apply to future sprints]

**2. [Another Success]**
[Same structure]

## Tools & Techniques

**Effective Tools**:
- Tool 1: [How it helped]
- Tool 2: [How it helped]

**Ineffective Tools**:
- Tool X: [Why it didn't work]
- Alternative: [What to use instead]

## Recommendations for Future

**For Next Sprint**:
1. [Specific recommendation]
2. [Specific recommendation]
3. [Specific recommendation]

**For Long Term**:
1. [Process improvement]
2. [Technical improvement]
3. [Workflow improvement]

## Action Items

Based on learnings, these actions should be taken:

- [ ] Action 1: [Specific task]
- [ ] Action 2: [Specific task]
- [ ] Action 3: [Specific task]

---

**Created**: {end_date.strftime('%Y-%m-%d')}
**Review**: Incorporate learnings into Sprint {sprint_number + 1} planning
"""

    try:
        (sprint_dir / "LEARNINGS.md").write_text(learnings_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing LEARNINGS.md: {e}")
        raise

    # Create validation checklist
    validation_content = """# Validation Checklist

Use this checklist at the end of the sprint to ensure quality.

## Pre-Validation Setup
- [ ] All code committed and pushed
- [ ] All team members aware of validation
- [ ] Test environment ready

## Step 1: Analyze Current State
- [ ] Run `npm run type-check` (backend)
- [ ] Run `npm run build` (backend)
- [ ] Run `npm run test` (backend)
- [ ] Run `npm run type-check` (frontend)
- [ ] Run `npm run build` (frontend)
- [ ] Run `npm run test` (frontend)
- [ ] Document all errors by category

## Step 2: Review Sprint Objectives
- [ ] Read PLAN.md completely
- [ ] Understand what MUST work
- [ ] Understand what can be broken
- [ ] Review Definition of Done

## Step 3: Fix Errors - Prioritize
- [ ] List all dependency/import errors
- [ ] List all type definition errors
- [ ] List all property/method errors
- [ ] List all logic/business errors
- [ ] Create prioritized fix list

## Step 4: Implement Fixes
- [ ] Fix one file at a time
- [ ] Test compilation after each file
- [ ] Commit when file is clean
- [ ] Repeat until all files clean

## Step 5: Test Compilation
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] No build warnings

## Step 6: Test Application Startup
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] No console errors
- [ ] Database connects

## Step 7: Test Sprint Features
- [ ] Feature 1 works as specified
- [ ] Feature 2 works as specified
- [ ] All acceptance criteria met
- [ ] Manual testing scenarios passed

## Step 8: Test Integration
- [ ] Authentication still works
- [ ] Previous sprint features intact
- [ ] No regression detected
- [ ] Data flows correctly

## Step 9: Run Automated Tests
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] 70%+ code coverage achieved
- [ ] No flaky tests

## Step 10: Document Changes
- [ ] CHANGELOG.md updated
- [ ] PROGRESS.md has final summary
- [ ] Known issues documented
- [ ] Migration notes added (if needed)

## Final Checks
- [ ] All checklist items complete
- [ ] Documentation reviewed
- [ ] Validation results logged
- [ ] Sprint marked as complete

---

**Validation Date**: _______________
**Validated By**: _______________
**Result**: PASS / FAIL
**Notes**: _______________
"""

    try:
        (sprint_dir / "VALIDATION_CHECKLIST.md").write_text(validation_content)
    except (PermissionError, OSError) as e:
        print(f"❌ Error writing VALIDATION_CHECKLIST.md: {e}")
        raise

    print(f"\n✅ Sprint {sprint_number} structure created at: {sprint_dir}")
    print("\nCreated files:")
    print("  - PLAN.md (Sprint plan with DoD)")
    print("  - PROGRESS.md (Daily progress tracking)")
    print("  - DECISIONS.md (Technical decisions log)")
    print("  - CHANGELOG.md (User-facing changes)")
    print("  - LEARNINGS.md (Lessons learned)")
    print("  - VALIDATION_CHECKLIST.md (End of sprint validation)")

    return sprint_dir

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Sprint Template Generator - Corey Dev Framework")
        print(f"Version: {__version__}")
        print("\nUsage: python create_sprint.py <sprint_number> [project_root]")
        print("\nExamples:")
        print("  python create_sprint.py 8")
        print("  python create_sprint.py 8 /path/to/project")
        print("\nOptions:")
        print("  --version    Show version information")
        print("  --help       Show this help message")
        sys.exit(1)

    # Handle version flag
    if sys.argv[1] in ['--version', '-v']:
        print(f"create_sprint.py version {__version__}")
        sys.exit(0)

    # Handle help flag
    if sys.argv[1] in ['--help', '-h']:
        main()  # Show usage

    try:
        sprint_number = int(sys.argv[1])
    except ValueError:
        print("Error: Sprint number must be an integer")
        sys.exit(1)

    project_root = Path(sys.argv[2]) if len(sys.argv) > 2 else Path.cwd()

    if not project_root.exists():
        print(f"Error: Project root does not exist: {project_root}")
        sys.exit(1)

    sprint_dir = create_sprint_structure(sprint_number, project_root)

    print(f"\nNext steps:")
    print(f"1. cd {sprint_dir}")
    print(f"2. Edit PLAN.md with sprint details")
    print(f"3. Start logging progress in PROGRESS.md")
    print(f"4. Document decisions in DECISIONS.md as you go")
    print(f"5. Run validation checklist at sprint end")

if __name__ == "__main__":
    main()
