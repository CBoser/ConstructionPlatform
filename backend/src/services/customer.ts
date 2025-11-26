import { PrismaClient, Customer, CustomerType, Prisma } from '@prisma/client';
import { db } from './database';

export interface CreateCustomerInput {
  customerName: string;
  customerType: CustomerType;
  pricingTier?: string;
  primaryContactId?: string;
  notes?: string;
  isActive?: boolean;

  // BAT System Fields
  billToId?: string;
  customerId?: string; // BAT customer ID
  salesId?: string;
  salespersonName?: string;
  locationCode?: string;
  accountType?: string;
}

export interface UpdateCustomerInput {
  customerName?: string;
  customerType?: CustomerType;
  pricingTier?: string;
  primaryContactId?: string;
  notes?: string;
  isActive?: boolean;

  // BAT System Fields
  billToId?: string;
  customerId?: string;
  salesId?: string;
  salespersonName?: string;
  locationCode?: string;
  accountType?: string;
}

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'customerName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    try {
      const customer = await db.customer.create({
        data: {
          customerName: input.customerName,
          customerType: input.customerType,
          pricingTier: input.pricingTier,
          primaryContactId: input.primaryContactId,
          notes: input.notes,
          isActive: input.isActive ?? true,
        },
      });

      return customer;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A customer with this name already exists');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string, includeRelations = false): Promise<Customer | null> {
    const customer = await db.customer.findUnique({
      where: { id },
      include: includeRelations
        ? {
            jobs: {
              select: {
                id: true,
                jobNumber: true,
                status: true,
                createdAt: true,
                plan: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    type: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' as const },
              take: 10,
            },
            communities: {
              select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' as const },
            },
          }
        : undefined,
    });

    return customer;
  }

  /**
   * List customers with filtering and pagination
   */
  async listCustomers(query: ListCustomersQuery = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      isActive,
      sortBy = 'customerName',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.customerName = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with count
    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              jobs: true,
              communities: true,
            },
          },
        },
      }),
      db.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
    try {
      const customer = await db.customer.update({
        where: { id },
        data: input,
      });

      return customer;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A customer with this name already exists');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Failed to update customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Soft delete customer (set isActive to false)
   */
  async deactivateCustomer(id: string): Promise<Customer> {
    try {
      const customer = await db.customer.update({
        where: { id },
        data: { isActive: false },
      });

      return customer;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Failed to deactivate customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Reactivate customer
   */
  async activateCustomer(id: string): Promise<Customer> {
    try {
      const customer = await db.customer.update({
        where: { id },
        data: { isActive: true },
      });

      return customer;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
      }
      if (error instanceof Error) {
        throw new Error(`Failed to activate customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Hard delete customer (use with caution)
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      await db.customer.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete customer with existing jobs or communities. Deactivate instead.'
          );
        }
      }
      if (error instanceof Error) {
        throw new Error(`Failed to delete customer: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(id: string) {
    const stats = await db.customer.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            jobs: true,
            communities: true,
          },
        },
        jobs: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            lot: true,
            plan: true,
          },
        },
      },
    });

    if (!stats) {
      throw new Error('Customer not found');
    }

    interface JobWithRelations {
      lot: { id: string } | null;
      plan: { id: string } | null;
    }

    const uniquePlans = new Set(
      stats.jobs
        .filter((job: JobWithRelations) => job.plan !== null)
        .map((job: JobWithRelations) => job.plan!.id)
    );
    const uniqueLots = new Set(
      stats.jobs
        .filter((job: JobWithRelations) => job.lot !== null)
        .map((job: JobWithRelations) => job.lot!.id)
    );

    return {
      totalJobs: stats._count.jobs,
      totalCommunities: stats._count.communities,
      totalPlans: uniquePlans.size,
      totalLots: uniqueLots.size,
    };
  }
}

export const customerService = new CustomerService();
