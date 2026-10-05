import { Module } from '@nestjs/common';
import { RegistrationCouncilService } from './registration-council.service';
import { RegistrationCouncilController } from './registration-council.controller';

@Module({
  controllers: [RegistrationCouncilController],
  providers: [RegistrationCouncilService],
})
export class RegistrationCouncilModule {}
