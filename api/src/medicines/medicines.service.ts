import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class MedicinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    clinicId: string,
    dto: CreateMedicineDto,
    actorId: string,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.$transaction(async (tx) => {
      const created = await tx.medicine.create({
        data: {
          clinicId,
          name: dto.name,
          genericName: dto.genericName,
          manufacturer: dto.manufacturer,
          category: dto.category,
          strength: dto.strength,
          form: dto.form,
          unit: dto.unit,
          price: dto.price,
          isActive: dto.isActive ?? true,
        },
      });
      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'MEDICINE_CREATED',
        entityType: 'Medicine',
        entityId: created.id,
        description: 'Medicine created',
        metadata: {
          name: created.name,
          category: created.category,
          strength: created.strength,
          isActive: created.isActive,
        },
      });
      return created;
    });
    return this.toResponse(medicine);
  }

  async findAll(
    clinicId: string,
    query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<MedicineResponseDto>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const where: Prisma.MedicineWhereInput = {
      clinicId,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { genericName: { contains: search, mode: 'insensitive' } },
              { manufacturer: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [medicines, total] = await this.prisma.$transaction([
      this.prisma.medicine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);
    return {
      data: medicines.map((medicine) => this.toResponse(medicine)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(clinicId: string, id: string): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, clinicId },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return this.toResponse(medicine);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdateMedicineDto,
    actorId: string,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.medicine.findFirst({ where: { id, clinicId } });
      if (!existing) throw new NotFoundException('Medicine not found');
      const updated = await tx.medicine.update({
        where: { id, clinicId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.genericName !== undefined && {
            genericName: dto.genericName,
          }),
          ...(dto.manufacturer !== undefined && {
            manufacturer: dto.manufacturer,
          }),
          ...(dto.category !== undefined && { category: dto.category }),
          ...(dto.strength !== undefined && { strength: dto.strength }),
          ...(dto.form !== undefined && { form: dto.form }),
          ...(dto.unit !== undefined && { unit: dto.unit }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
      const changedFields = Object.keys(dto).filter(
        (key) => (dto as Record<string, unknown>)[key] !== undefined,
      );
      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'MEDICINE_UPDATED',
        entityType: 'Medicine',
        entityId: updated.id,
        description: 'Medicine details updated',
        metadata: { changedFields, isActive: updated.isActive },
      });
      return updated;
    });
    return this.toResponse(medicine);
  }

  async remove(
    clinicId: string,
    id: string,
    actorId: string,
  ): Promise<{ message: string }> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.medicine.findFirst({ where: { id, clinicId } });
      if (!existing) throw new NotFoundException('Medicine not found');
      if (!existing.isActive) return;
      await tx.medicine.update({ where: { id, clinicId }, data: { isActive: false } });
      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'MEDICINE_DEACTIVATED',
        entityType: 'Medicine',
        entityId: id,
        description: 'Medicine deactivated',
        metadata: { name: existing.name },
      });
    });
    return { message: 'Medicine deactivated successfully' };
  }

  private toResponse(medicine: any): MedicineResponseDto {
    return {
      id: medicine.id,
      clinicId: medicine.clinicId,
      name: medicine.name,
      genericName: medicine.genericName,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      strength: medicine.strength,
      form: medicine.form,
      unit: medicine.unit,
      price: medicine.price.toNumber(),
      isActive: medicine.isActive,
      createdAt: medicine.createdAt,
      updatedAt: medicine.updatedAt,
    };
  }
}
