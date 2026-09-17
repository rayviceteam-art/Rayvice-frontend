import { apiClient } from './api-client';
import {
  DispatchResult,
  Invoice,
  InvoiceListResponse,
  InvoiceStatus,
  ShieldResult,
} from './types';

const ENDPOINT = '/invoices';

type Envelope<T = any> = { success: boolean; message: string; data: T };

export interface ListInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  clientId?: string;
  from?: string;
  to?: string;
  sort?: 'issueDate' | 'totalAmount' | 'invoiceNumber';
  order?: 'asc' | 'desc';
}

export interface GenerateInvoicePayload {
  clientId: string;
  shiftIds: string[];
  dueDate?: string;
  notes?: string;
}

export interface GenerateInvoiceResponse {
  invoice: Invoice;
  shield: ShieldResult;
  dispatch: DispatchResult;
  warnings: string[];
}

export const invoicesService = {
  async list(params: ListInvoicesParams = {}): Promise<InvoiceListResponse> {
    const { data: envelope } = await apiClient.get<Envelope<InvoiceListResponse>>(ENDPOINT, {
      params,
    });
    return (
      envelope.data ?? {
        items: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalRecords: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: {
          totalAmount: 0,
          count: 0,
          outstandingAmount: 0,
          paidAmount: 0,
        },
      }
    );
  },

  async getById(id: string): Promise<Invoice> {
    const { data: envelope } = await apiClient.get<Envelope<Invoice>>(`${ENDPOINT}/${id}`);
    return envelope.data;
  },

  async generate(payload: GenerateInvoicePayload): Promise<GenerateInvoiceResponse> {
    const { data: envelope } = await apiClient.post<Envelope<GenerateInvoiceResponse>>(
      `${ENDPOINT}/generate`,
      payload
    );
    return envelope.data;
  },

  async resend(id: string, to?: string): Promise<{ invoice: Invoice }> {
    const { data: envelope } = await apiClient.post<Envelope<{ invoice: Invoice }>>(
      `${ENDPOINT}/${id}/resend`,
      { to }
    );
    return envelope.data;
  },

  async markPaid(
    id: string,
    payload?: { paidAt?: string; amount?: number }
  ): Promise<{ invoice: Invoice }> {
    const { data: envelope } = await apiClient.post<Envelope<{ invoice: Invoice }>>(
      `${ENDPOINT}/${id}/mark-paid`,
      payload ?? {}
    );
    return envelope.data;
  },

  async reject(id: string, reason: string): Promise<{ invoice: Invoice }> {
    const { data: envelope } = await apiClient.post<Envelope<{ invoice: Invoice }>>(
      `${ENDPOINT}/${id}/reject`,
      { reason }
    );
    return envelope.data;
  },

  async cancel(id: string): Promise<{ invoice: Invoice }> {
    const { data: envelope } = await apiClient.post<Envelope<{ invoice: Invoice }>>(
      `${ENDPOINT}/${id}/cancel`
    );
    return envelope.data;
  },

  async fetchPdfBlob(id: string): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async prodaExport(params: { from: string; to: string; clientId?: string }): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/proda-export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
