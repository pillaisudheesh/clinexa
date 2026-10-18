import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.authService.logout(user.id, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      user: await this.authService.me(user.id),
    };
  }
}
