'use client';

import React from 'react';
import { Sparkles, Users, Clock, FileText } from 'lucide-react';
import { BillingStatus } from '@/lib/types';

interface TrialUsageBannerProps {
  billing: BillingStatus;
  shiftsLoggedCount?: number;
}

export const TrialUsageBanner: React.FC<TrialUsageBannerProps> = ({
  billing,
  shiftsLoggedCount = 0,
}) => {
  const daysRemaining = billing.usage.trialDaysRemaining ?? 9;
  const activeClients = billing.usage.activeClients;
  const invoicesGenerated = billing.usage.invoicesThisMonth;

  const clientsPercent = Math.min(100, Math.round((activeClients / 1) * 100));
  const shiftsPercent = Math.min(100, Math.round((shiftsLoggedCount / 5) * 100));
  const invoicesPercent = Math.min(100, Math.round((invoicesGenerated / 2) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#117A65] bg-gradient-to-r from-[#0D332D] via-[#102A26] to-[#0A0F10] p-6 shadow-glow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#16A085] bg-[#0E1617] px-3 py-1 text-xs font-semibold text-[#5EE0C1]">
            <Sparkles className="h-3.5 w-3.5" />
            🎁 9-Day Free Trial Active ({daysRemaining} days remaining)
          </div>
          <h2 className="text-xl font-bold text-[#F1F5F4]">
            You are on the 9-Day Limited Free Trial
          </h2>
          <p className="text-xs text-[#9AA9A5] max-w-xl">
            Your trial grants full access to test the live NDIS rate-splitting engine, Pre-Flight rejection shield, and invoice generator with <strong>1 active participant</strong>.
          </p>
        </div>
      </div>

      {/* Trial Quota Usage Progress */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#117A65]/40">
        <div className="rounded-xl bg-[#080B0D]/80 p-4 border border-[#253130]">
          <div className="flex items-center justify-between text-xs text-[#9AA9A5] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#F1F5F4]">
              <Users className="h-4 w-4 text-[#5EE0C1]" /> Active Participants
            </span>
            <span className="font-mono text-[#5EE0C1]">{activeClients} / 1 Allowed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
            <div
              className="h-full bg-[#16A085] rounded-full transition-all"
              style={{ width: `${clientsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9AA9A5] mt-1.5">Trial limit: 1 Client max</p>
        </div>

        <div className="rounded-xl bg-[#080B0D]/80 p-4 border border-[#253130]">
          <div className="flex items-center justify-between text-xs text-[#9AA9A5] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#F1F5F4]">
              <Clock className="h-4 w-4 text-[#5EE0C1]" /> Shifts Logged
            </span>
            <span className="font-mono text-[#5EE0C1]">{shiftsLoggedCount} / 5 Shifts</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
            <div
              className="h-full bg-[#16A085] rounded-full transition-all"
              style={{ width: `${shiftsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9AA9A5] mt-1.5">5 Shifts with auto-split testing</p>
        </div>

        <div className="rounded-xl bg-[#080B0D]/80 p-4 border border-[#253130]">
          <div className="flex items-center justify-between text-xs text-[#9AA9A5] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#F1F5F4]">
              <FileText className="h-4 w-4 text-[#5EE0C1]" /> Invoices Generated
            </span>
            <span className="font-mono text-[#5EE0C1]">{invoicesGenerated} / 2 Invoices</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
            <div
              className="h-full bg-[#16A085] rounded-full transition-all"
              style={{ width: `${invoicesPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9AA9A5] mt-1.5">2 Test Invoices with Shield</p>
        </div>
      </div>
    </div>
  );
};
