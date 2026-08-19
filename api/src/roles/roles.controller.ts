import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RoleName } from '../auth/enums/role.enum';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { RolesService } from './roles.service';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Roles',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RoleQueryDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    return this.rolesService.findAll(user.clinicId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Role by Id',
  })
  findById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<RoleResponseDto> {
    return this.rolesService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Role',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.create(user.clinicId, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Role',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(user.clinicId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activate or Deactivate Role',
  })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() dto: UpdateRoleStatusDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateStatus(user.clinicId, id, dto.isActive);
  }

  @Put(':id/permissions')
  @ApiOperation({
    summary: 'Replace role permissions',
  })
  assignPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolePermissionsDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.assignPermissions(
      user.clinicId,
      id,
      dto.permissionIds,
    );
  }

  @Get(':id/permissions')
  @ApiOperation({
    summary: 'Get role permissions',
  })
  getPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rolesService.getPermissions(user.clinicId, id);
  }
}
