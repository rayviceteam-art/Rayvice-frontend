'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/lib/types';
import { invoicesService } from '@/lib/invoices-service';
import { getApiErrorMessage } from '@/lib/api-client';

interface ResendInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResendInvoiceModal: React.FC<ResendInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [overrideEmail, setOverrideEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const defaultRecipient = invoice.recipientEmail || invoice.planManagerEmail || 'Registered claims email';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await invoicesService.resend(invoice.id, overrideEmail.trim() || undefined);
      toast.success('Invoice resent.');
      setOverrideEmail('');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to resend invoice.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resend this invoice?"
      description={`An email with the compliant tax invoice PDF attached will be dispatched.`}
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
            {isSubmitting ? 'Resending…' : 'Resend Invoice'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-card border border-border bg-input p-3 space-y-1 text-xs">
          <span className="text-text-secondary">Default Recipient:</span>
          <p className="font-mono text-text-primary font-medium">{defaultRecipient}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="resend-override-email" className="text-body2 text-text-secondary">
            Send to a different email (optional)
          </label>
          <input
            id="resend-override-email"
            type="email"
            value={overrideEmail}
            onChange={(e) => setOverrideEmail(e.target.value)}
            placeholder="claims@planmanager.com.au"
            className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
          />
          <p className="text-caption text-text-muted">
            Leave blank to send to the default recipient above.
          </p>
        </div>
      </form>
    </Modal>
  );
};
