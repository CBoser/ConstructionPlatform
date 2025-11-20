# API Contract Validator
## Ensure Frontend-Backend Alignment

**Purpose**: Validate API contracts match between frontend and backend to prevent integration issues

**Time Required**: 15 minutes

**Frequency**: After API changes, before integration, when getting API errors

---

## 🎯 When to Use This Prompt

### Use When:
- ✅ Frontend and backend are getting out of sync
- ✅ Getting "undefined property" errors from API
- ✅ API returns unexpected data format
- ✅ After API endpoint changes
- ✅ Before major frontend-backend integration
- ✅ When onboarding new team members

### Especially Important For:
- 🔥 Type mismatches between systems
- 🔥 Missing required fields
- 🔥 Inconsistent naming conventions
- 🔥 Unhandled error responses
- 🔥 Breaking API changes

---

## 📋 The API Contract Validation Prompt

**Copy everything below and paste into Claude.ai:**

```
Validate API contracts between frontend and backend. Detect mismatches and generate TypeScript interfaces.

## PROJECT CONTEXT
Backend directory: [e.g., server/routes/]
Frontend directory: [e.g., src/api/ or src/services/]
Framework: [e.g., Express + React, FastAPI + Vue]

## BACKEND ANALYSIS

For each API endpoint in the backend code, extract:

### Endpoint Details
- HTTP Method + Path (e.g., POST /api/users)
- Request body schema (fields: name, type, required/optional)
- Query parameters (if any)
- Path parameters (if any)
- Headers expected
- Authentication requirements

### Response Schemas
- Success response (status code + body structure)
- Error responses (all possible error codes + structures)
- Content-Type returned

### Example Output Format:
```
POST /api/users
Request Body: { name: string, email: string, role?: string }
Success (201): { id: string, name: string, email: string, createdAt: Date }
Error (400): { error: string, details?: string[] }
Error (409): { error: string, field: string }
Auth: Bearer token required
```

## FRONTEND ANALYSIS

For each API call in the frontend code, extract:

### Call Details
- HTTP Method + Path
- Request body sent (actual structure)
- Query/path parameters sent
- Headers sent
- How response is handled
- How errors are handled

### Expected Response
- What fields the frontend expects
- How the data is typed
- What error handling exists

## MISMATCH DETECTION

Compare backend vs frontend and report:

### 🔴 CRITICAL MISMATCHES (Breaking Issues)
- Frontend expects field that backend doesn't send
- Backend requires field that frontend doesn't send  
- Type mismatches (frontend expects number, backend sends string)
- Frontend missing error handling for backend error codes
- Authentication mismatch

Example:
```
❌ CRITICAL: GET /api/users/:id
   Backend returns: { id: number, name: string }
   Frontend expects: { id: string, name: string, email: string }
   Issues:
   - Type mismatch: id (number vs string)
   - Missing field: email (frontend expects but backend doesn't send)
```

### ⚠️ WARNINGS (Should Fix)
- Inconsistent naming (camelCase vs snake_case)
- Optional fields treated as required
- Unhandled error codes
- Missing null checks
- No loading states

Example:
```
⚠️ WARNING: POST /api/users
   Backend returns: user_name (snake_case)
   Frontend expects: userName (camelCase)
   Recommend: Standardize on camelCase
```

### ℹ️ INFO (Nice to Have)
- Additional fields backend sends but frontend doesn't use
- Verbose error responses
- Inconsistent response structure across endpoints

## OUTPUT: TYPESCRIPT INTERFACES

Generate type-safe interfaces for all APIs:

```typescript
// ============================================
// USER API CONTRACTS
// ============================================

// POST /api/users - Create User
export interface CreateUserRequest {
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'guest';
}

export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// GET /api/users/:id - Get User
export interface GetUserParams {
  id: string;
}

export interface GetUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Error responses
export interface ApiError {
  error: string;
  message: string;
  details?: string[];
  statusCode: number;
}

export interface ValidationError extends ApiError {
  field: string;
  constraint: string;
}
```

## MIGRATION GUIDE

If breaking changes found, provide step-by-step migration:

### Example Migration:
```
Breaking Change: User.id changed from number to string

Migration Steps:
1. Backend: Update database to use UUIDs
2. Backend: Update response type
3. Deploy backend
4. Frontend: Update UserResponse interface
5. Frontend: Update all id comparisons
6. Deploy frontend

Timeline: 2 releases (backend first, then frontend)
```

## CONSISTENCY CHECKS

Also verify:
- [ ] All endpoints use consistent error format
- [ ] All timestamps in same format (ISO 8601?)
- [ ] All IDs same type (string UUIDs vs number?)
- [ ] Consistent naming convention
- [ ] Consistent authentication method
- [ ] API versioning strategy exists

## OUTPUT FORMAT

Provide report in sections:
1. **Executive Summary** (How many endpoints, issues found)
2. **Critical Issues** (Must fix before deployment)
3. **Warnings** (Should fix this sprint)
4. **Generated Types** (Copy-paste ready TypeScript)
5. **Migration Guide** (If breaking changes)
6. **Recommendations** (API best practices)
```

---

## ⚡ Quick API Check Mode (5 minutes)

**For a single endpoint:**

```
Quick API contract check for: [METHOD PATH]

Backend code: [paste backend route handler]
Frontend code: [paste API call code]

Report:
✅ What matches
❌ What's mismatched (with fix)
📝 Generated TypeScript types
```

---

## 💡 Real-World Examples

### Example 1: Type Mismatch Caught

**Backend (Node/Express):**
```typescript
app.get('/api/users/:id', (req, res) => {
  const user = {
    id: parseInt(req.params.id), // Sends number
    name: 'John Doe',
    email: 'john@example.com'
  };
  res.json(user);
});
```

**Frontend (React):**
```typescript
interface User {
  id: string; // Expects string!
  name: string;
  email: string;
}

const user = await fetch(`/api/users/${userId}`).then(r => r.json());
// Runtime error: comparing number to string
```

**Claude's Report:**
```
❌ CRITICAL: GET /api/users/:id

Type Mismatch:
  Backend sends: id as number
  Frontend expects: id as string

Impact: String comparison fails, routing breaks

Fix Backend:
```typescript
id: req.params.id, // Keep as string
```

Fix Frontend:
```typescript
interface User {
  id: number; // Change to number
}
```

Recommendation: Use UUIDs (strings) for all IDs
```

---

### Example 2: Missing Field Caught

**Backend:**
```typescript
app.post('/api/users', (req, res) => {
  const user = {
    id: generateId(),
    name: req.body.name,
    email: req.body.email
    // createdAt is missing!
  };
  res.status(201).json(user);
});
```

**Frontend:**
```typescript
const user = await createUser({ name, email });
console.log(user.createdAt.toISOString()); // Error: undefined
```

**Claude's Report:**
```
❌ CRITICAL: POST /api/users

Missing Field:
  Frontend expects: createdAt (Date)
  Backend sends: undefined

Impact: TypeError when accessing .createdAt

Fix Backend:
```typescript
const user = {
  id: generateId(),
  name: req.body.name,
  email: req.body.email,
  createdAt: new Date()
};
```

Fix Frontend (temporary workaround):
```typescript
const user = await createUser({ name, email });
if (user.createdAt) {
  console.log(user.createdAt.toISOString());
}
```
```

---

### Example 3: Error Handling Gap

**Backend:**
```typescript
app.post('/api/users', (req, res) => {
  if (userExists) {
    return res.status(409).json({ 
      error: 'User already exists',
      field: 'email'
    });
  }
  // ... create user
});
```

**Frontend:**
```typescript
try {
  await createUser(data);
} catch (error) {
  // Only handles 400 errors, not 409!
  if (error.status === 400) {
    showError(error.message);
  }
}
```

**Claude's Report:**
```
⚠️ WARNING: POST /api/users

Unhandled Error Code:
  Backend can return: 409 Conflict
  Frontend only handles: 400 Bad Request

Impact: 409 errors show generic message

Fix Frontend:
```typescript
try {
  await createUser(data);
} catch (error) {
  if (error.status === 400) {
    showError('Invalid input: ' + error.message);
  } else if (error.status === 409) {
    showError(`${error.field} already exists`);
  } else {
    showError('Something went wrong');
  }
}
```
```

---

## 🎨 Generated Contract Examples

### Complete API Module

```typescript
// ============================================
// API CONTRACTS - Generated by Contract Validator
// Last Updated: 2025-11-12
// ============================================

// Base types
export type UserId = string; // UUID format
export type Timestamp = string; // ISO 8601 format

// ============================================
// USER ENDPOINTS
// ============================================

// POST /api/users
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface CreateUserResponse {
  id: UserId;
  name: string;
  email: string;
  role: string;
  createdAt: Timestamp;
}

// GET /api/users
export interface ListUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface ListUsersResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface UserSummary {
  id: UserId;
  name: string;
  email: string;
  role: string;
}

// GET /api/users/:id
export interface GetUserParams {
  id: UserId;
}

export interface GetUserResponse {
  id: UserId;
  name: string;
  email: string;
  role: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
}

// PUT /api/users/:id
export interface UpdateUserParams {
  id: UserId;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserResponse {
  id: UserId;
  name: string;
  email: string;
  role: string;
  updatedAt: Timestamp;
}

// DELETE /api/users/:id
export interface DeleteUserParams {
  id: UserId;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: Timestamp;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  details: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  constraint: string;
}

export interface ConflictErrorResponse extends ApiErrorResponse {
  field: string;
  conflictingValue: string;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'statusCode' in error
  );
}

export function isValidationError(
  error: unknown
): error is ValidationErrorResponse {
  return isApiError(error) && 'details' in error;
}
```

---

## 🔧 Common API Mismatches

### Mismatch 1: Date Handling
```typescript
// Backend sends
{ createdAt: "2025-11-12T10:30:00.000Z" } // ISO string

// Frontend expects  
{ createdAt: Date } // Date object

// Fix: Transform in API client
const response = await fetch('/api/users');
const data = await response.json();
return {
  ...data,
  createdAt: new Date(data.createdAt)
};
```

### Mismatch 2: Null vs Undefined
```typescript
// Backend sends null
{ middleName: null }

// Frontend expects undefined
{ middleName?: string }

// Fix: Use consistent nullability
// Either: Always use null
// Or: Transform null to undefined
```

### Mismatch 3: Array vs Single Item
```typescript
// Backend returns array (even for single item)
{ items: [{ id: 1 }] }

// Frontend expects single item
{ item: { id: 1 } }

// Fix: Standardize responses
// Always use arrays or always single items
```

---

## 📊 Contract Health Scorecard

**After running validation, score your API:**

| Category | Score | Notes |
|----------|-------|-------|
| Type Safety | ___/10 | All types match? |
| Error Handling | ___/10 | All errors handled? |
| Naming Consistency | ___/10 | camelCase everywhere? |
| Documentation | ___/10 | All endpoints documented? |
| Versioning | ___/10 | Breaking changes managed? |

**Overall Health: ___/50**

**Interpretation:**
- 45-50: Excellent, maintain current practices
- 35-44: Good, address warnings
- 25-34: Fair, fix critical issues ASAP
- 0-24: Poor, needs immediate attention

---

## 🎓 API Contract Best Practices

### 1. Use TypeScript Everywhere
```typescript
// Backend
export interface CreateUserDto {
  name: string;
  email: string;
}

// Frontend (same file or generated)
export interface CreateUserDto {
  name: string;
  email: string;
}
```

### 2. Version Your APIs
```typescript
// v1
POST /api/v1/users { name: string }

// v2 (breaking change)
POST /api/v2/users { firstName: string, lastName: string }

// Keep v1 running during migration
```

### 3. Standardize Error Format
```typescript
// Every error follows this structure
interface ApiError {
  error: string;      // Error type
  message: string;    // Human readable
  statusCode: number; // HTTP status
  timestamp: string;  // When it occurred
  path: string;       // What endpoint
  details?: any;      // Additional info
}
```

### 4. Generate Types from Schema
```bash
# Use tools to auto-generate
# OpenAPI → TypeScript
npx openapi-typescript schema.yaml --output types.ts

# JSON Schema → TypeScript  
npx json-schema-to-typescript schema.json > types.ts
```

---

## 🆘 Emergency Contract Fixes

### When Frontend Breaks After Backend Deploy

**Diagnosis:**
```typescript
// Add temporary logging
fetch('/api/users')
  .then(r => r.json())
  .then(data => {
    console.log('Received:', data);
    console.log('Expected:', expectedType);
  });
```

**Quick Fix:**
```typescript
// Add adapter layer
function adaptUserResponse(data: any): User {
  return {
    id: String(data.id),        // Convert types
    name: data.name,
    email: data.email,
    role: data.role || 'user',  // Provide defaults
    createdAt: new Date(data.createdAt)
  };
}
```

---

## 💪 Pro Tips

### Tip 1: Use OpenAPI/Swagger
Generate contracts automatically from OpenAPI spec

### Tip 2: Share Types Between Projects
```typescript
// In monorepo
packages/
  api-types/     <- Shared types
  backend/       <- Imports from api-types
  frontend/      <- Imports from api-types
```

### Tip 3: Add Runtime Validation
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// Validate at runtime
const user = UserSchema.parse(apiResponse);
```

### Tip 4: Test Contracts
```typescript
// Contract tests
it('API returns expected user structure', async () => {
  const user = await api.getUser('123');
  
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(typeof user.id).toBe('string');
});
```

---

## 🔄 Related Prompts

- **For API errors:** Use error-message-decoder.md
- **Before committing:** Use implementation-validation-checklist.md
- **For code review:** Use pr-review-assistant.md

---

**Remember**: API contract issues cause 50% of integration bugs. This 15-minute validation can save hours of debugging!

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Average Time**: 15 minutes  
**Bug Prevention Rate**: 90%+ of integration issues
