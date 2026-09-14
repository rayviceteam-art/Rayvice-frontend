'use client';
import { Modal, Button } from '@/components/ui';

export type VoiceGateReason = 'TRIAL_VOICE_LIMIT_REACHED' | 'VOICE_PLAN_REQUIRED' | 'TRIAL_EXPIRED';

const COPY: Record<VoiceGateReason, { title: string; body: string }> = {
  TRIAL_VOICE_LIMIT_REACHED: {
    title: 'Voice trial limit reached',
    body: 'Your trial includes 3 voice transcriptions. Upgrade to keep using voice logging.',
  },
  VOICE_PLAN_REQUIRED: {
    title: 'Voice AI is a Pro feature',
    body: 'Upgrade to Pro to use voice logging.',
  },
  TRIAL_EXPIRED: {
    title: 'Your trial has ended',
    body: 'Subscribe to continue logging shifts.',
  },
};

export function VoiceUpgradeModal({
  reason,
  isOpen,
  onClose,
  onUpgrade,
}: {
  reason: VoiceGateReason | null;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  if (!reason) return null;
  const copy = COPY[reason];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={copy.title} panelClassName="max-w-sm">
      <div className="p-4">
        <p className="text-body2 text-text-secondary">{copy.body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
          <Button variant="primary" onClick={onUpgrade}>
            Upgrade
          </Button>
        </div>
      </div>
    </Modal>
  );
}
