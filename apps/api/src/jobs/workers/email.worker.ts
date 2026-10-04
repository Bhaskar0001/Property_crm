import { Job } from 'bullmq';
import { emailService } from '../../services/email.service';
import { logger } from '../../utils/logger';

export interface EmailJobData {
  type: 'otp' | 'viewing_notification' | 'viewing_confirmation' | 'offer_status' | 'direct' | 'lead_notification';
  to: string;
  payload: Record<string, any>;
}

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { type, to, payload } = job.data;
  logger.info(`Processing email job: type=${type} to=${to}`);

  try {
    switch (type) {
      case 'otp':
        await emailService.sendOtp(to, payload.otp, payload.name);
        break;

      case 'viewing_notification':
        await emailService.sendViewingNotification(to, payload as any);
        break;

      case 'viewing_confirmation':
        await emailService.sendViewingConfirmation(to, payload as any);
        break;

      case 'offer_status':
        await emailService.sendOfferStatusUpdate(to, payload as any);
        break;

      case 'direct':
        await emailService.sendDirectEmail({
          to,
          subject: payload.subject,
          body: payload.body,
          senderName: payload.senderName,
          senderEmail: payload.senderEmail,
        });
        break;

      case 'lead_notification':
        await emailService.sendDirectEmail({
          to,
          subject: payload.subject || 'New Lead Notification',
          body: payload.body || `New lead received: ${payload.customerName} enquired about ${payload.propertyTitle}`,
        });
        break;

      default:
        logger.warn(`Unknown email job type: ${type}`);
    }
  } catch (err) {
    logger.error({ err }, `Email job failed: type=${type} to=${to}`);
    throw err; // Rethrow so BullMQ retries
  }
}
