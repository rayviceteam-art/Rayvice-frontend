'use client';

import React from 'react';
import { Zap, Crown, Check, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BillingStatus } from '@/lib/types';

interface PlanCardsProps {
  billing: BillingStatus;
  onSubscribe: (plan: 'STARTER' | 'PRO') => void;
  isLoading?: boolean;
  canManage: boolean;
}

export const PlanCards: React.FC<PlanCardsProps> = ({
  billing,
  onSubscribe,
  isLoading = false,
  canManage,
}) => {
  const currentTier = billing.planTier;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Starter Plan */}
      <Card className="p-8 border border-[#117A65]/70 bg-gradient-to-b from-[#0D332D]/40 to-[#131B1C] shadow-glow flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#16A085]">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#F1F5F4] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#5EE0C1]" /> Starter Plan
              </span>
              <Badge tone="brand">Part-Time</Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#5EE0C1]">$24</span>
              <span className="text-sm font-medium text-[#9AA9A5]">AUD / month</span>
            </div>
            <p className="text-xs text-[#9AA9A5] mt-2">
              Ideal for independent sole traders managing up to 5 NDIS participants.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#117A65]/40 text-xs">
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>
                <strong>Up to 5 Active Participants</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>
                <strong>Unlimited Shift Logging</strong> (Manual)
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>Deterministic Rate-Splitter (Day, Evening, Weekends)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>Pre-Flight Auto-Rejection Shield (20 invoices/mo)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>Direct Plan Manager Email Dispatch</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {currentTier === 'STARTER' ? (
            <Button variant="secondary" disabled className="w-full opacity-60 cursor-default">
              Current Plan
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full shadow-glow flex items-center justify-center gap-2"
              disabled={isLoading || !canManage}
              onClick={() => onSubscribe('STARTER')}
            >
              Subscribe with Stripe — $24 AUD/mo
            </Button>
          )}
        </div>
      </Card>

      {/* Pro Plan (Highlighted) */}
      <Card className="p-8 border-[#117A65] bg-gradient-to-b from-[#0D332D]/40 to-[#131B1C] shadow-glow flex flex-col justify-between relative overflow-hidden transition-all hover:border-[#16A085]">
        <div className="absolute top-0 right-0 bg-[#16A085] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          Recommended
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#F1F5F4] flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#5EE0C1]" /> Pro Plan
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#5EE0C1]">$44</span>
              <span className="text-sm font-medium text-[#9AA9A5]">AUD / month</span>
            </div>
            <p className="text-xs text-[#9AA9A5] mt-2">
              For full-time support workers & independent carer agencies wanting unlimited scaling.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#117A65]/40 text-xs">
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>
                <strong>Unlimited Participants & Clients</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>
                <strong>Unlimited Shifts & Unlimited Invoices</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>Pre-Flight Auto-Rejection Shield Active</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>ATO Compliant Tax Invoices & PRODA CSV Export</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F1F5F4]">
              <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
              <span>Auto-Remittance Follow-Up Reminders</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {currentTier === 'PRO' ? (
            <Button variant="secondary" disabled className="w-full opacity-60 cursor-default">
              Current Plan
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full shadow-glow flex items-center justify-center gap-2"
              disabled={isLoading || !canManage}
              onClick={() => onSubscribe('PRO')}
            >
              Upgrade to Pro — $44 AUD/mo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
