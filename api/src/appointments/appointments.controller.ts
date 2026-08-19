import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { AppointmentsService } from './appointments.service';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentAvailabilityQueryDto } from './dto/appointment-availability-query.dto';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConsultationSummaryResponseDto } from './dto/consultation-summary-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    clinicId: string;
    userId: string;
  };
}

@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Permissions(PermissionCodes.APPOINTMENT_CREATE)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.clinicId, dto);
  }

  @Get()
  @Permissions(PermissionCodes.APPOINTMENT_READ)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: AppointmentQueryDto,
  ) {
    return this.appointmentsService.findAll(req.user.clinicId, query);
  }

  @Get('availability')
  @Permissions(PermissionCodes.APPOINTMENT_READ)
  getAvailability(
    @Req() req: AuthenticatedRequest,
    @Query() query: AppointmentAvailabilityQueryDto,
  ) {
    return this.appointmentsService.getAvailability(req.user.clinicId, query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.APPOINTMENT_READ)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.findOne(req.user.clinicId, id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(req.user.clinicId, id, dto);
  }

  @Post(':id/confirm')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  confirm(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.confirm(req.user.clinicId, id);
  }

  @Post(':id/check-in')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  checkIn(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.checkIn(req.user.clinicId, id);
  }

  @Post(':id/start')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  startConsultation(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.startConsultation(req.user.clinicId, id);
  }

  @Post(':id/complete')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  complete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.complete(req.user.clinicId, id);
  }

  @Post(':id/no-show')
  @Permissions(PermissionCodes.APPOINTMENT_UPDATE)
  markNoShow(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.markNoShow(req.user.clinicId, id);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.APPOINTMENT_CANCEL)
  cancel(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.cancel(req.user.clinicId, id, reason);
  }

  @Get(':id/consultation')
  @Permissions(PermissionCodes.APPOINTMENT_READ)
  @ApiOperation({
    summary: 'Get appointment consultation summary',
    description:
      'Returns the complete consultation information associated with an appointment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultation summary retrieved successfully.',
    type: ConsultationSummaryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  getConsultation(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<ConsultationSummaryResponseDto> {
    return this.appointmentsService.getConsultation(req.user.clinicId, id);
  }
}
