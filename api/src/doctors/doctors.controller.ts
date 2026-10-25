import {
  Body,
  Controller,
  Delete,
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
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { DoctorQueryDto } from './dto/doctor-query.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PasswordChangeGuard } from '../auth/guards/password-change.guard';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, PermissionsGuard, PasswordChangeGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Permissions(PermissionCodes.DOCTOR_READ)
  @ApiOperation({ summary: 'Get Doctors' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DoctorQueryDto,
  ) {
    return this.doctorsService.findAll(user.clinicId, query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.DOCTOR_READ)
  @ApiOperation({ summary: 'Get Doctor' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.findOne(user.clinicId, id);
  }

  @Post()
  @Permissions(PermissionCodes.DOCTOR_CREATE)
  @ApiOperation({ summary: 'Create Doctor' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.create(user.clinicId, dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.DOCTOR_UPDATE)
  @ApiOperation({ summary: 'Update Doctor' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.update(user.clinicId, id, dto, user.id);
  }

  @Put(':id/status')
  @Permissions(PermissionCodes.DOCTOR_UPDATE)
  @ApiOperation({ summary: 'Activate / Deactivate Doctor' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorStatusDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.updateStatus(user.clinicId, id, dto, user.id);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.DOCTOR_DELETE)
  @ApiOperation({ summary: 'Deactivate Doctor' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.doctorsService.remove(user.clinicId, id, user.id);
  }
}
