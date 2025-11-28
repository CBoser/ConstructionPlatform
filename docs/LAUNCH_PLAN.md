# MindFlow Construction Management Platform
# Launch Plan v1.0

---

## Executive Summary

**Mission:** Launch MindFlow MVP to production, onboard first builder clients (Richmond American, Holt Homes), and establish foundation for scaling to Sekisui House.

**Architecture:** Railway (backend) + Vercel (frontend) + Neon/Railway Postgres + Cloudflare R2 (storage)

**Target Cost:** $20-75/month for MVP

**Timeline:** Ready for production deployment

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Pre-Deployment Checklist](#2-pre-deployment-checklist)
3. [Deployment Steps](#3-deployment-steps)
4. [Post-Deployment Verification](#4-post-deployment-verification)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Onboarding First Clients](#6-onboarding-first-clients)
7. [Monitoring & Maintenance](#7-monitoring--maintenance)
8. [Scaling Triggers](#8-scaling-triggers)
9. [Rollback Procedures](#9-rollback-procedures)
10. [Support & Troubleshooting](#10-support--troubleshooting)

---

## 1. Infrastructure Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                               │
│                   (DNS + SSL + CDN)                             │
│                  mindflow.construction                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│        VERCEL           │     │           RAILWAY               │
│   app.mindflow.construction   │     │                                 │
│                         │     │  ┌───────────┐  ┌───────────┐   │
│  • React/Vite frontend  │     │  │  Backend  │  │  Worker   │   │
│  • PWA enabled          │     │  │ (Express) │  │ (BullMQ)  │   │
│  • Global CDN           │     │  └───────────┘  └───────────┘   │
│                         │     │        │              │         │
└─────────────────────────┘     │  ┌─────┴──────────────┴─────┐   │
                                │  │      PostgreSQL          │   │
                                │  │   (Railway managed)      │   │
                                │  └──────────────────────────┘   │
                                │                                 │
                                │  ┌──────────────────────────┐   │
                                │  │         Redis            │   │
                                │  │   (Jobs + Caching)       │   │
                                │  └──────────────────────────┘   │
                                └─────────────────────────────────┘
                                              │
                                              ▼
                                ┌─────────────────────────────────┐
                                │       CLOUDFLARE R2             │
                                │    (Plan Storage - Future)      │
                                │                                 │
                                │  • Construction plans (PDFs)    │
                                │  • Takeoff exports              │
                                │  • Zero egress fees             │
                                └─────────────────────────────────┘
```

### Service Stack

| Component | Service | Tier | Monthly Cost |
|-----------|---------|------|--------------|
| Frontend | Vercel | Free/Pro | $0-20 |
| Backend API | Railway | Starter | $5-20 |
| Background Worker | Railway | Starter | $5-15 |
| Database | Railway PostgreSQL | Included | $5-10 |
| Cache/Queue | Railway Redis | Included | $5-10 |
| File Storage | Cloudflare R2 | Pay-as-you-go | $0-20 |
| Domain/DNS | Cloudflare | Free | $0 |
| Error Tracking | Sentry | Free | $0 |
| Uptime Monitoring | UptimeRobot | Free | $0 |
| **Total** | | | **$20-75/mo** |

---

## 2. Pre-Deployment Checklist

### 2.1 Code Readiness

```markdown
## Security Fixes (Completed)
- [x] Authentication on all sensitive endpoints
- [x] Remove insecure JWT_SECRET default
- [x] Add request body size limits (10kb)
- [x] Fix backend TypeScript config
- [x] HTTPS enforcement for API URLs
- [x] Seed script safety check (requires SEED_FORCE=true)
- [x] Database connection pooling configuration

## Health Scan Fixes (Completed)
- [x] Error Boundary component
- [x] Modal accessibility (role="dialog", focus trap)
- [x] Notification button aria-label
- [x] Skip navigation links
- [x] robots.txt
- [x] sitemap.xml
- [x] Open Graph meta tags
- [x] Offline fallback page
- [x] PWA update prompt

## Code Quality
- [ ] Run `npm audit` on both frontend and backend
- [ ] Run `npm run build` - verify no TypeScript errors
- [ ] Run `npm test` - all tests passing
- [ ] Review console for warnings/errors
```

### 2.2 Environment Preparation

```markdown
## Accounts to Create
- [ ] Railway account (railway.app)
- [ ] Vercel account (vercel.com)
- [ ] Cloudflare account (cloudflare.com)
- [ ] Sentry account (sentry.io)
- [ ] UptimeRobot account (uptimerobot.com)
- [ ] Domain registered (mindflow.construction or similar)

## Secrets to Generate
- [ ] JWT_SECRET (32+ random characters)
- [ ] Database credentials (Railway auto-generates)
- [ ] R2 access keys (when ready for storage)
```

### 2.3 Generate Required Secrets

```bash
# Generate JWT Secret (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output: a1b2c3d4e5f6...(64 characters)
# Save this securely - you'll need it for Railway
```

---

## 3. Deployment Steps

### 3.1 Railway Backend Deployment

#### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your `ConstructionPlatform` repository

#### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will provision a PostgreSQL instance
3. Click on the PostgreSQL service to view connection details

#### Step 3: Configure Backend Service

1. Click **"New"** → **"GitHub Repo"** → Select your repo
2. Configure the service:
   - **Name:** `mindflow-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run prisma:generate && npx prisma migrate deploy && npm run build`
   - **Start Command:** `npm start`

#### Step 4: Set Environment Variables

In the backend service, go to **"Variables"** tab and add:

```bash
# REQUIRED - Core Configuration
NODE_ENV=production
PORT=3001

# REQUIRED - Database (Railway provides this automatically if you link the DB)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# REQUIRED - Security (GENERATE A NEW SECRET!)
JWT_SECRET=<your-64-character-hex-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# REQUIRED - CORS (update with your actual frontend URL)
ALLOWED_ORIGINS=https://your-frontend.up.railway.app

# RECOMMENDED - Database Pool Settings
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=10
```

#### Step 5: Link PostgreSQL

1. Go to your backend service → **"Variables"**
2. Click **"Add Variable Reference"**
3. Select your PostgreSQL service
4. This automatically sets `DATABASE_URL`

#### Step 6: Deploy

Railway will auto-deploy when you push to your connected branch.

---

### 3.2 Vercel Frontend Deployment

#### Step 1: Connect Repository

1. Go to vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` directory as root

#### Step 2: Configure Build Settings

```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Step 3: Set Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend.up.railway.app
VITE_APP_NAME=MindFlow
VITE_APP_VERSION=1.0.0
```

#### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy automatically.

#### Step 5: Update Backend CORS

After Vercel generates your URL, update Railway backend variables:

```bash
ALLOWED_ORIGINS=https://mindflow-frontend.vercel.app
```

---

### 3.3 Domain Configuration (Cloudflare) - Optional

#### Step 1: Add Domain to Cloudflare

1. Add site: mindflow.construction
2. Update nameservers at your registrar

#### Step 2: Configure DNS Records

```
Type    Name    Content                         Proxy
A       @       76.76.21.21 (Vercel)           Yes
CNAME   app     cname.vercel-dns.com           Yes
CNAME   api     your-backend.up.railway.app    Yes
```

#### Step 3: SSL/TLS Settings

- SSL/TLS mode: Full (strict)
- Always Use HTTPS: On
- Minimum TLS Version: 1.2

---

## 4. Post-Deployment Verification

### 4.1 Health Checks

```bash
# Backend Health Check
curl https://api.mindflow.construction/health

# Expected Response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4.2 Verification Checklist

```markdown
## Backend Verification
- [ ] Health endpoint returns 200 OK
- [ ] Database connection confirmed
- [ ] Authentication endpoints working
  - [ ] POST /api/v1/auth/register
  - [ ] POST /api/v1/auth/login
  - [ ] POST /api/v1/auth/refresh
- [ ] Protected routes require auth token
- [ ] CORS allows frontend origin

## Frontend Verification
- [ ] App loads without console errors
- [ ] Login/Register flow works
- [ ] API calls succeed (no CORS errors)
- [ ] Plans page loads and displays data
- [ ] Builders page loads and displays data
- [ ] Mobile responsive design works

## Infrastructure Verification
- [ ] SSL certificates valid (https://)
- [ ] Custom domains resolving (if configured)
- [ ] Railway auto-deploy on git push
- [ ] Vercel auto-deploy on git push
```

---

## 5. Environment Variables Reference

### 5.1 Backend (Railway) - Complete Reference

```bash
#===============================================
# REQUIRED - App will not start without these
#===============================================

NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<64-character-hex-string>
ALLOWED_ORIGINS=https://app.mindflow.construction

#===============================================
# RECOMMENDED - Improves reliability
#===============================================

# Database Pool
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=10

# JWT Expiration
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

#===============================================
# OPTIONAL - Enable as needed
#===============================================

# Redis (for job queues - future)
# REDIS_URL=${{Redis.REDIS_URL}}

# Error Tracking
# SENTRY_DSN=https://xxx@sentry.io/xxx

# File Storage (Phase 2)
# R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
# R2_ACCESS_KEY_ID=<key>
# R2_SECRET_ACCESS_KEY=<secret>
# R2_BUCKET_NAME=mindflow-plans
```

### 5.2 Frontend (Vercel)

```bash
#===============================================
# REQUIRED
#===============================================

VITE_API_URL=https://api.mindflow.construction

#===============================================
# OPTIONAL
#===============================================

VITE_APP_NAME=MindFlow
VITE_APP_VERSION=1.0.0
```

---

## 6. Onboarding First Clients

### 6.1 Priority Order

1. **Holt Homes** - Existing relationship with Dave Templeton
2. **Richmond American** - BAT system migration in progress
3. **Sekisui House** - Strategic opportunity via Mike Henninger

### 6.2 Client Onboarding Checklist

```markdown
## Pre-Onboarding
- [ ] Create organization in database
- [ ] Set up admin user account
- [ ] Configure organization settings
- [ ] Create welcome email with login instructions

## Account Setup
- [ ] Client admin logs in
- [ ] Password changed from temporary
- [ ] Profile completed
- [ ] Team members invited
- [ ] Roles/permissions configured

## Data Migration
- [ ] Import existing communities
- [ ] Import plan catalog (if applicable)
- [ ] Verify data integrity

## Training
- [ ] Admin training session (1 hour)
- [ ] End-user training (30 min)
- [ ] Provide quick reference guide
- [ ] Share support contact info

## Go-Live
- [ ] Soft launch with pilot group
- [ ] Gather feedback (1 week)
- [ ] Address critical issues
- [ ] Full rollout to organization
```

---

## 7. Monitoring & Maintenance

### 7.1 Monitoring Stack

| Tool | Purpose | Setup |
|------|---------|-------|
| Sentry | Error tracking | Add SENTRY_DSN to env |
| UptimeRobot | Uptime monitoring | Monitor /health endpoint |
| Railway Metrics | Server metrics | Built-in dashboard |
| Vercel Analytics | Frontend performance | Enable in dashboard |

### 7.2 Alerts to Configure

```markdown
## Critical Alerts (Immediate Response)
- [ ] Health check fails (UptimeRobot)
- [ ] Error rate > 5% (Sentry)
- [ ] Database connection failures
- [ ] SSL certificate expiring (< 14 days)

## Warning Alerts (Respond within 24h)
- [ ] Response time P95 > 1000ms
- [ ] Memory usage > 80%
- [ ] Storage quota > 80%
- [ ] Failed login attempts > 10/hour
```

### 7.3 Maintenance Schedule

```markdown
## Weekly
- [ ] Review error tracking dashboard
- [ ] Check uptime status
- [ ] Review performance metrics

## Monthly
- [ ] Dependency updates (npm audit)
- [ ] Security patches
- [ ] Database maintenance
- [ ] Cost review
```

---

## 8. Scaling Triggers

### 8.1 When to Scale

| Metric | Current Limit | Trigger to Scale | Action |
|--------|---------------|------------------|--------|
| Concurrent users | 50 | >40 sustained | Add Railway replica |
| Database connections | 20 | >15 sustained | Increase pool limit |
| Response time P95 | 500ms | >400ms | Add caching layer |
| Storage | 10GB | >8GB | Review storage tier |

### 8.2 Scaling Progression

```
MVP (Now)                    Growth (100+ users)           Scale (1000+ users)
─────────────────────────    ─────────────────────────    ─────────────────────────
Railway (1 instance)    →    Railway (2+ instances)   →   AWS ECS (4+ tasks)
Railway Postgres        →    Neon Pro                 →   RDS Multi-AZ
$20-75/mo               →    $100-300/mo              →   $500-2000/mo
```

---

## 9. Rollback Procedures

### 9.1 Backend Rollback (Railway)

1. Go to Railway Dashboard → Deployments
2. Find the last working deployment
3. Click "Rollback" or redeploy that commit

### 9.2 Frontend Rollback (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

### 9.3 Database Rollback

```bash
# In Railway shell:
npx prisma migrate resolve --rolled-back <migration-name>

# For point-in-time recovery, contact Railway support
```

---

## 10. Support & Troubleshooting

### 10.1 Common Issues

#### CORS Errors

```
Error: Access-Control-Allow-Origin missing
```

**Solution:** Verify `ALLOWED_ORIGINS` in Railway matches your frontend URL exactly (with https://, no trailing slash).

#### Database Connection Failed

```
Error: Can't reach database server
```

**Solution:**
1. Check `DATABASE_URL` is set correctly
2. Verify Railway PostgreSQL service is running
3. Check connection limit isn't exceeded

#### JWT Token Invalid

```
Error: Invalid or expired token
```

**Solution:**
1. Ensure JWT_SECRET is the same across deployments
2. Clear browser localStorage
3. Login again

### 10.2 Debug Commands

```bash
# Check Railway service status
railway status

# View live logs
railway logs -f

# Open Railway shell
railway shell

# Run command in Railway context
railway run <command>
```

### 10.3 Key URLs

```
Production App:    https://app.mindflow.construction (or Vercel URL)
Production API:    https://api.mindflow.construction (or Railway URL)
Railway Dashboard: https://railway.app/dashboard
Vercel Dashboard:  https://vercel.com/dashboard
```

---

## Quick Reference Card

### Deploy Commands

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Backend (Railway) - auto-deploys on git push

# Run migrations manually if needed
railway run npx prisma migrate deploy
```

### Emergency Rollback

```bash
# Backend: Use Railway dashboard to rollback
# Frontend: Use Vercel dashboard to promote previous deployment
```

---

## Launch Approval Checklist

```markdown
## Final Sign-Off

### Technical Readiness
- [ ] All pre-deployment checks passed
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] Error tracking active

### Security Readiness
- [ ] JWT_SECRET is unique and secure
- [ ] No sensitive data in logs
- [ ] CORS properly configured
- [ ] Rate limiting enabled

### Business Readiness
- [ ] First client identified
- [ ] Onboarding materials prepared
- [ ] Support process defined

Date: _____________
Signed: _____________
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial launch plan |

---

## Related Documents

- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Detailed Railway-specific instructions
- [Security Audit](./SECURITY_AUDIT_2025-11-13.md) - Security assessment results
- [README](../README.md) - Project overview and local setup

---

*This document consolidates the MindFlow deployment architecture, scaling strategy, and operational procedures.*
