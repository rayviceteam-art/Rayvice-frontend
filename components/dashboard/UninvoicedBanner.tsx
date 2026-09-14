import Link from 'next/link';
import { formatAud } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

export function UninvoicedBanner({ data }: { data: DashboardSummary['uninvoiced'] }) {
  if (data.shiftCount === 0) return null; // only shown when there are unbilled shifts (QA #22)

  return (
    <Link
      href="/shifts?status=PENDING"
      className="flex items-center justify-between rounded-card border border-brand-dark bg-brand-bg px-4 py-3 text-body2 text-brand-light hover:opacity-90"
    >
      <span>
        {data.shiftCount} uninvoiced shift{data.shiftCount === 1 ? '' : 's'} worth {formatAud(data.totalAmount)}
      </span>
      <span className="underline">View →</span>
    </Link>
  );
}
