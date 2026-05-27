import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [RolesGuard]
})
export class UploadsModule {}
