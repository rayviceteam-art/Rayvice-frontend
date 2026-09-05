'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * Shared upgrade/limit experience. Module 3 reuses this for the trial
 * participant limit (spec §19) rather than showing a generic error - the
 * same modal is expected to be reused by other modules that hit plan
 * limits, so its copy is kept generic via props.
 */
export function UpgradeModal({
  isOpen,
  onClose,
  title = 'Free trial limit reached',
  description = 'Your free trial allows 1 active participant. Upgrade to continue adding participants.',
}: UpgradeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={() => (window.location.href = '/settings/billing')}>Upgrade Plan</Button>
        </>
      }
    >
      <p className="text-body2 text-text-secondary">{description}</p>
    </Modal>
  );
}
