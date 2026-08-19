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
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';

import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserQueryDto } from './dto/user-query.dto';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ===========================================================================
  // CURRENT USER
  // ===========================================================================

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  // ===========================================================================
  // LIST USERS
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.USER_READ)
  @ApiOperation({
    summary: 'Get users',
    description: 'Returns a paginated list of users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
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
    @Query() query: UserQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  // ===========================================================================
  // CREATE USER
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.USER_CREATE)
  @ApiOperation({
    summary: 'Create user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data.',
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
    status: 409,
    description: 'User already exists.',
  })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  // ===========================================================================
  // UPDATE USER
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.USER_UPDATE)
  @ApiOperation({
    summary: 'Update user',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data.',
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
    description: 'User not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  // ===========================================================================
  // UPDATE USER STATUS
  // ===========================================================================

  @Patch(':id/status')
  @Permissions(PermissionCodes.USER_UPDATE)
  @ApiOperation({
    summary: 'Activate or deactivate user',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully.',
    type: UserResponseDto,
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
    description: 'User not found.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateStatus(id, dto);
  }
}
