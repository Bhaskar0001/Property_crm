import { LeadModel } from '../models/Lead';
import { CustomerModel } from '../models/Customer';
import { LeadActivityModel } from '../models/LeadActivity';
import { TaskModel } from '../models/Task';
import { PropertyModel } from '../models/Property';
import { LeadStageModel } from '../models/LeadStage';
import { NotificationModel } from '../models/Notification';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface LeadQueryParams {
  search?: string;
  stage?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export class LeadService {
  async list(params: LeadQueryParams, user?: any): Promise<{ leads: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: any = {};

    if (params.stage) {
      filter.stage = params.stage;
    }

    if (params.source) {
      filter.source = params.source;
    }

    if (params.priority) {
      filter.priority = params.priority;
    }

    if (params.assignedTo) {
      filter.assignedTo = params.assignedTo;
    }

    // Territory / scope gating for staff members
    if (user && user.role === 'staff') {
      if (user.propertyAccessScope?.type === 'assigned') {
        filter.assignedTo = user._id;
      }
    }

    // Customer search
    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      const matchingCustomers = await CustomerModel.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select('_id');

      const customerIds = matchingCustomers.map((c) => c._id);
      filter.$or = [
        { customer: { $in: customerIds } },
        { notes: searchRegex },
      ];
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = params.limit !== undefined ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const query = LeadModel.find(filter)
      .populate('customer', 'name email phone country')
      .populate('property', 'title slug coverImage price city area')
      .populate('source', 'name slug')
      .populate('stage', 'name code color sortOrder isFinal')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      query.skip(skip).limit(limit);
    }

    const [leads, total] = await Promise.all([
      query.lean(),
      LeadModel.countDocuments(filter),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      leads,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getById(id: string, user?: any): Promise<{ lead: any; activities: any[]; tasks: any[] }> {
    const lead = await LeadModel.findById(id)
      .populate('customer', 'name email phone country preferences')
      .populate('property', 'title slug coverImage price city area bedrooms bathrooms livingArea berRating')
      .populate('source', 'name slug')
      .populate('stage', 'name code color sortOrder isFinal')
      .populate('assignedTo', 'name email role phone')
      .populate('interestedProperties', 'title slug coverImage price city area bedrooms bathrooms')
      .populate('matchedProperties', 'title slug coverImage price city area bedrooms bathrooms')
      .lean();

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    if (user && user.role === 'staff' && user.propertyAccessScope?.type === 'assigned') {
      if (lead.assignedTo?._id?.toString() !== user._id.toString()) {
        throw new ValidationError('You do not have permission to view this lead');
      }
    }

    const [activities, tasks] = await Promise.all([
      LeadActivityModel.find({ lead: id })
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      TaskModel.find({ lead: id })
        .populate('assignedTo', 'name email')
        .sort({ dueDate: 1 })
        .lean(),
    ]);

    return { lead, activities, tasks };
  }

  async create(data: any, userId: string): Promise<any> {
    let customerId = data.customer;

    // Create customer if customer object provided
    if (!customerId && (data.customerName || data.customerEmail)) {
      let customer = await CustomerModel.findOne({ email: data.customerEmail.toLowerCase().trim() });
      if (!customer) {
        customer = await CustomerModel.create({
          name: data.customerName.trim(),
          email: data.customerEmail.toLowerCase().trim(),
          phone: data.customerPhone?.trim(),
          consentGiven: true,
          consentDate: new Date(),
          isActive: true,
        });
      }
      customerId = customer._id;
    }

    if (!customerId) {
      throw new ValidationError('Customer reference or details are required to create a lead');
    }

    const lead = await LeadModel.create({
      customer: customerId,
      property: data.property || undefined,
      source: data.source,
      stage: data.stage,
      assignedTo: data.assignedTo || userId,
      priority: data.priority || 'medium',
      requirements: data.requirements || {},
      notes: data.notes || '',
      lastContactedAt: new Date(),
    });

    // Log Activity
    await LeadActivityModel.create({
      lead: lead._id,
      type: 'created',
      description: 'Lead registered in CRM pipeline',
      performedBy: userId,
    });

    // Run Property Matching in background
    this.matchProperties(lead._id.toString()).catch((err) =>
      logger.error({ err }, 'Error in auto property matching on lead creation')
    );

    return await LeadModel.findById(lead._id)
      .populate('customer source stage assignedTo')
      .lean();
  }

  async update(id: string, data: any, userId: string): Promise<any> {
    const existing = await LeadModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Lead not found');
    }

    // Check if stage changed
    if (data.stage && data.stage.toString() !== existing.stage?.toString()) {
      const stage = await LeadStageModel.findById(data.stage);
      await LeadActivityModel.create({
        lead: id,
        type: 'status_changed',
        description: `Stage updated to ${stage?.name || 'new stage'}`,
        performedBy: userId,
      });
    }

    // Check if assignedTo changed
    if (data.assignedTo && data.assignedTo.toString() !== existing.assignedTo?.toString()) {
      await LeadActivityModel.create({
        lead: id,
        type: 'assigned',
        description: `Lead reassigned`,
        performedBy: userId,
      });

      // Send in-app notification to new assignee
      await NotificationModel.create({
        recipient: data.assignedTo,
        type: 'lead_assigned',
        title: 'New Lead Assigned',
        message: 'You have been assigned a new lead in the CRM.',
        data: { leadId: id },
        isRead: false,
      });
    }

    const updated = await LeadModel.findByIdAndUpdate(
      id,
      {
        ...data,
        ...(data.notes && { lastContactedAt: new Date() }),
      },
      { new: true }
    )
      .populate('customer property source stage assignedTo')
      .lean();

    return updated;
  }

  async changeStage(id: string, stageId: string, userId: string): Promise<any> {
    const lead = await LeadModel.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const stage = await LeadStageModel.findById(stageId);
    if (!stage) {
      throw new NotFoundError('Lead stage not found');
    }

    lead.stage = stage._id as any;
    await lead.save();

    await LeadActivityModel.create({
      lead: id,
      type: 'status_changed',
      description: `Stage updated to ${stage.name}`,
      performedBy: userId,
    });

    return await LeadModel.findById(id).populate('customer stage assignedTo').lean();
  }

  async assignLead(id: string, staffId: string, userId: string): Promise<any> {
    const lead = await LeadModel.findByIdAndUpdate(
      id,
      { assignedTo: staffId },
      { new: true }
    ).populate('customer stage assignedTo');

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    await LeadActivityModel.create({
      lead: id,
      type: 'assigned',
      description: `Lead assigned to team member`,
      performedBy: userId,
    });

    await NotificationModel.create({
      recipient: staffId,
      type: 'lead_assigned',
      title: 'Lead Assignment',
      message: `A lead has been assigned to your workspace.`,
      data: { leadId: id },
      isRead: false,
    });

    return lead;
  }

  async addNote(id: string, description: string, userId: string): Promise<any> {
    const lead = await LeadModel.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const activity = await LeadActivityModel.create({
      lead: id,
      type: 'note_added',
      description: description.trim(),
      performedBy: userId,
    });

    lead.lastContactedAt = new Date();
    await lead.save();

    return await LeadActivityModel.findById(activity._id).populate('performedBy', 'name email').lean();
  }

  // Automatic Property Matching Algorithm
  async matchProperties(leadId: string): Promise<any[]> {
    const lead = await LeadModel.findById(leadId).populate('customer');
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const reqs = lead.requirements || {};
    const customerPreferences = (lead.customer as any)?.preferences || {};

    const minBudget = reqs.minBudget || customerPreferences.minBudget;
    const maxBudget = reqs.maxBudget || customerPreferences.maxBudget;
    const bedrooms = reqs.bedrooms || customerPreferences.bedrooms;
    const country = reqs.country;
    const propertyType = reqs.propertyType;

    const query: any = {
      isPublished: true,
      isDeleted: { $ne: true },
    };

    if (country) query.country = country;
    if (propertyType) query.propertyType = propertyType;

    if (minBudget || maxBudget) {
      query.price = {};
      if (minBudget) query.price.$gte = Number(minBudget);
      if (maxBudget) query.price.$lte = Number(maxBudget);
    }

    if (bedrooms && Number(bedrooms) > 0) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    let matched = await PropertyModel.find(query)
      .populate('country propertyType listingType currency')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Fallback: If no strict criteria match, find top active properties
    if (matched.length === 0) {
      matched = await PropertyModel.find({ isPublished: true, isDeleted: { $ne: true } })
        .populate('country propertyType listingType currency')
        .sort({ viewCount: -1 })
        .limit(6)
        .lean();
    }

    const matchedIds = matched.map((p) => p._id);
    lead.matchedProperties = matchedIds as any;
    await lead.save();

    return matched;
  }

  async createTask(leadId: string, data: any, userId: string): Promise<any> {
    const lead = await LeadModel.findById(leadId);
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const task = await TaskModel.create({
      lead: leadId,
      title: data.title.trim(),
      description: data.description?.trim(),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 86400000),
      dueTime: data.dueTime || '10:00',
      priority: data.priority || 'normal',
      status: 'pending',
      assignedTo: data.assignedTo || userId,
    });

    await LeadActivityModel.create({
      lead: leadId,
      type: 'task_created',
      description: `Follow-up task scheduled: "${data.title}"`,
      performedBy: userId,
    });

    return await TaskModel.findById(task._id).populate('assignedTo', 'name email').lean();
  }

  async updateTaskStatus(taskId: string, status: string, userId: string): Promise<any> {
    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        status,
        ...(status === 'completed' && {
          completedAt: new Date(),
          completedBy: userId,
        }),
      },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (status === 'completed' && task.lead) {
      await LeadActivityModel.create({
        lead: task.lead,
        type: 'task_completed',
        description: `Task completed: "${task.title}"`,
        performedBy: userId,
      });
    }

    return task;
  }
}

export const leadService = new LeadService();
