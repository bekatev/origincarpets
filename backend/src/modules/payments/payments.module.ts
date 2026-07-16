import { Module } from '@nestjs/common';
import { ShippingModule } from '../shipping/shipping.module';
import { IpayClient } from './ipay.client';
import { LegacyIpayController } from './legacy-ipay.controller';
import { PayPalClient } from './paypal.client';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ShippingModule],
  controllers: [PaymentsController, LegacyIpayController],
  providers: [PaymentsService, IpayClient, PayPalClient],
  exports: [PaymentsService]
})
export class PaymentsModule {}
