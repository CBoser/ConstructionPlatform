# MindFlow - Database Setup Guide

## Prerequisites

- **Node.js 20+** and npm
- **Docker Desktop** (for local PostgreSQL)
- **Git**

## Local Development Setup

### 1. Install Dependencies

```bash
# From project root
npm install
```

This will install dependencies for both frontend and backend.

### 2. Start PostgreSQL

```bash
# Start PostgreSQL in Docker
docker compose up -d

# Verify it's running
docker ps
# Should see: mindflow-postgres

# View logs
docker compose logs postgres
```

**Database Credentials (from docker-compose.yml):**
- Host: `localhost`
- Port: `5432`
- User: `mindflow`
- Password: `mindflow_dev_password`
- Database: `mindflow_dev`

### 3. Configure Environment Variables

The `.env` file in `/backend` should already have the correct settings:

```bash
cd backend
cat .env
# Should show: DATABASE_URL="postgresql://mindflow:mindflow_dev_password@localhost:5432/mindflow_dev?schema=public"
```

If `.env` doesn't exist, copy from `.env.example`:
```bash
cp .env.example .env
```

### 4. Run Database Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Migration will create all tables from schema.prisma
```

You should see output like:
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20241207_120000_init/
      └─ migration.sql
```

### 5. (Optional) Seed Initial Data

```bash
# Coming in next phase
npm run prisma:seed
```

### 6. Explore Database with Prisma Studio

```bash
npm run prisma:studio
```

Opens at: http://localhost:5555

You can browse all tables, view data, and even make test edits.

### 7. Start Development Servers

```bash
# From project root
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

Check logs for:
```
✓ Database connected successfully
⚡️ [server]: Server is running at http://localhost:3001
📊 [database]: Connected to PostgreSQL
🚀 [ready]: MindFlow API is ready to accept requests
```

### 8. Test Database Connection

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "message": "MindFlow API is running",
  "database": "connected",
  "timestamp": "2024-12-07T12:00:00.000Z"
}
```

---

## Database Schema Overview

The Prisma schema (`backend/prisma/schema.prisma`) includes:

### Foundation Layer
- **User** - Authentication & authorization
- **Customer** - Builder customers with pricing tiers
- **CustomerPricing** - Customer-specific price overrides
- **Plan** - Floor plan library
- **PlanElevation** - Plan facade variations (A/B/C/D)
- **PlanOption** - Upgrades and modifications
- **PlanTemplateItem** - BOM template (the "recipe")
- **Material** - Material database with vendor costs
- **Vendor** - Vendor information
- **PricingHistory** - Transparent pricing pipeline
- **RandomLengthsPricing** - Commodity pricing integration

### Operational Core
- **Community** - Subdivisions/communities
- **Lot** - Lot inventory
- **Job** - Construction jobs
- **JobOption** - Options selected for a job
- **Takeoff** - Bill of materials for a job
- **TakeoffLineItem** - Individual line items with **variance tracking**
- **TakeoffValidation** - Multi-stage validation

### Transaction Layer
- **PurchaseOrder** - PO lifecycle tracking

### Intelligence Layer
- **VariancePattern** - Detected variance patterns (feedback loop)
- **VarianceReview** - Human review of patterns
- **Notification** - User notifications
- **AuditLog** - Complete audit trail

---

## Key Features Built Into Schema

### 1. **Variance Tracking (Feedback Loop)**

Every `TakeoffLineItem` captures:
- `quantityEstimated` - From plan template
- `quantityActual` - What was actually used
- `variance` - The difference
- `variancePercent` - Percentage variance
- `varianceReason` - Why it varied

This feeds the **learning system**.

### 2. **Hierarchical Learning**

`VariancePattern` model supports learning at multiple levels:
- `PLAN_SPECIFIC` - Single plan (Phase 1)
- `CROSS_PLAN` - Patterns across plans
- `COMMUNITY` - Community-level
- `BUILDER` - Builder-level patterns
- `REGIONAL` - Regional trends

### 3. **Transparent Pricing Pipeline**

