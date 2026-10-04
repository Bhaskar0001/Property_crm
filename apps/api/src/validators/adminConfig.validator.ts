import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isoCode: z.string().optional(),
  code: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  phoneCode: z.string().optional(),
  flag: z.string().optional(),
  flagUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  isoCode: (data.isoCode || data.code || data.name.substring(0, 3)).toUpperCase().trim(),
}));
export const updateCountrySchema = z.object({
  name: z.string().optional(),
  isoCode: z.string().optional(),
  code: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  phoneCode: z.string().optional(),
  flag: z.string().optional(),
  flagUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
}).transform((data) => ({
  ...data,
  ...(data.code && !data.isoCode ? { isoCode: data.code.toUpperCase().trim() } : {}),
}));

export const createCurrencySchema = z.object({
  code: z.string().min(1).max(5).toUpperCase(),
  symbol: z.string().min(1),
  name: z.string().optional().default('Currency'),
  exchangeRate: z.union([z.number(), z.string().transform((v) => parseFloat(v) || 1)]).optional().default(1.0),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});
export const updateCurrencySchema = z.object({
  code: z.string().min(1).max(5).toUpperCase().optional(),
  symbol: z.string().min(1).optional(),
  name: z.string().optional(),
  exchangeRate: z.union([z.number(), z.string().transform((v) => parseFloat(v) || 1)]).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export const createPropertyTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyTypeSchema = createPropertyTypeSchema.deepPartial();

export const createListingTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateListingTypeSchema = createListingTypeSchema.deepPartial();

export const createTenureTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateTenureTypeSchema = createTenureTypeSchema.deepPartial();

export const createPropertyStatusSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyStatusSchema = createPropertyStatusSchema.deepPartial();

export const createPropertyFeatureSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyFeatureSchema = createPropertyFeatureSchema.deepPartial();

export const createLeadSourceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateLeadSourceSchema = createLeadSourceSchema.deepPartial();

export const createLeadStageSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isFinal: z.boolean().optional(),
});
export const updateLeadStageSchema = createLeadStageSchema.deepPartial();

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, 'ID is required'),
      sortOrder: z.number(),
    })
  ),
});
