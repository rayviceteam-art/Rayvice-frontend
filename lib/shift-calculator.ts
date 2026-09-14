import { DateTime } from 'luxon';
// NOTE: the Module 3 `SUPPORT_ITEMS` export is kept untouched for the
// participant forms; Module 4 shift logic uses `SHIFT_SUPPORT_ITEMS`.
import { NDIS_RATES_2026, SHIFT_SUPPORT_ITEMS as SUPPORT_ITEMS } from './ndis-rates';
import type { RateTier, ShiftLineItem } from './types';

export type PublicHolidayMode = 'AUTO' | 'FORCE_ON' | 'FORCE_OFF';

export interface ShiftSplitInput {
  shiftDate: string; // YYYY-MM-DD, in business timezone
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  travelKms: number;
  supportItemCode: string;
  clientHourlyRateAgreed: number | null | undefined;
  publicHolidayMode: PublicHolidayMode;
  businessState: string | null | undefined;
}

export interface ShiftSplitResult {
  lineItems: ShiftLineItem[];
  totalAmount: number;
  totalHours: number;
  isOvernight: boolean;
  errors: string[]; // blocks save when non-empty
  warnings: string[]; // informational only, never blocks save
}

// Minimal AU public holiday stub for the "Auto" resolution.
// Replace with the real client-side list mirrored from the backend catalogue.
const AU_PUBLIC_HOLIDAYS_2026: Record<string, string[]> = {
  NSW: ['2026-01-01', '2026-01-26', '2026-04-03', '2026-04-06', '2026-12-25', '2026-12-26'],
  VIC: ['2026-01-01', '2026-01-26', '2026-04-03', '2026-04-06', '2026-12-25', '2026-12-26'],
};

