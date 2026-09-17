import React from 'react';
import { InvoiceStatus } from '@/lib/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'DRAFT':
        return 'text-[#F59E0B] bg-[#2A210B] border-[#92400E]';
      case 'SENT':
        return 'text-[#5EE0C1] bg-[#0D332D] border-[#117A65]';
      case 'PAID':
        return 'text-[#22C55E] bg-[#0B2B1B] border-[#166534]';
      case 'REJECTED':
        return 'text-[#EF4444] bg-[#2B1010] border-[#991B1B]';
      case 'CANCELLED':
        return 'text-[#9AA9A5] bg-[#182122] border-[#253130]';
      default:
        return 'text-[#9AA9A5] bg-[#182122] border-[#253130]';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'SENT':
        return 'Sent';
      case 'PAID':
        return 'Paid';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-wide ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
