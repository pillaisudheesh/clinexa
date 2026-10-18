import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
