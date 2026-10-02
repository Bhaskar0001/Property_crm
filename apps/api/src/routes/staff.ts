import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createStaffSchema, updateStaffSchema, updatePermissionsSchema, resetPasswordSchema } from '../validators/staff.validator';

export const staffRouter = Router();

// All staff routes require admin
staffRouter.use(authenticate, requireRole('admin'));

staffRouter.get('/', staffController.list);
staffRouter.get('/:id', staffController.getById);
staffRouter.post('/', validate(createStaffSchema), staffController.create);
staffRouter.put('/:id', validate(updateStaffSchema), staffController.update);
staffRouter.put('/:id/permissions', validate(updatePermissionsSchema), staffController.updatePermissions);
staffRouter.patch('/:id/activate', staffController.activate);
staffRouter.patch('/:id/deactivate', staffController.deactivate);
staffRouter.post('/:id/reset-password', validate(resetPasswordSchema), staffController.resetPassword);
