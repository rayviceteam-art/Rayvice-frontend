'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSuperAdminUser } from '@/lib/types';
import Link from 'next/link';

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F10]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#5EE0C1]" />
          <p className="text-sm text-[#9AA9A5]">Verifying Super-Admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Super Admin Authorization Gate
  const isSuperAdmin = isSuperAdminUser(user);

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F10] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#EF4444]/30 bg-[#131B1C] p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#F1F5F4]">Super-Admin Access Required</h2>
          <p className="mt-2 text-sm text-[#9AA9A5]">
            Your current account (<span className="text-[#F1F5F4] font-medium">{user?.email}</span>) does not have Super-Admin clearance.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0D332D] px-4 py-2.5 text-sm font-semibold text-[#5EE0C1] border border-[#117A65] hover:bg-[#117A65] hover:text-[#F1F5F4] transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Link>
            <button
              onClick={logout}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1F292E] px-4 py-2.5 text-sm font-semibold text-[#9AA9A5] hover:bg-[#2B1010] hover:text-[#EF4444] transition-all"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
