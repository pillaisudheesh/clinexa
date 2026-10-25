import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Body,
  Patch,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionCodes } from '../auth/constants/permission-codes';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import { UpdateClinicBrandingDto } from './dto/update-clinic-branding.dto';
import { PasswordChangeGuard } from '../auth/guards/password-change.guard';

const DEFAULTS = {
  openingTime: '09:00',
  closingTime: '18:00',
  defaultAppointmentDuration: 30,
  workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
};

const LOGO_UPLOAD_DIR = join(process.cwd(), 'uploads', 'clinic-logos');

const ALLOWED_LOGO_TYPES: Record<
  string,
  { extension: string; contentType: string }
> = {
  'image/png': { extension: '.png', contentType: 'image/png' },
  'image/jpeg': { extension: '.jpg', contentType: 'image/jpeg' },
  'image/webp': { extension: '.webp', contentType: 'image/webp' },
};

type UploadedLogoFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('Clinic Settings')
@ApiBearerAuth()
@Controller('clinic-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard, PasswordChangeGuard)
export class ClinicSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('branding')
  async getBranding(@Req() req: AuthenticatedRequest) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: req.user.clinicId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        tagline: true,
        brandColor: true,
        email: true,
        phone: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
    });

    if (!clinic) {
      throw new BadRequestException(
        'Clinic could not be found for the current user.',
      );
    }

    return clinic;
  }

  @Post('branding/logo')
  @Permissions(PermissionCodes.SETTINGS_UPDATE)
  @UseInterceptors(
    FileInterceptor('logo', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadBrandingLogo(
    @UploadedFile() file: UploadedLogoFile,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Choose a logo image to upload.');
    }

    const allowedType = ALLOWED_LOGO_TYPES[file.mimetype];

    if (!allowedType) {
      throw new BadRequestException('Logo must be a PNG, JPG, or WEBP image.');
    }

    // Validate file signatures instead of trusting only the supplied MIME type.
    const signature = file.buffer.subarray(0, 12);
    const isPng =
      file.mimetype === 'image/png' &&
      signature
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isJpeg =
      file.mimetype === 'image/jpeg' &&
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff;
    const isWebp =
      file.mimetype === 'image/webp' &&
      signature.subarray(0, 4).toString('ascii') === 'RIFF' &&
      signature.subarray(8, 12).toString('ascii') === 'WEBP';

    if (!isPng && !isJpeg && !isWebp) {
      throw new BadRequestException(
        'The uploaded file does not match a supported image format.',
      );
    }

    await mkdir(LOGO_UPLOAD_DIR, { recursive: true });

    const filename = `${req.user.clinicId}-${randomUUID()}${allowedType.extension}`;
    const filePath = join(LOGO_UPLOAD_DIR, filename);

    await writeFile(filePath, file.buffer, { flag: 'wx' });

    const logoUrl = `/api/v1/clinic-settings/branding/logo/${filename}`;

    try {
      await this.prisma.clinic.update({
        where: { id: req.user.clinicId },
        data: { logoUrl },
      });
    } catch (error) {
      // Avoid leaving an unreferenced upload if the database update fails.
      const { unlink } = await import('fs/promises');
      await unlink(filePath).catch(() => undefined);
      throw error;
    }

    return { logoUrl };
  }

  @Get('branding/logo/:filename')
  async getBrandingLogo(
    @Param('filename') filename: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    // Prevent directory traversal and reject unexpected filename formats.
    if (
      basename(filename) !== filename ||
      !/^[a-zA-Z0-9-]+-[0-9a-f-]{36}\.(png|jpg|webp)$/i.test(filename)
    ) {
      throw new NotFoundException('Logo not found.');
    }

    // Only serve a logo if it belongs to the currently authenticated clinic.
    const clinic = await this.prisma.clinic.findFirst({
      where: {
        id: req.user.clinicId,
        logoUrl: `/api/v1/clinic-settings/branding/logo/${filename}`,
      },
      select: { id: true },
    });

    if (!clinic) {
      throw new NotFoundException('Logo not found.');
    }

    const filePath = join(LOGO_UPLOAD_DIR, filename);
    const { access } = await import('fs/promises');

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException('Logo file not found.');
    }

    const extension = extname(filename).toLowerCase();
    const contentType =
      extension === '.png'
        ? 'image/png'
        : extension === '.jpg'
          ? 'image/jpeg'
          : 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return res.sendFile(filename, {
      root: LOGO_UPLOAD_DIR,
      dotfiles: 'deny',
    });
  }

  @Patch('branding')
  @Permissions(PermissionCodes.SETTINGS_UPDATE)
  async updateBranding(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateClinicBrandingDto,
  ) {
    return this.prisma.clinic.update({
      where: { id: req.user.clinicId },
      data: {
        name: dto.name.trim(),
        tagline: dto.tagline?.trim() || null,
        logoUrl: dto.logoUrl?.trim() || null,
        ...(dto.brandColor ? { brandColor: dto.brandColor } : {}),
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        tagline: true,
        brandColor: true,
        email: true,
        phone: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
    });
  }

  @Get('working-hours')
  @Permissions(PermissionCodes.SETTINGS_READ)
  async getWorkingHours(@Req() req: AuthenticatedRequest) {
    const row = await this.prisma.clinicWorkingHours.upsert({
      where: { clinicId: req.user.clinicId },
      create: {
        clinicId: req.user.clinicId,
        ...DEFAULTS,
      },
      update: {},
    });

    return {
      ...row,
      workingDays: row.workingDays.split(',').filter(Boolean),
    };
  }

  @Patch('working-hours')
  @Permissions(PermissionCodes.SETTINGS_UPDATE)
  async updateWorkingHours(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateWorkingHoursDto,
  ) {
    const toMinutes = (time: string) =>
      Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

    if (toMinutes(dto.closingTime) <= toMinutes(dto.openingTime)) {
      throw new BadRequestException('Closing time must be after opening time.');
    }

    if (!dto.workingDays.length) {
      throw new BadRequestException('Select at least one working day.');
    }

    if (
      toMinutes(dto.openingTime) + dto.defaultAppointmentDuration >
      toMinutes(dto.closingTime)
    ) {
      throw new BadRequestException(
        'Appointment duration must fit within clinic working hours.',
      );
    }

    const row = await this.prisma.clinicWorkingHours.upsert({
      where: { clinicId: req.user.clinicId },
      create: {
        clinicId: req.user.clinicId,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        defaultAppointmentDuration: dto.defaultAppointmentDuration,
        workingDays: [...new Set(dto.workingDays)].join(','),
      },
      update: {
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        defaultAppointmentDuration: dto.defaultAppointmentDuration,
        workingDays: [...new Set(dto.workingDays)].join(','),
      },
    });

    return {
      ...row,
      workingDays: row.workingDays.split(',').filter(Boolean),
    };
  }
}
