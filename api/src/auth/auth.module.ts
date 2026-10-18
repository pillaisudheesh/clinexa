import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { type StringValue } from 'ms';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuditModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('jwt.secret');

        return {
          secret,
          signOptions: {
            expiresIn: config.getOrThrow<string>(
              'jwt.expiresIn',
            ) as StringValue,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
