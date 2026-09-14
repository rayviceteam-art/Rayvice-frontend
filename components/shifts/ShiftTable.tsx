'use client';
import Link from 'next/link';
import { Table, Thead, Tr, Th, Td, Badge, Skeleton, Button } from '@/components/ui';
import { formatAud, formatCalendarDate, formatHours } from '@/lib/format';
import type { Shift } from '@/lib/types';

const STATUS_TONE: Record<Shift['status'], 'success' | 'warning' | 'muted'> = {
  PENDING: 'warning',
  INVOICED: 'success',
  CANCELLED: 'muted',
};

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
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-body1 text-text-secondary">
        {hasFilters ? 'No shifts match your filters.' : 'No shifts logged yet.'}
      </p>
      {hasFilters ? (
        <Button variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <Button variant="primary" onClick={onLogShift}>
          + Log Shift
        </Button>
      )}
    </div>
  );
}

export function ShiftTableError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-error-border bg-error-bg py-10 text-center">
      <p className="text-body1 text-error">Couldn&apos;t load shifts.</p>
      <Button variant="secondary" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

export function ShiftTable({ shifts, onCancelShift }: { shifts: Shift[]; onCancelShift: (id: string) => void }) {
  return (
    <Table>
      <Thead>
        <Tr className="border-t-0">
          <Th>Participant</Th>
          <Th>Date</Th>
          <Th>Time</Th>
          <Th>Hours</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          <Th />
        </Tr>
      </Thead>
      <tbody>
        {shifts.map((s) => (
          <Tr key={s.id}>
            <Td>
              <Link href={`/shifts/${s.id}`} className="text-text-primary hover:text-brand-light">
                {s.clientName}
              </Link>
            </Td>
            <Td>{formatCalendarDate(s.shiftDate)}</Td>
            <Td className="font-mono">
              {s.startTime}–{s.endTime}
              {s.isOvernight && (
                <Badge tone="info">
                  <span className="ml-1">Next day</span>
                </Badge>
              )}
            </Td>
            <Td className="font-mono">{formatHours(s.totalHours)}</Td>
            <Td className="font-mono">{formatAud(s.totalAmount)}</Td>
            <Td>
              <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
            </Td>
            <Td className="text-right">
              {s.status === 'PENDING' && (
                <button className="text-caption text-error" onClick={() => onCancelShift(s.id)}>
                  Cancel
                </button>
              )}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
