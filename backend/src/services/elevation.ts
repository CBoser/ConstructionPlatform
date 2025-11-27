import { PlanElevation, ElevationVersion, Prisma } from '@prisma/client';
import { db } from './database';

export interface CreateElevationInput {
  planId: string;
  code: string;
  name?: string;
  description?: string;
  architectDesigner?: string;
  architectDesignerDate?: Date;
  structuralEngineer?: string;
  structuralEngineerDate?: Date;
  iJoistCompany?: string;
  iJoistCompanyDate?: Date;
  floorTrussCompany?: string;
  floorTrussCompanyDate?: Date;
  roofTrussCompany?: string;
  roofTrussCompanyDate?: Date;
  customDetails?: any;
}

export interface UpdateElevationInput {
  code?: string;
  name?: string;
  description?: string;
  architectDesigner?: string;
  architectDesignerDate?: Date;
  structuralEngineer?: string;
  structuralEngineerDate?: Date;
  iJoistCompany?: string;
  iJoistCompanyDate?: Date;
  floorTrussCompany?: string;
  floorTrussCompanyDate?: Date;
  roofTrussCompany?: string;
  roofTrussCompanyDate?: Date;
  customDetails?: any;
  changeNotes?: string;
}

class ElevationService {
  /**
   * Create a new elevation
   */
  async createElevation(input: CreateElevationInput): Promise<PlanElevation> {
    try {
      // Verify plan exists
      const plan = await db.plan.findUnique({ where: { id: input.planId } });
      if (!plan) {
        throw new Error('Plan not found');
      }

      const elevation = await db.planElevation.create({
        data: {
          planId: input.planId,
          code: input.code,
          name: input.name,
          description: input.description,
          architectDesigner: input.architectDesigner,
          architectDesignerDate: input.architectDesignerDate,
          structuralEngineer: input.structuralEngineer,
          structuralEngineerDate: input.structuralEngineerDate,
          iJoistCompany: input.iJoistCompany,
          iJoistCompanyDate: input.iJoistCompanyDate,
          floorTrussCompany: input.floorTrussCompany,
          floorTrussCompanyDate: input.floorTrussCompanyDate,
          roofTrussCompany: input.roofTrussCompany,
          roofTrussCompanyDate: input.roofTrussCompanyDate,
          customDetails: input.customDetails || Prisma.JsonNull,
          currentVersion: 1,
        },
      });

      return elevation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('An elevation with this code already exists for this plan');
        }
      }
      throw error;
    }
  }

  /**
   * Get elevation by ID
   */
  async getElevationById(id: string): Promise<PlanElevation | null> {
    const elevation = await db.planElevation.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        versionHistory: {
          orderBy: { version: 'desc' },
        },
      },
    });

    return elevation;
  }

  /**
   * List elevations by plan ID
   */
  async listElevationsByPlanId(planId: string): Promise<PlanElevation[]> {
    const elevations = await db.planElevation.findMany({
      where: { planId },
      orderBy: { code: 'asc' },
    });

    return elevations;
  }

  /**
   * Update elevation
   */
  async updateElevation(id: string, input: UpdateElevationInput): Promise<PlanElevation> {
    try {
      const existingElevation = await db.planElevation.findUnique({
        where: { id },
      });

      if (!existingElevation) {
        throw new Error('Elevation not found');
      }

      // If changeNotes provided, create a version history entry
      if (input.changeNotes) {
        await db.elevationVersion.create({
          data: {
            elevationId: id,
            version: existingElevation.currentVersion,
            changeNotes: input.changeNotes,
            changedBy: 'system', // TODO: get from auth context
            architectDesigner: existingElevation.architectDesigner,
            architectDesignerDate: existingElevation.architectDesignerDate,
            structuralEngineer: existingElevation.structuralEngineer,
            structuralEngineerDate: existingElevation.structuralEngineerDate,
            iJoistCompany: existingElevation.iJoistCompany,
            iJoistCompanyDate: existingElevation.iJoistCompanyDate,
            floorTrussCompany: existingElevation.floorTrussCompany,
            floorTrussCompanyDate: existingElevation.floorTrussCompanyDate,
            roofTrussCompany: existingElevation.roofTrussCompany,
            roofTrussCompanyDate: existingElevation.roofTrussCompanyDate,
            customDetails: existingElevation.customDetails || Prisma.JsonNull,
          },
        });
      }

      // Remove changeNotes from update data
      const { changeNotes, ...updateData } = input;

      const elevation = await db.planElevation.update({
        where: { id },
        data: {
          ...updateData,
          currentVersion: changeNotes
            ? existingElevation.currentVersion + 1
            : existingElevation.currentVersion,
        },
      });

      return elevation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Elevation not found');
        }
        if (error.code === 'P2002') {
          throw new Error('An elevation with this code already exists for this plan');
        }
      }
      throw error;
    }
  }

  /**
   * Delete elevation
   */
  async deleteElevation(id: string): Promise<void> {
    try {
      await db.planElevation.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Elevation not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete elevation with existing jobs or documents. Please remove them first.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get elevation version history
   */
  async getVersionHistory(elevationId: string): Promise<ElevationVersion[]> {
    const versions = await db.elevationVersion.findMany({
      where: { elevationId },
      orderBy: { version: 'desc' },
    });

    return versions;
  }
}

export const elevationService = new ElevationService();
