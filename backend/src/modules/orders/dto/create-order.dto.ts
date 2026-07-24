import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { UPS_DELIVERY_METHOD_KEYS, type UpsDeliveryMethodKey } from '../../shipping/ups.constants';

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
  city?: string;

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

  @IsIn(UPS_DELIVERY_METHOD_KEYS)
  deliveryMethod!: UpsDeliveryMethodKey;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;
}

export class CreateGuestOrderDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  deliveryCountryId!: string;

  @IsString()
  deliveryCityId!: string;

  @IsIn(UPS_DELIVERY_METHOD_KEYS)
  deliveryMethod!: UpsDeliveryMethodKey;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;
}

export class LookupGuestOrderDto {
  @IsEmail()
  email!: string;

  @IsString()
  orderNumber!: string;
}

export type CreateOrderItemInput = CreateOrderItemDto;
