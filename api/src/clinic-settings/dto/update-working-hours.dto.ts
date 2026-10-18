import { IsArray, IsIn, IsInt, IsString, Matches, Max, Min } from 'class-validator';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export class UpdateWorkingHoursDto {
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  openingTime!: string;

  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closingTime!: string;

  @IsInt() @Min(5) @Max(240)
  defaultAppointmentDuration!: number;

  @IsArray() @IsIn(DAYS, { each: true })
  workingDays!: string[];
}
