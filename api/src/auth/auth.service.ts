import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../email/email.service';

interface AuthAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
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
      mustChangePassword: user.mustChangePassword,
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
      mustChangePassword: user.mustChangePassword,
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

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    context: AuthAuditContext = {},
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new UnauthorizedException(
        'New password must differ from the current password',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    });

    await this.auditService.create({
      clinicId: user.clinicId,
      actorId: userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'AUTH',
      entityId: userId,
      description: 'User changed their password',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      message: 'Password changed successfully. Please log in again.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const genericResponse = {
      message:
        'If an account exists for that email, password reset instructions will be sent.',
    };

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    try {
      await this.emailService.sendPasswordReset(
        user.email,
        user.firstName,
        rawToken,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown email delivery error';
      this.logger.error(
        `Password-reset email delivery failed for user ${user.id}: ${message}`,
      );

      // Invalidate the token if the email could not be sent.
      await this.prisma.passwordResetToken.deleteMany({
        where: { tokenHash, usedAt: null },
      });

      // Avoid exposing email-provider or account details to the caller.
    }

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const now = new Date();

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      throw new BadRequestException(
        'This password reset link is invalid or has expired.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      // Claim the token atomically. Only one request can consume it.
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claimed.count !== 1) {
        throw new BadRequestException(
          'This password reset link is invalid or has expired.',
        );
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          mustChangePassword: false,
          passwordChangedAt: now,
        },
      });

      // Revoke all outstanding refresh tokens for this user.
      await tx.refreshToken.updateMany({
        where: {
          userId: resetToken.userId,
          revoked: false,
        },
        data: { revoked: true },
      });

      // Invalidate any other outstanding reset links.
      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
          usedAt: null,
        },
        data: { usedAt: now },
      });
    });

    await this.auditService.create({
      action: 'PASSWORD_RESET',
      entityType: 'AUTH',
      entityId: resetToken.userId,
      description: 'Password reset completed',
    });

    return {
      message: 'Password reset successfully. Please sign in.',
    };
  }
}
