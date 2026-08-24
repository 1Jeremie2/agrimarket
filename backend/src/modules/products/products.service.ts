import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Le catalogue public ne montre que les produits disponibles de producteurs validés
  findAll(filters: { categoryId?: string; producerId?: string }) {
    return this.prisma.product.findMany({
      where: {
        status: 'DISPONIBLE',
        available: true,
        producer: { status: 'VALIDE' },
        categoryId: filters.categoryId,
        producerId: filters.producerId,
      },
      include: { producer: true, category: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { producer: true, category: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  create(producerId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, producerId },
    });
  }

  async update(id: string, producerId: string, dto: UpdateProductDto) {
    await this.assertOwnership(id, producerId);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, producerId: string) {
    await this.assertOwnership(id, producerId);
    // Archivage plutôt que suppression : on garde l'historique pour les commandes passées
    return this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVE' } });
  }

  private async assertOwnership(productId: string, producerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.producerId !== producerId) {
      throw new NotFoundException('Produit introuvable pour ce producteur');
    }
  }
}
