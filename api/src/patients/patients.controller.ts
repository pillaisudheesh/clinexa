import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

import { PermissionCodes } from '../auth/constants/permission-codes';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PatientsService } from './patients.service';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientStatusDto } from './dto/update-patient-status.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Permissions(PermissionCodes.PATIENT_READ)
  @ApiOperation({
    summary: 'Get Patients',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PatientQueryDto,
  ): Promise<PaginatedResponseDto<PatientResponseDto>> {
    return this.patientsService.findAll(user.clinicId, query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.PATIENT_READ)
  @ApiOperation({
    summary: 'Get Patient',
  })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<PatientResponseDto> {
    return this.patientsService.findById(user.clinicId, id);
  }

  @Post()
  @Permissions(PermissionCodes.PATIENT_CREATE)
  @ApiOperation({
    summary: 'Create Patient',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.create(user.clinicId, dto);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.PATIENT_UPDATE)
  @ApiOperation({
    summary: 'Update Patient',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(user.clinicId, id, dto);
  }

  @Put(':id/status')
  @Permissions(PermissionCodes.PATIENT_UPDATE)
  @ApiOperation({
    summary: 'Activate / Deactivate Patient',
  })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() dto: UpdatePatientStatusDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.updateStatus(user.clinicId, id, dto);
  }
}
