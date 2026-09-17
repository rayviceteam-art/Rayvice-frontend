'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, ShieldAlert, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { invoicesService } from '@/lib/invoices-service';
import { clientsService } from '@/lib/clients-service';
import {
  ClientListItem,
  Invoice,
  InvoiceStatus,
  InvoiceListResponse,
} from '@/lib/types';
import { InvoiceFilters, InvoiceFiltersValue } from '@/components/invoices/InvoiceFilters';
import { InvoiceSummaryStrip } from '@/components/invoices/InvoiceSummaryStrip';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { InvoicePDFViewer } from '@/components/invoices/InvoicePDFViewer';
import { MarkPaidModal } from '@/components/invoices/MarkPaidModal';
import { RejectInvoiceModal } from '@/components/invoices/RejectInvoiceModal';
import { CancelInvoiceModal } from '@/components/invoices/CancelInvoiceModal';
import { ResendInvoiceModal } from '@/components/invoices/ResendInvoiceModal';

const STATUS_TABS: Array<{ label: string; value: InvoiceStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function InvoicesDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { can } = useAuth();

  const isTechnician = !can('OWNER', 'OFFICE_MANAGER');
  const canCancel = can('OWNER');

  // Query params and filter state
  const initialStatus = (searchParams.get('status') as InvoiceStatus) || 'ALL';
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'ALL'>(
    STATUS_TABS.some((t) => t.value === initialStatus) ? initialStatus : 'ALL'
  );

  const [filters, setFilters] = useState<InvoiceFiltersValue>({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    clientId: searchParams.get('clientId') || '',
  });

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [data, setData] = useState<InvoiceListResponse>({
    items: [],
    pagination: {
      page: 1,
      pageSize: 20,
      totalRecords: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    summary: {
      totalAmount: 0,
      count: 0,
      outstandingAmount: 0,
      paidAmount: 0,
    },
  });

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);

  // Fetch active clients for the participant filter dropdown
  useEffect(() => {
    if (isTechnician) return;
    clientsService
      .list({ page: 1, pageSize: 100, isActive: true })
      .then((res) => setClients(res.data))
      .catch(() => {
        // Fallback silently if clients cannot be loaded
      });
  }, [isTechnician]);

  const fetchInvoices = useCallback(
    async (currentPage: number) => {
      if (isTechnician) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await invoicesService.list({
          page: currentPage,
          pageSize: 20,
          status: activeTab === 'ALL' ? undefined : activeTab,
          clientId: filters.clientId || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          sort: 'issueDate',
          order: 'desc',
        });
        setData(response);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load invoices. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isTechnician, activeTab, filters]
  );

  useEffect(() => {
    fetchInvoices(page);
  }, [fetchInvoices, page]);

  // Tab change resets page to 1
  const handleTabChange = (tab: InvoiceStatus | 'ALL') => {
    setActiveTab(tab);
    setPage(1);
    const params = new URLSearchParams();
    if (tab !== 'ALL') params.set('status', tab);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.clientId) params.set('clientId', filters.clientId);
    const qs = params.toString();
    router.replace(`/invoices${qs ? `?${qs}` : ''}`);
  };

  // Filter change resets page to 1
  const handleFiltersChange = (newFilters: InvoiceFiltersValue) => {
    setFilters(newFilters);
    setPage(1);
    const params = new URLSearchParams();
    if (activeTab !== 'ALL') params.set('status', activeTab);
    if (newFilters.from) params.set('from', newFilters.from);
    if (newFilters.to) params.set('to', newFilters.to);
    if (newFilters.clientId) params.set('clientId', newFilters.clientId);
    const qs = params.toString();
    router.replace(`/invoices${qs ? `?${qs}` : ''}`);
  };

  const handleClearFilters = () => {
    handleFiltersChange({ from: '', to: '', clientId: '' });
  };

  if (isTechnician) {
    return (
      <AppLayout
        title="Tax Invoices"
        subtitle="Compliant NDIS invoices and dispatch status"
      >
        <div className="rounded-card border border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3 mt-8">
          <ShieldAlert className="h-10 w-10 text-[#F59E0B] mx-auto" />
          <h3 className="text-h4 font-bold text-text-primary">
            Invoices are owner/office-manager only
          </h3>
          <p className="text-body2 text-text-secondary">
            Ask your business owner for access.
          </p>
        </div>
      </AppLayout>
    );
  }

  const hasFiltersApplied =
    activeTab !== 'ALL' || filters.from !== '' || filters.to !== '' || filters.clientId !== '';

  return (
    <AppLayout
      title="Tax Invoices"
      subtitle="Compliant NDIS invoices and dispatch status"
    >
      <div className="flex flex-col gap-6">
        {/* Heading Row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 text-text-primary">Tax Invoices</h1>
            <p className="text-body2 text-text-secondary">
              Compliant NDIS invoices and dispatch status
            </p>
          </div>
          <Link href="/invoices/generate">
            <Button className="flex items-center gap-1.5 shadow-glow">
              <Plus size={16} />
              + Generate Invoice
            </Button>
          </Link>
        </div>

        {/* Status Tabs (Segmented Control) */}
        <div className="flex flex-col gap-1.5">
          <div
            role="radiogroup"
            aria-label="Invoice status filter"
            className="inline-flex w-full overflow-x-auto rounded border border-border bg-input p-1 sm:w-auto"
          >
            {STATUS_TABS.map((tab) => {
              const isSelected = tab.value === activeTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleTabChange(tab.value)}
                  className={`flex-1 whitespace-nowrap rounded px-4 py-1.5 text-body2 font-medium transition-colors sm:flex-none ${
                    isSelected
                      ? 'bg-brand text-background'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <InvoiceFilters
          value={filters}
          onChange={handleFiltersChange}
          clients={clients}
        />

        {/* Summary Strip */}
        <InvoiceSummaryStrip summary={data.summary} isLoading={isLoading} />

        {/* Table / Skeleton / Empty / Error */}
        <InvoiceTable
          invoices={data.items}
          isLoading={isLoading}
          error={error}
          hasFiltersApplied={hasFiltersApplied}
          onClearFilters={handleClearFilters}
          onRetry={() => fetchInvoices(page)}
          onViewPdf={(inv) => {
            setSelectedInvoice(inv);
            setIsPdfModalOpen(true);
          }}
          onResend={(inv) => {
            setSelectedInvoice(inv);
            setIsResendOpen(true);
          }}
          onMarkPaid={(inv) => {
            setSelectedInvoice(inv);
            setIsMarkPaidOpen(true);
          }}
          onReject={(inv) => {
            setSelectedInvoice(inv);
            setIsRejectOpen(true);
          }}
          onCancel={(inv) => {
            setSelectedInvoice(inv);
            setIsCancelOpen(true);
          }}
          canManage={!isTechnician}
          canCancel={canCancel}
        />

        {/* Pagination */}
        {!error && !isLoading && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-body2 text-text-secondary">
              Page {page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setSelectedInvoice(null);
          }}
          maxWidth="2xl"
        >
          <InvoicePDFViewer
            invoiceId={selectedInvoice.id}
            invoiceNumber={selectedInvoice.invoiceNumber}
          />
        </Modal>
      )}

      {/* Mark Paid Modal */}
      <MarkPaidModal
        invoice={selectedInvoice}
        isOpen={isMarkPaidOpen}
        onClose={() => {
          setIsMarkPaidOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => fetchInvoices(page)}
      />

      {/* Reject Modal */}
      <RejectInvoiceModal
        invoice={selectedInvoice}
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => fetchInvoices(page)}
      />

      {/* Cancel Modal */}
      <CancelInvoiceModal
        invoice={selectedInvoice}
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => fetchInvoices(page)}
      />

      {/* Resend Modal */}
      <ResendInvoiceModal
        invoice={selectedInvoice}
        isOpen={isResendOpen}
        onClose={() => {
          setIsResendOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => fetchInvoices(page)}
      />
    </AppLayout>
  );
}

export default function InvoicesDirectoryPage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          title="Tax Invoices"
          subtitle="Compliant NDIS invoices and dispatch status"
        >
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-body2">Loading invoices…</p>
          </div>
        </AppLayout>
      }
    >
      <InvoicesDirectoryContent />
    </Suspense>
  );
}

