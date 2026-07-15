import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MediaController, UploadsController } from './uploads.controller';

@Module({
  controllers: [MediaController, UploadsController],
  providers: [RolesGuard]
})
export class UploadsModule {}
