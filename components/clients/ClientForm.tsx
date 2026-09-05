'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DEFAULT_HOURLY_RATE_2026, SUPPORT_ITEMS } from '@/lib/ndis-rates';
import { Client, CreateClientPayload, UpdateClientPayload } from '@/lib/types';
import { ClientFormValues, clientFormSchema, emptyClientFormValues } from '@/lib/validators';
import { NdiaManagedNotice } from './NdiaManagedNotice';
import { PlanManagementSelector } from './PlanManagementSelector';
import { PlanManagerFields } from './PlanManagerFields';
import { SelfManagedFields } from './SelfManagedFields';

interface ClientFormProps {
  mode: 'create' | 'edit';
  initialClient?: Client;
  isSubmitting: boolean;
  /** Field-level errors returned by the server, keyed by field name. */
  serverFieldErrors?: Record<string, string[] | undefined>;
  onSubmit: (payload: CreateClientPayload | UpdateClientPayload) => void;
  onCancel: () => void;
}

function clientToFormValues(client: Client): ClientFormValues {
  return {
    participantName: client.participantName,
    ndisNumber: client.ndisNumber,
    dateOfBirth: client.dateOfBirth ?? '',
    planManagementType: client.planManagementType,
    planManagerAgencyName: client.planManagerAgencyName ?? '',
    planManagerEmail: client.planManagerEmail ?? '',
    nomineeBillingEmail: '',
    nomineeBillingPhone: '',
    defaultSupportItemCode: client.defaultSupportItemCode,
    hourlyRateAgreed: client.hourlyRateAgreed,
    allocatedBudgetTotal: client.allocatedBudgetTotal,
  };
}

export function ClientForm({ mode, initialClient, isSubmitting, serverFieldErrors, onSubmit, onCancel }: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(() =>
    initialClient ? clientToFormValues(initialClient) : emptyClientFormValues(DEFAULT_HOURLY_RATE_2026),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Warn on accidental navigation away from unsaved changes (spec §41).
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  function update<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setIsDirty(true);
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Changing plan management type clears fields that no longer apply,
      // rather than silently submitting stale data (spec §28).
      if (key === 'planManagementType') {
        if (value !== 'PLAN_MANAGED') {
          next.planManagerAgencyName = '';
          next.planManagerEmail = '';
        }
        if (value !== 'SELF_MANAGED') {
          next.nomineeBillingEmail = '';
          next.nomineeBillingPhone = '';
        }
      }
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = clientFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsDirty(false);

    const planManaged = values.planManagementType === 'PLAN_MANAGED';

    // Only documented backend fields are sent - nominee billing fields are
    // intentionally excluded (see SelfManagedFields.tsx and spec Gap A).
    const payload: CreateClientPayload | UpdateClientPayload = {
      participantName: values.participantName.trim(),
      ...(mode === 'create' ? { ndisNumber: values.ndisNumber } : {}),
      dateOfBirth: values.dateOfBirth || null,
      planManagementType: values.planManagementType,
      planManagerAgencyName: planManaged ? values.planManagerAgencyName || null : null,
      planManagerEmail: planManaged ? values.planManagerEmail || null : null,
      defaultSupportItemCode: values.defaultSupportItemCode,
      hourlyRateAgreed: values.hourlyRateAgreed,
      allocatedBudgetTotal: values.allocatedBudgetTotal ?? null,
    };

    onSubmit(payload);
  }

  const fieldError = (name: string) => errors[name] ?? serverFieldErrors?.[name]?.[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Input
        label="Participant Full Name"
        value={values.participantName}
        onChange={(e) => update('participantName', e.target.value)}
        error={fieldError('participantName')}
        required
      />

      <Input
        label="NDIS Number"
        value={values.ndisNumber}
        onChange={(e) => update('ndisNumber', e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
        error={fieldError('ndisNumber')}
        placeholder="430123456"
        inputMode="numeric"
        maxLength={9}
        disabled={mode === 'edit'}
        hint={mode === 'edit' ? 'NDIS number cannot be changed once a participant is created.' : undefined}
        required
      />

      <Input
        label="Date of Birth"
        type="date"
        value={values.dateOfBirth ?? ''}
        onChange={(e) => update('dateOfBirth', e.target.value)}
      />

      <PlanManagementSelector
        value={values.planManagementType}
        onChange={(value) => update('planManagementType', value)}
      />

      {values.planManagementType === 'PLAN_MANAGED' && (
        <PlanManagerFields
          agencyName={values.planManagerAgencyName ?? ''}
          email={values.planManagerEmail ?? ''}
          agencyNameError={fieldError('planManagerAgencyName')}
          emailError={fieldError('planManagerEmail')}
          onAgencyNameChange={(v) => update('planManagerAgencyName', v)}
          onEmailChange={(v) => update('planManagerEmail', v)}
        />
      )}

      {values.planManagementType === 'SELF_MANAGED' && (
        <SelfManagedFields
          nomineeBillingEmail={values.nomineeBillingEmail ?? ''}
          nomineeBillingPhone={values.nomineeBillingPhone ?? ''}
          nomineeBillingEmailError={fieldError('nomineeBillingEmail')}
          onNomineeBillingEmailChange={(v) => update('nomineeBillingEmail', v)}
          onNomineeBillingPhoneChange={(v) => update('nomineeBillingPhone', v)}
        />
      )}

      {values.planManagementType === 'NDIA_MANAGED' && <NdiaManagedNotice />}

      <Select
        label="Default Support Category"
        value={values.defaultSupportItemCode}
        onChange={(e) => update('defaultSupportItemCode', e.target.value)}
        error={fieldError('defaultSupportItemCode')}
        required
      >
        <option value="" disabled>
          Select a support category
        </option>
        {SUPPORT_ITEMS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.code} - {item.label}
          </option>
        ))}
      </Select>

      <Input
        label="Agreed Hourly Rate ($ AUD)"
        type="number"
        step="0.01"
        min="0"
        value={Number.isNaN(values.hourlyRateAgreed) ? '' : values.hourlyRateAgreed}
        onChange={(e) => update('hourlyRateAgreed', e.target.value === '' ? NaN : Number(e.target.value))}
        error={fieldError('hourlyRateAgreed')}
        required
      />

      <Input
        label="Total Allocated Budget ($ AUD)"
        type="number"
        step="0.01"
        min="0"
        placeholder="Optional"
        value={values.allocatedBudgetTotal ?? ''}
        onChange={(e) => update('allocatedBudgetTotal', e.target.value === '' ? null : Number(e.target.value))}
        error={fieldError('allocatedBudgetTotal')}
      />

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Creating Participant...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Participant'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
