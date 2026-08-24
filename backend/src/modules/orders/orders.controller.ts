import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, user.buyerType ?? 'PARTICULIER', dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.ordersService.findAllForBuyer(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('PRODUCER')
  @Get('producer/mine')
  findForMyProducerAccount(@CurrentUser() user: any) {
    return this.ordersService.findAllForProducer(user.producer.id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/awaiting-payout')
  findAwaitingPayout() {
    return this.ordersService.findAwaitingPayout();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/awaiting-payment-confirmation')
  findAwaitingPaymentConfirmation() {
    return this.ordersService.findAwaitingPaymentConfirmation();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/payment-proof')
  attachPaymentProof(@Param('id') id: string, @CurrentUser() user: any, @Body('proofUrl') proofUrl: string) {
    return this.ordersService.attachPaymentProof(id, user.id, proofUrl);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @UseGuards(RolesGuard)
  @Roles('PRODUCER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(id, status);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/payout')
  markPayoutDone(@Param('id') id: string, @Body('reference') reference: string) {
    return this.ordersService.markPayoutDone(id, reference);
  }
}
