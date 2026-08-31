'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut, MailWarning } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth-context';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';

/**
 * FRONTEND-GLOBAL-RULES §3 — "Dashboard First Philosophy": after login,
 * users must always land here. This is a placeholder for THIS module only —
 * widgets, CRM, calendar, etc. belong to later modules and are intentionally
 * not built yet.
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
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-[#253130] bg-[#0A0F10] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D332D] text-sm font-bold text-[#5EE0C1] shadow-glow border border-[#117A65]">
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F1F5F4]">Rayvice</span>
        </div>
        <Button variant="secondary" className="w-auto" onClick={handleLogout} isLoading={isLoggingOut}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {user && user.isEmailVerified === false && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-card border border-[#92400E] bg-[#2A210B] px-4 py-3">
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

        <Card className="p-8">
          <h1 className="text-xl font-bold tracking-tight text-[#F1F5F4]">Welcome, {user?.firstName}.</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#9AA9A5]">
            Your NDIS Sole-Trader Billing & Compliance OS foundation is active. Participant management, Voice Shift Logging, and Automated Invoicing modules are ready to be built.
          </p>
        </Card>
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
