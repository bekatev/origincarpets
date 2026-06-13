import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsInt, Max, Min } from 'class-validator';
import type { GpostDeliveryMethodKey } from '../../shipping/georgian-post.constants';

class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

class ShippingAddressDto {
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

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  deliveryCountryId!: string;

  @IsString()
  deliveryCityId!: string;

  @IsIn(['AVIA', 'EMS', 'CD-Parcel'])
  deliveryMethod!: GpostDeliveryMethodKey;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;
}

export type CreateOrderItemInput = CreateOrderItemDto;
