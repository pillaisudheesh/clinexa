#!/usr/bin/env bash
set -Eeuo pipefail

: "${BACKUP_FILE:?Set BACKUP_FILE to the exact backup file to restore}"
: "${PGHOST:?Set PGHOST}"
: "${PGPORT:=5432}"
: "${PGUSER:?Set PGUSER}"
: "${PGDATABASE:?Set PGDATABASE to the disposable restore target}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 2
fi
if [[ "${RESTORE_TARGET_DISPOSABLE:-}" != "YES" ]]; then
  echo "Refusing restore: set RESTORE_TARGET_DISPOSABLE=YES only for a disposable test database." >&2
  exit 2
fi
if [[ "${RESTORE_CONFIRM_DATABASE:-}" != "$PGDATABASE" ]]; then
  echo "Refusing restore: set RESTORE_CONFIRM_DATABASE to exactly '$PGDATABASE'." >&2
  exit 2
fi
if [[ -f "${BACKUP_FILE}.sha256" ]]; then
  shasum -a 256 --check "${BACKUP_FILE}.sha256"
fi
pg_restore --list "$BACKUP_FILE" >/dev/null
printf 'Restoring into explicitly confirmed disposable database %s at %s:%s\n' "$PGDATABASE" "$PGHOST" "$PGPORT"
# This replaces objects represented by the dump in the target database. Never aim it at production.
pg_restore --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" \
  --dbname="$PGDATABASE" --clean --if-exists --no-owner --no-privileges \
  --exit-on-error "$BACKUP_FILE"
printf 'Restore command completed. Run the verification queries in docs/RELEASE_HARDENING_RUNBOOK.md.\n'
