import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignUploadDto } from './dto/presign.dto';

@Injectable()
export class UploadsService {
  // Cloudflare R2 expose une API compatible S3 — on utilise donc le SDK AWS S3
  // standard, simplement pointé vers l'endpoint R2 du compte.
  private s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  async createPresignedUploadUrl(dto: PresignUploadDto) {
    // Chemin unique par upload pour éviter toute collision entre utilisateurs
    const objectKey = `${dto.kind}/${crypto.randomUUID()}.${dto.fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    });

    // URL valable 5 minutes — largement suffisant pour un upload immédiat après génération
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${objectKey}`;

    return { uploadUrl, publicUrl };
  }
}
