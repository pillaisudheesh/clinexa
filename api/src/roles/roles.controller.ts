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
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get Roles assignable during user creation' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RoleQueryDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const isPlatformAdmin = user.isPlatformAdmin === true;
    const clinicId = isPlatformAdmin
      ? (query.clinicId ?? user.clinicId)
      : user.clinicId;
    return this.rolesService.findAll(clinicId, query, !isPlatformAdmin);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get Role by Id' })
  findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleResponseDto> {
    return this.rolesService.findById(user.clinicId, id);
  }

  @Post()
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Create clinic-scoped custom role' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.create(user.clinicId, dto, user.id);
  }

  @Patch(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Update clinic-scoped custom role' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(user.clinicId, id, dto, user.id);
  }

  @Patch(':id/status')
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Activate or Deactivate clinic-scoped custom role' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleStatusDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateStatus(
      user.clinicId,
      id,
      dto.isActive,
      user.id,
    );
  }

  @Put(':id/permissions')
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Replace custom role permissions' })
  assignPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolePermissionsDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.assignPermissions(
      user.isPlatformAdmin === true ? null : user.clinicId,
      id,
      dto.permissionIds,
      user.id,
      // user.isPlatformAdmin === true,
    );
  }

  @Get(':id/permissions')
  @Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
  @ApiOperation({ summary: 'Get role permissions' })
  getPermissions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rolesService.getPermissions(
      user.isPlatformAdmin === true ? null : user.clinicId,
      id,
    );
  }
}
