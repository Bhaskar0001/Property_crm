import { Router } from 'express';
import multer from 'multer';
import {
  uploadMedia,
  addEmbedMedia,
  getPropertyMedia,
  setCoverImage,
  reorderMedia,
  deleteMedia,
} from '../controllers/media.controller';
import { authenticate, requirePermission } from '../middlewares/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for high-res images, video tours, & large PDFs
  },
});

export const mediaRouter = Router();

mediaRouter.post(
  '/upload/:propertyId',
  authenticate,
  requirePermission('properties.media.upload'),
  upload.array('files', 20),
  uploadMedia
);

mediaRouter.post(
  '/embed/:propertyId',
  authenticate,
  requirePermission('properties.media.upload'),
  addEmbedMedia
);

mediaRouter.get(
  '/property/:propertyId',
  authenticate,
  requirePermission('properties.view'),
  getPropertyMedia
);

mediaRouter.patch(
  '/:id/cover',
  authenticate,
  requirePermission('properties.edit'),
  setCoverImage
);

mediaRouter.patch(
  '/reorder/:propertyId',
  authenticate,
  requirePermission('properties.edit'),
  reorderMedia
);

mediaRouter.delete(
  '/:id',
  authenticate,
  requirePermission('properties.edit'),
  deleteMedia
);
