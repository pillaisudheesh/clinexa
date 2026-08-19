import { Global, Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { NumberGeneratorService } from './services/number-generator.service';

@Global()
@Module({
  imports: [PrismaModule],

  providers: [NumberGeneratorService],

  exports: [NumberGeneratorService],
})
export class CommonModule {}
