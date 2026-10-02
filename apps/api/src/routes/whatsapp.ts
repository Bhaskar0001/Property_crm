import { Router } from 'express';
import { whatsappController } from '../controllers/whatsapp.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff authentication required for WhatsApp operations
router.use(authenticate);

// Conversations
router.get('/conversations', (req, res, next) => whatsappController.getConversations(req, res, next));
router.get('/conversations/:id/messages', (req, res, next) => whatsappController.getMessages(req, res, next));

// Send Messages
router.post('/send', (req, res, next) => whatsappController.sendMessage(req, res, next));
router.post('/send-property', (req, res, next) => whatsappController.sendProperty(req, res, next));

// Templates
router.get('/templates', (req, res, next) => whatsappController.getTemplates(req, res, next));

// Campaigns
router.post('/campaigns', (req, res, next) => whatsappController.runCampaign(req, res, next));

export const whatsappRouter = router;
