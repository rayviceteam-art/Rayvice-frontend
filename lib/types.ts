/**
 * Rayvice — TypeScript Definitions
 * Mirrors the backend schema & API responses (src/auth, src/business, compliance).
 */

export type UserRole = 'OWNER' | 'OFFICE_MANAGER' | 'TECHNICIAN';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';
export type BusinessStatus = 'TRIALING' | 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED';

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

export interface ComplianceChecklist {
  abn: boolean;
  bankDetails: boolean;
  businessAddress: boolean;
  contactInfo: boolean;
  invoicePrefix: boolean;
}

export interface ComplianceReport {
  isCompliant: boolean;
  readinessPercentage: number;
  checklist: ComplianceChecklist;
  missingFields: string[];
  recommendations: string[];
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

export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  industry?: string | null;
  abn?: string | null;
  formattedAbn?: string | null;
  bsb?: string | null;
  formattedBsb?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  bankName?: string | null;
  invoicePrefix: string;
  isGstRegistered: boolean;
  address?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  status: BusinessStatus;
  effectiveStatus: BusinessStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trial?: TrialDetails | null;
  compliance?: ComplianceReport | null;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetails {
  isConfigured: boolean;
  bsb?: string | null;
  formattedBsb?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  bankName?: string | null;
  abn?: string | null;
}

export interface AbnValidationResult {
  isValid: boolean;
  formatted?: string;
  digits?: string;
  error?: string;
}

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
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
