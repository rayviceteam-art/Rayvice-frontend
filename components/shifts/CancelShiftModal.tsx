'use client';
import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { shiftsService } from '@/lib/shifts-service';
import { useToast } from '@/lib/toast-context';
import { getApiErrorMessage } from '@/lib/api-client';

export function CancelShiftModal({
  shiftId,
  isOpen,
  onClose,
  onCancelled,
}: {
  shiftId: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await shiftsService.cancel(shiftId);
      showToast('Shift cancelled.', 'success');
      onCancelled();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel this shift?" panelClassName="max-w-sm">
      <div className="p-4">
        <p className="text-body2 text-text-secondary">
          The shift will be removed from your uninvoiced totals but kept in your records for audit. This cannot be
          undone from the app.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep shift
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isSubmitting}>
            Cancel shift
          </Button>
        </div>
      </div>
    </Modal>
  );
}
