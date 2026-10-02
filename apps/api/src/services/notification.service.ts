import { NotificationModel } from '../models/Notification';
import { emitToUser } from '../config/socket';

export const notificationService = {
  async create(recipientId: string, type: string, title: string, message: string, data?: any) {
    const notification = await NotificationModel.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
      isRead: false,
    });

    emitToUser(recipientId, 'new_notification', notification);
    return notification;
  },

  async getForUser(userId: string, page: number = 1, limit: number = 10, unreadOnly: boolean = false) {
    const query: any = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
      { $set: { isRead: true } },
      { new: true }
    );
    return notification;
  },

  async markAllAsRead(userId: string) {
    const result = await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  },

  async getUnreadCount(userId: string) {
    return NotificationModel.countDocuments({ recipient: userId, isRead: false });
  },
};
