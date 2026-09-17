'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ClientListItem } from '@/lib/types';

export interface InvoiceFiltersValue {
  from: string;
  to: string;
  clientId: string;
}

interface InvoiceFiltersProps {
  value: InvoiceFiltersValue;
  onChange: (value: InvoiceFiltersValue) => void;
  clients: ClientListItem[];
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  value,
  onChange,
  clients = [],
}) => {
  const hasFiltersApplied = value.from !== '' || value.to !== '' || value.clientId !== '';

  const handleClear = () => {
    onChange({ from: '', to: '', clientId: '' });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label htmlFor="filter-from-date" className="text-caption text-text-secondary">
          From Date
        </label>
        <input
          id="filter-from-date"
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="h-9 rounded-input border border-border bg-input px-3 text-body2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label htmlFor="filter-to-date" className="text-caption text-text-secondary">
          To Date
        </label>
        <input
          id="filter-to-date"
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="h-9 rounded-input border border-border bg-input px-3 text-body2 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-64">
        <label htmlFor="filter-participant" className="text-caption text-text-secondary">
          Participant
        </label>
        <select
          id="filter-participant"
          value={value.clientId}
          onChange={(e) => onChange({ ...value, clientId: e.target.value })}
          className="h-9 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
        >
          <option value="">All Participants</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.participantName} ({c.ndisNumber})
            </option>
          ))}
        </select>
      </div>

      {hasFiltersApplied && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 text-caption text-brand hover:underline h-9 px-2 transition-colors"
        >
          <X size={14} />
          Clear filters
        </button>
      )}
    </div>
  );
};
