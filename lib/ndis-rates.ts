/**
 * NDIS pricing catalogue and rate-cap source.
 * Module 3 consumes this rather than embedding its own catalogue
 * (see spec §13 and Gap B in §52) - the backend/rate engine remains the
 * authoritative source for financial calculations.
 */

export interface SupportItem {
  code: string;
  label: string;
}

export const SUPPORT_ITEMS: SupportItem[] = [
  { code: '01_011_0107_1_1', label: 'Daily Life Support' },
  { code: '01_002_0107_1_1', label: 'Assistance with Self-Care Activities' },
  { code: '01_013_0117_1_1', label: 'Community Participation' },
  { code: '04_104_0125_6_1', label: 'Household Tasks' },
  { code: '15_056_0128_1_3', label: 'Innovative Community Participation' },
];

export function getSupportItemLabel(code: string): string {
  return SUPPORT_ITEMS.find((item) => item.code === code)?.label ?? code;
}

/** 2026 NDIA standard weekday support-worker price cap (AUD/hour). */
export const DEFAULT_HOURLY_RATE_2026 = 67.56;
