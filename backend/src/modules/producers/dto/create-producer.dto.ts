import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DeliveryMode } from '@prisma/client';

export class CreateProducerDto {
  @IsString()
  farmName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  siret?: string;

  @IsEnum(DeliveryMode)
  @IsOptional()
  deliveryMode?: DeliveryMode;

  @IsString()
  @IsOptional()
  deliveryZone?: string;

  @IsString()
  @IsOptional()
  mobileMoneyAccount?: string;
}
