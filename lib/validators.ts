import { z } from 'zod';

/**
 * ATO ABN Modulo 89 validation helper
 */
export function validateAbnClient(abn: string | null | undefined): boolean {
  if (!abn) return true; // Optional field in form if empty
  const digits = abn.replace(/\s+/g, '').replace(/-/g, '');
  if (!/^\d{11}$/.test(digits)) return false;
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digitArray = digits.split('').map(Number);
  const weightedSum = digitArray.reduce((acc, digit, idx) => {
    const adjusted = idx === 0 ? digit - 1 : digit;
    return acc + adjusted * weights[idx];
  }, 0);
  return weightedSum % 89 === 0;
}

export const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const;

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(128, 'Password must be at most 128 characters long.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

export const emailSchema = z.string().trim().toLowerCase().email('A valid email address is required.');

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

/**
 * Module 2: Business Profile Form Schema
 */
export const businessProfileFormSchema = z.object({
  name: z.string().trim().min(2, 'Business legal name must be at least 2 characters.').max(150),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits.').max(25).optional().or(z.literal('')),
  industry: z.string().trim().max(100).optional().or(z.literal('')),
  abn: z
    .string()
    .trim()
    .refine(
      (val) => !val || validateAbnClient(val),
      'Invalid ABN checksum according to ATO Modulo 89 algorithm.'
    )
    .optional()
    .or(z.literal('')),
  bsb: z
    .string()
    .trim()
    .regex(/^(\d{3}-?\d{3})?$/, 'BSB must be 6 digits (e.g. 062-000).')
    .optional()
    .or(z.literal('')),
  accountNumber: z
    .string()
    .trim()
    .regex(/^(\d{6,9})?$/, 'Account number must be 6 to 9 numeric digits.')
    .optional()
    .or(z.literal('')),
  accountName: z.string().trim().max(100).optional().or(z.literal('')),
  bankName: z.string().trim().max(100).optional().or(z.literal('')),
  invoicePrefix: z
    .string()
    .trim()
    .min(1, 'Prefix must be 1-10 characters.')
    .max(10, 'Prefix cannot exceed 10 characters.')
    .regex(/^[A-Za-z0-9-_]+$/, 'Prefix must be alphanumeric or hyphens.'),
  isGstRegistered: z.boolean(),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  suburb: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.enum(['', ...AUSTRALIAN_STATES]).optional(),
  postcode: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, 'Postcode must be 4 digits.')
    .optional()
    .or(z.literal('')),
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileFormSchema>;

/**
 * Module 2: Banking Form Schema
 */
export const bankDetailsFormSchema = z.object({
  bsb: z
    .string()
    .trim()
    .regex(/^\d{3}-?\d{3}$/, 'BSB must be 6 numeric digits (e.g. 062-000).'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,9}$/, 'Account number must be 6 to 9 numeric digits.'),
  accountName: z.string().trim().min(2, 'Account name required.').max(100),
  bankName: z.string().trim().max(100).optional().or(z.literal('')),
});

export type BankDetailsFormValues = z.infer<typeof bankDetailsFormSchema>;

/**
 * Team Member Invite Schema
 */
export const inviteTeamMemberFormSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().min(1, 'First name is required.').max(80),
  lastName: z.string().trim().min(1, 'Last name is required.').max(80),
  role: z.enum(['OFFICE_MANAGER', 'TECHNICIAN']),
});

export type InviteTeamMemberFormValues = z.infer<typeof inviteTeamMemberFormSchema>;

// =======================================================================
// MODULE 3: NDIS Participants & Plan Managers Form Schemas
// =======================================================================

export const planManagementTypeSchema = z.enum(['PLAN_MANAGED', 'SELF_MANAGED', 'NDIA_MANAGED']);

export const clientFormSchema = z
  .object({
    participantName: z
      .string()
      .trim()
      .min(1, 'Participant name is required.'),
    ndisNumber: z
      .string()
      .regex(/^\d{9}$/, 'NDIS number must be exactly 9 digits.'),
    dateOfBirth: z.string().optional().or(z.literal('')),
    planManagementType: planManagementTypeSchema,
    planManagerAgencyName: z.string().trim().optional().or(z.literal('')),
    planManagerEmail: z
      .string()
      .trim()
      .email('Enter a valid email address.')
      .optional()
      .or(z.literal('')),
    nomineeBillingEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
    nomineeBillingPhone: z.string().trim().optional().or(z.literal('')),
    defaultSupportItemCode: z.string().min(1, 'Select a default support category.'),
    hourlyRateAgreed: z
      .number({ invalid_type_error: 'Enter a valid hourly rate.' })
      .nonnegative('Hourly rate cannot be negative.'),
    allocatedBudgetTotal: z
      .number({ invalid_type_error: 'Enter a valid budget amount.' })
      .nonnegative('Budget cannot be negative.')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.planManagementType === 'PLAN_MANAGED') {
      if (!data.planManagerAgencyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['planManagerAgencyName'],
          message: 'Plan Manager agency name and claims email are required for Plan-Managed participants.',
        });
      }
      if (!data.planManagerEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['planManagerEmail'],
          message: 'Plan Manager agency name and claims email are required for Plan-Managed participants.',
        });
      }
    }
  });

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export function emptyClientFormValues(defaultHourlyRate: number): ClientFormValues {
  return {
    participantName: '',
    ndisNumber: '',
    dateOfBirth: '',
    planManagementType: 'PLAN_MANAGED',
    planManagerAgencyName: '',
    planManagerEmail: '',
    nomineeBillingEmail: '',
    nomineeBillingPhone: '',
    defaultSupportItemCode: '',
    hourlyRateAgreed: defaultHourlyRate,
    allocatedBudgetTotal: null,
  };
}

