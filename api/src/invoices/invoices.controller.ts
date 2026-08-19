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
  Delete,
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

import { InvoicesService } from './invoices.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.BILLING_CREATE)
  @ApiOperation({
    summary: 'Create invoice',
    description:
      'Creates a draft invoice for an appointment. Patient and clinic are derived from the appointment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invoice data.',
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
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invoice already exists for the appointment.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.BILLING_READ)
  @ApiOperation({
    summary: 'Get invoices',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully.',
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
    @Query() query: InvoiceQueryDto,
  ): Promise<PaginatedResponseDto<InvoiceResponseDto>> {
    return this.invoicesService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.BILLING_READ)
  @ApiOperation({
    summary: 'Get invoice by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully.',
    type: InvoiceResponseDto,
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
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  @ApiOperation({
    summary: 'Update draft invoice',
    description:
      'Updates a draft invoice. Issued or paid invoices cannot be modified.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invoice cannot be updated in its current state.',
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
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // ADD ITEM
  // ===========================================================================

  @Post(':id/items')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  @ApiOperation({
    summary: 'Add item to invoice',
    description:
      'Adds a line item to a draft invoice and recalculates invoice totals.',
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice item added successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invoice cannot be modified in its current state.',
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
  addItem(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateInvoiceItemDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.addItem(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // REMOVE ITEM
  // ===========================================================================

  @Delete(':id/items/:itemId')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  @ApiOperation({
    summary: 'Remove item from invoice',
    description:
      'Removes a line item from a draft invoice and recalculates invoice totals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice item removed successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invoice cannot be modified or would have no items.',
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
    description: 'Invoice or invoice item not found.',
  })
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.removeItem(req.user.clinicId, id, itemId);
  }

  // ===========================================================================
  // ISSUE
  // ===========================================================================

  @Post(':id/issue')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  @ApiOperation({
    summary: 'Issue invoice',
    description: 'Changes a draft invoice to ISSUED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice issued successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invoice cannot be issued in its current state.',
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
  issue(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.issue(req.user.clinicId, id);
  }

  // ===========================================================================
  // CANCEL
  // ===========================================================================

  @Post(':id/cancel')
  @Permissions(PermissionCodes.BILLING_UPDATE)
  @ApiOperation({
    summary: 'Cancel invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invoice cannot be cancelled.',
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
  cancel(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.cancel(req.user.clinicId, id);
  }
}
