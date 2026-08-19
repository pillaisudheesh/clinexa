import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { UserMapper } from './mappers/user.mapper';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserQueryDto } from './dto/user-query.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check duplicate email
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    // Validate clinic
    const clinic = await this.findClinic(dto.clinicId);

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    // Validate roles
    const roles = await this.findRoles(dto.roleIds);

    if (roles.length !== dto.roleIds.length) {
      throw new NotFoundException('One or more roles were not found.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user + assign roles in a transaction
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
          clinicId: dto.clinicId,
        },
      });

      await tx.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({
          userId: user.id,
          roleId,
        })),
      });

      const fullUser = await tx.user.findUniqueOrThrow({
        where: {
          id: user.id,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return fullUser;
    });

    return UserMapper.toResponseDto(createdUser);
  }

  private async findClinic(clinicId: string) {
    return this.prisma.clinic.findUnique({
      where: { id: clinicId },
    });
  }

  private async findRoles(roleIds: string[]) {
    return this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });
  }

  // private async findByEmail(email: string) {
  //   return this.prisma.user.findUnique({
  //     where: { email },
  //   });
  // }

  async findAll(
    query: UserQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data: users.map((user) => UserMapper.toResponseDto(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    // Check duplicate email
    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await this.findByEmail(dto.email);

      if (userWithEmail) {
        throw new ConflictException('Email already exists.');
      }
    }

    // Validate clinic
    if (dto.clinicId) {
      const clinic = await this.findClinic(dto.clinicId);

      if (!clinic) {
        throw new NotFoundException('Clinic not found.');
      }
    }

    // Validate roles
    if (dto.roleIds) {
      const roles = await this.findRoles(dto.roleIds);

      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException('One or more roles were not found.');
      }
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id,
        },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          clinicId: dto.clinicId,
        },
      });

      if (dto.roleIds) {
        await tx.userRole.deleteMany({
          where: {
            userId: id,
          },
        });

        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        });
      }

      return tx.user.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return UserMapper.toResponseDto(updatedUser);
  }
}
