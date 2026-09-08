import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from './ProtectedRoute';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShiftModal } from '../shifts/ShiftModal';
import { useAuth } from '@/lib/auth-context';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const { business } = useAuth();

  const isTrialExpired =
    business?.effectiveStatus === 'READ_ONLY' ||
    Boolean(business?.trial?.isExpired) ||
    (business?.status === 'TRIALING' && business?.trialEndsAt && new Date(business.trialEndsAt).getTime() <= Date.now());

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#080B0D] text-[#F1F5F4]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:shrink-0">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 max-w-xs animate-in slide-in-from-left">
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Header
            title={title}
            subtitle={subtitle}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenShiftModal={() => setIsShiftModalOpen(true)}
          />

          {isTrialExpired && (
            <div className="border-b border-[#EF4444]/30 bg-[#EF4444]/15 px-4 py-2.5 sm:px-8 text-xs text-[#FCA5A5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#EF4444]" />
                <span>
                  <strong>Your 9-day free trial has expired.</strong> Your account is currently in Read-Only mode. Creating new participants, shifts, and invoices is locked until upgraded.
                </span>
              </div>
              <Link
                href="/settings/billing"
                className="inline-flex items-center gap-1 rounded-md bg-[#EF4444] px-3 py-1 text-xs font-bold text-white hover:bg-[#DC2626] transition-colors shrink-0"
              >
                Upgrade Plan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Shift Logger Modal */}
        <ShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
