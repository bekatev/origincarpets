import { IsOptional, IsString } from 'class-validator';

export class AddressInputDto {
  @IsString()
  deliveryCountryId!: string;

  @IsString()
  deliveryCityId!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;
}
