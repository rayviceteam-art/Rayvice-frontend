import Link from 'next/link';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { formatAud, formatCalendarDate } from '@/lib/format';
import type { Shift } from '@/lib/types';

export function RecentShiftsCard({ shifts }: { shifts: Shift[] }) {
  return (
    <Card>
      <CardBody>
        <h4 className="mb-3 text-h4 text-text-primary">Recent shifts</h4>
        {shifts.length === 0 && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-body2 text-text-muted">No shifts logged yet</p>
            <Link href="/shifts/new">
              <Button variant="primary">+ Log Shift</Button>
            </Link>
          </div>
        )}
        <div className="space-y-2">
          {shifts.map((s) => (
            <Link key={s.id} href={`/shifts/${s.id}`} className="flex items-center justify-between text-body2 hover:text-brand-light">
              <span className="text-text-primary">
                {formatCalendarDate(s.shiftDate)} • {s.clientName} • {s.startTime}–{s.endTime}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-text-secondary">{formatAud(s.totalAmount)}</span>
                <Badge tone={s.status === 'PENDING' ? 'warning' : s.status === 'INVOICED' ? 'success' : 'muted'}>{s.status}</Badge>
              </span>
            </Link>
          ))}
        </div>
        {shifts.length > 0 && (
          <Link href="/shifts" className="mt-3 inline-block text-body2 text-text-secondary hover:text-text-primary">
            View all shifts →
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
