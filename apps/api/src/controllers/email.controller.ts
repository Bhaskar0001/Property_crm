import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { emailService } from '../services/email.service';
import { LeadActivityModel } from '../models/LeadActivity';
import { LeadModel } from '../models/Lead';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { config } from '../config';

export class EmailController {
  async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { to, subject, body, leadId } = req.body;

      if (!to || !to.includes('@')) {
        throw new ValidationError('A valid recipient email address is required');
      }
      if (!subject || !subject.trim()) {
        throw new ValidationError('Email subject is required');
      }
      if (!body || !body.trim()) {
        throw new ValidationError('Email message body is required');
      }

      const senderName = req.user?.name || config.agency.name || 'Advisory Desk';
      const senderEmail = req.user?.email || config.agency.email || config.resend.mailFrom;

      const success = await emailService.sendDirectEmail({
        to,
        subject,
        body,
        senderName,
        senderEmail,
      });

      // If tied to a lead, log to LeadActivity feed
      if (leadId) {
        try {
          await LeadActivityModel.create({
            lead: leadId,
            type: 'email',
            title: `Email Sent: ${subject}`,
            description: body.substring(0, 300) + (body.length > 300 ? '...' : ''),
            performedBy: req.user?._id,
          });

          await LeadModel.findByIdAndUpdate(leadId, {
            lastContactedAt: new Date(),
          });
        } catch {
          // Non-blocking activity logging
        }
      }

      sendSuccess(res, { success, delivered: true }, 'Email dispatched successfully');
    } catch (error) {
      next(error);
    }
  }

  getTemplates(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = emailService.getEmailTemplates();
      sendSuccess(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const emailController = new EmailController();
