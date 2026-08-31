'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  CreditCard,
  ShieldCheck,
  Mic,
  ArrowRight,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getBusinessProfile } from '@/lib/business-service';
import { BusinessProfile } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api-client';

export default function BillingPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBusinessProfile()
      .then(setProfile)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const trial = profile?.trial;
  const daysRemaining = trial?.daysRemaining ?? 9;

  function handleSubscribe(planName: string, price: string) {
    toast.success(`Stripe checkout redirect for ${planName} (${price}) will activate with Module 6 payments rollout!`, {
      icon: '💳',
      duration: 4000,
    });
  }

  return (
    <AppLayout
      title="Billing & Subscription Plans"
      subtitle="Manage your Australian NDIS Sole-Trader subscription tier & trial quotas"
    >
      <div className="space-y-8">
        {/* 9-Day Free Trial Status Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#117A65] bg-gradient-to-r from-[#0D332D] via-[#102A26] to-[#0A0F10] p-6 shadow-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#16A085] bg-[#0E1617] px-3 py-1 text-xs font-semibold text-[#5EE0C1]">
                <Sparkles className="h-3.5 w-3.5" />
                9-Day Free Trial ({daysRemaining} days remaining)
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
                <span className="font-mono text-[#5EE0C1]">1 / 1 Allowed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
                <div className="h-full bg-[#16A085] w-full rounded-full" />
              </div>
              <p className="text-[11px] text-[#9AA9A5] mt-1.5">Trial limit: 1 Client max</p>
            </div>

            <div className="rounded-xl bg-[#080B0D]/80 p-4 border border-[#253130]">
              <div className="flex items-center justify-between text-xs text-[#9AA9A5] mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-[#F1F5F4]">
                  <Clock className="h-4 w-4 text-[#5EE0C1]" /> Shifts Logged
                </span>
                <span className="font-mono text-[#5EE0C1]">0 / 5 Shifts</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
                <div className="h-full bg-[#16A085] w-0 rounded-full" />
              </div>
              <p className="text-[11px] text-[#9AA9A5] mt-1.5">5 Shifts with auto-split testing</p>
            </div>

            <div className="rounded-xl bg-[#080B0D]/80 p-4 border border-[#253130]">
              <div className="flex items-center justify-between text-xs text-[#9AA9A5] mb-1.5">
                <span className="flex items-center gap-1.5 font-medium text-[#F1F5F4]">
                  <FileText className="h-4 w-4 text-[#5EE0C1]" /> Invoices Generated
                </span>
                <span className="font-mono text-[#5EE0C1]">0 / 2 Invoices</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#182122] overflow-hidden">
                <div className="h-full bg-[#16A085] w-0 rounded-full" />
              </div>
              <p className="text-[11px] text-[#9AA9A5] mt-1.5">2 Test Invoices with Shield</p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <div>
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-[#F1F5F4]">
              Transparent, Australian Sole-Trader Pricing
            </h3>
            <p className="text-sm text-[#9AA9A5] max-w-lg mx-auto">
              Save 5+ hours every week. Guaranteed 100% NDIA price cap compliance and zero Plan Manager invoice rejections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <Card className="p-8 border-[#253130] bg-[#131B1C] hover:border-[#34413F] transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#F1F5F4]">⚡ Starter Plan</span>
                    <Badge variant="default">Part-Time</Badge>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#F1F5F4]">$24</span>
                    <span className="text-sm font-medium text-[#9AA9A5]">AUD / month</span>
                  </div>
                  <p className="text-xs text-[#9AA9A5] mt-2">
                    Ideal for independent sole traders managing up to 5 NDIS participants.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#253130] text-xs">
                  <div className="flex items-center gap-2.5 text-[#F1F5F4]">
                    <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
                    <span><strong>Up to 5 Active Participants</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#F1F5F4]">
                    <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
                    <span><strong>Unlimited Shift Logging</strong> (Manual)</span>
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
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleSubscribe('Starter Plan', '$24 AUD/mo')}
                >
                  Subscribe with Stripe — $24 AUD/mo
                </Button>
              </div>
            </Card>

            {/* Pro Plan (Highlighted) */}
            <Card className="p-8 border-[#117A65] bg-gradient-to-b from-[#0D332D]/40 to-[#131B1C] shadow-glow flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#16A085] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#F1F5F4] flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#5EE0C1]" /> 🚀 Pro Plan
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#5EE0C1]">$44</span>
                    <span className="text-sm font-medium text-[#9AA9A5]">AUD / month</span>
                  </div>
                  <p className="text-xs text-[#9AA9A5] mt-2">
                    For full-time support workers & independent carer agencies wanting Voice AI and unlimited scaling.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#117A65]/40 text-xs">
                  <div className="flex items-center gap-2.5 text-[#F1F5F4]">
                    <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
                    <span><strong>Unlimited Participants & Clients</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#F1F5F4]">
                    <Check className="h-4 w-4 text-[#5EE0C1] shrink-0" />
                    <span><strong>Unlimited Shifts & Unlimited Invoices</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#5EE0C1] font-semibold">
                    <Mic className="h-4 w-4 text-[#5EE0C1] shrink-0" />
                    <span>🎙️ Unlimited Voice-to-Shift AI Logging</span>
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
                <Button
                  variant="primary"
                  className="w-full shadow-glow flex items-center justify-center gap-2"
                  onClick={() => handleSubscribe('Pro Plan', '$44 AUD/mo')}
                >
                  Upgrade to Pro — $44 AUD/mo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
