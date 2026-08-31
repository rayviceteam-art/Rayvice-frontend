'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ShiftModal } from '../shifts/ShiftModal';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

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
