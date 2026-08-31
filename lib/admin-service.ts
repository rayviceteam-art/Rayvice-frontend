import { apiClient } from './api-client';
import type {
  AdminMetrics,
  AdminBusinessListResponse,
  AdminBusinessItem,
  AdminUserListResponse,
  AdminAuditLogListResponse,
  ApiEnvelope,
  BusinessStatus,
  UserRole,
  UserStatus,
} from './types';

export interface ListBusinessesParams {
  status?: BusinessStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListUsersParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Super Admin Service
 * Handles all administrative endpoints for platform oversight.
 */

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await apiClient.get<ApiEnvelope<AdminMetrics>>('/admin/metrics');
  return data.data;
}

export async function listBusinesses(params: ListBusinessesParams = {}): Promise<AdminBusinessListResponse> {
  const { data } = await apiClient.get<ApiEnvelope<AdminBusinessListResponse>>('/admin/businesses', {
    params,
  });
  return data.data;
}

export async function getBusinessDetails(id: string): Promise<AdminBusinessItem> {
  const { data } = await apiClient.get<ApiEnvelope<AdminBusinessItem>>(`/admin/businesses/${id}`);
  return data.data;
}

export async function updateBusinessStatus(
  id: string,
  status: BusinessStatus,
  reason?: string
): Promise<AdminBusinessItem> {
  const { data } = await apiClient.patch<ApiEnvelope<AdminBusinessItem>>(`/admin/businesses/${id}/status`, {
    status,
    reason,
  });
  return data.data;
}

export async function extendBusinessTrial(id: string, days: number): Promise<AdminBusinessItem> {
  const { data } = await apiClient.patch<ApiEnvelope<AdminBusinessItem>>(`/admin/businesses/${id}/trial`, {
    days,
  });
  return data.data;
}

export async function listUsers(params: ListUsersParams = {}): Promise<AdminUserListResponse> {
  const { data } = await apiClient.get<ApiEnvelope<AdminUserListResponse>>('/admin/users', {
    params,
  });
  return data.data;
}

export async function listAuditLogs(page = 1, pageSize = 30): Promise<AdminAuditLogListResponse> {
  const { data } = await apiClient.get<ApiEnvelope<AdminAuditLogListResponse>>('/admin/audit-logs', {
    params: { page, pageSize },
  });
  return data.data;
}
