import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate, requireRole } from '../middlewares/auth';

export const auditRouter = Router();

auditRouter.use(authenticate, requireRole('admin'));
auditRouter.get('/', auditController.list);
