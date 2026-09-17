import React from 'react';
import { formatAud } from '@/lib/format';

interface SummaryData {
  totalAmount: number;
  count: number;
  outstandingAmount: number;
  paidAmount: number;
}

interface InvoiceSummaryStripProps {
  summary: SummaryData;
  isLoading?: boolean;
}

export const InvoiceSummaryStrip: React.FC<InvoiceSummaryStripProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-4 animate-pulse">
        <div className="h-4 bg-elevated rounded w-3/4 max-w-md" />
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3 text-sm text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>
        Total <strong className="font-mono text-text-primary">{formatAud(summary.totalAmount)}</strong>
      </span>
      <span className="text-text-muted select-none">•</span>
      <span>
        <strong className="text-text-primary">{summary.count}</strong> {summary.count === 1 ? 'invoice' : 'invoices'}
      </span>
      <span className="text-text-muted select-none">•</span>
      <span>
        Outstanding <strong className="font-mono text-[#F59E0B]">{formatAud(summary.outstandingAmount)}</strong>
      </span>
      <span className="text-text-muted select-none">•</span>
      <span>
        Paid <strong className="font-mono text-[#22C55E]">{formatAud(summary.paidAmount)}</strong>
      </span>
    </div>
  );
};
