import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  // Identity & Location
  internalReference?: string;
  title: string;
  slug: string;
  country: mongoose.Types.ObjectId;
  region?: string;
  city?: string;
  area?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  // Transaction
  propertyType: mongoose.Types.ObjectId;
  listingType: mongoose.Types.ObjectId;
  tenureType?: mongoose.Types.ObjectId;
  status: mongoose.Types.ObjectId;
  price?: number;
  currency?: mongoose.Types.ObjectId;
  priceOnRequest: boolean;

  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  plotArea?: number;
  floor?: number;
  totalFloors?: number;
  parking: boolean;
  parkingSpaces?: number;
  yearBuilt?: number;
  furnished?: 'unfurnished' | 'partly_furnished' | 'fully_furnished';
  condition?: string;
  heating?: string;

  // Energy & Registration (Ireland & Global)
  berRating?: string;
  berNumber?: string;
  berCertificateUrl?: string;
  propertyRegistration?: string;

  // Description & Features
  description?: string;
  shortDescription?: string;
  features: mongoose.Types.ObjectId[];

  // Media & Assets
  imageCount: number;
  coverImage?: string;

  // Publication & Display Controls
  isPublished: boolean;
  isFeatured: boolean;
  isVisibleInSearch: boolean;
  showPrice: boolean;
  showAddress: boolean;
  showMap: boolean;
  showWhatsApp: boolean;
  showEnquiry: boolean;
  showViewingRequest: boolean;
  publishedAt?: Date;

  // SEO
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  includedInSitemap: boolean;

  // Analytics & Engagement
  viewCount: number;
  enquiryCount: number;

  // Audit
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProperty>(
  {
    internalReference: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', index: true },
    region: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    area: { type: String, trim: true },
    address: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },

    propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType', index: true },
    listingType: { type: Schema.Types.ObjectId, ref: 'ListingType', index: true },
    tenureType: { type: Schema.Types.ObjectId, ref: 'TenureType' },
    status: { type: Schema.Types.ObjectId, ref: 'PropertyStatus', index: true },
    price: { type: Number, index: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
    priceOnRequest: { type: Boolean, default: false },

    bedrooms: { type: Number, default: 0, index: true },
    bathrooms: { type: Number, default: 0 },
    livingArea: { type: Number },
    plotArea: { type: Number },
    floor: { type: Number },
    totalFloors: { type: Number },
    parking: { type: Boolean, default: false },
    parkingSpaces: { type: Number, default: 0 },
    yearBuilt: { type: Number },
    furnished: { type: String, enum: ['unfurnished', 'partly_furnished', 'fully_furnished'] },
    condition: { type: String },
    heating: { type: String },

    berRating: { type: String, trim: true },
    berNumber: { type: String, trim: true },
    berCertificateUrl: { type: String, trim: true },
    propertyRegistration: { type: String, trim: true },

    description: { type: String },
    shortDescription: { type: String },
    features: [{ type: Schema.Types.ObjectId, ref: 'PropertyFeature' }],

    imageCount: { type: Number, default: 0 },
    coverImage: { type: String },

    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isVisibleInSearch: { type: Boolean, default: true, index: true },
    showPrice: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    showMap: { type: Boolean, default: true },
    showWhatsApp: { type: Boolean, default: true },
    showEnquiry: { type: Boolean, default: true },
    showViewingRequest: { type: Boolean, default: true },
    publishedAt: { type: Date },

    seoTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
    includedInSitemap: { type: Boolean, default: true },

    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound indexes for search performance
schema.index({ isPublished: 1, isVisibleInSearch: 1, isDeleted: 1 });
schema.index({ isPublished: 1, isFeatured: 1 });
schema.index({ title: 'text', description: 'text', address: 'text', city: 'text', internalReference: 'text' });

export const PropertyModel = mongoose.model<IProperty>('Property', schema);
