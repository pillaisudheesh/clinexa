import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class MedicineQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter active medicines',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  @IsBoolean()
  isActive?: boolean;
}
