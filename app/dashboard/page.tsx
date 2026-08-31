'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut, MailWarning, Sparkles, Users, Clock, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth-context';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';

/**
 * FRONTEND-GLOBAL-RULES §3 — "Dashboard First Philosophy": after login,
 * users land here. Shows 9-day trial status, participant quota (1 client limit),
 * and upcoming NDIS OS core modules.
 */
function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  }

  async function handleResendVerification() {
    if (!user) return;
    setIsResending(true);
    try {
      await authService.resendVerification(user.email);
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-[#F1F5F4]">
      <header className="flex items-center justify-between border-b border-[#253130] bg-[#0A0F10] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D332D] text-sm font-bold text-[#5EE0C1] shadow-glow border border-[#117A65]">
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F1F5F4]">Rayvice</span>
          <span className="ml-2 rounded-full border border-[#117A65] bg-[#0D332D] px-2.5 py-0.5 text-xs font-semibold text-[#5EE0C1]">
            NDIS Sole-Trader OS
          </span>
        </div>
        <Button variant="secondary" className="w-auto" onClick={handleLogout} isLoading={isLoggingOut}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {user && user.isEmailVerified === false && (
          <div className="flex items-center justify-between gap-4 rounded-card border border-[#92400E] bg-[#2A210B] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[#FEF3C7]">
              <MailWarning className="h-4 w-4 shrink-0 text-[#F59E0B]" />
              Please verify your email address to unlock all features.
            </div>
            <Button
              variant="secondary"
              className="w-auto shrink-0 px-3 py-1.5 text-xs text-[#FEF3C7] border-[#92400E] hover:bg-[#382D0F]"
              onClick={handleResendVerification}
              isLoading={isResending}
            >
              Resend email
            </Button>
          </div>
        )}

        {/* 9-Day Free Trial Banner */}
        <div className="relative overflow-hidden rounded-xl border border-[#117A65] bg-gradient-to-r from-[#0D332D] via-[#102A26] to-[#0A0F10] p-6 shadow-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#16A085] bg-[#0E1617] px-3 py-1 text-xs font-semibold text-[#5EE0C1]">
                <Sparkles className="h-3.5 w-3.5 text-[#5EE0C1]" />
                9-Day Free Trial (Limited Access Mode)
              </div>
              <h2 className="text-xl font-bold text-[#F1F5F4]">
                Welcome to Rayvice, {user?.firstName}!
              </h2>
              <p className="text-sm text-[#9AA9A5] max-w-xl">
                Your 9-day trial is active. You can manage <strong>1 participant</strong>, test live NDIS evening/weekend rate-splitting on up to <strong>5 shifts</strong>, and generate <strong>2 test invoices</strong> with zero rejection shield.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="primary"
                className="w-auto shadow-glow flex items-center gap-2"
                onClick={() => toast('Subscription billing portal will open upon Module 6 Stripe rollout.', { icon: '💳' })}
              >
                Upgrade Plan
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trial Quotas Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#117A65]/40">
            <div className="flex items-center gap-3 rounded-lg bg-[#080B0D]/70 p-3 border border-[#253130]">
              <Users className="h-5 w-5 text-[#5EE0C1] shrink-0" />
              <div>
                <p className="text-xs text-[#9AA9A5]">Active Participants</p>
                <p className="text-sm font-semibold text-[#F1F5F4]">Max 1 Client <span className="text-xs text-[#5EE0C1]">(Trial Limit)</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[#080B0D]/70 p-3 border border-[#253130]">
              <Clock className="h-5 w-5 text-[#5EE0C1] shrink-0" />
              <div>
                <p className="text-xs text-[#9AA9A5]">Shift Logging</p>
                <p className="text-sm font-semibold text-[#F1F5F4]">Up to 5 Shifts <span className="text-xs text-[#5EE0C1]">(Auto-Split)</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[#080B0D]/70 p-3 border border-[#253130]">
              <FileText className="h-5 w-5 text-[#5EE0C1] shrink-0" />
              <div>
                <p className="text-xs text-[#9AA9A5]">Compliant Invoices</p>
                <p className="text-sm font-semibold text-[#F1F5F4]">Up to 2 Invoices <span className="text-xs text-[#5EE0C1]">(PDF Shield)</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules & Feature Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#5EE0C1]" />
              <h3 className="text-base font-semibold text-[#F1F5F4]">Module 1: Tenant & Auth</h3>
            </div>
            <p className="text-xs text-[#9AA9A5] leading-relaxed">
              Multi-tenant organization isolated by business ID, secure JWT session management with refresh token rotation, brute-force lockout protection, and Google OAuth 2.0.
            </p>
            <div className="text-xs font-mono text-[#5EE0C1] bg-[#0E1617] p-2 rounded border border-[#253130]">
              Status: Verified & Live in Production
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#16A085]" />
              <h3 className="text-base font-semibold text-[#F1F5F4]">Upcoming NDIS Engine</h3>
            </div>
            <p className="text-xs text-[#9AA9A5] leading-relaxed">
              Modules 2–5 will provide automated Australian NDIS rate splitting (8:00 PM evening threshold, Saturday/Sunday/Holiday loadings), Voice-to-Shift logging, and direct Plan Manager invoicing.
            </p>
            <div className="text-xs font-mono text-[#9AA9A5] bg-[#0E1617] p-2 rounded border border-[#253130]">
              Starter: $24 AUD/mo • Pro: $44 AUD/mo
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
