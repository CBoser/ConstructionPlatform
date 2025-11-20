# Prisma Diagnostic Batch
## Comprehensive Prisma ORM Troubleshooting

**Purpose**: Systematically diagnose and fix Prisma-related issues

**Time Required**: 5-10 minutes

**Frequency**: When encountering Prisma errors

---

## 🎯 When to Use This Prompt

### Use For:
- ✅ Prisma Client errors
- ✅ Migration failures  
- ✅ Schema validation errors
- ✅ Database connection issues
- ✅ Type generation problems
- ✅ Query execution failures

### Especially Important For:
- 🔥 "Prisma Client not found" errors
- 🔥 Migration status issues
- 🔥 Schema sync problems
- 🔥 Connection string errors
- 🔥 Type mismatches

---

## 📋 The Prisma Diagnostic Prompt

**Copy everything below and paste into Claude.ai:**

```
Prisma troubleshooting needed. Run complete diagnostic.

## ERROR CONTEXT
Error message: [paste full error if any]
What I was doing: [describe action - migration, query, etc.]
Database type: [PostgreSQL/MySQL/SQLite]
Prisma version: [run: npm list prisma]

## DIAGNOSTIC SEQUENCE

### 1. SCHEMA VALIDATION
```bash
npx prisma validate
```

Check for:
- [ ] Schema syntax is correct
- [ ] All relations are properly defined
- [ ] No duplicate model names
- [ ] Provider matches database type
- [ ] All field types are valid

**Expected Output:** "The schema is valid ✓"

### 2. MIGRATION STATUS
```bash
npx prisma migrate status
```

Check for:
- [ ] All migrations applied successfully
- [ ] No pending migrations
- [ ] No failed migrations  
- [ ] Migration history is intact
- [ ] Database schema matches migrations

**Expected Output:** "Database schema is up to date!"

### 3. CLIENT GENERATION
```bash
npx prisma generate
```

Check for:
- [ ] Client generates without errors
- [ ] No type generation errors
- [ ] Output directory is correct (node_modules/@prisma/client)
- [ ] Types match schema definitions
- [ ] No stale generated code

**Expected Output:** "Generated Prisma Client"

### 4. DATABASE CONNECTIVITY
```bash
npx prisma db pull --force
```

Check for:
- [ ] Can connect to database
- [ ] Connection string is valid
- [ ] Database exists
- [ ] Credentials are correct
- [ ] Network access is allowed

**Expected Output:** "Introspected X models..."

### 5. VERSION CONSISTENCY
```bash
npm list prisma
npm list @prisma/client
```

Check for:
- [ ] prisma and @prisma/client versions match
- [ ] No conflicting global installations
- [ ] Versions are compatible with Node version
- [ ] No peer dependency warnings

**Expected Output:** Both should show same version

### 6. COMMON ISSUES CHECK

#### Environment Variables
```bash
cat .env | grep DATABASE_URL
```
- [ ] DATABASE_URL is defined
- [ ] Connection string format is correct
- [ ] No extra spaces or quotes
- [ ] Port number is correct

#### Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```
- [ ] Clean reinstall if issues persist
- [ ] Verify all dependencies installed
- [ ] Check for binary compatibility

#### Schema File Location
```bash
find . -name "schema.prisma"
```
- [ ] Schema file exists in expected location
- [ ] Only one schema file in project
- [ ] Path matches prisma.schema in package.json

## OUTPUT FORMAT

For each check, provide:
✅ PASS - [Brief confirmation]
❌ FAIL - [Specific issue found] → [Exact fix command]
⚠️ WARNING - [Potential issue] → [Recommendation]
ℹ️ INFO - [Relevant information]

## RESOLUTION STEPS

If issues found, provide:
1. Root cause explanation
2. Step-by-step fix commands
3. Verification commands to run after fix
4. Prevention tips for future
```

---

## ⚡ Quick Diagnostic Mode (2 minutes)

**For common issues, use this abbreviated version:**

```
Quick Prisma check:

1. Validate: `npx prisma validate`
2. Generate: `npx prisma generate`
3. Status: `npx prisma migrate status`

