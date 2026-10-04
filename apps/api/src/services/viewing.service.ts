import mongoose from 'mongoose';
import { ViewingModel } from '../models/Viewing';
import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { CustomerModel } from '../models/Customer';
import { UserModel } from '../models/User';
import { LeadActivityModel } from '../models/LeadActivity';
import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface ViewingFilterParams {
  status?: string;
  from?: string;
  to?: string;
  property?: string;
  customer?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ViewingService {
  async list(params: ViewingFilterParams, user?: any): Promise<{
    viewings: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    // Status filter
    if (params.status && params.status !== 'all') {
      const statuses = params.status.split(',').map((s) => s.trim());
      // Support case matching (e.g. 'CONFIRMED' or 'confirmed')
      const regexes = statuses.map((s) => new RegExp(`^${s}$`, 'i'));
      query.status = { $in: regexes };
    }

    // Property filter
    if (params.property) {
      query.property = params.property;
    }

    // Customer filter
    if (params.customer) {
      query.customer = params.customer;
    }

    // Date range filter
    if (params.from || params.to) {
      query.scheduledDate = {};
      if (params.from) {
        query.scheduledDate.$gte = new Date(params.from);
      }
      if (params.to) {
        query.scheduledDate.$lte = new Date(params.to);
      }
    }

    // Staff scoping
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      // If telecaller or sales agent without all-property view permission, scope to assigned
      if (user.propertyScope?.type === 'assigned') {
        query.assignedTo = user._id;
      }
    } else if (params.assignedTo) {
      query.assignedTo = params.assignedTo;
    }

    const [viewings, total] = await Promise.all([
      ViewingModel.find(query)
        .populate({
          path: 'property',
          select: 'title slug price currency city area address coverImage',
          populate: { path: 'currency', select: 'code symbol' },
        })
        .populate('customer', 'name email phone')
        .populate('lead', 'priority stage')
        .populate('assignedTo', 'name email phone role')
        .sort({ scheduledDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ViewingModel.countDocuments(query),
    ]);

    return {
      viewings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<any> {
    const viewing = await ViewingModel.findById(id)
      .populate({
        path: 'property',
        select: 'title slug price currency city area address coverImage bedrooms bathrooms',
        populate: { path: 'currency', select: 'code symbol' },
      })
      .populate('customer', 'name email phone')
      .populate({
        path: 'lead',
        populate: [{ path: 'stage', select: 'name code color' }, { path: 'source', select: 'name' }],
      })
      .populate('assignedTo', 'name email phone role')
      .populate('rescheduledFrom')
      .lean();

    if (!viewing) {
      throw new NotFoundError('Viewing appointment not found');
    }

    return viewing;
  }

  async create(data: {
    propertyId: string;
    leadId?: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    visitType?: 'in_person' | 'virtual';
    virtualPlatform?: 'whatsapp_video' | 'zoom' | 'google_meet' | 'facetime' | 'other';
    meetingLink?: string;
    scheduledDate: string;
    scheduledTime?: string;
    duration?: number;
    assignedTo?: string;
    notes?: string;
    status?: string;
  }, user?: any): Promise<any> {
    const property = await PropertyModel.findById(data.propertyId);
    if (!property) {
      throw new ValidationError('Valid property ID is required');
    }

    // Resolve customer
    let customerId = data.customerId;
    let customer: any = null;

    if (customerId) {
      customer = await CustomerModel.findById(customerId);
    } else if (data.customerEmail) {
      const email = data.customerEmail.toLowerCase().trim();
      customer = await CustomerModel.findOne({ email });
      if (!customer) {
        customer = await CustomerModel.create({
          name: data.customerName || 'Viewing Lead',
          email,
          phone: data.customerPhone || '',
          consentGiven: true,
          consentDate: new Date(),
          isActive: true,
        });
      }
      customerId = customer._id.toString();
    }

    // Resolve or create CRM lead
    let leadId = data.leadId;
    if (!leadId && customerId) {
      const lead = await LeadModel.create({
        customer: customerId,
        property: property._id,
        priority: 'high',
        assignedTo: data.assignedTo || user?._id,
        notes: `Viewing booked for ${property.title}. ${data.notes || ''}`,
        lastContactedAt: new Date(),
      });
      leadId = lead._id.toString();
    }

    const assignedStaffId = data.assignedTo || user?._id;

    const viewing = await ViewingModel.create({
      property: property._id,
      lead: leadId ? new mongoose.Types.ObjectId(leadId) : undefined,
      customer: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      visitType: data.visitType || 'in_person',
      virtualPlatform: data.virtualPlatform || (data.visitType === 'virtual' ? 'whatsapp_video' : undefined),
      meetingLink: data.meetingLink,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime || '10:00',
      duration: data.duration || 30,
      status: (data.status || 'CONFIRMED').toUpperCase(),
      assignedTo: assignedStaffId ? new mongoose.Types.ObjectId(assignedStaffId) : undefined,
      notes: data.notes,
      confirmedAt: new Date(),
    });

    // Log Activity
    if (leadId) {
      await LeadActivityModel.create({
        lead: leadId,
        type: 'viewing_scheduled',
        description: `${data.visitType === 'virtual' ? `Virtual Video Tour (${data.virtualPlatform || 'WhatsApp Video'})` : 'Physical On-Site Viewing'} appointment scheduled for ${new Date(data.scheduledDate).toLocaleDateString()} at ${data.scheduledTime || '10:00'}.`,
        performedBy: user?._id,
        metadata: { viewingId: viewing._id, propertyTitle: property.title },
      });
    }

    // Notify assigned staff
    if (assignedStaffId && assignedStaffId.toString() !== user?._id?.toString()) {
      await notificationService.create(
        assignedStaffId.toString(),
        'viewing',
        'New Viewing Assigned',
        `You have been assigned to conduct a viewing for ${property.title} on ${new Date(data.scheduledDate).toLocaleDateString()} at ${data.scheduledTime || '10:00'}.`,
        { viewingId: viewing._id, propertyId: property._id }
      );
    }

    // Send confirmation email to customer if email is available
    if (customer?.email) {
      const assignedUser = assignedStaffId ? await UserModel.findById(assignedStaffId) : null;
      await emailService.sendViewingConfirmation(customer.email, {
        customerName: customer.name,
        propertyTitle: property.title,
        propertyAddress: property.address ? `${property.address}, ${property.city || ''}` : property.city,
        scheduledDate: new Date(data.scheduledDate).toLocaleDateString(),
        scheduledTime: data.scheduledTime || '10:00',
        agentName: assignedUser?.name,
        agentPhone: assignedUser?.phone,
      });
    }

    logger.info(`Viewing created: ${viewing._id} for property ${property._id}`);
    return this.getById(viewing._id.toString());
  }

  async update(id: string, data: {
    scheduledDate?: string;
    scheduledTime?: string;
    visitType?: 'in_person' | 'virtual';
    virtualPlatform?: 'whatsapp_video' | 'zoom' | 'google_meet' | 'facetime' | 'other';
    meetingLink?: string;
    duration?: number;
    assignedTo?: string;
    notes?: string;
    feedback?: string;
  }, user?: any): Promise<any> {
    const viewing = await ViewingModel.findById(id);
    if (!viewing) {
      throw new NotFoundError('Viewing not found');
    }

    if (data.scheduledDate) viewing.scheduledDate = new Date(data.scheduledDate);
    if (data.scheduledTime) viewing.scheduledTime = data.scheduledTime;
    if (data.visitType) viewing.visitType = data.visitType;
    if (data.virtualPlatform) viewing.virtualPlatform = data.virtualPlatform;
    if (data.meetingLink !== undefined) viewing.meetingLink = data.meetingLink;
    if (data.duration) viewing.duration = data.duration;
    if (data.assignedTo) viewing.assignedTo = new mongoose.Types.ObjectId(data.assignedTo);
    if (data.notes !== undefined) viewing.notes = data.notes;
    if (data.feedback !== undefined) viewing.feedback = data.feedback;

    await viewing.save();
    return this.getById(viewing._id.toString());
  }

  async updateStatus(id: string, update: {
    status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
    cancelReason?: string;
    feedback?: string;
    rescheduledDate?: string;
    rescheduledTime?: string;
  }, user?: any): Promise<any> {
    const viewing = await ViewingModel.findById(id).populate('customer property assignedTo');
    if (!viewing) {
      throw new NotFoundError('Viewing not found');
    }

    const normalizedStatus = update.status.toUpperCase();
    const oldStatus = viewing.status;

    if (normalizedStatus === 'CONFIRMED') {
      viewing.status = 'CONFIRMED';
      viewing.confirmedAt = new Date();
      await viewing.save();

      // Dispatch confirmation email
      const cust: any = viewing.customer;
      const prop: any = viewing.property;
      const agent: any = viewing.assignedTo;
      if (cust?.email) {
        await emailService.sendViewingConfirmation(cust.email, {
          customerName: cust.name,
          propertyTitle: prop?.title || 'Viewing',
          propertyAddress: prop?.address?.line1 ? `${prop.address.line1}, ${prop.city || ''}` : prop?.city,
          scheduledDate: viewing.scheduledDate.toLocaleDateString(),
          scheduledTime: viewing.scheduledTime,
          agentName: agent?.name,
          agentPhone: agent?.phone,
        });
      }
    } else if (normalizedStatus === 'COMPLETED') {
      viewing.status = 'COMPLETED';
      viewing.completedAt = new Date();
      if (update.feedback) {
        viewing.feedback = update.feedback;
      }
      await viewing.save();

      if (viewing.lead) {
        await LeadActivityModel.create({
          lead: viewing.lead,
          type: 'viewing_completed',
          description: `Viewing completed. Feedback: ${update.feedback || 'No feedback recorded'}`,
          performedBy: user?._id,
          metadata: { viewingId: viewing._id },
        });
      }
    } else if (normalizedStatus === 'CANCELLED') {
      viewing.status = 'CANCELLED';
      viewing.cancelReason = update.cancelReason || 'Cancelled by client/agent';
      await viewing.save();

      if (viewing.lead) {
        await LeadActivityModel.create({
          lead: viewing.lead,
          type: 'status_changed',
          description: `Viewing appointment cancelled. Reason: ${viewing.cancelReason}`,
          performedBy: user?._id,
          metadata: { viewingId: viewing._id },
        });
      }
    } else if (normalizedStatus === 'RESCHEDULED') {
      if (!update.rescheduledDate) {
        throw new ValidationError('New rescheduledDate is required to reschedule viewing');
      }

      // Mark original viewing as rescheduled
      viewing.status = 'RESCHEDULED';
      viewing.notes = `${viewing.notes ? viewing.notes + ' ' : ''}[Rescheduled to ${update.rescheduledDate} ${update.rescheduledTime || viewing.scheduledTime}]`;
      await viewing.save();

      // Create new viewing
      const newViewing = await ViewingModel.create({
        property: viewing.property,
        lead: viewing.lead,
        customer: viewing.customer,
        scheduledDate: new Date(update.rescheduledDate),
        scheduledTime: update.rescheduledTime || viewing.scheduledTime,
        duration: viewing.duration,
        status: 'CONFIRMED',
        assignedTo: viewing.assignedTo,
        notes: `Rescheduled appointment from ${viewing.scheduledDate.toLocaleDateString()}.`,
        rescheduledFrom: viewing._id,
        confirmedAt: new Date(),
      });

      if (viewing.lead) {
        await LeadActivityModel.create({
          lead: viewing.lead,
          type: 'viewing_scheduled',
          description: `Viewing rescheduled to ${new Date(update.rescheduledDate).toLocaleDateString()} at ${update.rescheduledTime || viewing.scheduledTime}`,
          performedBy: user?._id,
          metadata: { originalViewingId: viewing._id, newViewingId: newViewing._id },
        });
      }

      return this.getById(newViewing._id.toString());
    } else if (normalizedStatus === 'NO_SHOW') {
      viewing.status = 'NO_SHOW';
      if (update.feedback) {
        viewing.feedback = update.feedback;
      }
      await viewing.save();

      if (viewing.lead) {
        await LeadActivityModel.create({
          lead: viewing.lead,
          type: 'status_changed',
          description: 'Viewing client marked as No-Show.',
          performedBy: user?._id,
          metadata: { viewingId: viewing._id },
        });
      }
    }

    return this.getById(viewing._id.toString());
  }

  async getCalendar(from: string, to: string, user?: any): Promise<any[]> {
    const startDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 15));
    const endDate = to ? new Date(to) : new Date(new Date().setDate(new Date().getDate() + 30));

    const query: any = {
      scheduledDate: { $gte: startDate, $lte: endDate },
    };

    if (user && user.role !== 'admin' && user.role !== 'superadmin' && user.propertyScope?.type === 'assigned') {
      query.assignedTo = user._id;
    }

    const viewings = await ViewingModel.find(query)
      .populate('property', 'title slug city coverImage price currency')
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .lean();

    return viewings;
  }
}

export const viewingService = new ViewingService();
