# MindFlow Authentication - Testing Guide

Complete guide for testing the JWT-based authentication system.

## Quick Start

### 1. Start the System

```bash
# Start PostgreSQL and dev servers
launch.bat

# Or manually:
docker compose up -d
npm run dev
```

### 2. Test Registration (API)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@mindflow.com\",\"password\":\"test1234\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@mindflow.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "ESTIMATOR",
      "isActive": true,
      "createdAt": "2024-12-07T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Test Login (API)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@mindflow.com\",\"password\":\"test1234\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@mindflow.com",
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 4. Test Protected Route (API)

```bash
# Save the access token from login response
TOKEN="your-access-token-here"

# Test /me endpoint
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "test@mindflow.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "ESTIMATOR",
    "isActive": true,
    ...
  }
}
```

### 5. Test Frontend

1. Open http://localhost:5173/register
2. Fill in registration form
3. Submit
4. Should redirect to dashboard
5. See user info and logout button

---

## Complete API Testing

### Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ESTIMATOR"
}
```

**Valid Roles:**
- `ADMIN`
- `ESTIMATOR` (default)
- `PROJECT_MANAGER`
- `FIELD_USER`
- `VIEWER`

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Error Responses:**
- `400`: Email already exists
- `400`: Invalid email format
- `400`: Password too short (< 8 chars)
- `400`: Invalid role

---

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object without password */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Error Responses:**
- `401`: Invalid email or password
- `401`: Account is disabled

---

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ESTIMATOR",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `401`: No token provided
- `403`: Invalid or expired token
- `404`: User not found

---

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

**Error Responses:**
- `400`: Refresh token is required
- `401`: Invalid refresh token
- `401`: User not found or inactive

---

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password updated successfully"
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `400`: Current password is incorrect
- `400`: New password too short

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** JWT logout is primarily client-side (removing tokens from localStorage).

---

## Frontend Testing

### Registration Flow

1. **Navigate to registration:**
   ```
   http://localhost:5173/register
   ```

2. **Fill in form:**
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: securepassword123
   - Confirm Password: securepassword123

3. **Submit form**

4. **Expected behavior:**
   - Form submits
   - User is registered
   - Tokens stored in localStorage
   - Redirect to dashboard (/)
   - See welcome message with email

### Login Flow

1. **Navigate to login:**
   ```
   http://localhost:5173/login
   ```

2. **Fill in credentials:**
   - Email: john.doe@example.com
   - Password: securepassword123

3. **Submit form**

4. **Expected behavior:**
   - Form submits
   - User is authenticated
   - Tokens stored in localStorage
   - Redirect to dashboard (/)
   - See user info in nav bar

### Protected Route

1. **Clear localStorage** (to simulate logged-out state)
   ```javascript
   localStorage.clear()
   ```

2. **Try to access dashboard:**
   ```
   http://localhost:5173/
   ```

3. **Expected behavior:**
   - Redirect to /login
   - Cannot access dashboard without authentication

### Logout Flow

1. **From dashboard, click "Logout" button**

2. **Expected behavior:**
   - User logged out
   - Tokens removed from localStorage
   - Redirect to /login

---

## Database Testing

### View Users in Prisma Studio

```bash
db-studio.bat
```

Or manually:
```bash
cd backend
npm run prisma:studio
```

Open http://localhost:5555 and navigate to the `users` table.

You should see:
- Users you registered
- Hashed passwords (bcrypt)
- User roles
- Timestamps

### Check Password Hashing

Passwords in the database should look like:
```
$2b$10$XQKbPr3nO3zq5E.Hp8Tp6eZ8ZmD...
```

This confirms bcrypt hashing is working.

---

## Role-Based Access Testing

### Create Admin User (via Prisma Studio)

1. Open Prisma Studio: `db-studio.bat`
2. Go to `users` table
3. Create new user or edit existing
4. Set `role` to `ADMIN`
5. Save

### Test Role Restrictions

In future endpoints with `requireRole` middleware:

```bash
# Example: Admin-only endpoint (to be implemented)
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ESTIMATOR_TOKEN"
```

**Expected:** `403 Forbidden` (Insufficient permissions)

```bash
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200 OK` (Success)

---

## Error Testing

### Invalid Email Format

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"notanemail\",\"password\":\"test1234\"}"
```

**Expected:** `400 Bad Request` - "Invalid email format"

