import mongoose from 'mongoose';
import { PropertyModel } from '../models/Property';
import { MediaModel } from '../models/Media';
import { PropertyDocumentModel } from '../models/PropertyDocument';
import { CountryModel } from '../models/Country';
import { PropertyTypeModel } from '../models/PropertyType';
import { ListingTypeModel } from '../models/ListingType';

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

    return countries.map((country) => ({
      ...country,
      propertyCount: countMap.get(country._id.toString()) || 0,
    }));
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

  async getSitemapData() {
    const properties = await PropertyModel.find(
      { isPublished: true, includedInSitemap: true, isDeleted: { $ne: true } },
      'slug title updatedAt'
    )
      .sort({ updatedAt: -1 })
      .lean();

    return properties.map((prop: any) => ({
      url: `/properties/${prop.slug}`,
      slug: prop.slug,
      title: prop.title,
      lastModified: prop.updatedAt || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }
}

export const publicService = new PublicService();
