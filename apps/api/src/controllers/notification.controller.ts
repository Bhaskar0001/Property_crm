import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const notificationController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await notificationService.getForUser(req.user!._id, page, limit, unreadOnly);
      sendPaginated(res, result.notifications, result.total, page, limit);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!._id);
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.markAllAsRead(req.user!._id);
      sendSuccess(res, { count }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!._id);
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }
};
