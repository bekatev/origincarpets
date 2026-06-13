import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { PaymentMethod, ShippingAddress } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AddressInputDto } from './dto/address-input.dto';

type AddressWithRelations = ShippingAddress & {
  deliveryCity: {
    id: string;
    nameEn: string;
    nameGe: string | null;
    countryId: string;
    country: { id: string; abbr: string; nameEn: string; nameGe: string | null };
  } | null;
};

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  listSavedAddresses(userId: string): Promise<AddressWithRelations[]> {
    return this.prisma.shippingAddress.findMany({
      where: {
        userId,
        type: 'SHIPPING',
        shippingOrders: { none: {} },
        billingOrders: { none: {} }
      },
      include: {
        deliveryCity: { include: { country: true } }
      },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
    });
  }

  getDefaultSavedAddress(userId: string): Promise<AddressWithRelations | null> {
    return this.prisma.shippingAddress.findFirst({
      where: {
        userId,
        type: 'SHIPPING',
        isDefault: true,
        shippingOrders: { none: {} },
        billingOrders: { none: {} }
      },
      include: {
        deliveryCity: { include: { country: true } }
      }
    });
  }

  async createSavedAddress(userId: string, dto: AddressInputDto, setDefault = true) {
    const deliveryCity = await this.resolveDeliveryCity(dto.deliveryCountryId, dto.deliveryCityId);
    const shippingZone = await this.resolveShippingZone(deliveryCity.country.abbr);

    if (setDefault) {
      await this.clearDefaultAddresses(userId);
    }

    return this.prisma.shippingAddress.create({
      data: {
        userId,
        shippingZoneId: shippingZone?.id,
        deliveryCityId: deliveryCity.id,
        type: 'SHIPPING',
        fullName: dto.fullName,
        phone: dto.phone,
        countryCode: deliveryCity.country.abbr,
        city: deliveryCity.nameEn,
        region: dto.region,
        postalCode: dto.postalCode,
        line1: dto.line1,
        line2: dto.line2,
        isDefault: setDefault
      },
      include: {
        deliveryCity: { include: { country: true } }
      }
    });
  }

  async updateSavedAddress(userId: string, addressId: string, dto: AddressInputDto, setDefault = false) {
    const existing = await this.findEditableAddress(userId, addressId);
    const deliveryCity = await this.resolveDeliveryCity(dto.deliveryCountryId, dto.deliveryCityId);
    const shippingZone = await this.resolveShippingZone(deliveryCity.country.abbr);

    if (setDefault) {
      await this.clearDefaultAddresses(userId);
    }

    return this.prisma.shippingAddress.update({
      where: { id: existing.id },
      data: {
        shippingZoneId: shippingZone?.id,
        deliveryCityId: deliveryCity.id,
        fullName: dto.fullName,
        phone: dto.phone,
        countryCode: deliveryCity.country.abbr,
        city: deliveryCity.nameEn,
        region: dto.region,
        postalCode: dto.postalCode,
        line1: dto.line1,
        line2: dto.line2,
        isDefault: setDefault ? true : existing.isDefault
      },
      include: {
        deliveryCity: { include: { country: true } }
      }
    });
  }

  async deleteSavedAddress(userId: string, addressId: string) {
    const existing = await this.findEditableAddress(userId, addressId);
    await this.prisma.shippingAddress.delete({ where: { id: existing.id } });
    return { message: 'Address removed' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await this.findEditableAddress(userId, addressId);
    await this.clearDefaultAddresses(userId);
    return this.prisma.shippingAddress.update({
      where: { id: existing.id },
      data: { isDefault: true },
      include: {
        deliveryCity: { include: { country: true } }
      }
    });
  }

  async saveProfileAddressFromCheckout(userId: string, dto: AddressInputDto) {
    const existing = await this.getDefaultSavedAddress(userId);
    if (existing) {
      return this.updateSavedAddress(userId, existing.id, dto, true);
    }
    return this.createSavedAddress(userId, dto, true);
  }

  serializeAddress(address: AddressWithRelations | null) {
    if (!address) {
      return null;
    }

    return {
      id: address.id,
      deliveryCountryId: address.deliveryCity?.countryId ?? null,
      deliveryCityId: address.deliveryCityId,
      fullName: address.fullName,
      phone: address.phone,
      region: address.region,
      postalCode: address.postalCode,
      line1: address.line1,
      line2: address.line2,
      countryCode: address.countryCode,
      city: address.city,
      isDefault: address.isDefault
    };
  }

  private async findEditableAddress(userId: string, addressId: string) {
    const address = await this.prisma.shippingAddress.findFirst({
      where: {
        id: addressId,
        userId,
        type: 'SHIPPING',
        shippingOrders: { none: {} },
        billingOrders: { none: {} }
      }
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  private async resolveDeliveryCity(countryId: string, cityId: string) {
    const deliveryCity = await this.prisma.deliveryCity.findUnique({
      where: { id: cityId },
      include: { country: true }
    });

    if (!deliveryCity || deliveryCity.countryId !== countryId) {
      throw new BadRequestException('Invalid delivery city for selected country');
    }

    return deliveryCity;
  }

  private async resolveShippingZone(countryCode: string) {
    return this.prisma.shippingZone.findFirst({
      where: { countryCode, isActive: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  private async clearDefaultAddresses(userId: string) {
    await this.prisma.shippingAddress.updateMany({
      where: {
        userId,
        type: 'SHIPPING',
        isDefault: true,
        shippingOrders: { none: {} },
        billingOrders: { none: {} }
      },
      data: { isDefault: false }
    });
  }
}

export type SerializedAddress = NonNullable<ReturnType<AddressesService['serializeAddress']>>;
