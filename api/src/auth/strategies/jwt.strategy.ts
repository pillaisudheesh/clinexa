import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@prisma/client';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.getOrThrow<string>('jwt.secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is inactive');
    }

    if (!user.isPlatformAdmin && user.clinicId) {
      if (!user.clinic) {
        throw new UnauthorizedException('User clinic not found');
      }

      if (!user.clinic.isActive) {
        throw new UnauthorizedException('Clinic is inactive');
      }

      if (user.clinic.organization && !user.clinic.organization.isActive) {
        throw new UnauthorizedException('Organization is inactive');
      }
    }

    return {
      id: user.id,
      clinicId: user.clinicId,
      email: user.email,
      status: user.status,
      isPlatformAdmin: user.isPlatformAdmin,
      mustChangePassword: user.mustChangePassword,
      roles: user.roles.map((roleAssignment) => roleAssignment.role.name),
      roleCodes: user.roles.map((roleAssignment) => roleAssignment.role.code),
    };
  }
}
