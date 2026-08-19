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

  async create(dto: CreateDiagnosisDto) {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: {
        id: dto.medicalRecordId,
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
    query: DiagnosisQueryDto,
  ): Promise<PaginatedResponseDto<DiagnosisResponseDto>> {
    const { page = 1, limit = 10, search, medicalRecordId } = query;

    const skip = (page - 1) * limit;

    const where = {
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

  async findOne(id: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: {
        id,
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

  async update(id: string, dto: UpdateDiagnosisDto) {
    const existing = await this.prisma.diagnosis.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Diagnosis not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary === true) {
        await tx.diagnosis.updateMany({
          where: {
            medicalRecordId: existing.medicalRecordId,
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
          id,
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

  async remove(id: string) {
    const existing = await this.prisma.diagnosis.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Diagnosis not found');
    }

    await this.prisma.diagnosis.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Diagnosis deleted successfully',
    };
  }
}
