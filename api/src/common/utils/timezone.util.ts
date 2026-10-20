/**
 * Timezone helpers for converting clinic-local calendar dates to instants.
 * Calendar dates (YYYY-MM-DD) are deliberately handled separately from UTC
 * timestamps because appointmentDate is stored as a date-only value at UTC midnight.
 */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export function getCalendarDateInTimezone(
  value: Date,
  timezone: string,
): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
}

export function calendarDateKey(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function dateKeyInTimezone(value: Date, timezone: string): string {
  return calendarDateKey(getCalendarDateInTimezone(value, timezone));
}

export function addCalendarDays(dateKey: string, amount: number): string {
  const date = parseDateKey(dateKey);
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + amount));
  return calendarDateKey({
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  });
}

export function parseDateKey(value: string): CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  return { year, month, day };
}

/** Convert a clinic-local midnight to the corresponding UTC instant. */
export function startOfDateInTimezone(dateKey: string, timezone: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  const targetWallTime = Date.UTC(year, month - 1, day, 0, 0, 0);
  let candidate = targetWallTime;

  // Resolve the timezone offset iteratively. This avoids assuming the server's
  // local timezone and handles zones whose UTC offset is not a whole hour.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(candidate));
    const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
    const representedAsUtc = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
    );
    const difference = representedAsUtc - targetWallTime;
    if (difference === 0) break;
    candidate -= difference;
  }
  return new Date(candidate);
}

/** Date-only appointment fields are stored as UTC midnight, not timestamps. */
export function dateOnlyUtcRange(dateKey: string): { from: Date; to: Date } {
  const date = parseDateKey(dateKey);
  const from = new Date(Date.UTC(date.year, date.month - 1, date.day));
  const next = parseDateKey(addCalendarDays(dateKey, 1));
  return {
    from,
    to: new Date(Date.UTC(next.year, next.month - 1, next.day)),
  };
}
