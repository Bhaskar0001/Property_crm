import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isoCode: z.string().min(2).max(3).toUpperCase(),
  currency: z.string().min(24, 'Invalid currency ID'),
  timezone: z.string(),
  phoneCode: z.string(),
  isActive: z.boolean().optional(),
});
export const updateCountrySchema = createCountrySchema.deepPartial();

export const createCurrencySchema = z.object({
  code: z.string().length(3).toUpperCase(),
  symbol: z.string().min(1),
  name: z.string().min(1),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});
export const updateCurrencySchema = createCurrencySchema.deepPartial();

export const createPropertyTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyTypeSchema = createPropertyTypeSchema.deepPartial();

export const createListingTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateListingTypeSchema = createListingTypeSchema.deepPartial();

export const createTenureTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateTenureTypeSchema = createTenureTypeSchema.deepPartial();

export const createPropertyStatusSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyStatusSchema = createPropertyStatusSchema.deepPartial();

export const createPropertyFeatureSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updatePropertyFeatureSchema = createPropertyFeatureSchema.deepPartial();

export const createLeadSourceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});
export const updateLeadSourceSchema = createLeadSourceSchema.deepPartial();

export const createLeadStageSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
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
