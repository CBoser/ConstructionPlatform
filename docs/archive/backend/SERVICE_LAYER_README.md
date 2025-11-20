# Customer Service & Repository Layer

This document explains the service layer implementation for Customer management, following clean architecture principles with repository pattern and dependency injection.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (Future)                      │
│                    /api/customers/*                          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   CustomerService                            │
│  • Business Logic                                            │
│  • Input Validation (Zod)                                    │
│  • Error Handling                                            │
│  • Audit Logging                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                 CustomerRepository                           │
│  • Database Operations (Prisma)                              │
│  • Query Building                                            │
│  • Data Mapping                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  Prisma Client                               │
│                  PostgreSQL Database                         │
└──────────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/src/
├── errors/
│   └── customer.ts                     # Custom error classes
├── validators/
│   └── customer.ts                     # Zod validation schemas
├── repositories/
│   └── CustomerRepository.ts           # Database operations
├── services/
│   ├── CustomerService.ts              # Business logic
│   └── __tests__/
│       └── CustomerService.test.ts     # Service tests
```

## Components

### 1. Error Classes (`/src/errors/customer.ts`)

Custom errors for better error handling:

```typescript
// Usage Example
throw new CustomerNotFoundError('customer-id-123');
throw new CustomerHasDependenciesError('customer-id', ['5 jobs']);
throw new InvalidCustomerDataError('Invalid email format');
throw new DuplicateExternalIdError('SALES_1440', 'CUST-001');
```

**Error Types:**
- `CustomerNotFoundError` - Customer doesn't exist
- `CustomerHasDependenciesError` - Can't delete due to relationships
- `InvalidCustomerDataError` - Validation failed
- `CustomerContactNotFoundError` - Contact doesn't exist
- `CustomerPricingTierNotFoundError` - Pricing tier doesn't exist
- `CustomerExternalIdNotFoundError` - External ID doesn't exist
- `DuplicateExternalIdError` - External ID already mapped

### 2. Validation Schemas (`/src/validators/customer.ts`)

Zod schemas for input validation:

```typescript
import {
  createCustomerSchema,
  updateCustomerSchema,
  createCustomerContactSchema,
  updateCustomerContactSchema,
  createCustomerPricingTierSchema,
  listCustomersQuerySchema,
} from './validators/customer';

// Validation happens automatically in service methods
// Returns typed data or throws validation error
const validatedData = createCustomerSchema.parse(input);
```

**Validation Features:**
- Required fields validation
- String length constraints
- Email format validation
- Enum value validation
- Date range validation (effective/expiration dates)
- Discount percentage range (0-100%)

### 3. Repository (`/src/repositories/CustomerRepository.ts`)

Database operations using Prisma:

```typescript
import { CustomerRepository } from './repositories/CustomerRepository';

const repository = new CustomerRepository(prisma);

// Find all with filters and pagination
const result = await repository.findAll(
  { search: 'Richmond', isActive: true },
  { page: 1, limit: 50 }
);

// Find by ID with relations
const customer = await repository.findById('customer-id', true);

// Find by external ID
const customer = await repository.findByExternalId('SALES_1440', 'CUST-001');

// CRUD operations
const customer = await repository.create(data);
const updated = await repository.update(id, data);
await repository.delete(id);
```

**Repository Methods:**
- `findAll(filters?, pagination?)` - List customers with filtering
- `findById(id, includeRelations?)` - Get customer by ID
- `findByExternalId(system, externalId)` - Find by external system ID
- `create(data)` - Create new customer
- `update(id, data)` - Update existing customer
- `delete(id)` - Delete customer
- `count(filters?)` - Count customers

### 4. Service (`/src/services/CustomerService.ts`)

Business logic layer with validation:

```typescript
import { CustomerService } from './services/CustomerService';

const service = new CustomerService(prisma);

// Customer CRUD
const customers = await service.getAllCustomers({
  page: 1,
  limit: 50,
  search: 'Richmond',
  customerType: 'PRODUCTION',
  isActive: true,
});

const customer = await service.getCustomerById(id);

const newCustomer = await service.createCustomer({
  customerName: 'Richmond American Homes',
  customerType: 'PRODUCTION',
  pricingTier: 'TIER_1',
  notes: 'Premium tier customer',
});

const updated = await service.updateCustomer(id, {
  customerName: 'New Name',
  isActive: false,
});

// Soft delete (sets isActive = false)
await service.deleteCustomer(id);

// Hard delete (removes from database)
await service.deleteCustomer(id, true);

// Contact Management
const contact = await service.addContact({
  customerId: id,
  contactName: 'John Doe',
  role: 'Project Manager',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  isPrimary: true,
});

const updated = await service.updateContact(contactId, {
  email: 'newemail@example.com',
});

await service.deleteContact(contactId);

// Pricing Tier Management
const tier = await service.addPricingTier({
  customerId: id,
  tierName: 'TIER_1',
  discountPercentage: 15.0,
  effectiveDate: new Date('2025-01-01'),
  expirationDate: new Date('2025-12-31'),
});

const currentTier = await service.getCurrentPricingTier(id);

// External ID Mapping
const mapping = await service.mapExternalId({
  customerId: id,
  externalSystem: 'SALES_1440',
  externalCustomerId: 'RICH-001',
  externalCustomerName: 'Richmond American',
  isPrimary: true,
});

const customer = await service.findByExternalId('SALES_1440', 'RICH-001');
```

**Service Features:**
- Input validation using Zod
- Business logic enforcement
- Error handling with custom errors
- Audit logging (console.log)
- Primary contact management
- Automatic first contact becomes primary
- Current pricing tier calculation
- External ID uniqueness enforcement

## Dependency Injection

The service uses dependency injection for testability:

```typescript
// Production: Service creates its own repository
const service = new CustomerService(prisma);

// Testing: Inject mock repository
const mockRepository = new MockCustomerRepository();
const service = new CustomerService(prisma, mockRepository);
```

## Installation

1. **Install Zod dependency:**
   ```bash
   cd backend
   npm install zod
   ```

2. **Verify Prisma Client is up to date:**
   ```bash
   npm run prisma:generate
   ```

## Usage Example

```typescript
import { PrismaClient } from '@prisma/client';
import { CustomerService } from './services/CustomerService';

const prisma = new PrismaClient();
const customerService = new CustomerService(prisma);

async function example() {
  try {
    // Create a customer
    const customer = await customerService.createCustomer({
      customerName: 'Test Builder',
      customerType: 'PRODUCTION',
      pricingTier: 'TIER_2',
      notes: 'Production builder - standard pricing',
    });

    console.log('Created customer:', customer.id);

    // Add a contact
    const contact = await customerService.addContact({
      customerId: customer.id,
      contactName: 'Jane Smith',
      role: 'Owner',
      email: 'jane@testbuilder.com',
      phone: '(555) 987-6543',
      isPrimary: true,
    });

    console.log('Added contact:', contact.id);

    // Add pricing tier
    const tier = await customerService.addPricingTier({
      customerId: customer.id,
      tierName: 'TIER_2',
      discountPercentage: 10.0,
      effectiveDate: new Date('2025-01-01'),
      expirationDate: new Date('2025-12-31'),
    });

    console.log('Added pricing tier:', tier.id);

    // Get current pricing tier
    const currentTier = await customerService.getCurrentPricingTier(customer.id);
    console.log('Current discount:', currentTier?.discountPercentage);

    // Map to external system
    const mapping = await customerService.mapExternalId({
      customerId: customer.id,
      externalSystem: 'SALES_1440',
      externalCustomerId: 'TEST-001',
      isPrimary: true,
    });

    console.log('Mapped to external system:', mapping.id);

    // Find by external ID
    const found = await customerService.findByExternalId('SALES_1440', 'TEST-001');
    console.log('Found customer:', found.customerName);

    // List all customers
    const result = await customerService.getAllCustomers({
      page: 1,
      limit: 50,
      customerType: 'PRODUCTION',
      isActive: true,
    });

    console.log('Total customers:', result.pagination.total);
    console.log('Customers:', result.data.map(c => c.customerName));

  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      console.error('Customer not found');
    } else if (error instanceof InvalidCustomerDataError) {
      console.error('Validation error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

example();
```

## Testing

Run tests with Jest:

```bash
# Install test dependencies (if not already installed)
npm install --save-dev jest @types/jest ts-jest

# Add jest.config.js (create if doesn't exist)
# module.exports = {
#   preset: 'ts-jest',
#   testEnvironment: 'node',
# };

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

See `/src/services/__tests__/CustomerService.test.ts` for test examples.

## Error Handling Pattern

```typescript
try {
  const customer = await service.getCustomerById('invalid-id');
} catch (error) {
  if (error instanceof CustomerNotFoundError) {
    // Handle not found - return 404
    res.status(404).json({ error: error.message });
  } else if (error instanceof InvalidCustomerDataError) {
    // Handle validation error - return 400
    res.status(400).json({ error: error.message, details: error.errors });
  } else if (error instanceof CustomerHasDependenciesError) {
    // Handle dependency error - return 409
    res.status(409).json({ error: error.message });
  } else {
    // Unknown error - return 500
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Business Rules Implemented

1. **Primary Contact Logic:**
   - First contact added automatically becomes primary
   - When setting a new primary, old primary is unset
   - Deleting primary contact promotes another contact

2. **Soft Delete:**
   - By default, customers are soft deleted (isActive = false)
   - Hard delete only allowed if no dependencies (jobs)
   - Throws error if customer has active jobs

3. **Pricing Tiers:**
   - Effective date must be before expiration date
   - Discount percentage must be 0-100%
   - getCurrentPricingTier returns tier active today

4. **External ID Mapping:**
   - Unique constraint per (customerId, externalSystem)
   - Can't create duplicate mappings
   - Primary flag for main system ID

5. **Validation:**
   - Customer name required, max 255 chars
   - Email must be valid format
   - Phone max 50 chars
   - Discount percentage 0-100%

## Next Steps

After implementing the service layer:

1. **Create API routes** (future prompt):
   - POST   /api/customers
   - GET    /api/customers
   - GET    /api/customers/:id
   - PUT    /api/customers/:id
   - DELETE /api/customers/:id
   - POST   /api/customers/:id/contacts
   - etc.

2. **Add authentication middleware**:
   - Protect routes with JWT
   - Role-based access control

3. **Create frontend UI**:
   - Customer management pages
   - Contact management
   - Pricing tier configuration

4. **Add integration tests**:
   - Test with real database
   - Test full request/response cycle

## Success Criteria ✅

- ✅ All repository methods work
- ✅ Service validates inputs using Zod
- ✅ Can create customer with contacts
- ✅ getCurrentPricingTier returns correct tier
- ✅ Primary contact logic works correctly
- ✅ Soft delete prevents deletion of customers with jobs
- ✅ External ID mapping enforces uniqueness
- ✅ Comprehensive test suite provided
