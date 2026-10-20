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

import { RegistrationCouncilQueryDto } from './dto/registration-council-query.dto';
import { RegistrationCouncilService } from './registration-council.service';

@ApiTags('Registration Councils')
@ApiBearerAuth()
@Controller('registration-councils')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegistrationCouncilController {
  constructor(
    private readonly registrationCouncilsService: RegistrationCouncilService,
  ) {}

  @Get()
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Registration Councils' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RegistrationCouncilQueryDto,
  ) {
    return this.registrationCouncilsService.findAll(query);
  }

  @Get(':id')
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Registration Council' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.registrationCouncilsService.findById(id);
  }
}
