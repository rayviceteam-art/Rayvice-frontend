import { formatAud } from '@/lib/format';

interface BudgetProgressProps {
  allocatedBudgetTotal: number | null;
  allocatedBudgetSpent: number;
}

/**
 * Budget status color thresholds (spec §23), applied to remaining budget:
 *   green  ->  remaining > 30%
 *   amber  ->  10% <= remaining <= 30%
 *   red    ->  remaining < 10%
 */
function getTone(remainingPct: number): 'success' | 'warning' | 'error' {
  if (remainingPct > 30) return 'success';
  if (remainingPct >= 10) return 'warning';
  return 'error';
}

const TONE_BAR_CLASSES = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

const TONE_TEXT_CLASSES = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export function BudgetProgress({ allocatedBudgetTotal, allocatedBudgetSpent }: BudgetProgressProps) {
  if (allocatedBudgetTotal === null) {
    return <p className="text-body2 text-text-muted">Budget tracking not configured</p>;
  }

  const remaining = allocatedBudgetTotal - allocatedBudgetSpent;
  const usedPct = allocatedBudgetTotal > 0 ? Math.min(100, (allocatedBudgetSpent / allocatedBudgetTotal) * 100) : 0;
  const remainingPct = 100 - usedPct;
  const tone = getTone(remainingPct);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-body1 text-text-primary">
          {formatAud(allocatedBudgetSpent)} <span className="text-text-muted">spent</span>
        </span>
        <span className={`text-body2 font-medium ${TONE_TEXT_CLASSES[tone]}`}>{Math.round(usedPct)}% used</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={Math.round(usedPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget utilization"
        className="h-2 w-full overflow-hidden rounded-full bg-elevated"
      >
        <div className={`h-full rounded-full ${TONE_BAR_CLASSES[tone]}`} style={{ width: `${usedPct}%` }} />
      </div>

      <div className="flex items-center justify-between text-caption text-text-secondary">
        <span>{formatAud(allocatedBudgetTotal)} allocated</span>
        <span>{formatAud(Math.max(0, remaining))} remaining</span>
      </div>
    </div>
  );
}
