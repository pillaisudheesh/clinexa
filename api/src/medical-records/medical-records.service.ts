import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(dto: CreateMedicalRecordDto, userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient || !patient.isActive) {
      throw new NotFoundException('Active patient not found');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException('Active doctor not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patientId !== dto.patientId) {
      throw new ConflictException(
        'Appointment does not belong to the specified patient',
      );
    }

    if (appointment.doctorId !== dto.doctorId) {
      throw new ConflictException(
        'Appointment does not belong to the specified doctor',
      );
    }

    const existing = await this.prisma.medicalRecord.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existing) {
      throw new ConflictException(
        'Medical record already exists for this appointment',
      );
    }

    const record = await this.prisma.medicalRecord.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,
        chiefComplaint: dto.chiefComplaint,
        historyOfPresentIllness: dto.historyOfPresentIllness,
        examinationNotes: dto.examinationNotes,
        assessment: dto.assessment,
        treatmentPlan: dto.treatmentPlan,
        followUpInstructions: dto.followUpInstructions,
      },
    });

    await this.auditService.create({
      clinicId: patient.clinicId,
      actorId: userId,
      action: 'CREATE',
      entityType: 'MedicalRecord',
      entityId: record.id,
      description: 'Medical record created',
      metadata: {
        patientId: record.patientId,
        doctorId: record.doctorId,
        appointmentId: record.appointmentId,
      },
    });

    return record;
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(query: MedicalRecordQueryDto, userId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      patientId,
      doctorId,
      appointmentId,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(appointmentId && { appointmentId }),
      ...(search && {
        OR: [
          {
            chiefComplaint: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            assessment: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    // Audit only after the query succeeds. Do not log search text or clinical data.
    await this.auditService.create({
      actorId: userId,
      action: 'LIST',
      entityType: 'MedicalRecord',
      description: 'Medical records list accessed',
      metadata: {
        patientId: patientId ?? null,
        doctorId: doctorId ?? null,
        appointmentId: appointmentId ?? null,
        page,
        limit,
        resultCount: records.length,
      },
    });

    return {
      data: records,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(id: string, userId: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        diagnoses: true,
        prescriptions: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: record.patientId },
      select: { clinicId: true },
    });

    await this.auditService.create({
      clinicId: patient?.clinicId,
      actorId: userId,
      action: 'VIEW',
      entityType: 'MedicalRecord',
      entityId: record.id,
      description: 'Medical record viewed',
    });

    return record;
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(id: string, dto: UpdateMedicalRecordDto, userId: string) {
    const existing = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Medical record not found');
    }

    const data = {
      ...(dto.chiefComplaint !== undefined && {
        chiefComplaint: dto.chiefComplaint,
      }),
      ...(dto.historyOfPresentIllness !== undefined && {
        historyOfPresentIllness: dto.historyOfPresentIllness,
      }),
      ...(dto.examinationNotes !== undefined && {
        examinationNotes: dto.examinationNotes,
      }),
      ...(dto.assessment !== undefined && {
        assessment: dto.assessment,
      }),
      ...(dto.treatmentPlan !== undefined && {
        treatmentPlan: dto.treatmentPlan,
      }),
      ...(dto.followUpInstructions !== undefined && {
        followUpInstructions: dto.followUpInstructions,
      }),
    };

    const changedFields = Object.keys(data).filter((key) => {
      const before = existing[key as keyof typeof existing];
      const after = data[key as keyof typeof data];
      return before !== after;
    });

    const record = await this.prisma.medicalRecord.update({
      where: { id },
      data,
    });

    if (changedFields.length > 0) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: record.patientId },
        select: { clinicId: true },
      });

      await this.auditService.create({
        clinicId: patient?.clinicId,
        actorId: userId,
        action: 'UPDATE',
        entityType: 'MedicalRecord',
        entityId: record.id,
        description: 'Medical record updated',
        metadata: {
          changedFields,
          patientId: record.patientId,
          appointmentId: record.appointmentId,
        },
      });
    }

    return record;
  }
}
