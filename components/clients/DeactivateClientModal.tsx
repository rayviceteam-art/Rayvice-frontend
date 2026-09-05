'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeactivateClientModalProps {
  isOpen: boolean;
  participantName: string;
  isDeactivating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Soft-delete confirmation (spec §29-30). Wording deliberately avoids any
 * implication of permanent destruction - the backend performs a soft
 * delete and historical shifts/invoices are preserved.
 */
export function DeactivateClientModal({
  isOpen,
  participantName,
  isDeactivating,
  onCancel,
  onConfirm,
}: DeactivateClientModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={`Deactivate ${participantName}?`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isDeactivating}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeactivating}>
            {isDeactivating ? 'Deactivating...' : 'Deactivate Participant'}
          </Button>
        </>
      }
    >
      <p className="text-body2 text-text-secondary">
        This participant will no longer appear in your active participant directory. Historical shifts and invoices
        are preserved.
      </p>
    </Modal>
  );
}
