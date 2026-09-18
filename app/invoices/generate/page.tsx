'use client';

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Info, ShieldAlert, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { apiClient, getApiErrorCode, getApiErrorMessage } from '@/lib/api-client';
import { clientsService } from '@/lib/clients-service';
import { getBusinessProfile } from '@/lib/business-service';
import { invoicesService } from '@/lib/invoices-service';
import {
  BusinessProfile,
  ClientListItem,
  ClientDetailResponse,
  UninvoicedShift,
} from '@/lib/types';
import { validateAbnClient } from '@/lib/validators';
import { formatAud } from '@/lib/format';
import { UninvoicedShiftPicker } from '@/components/invoices/UninvoicedShiftPicker';
import { PreFlightShield } from '@/components/invoices/PreFlightShield';
import { UpgradeModal } from '@/components/clients/UpgradeModal';

function GenerateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useAuth();

  const isTechnician = !can('OWNER', 'OFFICE_MANAGER');

  // URL pre-selected client ID if any
  const preSelectedClientId = searchParams.get('clientId') || '';

  // Form states
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClientId);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientDetailResponse | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  // Uninvoiced shifts
  const [shifts, setShifts] = useState<UninvoicedShift[]>([]);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);

  // Options: Due date default +14 days
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }, []);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [notes, setNotes] = useState<string>('');

  // Submission & Shield
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isDebouncingCheck, setIsDebouncingCheck] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limit modals
  const [upgradeModalConfig, setUpgradeModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  // Load clients and business profile on mount
  useEffect(() => {
    if (isTechnician) return;
    clientsService
      .list({ page: 1, pageSize: 100, isActive: true })
      .then((res) => setClients(res.data))
      .catch(() => {});

    getBusinessProfile()
      .then(setBusinessProfile)
      .catch(() => {});
  }, [isTechnician]);

  // When selected participant changes, fetch participant detail and uninvoiced shifts
  useEffect(() => {
    if (!selectedClientId) {
      setSelectedClientDetail(null);
      setShifts([]);
      setSelectedShiftIds([]);
      setServerErrors([]);
      return;
    }

    // Fetch participant full details
    clientsService
      .getById(selectedClientId)
      .then(setSelectedClientDetail)
      .catch(() => setSelectedClientDetail(null));

    // Fetch uninvoiced shifts
    setIsLoadingShifts(true);
    setServerErrors([]);

    apiClient
      .get(`/shifts/uninvoiced`, { params: { clientId: selectedClientId } })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        let fetched: UninvoicedShift[] = [];
        if (payload?.groups && Array.isArray(payload.groups)) {
          // Backend shape: { groups: [{ clientId, shifts: ShiftView[] }], ... }
          const grp = payload.groups.find((g: any) => g.clientId === selectedClientId);
          fetched = grp?.shifts ?? [];
        } else if (Array.isArray(payload)) {
          if (payload.length > 0 && Array.isArray(payload[0].shifts)) {
            const grp = payload.find((g: any) => g.clientId === selectedClientId);
            fetched = grp?.shifts ?? [];
          } else {
            fetched = payload;
          }
        } else if (payload?.shifts && Array.isArray(payload.shifts)) {
          fetched = payload.shifts;
        }

        // Map into flat UninvoicedShift format
        const normalized: UninvoicedShift[] = fetched.map((s: any) => ({
          id: s.id,
          shiftDate: s.shiftDate || s.date || new Date().toISOString(),
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          totalHours: Number(s.totalHours || s.hours || 0),
          travelKms: Number(s.travelKms || 0),
          grandTotal: Number(s.grandTotal || s.totalAmount || s.amount || 0),
          supportItemCode: s.supportItemCode || null,
          status: s.status || 'PENDING',
        }));

        setShifts(normalized);
        // Default select all
        setSelectedShiftIds(normalized.map((s) => s.id));
      })
      .catch(() => {
        setShifts([]);
        setSelectedShiftIds([]);
      })
      .finally(() => {
        setIsLoadingShifts(false);
      });
  }, [selectedClientId]);

  // Selected shifts calculations
  const selectedShifts = useMemo(() => {
    return shifts.filter((s) => selectedShiftIds.includes(s.id));
  }, [shifts, selectedShiftIds]);

  const selectedTotal = useMemo(() => {
    return selectedShifts.reduce((sum, s) => sum + s.grandTotal, 0);
  }, [selectedShifts]);

  // Debounce mirror check simulation (250 ms)
  useEffect(() => {
    setIsDebouncingCheck(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setIsDebouncingCheck(false);
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedClientId, selectedShiftIds, businessProfile, selectedClientDetail]);

  // Client-side Pre-Flight Mirror Shield Calculation
  const localShield = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!selectedClientId) {
      return { isValid: false, errors: ['Please select a participant to verify compliance.'], warnings: [] };
    }

    if (selectedShiftIds.length === 0) {
      errors.push('At least one uninvoiced shift must be selected to generate an invoice.');
    }

    // Business Profile checks
    if (!businessProfile?.abn || !validateAbnClient(businessProfile.abn)) {
      errors.push('Business ABN is missing or invalid according to ATO Modulo-89 algorithm. Update in Settings.');
    }

    if (!businessProfile?.bsb || !/^\d{3}-?\d{3}$/.test(businessProfile.bsb)) {
      errors.push('Valid 6-digit Australian BSB is required for EFT remittance. Update in Settings.');
    }

    if (!businessProfile?.accountNumber || !/^\d{6,9}$/.test(businessProfile.accountNumber)) {
      errors.push('Bank account number (6–9 digits) is required for EFT payment. Update in Settings.');
    }

    // Participant checks
    if (selectedClientDetail) {
      if (!selectedClientDetail.ndisNumber || !/^\d{9}$/.test(selectedClientDetail.ndisNumber)) {
        errors.push('Participant must have a valid 9-digit NDIS reference number.');
      }

      if (selectedClientDetail.planManagementType === 'PLAN_MANAGED') {
        if (!selectedClientDetail.planManagerEmail) {
          errors.push('Plan Manager claims email is required for Plan-Managed participant invoices.');
        }
        if (!selectedClientDetail.planManagerAgencyName) {
          errors.push('Plan Manager agency name is required for Plan-Managed participants.');
        }
      }

      // Budget check warning
      if (selectedClientDetail.allocatedBudgetTotal) {
        const spent = selectedClientDetail.allocatedBudgetSpent || 0;
        const total = selectedClientDetail.allocatedBudgetTotal;
        const remaining = total - spent;
        if (selectedTotal > remaining) {
          warnings.push(
            `Invoice total (${formatAud(selectedTotal)}) exceeds remaining participant budget (${formatAud(
              Math.max(0, remaining)
            )}). Claim may require plan manager review.`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [selectedClientId, selectedShiftIds, businessProfile, selectedClientDetail, selectedTotal]);

  // Effective shield: if server errors were returned, they override
  const effectiveShieldErrors = serverErrors.length > 0 ? serverErrors : localShield.errors;
  const isCompliant = serverErrors.length === 0 && localShield.isValid;

  // Toggle shift selection
  const handleToggleShift = (shiftId: string) => {
    setSelectedShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
    setServerErrors([]);
  };

  const handleSelectAll = () => {
    setSelectedShiftIds(shifts.map((s) => s.id));
    setServerErrors([]);
  };

  const handleDeselectAll = () => {
    setSelectedShiftIds([]);
    setServerErrors([]);
  };

  // Submit invoice generation
  const handleSubmit = async () => {
    if (!selectedClientId || selectedShiftIds.length === 0 || !isCompliant || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      const response = await invoicesService.generate({
        clientId: selectedClientId,
        shiftIds: selectedShiftIds,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      });

      const { invoice, dispatch } = response;

      // Backend dispatch is { status: 'SENT' | 'FAILED' | 'SKIPPED_NDIA_MANAGED' }.
      // invoices-service normalises it to also expose `sent` for the UI.
      const rawDispatch: any = dispatch as any;
      const dispatchStatus: string | undefined = rawDispatch?.status;
      const dispatchSent: boolean =
        typeof rawDispatch?.sent === 'boolean'
          ? rawDispatch.sent
          : dispatchStatus
            ? dispatchStatus === 'SENT' || dispatchStatus === 'SKIPPED_NDIA_MANAGED'
            : true;
      const dispatchFailed = dispatchStatus === 'FAILED';

      if (selectedClientDetail?.planManagementType === 'NDIA_MANAGED') {
        toast.success('Invoice generated.');
      } else if (dispatch && (dispatchFailed || !dispatchSent)) {
        toast('Invoice saved as Draft — email could not be sent. Retry from the invoice page.', {
          icon: '⚠️',
          duration: 5000,
        });
      } else {
        toast.success('Invoice generated and sent.');
      }

      router.push(`/invoices/${invoice.id}`);
    } catch (err: any) {
      const code = getApiErrorCode(err);
      const responseData = err?.response?.data;

      if (code === 'INVOICE_BLOCKED_BY_SHIELD') {
        const detailsErrors = responseData?.details?.errors || responseData?.errors;
        if (Array.isArray(detailsErrors) && detailsErrors.length > 0) {
          setServerErrors(detailsErrors);
        } else {
          setServerErrors([getApiErrorMessage(err, 'Invoice generation blocked by Pre-Flight Shield.')]);
        }
      } else if (code === 'TRIAL_INVOICE_LIMIT_REACHED') {
        setUpgradeModalConfig({
          isOpen: true,
          title: 'Free trial invoice limit reached',
          description: 'Your trial includes 2 invoices. Upgrade to keep invoicing.',
        });
      } else if (code === 'STARTER_INVOICE_LIMIT_REACHED') {
        setUpgradeModalConfig({
          isOpen: true,
          title: 'Monthly invoice limit reached',
          description: 'The Starter plan includes 20 invoices per month. Upgrade to Pro for unlimited invoicing.',
        });
      } else {
        toast.error(getApiErrorMessage(err, 'Failed to generate invoice.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTechnician) {
    return (
      <AppLayout title="Generate Invoice" subtitle="Batch shift selection & Pre-Flight Shield">
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

  const isNdiaManaged = selectedClientDetail?.planManagementType === 'NDIA_MANAGED';
  const recipientEmail =
    selectedClientDetail?.planManagementType === 'PLAN_MANAGED'
      ? selectedClientDetail.planManagerEmail
      : selectedClientDetail?.selfManagedBillingEmail || null;
  const agencyName =
    selectedClientDetail?.planManagementType === 'PLAN_MANAGED'
      ? selectedClientDetail.planManagerAgencyName
      : 'Self-Managed Participant';

  const buttonLabel = isSubmitting
    ? 'Generating…'
    : isNdiaManaged
    ? `Generate Invoice (${formatAud(selectedTotal)})`
    : `Generate & Send (${formatAud(selectedTotal)})`;

  return (
    <AppLayout
      title="Generate Invoice"
      subtitle="Batch shift selection with Pre-Flight Auto-Rejection Shield"
    >
      <div className="max-w-3xl space-y-6 pb-20">
        {/* Back link */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-caption text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          ← Back to Invoices
        </Link>

        <div>
          <h1 className="text-h1 text-text-primary">Generate Invoice</h1>
          <p className="text-body2 text-text-secondary">
            Select unbilled shifts to run through the Pre-Flight Shield and dispatch.
          </p>
        </div>

        {/* Step 1: Participant Selector */}
        <div className="rounded-card border border-border bg-surface p-5 space-y-3">
          <label htmlFor="participant-select" className="text-body2 font-semibold text-text-primary block">
            1. Select NDIS Participant <span className="text-[#EF4444]">*</span>
          </label>
          <select
            id="participant-select"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
          >
            <option value="">-- Choose an active participant --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.participantName} (NDIS: {c.ndisNumber})
              </option>
            ))}
          </select>

          {selectedClientDetail && (
            <div className="text-xs text-text-secondary pt-1 flex flex-wrap items-center gap-3">
              <span>
                Plan: <strong className="text-text-primary">{selectedClientDetail.planManagementType}</strong>
              </span>
              {selectedClientDetail.planManagerAgencyName && (
                <span>
                  Agency: <strong className="text-text-primary">{selectedClientDetail.planManagerAgencyName}</strong>
                </span>
              )}
              {selectedClientDetail.planManagerEmail && (
                <span>
                  Claims: <strong className="text-text-primary">{selectedClientDetail.planManagerEmail}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* NDIA Notice if applicable */}
        {isNdiaManaged && (
          <div className="rounded-card border border-[#117A65] bg-[#0D332D] p-4 text-[#5EE0C1] flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-semibold block">NDIA-Managed Participant Notice</strong>
              <p>
                NDIA-managed: no email is sent. Claim directly through the PRODA Myplace portal using the generated PDF details.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Uninvoiced Shifts Picker */}
        {selectedClientId && (
          <div className="space-y-2">
            <h3 className="text-body2 font-semibold text-text-primary">
              2. Select Uninvoiced Shifts ({selectedShiftIds.length} selected)
            </h3>
            <UninvoicedShiftPicker
              shifts={shifts}
              selectedShiftIds={selectedShiftIds}
              onToggleShift={handleToggleShift}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              isLoading={isLoadingShifts}
            />
          </div>
        )}

        {/* Step 3: Pre-Flight Shield Panel */}
        {selectedClientId && (
          <div>
            <h3 className="text-body2 font-semibold text-text-primary mb-2">
              3. Pre-Flight Auto-Rejection Shield
            </h3>
            <PreFlightShield
              isValid={isCompliant}
              errors={effectiveShieldErrors}
              warnings={localShield.warnings}
              totalAmount={selectedTotal}
              recipientEmail={isNdiaManaged ? null : recipientEmail}
              agencyName={agencyName}
              isChecking={isDebouncingCheck}
            />
          </div>
        )}

        {/* Step 4: Invoice Options */}
        {selectedClientId && selectedShiftIds.length > 0 && (
          <div className="rounded-card border border-border bg-surface p-5 space-y-4">
            <h3 className="text-body2 font-semibold text-text-primary">
              4. Invoice Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="due-date-input" className="text-caption text-text-secondary">
                  Due Date (default +14 days)
                </label>
                <input
                  id="due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="notes-input" className="text-caption text-text-secondary">
                Notes / Remittance remarks (optional, max 500 characters)
              </label>
              <textarea
                id="notes-input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="e.g. Community access support for September. Thank you."
                className="w-full rounded-input border border-border bg-input p-3 text-body2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none resize-none"
              />
              <div className="text-right text-caption text-text-muted">
                {notes.length} / 500
              </div>
            </div>
          </div>
        )}

        {/* Action Bar (Sticky on mobile below sm, inline on desktop) */}
        {selectedClientId && (
          <div className="sticky bottom-0 sm:static bg-surface/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-4 sm:p-0 border-t sm:border-t-0 border-border z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/invoices')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex flex-col sm:items-end gap-1">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!isCompliant || selectedShiftIds.length === 0 || isSubmitting}
                aria-busy={isSubmitting}
                className="shadow-glow min-w-[200px]"
              >
                {buttonLabel}
              </Button>
              {!isCompliant && selectedShiftIds.length > 0 && (
                <p className="text-caption text-[#EF4444]">
                  Resolve the compliance issues above to generate this invoice.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Limit Modal */}
      <UpgradeModal
        isOpen={upgradeModalConfig.isOpen}
        onClose={() => setUpgradeModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={upgradeModalConfig.title}
        description={upgradeModalConfig.description}
      />
    </AppLayout>
  );
}

export default function GenerateInvoicePage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          title="Generate Invoice"
          subtitle="Batch shift selection & Pre-Flight Shield"
        >
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-body2">Loading invoice generator…</p>
          </div>
        </AppLayout>
      }
    >
      <GenerateInvoiceContent />
    </Suspense>
  );
}

