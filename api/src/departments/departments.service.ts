import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { DepartmentSortField } from './enums/department-sort-field.enum';
import { DepartmentMapper } from './department.mapper';
import { PaginationUtil } from '../common/utils/pagination.util';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    clinicId: string,
    query: DepartmentQueryDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const { page, limit, search } = query;

    const sortField = query.sortBy ?? DepartmentSortField.CREATED_AT;

    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.DepartmentWhereInput = {
      clinicId,

      ...(search && {
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
        ],
      }),
    };

    const [departments, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,

        orderBy: {
          [sortField]: sortOrder,
        },

        skip: (page - 1) * limit,

        take: limit,
      }),

      this.prisma.department.count({
        where,
      }),
    ]);

    return PaginationUtil.createResponse(
      DepartmentMapper.toResponseDtos(departments),
      total,
      page,
      limit,
    );
  }

  async findById(clinicId: string, id: string): Promise<DepartmentResponseDto> {
    const department = await this.getDepartmentOrThrow(clinicId, id);

    return DepartmentMapper.toResponseDto(department);
  }

  async create(
    clinicId: string,
    dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const code = dto.code.trim().toUpperCase();

    const name = dto.name.trim();

    const exists = await this.prisma.department.findFirst({
      where: {
        clinicId,

        OR: [
          {
            code,
          },
          {
            name,
          },
        ],
      },
    });

    if (exists) {
      throw new ConflictException('Department already exists.');
    }

    const department = await this.prisma.department.create({
      data: {
        clinicId,

        code,

        name,

        description: dto.description,

        displayOrder: dto.displayOrder ?? 0,
      },
    });

    return DepartmentMapper.toResponseDto(department);
  }

  async update(
    clinicId: string,
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    await this.getDepartmentOrThrow(clinicId, id);

    if (dto.code || dto.name) {
      const exists = await this.prisma.department.findFirst({
        where: {
          clinicId,

          id: {
            not: id,
          },

          OR: [
            dto.code
              ? {
                  code: dto.code.trim().toUpperCase(),
                }
              : undefined,

            dto.name
              ? {
                  name: dto.name.trim(),
                }
              : undefined,
          ].filter(Boolean) as Prisma.DepartmentWhereInput[],
        },
      });

      if (exists) {
        throw new ConflictException('Department already exists.');
      }
    }

    const department = await this.prisma.department.update({
      where: {
        id,
      },

      data: {
        ...(dto.code && {
          code: dto.code.trim().toUpperCase(),
        }),

        ...(dto.name && {
          name: dto.name.trim(),
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.displayOrder !== undefined && {
          displayOrder: dto.displayOrder,
        }),
      },
    });

    return DepartmentMapper.toResponseDto(department);
  }

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdateDepartmentStatusDto,
  ): Promise<DepartmentResponseDto> {
    await this.getDepartmentOrThrow(clinicId, id);

    const department = await this.prisma.department.update({
      where: {
        id,
      },

      data: {
        isActive: dto.isActive,
      },
    });

    return DepartmentMapper.toResponseDto(department);
  }

  private async getDepartmentOrThrow(
    clinicId: string,
    departmentId: string,
  ): Promise<Department> {
    const department = await this.prisma.department.findFirst({
      where: {
        id: departmentId,
        clinicId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return department;
  }
}
