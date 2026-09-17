'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import { Invoice } from '@/lib/types';

interface InvoiceActionsMenuProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onViewPdf: (invoice: Invoice) => void;
  onResend?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onReject?: (invoice: Invoice) => void;
  onCancel?: (invoice: Invoice) => void;
  canCancel?: boolean;
}

export const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
  invoice,
  onView,
  onViewPdf,
  onResend,
  onMarkPaid,
  onReject,
  onCancel,
  canCancel = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const { status } = invoice;
  const canResend = status === 'DRAFT' || status === 'SENT' || status === 'PAID';
  const canMarkPaid = status === 'SENT';
  const canReject = status === 'SENT';
  const allowCancel = canCancel && (status === 'DRAFT' || status === 'SENT');

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        aria-label="Invoice actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-44 origin-top-right rounded-card border border-border bg-surface shadow-card py-1 text-caption text-text-primary focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onView(invoice);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors"
          >
            <Eye size={14} className="text-text-secondary" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onViewPdf(invoice);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors"
          >
            <FileText size={14} className="text-text-secondary" />
            <span>View PDF</span>
          </button>

          {canResend && onResend && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onResend(invoice);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors text-[#5EE0C1]"
            >
              <Send size={14} />
              <span>Resend Invoice</span>
            </button>
          )}

          {canMarkPaid && onMarkPaid && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onMarkPaid(invoice);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors text-[#22C55E]"
            >
              <CheckCircle2 size={14} />
              <span>Mark as Paid</span>
            </button>
          )}

          {canReject && onReject && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onReject(invoice);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors text-[#EF4444]"
            >
              <XCircle size={14} />
              <span>Record Rejection</span>
            </button>
          )}

          {allowCancel && onCancel && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onCancel(invoice);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors text-[#EF4444] border-t border-border"
            >
              <Ban size={14} />
              <span>Cancel Invoice</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
