'use client';

import { PlanManagementType } from '@/lib/types';

const OPTIONS: { value: PlanManagementType; label: string }[] = [
  { value: 'PLAN_MANAGED', label: 'Plan-Managed' },
  { value: 'SELF_MANAGED', label: 'Self-Managed' },
  { value: 'NDIA_MANAGED', label: 'NDIA-Managed' },
];

interface PlanManagementSelectorProps {
  value: PlanManagementType;
  onChange: (value: PlanManagementType) => void;
}

export function PlanManagementSelector({ value, onChange }: PlanManagementSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body2 font-medium text-text-secondary" id="plan-management-type-label">
        Plan Management Type
      </span>
      <div
        role="radiogroup"
        aria-labelledby="plan-management-type-label"
        className="inline-flex w-full rounded border border-border bg-input p-1 sm:w-auto"
      >
        {OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded px-4 py-2 text-body2 font-medium transition-colors sm:flex-none ${
                isSelected ? 'bg-brand text-background' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
