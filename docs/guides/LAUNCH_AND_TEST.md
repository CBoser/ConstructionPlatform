# MindFlow Platform - Launch & Testing Guide

**Sprint 1 Security Features Testing**
**Created**: 2025-11-09
**Security Enhancements**: JWT Validation, Seed Security, Security Headers

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
✅ Node.js v18+ (You have: v22.21.1)
✅ npm v8+ (You have: 10.9.4)
⚠️  PostgreSQL 14+ (Need to set up)

---

## 📋 Step-by-Step Launch

### **Step 1: Start PostgreSQL Database**

**Option A: Using Docker (Recommended)**
```bash
cd /home/user/ConstructionPlatform
docker-compose up -d
```

**Option B: Using Local PostgreSQL**
```bash
# If PostgreSQL installed locally, start it:
sudo service postgresql start

# Create database:
psql -U postgres -c "CREATE DATABASE mindflow_dev;"
psql -U postgres -c "CREATE USER mindflow WITH PASSWORD 'mindflow_dev_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mindflow_dev TO mindflow;"
```

**Verify Database Running:**
```bash
pg_isready -h localhost -p 5433  # If using Docker
# OR
pg_isready -h localhost -p 5432  # If using local PostgreSQL
```

---

### **Step 2: Backend Setup & Launch**

```bash
cd /home/user/ConstructionPlatform/backend

# Install dependencies (if not already done)
npm install

# Set environment variables
cp .env.example .env

# IMPORTANT: Generate secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and add to .env:
# JWT_SECRET=<paste-generated-secret-here>

# Generate Prisma Client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with test data
npm run prisma:seed

# Start backend server
npm run dev
```

**Expected Output:**
```
⚡️ [server]: Server is running at http://localhost:3001
📊 [database]: Connected to PostgreSQL
🚀 [ready]: MindFlow API is ready to accept requests
✅ [security]: JWT_SECRET validated (production mode)
```

---

### **Step 3: Frontend Setup & Launch**

**Open a NEW terminal window:**

```bash
cd /home/user/ConstructionPlatform/frontend

# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Step 4: Open in Browser**

Open your browser and navigate to:
**http://localhost:5173**

You should see the MindFlow Platform homepage.

---

## 🧪 Testing Security Features (Sprint 1)

### **Test 1: JWT_SECRET Validation** ✅

**What we implemented:** Server requires secure JWT_SECRET in production (32+ characters)

**Test in development mode:**
```bash
cd /home/user/ConstructionPlatform/backend

# Test 1: Without JWT_SECRET (should work with warning)
unset JWT_SECRET
NODE_ENV=development npm run dev

# Expected: Warning about using development default
# ⚠️  WARNING: JWT_SECRET not set - using development default
```

**Test in production mode:**
```bash
# Test 2: Without JWT_SECRET (should FAIL)
unset JWT_SECRET
NODE_ENV=production npm run dev

# Expected: Fatal error and exit
# 🔴 FATAL ERROR: JWT_SECRET is not set in production!

# Test 3: With short JWT_SECRET (should FAIL)
JWT_SECRET="short" NODE_ENV=production npm run dev

# Expected: Fatal error about length
# 🔴 FATAL ERROR: JWT_SECRET is too short!

# Test 4: With proper JWT_SECRET (should SUCCEED)
JWT_SECRET="7f3e9a2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f" NODE_ENV=production npm run dev

# Expected: Success
# ✅ [security]: JWT_SECRET validated (production mode)
```

**Run automated test:**
```bash
node test-jwt-validation.js
```

---

### **Test 2: Seed Data Security** ✅

**What we implemented:** No hardcoded passwords, production guard

**Test production block:**
```bash
cd /home/user/ConstructionPlatform/backend

# Test 1: Seed in production (should FAIL)
NODE_ENV=production npm run prisma:seed

