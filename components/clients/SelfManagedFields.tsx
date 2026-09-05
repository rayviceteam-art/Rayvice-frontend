import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SelfManagedFieldsProps {
  nomineeBillingEmail: string;
  nomineeBillingPhone: string;
  nomineeBillingEmailError?: string;
  onNomineeBillingEmailChange: (value: string) => void;
  onNomineeBillingPhoneChange: (value: string) => void;
}

/**
 * Self-Managed nominee contact fields.
 *
 * Known specification gap (spec §52, Gap A): the supplied backend Module 3
 * contract has no persistent field for these values yet. Per the spec's
 * "approach 2", the controls are shown but intentionally kept OUT of the
 * create/update payload (see ClientForm.tsx's `buildPayload`) until a
 * backend field is agreed. The inline notice below keeps that gap visible
 * to whoever is using the form, rather than silently discarding the data.
 */
export function SelfManagedFields({
  nomineeBillingEmail,
  nomineeBillingPhone,
  nomineeBillingEmailError,
  onNomineeBillingEmailChange,
  onNomineeBillingPhoneChange,
}: SelfManagedFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Parent / Nominee Billing Email"
          type="email"
          placeholder="nominee@example.com"
          value={nomineeBillingEmail}
          onChange={(e) => onNomineeBillingEmailChange(e.target.value)}
          error={nomineeBillingEmailError}
        />
        <Input
          label="Parent / Nominee Phone"
          type="tel"
          placeholder="04XX XXX XXX"
          value={nomineeBillingPhone}
          onChange={(e) => onNomineeBillingPhoneChange(e.target.value)}
        />
      </div>
      <div className="flex items-start gap-2 rounded border border-warning-border bg-warning-bg px-3 py-2 text-caption text-text-secondary">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <span>
          Not yet saved to the participant record — the backend doesn&apos;t have a field for nominee contact
          details yet. This will be wired up once that&apos;s added.
        </span>
      </div>
    </div>
  );
}
