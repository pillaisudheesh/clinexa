import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  /**
   * Create a prescription.
   * The prescription sequence, prescription creation, and audit log
   * are committed together.
   */
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

    const prescription = await this.prisma.$transaction(async (tx) => {
      // Incrementing the sequence atomically avoids duplicate sequence
      // values when prescriptions are created concurrently.
      const clinic = await tx.clinic.update({
        where: { id: clinicId },
        data: {
          prescriptionSequence: { increment: 1 },
        },
        select: {
          prescriptionSequence: true,
        },
      });

      const year = new Date().getFullYear();
      const prescriptionNumber = `RX-${year}-${String(
        clinic.prescriptionSequence,
      ).padStart(6, '0')}`;

      const created = await tx.prescription.create({
        data: {
          prescriptionNumber,
          medicalRecordId: medicalRecord.id,
          medicineId: medicine.id,

          // Preserve the medicine name at the time of prescribing.
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

  /**
   * Return prescriptions belonging to the requested clinic.
   */
  async findAll(
    clinicId: string,
    query: PrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PrescriptionResponseDto>> {
    const { page = 1, limit = 10, search, medicalRecordId, medicineId } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {
      medicalRecord: {
        patient: { clinicId },
      },
      ...(medicalRecordId ? { medicalRecordId } : {}),
      ...(medicineId ? { medicineId } : {}),
      ...(search
        ? {
            OR: [
              {
                prescriptionNumber: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
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
          }
        : {}),
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

  /**
   * Retrieve one prescription, scoped to the clinic.
   */
  async findOne(
    clinicId: string,
    id: string,
    actorId?: string,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
        },
      },
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

  /**
   * Update a prescription.
   * Prescriptions with dispensing records cannot be modified.
   */
  async update(
    clinicId: string,
    id: string,
    dto: UpdatePrescriptionDto,
    actorId?: string,
  ): Promise<PrescriptionResponseDto> {
    const suppliedFields = Object.keys(dto).filter(
      (key) => dto[key as keyof UpdatePrescriptionDto] !== undefined,
    );

    if (suppliedFields.length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for an update',
      );
    }

    const existing = await this.prisma.prescription.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
        },
      },
      include: {
        dispensing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    if (existing.dispensing) {
      throw new ConflictException(
        'A prescription with a dispensing record cannot be modified',
      );
    }

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

    const data: Prisma.PrescriptionUpdateInput = {
      ...(dto.medicineId !== undefined
        ? {
            medicine: { connect: { id: dto.medicineId } },
            medicationName: medicineName,
          }
        : {}),
      ...(dto.dosage !== undefined ? { dosage: dto.dosage } : {}),
      ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
      ...(dto.route !== undefined ? { route: dto.route } : {}),
      ...(dto.duration !== undefined ? { duration: dto.duration } : {}),
      ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
      ...(dto.instructions !== undefined
        ? { instructions: dto.instructions }
        : {}),
    };

    const changedFields = suppliedFields.filter((field) => {
      if (field === 'medicineId') {
        return (
          dto.medicineId !== undefined &&
          (dto.medicineId !== existing.medicineId ||
            medicineName !== existing.medicationName)
        );
      }

      const key = field as keyof UpdatePrescriptionDto;
      return dto[key] !== existing[field as keyof typeof existing];
    });

    // A no-op update does not need a database write or audit entry.
    if (changedFields.length === 0) {
      const unchanged = await this.prisma.prescription.findFirst({
        where: {
          id,
          medicalRecord: {
            patient: { clinicId },
          },
        },
        include: { medicine: true },
      });

      if (!unchanged) {
        throw new NotFoundException('Prescription not found');
      }

      return this.mapPrescription(unchanged);
    }

    const prescription = await this.prisma.$transaction(async (tx) => {
      const scopedPrescription = await tx.prescription.findFirst({
        where: {
          id,
          medicalRecord: { patient: { clinicId } },
        },
        select: { id: true },
      });
      if (!scopedPrescription) {
        throw new NotFoundException('Prescription not found');
      }

      const updated = await tx.prescription.update({
        where: { id: scopedPrescription.id },
        data,
        include: { medicine: true },
      });

      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'UPDATE',
        entityType: 'PRESCRIPTION',
        entityId: updated.id,
        description: 'Prescription updated',
        metadata: {
          prescriptionNumber: updated.prescriptionNumber,
          medicalRecordId: updated.medicalRecordId,
          changedFields,
        },
      });

      return updated;
    });

    return this.mapPrescription(prescription);
  }

  /**
   * Delete a prescription only when it has no dispensing record.
   */
  async remove(
    clinicId: string,
    id: string,
    actorId?: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.prescription.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: { clinicId },
        },
      },
      include: {
        dispensing: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    if (existing.dispensing) {
      throw new ConflictException(
        'A prescription with a dispensing record cannot be deleted',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.prescription.deleteMany({
        where: {
          id,
          medicalRecord: { patient: { clinicId } },
        },
      });
      if (deleted.count !== 1) {
        throw new NotFoundException('Prescription not found');
      }

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

    return {
      message: 'Prescription deleted successfully',
    };
  }

  /**
   * Map the Prisma result to the existing API response DTO.
   */
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
