'use client';

import React from 'react';
import { Menu, Plus, Mic, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { isSuperAdminUser } from '@/lib/types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenShiftModal: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenMobileMenu, onOpenShiftModal, title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const isSuperAdmin = isSuperAdminUser(user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#253130] bg-[#0A0F10]/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#F1F5F4]">{title}</h1>
            {subtitle && <p className="hidden sm:block text-xs text-[#9AA9A5]">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg border border-[#7E22CE] bg-[#2E1065] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#C084FC] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-all"
          >
            <Building2 className="h-3.5 w-3.5 text-[#C084FC]" />
            <span className="hidden xs:inline sm:inline">Super Admin</span>
          </Link>
        )}

        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-[#117A65] bg-[#0D332D] px-3 py-1 text-xs font-semibold text-[#5EE0C1]">
          <Sparkles className="h-3.5 w-3.5" /> 9-Day Free Trial (1 Client Mode)
        </div>

        <Button
          variant="primary"
          size="sm"
          className="shadow-glow flex items-center gap-2"
          onClick={onOpenShiftModal}
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">+ Log Shift (Voice)</span>
          <span className="sm:hidden">+ Shift</span>
        </Button>
      </div>
    </header>
  );
}
