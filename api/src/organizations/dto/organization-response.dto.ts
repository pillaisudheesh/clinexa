export class OrganizationResponseDto {
  id!: string;

  code!: string;

  name!: string;
  branchCount!: number;

  email!: string | null;

  phone!: string | null;

  website!: string | null;

  isActive!: boolean;

  createdAt!: Date;

  updatedAt!: Date;
}
