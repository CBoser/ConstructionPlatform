# MindFlow Test User Accounts

**⚠️ FOR DEVELOPMENT USE ONLY - DO NOT USE IN PRODUCTION**

## Default Test Accounts

All test accounts use the same password for development convenience.

**Default Password**: `DevPassword123!`

---

## Available Test Users

### 1. Admin User
- **Email**: `admin@mindflow.com`
- **Password**: `DevPassword123!`
- **Role**: ADMIN
- **Name**: Admin User
- **Permissions**: Full system access, all features enabled

### 2. Estimator
- **Email**: `estimator@mindflow.com`
- **Password**: `DevPassword123!`
- **Role**: ESTIMATOR
- **Name**: John Estimator
- **Permissions**: Create/edit estimates, manage takeoffs, view customers

### 3. Project Manager
- **Email**: `pm@mindflow.com`
- **Password**: `DevPassword123!`
- **Role**: PROJECT_MANAGER
- **Name**: Sarah ProjectManager
- **Permissions**: Manage jobs, approve purchase orders, view reports

### 4. Field User
- **Email**: `field@mindflow.com`
- **Password**: `DevPassword123!`
- **Role**: FIELD_USER
- **Name**: Mike FieldUser
- **Permissions**: Update job status, record deliveries, submit field data

### 5. Viewer (Read-Only)
- **Email**: `viewer@mindflow.com`
- **Password**: `DevPassword123!`
- **Role**: VIEWER
- **Name**: Jane Viewer
- **Permissions**: Read-only access to all data

---

## Creating Test Accounts

### Method 1: Seed Database (Recommended for Development)

Run the seed script to create all test accounts:

```bash
cd backend
npm run prisma:seed
```

This will:
- ✅ Create all 5 test user accounts
- ✅ Create sample customer data (Richmond, Holt, MountainView)
- ✅ Set up pricing tiers and contacts
- ✅ Clean existing data first (optional - can be disabled in seed.ts)

### Method 2: Register New Account (Via UI)

1. Navigate to the login page
2. Click "Sign Up" or "Register"
3. Fill in your details:
   - Email
   - Password (minimum 8 characters)
   - First Name
   - Last Name
   - Role (select appropriate role)
4. Submit registration
5. Log in with your new credentials

### Method 3: Register via API

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "YourPassword123!",
    "firstName": "Your",
    "lastName": "Name",
    "role": "ADMIN"
  }'
```

---

## Security Notes

### Development Environment
- ⚠️ These credentials are **ONLY for development/testing**
- ⚠️ The seed script will **refuse to run in production** mode
- ✅ Password is stored as bcrypt hash (10 salt rounds)
- ✅ JWT tokens expire after 15 minutes (access) / 7 days (refresh)

### Production Environment
- 🔴 **NEVER use these test credentials in production**
- 🔴 **NEVER commit real credentials to version control**
- ✅ Set `SEED_USER_PASSWORD` environment variable for custom password
- ✅ Create real user accounts via registration
- ✅ Ensure JWT_SECRET is cryptographically secure (32+ characters)

---

## Customizing Seed Password

To use a different password for test accounts, set the environment variable:

```bash
# In backend/.env
SEED_USER_PASSWORD=YourCustomPassword123!
```

Then run the seed script:

```bash
npm run prisma:seed
```

---

## Troubleshooting

### "Invalid email or password" error

**Possible causes:**
1. Database not seeded yet → Run `npm run prisma:seed`
2. Typo in email or password → Check carefully (case-sensitive)
3. User doesn't exist → Register a new account or seed database

### Seed script fails

**Possible causes:**
1. Database not running → Start with `docker-compose up -d`
2. Prisma client out of sync → Run `npx prisma generate`
3. Network restrictions → Set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

### Can't connect to backend

**Check:**
1. Backend server is running → `npm run dev` in backend directory
2. Port 3001 is available → Check if something else is using it
3. Database is running → `docker-compose ps`

---

## Role Permissions Matrix

| Feature | Admin | Estimator | PM | Field | Viewer |
|---------|-------|-----------|----|----|--------|
| **View Customers** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Plans** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create/Edit Plans** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Takeoffs** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Approve POs** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Manage Jobs** | ✅ | ✅ | ✅ | ⚠️ Update only | ❌ |
| **View Reports** | ✅ | ✅ | ✅ | ⚠️ Limited | ✅ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |

*Note: Actual permissions may vary based on implementation. This is the planned permission matrix.*

---

## Quick Reference

**Login URL**: http://localhost:5173/login (or your configured frontend URL)

**API Base URL**: http://localhost:3001/api/v1

**Default Admin**:
- Email: `admin@mindflow.com`
- Password: `DevPassword123!`

---

**Last Updated**: 2025-11-13
**Phase**: Phase 0 - Security Foundation Complete
**Version**: 0.9.0
