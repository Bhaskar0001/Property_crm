import { z } from 'zod';

export const createOfferSchema = z.object({
  property: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID'),
  amount: z.number().positive('Offer amount must be positive'),
  currency: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid currency ID').optional(),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
  customer: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID').optional(),
  buyerName: z.string().min(2).optional(),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  notes: z.string().optional(),
  conditions: z.string().optional(),
  purchasingPosition: z.string().optional(),
  completionTimeline: z.string().optional(),
});

export const updateOfferSchema = createOfferSchema.partial();

export const respondOfferSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'WITHDRAWN', 'accepted', 'rejected', 'countered']),
  counterAmount: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateDealStageSchema = z.object({
  dealStage: z.enum([
    'offer_accepted',
    'solicitor_instructed',
    'survey_valuation',
    'contracts_exchanged',
    'completed',
  ]),
  notes: z.string().optional(),
  closingDate: z.string().optional(),
});

export const offerQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.string().optional(),
  property: z.string().optional(),
  dealStage: z.string().optional(),
});
