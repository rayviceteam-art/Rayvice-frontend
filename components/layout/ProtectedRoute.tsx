'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

/**
 * FRONTEND-03 §14 — Route Protection.
 * "Unauthorized users must never access protected pages." Since the
 * access token lives only in memory (not a readable cookie), route
 * protection happens client-side: we wait for the auth bootstrap to
 * finish, then redirect if there's no authenticated user.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, authError, retryBootstrap } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only a real session rejection sends the user to /login. A network failure
    // (offline, or the backend waking up from a cold start) must never log
    // someone out — that is what made the browser Back button land on /login.
    if (!isLoading && !isAuthenticated && authError !== 'network') {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, authError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated && authError === 'network') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h2 className="text-h3 text-text-primary">Reconnecting…</h2>
        <p className="text-body2 text-text-secondary">
          We couldn&apos;t reach the server. Your session is still active — check your connection and try again.
        </p>
        <button
          type="button"
          onClick={retryBootstrap}
          className="mt-2 inline-flex h-11 items-center gap-2 rounded bg-brand px-5 text-body2 font-medium text-background transition-colors hover:bg-brand-hover"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
