'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeactivateClientModalProps {
  isOpen: boolean;
  participantName: string;
  isDeactivating: boolean;
  pendingUninvoicedShiftsCount?: number;
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
  pendingUninvoicedShiftsCount = 0,
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
      <div className="space-y-3">
        {pendingUninvoicedShiftsCount > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-200">Pending Uninvoiced Shifts Warning:</strong>
              <p className="mt-0.5">
                This participant has{' '}
                <span className="font-bold underline">{pendingUninvoicedShiftsCount} unbilled shift{pendingUninvoicedShiftsCount === 1 ? '' : 's'}</span>{' '}
                pending in the queue. Deactivating them now may prevent these shifts from being invoiced or claimed.
              </p>
            </div>
          </div>
        )}
        <p className="text-body2 text-text-secondary">
          This participant will no longer appear in your active participant directory. Historical shifts and invoices
          are preserved.
        </p>
      </div>
    </Modal>
  );
}
