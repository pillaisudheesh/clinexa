import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class MedicinesService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateMedicineDto,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.create({
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

    return this.toResponse(medicine);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<MedicineResponseDto>> {
    const { page = 1, limit = 10, search, isActive } = query;

    const skip = (page - 1) * limit;

    const where = {
      clinicId,

      ...(isActive !== undefined && {
        isActive,
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
            genericName: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            manufacturer: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [medicines, total] = await this.prisma.$transaction([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),

      this.prisma.medicine.count({
        where,
      }),
    ]);

    return {
      data: medicines.map((medicine) => this.toResponse(medicine)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return this.toResponse(medicine);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    const existing = await this.prisma.medicine.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Medicine not found');
    }

    const medicine = await this.prisma.medicine.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.genericName !== undefined && {
          genericName: dto.genericName,
        }),

        ...(dto.manufacturer !== undefined && {
          manufacturer: dto.manufacturer,
        }),

        ...(dto.category !== undefined && {
          category: dto.category,
        }),

        ...(dto.strength !== undefined && {
          strength: dto.strength,
        }),

        ...(dto.form !== undefined && {
          form: dto.form,
        }),

        ...(dto.unit !== undefined && {
          unit: dto.unit,
        }),

        ...(dto.price !== undefined && {
          price: dto.price,
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
    });

    return this.toResponse(medicine);
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  async remove(clinicId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.medicine.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Medicine not found');
    }

    /*
     * A medicine may already be referenced by
     * prescriptions, batches, dispensing items,
     * or stock receipts.
     *
     * We therefore deactivate it instead of
     * physically deleting it.
     */
    await this.prisma.medicine.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    return {
      message: 'Medicine deactivated successfully',
    };
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
