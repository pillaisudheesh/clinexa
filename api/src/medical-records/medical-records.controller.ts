import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@Controller('medical-records')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Permissions(PermissionCodes.MEDICAL_RECORD_CREATE)
  @ApiOperation({ summary: 'Create Medical Record' })
  create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.create(this.clinicId(user), dto, user.id);
  }

  @Get()
  @Permissions(PermissionCodes.MEDICAL_RECORD_READ)
  @ApiOperation({ summary: 'List Medical Records' })
  findAll(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.findAll(
      this.clinicId(user),
      query,
      user.id,
    );
  }

  @Get(':id')
  @Permissions(PermissionCodes.MEDICAL_RECORD_READ)
  @ApiOperation({ summary: 'Get Medical Record' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.findOne(this.clinicId(user), id, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.MEDICAL_RECORD_UPDATE)
  @ApiOperation({ summary: 'Update Medical Record' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.update(
      this.clinicId(user),
      id,
      dto,
      user.id,
    );
  }

  private clinicId(user: AuthenticatedUser): string {
    if (!user.clinicId)
      throw new ForbiddenException('Authenticated user has no clinic context');
    return user.clinicId;
  }
}
