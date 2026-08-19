import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ===========================================================================
  // CREATE PAYMENT
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.BILLING_CREATE)
  @ApiOperation({
    summary: 'Record a payment',
    description:
      'Records a payment against an issued invoice and updates the invoice balance.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment or invoice state.',
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
    description: 'Invoice not found.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // GET PAYMENTS FOR INVOICE
  // ===========================================================================

  @Get('invoice/:invoiceId')
  @Permissions(PermissionCodes.BILLING_READ)
  @ApiOperation({
    summary: 'Get payments for an invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully.',
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
    description: 'Invoice not found.',
  })
  findByInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('invoiceId', new ParseUUIDPipe())
    invoiceId: string,
    @Query() query: PaymentQueryDto,
  ): Promise<PaginatedResponseDto<PaymentResponseDto>> {
    return this.paymentsService.findByInvoice(
      req.user.clinicId,
      invoiceId,
      query,
    );
  }

  // ===========================================================================
  // GET PAYMENT
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.BILLING_READ)
  @ApiOperation({
    summary: 'Get payment by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully.',
    type: PaymentResponseDto,
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
    description: 'Payment not found.',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // REFUND
  // ===========================================================================

  @Post(':id/refund')
  @Permissions(PermissionCodes.BILLING_REFUND)
  @ApiOperation({
    summary: 'Refund payment',
    description:
      'Refunds a successful payment and recalculates the invoice balance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Payment cannot be refunded.',
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
    description: 'Payment not found.',
  })
  refund(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.refund(req.user.clinicId, id);
  }
}
