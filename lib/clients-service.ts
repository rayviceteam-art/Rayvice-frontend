import { apiClient } from './api-client';
import {
  Client,
  ClientDetailResponse,
  ClientListItem,
  ClientListResponse,
  CreateClientPayload,
  ParticipantOption,
  PlanManagementType,
  UpdateClientPayload,
} from './types';

export interface ClientListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  planManagementType?: PlanManagementType;
}

const ENDPOINT = '/clients';

// Backend wraps all responses in { success, message, data: T }
type Envelope<T = any> = { success: boolean; message: string; data: T };

export const clientsService = {
  async list(params: ClientListParams): Promise<ClientListResponse> {
    const { data: envelope } = await apiClient.get<Envelope<{ items: ClientListItem[]; pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number } }>>(ENDPOINT, { params });
    const result = envelope.data;
    return {
      data: result?.items ?? [],
      page: result?.pagination?.page ?? 1,
      pageSize: result?.pagination?.pageSize ?? 20,
      totalCount: result?.pagination?.totalRecords ?? 0,
      totalPages: result?.pagination?.totalPages ?? 1,
    };
  },

  async getById(id: string): Promise<ClientDetailResponse> {
    const { data: envelope } = await apiClient.get<Envelope>(`${ENDPOINT}/${id}`);
    const client = envelope.data;
    return {
      ...client,
      pendingUninvoicedShiftsCount: client.pendingUninvoicedShiftsCount ?? 0,
      recentShifts: (client.shifts ?? client.recentShifts ?? []).map((s: Record<string, unknown>) => ({
        id: s.id,
        date: s.shiftDate ?? s.date,
        startTime: s.startTime ?? '',
        endTime: s.endTime ?? '',
        hours: Number(s.totalHours ?? s.hours ?? 0),
        amount: Number(s.totalClaim ?? s.amount ?? 0),
        status: s.status ?? 'PENDING',
      })),
    };
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data: envelope } = await apiClient.post<Envelope<Client>>(ENDPOINT, payload);
    return envelope.data;
  },

  async update(id: string, payload: UpdateClientPayload): Promise<Client> {
    const { data: envelope } = await apiClient.put<Envelope<Client>>(`${ENDPOINT}/${id}`, payload);
    return envelope.data;
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

// =======================================================================
// MODULE 4 (additive): maps participant list items to the shift-form
// option shape (id, name, NDIS number, default item, agreed rate).
// =======================================================================
export function toParticipantOptions(items: ClientListItem[]): ParticipantOption[] {
  return (items ?? []).map((c) => ({
    id: c.id,
    participantName: c.participantName,
    ndisNumber: c.ndisNumber,
    defaultSupportItemCode: c.defaultSupportItemCode,
    hourlyRateAgreed: c.hourlyRateAgreed,
    isActive: c.isActive,
  }));
}
