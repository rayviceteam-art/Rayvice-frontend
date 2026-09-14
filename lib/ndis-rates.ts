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

// =======================================================================
// MODULE 4: tier rate mirror + shift support-item catalogue (additive).
// NOTE: `SUPPORT_ITEMS` above (Module 3 shape) is kept untouched for the
// participant forms. Module 4 shift UI uses `SHIFT_SUPPORT_ITEMS`, which
// carries the per-item travel flag the split preview needs.
// =======================================================================
import type { RateTier } from './types';

export interface NdisRateDef {
  tier: RateTier;
  itemCode: string;
  cap: number; // AUD
  unit: 'Hour' | 'KM';
  label: string;
}

// Mirror of the seeded catalogue — the database remains the source of truth (Rule 4).
export const NDIS_RATES_2026: Record<RateTier, NdisRateDef> = {
  DAY: { tier: 'DAY', itemCode: '01_011_0107_1_1', cap: 67.56, unit: 'Hour', label: 'Daytime' },
  EVENING: { tier: 'EVENING', itemCode: '01_015_0107_1_1', cap: 74.42, unit: 'Hour', label: 'Evening' },
  SATURDAY: { tier: 'SATURDAY', itemCode: '01_013_0107_1_1', cap: 95.07, unit: 'Hour', label: 'Saturday' },
  SUNDAY: { tier: 'SUNDAY', itemCode: '01_014_0107_1_1', cap: 122.59, unit: 'Hour', label: 'Sunday' },
  HOLIDAY: { tier: 'HOLIDAY', itemCode: '01_012_0107_1_1', cap: 150.11, unit: 'Hour', label: 'Public Holiday' },
  TRAVEL: { tier: 'TRAVEL', itemCode: '01_799_0107_1_1', cap: 0.97, unit: 'KM', label: 'Travel' },
};

export const SHIFT_SUPPORT_ITEMS: Array<{ code: string; label: string; allowsTravel: boolean }> = [
  { code: '01_011_0107_1_1', label: 'Assistance with Self-Care Activities', allowsTravel: true },
  { code: '01_020_0120_1_1', label: 'Community Participation', allowsTravel: true },
  { code: '01_002_0120_1_1', label: 'Household Tasks', allowsTravel: false },
];

export const DEFAULT_SUPPORT_ITEM_CODE = '01_011_0107_1_1';
