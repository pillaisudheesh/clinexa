import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { ClinicResponseDto } from '../clinics/dto/clinic-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';

import { OrganizationBranchQueryDto } from './dto/organization-branch-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { CreateClinicDto } from '../clinics/dto/create-clinic.dto';

@Controller('organizations')
@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create an organization',
    description:
      'Creates an organization. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({
    status: 403,
    description: 'Platform Administrator access required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Organization code already exists.',
  })
  create(@Body() dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List organizations',
    description:
      'Lists organizations. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully.',
    type: OrganizationResponseDto,
    isArray: true,
  })
  findAll(): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get organization by ID',
    description:
      'Returns an organization by ID. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({
    status: 403,
    description: 'Platform Administrator access required.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/branches')
  @ApiOperation({
    summary: 'List branches in an organization',
    description:
      'Returns all clinics associated with an organization. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization branches retrieved successfully.',
    type: ClinicResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  findBranches(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: OrganizationBranchQueryDto,
  ): Promise<PaginatedResponseDto<ClinicResponseDto>> {
    return this.organizationsService.findBranches(id, query);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update organization',
    description:
      'Updates organization details. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activate or deactivate an organization',
    description:
      'Updates organization status. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization status updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationStatusDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.updateStatus(id, dto);
  }

  @Post(':id/branches')
  @ApiOperation({
    summary: 'Create a branch under an organization',
    description:
      'Creates a clinic branch under the specified active organization. Platform Administrator access is required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully.',
    type: ClinicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  @ApiResponse({
    status: 409,
    description: 'Organization is inactive.',
  })
  createBranch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateClinicDto,
  ): Promise<ClinicResponseDto> {
    return this.organizationsService.createBranch(id, dto);
  }
}
