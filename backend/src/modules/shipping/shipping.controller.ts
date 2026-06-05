import { Controller, Get, Query } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ShippingService } from './shipping.service';

class ShippingCostQueryDto {
  @IsIn(['GEORGIA', 'INTERNATIONAL'])
  type!: 'GEORGIA' | 'INTERNATIONAL';

  @IsOptional()
  @IsString()
  countryCode?: string;
}

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('options')
  options() {
    return this.shippingService.listOptions();
  }

  @Get('cost')
  async cost(@Query() query: ShippingCostQueryDto) {
    const countryCode = query.countryCode?.toUpperCase() ?? (query.type === 'GEORGIA' ? 'GE' : 'US');
    const result = await this.shippingService.calculate(query.type, countryCode);

    return {
      shippingType: result.shippingType,
      providerKey: result.providerKey,
      shippingZone: {
        id: result.shippingZone.id,
        code: result.shippingZone.code,
        name: result.shippingZone.name
      },
      shippingCost: result.shippingCost,
      provider: result.provider,
      deliveryDays: result.deliveryDays
    };
  }
}
