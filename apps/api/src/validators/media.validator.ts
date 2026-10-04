import { z } from 'zod';

export const reorderMediaSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID'),
      sortOrder: z.number().int().min(0),
    })
  ).min(1, 'At least one media item must be provided for reordering'),
});

export const mediaParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid media ID').optional(),
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID').optional(),
});
