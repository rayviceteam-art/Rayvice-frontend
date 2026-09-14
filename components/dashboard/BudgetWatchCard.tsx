import Link from 'next/link';
import { Card, CardBody, Badge } from '@/components/ui';
import { BudgetProgress } from '@/components/clients/BudgetProgress';
import { formatAud } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function BudgetWatchCard({ data }: { data: DashboardSummary['budgetWatch'] }) {
  const sorted = [...data].sort((a, b) => b.utilizationPercent - a.utilizationPercent).slice(0, 10);

  return (
    <Card>
      <CardBody>
        <h4 className="mb-3 text-h4 text-text-primary">Budget watch</h4>
        {sorted.length === 0 && (
          <div className="rounded-card border border-success-border bg-success-bg px-3 py-2">
            <p className="text-body2 text-success">All participant budgets are healthy</p>
          </div>
        )}
        <div className="space-y-3">
          {sorted.map((b) => (
            <div key={b.clientId}>
              <Link href={`/clients/${b.clientId}`} className="flex items-center justify-between text-body2 hover:text-brand-light">
                <span className="text-text-primary">{b.participantName}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-text-secondary">
                    {formatAud(b.allocatedSpent)} of {formatAud(b.allocatedTotal)}
                  </span>
                  <Badge tone={b.level === 'EXHAUSTED' ? 'error' : 'warning'}>{b.utilizationPercent}%</Badge>
                </span>
              </Link>
              <div className="mt-1">
                <BudgetProgress allocatedBudgetTotal={b.allocatedTotal} allocatedBudgetSpent={b.allocatedSpent} />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
