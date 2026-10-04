import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff authentication required for sending emails
router.use(authenticate);

router.post('/send', (req, res, next) => emailController.send(req, res, next));
router.get('/templates', (req, res, next) => emailController.getTemplates(req, res, next));

export const emailRouter = router;
