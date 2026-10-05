import { z } from 'zod';

const optionalObjectId = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID').optional()
);

const optionalNumber = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
  z.number().optional()
);

const optionalBoolean = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val === true || val === 'true'),
  z.boolean().optional()
);

const furnishedSchema = z.preprocess(
  (val) => {
    if (typeof val === 'boolean') {
      return val ? 'fully_furnished' : 'unfurnished';
    }
    return val === '' || val === null || val === undefined ? undefined : val;
  },
  z.enum(['unfurnished', 'partly_furnished', 'fully_furnished']).optional()
);

export const createPropertySchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  country: optionalObjectId,
  propertyType: optionalObjectId,
  listingType: optionalObjectId,
  status: optionalObjectId,
  price: optionalNumber,
  currency: optionalObjectId,
  priceOnRequest: optionalBoolean,
  internalReference: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: optionalNumber,
  longitude: optionalNumber,
  tenure: optionalObjectId,
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  livingArea: optionalNumber,
  plotArea: optionalNumber,
  floor: optionalNumber,
  totalFloors: optionalNumber,
  parking: optionalBoolean,
  parkingSpaces: optionalNumber,
  yearBuilt: optionalNumber,
  furnished: furnishedSchema,
  condition: z.string().optional(),
  heating: z.string().optional(),
  berRating: z.string().optional(),
  berNumber: z.string().optional(),
  berCertificateUrl: z.string().optional(),
  propertyRegistration: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  videoUrl: z.string().optional(),
  virtualTourUrl: z.string().optional(),
  floorPlanUrl: z.string().optional(),
  brochureUrl: z.string().optional(),
  coverImage: z.string().optional(),
  features: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((v) => typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v)) : []),
    z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID')).optional()
  ),
  isPublished: optionalBoolean,
  isFeatured: optionalBoolean,
  isVisibleInSearch: optionalBoolean,
  showPrice: optionalBoolean,
  showAddress: optionalBoolean,
  showMap: optionalBoolean,
  showWhatsApp: optionalBoolean,
  showEnquiry: optionalBoolean,
  showViewingRequest: optionalBoolean,
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  includedInSitemap: optionalBoolean,
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
