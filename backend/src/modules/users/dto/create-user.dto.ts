import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { BuyerType } from '@prisma/client';

// Rôle volontairement restreint : l'inscription publique ne doit jamais
// permettre de créer un compte ADMIN. Les comptes admin se créent hors API.
export enum PublicRole {
  BUYER = 'BUYER',
  PRODUCER = 'PRODUCER',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(PublicRole)
  role: PublicRole;

  @IsEnum(BuyerType)
  @IsOptional()
  buyerType?: BuyerType;
}
