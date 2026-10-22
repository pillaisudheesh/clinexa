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
import { CreatePharmacyMedicineDto } from './dto/create-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { PharmacyMedicineResponseDto } from './dto/medicine-response.dto';
import { UpdatePharmacyMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class PharmacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    clinicId: string,
    dto: CreatePharmacyMedicineDto,
    actorId: string,
  ): Promise<PharmacyMedicineResponseDto> {
    const existing = await this.prisma.medicine.findFirst({
      where: { clinicId, name: { equals: dto.name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException('A medicine with this name already exists');

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
          price: new Prisma.Decimal(dto.price),
          isActive: dto.isActive ?? true,
        },
      });
      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: 'CREATE',
        entityType: 'Medicine',
        entityId: created.id,
        description: `Created medicine "${created.name}".`,
        metadata: {
          name: created.name,
          genericName: created.genericName,
          manufacturer: created.manufacturer,
          category: created.category,
          strength: created.strength,
          form: created.form,
          unit: created.unit,
          price: created.price.toString(),
          isActive: created.isActive,
        },
      });
      return created;
    });
    return this.mapMedicine(medicine);
  }

  async findAll(
    clinicId: string,
    query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<PharmacyMedicineResponseDto>> {
    const { page = 1, limit = 10, search, category, isActive } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.MedicineWhereInput = {
      clinicId,
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { genericName: { contains: search, mode: 'insensitive' } },
          { manufacturer: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [medicines, total] = await this.prisma.$transaction([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);
    return {
      data: medicines.map((medicine) => this.mapMedicine(medicine)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    clinicId: string,
    id: string,
  ): Promise<PharmacyMedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, clinicId },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return this.mapMedicine(medicine);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdatePharmacyMedicineDto,
    actorId: string,
  ): Promise<PharmacyMedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, clinicId },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.medicine.findFirst({
        where: {
          clinicId,
          name: { equals: dto.name, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });
      if (duplicate)
        throw new ConflictException('A medicine with this name already exists');
    }

    const data: Prisma.MedicineUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.genericName !== undefined && { genericName: dto.genericName }),
      ...(dto.manufacturer !== undefined && { manufacturer: dto.manufacturer }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.strength !== undefined && { strength: dto.strength }),
      ...(dto.form !== undefined && { form: dto.form }),
      ...(dto.unit !== undefined && { unit: dto.unit }),
      ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
    const changedFields: Record<string, { before: unknown; after: unknown }> =
      {};
    for (const field of [
      'name',
      'genericName',
      'manufacturer',
      'category',
      'strength',
      'form',
      'unit',
      'isActive',
    ] as const) {
      const nextValue = dto[field];
      if (nextValue !== undefined && nextValue !== medicine[field])
        changedFields[field] = { before: medicine[field], after: nextValue };
    }
    if (
      dto.price !== undefined &&
      !medicine.price.equals(new Prisma.Decimal(dto.price))
    )
      changedFields.price = {
        before: medicine.price.toString(),
        after: new Prisma.Decimal(dto.price).toString(),
      };

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.medicine.update({
        where: { id, clinicId },
        data,
      });
      if (Object.keys(changedFields).length) {
        await this.auditService.createInTransaction(tx, {
          clinicId,
          actorId,
          action: 'UPDATE',
          entityType: 'Medicine',
          entityId: result.id,
          description: `Updated medicine "${result.name}".`,
          metadata: { changedFields: changedFields as Prisma.InputJsonValue },
        });
      }
      return result;
    });
    return this.mapMedicine(updated);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    isActive: boolean,
    actorId: string,
  ): Promise<PharmacyMedicineResponseDto> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, clinicId },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    if (medicine.isActive === isActive)
      throw new BadRequestException(
        `Medicine is already ${isActive ? 'active' : 'inactive'}`,
      );

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.medicine.update({
        where: { id, clinicId },
        data: { isActive },
      });
      await this.auditService.createInTransaction(tx, {
        clinicId,
        actorId,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        entityType: 'Medicine',
        entityId: result.id,
        description: `${isActive ? 'Activated' : 'Deactivated'} medicine "${result.name}".`,
        metadata: {
          previousIsActive: medicine.isActive,
          newIsActive: isActive,
          name: result.name,
        },
      });
      return result;
    });
    return this.mapMedicine(updated);
  }

  private mapMedicine(
    medicine: Prisma.MedicineGetPayload<true>,
  ): PharmacyMedicineResponseDto {
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
