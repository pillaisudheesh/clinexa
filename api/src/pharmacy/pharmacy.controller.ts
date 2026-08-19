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

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PharmacyService } from './pharmacy.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { UpdateMedicineStatusDto } from './dto/update-medicine-status.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Pharmacy')
@ApiBearerAuth()
@Controller('pharmacy/medicines')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

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
    type: MedicineResponseDto,
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMedicineDto,
  ): Promise<MedicineResponseDto> {
    return this.pharmacyService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get medicines',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: MedicineQueryDto,
  ): Promise<PaginatedResponseDto<MedicineResponseDto>> {
    return this.pharmacyService.findAll(req.user.clinicId, query);
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
    type: MedicineResponseDto,
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<MedicineResponseDto> {
    return this.pharmacyService.findOne(req.user.clinicId, id);
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
    type: MedicineResponseDto,
  })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    return this.pharmacyService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // ACTIVATE / DEACTIVATE
  // ===========================================================================

  @Patch(':id/status')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Activate or deactivate medicine',
  })
  @ApiResponse({
    status: 200,
    type: MedicineResponseDto,
  })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: UpdateMedicineStatusDto,
  ): Promise<MedicineResponseDto> {
    return this.pharmacyService.updateStatus(
      req.user.clinicId,
      id,
      dto.isActive,
    );
  }
}
