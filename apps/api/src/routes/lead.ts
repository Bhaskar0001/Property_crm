import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authenticate, requirePermission } from '../middlewares/auth';

const router = Router();

// All lead routes require staff authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission('leads.view'),
  (req, res, next) => leadController.list(req, res, next)
);

router.post(
  '/',
  requirePermission('leads.create'),
  (req, res, next) => leadController.create(req, res, next)
);

router.get(
  '/:id',
  requirePermission('leads.view'),
  (req, res, next) => leadController.getById(req, res, next)
);

router.put(
  '/:id',
  requirePermission('leads.edit'),
  (req, res, next) => leadController.update(req, res, next)
);

router.patch(
  '/:id/stage',
  requirePermission('leads.edit'),
  (req, res, next) => leadController.changeStage(req, res, next)
);

router.patch(
  '/:id/assign',
  requirePermission('leads.assign'),
  (req, res, next) => leadController.assign(req, res, next)
);

router.post(
  '/:id/notes',
  requirePermission('leads.edit'),
  (req, res, next) => leadController.addNote(req, res, next)
);

router.post(
  '/:id/match',
  requirePermission('leads.view'),
  (req, res, next) => leadController.matchProperties(req, res, next)
);

router.post(
  '/:id/tasks',
  requirePermission('leads.edit'),
  (req, res, next) => leadController.createTask(req, res, next)
);

router.patch(
  '/tasks/:taskId',
  requirePermission('leads.edit'),
  (req, res, next) => leadController.updateTaskStatus(req, res, next)
);

export const leadRouter = router;
