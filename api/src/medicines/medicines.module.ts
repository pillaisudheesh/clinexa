import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}
