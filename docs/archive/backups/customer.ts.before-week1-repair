import { PrismaClient, Customer, Prisma } from '@prisma/client';
import { db } from './database';

export interface CreateCustomerInput {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
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
          name: input.name,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          notes: input.notes,
          isActive: input.isActive ?? true,
        },
      });

      return customer;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A customer with this name already exists');
        }
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
            plans: {
              select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            communities: {
              select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
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
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
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
              plans: true,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A customer with this name already exists');
        }
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Customer not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete customer with existing plans or communities. Deactivate instead.'
          );
        }
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
            plans: true,
            communities: true,
          },
        },
        plans: {
          where: { isActive: true },
          select: {
            _count: {
              select: {
                lots: true,
                jobs: true,
              },
            },
          },
        },
      },
    });

    if (!stats) {
      throw new Error('Customer not found');
    }

    const totalLots = stats.plans.reduce((sum: number, plan: any) => sum + plan._count.lots, 0);
    const totalJobs = stats.plans.reduce((sum: number, plan: any) => sum + plan._count.jobs, 0);

    return {
      totalPlans: stats._count.plans,
      totalCommunities: stats._count.communities,
      totalLots,
      totalJobs,
    };
  }
}

export const customerService = new CustomerService();
