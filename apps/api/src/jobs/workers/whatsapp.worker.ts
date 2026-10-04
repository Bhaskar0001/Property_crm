import { Job } from 'bullmq';
import { whatsappClient } from '../../integrations/whatsapp.client';
import { logger } from '../../utils/logger';

export interface WhatsAppJobData {
  type: 'text' | 'property_card' | 'template' | 'bulk';
  to: string;
  payload: Record<string, any>;
}

export async function processWhatsAppJob(job: Job<WhatsAppJobData>): Promise<void> {
  const { type, to, payload } = job.data;
  logger.info(`Processing WhatsApp job: type=${type} to=${to}`);

  try {
    switch (type) {
      case 'text':
        await whatsappClient.sendTextMessage(to, payload.text);
        break;

      case 'property_card':
        await whatsappClient.sendPropertyCard(to, payload as any);
        break;

      case 'template':
        await whatsappClient.sendTemplateMessage(
          to,
          payload.templateName,
          payload.languageCode,
          payload.components,
        );
        break;

      case 'bulk': {
        // Bulk sends are split into individual jobs by the campaign service
        // This handles a single message within a bulk campaign
        const { text, templateName } = payload;
        if (templateName) {
          await whatsappClient.sendTemplateMessage(to, templateName, payload.languageCode || 'en', payload.components);
        } else if (text) {
          await whatsappClient.sendTextMessage(to, text);
        }
        break;
      }

      default:
        logger.warn(`Unknown WhatsApp job type: ${type}`);
    }
  } catch (err) {
    logger.error({ err }, `WhatsApp job failed: type=${type} to=${to}`);
    throw err;
  }
}
