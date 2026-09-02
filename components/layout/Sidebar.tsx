'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Settings,
  CreditCard,
  Sparkles,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSuperAdminUser } from '@/lib/types';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'NDIS Participants', href: '/clients', icon: Users },
    { label: 'Shifts & Splitter', href: '/shifts', icon: Clock },
    { label: 'Tax Invoices', href: '/invoices', icon: FileText },
    { label: 'Settings & Banking', href: '/settings', icon: Settings },
    { label: 'Billing & Plan', href: '/settings/billing', icon: CreditCard },
  ];

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-[#253130] bg-[#0A0F10] p-4 text-[#F1F5F4]">
      {/* Brand & Workspace */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D332D] text-base font-bold text-[#5EE0C1] shadow-glow border border-[#117A65]">
            R
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#F1F5F4]">Rayvice</span>
              <span className="rounded bg-[#0D332D] px-1.5 py-0.5 text-[10px] font-bold text-[#5EE0C1] border border-[#117A65]">
                OS
              </span>
            </div>
            <p className="text-[11px] text-[#9AA9A5]">NDIS Sole-Trader OS</p>
          </div>
        </div>

        {/* 9-Day Trial Status Pill */}
        <Link
          href="/settings/billing"
          onClick={onCloseMobile}
          className="block rounded-xl border border-[#117A65] bg-[#0D332D]/80 p-3 hover:bg-[#0D332D] transition-colors"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[#5EE0C1]">
              <Sparkles className="h-3.5 w-3.5" /> 9-Day Trial
            </span>
            <span className="text-[10px] rounded bg-[#117A65] px-1.5 py-0.2 text-[#F1F5F4]">
              1 Client
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#9AA9A5]">Live rate-split testing active</p>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {isSuperAdminUser(user) && (
            <Link
              href="/admin"
              onClick={onCloseMobile}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold bg-[#2E1065] text-[#C084FC] border border-[#7E22CE] mb-2 hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-all"
            >
              <Building2 className="h-4 w-4 shrink-0 text-[#C084FC]" />
              <span>Super Admin Panel</span>
            </Link>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0D332D] text-[#5EE0C1] border border-[#117A65] shadow-glow font-semibold'
                    : 'text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#5EE0C1]' : 'text-[#687572]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Footer */}
      <div className="border-t border-[#253130] pt-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182122] text-xs font-bold text-[#5EE0C1] border border-[#253130]">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold text-[#F1F5F4]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[10px] text-[#9AA9A5]">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#9AA9A5] hover:bg-[#2B1010] hover:text-[#EF4444] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