Report:
✅ What passed
❌ What failed with fix command
```

---

## 🔧 Common Prisma Issues & Fixes

### Issue 1: "Prisma Client not found"

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
```

**Fix:**
```bash
npm install @prisma/client
npx prisma generate
```

**Verify:**
```bash
npm list @prisma/client
# Should show installed version
```

---

### Issue 2: Migration Failed

**Symptoms:**
```
Error: P3005: The database schema is not empty
```

**Fix (Development Only):**
```bash
# Check what's wrong
npx prisma migrate status

# Option 1: Reset database (DELETES ALL DATA!)
npx prisma migrate reset

# Option 2: Create new migration
npx prisma migrate dev --name fix_issue

# Option 3: Mark as applied (if already applied manually)
npx prisma migrate resolve --applied [migration_name]
```

**Verify:**
```bash
npx prisma migrate status
# Should show all migrations applied
```

---

### Issue 3: Schema Validation Failed

**Symptoms:**
```
Error: Schema parsing error
```

**Common Causes & Fixes:**
```prisma
// ❌ Missing @id
model User {
  name String
}

// ✅ Fixed
model User {
  id   Int    @id @default(autoincrement())
  name String
}

// ❌ Invalid relation
model Post {
  author User
}

// ✅ Fixed
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}

// ❌ Typo in field type
model User {
  email Srting  // Should be String
}
```

**Fix:**
```bash
npx prisma validate
# Read error message carefully
# Fix syntax in schema.prisma
npx prisma validate
# Verify fixed
```

---

### Issue 4: Connection Errors

**Symptoms:**
```
Error: Can't reach database server at localhost:5432
```

**Diagnostic:**
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Check .env file
cat .env | grep DATABASE_URL

# Test connection
npx prisma db pull
```

**Common Fixes:**

1. **Database not running:**
```bash
# PostgreSQL
sudo service postgresql start

# MySQL
sudo service mysql start

# Docker
docker-compose up -d
```

2. **Wrong connection string:**
```bash
# PostgreSQL format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# MySQL format  
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# SQLite format
DATABASE_URL="file:./dev.db"
```

3. **Credentials wrong:**
```bash
# Test with psql (PostgreSQL)
psql -U username -d database -h localhost

# Test with mysql (MySQL)
mysql -u username -p -h localhost database
```

---

### Issue 5: Type Generation Errors

**Symptoms:**
```
Error: Type 'X' is not assignable to type 'Y'
```

**Fix:**
```bash
# Delete generated client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Regenerate
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Verify:**
```bash
npx tsc --noEmit
# Should compile without errors
```

---

### Issue 6: Version Mismatch

**Symptoms:**
```
Warning: Different versions of prisma and @prisma/client
```

**Fix:**
```bash
# Check versions
npm list prisma @prisma/client

# Update both to latest
npm install prisma@latest @prisma/client@latest

# Or update to specific version
npm install prisma@5.0.0 @prisma/client@5.0.0

# Regenerate
npx prisma generate
```

**Verify:**
```bash
npm list prisma @prisma/client
# Both should show same version
```

---

## 📊 Prisma Error Code Reference

| Error Code | Meaning | Common Fix |
|------------|---------|------------|
| P1000 | Authentication failed | Check credentials |
| P1001 | Can't reach database | Check if DB is running |
| P1002 | Database server timeout | Check network/firewall |
| P1003 | Database doesn't exist | Create database |
| P2002 | Unique constraint failed | Check for duplicate data |
| P2003 | Foreign key constraint failed | Check related records exist |
| P2025 | Record not found | Add existence check |
| P3005 | Database not empty | Use migrate reset (dev) or resolve |

---

## 💡 Pro Tips

### Tip 1: Always Generate After Schema Changes
```bash
# Make this a habit
npx prisma generate
```

### Tip 2: Use Prisma Studio for Data Inspection
```bash
npx prisma studio
# Opens browser interface to view/edit data
```

### Tip 3: Keep Versions in Sync
```bash
# Check versions match
npm list prisma @prisma/client

# Update both together
npm install prisma@latest @prisma/client@latest
```

