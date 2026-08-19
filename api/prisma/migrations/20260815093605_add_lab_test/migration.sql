-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "unit" TEXT,
    "normalRange" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabTest_clinicId_idx" ON "LabTest"("clinicId");

-- CreateIndex
CREATE INDEX "LabTest_isActive_idx" ON "LabTest"("isActive");

-- CreateIndex
CREATE INDEX "LabTest_category_idx" ON "LabTest"("category");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_clinicId_code_key" ON "LabTest"("clinicId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_clinicId_name_key" ON "LabTest"("clinicId", "name");

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
