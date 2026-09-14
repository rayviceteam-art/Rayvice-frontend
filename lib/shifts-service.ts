import { apiClient } from './api-client';
import { getCachedSummary } from './dashboard-service';
import type {
  CreateShiftPayload,
  Shift,
  ShiftListResponse,
  ShiftMutationResponse,
  ShiftSummary,
  UpdateShiftPayload,
  VoiceParseResult,
} from './types';

const LEGACY_LOCAL_STORAGE_KEY = 'rayvice_logged_shifts';

// One-time cleanup of the old localStorage fallback (Section 14.2).
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((cb) => cb());
}

export interface ShiftListParams {
  status?: 'PENDING' | 'INVOICED';
  from?: string;
  to?: string;
  clientId?: string;
  workerId?: string;
  page?: number;
  pageSize?: number;
}

// Backend wraps every response in { success, message, data } (ApiResponse.sendSuccess).
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Backend pagination uses `totalRecords`; the Module 4 UI contract uses `totalItems`.
interface BackendShiftPagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// Backend voice payload: `usage` carries no `voiceParsesUsed` counter.
interface BackendVoiceResult {
  transcriptPreview: string;
  parsed: VoiceParseResult['parsed'];
  matchedClientId: string | null;
  clientCandidates: VoiceParseResult['clientCandidates'];
  ndisNumberRedacted: boolean;
  warnings?: string[];
  usage: { planTier: string; voiceParsesLimit: number | null };
}

export const shiftsService = {
  async list(params: ShiftListParams): Promise<ShiftListResponse> {
    const { data: envelope } = await apiClient.get<
      Envelope<{ items: Shift[]; pagination: BackendShiftPagination; summary: ShiftSummary }>
    >('/shifts', { params });
    const body = envelope.data;
    return {
      items: body?.items ?? [],
      pagination: {
        page: body?.pagination?.page ?? 1,
        pageSize: body?.pagination?.pageSize ?? 20,
        totalItems: body?.pagination?.totalRecords ?? 0,
        totalPages: body?.pagination?.totalPages ?? 1,
      },
      summary: body?.summary ?? { totalAmount: 0, totalHours: 0, count: 0 },
    };
  },

  async get(id: string): Promise<Shift> {
    const { data: envelope } = await apiClient.get<Envelope<{ shift: Shift }>>(`/shifts/${id}`);
    return envelope.data.shift;
  },

  async create(payload: CreateShiftPayload, idempotencyKey: string): Promise<ShiftMutationResponse> {
    const { data: envelope } = await apiClient.post<Envelope<ShiftMutationResponse>>('/shifts', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    emit();
    return envelope.data;
  },

  async update(id: string, payload: UpdateShiftPayload, idempotencyKey: string): Promise<ShiftMutationResponse> {
    const { data: envelope } = await apiClient.patch<Envelope<ShiftMutationResponse>>(`/shifts/${id}`, payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    emit();
    return envelope.data;
  },

  async cancel(id: string): Promise<void> {
    await apiClient.post(`/shifts/${id}/cancel`);
    emit();
  },

  async voiceParse(form: FormData): Promise<VoiceParseResult> {
    // NOTE: no manual Content-Type — the browser must set the multipart
    // boundary itself, otherwise multer never sees the file.
    const { data: envelope } = await apiClient.post<Envelope<BackendVoiceResult>>('/shifts/voice-parse', form);
    const body = envelope.data;
    return {
      transcriptPreview: body.transcriptPreview,
      parsed: body.parsed,
      matchedClientId: body.matchedClientId,
      clientCandidates: body.clientCandidates ?? [],
      ndisNumberRedacted: body.ndisNumberRedacted,
      // The backend does not track a used-count; the UI does not display it.
      usage: {
        voiceParsesUsed: 0,
        voiceParsesLimit: body.usage?.voiceParsesLimit ?? 0,
        planTier: body.usage?.planTier ?? '',
      },
    };
  },

  // Backwards-compatible: delegates to the cached dashboard summary (Section 14.1).
  getRecent(limit: number): Shift[] {
    const summary = getCachedSummary();
    return (summary?.recentShifts ?? []).slice(0, limit);
  },

  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
