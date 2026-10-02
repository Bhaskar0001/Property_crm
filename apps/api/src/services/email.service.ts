import { Resend } from 'resend';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (config.resend.apiKey) {
      this.resend = new Resend(config.resend.apiKey);
    } else {
      logger.info('Resend API key not set — emails will be logged to console in development mode.');
    }
  }

  async sendOtp(email: string, otp: string, name?: string): Promise<boolean> {
    const greeting = name ? `Hello ${name},` : 'Hello,';
    const subject = `Your Verification Code: ${otp} — PropertyOS`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #004274; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">PROPERTY<span style="color: #6fabca;">OS</span></h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Client Portal Access</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">${greeting}</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Use the secure one-time verification code below to access your saved properties, viewings, and confidential advisory requests:</p>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px dashed #cbd5e1;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #004274; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this login code, you can safely disregard this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">PropertyOS Advisory Group • Dublin • London • Dubai<br/>Licensed Real Estate Practice</p>
      </div>
    `;

    if (this.resend) {
      try {
        const { error } = await this.resend.emails.send({
          from: config.resend.mailFrom,
          to: [email],
          subject,
          html,
        });

        if (error) {
          logger.error({ err: error }, `Failed to deliver OTP email to ${email}`);
          return false;
        }
        return true;
      } catch (err) {
        logger.error({ err }, `Error sending OTP email via Resend to ${email}`);
        return false;
      }
    } else {
      // Dev log fallback
      logger.info(
        `\n======================================================\n📨 [DEV EMAIL DISPATCH] TO: ${email}\nSUBJECT: ${subject}\nVERIFICATION CODE (OTP): [ ${otp} ]\n======================================================\n`
      );
      return true;
    }
  }

  async sendViewingNotification(
    recipientEmail: string,
    details: {
      customerName: string;
      customerPhone: string;
      propertyTitle: string;
      scheduledDate: string;
      timeWindow: string;
      notes?: string;
    }
  ): Promise<boolean> {
    const subject = `Viewing Request: ${details.propertyTitle} — PropertyOS`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="color: #004274;">Viewing Request Received</h3>
        <p>A viewing appointment has been requested for <strong>${details.propertyTitle}</strong>.</p>
        <ul style="color: #334155; line-height: 1.8;">
          <li><strong>Client Name:</strong> ${details.customerName}</li>
          <li><strong>Client Phone:</strong> ${details.customerPhone}</li>
          <li><strong>Preferred Date:</strong> ${details.scheduledDate}</li>
          <li><strong>Time Window:</strong> ${details.timeWindow}</li>
          ${details.notes ? `<li><strong>Notes:</strong> ${details.notes}</li>` : ''}
        </ul>
        <p style="color: #64748b; font-size: 12px;">Our team will coordinate property access and confirm with the client.</p>
      </div>
    `;

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: config.resend.mailFrom,
          to: [recipientEmail],
          subject,
          html,
        });
        return true;
      } catch (err) {
        logger.error({ err }, 'Error sending viewing email');
        return false;
      }
    } else {
      logger.info(`[DEV EMAIL] Viewing notice to ${recipientEmail} for ${details.propertyTitle}`);
      return true;
    }
  }
}

export const emailService = new EmailService();
