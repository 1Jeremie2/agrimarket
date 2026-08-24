import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeroImageDto } from './dto/create-hero-image.dto';

@Injectable()
export class HeroImagesService {
  constructor(private prisma: PrismaService) {}

  // Route publique : la homepage affiche uniquement les images actives, dans l'ordre choisi par l'admin
  findActive() {
    return this.prisma.heroImage.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Route admin : voit tout, y compris les images désactivées
  findAll() {
    return this.prisma.heroImage.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  create(dto: CreateHeroImageDto) {
    return this.prisma.heroImage.create({
      data: { ...dto, displayOrder: dto.displayOrder ?? 0 },
    });
  }

  deactivate(id: string) {
    return this.prisma.heroImage.update({ where: { id }, data: { active: false } });
  }

  activate(id: string) {
    return this.prisma.heroImage.update({ where: { id }, data: { active: true } });
  }

  // Suppression définitive autorisée ici : contrairement aux produits/commandes,
  // une image décorative n'a aucune valeur d'historique à préserver.
  remove(id: string) {
    return this.prisma.heroImage.delete({ where: { id } });
  }
}
