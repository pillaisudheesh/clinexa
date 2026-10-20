-- Use an atomic per-clinic sequence for patient numbers to avoid concurrent
-- registrations generating the same count-based identifier.
ALTER TABLE "Clinic"
ADD COLUMN "patientSequence" INTEGER NOT NULL DEFAULT 0;

-- Backfill the counter from existing patient numbers that follow
-- <clinic-code>-PAT-<numeric-sequence>.
UPDATE "Clinic" AS c
SET "patientSequence" = COALESCE(
  (
    SELECT MAX(NULLIF(regexp_replace(p."patientNumber", '^.*-PAT-', ''), '')::INTEGER)
    FROM "Patient" AS p
    WHERE p."clinicId" = c."id"
      AND p."patientNumber" ~ '-PAT-[0-9]+$'
  ),
  0
);
