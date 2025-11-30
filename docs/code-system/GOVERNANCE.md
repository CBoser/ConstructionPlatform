# Code System Governance

**Document**: Sprint 2 - Code System Review
**Date**: 2025-11-29
**Version**: 1.0

---

## Purpose

This document establishes rules and procedures for managing the MindFlow Platform material coding system. Governance ensures code consistency, prevents conflicts, and maintains system integrity.

---

## Core Principles

### 1. Uniqueness
Each material has exactly ONE code. Duplicate codes are never permitted.

### 2. Immutability
Once assigned, a material code should not change. If a code must change, the old code is retired (not reused) and a new code is assigned.

### 3. Consistency
All codes follow the same format: `[TRADE]-[CATEGORY]-[DETAILS]`

### 4. Readability
Codes should be self-documenting. A user should understand the material type from the code without looking up a reference.

### 5. Extensibility
The system allows adding new trades, categories, and detail formats without breaking existing codes.

---

## Code Structure Rules

### Rule 1: Trade Codes (Required)

| Constraint | Rule |
|------------|------|
| Length | 3-4 characters |
| Characters | Uppercase letters only (A-Z) |
| Reserved | Cannot use single-letter codes |
| New trades | Require governance approval |

**Current Trade Codes:**

| Code | Trade | Status |
|------|-------|--------|
| FRM | Framing | Active |
| CONC | Concrete | Active |
| ROOF | Roofing | Active |
| SIDE | Siding | Active |
| INSL | Insulation | Active |
| DRYW | Drywall | Active |
| ELEC | Electrical | Active |
| PLMB | Plumbing | Active |
| HVAC | HVAC | Active |
| TRIM | Trim/Finish | Active |
| HDWR | Hardware | Active |
| SITE | Site Work | Active |
| MISC | Miscellaneous | Active |

### Rule 2: Category Codes (Required)

| Constraint | Rule |
|------------|------|
| Length | 2-4 characters |
| Characters | Uppercase letters only (A-Z) |
| Scope | Unique within a trade (same category code can exist in different trades) |
| New categories | Require governance approval |

### Rule 3: Detail Codes (Optional)

| Constraint | Rule |
|------------|------|
| Length | 1-10 characters per segment |
| Characters | Uppercase letters, numbers, forward slash, period, hyphen |
| Segments | Separated by hyphens |
| Maximum | 4 detail segments |

### Rule 4: Overall Code

| Constraint | Rule |
|------------|------|
| Maximum length | 25 characters |
| Separator | Single hyphen (-) between components |
| Case | Stored and displayed as UPPERCASE |
| Special characters | Only hyphen, forward slash, period allowed |

---

## Prohibited Patterns

### Never Use

| Pattern | Reason |
|---------|--------|
| Lowercase | Inconsistent with system standard |
| Underscores | Conflicts with some systems |
| Spaces | Not URL-safe |
| Unicode | ASCII only for compatibility |
| Leading/trailing hyphens | Invalid format |
| Double hyphens | Parsing issues |

### Examples

| Code | Valid | Reason |
|------|-------|--------|
| `FRM-LUM-2X4-SPF-8` | ✓ | Standard format |
| `ROOF-SHG-ARCH-30Y` | ✓ | Standard format |
| `frm-lum-2x4` | ✗ | Lowercase |
| `FRM_LUM_2X4` | ✗ | Underscores |
| `FRM--LUM` | ✗ | Double hyphen |
| `-FRM-LUM` | ✗ | Leading hyphen |
| `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | ✗ | Exceeds 25 chars |

---

## Adding New Codes

### Process for New Materials

1. **Check existing** - Search for similar materials
2. **Determine trade** - Identify correct trade category
3. **Generate code** - Use standard format
4. **Validate** - Run validation check
5. **Submit** - Add to system

**No approval required** for new materials using existing trades/categories.

### Process for New Categories

1. **Document need** - Explain why existing categories insufficient
2. **Propose code** - Suggest 2-4 letter category code
3. **Submit request** - File governance request
4. **Review** - Category added to approved list
5. **Implement** - Update reference documentation

### Process for New Trades

1. **Business case** - Justify new trade requirement
2. **Impact analysis** - Review overlap with existing trades
3. **Propose code** - Suggest 3-4 letter trade code
4. **Executive approval** - Requires product owner sign-off
5. **Implement** - Update schema, API, and UI

---

## Code Lifecycle

### States

| State | Description |
|-------|-------------|
| Active | In use, can be assigned to materials |
| Deprecated | Being phased out, no new assignments |
| Retired | No longer used, code is reserved (cannot be reused) |

### Deprecation Process

1. Mark code as deprecated
2. Notify users of replacement code
3. Set migration deadline (minimum 90 days)
4. After deadline, retire code
5. Retired codes are never reused

### Code Changes (Rare)

If a material code must change (e.g., major restructuring):

1. Create new code
2. Map old code to new code
3. Maintain alias for transition period
4. After transition, retire old code
5. Update all references in documentation

---

## Validation Rules

### System Validation

The system automatically validates:

```javascript
function validateCode(code) {
  // Format check
  const pattern = /^[A-Z]{3,4}-[A-Z]{2,4}(-[A-Z0-9\/.-]+){0,4}$/;
  if (!pattern.test(code)) return false;

  // Length check
  if (code.length > 25) return false;

  // Trade code check
  const trade = code.split('-')[0];
  if (!VALID_TRADES.includes(trade)) return false;

  return true;
}
```

### Manual Validation

Before adding codes, verify:

- [ ] Code follows standard format
- [ ] Trade code exists
- [ ] No duplicate exists
- [ ] Code is readable/understandable
- [ ] Related materials use consistent patterns

---

## Role Responsibilities

### All Users

- Follow code format when creating materials
- Report duplicate or inconsistent codes
- Do not modify existing codes without approval

### Estimators

- Create new material codes for routine items
- Use existing patterns for consistency
- Escalate governance questions to admin

### Administrators

- Approve new category requests
- Maintain code reference documentation
- Resolve code conflicts
- Deprecate outdated codes

### Product Owner

- Approve new trade codes
- Set governance policy
- Make final decisions on disputes

---

## Audit and Compliance

### Regular Audits

| Audit | Frequency | Scope |
|-------|-----------|-------|
| Duplicate check | Weekly | All active codes |
| Format validation | Weekly | Recently added codes |
| Deprecation review | Monthly | Deprecated codes |
| Full code review | Quarterly | All codes |

### Reporting

Monthly governance report includes:
- New codes added
- Codes deprecated
- Validation failures
- Governance requests

---

## Exception Handling

### Valid Exceptions

| Exception | When Allowed |
|-----------|--------------|
| Longer code | Complex item requires clarity |
| Non-standard characters | Vendor requirement (documented) |
| Legacy code preservation | Migration from existing system |

### Exception Process

1. Document the exception need
2. Submit to administrator
3. Approval recorded with rationale
4. Exception reviewed annually

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-29 | Initial governance document |

---

## References

- [DECISION.md](./DECISION.md) - Code system decision
- [HYBRID_SYSTEM_DESIGN.md](./HYBRID_SYSTEM_DESIGN.md) - Code structure details
- [SAMPLE_CODES.md](./SAMPLE_CODES.md) - Example codes
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical implementation
