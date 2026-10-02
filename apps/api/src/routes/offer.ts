import { Router } from 'express';
import { offerController } from '../controllers/offer.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protect all offer routes with staff authentication
router.use(authenticate);

// Deal pipeline tracking
router.get('/deals', (req, res, next) => offerController.getDeals(req, res, next));

// CRUD
router.get('/', (req, res, next) => offerController.list(req, res, next));
router.get('/:id', (req, res, next) => offerController.getById(req, res, next));
router.post('/', (req, res, next) => offerController.create(req, res, next));
router.put('/:id', (req, res, next) => offerController.update(req, res, next));
router.patch('/:id/status', (req, res, next) => offerController.updateStatus(req, res, next));
router.patch('/:id/deal-stage', (req, res, next) => offerController.updateDealStage(req, res, next));

export const offerRouter = router;
