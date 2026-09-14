'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { SplitPreview } from './SplitPreview';
import { calculateShiftSplit, type PublicHolidayMode } from '@/lib/shift-calculator';
import { shiftFormSchema } from '@/lib/validators';
import { SHIFT_SUPPORT_ITEMS as SUPPORT_ITEMS, DEFAULT_SUPPORT_ITEM_CODE } from '@/lib/ndis-rates';
import { formatAud } from '@/lib/format';
import type { CreateShiftPayload, ParticipantOption, Shift, UpdateShiftPayload } from '@/lib/types';

export interface ShiftFormProps {
  mode: 'create' | 'edit';
  initialShift?: Shift;
  participants: ParticipantOption[];
  defaultClientId?: string;
  businessTimezone: string;
  businessState?: string | null;
  isSubmitting: boolean;
  serverFieldErrors?: Record<string, string[] | undefined>;
  serverError?: string | null;
  onSubmit: (payload: CreateShiftPayload | UpdateShiftPayload, idempotencyKey: string) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  /** Bump `version` each time a new voice-parse result should be applied (Section 12). */
  voicePrefill?: {
    version: number;
    clientId?: string | null;
    shiftDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    travelKms?: number | null;
    caseNotes?: string | null;
    missingFields?: string[];
  };
}

