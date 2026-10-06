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
import { CreatePharmacyMedicineDto } from './dto/create-medicine.dto';
import { MedicineQueryDto } from './dto/medicine-query.dto';
import { PharmacyMedicineResponseDto } from './dto/medicine-response.dto';
import { UpdatePharmacyMedicineDto } from './dto/update-medicine.dto';
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
    type: PharmacyMedicineResponseDto,
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePharmacyMedicineDto,
  ): Promise<PharmacyMedicineResponseDto> {
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
  ): Promise<PaginatedResponseDto<PharmacyMedicineResponseDto>> {
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
    type: PharmacyMedicineResponseDto,
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<PharmacyMedicineResponseDto> {
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
    type: PharmacyMedicineResponseDto,
  })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: UpdatePharmacyMedicineDto,
  ): Promise<PharmacyMedicineResponseDto> {
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
    type: PharmacyMedicineResponseDto,
  })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: UpdateMedicineStatusDto,
  ): Promise<PharmacyMedicineResponseDto> {
    return this.pharmacyService.updateStatus(
      req.user.clinicId,
      id,
      dto.isActive,
    );
  }
}
