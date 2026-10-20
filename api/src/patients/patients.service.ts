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
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly auditService: AuditService,
  ) {}

  private async getPatientOrThrow(clinicId: string, patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      include: { clinic: true },
    });

    if (!patient) throw new NotFoundException('Patient not found.');
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
          { patientNumber: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        include: { clinic: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortDirection },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return PaginationUtil.createResponse(
      PatientMapper.toResponseDtos(patients),
      total,
      page,
      limit,
    );
  }

  async findById(
    clinicId: string,
    id: string,
    userId: string,
  ): Promise<PatientResponseDto> {
    const patient = await this.getPatientOrThrow(clinicId, id);

    await this.auditService.create({
      clinicId,
      actorId: userId,
      action: 'VIEW',
      entityType: 'Patient',
      entityId: patient.id,
      description: 'Patient record viewed',
    });

    return PatientMapper.toResponseDto(patient);
  }

  async create(
    clinicId: string,
    dto: CreatePatientDto,
    userId: string,
  ): Promise<PatientResponseDto> {
    if (new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    if (dto.email) {
      const exists = await this.prisma.patient.findFirst({
        where: { clinicId, email: dto.email },
      });
      if (exists) throw new ConflictException('Email already exists.');
    }

    const patientNumber =
      await this.numberGenerator.generatePatientNumber(clinicId);

    const patient = await this.prisma.$transaction(async (tx) => {
      const createdPatient = await tx.patient.create({
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
        include: { clinic: true },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId: userId,
        action: 'CREATE',
        entityType: 'Patient',
        entityId: createdPatient.id,
        description: 'Patient created',
      });

      return createdPatient;
    });

    return PatientMapper.toResponseDto(patient);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdatePatientDto,
    userId: string,
  ): Promise<PatientResponseDto> {
    const existingPatient = await this.getPatientOrThrow(clinicId, id);

    if (dto.dateOfBirth && new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    if (dto.email) {
      const exists = await this.prisma.patient.findFirst({
        where: { clinicId, email: dto.email, id: { not: id } },
      });
      if (exists) throw new ConflictException('Email already exists.');
    }

    const patient = await this.prisma.$transaction(async (tx) => {
      const updatedPatient = await tx.patient.update({
        where: { id, clinicId },
        data: {
          ...dto,
          ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        },
        include: { clinic: true },
      });

      const changedFields = Object.keys(dto).filter((key) => {
        const before = existingPatient[key as keyof typeof existingPatient];
        const after = updatedPatient[key as keyof typeof updatedPatient];

        if (before instanceof Date && after instanceof Date) {
          return before.getTime() !== after.getTime();
        }
        return before !== after;
      });

      if (changedFields.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId,
          actorId: userId,
          action: 'UPDATE',
          entityType: 'Patient',
          entityId: updatedPatient.id,
          description: 'Patient updated',
          metadata: { changedFields },
        });
      }

      return updatedPatient;
    });

    return PatientMapper.toResponseDto(patient);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdatePatientStatusDto,
    userId: string,
  ): Promise<PatientResponseDto> {
    const existingPatient = await this.getPatientOrThrow(clinicId, id);

    const patient = await this.prisma.$transaction(async (tx) => {
      const updatedPatient = await tx.patient.update({
        where: { id, clinicId },
        data: { isActive: dto.isActive },
        include: { clinic: true },
      });

      if (existingPatient.isActive !== dto.isActive) {
        await this.auditService.createInTransaction(tx, {
          clinicId,
          actorId: userId,
          action: dto.isActive ? 'ACTIVATE' : 'DEACTIVATE',
          entityType: 'Patient',
          entityId: updatedPatient.id,
          description: dto.isActive ? 'Patient activated' : 'Patient deactivated',
          metadata: {
            previousIsActive: existingPatient.isActive,
            isActive: updatedPatient.isActive,
          },
        });
      }

      return updatedPatient;
    });

    return PatientMapper.toResponseDto(patient);
  }

  async getPatient360(clinicId: string, patientId: string, userId: string) {
    const patient = await this.getPatientOrThrow(clinicId, patientId);

    const [appointments, medicalRecords, labOrders, invoices] =
      await this.prisma.$transaction([
        this.prisma.appointment.findMany({
          where: { clinicId, patientId },
          orderBy: { appointmentDate: 'desc' },
        }),
        this.prisma.medicalRecord.findMany({
          where: { patientId },
          include: { prescriptions: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.labOrder.findMany({
          where: { clinicId, patientId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.invoice.findMany({
          where: { clinicId, patientId },
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    await this.auditService.create({
      clinicId,
      actorId: userId,
      action: 'VIEW',
      entityType: 'Patient',
      entityId: patient.id,
      description: 'Patient 360 record viewed',
      metadata: {
        resource: 'PATIENT_360',
        sections: ['appointments', 'medicalRecords', 'labOrders', 'invoices'],
      },
    });

    return {
      patient: PatientMapper.toResponseDto(patient),
      appointments,
      medicalRecords,
      labOrders,
      invoices,
    };
  }
}
