import { Router } from 'express';
import { viewingController } from '../controllers/viewing.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all viewing routes with staff authentication
router.use(authenticate);

// Calendar view
router.get('/calendar', (req, res, next) => viewingController.getCalendar(req, res, next));

// CRUD
router.get('/', (req, res, next) => viewingController.list(req, res, next));
router.get('/:id', (req, res, next) => viewingController.getById(req, res, next));
router.post('/', (req, res, next) => viewingController.create(req, res, next));
router.put('/:id', (req, res, next) => viewingController.update(req, res, next));
router.patch('/:id/status', (req, res, next) => viewingController.updateStatus(req, res, next));

export const viewingRouter = router;
