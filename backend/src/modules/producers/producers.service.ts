import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProducerDto } from './dto/create-producer.dto';

@Injectable()
export class ProducersService {
  constructor(private prisma: PrismaService) {}

  // Auto-inscription : le profil est créé avec le statut EN_ATTENTE,
  // validé ensuite manuellement par un admin (règle métier validée)
  create(userId: string, dto: CreateProducerDto) {
    return this.prisma.producer.create({
      data: { ...dto, userId, status: 'EN_ATTENTE' },
    });
  }

  findAllValidated() {
    return this.prisma.producer.findMany({
      where: { status: 'VALIDE' },
      include: { user: { select: { id: true, email: true, phone: true } } },
    });
  }

  findPendingValidation() {
    return this.prisma.producer.findMany({
      where: { status: 'EN_ATTENTE' },
      include: { user: { select: { id: true, email: true, phone: true } } },
    });
  }

  async findOne(id: string) {
    const producer = await this.prisma.producer.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!producer) throw new NotFoundException('Producteur introuvable');
    return producer;
  }

  // Réservé à l'admin
  validate(id: string) {
    return this.prisma.producer.update({ where: { id }, data: { status: 'VALIDE' } });
  }

  suspend(id: string) {
    return this.prisma.producer.update({ where: { id }, data: { status: 'SUSPENDU' } });
  }
}
