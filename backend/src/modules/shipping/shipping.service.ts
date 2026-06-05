import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_INTERNATIONAL_ZONE,
  GEORGIA_SHIPPING,
  INTERNATIONAL_SHIPPING_BASE,
  INTERNATIONAL_ZONE_PRICES,
  type ShippingMethodConfig,
  type ShippingProviderKey
} from './shipping.constants';

export type ShippingType = 'GEORGIA' | 'INTERNATIONAL';

export type ShippingQuote = {
  shippingType: ShippingType;
  providerKey: ShippingProviderKey;
  provider: string;
  shippingZone: {
    id: string;
    code: string;
    name: string;
    countryCode: string;
    basePrice: { toNumber(): number };
    minDeliveryDays: number | null;
    maxDeliveryDays: number | null;
  };
  shippingCost: number;
  deliveryDays: { min: number | null; max: number | null };
};

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  listOptions() {
    return [
      {
        type: GEORGIA_SHIPPING.type,
        providerKey: GEORGIA_SHIPPING.providerKey,
        provider: GEORGIA_SHIPPING.provider,
        description:
          'Nationwide delivery across Georgia through the national postal network. Ideal for local orders from our Tbilisi gallery.',
        countryCode: GEORGIA_SHIPPING.countryCode,
        estimatedDays: {
          min: GEORGIA_SHIPPING.minDeliveryDays,
          max: GEORGIA_SHIPPING.maxDeliveryDays
        }
      },
      {
        type: INTERNATIONAL_SHIPPING_BASE.type,
        providerKey: INTERNATIONAL_SHIPPING_BASE.providerKey,
        provider: INTERNATIONAL_SHIPPING_BASE.provider,
        description:
          'Recommended for overseas orders: express delivery, full tracking, and dependable customs handling for valuable hand-woven carpets.',
        countryCode: null,
        estimatedDays: {
          min: INTERNATIONAL_SHIPPING_BASE.minDeliveryDays,
          max: INTERNATIONAL_SHIPPING_BASE.maxDeliveryDays
        }
      }
    ];
  }

  async calculate(type: ShippingType, countryCode: string): Promise<ShippingQuote> {
    const normalizedCountry = countryCode.toUpperCase();

    if (type === 'GEORGIA') {
      if (normalizedCountry !== 'GE') {
        throw new BadRequestException('Georgian Post delivery is only available for addresses in Georgia (GE).');
      }

      const zone = await this.ensureZone(GEORGIA_SHIPPING);

      return {
        shippingType: 'GEORGIA',
        providerKey: GEORGIA_SHIPPING.providerKey,
        provider: GEORGIA_SHIPPING.provider,
        shippingZone: zone,
        shippingCost: GEORGIA_SHIPPING.basePrice,
        deliveryDays: {
          min: GEORGIA_SHIPPING.minDeliveryDays,
          max: GEORGIA_SHIPPING.maxDeliveryDays
        }
      };
    }

    if (normalizedCountry === 'GE') {
      throw new BadRequestException('Use Georgian Post for deliveries within Georgia.');
    }

    const zoneConfig = INTERNATIONAL_ZONE_PRICES[normalizedCountry] ?? DEFAULT_INTERNATIONAL_ZONE;
    const method: ShippingMethodConfig = {
      ...INTERNATIONAL_SHIPPING_BASE,
      zoneCode: zoneConfig.code,
      zoneName: zoneConfig.name,
      countryCode: normalizedCountry,
      basePrice: zoneConfig.basePrice
    };

    const zone = await this.ensureZone(method);

    return {
      shippingType: 'INTERNATIONAL',
      providerKey: INTERNATIONAL_SHIPPING_BASE.providerKey,
      provider: INTERNATIONAL_SHIPPING_BASE.provider,
      shippingZone: zone,
      shippingCost: zoneConfig.basePrice,
      deliveryDays: {
        min: INTERNATIONAL_SHIPPING_BASE.minDeliveryDays,
        max: INTERNATIONAL_SHIPPING_BASE.maxDeliveryDays
      }
    };
  }

  private ensureZone(input: ShippingMethodConfig) {
    return this.prisma.shippingZone.upsert({
      where: { code: input.zoneCode },
      update: {
        name: input.zoneName,
        countryCode: input.countryCode,
        basePrice: input.basePrice,
        minDeliveryDays: input.minDeliveryDays,
        maxDeliveryDays: input.maxDeliveryDays,
        isActive: true
      },
      create: {
        code: input.zoneCode,
        name: input.zoneName,
        countryCode: input.countryCode,
        basePrice: input.basePrice,
        minDeliveryDays: input.minDeliveryDays,
        maxDeliveryDays: input.maxDeliveryDays,
        isActive: true
      }
    });
  }
}
