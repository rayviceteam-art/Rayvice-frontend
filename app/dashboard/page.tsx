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
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal text-sm font-bold text-white shadow-sm">
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">Rayvice</span>
        </div>
        <Button variant="secondary" className="w-auto" onClick={handleLogout} isLoading={isLoggingOut}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {user && user.isEmailVerified === false && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-control border border-amber-200 bg-amber-50/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <MailWarning className="h-4 w-4 shrink-0 text-warning" />
              Please verify your email address to unlock all features.
            </div>
            <Button
              variant="secondary"
              className="w-auto shrink-0 px-3 py-1.5 text-xs"
              onClick={handleResendVerification}
              isLoading={isResending}
            >
              Resend email
            </Button>
          </div>
        )}

        <Card>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Welcome, {user?.firstName}.</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            The authentication and organization foundation is live. Dashboard widgets, CRM, and the rest of the
            platform will land here in later modules.
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
