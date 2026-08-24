import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformAccountDto } from './dto/create-platform-account.dto';

@Injectable()
export class PlatformAccountsService {
  constructor(private prisma: PrismaService) {}

  // Route publique : l'acheteur doit voir ces numéros sur le bon de paiement
  findActive() {
    return this.prisma.platformPaymentAccount.findMany({ where: { active: true } });
  }

  // Route admin : gestion complète, y compris les comptes désactivés
  findAll() {
    return this.prisma.platformPaymentAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreatePlatformAccountDto) {
    return this.prisma.platformPaymentAccount.create({ data: dto });
  }

  deactivate(id: string) {
    return this.prisma.platformPaymentAccount.update({ where: { id }, data: { active: false } });
  }

  activate(id: string) {
    return this.prisma.platformPaymentAccount.update({ where: { id }, data: { active: true } });
  }
}
