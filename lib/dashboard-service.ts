import { apiClient } from './api-client';
import type { DashboardSummary } from './types';

let cached: DashboardSummary | null = null;

export function getCachedSummary(): DashboardSummary | null {
  return cached;
}

// Backend wraps every response in { success, message, data } (ApiResponse.sendSuccess).
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data: envelope } = await apiClient.get<{ success: boolean; message: string; data: DashboardSummary }>(
      '/dashboard/summary',
    );
    cached = envelope.data;
    return envelope.data;
  },
};
