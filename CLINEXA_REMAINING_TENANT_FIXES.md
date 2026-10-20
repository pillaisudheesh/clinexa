# Clinexa remaining tenant-isolation fixes

## Changes in this patch

The latest tenant-isolation source was reviewed for write operations that first checked clinic ownership and then mutated by record ID alone. The following mutations now repeat the clinic scope at write time:

- `api/src/lab-tests/lab-tests.service.ts`: lab test update and activation/deactivation.
- `api/src/lab-orders/lab-orders.service.ts`: lab order status update; lab order item result-completion and status updates use clinic-scoped relation predicates; related order status writes include `clinicId`.
- `api/src/inventory/inventory.service.ts`: stock adjustment, expired-batch marking, and stock-receipt batch updates.
- `api/src/departments/departments.service.ts`: department update and activation/deactivation.
- `api/src/roles/roles.service.ts`: role update and activation/deactivation.
- `api/src/doctors/doctors.service.ts`: doctor update.

These changes complement the previously included security, audit, timezone, diagnosis, user, prescription, billing, invoice, and pharmacy patches.

## Validation performed in this workspace

- TypeScript syntax transpilation passed for all six changed service files.
- The prior archive's ZIP integrity check passed before these changes; the new archive is checked separately after packaging.
- The complete NestJS typecheck/build, Jest suite, and database-backed cross-clinic tests have not been run because dependencies are not installed in this workspace.

## Required local verification

From `api/` run:

```bash
npm ci
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Before release, test with at least two clinics: a user from Clinic A must not be able to update, deactivate, complete, or otherwise mutate records belonging to Clinic B, even if the record ID is known. Also verify laboratory order status transitions under concurrent requests and stock quantities/ledger entries under concurrent inventory operations.
