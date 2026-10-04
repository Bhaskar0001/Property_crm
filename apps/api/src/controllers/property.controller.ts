import { Request, Response, NextFunction } from 'express';
import { propertyService } from '../services/property.service';

export class PropertyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.create(req.body, (req as any).user._id);
      res.status(201).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.update(req.params.id, req.body, (req as any).user._id);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.getById(req.params.id, (req as any).user);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await propertyService.list(req.query as any, (req as any).user);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.updateStatus(req.params.id, req.body.status, (req as any).user._id);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async setPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.setPublished(req.params.id, req.body.isPublished, (req as any).user._id);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const property = await propertyService.delete(req.params.id, (req as any).user._id);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async exportProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await propertyService.exportProperties(req.query as any, (req as any).user);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="properties-export.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  async importProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const { importService } = await import('../services/import.service');
      const rows = req.body.rows || req.body;
      const result = await importService.importProperties(rows, (req as any).user);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const propertyController = new PropertyController();
