import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateHeroImageDto {
  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}
