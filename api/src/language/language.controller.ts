import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { LanguageQueryDto } from './dto/language-query.dto';
import { LanguageService } from './language.service';

@ApiTags('Languages')
@ApiBearerAuth()
@Controller('languages')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LanguageController {
  constructor(private readonly languagesService: LanguageService) {}

  @Get()
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Languages' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LanguageQueryDto,
  ) {
    return this.languagesService.findAll(query);
  }

  @Get(':id')
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Language' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.languagesService.findById(id);
  }
}
