import Link from 'next/link';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatAud } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function BudgetWatchCard({ data }: { data: DashboardSummary['budgetWatch'] }) {
  const sorted = [...data].sort((a, b) => b.utilizationPercent - a.utilizationPercent).slice(0, 10);

  return (
    <Card>
      <CardBody>
        <h4 className="mb-3 text-h4 text-text-primary">Budget watch</h4>
        {sorted.length === 0 && <p className="text-body2 text-text-muted">No participants near their budget cap.</p>}
        <div className="space-y-2">
          {sorted.map((b) => (
            <Link key={b.clientId} href={`/clients/${b.clientId}`} className="flex items-center justify-between text-body2 hover:text-brand-light">
              <span className="text-text-primary">{b.participantName}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-text-secondary">
                  {formatAud(b.allocatedSpent)} / {formatAud(b.allocatedTotal)}
                </span>
                <Badge tone={b.level === 'EXHAUSTED' ? 'error' : 'warning'}>{b.utilizationPercent}%</Badge>
              </span>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
