import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', notificationController.list);
notificationRouter.get('/unread-count', notificationController.getUnreadCount);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.patch('/read-all', notificationController.markAllAsRead);
