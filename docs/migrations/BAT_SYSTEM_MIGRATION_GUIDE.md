# BAT System Integration Migration Guide

## Overview
This guide documents the database schema changes required to integrate the BAT (Builder Analysis Tool) system pricing and customer management.

## Migration Steps

### 1. Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name add_bat_system_integration
```

This will apply the following schema changes:

### 2. Schema Changes Summary

#### Customer Model Updates
**New Fields Added:**
- `billToId` (String, unique) - Primary BAT identifier (e.g., 655352)
- `customerId` (String, unique, mapped to `customer_id_bat`) - Secondary ERP ID (e.g., 662662)
- `salesId` (String) - Salesperson ID (e.g., P761647)
- `salespersonName` (String) - Salesperson name
- `locationCode` (String) - Yard location code (CLACORAD, etc.)
- `accountType` (String) - M (Master) or Q (Quote)

**New Indexes:**
- `billToId`
- `locationCode`

#### CustomerPricingTier Model Restructure
**New Fields:**
- `dartCategory` (Int) - DART category code 1-15
- `dartCategoryName` (String) - Category name (e.g., "01-Lumber")
- `tier` (String) - Tier code ("01"-"12" or "L5")
- `updatedAt` (DateTime) - Last update timestamp

**Updated Fields:**
- `tierName` - Now optional (legacy field)
- `discountPercentage` - Now optional (legacy field)

**New Unique Constraint:**
- `[customerId, dartCategory, effectiveDate]`

**New Indexes:**
- `dartCategory`

#### Material Model Updates
**New Fields:**
- `dartCategory` (Int, nullable) - DART category for pricing
- `dartCategoryName` (String, nullable) - DART category name

**New Relationships:**
- `priceRevisions` - Link to PriceRevision model

**New Index:**
- `dartCategory`

#### New PriceRevision Model
Tracks all price changes over time with full audit trail.

**Fields:**
- `id` (UUID)
- `materialId` (String)
- `revisionNumber` (Int) - Sequential per material
- `revisionType` (String) - Type of revision
- `tierPrices` (JSON) - All tier prices PL01-PL12
- `vendorCost` (Decimal)
- `freight` (Decimal)
- `commodityFactor` (Decimal, nullable)
- `baseMargin` (Decimal)
- `effectiveDate` (DateTime)
- `expiresAt` (DateTime, nullable)
- `changedBy` (String, nullable)
- `changeReason` (String, nullable)
- `notes` (Text, nullable)
- `batImportDate` (DateTime, nullable)
- `batFileName` (String, nullable)
- `createdAt` (DateTime)

**Unique Constraint:**
- `[materialId, revisionNumber]`

**Indexes:**
- `materialId`
- `effectiveDate`
- `revisionType`

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Seed Data

```bash
npm run seed
```

This will create:
- Holt Homes (Heritage HMS of Molalla OR) with full tier assignments
- Richmond American Homes OR with full tier assignments
- Manor Homes NW with medium-tier assignments

### 5. Verify Migration

```sql
-- Check customer BAT fields
SELECT id, customer_name, bill_to_id, customer_id_bat, sales_id, location_code
FROM customers
WHERE bill_to_id IS NOT NULL;

-- Check pricing tiers
SELECT c.customer_name, cpt.dart_category_name, cpt.tier
FROM customer_pricing_tiers cpt
JOIN customers c ON c.id = cpt.customer_id
ORDER BY c.customer_name, cpt.dart_category;

-- Check material DART categories
SELECT sku, description, dart_category, dart_category_name
FROM materials
WHERE dart_category IS NOT NULL;

-- Check price revisions
SELECT m.sku, pr.revision_number, pr.revision_type, pr.effective_date
FROM price_revisions pr
JOIN materials m ON m.id = pr.material_id
ORDER BY pr.effective_date DESC;
```

## Breaking Changes

### CustomerPricingTier Structure Change
**Before:**
```typescript
{
  tierName: 'TIER_1',
  discountPercentage: 15.0,
  effectiveDate: Date,
  expirationDate: Date
}
```

**After:**
```typescript
{
  dartCategory: 1,
  dartCategoryName: '01-Lumber',
  tier: '09',
  tierName: 'TIER_1',  // Optional legacy field
  discountPercentage: 15.0,  // Optional legacy field
  effectiveDate: Date,
  expirationDate: Date
}
```

## API Changes Required

### Customer Endpoints
Update to include BAT fields:
- `GET /api/customers/:id` - Include billToId, salesId, etc.
- `POST /api/customers` - Accept BAT fields
- `PUT /api/customers/:id` - Update BAT fields

### Pricing Tier Endpoints
New endpoints needed:
- `GET /api/customers/:id/pricing-tiers` - Get all tier assignments
- `POST /api/customers/:id/pricing-tiers` - Create tier assignment
- `PUT /api/customers/:id/pricing-tiers/:dartCategory` - Update tier
- `DELETE /api/customers/:id/pricing-tiers/:dartCategory` - Remove tier

### Material Pricing Endpoints
New endpoints needed:
- `GET /api/materials/:id/price-revisions` - Get price history
- `POST /api/materials/:id/price-revisions` - Create price revision
- `GET /api/pricing/calculate` - Calculate customer price
- `GET /api/pricing/breakdown` - Get price breakdown

## Reference Files

- `/docs/reference/BAT_SYSTEM_GUIDE.md` - Complete BAT system reference
- `/backend/src/constants/dartCategories.ts` - DART category constants
- `/backend/src/services/pricingTier.service.ts` - Pricing calculation service
- `/backend/prisma/seeds/customers.seed.ts` - Customer seed data

## Rollback

If needed, rollback with:

```bash
npx prisma migrate reset
```

**Warning:** This will delete all data. Use with caution.

## Support

For questions or issues with this migration, refer to:
- Sprint 3 Plan: `/docs/sprints/sprint-03/PLAN.md`
- Schema file: `/backend/prisma/schema.prisma`
