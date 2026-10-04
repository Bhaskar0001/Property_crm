import { Job } from 'bullmq';
import { NotificationModel } from '../../models/Notification';
import { emitToUser, emitToAdmins } from '../../config/socket';
import { logger } from '../../utils/logger';

export interface NotificationJobData {
  type: 'new_lead' | 'new_enquiry' | 'new_whatsapp' | 'lead_assigned'
    | 'follow_up_due' | 'follow_up_overdue' | 'viewing_created'
    | 'viewing_changed' | 'offer_created' | 'staff_activity'
    | 'property_status_change';
  recipientId?: string;     // specific user; omit for broadcast
  broadcastToAdmins?: boolean;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { type, recipientId, broadcastToAdmins, title, message, data } = job.data;
  logger.info(`Processing notification job: type=${type} recipient=${recipientId || 'admins'}`);

  try {
    if (recipientId) {
      // Persist to DB
      const notification = await NotificationModel.create({
        recipient: recipientId,
        type,
        title,
        message,
        data,
        isRead: false,
      });

      // Push via Socket.IO in real-time
      emitToUser(recipientId, 'new_notification', {
        _id: notification._id,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    if (broadcastToAdmins) {
      // Emit to all admins (for things like new leads, new enquiries)
      emitToAdmins('system_event', {
        type,
        title,
        message,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error({ err }, `Notification job failed: type=${type}`);
    throw err;
  }
}
