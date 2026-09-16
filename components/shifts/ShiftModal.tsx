'use client';
import type { VoicePrefillPayload } from './VoiceShiftParser';
import { useEffect, useRef, useState } from 'react';
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

  // Back-button fix: the modal adds no history entry by itself, so Android /
  // browser Back while the Shift entry form is open pops the previous page —
  // stale histories land on /login. Push a same-URL entry on open instead:
  // Back then only closes the form and the user stays on the Dashboard.
  // Manual close (X / Cancel / Save) drops the extra entry again, so later
  // Back presses behave exactly as before. Nothing else changes.
  const closeRef = useRef({ onClose, requestClose });
  closeRef.current = { onClose, requestClose };
  const openHrefRef = useRef('');
  const entryPushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.history) return;
    openHrefRef.current = window.location.href;
    window.history.pushState({ rayviceShiftModal: true }, '');
    entryPushedRef.current = true;
    const handlePopState = () => {
      // System Back while open: the browser already popped our entry, so
      // only close the form — no navigation, never /login.
      entryPushedRef.current = false;
      closeRef.current.requestClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (entryPushedRef.current) {
        entryPushedRef.current = false;
        // Same page still showing: remove the extra entry so a later Back
        // does not stop on a dead same-URL entry. If the user already
        // navigated elsewhere, leave the stack untouched.
        if (window.location.href === openHrefRef.current) {
          window.history.back();
        }
      }
    };
  }, [isOpen]);

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
