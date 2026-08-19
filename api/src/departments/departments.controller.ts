import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { DepartmentsService } from './departments.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { PermissionCodes } from '../auth/constants/permission-codes';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Permissions(PermissionCodes.DEPARTMENT_READ)
  @ApiOperation({ summary: 'Get Departments' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DepartmentQueryDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    return this.departmentsService.findAll(user.clinicId, query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.DEPARTMENT_READ)
  @ApiOperation({ summary: 'Get Department' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.findById(user.clinicId, id);
  }

  @Post()
  @Permissions(PermissionCodes.DEPARTMENT_CREATE)
  @ApiOperation({ summary: 'Create Department' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(user.clinicId, dto);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.DEPARTMENT_UPDATE)
  @ApiOperation({ summary: 'Update Department' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(user.clinicId, id, dto);
  }

  @Put(':id/status')
  @Permissions(PermissionCodes.DEPARTMENT_UPDATE)
  @ApiOperation({ summary: 'Activate / Deactivate Department' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentStatusDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.updateStatus(user.clinicId, id, dto);
  }
}
