import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { sendPaginated } from '../utils/response';

export const auditController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        userId: req.query.userId as string,
        entity: req.query.entity as string,
        entityId: req.query.entityId as string,
        action: req.query.action as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const result = await auditService.getAll({ page, limit, ...filters });
      sendPaginated(res, result.logs, result.total, page, limit);
    } catch (error) {
      next(error);
    }
  }
};
