import { PlanManagementType } from '@/lib/types';

export const PLAN_MANAGEMENT_LABELS: Record<PlanManagementType, string> = {
  PLAN_MANAGED: 'Plan-Managed',
  SELF_MANAGED: 'Self-Managed',
  NDIA_MANAGED: 'NDIA-Managed',
};

export const PLAN_MANAGEMENT_FILTER_OPTIONS: { value: PlanManagementType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'PLAN_MANAGED', label: 'Plan-Managed' },
  { value: 'SELF_MANAGED', label: 'Self-Managed' },
  { value: 'NDIA_MANAGED', label: 'NDIA-Managed' },
];
