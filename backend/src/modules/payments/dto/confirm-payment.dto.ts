import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  orderId!: string;

  @IsString()
  paymentIntentId!: string;
}
