import { IsUUID, IsArray, ValidateNested, IsEnum, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryMode } from '@prisma/client';

class OrderItemInput {
  @IsUUID()
  productId: string;

  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  producerId: string; // une commande = un seul producteur (règle métier validée)

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsEnum(DeliveryMode)
  deliveryModeChosen: DeliveryMode;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;
}
