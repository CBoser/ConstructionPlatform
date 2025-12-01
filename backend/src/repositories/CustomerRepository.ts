import { PrismaClient, Customer, CustomerType, Prisma } from '@prisma/client';
import {
  CustomerNotFoundError,
  CustomerContactNotFoundError,
  CustomerPricingTierNotFoundError,
  CustomerExternalIdNotFoundError,
} from '../errors/customer';

// Type for Customer with all relations
export type CustomerWithRelations = Customer & {
  contacts?: any[];
  pricingTiers?: any[];
  externalIds?: any[];
  jobs?: any[];
  _count?: {
    communities?: number;
    plans?: number;
    jobs?: number;
  };
};

// Repository interface for dependency injection
export interface ICustomerRepository {
  findAll(filters?: CustomerFilters, pagination?: PaginationOptions): Promise<CustomerListResult>;
  findById(id: string, includeRelations?: boolean): Promise<CustomerWithRelations | null>;
  findByExternalId(system: string, externalId: string): Promise<Customer | null>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;
  delete(id: string): Promise<void>;
  count(filters?: CustomerFilters): Promise<number>;
}

// Filter options
export interface CustomerFilters {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
}

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
}

// List result with pagination
export interface CustomerListResult {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create customer data
export interface CreateCustomerData {
  customerName: string;
  customerType: CustomerType;
  pricingTier?: string;
  notes?: string;
}

// Update customer data
export interface UpdateCustomerData {
  customerName?: string;
  customerType?: CustomerType;
  pricingTier?: string;
  primaryContactId?: string;
  isActive?: boolean;
  notes?: string;
}

/**
 * Customer Repository
 * Handles all database operations for Customer entity
 */
export class CustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find all customers with optional filters and pagination
   */
  async findAll(
    filters?: CustomerFilters,
    pagination?: PaginationOptions
  ): Promise<CustomerListResult> {
    const { page = 1, limit = 50 } = pagination || {};
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { customerName: 'asc' },
        include: {
          _count: {
            select: {
              communities: true,
              plans: true,
              jobs: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find customer by ID with optional relations
   */
  async findById(
    id: string,
    includeRelations = false
  ): Promise<CustomerWithRelations | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: includeRelations
        ? {
            contacts: {
              orderBy: { isPrimary: 'desc' },
            },
            pricingTiers: {
              orderBy: { effectiveDate: 'desc' },
            },
            externalIds: true,
          }
        : undefined,
    });

    return customer;
  }

  /**
   * Find customer by external system ID
   */
  async findByExternalId(
    system: string,
    externalId: string
  ): Promise<Customer | null> {
    const externalIdRecord = await this.prisma.customerExternalId.findFirst({
      where: {
        externalSystem: system,
        externalCustomerId: externalId,
      },
      include: {
        customer: true,
      },
    });

    return externalIdRecord?.customer || null;
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerData): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        customerName: data.customerName,
        customerType: data.customerType,
        pricingTier: data.pricingTier,
        notes: data.notes,
        isActive: true,
      },
    });
  }

  /**
   * Update an existing customer
   */
  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    // Verify customer exists
    const exists = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new CustomerNotFoundError(id);
    }

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a customer
   */
  async delete(id: string): Promise<void> {
    // Verify customer exists
    const exists = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new CustomerNotFoundError(id);
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Count customers with optional filters
   */
  async count(filters?: CustomerFilters): Promise<number> {
    const where: Prisma.CustomerWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.customer.count({ where });
  }
}
