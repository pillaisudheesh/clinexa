import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

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

import { PharmacyPrescriptionService } from './pharmacy-prescription.service';
import { PharmacyPrescriptionQueryDto } from './dto/pharmacy-prescription-query.dto';
import { PharmacyPrescriptionResponseDto } from './dto/pharmacy-prescription-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Pharmacy Prescriptions')
@ApiBearerAuth()
@Controller('pharmacy/prescriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PharmacyPrescriptionController {
  constructor(
    private readonly pharmacyPrescriptionService: PharmacyPrescriptionService,
  ) {}

  @Get()
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get pharmacy prescription queue',
    description:
      'Returns clinic-scoped prescriptions with patient, doctor, medicine, and dispensing information.',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PharmacyPrescriptionQueryDto,
  ): Promise<PaginatedResponseDto<PharmacyPrescriptionResponseDto>> {
    return this.pharmacyPrescriptionService.findAll(req.user.clinicId, query);
  }
}
