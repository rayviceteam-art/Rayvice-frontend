'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Invoice } from '@/lib/types';
import { formatAud, formatCalendarDate } from '@/lib/format';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActionsMenu } from './InvoiceActionsMenu';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  error?: string | null;
  hasFiltersApplied: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  onViewPdf: (invoice: Invoice) => void;
  onResend?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onReject?: (invoice: Invoice) => void;
  onCancel?: (invoice: Invoice) => void;
  canManage: boolean;
  canCancel: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices = [],
  isLoading,
  error,
  hasFiltersApplied,
  onClearFilters,
  onRetry,
  onViewPdf,
  onResend,
  onMarkPaid,
  onReject,
  onCancel,
  canManage,
  canCancel,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <Table>
        <Thead>
          <tr>
            <Th>Invoice #</Th>
            <Th>Participant</Th>
            <Th>Issued</Th>
            <Th>Due</Th>
            <Th>Lines</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <Tr key={i}>
              <Td>
                <Skeleton className="h-4 w-24" />
              </Td>
              <Td>
                <Skeleton className="h-4 w-32" />
              </Td>
              <Td>
                <Skeleton className="h-4 w-20" />
              </Td>
              <Td>
                <Skeleton className="h-4 w-20" />
              </Td>
              <Td>
                <Skeleton className="h-4 w-10" />
              </Td>
              <Td>
                <Skeleton className="h-4 w-20" />
              </Td>
              <Td>
                <Skeleton className="h-5 w-16 rounded-full" />
              </Td>
              <Td className="text-right">
                <Skeleton className="h-6 w-6 rounded ml-auto" />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-[#991B1B] bg-[#2B1010] px-6 py-16 text-center">
        <h3 className="text-h4 text-text-primary">Unable to load invoices</h3>
        <p className="text-body2 text-text-secondary">{error}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          <RefreshCw size={16} />
          Try Again
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-16 text-center">
        {hasFiltersApplied ? (
          <>
            <h3 className="text-h4 text-text-primary">No invoices match these filters</h3>
            <p className="text-body2 text-text-secondary">Try adjusting your date range or participant selection.</p>
            <Button variant="secondary" onClick={onClearFilters} className="mt-2">
              Clear filters
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-h4 text-text-primary">No invoices yet</h3>
            <p className="text-body2 text-text-secondary">
              Generate your first NDIS-compliant tax invoice from logged shifts.
            </p>
            {canManage && (
              <Link href="/invoices/generate" className="mt-2">
                <Button>
                  <Plus size={16} />
                  Generate Invoice
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Invoice #</Th>
          <Th>Participant</Th>
          <Th>Issued</Th>
          <Th>Due</Th>
          <Th>Lines</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          {canManage && <Th className="text-right">Actions</Th>}
        </tr>
      </Thead>
      <tbody>
        {invoices.map((inv) => (
          <Tr
            key={inv.id}
            onClick={() => router.push(`/invoices/${inv.id}`)}
            className="cursor-pointer hover:bg-elevated transition-colors"
          >
            <Td className="font-mono font-medium text-brand hover:underline">
              {inv.invoiceNumber}
            </Td>
            <Td>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{inv.clientName}</span>
                <span className="text-caption font-mono text-text-muted">
                  NDIS: {inv.ndisNumber}
                </span>
              </div>
            </Td>
            <Td className="text-text-secondary whitespace-nowrap">
              {formatCalendarDate(inv.issueDate)}
            </Td>
            <Td className="text-text-secondary whitespace-nowrap">
              {formatCalendarDate(inv.dueDate)}
            </Td>
            <Td className="text-text-secondary font-mono">{inv.shiftCount}</Td>
            <Td className="font-mono font-bold text-text-primary whitespace-nowrap">
              {formatAud(inv.totalAmount)}
            </Td>
            <Td>
              <InvoiceStatusBadge status={inv.status} />
            </Td>
            {canManage && (
              <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                <InvoiceActionsMenu
                  invoice={inv}
                  onView={() => router.push(`/invoices/${inv.id}`)}
                  onViewPdf={onViewPdf}
                  onResend={onResend}
                  onMarkPaid={onMarkPaid}
                  onReject={onReject}
                  onCancel={onCancel}
                  canCancel={canCancel}
                />
              </Td>
            )}
          </Tr>
        ))}
      </tbody>
    </Table>
  );
};
