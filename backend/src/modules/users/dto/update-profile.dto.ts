import { IsIn, IsOptional, ValidateIf } from 'class-validator';
import type { PaymentMethod } from '@prisma/client';

const PAYMENT_METHODS = ['CARD', 'BANK_TRANSFER', 'PAYPAL'] as const satisfies readonly PaymentMethod[];

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsIn(PAYMENT_METHODS)
  preferredPaymentMethod?: PaymentMethod | null;
}
