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
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { getBusinessProfile } from '@/lib/business-service';
import { BusinessProfile } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api-client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBusinessProfile()
      .then(setProfile)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const compliance = profile?.compliance;
  const trial = profile?.trial;
  const daysRemaining = trial?.daysRemaining ?? 9;

  // Sample shifts preview to demonstrate live rate-splitting and auto-split values
  const recentShifts = [
    {
      id: 'shift-1',
      clientName: 'Sarah Jenkins',
      ndisNumber: '430123456',
      date: 'Today',
      time: '18:00 – 21:30 (3.5 hrs)',
      splitType: 'Daytime + Evening Split',
      travel: '12 km',
      totalAmount: 258.39,
    },
    {
      id: 'shift-2',
      clientName: 'David Miller',
      ndisNumber: '430889211',
      date: 'Yesterday',
      time: '09:00 – 13:00 (4.0 hrs)',
      splitType: 'Saturday Weekend Loading',
      travel: '5 km',
      totalAmount: 385.13,
    },
  ];

  return (
    <AppLayout
      title={`Welcome back, ${user?.firstName || 'Support Worker'}`}
      subtitle="NDIS Sole-Trader Billing, Timesheets & Auto-Rejection Shield Dashboard"
    >
      <div className="space-y-6">
        {/* Compliance Incomplete Alert Banner (if ABN / Banking not setup) */}
        {!compliance?.isCompliant && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#92400E] bg-[#2A210B] p-4 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#FEF3C7]">
                  Setup Incomplete: Action Required for Tax Invoices
                </h4>
                <p className="text-[#FEF3C7]/80 mt-0.5">
                  Your Australian Business Number (ABN) or EFT bank details need to be configured in Settings to enable 1-Click invoice generation.
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="secondary" size="sm" className="shrink-0 border-[#92400E] text-[#FEF3C7] hover:bg-[#382D0F]">
                Complete Business Settings
              </Button>
            </Link>
          </div>
        )}

        {/* 9-Day Free Trial Notice Banner */}
        <div className="relative overflow-hidden rounded-xl border border-[#117A65] bg-gradient-to-r from-[#0D332D] via-[#102A26] to-[#0A0F10] p-5 shadow-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#16A085] bg-[#0E1617] px-2.5 py-0.5 text-[11px] font-semibold text-[#5EE0C1]">
                <Sparkles className="h-3 w-3" />
                9-Day Free Trial ({daysRemaining} days remaining)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#F1F5F4]">
                1-Participant Trial Mode Active
              </h2>
              <p className="text-xs text-[#9AA9A5] max-w-xl">
                Test live NDIS rate splitting on shifts and generate test invoices with zero rejections. Upgrade anytime to Starter ($24 AUD/mo) or Pro ($44 AUD/mo).
              </p>
            </div>
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
              <span className="text-xs font-medium text-[#9AA9A5]">This Week's Logged Shifts</span>
              <div className="rounded-lg bg-[#0D332D] p-2 text-[#5EE0C1] border border-[#117A65]">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">$643.52</span>
              <span className="text-xs font-medium text-[#9AA9A5] ml-1">AUD</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#22C55E]">
              <TrendingUp className="h-3 w-3" />
              <span>2 shifts logged with auto-split math</span>
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
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">2 Shifts</span>
            </div>
            <div className="mt-2 text-[11px] text-[#9AA9A5]">
              Ready for Shield validation & batch invoicing
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
              <span className="text-2xl font-bold tracking-tight text-[#F1F5F4]">1 Client</span>
              <span className="text-xs text-[#5EE0C1] font-semibold">(Trial Quota)</span>
            </div>
            <div className="mt-2 text-[11px] text-[#9AA9A5]">
              Sarah Jenkins (NDIS: 430123456)
            </div>
          </Card>
        </div>

        {/* Uninvoiced Shifts Batch Callout Banner */}
        <div className="rounded-xl border border-[#117A65] bg-[#0D332D]/70 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#0E1617] p-2 text-[#5EE0C1] border border-[#16A085]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#F1F5F4]">
                  ⚡ 2 unbilled shifts ready for invoicing ($643.52 AUD)
                </h4>
                <p className="text-xs text-[#9AA9A5]">
                  Auto-Rejection Shield verifies 2026 NDIA price caps, evening 8:00 PM splits, and ABN compliance before dispatch.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="shadow-glow shrink-0"
              onClick={() => toast('Invoice batch generation screen will open with Module 5 Invoicing rollout!', { icon: '📄' })}
            >
              Batch Generate Invoices (Shield)
            </Button>
          </div>
        </div>

        {/* Split Grid: Recent Shifts & Budget Watch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shifts Table (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F1F5F4]">Recent Shift Logs & Split Math</h3>
              <span className="text-xs text-[#5EE0C1]">2026 NDIA Rates</span>
            </div>

            <Card className="overflow-hidden border border-[#253130]">
              <div className="divide-y divide-[#253130]">
                {recentShifts.map((shift) => (
                  <div key={shift.id} className="p-4 hover:bg-[#182122]/50 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#F1F5F4]">{shift.clientName}</span>
                        <span className="text-[10px] text-[#9AA9A5]">NDIS: {shift.ndisNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#9AA9A5]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {shift.date}
                        </span>
                        <span>{shift.time}</span>
                        <span className="text-[#5EE0C1] font-medium">{shift.splitType}</span>
                        {shift.travel && <span>Travel: {shift.travel}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-[#5EE0C1] font-mono">
                        ${shift.totalAmount.toFixed(2)} AUD
                      </div>
                      <Badge variant="brand" size="sm">Uninvoiced</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* NDIS Participant Budget Health Watch (1 col) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F1F5F4]">Participant Budget Health</h3>
              <span className="text-xs text-[#9AA9A5]">Active Watch</span>
            </div>

            <Card className="p-4 space-y-4 border border-[#253130]">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F1F5F4]">Sarah Jenkins</span>
                  <span className="text-[#5EE0C1] font-mono">82% Remaining</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#0E1617] overflow-hidden">
                  <div className="h-full bg-[#16A085] w-[82%] rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-[#9AA9A5]">
                  <span>$2,700 spent</span>
                  <span>$12,300 balance remaining</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#253130] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F5F4]">
                  <Building2 className="h-4 w-4 text-[#5EE0C1]" />
                  Plan Manager Agency
                </div>
                <p className="text-xs text-[#9AA9A5]">
                  My Plan Manager (<span className="text-[#5EE0C1]">invoices@myplanmanager.com.au</span>)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
