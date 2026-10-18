-- Create the canonical audit_logs table mapped by schema.prisma.
-- Legacy AuditLog cleanup is conditional so fresh databases do not fail when
-- that table or its old foreign-key constraints do not exist.

DO $$
BEGIN
  IF to_regclass('public."AuditLog"') IS NOT NULL THEN
    ALTER TABLE public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_actorId_fkey";
    ALTER TABLE public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_clinicId_fkey";
    DROP TABLE public."AuditLog";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    "id" TEXT NOT NULL,
    "clinicId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_clinicId_createdAt_idx"
  ON public.audit_logs ("clinicId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_createdAt_idx"
  ON public.audit_logs ("userId", "createdAt");
