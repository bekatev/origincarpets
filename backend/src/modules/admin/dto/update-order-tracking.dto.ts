import { IsString, MinLength } from 'class-validator';

export class UpdateOrderTrackingDto {
  @IsString()
  @MinLength(4)
  trackingNumber!: string;
}
