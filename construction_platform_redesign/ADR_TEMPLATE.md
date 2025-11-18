# ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed / Accepted / Implemented / Deprecated / Superseded by ADR-YYY  
**Context:** [Phase or feature this relates to]  

---

## Executive Summary

This decision addresses [problem] by choosing [solution]. Key impacts:
- ✅ [Major benefit 1]
- ✅ [Major benefit 2]
- ⚠️ [Trade-off or consideration]

**Recommendation:** [Proceed / Hold / Reconsider] based on [reasoning]

---

## Context

### Problem Statement
[What problem are we solving? What forces us to make this decision?]

### Background
[What's the situation? What led to this decision point?]

### Stakeholders
| Stakeholder | Interest | Impact |
|-------------|----------|--------|
| [Role/person] | [Why they care] | High/Med/Low |

### Constraints
- [Technical constraint]
- [Business constraint]
- [Time/resource constraint]

---

## Decision

### What We've Decided
[Clear, specific statement of the decision]

**In concrete terms:**
- We will [specific action]
- We will use [specific technology/approach]
- We will follow [specific pattern]

### Implementation Approach
[How will this be implemented? What are the steps?]

1. **Phase 1:** [Description]
2. **Phase 2:** [Description]
3. **Phase 3:** [Description]

---

## Rationale

### Why This Decision?

**Primary Reasons:**
1. **[Reason 1]**
   - Evidence: [Data, experience, or analysis supporting this]
   - Weight: High/Med/Low priority

2. **[Reason 2]**
   - Evidence: [Data, experience, or analysis supporting this]
   - Weight: High/Med/Low priority

3. **[Reason 3]**
   - Evidence: [Data, experience, or analysis supporting this]
   - Weight: High/Med/Low priority

### Supporting Data

| Metric | Before | After | Benefit |
|--------|--------|-------|---------|
| [Metric 1] | X | Y | +Z% |
| [Metric 2] | X | Y | +Z% |

---

## Alternatives Considered

### Alternative 1: [Name]

**Description:** [What this alternative would look like]

**Pros:**
- ✅ [Advantage]
- ✅ [Advantage]

**Cons:**
- ❌ [Disadvantage]
- ❌ [Disadvantage]

**Why Rejected:** [Specific reason this wasn't chosen]

---

### Alternative 2: [Name]

**Description:** [What this alternative would look like]

**Pros:**
- ✅ [Advantage]
- ✅ [Advantage]

**Cons:**
- ❌ [Disadvantage]
- ❌ [Disadvantage]

**Why Rejected:** [Specific reason this wasn't chosen]

---

### Alternative 3: Do Nothing

**Impact of No Decision:**
- ⚠️ [What happens if we don't decide]
- ⚠️ [Problems that continue]
- ⚠️ [Opportunities lost]

**Why This Isn't Acceptable:** [Why status quo doesn't work]

---

## Comparison Matrix

| Criteria | Weight | Chosen Solution | Alt 1 | Alt 2 | Do Nothing |
|----------|--------|-----------------|-------|-------|------------|
| [Criterion 1] | High | 9/10 | 6/10 | 4/10 | 2/10 |
| [Criterion 2] | Med | 8/10 | 7/10 | 9/10 | 3/10 |
| [Criterion 3] | High | 9/10 | 5/10 | 6/10 | 4/10 |
| **Weighted Total** | | **XX** | **YY** | **ZZ** | **WW** |

---

## Consequences

### Positive Consequences ✅

| Benefit | Impact | Timeline |
|---------|--------|----------|
| [Benefit 1] | High/Med/Low | Immediate/Short/Long-term |
| [Benefit 2] | High/Med/Low | Immediate/Short/Long-term |
| [Benefit 3] | High/Med/Low | Immediate/Short/Long-term |

### Negative Consequences ⚠️

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| [Trade-off 1] | High/Med/Low | [How we'll handle it] |
| [Trade-off 2] | High/Med/Low | [How we'll handle it] |

### Neutral Consequences ℹ️

| Change | Impact | Note |
|--------|--------|------|
| [Change 1] | Neutral | [Context] |

---

## Risks & Mitigations

### High Priority Risks

**Risk 1: [Risk Description]**
- **Probability:** High / Medium / Low
- **Impact:** High / Medium / Low
- **Risk Level:** Critical / High / Medium / Low
- **Mitigation:** [How we'll prevent/handle this]
- **Contingency:** [Backup plan if mitigation fails]

**Risk 2: [Risk Description]**
- **Probability:** High / Medium / Low
- **Impact:** High / Medium / Low
- **Risk Level:** Critical / High / Medium / Low
- **Mitigation:** [How we'll prevent/handle this]
- **Contingency:** [Backup plan if mitigation fails]

### Medium/Low Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [How handled] |

---

## Implementation Details

### Technical Approach

**Architecture Changes:**
- [What components change]
- [What gets added/removed]
- [Integration points]

**Code Changes:**
- File: [filename] - [change description]
- File: [filename] - [change description]

**Database Changes:**
- [Schema modifications]
- [Migration strategy]
- [Backward compatibility]

### Migration Strategy

**Phase 1: Preparation**
1. [Step 1]
2. [Step 2]

**Phase 2: Implementation**
1. [Step 1]
2. [Step 2]

**Phase 3: Validation**
1. [Step 1]
2. [Step 2]

**Rollback Plan:**
- [How to revert if needed]
- [Data backup strategy]
- [Timeline to revert]

---

## Dependencies

### Required Before Implementation

| Dependency | Owner | Status | ETA |
|------------|-------|--------|-----|
| [Dependency 1] | [Who] | ✅/⚠️/❌ | YYYY-MM-DD |
| [Dependency 2] | [Who] | ✅/⚠️/❌ | YYYY-MM-DD |

### Blocked By This Decision

| Item | Type | Impact | Note |
|------|------|--------|------|
| [Feature/decision] | Feature/Decision/Task | High/Med/Low | [Context] |

---

## Testing Strategy

### Unit Tests
- [What needs unit testing]
- Coverage target: XX%

### Integration Tests
- [What integration scenarios to test]

### Validation Criteria

| Criterion | Method | Expected Result |
|-----------|--------|-----------------|
| [Test 1] | [How to test] | [Pass condition] |
| [Test 2] | [How to test] | [Pass condition] |

---

## Documentation Requirements

### Must Document

- [ ] Architecture diagrams
- [ ] API changes (if applicable)
- [ ] Configuration changes
- [ ] Migration guide
- [ ] User-facing changes (if applicable)

### Files to Update

| File | Update Needed | Owner |
|------|---------------|-------|
| [filename] | [What to update] | [Who] |

---

## Review & Approval

### Review Checklist

- [ ] Technical feasibility validated
- [ ] Alternatives thoroughly considered
- [ ] Risks identified and mitigated
- [ ] Implementation plan clear
- [ ] Rollback plan defined
- [ ] Documentation plan defined

### Approval

| Stakeholder | Role | Decision | Date | Notes |
|-------------|------|----------|------|-------|
| [Name] | [Role] | Approve/Reject/Defer | YYYY-MM-DD | [Comments] |

---

## Timeline

| Milestone | Target Date | Status | Notes |
|-----------|-------------|--------|-------|
| Decision Approved | YYYY-MM-DD | ✅/⚠️/❌ | |
| Implementation Start | YYYY-MM-DD | ⏳ | |
| Implementation Complete | YYYY-MM-DD | ⏳ | |
| Review & Validate | YYYY-MM-DD | ⏳ | |

---

## Success Criteria

### Definition of Done

- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]

### Metrics to Track

| Metric | Baseline | Target | Actual | Status |
|--------|----------|--------|--------|--------|
| [Metric 1] | X | Y | Z | ✅/⚠️/❌ |
| [Metric 2] | X | Y | Z | ✅/⚠️/❌ |

---

## Review Schedule

**Next Review:** YYYY-MM-DD (or after [milestone])

**Review Questions:**
1. Is the decision still valid given current context?
2. Have we achieved expected benefits?
3. Did risks materialize? How handled?
4. Should we adjust course?

**Review Owner:** [Who will conduct review]

---

## References

### Related Decisions
- [ADR-XXX: Related decision](./XXX-title.md)
- [ADR-YYY: Related decision](./YYY-title.md)

### Documentation
- [BUILD_SCHEDULE.md](../../BUILD_SCHEDULE.md)
- [Technical documentation]
- [Design documents]

### External Resources
- [Link to research/articles]
- [Link to documentation]

---

## Decision Log

| Date | Action | By | Notes |
|------|--------|-----|-------|
| YYYY-MM-DD | Created | [Author] | Initial draft |
| YYYY-MM-DD | Reviewed | [Reviewer] | [Feedback] |
| YYYY-MM-DD | Approved | [Approver] | Moved to Accepted |
| YYYY-MM-DD | Implemented | [Developer] | Code complete |

---

## Notes

_Use this space for additional context, sketches, or thoughts:_

```
[Freeform notes here]
```

---

**Template Version:** 1.0  
**Created:** 2025-11-18  
**Style:** Matches UNIFIED_CODE_SYSTEM_DECISIONS.md format  
**Purpose:** Architecture Decision Records for MindFlow Platform
