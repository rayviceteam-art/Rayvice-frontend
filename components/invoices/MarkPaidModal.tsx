'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/lib/types';
import { invoicesService } from '@/lib/invoices-service';
import { formatAud } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';

interface MarkPaidModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [paidAt, setPaidAt] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await invoicesService.markPaid(invoice.id, {
        paidAt,
        amount: invoice.totalAmount,
      });
      toast.success('Invoice marked as paid.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark invoice as paid.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark this invoice as paid?"
      description={`Record payment confirmation for invoice ${invoice.invoiceNumber}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#16A085] hover:bg-[#1DB89A] text-white"
          >
            {isSubmitting ? 'Saving…' : 'Mark as Paid'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-card border border-border bg-input p-3 space-y-1">
          <span className="text-caption text-text-secondary">Amount Due</span>
          <p className="font-mono text-xl font-bold text-[#22C55E]">
            {formatAud(invoice.totalAmount)}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="paid-date-input" className="text-body2 text-text-secondary">
            Paid date
          </label>
          <input
            id="paid-date-input"
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            required
            className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
