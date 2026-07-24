import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ShippingModule } from '../shipping/shipping.module';
import { UsersModule } from '../users/users.module';
import { GuestCheckoutTokenService } from './guest-checkout-token.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    ShippingModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me')
      })
    })
  ],
  controllers: [OrdersController],
  providers: [OrdersService, GuestCheckoutTokenService],
  exports: [OrdersService, GuestCheckoutTokenService]
})
export class OrdersModule {}
