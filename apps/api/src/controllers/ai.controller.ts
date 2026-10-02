import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { ValidationError } from '../utils/errors';

export const aiController = {
  async generateDescription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.title || !req.body.city) {
        throw new ValidationError('Property title and city are required for AI copy generation');
      }
      const result = await aiService.generatePropertyDescription(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async extractRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.text) {
        throw new ValidationError('Text content is required');
      }
      const result = await aiService.extractRequirements(req.body.text);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async summarizeConversation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Array.isArray(req.body.messages)) {
        throw new ValidationError('Messages array is required');
      }
      const result = await aiService.summarizeConversation(req.body.messages);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.query) {
        throw new ValidationError('Search query is required');
      }
      const result = await aiService.naturalLanguageSearch(req.body.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async dashboardQuery(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.question) {
        throw new ValidationError('Question is required');
      }
      const result = await aiService.dashboardQuery(req.body.question);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
