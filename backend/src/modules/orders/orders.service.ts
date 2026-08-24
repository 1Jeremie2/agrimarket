import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Calcule le total à partir des prix actuels du catalogue (jamais du client)
  // et applique le bon tarif selon le profil de l'acheteur (B2C/B2B).
  async create(buyerId: string, buyerType: 'PARTICULIER' | 'PRO', dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) }, producerId: dto.producerId },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Un ou plusieurs produits sont invalides pour ce producteur');
    }

    const items = dto.items.map((input) => {
      const product = products.find((p) => p.id === input.productId)!;
      const unitPrice = buyerType === 'PRO' ? product.priceB2b : product.priceB2c;
      return {
        productId: product.id,
        quantity: input.quantity,
        unitPrice,
        subtotal: Number(unitPrice) * input.quantity,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    // Référence courte et lisible pour le bon de paiement — l'acheteur doit
    // pouvoir la recopier facilement dans le champ "communication" du transfert mobile money.
    const paymentReference = `PAY-${Date.now().toString(36).toUpperCase()}`;

    return this.prisma.order.create({
      data: {
        buyerId,
        producerId: dto.producerId,
        totalAmount,
        deliveryModeChosen: dto.deliveryModeChosen,
        deliveryAddress: dto.deliveryAddress,
        paymentReference,
        items: { create: items },
      },
      include: { items: { include: { product: true } } },
    });
  }

  findAllForBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { items: true, producer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForProducer(producerId: string) {
    return this.prisma.order.findMany({
      where: { producerId },
      include: { items: { include: { product: true } }, buyer: { select: { id: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        buyer: { select: { id: true, email: true, phone: true } },
        producer: true,
      },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async updateStatus(id: string, status: 'EN_ATTENTE' | 'CONFIRMEE' | 'EXPEDIEE' | 'LIVREE' | 'ANNULEE') {
    // Le producteur ne doit pas confirmer une commande dont le paiement
    // n'a pas encore été vérifié par l'admin — évite de préparer une commande
    // qui ne sera peut-être jamais payée.
    if (status === 'CONFIRMEE') {
      const order = await this.prisma.order.findUnique({ where: { id } });
      if (order?.paymentStatus !== 'PAYE') {
        throw new BadRequestException(
          'Cette commande ne peut pas encore être confirmée : le paiement n\'a pas été vérifié.',
        );
      }
    }
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  // Vue admin : commandes payées mais pas encore reversées au producteur
  findAwaitingPayout() {
    return this.prisma.order.findMany({
      where: { paymentStatus: 'PAYE', payoutStatus: 'NON_REVERSE' },
      include: { producer: true, buyer: { select: { id: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // L'acheteur attache la preuve (capture d'écran) après avoir fait son transfert
  async attachPaymentProof(orderId: string, buyerId: string, proofUrl: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== buyerId) {
      throw new BadRequestException('Commande invalide pour cet utilisateur');
    }
    return this.prisma.order.update({ where: { id: orderId }, data: { paymentProofUrl: proofUrl } });
  }

  // Vue admin : commandes en attente de confirmation de paiement
  // (avec ou sans preuve déjà envoyée — l'admin peut aussi vérifier sans capture)
  findAwaitingPaymentConfirmation() {
    return this.prisma.order.findMany({
      where: { paymentStatus: 'EN_ATTENTE' },
      include: {
        buyer: { select: { id: true, email: true, phone: true } },
        producer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // L'admin confirme avoir vérifié le paiement (preuve + relevé mobile money)
  confirmPayment(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAYE', paymentConfirmedAt: new Date() },
    });
  }

  // Marque le reversement au producteur comme effectué (processus manuel pour le MVP)
  markPayoutDone(id: string, reference: string) {
    return this.prisma.order.update({
      where: { id },
      data: { payoutStatus: 'REVERSE', payoutDate: new Date(), payoutReference: reference },
    });
  }
}
