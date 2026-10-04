import { Router } from 'express';
import { propertyController } from '../controllers/property.controller';
import { authenticate, requirePermission } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { 
  createPropertySchema, 
  updatePropertySchema, 
  propertyQuerySchema, 
  updateStatusSchema, 
  publishToggleSchema 
} from '../validators/property.validator';

const router = Router();

router.get(
  '/', 
  authenticate,
  requirePermission('properties.view'),
  validate(propertyQuerySchema, 'query'), 
  propertyController.list.bind(propertyController)
);

router.get(
  '/export',
  authenticate,
  requirePermission('properties.view'),
  propertyController.exportProperties.bind(propertyController)
);

router.post(
  '/import',
  authenticate,
  requirePermission('properties.create'),
  propertyController.importProperties.bind(propertyController)
);

router.get(
  '/:id', 
  authenticate,
  requirePermission('properties.view'),
  propertyController.getById.bind(propertyController)
);

router.post(
  '/', 
  authenticate,
  requirePermission('properties.create'),
  validate(createPropertySchema), 
  propertyController.create.bind(propertyController)
);

router.put(
  '/:id', 
  authenticate,
  requirePermission('properties.edit'),
  validate(updatePropertySchema), 
  propertyController.update.bind(propertyController)
);

router.patch(
  '/:id/status', 
  authenticate,
  requirePermission('properties.edit'),
  validate(updateStatusSchema), 
  propertyController.updateStatus.bind(propertyController)
);

router.patch(
  '/:id/publish', 
  authenticate,
  requirePermission('properties.publish'),
  validate(publishToggleSchema), 
  propertyController.setPublished.bind(propertyController)
);

router.delete(
  '/:id', 
  authenticate,
  requirePermission('properties.archive'),
  propertyController.delete.bind(propertyController)
);

export const propertyRouter = router;
export default router;
