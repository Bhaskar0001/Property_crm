import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { CustomerModel } from '../models/Customer';
import { OtpRecordModel } from '../models/OtpRecord';
import { FavoriteModel } from '../models/Favorite';
import { PropertyModel } from '../models/Property';
import { ViewingModel } from '../models/Viewing';
import { LeadModel } from '../models/Lead';
import { LeadSourceModel } from '../models/LeadSource';
import { LeadStageModel } from '../models/LeadStage';
import { OfferModel } from '../models/Offer';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import { config } from '../config';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class CustomerService {
  // Hash OTP code using SHA256 with salt
  private hashOtp(otp: string): string {
    return crypto.createHmac('sha256', config.jwt.secret).update(otp).digest('hex');
  }

  // 1. Send OTP to customer's email
  async sendOtp(email: string, name?: string): Promise<{ success: boolean; message: string; email: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new ValidationError('A valid email address is required');
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = this.hashOtp(otp);

    // Invalidate existing unused OTPs for this email
    await OtpRecordModel.updateMany(
      { email: normalizedEmail, isUsed: false },
      { $set: { isUsed: true } }
    );

    // Create new OTP record valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpRecordModel.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    });

    // Send email
    await emailService.sendOtp(normalizedEmail, otp, name);

    return {
      success: true,
      message: 'Verification code sent to your email address',
      email: normalizedEmail,
    };
  }

  // 2. Verify OTP and return Customer JWT
  async verifyOtp(
    email: string,
    otp: string,
    name?: string,
    phone?: string
  ): Promise<{ customer: any; token: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const otpRecord = await OtpRecordModel.findOne({
      email: normalizedEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ValidationError('Verification code has expired or was not requested. Please request a new code.');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      throw new ValidationError('Too many incorrect attempts. Please request a new verification code.');
    }

    const hashedInput = this.hashOtp(cleanOtp);
    if (hashedInput !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new ValidationError('Invalid verification code. Please check your email and try again.');
    }

    // Code is valid - mark used
    otpRecord.isUsed = true;
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    // Find or create customer
    let customer = await CustomerModel.findOne({ email: normalizedEmail });

    if (!customer) {
      customer = await CustomerModel.create({
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split('@')[0],
        phone: phone?.trim(),
        consentGiven: true,
        consentDate: new Date(),
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      customer.lastLoginAt = new Date();
      if (name && !customer.name) customer.name = name.trim();
      if (phone && !customer.phone) customer.phone = phone.trim();
      await customer.save();
    }

    // Sign customer JWT (valid 30 days)
    const token = jwt.sign(
      {
        customerId: customer._id.toString(),
        email: customer.email,
        type: 'customer',
      },
      config.jwt.secret,
      { expiresIn: '30d' }
    );

    return {
      customer: {
        _id: customer._id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        preferences: customer.preferences,
      },
      token,
    };
  }

  // 3. Get profile
  async getProfile(customerId: string): Promise<any> {
    const customer = await CustomerModel.findById(customerId).lean();
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customer;
  }

  // 4. Update profile and preferences
  async updateProfile(customerId: string, updateData: { name?: string; phone?: string; preferences?: any }): Promise<any> {
    const customer = await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.phone && { phone: updateData.phone.trim() }),
        ...(updateData.preferences && { preferences: updateData.preferences }),
      },
      { new: true }
    ).lean();

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  // 5. Get customer's favorited properties
  async getFavorites(customerId: string): Promise<any[]> {
    const favorites = await FavoriteModel.find({ customer: customerId })
      .populate({
        path: 'property',
        populate: ['country', 'propertyType', 'listingType', 'status', 'currency'],
      })
      .sort({ createdAt: -1 })
      .lean();

    return favorites
      .map((fav: any) => fav.property)
      .filter((p: any) => p && p.isPublished && !p.isDeleted);
  }

  // 6. Add property to favorites
  async addFavorite(customerId: string, propertyId: string): Promise<{ success: boolean; message: string }> {
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    await FavoriteModel.findOneAndUpdate(
      { customer: customerId, property: propertyId },
      { customer: customerId, property: propertyId },
      { upsert: true, new: true }
    );

    return { success: true, message: 'Property added to saved favorites' };
  }

  // 7. Remove property from favorites
  async removeFavorite(customerId: string, propertyId: string): Promise<{ success: boolean; message: string }> {
    await FavoriteModel.findOneAndDelete({ customer: customerId, property: propertyId });
    return { success: true, message: 'Property removed from saved favorites' };
  }

  // 8. Get customer enquiries & viewing appointments
  async getEnquiries(customerId: string): Promise<any> {
    const [viewings, leads] = await Promise.all([
      ViewingModel.find({ customer: customerId })
        .populate('property', 'title slug coverImage price city area')
        .sort({ scheduledDate: -1, createdAt: -1 })
        .lean(),
      LeadModel.find({ customer: customerId })
        .populate('property', 'title slug coverImage price city area')
        .populate('stage', 'name code color')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return { viewings, leads };
  }

  // 9. Get customer purchase offers
  async getOffers(customerId: string): Promise<any> {
    const offers = await OfferModel.find({ customer: customerId })
      .populate('property', 'title slug coverImage price city area')
      .populate('currency', 'code symbol')
      .sort({ createdAt: -1 })
      .lean();
    return offers;
  }

  // 10. Submit an Enquiry / Viewing Request (Automatically creates/links CRM Lead!)
  async createEnquiry(data: {
    customerId?: string;
    name: string;
    email: string;
    phone: string;
    propertyId?: string;
    type?: 'viewing' | 'general' | 'valuation';
    visitType?: 'in_person' | 'virtual';
    virtualPlatform?: 'whatsapp_video' | 'zoom' | 'google_meet' | 'facetime' | 'other';
    scheduledDate?: string;
    scheduledTime?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; viewingId?: string; leadId?: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. Find or create customer
    let customerId = data.customerId;
    let customer: any = null;

    if (customerId) {
      customer = await CustomerModel.findById(customerId);
    }

    if (!customer) {
      customer = await CustomerModel.findOne({ email: normalizedEmail });
    }

    if (!customer) {
      customer = await CustomerModel.create({
        email: normalizedEmail,
        name: data.name.trim(),
        phone: data.phone.trim(),
        consentGiven: true,
        consentDate: new Date(),
        isActive: true,
      });
    }
    customerId = customer._id.toString();

    // 2. Fetch or default lead source & stage
    let source = await LeadSourceModel.findOne({ slug: 'website' });
    if (!source) {
      source = await LeadSourceModel.findOne({ isActive: true });
    }

    let stage = await LeadStageModel.findOne({ code: 'NEW' });
    if (!stage) {
      stage = await LeadStageModel.findOne({ isActive: true });
    }

    // 3. Increment property enquiry count if propertyId present
    let property: any = null;
    if (data.propertyId) {
      property = await PropertyModel.findByIdAndUpdate(
        data.propertyId,
        { $inc: { enquiryCount: 1 } },
        { new: true }
      );
    }

    const visitPrefix = data.type === 'viewing'
      ? data.visitType === 'virtual'
        ? `[VIRTUAL LIVE VIDEO WALKTHROUGH - ${data.virtualPlatform ? data.virtualPlatform.replace('_', ' ').toUpperCase() : 'WHATSAPP VIDEO'}] `
        : '[PHYSICAL IN-PERSON VISIT] '
      : '';

    // 4. Create CRM Lead record
    const lead = await LeadModel.create({
      customer: customer._id,
      property: data.propertyId || undefined,
      source: source?._id,
      stage: stage?._id,
      priority: data.type === 'viewing' ? 'high' : 'medium',
      notes: `${visitPrefix}${data.notes || `New enquiry submitted via website for ${property?.title || 'general advisory'}.`}`,
      lastContactedAt: new Date(),
    });

    // 5. If type is viewing, schedule viewing
    let viewingId: string | undefined;
    if (data.type === 'viewing' && data.propertyId) {
      const viewing = await ViewingModel.create({
        property: data.propertyId,
        lead: lead._id,
        customer: customer._id,
        visitType: data.visitType || 'in_person',
        virtualPlatform: data.virtualPlatform || (data.visitType === 'virtual' ? 'whatsapp_video' : undefined),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(Date.now() + 86400000 * 2),
        scheduledTime: data.scheduledTime || 'morning',
        status: 'scheduled',
        notes: `${visitPrefix}${data.notes || ''}`.trim(),
      });
      viewingId = viewing._id.toString();

      // Dispatch viewing notification
      await emailService.sendViewingNotification(customer.email, {
        customerName: customer.name,
        customerPhone: customer.phone || data.phone,
        propertyTitle: property?.title || 'Selected Property',
        scheduledDate: data.scheduledDate || 'Flexible',
        timeWindow: data.scheduledTime || 'Morning',
        notes: data.notes,
      });
    }

    // Broadcast real-time notification to all active admins & staff
    try {
      await notificationService.broadcastToAdmins({
        title: data.type === 'viewing' ? 'New Viewing Appointment Requested' : 'New Client Property Enquiry',
        message: `${customer.name} (${customer.email}) submitted a ${data.type === 'viewing' ? 'viewing request' : 'property enquiry'} for ${property?.title || 'general portfolio'}`,
        type: data.type === 'viewing' ? 'viewing' : 'lead',
        metadata: { leadId: lead._id, propertyId: data.propertyId, customerId: customer._id },
      });
    } catch (notifErr) {
      logger.warn({ err: notifErr }, 'Failed to broadcast enquiry notification');
    }

    logger.info(`New enquiry received from ${normalizedEmail} for lead ${lead._id}`);

    return {
      success: true,
      message: 'Your enquiry has been successfully registered. An advisor will contact you shortly.',
      viewingId,
      leadId: lead._id.toString(),
    };
  }

  // Admin: List all registered customers with search, pagination, and lead count
  async listAdmin(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CustomerModel.countDocuments(query),
    ]);

    const customerIds = customers.map((c) => c._id);
    const [leads, viewings, favorites] = await Promise.all([
      LeadModel.aggregate([
        { $match: { customer: { $in: customerIds } } },
        { $group: { _id: '$customer', count: { $sum: 1 } } },
      ]),
      ViewingModel.aggregate([
        { $match: { customer: { $in: customerIds } } },
        { $group: { _id: '$customer', count: { $sum: 1 } } },
      ]),
      FavoriteModel.aggregate([
        { $match: { customer: { $in: customerIds } } },
        { $group: { _id: '$customer', count: { $sum: 1 } } },
      ]),
    ]);

    const leadCountMap = new Map(leads.map((l: any) => [l._id.toString(), l.count]));
    const viewingCountMap = new Map(viewings.map((v: any) => [v._id.toString(), v.count]));
    const favoriteCountMap = new Map(favorites.map((f: any) => [f._id.toString(), f.count]));

    const enriched = customers.map((c: any) => ({
      ...c,
      totalLeads: leadCountMap.get(c._id.toString()) || 0,
      totalViewings: viewingCountMap.get(c._id.toString()) || 0,
      totalFavorites: favoriteCountMap.get(c._id.toString()) || 0,
    }));

    return {
      customers: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Get customer 360 profile with all leads, viewings, and favorites
  async getAdminById(id: string) {
    const customer = await CustomerModel.findById(id).lean();
    if (!customer) throw new NotFoundError('Customer not found');

    const [leads, viewings, favorites] = await Promise.all([
      LeadModel.find({ customer: id }).populate('property', 'title price slug address coverImage').sort({ createdAt: -1 }).lean(),
      ViewingModel.find({ customer: id }).populate('property', 'title slug address coverImage').sort({ scheduledDate: -1 }).lean(),
      FavoriteModel.find({ customer: id }).populate('property', 'title price slug address coverImage').lean(),
    ]);

    return {
      customer,
      leads,
      viewings,
      favorites,
    };
  }
}

export const customerService = new CustomerService();
