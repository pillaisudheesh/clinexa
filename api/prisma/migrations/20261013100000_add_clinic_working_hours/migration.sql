CREATE TABLE "ClinicWorkingHours" (
  "id" TEXT NOT NULL,
  "clinicId" TEXT NOT NULL,
  "openingTime" TEXT NOT NULL DEFAULT '09:00',
  "closingTime" TEXT NOT NULL DEFAULT '18:00',
  "defaultAppointmentDuration" INTEGER NOT NULL DEFAULT 30,
  "workingDays" TEXT NOT NULL DEFAULT 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClinicWorkingHours_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClinicWorkingHours_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ClinicWorkingHours_clinicId_key" ON "ClinicWorkingHours"("clinicId");