`PricingHistory` stores `calculationSteps` as JSON:
```json
{
  "steps": [
    { "step": 1, "desc": "Base vendor cost", "amount": 2100.00 },
    { "step": 2, "desc": "RL commodity adjustment +15%", "amount": 175.00 },
    { "step": 3, "desc": "Customer Tier 2 discount -7%", "amount": -150.00 },
    { "step": 4, "desc": "Applied margin 20%", "amount": 422.00 },
    { "step": 5, "desc": "Final unit price", "amount": 2547.00 }
  ]
}
```

Every calculation is auditable and explainable.

### 4. **Progressive Automation**

`VariancePattern` status workflow:
1. `DETECTED` - System detects pattern
2. `UNDER_REVIEW` - Flagged for human review
3. `APPROVED` - Approved for auto-application
4. `APPLIED` - Applied to templates
5. `REJECTED` - Rejected by reviewer

Confidence score (`0.0` to `1.0`) determines automation level.

---

## Common Tasks

### View All Tables
```bash
npm run prisma:studio
```

### Reset Database (DESTRUCTIVE)
```bash
cd backend
npx prisma migrate reset
# This will:
# 1. Drop database
# 2. Recreate database
# 3. Run all migrations
# 4. Run seed (if configured)
```

### Create New Migration
```bash
# 1. Edit schema.prisma
# 2. Run migration
npm run prisma:migrate
# Prisma will prompt for migration name
```

### Generate Prisma Client (after schema changes)
```bash
npm run prisma:generate
```

### Check Database Status
```bash
npm run prisma:studio
# or
npx prisma migrate status
```

---

## Troubleshooting

### "Port 5432 is already in use"
```bash
# Stop existing PostgreSQL
docker compose down

# Or stop system PostgreSQL
sudo systemctl stop postgresql  # Linux
brew services stop postgresql    # macOS
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
docker ps

# Check logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### "Prisma Client not generated"
```bash
cd backend
npm run prisma:generate
```

### "Migration failed"
```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --applied <migration_name>
# or
npx prisma migrate reset  # WARNING: Deletes all data
```

---

## Production Deployment

### Railway (Recommended)

1. **Create Railway project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Set environment variables**
   Railway auto-sets `DATABASE_URL`

4. **Deploy backend**
   ```bash
   railway up
   ```

5. **Run migrations**
   ```bash
   railway run npm run prisma:migrate:prod
   ```

### Manual PostgreSQL Setup

If not using Railway PostgreSQL:

1. Create database:
   ```sql
   CREATE DATABASE mindflow_prod;
   CREATE USER mindflow_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE mindflow_prod TO mindflow_user;
   ```

2. Update `DATABASE_URL` in production `.env`

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## Database Backup & Restore

### Backup
```bash
# Using Docker
docker exec -t mindflow-postgres pg_dump -U mindflow mindflow_dev > backup_$(date +%Y%m%d).sql

# Or local PostgreSQL
pg_dump -U mindflow -h localhost mindflow_dev > backup.sql
```

### Restore
```bash
# Using Docker
docker exec -i mindflow-postgres psql -U mindflow mindflow_dev < backup.sql

# Or local PostgreSQL
psql -U mindflow -h localhost mindflow_dev < backup.sql
```

---

## Next Steps

✅ Database schema created with all Foundation Layer models
✅ Variance tracking hooks in place
✅ Transparent pricing pipeline ready
✅ Hierarchical learning structure defined

**Phase 1 Remaining:**
- [ ] Create seed data (sample customers, plans, materials)
- [ ] Build API endpoints (CRUD for Foundation Layer)
- [ ] Implement PricingPipelineService (transparent calculations)
- [ ] Create frontend components

**Coming in Phase 4:**
- Variance analysis engine
- Pattern detection algorithms
- Automated template updates
- Weekly variance reports

---

For more information, see:
- [README.md](./README.md) - Full platform vision
- [Prisma Docs](https://www.prisma.io/docs) - Prisma ORM documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - PostgreSQL reference
