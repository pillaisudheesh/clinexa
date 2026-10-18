import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionQueryDto } from './dto/prescription-query.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    clinicId: string,
    dto: CreatePrescriptionDto,
    actorId?: string,
  ): Promise<PrescriptionResponseDto> {
    const medicalRecord = await this.prisma.medicalRecord.findFirst({
      where: {
        id: dto.medicalRecordId,
        patient: { clinicId },
      },
      select: { id: true },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    const medicine = await this.prisma.medicine.findFirst({
      where: { id: dto.medicineId, clinicId, isActive: true },
      select: { id: true, name: true },
    });

    if (!medicine) {
      throw new NotFoundException('Active medicine not found');
    }

    const prescription = await this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.update({
        where: { id: clinicId },
        data: { prescriptionSequence: { increment: 1 } },
        select: { prescriptionSequence: true },
      });

      const currentYear = new Date().getFullYear();
      const prescriptionNumber = `RX-${currentYear}-${String(
        clinic.prescriptionSequence,
      ).padStart(6, '0')}`;

      // Keep the prescription and its audit event in the same transaction.
      const created = await tx.prescription.create({
        data: {
          prescriptionNumber,
          medicalRecordId: medicalRecord.id,
          medicineId: medicine.id,
          medicationName: medicine.name,
          dosage: dto.dosage,
          frequency: dto.frequency,
          route: dto.route,
          duration: dto.duration,
          quantity: dto.quantity,
          instructions: dto.instructions,
        },
        include: { medicine: true },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'CREATE',
        entityType: 'PRESCRIPTION',
        entityId: created.id,
        description: 'Prescription created',
        metadata: {
          prescriptionNumber: created.prescriptionNumber,
          medicalRecordId: created.medicalRecordId,
          medicineId: created.medicineId,
        },
      });

      return created;
    });

    return this.mapPrescription(prescription);
  }

  async findAll(
    clinicId: string,
    query: PrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PrescriptionResponseDto>> {
    const { page = 1, limit = 10, search, medicalRecordId, medicineId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {
      medicalRecord: { patient: { clinicId } },
      ...(medicalRecordId && { medicalRecordId }),
      ...(medicineId && { medicineId }),
      ...(search && {
        OR: [
          { medicationName: { contains: search, mode: 'insensitive' } },
          { dosage: { contains: search, mode: 'insensitive' } },
          { instructions: { contains: search, mode: 'insensitive' } },
          { medicine: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [prescriptions, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { medicine: true },
      }),
      this.prisma.prescription.count({ where }),
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

  async findOne(
    clinicId: string,
    id: string,
    actorId?: string,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, medicalRecord: { patient: { clinicId } } },
      include: { medicine: true },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    await this.auditService.create({
      clinicId,
      actorId,
      action: 'VIEW',
      entityType: 'PRESCRIPTION',
      entityId: prescription.id,
      description: 'Prescription viewed',
      metadata: {
        prescriptionNumber: prescription.prescriptionNumber,
        medicalRecordId: prescription.medicalRecordId,
      },
    });

    return this.mapPrescription(prescription);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdatePrescriptionDto,
    actorId?: string,
  ): Promise<PrescriptionResponseDto> {
    const existing = await this.prisma.prescription.findFirst({
      where: { id, medicalRecord: { patient: { clinicId } } },
      select: {
        id: true,
        prescriptionNumber: true,
        medicalRecordId: true,
        medicineId: true,
        dosage: true,
        frequency: true,
        route: true,
        duration: true,
        quantity: true,
        instructions: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    let medicineName: string | undefined;
    if (dto.medicineId !== undefined) {
      const medicine = await this.prisma.medicine.findFirst({
        where: { id: dto.medicineId, clinicId, isActive: true },
        select: { id: true, name: true },
      });

      if (!medicine) {
        throw new NotFoundException('Active medicine not found');
      }
      medicineName = medicine.name;
    }

    const data: Prisma.PrescriptionUpdateInput = {
      ...(dto.medicineId !== undefined && {
        medicine: { connect: { id: dto.medicineId } },
        medicationName: medicineName,
      }),
      ...(dto.dosage !== undefined && { dosage: dto.dosage }),
      ...(dto.frequency !== undefined && { frequency: dto.frequency }),
      ...(dto.route !== undefined && { route: dto.route }),
      ...(dto.duration !== undefined && { duration: dto.duration }),
      ...(dto.quantity !== undefined && { quantity: dto.quantity }),
      ...(dto.instructions !== undefined && { instructions: dto.instructions }),
    };

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.prescription.update({
        where: { id: existing.id },
        data,
        include: { medicine: true },
      });

      const changedFields = Object.keys(dto).filter((key) => {
        const oldValue = (existing as Record<string, unknown>)[key];
        const newValue = (dto as Record<string, unknown>)[key];
        return newValue !== undefined && oldValue !== newValue;
      });

      if (
        dto.medicineId !== undefined &&
        dto.medicineId !== existing.medicineId
      ) {
        if (!changedFields.includes('medicationName'))
          changedFields.push('medicationName');
      }

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'UPDATE',
        entityType: 'PRESCRIPTION',
        entityId: result.id,
        description: 'Prescription updated',
        metadata: {
          prescriptionNumber: result.prescriptionNumber,
          medicalRecordId: result.medicalRecordId,
          changedFields,
        },
      });

      return result;
    });

    return this.mapPrescription(updated);
  }

  async remove(
    clinicId: string,
    id: string,
    actorId?: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.prescription.findFirst({
      where: { id, medicalRecord: { patient: { clinicId } } },
      select: {
        id: true,
        prescriptionNumber: true,
        medicalRecordId: true,
        medicineId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.prescription.delete({ where: { id: existing.id } });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'DELETE',
        entityType: 'PRESCRIPTION',
        entityId: existing.id,
        description: 'Prescription deleted',
        metadata: {
          prescriptionNumber: existing.prescriptionNumber,
          medicalRecordId: existing.medicalRecordId,
          medicineId: existing.medicineId,
        },
      });
    });

    return { message: 'Prescription deleted successfully' };
  }

  private mapPrescription(
    prescription: Prisma.PrescriptionGetPayload<{
      include: { medicine: true };
    }>,
  ): PrescriptionResponseDto {
    return {
      id: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
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
