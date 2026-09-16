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
    // The backend names the worker filter `userId` (§12.2); the UI calls it workerId.
    const { workerId, ...rest } = params;
    const query = workerId ? { ...rest, userId: workerId } : rest;
    const { data: envelope } = await apiClient.get<
      Envelope<{ items: Shift[]; pagination: BackendShiftPagination; summary: ShiftSummary }>
    >('/shifts', { params: query });
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
    await apiClient.delete(`/shifts/${id}`);
    emit();
  },

  async voiceParse(form: FormData): Promise<VoiceParseResult> {
    // The shared axios instance sets a default `Content-Type: application/json`
    // header. That default WINS over the browser's automatic multipart header,
    // so the request arrived as JSON and multer never saw the file — the backend
    // answered "Missing audio file." (VOICE_FILE_MISSING) instead of
    // transcribing. Clearing the header here lets the browser set
    // `multipart/form-data; boundary=…` itself.
    const { data: envelope } = await apiClient.post<Envelope<BackendVoiceResult>>('/shifts/voice-parse', form, {
      headers: { 'Content-Type': undefined },
    });
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
