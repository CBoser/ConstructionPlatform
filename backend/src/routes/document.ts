import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { documentService } from '../services/document';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole, DocumentType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads (disk storage)
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept common document types
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, Excel, Word, CSV, image, or ZIP files.'));
    }
  },
});

// ====== DOCUMENT ROUTES ======

/**
 * @route   POST /api/v1/plans/:planId/documents
 * @desc    Upload a document for a plan
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:planId/documents',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const { planId } = req.params;
      const { fileType, documentDate, elevationId, changeNotes } = req.body;

      // Validation
      if (!fileType || !Object.values(DocumentType).includes(fileType)) {
        return res.status(400).json({
          success: false,
          error: `File type is required. Valid types: ${Object.values(DocumentType).join(', ')}`,
        });
      }

      if (!documentDate) {
        return res.status(400).json({
          success: false,
          error: 'Document date is required',
        });
      }

      const document = await documentService.createDocument({
        planId,
        elevationId: elevationId || undefined,
        fileName: req.file.originalname,
        fileType: fileType as DocumentType,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentDate: new Date(documentDate),
        changeNotes,
        uploadedBy: req.user?.email,
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully',
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/documents
 * @desc    List documents for a plan
 * @access  Private
 */
router.get(
  '/:planId/documents',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const { elevationId, fileType, includeArchived } = req.query;

      const documents = await documentService.listDocuments({
        planId,
        elevationId: elevationId as string | undefined,
        fileType: fileType as DocumentType | undefined,
        includeArchived: includeArchived === 'true',
      });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error('List documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list documents',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/documents/:documentId
 * @desc    Get document by ID
 * @access  Private
 */
router.get(
  '/:planId/documents/:documentId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;

      const document = await documentService.getDocumentById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
        });
      }

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get document',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/documents/:documentId/download
 * @desc    Download a document file
 * @access  Private
 */
router.get(
  '/:planId/documents/:documentId/download',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;

      const document = await documentService.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
        });
      }

      const filePath = await documentService.getDocumentFilePath(documentId);

      res.download(filePath, document.fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: 'Failed to download document',
            });
          }
        }
      });
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download document',
      });
    }
  }
);

/**
 * @route   PUT /api/v1/plans/:planId/documents/:documentId
 * @desc    Update document metadata
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.put(
  '/:planId/documents/:documentId',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { fileType, documentDate, changeNotes } = req.body;

      const updateData: any = {};
      if (fileType !== undefined) updateData.fileType = fileType as DocumentType;
      if (documentDate !== undefined) updateData.documentDate = new Date(documentDate);
      if (changeNotes !== undefined) updateData.changeNotes = changeNotes;

      const document = await documentService.updateDocument(documentId, updateData);

      res.status(200).json({
        success: true,
        data: document,
        message: 'Document updated successfully',
      });
    } catch (error) {
      console.error('Update document error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      });
    }
  }
);

/**
 * @route   POST /api/v1/plans/:planId/documents/:documentId/replace
 * @desc    Replace a document with a new version
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:planId/documents/:documentId/replace',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const { documentId } = req.params;
      const { documentDate, changeNotes, archiveNotes } = req.body;

      if (!documentDate) {
        return res.status(400).json({
          success: false,
          error: 'Document date is required',
        });
      }

      const result = await documentService.replaceDocument(documentId, {
        newFilePath: req.file.path,
        newFileName: req.file.originalname,
        newFileSize: req.file.size,
        newMimeType: req.file.mimetype,
        documentDate: new Date(documentDate),
        changeNotes,
        archiveNotes,
        uploadedBy: req.user?.email,
      });

      res.status(200).json({
        success: true,
        data: result.newDocument,
        message: 'Document replaced successfully',
      });
    } catch (error) {
      console.error('Replace document error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to replace document',
      });
    }
  }
);

/**
 * @route   POST /api/v1/plans/:planId/documents/:documentId/archive
 * @desc    Archive a document
 * @access  Private (ADMIN, ESTIMATOR)
 */
router.post(
  '/:planId/documents/:documentId/archive',
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.ESTIMATOR),
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { archiveNotes } = req.body;

      const document = await documentService.archiveDocument(documentId, archiveNotes);

      res.status(200).json({
        success: true,
        data: document,
        message: 'Document archived successfully',
      });
    } catch (error) {
      console.error('Archive document error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive document',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/plans/:planId/documents/:documentId
 * @desc    Delete a document
 * @access  Private (ADMIN only)
 */
router.delete(
  '/:planId/documents/:documentId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;

      await documentService.deleteDocument(documentId);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      });
    }
  }
);

/**
 * @route   GET /api/v1/plans/:planId/documents/versions
 * @desc    Get version history for documents
 * @access  Private
 */
router.get(
  '/:planId/documents-versions',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const { elevationId, fileType } = req.query;

      const documents = await documentService.getVersionHistory(
        planId,
        elevationId as string | undefined,
        fileType as DocumentType | undefined
      );

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error('Get version history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get version history',
      });
    }
  }
);

export default router;
