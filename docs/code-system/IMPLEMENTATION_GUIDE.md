# Code System Implementation Guide

**Document**: Sprint 2 - Code System Review
**Date**: 2025-11-29
**Status**: Ready for Implementation

---

## Overview

This guide provides step-by-step instructions for implementing the hybrid trade-based coding system in MindFlow Platform.

---

## Phase 1: Schema Updates (Sprint 3)

### 1.1 Add New Fields to Material Model

Update `backend/prisma/schema.prisma`:

```prisma
model Material {
  id          String   @id @default(uuid())

  // NEW: Primary material code
  code            String?  // Will become required after migration
  tradeCode       String?  // Parsed from code: FRM, ROOF, etc.
  categoryCode    String?  // Parsed from code: LUM, SHG, etc.

  // Existing fields (keep unchanged)
  sku         String   @unique
  description String
  category    MaterialCategory
  subcategory String?
  dartCategory     Int?
  dartCategoryName String?
  unitOfMeasure String
  vendorCost  Decimal  @db.Decimal(10, 2)
  freight     Decimal  @db.Decimal(10, 2) @default(0)
  isActive    Boolean  @default(true)

  // NEW: Optional industry references
  csiDivision      String?
  csiSection       String?
  uniformatElement String?

  // NEW: Optional phase association
  primaryPhase     ConstructionPhase?

  // ... rest of existing fields and relations
}

// NEW: Construction phase enum
enum ConstructionPhase {
  SITE_PREP       // 01
  FOUNDATION      // 02
  FRAMING         // 03
  MEP_ROUGH       // 04
  EXTERIOR        // 05
  INSULATION      // 06
  DRYWALL         // 07
  INTERIOR_FINISH // 08
  MEP_FINISH      // 09
  FINAL           // 10
}
```

### 1.2 Run Migration

```bash
cd backend
npx prisma migrate dev --name add_material_code_system
```

### 1.3 Create Trade/Category Reference Tables (Optional)

If you want enforced lookup tables:

```prisma
model TradeCategory {
  code        String   @id
  name        String
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  categories  MaterialCodeCategory[]

  @@map("trade_categories")
}

model MaterialCodeCategory {
  code        String   @id
  tradeCode   String
  name        String
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  trade       TradeCategory @relation(fields: [tradeCode], references: [code])

  @@map("material_code_categories")
}
```

---

## Phase 2: Code Generation (Sprint 3)

### 2.1 Code Generation Utility

Create `backend/src/utils/materialCodeGenerator.ts`:

