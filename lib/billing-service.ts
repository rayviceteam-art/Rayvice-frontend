import { apiClient } from './api-client';
import { BillingStatus } from './types';

const ENDPOINT = '/billing';

type Envelope<T = any> = { success: boolean; message: string; data: T };

export const billingService = {
  async getStatus(): Promise<BillingStatus> {
    const { data: envelope } = await apiClient.get<Envelope<BillingStatus>>(`${ENDPOINT}/status`);
    const status = envelope.data;
    // Backend sends limits.voice as a number (0 / Infinity->null in JSON).
    // Normalise to a boolean for the UI without changing any copy.
    if (status && (status as any).limits) {
      const rawVoice: any = (status as any).limits.voice;
      if (typeof rawVoice === 'number') {
        (status as any).limits.voice = rawVoice > 0;
      } else if (rawVoice === null || typeof rawVoice === 'undefined') {
        (status as any).limits.voice = status.planTier === 'PRO';
      }
    }
    return status;
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
