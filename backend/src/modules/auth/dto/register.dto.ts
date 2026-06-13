import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import type { PaymentMethod } from '@prisma/client';
import { AddressInputDto } from '../../users/dto/address-input.dto';

const PAYMENT_METHODS = ['CARD', 'BANK_TRANSFER', 'PAYPAL'] as const satisfies readonly PaymentMethod[];

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  shippingAddress?: AddressInputDto;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  preferredPaymentMethod?: PaymentMethod;
}
