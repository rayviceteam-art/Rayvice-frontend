'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { ClientDetailCard } from '@/components/clients/ClientDetailCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { DeactivateClientModal } from '@/components/clients/DeactivateClientModal';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorCode, getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client';
import { clientsService } from '@/lib/clients-service';
import { useToast } from '@/lib/toast-context';
import { ClientDetailResponse, UpdateClientPayload } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = useAuth();
  const { showToast } = useToast();

  const [client, setClient] = useState<ClientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>();
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientsService.getById(params.id);
      setClient(data);
    } catch (err) {
      setError({ message: getApiErrorMessage(err), code: getApiErrorCode(err) });
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(payload: UpdateClientPayload) {
    if (!client) return;
    setIsSaving(true);
    setSaveError(null);
    setFieldErrors(undefined);
    try {
      await clientsService.update(client.id, payload);
      showToast('Participant updated successfully.');
      setIsEditing(false);
      await load();
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === 'VALIDATION_ERROR') {
        setFieldErrors(getApiFieldErrors(err));
      }
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!client) return;
    setIsDeactivating(true);
    try {
      await clientsService.deactivate(client.id);
      showToast('Participant deactivated successfully.');
      setIsDeactivateModalOpen(false);
      router.push('/clients');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Unable to deactivate participant. Please try again.'), 'error');
      setIsDeactivateModalOpen(false);
    } finally {
      setIsDeactivating(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Participant Details">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    const isNotFound = error.code === 'NOT_FOUND';
    const isForbidden = error.code === 'FORBIDDEN';
    return (
      <AppLayout title="Participant Details">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
          <h1 className="text-h3 text-text-primary">
            {isNotFound ? 'Participant not found' : isForbidden ? 'Access denied' : 'Unable to load participant'}
          </h1>
          <p className="text-body2 text-text-secondary">{error.message}</p>
          {!isNotFound && !isForbidden && (
            <Button variant="secondary" onClick={load}>
              <RefreshCw size={16} />
              Try Again
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push('/clients')}>
            Back to Participants
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!client) return null;

  return (
    <AppLayout title={client.participantName} subtitle={`NDIS Number: ${client.ndisNumber}`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <button onClick={() => router.push('/clients')} className="w-fit text-body2 text-text-secondary hover:text-text-primary">
          ← Back to Participants
        </button>

        {isEditing ? (
          <Card>
            <CardHeader>
              <h2 className="text-h4 text-text-primary">Edit Participant</h2>
            </CardHeader>
            <CardBody>
              {saveError && (
                <div role="alert" className="mb-4 rounded border border-error-border bg-error-bg px-4 py-3 text-body2 text-text-primary">
                  {saveError}
                </div>
              )}
              <ClientForm
                mode="edit"
                initialClient={client}
                isSubmitting={isSaving}
                serverFieldErrors={fieldErrors}
                onSubmit={(payload) => handleSave(payload as UpdateClientPayload)}
                onCancel={() => setIsEditing(false)}
              />
            </CardBody>
          </Card>
        ) : (
          <>
            <ClientDetailCard client={client} />

            <div className="flex flex-wrap justify-end gap-3">
              {can('OWNER', 'OFFICE_MANAGER') && (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    <Pencil size={16} />
                    Edit Participant
                  </Button>
                  {client.isActive && (
                    <Button variant="danger" onClick={() => setIsDeactivateModalOpen(true)}>
                      <Trash2 size={16} />
                      Deactivate Participant
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <DeactivateClientModal
          isOpen={isDeactivateModalOpen}
          participantName={client.participantName}
          isDeactivating={isDeactivating}
          onCancel={() => setIsDeactivateModalOpen(false)}
          onConfirm={handleDeactivate}
        />
      </div>
    </AppLayout>
  );
}
