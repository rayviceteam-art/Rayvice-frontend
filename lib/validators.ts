import { z } from 'zod';

/**
 * Mirrors src/auth/auth.validators.ts on the backend field-for-field.
 * Keeping these identical means a form can never submit something the
 * backend would reject — validation happens instantly on the client,
 * and again authoritatively on the server.
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(128, 'Password must be at most 128 characters long.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

const emailSchema = z.string().trim().toLowerCase().email('A valid email address is required.');

export const registerSchema = z
  .object({
    businessName: z.string().trim().min(2, 'Business name must be at least 2 characters.').max(150),
    businessPhone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
    industry: z.string().trim().max(100).optional().or(z.literal('')),
    firstName: z.string().trim().min(1, 'First name is required.').max(80),
    lastName: z.string().trim().min(1, 'Last name is required.').max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
