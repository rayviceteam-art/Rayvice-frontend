'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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

  // Field refs for voice missing-fields focus (Section 12, QA "Missing fields are focused").
  const clientFieldRef = useRef<HTMLSelectElement>(null);
  const dateFieldRef = useRef<HTMLInputElement>(null);
  const startFieldRef = useRef<HTMLInputElement>(null);
  const endFieldRef = useRef<HTMLInputElement>(null);
  const travelFieldRef = useRef<HTMLInputElement>(null);
  const notesFieldRef = useRef<HTMLTextAreaElement>(null);

  // Apply a new voice-parse result as a prefill (Section 12: voice never auto-saves).
  useEffect(() => {
    if (!voicePrefill || voicePrefill.version === lastVoiceVersion.current) return;
    lastVoiceVersion.current = voicePrefill.version;
    const filled = new Set<string>();
    // Never overwrite a field the worker already edited manually (§12.5).
    const canFill = (field: string) => !touchedRef.current.has(field);
    if (voicePrefill.clientId && canFill('clientId')) {
      setClientId(voicePrefill.clientId);
      filled.add('clientId');
    }
    if (voicePrefill.shiftDate && canFill('shiftDate')) {
      setShiftDate(voicePrefill.shiftDate);
      filled.add('shiftDate');
    }
    if (voicePrefill.startTime && canFill('startTime')) {
      setStartTime(voicePrefill.startTime);
      filled.add('startTime');
    }
    if (voicePrefill.endTime && canFill('endTime')) {
      setEndTime(voicePrefill.endTime);
      filled.add('endTime');
    }
    if (voicePrefill.travelKms != null && canFill('travelKms')) {
      setTravelKms(String(voicePrefill.travelKms));
      filled.add('travelKms');
    }
    if (voicePrefill.caseNotes && canFill('caseNotes')) {
      setCaseNotes(voicePrefill.caseNotes);
      filled.add('caseNotes');
    }
    setAiFields(filled);
    setDirty(true);

    // Focus the first still-missing field in form order so the worker can
    // complete the voice-drafted shift without hunting for gaps.
    const missing = new Set((voicePrefill.missingFields ?? []).map((f) => f.toLowerCase()));
    const isMissing = (...names: string[]) => names.some((n) => missing.has(n.toLowerCase()));
    const focusTarget =
      !voicePrefill.clientId || isMissing('clientid', 'clientfirstname', 'client')
        ? clientFieldRef.current
        : isMissing('shiftdate', 'date')
          ? dateFieldRef.current
          : isMissing('starttime', 'start')
            ? startFieldRef.current
            : isMissing('endtime', 'end')
              ? endFieldRef.current
              : isMissing('travelkms', 'travel')
                ? travelFieldRef.current
                : isMissing('casenotes', 'notes')
                  ? notesFieldRef.current
                  : null;
    if (focusTarget) {
      // Let the prefilled values paint first, then move focus.
      const timer = setTimeout(() => focusTarget.focus({ preventScroll: false }), 0);
      return () => clearTimeout(timer);
    }
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

  // Fields the worker has edited by hand in this session — voice prefill
  // must never overwrite them (§12.5).
  const touchedRef = useRef<Set<string>>(new Set());

  function markTouched(field: string) {
    touchedRef.current.add(field);
    markDirty();
  }

  function handleClientChange(id: string) {
    setClientId(id);
    markTouched('clientId');
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
    const keys = Object.keys(errs);
    if (keys.length > 0) {
      // §8.6: focus the first invalid field so the worker can fix it immediately.
      const refFor: Record<string, React.RefObject<HTMLElement | null>> = {
        clientId: clientFieldRef,
        shiftDate: dateFieldRef,
        startTime: startFieldRef,
        endTime: endFieldRef,
        travelKms: travelFieldRef,
        caseNotes: notesFieldRef,
      };
      const first = keys.map((k) => refFor[k]?.current).find(Boolean);
      if (first) setTimeout(() => first.focus(), 0);
      return false;
    }
    return true;
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
          <div>
            <Select
              ref={clientFieldRef}
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
            {activeParticipants.length === 0 && (
              <p className="mt-1 text-caption text-text-muted">
                No participants yet.{' '}
                <Link href="/clients/new" className="text-brand-light underline">
                  Add your first participant
                </Link>{' '}
                to log a shift.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">Date <AiBadge field="shiftDate" /></label>
          <Input
            ref={dateFieldRef}
            type="date"
            value={shiftDate}
            onChange={(e) => {
              setShiftDate(e.target.value);
              clearAiBadge('shiftDate');
              markTouched('shiftDate');
            }}
            error={mergedErrors.shiftDate}
          />
        </div>
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">Start Time <AiBadge field="startTime" /></label>
          <Input
            ref={startFieldRef}
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              clearAiBadge('startTime');
              markTouched('startTime');
            }}
            error={mergedErrors.startTime}
          />
        </div>
        <div>
          <label className="mb-1 block text-body2 text-text-secondary">End Time <AiBadge field="endTime" /></label>
          <Input
            ref={endFieldRef}
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              clearAiBadge('endTime');
              markTouched('endTime');
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
          ref={travelFieldRef}
          type="number"
          inputMode="decimal"
          min={0}
          max={500}
          step={0.1}
          value={travelKms}
          onChange={(e) => {
            setTravelKms(e.target.value);
            clearAiBadge('travelKms');
            markTouched('travelKms');
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
          ref={notesFieldRef}
          rows={4}
          maxLength={2000}
          value={caseNotes}
          onChange={(e) => {
            setCaseNotes(e.target.value);
            clearAiBadge('caseNotes');
            markTouched('caseNotes');
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
