'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CreditCard,
  ShieldAlert,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { billingService } from '@/lib/billing-service';
import { getBusinessProfile } from '@/lib/business-service';
import { shiftsService } from '@/lib/shifts-service';
import { BillingStatus, BusinessProfile } from '@/lib/types';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-client';
import { formatCalendarDate } from '@/lib/format';
import { TrialUsageBanner } from '@/components/billing/TrialUsageBanner';
import { PlanCards } from '@/components/billing/PlanCards';
import { ProdaExportButton } from '@/components/invoices/ProdaExportButton';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can, refreshUser } = useAuth();

  const isOwner = can('OWNER');
  const isOfficeManager = can('OFFICE_MANAGER');
  const isTechnician = !isOwner && !isOfficeManager;

  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [shiftsCount, setShiftsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBillingUnavailable, setIsBillingUnavailable] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Handle return from Stripe checkout
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast.success('Subscription activated successfully! Welcome to your upgraded plan.');
      refreshUser().catch(() => {});
      router.replace('/settings/billing');
    } else if (checkoutStatus === 'cancelled') {
      toast('Checkout was cancelled. You have not been charged.');
      router.replace('/settings/billing');
    }
  }, [searchParams, router, refreshUser]);

  const loadBillingData = useCallback(async () => {
    if (isTechnician) return;
    setIsLoading(true);
    setIsBillingUnavailable(false);

    try {
      const [status, bizProfile] = await Promise.all([
        billingService.getStatus().catch((err) => {
          const code = getApiErrorCode(err);
          if (code === 'BILLING_UNAVAILABLE' || err?.response?.status === 503) {
            setIsBillingUnavailable(true);
          }
          // Fallback initial state if billing status fails
          return null;
        }),
        getBusinessProfile().catch(() => null),
      ]);

      if (status) {
        setBilling(status);
      } else if (bizProfile) {
        // Synthesize fallback from business profile if billing endpoint degraded
        const isPro = bizProfile.status === 'ACTIVE';
        setBilling({
          planTier: isPro ? 'PRO' : 'TRIAL',
          subscriptionStatus: bizProfile.status,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          limits: {
            clients: isPro ? null : 1,
            invoicesPerMonth: isPro ? null : 2,
            voice: isPro,
          },
          usage: {
            activeClients: 1,
            invoicesThisMonth: 0,
            trialDaysRemaining: bizProfile.trial?.daysRemaining ?? 9,
          },
        });
      }

      if (bizProfile) {
        setProfile(bizProfile);
      }

      // Read shifts count
      const localShifts = shiftsService.getRecent(100);
      setShiftsCount(localShifts.length);
    } catch {
      // Degrade gracefully
    } finally {
      setIsLoading(false);
    }
  }, [isTechnician]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleSubscribe = async (plan: 'STARTER' | 'PRO') => {
    if (!isOwner) {
      toast.error("You don't have permission to modify subscriptions.");
      return;
    }

    setIsRedirecting(true);
    toast('Redirecting to Stripe…', { icon: '💳' });
    try {
      const { url } = await billingService.createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      setIsRedirecting(false);
      const code = getApiErrorCode(err);
      if (code === 'ALREADY_SUBSCRIBED') {
        toast.error('You already have an active subscription.');
      } else if (code === 'BILLING_UNAVAILABLE' || (err as any)?.response?.status === 503) {
        setIsBillingUnavailable(true);
      } else {
        toast.error(getApiErrorMessage(err, 'Unable to initiate Stripe checkout.'));
      }
    }
  };

  const handleOpenPortal = async () => {
    if (!isOwner) {
      toast.error("You don't have permission to manage billing.");
      return;
    }

    setIsRedirecting(true);
    toast('Opening Stripe Customer Portal…', { icon: '⚙️' });
    try {
      const { url } = await billingService.openPortal();
      window.location.href = url;
    } catch (err) {
      setIsRedirecting(false);
      const code = getApiErrorCode(err);
      if (code === 'NO_SUBSCRIPTION') {
        toast.error('No active Stripe subscription found for this business.');
      } else if (code === 'BILLING_UNAVAILABLE' || (err as any)?.response?.status === 503) {
        setIsBillingUnavailable(true);
      } else {
        toast.error(getApiErrorMessage(err, 'Unable to open Stripe customer portal.'));
      }
    }
  };

  if (isTechnician) {
    return (
      <AppLayout title="Billing" subtitle="Subscription & billing management">
        <div className="rounded-card border border-border bg-surface p-12 text-center max-w-md mx-auto space-y-3 mt-8">
          <ShieldAlert className="h-10 w-10 text-[#F59E0B] mx-auto" />
          <h3 className="text-h4 font-bold text-text-primary">
            Billing is owner-only
          </h3>
          <p className="text-body2 text-text-secondary">
            Only business owners can modify subscription tiers and manage billing accounts.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout
        title="Billing & Subscription Plans"
        subtitle="Manage your Australian NDIS Sole-Trader subscription tier & trial quotas"
      >
        <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-body2">Loading billing & subscription details…</p>
        </div>
      </AppLayout>
    );
  }

  const effectiveBilling: BillingStatus = billing ?? {
    planTier: 'TRIAL',
    subscriptionStatus: 'TRIALING',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    limits: { clients: 1, invoicesPerMonth: 2, voice: false },
    usage: { activeClients: 1, invoicesThisMonth: 0, trialDaysRemaining: 9 },
  };

  const isTrial = effectiveBilling.planTier === 'TRIAL';
  const planAmount = effectiveBilling.planTier === 'PRO' ? '$44 AUD / month' : '$24 AUD / month';

  return (
    <AppLayout
      title="Billing & Subscription Plans"
      subtitle="Manage your Australian NDIS Sole-Trader subscription tier & trial quotas"
    >
      <div className="space-y-8 pb-16">
        {/* PRODA Export Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-card border border-border bg-surface">
          <div>
            <h4 className="text-body2 font-semibold text-text-primary">
              NDIS Government PRODA Export
            </h4>
            <p className="text-caption text-text-secondary">
              Generate bulk PRODA CSV claims files directly formatted for the Australian Myplace provider portal.
            </p>
          </div>
          <ProdaExportButton planTier={effectiveBilling.planTier} />
        </div>

        {/* 503 Inline Notice if Billing is Unavailable */}
        {isBillingUnavailable && (
          <div className="rounded-card border border-[#92400E] bg-[#2A210B] p-4 text-[#F59E0B] flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-semibold block">Notice</strong>
              <span>Billing is temporarily unavailable. Please try again shortly.</span>
            </div>
          </div>
        )}

        {/* 1. Trial Banner (if on TRIAL) */}
        {isTrial && (
          <TrialUsageBanner
            billing={effectiveBilling}
            shiftsLoggedCount={shiftsCount}
          />
        )}

        {/* 2. Current Plan Active Card (if on STARTER or PRO) */}
        {!isTrial && (
          <div className="rounded-2xl border border-[#117A65] bg-[#0D332D]/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge tone="brand" className="text-xs px-2.5 py-0.5">
                  {effectiveBilling.planTier} Plan Active
                </Badge>
                {effectiveBilling.subscriptionStatus && (
                  <span className="text-caption text-[#22C55E] uppercase font-mono tracking-wider font-semibold">
                    ● {effectiveBilling.subscriptionStatus}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {effectiveBilling.planTier === 'PRO' ? 'Pro Plan' : 'Starter Plan'} — {planAmount}
              </h2>
              <p className="text-caption text-text-secondary">
                {effectiveBilling.cancelAtPeriodEnd
                  ? `Cancels on ${
                      effectiveBilling.currentPeriodEnd
                        ? formatCalendarDate(effectiveBilling.currentPeriodEnd)
                        : 'end of period'
                    }`
                  : `Renews on ${
                      effectiveBilling.currentPeriodEnd
                        ? formatCalendarDate(effectiveBilling.currentPeriodEnd)
                        : 'next billing cycle'
                    }`}
              </p>
            </div>

            {isOwner && (
              <Button
                variant="secondary"
                onClick={handleOpenPortal}
                disabled={isRedirecting}
                className="flex items-center gap-2 border-[#117A65] text-[#5EE0C1] hover:bg-[#0D332D]"
              >
                <CreditCard size={16} />
                Manage Subscription
                <ExternalLink size={14} />
              </Button>
            )}
          </div>
        )}

        {/* 3. Pricing Tiers Section */}
        <div>
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-[#F1F5F4]">
              Transparent, Australian Sole-Trader Pricing
            </h3>
            <p className="text-sm text-[#9AA9A5] max-w-lg mx-auto">
              Save 5+ hours every week. Guaranteed 100% NDIA price cap compliance and zero Plan Manager invoice rejections.
            </p>
          </div>

          <PlanCards
            billing={effectiveBilling}
            onSubscribe={handleSubscribe}
            isLoading={isRedirecting}
            canManage={isOwner}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          title="Billing & Subscription Plans"
          subtitle="Manage your Australian NDIS Sole-Trader subscription tier & trial quotas"
        >
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-body2">Loading billing & subscription details…</p>
          </div>
        </AppLayout>
      }
    >
      <BillingContent />
    </Suspense>
  );
}

