import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  team: z.enum(['sales', 'support', 'management', 'marketing', 'admin', 'telecaller', 'legal']).optional().default('sales'),
  role: z.string().optional().default('staff'),
  password: z.string().min(6).optional().default('StaffPass123!'),
  isActive: z.boolean().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  team: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()).optional().default([]),
  countryAccess: z.array(z.string()).optional().default([]),
  propertyTypeAccess: z.array(z.string()).optional().default([]),
  featureAccess: z.array(z.string()).optional().default([]),
  propertyAccessScope: z.object({
    type: z.enum(['all', 'assigned', 'country']).optional().default('all'),
    countries: z.array(z.string()).optional(),
  }).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
