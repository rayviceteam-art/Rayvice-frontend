import { formatAud } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function UninvoicedBanner({ data }: { data: DashboardSummary['uninvoiced'] }) {
  if (data.shiftCount === 0) return null; // only shown when there are unbilled shifts (QA #22)

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-brand-dark bg-brand-bg px-4 py-3 text-body2 text-brand-light">
      <span>
        ⚡ You have {data.shiftCount} unbilled shift{data.shiftCount === 1 ? '' : 's'} ready for invoicing (
        {formatAud(data.totalAmount)}).
      </span>
      {/* /invoices/generate ships with Module 5 — disabled until then (§13.3). */}
      <button
        type="button"
        disabled
        title="Available with invoicing (Module 5)"
        className="shrink-0 cursor-not-allowed underline opacity-60"
      >
        Generate Invoice →
      </button>
    </div>
  );
}
