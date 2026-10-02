import { Router } from 'express';
import multer from 'multer';
import {
  uploadMedia,
  getPropertyMedia,
  setCoverImage,
  reorderMedia,
  deleteMedia,
} from '../controllers/media.controller';
import { authenticate, requirePermission } from '../middlewares/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
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
