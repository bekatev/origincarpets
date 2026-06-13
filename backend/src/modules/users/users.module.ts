import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { UsersService } from './users.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, UsersService],
  exports: [UsersService, AddressesService]
})
export class UsersModule {}
