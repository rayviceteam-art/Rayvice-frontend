'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { VoiceShiftParser, type VoicePrefillPayload } from '@/components/shifts/VoiceShiftParser';
import { shiftsService } from '@/lib/shifts-service';
import { clientsService, toParticipantOptions } from '@/lib/clients-service';
import { getBusinessProfile, timezoneForState } from '@/lib/business-service';
import { useToast } from '@/lib/toast-context';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client';
import type { CreateShiftPayload, ParticipantOption } from '@/lib/types';

export default function NewShiftContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get('clientId') ?? undefined;
  const { showToast } = useToast();

  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [businessState, setBusinessState] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  // Voice entry (same flow as the ShiftModal header): mic must exist on this
  // page too — previously the main "Log Shift" path had no microphone at all.
  const [transcript, setTranscript] = useState<string | null>(null);
  const [voicePrefill, setVoicePrefill] = useState<VoicePrefillPayload | undefined>(undefined);

  useEffect(() => {
    clientsService
      .list({ isActive: true, pageSize: 100 })
      .then((res) => setParticipants(toParticipantOptions(res.data)))
      .catch(() => {});
    // Business state drives the rate-tier timezone (backend mirrors state -> timezone).
    getBusinessProfile()
      .then((p) => setBusinessState(p.state ?? null))
      .catch(() => {});
  }, []);

  async function handleSubmit(payload: CreateShiftPayload, idempotencyKey: string) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    try {
      await shiftsService.create(payload, idempotencyKey);
      showToast('Shift logged successfully.', 'success');
      router.push('/shifts');
    } catch (err) {
      setServerError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) ?? {});
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Log a shift" subtitle="15-second entry with live NDIA auto-split">
      <Card>
        <div className="flex items-center justify-end border-b border-border px-4 py-3">
          <VoiceShiftParser
            onPrefill={setVoicePrefill}
            onTranscript={setTranscript}
            disabled={isSubmitting}
          />
        </div>

        {transcript && (
          <p className="border-b border-border px-4 py-2 text-caption italic text-text-muted">Heard: &quot;{transcript}&quot;</p>
        )}

        <ShiftForm
          mode="create"
          participants={participants}
          defaultClientId={defaultClientId}
          businessTimezone={timezoneForState(businessState)}
          businessState={businessState}
          isSubmitting={isSubmitting}
          serverError={serverError}
          serverFieldErrors={fieldErrors}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/shifts')}
          voicePrefill={voicePrefill}
        />
      </Card>
    </AppLayout>
  );
}
