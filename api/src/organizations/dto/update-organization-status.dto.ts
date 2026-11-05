import { IsBoolean } from 'class-validator';

export class UpdateOrganizationStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
