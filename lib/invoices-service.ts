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
    const fallback: InvoiceListResponse = {
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
    };
    if (!envelope.data) return fallback;
    // Backend pagination is { page, pageSize, totalRecords, totalPages } (no
    // hasNextPage/hasPrevPage). Normalise so the UI never sees undefined.
    const rawPagination: any = (envelope.data as any).pagination ?? {};
    const page = rawPagination.page ?? 1;
    const totalPages = rawPagination.totalPages ?? 1;
    return {
      ...envelope.data,
      pagination: {
        page,
        pageSize: rawPagination.pageSize ?? 20,
        totalRecords: rawPagination.totalRecords ?? 0,
        totalPages,
        hasNextPage:
          typeof rawPagination.hasNextPage === 'boolean'
            ? rawPagination.hasNextPage
            : page < totalPages,
        hasPrevPage:
          typeof rawPagination.hasPrevPage === 'boolean'
            ? rawPagination.hasPrevPage
            : page > 1,
      },
    };
  },

  async getById(id: string): Promise<Invoice> {
    // Backend wraps the view as { invoice } (invoice.controller getInvoice).
    // Accept both the wrapped and the direct shape so the detail page never
    // receives { invoice } as if it were an Invoice.
    const { data: envelope } = await apiClient.get<
      Envelope<Invoice | { invoice: Invoice }>
    >(`${ENDPOINT}/${id}`);
    const payload: any = envelope.data as any;
    if (payload && typeof payload === 'object' && 'invoice' in payload && payload.invoice) {
      return payload.invoice as Invoice;
    }
    return payload as Invoice;
  },

  async generate(payload: GenerateInvoicePayload): Promise<GenerateInvoiceResponse> {
    const { data: envelope } = await apiClient.post<Envelope<GenerateInvoiceResponse>>(
      `${ENDPOINT}/generate`,
      payload
    );
    const result = envelope.data;
    // Backend dispatch is { status: 'SENT' | 'FAILED' | 'SKIPPED_NDIA_MANAGED',
    // to, messageId, bcc }. Normalise to also expose the legacy `sent`
    // boolean the UI checks, without changing any UI copy.
    if (result && (result as any).dispatch && typeof (result as any).dispatch.sent === 'undefined') {
      const d: any = (result as any).dispatch;
      d.sent = d.status === 'SENT' || d.status === 'SKIPPED_NDIA_MANAGED';
    }
    return result;
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
  ): Promise<{ invoice: Invoice; alreadyPaid?: boolean }> {
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