function isHolidayDate(dateIso: string, state: string | null | undefined): boolean {
  const list = AU_PUBLIC_HOLIDAYS_2026[state ?? 'NSW'] ?? AU_PUBLIC_HOLIDAYS_2026.NSW;
  return list.includes(dateIso);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function fmtTime(dt: DateTime, isEndOfDayBoundary: boolean): string {
  if (isEndOfDayBoundary) return '24:00';
  return dt.toFormat('HH:mm');
}

/** Pure client-side mirror of the backend split engine. Preview only — never persist these amounts. */
export function calculateShiftSplit(input: ShiftSplitInput, timezone: string): ShiftSplitResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.shiftDate || !input.startTime || !input.endTime) {
    return { lineItems: [], totalAmount: 0, totalHours: 0, isOvernight: false, errors, warnings };
  }

  if (input.startTime === input.endTime) {
    errors.push('End time must be after start time.');
    return { lineItems: [], totalAmount: 0, totalHours: 0, isOvernight: false, errors, warnings };
  }

  const start = DateTime.fromISO(`${input.shiftDate}T${input.startTime}`, { zone: timezone });
  const isOvernight = input.endTime <= input.startTime;
  const endDateIso = isOvernight
    ? DateTime.fromISO(input.shiftDate, { zone: timezone }).plus({ days: 1 }).toISODate()!
    : input.shiftDate;
  const end = DateTime.fromISO(`${endDateIso}T${input.endTime}`, { zone: timezone });

  const totalHours = end.diff(start, 'hours').hours;
  if (totalHours > 12) {
    warnings.push('Long shift (over 12 hours) — please confirm the times.');
  }

  // Step 1: split at local midnight into per-calendar-day segments.
  type DaySegment = { date: string; start: DateTime; end: DateTime; startIsMidnightBoundary: boolean; endIsMidnightBoundary: boolean };
  const daySegments: DaySegment[] = [];
  if (isOvernight) {
    const midnight = DateTime.fromISO(endDateIso, { zone: timezone }); // 00:00 of the next day
    daySegments.push({ date: input.shiftDate, start, end: midnight, startIsMidnightBoundary: false, endIsMidnightBoundary: true });
    daySegments.push({ date: endDateIso, start: midnight, end, startIsMidnightBoundary: true, endIsMidnightBoundary: false });
  } else {
    daySegments.push({ date: input.shiftDate, start, end, startIsMidnightBoundary: false, endIsMidnightBoundary: false });
  }

  // Step 2: resolve tier per day segment, splitting weekdays further at 20:00.
  interface SubSegment { date: string; tier: RateTier; start: DateTime; end: DateTime; startBoundary: boolean; endBoundary: boolean }
  const subSegments: SubSegment[] = [];

  for (const seg of daySegments) {
    if (seg.start.equals(seg.end)) continue; // zero-length segment (e.g. shift ends exactly at midnight)

    let holiday = false;
    if (input.publicHolidayMode === 'FORCE_ON') holiday = true;
    else if (input.publicHolidayMode === 'FORCE_OFF') holiday = false;
    else holiday = isHolidayDate(seg.date, input.businessState);

    const weekday = DateTime.fromISO(seg.date).weekday; // 1=Mon ... 7=Sun

    if (holiday) {
      subSegments.push({ date: seg.date, tier: 'HOLIDAY', start: seg.start, end: seg.end, startBoundary: seg.startIsMidnightBoundary, endBoundary: seg.endIsMidnightBoundary });
    } else if (weekday === 7) {
      subSegments.push({ date: seg.date, tier: 'SUNDAY', start: seg.start, end: seg.end, startBoundary: seg.startIsMidnightBoundary, endBoundary: seg.endIsMidnightBoundary });
    } else if (weekday === 6) {
      subSegments.push({ date: seg.date, tier: 'SATURDAY', start: seg.start, end: seg.end, startBoundary: seg.startIsMidnightBoundary, endBoundary: seg.endIsMidnightBoundary });
    } else {
      // weekday: split at 20:00 local into DAY / EVENING
      const eveningStart = DateTime.fromISO(`${seg.date}T20:00`, { zone: timezone });
      if (seg.end.toMillis() <= eveningStart.toMillis()) {
        subSegments.push({ date: seg.date, tier: 'DAY', start: seg.start, end: seg.end, startBoundary: seg.startIsMidnightBoundary, endBoundary: seg.endIsMidnightBoundary });
      } else if (seg.start.toMillis() >= eveningStart.toMillis()) {
        subSegments.push({ date: seg.date, tier: 'EVENING', start: seg.start, end: seg.end, startBoundary: seg.startIsMidnightBoundary, endBoundary: seg.endIsMidnightBoundary });
      } else {
        subSegments.push({ date: seg.date, tier: 'DAY', start: seg.start, end: eveningStart, startBoundary: seg.startIsMidnightBoundary, endBoundary: false });
        subSegments.push({ date: seg.date, tier: 'EVENING', start: eveningStart, end: seg.end, startBoundary: false, endBoundary: seg.endIsMidnightBoundary });
      }
    }
  }

  // Step 3: build line items for each sub-segment.
  const lineItems: ShiftLineItem[] = [];
  let sortOrder = 0;

  for (const sub of subSegments) {
    const hours = sub.end.diff(sub.start, 'hours').hours;
    if (hours <= 0) continue;
    const rateDef = NDIS_RATES_2026[sub.tier];
    const cap = rateDef.cap;
    const agreed = input.clientHourlyRateAgreed ?? null;
    const appliedRate = agreed != null ? Math.min(agreed, cap) : cap;
    const quantity = round2(hours);
    const amount = round2(quantity * appliedRate);
    const startLabel = fmtTime(sub.start, sub.startBoundary);
    const endLabel = fmtTime(sub.end, sub.endBoundary);
    const dayLabel = DateTime.fromISO(sub.date).toFormat('cccc');

    lineItems.push({
      rateTier: sub.tier,
      supportItemCode: input.supportItemCode,
      description: `${rateDef.label} ${dayLabel} ${startLabel} – ${endLabel}`,
      quantity,
      unit: 'Hour',
      ndisCapRate: cap,
      appliedRate,
      amount,
      segmentStart: sub.start.toISO(),
      segmentEnd: sub.end.toISO(),
      sortOrder: sortOrder++,
    });
  }

  // Step 4: travel line (statutory rate, never reduced by the agreed rate).
  const item = SUPPORT_ITEMS.find((s) => s.code === input.supportItemCode);
  const travelAllowed = item ? item.allowsTravel : true;
  if (input.travelKms > 0) {
    if (!travelAllowed) {
      errors.push("Travel can't be claimed with this support category.");
    } else {
      const travelRate = NDIS_RATES_2026.TRAVEL;
      const quantity = round2(input.travelKms);
      const amount = round2(quantity * travelRate.cap);
      lineItems.push({
        rateTier: 'TRAVEL',
        supportItemCode: input.supportItemCode,
        description: `Travel ${quantity} km`,
        quantity,
        unit: 'KM',
        ndisCapRate: travelRate.cap,
        appliedRate: travelRate.cap,
        amount,
        segmentStart: null,
        segmentEnd: null,
        sortOrder: sortOrder++,
      });
    }
  }

  const totalAmount = round2(lineItems.reduce((sum, li) => sum + li.amount, 0));

  return { lineItems, totalAmount, totalHours: round2(totalHours), isOvernight, errors, warnings };
}
