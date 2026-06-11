import { IsString } from 'class-validator';

export class StartBankTransferDto {
  @IsString()
  orderId!: string;
}
