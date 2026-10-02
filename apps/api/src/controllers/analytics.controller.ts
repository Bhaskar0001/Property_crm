import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { importService } from '../services/import.service';

export const analyticsController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = await analyticsService.getDashboard(req.query.range as string, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = await analyticsService.getProperties(req.query.range as string, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = await analyticsService.getLeads(req.query.range as string, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = await analyticsService.getStaff(req.query.range as string, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const type = req.params.type as 'properties' | 'leads';
      const csv = await analyticsService.exportData(type, user);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  async importProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await importService.importProperties(req.body.rows, user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async importLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await importService.importLeads(req.body.rows, user);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
