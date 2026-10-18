import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateClinicBrandingDto {
  @IsString() @MaxLength(160)
  name!: string;

  @IsOptional() @IsString() @MaxLength(300)
  tagline?: string | null;

  @IsOptional() @IsString() @MaxLength(2048)
  logoUrl?: string | null;

  @IsOptional() @IsHexColor()
  brandColor?: string | null;
}
