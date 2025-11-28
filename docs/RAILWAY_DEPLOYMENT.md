# Railway Deployment Guide

Complete guide for deploying MindFlow Construction Platform to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Local project working and tested

---

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your `ConstructionPlatform` repository

---

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will provision a PostgreSQL instance
3. Click on the PostgreSQL service to view connection details
4. Copy the `DATABASE_URL` from the **"Connect"** tab

The URL will look like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway
```

---

## Step 3: Configure Backend Service

### 3.1 Create Backend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repo
2. Configure the service:
   - **Name:** `mindflow-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run prisma:generate && npm run build`
   - **Start Command:** `npm run start`

### 3.2 Set Environment Variables

In the backend service, go to **"Variables"** tab and add:

```bash
# REQUIRED - Core Configuration
NODE_ENV=production
PORT=3001

# REQUIRED - Database (Railway provides this automatically if you link the DB)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# REQUIRED - Security (GENERATE A NEW SECRET!)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-64-character-hex-secret-here-generate-a-new-one
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# REQUIRED - CORS (update with your actual frontend URL)
ALLOWED_ORIGINS=https://your-frontend.up.railway.app

# RECOMMENDED - Database Pool Settings
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=10

# OPTIONAL - Seed password (only if you need to run seed)
# SEED_USER_PASSWORD=YourSecurePassword123!
```

### 3.3 Link PostgreSQL

1. Go to your backend service → **"Variables"**
2. Click **"Add Variable Reference"**
3. Select your PostgreSQL service
4. This automatically sets `DATABASE_URL`

---

## Step 4: Configure Frontend Service

### 4.1 Create Frontend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repo
2. Configure the service:
   - **Name:** `mindflow-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview -- --host 0.0.0.0 --port $PORT`

### 4.2 Set Environment Variables

```bash
# Backend API URL (use your backend's Railway URL)
VITE_API_URL=https://mindflow-backend.up.railway.app
```

---

## Step 5: Run Database Migrations

### Option A: Via Railway Shell

1. Go to backend service → **"Settings"** → **"Railway Shell"**
2. Run:
```bash
npx prisma migrate deploy
```

### Option B: Add to Build Command

Update your backend build command to:
```bash
npm install && npm run prisma:generate && npx prisma migrate deploy && npm run build
```

---

## Step 6: Generate Domains

1. Go to each service → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** for both services
3. Note down the URLs:
   - Backend: `https://mindflow-backend-xxx.up.railway.app`
   - Frontend: `https://mindflow-frontend-xxx.up.railway.app`

4. **Update CORS:** Go back to backend Variables and update:
```bash
ALLOWED_ORIGINS=https://mindflow-frontend-xxx.up.railway.app
```

---

## Complete Environment Variables Reference

### Backend (Required)

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Must be "production" |
| `PORT` | `3001` | Server port (Railway sets this) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Link to Railway PostgreSQL |
| `JWT_SECRET` | `a1b2c3...` (64 chars) | **Generate new!** Never use default |
| `JWT_EXPIRES_IN` | `7d` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token expiry |
| `ALLOWED_ORIGINS` | `https://your-frontend.up.railway.app` | Frontend URL for CORS |

### Backend (Recommended)

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_CONNECTION_LIMIT` | `20` | Max DB connections (Railway: 10-20) |
| `DATABASE_POOL_TIMEOUT` | `10` | Connection timeout in seconds |

### Frontend (Required)

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://mindflow-backend.up.railway.app` | Backend API URL |

---

## Prisma Configuration for Railway

### Database URL Format

Railway PostgreSQL URLs work directly with Prisma:
```
postgresql://postgres:PASSWORD@HOST:PORT/railway?schema=public
```

For better connection handling, add pool parameters:
```
postgresql://postgres:PASSWORD@HOST:PORT/railway?schema=public&connection_limit=20&pool_timeout=10
```

### Migration Strategy

**Development:** Use `prisma migrate dev` (creates migrations)
**Production:** Use `prisma migrate deploy` (applies existing migrations)

```bash
# In Railway shell or build command:
npx prisma migrate deploy
```

### Prisma Generate

Always run `prisma generate` before building:
```bash
npm run prisma:generate && npm run build
```

---

## CORS Configuration Details

The backend validates CORS against the `ALLOWED_ORIGINS` environment variable.

### Single Origin
```bash
ALLOWED_ORIGINS=https://mindflow-frontend.up.railway.app
```

### Multiple Origins
```bash
ALLOWED_ORIGINS=https://mindflow-frontend.up.railway.app,https://www.yourdomain.com
```

### Common Mistakes

| Problem | Solution |
|---------|----------|
| CORS error in browser | Check `ALLOWED_ORIGINS` matches exactly (no trailing slash) |
| Localhost in production | Remove `localhost` from `ALLOWED_ORIGINS` |
| Missing https:// | Always include protocol |

---

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.up.railway.app/health`
- [ ] Frontend loads correctly
- [ ] Login works with test account
- [ ] CORS errors: Check `ALLOWED_ORIGINS`
- [ ] Database connected: Check `/health` response
- [ ] JWT_SECRET is unique (not the development default)

---

## Seed Data (Optional)

**Warning:** Only run seed on a fresh database. It deletes all existing data!

```bash
# In Railway shell:
SEED_FORCE=true npx ts-node prisma/seed.ts
```

Or create a test user manually via the API after deployment.

---

## Troubleshooting

### "Invalid or expired token"
- JWT_SECRET mismatch between deploys
- Clear browser localStorage and login again

### "Database connection failed"
- Check DATABASE_URL is set correctly
- Verify PostgreSQL service is running
- Check connection limit isn't exceeded

### "CORS error"
- ALLOWED_ORIGINS must match frontend URL exactly
- No trailing slash
- Include protocol (https://)

### Build fails on Prisma
- Ensure `prisma generate` runs before `tsc`
- Check `@prisma/client` is in dependencies (not devDependencies)

---

## Cost Estimation

Railway pricing (as of 2024):

| Resource | Free Tier | Pro Tier |
|----------|-----------|----------|
| Execution Hours | 500/month | Unlimited |
| PostgreSQL | 1GB storage | 10GB+ |
| Bandwidth | 100GB | Unlimited |

For a small construction platform:
- **Free tier:** Suitable for development/testing
- **Pro tier (~$5-20/month):** Recommended for production

---

## Security Reminders

1. **Never commit `.env` files** - Use Railway's variable management
2. **Generate unique JWT_SECRET** - Run the crypto command for each environment
3. **Use HTTPS only** - Railway provides this automatically
4. **Review ALLOWED_ORIGINS** - Only include trusted domains
5. **Don't run seed in production** - The script blocks in production mode

---

## Quick Deploy Commands

```bash
# Generate JWT secret (run locally, copy to Railway)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test production build locally
cd backend && npm run build && NODE_ENV=production npm start

# Test frontend production build
cd frontend && npm run build && npm run preview
```
