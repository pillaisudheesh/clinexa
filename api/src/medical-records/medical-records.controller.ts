import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordQueryDto } from './dto/medical-record-query.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Medical Record' })
  create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List Medical Records' })
  findAll(
    @Query() query: MedicalRecordQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Medical Record' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.medicalRecordsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Medical Record' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.update(id, dto, user.id);
  }
}
