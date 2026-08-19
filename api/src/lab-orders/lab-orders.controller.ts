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

import { LabOrderItemStatus } from '@prisma/client';

import { LabOrdersService } from './lab-orders.service';

import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { LabOrderQueryDto } from './dto/lab-order-query.dto';
import { LabOrderResponseDto } from './dto/lab-order-response.dto';
import { UpdateLabOrderStatusDto } from './dto/update-lab-order-status.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    clinicId: string;
  };
}

@ApiTags('Lab Orders')
@ApiBearerAuth()
@Controller('lab-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.LAB_CREATE)
  @ApiOperation({
    summary: 'Create laboratory order',
  })
  @ApiResponse({
    status: 201,
    description: 'Laboratory order created successfully.',
    type: LabOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid appointment or laboratory test.',
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
    description: 'Laboratory order already exists.',
  })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLabOrderDto,
  ): Promise<LabOrderResponseDto> {
    return this.labOrdersService.create(req.user.clinicId, dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.LAB_READ)
  @ApiOperation({
    summary: 'Get laboratory orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Laboratory orders retrieved successfully.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: LabOrderQueryDto,
  ): Promise<PaginatedResponseDto<LabOrderResponseDto>> {
    return this.labOrdersService.findAll(req.user.clinicId, query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.LAB_READ)
  @ApiOperation({
    summary: 'Get laboratory order by ID',
  })
  @ApiResponse({
    status: 200,
    type: LabOrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Laboratory order not found.',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<LabOrderResponseDto> {
    return this.labOrdersService.findOne(req.user.clinicId, id);
  }

  // ===========================================================================
  // UPDATE ORDER STATUS
  // ===========================================================================

  @Patch(':id/status')
  @Permissions(PermissionCodes.LAB_UPDATE)
  @ApiOperation({
    summary: 'Update laboratory order status',
  })
  @ApiResponse({
    status: 200,
    type: LabOrderResponseDto,
  })
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Body()
    dto: UpdateLabOrderStatusDto,
  ): Promise<LabOrderResponseDto> {
    return this.labOrdersService.updateStatus(req.user.clinicId, id, dto);
  }

  // ===========================================================================
  // UPDATE ITEM STATUS
  // ===========================================================================

  @Patch('items/:itemId/status')
  @Permissions(PermissionCodes.LAB_UPDATE)
  @ApiOperation({
    summary: 'Update laboratory test status',
  })
  @ApiResponse({
    status: 200,
    type: LabOrderResponseDto,
  })
  updateItemStatus(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', new ParseUUIDPipe())
    itemId: string,
    @Body()
    dto: {
      status: LabOrderItemStatus;
    },
  ): Promise<LabOrderResponseDto> {
    return this.labOrdersService.updateItemStatus(
      req.user.clinicId,
      itemId,
      dto.status,
    );
  }

  // ===========================================================================
  // ENTER RESULT
  // ===========================================================================

  @Post('items/:itemId/result')
  @Permissions(PermissionCodes.LAB_UPDATE)
  @ApiOperation({
    summary: 'Enter laboratory test result',
  })
  @ApiResponse({
    status: 201,
    description: 'Laboratory result recorded successfully.',
    type: LabOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Result cannot be entered.',
  })
  @ApiResponse({
    status: 404,
    description: 'Laboratory order item not found.',
  })
  createResult(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', new ParseUUIDPipe())
    itemId: string,
    @Body() dto: CreateLabResultDto,
  ): Promise<LabOrderResponseDto> {
    return this.labOrdersService.createResult(req.user.clinicId, itemId, dto);
  }
}
