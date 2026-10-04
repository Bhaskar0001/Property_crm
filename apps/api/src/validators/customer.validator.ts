import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().optional(),
  preferences: z
    .object({
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      bedrooms: z.number().optional(),
      locations: z.array(z.string()).optional(),
      propertyTypes: z.array(z.string()).optional(),
    })
    .optional(),
  consentGiven: z.boolean().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  country: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
