import { apiClient } from './api-client';
import { BillingStatus } from './types';

const ENDPOINT = '/billing';

type Envelope<T = any> = { success: boolean; message: string; data: T };

export const billingService = {
  async getStatus(): Promise<BillingStatus> {
    const { data: envelope } = await apiClient.get<Envelope<BillingStatus>>(`${ENDPOINT}/status`);
    return envelope.data;
  },

  async createCheckout(plan: 'STARTER' | 'PRO'): Promise<{ url: string }> {
    const { data: envelope } = await apiClient.post<Envelope<{ url: string }>>(
      `${ENDPOINT}/checkout`,
      { plan }
    );
    return envelope.data;
  },

  async openPortal(): Promise<{ url: string }> {
    const { data: envelope } = await apiClient.post<Envelope<{ url: string }>>(
      `${ENDPOINT}/portal`
    );
    return envelope.data;
  },
};
