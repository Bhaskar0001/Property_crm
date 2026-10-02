import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(3),
  country: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  propertyType: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  listingType: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  status: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  price: z.number().optional(),
  currency: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID').optional(),
  priceOnRequest: z.boolean().optional(),
  internalReference: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tenure: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID').optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  livingArea: z.number().optional(),
  plotArea: z.number().optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  parking: z.boolean().optional(),
  parkingSpaces: z.number().optional(),
  yearBuilt: z.number().optional(),
  furnished: z.boolean().optional(),
  condition: z.string().optional(),
  heating: z.string().optional(),
  berRating: z.string().optional(),
  berNumber: z.string().optional(),
  berCertificateUrl: z.string().optional(),
  propertyRegistration: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  features: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID')).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isVisibleInSearch: z.boolean().optional(),
  showPrice: z.boolean().optional(),
  showAddress: z.boolean().optional(),
  showMap: z.boolean().optional(),
  showWhatsApp: z.boolean().optional(),
  showEnquiry: z.boolean().optional(),
  showViewingRequest: z.boolean().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  includedInSitemap: z.boolean().optional(),
});

export const updatePropertySchema = createPropertySchema.deepPartial();

export const propertyQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  country: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  bedrooms: z.string().regex(/^\d+$/).transform(Number).optional(),
  bathrooms: z.string().regex(/^\d+$/).transform(Number).optional(),
  isPublished: z.string().transform((val) => val === 'true').optional(),
  isFeatured: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID')
});

export const publishToggleSchema = z.object({
  isPublished: z.boolean()
});

export type PropertyQueryParams = z.infer<typeof propertyQuerySchema>;
