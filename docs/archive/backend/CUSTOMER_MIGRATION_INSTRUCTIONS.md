# Customer Schema Migration Instructions

## Overview
This guide explains how to apply the customer database schema changes (Prompt 1.1) to your MindFlow database.

## What Was Changed

### 1. Database Schema (`prisma/schema.prisma`)
- **Replaced** the existing `Customer` model with a new structure
- **Added** `CustomerContact` model for tracking multiple contacts per customer
- **Added** `CustomerPricingTier` model for time-based pricing tiers
- **Added** `CustomerExternalId` model for external system mapping
- **Added** `CustomerType` enum (PRODUCTION, SEMI_CUSTOM, FULL_CUSTOM)

### 2. TypeScript Types (`/shared/types/customer.ts`)
- Created comprehensive TypeScript interfaces for all customer models
- Added input/output types for CRUD operations
- Added query types for listing and filtering customers

### 3. Seed Data (`prisma/seed.ts`)
- Created seed script with 3 sample customers:
  1. **Richmond American Homes** (Production, Tier 1, 15% discount)
  2. **Holt Homes** (Production, Tier 2, 10% discount)
  3. **Mountain View Custom Homes** (Semi-Custom, Custom tier, 12.5% discount)

## Prerequisites

1. **PostgreSQL Database Running**
   ```bash
   # If using Docker Compose from project root
   docker-compose up -d
   ```

2. **Environment Variables Set**
   - Verify `/backend/.env` has correct `DATABASE_URL`
   - Default: `postgresql://mindflow:mindflow_dev_password@localhost:5432/mindflow_dev?schema=public`

## Migration Steps

### Step 1: Generate Prisma Client

```bash
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm run prisma:generate
```

This regenerates the Prisma Client with the new customer models.

### Step 2: Create and Run Migration

```bash
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx prisma migrate dev --name create_customers
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your database
- Create the following tables:
  - `customers`
  - `customer_contacts`
  - `customer_pricing_tiers`
  - `customer_external_ids`

**IMPORTANT**: This is a destructive change to the existing `Customer` table. Any existing customer data will be lost. Make a backup if you have important data!

### Step 3: Seed Sample Data

```bash
cd backend
npm run prisma:seed
```

This will create 3 sample customers with:
- Multiple contacts per customer
- Pricing tier definitions
- External system ID mappings

Expected output:
```
🌱 Starting seed...
📦 Creating RICHMOND customer...
✅ Created customer: Richmond American Homes
📦 Creating HOLT customer...
✅ Created customer: Holt Homes
📦 Creating Mountain View Custom Homes customer...
✅ Created customer: Mountain View Custom Homes

📊 Seed Summary:
   Customers: 3
   Contacts: 7
   Pricing Tiers: 3
   External IDs: 5
✨ Seed completed successfully!
```

### Step 4: Verify in Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Open http://localhost:5555 and verify:
- 3 customers in the `customers` table
- 7 contacts in the `customer_contacts` table
- 3 pricing tiers in the `customer_pricing_tiers` table
- 5 external IDs in the `customer_external_ids` table

## Troubleshooting

### Error: "Failed to fetch engine file"
**Solution**: Set the environment variable to bypass checksum validation:
```bash
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

### Error: "Database 'mindflow_dev' does not exist"
**Solution**: Create the database first:
```bash
docker-compose up -d
# Wait 10 seconds for PostgreSQL to start
npx prisma migrate dev --name init
```

### Error: "relation 'customers' already exists"
**Solution**: You may have run the migration before. Check your migrations:
```bash
npx prisma migrate status
```

### Seed Script Fails
**Solution**: The seed script cleans existing data first. If you get foreign key errors:
```bash
# Reset the database completely
npx prisma migrate reset
# This will drop all tables and re-run all migrations + seed
```

## Quick Commands Summary

```bash
# Complete setup from scratch
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npm run prisma:generate
npx prisma migrate dev --name create_customers
npm run prisma:seed
npm run prisma:studio
```

## Next Steps

After verifying the schema and seed data:
1. Start the backend server: `cd backend && npm run dev`
2. Test the customer API endpoints (once created in future prompts)
3. Verify relationships work correctly

## Database Schema Reference

### Customer Model
```typescript
{
  id: string (UUID)
  customerName: string
  customerType: CustomerType (PRODUCTION | SEMI_CUSTOM | FULL_CUSTOM)
  pricingTier: string?
  primaryContactId: string?
  isActive: boolean
  notes: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### CustomerContact Model
```typescript
{
  id: string (UUID)
  customerId: string (FK → customers.id)
  contactName: string
  role: string?
  email: string?
  phone: string?
  receivesNotifications: boolean
  isPrimary: boolean
  createdAt: DateTime
}
```

### CustomerPricingTier Model
```typescript
{
  id: string (UUID)
  customerId: string (FK → customers.id)
  tierName: string
  discountPercentage: Decimal(5,2)
  effectiveDate: DateTime
  expirationDate: DateTime?
  createdAt: DateTime
}
```

### CustomerExternalId Model
```typescript
{
  id: string (UUID)
  customerId: string (FK → customers.id)
  externalSystem: string
  externalCustomerId: string
  externalCustomerName: string?
  isPrimary: boolean
  createdAt: DateTime

  UNIQUE (customerId, externalSystem)
}
```

## Success Criteria ✅

- ✅ All customer tables created
- ✅ Seed data loads successfully (3 customers, 7 contacts, 3 pricing tiers, 5 external IDs)
- ✅ Relationships work (customer → contacts, pricing tiers, external IDs)
- ✅ Prisma Studio shows all data correctly
