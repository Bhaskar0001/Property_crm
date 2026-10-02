import { Request, Response, NextFunction } from 'express';
import { offerService } from '../services/offer.service';

export const offerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await offerService.list(req.query as any, user);
      res.json({
        success: true,
        data: result.offers,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        stats: result.stats,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await offerService.getById(req.params.id);
      res.json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const offer = await offerService.create(req.body, user);
      res.status(201).json({
        success: true,
        message: 'Offer submitted successfully',
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const offer = await offerService.update(req.params.id, req.body, user);
      res.json({
        success: true,
        message: 'Offer updated successfully',
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const offer = await offerService.updateStatus(req.params.id, req.body, user);
      res.json({
        success: true,
        message: `Offer status transitioned to ${offer.status}`,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateDealStage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const offer = await offerService.updateDealStage(req.params.id, req.body.dealStage, user);
      res.json({
        success: true,
        message: `Deal milestone updated to ${offer.dealStage}`,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  async getDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const deals = await offerService.getDeals(user);
      res.json({ success: true, data: deals });
    } catch (err) {
      next(err);
    }
  },
};
