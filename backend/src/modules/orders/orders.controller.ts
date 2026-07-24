import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateGuestOrderDto, CreateOrderDto, LookupGuestOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('guest')
  createGuestOrder(@Body() dto: CreateGuestOrderDto) {
    return this.ordersService.createGuestOrder(dto);
  }

  @Post('lookup')
  lookupGuestOrder(@Body() dto: LookupGuestOrderDto) {
    return this.ordersService.lookupGuestOrder(dto.email, dto.orderNumber);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: JwtPayload) {
    return this.ordersService.listMyOrders(user.sub);
  }
}
