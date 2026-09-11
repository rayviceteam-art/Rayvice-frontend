import { apiClient } from './api-client';

export interface ShiftRecord {
  id: string;
  clientId: string;
  clientName: string;
  ndisNumber: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  dayHours: number;
  eveHours: number;
  travelKms: number;
  hourlyRate: number;
  dayTotal: number;
  eveTotal: number;
  travelTotal: number;
  grandTotal: number;
  supportItemCode: string;
  caseNotes?: string;
  status: 'PENDING' | 'INVOICED' | 'CANCELLED';
  createdAt: string;
}

const STORAGE_KEY = 'rayvice_logged_shifts';
const LISTENERS: Array<() => void> = [];

function notifyListeners() {
  if (typeof window === 'undefined') return;
  LISTENERS.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore
    }
  });
  window.dispatchEvent(new Event('rayvice_shifts_updated'));
}

function getStoredShifts(): ShiftRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredShifts(shifts: ShiftRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  } catch {
    // ignore
  }
}

export const shiftsService = {
  subscribe(callback: () => void): () => void {
    LISTENERS.push(callback);
    return () => {
      const idx = LISTENERS.indexOf(callback);
      if (idx !== -1) LISTENERS.splice(idx, 1);
    };
  },

  async create(payload: Omit<ShiftRecord, 'id' | 'createdAt' | 'status'>): Promise<ShiftRecord> {
    const newRecord: ShiftRecord = {
      ...payload,
      id: `shift_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Try backend if available
    try {
      const response = await apiClient.post<{ data: ShiftRecord }>('/shifts', payload);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Backend not yet serving /shifts; fall back to client-side storage
    }

    const current = getStoredShifts();
    const updated = [newRecord, ...current];
    saveStoredShifts(updated);
    notifyListeners();

    return newRecord;
  },

  async list(params?: { clientId?: string; status?: string }): Promise<ShiftRecord[]> {
    try {
      const response = await apiClient.get<{ data: { items: ShiftRecord[] } }>('/shifts', { params });
      if (response.data?.data?.items) {
        return response.data.data.items;
      }
    } catch {
      // Fallback
    }

    let records = getStoredShifts();
    if (params?.clientId) {
      records = records.filter((r) => r.clientId === params.clientId);
    }
    if (params?.status) {
      records = records.filter((r) => r.status === params.status);
    }
    return records;
  },

  getPendingCount(clientId?: string): number {
    const list = getStoredShifts().filter((s) => s.status === 'PENDING');
    if (clientId) {
      return list.filter((s) => s.clientId === clientId).length;
    }
    return list.length;
  },

  getRecent(limit: number = 5): ShiftRecord[] {
    return getStoredShifts().slice(0, limit);
  },
};
