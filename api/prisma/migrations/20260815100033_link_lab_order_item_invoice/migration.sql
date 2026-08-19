/*
  Warnings:

  - A unique constraint covering the columns `[labOrderItemId]` on the table `InvoiceItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "labOrderItemId" TEXT,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_labOrderItemId_key" ON "InvoiceItem"("labOrderItemId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_labOrderItemId_fkey" FOREIGN KEY ("labOrderItemId") REFERENCES "LabOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
