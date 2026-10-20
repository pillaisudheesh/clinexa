import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateClinicDto } from './dto/create-clinic.dto';
import { ClinicResponseDto } from './dto/clinic-response.dto';
import { ClinicMapper } from './mappers/clinic.mapper';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ClinicSortField } from './enums/clinic-sort-field.enum';
import { ClinicQueryDto } from './dto/clinic-query.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { UpdateClinicStatusDto } from './dto/update-clinic-status.dto';
import { provisionClinicMasterData } from './clinic-master-data';
import { systemRoles } from '../../prisma/data/roles';
import { assignDefaultRolePermissions } from '../roles/default-role-permissions';
import { seedLabTests } from '../../prisma/seeds/lab-test.seed';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}


  private validateTimezone(timezone: string): void {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0));
    } catch {
      throw new BadRequestException(`Invalid clinic timezone: ${timezone}`);
    }
  }

  async findByCode(code: string) {
    return this.prisma.clinic.findUnique({
      where: {
        code,
      },
    });
  }

  private async generateClinicCode(): Promise<string> {
    // PostgreSQL sequences are atomic, so concurrent clinic creations cannot
    // receive the same number. The unique constraint on Clinic.code remains
    // the final safeguard against duplicate codes.
    const result = await this.prisma.$queryRaw<{ value: bigint }[]>`
      SELECT nextval('clinic_code_seq') AS value
    `;
    const sequenceValue = result[0]?.value;

    if (sequenceValue === undefined) {
      throw new Error('Unable to generate a clinic code.');
    }

    return `CLN-${sequenceValue.toString().padStart(6, '0')}`;
  }

  async create(dto: CreateClinicDto): Promise<ClinicResponseDto> {
    if (dto.timezone !== undefined) this.validateTimezone(dto.timezone);
    const code = await this.generateClinicCode();
    const clinic = await this.prisma.$transaction(async (tx) => {
      const createdClinic = await tx.clinic.create({
        data: {
          ...dto,
          code,
        },
      });

      // Persist default clinic operating hours at creation time.
      await tx.clinicWorkingHours.create({
        data: { clinicId: createdClinic.id },
      });

      // Create the clinic's standard roles before assigning their permissions.
      await tx.role.createMany({
        data: systemRoles.map((role) => ({
          clinicId: createdClinic.id,
          code: role.code,
          name: role.name,
          description: role.description,
          displayOrder: role.displayOrder,
          isSystem: true,
          isActive: true,
        })),
        skipDuplicates: true,
      });

      // Assign least-privilege default permissions to each clinic role.
      await assignDefaultRolePermissions(tx, createdClinic.id);

      // Provision clinic-scoped departments and specialties atomically with
      // clinic creation so the doctor Primary Specialty dropdown is populated.
      await provisionClinicMasterData(tx, createdClinic.id);
      await seedLabTests(tx, createdClinic.id);

      return createdClinic;
    });

    return ClinicMapper.toResponseDto(clinic);
  }

  async findAll(
    query: ClinicQueryDto,
  ): Promise<PaginatedResponseDto<ClinicResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = query.sortBy ?? ClinicSortField.CREATED_AT,
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ClinicWhereInput = search
      ? {
          OR: [
            {
              code: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              city: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              state: {
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
        }
      : {};

    const [clinics, total] = await this.prisma.$transaction([
      this.prisma.clinic.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.clinic.count({
        where,
      }),
    ]);

    return {
      data: clinics.map((clinic) => ClinicMapper.toResponseDto(clinic)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findById(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async findOne(id: string): Promise<ClinicResponseDto> {
    const clinic = await this.findById(id);

    return ClinicMapper.toResponseDto(clinic);
  }

  async update(id: string, dto: UpdateClinicDto): Promise<ClinicResponseDto> {
    await this.findById(id);
    if (dto.timezone !== undefined) this.validateTimezone(dto.timezone);

    if (dto.email) {
      const existing = await this.prisma.clinic.findFirst({
        where: {
          email: dto.email,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Clinic email already exists');
      }
    }

    const updateData: Prisma.ClinicUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.addressLine1 !== undefined)
      updateData.addressLine1 = dto.addressLine1;
    if (dto.addressLine2 !== undefined)
      updateData.addressLine2 = dto.addressLine2;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.country !== undefined) updateData.country = dto.country;
    if (dto.postalCode !== undefined) updateData.postalCode = dto.postalCode;
    if (dto.timezone !== undefined) updateData.timezone = dto.timezone;

    const clinic = await this.prisma.clinic.update({
      where: {
        id,
      },
      data: updateData,
    });

    return ClinicMapper.toResponseDto(clinic);
  }

  async updateStatus(
    id: string,
    dto: UpdateClinicStatusDto,
  ): Promise<ClinicResponseDto> {
    const clinicData = await this.findById(id);
    if (clinicData.isActive === dto.isActive) {
      return ClinicMapper.toResponseDto(clinicData);
    }

    const clinic = await this.prisma.clinic.update({
      where: {
        id,
      },
      data: {
        isActive: dto.isActive,
      },
    });

    return ClinicMapper.toResponseDto(clinic);
  }
}
