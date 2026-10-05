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
    const subject = `Your Verification Code: ${otp} — AbroadAccommodation`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #004274; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">ESTATE<span style="color: #6fabca;">ELITE</span></h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Client Portal Access</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">${greeting}</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Use the secure one-time verification code below to access your saved properties, viewings, and confidential advisory requests:</p>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0; border: 1px dashed #cbd5e1;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #004274; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this login code, you can safely disregard this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">AbroadAccommodation Advisory Group • Dublin • London • Dubai<br/>Licensed Real Estate Practice</p>
      </div>
    `;

    const fromAddress =
      config.resend.mailFrom && !config.resend.mailFrom.includes('example.com')
        ? config.resend.mailFrom
        : 'onboarding@resend.dev';

    if (this.resend) {
      try {
        const { error } = await this.resend.emails.send({
          from: fromAddress,
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
      if (config.env === 'production') {
        logger.error(`Email dispatch failed: RESEND_API_KEY is not configured in production. Cannot send OTP to ${email}`);
        return false;
      }
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
    const subject = `Viewing Request: ${details.propertyTitle} — AbroadAccommodation`;
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
      if (config.env === 'production') {
        logger.error('Viewing email dispatch failed: RESEND_API_KEY is not configured in production.');
        return false;
      }
      logger.info(`[DEV EMAIL] Viewing notice to ${recipientEmail} for ${details.propertyTitle}`);
      return true;
    }
  }

  async sendViewingConfirmation(
    recipientEmail: string,
    details: {
      customerName: string;
      propertyTitle: string;
      propertyAddress?: string;
      scheduledDate: string;
      scheduledTime: string;
      agentName?: string;
      agentPhone?: string;
    }
  ): Promise<boolean> {
    const subject = `Confirmed: Viewing appointment for ${details.propertyTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #004274; margin-top: 0;">Viewing Confirmed!</h2>
        <p>Dear ${details.customerName},</p>
        <p>Your property viewing has been confirmed by our advisory team. Details below:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Property:</strong> ${details.propertyTitle}</p>
          ${details.propertyAddress ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${details.propertyAddress}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Date:</strong> ${details.scheduledDate}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${details.scheduledTime}</p>
          ${details.agentName ? `<p style="margin: 4px 0;"><strong>Assigned Advisor:</strong> ${details.agentName} ${details.agentPhone ? `(${details.agentPhone})` : ''}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 13px;">If you need to reschedule or have questions, please reach out to your advisor.</p>
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
        logger.error({ err }, 'Error sending viewing confirmation email');
        return false;
      }
    } else {
      if (config.env === 'production') {
        logger.error('Viewing confirmation email failed: RESEND_API_KEY is not configured in production.');
        return false;
      }
      logger.info(`[DEV EMAIL] Viewing confirmation to ${recipientEmail} for ${details.propertyTitle}`);
      return true;
    }
  }

  async sendOfferStatusUpdate(
    recipientEmail: string,
    details: {
      customerName: string;
      propertyTitle: string;
      amountFormatted: string;
      status: string;
      notes?: string;
      counterAmountFormatted?: string;
    }
  ): Promise<boolean> {
    const subject = `Update on your Offer for ${details.propertyTitle}: ${details.status.toUpperCase()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #004274; margin-top: 0;">Offer Status Update</h2>
        <p>Dear ${details.customerName},</p>
        <p>There is an update regarding your offer on <strong>${details.propertyTitle}</strong>.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="font-weight: 700; text-transform: uppercase;">${details.status}</span></p>
          <p style="margin: 4px 0;"><strong>Offer Amount:</strong> ${details.amountFormatted}</p>
          ${details.counterAmountFormatted ? `<p style="margin: 4px 0; color: #b45309;"><strong>Counter Offer:</strong> ${details.counterAmountFormatted}</p>` : ''}
          ${details.notes ? `<p style="margin: 4px 0;"><strong>Notes from Vendor/Advisor:</strong> ${details.notes}</p>` : ''}
        </div>
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
        logger.error({ err }, 'Error sending offer status email');
        return false;
      }
    } else {
      if (config.env === 'production') {
        logger.error('Offer status email failed: RESEND_API_KEY is not configured in production.');
        return false;
      }
      logger.info(`[DEV EMAIL] Offer update to ${recipientEmail} (${details.status})`);
      return true;
    }
  }

  async sendDirectEmail(options: {
    to: string;
    subject: string;
    body: string;
    senderName?: string;
    senderEmail?: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="border-bottom: 2px solid #004274; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #004274; margin: 0; font-size: 20px;">THE TENANT COMPANY</h2>
          <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Estate Advisory & Representation</span>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-line;">
          ${options.body}
        </div>
        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 2px 0; font-weight: bold; color: #1e293b;">${options.senderName || 'Advisory Desk'}</p>
          <p style="margin: 2px 0;">The Tenant Company — Real Estate Advisory</p>
          <p style="margin: 2px 0; color: #004274;">Dublin • London • Dubai</p>
        </div>
      </div>
    `;

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: config.resend.mailFrom,
          to: [options.to],
          subject: options.subject,
          html,
        });
        return true;
      } catch (err) {
        logger.error({ err }, `Error sending direct email to ${options.to}`);
        return false;
      }
    } else {
      if (config.env === 'production') {
        logger.error('Direct email failed: RESEND_API_KEY is not configured in production.');
        return false;
      }
      logger.info(`\n[DEV DIRECT EMAIL DISPATCH]\nTO: ${options.to}\nSUBJECT: ${options.subject}\nBODY:\n${options.body}\n`);
      return true;
    }
  }

  getEmailTemplates() {
    return [
      {
        id: 'viewing_followup',
        title: 'Viewing Follow-up & Feedback',
        subject: 'Following up on your viewing — The Tenant Company',
        body: 'Dear client,\n\nThank you for taking the time to view the property with us today. We would be delighted to hear your thoughts and answer any questions you may have regarding the property, lease terms, or surrounding neighborhood.\n\nPlease let us know if you would like to proceed with a formal proposal or explore comparable opportunities in our portfolio.\n\nWarm regards,\n',
      },
      {
        id: 'property_brochure',
        title: 'Property Dossier & Brochure',
        subject: 'Property Dossier & Specifications — The Tenant Company',
        body: 'Dear client,\n\nFollowing our conversation, please find attached the detailed brochure and specifications for the property we discussed.\n\nHighlights:\n- Premium location with high connectivity\n- High-spec architectural finish\n- Turnkey condition\n\nWe can arrange an exclusive in-person or virtual walkthrough at your earliest convenience.\n\nKind regards,\n',
      },
      {
        id: 'offer_update',
        title: 'Offer Review & Negotiation Update',
        subject: 'Update Regarding Your Purchase Proposal — The Tenant Company',
        body: 'Dear client,\n\nWe have formally presented your proposal to the vendors. They have reviewed your position and terms.\n\nPlease find the latest status and our advisory guidance attached. We look forward to discussing the next steps.\n\nSincerely,\n',
      },
      {
        id: 'valuation_confirmation',
        title: 'Valuation Appraisal Schedule',
        subject: 'Confirmation of Property Valuation Appraisal — The Tenant Company',
        body: 'Dear owner,\n\nThis email confirms that our senior valuation surveyor has scheduled a market appraisal for your property.\n\nOur team will assess current market comparables, tenant yield potential, and capital appreciation guidance to deliver a comprehensive appraisal report.\n\nBest regards,\n',
      },
    ];
  }
}

export const emailService = new EmailService();
