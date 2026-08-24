import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
