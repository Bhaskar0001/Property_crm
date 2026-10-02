import { Request, Response, NextFunction } from 'express';
import { viewingService } from '../services/viewing.service';

export const viewingController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await viewingService.list(req.query as any, user);
      res.json({
        success: true,
        data: result.viewings,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const viewing = await viewingService.getById(req.params.id);
      res.json({ success: true, data: viewing });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const viewing = await viewingService.create(req.body, user);
      res.status(201).json({
        success: true,
        message: 'Viewing appointment booked successfully',
        data: viewing,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const viewing = await viewingService.update(req.params.id, req.body, user);
      res.json({
        success: true,
        message: 'Viewing appointment updated successfully',
        data: viewing,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const viewing = await viewingService.updateStatus(req.params.id, req.body, user);
      res.json({
        success: true,
        message: `Viewing status updated to ${viewing.status}`,
        data: viewing,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { from, to } = req.query as { from?: string; to?: string };
      const viewings = await viewingService.getCalendar(from || '', to || '', user);
      res.json({ success: true, data: viewings });
    } catch (err) {
      next(err);
    }
  },
};
