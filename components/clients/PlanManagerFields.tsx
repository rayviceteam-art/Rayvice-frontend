import { Input } from '@/components/ui/Input';

interface PlanManagerFieldsProps {
  agencyName: string;
  email: string;
  agencyNameError?: string;
  emailError?: string;
  onAgencyNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export function PlanManagerFields({
  agencyName,
  email,
  agencyNameError,
  emailError,
  onAgencyNameChange,
  onEmailChange,
}: PlanManagerFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label="Plan Manager Agency Name"
        placeholder="My Plan Manager"
        value={agencyName}
        onChange={(e) => onAgencyNameChange(e.target.value)}
        error={agencyNameError}
        required
      />
      <Input
        label="Plan Manager Claims Email"
        type="email"
        placeholder="invoices@myplanmanager.com.au"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={emailError}
        required
      />
    </div>
  );
}
