import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { DiagnosisQueryDto } from './dto/diagnosis-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { DiagnosisResponseDto } from './dto/diagnosis-response.dto';

@Injectable()
export class DiagnosisService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(clinicId: string, dto: CreateDiagnosisDto) {
    const medicalRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: dto.medicalRecordId,
        patient: { clinicId },
        doctor: { clinicId },
        appointment: { clinicId },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary === true) {
        await tx.diagnosis.updateMany({
          where: {
            medicalRecordId: dto.medicalRecordId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      return tx.diagnosis.create({
        data: {
          medicalRecordId: dto.medicalRecordId,
          code: dto.code,
          name: dto.name,
          isPrimary: dto.isPrimary ?? false,
          notes: dto.notes,
        },
      });
    });
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: DiagnosisQueryDto,
  ): Promise<PaginatedResponseDto<DiagnosisResponseDto>> {
    const { page = 1, limit = 10, search, medicalRecordId } = query;

    const skip = (page - 1) * limit;

    const where = {
      medicalRecord: {
        patient: { clinicId },
        doctor: { clinicId },
        appointment: { clinicId },
      },
      ...(medicalRecordId && {
        medicalRecordId,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            code: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            notes: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [diagnoses, total] = await this.prisma.$transaction([
      this.prisma.diagnosis.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.diagnosis.count({
        where,
      }),
    ]);

    return {
      data: diagnoses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(clinicId: string, id: string) {
    const diagnosis = await this.prisma.diagnosis.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
          doctor: { clinicId },
          appointment: { clinicId },
        },
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            patientId: true,
            doctorId: true,
            appointmentId: true,
          },
        },
      },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return diagnosis;
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(clinicId: string, id: string, dto: UpdateDiagnosisDto) {
    const existing = await this.prisma.diagnosis.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
          doctor: { clinicId },
          appointment: { clinicId },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Diagnosis not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Recheck tenant ownership inside the transaction before changing records.
      const scoped = await tx.diagnosis.findFirst({
        where: {
          id,
          medicalRecord: {
            patient: { clinicId },
            doctor: { clinicId },
            appointment: { clinicId },
          },
        },
        select: { id: true, medicalRecordId: true },
      });
      if (!scoped) throw new NotFoundException('Diagnosis not found');

      if (dto.isPrimary === true) {
        await tx.diagnosis.updateMany({
          where: {
            medicalRecordId: scoped.medicalRecordId,
            isPrimary: true,
            NOT: {
              id,
            },
          },
          data: {
            isPrimary: false,
          },
        });
      }

      return tx.diagnosis.update({
        where: {
          id: scoped.id,
        },
        data: {
          ...(dto.code !== undefined && {
            code: dto.code,
          }),

          ...(dto.name !== undefined && {
            name: dto.name,
          }),

          ...(dto.isPrimary !== undefined && {
            isPrimary: dto.isPrimary,
          }),

          ...(dto.notes !== undefined && {
            notes: dto.notes,
          }),
        },
      });
    });
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  async remove(clinicId: string, id: string) {
    const existing = await this.prisma.diagnosis.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
          doctor: { clinicId },
          appointment: { clinicId },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Diagnosis not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const scoped = await tx.diagnosis.findFirst({
        where: {
          id,
          medicalRecord: {
            patient: { clinicId },
            doctor: { clinicId },
            appointment: { clinicId },
          },
        },
        select: { id: true },
      });
      if (!scoped) throw new NotFoundException('Diagnosis not found');
      await tx.diagnosis.delete({ where: { id: scoped.id } });
    });

    return {
      message: 'Diagnosis deleted successfully',
    };
  }
}