```typescript
// Trade code mapping
const CATEGORY_TO_TRADE: Record<string, string> = {
  DIMENSIONAL_LUMBER: 'FRM',
  ENGINEERED_LUMBER: 'FRM',
  SHEATHING: 'FRM',
  PRESSURE_TREATED: 'FRM',
  HARDWARE: 'HDWR',
  CONCRETE: 'CONC',
  ROOFING: 'ROOF',
  SIDING: 'SIDE',
  INSULATION: 'INSL',
  DRYWALL: 'DRYW',
  OTHER: 'MISC',
};

// Category code mapping
const CATEGORY_CODES: Record<string, string> = {
  DIMENSIONAL_LUMBER: 'LUM',
  ENGINEERED_LUMBER: 'ENG',
  SHEATHING: 'SHT',
  PRESSURE_TREATED: 'PTW',
  HARDWARE: 'GEN',
  CONCRETE: 'MIX',
  ROOFING: 'GEN',
  SIDING: 'GEN',
  INSULATION: 'GEN',
  DRYWALL: 'SHT',
  OTHER: 'GEN',
};

export function generateMaterialCode(
  category: string,
  description: string,
  sku: string
): string {
  const trade = CATEGORY_TO_TRADE[category] || 'MISC';
  const cat = CATEGORY_CODES[category] || 'GEN';

  // Parse description for common patterns
  const details = parseDescription(description);

  // Build code
  const parts = [trade, cat, ...details].filter(Boolean);
  let code = parts.join('-').toUpperCase();

  // Ensure uniqueness by appending SKU suffix if needed
  if (code.length > 25) {
    code = code.substring(0, 20) + '-' + sku.substring(0, 4).toUpperCase();
  }

  return code;
}

function parseDescription(description: string): string[] {
  const parts: string[] = [];
  const upper = description.toUpperCase();

  // Lumber patterns
  const sizeMatch = upper.match(/(\d+)X(\d+)/);
  if (sizeMatch) {
    parts.push(`${sizeMatch[1]}X${sizeMatch[2]}`);
  }

  // Species patterns
  if (upper.includes('SPF') || upper.includes('SPRUCE')) parts.push('SPF');
  if (upper.includes('SYP') || upper.includes('SOUTHERN')) parts.push('SYP');
  if (upper.includes('DOUG') || upper.includes('FIR')) parts.push('DF');

  // Length patterns
  const lengthMatch = upper.match(/(\d+)['\s]*$/);
  if (lengthMatch) {
    parts.push(lengthMatch[1]);
  }

  return parts;
}

export function validateMaterialCode(code: string): boolean {
  // Pattern: TRADE-CATEGORY[-DETAIL]*
  const pattern = /^[A-Z]{3,4}-[A-Z]{2,4}(-[A-Z0-9\/.-]+)*$/;
  return pattern.test(code) && code.length <= 25;
}

export function parseMaterialCode(code: string): {
  trade: string;
  category: string;
  details: string[];
} {
  const parts = code.split('-');
  return {
    trade: parts[0] || '',
    category: parts[1] || '',
    details: parts.slice(2),
  };
}
```

### 2.2 Migration Script

Create `backend/prisma/scripts/generateMaterialCodes.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { generateMaterialCode, validateMaterialCode } from '../../src/utils/materialCodeGenerator';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting material code generation...');

  const materials = await prisma.material.findMany({
    where: { code: null },
  });

  console.log(`Found ${materials.length} materials without codes`);

  let success = 0;
  let failed = 0;
  const usedCodes = new Set<string>();

  for (const material of materials) {
    let code = generateMaterialCode(
      material.category,
      material.description,
      material.sku
    );

    // Ensure uniqueness
    let attempt = 0;
    while (usedCodes.has(code)) {
      attempt++;
      code = `${code.substring(0, 20)}-${attempt}`;
    }

    if (validateMaterialCode(code)) {
      usedCodes.add(code);

      const parsed = parseMaterialCode(code);

      await prisma.material.update({
        where: { id: material.id },
        data: {
          code,
          tradeCode: parsed.trade,
          categoryCode: parsed.category,
        },
      });

      success++;
      console.log(`✓ ${material.sku} -> ${code}`);
    } else {
      failed++;
      console.error(`✗ ${material.sku}: Invalid code generated: ${code}`);
    }
  }

  console.log(`\nComplete: ${success} success, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
npx ts-node prisma/scripts/generateMaterialCodes.ts
```

---

## Phase 3: API Updates (Sprint 3)

### 3.1 Update Material Routes

Add code-based filtering to `backend/src/routes/materials.ts`:

```typescript
// GET /api/materials
// Query params: trade, category, code, search

