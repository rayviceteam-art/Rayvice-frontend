import { apiClient } from './api-client';
import {
  Client,
  ClientDetailResponse,
  ClientListResponse,
  CreateClientPayload,
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

export const clientsService = {
  async list(params: ClientListParams): Promise<ClientListResponse> {
    const { data } = await apiClient.get<ClientListResponse>(ENDPOINT, { params });
    return data;
  },

  async getById(id: string): Promise<ClientDetailResponse> {
    const { data } = await apiClient.get<ClientDetailResponse>(`${ENDPOINT}/${id}`);
    return data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await apiClient.post<Client>(ENDPOINT, payload);
    return data;
  },

  async update(id: string, payload: UpdateClientPayload): Promise<Client> {
    const { data } = await apiClient.put<Client>(`${ENDPOINT}/${id}`, payload);
    return data;
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
