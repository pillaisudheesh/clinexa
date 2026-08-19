import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { PrescriptionsService } from './prescriptions.service';

import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionQueryDto } from './dto/prescription-query.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.PRESCRIPTION_CREATE)
  @ApiOperation({
    summary: 'Create prescription',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully.',
    type: PrescriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid prescription data.',
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
    description: 'Medical record or medicine not found.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.PRESCRIPTION_READ)
  @ApiOperation({
    summary: 'Get prescriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PrescriptionResponseDto>> {
    return this.prescriptionsService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.PRESCRIPTION_READ)
  @ApiOperation({
    summary: 'Get prescription by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription retrieved successfully.',
    type: PrescriptionResponseDto,
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
    description: 'Prescription not found.',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.PRESCRIPTION_UPDATE)
  @ApiOperation({
    summary: 'Update prescription',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully.',
    type: PrescriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid prescription data.',
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
    description: 'Prescription or medicine not found.',
  })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  @Delete(':id')
  @Permissions(PermissionCodes.PRESCRIPTION_DELETE)
  @ApiOperation({
    summary: 'Delete prescription',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription deleted successfully.',
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
    description: 'Prescription not found.',
  })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.prescriptionsService.remove(req.user.clinicId, id);
  }
}
