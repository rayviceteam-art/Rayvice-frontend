'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Tenants & Businesses', href: '/admin/businesses', icon: Building2 },
    { label: 'Platform Users', href: '/admin/users', icon: Users },
    { label: 'Security & Audit Trail', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-[#253130] bg-[#0A0F10] p-4 text-[#F1F5F4]">
      {/* Brand & Super Admin Badge */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E1065] text-base font-bold text-[#C084FC] shadow-glow border border-[#7E22CE]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#F1F5F4]">Rayvice</span>
              <span className="rounded bg-[#2E1065] px-1.5 py-0.5 text-[9px] font-bold text-[#C084FC] border border-[#7E22CE] uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-[#9AA9A5]">Master Control Panel</p>
          </div>
        </div>

        {/* Global Live Engine Status Pill */}
        <div className="rounded-xl border border-[#253130] bg-[#131B1C] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[#5EE0C1]">
              <Server className="h-3.5 w-3.5" /> API Engine
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#5EE0C1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5EE0C1] animate-pulse" />
              Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#9AA9A5]">Render + Neon PostgreSQL</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2E1065]/60 text-[#C084FC] border border-[#7E22CE] font-semibold'
                    : 'text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#C084FC]' : 'text-[#687572]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Switch back to Main Tenant App */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 rounded-lg border border-[#253130] bg-[#131B1C] px-3 py-2 text-xs font-medium text-[#9AA9A5] hover:bg-[#182122] hover:text-[#5EE0C1] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Tenant App</span>
          </Link>
        </div>
      </div>

      {/* Admin User Profile & Footer */}
      <div className="border-t border-[#253130] pt-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E1065] text-xs font-bold text-[#C084FC] border border-[#7E22CE]">
            SA
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold text-[#F1F5F4]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[10px] text-[#C084FC] font-medium">{user?.email}</p>
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
