import { Material, Prisma, MaterialCategory } from '@prisma/client';
import { db } from './database';

export interface CreateMaterialInput {
  sku: string;
  description: string;
  category: MaterialCategory;
  subcategory?: string;
  dartCategory?: number;
  dartCategoryName?: string;
  unitOfMeasure: string;
  vendorCost: number;
  freight?: number;
  isRLLinked?: boolean;
  rlTag?: string;
  isActive?: boolean;
}

export interface UpdateMaterialInput {
  sku?: string;
  description?: string;
  category?: MaterialCategory;
  subcategory?: string;
  dartCategory?: number;
  dartCategoryName?: string;
  unitOfMeasure?: string;
  vendorCost?: number;
  freight?: number;
  isRLLinked?: boolean;
  rlTag?: string;
  isActive?: boolean;
}

export interface ListMaterialsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  dartCategory?: number;
  isActive?: boolean;
  isRLLinked?: boolean;
  sortBy?: 'sku' | 'description' | 'category' | 'createdAt' | 'updatedAt' | 'vendorCost';
  sortOrder?: 'asc' | 'desc';
}

class MaterialService {
  /**
   * Create a new material
   */
  async createMaterial(input: CreateMaterialInput): Promise<Material> {
    try {
      const material = await db.material.create({
        data: {
          sku: input.sku,
          description: input.description,
          category: input.category,
          subcategory: input.subcategory,
          dartCategory: input.dartCategory,
          dartCategoryName: input.dartCategoryName,
          unitOfMeasure: input.unitOfMeasure,
          vendorCost: input.vendorCost,
          freight: input.freight ?? 0,
          isRLLinked: input.isRLLinked ?? false,
          rlTag: input.rlTag,
          isActive: input.isActive ?? true,
        },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A material with this SKU already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Get material by ID
   */
  async getMaterialById(id: string, includeRelations = false) {
    const material = await db.material.findUnique({
      where: { id },
      include: includeRelations
        ? {
            vendor: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            pricingHistory: {
              orderBy: { effectiveDate: 'desc' },
              take: 10,
            },
            templateItems: {
              select: {
                id: true,
                quantity: true,
                unit: true,
                category: true,
                plan: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
              take: 5,
            },
          }
        : undefined,
    });

    return material;
  }

  /**
   * Get material by SKU
   */
  async getMaterialBySku(sku: string, includeRelations = false) {
    const material = await db.material.findUnique({
      where: { sku },
      include: includeRelations
        ? {
            vendor: true,
            pricingHistory: {
              orderBy: { effectiveDate: 'desc' },
              take: 10,
            },
          }
        : undefined,
    });

    return material;
  }

  /**
   * List materials with filtering and pagination
   */
  async listMaterials(query: ListMaterialsQuery = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      dartCategory,
      isActive,
      isRLLinked,
      sortBy = 'sku',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MaterialWhereInput = {};

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } },
        { rlTag: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (dartCategory !== undefined) {
      where.dartCategory = dartCategory;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isRLLinked !== undefined) {
      where.isRLLinked = isRLLinked;
    }

    // Execute query with count
    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              templateItems: true,
              pricingHistory: true,
            },
          },
        },
      }),
      db.material.count({ where }),
    ]);

    return {
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update material
   */
  async updateMaterial(id: string, input: UpdateMaterialInput): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: input,
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
        if (error.code === 'P2002') {
          throw new Error('A material with this SKU already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Soft delete material (set isActive to false)
   */
  async deactivateMaterial(id: string): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: { isActive: false },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
      }
      throw error;
    }
  }

  /**
   * Reactivate material
   */
  async activateMaterial(id: string): Promise<Material> {
    try {
      const material = await db.material.update({
        where: { id },
        data: { isActive: true },
      });

      return material;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
      }
      throw error;
    }
  }

  /**
   * Hard delete material (use with caution)
   */
  async deleteMaterial(id: string): Promise<void> {
    try {
      await db.material.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Material not found');
        }
        if (error.code === 'P2003') {
          throw new Error(
            'Cannot delete material with existing plan templates or pricing. Deactivate instead.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get material categories (unique list from enum)
   */
  async getCategories(): Promise<MaterialCategory[]> {
    return Object.values(MaterialCategory);
  }

  /**
   * Get materials by DART category
   */
  async getMaterialsByDartCategory(dartCategory: number, isActive = true) {
    const materials = await db.material.findMany({
      where: {
        dartCategory,
        isActive,
      },
      orderBy: { description: 'asc' },
    });

    return materials;
  }

  /**
   * Get Random Lengths linked materials
   */
  async getRLLinkedMaterials() {
    const materials = await db.material.findMany({
      where: {
        isRLLinked: true,
        isActive: true,
      },
      orderBy: { rlTag: 'asc' },
    });

    return materials;
  }

  /**
   * Get material statistics
   */
  async getMaterialStats() {
    const [total, byCategory, byDartCategory, rlLinked] = await Promise.all([
      db.material.count({ where: { isActive: true } }),
      db.material.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { id: true },
      }),
      db.material.groupBy({
        by: ['dartCategory'],
        where: { isActive: true, dartCategory: { not: null } },
        _count: { id: true },
      }),
      db.material.count({ where: { isActive: true, isRLLinked: true } }),
    ]);

    return {
      total,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      byDartCategory: byDartCategory.map((d) => ({
        dartCategory: d.dartCategory,
        count: d._count.id,
      })),
      rlLinkedCount: rlLinked,
    };
  }
}

export const materialService = new MaterialService();
