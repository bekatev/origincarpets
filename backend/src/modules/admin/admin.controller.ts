import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  health() {
    return { ok: true, scope: 'admin' };
  }

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('orders')
  orders() {
    return this.adminService.listOrders();
  }

  @Patch('orders/:orderId/status')
  updateOrderStatus(@Param('orderId') orderId: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(orderId, dto.status);
  }

  @Get('customers')
  customers() {
    return this.adminService.listCustomers();
  }

  @Post('imports/origincarpets')
  importOrigincarpets(@Query('mode') mode?: 'full' | 'sync') {
    return this.adminService.syncOrigincarpets(mode === 'full' ? 'full' : 'sync');
  }
}
