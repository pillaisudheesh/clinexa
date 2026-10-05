import {
  Body,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  Controller,
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

import { MedicinesService } from './medicines.service';

import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Medicines')
@ApiBearerAuth()
@Controller('medicines')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.PHARMACY_CREATE)
  @ApiOperation({
    summary: 'Create medicine',
  })
  @ApiResponse({
    status: 201,
    description: 'Medicine created successfully.',
    type: MedicineResponseDto,
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMedicineDto,
  ): Promise<MedicineResponseDto> {
    return this.medicinesService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get medicines',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicines retrieved successfully.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<MedicineResponseDto>> {
    return this.medicinesService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get medicine by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicine retrieved successfully.',
    type: MedicineResponseDto,
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<MedicineResponseDto> {
    return this.medicinesService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Update medicine',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicine updated successfully.',
    type: MedicineResponseDto,
  })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    return this.medicinesService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // DELETE / DEACTIVATE
  // ===========================================================================

  @Delete(':id')
  @Permissions(PermissionCodes.PHARMACY_DELETE)
  @ApiOperation({
    summary: 'Deactivate medicine',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicine deactivated successfully.',
  })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<{ message: string }> {
    return this.medicinesService.remove(req.user.clinicId, id);
  }
}
