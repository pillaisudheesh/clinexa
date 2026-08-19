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

import { InventoryService } from './inventory.service';

import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { MedicineBatchQueryDto } from './dto/medicine-batch-query.dto';
import { MedicineBatchResponseDto } from './dto/medicine-batch-response.dto';
import { InventorySummaryResponseDto } from './inventory-summary-response.dto';
import { ExpiringStockQueryDto } from './dto/expiring-stock-query.dto';
import { InventoryTransactionQueryDto } from './dto/inventory-transaction-query.dto';
import { InventoryTransactionResponseDto } from './dto/inventory-transaction-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { StockReceiptResponseDto } from './dto/stock-receipt-response.dto';
import { StockReceiptQueryDto } from './dto/stock-receipt-query.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ===========================================================================
  // CREATE BATCH
  // ===========================================================================

  @Post('batches')
  @Permissions(PermissionCodes.PHARMACY_CREATE)
  @ApiOperation({
    summary: 'Create medicine batch',
  })
  @ApiResponse({
    status: 201,
    type: MedicineBatchResponseDto,
  })
  createBatch(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMedicineBatchDto,
  ): Promise<MedicineBatchResponseDto> {
    return this.inventoryService.createBatch(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get('batches')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get medicine batches',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: MedicineBatchQueryDto,
  ): Promise<PaginatedResponseDto<MedicineBatchResponseDto>> {
    return this.inventoryService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // LOW STOCK
  // ===========================================================================

  @Get('low-stock')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get low-stock medicine batches',
  })
  findLowStock(
    @Req() req: AuthenticatedRequest,
  ): Promise<MedicineBatchResponseDto[]> {
    return this.inventoryService.findLowStock(req.user.clinicId);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get('batches/:id')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get medicine batch',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<MedicineBatchResponseDto> {
    return this.inventoryService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // ADJUST STOCK
  // ===========================================================================

  @Patch('batches/:id/stock')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Adjust medicine stock',
  })
  adjustStock(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body() dto: AdjustStockDto,
  ): Promise<MedicineBatchResponseDto> {
    return this.inventoryService.adjustStock(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // INVENTORY SUMMARY
  // ===========================================================================

  @Get('summary')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get inventory summary',
    description:
      'Returns medicine, batch, stock, low-stock, expiring, and expired stock counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory summary retrieved successfully.',
    type: InventorySummaryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  getSummary(
    @Req() req: AuthenticatedRequest,
  ): Promise<InventorySummaryResponseDto> {
    return this.inventoryService.getSummary(req.user.clinicId);
  }

  // ===========================================================================
  // EXPIRING STOCK
  // ===========================================================================

  @Get('expiring')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get expiring medicine batches',
    description:
      'Returns active medicine batches with stock that will expire within the specified number of days.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring medicine batches retrieved successfully.',
    type: [MedicineBatchResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findExpiring(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExpiringStockQueryDto,
  ): Promise<MedicineBatchResponseDto[]> {
    return this.inventoryService.findExpiring(req.user.clinicId, query.days);
  }

  // ===========================================================================
  // EXPIRED STOCK
  // ===========================================================================

  @Get('expired')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get expired medicine batches',
    description:
      'Returns active medicine batches with remaining stock that have already expired.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired medicine batches retrieved successfully.',
    type: [MedicineBatchResponseDto],
  })
  findExpired(
    @Req() req: AuthenticatedRequest,
  ): Promise<MedicineBatchResponseDto[]> {
    return this.inventoryService.findExpired(req.user.clinicId);
  }

  // ===========================================================================
  // MARK BATCH AS EXPIRED
  // ===========================================================================

  @Post('batches/:id/mark-expired')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Mark medicine batch as expired',
    description:
      'Removes remaining expired stock from available inventory and creates an EXPIRED inventory transaction.',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicine batch marked as expired.',
    type: MedicineBatchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Batch has not expired, is already inactive, or has no remaining stock.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Medicine batch not found.',
  })
  markExpired(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<MedicineBatchResponseDto> {
    return this.inventoryService.markExpired(req.user.clinicId, id);
  }

  // ===========================================================================
  // INVENTORY TRANSACTIONS
  // ===========================================================================

  @Get('transactions')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get inventory transactions',
    description:
      'Returns paginated inventory transaction history with optional medicine, batch, type, and date filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory transactions retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findTransactions(
    @Req() req: AuthenticatedRequest,
    @Query()
    query: InventoryTransactionQueryDto,
  ): Promise<PaginatedResponseDto<InventoryTransactionResponseDto>> {
    return this.inventoryService.findTransactions(req.user.clinicId, query);
  }

  // ===========================================================================
  // BATCH TRANSACTIONS
  // ===========================================================================

  @Get('batches/:id/transactions')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get transactions for medicine batch',
    description:
      'Returns the complete inventory transaction history for a specific medicine batch.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch transactions retrieved successfully.',
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
    description: 'Medicine batch not found.',
  })
  findBatchTransactions(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Query()
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<InventoryTransactionResponseDto>> {
    return this.inventoryService.findBatchTransactions(
      req.user.clinicId,
      id,
      query,
    );
  }

  // ===========================================================================
  // CREATE STOCK RECEIPT
  // ===========================================================================

  @Post('receipts')
  @Permissions(PermissionCodes.PHARMACY_UPDATE)
  @ApiOperation({
    summary: 'Create stock receipt',
    description:
      'Receives medicine stock, creates or updates batches, and records PURCHASE inventory transactions.',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock receipt created successfully.',
    type: StockReceiptResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid stock receipt.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Medicine not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Receipt number already exists.',
  })
  createStockReceipt(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStockReceiptDto,
  ): Promise<StockReceiptResponseDto> {
    return this.inventoryService.createStockReceipt(req.user.clinicId, dto);
  }

  // ===========================================================================
  // STOCK RECEIPTS
  // ===========================================================================

  @Get('receipts')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get stock receipts',
    description: 'Returns paginated stock receiving history.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock receipts retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions.',
  })
  findReceipts(
    @Req() req: AuthenticatedRequest,
    @Query() query: StockReceiptQueryDto,
  ): Promise<PaginatedResponseDto<StockReceiptResponseDto>> {
    return this.inventoryService.findReceipts(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET STOCK RECEIPT BY ID
  // ===========================================================================

  @Get('receipts/:id')
  @Permissions(PermissionCodes.PHARMACY_READ)
  @ApiOperation({
    summary: 'Get stock receipt by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock receipt retrieved successfully.',
    type: StockReceiptResponseDto,
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
    description: 'Stock receipt not found.',
  })
  findReceipt(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<StockReceiptResponseDto> {
    return this.inventoryService.findReceipt(req.user.clinicId, id);
  }
}
