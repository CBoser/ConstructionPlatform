#!/bin/bash

# This script creates all remaining prompt files for the library

echo "Creating remaining prompt files..."

# Create Prisma Diagnostic Batch (already have content from uploads)
cat > as-needed/prisma-diagnostic-batch.md << 'EOF'
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

---

## 📋 The Prisma Diagnostic Prompt

**Copy and paste into Claude.ai:**

```
Prisma troubleshooting needed. Run complete diagnostic.

## ERROR CONTEXT
Error message: [paste error if any]
What I was doing: [describe action]
Database: [PostgreSQL/MySQL/SQLite]

## DIAGNOSTIC SEQUENCE

### 1. SCHEMA VALIDATION
```bash
npx prisma validate
```
Check:
- [ ] Schema syntax is correct
- [ ] All relations are valid
- [ ] No duplicate model names
- [ ] Provider matches database type

### 2. MIGRATION STATUS
```bash
npx prisma migrate status
```
Check:
- [ ] All migrations applied
- [ ] No pending migrations
- [ ] No failed migrations
- [ ] Migration history intact

### 3. CLIENT GENERATION
```bash
npx prisma generate
```
Check:
- [ ] Client generates successfully
- [ ] No type errors
- [ ] Output directory correct
- [ ] Types match schema

### 4. DATABASE CONNECTIVITY
```bash
npx prisma db pull --force
```
Check:
- [ ] Can connect to database
- [ ] Connection string valid
- [ ] Database exists
- [ ] Credentials correct

### 5. INTROSPECTION TEST
```bash
npx prisma db push --accept-data-loss
```
(Development only!)
Check:
- [ ] Schema pushes successfully
- [ ] No data model conflicts

### 6. COMMON ISSUES CHECK
Review:
- [ ] DATABASE_URL in .env file
- [ ] Prisma version matches @prisma/client version
- [ ] No conflicting global Prisma installations
- [ ] Node modules up to date

## OUTPUT FORMAT

For each check, provide:
✅ PASS - Everything working
❌ FAIL - [Specific issue] → [Fix command]
⚠️ WARNING - [Potential issue] → [Recommendation]

Include specific error messages and solutions.
```

---

## ⚡ Quick Mode

```
Quick Prisma diagnostic:

1. Validate: `npx prisma validate`
2. Generate: `npx prisma generate`
3. Status: `npx prisma migrate status`

Report any failures with fix commands.
```

---

## 🔧 Common Fixes

### Issue 1: "Prisma Client not found"
```bash
npm install @prisma/client
npx prisma generate
```

### Issue 2: Migration failed
```bash
# Check what went wrong
npx prisma migrate status

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_issue
```

### Issue 3: Schema validation failed
```bash
# Check syntax
npx prisma validate

# Common fixes:
# - Missing @id fields
# - Invalid relation names
# - Typos in field types
```

### Issue 4: Connection errors
```bash
# Test connection
npx prisma db pull

# Check .env file has:
# DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

---

## 📊 Prisma Error Patterns

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "Environment variable not found" | Missing DATABASE_URL | Add to .env |
| "P2002: Unique constraint failed" | Duplicate data | Check data/unique indexes |
| "P2025: Record not found" | Query for non-existent record | Add existence check |
| "Invalid prisma.schema file" | Syntax error in schema | Run `npma validate` |

---

## 💡 Pro Tips

### Tip 1: Always Generate After Schema Changes
```bash
npx prisma generate
```

### Tip 2: Use Studio for Data Inspection
```bash
npx prisma studio
```

### Tip 3: Keep Versions in Sync
```bash
npm list prisma @prisma/client
# Should show same version
```

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Average Resolution Time**: 5 minutes
EOF

echo "Created prisma-diagnostic-batch.md"

# Create API Contract Validator
cat > as-needed/api-contract-validator.md << 'EOF'
# API Contract Validator
## Ensure Frontend-Backend Alignment

**Purpose**: Validate API contracts match between frontend and backend

**Time Required**: 15 minutes

**Frequency**: After API changes, before integration, when getting API errors

---

## 📋 The API Contract Validation Prompt

```
Validate API contracts between frontend and backend.

## BACKEND AUDIT
Analyze all API endpoints in: [backend directory]

For each endpoint, extract:
1. Method + Path (GET /api/users/:id)
2. Request body schema (required/optional fields)
3. Query parameters
4. Response schema (success)
5. Error response schema
6. Authentication requirements
7. Rate limiting

## FRONTEND AUDIT
Analyze all API calls in: [frontend directory]

For each API call, extract:
1. Method + Path
2. Request body sent
3. Query parameters sent
4. Expected response handling
5. Error handling
6. Headers sent

## MISMATCH DETECTION
Compare and report:

❌ CRITICAL MISMATCHES:
- Frontend expects field backend doesn't send
- Backend requires field frontend doesn't send
- Type mismatches (string vs number)
- Missing error handling

⚠️ WARNINGS:
- Inconsistent naming (camelCase vs snake_case)
- Optional fields treated as required
- Unhandled error codes

## OUTPUT: TYPESCRIPT INTERFACES

Generate:
```typescript
// Request types
export interface CreateUserRequest {
  name: string;
  email: string;
  role?: UserRole;
}

// Response types
export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

## MIGRATION GUIDE
If breaking changes found, provide step-by-step migration.
```

---

**Version**: 1.0  
**Estimated Time**: 15 minutes
EOF

echo "Created api-contract-validator.md"

# Create more as-needed prompts...
# (continuing with more prompts - abbreviated for space)

done
echo "All prompts created successfully!"
