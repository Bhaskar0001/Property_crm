import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';
import { emitToUser, emitToAdmins } from '../config/socket';
import { logger } from '../utils/logger';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: string;
  metadata?: any;
}

export const notificationService = {
  async create(recipientId: string, type: string, title: string, message: string, data?: any) {
    try {
      const normalizedType = type?.toLowerCase() === 'system' ? 'system' : type || 'alert';
      const notification = await NotificationModel.create({
        recipient: recipientId,
        type: normalizedType,
        title,
        message,
        data,
        isRead: false,
      });

      emitToUser(recipientId, 'new_notification', notification);
      return notification;
    } catch (error) {
      logger.error({ err: error, recipientId }, 'Failed to create notification');
      throw error;
    }
  },

  async notifyUser(userId: string, payload: NotificationPayload) {
    return this.create(userId, payload.type || 'alert', payload.title, payload.message, payload.metadata);
  },

  async broadcastToAdmins(payload: NotificationPayload) {
    try {
      const admins = await UserModel.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('_id');
      const promises = admins.map((admin) =>
        this.create(admin._id.toString(), payload.type || 'alert', payload.title, payload.message, payload.metadata)
      );
      await Promise.all(promises);
      emitToAdmins('admin_notification', payload);
    } catch (error) {
      logger.error({ err: error }, 'Failed to broadcast notification to admins');
    }
  },

  async getForUser(userId: string, page: number = 1, limit: number = 10, unreadOnly: boolean = false) {
    const query: any = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      NotificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    return notification;
  },

  async markAllAsRead(userId: string) {
    const result = await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result.modifiedCount;
  },

  async getUnreadCount(userId: string) {
    return NotificationModel.countDocuments({ recipient: userId, isRead: false });
  },
};
