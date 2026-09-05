import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { formatAud, formatCalendarDate } from '@/lib/format';
import { getSupportItemLabel } from '@/lib/ndis-rates';
import { ClientDetailResponse } from '@/lib/types';
import { BudgetProgress } from './BudgetProgress';
import { PLAN_MANAGEMENT_LABELS } from './planManagementLabels';

export function ClientDetailCard({ client }: { client: ClientDetailResponse }) {
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
            <p className="text-body1 text-text-primary">{formatAud(client.hourlyRateAgreed)} AUD/hour</p>
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
          {client.recentShifts.length === 0 ? (
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
                  {client.recentShifts.map((shift) => (
                    <Tr key={shift.id}>
                      <Td>{formatCalendarDate(shift.date)}</Td>
                      <Td>{shift.startTime}</Td>
                      <Td>{shift.endTime}</Td>
                      <Td>{shift.hours}</Td>
                      <Td>{formatAud(shift.amount)}</Td>
                      <Td>
                        <Badge tone="neutral">{shift.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