router.get('/', async (req, res) => {
  const { trade, category, code, search, page = 1, limit = 50 } = req.query;

  const where: Prisma.MaterialWhereInput = {
    isActive: true,
  };

  // Filter by trade code
  if (trade) {
    where.tradeCode = String(trade).toUpperCase();
  }

  // Filter by category code
  if (category) {
    where.categoryCode = String(category).toUpperCase();
  }

  // Filter by code (partial match)
  if (code) {
    where.code = {
      contains: String(code).toUpperCase(),
    };
  }

  // Search in code, description, or SKU
  if (search) {
    where.OR = [
      { code: { contains: String(search).toUpperCase() } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { sku: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { code: 'asc' },
    }),
    prisma.material.count({ where }),
  ]);

  res.json({
    data: materials,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});
```

### 3.2 Add Trade/Category Lookup Endpoints

```typescript
// GET /api/materials/trades
router.get('/trades', async (req, res) => {
  const trades = await prisma.material.groupBy({
    by: ['tradeCode'],
    _count: { id: true },
    where: { isActive: true, tradeCode: { not: null } },
    orderBy: { tradeCode: 'asc' },
  });

  res.json(trades.map(t => ({
    code: t.tradeCode,
    count: t._count.id,
  })));
});

// GET /api/materials/categories
router.get('/categories', async (req, res) => {
  const { trade } = req.query;

  const where: Prisma.MaterialWhereInput = {
    isActive: true,
    categoryCode: { not: null },
  };

  if (trade) {
    where.tradeCode = String(trade).toUpperCase();
  }

  const categories = await prisma.material.groupBy({
    by: ['tradeCode', 'categoryCode'],
    _count: { id: true },
    where,
    orderBy: [{ tradeCode: 'asc' }, { categoryCode: 'asc' }],
  });

  res.json(categories.map(c => ({
    trade: c.tradeCode,
    category: c.categoryCode,
    count: c._count.id,
  })));
});
```

---

## Phase 4: UI Updates (Sprint 4)

### 4.1 Material Code Display Component

Create `frontend/src/components/MaterialCode.tsx`:

```tsx
import React from 'react';

interface MaterialCodeProps {
  code: string;
  showLabels?: boolean;
}

export function MaterialCode({ code, showLabels = false }: MaterialCodeProps) {
  const parts = code.split('-');
  const [trade, category, ...details] = parts;

  const tradeLabels: Record<string, string> = {
    FRM: 'Framing',
    ROOF: 'Roofing',
    SIDE: 'Siding',
    CONC: 'Concrete',
    // ... add more
  };

  return (
    <div className="material-code">
      <span className="code-trade" title={tradeLabels[trade]}>
        {trade}
      </span>
      <span className="code-separator">-</span>
      <span className="code-category">{category}</span>
      {details.map((d, i) => (
        <React.Fragment key={i}>
          <span className="code-separator">-</span>
          <span className="code-detail">{d}</span>
        </React.Fragment>
      ))}
      {showLabels && tradeLabels[trade] && (
        <span className="code-label">{tradeLabels[trade]}</span>
      )}
    </div>
  );
}
```

### 4.2 Trade Filter Component

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface TradeFilterProps {
  value: string | null;
  onChange: (trade: string | null) => void;
}

export function TradeFilter({ value, onChange }: TradeFilterProps) {
  const { data: trades } = useQuery({
    queryKey: ['material-trades'],
    queryFn: () => fetch('/api/materials/trades').then(r => r.json()),
  });

  const tradeNames: Record<string, string> = {
    FRM: 'Framing',
    ROOF: 'Roofing',
    SIDE: 'Siding',
    CONC: 'Concrete',
    INSL: 'Insulation',
    DRYW: 'Drywall',
    ELEC: 'Electrical',
    PLMB: 'Plumbing',
    HVAC: 'HVAC',
    TRIM: 'Trim/Finish',
    HDWR: 'Hardware',
    MISC: 'Miscellaneous',
  };

  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      className="trade-filter"
    >
      <option value="">All Trades</option>
      {trades?.map((t: { code: string; count: number }) => (
        <option key={t.code} value={t.code}>
          {tradeNames[t.code] || t.code} ({t.count})
        </option>
      ))}
    </select>
  );
}
```

---

## Phase 5: Testing

### 5.1 Unit Tests

```typescript
// backend/src/utils/__tests__/materialCodeGenerator.test.ts

import {
  generateMaterialCode,
  validateMaterialCode,
  parseMaterialCode,
} from '../materialCodeGenerator';

describe('generateMaterialCode', () => {
  test('generates valid lumber code', () => {
    const code = generateMaterialCode(
      'DIMENSIONAL_LUMBER',
      '2x4 SPF #2 8ft',
      'SKU123'
    );
    expect(code).toBe('FRM-LUM-2X4-SPF-8');
    expect(validateMaterialCode(code)).toBe(true);
  });

  test('handles engineered lumber', () => {
    const code = generateMaterialCode(
      'ENGINEERED_LUMBER',
      'LVL 1-3/4 x 11-7/8',
      'SKU456'
    );
    expect(code).toMatch(/^FRM-ENG/);
  });
});

describe('validateMaterialCode', () => {
  test('accepts valid codes', () => {
    expect(validateMaterialCode('FRM-LUM-2X4-SPF-8')).toBe(true);
    expect(validateMaterialCode('ROOF-SHG-ARCH-30Y')).toBe(true);
  });

  test('rejects invalid codes', () => {
    expect(validateMaterialCode('frm-lum')).toBe(false); // lowercase
    expect(validateMaterialCode('AB-C')).toBe(false); // too short
    expect(validateMaterialCode('A'.repeat(30))).toBe(false); // too long
  });
});

describe('parseMaterialCode', () => {
  test('parses code components', () => {
    const result = parseMaterialCode('FRM-LUM-2X4-SPF-8');
    expect(result.trade).toBe('FRM');
    expect(result.category).toBe('LUM');
    expect(result.details).toEqual(['2X4', 'SPF', '8']);
  });
});
```

### 5.2 Integration Tests

```typescript
// backend/src/routes/__tests__/materials.test.ts

describe('GET /api/materials', () => {
  test('filters by trade code', async () => {
    const res = await request(app)
      .get('/api/materials?trade=FRM')
      .expect(200);

    expect(res.body.data.every(m => m.tradeCode === 'FRM')).toBe(true);
  });

  test('filters by category code', async () => {
    const res = await request(app)
      .get('/api/materials?trade=FRM&category=LUM')
      .expect(200);

    expect(res.body.data.every(m =>
      m.tradeCode === 'FRM' && m.categoryCode === 'LUM'
    )).toBe(true);
  });

  test('searches by code', async () => {
    const res = await request(app)
      .get('/api/materials?code=2X4')
      .expect(200);

    expect(res.body.data.every(m => m.code.includes('2X4'))).toBe(true);
  });
});
```

---

## Rollback Plan

If issues arise during implementation:

### Database Rollback

```sql
-- Remove new columns
ALTER TABLE materials DROP COLUMN IF EXISTS code;
ALTER TABLE materials DROP COLUMN IF EXISTS trade_code;
ALTER TABLE materials DROP COLUMN IF EXISTS category_code;
ALTER TABLE materials DROP COLUMN IF EXISTS primary_phase;
ALTER TABLE materials DROP COLUMN IF EXISTS csi_division;
ALTER TABLE materials DROP COLUMN IF EXISTS csi_section;
ALTER TABLE materials DROP COLUMN IF EXISTS uniformat_element;

-- Drop phase enum if created
DROP TYPE IF EXISTS "ConstructionPhase";
```

### API Rollback

Revert routes to previous version - existing `category` filter remains functional.

### UI Rollback

Remove new filter components; existing category filters still work.

---

## Checklist

### Sprint 3 (Week 2)

- [ ] Update Prisma schema with new fields
- [ ] Run database migration
- [ ] Create code generation utility
- [ ] Run migration script for existing materials
- [ ] Verify 100% code coverage
- [ ] Add API filtering by trade/category
- [ ] Write unit tests
- [ ] Write integration tests

### Sprint 4 (Week 3-4)

- [ ] Create MaterialCode display component
- [ ] Create TradeFilter component
- [ ] Update material list page
- [ ] Update material search
- [ ] Add code to import validation
- [ ] Write E2E tests

### Sprint 5+ (Week 5+)

- [ ] Add supplier SKU mapping
- [ ] Implement QuickBooks export
- [ ] Add EDI code translation
- [ ] Document training materials

---

## Support

For questions or issues during implementation:

1. Review [DECISION.md](./DECISION.md) for rationale
2. Check [GOVERNANCE.md](./GOVERNANCE.md) for rules
3. Reference [SAMPLE_CODES.md](./SAMPLE_CODES.md) for examples
