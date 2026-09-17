'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Clock,
  Users,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  Building2,
  Plus,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { getBusinessProfile } from '@/lib/business-service';
import { clientsService } from '@/lib/clients-service';
import { shiftsService, ShiftRecord } from '@/lib/shifts-service';
import { BusinessProfile, ClientListItem } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api-client';
import { formatAud, formatCalendarDate } from '@/lib/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [totalClientsCount, setTotalClientsCount] = useState(0);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBusinessProfile().catch((err: any) => {
        if (err?.response?.status !== 401) {
          toast.error(getApiErrorMessage(err));
        }
        return null;
      }),
      clientsService.list({ page: 1, pageSize: 5 }).catch(() => null),
    ])
      .then(([prof, clientsRes]) => {
        if (prof) setProfile(prof);
        if (clientsRes) {
          setClients(clientsRes.data || []);
          setTotalClientsCount(clientsRes.totalCount || 0);
        }
      })
      .finally(() => setIsLoading(false));

    // Load logged shifts from service
    setShifts(shiftsService.getRecent(10));

    // Subscribe to shift additions (from global header modal)
    const unsubscribe = shiftsService.subscribe(() => {
      setShifts(shiftsService.getRecent(10));
    });

    return () => unsubscribe();
  }, []);

  const compliance = profile?.compliance;
  const trial = profile?.trial;
  const daysRemaining = trial?.daysRemaining ?? 9;

  // Real uninvoiced count aggregated from participants and local shift queue
  const pendingFromClients = clients.reduce((acc, c) => acc + (c.pendingUninvoicedShiftsCount || 0), 0);
  const pendingFromLocal = shifts.filter((s) => s.status === 'PENDING').length;
  const pendingUninvoicedCount = Math.max(pendingFromClients, pendingFromLocal);

  const thisWeekEarnings = shifts.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const thisWeekCount = shifts.length;

  const primaryClient = clients[0] || null;

  return (
    <AppLayout
      title={`Welcome back, ${user?.firstName || 'Support Worker'}`}
      subtitle="NDIS Sole-Trader Billing, Timesheets & Auto-Rejection Shield Dashboard"
    >
      <div className="space-y-6">

        {/* Compliance Incomplete Alert Banner */}
        {!compliance?.isCompliant && (
          <div className="rounded-xl border border-[#92400E] bg-[#2A210B] p-4 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#FEF3C7]">
                    Setup Incomplete: Action Required for Tax Invoices
                  </h4>
                  <p className="text-[#FEF3C7]/80 mt-0.5">
                    Configure your missing details below to unlock rejection-free 1-Click invoice generation.
                  </p>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="secondary" size="sm" className="shrink-0 border-[#92400E] text-[#FEF3C7] hover:bg-[#382D0F]">
                  View All Settings
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#92400E]/40 text-[#FEF3C7]">
              <span>Missing:</span>
              {compliance?.missingFields?.map((f) => (
                <span key={f} className="rounded bg-[#92400E]/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider">
                  {f}
                </span>
              ))}
              <span className="text-[#F59E0B] font-medium ml-auto">
                Readiness: {compliance?.readinessPercentage ?? 0}%
              </span>
            </div>
          </div>
        )}

        {/* Trial Status Header Card */}
        <div className="rounded-xl border border-[#117A65] bg-[#0D332D]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm" className="bg-[#117A65] text-[#5EE0C1] font-semibold">
                {trial?.effectiveStatus === 'ACTIVE' ? 'Active Subscription' : '1-Participant Trial Mode Active'}
              </Badge>
              {trial?.effectiveStatus !== 'ACTIVE' && (
                <span className="text-xs text-[#9AA9A5]">
                  {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining
                </span>
              )}
            </div>
            <p className="text-xs text-[#9AA9A5] max-w-xl">
              Test live NDIS rate splitting on shifts and generate test invoices with zero rejections.
              Upgrade anytime to Starter ($24 AUD/mo) or Pro ($44 AUD/mo).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/settings/billing">
              <Button variant="primary" size="sm" className="shadow-glow flex items-center gap-1.5 shrink-0">
                Manage Subscription
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Estimated Earnings */}
          <Card className="p-5 border-[#253130] bg-[#131B1C]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9AA9A5]">This Week&apos;s Logged Shifts</span>
              <div className="rounded-lg bg-[#0D332D] p-2 text-[#5EE0C1] border border-[#117A65]">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">{formatAud(thisWeekEarnings)}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#9AA9A5]">
              <TrendingUp className="h-3 w-3 text-[#5EE0C1]" />
              <span>
                {thisWeekCount} shift{thisWeekCount === 1 ? '' : 's'} logged
              </span>
            </div>
          </Card>

          {/* Card 2: Uninvoiced Shifts */}
          <Card className="p-5 border-[#253130] bg-[#131B1C]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9AA9A5]">Pending Uninvoiced Shifts</span>
              <div className="rounded-lg bg-[#2A210B] p-2 text-[#F59E0B] border border-[#92400E]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">
                {pendingUninvoicedCount} Shift{pendingUninvoicedCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#9AA9A5]">
              {pendingUninvoicedCount > 0 ? 'Ready for Shield validation & batch invoicing' : 'No pending uninvoiced shifts'}
            </div>
          </Card>

          {/* Card 3: Active Participants */}
          <Card className="p-5 border-[#253130] bg-[#131B1C]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9AA9A5]">Active Participants</span>
              <div className="rounded-lg bg-[#0D332D] p-2 text-[#5EE0C1] border border-[#117A65]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">
                {totalClientsCount} {totalClientsCount === 1 ? 'Client' : 'Clients'}
              </span>
              <span className="text-xs text-[#5EE0C1] font-semibold">(Trial Quota: 1)</span>
            </div>
            <div className="mt-2 text-[11px] text-[#9AA9A5]">
              {primaryClient ? (
                <span className="text-[#5EE0C1] font-medium">
                  {primaryClient.participantName} (NDIS: {primaryClient.ndisNumber})
                </span>
              ) : (
                <Link href="/clients/new" className="text-[#5EE0C1] hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add your first participant
                </Link>
              )}
            </div>
          </Card>
        </div>

        {/* Uninvoiced Shifts Batch Callout Banner */}
        {pendingUninvoicedCount > 0 ? (
          <div className="rounded-xl border border-[#117A65] bg-[#0D332D]/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#0E1617] p-2 text-[#5EE0C1] border border-[#16A085]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F1F5F4]">
                    {pendingUninvoicedCount} unbilled shift{pendingUninvoicedCount === 1 ? '' : 's'} ready for invoicing
                  </h4>
                  <p className="text-xs text-[#9AA9A5]">
                    Auto-Rejection Shield verifies 2026 NDIA price caps, evening 8:00 PM splits, and ABN compliance before dispatch.
                  </p>
                </div>
              </div>
              <Link href="/invoices/generate">
                <Button variant="primary" size="sm" className="shadow-glow shrink-0">
                  Batch Generate Invoices (Shield)
                </Button>
              </Link>
            </div>
          </div>
        ) : null}

        {/* Split Grid: Recent Shifts & Budget Watch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shifts Table (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F1F5F4]">Recent Shift Logs & Split Math</h3>
              <span className="text-xs text-[#5EE0C1]">2026 NDIA Rates</span>
            </div>

            <Card className="overflow-hidden border border-[#253130]">
              {shifts.length > 0 ? (
                <div className="divide-y divide-[#253130]">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="p-4 hover:bg-[#182122]/50 transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#F1F5F4]">{shift.clientName}</span>
                          {shift.ndisNumber && <span className="text-[10px] text-[#9AA9A5]">NDIS: {shift.ndisNumber}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#9AA9A5]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatCalendarDate(shift.shiftDate)}
                          </span>
                          <span>{shift.startTime} - {shift.endTime} ({shift.totalHours}h)</span>
                          <span className="text-[#5EE0C1] font-medium">
                            {shift.eveHours > 0 ? `Split (${shift.dayHours}h Day / ${shift.eveHours}h Eve)` : 'Daytime'}
                          </span>
                          {shift.travelKms > 0 && <span>Travel: {shift.travelKms} km</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-[#5EE0C1] font-mono">
                          {formatAud(shift.grandTotal)}
                        </div>
                        <Badge variant={shift.status === 'INVOICED' ? 'default' : 'brand'} size="sm">
                          {shift.status === 'INVOICED' ? 'Invoiced' : 'Uninvoiced'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-[#0E1617] border border-[#253130] flex items-center justify-center text-[#9AA9A5]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#F1F5F4]">No shifts logged yet</h4>
                    <p className="text-xs text-[#9AA9A5] mt-1 max-w-sm mx-auto">
                      Use the &quot;Log Shift&quot; button in the header or sidebar to record your support work.
                    </p>
                  </div>
                  <Link href="/clients">
                    <Button variant="secondary" size="sm" className="mt-2 text-xs">
                      View Participants
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* NDIS Participant Budget Health Watch (1 col) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F1F5F4]">Participant Budget Health</h3>
              <span className="text-xs text-[#9AA9A5]">Active Watch</span>
            </div>

            <Card className="p-4 space-y-4 border border-[#253130]">
              {primaryClient ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F1F5F4]">{primaryClient.participantName}</span>
                      <span className="text-[#5EE0C1] font-mono">
                        {primaryClient.budgetUtilizationPercent !== null
                          ? `${100 - primaryClient.budgetUtilizationPercent}% Remaining`
                          : 'No Budget Set'}
                      </span>
                    </div>
                    {primaryClient.budgetUtilizationPercent !== null && (
                      <div className="h-2 w-full rounded-full bg-[#0E1617] overflow-hidden">
                        <div
                          className="h-full bg-[#16A085] rounded-full"
                          style={{ width: `${Math.min(100, 100 - (primaryClient.budgetUtilizationPercent || 0))}%` }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-[#9AA9A5]">
                      <span>{formatAud(Number(primaryClient.allocatedBudgetSpent || 0))} spent</span>
                      <span>
                        {primaryClient.allocatedBudgetTotal
                          ? `${formatAud(Math.max(0, Number(primaryClient.allocatedBudgetTotal) - Number(primaryClient.allocatedBudgetSpent || 0)))} balance remaining`
                          : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  {primaryClient.planManagerAgencyName && (
                    <div className="pt-3 border-t border-[#253130] space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F4]">
                        <Building2 className="h-4 w-4 text-[#5EE0C1]" />
                        Plan Manager Agency
                      </div>
                      <p className="text-xs text-[#9AA9A5]">
                        {primaryClient.planManagerAgencyName}{' '}
                        {primaryClient.planManagerEmail && (
                          <span className="text-[#5EE0C1]">({primaryClient.planManagerEmail})</span>
                        )}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-[#9AA9A5]">No participants registered yet.</p>
                  <Link href="/clients/new">
                    <Button variant="primary" size="sm" className="text-xs">
                      + Add Participant
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
