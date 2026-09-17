'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/lib/types';
import { invoicesService } from '@/lib/invoices-service';
import { getApiErrorMessage } from '@/lib/api-client';

interface RejectInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RejectInvoiceModal: React.FC<RejectInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3 || reason.trim().length > 500) {
      toast.error('Reason must be between 3 and 500 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await invoicesService.reject(invoice.id, reason.trim());
      toast.success('Rejection recorded.');
      setReason('');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to record rejection.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record a rejection"
      description="Plan managers reject invoices for a reason — save it so you can fix and re-issue."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 3}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
          >
            {isSubmitting ? 'Saving…' : 'Save Rejection'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="rejection-reason-input" className="text-body2 text-text-secondary">
            Reason (3–500 characters)
          </label>
          <textarea
            id="rejection-reason-input"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Plan manager reported invalid support item code or client budget depleted."
            maxLength={500}
            required
            className="w-full rounded-input border border-border bg-input p-3 text-body2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none resize-none"
          />
          <div className="flex justify-between text-caption text-text-muted">
            <span>Minimum 3 characters</span>
            <span>{reason.length} / 500</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
