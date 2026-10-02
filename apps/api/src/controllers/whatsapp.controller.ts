import { Request, Response, NextFunction } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { config } from '../config';

export const whatsappController = {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const conversations = await whatsappService.getConversations(user);
      res.json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await whatsappService.getMessages(req.params.id, user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const message = await whatsappService.sendMessage(req.body, user);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  },

  async sendProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const message = await whatsappService.sendProperty(req.body, user);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  },

  async getTemplates(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await whatsappService.getTemplates();
      res.json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  },

  async runCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const campaign = await whatsappService.runCampaign(req.body, user);
      res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  },

  // Meta Inbound Webhook Verification
  verifyWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  },

  // Meta Inbound Webhook Payload Processing
  async handleWebhook(req: Request, res: Response) {
    try {
      await whatsappService.handleWebhook(req.body);
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(200); // Always return 200 to WhatsApp to avoid retry storm
    }
  },
};
