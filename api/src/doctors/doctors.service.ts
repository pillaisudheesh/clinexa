import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { DoctorQueryDto } from './dto/doctor-query.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';

import { doctorInclude } from './doctor.prisma';

import { DoctorMapper } from './doctor.mapper';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateDoctorDto,
  ): Promise<DoctorResponseDto> {
    await this.validateReferences(clinicId, dto);

    const doctorNumber = await this.generateDoctorNumber(clinicId);

    try {
      const doctor = await this.prisma.$transaction(async (tx) => {
        const createdDoctor = await tx.doctor.create({
          data: {
            clinicId,
            doctorNumber,

            title: dto.title,

            firstName: dto.firstName.trim(),

            middleName: dto.middleName?.trim() ?? null,

            lastName: dto.lastName.trim(),

            gender: dto.gender,

            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,

            email: dto.email?.trim() ?? null,

            phone: dto.phone?.trim() ?? null,

            departmentId: dto.departmentId,

            primarySpecialtyId: dto.primarySpecialtyId,

            registrationCouncilId: dto.registrationCouncilId ?? null,

            registrationNumber: dto.registrationNumber?.trim() ?? null,

            yearsOfExperience: dto.yearsOfExperience ?? null,

            employmentType: dto.employmentType,

            biography: dto.biography?.trim() ?? null,

            isActive: true,
          },
        });

        const specialtyIds = new Set<string>();

        specialtyIds.add(dto.primarySpecialtyId);

        for (const specialtyId of dto.additionalSpecialtyIds ?? []) {
          specialtyIds.add(specialtyId);
        }

        await tx.doctorSpecialty.createMany({
          data: Array.from(specialtyIds).map((specialtyId) => ({
            doctorId: createdDoctor.id,
            specialtyId,
          })),
          skipDuplicates: true,
        });

        if (dto.qualificationIds && dto.qualificationIds.length > 0) {
          await tx.doctorQualification.createMany({
            data: dto.qualificationIds.map((qualificationId) => ({
              doctorId: createdDoctor.id,
              qualificationId,
            })),
            skipDuplicates: true,
          });
        }

        if (dto.languageIds && dto.languageIds.length > 0) {
          await tx.doctorLanguage.createMany({
            data: dto.languageIds.map((languageId) => ({
              doctorId: createdDoctor.id,
              languageId,
            })),
            skipDuplicates: true,
          });
        }

        return tx.doctor.findUniqueOrThrow({
          where: {
            id: createdDoctor.id,
          },
          include: doctorInclude,
        });
      });

      // IMPORTANT:
      // Convert Prisma entity -> API DTO
      return DoctorMapper.toResponse(doctor);
    } catch (error) {
      this.handlePrismaError(
        error,
        'A doctor with these details already exists.',
      );
    }
  }

  // ===========================================================================
  // FIND ALL
  // ===========================================================================

  async findAll(clinicId: string, query: DoctorQueryDto) {
    const {
      page,
      limit,
      search,
      departmentId,
      specialtyId,
      isActive,
      sortBy,
      sortOrder,
    } = query;

    const where: Prisma.DoctorWhereInput = {
      clinicId,
    };

    // -------------------------------------------------------------------------
    // Department
    // -------------------------------------------------------------------------

    if (departmentId) {
      where.departmentId = departmentId;
    }

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // -------------------------------------------------------------------------
    // Specialty
    // -------------------------------------------------------------------------

    if (specialtyId) {
      where.specialties = {
        some: {
          specialtyId,
        },
      };
    }

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

    if (search?.trim()) {
      const searchTerm = search.trim();

      where.OR = [
        {
          doctorNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [doctors, total] = await this.prisma.$transaction([
      this.prisma.doctor.findMany({
        where,

        include: doctorInclude,

        orderBy,

        skip,

        take: limit,
      }),

      this.prisma.doctor.count({
        where,
      }),
    ]);

    return {
      data: DoctorMapper.toResponseList(doctors),

      meta: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===========================================================================
  // FIND ONE
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        clinicId,
      },

      include: doctorInclude,
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found.');
    }

    return DoctorMapper.toResponse(doctor);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found.');
    }

    await this.validateReferences(clinicId, dto);

    try {
      const doctor = await this.prisma.$transaction(async (tx) => {
        // ---------------------------------------------------------------
        // Update base doctor
        // ---------------------------------------------------------------

        await tx.doctor.update({
          where: {
            id,
          },

          data: {
            ...(dto.title !== undefined && {
              title: dto.title,
            }),

            ...(dto.firstName !== undefined && {
              firstName: dto.firstName.trim(),
            }),

            ...(dto.middleName !== undefined && {
              middleName: dto.middleName.trim() || null,
            }),

            ...(dto.lastName !== undefined && {
              lastName: dto.lastName.trim(),
            }),

            ...(dto.gender !== undefined && {
              gender: dto.gender,
            }),

            ...(dto.dateOfBirth !== undefined && {
              dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
            }),

            ...(dto.email !== undefined && {
              email: dto.email.trim() || null,
            }),

            ...(dto.phone !== undefined && {
              phone: dto.phone.trim() || null,
            }),

            ...(dto.departmentId !== undefined && {
              departmentId: dto.departmentId,
            }),

            ...(dto.primarySpecialtyId !== undefined && {
              primarySpecialtyId: dto.primarySpecialtyId,
            }),

            ...(dto.registrationCouncilId !== undefined && {
              registrationCouncilId: dto.registrationCouncilId || null,
            }),

            ...(dto.registrationNumber !== undefined && {
              registrationNumber: dto.registrationNumber.trim() || null,
            }),

            ...(dto.yearsOfExperience !== undefined && {
              yearsOfExperience: dto.yearsOfExperience,
            }),

            ...(dto.employmentType !== undefined && {
              employmentType: dto.employmentType,
            }),

            ...(dto.biography !== undefined && {
              biography: dto.biography.trim() || null,
            }),
          },
        });

        // ---------------------------------------------------------------
        // Specialties
        // ---------------------------------------------------------------

        if (
          dto.primarySpecialtyId !== undefined ||
          dto.additionalSpecialtyIds !== undefined
        ) {
          const primarySpecialtyId =
            dto.primarySpecialtyId ?? existingDoctor.primarySpecialtyId;

          const specialtyIds = new Set<string>();

          specialtyIds.add(primarySpecialtyId);

          for (const specialtyId of dto.additionalSpecialtyIds ?? []) {
            specialtyIds.add(specialtyId);
          }

          await tx.doctorSpecialty.deleteMany({
            where: {
              doctorId: id,
            },
          });

          await tx.doctorSpecialty.createMany({
            data: Array.from(specialtyIds).map((specialtyId) => ({
              doctorId: id,
              specialtyId,
            })),

            skipDuplicates: true,
          });
        }

        // ---------------------------------------------------------------
        // Qualifications
        // ---------------------------------------------------------------

        if (dto.qualificationIds !== undefined) {
          await tx.doctorQualification.deleteMany({
            where: {
              doctorId: id,
            },
          });

          if (dto.qualificationIds.length > 0) {
            await tx.doctorQualification.createMany({
              data: dto.qualificationIds.map((qualificationId) => ({
                doctorId: id,
                qualificationId,
              })),

              skipDuplicates: true,
            });
          }
        }

        // ---------------------------------------------------------------
        // Languages
        // ---------------------------------------------------------------

        if (dto.languageIds !== undefined) {
          await tx.doctorLanguage.deleteMany({
            where: {
              doctorId: id,
            },
          });

          if (dto.languageIds.length > 0) {
            await tx.doctorLanguage.createMany({
              data: dto.languageIds.map((languageId) => ({
                doctorId: id,
                languageId,
              })),

              skipDuplicates: true,
            });
          }
        }

        return tx.doctor.findUniqueOrThrow({
          where: {
            id,
          },

          include: doctorInclude,
        });
      });

      return DoctorMapper.toResponse(doctor);
    } catch (error) {
      this.handlePrismaError(
        error,
        'A doctor with these details already exists.',
      );
    }
  }

  // ===========================================================================
  // UPDATE STATUS
  // ===========================================================================

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdateDoctorStatusDto,
  ): Promise<DoctorResponseDto> {
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found.');
    }

    const doctor = await this.prisma.doctor.update({
      where: {
        id,
      },

      data: {
        isActive: dto.isActive,
      },

      include: doctorInclude,
    });

    return DoctorMapper.toResponse(doctor);
  }

  // ===========================================================================
  // DELETE / SOFT DELETE
  // ===========================================================================

  async remove(clinicId: string, id: string) {
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existingDoctor) {
      throw new NotFoundException('Doctor not found.');
    }

    await this.prisma.doctor.update({
      where: {
        id,
      },

      data: {
        isActive: false,
      },
    });

    return {
      message: 'Doctor deactivated successfully.',
    };
  }

  // ===========================================================================
  // VALIDATE REFERENCES
  // ===========================================================================

  private async validateReferences(
    clinicId: string,
    dto: CreateDoctorDto | UpdateDoctorDto,
  ): Promise<void> {
    // -------------------------------------------------------------------------
    // Department
    // -------------------------------------------------------------------------

    if (dto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: dto.departmentId,
          clinicId,
          isActive: true,
        },
      });

      if (!department) {
        throw new BadRequestException('Invalid department.');
      }
    }

    // -------------------------------------------------------------------------
    // Primary specialty
    // -------------------------------------------------------------------------

    if (dto.primarySpecialtyId) {
      const specialty = await this.prisma.specialty.findFirst({
        where: {
          id: dto.primarySpecialtyId,
          isActive: true,
        },
      });

      if (!specialty) {
        throw new BadRequestException('Invalid primary specialty.');
      }
    }

    // -------------------------------------------------------------------------
    // Additional specialties
    // -------------------------------------------------------------------------

    if (dto.additionalSpecialtyIds && dto.additionalSpecialtyIds.length > 0) {
      const specialtyIds = Array.from(new Set(dto.additionalSpecialtyIds));

      const count = await this.prisma.specialty.count({
        where: {
          id: {
            in: specialtyIds,
          },

          isActive: true,
        },
      });

      if (count !== specialtyIds.length) {
        throw new BadRequestException(
          'One or more additional specialties are invalid.',
        );
      }
    }

    // -------------------------------------------------------------------------
    // Qualifications
    // -------------------------------------------------------------------------

    if (dto.qualificationIds && dto.qualificationIds.length > 0) {
      const qualificationIds = Array.from(new Set(dto.qualificationIds));

      const count = await this.prisma.qualification.count({
        where: {
          id: {
            in: qualificationIds,
          },

          isActive: true,
        },
      });

      if (count !== qualificationIds.length) {
        throw new BadRequestException(
          'One or more qualifications are invalid.',
        );
      }
    }

    // -------------------------------------------------------------------------
    // Languages
    // -------------------------------------------------------------------------

    if (dto.languageIds && dto.languageIds.length > 0) {
      const languageIds = Array.from(new Set(dto.languageIds));

      const count = await this.prisma.language.count({
        where: {
          id: {
            in: languageIds,
          },

          isActive: true,
        },
      });

      if (count !== languageIds.length) {
        throw new BadRequestException('One or more languages are invalid.');
      }
    }

    // -------------------------------------------------------------------------
    // Registration Council
    // -------------------------------------------------------------------------

    if (dto.registrationCouncilId) {
      const council = await this.prisma.registrationCouncil.findFirst({
        where: {
          id: dto.registrationCouncilId,

          isActive: true,
        },
      });

      if (!council) {
        throw new BadRequestException('Invalid registration council.');
      }
    }
  }

  // ===========================================================================
  // GENERATE DOCTOR NUMBER
  // ===========================================================================

  private async generateDoctorNumber(clinicId: string): Promise<string> {
    const clinic = await this.prisma.clinic.findUnique({
      where: {
        id: clinicId,
      },

      select: {
        code: true,
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    const prefix = `${clinic.code}-DOC-`;

    const lastDoctor = await this.prisma.doctor.findFirst({
      where: {
        clinicId,

        doctorNumber: {
          startsWith: prefix,
        },
      },

      orderBy: {
        doctorNumber: 'desc',
      },

      select: {
        doctorNumber: true,
      },
    });

    let nextNumber = 1;

    if (lastDoctor) {
      const match = lastDoctor.doctorNumber.match(/(\d+)$/);

      if (match?.[1]) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    return `${prefix}` + `${String(nextNumber).padStart(6, '0')}`;
  }

  // ===========================================================================
  // SORT
  // ===========================================================================

  private buildOrderBy(
    sortBy: string | undefined,
    sortOrder: 'asc' | 'desc',
  ): Prisma.DoctorOrderByWithRelationInput {
    switch (sortBy) {
      case 'firstName':
        return {
          firstName: sortOrder,
        };

      case 'lastName':
        return {
          lastName: sortOrder,
        };

      case 'doctorNumber':
        return {
          doctorNumber: sortOrder,
        };

      case 'yearsOfExperience':
        return {
          yearsOfExperience: sortOrder,
        };

      case 'createdAt':
      default:
        return {
          createdAt: sortOrder,
        };
    }
  }

  // ===========================================================================
  // PRISMA ERROR HANDLING
  // ===========================================================================

  private handlePrismaError(error: unknown, conflictMessage: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(conflictMessage);
    }

    throw error;
  }
}
