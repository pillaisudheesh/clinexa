/*
  Warnings:

  - You are about to drop the column `registrationCouncil` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "registrationCouncil",
ADD COLUMN     "registrationCouncilId" TEXT;

-- CreateTable
CREATE TABLE "RegistrationCouncil" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RegistrationCouncil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationCouncil_code_key" ON "RegistrationCouncil"("code");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_registrationCouncilId_fkey" FOREIGN KEY ("registrationCouncilId") REFERENCES "RegistrationCouncil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
