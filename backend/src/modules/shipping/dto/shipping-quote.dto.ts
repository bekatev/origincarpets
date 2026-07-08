import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { UPS_DELIVERY_METHOD_KEYS, type UpsDeliveryMethodKey } from '../ups.constants';

class QuoteItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class ShippingQuoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items!: QuoteItemDto[];

  @IsString()
  deliveryCountryId!: string;

  @IsString()
  deliveryCityId!: string;

  @IsIn(UPS_DELIVERY_METHOD_KEYS)
  deliveryMethod!: UpsDeliveryMethodKey;
}

export class SyncCitiesQueryDto {
  @IsString()
  countryId!: string;
}
