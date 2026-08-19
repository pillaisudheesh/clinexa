import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionQueryDto } from './dto/prescription-query.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    // -------------------------------------------------------------------------
    // Validate medical record belongs to this clinic
    // -------------------------------------------------------------------------

    const medicalRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: dto.medicalRecordId,

        patient: {
          clinicId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    // -------------------------------------------------------------------------
    // Validate medicine belongs to this clinic and is active
    // -------------------------------------------------------------------------

    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id: dto.medicineId,
        clinicId,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Active medicine not found');
    }

    // -------------------------------------------------------------------------
    // Create prescription
    // -------------------------------------------------------------------------

    const prescription = await this.prisma.prescription.create({
      data: {
        medicalRecordId: medicalRecord.id,

        medicineId: medicine.id,

        // Snapshot medicine name
        medicationName: medicine.name,

        dosage: dto.dosage,

        frequency: dto.frequency,

        route: dto.route,

        duration: dto.duration,

        quantity: dto.quantity,

        instructions: dto.instructions,
      },

      include: {
        medicine: true,
      },
    });

    return this.mapPrescription(prescription);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: PrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PrescriptionResponseDto>> {
    const { page = 1, limit = 10, search, medicalRecordId, medicineId } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {
      // ---------------------------------------------------------------------
      // Clinic isolation
      // ---------------------------------------------------------------------

      medicalRecord: {
        patient: {
          clinicId,
        },
      },

      // ---------------------------------------------------------------------
      // Medical record filter
      // ---------------------------------------------------------------------

      ...(medicalRecordId && {
        medicalRecordId,
      }),

      // ---------------------------------------------------------------------
      // Medicine filter
      // ---------------------------------------------------------------------

      ...(medicineId && {
        medicineId,
      }),

      // ---------------------------------------------------------------------
      // Search
      // ---------------------------------------------------------------------

      ...(search && {
        OR: [
          {
            medicationName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            dosage: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            instructions: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            medicine: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [prescriptions, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          medicine: true,
        },
      }),

      this.prisma.prescription.count({
        where,
      }),
    ]);

    return {
      data: prescriptions.map((prescription) =>
        this.mapPrescription(prescription),
      ),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(
    clinicId: string,
    id: string,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,

        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },

      include: {
        medicine: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return this.mapPrescription(prescription);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    // -------------------------------------------------------------------------
    // Find prescription within clinic
    // -------------------------------------------------------------------------

    const existing = await this.prisma.prescription.findFirst({
      where: {
        id,

        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },

      select: {
        id: true,
        medicineId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    // -------------------------------------------------------------------------
    // If medicine is being changed, validate it
    // -------------------------------------------------------------------------

    let medicineName: string | undefined;

    if (dto.medicineId !== undefined) {
      const medicine = await this.prisma.medicine.findFirst({
        where: {
          id: dto.medicineId,
          clinicId,
          isActive: true,
        },

        select: {
          id: true,
          name: true,
        },
      });

      if (!medicine) {
        throw new NotFoundException('Active medicine not found');
      }

      medicineName = medicine.name;
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    const prescription = await this.prisma.prescription.update({
      where: {
        id,
      },

      data: {
        ...(dto.medicineId !== undefined && {
          medicineId: dto.medicineId,

          medicationName: medicineName,
        }),

        ...(dto.dosage !== undefined && {
          dosage: dto.dosage,
        }),

        ...(dto.frequency !== undefined && {
          frequency: dto.frequency,
        }),

        ...(dto.route !== undefined && {
          route: dto.route,
        }),

        ...(dto.duration !== undefined && {
          duration: dto.duration,
        }),

        ...(dto.quantity !== undefined && {
          quantity: dto.quantity,
        }),

        ...(dto.instructions !== undefined && {
          instructions: dto.instructions,
        }),
      },

      include: {
        medicine: true,
      },
    });

    return this.mapPrescription(prescription);
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  async remove(
    clinicId: string,
    id: string,
  ): Promise<{
    message: string;
  }> {
    const existing = await this.prisma.prescription.findFirst({
      where: {
        id,

        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    await this.prisma.prescription.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Prescription deleted successfully',
    };
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapPrescription(
    prescription: Prisma.PrescriptionGetPayload<{
      include: {
        medicine: true;
      };
    }>,
  ): PrescriptionResponseDto {
    return {
      id: prescription.id,

      medicalRecordId: prescription.medicalRecordId,

      medicineId: prescription.medicineId,

      medicationName: prescription.medicationName,

      dosage: prescription.dosage,

      frequency: prescription.frequency,

      route: prescription.route,

      duration: prescription.duration,

      quantity: prescription.quantity,

      instructions: prescription.instructions,

      createdAt: prescription.createdAt,
    };
  }
}
