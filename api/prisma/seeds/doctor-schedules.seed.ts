import { demoDoctorSchedules } from '../data/demo/demo-doctor-schedules';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedDoctorSchedules(clinicId: string) {
  console.log('Seeding doctor schedules...');

  for (const scheduleData of demoDoctorSchedules) {
    const doctor = await prisma.doctor.findFirst({
      where: {
        clinicId,
        doctorNumber: scheduleData.doctorNumber,
      },
    });

    if (!doctor) {
      throw new Error(`Doctor not found: ${scheduleData.doctorNumber}`);
    }

    const schedule = await prisma.doctorSchedule.upsert({
      where: {
        doctorId: doctor.id,
      },

      update: {
        slotDuration: scheduleData.slotDuration,
        bufferTime: scheduleData.bufferTime,
      },

      create: {
        doctorId: doctor.id,
        slotDuration: scheduleData.slotDuration,
        bufferTime: scheduleData.bufferTime,
      },
    });

    // Rebuild slots so the seed is idempotent.
    await prisma.doctorScheduleSlot.deleteMany({
      where: {
        scheduleId: schedule.id,
      },
    });

    if (scheduleData.slots.length > 0) {
      await prisma.doctorScheduleSlot.createMany({
        data: scheduleData.slots.map((slot) => ({
          scheduleId: schedule.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable ?? true,
        })),
      });
    }

    console.log(`✓ Schedule created for ${doctor.doctorNumber}`);
  }

  console.log(`✓ ${demoDoctorSchedules.length} doctor schedules seeded`);
}
