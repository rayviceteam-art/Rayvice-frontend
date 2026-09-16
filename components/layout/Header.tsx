'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Plus, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenShiftModal: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenMobileMenu, onOpenShiftModal, title, subtitle }: HeaderProps) {
  const { business } = useAuth();
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    const expired =
      business?.effectiveStatus === 'READ_ONLY' ||
      Boolean(business?.trial?.isExpired) ||
      (business?.status === 'TRIALING' && business?.trialEndsAt && new Date(business.trialEndsAt).getTime() <= Date.now());
    setIsTrialExpired(Boolean(expired));
  }, [business]);

  const isPaid = business?.status === 'ACTIVE';
  const daysRemaining = business?.trial?.daysRemaining ?? 9;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#253130] bg-[#0A0F10]/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Image
            src="/brand/rayvice-mark.svg"
            alt="Rayvice"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
            priority
          />
        </Link>

        {title && (
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#F1F5F4]">{title}</h1>
            {subtitle && <p className="hidden sm:block text-xs text-[#9AA9A5]">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isTrialExpired ? (
          <Link
            href="/settings/billing"
            className="hidden md:flex items-center gap-1.5 rounded-full border border-[#EF4444]/50 bg-[#EF4444]/15 px-3 py-1 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/25 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Trial Expired (Read-Only)
          </Link>
        ) : isPaid ? (
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-[#16A085]/40 bg-[#0D332D] px-3 py-1 text-xs font-semibold text-[#5EE0C1]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active Plan
          </div>
        ) : (
          <Link
            href="/settings/billing"
            className="hidden md:flex items-center gap-1.5 rounded-full border border-[#117A65] bg-[#0D332D] px-3 py-1 text-xs font-semibold text-[#5EE0C1] hover:border-[#16A085] transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" /> {daysRemaining} Day{daysRemaining === 1 ? '' : 's'} Trial Left
          </Link>
        )}

        <Button
          variant="primary"
          size="sm"
          className="shadow-glow flex items-center gap-2"
          onClick={onOpenShiftModal}
          disabled={isTrialExpired}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">+ Log Shift</span>
          <span className="sm:hidden">+ Shift</span>
        </Button>
      </div>
    </header>
  );
}
