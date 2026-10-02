import { Router } from 'express';
import { whatsappController } from '../controllers/whatsapp.controller';

const router = Router();

// Meta Inbound Webhook - No auth (verified by hub.verify_token and appSecret)
router.get('/whatsapp', (req, res) => whatsappController.verifyWebhook(req, res));
router.post('/whatsapp', (req, res) => whatsappController.handleWebhook(req, res));

export const webhookRouter = router;
