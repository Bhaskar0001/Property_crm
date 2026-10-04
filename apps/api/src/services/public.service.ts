import mongoose from 'mongoose';
import { PropertyModel } from '../models/Property';
import { MediaModel } from '../models/Media';
import { PropertyDocumentModel } from '../models/PropertyDocument';
import { CountryModel } from '../models/Country';
import { PropertyTypeModel } from '../models/PropertyType';
import { ListingTypeModel } from '../models/ListingType';
import { PropertyFeatureModel } from '../models/PropertyFeature';
import { CustomerModel } from '../models/Customer';
import { LeadModel } from '../models/Lead';
import { LeadSourceModel } from '../models/LeadSource';
import { LeadStageModel } from '../models/LeadStage';
import { OfferModel } from '../models/Offer';
import { CurrencyModel } from '../models/Currency';

export interface PublicPropertyFilters {
  search?: string;
  country?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string | string[];
  city?: string;
  berRating?: string;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  neLat?: number;
  neLng?: number;
  swLat?: number;
  swLng?: number;
  page?: number;
  limit?: number;
}

export class PublicService {
  async listProperties(filters: PublicPropertyFilters) {
    const query: any = {
      isPublished: true,
      isVisibleInSearch: true,
      isDeleted: { $ne: true },
    };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { internalReference: searchRegex },
        { city: searchRegex },
        { area: searchRegex },
        { address: searchRegex },
        { description: searchRegex },
      ];
    }

    if (filters.country) {
      if (mongoose.isValidObjectId(filters.country)) {
        query.country = filters.country;
      } else {
        const countryDoc = await CountryModel.findOne({
          $or: [
            { isoCode: filters.country.toUpperCase() },
            { name: new RegExp(`^${filters.country}$`, 'i') },
          ],
        });
        if (countryDoc) {
          query.country = countryDoc._id;
        } else {
          query.country = new mongoose.Types.ObjectId();
        }
      }
    }

    if (filters.propertyType) {
      if (mongoose.isValidObjectId(filters.propertyType)) {
        query.propertyType = filters.propertyType;
      } else {
        const typeDoc = await PropertyTypeModel.findOne({
          $or: [
            { slug: filters.propertyType.toLowerCase() },
            { name: new RegExp(`^${filters.propertyType}$`, 'i') },
          ],
        });
        if (typeDoc) {
          query.propertyType = typeDoc._id;
        } else {
          query.propertyType = new mongoose.Types.ObjectId();
        }
      }
    }

    if (filters.listingType) {
      if (mongoose.isValidObjectId(filters.listingType)) {
        query.listingType = filters.listingType;
      } else {
        const listingDoc = await ListingTypeModel.findOne({
          $or: [
            { slug: filters.listingType.toLowerCase() },
            { name: new RegExp(`^${filters.listingType}$`, 'i') },
          ],
        });
        if (listingDoc) {
          query.listingType = listingDoc._id;
        } else {
          query.listingType = new mongoose.Types.ObjectId();
        }
      }
    }

    if (filters.city) {
      query.city = new RegExp(filters.city.trim(), 'i');
    }

    if (filters.berRating) {
      query.berRating = filters.berRating;
    }

    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters.bedrooms !== undefined && Number(filters.bedrooms) > 0) {
      query.bedrooms = { $gte: Number(filters.bedrooms) };
    }

    if (filters.bathrooms !== undefined && Number(filters.bathrooms) > 0) {
      query.bathrooms = { $gte: Number(filters.bathrooms) };
    }

    if (filters.features) {
      const featureArray = Array.isArray(filters.features)
        ? filters.features
        : filters.features.split(',').map((f) => f.trim()).filter(Boolean);
      if (featureArray.length > 0) {
        query.features = { $all: featureArray };
      }
    }

    // Map bounds filter for "Search as I move the map"
    if (
      filters.swLat !== undefined &&
      filters.neLat !== undefined &&
      filters.swLng !== undefined &&
      filters.neLng !== undefined
    ) {
      query.latitude = { $gte: Number(filters.swLat), $lte: Number(filters.neLat) };
      query.longitude = { $gte: Number(filters.swLng), $lte: Number(filters.neLng) };
    }

    // Sort order
    let sort: any = { createdAt: -1 };
    if (filters.sortBy === 'price_asc') {
      sort = { price: 1 };
    } else if (filters.sortBy === 'price_desc') {
      sort = { price: -1 };
    } else if (filters.sortBy === 'popular') {
      sort = { viewCount: -1 };
    } else if (filters.sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(filters.limit) || 12));
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      PropertyModel.find(query)
        .populate('country', 'name isoCode currency phoneCode')
        .populate('propertyType', 'name slug icon')
        .populate('listingType', 'name slug')
        .populate('status', 'name code color')
        .populate('currency', 'code symbol name')
        .populate('features', 'name slug icon')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      PropertyModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getPropertyBySlug(slug: string) {
    const rawProperty = await PropertyModel.findOne({ slug });

    if (!rawProperty) {
      return null;
    }

    // PRD Rule: Properties never 404 when unlisted / delisted / deleted
    if (!rawProperty.isPublished || rawProperty.isDeleted) {
      return {
        isUnavailable: true,
        title: rawProperty.title,
        slug: rawProperty.slug,
        message: 'This property is no longer available or has been off-boarded.',
      };
    }

    // Active property: atomically track view
    await PropertyModel.findByIdAndUpdate(rawProperty._id, { $inc: { viewCount: 1 } });

    // Populate full details
    const property = await PropertyModel.findById(rawProperty._id)
      .populate('country', 'name isoCode currency phoneCode')
      .populate('propertyType', 'name slug icon description')
      .populate('listingType', 'name slug')
      .populate('tenureType', 'name slug')
      .populate('status', 'name code color')
      .populate('currency', 'code symbol name')
      .populate('features', 'name slug icon')
      .populate('createdBy', 'name email phone')
      .lean();

    // Fetch media (photos, floorplans, videos)
    const media = await MediaModel.find({ property: rawProperty._id })
      .sort({ isCover: -1, sortOrder: 1, createdAt: 1 })
      .lean();

    // Fetch public documents (brochures, plans)
    const documents = await PropertyDocumentModel.find({
      property: rawProperty._id,
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      isUnavailable: false,
      property,
      media,
      documents,
    };
  }

  async getFeaturedProperties(limit = 6): Promise<any[]> {
    return await PropertyModel.find({
      isPublished: true,
      isFeatured: true,
      isDeleted: { $ne: true },
    })
      .populate('country', 'name isoCode currency')
      .populate('propertyType', 'name slug icon')
      .populate('listingType', 'name slug')
      .populate('status', 'name code color')
      .populate('currency', 'code symbol name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getPublicCountries(): Promise<any[]> {
    const countries: any[] = await CountryModel.find({ isActive: true }).lean();

    // Count published properties per country
    const counts = await PropertyModel.aggregate([
      { $match: { isPublished: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      if (c._id) countMap.set(c._id.toString(), c.count);
    });

    return countries.map((country) => {
      const iso = (country.isoCode || country.code || '').toLowerCase().trim();
      const flagUrl = country.flagUrl || (iso ? `https://flagcdn.com/w80/${iso}.png` : undefined);
      return {
        ...country,
        flagUrl,
        propertyCount: countMap.get(country._id.toString()) || 0,
      };
    });
  }

  async getPublicCurrencies(): Promise<any[]> {
    return CurrencyModel.find({ isActive: true }).sort({ isDefault: -1, code: 1 }).lean();
  }

  async getPublicPropertyTypes(): Promise<any[]> {
    const types: any[] = await PropertyTypeModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

    const counts = await PropertyModel.aggregate([
      { $match: { isPublished: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((t) => {
      if (t._id) countMap.set(t._id.toString(), t.count);
    });

    return types.map((type) => ({
      ...type,
      propertyCount: countMap.get(type._id.toString()) || 0,
    }));
  }

  async getPublicListingTypes(): Promise<any[]> {
    const types: any[] = await ListingTypeModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

    const counts = await PropertyModel.aggregate([
      { $match: { isPublished: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$listingType', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((t) => {
      if (t._id) countMap.set(t._id.toString(), t.count);
    });

    return types.map((type) => ({
      ...type,
      propertyCount: countMap.get(type._id.toString()) || 0,
    }));
  }

  async getPublicFeatures(): Promise<any[]> {
    return PropertyFeatureModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  }


  async trackInquiry(data: {
    propertyId?: string;
    channel: 'whatsapp' | 'call' | 'share' | 'brochure';
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }) {
    if (data.propertyId && mongoose.isValidObjectId(data.propertyId)) {
      await PropertyModel.findByIdAndUpdate(data.propertyId, { $inc: { enquiryCount: 1 } });
    }

    const sourceSlug = data.channel === 'whatsapp' ? 'whatsapp' : data.channel === 'call' ? 'phone' : 'website';
    let source = await LeadSourceModel.findOne({ slug: sourceSlug });
    if (!source) {
      source = await LeadSourceModel.findOne({ isActive: true });
    }

    let stage = await LeadStageModel.findOne({ code: 'NEW' });
    if (!stage) {
      stage = await LeadStageModel.findOne({ isActive: true });
    }

    let customer: any = null;
    if (data.customerEmail || data.customerPhone) {
      const query: any = {};
      if (data.customerEmail) query.email = data.customerEmail.toLowerCase().trim();
      if (data.customerPhone) query.phone = data.customerPhone.trim();
      customer = await CustomerModel.findOne(query);

      if (!customer) {
        customer = await CustomerModel.create({
          name: data.customerName || 'Inquiry Visitor',
          email: data.customerEmail || `visitor_${Date.now()}@inquiry.local`,
          phone: data.customerPhone || '',
          isActive: true,
        });
      }
    }

    const property = data.propertyId && mongoose.isValidObjectId(data.propertyId)
      ? await PropertyModel.findById(data.propertyId)
      : null;

    if (customer) {
      const lead = await LeadModel.create({
        customer: customer._id,
        property: property?._id,
        source: source?._id,
        stage: stage?._id,
        priority: 'high',
        notes: `Visitor initiated ${data.channel.toUpperCase()} contact for ${property?.title || 'listing'}.`,
        lastContactedAt: new Date(),
      });
      return { leadId: lead._id, success: true };
    }

    return { tracked: true, success: true };
  }

  async submitOffer(data: {
    propertyId: string;
    amount: number;
    currencyId?: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    purchasingPosition?: string;
    completionTimeline?: string;
    conditions?: string;
    notes?: string;
  }) {
    if (!data.propertyId || !mongoose.isValidObjectId(data.propertyId)) {
      throw new Error('Valid Property ID is required');
    }
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Valid positive offer amount is required');
    }
    if (!data.buyerEmail || !data.buyerName) {
      throw new Error('Buyer Name and Email are required to submit an offer');
    }

    const property = await PropertyModel.findById(data.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Resolve customer
    let customer: any = await CustomerModel.findOne({ email: data.buyerEmail.toLowerCase().trim() });
    if (!customer) {
      customer = await CustomerModel.create({
        name: data.buyerName,
        email: data.buyerEmail.toLowerCase().trim(),
        phone: data.buyerPhone || '',
        isActive: true,
      });
    }

    // Resolve source & stage
    let source = await LeadSourceModel.findOne({ slug: 'website' }) || await LeadSourceModel.findOne({ isActive: true });
    let stage = await LeadStageModel.findOne({ code: 'OFFER_MADE' }) ||
      await LeadStageModel.findOne({ code: 'NEW' }) ||
      await LeadStageModel.findOne({ isActive: true });

    // Link or create lead
    let lead = await LeadModel.findOne({ customer: customer._id, property: property._id });
    if (!lead) {
      lead = await LeadModel.create({
        customer: customer._id,
        property: property._id,
        source: source?._id,
        stage: stage?._id,
        priority: 'urgent',
        notes: `New Purchase Offer submitted: €${Number(data.amount).toLocaleString()} (${data.purchasingPosition || 'Standard purchasing position'})`,
        lastContactedAt: new Date(),
      });
    } else {
      lead.notes = `${lead.notes || ''}\n[OFFER SUBMITTED] €${Number(data.amount).toLocaleString()} on ${new Date().toLocaleDateString()}`;
      if (stage?._id) lead.stage = stage._id;
      await lead.save();
    }

    const offer = await OfferModel.create({
      property: property._id,
      lead: lead._id,
      customer: customer._id,
      amount: Number(data.amount),
      currency: data.currencyId || property.currency,
      status: 'SUBMITTED',
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone || '',
      purchasingPosition: data.purchasingPosition || 'Cash Purchaser',
      completionTimeline: data.completionTimeline || 'Standard (60 days)',
      conditions: data.conditions || '',
      notes: data.notes || '',
    });

    return { offer, leadId: lead._id, success: true };
  }

  async requestValuation(data: {
    address: string;
    city: string;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    condition?: string;
    intent: 'selling' | 'letting' | 'remortgage' | 'probate' | 'other' | string;
    preferredDate?: string;
    preferredTime?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    notes?: string;
  }) {
    if (!data.address || !data.ownerEmail || !data.ownerName) {
      throw new Error('Address, Name, and Email are required for valuation appraisal');
    }

    let customer: any = await CustomerModel.findOne({ email: data.ownerEmail.toLowerCase().trim() });
    if (!customer) {
      customer = await CustomerModel.create({
        name: data.ownerName,
        email: data.ownerEmail.toLowerCase().trim(),
        phone: data.ownerPhone || '',
        isActive: true,
      });
    }

    let source = await LeadSourceModel.findOne({ slug: 'valuation' }) ||
      await LeadSourceModel.findOne({ slug: 'website' }) ||
      await LeadSourceModel.findOne({ isActive: true });
    let stage = await LeadStageModel.findOne({ code: 'NEW' }) || await LeadStageModel.findOne({ isActive: true });

    const lead = await LeadModel.create({
      customer: customer._id,
      source: source?._id,
      stage: stage?._id,
      priority: 'high',
      notes: `[VALUATION APPRAISAL REQUEST]\nAddress: ${data.address}, ${data.city}\nProperty Type: ${data.propertyType}\nBedrooms: ${data.bedrooms || 'N/A'}, Bathrooms: ${data.bathrooms || 'N/A'}\nCondition: ${data.condition || 'Good'}\nIntent: ${(data.intent || 'SELLING').toUpperCase()}\nPreferred Date: ${data.preferredDate || 'Earliest available'} ${data.preferredTime || ''}\nOwner Notes: ${data.notes || 'None'}`,
      lastContactedAt: new Date(),
    });

    return { leadId: lead._id, success: true };
  }

  async getSitemapData(baseUrl: string = 'http://localhost:3000') {
    const publishedProperties = await PropertyModel.find({
      isPublished: true,
      isDeleted: false,
    })
      .populate('country')
      .select('slug country city updatedAt')
      .lean();

    const items: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    // Static pages
    items.push({ loc: `${baseUrl}/`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' });
    items.push({ loc: `${baseUrl}/properties`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.9' });
    items.push({ loc: `${baseUrl}/services`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' });
    items.push({ loc: `${baseUrl}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.6' });

    // Published properties
    for (const p of publishedProperties) {
      const countrySlug = (p.country as any)?.code?.toLowerCase() || 'ireland';
      const citySlug = (p.city || 'all').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({
        loc: `${baseUrl}/properties/${countrySlug}/${citySlug}/${p.slug}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    return items;
  }

  async getSitemapXml(baseUrl: string = 'http://localhost:3000'): Promise<string> {
    const items = await this.getSitemapData(baseUrl);
    const xmlUrls = items
      .map(
        (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  }

  getRobotsTxt(baseUrl: string = 'http://localhost:3000'): string {
    return `User-agent: *
Allow: /
Allow: /properties
Allow: /services
Allow: /contact
Disallow: /admin
Disallow: /portal
Disallow: /api/

Sitemap: ${baseUrl}/api/v1/public/sitemap.xml
`;
  }
}

export const publicService = new PublicService();
