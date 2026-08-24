import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Routes publiques : consultation du catalogue, pas besoin d'être connecté
  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('producerId') producerId?: string) {
    return this.productsService.findAll({ categoryId, producerId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Routes protégées : seul un producteur connecté peut gérer SES produits
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PRODUCER')
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.producer.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PRODUCER')
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, user.producer.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PRODUCER')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.producer.id);
  }
}
