'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  FileText,
  Clock,
  TrendingUp,
  ShieldCheck,
  Search,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  DollarSign,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  getAdminMetrics,
  listBusinesses,
  extendBusinessTrial,
  updateBusinessStatus,
} from '@/lib/admin-service';
import type {
  AdminMetrics,
  AdminBusinessItem,
  BusinessStatus,
} from '@/lib/types';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentBusinesses, setRecentBusinesses] = useState<AdminBusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action Modal states
  const [actionBusiness, setActionBusiness] = useState<AdminBusinessItem | null>(null);
  const [extendDays, setExtendDays] = useState(7);
  const [isActionLoading, setIsActionLoading] = useState(false);

  async function loadData(showToast = false) {
    try {
      if (showToast) setIsRefreshing(true);
      const [metricsData, businessesData] = await Promise.all([
        getAdminMetrics(),
        listBusinesses({ pageSize: 5 }),
      ]);
      setMetrics(metricsData);
      setRecentBusinesses(businessesData.records);
      if (showToast) {
        toast.success('Live platform metrics updated');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleExtendTrial(businessId: string, days: number) {
    try {
      setIsActionLoading(true);
      const updated = await extendBusinessTrial(businessId, days);
      toast.success(`Extended trial by ${days} days for ${updated.name}`);
      setActionBusiness(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to extend trial');
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleStatusChange(businessId: string, status: BusinessStatus) {
    try {
      setIsActionLoading(true);
      const updated = await updateBusinessStatus(businessId, status, 'Super Admin manual override');
      toast.success(`Updated ${updated.name} status to ${status}`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update business status');
    } finally {
      setIsActionLoading(false);
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
        title="Super Admin Master Panel"
        description="Global platform telemetry, active sole-trader tenants, revenue volume & compliance oversight"
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-8">
        {/* Top Highlight Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Tenants */}
          <div className="relative overflow-hidden rounded-2xl border border-[#253130] bg-[#131B1C] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9AA9A5]">Total Tenants</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E1065] text-[#C084FC] border border-[#7E22CE]">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#F1F5F4]">
                {isLoading ? '...' : metrics?.overview.totalBusinesses ?? 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#9AA9A5]">
              <span className="text-[#5EE0C1] font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                +{metrics?.overview.recentRegistrations7Days ?? 0}
              </span>
              <span>new in last 7 days</span>
            </div>
          </div>

          {/* Card 2: Total Registered Users */}
          <div className="relative overflow-hidden rounded-2xl border border-[#253130] bg-[#131B1C] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9AA9A5]">Platform Users</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D332D] text-[#5EE0C1] border border-[#117A65]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#F1F5F4]">
                {isLoading ? '...' : metrics?.overview.totalUsers ?? 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#9AA9A5]">
              <span>Sole traders & staff accounts</span>
            </div>
          </div>

          {/* Card 3: Invoices & Gross Volume */}
          <div className="relative overflow-hidden rounded-2xl border border-[#253130] bg-[#131B1C] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9AA9A5]">NDIS Invoices</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0369A1]/20 text-[#38BDF8] border border-[#0284C7]/40">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#F1F5F4]">
                {isLoading ? '...' : metrics?.overview.totalInvoices ?? 0}
              </span>
              <span className="text-xs font-medium text-[#9AA9A5]">
                (${metrics?.overview.totalRevenueVolume ? Number(metrics.overview.totalRevenueVolume).toLocaleString('en-AU', { minimumFractionDigits: 2 }) : '0.00'} AUD)
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#9AA9A5]">
              <span className="text-[#38BDF8] font-medium">{metrics?.overview.totalShifts ?? 0} shifts logged</span>
            </div>
          </div>

          {/* Card 4: Active Engine Status */}
          <div className="relative overflow-hidden rounded-2xl border border-[#253130] bg-[#131B1C] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9AA9A5]">System Health</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D332D] text-[#5EE0C1] border border-[#117A65]">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#5EE0C1] animate-pulse" />
              <span className="text-2xl font-extrabold text-[#F1F5F4]">100% Operational</span>
            </div>
            <div className="mt-3 text-xs text-[#9AA9A5]">
              <span>Render Node.js • Neon DB</span>
            </div>
          </div>
        </div>

        {/* Tenant Lifecycle Distribution Bar */}
        <div className="rounded-2xl border border-[#253130] bg-[#131B1C] p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#F1F5F4]">Tenant Distribution by Subscription Status</h2>
              <p className="text-xs text-[#9AA9A5]">Real-time breakdown of active trials, paid subscribers, and expired tenants</p>
            </div>
            <Link
              href="/admin/businesses"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#253130] bg-[#182122] px-3.5 py-1.5 text-xs font-semibold text-[#5EE0C1] hover:bg-[#0D332D] transition-colors"
            >
              <span>Manage All Tenants</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#7E22CE]/30 bg-[#2E1065]/20 p-4">
              <p className="text-xs font-medium text-[#C084FC]">9-Day Free Trial</p>
              <p className="mt-1 text-2xl font-bold text-[#F1F5F4]">
                {metrics?.tenantsByStatus.trialing ?? 0}
              </p>
              <p className="text-[11px] text-[#9AA9A5]">Active evaluation</p>
            </div>

            <div className="rounded-xl border border-[#117A65]/30 bg-[#0D332D]/30 p-4">
              <p className="text-xs font-medium text-[#5EE0C1]">Active Paid</p>
              <p className="mt-1 text-2xl font-bold text-[#F1F5F4]">
                {metrics?.tenantsByStatus.active ?? 0}
              </p>
              <p className="text-[11px] text-[#9AA9A5]">Paying subscriptions</p>
            </div>

            <div className="rounded-xl border border-[#B45309]/30 bg-[#2A1D0B]/30 p-4">
              <p className="text-xs font-medium text-[#FBBF24]">Trial Expired / Read-Only</p>
              <p className="mt-1 text-2xl font-bold text-[#F1F5F4]">
                {metrics?.tenantsByStatus.readOnly ?? 0}
              </p>
              <p className="text-[11px] text-[#9AA9A5]">Needs upgrade/extension</p>
            </div>

            <div className="rounded-xl border border-[#991B1B]/30 bg-[#2B1010]/30 p-4">
              <p className="text-xs font-medium text-[#EF4444]">Suspended</p>
              <p className="mt-1 text-2xl font-bold text-[#F1F5F4]">
                {metrics?.tenantsByStatus.suspended ?? 0}
              </p>
              <p className="text-[11px] text-[#9AA9A5]">Access locked</p>
            </div>
          </div>
        </div>

        {/* Recent Registered Businesses Section */}
        <div className="rounded-2xl border border-[#253130] bg-[#131B1C] shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#253130] p-6 gap-4">
            <div>
              <h2 className="text-base font-bold text-[#F1F5F4]">Recent Tenant Registrations</h2>
              <p className="text-xs text-[#9AA9A5]">Sole traders registered on Rayvice with 1-click status & trial extension controls</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/businesses"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2E1065] px-4 py-2 text-xs font-bold text-[#C084FC] border border-[#7E22CE] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-all"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>View All Tenants ({metrics?.overview.totalBusinesses ?? 0})</span>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#253130] bg-[#0D1415] text-[#9AA9A5] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Business / Sole Trader</th>
                  <th className="px-6 py-3 font-semibold">ABN & Banking</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Trial Status</th>
                  <th className="px-6 py-3 font-semibold">Activity Counts</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253130]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#9AA9A5]">
                      Loading recent tenants...
                    </td>
                  </tr>
                ) : recentBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#9AA9A5]">
                      No businesses registered yet.
                    </td>
                  </tr>
                ) : (
                  recentBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-[#182122]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#F1F5F4]">{b.name}</div>
                        <div className="text-[11px] text-[#9AA9A5]">{b.email}</div>
                        <div className="text-[10px] text-[#687572]">ID: {b.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-[#F1F5F4]">
                          {b.abn ? `ABN: ${b.abn}` : <span className="text-[#687572]">No ABN yet</span>}
                        </div>
                        <div className="text-[11px] text-[#9AA9A5]">
                          {b.bsb ? `BSB: ${b.bsb} • ${b.bankName || 'Bank'}` : <span className="text-[#687572]">No Bank yet</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'TRIALING' ? (
                          <div>
                            <span className="font-semibold text-[#C084FC]">
                              {b.trialDaysRemaining} days remaining
                            </span>
                            <div className="text-[10px] text-[#9AA9A5]">
                              Ends {new Date(b.trialEndsAt).toLocaleDateString('en-AU')}
                            </div>
                          </div>
                        ) : b.status === 'ACTIVE' ? (
                          <span className="text-[#5EE0C1] font-medium">Full Plan Active</span>
                        ) : (
                          <span className="text-[#EF4444] font-medium">Trial Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-[11px] text-[#9AA9A5]">
                          <span title="Users">{b.counts.users} users</span>
                          <span>•</span>
                          <span title="Clients">{b.counts.clients} clients</span>
                          <span>•</span>
                          <span title="Invoices">{b.counts.invoices} invoices</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActionBusiness(b)}
                            className="rounded-lg border border-[#7E22CE] bg-[#2E1065] px-2.5 py-1 text-xs font-semibold text-[#C084FC] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-colors"
                          >
                            Extend Trial
                          </button>
                          {b.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'ACTIVE')}
                              className="rounded-lg border border-[#117A65] bg-[#0D332D] px-2.5 py-1 text-xs font-semibold text-[#5EE0C1] hover:bg-[#117A65] hover:text-[#F1F5F4] transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {b.status !== 'SUSPENDED' && (
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
        </div>
      </div>

      {/* Trial Extension Modal */}
      {actionBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#7E22CE] bg-[#131B1C] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F1F5F4]">Extend Free Trial</h3>
              <button
                onClick={() => setActionBusiness(null)}
                className="text-[#9AA9A5] hover:text-[#F1F5F4]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#9AA9A5]">
              Grant additional trial days for <strong className="text-[#F1F5F4]">{actionBusiness.name}</strong> ({actionBusiness.email}).
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
                onClick={() => setActionBusiness(null)}
                className="rounded-xl border border-[#253130] bg-[#182122] px-4 py-2 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => handleExtendTrial(actionBusiness.id, extendDays)}
                className="rounded-xl bg-[#2E1065] px-4 py-2 text-xs font-bold text-[#C084FC] border border-[#7E22CE] hover:bg-[#7E22CE] hover:text-[#F1F5F4] disabled:opacity-50 transition-all"
              >
                {isActionLoading ? 'Extending...' : `Confirm +${extendDays} Days`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
