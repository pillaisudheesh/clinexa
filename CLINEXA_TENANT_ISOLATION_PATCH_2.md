# Clinexa tenant-isolation hardening — follow-up patch

## Scope

This patch closes several write-time scoping gaps in the latest source archive:

- Medicine updates and deactivation now include `clinicId` in the Prisma unique `where` condition.
- Pharmacy medicine updates and activation/deactivation now include `clinicId` in the mutation predicate.
- Billing invoice updates for modification, payment recording, issue, and cancellation repeat the `clinicId` predicate at write time.
- Invoice editing, item changes, issue, and cancellation repeat the `clinicId` predicate on invoice mutations.
- Prescription updates re-check the prescription's patient/medical-record clinic relationship inside the transaction.
- Prescription deletion uses a clinic-scoped relation predicate and verifies exactly one row was deleted.

## Validation

- ZIP integrity checked after packaging.
- TypeScript syntax transpilation checked for all modified service files.
- Full NestJS typecheck/build and database-backed tests must still be run in the user's environment.

## Important limitation

This is a targeted follow-up, not proof that every service is tenant-isolated. Remaining modules and nested relations still require systematic review and integration tests with at least two clinics.
