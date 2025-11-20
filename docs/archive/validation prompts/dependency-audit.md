# Dependency Audit
## Monthly Dependency Review

**Purpose**: Review and update dependencies safely

**Time Required**: 15 minutes

**Frequency**: Monthly

---

## 📋 Dependency Audit Prompt

```
Review all dependencies for updates and issues.

## CURRENT STATE
```bash
npm outdated
npm audit
npm list --depth=0
```

## ANALYSIS

### Security Vulnerabilities
- Critical: [count]
- High: [count]
- Fixes available: [list]

### Outdated Packages
- Major updates: [list]
- Minor updates: [list]
- Patch updates: [list]

### Unused Dependencies
```bash
npx depcheck
```

## UPDATE STRATEGY

### Safe Updates (do now)
- Patch versions: `npm update`
- Security fixes: [commands]

### Risky Updates (test first)
- Major versions: [list with breaking changes]
- Framework updates: [plan]

## OUTPUT
- Update commands
- Testing checklist
- Rollback plan
```

---

**Version**: 1.0  
**Time**: 15 minutes
