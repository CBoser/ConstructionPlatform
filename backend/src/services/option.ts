import { PlanAssignedOption, Prisma, OptionCategory } from '@prisma/client';
import { db } from './database';

export interface CreateAssignedOptionInput {
  planId: string;
  elevationId?: string;
  name: string;
  description?: string;
  category?: OptionCategory;
  estimatedCost?: number;
  notes?: string;
  isStandard?: boolean;
}

export interface UpdateAssignedOptionInput {
  name?: string;
  description?: string;
  category?: OptionCategory;
  estimatedCost?: number;
  notes?: string;
  isStandard?: boolean;
}

class OptionService {
  /**
   * Create assigned option
   */
  async createAssignedOption(input: CreateAssignedOptionInput): Promise<PlanAssignedOption> {
    try {
      // Verify plan exists
      const plan = await db.plan.findUnique({ where: { id: input.planId } });
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Verify elevation exists if provided
      if (input.elevationId) {
        const elevation = await db.planElevation.findUnique({
          where: { id: input.elevationId },
        });
        if (!elevation) {
          throw new Error('Elevation not found');
        }
      }

      const option = await db.planAssignedOption.create({
        data: {
          planId: input.planId,
          elevationId: input.elevationId,
          name: input.name,
          description: input.description,
          category: input.category || OptionCategory.OTHER,
          estimatedCost: input.estimatedCost,
          notes: input.notes,
          isStandard: input.isStandard ?? false,
        },
      });

      return option;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get assigned option by ID
   */
  async getAssignedOptionById(id: string): Promise<PlanAssignedOption | null> {
    const option = await db.planAssignedOption.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        elevation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return option;
  }

  /**
   * List assigned options for a plan
   */
  async listAssignedOptions(planId: string): Promise<PlanAssignedOption[]> {
    const options = await db.planAssignedOption.findMany({
      where: { planId },
      include: {
        elevation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return options;
  }

  /**
   * Update assigned option
   */
  async updateAssignedOption(id: string, input: UpdateAssignedOptionInput): Promise<PlanAssignedOption> {
    try {
      const option = await db.planAssignedOption.update({
        where: { id },
        data: input,
      });

      return option;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Option not found');
        }
      }
      throw error;
    }
  }

  /**
   * Delete assigned option
   */
  async deleteAssignedOption(id: string): Promise<void> {
    try {
      await db.planAssignedOption.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Option not found');
        }
      }
      throw error;
    }
  }
}

export const optionService = new OptionService();
