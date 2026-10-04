import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
  visibility: z.enum(['public', 'internal', 'admin_only']).default('internal'),
  expiryDate: z.string().optional(),
});

export const documentParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID').optional(),
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID').optional(),
});
