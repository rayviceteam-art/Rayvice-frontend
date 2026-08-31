/**
 * Types mirror the backend's auth module exactly (src/auth/auth.controller.ts,
 * src/auth/auth.validators.ts). Keep these in sync if the backend contract changes.
 */

export type UserRole = 'OWNER' | 'OFFICE_MANAGER' | 'TECHNICIAN';

export interface TrialLimits {
  MAX_CLIENTS: number;
  MAX_SHIFTS: number;
  MAX_INVOICES: number;
  MAX_VOICE_TRANSCRIPTIONS: number;
  DURATION_HOURS: number;
}

export interface TrialDetails {
  status: string;
  effectiveStatus: string;
  trialEndsAt: string;
  daysRemaining: number;
  isExpired: boolean;
  limits: TrialLimits;
}

export interface Business {
  id: string;
  name: string;
  phone?: string | null;
  industry?: string | null;
  status?: string;
  effectiveStatus?: string;
  trialEndsAt?: string | null;
  trial?: TrialDetails | null;
  subscriptionStatus?: string | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  businessId: string;
  isEmailVerified?: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface RegisterResponseData {
  business: Business;
  user: User;
  accessToken: string;
}

/**
 * Every backend response follows this envelope (utils/ApiResponse.ts -> sendSuccess).
 * If the actual shape differs (e.g. includes statusCode), update this type only —
 * nothing else needs to change.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
