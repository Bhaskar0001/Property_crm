import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff authentication required for all AI features
router.use(authenticate);

router.post('/generate-description', (req, res, next) => aiController.generateDescription(req, res, next));
router.post('/extract-requirements', (req, res, next) => aiController.extractRequirements(req, res, next));
router.post('/summarize-conversation', (req, res, next) => aiController.summarizeConversation(req, res, next));
router.post('/search', (req, res, next) => aiController.search(req, res, next));
router.post('/dashboard-query', (req, res, next) => aiController.dashboardQuery(req, res, next));

export const aiRouter = router;
