import { IsEnum, IsString } from 'class-validator';

export enum UploadKind {
  PRODUCT_PHOTO = 'product-photos',
  PAYMENT_PROOF = 'payment-proofs',
  HERO_IMAGE = 'hero-images',
}

export class PresignUploadDto {
  @IsEnum(UploadKind)
  kind: UploadKind;

  // Extension du fichier (ex: "jpg", "png") — utilisée pour nommer l'objet dans R2
  @IsString()
  fileExtension: string;
}
