-- Reconcile the legacy quoted "AuditLog" table with the canonical mapped
-- audit_logs table used by schema.prisma. This migration is intentionally
-- forward-only and preserves legacy rows before removing the obsolete table.

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NULL THEN
    RAISE EXCEPTION 'Expected canonical table public.audit_logs does not exist. Apply the canonical audit-log migration before reconciliation.';
  END IF;

  IF to_regclass('public."AuditLog"') IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      "id",
      "clinicId",
      "userId",
      "action",
      "entity",
      "entityId",
      "details",
      "ipAddress",
      "userAgent",
      "createdAt"
    )
    SELECT
      legacy."id",
      legacy."clinicId",
      legacy."actorId",
      legacy."action",
      legacy."entityType",
      legacy."entityId",
      jsonb_strip_nulls(
        COALESCE(legacy."metadata", '{}'::jsonb)
        || CASE
             WHEN legacy."description" IS NOT NULL
             THEN jsonb_build_object('description', legacy."description")
             ELSE '{}'::jsonb
           END
      ),
      legacy."ipAddress",
      legacy."userAgent",
      legacy."createdAt"
    FROM public."AuditLog" AS legacy
    ON CONFLICT ("id") DO NOTHING;

    DROP TABLE public."AuditLog";
  END IF;
END $$;

-- Ensure the indexes expected by schema.prisma exist even if the canonical
-- table was created by a different prior migration path.
CREATE INDEX IF NOT EXISTS "audit_logs_clinicId_createdAt_idx"
  ON public.audit_logs ("clinicId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_createdAt_idx"
  ON public.audit_logs ("userId", "createdAt");
