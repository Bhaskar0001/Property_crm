import { LeadModel } from '../models/Lead';
import { LeadActivityModel } from '../models/LeadActivity';
import { TaskModel } from '../models/Task';
import { LeadStageModel } from '../models/LeadStage';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface LogCallParams {
  leadId: string;
  disposition: 'CONNECTED' | 'BUSY' | 'NO_ANSWER' | 'CALLBACK_SCHEDULED' | 'QUALIFIED' | 'NOT_INTERESTED' | 'WRONG_NUMBER';
  duration?: number; // duration in seconds
  notes?: string;
  callbackDate?: string;
  callbackTime?: string;
}

export class TelecallerService {
  async getCallingQueue(userId: string): Promise<any[]> {
    // 1. Fetch pending callback tasks assigned to this user
    const pendingTasks = await TaskModel.find({
      assignedTo: userId,
      status: 'pending',
      dueDate: { $lte: new Date(Date.now() + 86400000) }, // due within next 24h
    })
      .select('lead dueDate dueTime title')
      .lean();

    const priorityLeadIds = pendingTasks.map((t) => t.lead).filter(Boolean);

    // 2. Fetch leads in prioritized order:
    // First, leads with pending callbacks, then high priority leads, then newly registered leads
    const leads = await LeadModel.find({
      $or: [
        { _id: { $in: priorityLeadIds } },
        { assignedTo: userId },
        { assignedTo: { $exists: false } },
      ],
    })
      .populate('customer', 'name email phone country preferences')
      .populate('property', 'title slug coverImage price city area')
      .populate('stage', 'name code color isFinal')
      .populate('source', 'name slug')
      .populate('assignedTo', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(30)
      .lean();

    // Attach task callback note if present
    const taskMap = new Map();
    pendingTasks.forEach((t) => taskMap.set(t.lead.toString(), t));

    return leads.map((lead: any) => ({
      ...lead,
      scheduledCallback: taskMap.get(lead._id.toString()) || null,
    }));
  }

  async logCall(data: LogCallParams, userId: string): Promise<{ success: boolean; message: string; lead: any }> {
    const lead = await LeadModel.findById(data.leadId).populate('customer');
    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    const validDispositions = [
      'CONNECTED',
      'BUSY',
      'NO_ANSWER',
      'CALLBACK_SCHEDULED',
      'QUALIFIED',
      'NOT_INTERESTED',
      'WRONG_NUMBER',
    ];

    if (!validDispositions.includes(data.disposition)) {
      throw new ValidationError(`Invalid disposition. Allowed: ${validDispositions.join(', ')}`);
    }

    // 1. Log call activity
    const callDescription = `Telecaller [${data.disposition}]: ${data.notes || 'Call completed'}`;
    await LeadActivityModel.create({
      lead: lead._id,
      type: 'call',
      description: callDescription,
      metadata: {
        disposition: data.disposition,
        duration: data.duration || 0,
        callbackDate: data.callbackDate,
        callbackTime: data.callbackTime,
      },
      performedBy: userId,
    });

    lead.lastContactedAt = new Date();

    // 2. Handle Callback Scheduling
    if (data.disposition === 'CALLBACK_SCHEDULED' && data.callbackDate) {
      await TaskModel.create({
        lead: lead._id,
        title: `Scheduled Callback: ${(lead.customer as any)?.name || 'Client'}`,
        description: data.notes || 'Follow-up phone conversation',
        dueDate: new Date(data.callbackDate),
        dueTime: data.callbackTime || '10:00',
        priority: 'high',
        status: 'pending',
        assignedTo: userId,
      });
    }

    // 3. Automated Stage Transitions based on disposition
    if (data.disposition === 'QUALIFIED') {
      const qualifiedStage = await LeadStageModel.findOne({ code: 'QUALIFIED' });
      if (qualifiedStage) lead.stage = qualifiedStage._id as any;
    } else if (data.disposition === 'NOT_INTERESTED') {
      const lostStage = await LeadStageModel.findOne({ code: { $in: ['NOT_INTERESTED', 'LOST'] } });
      if (lostStage) lead.stage = lostStage._id as any;
    } else if (data.disposition === 'CONNECTED') {
      // If still in NEW stage, advance to CONTACTED
      const currentStage = await LeadStageModel.findById(lead.stage);
      if (currentStage?.code === 'NEW') {
        const contactedStage = await LeadStageModel.findOne({ code: 'CONTACTED' });
        if (contactedStage) lead.stage = contactedStage._id as any;
      }
    }

    // Assign to telecaller if unassigned
    if (!lead.assignedTo) {
      lead.assignedTo = userId as any;
    }

    await lead.save();

    logger.info(`Call logged for lead ${lead._id} by user ${userId} with disposition ${data.disposition}`);

    return {
      success: true,
      message: 'Call outcome and disposition logged successfully',
      lead,
    };
  }

  async getTelecallerStats(userId: string): Promise<{
    callsToday: number;
    connectedToday: number;
    qualifiedToday: number;
    pendingCallbacks: number;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [callsToday, connectedToday, qualifiedToday, pendingCallbacks] = await Promise.all([
      LeadActivityModel.countDocuments({
        performedBy: userId,
        type: 'call',
        createdAt: { $gte: startOfDay },
      }),
      LeadActivityModel.countDocuments({
        performedBy: userId,
        type: 'call',
        'metadata.disposition': { $in: ['CONNECTED', 'QUALIFIED', 'CALLBACK_SCHEDULED'] },
        createdAt: { $gte: startOfDay },
      }),
      LeadActivityModel.countDocuments({
        performedBy: userId,
        type: 'call',
        'metadata.disposition': 'QUALIFIED',
        createdAt: { $gte: startOfDay },
      }),
      TaskModel.countDocuments({
        assignedTo: userId,
        status: 'pending',
        title: /callback/i,
      }),
    ]);

    return {
      callsToday,
      connectedToday,
      qualifiedToday,
      pendingCallbacks,
    };
  }
}

export const telecallerService = new TelecallerService();
