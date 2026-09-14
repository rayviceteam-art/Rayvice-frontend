'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Loader2, X } from 'lucide-react';

type RecorderState = 'idle' | 'requesting' | 'recording' | 'processing' | 'denied' | 'error';
type DeniedReason = 'none' | 'permission' | 'no-device' | 'in-use' | 'unsupported' | 'refresh';

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
const MAX_SECONDS = 60;
const MAX_BYTES = 5 * 1024 * 1024;
const CONSENT_KEY = '_rvVoiceConsent';

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

export interface VoiceRecorderProps {
  onResult: (blob: Blob) => Promise<void> | void;
  onErrorMessage: (message: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onResult, onErrorMessage, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [showConsent, setShowConsent] = useState(false);
  const [deniedReason, setDeniedReason] = useState<DeniedReason>('none');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => stopTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function hasConsented(): boolean {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(CONSENT_KEY) === '1';
  }

  async function beginFlow() {
    if (!hasConsented()) {
      setShowConsent(true);
      return;
    }
    await startRecording();
  }

  function acceptConsent() {
    window.sessionStorage.setItem(CONSENT_KEY, '1');
    setShowConsent(false);
    void startRecording();
  }

  async function startRecording() {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void finishRecording();

      recorder.start();
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) stopRecording();
          return next;
        });
      }, 1000);
    } catch (err) {
      const name = (err as DOMException)?.name ?? '';
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        setDeniedReason('permission');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setDeniedReason('no-device');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setDeniedReason('in-use');
      } else if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setDeniedReason('unsupported');
      } else {
        setDeniedReason('permission');
      }
      setState('denied');
      stopTracks();
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    stopTracks();
  }

  function cancelRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    stopTracks();
    chunksRef.current = [];
    setState('idle');
  }

  async function finishRecording() {
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];
    if (blob.size === 0) {
      setState('idle');
      return;
    }
    if (blob.size > MAX_BYTES) {
      onErrorMessage('Recording is too long — please keep it under 60 seconds.');
      setState('idle');
      return;
    }
    setState('processing');
    try {
      await onResult(blob);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {showConsent && (
        <div className="absolute right-0 top-12 z-10 w-72 rounded-card border border-border bg-elevated p-3 text-caption text-text-secondary shadow-card">
          <p>Voice is processed by AI to fill the form. Review before saving.</p>
          <button onClick={acceptConsent} className="mt-2 text-brand-light">
            Got it
          </button>
        </div>
      )}

      {state === 'idle' && (
        <button
          type="button"
          title="Tap to speak shift details"
          disabled={disabled}
          onClick={beginFlow}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-background disabled:opacity-50"
        >
          <Mic className="h-5 w-5" />
        </button>
      )}

      {state === 'requesting' && (
        <div className="flex h-11 items-center gap-2 rounded-full bg-elevated px-3 text-caption text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" /> Requesting microphone…
        </div>
      )}

      {state === 'recording' && (
        <div
          aria-live="polite"
          className="flex h-11 items-center gap-2 rounded-full bg-error px-3 text-caption text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse"
        >
          <span>Recording… {seconds >= 45 ? `0:${String(MAX_SECONDS - seconds).padStart(2, '0')} left` : `0:${String(seconds).padStart(2, '0')}`}</span>
          <button type="button" onClick={stopRecording} className="rounded bg-white/20 px-2">
            Stop
          </button>
          <button type="button" onClick={cancelRecording} aria-label="Cancel recording">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex h-11 items-center gap-2 rounded-full bg-elevated px-3 text-caption text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" /> Transcribing…
        </div>
      )}

      {state === 'denied' && (
        <div className="text-caption text-warning">
          {deniedReason === 'in-use'
            ? 'Another app is using your microphone. Close that app, then tap Retry.'
            : deniedReason === 'no-device'
              ? 'No microphone was found on your device. Type the shift instead.'
              : deniedReason === 'unsupported'
                ? 'Your browser does not support microphone access here. Type the shift instead.'
                : 'Microphone access is blocked. Allow it in your browser settings, or type the shift instead.'}
          <button className="ml-2 text-brand-light" onClick={() => setState('idle')}>
            Retry
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="text-caption text-error">
          Voice service timed out — please type the shift details.
          <button className="ml-2 text-brand-light" onClick={() => setState('idle')}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
