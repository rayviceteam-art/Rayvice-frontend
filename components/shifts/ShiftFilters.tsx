'use client';
import { Input, Select, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import type { ParticipantOption } from '@/lib/types';

export interface ShiftFiltersValue {
  from: string;
  to: string;
  clientId: string;
  workerId: string;
}

export function ShiftFilters({
  value,
  onChange,
  participants,
  workers,
}: {
  value: ShiftFiltersValue;
  onChange: (next: ShiftFiltersValue) => void;
  participants: ParticipantOption[];
  workers: Array<{ id: string; name: string }>;
}) {
  const { can } = useAuth();
  const canSeeWorkerFilter = can('OWNER', 'OFFICE_MANAGER'); // Q5 / QA 31: technicians never see this

  const isFiltered = Boolean(value.from || value.to || value.clientId || value.workerId);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-caption text-text-secondary">From</label>
        <Input type="date" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-caption text-text-secondary">To</label>
        <Input type="date" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} />
      </div>
      <div className="min-w-[180px]">
        <label className="mb-1 block text-caption text-text-secondary">Participant</label>
        <Select value={value.clientId} onChange={(e) => onChange({ ...value, clientId: e.target.value })}>
          <option value="">All participants</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.participantName}
            </option>
          ))}
        </Select>
      </div>
      {canSeeWorkerFilter && (
        <div className="min-w-[160px]">
          <label className="mb-1 block text-caption text-text-secondary">Worker</label>
          <Select value={value.workerId} onChange={(e) => onChange({ ...value, workerId: e.target.value })}>
            <option value="">All workers</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      {isFiltered && (
        <Button variant="ghost" onClick={() => onChange({ from: '', to: '', clientId: '', workerId: '' })}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
