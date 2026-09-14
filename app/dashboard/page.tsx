'use client';
import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklyEarningsCard } from '@/components/dashboard/WeeklyEarningsCard';
import { UninvoicedBanner } from '@/components/dashboard/UninvoicedBanner';
import { BudgetWatchCard } from '@/components/dashboard/BudgetWatchCard';
import { RecentShiftsCard } from '@/components/dashboard/RecentShiftsCard';
import { Card, CardBody, Skeleton, Button } from '@/components/ui';
import { dashboardService } from '@/lib/dashboard-service';
import type { DashboardSummary } from '@/lib/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await dashboardService.getSummary(); // single call powers every widget below
      setSummary(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <AppLayout title="Dashboard" onShiftSaved={load}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </AppLayout>
    );
  }

  if (status === 'error' || !summary) {
    return (
      <AppLayout title="Dashboard" onShiftSaved={load}>
        <Card>
          <CardBody>
            <p role="alert" className="text-error">
              Couldn&apos;t load your dashboard.
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
    <AppLayout title="Dashboard" onShiftSaved={load}>
      <div className="space-y-4">
        <UninvoicedBanner data={summary.uninvoiced} />

        {summary.trial && (
          <Card>
            <CardBody className="flex items-center justify-between">
              <span className="text-body2 text-text-secondary">
                Trial: {summary.trial.shiftsUsed}/{summary.trial.shiftsLimit} shifts • {summary.trial.daysRemaining} days left
              </span>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <WeeklyEarningsCard data={summary.thisWeek} />
          <Card>
            <CardBody>
              <p className="text-caption uppercase tracking-wide text-text-secondary">Active participants</p>
              <p className="text-h1 text-text-primary">{summary.activeParticipants}</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RecentShiftsCard shifts={summary.recentShifts} />
          <BudgetWatchCard data={summary.budgetWatch} />
        </div>
      </div>
    </AppLayout>
  );
}
