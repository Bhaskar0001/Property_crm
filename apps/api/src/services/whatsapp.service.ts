import mongoose from 'mongoose';
import { ConversationModel, IConversation } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { MessageTemplateModel } from '../models/MessageTemplate';
import { CampaignModel } from '../models/Campaign';
import { CustomerModel } from '../models/Customer';
import { LeadModel } from '../models/Lead';
import { PropertyModel } from '../models/Property';
import { LeadActivityModel } from '../models/LeadActivity';
import { whatsappClient } from '../integrations/whatsapp.client';
import { notificationService } from './notification.service';
import { emitToUser, getIO } from '../config/socket';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class WhatsAppService {
  // 1. Get all active conversations
  async getConversations(user?: any): Promise<any[]> {
    const query: any = {};

    if (user && user.role !== 'admin' && user.role !== 'superadmin' && user.propertyScope?.type === 'assigned') {
      query.assignedTo = user._id;
    }

    const conversations = await ConversationModel.find(query)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'lead',
        select: 'priority stage property',
        populate: [
          { path: 'stage', select: 'name code color' },
          { path: 'property', select: 'title slug coverImage price city' },
        ],
      })
      .populate('assignedTo', 'name email')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    return conversations;
  }

  // 2. Get messages for a specific conversation
  async getMessages(conversationId: string, _user?: any): Promise<{ conversation: any; messages: any[] }> {
    const conversation = await ConversationModel.findById(conversationId)
      .populate('customer')
      .populate({
        path: 'lead',
        populate: [{ path: 'property' }, { path: 'stage' }],
      })
      .populate('assignedTo', 'name email')
      .lean();

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Reset unread count when opened
    await ConversationModel.findByIdAndUpdate(conversationId, { unreadCount: 0 });

    const messages = await MessageModel.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sentBy', 'name email')
      .lean();

    return { conversation, messages };
  }

  // 3. Resolve or create a conversation for a lead / phone number
  async getOrCreateConversation(params: {
    leadId?: string;
    customerId?: string;
    phoneNumber?: string;
    assignedTo?: string;
  }): Promise<IConversation> {
    let query: any = {};

    if (params.leadId) {
      query = { lead: params.leadId };
    } else if (params.customerId) {
      query = { customer: params.customerId };
    } else if (params.phoneNumber) {
      const cleanPhone = params.phoneNumber.replace(/[^0-9]/g, '');
      query = { phoneNumber: new RegExp(cleanPhone.slice(-9) + '$') };
    }

    let conversation = await ConversationModel.findOne(query);

    if (!conversation) {
      // Resolve details
      let lead: any = null;
      let customer: any = null;

      if (params.leadId) {
        lead = await LeadModel.findById(params.leadId).populate('customer');
        customer = lead?.customer;
      } else if (params.customerId) {
        customer = await CustomerModel.findById(params.customerId);
      }

      const phone =
        params.phoneNumber || customer?.phone || (lead as any)?.customer?.phone || '';

      conversation = await ConversationModel.create({
        lead: lead?._id || params.leadId,
        customer: customer?._id || params.customerId,
        phoneNumber: phone,
        assignedTo: params.assignedTo || lead?.assignedTo,
        lastMessageAt: new Date(),
        lastMessagePreview: 'Conversation started',
        unreadCount: 0,
      });
    }

    return conversation;
  }

  // 4. Send a text message to customer
  async sendMessage(data: {
    conversationId?: string;
    leadId?: string;
    to?: string;
    text: string;
  }, user?: any): Promise<any> {
    if (!data.text || !data.text.trim()) {
      throw new ValidationError('Message text cannot be empty');
    }

    let conversation: IConversation;
    if (data.conversationId) {
      const found = await ConversationModel.findById(data.conversationId);
      if (!found) throw new NotFoundError('Conversation not found');
      conversation = found;
    } else {
      conversation = await this.getOrCreateConversation({
        leadId: data.leadId,
        phoneNumber: data.to,
        assignedTo: user?._id,
      });
    }

    if (conversation.isOptedOut) {
      throw new ValidationError('Customer has opted out of WhatsApp communication (STOP received)');
    }

    const recipientPhone = conversation.phoneNumber || data.to;
    if (!recipientPhone) {
      throw new ValidationError('No valid phone number for recipient');
    }

    // Call WhatsApp API
    const sendResult = await whatsappClient.sendTextMessage(recipientPhone, data.text.trim());
    if (!sendResult.success) {
      throw new ValidationError(sendResult.error || 'Failed to deliver message via WhatsApp');
    }

    // Save outbound message
    const message = await MessageModel.create({
      conversation: conversation._id,
      direction: 'outbound',
      type: 'text',
      content: data.text.trim(),
      whatsappMessageId: sendResult.messageId,
      status: 'sent',
      sentBy: user?._id,
      deliveredAt: new Date(),
    });

    // Update conversation state
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = data.text.trim().substring(0, 100);
    await conversation.save();

    // Log Activity
    if (conversation.lead) {
      await LeadActivityModel.create({
        lead: conversation.lead,
        type: 'whatsapp_sent',
        description: `WhatsApp message sent: "${data.text.trim().substring(0, 60)}..."`,
        performedBy: user?._id,
        metadata: { messageId: message._id },
      });
    }

    // Emit live Socket.IO update
    const io = getIO();
    if (io) {
      io.emit('whatsapp_message', { conversationId: conversation._id, message });
    }

    return message;
  }

  // 5. Send rich property card to customer
  async sendProperty(data: {
    conversationId?: string;
    leadId?: string;
    propertyId: string;
    to?: string;
  }, user?: any): Promise<any> {
    const property = await PropertyModel.findById(data.propertyId).populate('currency');
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    let conversation: IConversation;
    if (data.conversationId) {
      const found = await ConversationModel.findById(data.conversationId);
      if (!found) throw new NotFoundError('Conversation not found');
      conversation = found;
    } else {
      conversation = await this.getOrCreateConversation({
        leadId: data.leadId,
        phoneNumber: data.to,
        assignedTo: user?._id,
      });
    }

    if (conversation.isOptedOut) {
      throw new ValidationError('Customer has opted out of WhatsApp communication');
    }

    const recipientPhone = conversation.phoneNumber || data.to;
    if (!recipientPhone) {
      throw new ValidationError('No valid phone number for recipient');
    }

    const symbol = (property.currency as any)?.symbol || '€';
    const publicUrl = `https://realestate-property.com/properties/${property.slug}`;

    const propPrice = property.price || 0;
    const sendResult = await whatsappClient.sendPropertyCard(recipientPhone, {
      title: property.title,
      price: propPrice,
      currencySymbol: symbol,
      city: property.city,
      coverImage: property.coverImage,
      publicUrl,
    });

    if (!sendResult.success) {
      throw new ValidationError(sendResult.error || 'Failed to send property card');
    }

    const priceText = property.price ? `${symbol}${property.price.toLocaleString()}` : 'Price on Application';
    const caption = `Shared property: ${property.title} (${priceText})`;

    const message = await MessageModel.create({
      conversation: conversation._id,
      direction: 'outbound',
      type: 'image',
      content: caption,
      mediaUrl: property.coverImage,
      whatsappMessageId: sendResult.messageId,
      status: 'sent',
      sentBy: user?._id,
      deliveredAt: new Date(),
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = `🏡 ${property.title}`;
    await conversation.save();

    if (conversation.lead) {
      await LeadActivityModel.create({
        lead: conversation.lead,
        type: 'property_shared',
        description: `Shared property "${property.title}" via WhatsApp.`,
        performedBy: user?._id,
        metadata: { propertyId: property._id, messageId: message._id },
      });
    }

    const io = getIO();
    if (io) {
      io.emit('whatsapp_message', { conversationId: conversation._id, message });
    }

    return message;
  }

  // 6. Inbound Webhook Listener (Incoming messages & status receipts)
  async handleWebhook(body: any): Promise<{ handled: boolean }> {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return { handled: false };

    // A. Handle incoming messages
    if (value.messages && value.messages.length > 0) {
      for (const incoming of value.messages) {
        const messageId = incoming.id;

        // Idempotency: verify not already recorded
        const existing = await MessageModel.findOne({ whatsappMessageId: messageId });
        if (existing) {
          logger.info(`WhatsApp message ${messageId} already processed (idempotent skip)`);
          continue;
        }

        const senderPhone = incoming.from;
        let textContent = '';

        if (incoming.type === 'text') {
          textContent = incoming.text?.body || '';
        } else if (incoming.type === 'button') {
          textContent = incoming.button?.text || '';
        } else if (incoming.type === 'interactive') {
          textContent = incoming.interactive?.button_reply?.title || incoming.interactive?.list_reply?.title || '';
        } else {
          textContent = `[${incoming.type} attachment received]`;
        }

        // Opt-out / Opt-in keyword detection
        const cleanUpper = textContent.trim().toUpperCase();
        const isOptOut = ['STOP', 'UNSUBSCRIBE', 'QUIT', 'OPTOUT'].includes(cleanUpper);
        const isOptIn = ['START', 'UNSTOP', 'YES'].includes(cleanUpper);

        // Resolve or create conversation
        const conversation = await this.getOrCreateConversation({ phoneNumber: senderPhone });

        if (isOptOut) {
          conversation.isOptedOut = true;
          logger.info(`Customer +${senderPhone} opted out of WhatsApp messages.`);
        } else if (isOptIn) {
          conversation.isOptedOut = false;
          logger.info(`Customer +${senderPhone} opted back into WhatsApp messages.`);
        }

        // Create inbound message
        const message = await MessageModel.create({
          conversation: conversation._id,
          direction: 'inbound',
          type: incoming.type === 'text' ? 'text' : 'document',
          content: textContent,
          whatsappMessageId: messageId,
          status: 'delivered',
          deliveredAt: new Date(),
        });

        // Update conversation
        conversation.lastMessageAt = new Date();
        conversation.lastMessagePreview = textContent.substring(0, 100);
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        await conversation.save();

        // Log Activity if linked to lead
        if (conversation.lead) {
          await LeadActivityModel.create({
            lead: conversation.lead,
            type: 'whatsapp_received',
            description: `WhatsApp reply: "${textContent.substring(0, 60)}"`,
            metadata: { messageId: message._id },
          });
        }

        // Notify assigned advisor
        if (conversation.assignedTo) {
          await notificationService.create(
            conversation.assignedTo.toString(),
            'whatsapp',
            'New WhatsApp Message',
            `Message from +${senderPhone}: "${textContent.substring(0, 50)}..."`,
            { conversationId: conversation._id, messageId: message._id }
          );
        }

        // Emit Socket.IO live message
        const io = getIO();
        if (io) {
          io.emit('whatsapp_message', { conversationId: conversation._id, message });
        }
      }
      return { handled: true };
    }

    // B. Handle message delivery / read receipts
    if (value.statuses && value.statuses.length > 0) {
      for (const st of value.statuses) {
        const messageId = st.id;
        const status = st.status; // 'sent' | 'delivered' | 'read' | 'failed'

        const updateData: any = { status };
        if (status === 'delivered') updateData.deliveredAt = new Date();
        if (status === 'read') updateData.readAt = new Date();
        if (status === 'failed') updateData.failedReason = st.errors?.[0]?.message || 'Delivery failed';

        await MessageModel.findOneAndUpdate({ whatsappMessageId: messageId }, { $set: updateData });
      }
      return { handled: true };
    }

    return { handled: false };
  }

  // 7. Seed & list default approved WhatsApp templates
  async getTemplates(): Promise<any[]> {
    let templates = await MessageTemplateModel.find({ isActive: true }).lean();

    if (templates.length === 0) {
      const defaults = [
        {
          name: 'viewing_confirmation_v1',
          language: 'en',
          category: 'UTILITY',
          body: 'Hello {{1}}, your property viewing for {{2}} is confirmed for {{3}} at {{4}}. Your advisor {{5}} will meet you at the property. Reply with any questions.',
          headerType: 'text',
          headerContent: 'Viewing Confirmed',
          isApproved: true,
          isActive: true,
        },
        {
          name: 'new_matching_listing_v1',
          language: 'en',
          category: 'MARKETING',
          body: 'Hi {{1}}, a new listing matching your requirements just launched: {{2}} in {{3}} at {{4}}. Let us know if you would like to book an exclusive preview.',
          headerType: 'image',
          isApproved: true,
          isActive: true,
        },
        {
          name: 'offer_counter_notice_v1',
          language: 'en',
          category: 'TRANSACTIONAL',
          body: 'Dear {{1}}, regarding your offer for {{2}}, the vendor has presented a counter offer of {{3}}. Please let us know your position.',
          headerType: 'text',
          isApproved: true,
          isActive: true,
        },
      ];

      await MessageTemplateModel.insertMany(defaults);
      templates = await MessageTemplateModel.find({ isActive: true }).lean();
    }

    return templates;
  }

  // 8. Bulk WhatsApp Campaign Broadcast
  async runCampaign(data: {
    name: string;
    templateId: string;
    filterByStage?: string;
  }, user?: any): Promise<any> {
    const template = await MessageTemplateModel.findById(data.templateId);
    if (!template) throw new NotFoundError('Template not found');

    const leadQuery: any = { isDeleted: false };
    if (data.filterByStage) {
      leadQuery.stage = data.filterByStage;
    }

    const leads = await LeadModel.find(leadQuery).populate('customer');
    const validRecipients = leads.filter(
      (l: any) => l.customer?.phone && l.customer?.consentGiven !== false
    );

    const campaign = await CampaignModel.create({
      name: data.name,
      template: template._id,
      status: 'running',
      totalRecipients: validRecipients.length,
      startedAt: new Date(),
      createdBy: user?._id,
    });

    // Execute in background
    let sentCount = 0;
    let failedCount = 0;

    for (const lead of validRecipients) {
      try {
        const cust: any = lead.customer;
        const res = await this.sendMessage(
          {
            leadId: lead._id.toString(),
            to: cust.phone,
            text: template.body.replace('{{1}}', cust.name || 'there'),
          },
          user
        );
        if (res) sentCount++;
      } catch (err) {
        failedCount++;
      }
    }

    campaign.status = 'completed';
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.completedAt = new Date();
    await campaign.save();

    return campaign;
  }
}

export const whatsappService = new WhatsAppService();
