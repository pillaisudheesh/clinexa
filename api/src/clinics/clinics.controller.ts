import {
  Body,
  Controller,
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
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ClinicsService } from './clinics.service';

import { CreateClinicDto } from './dto/create-clinic.dto';
import { ClinicResponseDto } from './dto/clinic-response.dto';
import { ClinicQueryDto } from './dto/clinic-query.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { UpdateClinicStatusDto } from './dto/update-clinic-status.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { PermissionCodes } from '../auth/constants/permission-codes';

@Controller('clinics')
@ApiTags('Clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.CLINIC_CREATE)
  @ApiOperation({
    summary: 'Create a clinic',
    description: 'Creates a new clinic.',
  })
  @ApiResponse({
    status: 201,
    description: 'Clinic created successfully.',
    type: ClinicResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid clinic data.',
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
    description: 'Clinic already exists.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateClinicDto,
  ): Promise<ClinicResponseDto> {
    return this.clinicsService.create(dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.CLINIC_READ)
  @ApiOperation({
    summary: 'Get all clinics',
    description: 'Returns a paginated list of clinics.',
  })
  @ApiOkResponse({
    description: 'Clinics retrieved successfully.',
    type: PaginatedResponseDto<ClinicResponseDto>,
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
    @Query() query: ClinicQueryDto,
  ): Promise<PaginatedResponseDto<ClinicResponseDto>> {
    return this.clinicsService.findAll(query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.CLINIC_READ)
  @ApiOperation({
    summary: 'Get clinic by ID',
    description: 'Returns a single clinic by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic retrieved successfully.',
    type: ClinicResponseDto,
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
    description: 'Clinic not found.',
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClinicResponseDto> {
    return this.clinicsService.findOne(id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.CLINIC_UPDATE)
  @ApiOperation({
    summary: 'Update clinic',
    description: 'Updates clinic information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic updated successfully.',
    type: ClinicResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid clinic data.',
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
    description: 'Clinic not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Clinic already exists.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClinicDto,
  ): Promise<ClinicResponseDto> {
    return this.clinicsService.update(id, dto);
  }

  // ===========================================================================
  // UPDATE STATUS
  // ===========================================================================

  @Patch(':id/status')
  @Permissions(PermissionCodes.CLINIC_UPDATE)
  @ApiOperation({
    summary: 'Activate or deactivate a clinic',
    description:
      'Updates the active status of a clinic without deleting the clinic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clinic status updated successfully.',
    type: ClinicResponseDto,
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
    description: 'Clinic not found.',
  })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClinicStatusDto,
  ): Promise<ClinicResponseDto> {
    return this.clinicsService.updateStatus(id, dto);
  }
}
