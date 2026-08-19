import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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

import { DispensingService } from './dispensing.service';

import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import { DispensingResponseDto } from './dto/dispensing-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Pharmacy Dispensing')
@ApiBearerAuth()
@Controller('pharmacy/dispensing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DispensingController {
  constructor(private readonly dispensingService: DispensingService) {}

  // ===========================================================================
  // DISPENSE PRESCRIPTION
  // ===========================================================================

  @Post('prescriptions/:prescriptionId')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Dispense prescription',
    description:
      'Dispenses the prescribed medicine using FEFO batch selection and deducts inventory.',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription dispensed successfully.',
    type: DispensingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid prescription quantity, insufficient stock, expired stock, or invalid invoice.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription or invoice not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Prescription has already been dispensed.',
  })
  dispense(
    @Req() req: AuthenticatedRequest,
    @Param('prescriptionId', new ParseUUIDPipe())
    prescriptionId: string,
    @Body()
    dto: DispensePrescriptionDto,
  ): Promise<DispensingResponseDto> {
    return this.dispensingService.dispense(
      req.user.clinicId,
      prescriptionId,
      dto,
    );
  }

  // ===========================================================================
  // GET DISPENSING BY PRESCRIPTION
  // ===========================================================================

  @Get('prescriptions/:prescriptionId')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get dispensing record for prescription',
  })
  @ApiResponse({
    status: 200,
    type: DispensingResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Dispensing record not found.',
  })
  findByPrescription(
    @Req() req: AuthenticatedRequest,
    @Param('prescriptionId', new ParseUUIDPipe())
    prescriptionId: string,
  ): Promise<DispensingResponseDto> {
    return this.dispensingService.findByPrescription(
      req.user.clinicId,
      prescriptionId,
    );
  }

  // ===========================================================================
  // CANCEL DISPENSING
  // ===========================================================================

  @Post(':id/cancel')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Cancel dispensing',
    description:
      'Cancels a dispensing record, restores stock to the original batches, creates RETURN inventory transactions, and removes pharmacy charges from the draft invoice.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispensing cancelled successfully.',
    type: DispensingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dispensing cannot be cancelled.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Dispensing record or invoice not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Dispensing has already been cancelled.',
  })
  cancel(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<DispensingResponseDto> {
    return this.dispensingService.cancel(req.user.clinicId, id);
  }
}
