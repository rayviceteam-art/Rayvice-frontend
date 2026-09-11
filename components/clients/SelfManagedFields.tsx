import { Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SelfManagedFieldsProps {
  nomineeBillingEmail: string;
  nomineeBillingPhone: string;
  nomineeBillingEmailError?: string;
  onNomineeBillingEmailChange: (value: string) => void;
  onNomineeBillingPhoneChange: (value: string) => void;
}

/**
 * Self-Managed nominee contact fields (spec §5.2). These values are stored
 * on the participant record (selfManagedBillingEmail / selfManagedBillingPhone)
 * and are used to route invoices directly to the participant or their nominee.
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
      <div className="flex items-start gap-2 rounded border border-info/30 bg-info/10 px-3 py-2 text-caption text-text-secondary">
        <Info size={14} className="mt-0.5 shrink-0 text-info" aria-hidden="true" />
        <span>Invoices for self-managed participants are sent directly to this nominee contact.</span>
      </div>
    </div>
  );
}
