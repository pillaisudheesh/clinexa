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
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role.enum';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

import { PermissionQueryDto } from './dto/permission-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
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
