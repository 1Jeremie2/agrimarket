import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PresignUploadDto } from './dto/presign.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // Connecté uniquement — évite que n'importe qui génère des URLs d'upload
  // vers le stockage de la plateforme sans compte.
  @UseGuards(JwtAuthGuard)
  @Post('presign')
  presign(@Body() dto: PresignUploadDto) {
    return this.uploadsService.createPresignedUploadUrl(dto);
  }
}
