import { z } from 'zod';

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    team: z.enum(['sales', 'support', 'management', 'marketing', 'admin']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    team: z.string().optional(),
  }),
});

export const updatePermissionsSchema = z.object({
  body: z.object({
    permissions: z.array(z.string()),
    countryAccess: z.array(z.string()),
    propertyTypeAccess: z.array(z.string()),
    featureAccess: z.array(z.string()),
    propertyAccessScope: z.object({
      type: z.enum(['all', 'assigned', 'country']),
      countries: z.array(z.string()).optional(),
    }),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});
