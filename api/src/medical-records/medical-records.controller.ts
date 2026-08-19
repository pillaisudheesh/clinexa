import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { MedicalRecordsService } from './medical-records.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@Controller('medical-records')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.MEDICAL_RECORD_CREATE)
  @ApiOperation({
    summary: 'Create medical record',
  })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully.',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid medical record data.',
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
    description: 'Patient, doctor, or appointment not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Medical record already exists for appointment.',
  })
  create(
    @Body() dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    return this.medicalRecordsService.create(dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.MEDICAL_RECORD_READ)
  @ApiOperation({
    summary: 'Get medical records',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findAll(@Query() query: MedicalRecordQueryDto) {
    return this.medicalRecordsService.findAll(query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.MEDICAL_RECORD_READ)
  @ApiOperation({
    summary: 'Get medical record by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record retrieved successfully.',
    type: MedicalRecordResponseDto,
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
    description: 'Medical record not found.',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.MEDICAL_RECORD_UPDATE)
  @ApiOperation({
    summary: 'Update medical record',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully.',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid medical record data.',
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
    description: 'Medical record not found.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, dto);
  }
}
