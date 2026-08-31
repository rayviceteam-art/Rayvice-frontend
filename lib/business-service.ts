import { apiClient } from './api-client';
import {
  ApiEnvelope,
  BusinessProfile,
  BankDetails,
  ComplianceReport,
  AbnValidationResult,
  TeamMember,
} from './types';
import {
  BusinessProfileFormValues,
  BankDetailsFormValues,
  InviteTeamMemberFormValues,
} from './validators';

/**
 * Fetches the comprehensive business profile, compliance readiness, and banking.
 */
export async function getBusinessProfile(): Promise<BusinessProfile> {
  const response = await apiClient.get<ApiEnvelope<BusinessProfile>>('/business/profile');
  return response.data.data;
}

/**
 * Updates business profile, Australian tax settings, and banking details.
 */
export async function updateBusinessProfile(data: Partial<BusinessProfileFormValues>): Promise<BusinessProfile> {
  const response = await apiClient.put<ApiEnvelope<BusinessProfile>>('/business/profile', data);
  return response.data.data;
}

/**
 * Retrieves EFT payment remittance details.
 */
export async function getBankDetails(): Promise<BankDetails> {
  const response = await apiClient.get<ApiEnvelope<BankDetails>>('/business/bank-details');
  return response.data.data;
}

/**
 * Updates EFT bank details specifically.
 */
export async function updateBankDetails(data: BankDetailsFormValues): Promise<BankDetails> {
  const response = await apiClient.put<ApiEnvelope<BankDetails>>('/business/bank-details', data);
  return response.data.data;
}

/**
 * Standalone ATO Modulo-89 ABN Validator.
 */
export async function validateAbn(abn: string): Promise<AbnValidationResult> {
  const response = await apiClient.post<ApiEnvelope<AbnValidationResult>>('/business/validate-abn', { abn });
  return response.data.data;
}

/**
 * Retrieves Pre-Flight NDIS compliance readiness report.
 */
export async function getComplianceStatus(): Promise<ComplianceReport> {
  const response = await apiClient.get<ApiEnvelope<ComplianceReport>>('/business/compliance-status');
  return response.data.data;
}

/**
 * Team Management: Invites a team member.
 */
export async function inviteTeamMember(data: InviteTeamMemberFormValues): Promise<TeamMember> {
  const response = await apiClient.post<ApiEnvelope<TeamMember>>('/business/team/invite', data);
  return response.data.data;
}

/**
 * Team Management: Lists team members.
 */
export async function listTeamMembers(page = 1, pageSize = 20): Promise<{ records: TeamMember[]; pagination: any }> {
  const response = await apiClient.get<ApiEnvelope<{ records: TeamMember[]; pagination: any }>>('/business/team', {
    params: { page, pageSize },
  });
  return response.data.data;
}

/**
 * Team Management: Suspends a team member.
 */
export async function suspendTeamMember(userId: string): Promise<void> {
  await apiClient.patch(`/business/team/${userId}/suspend`);
}

/**
 * Team Management: Reactivates a team member.
 */
export async function reactivateTeamMember(userId: string): Promise<void> {
  await apiClient.patch(`/business/team/${userId}/reactivate`);
}
