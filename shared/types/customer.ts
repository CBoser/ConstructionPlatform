// Customer Types - Foundation Layer
// Authoritative source for all customer information

export enum CustomerType {
  PRODUCTION = 'PRODUCTION',
  SEMI_CUSTOM = 'SEMI_CUSTOM',
  FULL_CUSTOM = 'FULL_CUSTOM',
}

// ============================================================================
// Customer
// ============================================================================

export interface Customer {
  id: string;
  customerName: string;
  customerType: CustomerType;
  pricingTier?: string;
  primaryContactId?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerInput {
  customerName: string;
  customerType: CustomerType;
  pricingTier?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  customerName?: string;
  customerType?: CustomerType;
  pricingTier?: string;
  primaryContactId?: string;
  isActive?: boolean;
  notes?: string;
}

// ============================================================================
// Customer Contact
// ============================================================================

export interface CustomerContact {
  id: string;
  customerId: string;
  contactName: string;
  role?: string;
  email?: string;
  phone?: string;
  receivesNotifications: boolean;
  isPrimary: boolean;
  createdAt: Date;
}

export interface CreateCustomerContactInput {
  customerId: string;
  contactName: string;
  role?: string;
  email?: string;
  phone?: string;
  receivesNotifications?: boolean;
  isPrimary?: boolean;
}

export interface UpdateCustomerContactInput {
  contactName?: string;
  role?: string;
  email?: string;
  phone?: string;
  receivesNotifications?: boolean;
  isPrimary?: boolean;
}

// ============================================================================
// Customer Pricing Tier
// ============================================================================

export interface CustomerPricingTier {
  id: string;
  customerId: string;
  tierName: string;
  discountPercentage: number;
  effectiveDate: Date;
  expirationDate?: Date;
  createdAt: Date;
}

export interface CreateCustomerPricingTierInput {
  customerId: string;
  tierName: string;
  discountPercentage: number;
  effectiveDate: Date;
  expirationDate?: Date;
}

export interface UpdateCustomerPricingTierInput {
  tierName?: string;
  discountPercentage?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
}

// ============================================================================
// Customer External ID
// ============================================================================

export interface CustomerExternalId {
  id: string;
  customerId: string;
  externalSystem: string;
  externalCustomerId: string;
  externalCustomerName?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface CreateCustomerExternalIdInput {
  customerId: string;
  externalSystem: string;
  externalCustomerId: string;
  externalCustomerName?: string;
  isPrimary?: boolean;
}

export interface UpdateCustomerExternalIdInput {
  externalCustomerId?: string;
  externalCustomerName?: string;
  isPrimary?: boolean;
}

// ============================================================================
// Extended Types (with relations)
// ============================================================================

export interface CustomerWithContacts extends Customer {
  contacts: CustomerContact[];
}

export interface CustomerWithPricingTiers extends Customer {
  pricingTiers: CustomerPricingTier[];
}

export interface CustomerWithExternalIds extends Customer {
  externalIds: CustomerExternalId[];
}

export interface CustomerFull extends Customer {
  contacts: CustomerContact[];
  pricingTiers: CustomerPricingTier[];
  externalIds: CustomerExternalId[];
}

// ============================================================================
// Query Types
// ============================================================================

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
}

// Customer with count of related entities (returned by list queries)
export interface CustomerWithCounts extends Customer {
  _count?: {
    jobs: number;
    communities: number;
    plans: number;
  };
}

export interface ListCustomersResponse {
  data: CustomerWithCounts[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// External System Constants
// ============================================================================

export enum ExternalSystem {
  SALES_1440 = 'SALES_1440',
  HYPHEN_BUILDPRO = 'HYPHEN_BUILDPRO',
  HOLT_BUILDER_PORTAL = 'HOLT_BUILDER_PORTAL',
}
