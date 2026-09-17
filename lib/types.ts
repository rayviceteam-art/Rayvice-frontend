/**
 * Rayvice — TypeScript Definitions
 * Mirrors the backend schema & API responses (src/auth, src/business, compliance).
 */

export type UserRole = 'OWNER' | 'OFFICE_MANAGER' | 'TECHNICIAN' | 'SUPER_ADMIN';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';
export type BusinessStatus = 'TRIALING' | 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED';

export const KNOWN_SUPER_ADMIN_EMAILS = [
  'rayviceofficial@gmail.com',
  'mdsartajalamcrypto@gmail.com',
  'rayvice.team@gmail.com',
];

export function isSuperAdminUser(user?: { role?: string; email?: string } | null): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const email = user.email?.toLowerCase().trim();
  if (!email) return false;
  return KNOWN_SUPER_ADMIN_EMAILS.includes(email);
}

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
  // MODULE 4 (additive, FRONTEND_SPEC §14.4): rate-tier timezone + plan gating.
  timezone?: string;
  state?: string | null;
  planTier?: string;
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
  // MODULE 4 (additive, FRONTEND_SPEC §14.4): profile now returns timezone (§5.2).
  timezone?: string;
  planTier?: string;
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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminMetrics {
  overview: {
    totalBusinesses: number;
    totalUsers: number;
    totalInvoices: number;
    totalShifts: number;
    totalRevenueVolume: number;
    recentRegistrations7Days: number;
  };
  tenantsByStatus: {
    trialing: number;
    active: number;
    readOnly: number;
    suspended: number;
  };
  serverHealth: {
    status: string;
    timestamp: string;
    nodeEnv: string;
  };
}

