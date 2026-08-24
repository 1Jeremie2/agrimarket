import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { ProductUnit } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  priceB2c: number;

  @IsNumber()
  @Min(0)
  priceB2b: number;

  @IsEnum(ProductUnit)
  unit: ProductUnit;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
