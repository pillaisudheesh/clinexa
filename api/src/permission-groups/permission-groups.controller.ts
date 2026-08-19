import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { RoleName } from '../auth/enums/role.enum';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PermissionGroupQueryDto } from './dto/permission-group-query.dto';
import { PermissionGroupResponseDto } from './dto/permission-group-response.dto';

import { PermissionGroupsService } from './permission-groups.service';

@ApiTags('Permission Groups')
@ApiBearerAuth()
@Controller('permission-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN)
export class PermissionGroupsController {
  constructor(
    private readonly permissionGroupsService: PermissionGroupsService,
  ) {}

  @Get()
  findAll(
    @Query()
    query: PermissionGroupQueryDto,
  ): Promise<PaginatedResponseDto<PermissionGroupResponseDto>> {
    return this.permissionGroupsService.findAll(query);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<PermissionGroupResponseDto> {
    return this.permissionGroupsService.findById(id);
  }
}
