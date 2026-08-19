import {
  Body,
  Controller,
  Delete,
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

import { DiagnosisService } from './diagnosis.service';

import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { DiagnosisQueryDto } from './dto/diagnosis-query.dto';
import { DiagnosisResponseDto } from './dto/diagnosis-response.dto';

import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Diagnoses')
@ApiBearerAuth()
@Controller('diagnoses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DiagnosisController {
  constructor(private readonly diagnosesService: DiagnosisService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================

  @Post()
  @Permissions(PermissionCodes.DIAGNOSIS_CREATE)
  @ApiOperation({
    summary: 'Create diagnosis',
    description:
      'Creates a diagnosis associated with a medical record. If marked as primary, any existing primary diagnosis for the same medical record will be changed to secondary.',
  })
  @ApiResponse({
    status: 201,
    description: 'Diagnosis created successfully.',
    type: DiagnosisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid diagnosis data.',
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
    description: 'Medical record not found.',
  })
  create(@Body() dto: CreateDiagnosisDto): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.create(dto);
  }

  // ===========================================================================
  // LIST
  // ===========================================================================

  @Get()
  @Permissions(PermissionCodes.DIAGNOSIS_READ)
  @ApiOperation({
    summary: 'Get diagnoses',
    description:
      'Returns a paginated list of diagnoses with optional medical record and search filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnoses retrieved successfully.',
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
    @Query() query: DiagnosisQueryDto,
  ): Promise<PaginatedResponseDto<DiagnosisResponseDto>> {
    return this.diagnosesService.findAll(query);
  }

  // ===========================================================================
  // GET BY ID
  // ===========================================================================

  @Get(':id')
  @Permissions(PermissionCodes.DIAGNOSIS_READ)
  @ApiOperation({
    summary: 'Get diagnosis by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnosis retrieved successfully.',
    type: DiagnosisResponseDto,
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
    description: 'Diagnosis not found.',
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.findOne(id);
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  @Patch(':id')
  @Permissions(PermissionCodes.DIAGNOSIS_UPDATE)
  @ApiOperation({
    summary: 'Update diagnosis',
    description:
      'Updates diagnosis information. Marking a diagnosis as primary will automatically unset the primary flag on other diagnoses belonging to the same medical record.',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnosis updated successfully.',
    type: DiagnosisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid diagnosis data.',
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
    description: 'Diagnosis not found.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDiagnosisDto,
  ): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.update(id, dto);
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  @Delete(':id')
  @Permissions(PermissionCodes.DIAGNOSIS_DELETE)
  @ApiOperation({
    summary: 'Delete diagnosis',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnosis deleted successfully.',
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
    description: 'Diagnosis not found.',
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.diagnosesService.remove(id);
  }
}
