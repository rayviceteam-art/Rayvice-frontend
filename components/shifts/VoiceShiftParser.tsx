'use client';
import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceUpgradeModal, type VoiceGateReason } from './VoiceUpgradeModal';
import { shiftsService } from '@/lib/shifts-service';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-client';
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
  const [gateReason, setGateReason] = useState<VoiceGateReason | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const versionRef = useState({ n: 0 })[0];

  async function handleRecording(blob: Blob) {
    setErrorMessage(null);
    const form = new FormData();
    form.append('file', blob, 'shift.webm');

    try {
      const result: VoiceParseResult = await shiftsService.voiceParse(form);
      onTranscript(result.transcriptPreview.slice(0, 300));
      versionRef.n += 1;
      onPrefill({
        version: versionRef.n,
        clientId: result.matchedClientId,
        shiftDate: result.parsed.shiftDate,
        startTime: result.parsed.startTime,
        endTime: result.parsed.endTime,
        travelKms: result.parsed.travelKms,
        caseNotes: result.parsed.caseNotes,
        missingFields: result.parsed.missingFields,
      });
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
      {errorMessage && <p className="mt-1 text-caption text-error">{errorMessage}</p>}
      <VoiceUpgradeModal
        reason={gateReason}
        isOpen={gateReason != null}
        onClose={() => setGateReason(null)}
        onUpgrade={() => setGateReason(null)}
      />
    </div>
  );
}
