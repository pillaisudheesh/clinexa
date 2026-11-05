-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- CreateIndex
CREATE INDEX "Clinic_organizationId_idx" ON "Clinic"("organizationId");

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: create one organization for each existing clinic.
INSERT INTO "Organization" (
    "id",
    "code",
    "name",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::TEXT,
    'ORG-' || "code",
    "name",
    "isActive",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Clinic";

-- Link each existing clinic to its new organization.
UPDATE "Clinic" AS c
SET "organizationId" = o."id"
FROM "Organization" AS o
WHERE o."code" = 'ORG-' || c."code";