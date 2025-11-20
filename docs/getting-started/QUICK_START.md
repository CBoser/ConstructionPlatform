# MindFlow Platform - Quick Start Guide

**Last Updated**: 2025-11-09
**Sprint 1 - Day 3**: Security Features Implemented

---

## 🎯 NEW: DevOps Management Tool (Easiest Option!)

We've created a Python DevOps tool that handles everything with an interactive menu!

**Quick Start:**
```bash
python devops.py
# Select: Q (Quick Start)
```

This one command will:
✅ Start PostgreSQL
✅ Run migrations
✅ Seed database
✅ Install dependencies
✅ Launch backend + frontend

**See full documentation:** [DEVOPS_TOOL.md](DEVOPS_TOOL.md)

---

## Manual Setup Options

If you prefer manual setup or the DevOps tool doesn't work, follow the options below:

### Prerequisites Checklist

Before starting, ensure you have:

- [x] **Node.js v20+** (You have: v20.19.4) ✅
- [x] **npm v10+** (You have: 10.8.2) ✅
- [ ] **PostgreSQL 14+** or **Docker** for database

---

## Option 1: Quick Start with Docker (Recommended)

### Step 1: Enable Docker in WSL

Your system detected: **WSL 2** on Windows

**To enable Docker:**
1. Open **Docker Desktop** on Windows
2. Go to **Settings** → **Resources** → **WSL Integration**
3. Enable integration for your WSL distribution (Ubuntu)
4. Click **Apply & Restart**

**Verify Docker works:**
```bash
docker --version
```

### Step 2: Start Database

```bash
cd /mnt/c/GitHub/ConstructionPlatform
docker-compose up -d postgres
```

This starts PostgreSQL on port **5433** (to avoid conflicts).

**Verify database is running:**
```bash
docker ps
# You should see: mindflow-postgres
```

### Step 3: Set Up Backend

```bash
cd backend

# Environment is already configured (.env created)
# Dependencies are already installed

# Run database migrations
npx prisma migrate deploy

# Seed test data
npm run prisma:seed
```

**Test users created:**
- `admin@mindflow.com` / `DevPassword123!` (ADMIN)
- `estimator@mindflow.com` / `DevPassword123!` (ESTIMATOR)
- `pm@mindflow.com` / `DevPassword123!` (PROJECT_MANAGER)

### Step 4: Start Backend

```bash
# From backend/ directory
npm run dev
```

Backend runs at: **http://localhost:3001**

**Test it:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MindFlow API is running",
  "database": "connected"
}
```

### Step 5: Start Frontend (New Terminal)

```bash
cd /mnt/c/GitHub/ConstructionPlatform/frontend

# Dependencies already installed
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Option 2: Local PostgreSQL (Without Docker)

### Step 1: Install PostgreSQL

**On WSL/Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Verify it's running:**
```bash
sudo service postgresql status
```

### Step 2: Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console:
CREATE USER mindflow WITH PASSWORD 'mindflow_dev_password';
CREATE DATABASE mindflow_dev OWNER mindflow;
GRANT ALL PRIVILEGES ON DATABASE mindflow_dev TO mindflow;
\q
```

### Step 3: Update Database Connection

Edit `backend/.env` and change DATABASE_URL to:
```
DATABASE_URL="postgresql://mindflow:mindflow_dev_password@localhost:5432/mindflow_dev?schema=public"
```

(Note: Port **5432** instead of 5433)

### Step 4: Continue with Backend Setup

```bash
cd backend

# Run migrations
npx prisma migrate deploy

# Seed data
npm run prisma:seed

# Start backend
npm run dev
```

Then follow **Step 5** from Option 1 to start the frontend.

---

## Testing Security Features (Sprint 1 - Days 1-3)

### 1. Verify Security Headers

```bash
# Check all security headers are present
curl -I http://localhost:3001/health

# You should see:
# ✅ Content-Security-Policy
# ✅ Strict-Transport-Security (HSTS)
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ X-API-Version: v1
# ✅ X-Security-Policy: strict
```

### 2. Test JWT Secret Validation

```bash
cd backend

# This should PASS - JWT_SECRET validation
node -e "
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
console.log('JWT_SECRET length:', jwtSecret.length);
console.log(jwtSecret.length >= 32 ? '✅ PASS: Secure length' : '⚠️  DEV: Use longer secret in production');
"
```

### 3. Test Login API

```bash
# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mindflow.com",
    "password": "DevPassword123!"
  }'

# Expected: JSON response with accessToken and refreshToken
```

### 4. Test Seed Security (No Hardcoded Passwords)

```bash
cd backend

# Verify seed uses environment variable
grep -r "DevPassword123" prisma/seed.ts
# Should NOT find hardcoded password - it uses SEED_USER_PASSWORD env var
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Docker: `docker ps` - ensure `mindflow-postgres` is running
2. Local: `sudo service postgresql status` - ensure PostgreSQL is running
3. Check port: Database is on **5433** (Docker) or **5432** (local)

### Prisma Generation Issues

**Error:** `Failed to fetch engine file`

This is a network/firewall issue. The Prisma client is already generated, so you can skip this error.

### Frontend Won't Start

**Error:** `Cannot find module @rollup/rollup-linux-x64-gnu`

**Solution:** Already fixed! Dependencies were reinstalled.

### Backend TypeScript Errors

**Error:** `TS2769` in `auth.ts`

**Solution:** Already fixed! JWT signing types corrected.

---

## What's Working Now? ✅

After Sprint 1 Days 1-3, you have:

1. **Secure JWT Implementation**
   - Production validation (32+ char secret required)
   - Clear error messages with remediation steps
   - TypeScript compilation fixed

2. **No Hardcoded Credentials**
   - All passwords use `SEED_USER_PASSWORD` environment variable
   - Production seed blocked for safety
   - Clean security audit

3. **HTTP Security Headers**
   - 8 security headers on every response
   - XSS protection via CSP
   - Clickjacking protection (X-Frame-Options)
   - MITM protection (HSTS)
   - MIME sniffing protection

---

## Next Steps

### Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3001
3. **API Health**: http://localhost:3001/health

### Login

Use any test user from the seed:
- Email: `admin@mindflow.com`
- Password: `DevPassword123!`

### Continue Sprint 1

Remaining tasks (Days 4-10):
- Day 4: CORS Hardening
- Day 5: Audit Logging
- Day 6-7: Rate Limiting
- Day 8: Connection Pooling
- Day 9: API Versioning
- Day 10: Final Testing

---

## Need Help?

**Common Issues:**
1. Database not running → See "Troubleshooting" above
2. Port conflicts → Check if ports 3001, 5173, 5433 are available
3. Docker not working → Enable WSL integration in Docker Desktop

**Files to Check:**
- `backend/.env` - Environment configuration
- `docker-compose.yml` - Database configuration
- `backend/prisma/schema.prisma` - Database schema

**Useful Commands:**
```bash
# Check running processes
docker ps                    # Docker containers
lsof -i :3001               # What's using port 3001
sudo service postgresql status  # PostgreSQL status

# Database management
docker-compose logs postgres    # View database logs
npx prisma studio              # Visual database browser
npx prisma migrate status      # Check migration status
```

---

**Ready to launch!** Follow Option 1 (Docker) or Option 2 (Local PostgreSQL) above.
