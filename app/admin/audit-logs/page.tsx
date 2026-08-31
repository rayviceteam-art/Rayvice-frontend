'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Code,
  Globe,
  User,
  Building2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { listAuditLogs } from '@/lib/admin-service';
import type {
  AdminAuditLogItem,
  PaginationMeta,
} from '@/lib/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 30,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);

  async function loadLogs(page = 1) {
    try {
      setIsLoading(true);
      const res = await listAuditLogs(page, 30);
      setLogs(res.records);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load platform audit logs');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs(1);
  }, []);

  const actionBadge = (action: string) => {
    const isSecurity = action.includes('LOGIN') || action.includes('PASSWORD') || action.includes('SUSPEND');
    const isSuperAdmin = action.startsWith('SUPER_ADMIN');

    if (isSuperAdmin) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#2E1065] px-2 py-0.5 text-[11px] font-bold text-[#C084FC] border border-[#7E22CE]">
          ⚡ {action.replace('SUPER_ADMIN_', '')}
        </span>
      );
    }

    if (isSecurity) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#2B1010] px-2 py-0.5 text-[11px] font-semibold text-[#EF4444] border border-[#991B1B]">
          {action}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#0D332D] px-2 py-0.5 text-[11px] font-semibold text-[#5EE0C1] border border-[#117A65]">
        {action}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0F10] pb-12">
      <AdminHeader
        title="Platform Security & Audit Trail"
        description="Immutable audit ledger recording all security events, authentication attempts, and administrative interventions"
        onRefresh={() => loadLogs(pagination.page)}
        isRefreshing={isLoading}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 space-y-6">
        <div className="rounded-2xl border border-[#253130] bg-[#131B1C] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#253130] bg-[#0D1415] text-[#9AA9A5] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-6 py-3.5 font-semibold">Event Action</th>
                  <th className="px-6 py-3.5 font-semibold">Tenant</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Network / IP</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253130]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#9AA9A5]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#182122]/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[#9AA9A5] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-AU')}
                      </td>
                      <td className="px-6 py-4">
                        {actionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4">
                        {log.business ? (
                          <div className="font-medium text-[#F1F5F4] flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-[#687572]" />
                            <span>{log.business.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#687572]">Platform Global</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div>
                            <div className="font-semibold text-[#F1F5F4]">
                              {log.user.firstName} {log.user.lastName}
                            </div>
                            <div className="text-[10px] text-[#9AA9A5]">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-[#687572]">Anonymous / System</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-[11px] text-[#9AA9A5] flex items-center gap-1">
                          <Globe className="h-3 w-3 text-[#687572]" />
                          <span>{log.ipAddress || 'Internal'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {log.metadata ? (
                          <button
                            onClick={() => setSelectedMeta(log.metadata)}
                            className="rounded-lg border border-[#253130] bg-[#182122] px-2.5 py-1 text-xs font-mono font-medium text-[#5EE0C1] hover:bg-[#0D332D] transition-colors"
                          >
                            View JSON
                          </button>
                        ) : (
                          <span className="text-[#687572]">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#253130] bg-[#0D1415] px-6 py-3.5">
            <span className="text-xs text-[#9AA9A5]">
              Showing <strong className="text-[#F1F5F4]">{logs.length}</strong> of <strong className="text-[#F1F5F4]">{pagination.totalRecords}</strong> events
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => loadLogs(pagination.page - 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs font-medium text-[#9AA9A5]">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => loadLogs(pagination.page + 1)}
                className="flex items-center gap-1 rounded-xl border border-[#253130] bg-[#182122] px-3 py-1.5 text-xs font-semibold text-[#9AA9A5] hover:text-[#F1F5F4] disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Metadata Viewer Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#253130] bg-[#131B1C] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#253130] pb-3">
              <h3 className="text-sm font-bold text-[#F1F5F4] flex items-center gap-2">
                <Code className="h-4 w-4 text-[#5EE0C1]" /> Audit Event Payload
              </h3>
              <button
                onClick={() => setSelectedMeta(null)}
                className="text-[#9AA9A5] hover:text-[#F1F5F4] text-base"
              >
                ✕
              </button>
            </div>

            <pre className="max-h-96 overflow-y-auto rounded-xl border border-[#253130] bg-[#0A0F10] p-4 font-mono text-xs text-[#5EE0C1]">
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMeta(null)}
                className="rounded-xl bg-[#182122] border border-[#253130] px-4 py-2 text-xs font-semibold text-[#F1F5F4] hover:bg-[#253130]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
