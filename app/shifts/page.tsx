'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShiftFilters, type ShiftFiltersValue } from '@/components/shifts/ShiftFilters';
import { ShiftTable, ShiftTableSkeleton, ShiftTableEmpty, ShiftTableError } from '@/components/shifts/ShiftTable';
import { CancelShiftModal } from '@/components/shifts/CancelShiftModal';
import { Card, CardBody, Button } from '@/components/ui';
import { shiftsService } from '@/lib/shifts-service';
import { clientsService, toParticipantOptions } from '@/lib/clients-service';
import { getApiErrorMessage } from '@/lib/api-client';
import { formatAud, formatHours } from '@/lib/format';
import type { ParticipantOption, ShiftListResponse } from '@/lib/types';

type Tab = 'PENDING' | 'INVOICED' | 'ALL';

const TABS: { key: Tab; label: string }[] = [
  { key: 'PENDING', label: 'Uninvoiced' },
  { key: 'INVOICED', label: 'Invoiced' },
  { key: 'ALL', label: 'All' },
];

export default function ShiftsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('PENDING');
  const [filters, setFilters] = useState<ShiftFiltersValue>({ from: '', to: '', clientId: '', workerId: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShiftListResponse | null>(null);
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // FRONTEND_SPEC §7.3: an impossible range shows an inline hint and blocks the request.
  const rangeInvalid = Boolean(filters.from && filters.to && filters.from > filters.to);

  const load = useCallback(async () => {
    if (rangeInvalid) return; // §7.3: invalid range blocks the request
    setStatus('loading');
    try {
      const [list] = await Promise.all([
        shiftsService.list({
          status: tab === 'ALL' ? undefined : tab,
          from: filters.from || undefined,
          to: filters.to || undefined,
          clientId: filters.clientId || undefined,
          workerId: filters.workerId || undefined,
          page,
          pageSize: 20,
        }),
      ]);
      setData(list);
      setLoadError(null);
      setStatus('ready');
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
      setStatus('error');
    }
  }, [tab, filters, page, rangeInvalid]);

  useEffect(() => {
    clientsService
      .list({ isActive: true, pageSize: 100 })
      .then((res) => setParticipants(toParticipantOptions(res.data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return shiftsService.subscribe(load);
  }, [load]);

  function changeTab(next: Tab) {
    setTab(next);
    setPage(1);
  }

  const hasFilters = Boolean(filters.from || filters.to || filters.clientId || filters.workerId);

  function updateFilters(next: ShiftFiltersValue) {
    setPage(1);
    setFilters(next);
  }

  return (
    <AppLayout title="Shifts & Splitter" subtitle="Logged shifts with automatic NDIS rate splits" onShiftSaved={load}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h2 text-text-primary">Shifts</h1>
        <Button variant="primary" onClick={() => router.push('/shifts/new')}>
          + Log Shift
        </Button>
      </div>
      <div className="mb-4 flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`min-h-[44px] border-b-2 px-3 text-body2 ${
              tab === t.key ? 'border-brand text-text-primary' : 'border-transparent text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <ShiftFilters value={filters} onChange={updateFilters} participants={participants} workers={[]} />
        {rangeInvalid && (
          <p role="alert" className="mt-2 text-caption text-error">
            The &lsquo;from&rsquo; date is after the &lsquo;to&rsquo; date. Adjust the range to load shifts.
          </p>
        )}
      </div>

      {data && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <Card>
            <CardBody>
              <p className="text-caption text-text-secondary">Shifts</p>
              <p className="text-h3 text-text-primary">{data.summary.count}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-caption text-text-secondary">Total hours</p>
              <p className="text-h3 text-text-primary">{formatHours(data.summary.totalHours)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-caption text-text-secondary">Total amount</p>
              <p className="text-h3 text-brand">{formatAud(data.summary.totalAmount)}</p>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardBody>
          {status === 'loading' && <ShiftTableSkeleton />}
          {status === 'error' && <ShiftTableError message={loadError} onRetry={load} />}
          {status === 'ready' && data && data.items.length === 0 && (
            <ShiftTableEmpty
              hasFilters={hasFilters}
              onClearFilters={() => setFilters({ from: '', to: '', clientId: '', workerId: '' })}
              onLogShift={() => router.push('/shifts/new')}
            />
          )}
          {status === 'ready' && data && data.items.length > 0 && (
            <ShiftTable shifts={data.items} onCancelShift={setCancelTargetId} />
          )}
        </CardBody>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-caption text-text-secondary">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button variant="secondary" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {cancelTargetId && (
        <CancelShiftModal
          shiftId={cancelTargetId}
          isOpen={Boolean(cancelTargetId)}
          onClose={() => setCancelTargetId(null)}
          onCancelled={() => {
            setCancelTargetId(null);
            load();
          }}
        />
      )}
    </AppLayout>
  );
}
