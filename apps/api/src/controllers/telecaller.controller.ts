import { Response, NextFunction } from 'express';
import { telecallerService } from '../services/telecaller.service';
import { AuthRequest } from '../middlewares/auth';
import { UnauthorizedError } from '../utils/errors';

export class TelecallerController {
  async getQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const queue = await telecallerService.getCallingQueue(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  async logCall(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const result = await telecallerService.logCall(req.body, req.user._id.toString());
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const stats = await telecallerService.getTelecallerStats(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const telecallerController = new TelecallerController();
