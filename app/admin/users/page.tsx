'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { listUsers } from '@/lib/admin-service';
import type {
  AdminUserItem,
  UserRole,
  UserStatus,
  PaginationMeta,
} from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 15,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadUsers(page = 1) {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        pageSize: 15,
      };
      if (roleFilter !== 'ALL') {
        params.role = roleFilter;
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await listUsers(params);
      setUsers(res.records);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load platform users');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
  }, [roleFilter, statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadUsers(1);
  }

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2E1065] px-2.5 py-0.5 text-xs font-bold text-[#C084FC] border border-[#7E22CE]">
            <ShieldAlert className="h-3 w-3" /> ADMIN
          </span>
        );
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0D332D] px-2.5 py-0.5 text-xs font-semibold text-[#5EE0C1] border border-[#117A65]">
            <Shield className="h-3 w-3" /> Owner
          </span>
        );
      case 'OFFICE_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0369A1]/20 px-2.5 py-0.5 text-xs font-semibold text-[#38BDF8] border border-[#0284C7]/40">
            Manager
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#182122] px-2.5 py-0.5 text-xs font-semibold text-[#9AA9A5] border border-[#253130]">
            Staff
          </span>
        );
    }
  };

  const statusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5EE0C1]">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        );
      case 'INVITED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FBBF24]">
            <Mail className="h-3 w-3" /> Invited
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#EF4444]">
            <AlertCircle className="h-3 w-3" /> Suspended
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F10] pb-12">
      <AdminHeader
        title="Platform Users Directory"
        description="All sole-trader owners, invited team members, and Super-Admin accounts"
        onRefresh={() => loadUsers(pagination.page)}
        isRefreshing={isLoading}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#253130] bg-[#131B1C] p-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-[#0D1415] p-1 border border-[#253130]">
              {['ALL', 'OWNER', 'OFFICE_MANAGER', 'SUPER_ADMIN'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    roleFilter === r
                      ? 'bg-[#2E1065] text-[#C084FC] border border-[#7E22CE]'
                      : 'text-[#9AA9A5] hover:text-[#F1F5F4]'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 rounded-xl bg-[#0D1415] p-1 border border-[#253130]">
              {['ALL', 'ACTIVE', 'INVITED', 'SUSPENDED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-[#117A65] text-[#5EE0C1] border border-[#5EE0C1]/40'
                      : 'text-[#9AA9A5] hover:text-[#F1F5F4]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#687572]" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-[#253130] bg-[#0A0F10] pl-9 pr-3 py-2 text-xs text-[#F1F5F4] placeholder-[#687572] focus:border-[#7E22CE] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#2E1065] px-4 py-2 text-xs font-semibold text-[#C084FC] border border-[#7E22CE] hover:bg-[#7E22CE] hover:text-[#F1F5F4] transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Master Users Table */}
        <div className="rounded-2xl border border-[#253130] bg-[#131B1C] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#253130] bg-[#0D1415] text-[#9AA9A5] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Associated Business</th>
                  <th className="px-6 py-3.5 font-semibold">Role</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Email Verified</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253130]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#182122]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182122] text-xs font-bold text-[#5EE0C1] border border-[#253130]">
                            {u.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#F1F5F4]">{u.firstName} {u.lastName}</div>
                            <div className="text-[11px] text-[#9AA9A5]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F1F5F4] flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#687572]" />
                          {u.business?.name || 'Platform Global'}
                        </div>
                        {u.business && (
                          <div className="text-[10px] text-[#9AA9A5]">Tenant Status: {u.business.status}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {roleBadge(u.role)}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(u.status)}
                      </td>
                      <td className="px-6 py-4">
                        {u.emailVerifiedAt ? (
                          <span className="text-[#5EE0C1] font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[#687572]">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-[11px] text-[#9AA9A5]">
                        {new Date(u.createdAt).toLocaleDateString('en-AU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-[#253130] bg-[#0D1415] px-6 py-3.5">
            <span className="text-xs text-[#9AA9A5]">
              Showing <strong className="text-[#F1F5F4]">{users.length}</strong> of <strong className="text-[#F1F5F4]">{pagination.totalRecords}</strong> users
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => loadUsers(pagination.page - 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs font-medium text-[#9AA9A5]">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => loadUsers(pagination.page + 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
