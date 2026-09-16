'use client';
import type { VoicePrefillPayload } from './VoiceShiftParser';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '@/components/ui';
import { ShiftForm } from './ShiftForm';
import { shiftsService } from '@/lib/shifts-service';
import { clientsService, toParticipantOptions } from '@/lib/clients-service';
import { getBusinessProfile, timezoneForState } from '@/lib/business-service';
import { useToast } from '@/lib/toast-context';
import { getApiErrorMessage, getApiErrorCode, getApiFieldErrors } from '@/lib/api-client';
import type { CreateShiftPayload, ParticipantOption } from '@/lib/types';

export interface ShiftClientOption extends ParticipantOption {}

export interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients?: ShiftClientOption[];
  onShiftSaved?: () => void;
  defaultClientId?: string;
}

export function ShiftModal({ isOpen, onClose, clients, onShiftSaved, defaultClientId }: ShiftModalProps) {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState<ParticipantOption[]>(clients ?? []);
  const [businessState, setBusinessState] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [voicePrefill, setVoicePrefill] = useState<VoicePrefillPayload | undefined>(undefined);
  const [formKey, setFormKey] = useState(0); // bump to fully reset ShiftForm on open

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setFieldErrors({});
      setTranscript(null);
      setVoicePrefill(undefined);
      setFormKey((k) => k + 1); // never keep stale values from the previous shift
      if (!clients) {
        clientsService
          .list({ isActive: true, pageSize: 100 })
          .then((res) => setParticipants(toParticipantOptions(res.data)))
          .catch(() => {});
      } else {
        setParticipants(clients);
      }
      // Business state drives the rate-tier timezone (backend mirrors state -> timezone).
      getBusinessProfile()
        .then((p) => setBusinessState(p.state ?? null))
        .catch(() => {});
    }
  }, [isOpen, clients]);

  function requestClose() {
    if (isDirty) {
      setConfirmingDiscard(true);
    } else {
      onClose();
    }
  }

  async function handleSubmit(payload: CreateShiftPayload, idempotencyKey: string) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    try {
      await shiftsService.create(payload, idempotencyKey);
      showToast('Shift logged successfully.', 'success');
      onShiftSaved?.();
      onClose();
    } catch (err) {
      const code = getApiErrorCode(err);
      setServerError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) ?? {});
      if (code) {
        // handled generically via getApiErrorMessage; specific copy lives in Section 16 mapping.
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={requestClose} panelClassName="max-w-lg" flushOnMobile>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-card bg-brand-bg text-brand-light">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-h4 text-text-primary">Log NDIS Shift</h3>
              <p className="text-caption text-text-secondary">15-second entry with live NDIA auto-split</p>
            </div>
          </div>
        </div>

        <ShiftForm
          key={formKey}
          mode="create"
          participants={participants}
          defaultClientId={defaultClientId}
          businessTimezone={timezoneForState(businessState)}
          businessState={businessState}
          isSubmitting={isSubmitting}
          serverError={serverError}
          serverFieldErrors={fieldErrors}
          onSubmit={handleSubmit}
          onCancel={requestClose}
          onDirtyChange={setIsDirty}
          voicePrefill={voicePrefill}
        />
      </Modal>

      <Modal isOpen={confirmingDiscard} onClose={() => setConfirmingDiscard(false)} title="Discard unsaved shift?" panelClassName="max-w-sm">
        <div className="p-4">
          <p className="text-body2 text-text-secondary">Your changes will be lost.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="min-h-[44px] rounded-card border border-border px-4 text-body2 text-text-primary"
              onClick={() => setConfirmingDiscard(false)}
            >
              Keep editing
            </button>
            <button
              className="min-h-[44px] rounded-card bg-error px-4 text-body2 text-white"
              onClick={() => {
                setConfirmingDiscard(false);
                onClose();
              }}
            >
              Discard
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
