'use client';
import Link from 'next/link';
import { Lock, RefreshCw } from 'lucide-react';
import { Table, Thead, Tr, Th, Td, Badge, Skeleton, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { formatAud, formatCalendarDate, formatHours } from '@/lib/format';
import type { Shift } from '@/lib/types';

// FRONTEND_SPEC §7.4 — abbreviated tier labels, exactly as listed.
const TIER_BADGE: Record<string, { label: string; tone: 'brand' | 'info' | 'success' | 'warning' | 'error' | 'neutral' }> = {
  DAY: { label: 'DAY', tone: 'brand' },
  EVENING: { label: 'EVE', tone: 'info' },
  SATURDAY: { label: 'SAT', tone: 'success' },
  SUNDAY: { label: 'SUN', tone: 'warning' },
  HOLIDAY: { label: 'HOL', tone: 'error' },
  TRAVEL: { label: 'KM', tone: 'neutral' },
};

const STATUS_TONE: Record<Shift['status'], 'brand' | 'neutral' | 'error'> = {
  PENDING: 'brand',
  INVOICED: 'neutral',
  CANCELLED: 'error',
};

function distinctTiers(shift: Shift): string[] {
  const seen: string[] = [];
  for (const li of shift.lineItems ?? []) {
    if (!seen.includes(li.rateTier)) seen.push(li.rateTier);
  }
  return seen;
}

export function ShiftTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ShiftTableEmpty({
  hasFilters,
  onClearFilters,
  onLogShift,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onLogShift: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="text-h4 text-text-primary">
        {hasFilters ? 'No shifts match these filters' : 'No shifts logged yet'}
      </p>
      <p className="text-body2 text-text-secondary">
        {hasFilters ? 'Try a different date range or participant.' : 'Log your first shift to see the NDIS rate split.'}
      </p>
      {hasFilters ? (
        <Button variant="secondary" className="mt-2" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <Button variant="primary" className="mt-2" onClick={onLogShift}>
          + Log Shift
        </Button>
      )}
    </div>
  );
}

export function ShiftTableError({ message, onRetry }: { message?: string | null; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-card border border-error-border bg-error-bg py-10 text-center">
      <p className="text-h4 text-text-primary">Unable to load shifts</p>
      {message && <p className="text-body2 text-error">{message}</p>}
      <Button variant="secondary" className="mt-2" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export function ShiftTable({ shifts, onCancelShift }: { shifts: Shift[]; onCancelShift: (id: string) => void }) {
  const { user, can } = useAuth();
  const canManageShift = (s: Shift) =>
    s.status === 'PENDING' && (can('OWNER', 'OFFICE_MANAGER') || s.userId === user?.id);

  return (
    <div className="overflow-x-auto">
      <Table>
        <Thead>
          <Tr className="border-t-0">
            <Th>Date</Th>
            <Th>Participant</Th>
            <Th>Time</Th>
            <Th>Hours</Th>
            <Th>Split</Th>
            <Th>Travel</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th />
          </Tr>
        </Thead>
        <tbody>
          {shifts.map((s) => (
            <Tr key={s.id}>
              <Td className="whitespace-nowrap">{formatCalendarDate(s.shiftDate)}</Td>
              <Td>
                <Link href={`/shifts/${s.id}`} className="block max-w-[180px] truncate text-text-primary hover:text-brand-light">
                  {s.clientName}
                </Link>
                <span className="block text-caption text-text-muted">NDIS: {s.ndisNumber}</span>
              </Td>
              <Td className="whitespace-nowrap font-mono">
                {s.startTime}–{s.endTime}
                {s.isOvernight && (
                  <Badge tone="info">
                    <span className="ml-1">Next day</span>
                  </Badge>
                )}
              </Td>
              <Td className="font-mono">{formatHours(s.totalHours)}</Td>
              <Td>
                <span className="flex flex-wrap gap-1">
                  {distinctTiers(s).map((tier) => (
                    <Badge key={tier} tone={TIER_BADGE[tier]?.tone ?? 'neutral'}>
                      {TIER_BADGE[tier]?.label ?? tier}
                    </Badge>
                  ))}
                </span>
              </Td>
              <Td className="whitespace-nowrap font-mono">{s.travelKms > 0 ? `${s.travelKms} km` : '—'}</Td>
              <Td className="whitespace-nowrap font-mono font-bold">{formatAud(s.grandTotal ?? s.totalAmount)}</Td>
              <Td>
                <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
              </Td>
              <Td className="whitespace-nowrap text-right">
                <span className="inline-flex items-center gap-3">
                  <Link
                    href={`/shifts/${s.id}`}
                    aria-label={`View shift for ${s.clientName}`}
                    className="text-caption text-text-secondary hover:text-text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                  {canManageShift(s) && (
                    <>
                      <Link
                        href={`/shifts/${s.id}?edit=1`}
                        aria-label={`Edit shift for ${s.clientName}`}
                        className="text-caption text-text-secondary hover:text-text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button
                        aria-label={`Cancel shift for ${s.clientName}`}
                        className="text-caption text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelShift(s.id);
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {s.status === 'INVOICED' && (
                    <span title="On invoice — cannot be changed" className="inline-flex text-text-muted">
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
