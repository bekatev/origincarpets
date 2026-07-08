import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { GeorgianPostClient } from './georgian-post.client';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [MailModule],
  controllers: [ShippingController],
  providers: [GeorgianPostClient, ShippingService],
  exports: [ShippingService]
})
export class ShippingModule {}
