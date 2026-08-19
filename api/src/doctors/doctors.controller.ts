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
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { DoctorQueryDto } from './dto/doctor-query.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';

import { DoctorsService } from './doctors.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions('DOCTOR_CREATE')
  @ApiOperation({
    summary: 'Create a doctor',
  })
  @ApiResponse({
    status: 201,
    description: 'Doctor created successfully.',
    type: DoctorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid doctor data.',
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
    status: 409,
    description: 'Doctor already exists.',
  })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions('DOCTOR_READ')
  @ApiOperation({
    summary: 'Get doctors',
    description:
      'Returns a paginated list of doctors belonging to the authenticated clinic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctors retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: DoctorQueryDto,
  ) {
    console.log('DOCTORS CONTROLLER START');
    console.log('clinicId:', req.user.clinicId);
    console.log('query:', query);
    const result = await this.doctorsService.findAll(req.user.clinicId, query);
    console.log('DOCTORS CONTROLLER END');

    return result;
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions('DOCTOR_READ')
  @ApiOperation({
    summary: 'Get doctor by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor retrieved successfully.',
    type: DoctorResponseDto,
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
    description: 'Doctor not found.',
  })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions('DOCTOR_UPDATE')
  @ApiOperation({
    summary: 'Update doctor',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor updated successfully.',
    type: DoctorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid doctor data.',
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
    description: 'Doctor not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Doctor already exists.',
  })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // UPDATE STATUS
  // ===========================================================================

  @Patch(':id/status')
  @Permissions('DOCTOR_UPDATE')
  @ApiOperation({
    summary: 'Activate or deactivate doctor',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor status updated successfully.',
    type: DoctorResponseDto,
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
    description: 'Doctor not found.',
  })
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDoctorStatusDto,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.updateStatus(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // DELETE / SOFT DELETE
  // ===========================================================================

  @Delete(':id')
  @Permissions('DOCTOR_DELETE')
  @ApiOperation({
    summary: 'Deactivate doctor',
    description: 'Soft deletes a doctor by setting isActive to false.',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor deactivated successfully.',
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
    description: 'Doctor not found.',
  })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.doctorsService.remove(req.user.clinicId, id);
  }
}