### Tip 4: Use --schema Flag for Non-Standard Locations
```bash
npx prisma generate --schema=./database/schema.prisma
npx prisma migrate dev --schema=./database/schema.prisma
```

### Tip 5: Safe Production Migrations
```bash
# Generate migration without applying
npx prisma migrate dev --create-only

# Review the SQL in migrations folder

# Apply in production
npx prisma migrate deploy
```

---

## 🎓 Prisma Best Practices

### Development Workflow:
```bash
1. Edit schema.prisma
2. npx prisma validate (check syntax)
3. npx prisma generate (update types)
4. npx prisma migrate dev (create migration)
5. Test your code
6. Commit schema + migrations
```

### Production Deployment:
```bash
1. npx prisma migrate deploy (apply migrations)
2. npx prisma generate (ensure client is up to date)
3. Start application
```

### When Things Break:
```bash
1. npx prisma validate
2. npx prisma migrate status
3. npx prisma generate
4. Check .env file
5. Verify DB is running
```

---

## 🆘 Emergency Troubleshooting

### Nuclear Option (Development Only!)
```bash
# ⚠️ THIS DELETES ALL DATA ⚠️
# Only use in development!

# Reset everything
npx prisma migrate reset

# This will:
# - Drop database
# - Create database
# - Apply all migrations
# - Run seed script (if configured)

# Then regenerate
npx prisma generate

# Verify
npx prisma migrate status
npm run dev
```

---

## 📈 Prevention Checklist

**Before Committing:**
- [ ] Run `npx prisma validate`
- [ ] Run `npx prisma generate`
- [ ] Test migrations work
- [ ] Commit schema.prisma and migrations/ folder together
- [ ] Document breaking changes

**Before Deploying:**
- [ ] Test migrations on copy of production data
- [ ] Have rollback plan ready
- [ ] Check migration affects
- [ ] Schedule maintenance window if needed
- [ ] Monitor after deployment

---

## 🔄 Related Prompts

- **For migrations specifically:** Use database-migration-safety-check.md
- **For API errors:** Use error-message-decoder.md
- **Before committing:** Use implementation-validation-checklist.md

---

## 💬 Example Troubleshooting Session

### Scenario: Can't connect to database

```
You: Getting "Can't reach database server" error. Running diagnostic.

[Paste Prisma diagnostic prompt]

Claude:

## DIAGNOSTIC RESULTS

### 1. SCHEMA VALIDATION
✅ PASS - Schema syntax is valid

### 2. MIGRATION STATUS
⚠️ WARNING - Cannot connect to check migration status

### 3. CLIENT GENERATION
✅ PASS - Client generated successfully

### 4. DATABASE CONNECTIVITY
❌ FAIL - Cannot connect to database at localhost:5432

Root cause: Database connection refused

### 5. VERSION CONSISTENCY
✅ PASS - prisma@5.0.0 and @prisma/client@5.0.0 match

### 6. COMMON ISSUES CHECK
❌ FAIL - DATABASE_URL found but connection refused

## RESOLUTION

The database server is not running. Fix:

1. Start PostgreSQL:
```bash
sudo service postgresql start
```

2. Verify it's running:
```bash
sudo service postgresql status
```

3. Test connection:
```bash
npx prisma db pull
```

4. If successful, run your app:
```bash
npm run dev
```

## PREVENTION
Add to startup script:
```bash
# Check if PostgreSQL is running before starting app
if ! pgrep -x "postgres" > /dev/null; then
    sudo service postgresql start
fi
```
```

---

## 🎯 Success Criteria

**Your Prisma setup is healthy when:**
- ✅ `npx prisma validate` shows no errors
- ✅ `npx prisma migrate status` shows all applied
- ✅ `npx prisma generate` completes successfully
- ✅ `npx prisma db pull` connects without errors
- ✅ Application runs and queries work
- ✅ Type checking passes in TypeScript

---

**Remember**: Most Prisma issues are simple:
1. Database not running → Start it
2. Client not generated → Run generate
3. Versions mismatched → Update both
4. Schema invalid → Check syntax

**This diagnostic catches 80%+ of Prisma issues in 5 minutes!**

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Average Resolution Time**: 5 minutes  
**Success Rate**: 80%+ for common issues
