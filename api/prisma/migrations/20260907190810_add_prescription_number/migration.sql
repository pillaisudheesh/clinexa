/*
  Warnings:

  - A unique constraint covering the columns `[prescriptionNumber]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prescriptionNumber` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "prescriptionSequence" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "prescriptionNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StockReceipt" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "supplierName" TEXT,
    "supplierInvoiceNumber" TEXT,
    "notes" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "medicineBatchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "sellingPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockReceipt_clinicId_idx" ON "StockReceipt"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "StockReceipt_clinicId_receiptNumber_key" ON "StockReceipt"("clinicId", "receiptNumber");

-- CreateIndex
CREATE INDEX "StockReceiptItem_receiptId_idx" ON "StockReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "StockReceiptItem_medicineId_idx" ON "StockReceiptItem"("medicineId");

-- CreateIndex
CREATE INDEX "StockReceiptItem_medicineBatchId_idx" ON "StockReceiptItem"("medicineBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_prescriptionNumber_key" ON "Prescription"("prescriptionNumber");

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceiptItem" ADD CONSTRAINT "StockReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "StockReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceiptItem" ADD CONSTRAINT "StockReceiptItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceiptItem" ADD CONSTRAINT "StockReceiptItem_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES "MedicineBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
