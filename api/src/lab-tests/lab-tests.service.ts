import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LabTest, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { UpdateLabTestStatusDto } from './dto/update-lab-test-status.dto';
import { LabTestQueryDto } from './dto/lab-test-query.dto';
import { LabTestResponseDto } from './dto/lab-test-response.dto';

type LabTestRecord = LabTest;

@Injectable()
export class LabTestsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  async create(
    clinicId: string,
    dto: CreateLabTestDto,
  ): Promise<LabTestResponseDto> {
    const existing = await this.prisma.labTest.findFirst({
      where: {
        clinicId,
        OR: [
          {
            code: dto.code,
          },
          {
            name: dto.name,
          },
        ],
      },
    });

    if (existing) {
      if (existing.code === dto.code) {
        throw new ConflictException('A lab test with this code already exists');
      }

      throw new ConflictException('A lab test with this name already exists');
    }

    try {
      const labTest = await this.prisma.labTest.create({
        data: {
          clinicId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          category: dto.category,
          price: new Prisma.Decimal(dto.price.toFixed(2)),
          unit: dto.unit,
          normalRange: dto.normalRange,
        },
      });

      return this.mapLabTest(labTest);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A lab test with this code or name already exists',
        );
      }

      throw error;
    }
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  async findAll(
    clinicId: string,
    query: LabTestQueryDto,
  ): Promise<PaginatedResponseDto<LabTestResponseDto>> {
    const { page = 1, limit = 10, search, category, isActive } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LabTestWhereInput = {
      clinicId,

      ...(category && {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      }),

      ...(isActive !== undefined && {
        isActive,
      }),

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
          {
            category: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [labTests, total] = await this.prisma.$transaction([
      this.prisma.labTest.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          name: 'asc',
        },
      }),

      this.prisma.labTest.count({
        where,
      }),
    ]);

    return {
      data: labTests.map((labTest) => this.mapLabTest(labTest)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  async findOne(clinicId: string, id: string): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    return this.mapLabTest(labTest);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  async update(
    clinicId: string,
    id: string,
    dto: UpdateLabTestDto,
  ): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    if (dto.code !== undefined || dto.name !== undefined) {
      const duplicate = await this.prisma.labTest.findFirst({
        where: {
          clinicId,

          id: {
            not: id,
          },

          OR: [
            ...(dto.code
              ? [
                  {
                    code: dto.code,
                  },
                ]
              : []),

            ...(dto.name
              ? [
                  {
                    name: dto.name,
                  },
                ]
              : []),
          ],
        },
      });

      if (duplicate) {
        if (dto.code && duplicate.code === dto.code) {
          throw new ConflictException(
            'A lab test with this code already exists',
          );
        }

        throw new ConflictException('A lab test with this name already exists');
      }
    }

    try {
      const updatedLabTest = await this.prisma.labTest.update({
        where: {
          id,
        },

        data: {
          ...(dto.code !== undefined && {
            code: dto.code,
          }),

          ...(dto.name !== undefined && {
            name: dto.name,
          }),

          ...(dto.description !== undefined && {
            description: dto.description,
          }),

          ...(dto.category !== undefined && {
            category: dto.category,
          }),

          ...(dto.price !== undefined && {
            price: new Prisma.Decimal(dto.price.toFixed(2)),
          }),

          ...(dto.unit !== undefined && {
            unit: dto.unit,
          }),

          ...(dto.normalRange !== undefined && {
            normalRange: dto.normalRange,
          }),
        },
      });

      return this.mapLabTest(updatedLabTest);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A lab test with this code or name already exists',
        );
      }

      throw error;
    }
  }

  // ===========================================================================
  // UPDATE STATUS
  // ===========================================================================

  async updateStatus(
    clinicId: string,
    id: string,
    dto: UpdateLabTestStatusDto,
  ): Promise<LabTestResponseDto> {
    const labTest = await this.prisma.labTest.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    const updatedLabTest = await this.prisma.labTest.update({
      where: {
        id,
      },

      data: {
        isActive: dto.isActive,
      },
    });

    return this.mapLabTest(updatedLabTest);
  }

  // ===========================================================================
  // RESPONSE MAPPER
  // ===========================================================================

  private mapLabTest(labTest: LabTestRecord): LabTestResponseDto {
    return {
      id: labTest.id,
      clinicId: labTest.clinicId,
      code: labTest.code,
      name: labTest.name,
      description: labTest.description,
      category: labTest.category,
      price: Number(labTest.price),
      unit: labTest.unit,
      normalRange: labTest.normalRange,
      isActive: labTest.isActive,
      createdAt: labTest.createdAt,
      updatedAt: labTest.updatedAt,
    };
  }
}
