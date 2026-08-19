import { Prisma } from '@prisma/client';

export const doctorInclude = Prisma.validator<Prisma.DoctorInclude>()({
  department: true,

  primarySpecialty: true,

  specialties: {
    include: {
      specialty: true,
    },
  },

  qualifications: {
    include: {
      qualification: true,
    },
  },

  languages: {
    include: {
      language: true,
    },
  },

  registrationCouncil: true,
});

export type DoctorWithRelations = Prisma.DoctorGetPayload<{
  include: typeof doctorInclude;
}>;
