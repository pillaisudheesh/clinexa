import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  // The current schema scopes MedicalRecord through its Patient, Doctor and Appointment relations.
  private scopedWhere(
    clinicId: string,
    id?: string,
  ): Prisma.MedicalRecordWhereInput {
    return {
      ...(id ? { id } : {}),
      patient: { is: { clinicId } },
      doctor: { is: { clinicId } },
      appointment: { is: { clinicId } },
    };
  }

  async create(clinicId: string, dto: CreateMedicalRecordDto, userId: string) {
    const [patient, doctor, appointment] = await Promise.all([
      this.prisma.patient.findFirst({
        where: { id: dto.patientId, clinicId, isActive: true },
        select: { id: true },
      }),
      this.prisma.doctor.findFirst({
        where: { id: dto.doctorId, clinicId, isActive: true },
        select: { id: true },
      }),
      this.prisma.appointment.findFirst({
        where: { id: dto.appointmentId, clinicId },
        select: { id: true, patientId: true, doctorId: true, status: true },
      }),
    ]);
    if (!patient) throw new NotFoundException('Active patient not found');
    if (!doctor) throw new NotFoundException('Active doctor not found');
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (
      appointment.patientId !== patient.id ||
      appointment.doctorId !== doctor.id
    ) {
      throw new ConflictException(
        'Appointment does not belong to the specified patient and doctor',
      );
    }
    if (
      appointment.status === 'CANCELLED' ||
      appointment.status === 'NO_SHOW'
    ) {
      throw new ConflictException(
        'Cannot create a medical record for a cancelled or no-show appointment',
      );
    }
    const existing = await this.prisma.medicalRecord.findFirst({
      where: { appointmentId: appointment.id, patient: { clinicId } },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException(
        'Medical record already exists for this appointment',
      );

    try {
      return await this.prisma.$transaction(async (tx) => {
        const record = await tx.medicalRecord.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            appointmentId: appointment.id,
            chiefComplaint: dto.chiefComplaint,
            historyOfPresentIllness: dto.historyOfPresentIllness,
            examinationNotes: dto.examinationNotes,
            assessment: dto.assessment,
            treatmentPlan: dto.treatmentPlan,
            followUpInstructions: dto.followUpInstructions,
          },
        });
        await this.auditService.createInTransaction(tx, {
          clinicId,
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
      });
    } catch (error) {
      // appointmentId is unique; this also handles concurrent create requests.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Medical record already exists for this appointment',
        );
      }
      throw error;
    }
  }

  async findAll(
    clinicId: string,
    query: MedicalRecordQueryDto,
    userId: string,
  ) {
    const page = Math.max(1, Math.floor(Number(query.page) || 1));
    const limit = Math.min(
      100,
      Math.max(1, Math.floor(Number(query.limit) || 10)),
    );
    const where: Prisma.MedicalRecordWhereInput = {
      ...this.scopedWhere(clinicId),
      ...(query.patientId ? { patientId: query.patientId } : {}),
      ...(query.doctorId ? { doctorId: query.doctorId } : {}),
      ...(query.appointmentId ? { appointmentId: query.appointmentId } : {}),
    };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { diagnoses: true, prescriptions: true },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);
    await this.auditService.create({
      clinicId,
      actorId: userId,
      action: 'LIST',
      entityType: 'MedicalRecord',
      description: 'Medical records list accessed',
      metadata: {
        patientId: query.patientId ?? null,
        doctorId: query.doctorId ?? null,
        appointmentId: query.appointmentId ?? null,
        page,
        limit,
        resultCount: records.length,
      },
    });
    return {
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(clinicId: string, id: string, userId: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: this.scopedWhere(clinicId, id),
      include: { diagnoses: true, prescriptions: true },
    });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.auditService.create({
      clinicId,
      actorId: userId,
      action: 'VIEW',
      entityType: 'MedicalRecord',
      entityId: record.id,
      description: 'Medical record viewed',
    });
    return record;
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdateMedicalRecordDto,
    userId: string,
  ) {
    const existing = await this.prisma.medicalRecord.findFirst({
      where: this.scopedWhere(clinicId, id),
    });
    if (!existing) throw new NotFoundException('Medical record not found');
    const data: Prisma.MedicalRecordUpdateInput = {
      ...(dto.chiefComplaint !== undefined
        ? { chiefComplaint: dto.chiefComplaint }
        : {}),
      ...(dto.historyOfPresentIllness !== undefined
        ? { historyOfPresentIllness: dto.historyOfPresentIllness }
        : {}),
      ...(dto.examinationNotes !== undefined
        ? { examinationNotes: dto.examinationNotes }
        : {}),
      ...(dto.assessment !== undefined ? { assessment: dto.assessment } : {}),
      ...(dto.treatmentPlan !== undefined
        ? { treatmentPlan: dto.treatmentPlan }
        : {}),
      ...(dto.followUpInstructions !== undefined
        ? { followUpInstructions: dto.followUpInstructions }
        : {}),
    };
    const changedFields = Object.keys(data);
    if (!changedFields.length) return existing;
    return this.prisma.$transaction(async (tx) => {
      // Re-check ownership inside the transaction immediately before mutation.
      const scoped = await tx.medicalRecord.findFirst({
        where: this.scopedWhere(clinicId, id),
        select: { id: true },
      });
      if (!scoped) throw new NotFoundException('Medical record not found');
      const record = await tx.medicalRecord.update({
        where: { id: scoped.id },
        data,
      });
      await this.auditService.createInTransaction(tx, {
        clinicId,
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
      return record;
    });
  }
}
