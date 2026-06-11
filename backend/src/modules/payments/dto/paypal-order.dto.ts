import { IsString } from 'class-validator';

export class PayPalCreateOrderDto {
  @IsString()
  orderId!: string;
}

export class PayPalCaptureOrderDto {
  @IsString()
  orderId!: string;

  @IsString()
  paypalOrderId!: string;
}
