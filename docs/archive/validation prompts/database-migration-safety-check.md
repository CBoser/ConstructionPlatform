# Database Migration Safety Check
## Assess Migration Risks

**Purpose**: Evaluate migration safety before running

**Time Required**: 15 minutes

**Frequency**: Before running any migration

---

## 📋 Migration Safety Prompt

```
Analyze this database migration for risks.

Migration file: [paste migration SQL/code]

## DESTRUCTIVE OPERATIONS CHECK

❌ Dropping columns with data?
❌ Changing column types (data loss)?
❌ Adding NOT NULL without default?
❌ Removing tables with data?

## DATA PRESERVATION

- [ ] Data backed up?
- [ ] Migration handles existing data?
- [ ] Type conversion tested?
- [ ] Rollback plan documented?

## PERFORMANCE IMPACT

⚠️ Adding index on large table?
⚠️ Changing column type (rewrite)?
⚠️ Adding foreign key?

## TESTING CHECKLIST

- [ ] Tested on prod data copy
- [ ] Rollback tested
- [ ] Data integrity verified
- [ ] Performance tested

## SAFETY SCORE

🟢 SAFE - No data loss risk
🟡 CAUTION - Test thoroughly
🔴 DANGER - Maintenance window needed

## OUTPUT

1. Safety score + explanation
2. Pre-migration checklist
3. Rollback SQL
4. Estimated downtime
```

---

**Version**: 1.0  
**Time**: 15 minutes