# Expected: Fatal error
# 🔴 FATAL ERROR: Seed script cannot run in production!
```

**Test development seed:**
```bash
# Test 2: Seed in development (should SUCCEED)
NODE_ENV=development npm run prisma:seed

# Expected: Success with credentials displayed
# 🔐 Test user credentials:
#    Email: admin@mindflow.com
#    Password: DevPassword123!
```

**Test custom password:**
```bash
# Test 3: Custom seed password
SEED_USER_PASSWORD="MyCustomPass123!" npm run prisma:seed

# Expected: Uses custom password
# 🔐 Test user credentials:
#    Email: admin@mindflow.com
#    Password: MyCustomPass123!
```

**Run automated test:**
```bash
node test-seed-security.js
```

**Test Users Created:**
- Email: `admin@mindflow.com` (Role: ADMIN)
- Email: `estimator@mindflow.com` (Role: ESTIMATOR)
- Email: `pm@mindflow.com` (Role: PROJECT_MANAGER)
- Email: `field@mindflow.com` (Role: FIELD_USER)
- Email: `viewer@mindflow.com` (Role: VIEWER)
- Password: `DevPassword123!` (or custom if SEED_USER_PASSWORD set)

---

### **Test 3: Security Headers** ✅

**What we implemented:** 8 HTTP security headers on all responses

**Test headers via curl:**
```bash
# Test health endpoint
curl -I http://localhost:3001/health

# Expected headers:
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# X-API-Version: v1
# X-Security-Policy: strict

# Test auth endpoint
curl -I http://localhost:3001/api/auth/login

# Should have same headers
```

**Test headers via browser:**
1. Open browser to http://localhost:3001/health
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh page
5. Click on the "health" request
6. Check Response Headers - should see all 8 security headers

**Run automated test:**
```bash
cd /home/user/ConstructionPlatform/backend
node test-security-headers.js
```

**Protection verified:**
- 🛡️ XSS (Cross-Site Scripting) attacks
- 🛡️ Clickjacking attacks
- 🛡️ MIME-type sniffing attacks
- 🛡️ Man-in-the-middle attacks (HTTPS enforcement)
- 🛡️ Data injection attacks
- 🛡️ Privacy leaks via referrer

---

## 🔐 Test Authentication Flow

### **Test Login API**

**Using curl:**
```bash
# Test login with admin user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mindflow.com",
    "password": "DevPassword123!"
  }'

# Expected: Success with access token
# {
#   "user": { ... },
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "..."
# }
```

**Test failed login:**
```bash
# Test with wrong password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mindflow.com",
    "password": "WrongPassword!"
  }'

# Expected: Error
# { "error": "Invalid email or password" }
```

**Using browser/Postman:**
1. POST to `http://localhost:3001/api/auth/login`
2. Body (JSON):
   ```json
   {
     "email": "admin@mindflow.com",
     "password": "DevPassword123!"
   }
   ```
3. Check response includes `accessToken` and `refreshToken`

---

## 📊 Verify Database Seeding

### **Check Database Data**

```bash
cd /home/user/ConstructionPlatform/backend

# View users
npx prisma studio
# Opens browser at http://localhost:5555
# Navigate to "User" table to see 5 test users

# OR via SQL
psql postgresql://mindflow:mindflow_dev_password@localhost:5433/mindflow_dev -c "SELECT email, role FROM \"User\";"

# Expected output:
#          email           |      role
# ------------------------+------------------
#  admin@mindflow.com     | ADMIN
#  estimator@mindflow.com | ESTIMATOR
#  pm@mindflow.com        | PROJECT_MANAGER
#  field@mindflow.com     | FIELD_USER
#  viewer@mindflow.com    | VIEWER
```

---

## 🏥 Health Check Endpoints

### **Backend Health Check**

```bash
# Simple health check
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "ok",
#   "message": "MindFlow API is running",
#   "database": "connected",
#   "timestamp": "2025-11-09T..."
# }
```