function todayInTz(tz: string): string {
  return DateTime.now().setZone(tz).toISODate()!;
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ShiftForm({
  mode,
  initialShift,
  participants,
  defaultClientId,
  businessTimezone,
  businessState,
  isSubmitting,
  serverFieldErrors,
  serverError,
  onSubmit,
  onCancel,
  onDirtyChange,
  voicePrefill,
}: ShiftFormProps) {
  const activeParticipants = participants.filter((p) => p.isActive);

  const initialClientId =
    initialShift?.clientId ??
    defaultClientId ??
    (activeParticipants.length === 1 ? activeParticipants[0].id : activeParticipants[0]?.id ?? '');

  const [clientId, setClientId] = useState(initialClientId);
  const [shiftDate, setShiftDate] = useState(initialShift?.shiftDate ?? todayInTz(businessTimezone));
  const [startTime, setStartTime] = useState(initialShift?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(initialShift?.endTime ?? '13:00');
  const [travelKms, setTravelKms] = useState<string>(String(initialShift?.travelKms ?? 0));
  const [supportItemCode, setSupportItemCode] = useState(
    initialShift?.supportItemCode ??
      activeParticipants.find((p) => p.id === initialClientId)?.defaultSupportItemCode ??
      DEFAULT_SUPPORT_ITEM_CODE
  );
  const [supportItemTouched, setSupportItemTouched] = useState(false);
  const [holidayMode, setHolidayMode] = useState<PublicHolidayMode>(
    initialShift?.isPublicHoliday === true ? 'FORCE_ON' : initialShift?.isPublicHoliday === false ? 'FORCE_OFF' : 'AUTO'
  );
  const [caseNotes, setCaseNotes] = useState(initialShift?.caseNotes ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const idempotencyKey = useRef(uuidv4());
  const [dirty, setDirty] = useState(false);
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());
  const lastVoiceVersion = useRef<number | undefined>(undefined);

  // Apply a new voice-parse result as a prefill (Section 12: voice never auto-saves).
  useEffect(() => {
    if (!voicePrefill || voicePrefill.version === lastVoiceVersion.current) return;
    lastVoiceVersion.current = voicePrefill.version;
    const filled = new Set<string>();
    if (voicePrefill.clientId) {
      setClientId(voicePrefill.clientId);
      filled.add('clientId');
    }
    if (voicePrefill.shiftDate) {
      setShiftDate(voicePrefill.shiftDate);
      filled.add('shiftDate');
    }
    if (voicePrefill.startTime) {
      setStartTime(voicePrefill.startTime);
      filled.add('startTime');
    }
    if (voicePrefill.endTime) {
      setEndTime(voicePrefill.endTime);
      filled.add('endTime');
    }
    if (voicePrefill.travelKms != null) {
      setTravelKms(String(voicePrefill.travelKms));
      filled.add('travelKms');
    }
    if (voicePrefill.caseNotes) {
      setCaseNotes(voicePrefill.caseNotes);
      filled.add('caseNotes');
    }
    setAiFields(filled);
    setDirty(true);
  }, [voicePrefill]);

  function clearAiBadge(field: string) {
    setAiFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }

  function AiBadge({ field }: { field: string }) {
    if (!aiFields.has(field)) return null;
    return <span className="ml-1 rounded bg-brand-bg px-1.5 py-0.5 text-[10px] font-semibold text-brand-light">AI</span>;
  }

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  function markDirty() {
    setDirty(true);
  }

  function handleClientChange(id: string) {
    setClientId(id);
    markDirty();
    if (!supportItemTouched) {
      const p = activeParticipants.find((x) => x.id === id);
      setSupportItemCode(p?.defaultSupportItemCode ?? DEFAULT_SUPPORT_ITEM_CODE);
    }
  }

  const selectedParticipant = activeParticipants.find((p) => p.id === clientId);

  const splitResult = useMemo(
    () =>
      calculateShiftSplit(
        {
          shiftDate,
          startTime,
          endTime,
          travelKms: Number(travelKms) || 0,
          supportItemCode,
          clientHourlyRateAgreed: selectedParticipant?.hourlyRateAgreed ?? null,
          publicHolidayMode: holidayMode,
          businessState,
        },
        businessTimezone
      ),
    [shiftDate, startTime, endTime, travelKms, supportItemCode, selectedParticipant, holidayMode, businessState, businessTimezone]
  );

  const isOvernightHint = endTime <= startTime;

  function validateLocal(): boolean {
    const errs: Record<string, string> = {};
    const parsed = shiftFormSchema.safeParse({
      clientId,
      shiftDate,
      startTime,
      endTime,
      travelKms: Number(travelKms) || 0,
      supportItemCode,
      caseNotes,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errs[String(issue.path[0])] = issue.message;
      }
    }

    const today = todayInTz(businessTimezone);
    if (shiftDate > today) errs.shiftDate = "You can't log a shift in the future.";
    const ninetyDaysAgo = DateTime.fromISO(today).minus({ days: 90 }).toISODate()!;
    if (shiftDate < ninetyDaysAgo) errs.shiftDate = 'Shifts can only be logged up to 90 days back.';
    if (startTime === endTime) errs.endTime = 'End time must be after start time.';
    if (splitResult.totalHours > 16) errs.endTime = "A shift can't be longer than 16 hours.";
    if (splitResult.errors.length > 0) errs.travelKms = splitResult.errors[0];

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLocal()) return;

    const basePayload = {
      shiftDate,
      startTime,
      endTime,
      travelKms: Number(travelKms) || 0,
      caseNotes: caseNotes || undefined,
      isPublicHoliday: holidayMode === 'AUTO' ? null : holidayMode === 'FORCE_ON',
      supportItemCode,
    };

    if (mode === 'create') {
      onSubmit({ clientId, ...basePayload } as CreateShiftPayload, idempotencyKey.current);
    } else {
      onSubmit(basePayload as UpdateShiftPayload, idempotencyKey.current);
    }
  }

  const mergedErrors: Record<string, string> = {
    ...fieldErrors,
    ...Object.fromEntries(Object.entries(serverFieldErrors ?? {}).map(([k, v]) => [k, v?.[0] ?? ''])),
  };

  const submitLabel = isSubmitting
    ? 'Saving…'
    : mode === 'create'
    ? `Save Shift (${formatAud(splitResult.totalAmount)})`
    : `Save Changes (${formatAud(splitResult.totalAmount)})`;

  const budgetErrorLine =
    selectedParticipant && (selectedParticipant as any).budgetLevel === 'EXHAUSTED'
      ? `This exceeds ${selectedParticipant.participantName}'s allocated budget.`
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {serverError && (
        <p role="alert" className="rounded-card bg-error-bg border border-error-border px-3 py-2 text-body2 text-error">
          {serverError}
        </p>
      )}

      <div>
        <label className="mb-1 block text-body2 text-text-secondary">Participant</label>
        {mode === 'edit' ? (
          <>
            <Select value={clientId} disabled>
              <option value={clientId}>{initialShift?.clientName}</option>
            </Select>
            <p className="mt-1 text-caption text-text-muted">
              Participant cannot be changed — cancel and re-log the shift instead.
            </p>
          </>
        ) : (
          <Select
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            error={mergedErrors.clientId}
          >
            <option value="" disabled>
              Select participant…
            </option>
            {activeParticipants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.participantName}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">Date <AiBadge field="shiftDate" /></label>
          <Input
            type="date"
            value={shiftDate}
            onChange={(e) => {
              setShiftDate(e.target.value);
              clearAiBadge('shiftDate');
              markDirty();
            }}
            error={mergedErrors.shiftDate}
          />
        </div>
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">Start Time <AiBadge field="startTime" /></label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              clearAiBadge('startTime');
              markDirty();
            }}
            error={mergedErrors.startTime}
          />
        </div>
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">End Time <AiBadge field="endTime" /></label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              clearAiBadge('endTime');
              markDirty();
            }}
            error={mergedErrors.endTime}
          />
        </div>
      </div>

      {isOvernightHint && (
        <Badge tone="info">Crosses midnight — will be split at 12:00 AM</Badge>
      )}

      <div>
        <label className="mb-1 block text-body2 text-text-secondary">Activity-Based Transport (km) <AiBadge field="travelKms" /></label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          max={500}
          step={0.1}
          value={travelKms}
          onChange={(e) => {
            setTravelKms(e.target.value);
            clearAiBadge('travelKms');
            markDirty();
          }}
          error={mergedErrors.travelKms}
        />
      </div>

      <div>
        <label className="mb-1 block text-body2 text-text-secondary">Default Support Category</label>
        <Select
          value={supportItemCode}
          onChange={(e) => {
            setSupportItemCode(e.target.value);
            setSupportItemTouched(true);
            markDirty();
          }}
          error={mergedErrors.supportItemCode}
        >
          {SUPPORT_ITEMS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-body2 text-text-secondary">Public Holiday</label>
        <div className="flex gap-2">
          {(
            [
              ['AUTO', 'Auto'],
              ['FORCE_ON', 'Public holiday'],
              ['FORCE_OFF', 'Normal day'],
            ] as [PublicHolidayMode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setHolidayMode(value);
                markDirty();
              }}
              className={`min-h-[44px] flex-1 rounded-card border px-2 text-body2 ${
                holidayMode === value
                  ? 'border-brand bg-brand-bg text-brand-light'
                  : 'border-border bg-input text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-body2 text-text-secondary">Case Notes <AiBadge field="caseNotes" /></label>
        <Textarea
          rows={4}
          maxLength={2000}
          value={caseNotes}
          onChange={(e) => {
            setCaseNotes(e.target.value);
            clearAiBadge('caseNotes');
            markDirty();
          }}
          error={mergedErrors.caseNotes}
        />
        {caseNotes.length > 1500 && (
          <p className="mt-1 text-caption text-text-muted">{caseNotes.length} / 2000</p>
        )}
      </div>

      <SplitPreview result={splitResult} hasEnteredTimes={Boolean(startTime && endTime)} budgetErrorLine={budgetErrorLine} />

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-surface px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="secondary" className="flex-1 sm:flex-none" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1 sm:flex-none"
          isLoading={isSubmitting}
          disabled={isSubmitting || splitResult.errors.length > 0}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
