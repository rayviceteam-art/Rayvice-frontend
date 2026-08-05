'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

/**
 * FRONTEND-03 §14 — Route Protection.
 * "Unauthorized users must never access protected pages." Since the
 * access token lives only in memory (not a readable cookie), route
 * protection happens client-side: we wait for the auth bootstrap to
 * finish, then redirect if there's no authenticated user.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
