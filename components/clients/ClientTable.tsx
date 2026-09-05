'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { ClientListItem } from '@/lib/types';
import { PLAN_MANAGEMENT_LABELS } from './planManagementLabels';

interface ClientTableProps {
  clients: ClientListItem[];
  isLoading: boolean;
  hasFiltersApplied: boolean;
  onAddParticipant: () => void;
}

export function ClientTable({ clients, isLoading, hasFiltersApplied, onAddParticipant }: ClientTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Table>
        <Thead>
          <tr>
            <Th>Participant</Th>
            <Th>NDIS Number</Th>
            <Th>Management</Th>
            <Th>Budget</Th>
            <Th>Uninvoiced</Th>
            <Th>Status</Th>
          </tr>
        </Thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <Tr key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
                <Td key={j}>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-16 text-center">
        {hasFiltersApplied ? (
          <>
            <h3 className="text-h4 text-text-primary">No participants found</h3>
            <p className="text-body2 text-text-secondary">Try a different search or filter.</p>
          </>
        ) : (
          <>
            <h3 className="text-h4 text-text-primary">No participants yet</h3>
            <p className="text-body2 text-text-secondary">Add your first NDIS participant to start logging shifts.</p>
            <Button onClick={onAddParticipant} className="mt-2">
              + Add Participant
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Participant</Th>
          <Th>NDIS Number</Th>
          <Th>Management</Th>
          <Th>Budget</Th>
          <Th>Uninvoiced</Th>
          <Th>Status</Th>
        </tr>
      </Thead>
      <tbody>
        {clients.map((client) => {
          const usedPct =
            client.allocatedBudgetTotal && client.allocatedBudgetTotal > 0
              ? Math.round((client.allocatedBudgetSpent / client.allocatedBudgetTotal) * 100)
              : null;

          return (
            <Tr
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="cursor-pointer hover:bg-elevated"
            >
              <Td className="font-medium">{client.participantName}</Td>
              <Td className="tabular-nums text-text-secondary">{client.ndisNumber}</Td>
              <Td>
                <Badge tone="brand">{PLAN_MANAGEMENT_LABELS[client.planManagementType]}</Badge>
              </Td>
              <Td>{usedPct === null ? <span className="text-text-muted">—</span> : `${usedPct}%`}</Td>
              <Td>
                {client.pendingUninvoicedShiftsCount > 0 ? (
                  <span>{client.pendingUninvoicedShiftsCount} uninvoiced shifts</span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </Td>
              <Td>
                <Badge tone={client.isActive ? 'success' : 'neutral'}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
