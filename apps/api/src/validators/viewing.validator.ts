import { z } from 'zod';

export const createViewingSchema = z.object({
  property: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID'),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
  customer: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID').optional(),
  visitType: z.enum(['in_person', 'virtual']).default('in_person'),
  virtualPlatform: z.enum(['whatsapp_video', 'zoom', 'google_meet', 'facetime', 'other']).optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  scheduledTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Time must be in HH:MM format'),
  duration: z.number().min(15).max(240).optional().default(30),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid staff ID').optional(),
  notes: z.string().optional(),
});

export const updateViewingSchema = createViewingSchema.partial();

export const updateViewingStatusSchema = z.object({
  status: z.enum([
    'scheduled',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled',
    'no_show',
    'REQUESTED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED',
    'NO_SHOW',
  ]),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const viewingQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.string().optional(),
  property: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  visitType: z.string().optional(),
});
