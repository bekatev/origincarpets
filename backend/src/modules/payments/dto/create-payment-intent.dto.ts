import { IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId!: string;
}

export class StartGuestIpayDto {
  @IsString()
  orderId!: string;

  @IsString()
  guestAccessToken!: string;
}
