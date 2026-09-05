'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientFilters, ClientFiltersValue } from '@/components/clients/ClientFilters';
import { ClientTable } from '@/components/clients/ClientTable';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { clientsService } from '@/lib/clients-service';
import { ClientListItem, PlanManagementType } from '@/lib/types';

const DEBOUNCE_MS = 350;

export default function ClientsPage() {
  const router = useRouter();
  const { can } = useAuth();

  const [filters, setFilters] = useState<ClientFiltersValue>({ search: '', planManagementType: 'ALL', isActive: 'true' });
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadClients = useCallback(async (currentFilters: ClientFiltersValue, currentPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clientsService.list({
        page: currentPage,
        pageSize: 20,
        search: currentFilters.search || undefined,
        isActive: currentFilters.isActive === 'ALL' ? undefined : currentFilters.isActive === 'true',
        planManagementType:
          currentFilters.planManagementType === 'ALL' ? undefined : (currentFilters.planManagementType as PlanManagementType),
      });
      setClients(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong while retrieving your participant directory.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search + immediate filter changes; resets to page 1 on any change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadClients(filters, 1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (page === 1) return; // already loaded by the filter effect above
    loadClients(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const hasFiltersApplied = filters.search !== '' || filters.planManagementType !== 'ALL' || filters.isActive !== 'true';

  return (
    <AppLayout title="NDIS Participants" subtitle="Manage NDIS participants and plan-manager routing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 text-text-primary">Participants</h1>
            <p className="text-body2 text-text-secondary">Manage NDIS participants and plan-manager routing</p>
          </div>
          {can('OWNER', 'OFFICE_MANAGER') && (
            <Link href="/clients/new">
              <Button>
                <Plus size={16} />
                Add Participant
              </Button>
            </Link>
          )}
        </div>

        <ClientFilters value={filters} onChange={setFilters} />

        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-error-border bg-error-bg px-6 py-16 text-center">
            <h3 className="text-h4 text-text-primary">Unable to load participants</h3>
            <p className="text-body2 text-text-secondary">{error}</p>
            <Button variant="secondary" onClick={() => loadClients(filters, page)}>
              <RefreshCw size={16} />
              Try Again
            </Button>
          </div>
        ) : (
          <ClientTable
            clients={clients}
            isLoading={isLoading}
            hasFiltersApplied={hasFiltersApplied}
            onAddParticipant={() => router.push('/clients/new')}
          />
        )}

        {!error && !isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-body2 text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
