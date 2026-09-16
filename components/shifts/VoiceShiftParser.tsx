'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceUpgradeModal, type VoiceGateReason } from './VoiceUpgradeModal';
import { shiftsService } from '@/lib/shifts-service';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import type { VoiceParseResult } from '@/lib/types';

export interface VoicePrefillPayload {
  version: number;
  clientId?: string | null;
  shiftDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  travelKms?: number | null;
  caseNotes?: string | null;
  missingFields?: string[];
}

interface VoiceShiftParserProps {
  onPrefill: (payload: VoicePrefillPayload) => void;
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

const GATE_CODES: VoiceGateReason[] = ['TRIAL_VOICE_LIMIT_REACHED', 'VOICE_PLAN_REQUIRED', 'TRIAL_EXPIRED'];

export function VoiceShiftParser({ onPrefill, onTranscript, disabled }: VoiceShiftParserProps) {
  const router = useRouter();
  const [gateReason, setGateReason] = useState<VoiceGateReason | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewWarning, setReviewWarning] = useState(false);
  const { showToast } = useToast();
  const versionRef = useState({ n: 0 })[0];

  async function handleRecording(blob: Blob) {
    setErrorMessage(null);
    setReviewWarning(false);
    const form = new FormData();
    // The filename extension must match the recorded container: iOS Safari
    // records audio/mp4, Android/Chrome record audio/webm. A mismatched name
    // makes the transcription provider reject the upload.
    const extension = blob.type.includes('mp4') || blob.type.includes('m4a') || blob.type.includes('aac')
      ? 'mp4'
      : blob.type.includes('ogg')
        ? 'ogg'
        : blob.type.includes('mpeg')
          ? 'mp3'
          : blob.type.includes('wav')
            ? 'wav'
            : 'webm';
    form.append('file', blob, `shift.${extension}`);

    try {
      const result: VoiceParseResult = await shiftsService.voiceParse(form);
      onTranscript(result.transcriptPreview.slice(0, 300));
      versionRef.n += 1;
      onPrefill({
        version: versionRef.n,
        // §12.5: matched client, else the single candidate when unambiguous.
        clientId:
          result.matchedClientId ??
          (result.clientCandidates.length === 1 ? result.clientCandidates[0].id : null),
        shiftDate: result.parsed.shiftDate,
        startTime: result.parsed.startTime,
        endTime: result.parsed.endTime,
        travelKms: result.parsed.travelKms,
        caseNotes: result.parsed.caseNotes,
        missingFields: result.parsed.missingFields,
      });
      // §12.5: flag low-confidence / incomplete parses for review.
      if (result.parsed.confidence < 0.5 || (result.parsed.missingFields ?? []).length > 0) {
        setReviewWarning(true);
      }
      showToast('Voice captured — review the details before saving.', 'success');
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code && GATE_CODES.includes(code as VoiceGateReason)) {
        setGateReason(code as VoiceGateReason);
        return;
      }
      if (code === 'VOICE_TRANSCRIPT_UNUSABLE') {
        setErrorMessage("We couldn't understand the recording. Please try again or type the shift.");
        return;
      }
      setErrorMessage(getApiErrorMessage(err));
      throw err; // lets VoiceRecorder move to its own error state
    }
  }

  return (
    <div className="relative">
      <VoiceRecorder onResult={handleRecording} onErrorMessage={setErrorMessage} disabled={disabled} />
      {reviewWarning && !errorMessage && (
        <p className="mt-1 text-caption text-warning">Please check the highlighted fields before saving.</p>
      )}
      {errorMessage && <p className="mt-1 text-caption text-error">{errorMessage}</p>}
      <VoiceUpgradeModal
        reason={gateReason}
        isOpen={gateReason != null}
        onClose={() => setGateReason(null)}
        onUpgrade={() => {
          setGateReason(null);
          router.push('/settings/billing');
        }}
      />
    </div>
  );
}
