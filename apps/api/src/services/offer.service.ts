import mongoose from 'mongoose';
import { OfferModel } from '../models/Offer';
import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { CustomerModel } from '../models/Customer';
import { PropertyStatusModel } from '../models/PropertyStatus';
import { LeadStageModel } from '../models/LeadStage';
import { LeadActivityModel } from '../models/LeadActivity';
import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface OfferFilterParams {
  status?: string;
  dealStage?: string;
  property?: string;
  lead?: string;
  customer?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class OfferService {
  async list(params: OfferFilterParams, user?: any): Promise<{
    offers: any[];
    total: number;
    page: number;
    totalPages: number;
    stats: {
      total: number;
      pending: number;
      countered: number;
      accepted: number;
      totalVolume: number;
    };
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.status && params.status !== 'all') {
      const statuses = params.status.split(',').map((s) => s.trim());
      const regexes = statuses.map((s) => new RegExp(`^${s}$`, 'i'));
      query.status = { $in: regexes };
    }

    if (params.dealStage && params.dealStage !== 'all') {
      query.dealStage = params.dealStage;
    }

    if (params.property) {
      query.property = params.property;
    }

    if (params.lead) {
      query.lead = params.lead;
    }

    if (params.customer) {
      query.customer = params.customer;
    }

    const [offers, total, allOffers] = await Promise.all([
      OfferModel.find(query)
        .populate({
          path: 'property',
          select: 'title slug price currency city area coverImage status',
          populate: [
            { path: 'currency', select: 'code symbol' },
            { path: 'status', select: 'name code' },
          ],
        })
        .populate('customer', 'name email phone')
        .populate('lead', 'priority stage')
        .populate('currency', 'code symbol')
        .populate('submittedBy', 'name email')
        .populate('respondedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OfferModel.countDocuments(query),
      OfferModel.find({}, 'status amount dealStage').lean(),
    ]);

    // Compute stats
    let totalVolume = 0;
    let pending = 0;
    let countered = 0;
    let accepted = 0;

    for (const off of allOffers) {
      const st = (off.status || '').toUpperCase();
      if (st === 'SUBMITTED' || st === 'PENDING' || st === 'UNDER_REVIEW') {
        pending++;
      } else if (st === 'COUNTER_OFFER' || st === 'COUNTERED') {
        countered++;
      } else if (st === 'ACCEPTED') {
        accepted++;
        totalVolume += off.amount || 0;
      }
    }

    // Attach variance calculation (vs asking price)
    const formattedOffers = offers.map((offer: any) => {
      const askingPrice = offer.property?.price || 0;
      const offeredAmount = offer.amount || 0;
      const varianceAmount = offeredAmount - askingPrice;
      const variancePercent = askingPrice > 0 ? (varianceAmount / askingPrice) * 100 : 0;

      return {
        ...offer,
        askingPrice,
        varianceAmount,
        variancePercent: Number(variancePercent.toFixed(1)),
      };
    });

    return {
      offers: formattedOffers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: allOffers.length,
        pending,
        countered,
        accepted,
        totalVolume,
      },
    };
  }

  async getById(id: string): Promise<any> {
    const offer = await OfferModel.findById(id)
      .populate({
        path: 'property',
        select: 'title slug price currency city area address coverImage status',
        populate: [
          { path: 'currency', select: 'code symbol' },
          { path: 'status', select: 'name code' },
        ],
      })
      .populate('customer', 'name email phone')
      .populate('lead')
      .populate('currency', 'code symbol')
      .populate('submittedBy', 'name email phone')
      .populate('respondedBy', 'name email phone')
      .lean();

    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    const askingPrice = (offer as any).property?.price || 0;
    const offeredAmount = (offer as any).amount || 0;
    const varianceAmount = offeredAmount - askingPrice;
    const variancePercent = askingPrice > 0 ? (varianceAmount / askingPrice) * 100 : 0;

    return {
      ...offer,
      askingPrice,
      varianceAmount,
      variancePercent: Number(variancePercent.toFixed(1)),
    };
  }

  async create(data: {
    propertyId: string;
    amount: number;
    currencyId?: string;
    leadId?: string;
    customerId?: string;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    conditions?: string;
    notes?: string;
    closingDate?: string;
  }, user?: any): Promise<any> {
    const property = await PropertyModel.findById(data.propertyId).populate('currency');
    if (!property) {
      throw new ValidationError('Valid property ID is required');
    }

    if (!data.amount || data.amount <= 0) {
      throw new ValidationError('Offer amount must be greater than zero');
    }

    // Resolve customer
    let customerId = data.customerId;
    let customer: any = null;

    if (customerId) {
      customer = await CustomerModel.findById(customerId);
    } else if (data.buyerEmail) {
      const email = data.buyerEmail.toLowerCase().trim();
      customer = await CustomerModel.findOne({ email });
      if (!customer) {
        customer = await CustomerModel.create({
          name: data.buyerName || 'Offer Buyer',
          email,
          phone: data.buyerPhone || '',
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
        priority: 'urgent',
        assignedTo: user?._id,
        notes: `Formal offer submitted of ${data.amount} for ${property.title}.`,
        lastContactedAt: new Date(),
      });
      leadId = lead._id.toString();
    }

    const currencyId = data.currencyId || (property.currency as any)?._id || (property.currency as any);

    const offer = await OfferModel.create({
      property: property._id,
      lead: leadId ? new mongoose.Types.ObjectId(leadId) : undefined,
      customer: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      amount: data.amount,
      currency: currencyId ? new mongoose.Types.ObjectId(currencyId) : undefined,
      status: 'SUBMITTED',
      submittedBy: user?._id,
      buyerName: data.buyerName || customer?.name,
      buyerEmail: data.buyerEmail || customer?.email,
      buyerPhone: data.buyerPhone || customer?.phone,
      notes: data.notes,
      conditions: data.conditions,
      closingDate: data.closingDate ? new Date(data.closingDate) : undefined,
    });

    // Log Activity
    if (leadId) {
      await LeadActivityModel.create({
        lead: leadId,
        type: 'offer_submitted',
        description: `Formal offer of ${data.amount} submitted for ${property.title}.`,
        performedBy: user?._id,
        metadata: { offerId: offer._id, amount: data.amount },
      });
    }

    // Notify staff
    if (user?._id) {
      await notificationService.create(
        user._id.toString(),
        'offer',
        'Offer Registered',
        `An offer of ${data.amount} has been registered for ${property.title}.`,
        { offerId: offer._id, propertyId: property._id }
      );
    }

    logger.info(`Offer created: ${offer._id} for property ${property._id} with amount ${data.amount}`);
    return this.getById(offer._id.toString());
  }

  async update(id: string, data: {
    amount?: number;
    notes?: string;
    conditions?: string;
    closingDate?: string;
  }, user?: any): Promise<any> {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (data.amount !== undefined) offer.amount = data.amount;
    if (data.notes !== undefined) offer.notes = data.notes;
    if (data.conditions !== undefined) offer.conditions = data.conditions;
    if (data.closingDate !== undefined) offer.closingDate = new Date(data.closingDate);

    await offer.save();
    return this.getById(offer._id.toString());
  }

  async updateStatus(id: string, update: {
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTER_OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
    counterAmount?: number;
    notes?: string;
  }, user?: any): Promise<any> {
    const offer = await OfferModel.findById(id).populate('property customer');
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    const normalizedStatus = update.status.toUpperCase();
    offer.status = normalizedStatus;
    offer.respondedAt = new Date();
    offer.respondedBy = user?._id ? new mongoose.Types.ObjectId(user._id) : undefined;

    if (update.notes) {
      offer.notes = `${offer.notes ? offer.notes + '\n' : ''}${update.notes}`;
    }

    const prop: any = offer.property;
    const cust: any = offer.customer;

    if (normalizedStatus === 'COUNTER_OFFER') {
      if (!update.counterAmount || update.counterAmount <= 0) {
        throw new ValidationError('counterAmount is required when making a counter offer');
      }
      offer.counterAmount = update.counterAmount;

      if (offer.lead) {
        await LeadActivityModel.create({
          lead: offer.lead,
          type: 'offer_submitted',
          description: `Counter offer issued of ${update.counterAmount} on ${prop?.title || 'property'}. Note: ${update.notes || 'None'}`,
          performedBy: user?._id,
          metadata: { offerId: offer._id, counterAmount: update.counterAmount },
        });
      }

      if (cust?.email) {
        await emailService.sendOfferStatusUpdate(cust.email, {
          customerName: cust.name,
          propertyTitle: prop?.title || 'Property',
          amountFormatted: offer.amount.toLocaleString(),
          status: 'Counter Offer',
          counterAmountFormatted: update.counterAmount.toLocaleString(),
          notes: update.notes,
        });
      }
    } else if (normalizedStatus === 'ACCEPTED') {
      offer.dealStage = 'offer_accepted';

      // Update property status to under_offer or sale_agreed if exists
      const underOfferStatus = await PropertyStatusModel.findOne({
        code: { $in: ['UNDER_OFFER', 'SALE_AGREED', 'RESERVED'] },
      });
      if (underOfferStatus && prop?._id) {
        await PropertyModel.findByIdAndUpdate(prop._id, { status: underOfferStatus._id });
      }

      // Advance Lead Stage to 'OFFER_ACCEPTED' or 'DEAL_WON' if available
      const wonStage = await LeadStageModel.findOne({
        code: { $in: ['OFFER_ACCEPTED', 'DEAL_WON', 'CLOSED_WON'] },
      });
      if (wonStage && offer.lead) {
        await LeadModel.findByIdAndUpdate(offer.lead, { stage: wonStage._id });
      }

      if (offer.lead) {
        await LeadActivityModel.create({
          lead: offer.lead,
          type: 'offer_submitted',
          description: `Offer of ${offer.amount} ACCEPTED! Deal pipeline initiated.`,
          performedBy: user?._id,
          metadata: { offerId: offer._id, amount: offer.amount },
        });
      }

      if (cust?.email) {
        await emailService.sendOfferStatusUpdate(cust.email, {
          customerName: cust.name,
          propertyTitle: prop?.title || 'Property',
          amountFormatted: offer.amount.toLocaleString(),
          status: 'Accepted',
          notes: update.notes || 'Congratulations, your offer has been accepted by the vendor!',
        });
      }
    } else if (normalizedStatus === 'REJECTED') {
      if (offer.lead) {
        await LeadActivityModel.create({
          lead: offer.lead,
          type: 'offer_submitted',
          description: `Offer of ${offer.amount} rejected. Note: ${update.notes || 'No reason provided'}`,
          performedBy: user?._id,
          metadata: { offerId: offer._id },
        });
      }

      if (cust?.email) {
        await emailService.sendOfferStatusUpdate(cust.email, {
          customerName: cust.name,
          propertyTitle: prop?.title || 'Property',
          amountFormatted: offer.amount.toLocaleString(),
          status: 'Rejected',
          notes: update.notes,
        });
      }
    } else if (normalizedStatus === 'WITHDRAWN') {
      if (offer.lead) {
        await LeadActivityModel.create({
          lead: offer.lead,
          type: 'status_changed',
          description: `Offer of ${offer.amount} withdrawn.`,
          performedBy: user?._id,
          metadata: { offerId: offer._id },
        });
      }
    }

    await offer.save();
    return this.getById(offer._id.toString());
  }

  async updateDealStage(id: string, dealStage: 'offer_accepted' | 'solicitor_instructed' | 'survey_valuation' | 'contracts_exchanged' | 'completed', user?: any): Promise<any> {
    const offer = await OfferModel.findById(id).populate('property lead');
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    offer.dealStage = dealStage;
    await offer.save();

    if (offer.lead) {
      await LeadActivityModel.create({
        lead: offer.lead,
        type: 'status_changed',
        description: `Deal pipeline milestone updated: ${dealStage.replace('_', ' ').toUpperCase()}`,
        performedBy: user?._id,
        metadata: { offerId: offer._id, dealStage },
      });
    }

    return this.getById(offer._id.toString());
  }

  async getDeals(user?: any): Promise<any> {
    const deals = await OfferModel.find({ status: { $in: ['ACCEPTED', 'accepted'] } })
      .populate({
        path: 'property',
        select: 'title slug price currency city coverImage',
        populate: { path: 'currency', select: 'code symbol' },
      })
      .populate('customer', 'name email phone')
      .populate('lead', 'priority')
      .populate('currency', 'code symbol')
      .sort({ updatedAt: -1 })
      .lean();

    const stages = [
      { key: 'offer_accepted', label: 'Offer Accepted' },
      { key: 'solicitor_instructed', label: 'Solicitor Instructed' },
      { key: 'survey_valuation', label: 'Survey & Valuation' },
      { key: 'contracts_exchanged', label: 'Contracts Exchanged' },
      { key: 'completed', label: 'Completed' },
    ];

    const grouped: Record<string, any[]> = {
      offer_accepted: [],
      solicitor_instructed: [],
      survey_valuation: [],
      contracts_exchanged: [],
      completed: [],
    };

    let totalVolume = 0;
    for (const deal of deals) {
      const stageKey = deal.dealStage || 'offer_accepted';
      if (!grouped[stageKey]) grouped[stageKey] = [];
      grouped[stageKey].push(deal);
      totalVolume += deal.amount || 0;
    }

    return {
      totalDeals: deals.length,
      totalVolume,
      stages,
      grouped,
      deals,
    };
  }
}

export const offerService = new OfferService();
