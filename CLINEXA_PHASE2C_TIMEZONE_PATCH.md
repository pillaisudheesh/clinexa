# Clinexa Phase 2C — timezone/date handling

## Changes

- Added timezone utilities that calculate clinic-local calendar dates and UTC boundaries without relying on the API host's local timezone.
- Updated dashboard "today" windows to use the clinic's configured timezone for timestamp-based metrics and UTC calendar-date boundaries for `Appointment.appointmentDate` (stored as a date-only value at UTC midnight).
- Updated report date ranges to use clinic-local boundaries for timestamp-based records and date-only UTC boundaries for appointment calendar dates.
- Report ranges now validate `YYYY-MM-DD` values, reject reversed ranges, and cap the requested period at 366 days.
- Clinic creation/update now rejects invalid IANA timezone identifiers.
- Added timezone utility tests covering India, Los Angeles, DST boundary dates, date-only appointment ranges, calendar rollover, and invalid dates.

## Validation performed

- TypeScript syntax transpilation passed for the five changed/added TypeScript files.
- Executed direct Node checks against the compiled timezone helper: all seven date/time boundary checks passed.
- The full NestJS build and Jest suite were not run because the archive workspace does not have the project dependencies installed (`jest` was not found). Run `npm ci`, `npm run build`, and `npm test -- --runInBand` from `api` before merging/deploying.

## Important data-model assumption

`Appointment.appointmentDate` is treated as a calendar date stored at UTC midnight; `createdAt`, `paidAt`, and similar fields are treated as actual timestamps and grouped by clinic timezone. This matches the current service's `new Date('YYYY-MM-DD')` parsing pattern. If the schema/data is changed to store appointment instants instead, revisit the date-only UTC range logic.

## Additional regression-test hygiene

- Replaced the diagnosis service/controller placeholder specs with proper Prisma/service mocks and tenant-scoping assertions for cross-clinic lookup, create rejection, and update recheck.
- Removed a temporary permission-assignment debug log from `RolesService`.
- Syntax transpilation passed for these additional changed TypeScript files too. The Jest suite remains unexecuted because `jest` is not installed in the workspace.

## Tenant-mutation race hardening

- User update and status-change operations now conditionally mutate by both user ID and clinic ID for non-platform administrators, inside the transaction. If a platform administrator moved the user to another clinic after the initial read, the stale clinic-admin mutation fails as not found.
- Added a service test asserting the mutation-time clinic check.
