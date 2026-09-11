'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { formatAud, formatCalendarDate } from '@/lib/format';
import { getSupportItemLabel } from '@/lib/ndis-rates';
import { ClientDetailResponse } from '@/lib/types';
import { shiftsService } from '@/lib/shifts-service';
import { BudgetProgress } from './BudgetProgress';
import { PLAN_MANAGEMENT_LABELS } from './planManagementLabels';

export function ClientDetailCard({ client }: { client: ClientDetailResponse }) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [allShifts, setAllShifts] = useState(client.recentShifts ?? []);

  useEffect(() => {
    shiftsService.list({ clientId: client.id }).then((records) => {
      const formattedLocal = records.map((r) => ({
        id: r.id,
        date: r.shiftDate,
        startTime: r.startTime,
        endTime: r.endTime,
        hours: r.totalHours,
        amount: r.grandTotal,
        status: r.status,
      }));

      const existingIds = new Set((client.recentShifts ?? []).map((s) => s.id));
      const newItems = formattedLocal.filter((s) => !existingIds.has(s.id));
      setAllShifts([...newItems, ...(client.recentShifts ?? [])]);
    }).catch(() => {
      // fallback
    });
  }, [client.id, client.recentShifts]);

  const totalShifts = allShifts.length;
  const totalPages = Math.max(1, Math.ceil(totalShifts / pageSize));
  const paginatedShifts = allShifts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h2 text-text-primary">{client.participantName}</h1>
            <Badge tone={client.isActive ? 'success' : 'neutral'}>{client.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className="text-body2 text-text-secondary">NDIS Number: {client.ndisNumber}</p>
          <Badge tone="brand" className="w-fit">
            {PLAN_MANAGEMENT_LABELS[client.planManagementType]}
          </Badge>
        </CardBody>
      </Card>

      {client.planManagementType === 'PLAN_MANAGED' && (
        <Card>
          <CardHeader>
            <h2 className="text-h4 text-text-primary">Plan Manager</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-1">
            <p className="text-body1 text-text-primary">{client.planManagerAgencyName ?? '—'}</p>
            <p className="text-body2 text-text-secondary">{client.planManagerEmail ?? '—'}</p>
          </CardBody>
        </Card>
      )}

      {client.planManagementType === 'SELF_MANAGED' && (
        <Card>
          <CardHeader>
            <h2 className="text-h4 text-text-primary">Parent / Nominee Billing</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-1">
            <p className="text-body1 text-text-primary">{client.selfManagedBillingEmail ?? '—'}</p>
            <p className="text-body2 text-text-secondary">{client.selfManagedBillingPhone ?? '—'}</p>
          </CardBody>
        </Card>
      )}

      {client.planManagementType === 'NDIA_MANAGED' && (
        <Card>
          <CardBody>
            <p className="text-body2 text-text-secondary">
              Invoices for this participant are claimed through the PRODA Myplace portal.
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-h4 text-text-primary">Budget</h2>
        </CardHeader>
        <CardBody>
          <BudgetProgress
            allocatedBudgetTotal={client.allocatedBudgetTotal}
            allocatedBudgetSpent={client.allocatedBudgetSpent}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-h4 text-text-primary">Default Support</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-1">
            <p className="text-body1 text-text-primary">{client.defaultSupportItemCode}</p>
            <p className="text-body2 text-text-secondary">{getSupportItemLabel(client.defaultSupportItemCode)}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h4 text-text-primary">Agreed Rate</h2>
          </CardHeader>
          <CardBody>
            <p className="text-body1 text-text-primary">
              {client.hourlyRateAgreed !== null ? `${formatAud(client.hourlyRateAgreed)} AUD/hour` : '—'}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-h4 text-text-primary">Recent Shifts</h2>
          {client.pendingUninvoicedShiftsCount > 0 && (
            <Badge tone="warning">{client.pendingUninvoicedShiftsCount} uninvoiced</Badge>
          )}
        </CardHeader>
        <div>
          {paginatedShifts.length === 0 ? (
            <p className="px-5 py-6 text-body2 text-text-muted">No shifts logged for this participant yet.</p>
          ) : (
            <div className="px-5 pb-5">
              <Table>
                <Thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Start</Th>
                    <Th>End</Th>
                    <Th>Hours</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                  </tr>
                </Thead>
                <tbody>
                  {paginatedShifts.map((shift) => (
                    <Tr key={shift.id}>
                      <Td>{formatCalendarDate(shift.date)}</Td>
                      <Td>{shift.startTime}</Td>
                      <Td>{shift.endTime}</Td>
                      <Td>{shift.hours}</Td>
                      <Td>{formatAud(shift.amount)}</Td>
                      <Td>
                        <Badge tone={shift.status === 'INVOICED' ? 'neutral' : 'brand'}>{shift.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#253130] pt-3 mt-3 text-xs text-text-secondary">
                  <span>
                    Page {page} of {totalPages} ({totalShifts} total shifts)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
