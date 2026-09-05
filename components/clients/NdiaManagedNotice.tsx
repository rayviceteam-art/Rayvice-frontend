import { Info } from 'lucide-react';

export function NdiaManagedNotice() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/10 px-3 py-2 text-body2 text-text-secondary">
      <Info size={16} className="mt-0.5 shrink-0 text-info" aria-hidden="true" />
      <span>Invoices for NDIA-managed participants must be claimed through the PRODA Myplace portal.</span>
    </div>
  );
}
