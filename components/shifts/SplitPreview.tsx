'use client';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatAud } from '@/lib/format';
import type { ShiftSplitResult } from '@/lib/shift-calculator';

const TIER_TEXT_CLASS: Record<string, string> = {
  DAY: 'text-text-primary',
  EVENING: 'text-[#5EE0C1]',
  SATURDAY: 'text-text-primary',
  SUNDAY: 'text-text-primary',
  HOLIDAY: 'text-text-primary',
  TRAVEL: 'text-text-secondary',
};

interface SplitPreviewProps {
  result: ShiftSplitResult;
  budgetWarningLine?: string | null; // "This will put {name} at {pct}%..."
  budgetErrorLine?: string | null; // "This exceeds {name}'s allocated budget."
  hasEnteredTimes: boolean;
}

export function SplitPreview({ result, budgetWarningLine, budgetErrorLine, hasEnteredTimes }: SplitPreviewProps) {
  const { lineItems, totalAmount, errors, warnings } = result;
  const blockingError = errors[0];

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-caption uppercase tracking-wide text-text-secondary">NDIS Auto-Split Engine</span>
          <span className="text-caption text-brand-light">✓ 2026 NDIA Limits Active</span>
        </div>

        {!hasEnteredTimes && (
          <p className="text-body2 text-text-muted">Enter a start and end time to see the split.</p>
        )}

        {hasEnteredTimes && blockingError && (
          <p role="alert" className="text-body2 text-error">
            {blockingError}
          </p>
        )}

        {hasEnteredTimes && !blockingError && (
          <div className="space-y-2">
            {lineItems.length === 0 && <p className="text-body2 text-text-muted">Enter a start and end time to see the split.</p>}
            {lineItems.map((li, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-body2">
                <div className={TIER_TEXT_CLASS[li.rateTier]}>
                  <div className="font-mono text-caption text-text-muted">{li.supportItemCode}</div>
                  <div>{li.description}</div>
                </div>
                <div className="whitespace-nowrap text-right font-mono">
                  <div className="text-text-secondary">
                    {li.quantity} {li.unit === 'Hour' ? 'h' : 'km'} × {formatAud(li.appliedRate)}
                    {li.appliedRate < li.ndisCapRate && <span className="text-text-muted"> (agreed rate)</span>}
                  </div>
                  <div>= {formatAud(li.amount)}</div>
                </div>
              </div>
            ))}

            {warnings.map((w, i) => (
              <p key={i} className="rounded-card bg-warning-bg border border-warning-border px-2 py-1 text-caption text-warning">
                {w}
              </p>
            ))}
            {budgetWarningLine && (
              <p className="rounded-card bg-warning-bg border border-warning-border px-2 py-1 text-caption text-warning">
                {budgetWarningLine}
              </p>
            )}
            {budgetErrorLine && (
              <p className="rounded-card bg-error-bg border border-error-border px-2 py-1 text-caption text-error">
                {budgetErrorLine}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2 font-mono text-body1 font-bold text-brand">
              <span>Total Claim Amount</span>
              <span>{formatAud(totalAmount)} AUD</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
