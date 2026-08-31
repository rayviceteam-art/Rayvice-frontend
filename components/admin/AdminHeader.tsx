'use client';

import React from 'react';
import { Menu, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AdminHeaderProps {
  title: string;
  description?: string;
  onOpenMobile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminHeader({
  title,
  description,
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#253130] bg-[#0A0F10]/95 px-4 sm:px-8 backdrop-blur">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#253130] bg-[#131B1C] text-[#9AA9A5] hover:text-[#F1F5F4] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#F1F5F4]">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#2E1065] px-1.5 py-0.5 text-[10px] font-bold text-[#C084FC] border border-[#7E22CE]">
              SUPER-ADMIN
            </span>
          </div>
          {description && (
            <p className="hidden sm:block text-xs text-[#9AA9A5]">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#253130] bg-[#131B1C] px-3 py-1.5 text-xs font-medium text-[#9AA9A5] hover:bg-[#182122] hover:text-[#F1F5F4] disabled:opacity-50 transition-all"
            title="Refresh live metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#C084FC]' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        )}

        <div className="flex items-center gap-2 rounded-xl border border-[#253130] bg-[#131B1C] px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5EE0C1] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5EE0C1]"></span>
          </span>
          <span className="text-[11px] font-medium text-[#9AA9A5] hidden sm:inline">Production DB</span>
        </div>
      </div>
    </header>
  );
}
