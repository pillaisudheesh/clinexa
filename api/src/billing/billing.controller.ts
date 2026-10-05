import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { ApiBearerAuth } from '@nestjs/swagger';

import { BillingService } from './billing.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

interface AuthenticatedRequest extends Request {
  user: {
    clinicId: string;
    userId: string;
  };
}

@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Permissions(PermissionCodes.BILLING_CREATE)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateInvoiceDto) {
    return this.billingService.create(req.user.clinicId, dto);
  }

  @Get()
  @Permissions(PermissionCodes.BILLING_READ)
  findAll(@Req() req: AuthenticatedRequest, @Query() query: InvoiceQueryDto) {
    return this.billingService.findAll(req.user.clinicId, query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.BILLING_READ)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billingService.findOne(req.user.clinicId, id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.billingService.update(req.user.clinicId, id, dto);
  }

  @Post(':id/payments')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  createPayment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.billingService.createPayment(req.user.clinicId, id, dto);
  }

  @Post(':id/issue')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  issue(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billingService.issue(req.user.clinicId, id);
  }

  @Post(':id/cancel')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.billingService.cancel(req.user.clinicId, id);
  }
}
