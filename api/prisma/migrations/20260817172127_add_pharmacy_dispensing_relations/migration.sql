/*
  Warnings:

  - A unique constraint covering the columns `[pharmacyDispensingItemId]` on the table `InvoiceItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PharmacyDispensingStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "pharmacyDispensingItemId" TEXT;

-- CreateTable
CREATE TABLE "PharmacyDispensing" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "status" "PharmacyDispensingStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyDispensing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyDispensingItem" (
    "id" TEXT NOT NULL,
    "dispensingId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "medicineBatchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyDispensingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyDispensing_prescriptionId_key" ON "PharmacyDispensing"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacyDispensing_clinicId_idx" ON "PharmacyDispensing"("clinicId");

-- CreateIndex
CREATE INDEX "PharmacyDispensing_invoiceId_idx" ON "PharmacyDispensing"("invoiceId");

-- CreateIndex
CREATE INDEX "PharmacyDispensingItem_dispensingId_idx" ON "PharmacyDispensingItem"("dispensingId");

-- CreateIndex
CREATE INDEX "PharmacyDispensingItem_medicineId_idx" ON "PharmacyDispensingItem"("medicineId");

-- CreateIndex
CREATE INDEX "PharmacyDispensingItem_medicineBatchId_idx" ON "PharmacyDispensingItem"("medicineBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_pharmacyDispensingItemId_key" ON "InvoiceItem"("pharmacyDispensingItemId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_pharmacyDispensingItemId_fkey" FOREIGN KEY ("pharmacyDispensingItemId") REFERENCES "PharmacyDispensingItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensing" ADD CONSTRAINT "PharmacyDispensing_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensing" ADD CONSTRAINT "PharmacyDispensing_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensing" ADD CONSTRAINT "PharmacyDispensing_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensingItem" ADD CONSTRAINT "PharmacyDispensingItem_dispensingId_fkey" FOREIGN KEY ("dispensingId") REFERENCES "PharmacyDispensing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensingItem" ADD CONSTRAINT "PharmacyDispensingItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyDispensingItem" ADD CONSTRAINT "PharmacyDispensingItem_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
