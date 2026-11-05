import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import {
  OrganizationBranchQueryDto,
  OrganizationBranchSortField,
} from './dto/organization-branch-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ClinicResponseDto } from '../clinics/dto/clinic-response.dto';

import { ClinicsService } from '../clinics/clinics.service';
import { CreateClinicDto } from '../clinics/dto/create-clinic.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clinicsService: ClinicsService,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    const existing = await this.prisma.organization.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        'An organization with this code already exists.',
      );
    }

    try {
      const organization = await this.prisma.organization.create({
        data: {
          code: dto.code,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          website: dto.website,
        },
      });

      return this.toResponseDto(organization);
    } catch (error) {
      // The unique database constraint protects against concurrent requests.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An organization with this code already exists.',
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<OrganizationResponseDto[]> {
    const organizations = await this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            clinics: true,
          },
        },
      },
    });

    return organizations.map((organization) =>
      this.toResponseDto(organization),
    );
  }

  async findOne(id: string): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return this.toResponseDto(organization);
  }

  private toResponseDto(organization: {
    id: string;
    code: string;
    name: string;
    _count?: {
      clinics: number;
    };
    email: string | null;
    phone: string | null;
    website: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationResponseDto {
    return {
      id: organization.id,
      code: organization.code,
      name: organization.name,
      branchCount: organization._count?.clinics ?? 0,
      email: organization.email,
      phone: organization.phone,
      website: organization.website,
      isActive: organization.isActive,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  async findBranches(
    organizationId: string,
    query: OrganizationBranchQueryDto,
  ): Promise<PaginatedResponseDto<ClinicResponseDto>> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = OrganizationBranchSortField.CREATED_AT,
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ClinicWhereInput = {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { state: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [branches, total] = await this.prisma.$transaction([
      this.prisma.clinic.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.clinic.count({ where }),
    ]);

    return {
      data: branches.map((branch) => ({
        id: branch.id,
        code: branch.code,
        name: branch.name,
        email: branch.email,
        phone: branch.phone,
        website: branch.website,
        addressLine1: branch.addressLine1,
        addressLine2: branch.addressLine2,
        city: branch.city,
        state: branch.state,
        country: branch.country,
        postalCode: branch.postalCode,
        timezone: branch.timezone,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        organizationName: organization.name,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    await this.findOne(id);

    const data: Prisma.OrganizationUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.website !== undefined) data.website = dto.website;

    const organization = await this.prisma.organization.update({
      where: { id },
      data,
    });

    return this.toResponseDto(organization);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrganizationStatusDto,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    if (organization.isActive === dto.isActive) {
      return this.toResponseDto(organization);
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: { isActive: dto.isActive },
    });

    return this.toResponseDto(updated);
  }

  async createBranch(
    organizationId: string,
    dto: CreateClinicDto,
  ): Promise<ClinicResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    if (!organization.isActive) {
      throw new ConflictException(
        'Cannot create a branch under an inactive organization.',
      );
    }

    return this.clinicsService.create({
      ...dto,
      organizationId,
    });
  }
}
