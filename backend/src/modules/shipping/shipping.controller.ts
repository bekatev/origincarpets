import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsString } from 'class-validator';
import { ShippingQuoteDto } from './dto/shipping-quote.dto';
import { ShippingService } from './shipping.service';

class CitiesQueryDto {
  @IsString()
  countryId!: string;
}

class MethodsQueryDto {
  @IsString()
  countryId!: string;
}

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('provider')
  provider() {
    return this.shippingService.listProvider();
  }

  @Get('countries')
  countries() {
    return this.shippingService.listCountries();
  }

  @Get('cities')
  cities(@Query() query: CitiesQueryDto) {
    return this.shippingService.listCities(query.countryId);
  }

  @Get('methods')
  methods(@Query() query: MethodsQueryDto) {
    return this.shippingService.listMethods(query.countryId);
  }

  @Post('quote')
  quote(@Body() body: ShippingQuoteDto) {
    return this.shippingService.quote(body);
  }
}
