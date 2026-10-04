import { z } from 'zod';

export const sendWhatsAppMessageSchema = z.object({
  conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID').optional(),
  leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
  to: z.string().optional(),
  text: z.string().min(1, 'Message text is required'),
});

export const sendPropertyWhatsAppSchema = z.object({
  conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID').optional(),
  leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID'),
  to: z.string().optional(),
});

export const runWhatsAppCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  templateId: z.string().optional(),
  messageText: z.string().optional(),
  targetAudience: z.object({
    stage: z.string().optional(),
    source: z.string().optional(),
    hasPhoneOnly: z.boolean().optional(),
  }).optional(),
});
