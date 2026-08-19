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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { LabTestsService } from './lab-tests.service';

import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { UpdateLabTestStatusDto } from './dto/update-lab-test-status.dto';
import { LabTestQueryDto } from './dto/lab-test-query.dto';
import { LabTestResponseDto } from './dto/lab-test-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Lab Tests')
@ApiBearerAuth()
@Controller('lab-tests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LabTestsController {
  constructor(private readonly labTestsService: LabTestsService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.LAB_CREATE)
  @ApiOperation({
    summary: 'Create laboratory test',
  })
  @ApiResponse({
    status: 201,
    description: 'Laboratory test created successfully.',
    type: LabTestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid laboratory test data.',
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
    description: 'Laboratory test already exists.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLabTestDto,
  ): Promise<LabTestResponseDto> {
    return this.labTestsService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.LAB_READ)
  @ApiOperation({
    summary: 'Get laboratory tests',
  })
  @ApiResponse({
    status: 200,
    description: 'Laboratory tests retrieved successfully.',
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
    @Query() query: LabTestQueryDto,
  ): Promise<PaginatedResponseDto<LabTestResponseDto>> {
    return this.labTestsService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.LAB_READ)
  @ApiOperation({
    summary: 'Get laboratory test by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Laboratory test retrieved successfully.',
    type: LabTestResponseDto,
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
    description: 'Laboratory test not found.',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LabTestResponseDto> {
    return this.labTestsService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.LAB_UPDATE)
  @ApiOperation({
    summary: 'Update laboratory test',
  })
  @ApiResponse({
    status: 200,
    description: 'Laboratory test updated successfully.',
    type: LabTestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid laboratory test data.',
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
    description: 'Laboratory test not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Laboratory test already exists.',
  })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLabTestDto,
  ): Promise<LabTestResponseDto> {
    return this.labTestsService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // UPDATE STATUS
  // ===========================================================================

  @Patch(':id/status')
  @Permissions(PermissionCodes.LAB_UPDATE)
  @ApiOperation({
    summary: 'Activate or deactivate laboratory test',
  })
  @ApiResponse({
    status: 200,
    description: 'Laboratory test status updated successfully.',
    type: LabTestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status.',
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
    description: 'Laboratory test not found.',
  })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLabTestStatusDto,
  ): Promise<LabTestResponseDto> {
    return this.labTestsService.updateStatus(req.user.clinicId, id, dto);
  }
}
