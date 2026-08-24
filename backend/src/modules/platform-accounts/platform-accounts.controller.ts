import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PlatformAccountsService } from './platform-accounts.service';
import { CreatePlatformAccountDto } from './dto/create-platform-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('platform-accounts')
export class PlatformAccountsController {
  constructor(private readonly service: PlatformAccountsService) {}

  // Publique : affichée sur le bon de paiement, avant même que l'acheteur soit connecté
  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePlatformAccountDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }
}
