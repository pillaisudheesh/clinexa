import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SpecialtyService } from './specialty.service';
import { SpecialtyQueryDto } from './dto/specialty-query.dto';

@ApiTags('Specialties')
@ApiBearerAuth()
@Controller('specialties')
@UseGuards(JwtAuthGuard)
export class SpecialtyController {
  constructor(private readonly specialtiesService: SpecialtyService) {}

  @Get()
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Specialties' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SpecialtyQueryDto,
  ) {
    return this.specialtiesService.findAll(user.clinicId, query);
  }

  @Get(':id')
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Specialty' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.specialtiesService.findById(user.clinicId, id);
  }
}
