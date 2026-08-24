import { IsEnum, IsString } from 'class-validator';
import { PaymentOperator } from '@prisma/client';

export class CreatePlatformAccountDto {
  @IsEnum(PaymentOperator)
  operator: PaymentOperator;

  @IsString()
  phoneNumber: string;

  @IsString()
  accountName: string;
}
