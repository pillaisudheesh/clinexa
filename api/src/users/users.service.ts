import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { UserMapper } from './mappers/user.mapper';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserQueryDto } from './dto/user-query.dto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
    doctorProfile: true;
  };
}>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Platform-wide user management is controlled only by the persisted
   * isPlatformAdmin flag hydrated by JwtStrategy. A clinic role's display
   * name or code must never grant cross-clinic authority.
   */
  private isPlatformAdministrator(user: AuthenticatedUser): boolean {
    return user.isPlatformAdmin === true;
  }

  private isSuperAdminRoleCode(code: string): boolean {
    return ['SUPER_ADMIN', 'SUPER_ADMINISTRATOR'].includes(
      code
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_'),
    );
  }

  async create(
    dto: CreateUserDto,
    requester: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const isPlatformAdmin = this.isPlatformAdministrator(requester);

    if (!isPlatformAdmin && dto.clinicId !== requester.clinicId) {
      throw new ForbiddenException(
        'You can only create users for your own clinic.',
      );
    }

    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const clinic = await this.findClinic(dto.clinicId);
    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    const roles = await this.findRoles(dto.roleIds);

    if (roles.length !== dto.roleIds.length) {
      throw new NotFoundException('One or more roles were not found.');
    }

    if (roles.some((role) => role.clinicId !== dto.clinicId)) {
      throw new ForbiddenException(
        'All assigned roles must belong to the selected clinic.',
      );
    }

    if (
      !isPlatformAdmin &&
      roles.some((role) => this.isSuperAdminRoleCode(role.code))
    ) {
      throw new ForbiddenException(
        'Clinic administrators cannot assign the Super Administrator role.',
      );
    }

    // Validate the requested doctor association before creating the account.
    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
        select: {
          id: true,
          clinicId: true,
          userId: true,
        },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor profile not found.');
      }

      if (doctor.clinicId !== dto.clinicId) {
        throw new ForbiddenException(
          'The doctor profile must belong to the selected clinic.',
        );
      }

      if (doctor.userId) {
        throw new ConflictException(
          'This doctor profile is already linked to a user account.',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

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

      if (dto.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        });
      }

      if (dto.doctorId) {
        // Recheck ownership and unlinked status atomically.
        const linked = await tx.doctor.updateMany({
          where: {
            id: dto.doctorId,
            clinicId: dto.clinicId,
            userId: null,
          },
          data: {
            userId: user.id,
          },
        });

        if (linked.count !== 1) {
          throw new ConflictException(
            'The doctor profile was linked or changed. Please retry.',
          );
        }
      }

      await this.auditService.createInTransaction(tx, {
        clinicId: user.clinicId,
        actorId: requester.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        description: 'User created',
        metadata: {
          email: user.email,
          roleIds: dto.roleIds,
          ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          roles: {
            include: { role: true },
          },
          doctorProfile: true,
        },
      });
    });

    return UserMapper.toResponseDto(createdUser);
  }

  private async findClinic(clinicId: string) {
    return this.prisma.clinic.findUnique({ where: { id: clinicId } });
  }

  private async findRoles(roleIds: string[]) {
    return this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });
  }

  async findAll(
    query: UserQueryDto,
    requester: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(!this.isPlatformAdministrator(requester)
        ? { clinicId: requester.clinicId }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          roles: { include: { role: true } },
          doctorProfile: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
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
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, doctorProfile: true },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requester: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findById(id);

    if (
      !existingUser ||
      (!this.isPlatformAdministrator(requester) &&
        existingUser.clinicId !== requester.clinicId)
    ) {
      throw new NotFoundException('User not found.');
    }

    if (
      !this.isPlatformAdministrator(requester) &&
      dto.clinicId &&
      dto.clinicId !== requester.clinicId
    ) {
      throw new ForbiddenException('You cannot move a user to another clinic.');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await this.findByEmail(dto.email);
      if (userWithEmail) {
        throw new ConflictException('Email already exists.');
      }
    }

    if (dto.clinicId) {
      const clinic = await this.findClinic(dto.clinicId);
      if (!clinic) {
        throw new NotFoundException('Clinic not found.');
      }
    }

    if (
      dto.clinicId &&
      dto.clinicId !== existingUser.clinicId &&
      !dto.roleIds
    ) {
      throw new ForbiddenException(
        'Assign roles from the destination clinic when moving a user.',
      );
    }

    let rolesAdded: string[] = [];
    let rolesRemoved: string[] = [];

    if (dto.roleIds !== undefined) {
      const roles = await this.findRoles(dto.roleIds);
      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException('One or more roles were not found.');
      }

      const targetClinicId = dto.clinicId ?? existingUser.clinicId;
      if (roles.some((role) => role.clinicId !== targetClinicId)) {
        throw new ForbiddenException(
          "All assigned roles must belong to the user's clinic.",
        );
      }
      if (
        !this.isPlatformAdministrator(requester) &&
        roles.some((role) => this.isSuperAdminRoleCode(role.code))
      ) {
        throw new ForbiddenException(
          'Clinic administrators cannot assign the Super Administrator role.',
        );
      }

      const existingRoleIds = new Set(
        existingUser.roles.map((userRole) => userRole.roleId),
      );
      const requestedRoleIds = new Set(dto.roleIds);
      rolesAdded = [...requestedRoleIds].filter(
        (roleId) => !existingRoleIds.has(roleId),
      );
      rolesRemoved = [...existingRoleIds].filter(
        (roleId) => !requestedRoleIds.has(roleId),
      );
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      // Recheck tenant ownership at mutation time. A platform administrator
      // may have moved this user after the initial read; clinic admins must
      // not be able to modify the user after that move.
      const mutation = await tx.user.updateMany({
        where: this.isPlatformAdministrator(requester)
          ? { id }
          : { id, clinicId: requester.clinicId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          clinicId: dto.clinicId,
        },
      });
      if (mutation.count !== 1) {
        throw new NotFoundException('User not found.');
      }

      if (dto.roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
          });
        }
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id },
        include: { roles: { include: { role: true } }, doctorProfile: true },
      });

      const changedFields = (
        ['firstName', 'lastName', 'email', 'clinicId'] as const
      ).filter(
        (field) =>
          dto[field] !== undefined && dto[field] !== existingUser[field],
      );

      if (changedFields.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: user.clinicId,
          actorId: requester.id,
          action: 'UPDATE',
          entityType: 'User',
          entityId: user.id,
          description: 'User updated',
          metadata: { changedFields },
        });
      }

      if (rolesAdded.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: user.clinicId,
          actorId: requester.id,
          action: 'ROLE_ASSIGN',
          entityType: 'User',
          entityId: user.id,
          description: 'Roles assigned to user',
          metadata: { roleIds: rolesAdded },
        });
      }

      if (rolesRemoved.length > 0) {
        await this.auditService.createInTransaction(tx, {
          clinicId: user.clinicId,
          actorId: requester.id,
          action: 'ROLE_REMOVE',
          entityType: 'User',
          entityId: user.id,
          description: 'Roles removed from user',
          metadata: { roleIds: rolesRemoved },
        });
      }

      return user;
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    requester: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findById(id);

    if (
      !existingUser ||
      (!this.isPlatformAdministrator(requester) &&
        existingUser.clinicId !== requester.clinicId)
    ) {
      throw new NotFoundException('User not found.');
    }

    if (existingUser.status === dto.status) {
      return UserMapper.toResponseDto(existingUser);
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const mutation = await tx.user.updateMany({
        where: this.isPlatformAdministrator(requester)
          ? { id }
          : { id, clinicId: requester.clinicId },
        data: { status: dto.status },
      });
      if (mutation.count !== 1) {
        throw new NotFoundException('User not found.');
      }
      const user = await tx.user.findUniqueOrThrow({
        where: { id },
        include: { roles: { include: { role: true } }, doctorProfile: true },
      });

      const action =
        String(dto.status).toUpperCase() === 'ACTIVE'
          ? 'ACTIVATE'
          : 'DEACTIVATE';

      await this.auditService.createInTransaction(tx, {
        clinicId: user.clinicId,
        actorId: requester.id,
        action,
        entityType: 'User',
        entityId: user.id,
        description:
          action === 'ACTIVATE' ? 'User activated' : 'User deactivated',
        metadata: {
          previousStatus: existingUser.status,
          newStatus: user.status,
        },
      });

      return user;
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  async getAvailableDoctors(clinicId: string, requester: AuthenticatedUser) {
    const isPlatformAdmin = this.isPlatformAdministrator(requester);

    if (!isPlatformAdmin && clinicId !== requester.clinicId) {
      throw new ForbiddenException(
        'You can only access doctor profiles from your own clinic.',
      );
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    return this.prisma.doctor.findMany({
      where: {
        clinicId,
        isActive: true,
        userId: null,
      },
      select: {
        id: true,
        doctorNumber: true,
        title: true,
        firstName: true,
        middleName: true,
        lastName: true,
        department: {
          select: { name: true },
        },
        primarySpecialty: {
          select: { name: true },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }
}