### Short Password

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"short\"}"
```

**Expected:** `400 Bad Request` - "Password must be at least 8 characters long"

### Duplicate Email

```bash
# Register once
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"duplicate@test.com\",\"password\":\"test1234\"}"

# Try again with same email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"duplicate@test.com\",\"password\":\"test1234\"}"
```

**Expected:** `400 Bad Request` - "User with this email already exists"

### Invalid Credentials

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"wrongpassword\"}"
```

**Expected:** `401 Unauthorized` - "Invalid email or password"

### Expired Token

1. Generate a token
2. Wait for expiration (default: 7 days)
3. Try to use it

**Expected:** `403 Forbidden` - "Invalid or expired token"

---

## Token Validation Testing

### Valid Token

```bash
TOKEN="valid-jwt-token-here"

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `200 OK` with user data

### No Token

```bash
curl http://localhost:3001/api/auth/me
```

**Expected:** `401 Unauthorized` - "Access token is required"

### Malformed Token

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** `403 Forbidden` - "Invalid or expired token"

### Wrong Authorization Format

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: $TOKEN"
```

**Expected:** `401 Unauthorized` - "Access token is required"

**Correct format:** `Authorization: Bearer {token}`

---

## localStorage Inspection

### Check Stored Tokens

Open browser console (F12) and run:

```javascript
// View access token
console.log(localStorage.getItem('accessToken'));

// View refresh token
console.log(localStorage.getItem('refreshToken'));

// View user data
console.log(JSON.parse(localStorage.getItem('user')));

// Clear all auth data
localStorage.clear();
```

---

## Security Testing

### Password Visibility

✅ **Passwords should NEVER appear in:**
- API responses
- Database queries visible in logs
- Browser localStorage
- Network tab (except during login/register POST)

### Token Security

✅ **Tokens should be:**
- Stored in localStorage (current implementation)
- Sent only via Authorization header
- Validated on every protected request
- Refreshable before expiration

⚠️ **Future Enhancement:** Consider httpOnly cookies for extra security.

### SQL Injection Prevention

✅ **Prisma ORM automatically prevents SQL injection**

Test anyway:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"'; DROP TABLE users; --\",\"password\":\"test\"}"
```

**Expected:** `401 Unauthorized` (query fails safely, no SQL execution)

---

## Performance Testing

### Concurrent Registrations

```bash
# Create multiple users simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@test.com\",\"password\":\"password123\"}" &
done
wait
```

**Expected:** All succeed, no race conditions

### Token Generation Speed

Measure JWT generation time:

```bash
time curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@mindflow.com\",\"password\":\"test1234\"}"
```

**Expected:** < 1 second

---

## Troubleshooting

### "Cannot connect to database"

```bash
# Check PostgreSQL status
docker ps | grep mindflow-postgres

# Restart if needed
docker compose restart
```

### "JWT_SECRET not found"

```bash
# Check .env file
cd backend
cat .env | grep JWT_SECRET

# Should see:
# JWT_SECRET=dev-secret-key-change-in-production
```

### "User not found" after registration

```bash
# Check database
db-studio.bat

# Navigate to users table
# Verify user exists
```

### Frontend "Network Error"

```bash
# Check backend is running
curl http://localhost:3001/health

# Check CORS configuration
# Ensure frontend URL is http://localhost:5173
```

---

## Success Criteria

✅ **Registration:**
- User can register via API
- User can register via frontend form
- Password is hashed in database
- JWT tokens are returned
- Duplicate emails are rejected

✅ **Login:**
- User can login via API
- User can login via frontend form
- Invalid credentials are rejected
- JWT tokens are returned

✅ **Authentication:**
- Protected routes require valid JWT
- Invalid/expired tokens are rejected
- Tokens are stored in localStorage
- User data is accessible via /me endpoint

✅ **Frontend:**
- Login form works
- Register form works
- Dashboard requires authentication
- Logout clears tokens and redirects
- User info displayed in UI

✅ **Security:**
- Passwords are bcrypt hashed
- Tokens expire after configured time
- Role-based access control works
- No sensitive data in responses

---

## Next Steps

After authentication is working:

1. **Add email verification** (Phase 2)
2. **Add password reset** (Phase 2)
3. **Add 2FA** (Phase 3)
4. **Add session management** (Phase 3)
5. **Add audit logging** (already in schema)
6. **Add rate limiting** (prevent brute force)

---

**Authentication system is ready for Phase 1 development!** 🎉
