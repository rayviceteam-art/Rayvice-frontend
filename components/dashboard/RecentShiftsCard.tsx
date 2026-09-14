import Link from 'next/link';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatAud, formatCalendarDate } from '@/lib/format';
import type { Shift } from '@/lib/types';

export function RecentShiftsCard({ shifts }: { shifts: Shift[] }) {
  return (
    <Card>
      <CardBody>
        <h4 className="mb-3 text-h4 text-text-primary">Recent shifts</h4>
        {shifts.length === 0 && <p className="text-body2 text-text-muted">No shifts logged yet.</p>}
        <div className="space-y-2">
          {shifts.map((s) => (
            <Link key={s.id} href={`/shifts/${s.id}`} className="flex items-center justify-between text-body2 hover:text-brand-light">
              <span className="text-text-primary">
                {s.clientName} • {formatCalendarDate(s.shiftDate)}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-text-secondary">{formatAud(s.totalAmount)}</span>
                <Badge tone={s.status === 'PENDING' ? 'warning' : s.status === 'INVOICED' ? 'success' : 'muted'}>{s.status}</Badge>
              </span>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
