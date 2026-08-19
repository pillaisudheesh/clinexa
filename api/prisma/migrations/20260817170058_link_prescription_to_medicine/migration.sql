/*
  Warnings:

  - Added the required column `medicineId` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "medicineId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Prescription_medicineId_idx" ON "Prescription"("medicineId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
