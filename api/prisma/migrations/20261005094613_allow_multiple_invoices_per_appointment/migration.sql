-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('CONSULTATION', 'LABORATORY', 'PHARMACY', 'OTHER');

-- DropIndex
DROP INDEX "Invoice_appointmentId_key";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'CONSULTATION';

-- CreateIndex
CREATE INDEX "Invoice_appointmentId_idx" ON "Invoice"("appointmentId");

-- CreateIndex
CREATE INDEX "Invoice_type_idx" ON "Invoice"("type");
