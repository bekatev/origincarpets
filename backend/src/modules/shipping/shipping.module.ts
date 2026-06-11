import { Module } from '@nestjs/common';
import { GeorgianPostClient } from './georgian-post.client';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  controllers: [ShippingController],
  providers: [GeorgianPostClient, ShippingService],
  exports: [ShippingService]
})
export class ShippingModule {}
