import { Module } from '@nestjs/common';
import { ClinicSettingsController } from './clinic-settings.controller';
@Module({ controllers: [ClinicSettingsController] })
export class ClinicSettingsModule {}