export interface AdminBusinessItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  industry?: string | null;
  abn?: string | null;
  bsb?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  invoicePrefix: string;
  isGstRegistered: boolean;
  address?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  status: BusinessStatus;
  trialStartedAt: string;
  trialEndsAt: string;
  hasUsedTrial: boolean;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  createdAt: string;
  updatedAt: string;
  counts: {
    users: number;
    clients: number;
    shifts: number;
    invoices: number;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  business?: {
    id: string;
    name: string;
    status: BusinessStatus;
  } | null;
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  createdAt: string;
  business?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface AdminBusinessListResponse {
  records: AdminBusinessItem[];
  pagination: PaginationMeta;
}

export interface AdminUserListResponse {
  records: AdminUserItem[];
  pagination: PaginationMeta;
}

export interface AdminAuditLogListResponse {
  records: AdminAuditLogItem[];
  pagination: PaginationMeta;
}

// =======================================================================
// MODULE 3: NDIS Participants & Plan Managers
// =======================================================================

export type PlanManagementType = 'PLAN_MANAGED' | 'SELF_MANAGED' | 'NDIA_MANAGED';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

export interface Client {
  id: string;
  businessId: string;
  participantName: string;
  ndisNumber: string;
  dateOfBirth: string | null;
  planManagementType: PlanManagementType;
  planManagerAgencyName: string | null;
  planManagerEmail: string | null;
  selfManagedBillingEmail: string | null;
  selfManagedBillingPhone: string | null;
  hourlyRateAgreed: number | null;
  defaultSupportItemCode: string;
  allocatedBudgetTotal: number | null;
  allocatedBudgetSpent: number;
  budgetUtilizationPercent?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClientListItem extends Client {
  pendingUninvoicedShiftsCount: number;
}

export interface RecentShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  amount: number;
  status: string;
}

export interface ClientDetailResponse extends Client {
  pendingUninvoicedShiftsCount: number;
  recentShifts: RecentShift[];
}

export interface ClientListResponse {
  data: ClientListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateClientPayload {
  participantName: string;
  ndisNumber: string;
  dateOfBirth?: string | null;
  planManagementType: PlanManagementType;
  planManagerAgencyName?: string | null;
  planManagerEmail?: string | null;
  selfManagedBillingEmail?: string | null;
  selfManagedBillingPhone?: string | null;
  hourlyRateAgreed: number | null;
  defaultSupportItemCode: string;
  allocatedBudgetTotal?: number | null;
}

export type UpdateClientPayload = Partial<Omit<CreateClientPayload, 'ndisNumber'>>;

// =======================================================================
// MODULE 4: Shift Logging & NDIS Auto-Split Engine (additive, Section 5.3/14.4)
// =======================================================================

export type ShiftStatus = 'PENDING' | 'INVOICED' | 'CANCELLED';
export type RateTier = 'DAY' | 'EVENING' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY' | 'TRAVEL';

export interface ShiftLineItem {
  rateTier: RateTier;
  supportItemCode: string;
  description: string;
  quantity: number;
  unit: 'Hour' | 'KM';
  ndisCapRate: number;
  appliedRate: number;
  amount: number;
  segmentStart: string | null;
  segmentEnd: string | null;
  sortOrder: number;
}

export interface Shift {
  id: string;
  clientId: string;
  userId: string;
  clientName: string;
  ndisNumber: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  travelKms: number;
  supportItemCode: string;
  caseNotes: string | null;
  isPublicHoliday: boolean | null;
  publicHolidayName: string | null;
  status: ShiftStatus;
  totalHours: number;
  totalAmount: number;
  // Backend §21.1 compat fields (day/eve split + invoice state).
  dayHours: number;
  dayTotal: number;
  eveHours: number;
  eveTotal: number;
  hourlyRate: number | null;
  grandTotal: number;
  isInvoiced: boolean;
  calculatedAt: string | null;
  lineItems: ShiftLineItem[];
  timezone: string;
  createdAt: string;
  createdBy?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ShiftSummary {
  totalAmount: number;
  totalHours: number;
  count: number;
}

export interface ShiftListResponse {
  items: Shift[];
  pagination: Pagination;
  summary: ShiftSummary;
}

export interface CreateShiftPayload {
  clientId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  travelKms?: number;
  caseNotes?: string;
  isPublicHoliday?: boolean | null;
  supportItemCode?: string;
}

export type UpdateShiftPayload = Omit<Partial<CreateShiftPayload>, 'clientId'>;

export interface BudgetBlock {
  allocatedTotal: number | null;
  allocatedSpent: number;
  utilizationPercent: number | null;
  level: 'OK' | 'WARNING' | 'EXHAUSTED';
}

export interface ShiftMutationResponse {
  shift: Shift;
  budget: BudgetBlock;
  warnings: string[];
}

export interface DashboardSummary {
  thisWeek: {
    earnings: number;
    hours: number;
    shiftCount: number;
    previousWeekEarnings: number;
    changePercent: number | null;
  };
  uninvoiced: { shiftCount: number; totalAmount: number };
  activeParticipants: number;
  recentShifts: Shift[];
  budgetWatch: Array<{
    clientId: string;
    participantName: string;
    allocatedTotal: number;
    allocatedSpent: number;
    utilizationPercent: number;
    level: 'WARNING' | 'EXHAUSTED';
  }>;
  trial: { status: string; daysRemaining: number; shiftsUsed: number; shiftsLimit: number } | null;
}

export interface VoiceParseResult {
  transcriptPreview: string;
  parsed: {
    clientFirstName: string | null;
    shiftDate: string | null;
    startTime: string | null;
    endTime: string | null;
    travelKms: number | null;
    caseNotes: string | null;
    confidence: number;
    missingFields: string[];
  };
  matchedClientId: string | null;
  clientCandidates: Array<{ id: string; participantName: string; ndisNumber: string }>;
  ndisNumberRedacted: boolean;
  usage: { voiceParsesUsed: number; voiceParsesLimit: number; planTier: string };
}

export interface ParticipantOption {
  id: string;
  participantName: string;
  ndisNumber: string;
  defaultSupportItemCode?: string;
  hourlyRateAgreed?: number | null;
  isActive: boolean;
}

// =======================================================================
// MODULE 5: Invoices, Billing & Pre-Flight Shield
// =======================================================================

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'REJECTED' | 'CANCELLED';

export interface InvoiceLineItem {
  serviceDate: string;
  supportItemCode: string;
  description: string;
  quantity: number;
  unit: 'Hour' | 'KM';
  unitPrice: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  ndisNumber: string;
  planManagementType: 'PLAN_MANAGED' | 'SELF_MANAGED' | 'NDIA_MANAGED';
  planManagerAgencyName: string | null;
  planManagerEmail: string | null;
  recipientEmail: string | null;
  issueDate: string;
  dueDate: string;
  subtotalAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  shiftCount: number;
  sentAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceListResponse {
  items: Invoice[];
  pagination: PaginationMeta;
  summary: {
    totalAmount: number;
    count: number;
    outstandingAmount: number;
    paidAmount: number;
  };
}

export interface ShieldResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{ code: string; passed: boolean; detail?: string }>;
}

export interface DispatchResult {
  sent: boolean;
  to: string | null;
  errorCode?: string;
}

export interface BillingStatus {
  planTier: 'TRIAL' | 'STARTER' | 'PRO';
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    clients: number | null;
    invoicesPerMonth: number | null;
    voice: boolean;
  };
  usage: {
    activeClients: number;
    invoicesThisMonth: number;
    trialDaysRemaining: number | null;
  };
}

export interface UninvoicedShift {
  id: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  travelKms: number;
  grandTotal: number;
  supportItemCode: string | null;
  status: string;
}

export interface UninvoicedGroup {
  clientId: string;
  clientName: string;
  ndisNumber: string;
  shifts: UninvoicedShift[];
  totalAmount: number;
}

