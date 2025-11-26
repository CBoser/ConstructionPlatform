import { z } from 'zod';
import { CustomerType } from '@prisma/client';

// ============================================================================
// Customer Validation Schemas
// ============================================================================

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(255),
  customerType: z.nativeEnum(CustomerType),
  pricingTier: z.string().optional(),
  notes: z.string().optional(),

  // BAT System Fields
  billToId: z.string().optional(),
  customerId: z.string().optional(), // BAT customer ID
  salesId: z.string().optional(),
  salespersonName: z.string().optional(),
  locationCode: z.string().optional(),
  accountType: z.enum(['M', 'Q']).optional(),
});

export const updateCustomerSchema = z.object({
  customerName: z.string().min(1).max(255).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  pricingTier: z.string().optional(),
  primaryContactId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),

  // BAT System Fields
  billToId: z.string().optional(),
  customerId: z.string().optional(),
  salesId: z.string().optional(),
  salespersonName: z.string().optional(),
  locationCode: z.string().optional(),
  accountType: z.enum(['M', 'Q']).optional(),
});

// ============================================================================
// Customer Contact Validation Schemas
// ============================================================================

export const createCustomerContactSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  contactName: z.string().min(1, 'Contact name is required').max(255),
  role: z.string().max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(50).optional(),
  receivesNotifications: z.boolean().optional().default(true),
  isPrimary: z.boolean().optional().default(false),
});

export const updateCustomerContactSchema = z.object({
  contactName: z.string().min(1).max(255).optional(),
  role: z.string().max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(50).optional(),
  receivesNotifications: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

// ============================================================================
// Customer Pricing Tier Validation Schemas
// ============================================================================

// Valid pricing tier codes
const pricingTierCodes = z.enum([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 'L5'
]);

export const createCustomerPricingTierSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),

  // DART Category-Based Pricing (BAT System)
  dartCategory: z.number().int().min(1).max(15, 'DART category must be between 1-15'),
  dartCategoryName: z.string().min(1, 'DART category name is required').max(100),
  tier: pricingTierCodes,

  // Legacy Fields (optional)
  tierName: z.string().max(100).optional(),
  discountPercentage: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),

  effectiveDate: z.date(),
  expirationDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.expirationDate && data.effectiveDate) {
      return data.expirationDate > data.effectiveDate;
    }
    return true;
  },
  {
    message: 'Expiration date must be after effective date',
    path: ['expirationDate'],
  }
);

export const updateCustomerPricingTierSchema = z.object({
  dartCategory: z.number().int().min(1).max(15).optional(),
  dartCategoryName: z.string().min(1).max(100).optional(),
  tier: pricingTierCodes.optional(),
  tierName: z.string().max(100).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  effectiveDate: z.date().optional(),
  expirationDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.expirationDate && data.effectiveDate) {
      return data.expirationDate > data.effectiveDate;
    }
    return true;
  },
  {
    message: 'Expiration date must be after effective date',
    path: ['expirationDate'],
  }
);

// ============================================================================
// Customer External ID Validation Schemas
// ============================================================================

export const createCustomerExternalIdSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  externalSystem: z.string().min(1, 'External system is required').max(100),
  externalCustomerId: z.string().min(1, 'External customer ID is required').max(255),
  externalCustomerName: z.string().max(255).optional(),
  isPrimary: z.boolean().optional().default(false),
});

export const updateCustomerExternalIdSchema = z.object({
  externalCustomerId: z.string().min(1).max(255).optional(),
  externalCustomerName: z.string().max(255).optional(),
  isPrimary: z.boolean().optional(),
});

// ============================================================================
// Query/Filter Validation Schemas
// ============================================================================

export const listCustomersQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50),
  search: z.string().optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateCustomerContactInput = z.infer<typeof createCustomerContactSchema>;
export type UpdateCustomerContactInput = z.infer<typeof updateCustomerContactSchema>;
export type CreateCustomerPricingTierInput = z.infer<typeof createCustomerPricingTierSchema>;
export type UpdateCustomerPricingTierInput = z.infer<typeof updateCustomerPricingTierSchema>;
export type CreateCustomerExternalIdInput = z.infer<typeof createCustomerExternalIdSchema>;
export type UpdateCustomerExternalIdInput = z.infer<typeof updateCustomerExternalIdSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
