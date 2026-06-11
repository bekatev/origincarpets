import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ShippingModule } from '../shipping/shipping.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ShippingModule],
  controllers: [AdminController],
  providers: [RolesGuard, AdminService],
  exports: [AdminService]
})
export class AdminModule {}
