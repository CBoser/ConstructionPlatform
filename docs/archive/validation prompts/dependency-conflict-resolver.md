# Dependency Conflict Resolver
## Fix npm Install Failures

**Purpose**: Resolve npm dependency conflicts

**Time Required**: 10 minutes

**Frequency**: When npm install fails

---

## 📋 Dependency Conflict Prompt

```
Diagnose and resolve npm install failures.

## ERROR CAPTURE

```bash
npm install 2>&1 | tee install-error.log
```

Paste error output here: [error]

## CONFLICT DETECTION

```bash
npm ls 2>&1 | grep -i "invalid\|missing\|peer"
```

## ANALYSIS

For each conflict:
1. Which packages conflict?
2. What versions needed?
3. Compatible version exists?
4. Can upgrade/downgrade?

## RESOLUTION STRATEGIES

Try in order:
1. **Update all**: `npm update`
2. **Force versions**: Edit package.json
3. **Use overrides**: Add resolutions
4. **Alternative package**: Replace
5. **Fork & patch**: Last resort

## OUTPUT

Dependency Conflict Report:
- Conflict: [description]
- Resolution: [specific commands]
- Verification: [test commands]
```

---

**Version**: 1.0  
**Time**: 10 minutes
