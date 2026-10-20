#!/usr/bin/env bash
set -Eeuo pipefail

: "${PGHOST:?Set PGHOST}"
: "${PGPORT:=5432}"
: "${PGUSER:?Set PGUSER}"
: "${PGDATABASE:?Set PGDATABASE}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
umask 077
OUT="${BACKUP_DIR%/}/${PGDATABASE}_${STAMP}.dump"

printf 'Creating PostgreSQL backup for database %s at %s:%s\n' "$PGDATABASE" "$PGHOST" "$PGPORT"
pg_dump --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" \
  --dbname="$PGDATABASE" --format=custom --no-owner --no-privileges \
  --file="$OUT"

# Validate that the dump is readable before reporting success.
pg_restore --list "$OUT" >/dev/null
shasum -a 256 "$OUT" > "${OUT}.sha256"
chmod 600 "$OUT" "${OUT}.sha256"
printf 'Backup validated: %s\nChecksum: %s\n' "$OUT" "${OUT}.sha256"
