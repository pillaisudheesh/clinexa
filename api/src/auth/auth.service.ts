import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';

interface AuthAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async getAuthUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
        role: { isActive: true },
      },
      orderBy: {
        role: { displayOrder: 'asc' },
      },
      select: {
        role: {
          select: {
            id: true,
            name: true,
            code: true,
            permissions: {
              select: {
                permission: {
                  select: { code: true },
                },
              },
            },
          },
        },
      },
    });

    const roles = assignments.map(({ role }) => ({
      id: role.id,
      name: role.name,
      code: role.code,
    }));

    const permissions = [
      ...new Set(
        assignments.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.code),
        ),
      ),
    ];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      clinicId: user.clinicId,
      status: user.status,
      isPlatformAdmin: user.isPlatformAdmin,
      role: roles[0]?.name ?? null,
      roles,
      permissions,
    };
  }

  async login(dto: LoginDto, context: AuthAuditContext = {}) {
    let user: Awaited<ReturnType<UsersService['findByEmail']>>;

    try {
      user = await this.validateUser(dto.email, dto.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        await this.auditService.create({
          action: 'LOGIN_FAILURE',
          entityType: 'AUTH',
          description: 'Authentication failed',
          metadata: {
            email: dto.email,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }

      throw error;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      clinicId: user.clinicId,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const authUser = await this.getAuthUser(user.id);

    await this.auditService.create({
      clinicId: user.clinicId,
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'AUTH',
      entityId: user.id,
      description: 'User logged in successfully',
      metadata: {
        email: user.email,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '1h',
      user: authUser,
    };
  }

  async logout(userId: string, context: AuthAuditContext = {}) {
    const user = await this.usersService.findById(userId);

    await this.auditService.create({
      clinicId: user?.clinicId,
      actorId: userId,
      action: 'LOGOUT',
      entityType: 'AUTH',
      entityId: userId,
      description: 'User logged out',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    return this.getAuthUser(userId);
  }
}
