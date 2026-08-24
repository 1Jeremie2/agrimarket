import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Un avis n'est possible que si la commande est bien livrée (évite les avis abusifs préventifs)
  async create(buyerId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order || order.buyerId !== buyerId) {
      throw new BadRequestException('Commande invalide pour cet utilisateur');
    }
    if (order.status !== 'LIVREE') {
      throw new BadRequestException('Un avis ne peut être laissé que sur une commande livrée');
    }

    return this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        buyerId,
        producerId: order.producerId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  findByProducer(producerId: string) {
    return this.prisma.review.findMany({
      where: { producerId },
      include: { buyer: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
