import { Card, CardBody } from '@/components/ui';
import { formatAud, formatHours } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function WeeklyEarningsCard({ data }: { data: DashboardSummary['thisWeek'] }) {
  const changeLabel = data.changePercent === null ? '—' : `${data.changePercent > 0 ? '+' : ''}${data.changePercent}%`;
  const changeTone = data.changePercent === null ? 'text-text-muted' : data.changePercent >= 0 ? 'text-success' : 'text-error';

  return (
    <Card>
      <CardBody>
        <p className="text-caption uppercase tracking-wide text-text-secondary">This week</p>
        <p className="text-h1 text-text-primary">{formatAud(data.earnings)}</p>
        <p className="text-body2 text-text-secondary">
          {formatHours(data.hours)} across {data.shiftCount} shift{data.shiftCount === 1 ? '' : 's'}
        </p>
        <p className={`mt-1 text-caption ${changeTone}`}>{changeLabel} vs last week</p>
      </CardBody>
    </Card>
  );
}
