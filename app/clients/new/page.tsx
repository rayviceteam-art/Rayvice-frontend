'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientForm } from '@/components/clients/ClientForm';
import { UpgradeModal } from '@/components/clients/UpgradeModal';
import { getApiErrorCode, getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client';
import { clientsService } from '@/lib/clients-service';
import { useToast } from '@/lib/toast-context';
import { CreateClientPayload } from '@/lib/types';

export default function NewClientPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  async function handleSubmit(payload: CreateClientPayload) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors(undefined);

    try {
      const created = await clientsService.create(payload);
      showToast('Participant created successfully.');
      // Navigate to the detail page; fall back to the directory if the
      // backend somehow didn't return an id (spec §46).
      router.push(created?.id ? `/clients/${created.id}` : '/clients');
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === 'TRIAL_LIMIT_REACHED') {
        setShowUpgradeModal(true);
      } else if (code === 'VALIDATION_ERROR') {
        setFieldErrors(getApiFieldErrors(err));
        setServerError(getApiErrorMessage(err));
      } else {
        setServerError(getApiErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Add Participant" subtitle="Create a new NDIS participant record.">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-h1 text-text-primary">Add Participant</h1>
          <p className="text-body2 text-text-secondary">Create a new NDIS participant record.</p>
        </div>

        {serverError && (
          <div role="alert" className="rounded border border-error-border bg-error-bg px-4 py-3 text-body2 text-text-primary">
            {serverError}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-h4 text-text-primary">Participant Details</h2>
          </CardHeader>
          <CardBody>
            <ClientForm
              mode="create"
              isSubmitting={isSubmitting}
              serverFieldErrors={fieldErrors}
              onSubmit={(payload) => handleSubmit(payload as CreateClientPayload)}
              onCancel={() => router.push('/clients')}
            />
          </CardBody>
        </Card>

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </AppLayout>
  );
}
