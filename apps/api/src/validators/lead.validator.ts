import { z } from 'zod';

export const createLeadSchema = z.object({
  customer: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(5, 'Invalid phone number').optional(),
  property: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID').optional(),
  source: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid source ID').optional(),
  stage: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stage ID').optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  requirements: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  stage: z.string().optional(),
  source: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const changeLeadStageSchema = z.object({
  stage: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stage ID'),
  notes: z.string().optional(),
});

export const assignLeadSchema = z.object({
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export const addLeadNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
});

export const createLeadTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.string().date()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
});
