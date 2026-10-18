import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleName } from '../auth/enums/role.enum';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PermissionQueryDto } from './dto/permission-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.SUPER_ADMIN, RoleName.CLINIC_ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions(PermissionCodes.PERMISSION_READ)
  @ApiOperation({
    summary: 'Get permissions',
  })
  findAll(
    @Query()
    query: PermissionQueryDto,
  ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @Permissions(PermissionCodes.PERMISSION_READ)
  @ApiOperation({
    summary: 'Get permission by id',
  })
  findById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.findById(id);
  }
}
