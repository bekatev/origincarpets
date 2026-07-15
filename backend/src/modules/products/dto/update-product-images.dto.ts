import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class UpdateProductImagesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  images!: string[];
}
