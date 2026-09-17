'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  ShieldAlert,
  Clock,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { invoicesService } from '@/lib/invoices-service';
import { getBusinessProfile } from '@/lib/business-service';
import { clientsService } from '@/lib/clients-service';
import {
  BusinessProfile,
  ClientDetailResponse,
  Invoice,
} from '@/lib/types';
import { formatAud, formatCalendarDate } from '@/lib/format';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { InvoicePDFViewer } from '@/components/invoices/InvoicePDFViewer';
import { MarkPaidModal } from '@/components/invoices/MarkPaidModal';
import { RejectInvoiceModal } from '@/components/invoices/RejectInvoiceModal';
import { CancelInvoiceModal } from '@/components/invoices/CancelInvoiceModal';
import { ResendInvoiceModal } from '@/components/invoices/ResendInvoiceModal';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can, user } = useAuth();

  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const isTechnician = !can('OWNER', 'OFFICE_MANAGER');
  const canCancel = can('OWNER');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [client, setClient] = useState<ClientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active modals
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);
  const [showInlinePdf, setShowInlinePdf] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id || isTechnician) return;
    setIsLoading(true);
    setError(null);
    try {
      const inv = await invoicesService.getById(id);
      setInvoice(inv);

      // Load client details for budget if available
      if (inv.clientId) {
        clientsService.getById(inv.clientId).then(setClient).catch(() => {});
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load invoice details.'));
    } finally {
      setIsLoading(false);
    }
  }, [id, isTechnician]);

  useEffect(() => {
    fetchInvoice();
    getBusinessProfile().then(setProfile).catch(() => {});
  }, [fetchInvoice]);

  if (isTechnician) {
    return (
      <AppLayout title="Invoice Detail" subtitle="Tax invoice details & compliance timeline">
        <div className="rounded-card border border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3 mt-8">
          <ShieldAlert className="h-10 w-10 text-[#F59E0B] mx-auto" />
          <h3 className="text-h4 font-bold text-text-primary">
            Invoices are owner/office-manager only
          </h3>
          <p className="text-body2 text-text-secondary">Ask your business owner for access.</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Invoice Detail" subtitle="Loading invoice data…">
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-body2">Loading invoice details…</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout title="Invoice Detail" subtitle="Error loading invoice">
        <div className="rounded-card border border-[#991B1B] bg-[#2B1010] p-8 text-center max-w-md mx-auto space-y-3 mt-8">
          <h3 className="text-h4 text-text-primary font-semibold">Unable to load invoice</h3>
          <p className="text-body2 text-text-secondary">{error || 'Invoice not found.'}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/invoices">
              <Button variant="secondary">Back to Invoices</Button>
            </Link>
            <Button onClick={fetchInvoice}>Try Again</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { status } = invoice;
  const isFinal = status === 'PAID' || status === 'CANCELLED';
  const isSent = status === 'SENT';
  const isDraft = status === 'DRAFT';
  const isNdia = invoice.planManagementType === 'NDIA_MANAGED';

  // Format timestamps
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`NDIS Compliant Tax Invoice for ${invoice.clientName}`}
    >
      <div className="max-w-4xl space-y-6 pb-20">
        {/* Block 1: Back Link */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          ← Back to Invoices
        </Link>

        {/* Block 2: Header Card */}
        <div className="rounded-card border border-border bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-h2 font-bold text-text-primary tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
              <Badge tone="brand">
                {invoice.planManagementType === 'PLAN_MANAGED'
                  ? 'Plan-Managed'
                  : invoice.planManagementType === 'SELF_MANAGED'
                  ? 'Self-Managed'
                  : 'NDIA-Managed'}
              </Badge>
            </div>

            <div className="text-body2 text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Participant: <strong className="text-text-primary">{invoice.clientName}</strong>
              </span>
              <span className="text-text-muted">•</span>
              <span className="font-mono text-caption">NDIS: {invoice.ndisNumber}</span>
              <span className="text-text-muted">•</span>
              <span>Issued: {formatCalendarDate(invoice.issueDate)}</span>
              <span className="text-text-muted">•</span>
              <span>Due: {formatCalendarDate(invoice.dueDate)}</span>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <span className="text-caption text-text-secondary uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="font-mono text-h2 font-bold text-brand block">
              {formatAud(invoice.totalAmount)}
            </span>
          </div>
        </div>

        {/* Block 3: Status Timeline */}
        <div className="rounded-card border border-border bg-surface p-6">
          <h3 className="text-body2 font-semibold text-text-primary mb-4">Invoice Lifecycle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
            {/* Step 1: Created */}
            <div className="rounded-card border border-[#117A65] bg-[#0D332D]/40 p-3 space-y-1">
              <div className="flex items-center gap-2 text-[#5EE0C1] font-semibold text-xs">
                <CheckCircle2 size={16} />
                <span>1. Created</span>
              </div>
              <p className="text-caption font-mono text-text-secondary">
                {formatTime(invoice.createdAt)}
              </p>
            </div>

            {/* Step 2: Dispatched / Sent */}
            <div
              className={`rounded-card border p-3 space-y-1 ${
                invoice.sentAt
                  ? 'border-[#117A65] bg-[#0D332D]/40'
                  : 'border-border bg-input opacity-70'
              }`}
            >
              <div
                className={`flex items-center gap-2 font-semibold text-xs ${
                  invoice.sentAt ? 'text-[#5EE0C1]' : 'text-text-muted'
                }`}
              >
                <Send size={16} />
                <span>2. Dispatched</span>
              </div>
              <p className="text-caption font-mono text-text-secondary">
                {invoice.sentAt ? formatTime(invoice.sentAt) : isNdia ? 'PRODA Manual Claim' : 'Pending dispatch'}
              </p>
            </div>

            {/* Step 3: Paid or Rejected or Cancelled */}
            <div
              className={`rounded-card border p-3 space-y-1 ${
                status === 'PAID'
                  ? 'border-[#166534] bg-[#0B2B1B]'
                  : status === 'REJECTED'
                  ? 'border-[#991B1B] bg-[#2B1010]'
                  : status === 'CANCELLED'
                  ? 'border-border bg-elevated'
                  : 'border-border bg-input opacity-70'
              }`}
            >
              <div
                className={`flex items-center gap-2 font-semibold text-xs ${
                  status === 'PAID'
                    ? 'text-[#22C55E]'
                    : status === 'REJECTED'
                    ? 'text-[#EF4444]'
                    : status === 'CANCELLED'
                    ? 'text-text-muted'
                    : 'text-text-muted'
                }`}
              >
                {status === 'PAID' && <CheckCircle2 size={16} />}
                {status === 'REJECTED' && <XCircle size={16} />}
                {status === 'CANCELLED' && <Ban size={16} />}
                {status !== 'PAID' && status !== 'REJECTED' && status !== 'CANCELLED' && (
                  <Clock size={16} />
                )}
                <span>
                  {status === 'PAID'
                    ? '3. Paid'
                    : status === 'REJECTED'
                    ? '3. Rejected'
                    : status === 'CANCELLED'
                    ? '3. Cancelled'
                    : '3. Awaiting Payment'}
                </span>
              </div>
              <p className="text-caption font-mono text-text-secondary">
                {status === 'PAID'
                  ? formatTime(invoice.paidAt)
                  : status === 'CANCELLED'
                  ? formatTime(invoice.cancelledAt)
                  : status === 'REJECTED'
                  ? invoice.rejectionReason || 'Rejection recorded'
                  : 'Remittance pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Block 4 & 5: Dispatch & Payee / Bank EFT Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dispatch Card */}
          <div className="rounded-card border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body2 font-semibold text-text-primary flex items-center gap-2">
                <Mail size={16} className="text-brand" />
                Dispatch Status
              </h3>
              {!isFinal && !isNdia && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsResendOpen(true)}
                  className="text-xs h-7"
                >
                  Resend
                </Button>
              )}
            </div>

            <div className="space-y-2 text-caption">
              <div>
                <span className="text-text-secondary block">To:</span>
                <span className="font-mono text-text-primary">
                  {isNdia
                    ? 'PRODA Myplace Portal (No email dispatched)'
                    : invoice.recipientEmail || invoice.planManagerEmail || 'Not configured'}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">BCC:</span>
                <span className="font-mono text-text-primary">
                  {profile?.email || user?.email || 'Registered business email'}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Sent Date:</span>
                <span className="font-mono text-text-primary">
                  {invoice.sentAt ? formatTime(invoice.sentAt) : 'Not sent yet'}
                </span>
              </div>
            </div>
          </div>

          {/* Payee / Bank EFT Details */}
          <div className="rounded-card border border-border bg-surface p-5 space-y-3">
            <h3 className="text-body2 font-semibold text-text-primary flex items-center gap-2">
              <CreditCard size={16} className="text-brand" />
              EFT Remittance Details
            </h3>

            <div className="space-y-1.5 text-caption">
              {invoice.planManagerAgencyName && (
                <div>
                  <span className="text-text-secondary block">Plan Manager:</span>
                  <span className="text-text-primary font-medium">
                    {invoice.planManagerAgencyName}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                <div>
                  <span className="text-text-secondary block">BSB:</span>
                  <span className="font-mono text-text-primary">
                    {profile?.bsb || profile?.formattedBsb || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Account Number:</span>
                  <span className="font-mono text-text-primary">
                    {profile?.accountNumber || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Account Name:</span>
                  <span className="text-text-primary">{profile?.accountName || profile?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">ABN:</span>
                  <span className="font-mono text-text-primary">{profile?.abn || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 6: Line Items Table */}
        <div className="space-y-2">
          <h3 className="text-body2 font-semibold text-text-primary">Invoice Line Items</h3>
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>NDIS Item</Th>
                <Th>Description</Th>
                <Th>Hours/KM</Th>
                <Th>Rate</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </Thead>
            <tbody>
              {invoice.lineItems && invoice.lineItems.length > 0 ? (
                invoice.lineItems.map((item, idx) => (
                  <Tr key={idx}>
                    <Td className="whitespace-nowrap font-mono text-caption">
                      {formatCalendarDate(item.serviceDate)}
                    </Td>
                    <Td className="font-mono text-caption text-text-secondary">
                      {item.supportItemCode}
                    </Td>
                    <Td className="text-body2">{item.description}</Td>
                    <Td className="font-mono text-caption">
                      {item.quantity} {item.unit || 'Hour'}
                    </Td>
                    <Td className="font-mono text-caption whitespace-nowrap">
                      {formatAud(item.unitPrice)}
                    </Td>
                    <Td className="text-right font-mono font-bold whitespace-nowrap">
                      {formatAud(item.totalAmount)}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} className="text-center text-text-muted py-6">
                    No line items available.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Block 7: Totals Block */}
        <div className="rounded-card border border-border bg-surface p-5 max-w-sm ml-auto space-y-2 text-body2">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal:</span>
            <span className="font-mono text-text-primary">{formatAud(invoice.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>GST:</span>
            <span className="font-mono text-text-primary">
              {formatAud(invoice.gstAmount || 0)} (GST-free)
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-h4 font-bold text-text-primary">
            <span>TOTAL DUE:</span>
            <span className="font-mono text-brand">{formatAud(invoice.totalAmount)}</span>
          </div>
        </div>

        {/* Block 8: Notes & Budget watch */}
        {(invoice.notes || (client && client.allocatedBudgetTotal)) && (
          <div className="rounded-card border border-border bg-input p-4 space-y-2 text-caption">
            {invoice.notes && (
              <div>
                <span className="font-semibold text-text-primary block">Notes:</span>
                <p className="text-text-secondary">{invoice.notes}</p>
              </div>
            )}
            {client && client.allocatedBudgetTotal && (
              <div className="text-text-muted pt-1 border-t border-border">
                Budget:{' '}
                <span className="font-mono text-text-primary">
                  {formatAud(client.allocatedBudgetSpent)} of {formatAud(client.allocatedBudgetTotal)}
                </span>{' '}
                allocated ({client.budgetUtilizationPercent ?? 0}% used)
              </div>
            )}
          </div>
        )}

        {/* Block 9: Action Bar */}
        <div className="rounded-card border border-border bg-surface p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowInlinePdf(!showInlinePdf)}
              className="flex items-center gap-1.5"
            >
              <FileText size={16} />
              {showInlinePdf ? 'Hide PDF Viewer' : 'View PDF'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isFinal ? (
              <span className="text-caption text-text-muted italic">
                This invoice is final and cannot be changed.
              </span>
            ) : (
              <>
                {!isNdia && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsResendOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Send size={15} />
                    Resend
                  </Button>
                )}

                {isSent && (
                  <Button
                    variant="primary"
                    onClick={() => setIsMarkPaidOpen(true)}
                    className="flex items-center gap-1.5 bg-[#16A085] hover:bg-[#1DB89A] text-white"
                  >
                    <CheckCircle2 size={15} />
                    Mark Paid
                  </Button>
                )}

                {isSent && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsRejectOpen(true)}
                    className="flex items-center gap-1.5 text-[#EF4444] hover:border-[#991B1B]"
                  >
                    <XCircle size={15} />
                    Reject
                  </Button>
                )}

                {(isDraft || isSent) && canCancel && (
                  <Button
                    variant="danger"
                    onClick={() => setIsCancelOpen(true)}
                    className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white"
                  >
                    <Ban size={15} />
                    Cancel Invoice
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Block 10: Inline PDF Viewer Panel */}
        {showInlinePdf && (
          <div className="pt-2">
            <InvoicePDFViewer
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
            />
          </div>
        )}
      </div>

      {/* Action Modals */}
      <MarkPaidModal
        invoice={invoice}
        isOpen={isMarkPaidOpen}
        onClose={() => setIsMarkPaidOpen(false)}
        onSuccess={fetchInvoice}
      />

      <RejectInvoiceModal
        invoice={invoice}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSuccess={fetchInvoice}
      />

      <CancelInvoiceModal
        invoice={invoice}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onSuccess={fetchInvoice}
      />

      <ResendInvoiceModal
        invoice={invoice}
        isOpen={isResendOpen}
        onClose={() => setIsResendOpen(false)}
        onSuccess={fetchInvoice}
      />
    </AppLayout>
  );
}
