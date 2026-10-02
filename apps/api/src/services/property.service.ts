import { PropertyModel } from '../models/Property';
import { PropertyQueryParams } from '../validators/property.validator';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export class PropertyService {
  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title);
    let isUnique = false;
    let counter = 1;
    const originalSlug = slug;
    
    while (!isUnique) {
      const existingProperty = await PropertyModel.findOne({ slug });
      if (!existingProperty) {
        isUnique = true;
      } else {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }
    
    return slug;
  }

  async create(data: any, userId: string) {
    const slug = await this.generateUniqueSlug(data.title);
    
    const property = new PropertyModel({
      ...data,
      slug,
      createdBy: userId
    });
    
    return await property.save();
  }

  async update(id: string, data: any, userId: string) {
    let slug;
    if (data.title) {
      const existing = await PropertyModel.findById(id);
      if (existing && existing.title !== data.title) {
        slug = await this.generateUniqueSlug(data.title);
      }
    }
    
    const updateData = {
      ...data,
      ...(slug && { slug }),
      updatedBy: userId
    };
    
    return await PropertyModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getById(id: string, user?: any) {
    const property: any = await PropertyModel.findById(id)
      .populate('country propertyType listingType tenure status currency features coverImage createdBy updatedBy');
      
    if (!property) {
      throw new Error('NotFoundError: Property not found');
    }
    
    if (user && user.role !== 'admin') {
      if (user.role === 'staff') {
        const countryAccess = user.countryAccess || [];
        const propertyTypeAccess = user.propertyTypeAccess || [];
        
        if (countryAccess.length > 0 && !countryAccess.includes(property.country.toString())) {
          throw new Error('ForbiddenError: You do not have permission to access properties in this territory');
        }
        
        if (propertyTypeAccess.length > 0 && !propertyTypeAccess.includes(property.propertyType.toString())) {
          throw new Error('ForbiddenError: You do not have permission to access properties of this type');
        }
        
        if (user.propertyAccessScope?.type === 'assigned') {
          if (property.createdBy.toString() !== user._id.toString()) {
            throw new Error('ForbiddenError: You do not have permission to access this assigned property');
          }
        }
      }
    }
    
    return property;
  }

  async list(params: PropertyQueryParams, user?: any) {
    const filter: any = {};
    
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { address: { $regex: params.search, $options: 'i' } },
        { internalReference: { $regex: params.search, $options: 'i' } }
      ];
    }
    
    if (params.country) filter.country = params.country;
    if (params.propertyType) filter.propertyType = params.propertyType;
    if (params.listingType) filter.listingType = params.listingType;
    if (params.status) filter.status = params.status;
    if (params.bedrooms) filter.bedrooms = params.bedrooms;
    if (params.bathrooms) filter.bathrooms = params.bathrooms;
    if (params.isPublished !== undefined) filter.isPublished = params.isPublished;
    if (params.isFeatured !== undefined) filter.isFeatured = params.isFeatured;
    
    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) filter.price.$gte = params.minPrice;
      if (params.maxPrice) filter.price.$lte = params.maxPrice;
    }
    
    if (user && user.role === 'staff') {
      const countryAccess = user.countryAccess || [];
      if (countryAccess.length > 0) {
        filter.country = { $in: countryAccess };
      }
      
      const propertyTypeAccess = user.propertyTypeAccess || [];
      if (propertyTypeAccess.length > 0) {
        filter.propertyType = { $in: propertyTypeAccess };
      }
      
      if (user.propertyAccessScope?.type === 'assigned') {
        filter.createdBy = user._id;
      }
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    
    const sort: any = {};
    if (params.sortBy) {
      sort[params.sortBy] = params.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    
    const [data, total] = await Promise.all([
      PropertyModel.find(filter)
        .populate('country propertyType listingType status currency')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      PropertyModel.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async updateStatus(id: string, statusId: string, userId: string) {
    return await PropertyModel.findByIdAndUpdate(
      id,
      { status: statusId, updatedBy: userId },
      { new: true }
    );
  }

  async setPublished(id: string, isPublished: boolean, userId: string) {
    return await PropertyModel.findByIdAndUpdate(
      id,
      { 
        isPublished,
        publishedAt: isPublished ? new Date() : undefined,
        updatedBy: userId 
      },
      { new: true }
    );
  }

  async delete(id: string, userId: string) {
    return await PropertyModel.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedBy: userId },
      { new: true }
    );
  }
}

export const propertyService = new PropertyService();
