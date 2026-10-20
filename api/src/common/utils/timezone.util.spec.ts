import {
  addCalendarDays,
  dateKeyInTimezone,
  dateOnlyUtcRange,
  parseDateKey,
  startOfDateInTimezone,
} from './timezone.util';

describe('timezone utilities', () => {
  it('uses the clinic timezone to derive the current calendar date', () => {
    expect(dateKeyInTimezone(new Date('2026-10-20T19:00:00.000Z'), 'Asia/Kolkata')).toBe('2026-10-21');
    expect(dateKeyInTimezone(new Date('2026-10-21T00:30:00.000Z'), 'America/Los_Angeles')).toBe('2026-10-20');
  });

  it('converts clinic-local midnight to the correct UTC instant', () => {
    expect(startOfDateInTimezone('2026-10-21', 'Asia/Kolkata').toISOString()).toBe('2026-10-20T18:30:00.000Z');
    expect(startOfDateInTimezone('2026-03-08', 'America/New_York').toISOString()).toBe('2026-03-08T05:00:00.000Z');
    expect(startOfDateInTimezone('2026-03-09', 'America/New_York').toISOString()).toBe('2026-03-09T04:00:00.000Z');
  });

  it('advances calendar dates without depending on the server timezone', () => {
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addCalendarDays('2026-03-08', 1)).toBe('2026-03-09');
  });

  it('treats appointment dates as UTC calendar dates', () => {
    const range = dateOnlyUtcRange('2026-10-21');
    expect(range.from.toISOString()).toBe('2026-10-21T00:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-10-22T00:00:00.000Z');
  });

  it('rejects invalid calendar dates', () => {
    expect(() => parseDateKey('2026-02-30')).toThrow('Invalid calendar date');
    expect(() => parseDateKey('21-10-2026')).toThrow('Invalid calendar date');
  });
});
