import { Plan, PlanTemplateItem, Prisma, PlanType } from '@prisma/client';
import { db } from './database';

export interface CreatePlanInput {
  code: string;
  name?: string;
  type: PlanType;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  style?: string;
  pdssUrl?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePlanInput {
  code?: string;
  name?: string;
  type?: PlanType;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  style?: string;
  pdssUrl?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListPlansQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: PlanType;
  isActive?: boolean;
  sortBy?: 'code' | 'name' | 'createdAt' | 'updatedAt' | 'sqft';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanTemplateItemInput {
  planId: string;
  materialId: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  wasteFactor?: number;
  notes?: string;
}

export interface UpdatePlanTemplateItemInput {
  quantity?: number;
  unit?: string;
  wasteFactor?: number;
  subcategory?: string;
  notes?: string;
  averageVariance?: number;
  varianceCount?: number;
  lastVarianceDate?: Date;
  confidenceScore?: number;
}

class PlanService {
  /**
   * Create a new plan
   */
  async createPlan(input: CreatePlanInput): Promise<Plan> {
    try {
      const plan = await db.plan.create({
        data: {
          code: input.code,
          name: input.name,
          type: input.type,
          sqft: input.sqft,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          garage: input.garage,
          style: input.style,
          pdssUrl: input.pdssUrl,
          notes: input.notes,
          isActive: input.isActive ?? true,
        },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A plan with this code already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id: string, includeRelations = false) {
    const plan = await db.plan.findUnique({
      where: { id },
      include: includeRelations
        ? {
            elevations: true,
            options: true,
            templateItems: {
              include: {
                material: {
                  select: {
                    id: true,
                    description: true,
                    sku: true,
                    unitOfMeasure: true,
                    category: true,
                  },
                },
              },
              orderBy: { category: 'asc' },
            },
          }
        : undefined,
    });

    return plan;
  }

  /**
   * Get plan by code
   */
  async getPlanByCode(code: string, includeRelations = false) {
    const plan = await db.plan.findUnique({
      where: { code },
      include: includeRelations
        ? {
            elevations: true,
            options: true,
            templateItems: {
              include: {
                material: true,
              },
              orderBy: { category: 'asc' },
            },
          }
        : undefined,
    });

    return plan;
  }

  /**
   * List plans with filtering and pagination
   */
  async listPlans(query: ListPlansQuery = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      type,
      isActive,
      sortBy = 'code',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PlanWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { style: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute query with count
    const [plans, total] = await Promise.all([
      db.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          elevations: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              templateItems: true,
              jobs: true,
              options: true,
            },
          },
        },
      }),
      db.plan.count({ where }),
    ]);

    return {
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update plan
   */
  async updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
    try {
      const plan = await db.plan.update({
        where: { id },
        data: input,
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A plan with this code already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Soft delete plan (set isActive to false)
   */
  async deactivatePlan(id: string): Promise<Plan> {
    try {
      const plan = await db.plan.update({
        where: { id },
        data: { isActive: false },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
      }
      throw error;
    }
  }

  /**
   * Reactivate plan
   */
  async activatePlan(id: string): Promise<Plan> {
    try {
      const plan = await db.plan.update({
        where: { id },
        data: { isActive: true },
      });

      return plan;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
      }
      throw error;
    }
  }

  /**
   * Hard delete plan (use with caution)
   */
  async deletePlan(id: string): Promise<void> {
    try {
      await db.plan.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Plan not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete plan with existing jobs or template items. Deactivate instead.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get plan statistics
   */
  async getPlanStats(id: string) {
    const stats = await db.plan.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            templateItems: true,
            jobs: true,
            elevations: true,
            options: true,
          },
        },
        templateItems: {
          select: {
            confidenceScore: true,
            varianceCount: true,
          },
        },
      },
    });

    if (!stats) {
      throw new Error('Plan not found');
    }

    // Calculate average confidence score
    const templateItems = stats.templateItems;
    const avgConfidence =
      templateItems.length > 0
        ? templateItems.reduce((sum: number, item: any) => sum + (item.confidenceScore?.toNumber() || 0), 0) /
          templateItems.length
        : 0;

    const totalVarianceRecords = templateItems.reduce(
      (sum: number, item: any) => sum + (item.varianceCount || 0),
      0
    );

    return {
      totalTemplateItems: stats._count.templateItems,
      totalJobs: stats._count.jobs,
      totalElevations: stats._count.elevations,
      totalOptions: stats._count.options,
      avgConfidenceScore: avgConfidence,
      totalVarianceRecords,
    };
  }

  // ====== TEMPLATE ITEM OPERATIONS ======

  /**
   * Create plan template item
   */
  async createTemplateItem(input: CreatePlanTemplateItemInput): Promise<PlanTemplateItem> {
    try {
      // Verify plan and material exist
      const [plan, material] = await Promise.all([
        db.plan.findUnique({ where: { id: input.planId } }),
        db.material.findUnique({ where: { id: input.materialId } }),
      ]);

      if (!plan) {
        throw new Error('Plan not found');
      }

      if (!material) {
        throw new Error('Material not found');
      }

      const templateItem = await db.planTemplateItem.create({
        data: {
          planId: input.planId,
          materialId: input.materialId,
          category: input.category,
          subcategory: input.subcategory,
          quantity: input.quantity,
          unit: input.unit,
          wasteFactor: input.wasteFactor ?? 0,
          notes: input.notes,
          confidenceScore: 0.0,
          varianceCount: 0,
        },
        include: {
          material: true,
        },
      });

      return templateItem;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('This material is already in the plan template');
        }
      }
      throw error;
    }
  }

  /**
   * Get template item by ID
   */
  async getTemplateItemById(id: string) {
    const item = await db.planTemplateItem.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        material: true,
      },
    });

    return item;
  }

  /**
   * List template items for a plan
   */
  async listTemplateItems(planId: string) {
    const items = await db.planTemplateItem.findMany({
      where: { planId },
      include: {
        material: true,
      },
      orderBy: [{ category: 'asc' }, { subcategory: 'asc' }],
    });

    return items;
  }

  /**
   * Update template item
   */
  async updateTemplateItem(
    id: string,
    input: UpdatePlanTemplateItemInput
  ): Promise<PlanTemplateItem> {
    try {
      const item = await db.planTemplateItem.update({
        where: { id },
        data: input,
        include: {
          material: true,
        },
      });

      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }

  /**
   * Delete template item
   */
  async deleteTemplateItem(id: string): Promise<void> {
    try {
      await db.planTemplateItem.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }

  /**
   * Update template item variance data (called by learning system)
   */
  async updateTemplateItemVariance(
    id: string,
    variance: {
      averageVariance: number;
      varianceCount: number;
      confidenceScore: number;
    }
  ): Promise<PlanTemplateItem> {
    try {
      const item = await db.planTemplateItem.update({
        where: { id },
        data: {
          averageVariance: variance.averageVariance,
          varianceCount: variance.varianceCount,
          confidenceScore: variance.confidenceScore,
          lastVarianceDate: new Date(),
        },
        include: {
          material: true,
        },
      });

      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Template item not found');
        }
      }
      throw error;
    }
  }
}

export const planService = new PlanService();
