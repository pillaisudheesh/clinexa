-- Generate stable, sequential clinic codes on the database side.
-- Start above any existing CLN-###### codes to avoid collisions during rollout.
CREATE SEQUENCE IF NOT EXISTS clinic_code_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
  'clinic_code_seq',
  COALESCE(
    MAX(SUBSTRING("code" FROM '^CLN-([0-9]+)$')::BIGINT),
    0
  ) + 1,
  false
)
FROM "Clinic"
WHERE "code" ~ '^CLN-[0-9]+$';
