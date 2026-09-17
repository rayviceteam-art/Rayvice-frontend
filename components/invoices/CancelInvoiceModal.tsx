'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/lib/types';
import { invoicesService } from '@/lib/invoices-service';
import { getApiErrorMessage } from '@/lib/api-client';

interface CancelInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleCancelInvoice = async () => {
    setIsSubmitting(true);
    try {
      await invoicesService.cancel(invoice.id);
      toast.success('Invoice cancelled — shifts released back to uninvoiced.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel invoice.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel this invoice?"
      description="The shifts on this invoice will be released back to uninvoiced so you can generate a corrected invoice. This cannot be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep Invoice
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelInvoice}
            disabled={isSubmitting}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
          >
            {isSubmitting ? 'Cancelling…' : 'Cancel Invoice'}
          </Button>
        </>
      }
    >
      <div className="rounded-card border border-border bg-input p-3 space-y-1">
        <p className="text-body2 text-text-primary font-medium">
          Invoice: <span className="font-mono text-brand">{invoice.invoiceNumber}</span>
        </p>
        <p className="text-caption text-text-secondary">
          Participant: {invoice.clientName} ({invoice.ndisNumber})
        </p>
      </div>
    </Modal>
  );
};
