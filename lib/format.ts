export function formatAud(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formats a `YYYY-MM-DD` calendar date without shifting for browser timezone. */
export function formatCalendarDate(value: string): string {
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    date,
  );
}

// MODULE 4 (additive): compact hours display for the shift split preview.
export function formatHours(hours: number): string {
  return `${(hours ?? 0).toFixed(2).replace(/\.00$/, '')} h`;
}
