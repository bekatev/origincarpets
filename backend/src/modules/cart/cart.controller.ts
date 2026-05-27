import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CartService } from './cart.service';
import { SyncCartDto } from './dto/sync-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post('sync')
  sync(@CurrentUser() user: JwtPayload, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(user.sub, dto.items);
  }

  @Patch('items/:productId')
  updateItem(@CurrentUser() user: JwtPayload, @Param('productId') productId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(user.sub, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeItem(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.sub, productId);
  }
}
