# Clinexa release hardening runbook

This runbook supplements the passing build/unit/E2E/typecheck/isolation checks reported by the project team. It does not claim that a backup or restore has already been executed.

## 0. Local Docker configuration

The Compose file intentionally requires `POSTGRES_PASSWORD` and binds PostgreSQL to localhost. For local development, copy `.env.compose.example` to project-root `.env` and replace the placeholder with a unique password. For an existing Docker volume, changing the environment variable does not rotate the password of an already-initialized PostgreSQL role; rotate the role password separately and update application connection settings in a planned maintenance step. Never use development credentials in production.

## 1. Backup and restore drill (start here)

### Preconditions
- Use a staging or disposable PostgreSQL environment first; never test restore against production.
- Install PostgreSQL client tools compatible with the server (`pg_dump`, `pg_restore`, `psql`).
- Supply connection settings through environment variables or a protected `PGPASSFILE`; do not put passwords on command lines or commit them.
- Store backups outside the database host/volume and encrypt them according to your deployment policy. Restrict backup directory access.

### Create and validate a backup

From the repository root, make the script executable once:

```bash
chmod 700 scripts/backup-postgres.sh scripts/restore-postgres-disposable.sh
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=clinexa PGDATABASE=clinexa
# Prefer PGPASSFILE; alternatively export PGPASSWORD in your shell without echoing it.
export BACKUP_DIR="$PWD/backups"
./scripts/backup-postgres.sh
```

The script uses PostgreSQL custom format, validates the archive with `pg_restore --list`, and writes a SHA-256 checksum. The scripts use `shasum`, which is available on macOS and common Linux systems. Copy the dump and checksum to the approved protected backup location. Do not commit either file.

### Restore into a disposable database

Create an empty disposable database using an authorized database administrator. Set `PGDATABASE` to that disposable database—not the source database—and run:

```bash
export PGDATABASE=clinexa_restore_drill
export BACKUP_FILE="$PWD/backups/REPLACE_WITH_EXACT_DUMP_FILENAME.dump"
export RESTORE_TARGET_DISPOSABLE=YES
export RESTORE_CONFIRM_DATABASE="$PGDATABASE"
./scripts/restore-postgres-disposable.sh
```

The restore script has explicit guard variables and uses `pg_restore --clean`; it can replace objects in the selected target database. The guard is not a substitute for checking the target host and database name yourself.

### Validate restored data

At minimum, compare source and restored row counts for key tables and check that recent records exist. Example queries (adjust names to the actual schema):

```sql
SELECT COUNT(*) FROM "Clinic";
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Patient";
SELECT COUNT(*) FROM "Appointment";
SELECT COUNT(*) FROM audit_logs;
```

Compare results with a source snapshot taken at the same point in time. Also verify relationships, sequences, clinic settings, prescription/invoice numbering, inventory quantities, and audit event timestamps. Perform a login and read-only workflow smoke test against the restored environment. Record duration, checksum, discrepancies, and outcome. A successful `pg_restore` alone is not a successful recovery drill.

## 2. Migration safety

- Test migrations against both a clean empty database and a copy of a database representing the previous deployed version.
- Capture migration status before and after with `npx prisma migrate status` from `api/`.
- Verify audit-log preservation by seeding legacy audit rows in a disposable database before running the migration path; compare row counts and mapped fields afterward.
- Do not edit migrations already applied to a shared or production database. Use a new forward migration for any correction that must reach those databases.
- Never run `db:reset` against a working, staging, or production database.

## 3. Authorization and clinic isolation

For each role (platform administrator, clinic administrator, doctor, nurse, receptionist), verify allowed and denied actions. Test cross-clinic IDs for patients, appointments, diagnoses, prescriptions, dispensing, laboratory orders/results, inventory batches, invoices, departments, users, and roles. Check persisted state after denied operations. Verify clinic roles cannot acquire platform-only permissions and that platform authority comes from the database-backed platform-admin flag.

## 4. Transaction rollback and concurrency

In a disposable test environment, force audit insertion failure and verify the associated business write rolls back. Race appointment slot creation, invoice/prescription numbering, stock deductions, partial dispensing, and cancellation/restoration. Confirm uniqueness, non-negative stock, consistent invoice totals, and exactly-once stock restoration. Capture database state before and after each race.

## 5. Clinical/timezone regression

Exercise clinic-local day boundaries, leap day/month/year rollover, invalid/reversed date ranges, and daylight-saving transitions for clinics using DST. Verify working hours, doctor availability, appointment overlap rules, cancellation/rescheduling, consultation completion, prescription changes, partial dispensing, lab result transitions, and invoice consistency.

## 6. Deployment smoke test

The API health endpoint is `/api/v1/health`. It should return HTTP 200 with `status: UP` and `database: UP` when PostgreSQL is reachable, and HTTP 503 when the database query fails.

After deployment, verify:
- API health endpoint returns expected status and the API can reach PostgreSQL.
- Frontend loads and authenticated API calls succeed through the deployed proxy/TLS endpoint.
- Production configuration rejects missing/placeholder secrets and does not expose Swagger unless intentionally enabled.
- Logs contain useful correlation/error information but no bearer tokens, passwords, or sensitive patient data.
- Backup schedule, retention, encryption, restore ownership, monitoring, and alert routing are configured.
- A test clinic can complete login → patient → appointment → consultation → prescription → dispensing → lab → billing, using test data only.

## Exit criteria

Do not mark release-ready until the backup is restored successfully into a disposable database, data checks reconcile, clean-install and upgrade migrations pass, authorization/concurrency checks are recorded, and deployment smoke tests pass. Attach logs/results to the release record; redact secrets and patient data.
