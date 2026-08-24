import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ProducersService } from './producers.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  // Auto-inscription : le compte User doit déjà exister (rôle PRODUCER),
  // on crée ensuite le profil producteur lié, statut EN_ATTENTE par défaut
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProducerDto) {
    return this.producersService.create(user.id, dto);
  }

  @Get()
  findAll() {
    return this.producersService.findAllValidated();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  findPending() {
    return this.producersService.findPendingValidation();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.producersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/validate')
  validate(@Param('id') id: string) {
    return this.producersService.validate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.producersService.suspend(id);
  }
}
