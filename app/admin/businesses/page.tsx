'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  listBusinesses,
  extendBusinessTrial,
  updateBusinessStatus,
  getBusinessDetails,
} from '@/lib/admin-service';
import type {
  AdminBusinessItem,
  BusinessStatus,
  PaginationMeta,
} from '@/lib/types';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<AdminBusinessItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 15,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusinessItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBusinesses(page = 1) {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        pageSize: 15,
      };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await listBusinesses(params);
      setBusinesses(res.records);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch businesses');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses(1);
  }, [statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadBusinesses(1);
  }

  async function handleExtendTrial() {
    if (!selectedBusiness) return;
    try {
      setIsSubmitting(true);
      const updated = await extendBusinessTrial(selectedBusiness.id, extendDays);
      toast.success(`Extended trial by ${extendDays} days for ${updated.name}`);
      setIsExtendModalOpen(false);
      loadBusinesses(pagination.page);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to extend trial');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(businessId: string, status: BusinessStatus) {
    try {
      setIsSubmitting(true);
      const updated = await updateBusinessStatus(businessId, status, 'Super Admin state change');
      toast.success(`Status updated to ${status} for ${updated.name}`);
      loadBusinesses(pagination.page);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  }

  const statusBadge = (status: BusinessStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0D332D] px-2.5 py-0.5 text-xs font-semibold text-[#5EE0C1] border border-[#117A65]">
            <CheckCircle2 className="h-3 w-3" /> Active Paid
          </span>
        );
      case 'TRIALING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2E1065] px-2.5 py-0.5 text-xs font-semibold text-[#C084FC] border border-[#7E22CE]">
            <Activity className="h-3 w-3" /> 9-Day Trial
          </span>
        );
      case 'READ_ONLY':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2A1D0B] px-2.5 py-0.5 text-xs font-semibold text-[#FBBF24] border border-[#B45309]">
            <AlertCircle className="h-3 w-3" /> Expired / Read-Only
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2B1010] px-2.5 py-0.5 text-xs font-semibold text-[#EF4444] border border-[#991B1B]">
            <ShieldCheck className="h-3 w-3" /> Suspended
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F10] pb-12">
      <AdminHeader
        title="Tenants & Businesses Directory"
        description="Master directory of all registered Australian NDIS Sole Traders with trial controls and compliance details"
        onRefresh={() => loadBusinesses(pagination.page)}
        isRefreshing={isLoading}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#253130] bg-[#131B1C] p-4 shadow-lg">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Tenants' },
              { id: 'TRIALING', label: 'Trialing' },
              { id: 'ACTIVE', label: 'Active Paid' },
              { id: 'READ_ONLY', label: 'Expired' },
              { id: 'SUSPENDED', label: 'Suspended' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#2E1065] text-[#C084FC] border border-[#7E22CE]'
                    : 'bg-[#182122] text-[#9AA9A5] border border-[#253130] hover:text-[#F1F5F4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#687572]" />
              <input
                type="text"
                placeholder="Search name, email, ABN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-[#253130] bg-[#0A0F10] pl-9 pr-3 py-2 text-xs text-[#F1F5F4] placeholder-[#687572] focus:border-[#7E22CE] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#2E1065] px-4 py-2 text-xs font-semibold text-[#C084FC] border border-[#7E22CE] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Master Businesses Table */}
        <div className="rounded-2xl border border-[#253130] bg-[#131B1C] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#253130] bg-[#0D1415] text-[#9AA9A5] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Tenant Name & Contact</th>
                  <th className="px-6 py-3.5 font-semibold">ABN & Location</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Trial Horizon</th>
                  <th className="px-6 py-3.5 font-semibold">Records</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253130]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      Loading tenants directory...
                    </td>
                  </tr>
                ) : businesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      No businesses match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  businesses.map((b) => (
                    <tr key={b.id} className="hover:bg-[#182122]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#F1F5F4] text-sm">{b.name}</div>
                        <div className="text-[11px] text-[#9AA9A5]">{b.email}</div>
                        {b.phone && <div className="text-[10px] text-[#687572]">Ph: {b.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-[#F1F5F4]">
                          {b.abn ? `ABN ${b.abn}` : <span className="text-[#687572]">No ABN registered</span>}
                        </div>
                        <div className="text-[11px] text-[#9AA9A5]">
                          {b.suburb || b.state ? `${b.suburb || ''} ${b.state || ''} ${b.postcode || ''}` : <span className="text-[#687572]">No address</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'TRIALING' ? (
                          <div>
                            <span className="font-bold text-[#C084FC]">
                              {b.trialDaysRemaining} days remaining
                            </span>
                            <div className="text-[10px] text-[#9AA9A5]">
                              Exp: {new Date(b.trialEndsAt).toLocaleDateString('en-AU')}
                            </div>
                          </div>
                        ) : b.status === 'ACTIVE' ? (
                          <span className="text-[#5EE0C1] font-semibold">Active Subscription</span>
                        ) : (
                          <span className="text-[#EF4444] font-medium">Trial Ended</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-[11px] text-[#9AA9A5]">
                          <div><strong className="text-[#F1F5F4]">{b.counts.users}</strong> users • <strong className="text-[#F1F5F4]">{b.counts.clients}</strong> clients</div>
                          <div><strong className="text-[#F1F5F4]">{b.counts.shifts}</strong> shifts • <strong className="text-[#F1F5F4]">{b.counts.invoices}</strong> invoices</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBusiness(b);
                              setIsDetailModalOpen(true);
                            }}
                            className="rounded-lg border border-[#253130] bg-[#182122] p-1.5 text-[#9AA9A5] hover:text-[#5EE0C1] hover:border-[#117A65] transition-colors"
                            title="View full compliance details"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBusiness(b);
                              setIsExtendModalOpen(true);
                            }}
                            className="rounded-lg border border-[#7E22CE] bg-[#2E1065] px-2.5 py-1 text-xs font-semibold text-[#C084FC] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-colors"
                          >
                            Extend
                          </button>
                          {b.status !== 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(b.id, 'ACTIVE')}
                              className="rounded-lg border border-[#117A65] bg-[#0D332D] px-2.5 py-1 text-xs font-semibold text-[#5EE0C1] hover:bg-[#117A65] hover:text-[#F1F5F4] transition-colors"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(b.id, 'SUSPENDED')}
                              className="rounded-lg border border-[#991B1B] bg-[#2B1010] px-2.5 py-1 text-xs font-semibold text-[#EF4444] hover:bg-[#991B1B] hover:text-[#F1F5F4] transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-[#253130] bg-[#0D1415] px-6 py-3.5">
            <span className="text-xs text-[#9AA9A5]">
              Showing <strong className="text-[#F1F5F4]">{businesses.length}</strong> of <strong className="text-[#F1F5F4]">{pagination.totalRecords}</strong> total tenants
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => loadBusinesses(pagination.page - 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs font-medium text-[#9AA9A5]">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => loadBusinesses(pagination.page + 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Business Full Details Modal */}
      {isDetailModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#253130] bg-[#131B1C] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#253130] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F1F5F4]">{selectedBusiness.name}</h3>
                <p className="text-xs text-[#9AA9A5]">Tenant ID: {selectedBusiness.id}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#9AA9A5] hover:text-[#F1F5F4] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Compliance & Registration */}
              <div className="rounded-xl border border-[#253130] bg-[#0D1415] p-4 space-y-2">
                <h4 className="font-bold text-[#5EE0C1] flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Australian Business Info
                </h4>
                <div><span className="text-[#9AA9A5]">ABN:</span> <strong className="text-[#F1F5F4] font-mono">{selectedBusiness.abn || 'Not configured'}</strong></div>
                <div><span className="text-[#9AA9A5]">GST Registered:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.isGstRegistered ? 'Yes (10% GST)' : 'No (GST Free)'}</strong></div>
                <div><span className="text-[#9AA9A5]">Invoice Prefix:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.invoicePrefix}</strong></div>
                <div><span className="text-[#9AA9A5]">Industry:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.industry || 'NDIS Sole Trader'}</strong></div>
                <div><span className="text-[#9AA9A5]">Primary Contact:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.email}</strong></div>
              </div>

              {/* Box 2: Banking Details */}
              <div className="rounded-xl border border-[#253130] bg-[#0D1415] p-4 space-y-2">
                <h4 className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Australian Banking
                </h4>
                <div><span className="text-[#9AA9A5]">Bank Name:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.bankName || 'Not configured'}</strong></div>
                <div><span className="text-[#9AA9A5]">BSB:</span> <strong className="text-[#F1F5F4] font-mono">{selectedBusiness.bsb || 'Not configured'}</strong></div>
                <div><span className="text-[#9AA9A5]">Account Number:</span> <strong className="text-[#F1F5F4] font-mono">{selectedBusiness.accountNumber || 'Not configured'}</strong></div>
                <div><span className="text-[#9AA9A5]">Address:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.address || 'Not configured'}</strong></div>
                <div><span className="text-[#9AA9A5]">Suburb / State:</span> <strong className="text-[#F1F5F4]">{selectedBusiness.suburb || ''} {selectedBusiness.state || ''} {selectedBusiness.postcode || ''}</strong></div>
              </div>
            </div>

            {/* Trial & Lifecycle Details */}
            <div className="rounded-xl border border-[#7E22CE]/40 bg-[#2E1065]/20 p-4 text-xs space-y-2">
              <h4 className="font-bold text-[#C084FC] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Subscription & 9-Day Trial Horizon
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-[#9AA9A5]">Current Status:</span> {statusBadge(selectedBusiness.status)}</div>
                <div><span className="text-[#9AA9A5]">Trial Remaining:</span> <strong className="text-[#C084FC]">{selectedBusiness.trialDaysRemaining} days</strong></div>
                <div><span className="text-[#9AA9A5]">Trial Started:</span> <strong className="text-[#F1F5F4]">{new Date(selectedBusiness.trialStartedAt).toLocaleString('en-AU')}</strong></div>
                <div><span className="text-[#9AA9A5]">Trial Ends:</span> <strong className="text-[#F1F5F4]">{new Date(selectedBusiness.trialEndsAt).toLocaleString('en-AU')}</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-xl bg-[#182122] border border-[#253130] px-5 py-2 text-xs font-semibold text-[#F1F5F4] hover:bg-[#253130]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Extension Modal */}
      {isExtendModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#7E22CE] bg-[#131B1C] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F1F5F4]">Extend Free Trial</h3>
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="text-[#9AA9A5] hover:text-[#F1F5F4]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#9AA9A5]">
              Grant additional trial days for <strong className="text-[#F1F5F4]">{selectedBusiness.name}</strong>.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#9AA9A5]">Select Additional Trial Days:</label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtendDays(days)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all border ${
                      extendDays === days
                        ? 'bg-[#2E1065] text-[#C084FC] border-[#7E22CE] shadow-glow'
                        : 'bg-[#182122] text-[#9AA9A5] border-[#253130] hover:text-[#F1F5F4]'
                    }`}
                  >
                    +{days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsExtendModalOpen(false)}
                className="rounded-xl border border-[#253130] bg-[#182122] px-4 py-2 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExtendTrial}
                className="rounded-xl bg-[#2E1065] px-4 py-2 text-xs font-bold text-[#C084FC] border border-[#7E22CE] hover:bg-[#7E22CE] hover:text-[#F1F5F4] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Extending...' : `Confirm +${extendDays} Days`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
