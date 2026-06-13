import { IsIn, IsOptional } from 'class-validator';
import type { PaymentMethod } from '@prisma/client';

const PAYMENT_METHODS = ['CARD', 'BANK_TRANSFER', 'PAYPAL'] as const satisfies readonly PaymentMethod[];

export class UpdateProfileDto {
  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  preferredPaymentMethod?: PaymentMethod;
}
