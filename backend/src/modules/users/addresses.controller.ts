import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AddressesService } from './addresses.service';
import { AddressInputDto } from './dto/address-input.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly usersService: UsersService
  ) {}

  @Get('profile')
  async profile(@CurrentUser() user: JwtPayload) {
    const account = await this.usersService.getAccountProfile(user.sub);
    return account;
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() body: UpdateProfileDto) {
    const account = await this.usersService.updateAccountProfile(user.sub, body);
    return account;
  }

  @Get('addresses')
  async listAddresses(@CurrentUser() user: JwtPayload) {
    const addresses = await this.addressesService.listSavedAddresses(user.sub);
    return addresses.map((address) => this.addressesService.serializeAddress(address));
  }

  @Post('addresses')
  async createAddress(@CurrentUser() user: JwtPayload, @Body() body: AddressInputDto) {
    const address = await this.addressesService.createSavedAddress(user.sub, body, true);
    return this.addressesService.serializeAddress(address);
  }

  @Patch('addresses/:addressId')
  async updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param('addressId') addressId: string,
    @Body() body: AddressInputDto
  ) {
    const address = await this.addressesService.updateSavedAddress(user.sub, addressId, body, true);
    return this.addressesService.serializeAddress(address);
  }

  @Delete('addresses/:addressId')
  deleteAddress(@CurrentUser() user: JwtPayload, @Param('addressId') addressId: string) {
    return this.addressesService.deleteSavedAddress(user.sub, addressId);
  }

  @Patch('addresses/:addressId/default')
  async setDefaultAddress(@CurrentUser() user: JwtPayload, @Param('addressId') addressId: string) {
    const address = await this.addressesService.setDefaultAddress(user.sub, addressId);
    return this.addressesService.serializeAddress(address);
  }
}
