import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppClient {
  private apiUrl: string;
  private token: string;
  private phoneNumberId: string;

  constructor() {
    this.token = config.whatsapp.token;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
  }

  private isConfigured(): boolean {
    return Boolean(this.token && this.phoneNumberId);
  }

  // Standard Text Message
  async sendTextMessage(to: string, text: string): Promise<WhatsAppSendResult> {
    const cleanTo = to.replace(/[^0-9]/g, '');

    if (!this.isConfigured()) {
      const mockId = `wamid.HBgM${Date.now()}${Math.floor(Math.random() * 1000)}`;
      logger.info(
        `\n======================================================\n📱 [WHATSAPP DEV DISPATCH]\nTO: +${cleanTo}\nTEXT: "${text}"\nMESSAGE ID: ${mockId}\n======================================================\n`
      );
      return { success: true, messageId: mockId };
    }

    try {
      const res = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: true, body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messageId = res.data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error({ err: err.response?.data || err }, `Failed to deliver WhatsApp message to ${cleanTo}`);
      return { success: false, error: errorMsg };
    }
  }

  // Send Rich Property Card
  async sendPropertyCard(
    to: string,
    property: {
      title: string;
      price: number;
      currencySymbol?: string;
      city?: string;
      coverImage?: string;
      publicUrl: string;
    }
  ): Promise<WhatsAppSendResult> {
    const cleanTo = to.replace(/[^0-9]/g, '');
    const symbol = property.currencySymbol || '€';
    const text = `🏡 *${property.title}*\n📍 ${property.city || 'Prime Location'}\n💰 Asking: *${symbol}${property.price.toLocaleString()}*\n\nView full specifications, photos, and virtual tour:\n🔗 ${property.publicUrl}`;

    if (!this.isConfigured()) {
      const mockId = `wamid.HBgProp${Date.now()}${Math.floor(Math.random() * 1000)}`;
      logger.info(
        `\n======================================================\n📱 [WHATSAPP PROPERTY SHARE]\nTO: +${cleanTo}\nIMAGE: ${property.coverImage || 'None'}\nCAPTION:\n${text}\nMESSAGE ID: ${mockId}\n======================================================\n`
      );
      return { success: true, messageId: mockId };
    }

    try {
      let payload: any;
      if (property.coverImage) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'image',
          image: {
            link: property.coverImage,
            caption: text,
          },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: { preview_url: true, body: text },
        };
      }

      const res = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const messageId = res.data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error({ err: err.response?.data || err }, `Failed to send property card to ${cleanTo}`);
      return { success: false, error: errorMsg };
    }
  }

  // Pre-approved Template Message
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[]
  ): Promise<WhatsAppSendResult> {
    const cleanTo = to.replace(/[^0-9]/g, '');

    if (!this.isConfigured()) {
      const mockId = `wamid.HBgTpl${Date.now()}`;
      logger.info(
        `\n======================================================\n📱 [WHATSAPP TEMPLATE DISPATCH]\nTO: +${cleanTo}\nTEMPLATE: ${templateName} (${languageCode})\nMESSAGE ID: ${mockId}\n======================================================\n`
      );
      return { success: true, messageId: mockId };
    }

    try {
      const res = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messageId = res.data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      logger.error({ err: err.response?.data || err }, `Failed to deliver template message to ${cleanTo}`);
      return { success: false, error: errorMsg };
    }
  }
}

export const whatsappClient = new WhatsAppClient();
