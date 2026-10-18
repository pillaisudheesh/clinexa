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

import { QualificationQueryDto } from './dto/qualification-query.dto';
import { QualificationService } from './qualification.service';

@ApiTags('Qualifications')
@ApiBearerAuth()
@Controller('qualifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QualificationController {
  constructor(private readonly qualificationsService: QualificationService) {}

  @Get()
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Qualifications' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QualificationQueryDto,
  ) {
    return this.qualificationsService.findAll(query);
  }

  @Get(':id')
  @Permissions('DOCTOR_READ')
  @ApiOperation({ summary: 'Get Qualification' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.qualificationsService.findById(id);
  }
}
