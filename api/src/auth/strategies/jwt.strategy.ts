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

    console.log('JWT validation secret:', {
      length: secret.length,
      fingerprint: secret.slice(0, 4) + '...' + secret.slice(-4),
    });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    console.log('JWT Payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('User:', user);
    console.log(user?.roles.map((r) => r.role.name));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      id: user.id,
      clinicId: user.clinicId,
      email: user.email,
      status: user.status,
      roles: user.roles.map((roleAssignment) => roleAssignment.role.name),
    };
  }
}
