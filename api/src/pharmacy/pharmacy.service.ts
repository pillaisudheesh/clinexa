import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateMedicineDto } from './dto/create-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class PharmacyService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateMedicineDto,
  ): Promise<MedicineResponseDto> {
    const existing = await this.prisma.medicine.findFirst({
      where: {
        clinicId,
        name: {
          equals: dto.name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new ConflictException('A medicine with this name already exists');
    }

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
        price: new Prisma.Decimal(dto.price),
        isActive: dto.isActive ?? true,
      },
    });

    return this.mapMedicine(medicine);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<MedicineResponseDto>> {
    const { page = 1, limit = 10, search, category, isActive } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.MedicineWhereInput = {
      clinicId,

      ...(category && {
        category,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            genericName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            manufacturer: {
              contains: search,
              mode: 'insensitive',
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
      data: medicines.map((medicine) => this.mapMedicine(medicine)),
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

    return this.mapMedicine(medicine);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (dto.name) {
      const duplicate = await this.prisma.medicine.findFirst({
        where: {
          clinicId,
          name: {
            equals: dto.name,
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicate) {
        throw new ConflictException('A medicine with this name already exists');
      }
    }

    const updated = await this.prisma.medicine.update({
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
          price: new Prisma.Decimal(dto.price),
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
    });

    return this.mapMedicine(updated);
  }

  // ===========================================================================
  // ACTIVATE / DEACTIVATE
  // ===========================================================================

  async updateStatus(
    clinicId: string,
    id: string,
    isActive: boolean,
  ): Promise<MedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (medicine.isActive === isActive) {
      throw new BadRequestException(
        `Medicine is already ${isActive ? 'active' : 'inactive'}`,
      );
    }

    const updated = await this.prisma.medicine.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });

    return this.mapMedicine(updated);
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapMedicine(
    medicine: Prisma.MedicineGetPayload<true>,
  ): MedicineResponseDto {
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
      price: Number(medicine.price),
      isActive: medicine.isActive,
      createdAt: medicine.createdAt,
      updatedAt: medicine.updatedAt,
    };
  }
}
