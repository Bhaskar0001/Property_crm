import { Router } from 'express';
import { telecallerController } from '../controllers/telecaller.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff authentication required for calling desk
router.use(authenticate);

router.get('/queue', (req, res, next) => telecallerController.getQueue(req, res, next));
router.post('/call', (req, res, next) => telecallerController.logCall(req, res, next));
router.get('/stats', (req, res, next) => telecallerController.getStats(req, res, next));

export const telecallerRouter = router;
