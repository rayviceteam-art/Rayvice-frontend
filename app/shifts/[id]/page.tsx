'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody, Badge, Button, Skeleton } from '@/components/ui';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { CancelShiftModal } from '@/components/shifts/CancelShiftModal';
import { shiftsService } from '@/lib/shifts-service';
import { clientsService, toParticipantOptions } from '@/lib/clients-service';
import { getBusinessProfile, timezoneForState } from '@/lib/business-service';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { formatAud, formatCalendarDate, formatHours } from '@/lib/format';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client';
import type { ParticipantOption, Shift, UpdateShiftPayload } from '@/lib/types';

export default function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === '1';
  const { user, can } = useAuth();
  const { showToast } = useToast();

  const [shift, setShift] = useState<Shift | null>(null);
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [businessState, setBusinessState] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showCancel, setShowCancel] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const s = await shiftsService.get(id);
      setShift(s);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    clientsService
      .list({ isActive: true, pageSize: 100 })
      .then((res) => setParticipants(toParticipantOptions(res.data)))
      .catch(() => {});
    // Business state drives the rate-tier timezone (backend mirrors state -> timezone).
    getBusinessProfile()
      .then((p) => setBusinessState(p.state ?? null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canManage = can('OWNER', 'OFFICE_MANAGER') || shift?.userId === user?.id;

  async function handleUpdate(payload: UpdateShiftPayload, idempotencyKey: string) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    try {
      await shiftsService.update(id, payload, idempotencyKey);
      showToast('Shift updated successfully.', 'success');
      router.replace(`/shifts/${id}`);
      load();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) ?? {});
      load(); // 409s mean our local state was stale — re-fetch
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <AppLayout title="Shift">
        <Skeleton className="h-64 w-full" />
      </AppLayout>
    );
  }

  if (status === 'error' || !shift) {
    return (
      <AppLayout title="Shift">
        <Card>
          <CardBody>
            <p role="alert" className="text-error">
              Couldn&apos;t load this shift.
            </p>
            <Button className="mt-3" variant="secondary" onClick={load}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={shift.clientName} subtitle={`${formatCalendarDate(shift.shiftDate)} • ${shift.startTime}–${shift.endTime}`}>
      <Link href="/shifts" className="mb-4 inline-block text-body2 text-text-secondary hover:text-text-primary">
        ← Back to Shifts
      </Link>

      {isEditing && shift.status === 'PENDING' ? (
        <Card>
          <ShiftForm
            mode="edit"
            initialShift={shift}
            participants={participants}
            businessTimezone={timezoneForState(businessState)}
            businessState={businessState}
            isSubmitting={isSubmitting}
            serverError={serverError}
            serverFieldErrors={fieldErrors}
            onSubmit={handleUpdate}
            onCancel={() => router.replace(`/shifts/${id}`)}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-body2 text-text-secondary">
                  {shift.clientName} • {shift.ndisNumber}
                </p>
                <p className="text-body2 text-text-secondary">
                  {formatCalendarDate(shift.shiftDate)} • {shift.startTime}–{shift.endTime}
                  {shift.isOvernight && <Badge tone="info"><span className="ml-1">Next day</span></Badge>}
                </p>
                <p className="text-body2 text-text-secondary">{formatHours(shift.totalHours)} total</p>
              </div>
              <div className="text-right">
                <p className="text-h2 text-brand">{formatAud(shift.totalAmount)}</p>
                <Badge tone={shift.status === 'PENDING' ? 'warning' : shift.status === 'INVOICED' ? 'success' : 'muted'}>
                  {shift.status}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="mb-3 text-h4 text-text-primary">Split breakdown</h4>
              <div className="space-y-2">
                {shift.lineItems.map((li, i) => (
                  <div key={i} className="flex justify-between text-body2">
                    <div>
                      <div className="font-mono text-caption text-text-muted">{li.supportItemCode}</div>
                      <div>{li.description}</div>
                    </div>
                    <div className="text-right font-mono">
                      {li.quantity} {li.unit === 'Hour' ? 'h' : 'km'} × {formatAud(li.appliedRate)}
                      <div>= {formatAud(li.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
              {shift.isPublicHoliday && (
                <p className="mt-3 text-caption text-text-secondary">
                  Billed at the public holiday rate — {shift.publicHolidayName}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="mb-2 text-h4 text-text-primary">Details</h4>
              <p className="text-body2 text-text-secondary">Timezone: {shift.timezone}</p>
              <p className="text-body2 text-text-secondary">Created: {formatCalendarDate(shift.createdAt)}</p>
              {shift.caseNotes && <p className="mt-2 text-body2 text-text-primary">{shift.caseNotes}</p>}
            </CardBody>
          </Card>

          {shift.status === 'INVOICED' && (
            <Card>
              <CardBody className="bg-info-bg text-info">This shift is on an invoice and cannot be changed.</CardBody>
            </Card>
          )}
          {shift.status === 'CANCELLED' && (
            <Card>
              <CardBody className="bg-error-bg text-error">This shift was cancelled and is excluded from totals.</CardBody>
            </Card>
          )}

          {shift.status === 'PENDING' && canManage && (
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => router.push(`/shifts/${id}?edit=1`)}>
                Edit Shift
              </Button>
              <Button variant="danger" onClick={() => setShowCancel(true)}>
                Cancel Shift
              </Button>
            </div>
          )}
        </div>
      )}

      <CancelShiftModal
        shiftId={id}
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onCancelled={() => router.push('/shifts')}
      />
    </AppLayout>
  );
}
