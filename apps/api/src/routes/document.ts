import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getPropertyDocuments,
  getDocumentDownloadUrl,
  deleteDocument,
} from '../controllers/document.controller';
import { authenticate, requirePermission } from '../middlewares/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export const documentRouter = Router();

documentRouter.post(
  '/upload/:propertyId',
  authenticate,
  requirePermission('properties.documents.upload'),
  upload.single('file'),
  uploadDocument
);

documentRouter.get(
  '/property/:propertyId',
  authenticate,
  requirePermission('properties.documents.view'),
  getPropertyDocuments
);

documentRouter.get(
  '/:id/download',
  authenticate,
  getDocumentDownloadUrl
);

documentRouter.delete(
  '/:id',
  authenticate,
  requirePermission('properties.edit'),
  deleteDocument
);
