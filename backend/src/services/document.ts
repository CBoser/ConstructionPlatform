import { PlanDocument, Prisma, DocumentType } from '@prisma/client';
import { db } from './database';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CreateDocumentInput {
  planId: string;
  elevationId?: string;
  fileName: string;
  fileType: DocumentType;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentDate: Date;
  changeNotes?: string;
  uploadedBy?: string;
}

export interface UpdateDocumentInput {
  fileType?: DocumentType;
  documentDate?: Date;
  changeNotes?: string;
}

export interface ReplaceDocumentInput {
  newFilePath: string;
  newFileName: string;
  newFileSize: number;
  newMimeType: string;
  documentDate: Date;
  changeNotes?: string;
  archiveNotes?: string;
  uploadedBy?: string;
}

export interface ListDocumentsQuery {
  planId?: string;
  elevationId?: string;
  fileType?: DocumentType;
  includeArchived?: boolean;
}

class DocumentService {
  // Directory for storing uploaded files
  private uploadDir = path.join(__dirname, '../../uploads');

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Create a new document
   */
  async createDocument(input: CreateDocumentInput): Promise<PlanDocument> {
    try {
      await this.ensureUploadDir();

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

      const document = await db.planDocument.create({
        data: {
          planId: input.planId,
          elevationId: input.elevationId,
          fileName: input.fileName,
          fileType: input.fileType,
          filePath: input.filePath,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          documentDate: input.documentDate,
          changeNotes: input.changeNotes,
          uploadedBy: input.uploadedBy,
          version: 1,
        },
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

      return document;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<PlanDocument | null> {
    const document = await db.planDocument.findUnique({
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
        replacedBy: true,
        replaces: true,
      },
    });

    return document;
  }

  /**
   * List documents with filtering
   */
  async listDocuments(query: ListDocumentsQuery = {}): Promise<PlanDocument[]> {
    const { planId, elevationId, fileType, includeArchived = false } = query;

    const where: Prisma.PlanDocumentWhereInput = {};

    if (planId) {
      where.planId = planId;
    }

    if (elevationId !== undefined) {
      where.elevationId = elevationId;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    if (!includeArchived) {
      where.isArchived = false;
    }

    const documents = await db.planDocument.findMany({
      where,
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
      orderBy: [{ documentDate: 'desc' }, { createdAt: 'desc' }],
    });

    return documents;
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, input: UpdateDocumentInput): Promise<PlanDocument> {
    try {
      const document = await db.planDocument.update({
        where: { id },
        data: input,
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

      return document;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Document not found');
        }
      }
      throw error;
    }
  }

  /**
   * Replace a document with a new version (archives the old one)
   */
  async replaceDocument(
    id: string,
    input: ReplaceDocumentInput
  ): Promise<{ oldDocument: PlanDocument; newDocument: PlanDocument }> {
    try {
      await this.ensureUploadDir();

      // Get the existing document
      const existingDoc = await db.planDocument.findUnique({
        where: { id },
      });

      if (!existingDoc) {
        throw new Error('Document not found');
      }

      // Archive the existing document
      const archivedDoc = await db.planDocument.update({
        where: { id },
        data: {
          isArchived: true,
          archiveDate: new Date(),
          archiveNotes: input.archiveNotes,
        },
      });

      // Create new document with incremented version
      const newDoc = await db.planDocument.create({
        data: {
          planId: existingDoc.planId,
          elevationId: existingDoc.elevationId,
          fileName: input.newFileName,
          fileType: existingDoc.fileType,
          filePath: input.newFilePath,
          fileSize: input.newFileSize,
          mimeType: input.newMimeType,
          documentDate: input.documentDate,
          changeNotes: input.changeNotes,
          uploadedBy: input.uploadedBy,
          version: existingDoc.version + 1,
          replacedById: null,
        },
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

      // Update the archived document to point to its replacement
      await db.planDocument.update({
        where: { id: archivedDoc.id },
        data: {
          replacedById: newDoc.id,
        },
      });

      return {
        oldDocument: archivedDoc,
        newDocument: newDoc,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive a document without replacing it
   */
  async archiveDocument(id: string, archiveNotes?: string): Promise<PlanDocument> {
    try {
      const document = await db.planDocument.update({
        where: { id },
        data: {
          isArchived: true,
          archiveDate: new Date(),
          archiveNotes,
        },
      });

      return document;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Document not found');
        }
      }
      throw error;
    }
  }

  /**
   * Delete a document (hard delete - also removes file from disk)
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      const document = await db.planDocument.findUnique({
        where: { id },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Delete from database
      await db.planDocument.delete({
        where: { id },
      });

      // Try to delete file from disk (ignore errors if file doesn't exist)
      try {
        await fs.unlink(document.filePath);
      } catch (err) {
        // File may have already been deleted or doesn't exist
        console.warn(`Could not delete file at ${document.filePath}:`, err);
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Document not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get document file path for download
   */
  async getDocumentFilePath(id: string): Promise<string> {
    const document = await db.planDocument.findUnique({
      where: { id },
      select: { filePath: true },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Verify file exists
    try {
      await fs.access(document.filePath);
    } catch {
      throw new Error('Document file not found on disk');
    }

    return document.filePath;
  }

  /**
   * Get version history for a plan or elevation
   */
  async getVersionHistory(
    planId: string,
    elevationId?: string,
    fileType?: DocumentType
  ): Promise<PlanDocument[]> {
    const where: Prisma.PlanDocumentWhereInput = {
      planId,
      elevationId,
    };

    if (fileType) {
      where.fileType = fileType;
    }

    const documents = await db.planDocument.findMany({
      where,
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
        replacedBy: {
          select: {
            id: true,
            version: true,
            fileName: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
    });

    return documents;
  }
}

export const documentService = new DocumentService();
