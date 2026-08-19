import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { NumberGeneratorService } from '../common/services/number-generator.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PaginationUtil } from '../common/utils/pagination.util';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientStatusDto } from './dto/update-patient-status.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

import { PatientMapper } from './patients.mapper';
import { PatientSortField } from './enums/patient-sort-field.enum';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  private async getPatientOrThrow(clinicId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
      },
      include: {
        clinic: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    return patient;
  }

  async findAll(
    clinicId: string,
    query: PatientQueryDto,
  ): Promise<PaginatedResponseDto<PatientResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const sortField = sortBy ?? PatientSortField.CREATED_AT;

    const sortDirection = sortOrder ?? 'desc';

    const where: Prisma.PatientWhereInput = {
      clinicId,

      ...(search && {
        OR: [
          {
            patientNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        include: {
          clinic: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortField]: sortDirection,
        },
      }),

      this.prisma.patient.count({
        where,
      }),
    ]);

    return PaginationUtil.createResponse(
      PatientMapper.toResponseDtos(patients),
      total,
      page,
      limit,
    );
  }

  async findById(clinicId: string, id: string): Promise<PatientResponseDto> {
    const patient = await this.getPatientOrThrow(clinicId, id);

    return PatientMapper.toResponseDto(patient);
  }

  async create(
    clinicId: string,
    dto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    if (new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    if (dto.email) {
      const exists = await this.prisma.patient.findFirst({
        where: {
          clinicId,
          email: dto.email,
        },
      });

      if (exists) {
        throw new ConflictException('Email already exists.');
      }
    }

    const patientNumber =
      await this.numberGenerator.generatePatientNumber(clinicId);

    const patient = await this.prisma.patient.create({
      data: {
        clinicId,

        patientNumber,

        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,

        gender: dto.gender,

        dateOfBirth: new Date(dto.dateOfBirth),

        phone: dto.phone,
        email: dto.email,

        bloodGroup: dto.bloodGroup,

        maritalStatus: dto.maritalStatus,

        addressLine1: dto.addressLine1,

        addressLine2: dto.addressLine2,

        city: dto.city,
        state: dto.state,
        country: dto.country,
        postalCode: dto.postalCode,

        emergencyContactName: dto.emergencyContactName,

        emergencyContactPhone: dto.emergencyContactPhone,

        emergencyContactRelation: dto.emergencyContactRelation,
      },

      include: {
        clinic: true,
      },
    });

    return PatientMapper.toResponseDto(patient);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    await this.getPatientOrThrow(clinicId, id);

    if (dto.dateOfBirth && new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    if (dto.email) {
      const exists = await this.prisma.patient.findFirst({
        where: {
          clinicId,
          email: dto.email,
          id: {
            not: id,
          },
        },
      });

      if (exists) {
        throw new ConflictException('Email already exists.');
      }
    }

    const patient = await this.prisma.patient.update({
      where: {
        id,
      },

      data: {
        ...dto,

        ...(dto.dateOfBirth && {
          dateOfBirth: new Date(dto.dateOfBirth),
        }),
      },

      include: {
        clinic: true,
      },
    });

    return PatientMapper.toResponseDto(patient);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdatePatientStatusDto,
  ): Promise<PatientResponseDto> {
    await this.getPatientOrThrow(clinicId, id);

    const patient = await this.prisma.patient.update({
      where: {
        id,
      },

      data: {
        isActive: dto.isActive,
      },

      include: {
        clinic: true,
      },
    });

    return PatientMapper.toResponseDto(patient);
  }
}