### **API Root Endpoint**

```bash
curl http://localhost:3001/

# Expected response:
# {
#   "message": "Welcome to MindFlow API",
#   "version": "1.0.0",
#   "description": "Construction Management Platform - Foundation Layer",
#   "endpoints": {
#     "health": "/health",
#     "auth": "/api/auth",
#     "customers": "/api/customers",
#     ...
#   }
# }
```

---

## ❌ Troubleshooting Common Issues

### **Issue 1: Port already in use**

```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=3002
```

### **Issue 2: Database connection failed**

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5433

# Check database exists
psql -U mindflow -h localhost -p 5433 -l

# Check credentials in .env match database
cat backend/.env | grep DATABASE_URL
```

### **Issue 3: Prisma client not initialized**

```bash
cd /home/user/ConstructionPlatform/backend

# Regenerate Prisma client
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# Reset database
npx prisma migrate reset

# Seed again
npm run prisma:seed
```

### **Issue 4: Frontend can't connect to backend**

```bash
# Check CORS settings
# Backend should allow: http://localhost:5173

# Verify in backend/.env:
FRONTEND_URL=http://localhost:5173

# Check backend is running:
curl http://localhost:3001/health
```

### **Issue 5: Security headers not appearing**

```bash
# Verify helmet is installed
cd /home/user/ConstructionPlatform/backend
npm list helmet

# If not found:
npm install helmet

# Restart backend
npm run dev
```

---

## 📝 Quick Reference Commands

### **Start Everything**
```bash
# Terminal 1: Backend
cd /home/user/ConstructionPlatform/backend && npm run dev

# Terminal 2: Frontend
cd /home/user/ConstructionPlatform/frontend && npm run dev

# Terminal 3: Database (if using Docker)
cd /home/user/ConstructionPlatform && docker-compose up
```

### **Reset Everything**
```bash
# Stop all processes (Ctrl+C in terminals)

# Reset database
cd /home/user/ConstructionPlatform/backend
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Restart backend
npm run dev
```

### **Run All Tests**
```bash
cd /home/user/ConstructionPlatform/backend

# Test JWT validation
node test-jwt-validation.js

# Test seed security
node test-seed-security.js

# Test security headers
node test-security-headers.js
```

---

## ✅ Success Checklist

After launching, verify:

- [ ] Backend running at http://localhost:3001
- [ ] Frontend running at http://localhost:5173
- [ ] Database connected (check `/health` endpoint)
- [ ] Can login with test user (admin@mindflow.com / DevPassword123!)
- [ ] Security headers present (check browser DevTools)
- [ ] JWT_SECRET validation working (test with production mode)
- [ ] Seed data security working (test production block)
- [ ] 5 test users created (check database)

---

## 🚀 Next Steps

1. **Test frontend UI** - Navigate to http://localhost:5173
2. **Test authentication** - Try logging in with test users
3. **Continue Sprint 1** - Days 4-10 remaining
4. **Deploy to staging** - After Sprint 1 complete

---

## 📞 Support

- **Documentation**: `/docs/SPRINT_PLAN.md`
- **Sprint Progress**: `/docs/sprints/sprint-01/PROGRESS.md`
- **Changelog**: `/docs/CHANGELOG.md`
- **Issues**: Create in GitHub repo

---

**Security Status**: 🔒 **3/9 Critical Fixes Complete**
- ✅ JWT_SECRET Validation
- ✅ Seed Data Security
- ✅ Security Headers
- ⚪ CORS Hardening (Day 4)
- ⚪ Audit Logging (Day 5)
- ⚪ Rate Limiting (Day 6-7)
- ⚪ Connection Pooling (Day 8)
- ⚪ API Versioning (Day 9)
- ⚪ Final Testing (Day 10)

---

**Last Updated**: 2025-11-09
**Sprint**: Sprint 1 - Security Foundation (Days 1-3 Complete)
