'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PlanManagementType } from '@/lib/types';
import { PLAN_MANAGEMENT_FILTER_OPTIONS } from './planManagementLabels';

export interface ClientFiltersValue {
  search: string;
  planManagementType: PlanManagementType | 'ALL';
  isActive: 'true' | 'false' | 'ALL';
}

interface ClientFiltersProps {
  value: ClientFiltersValue;
  onChange: (value: ClientFiltersValue) => void;
}

export function ClientFilters({ value, onChange }: ClientFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-[38px] text-text-muted"
          aria-hidden="true"
        />
        <Input
          label="Search"
          placeholder="Search participants..."
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Management type"
          value={value.planManagementType}
          onChange={(e) =>
            onChange({ ...value, planManagementType: e.target.value as ClientFiltersValue['planManagementType'] })
          }
        >
          {PLAN_MANAGEMENT_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-40">
        <Select
          label="Status"
          value={value.isActive}
          onChange={(e) => onChange({ ...value, isActive: e.target.value as ClientFiltersValue['isActive'] })}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="ALL">All statuses</option>
        </Select>
      </div>
    </div>
  );
}
