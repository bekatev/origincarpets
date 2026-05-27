import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ShippingType = 'GEORGIA' | 'INTERNATIONAL';

const COUNTRY_ZONE_MAP: Record<string, { code: string; name: string; basePrice: number }> = {
  GE: { code: 'GEORGIA', name: 'Georgia Local', basePrice: 0 },
  US: { code: 'USA', name: 'United States', basePrice: 45 },
  CA: { code: 'USA', name: 'United States', basePrice: 45 },
  DE: { code: 'EU', name: 'European Union', basePrice: 30 },
  FR: { code: 'EU', name: 'European Union', basePrice: 30 },
  IT: { code: 'EU', name: 'European Union', basePrice: 30 },
  ES: { code: 'EU', name: 'European Union', basePrice: 30 },
  NL: { code: 'EU', name: 'European Union', basePrice: 30 },
  BE: { code: 'EU', name: 'European Union', basePrice: 30 },
  PL: { code: 'EU', name: 'European Union', basePrice: 30 },
  JP: { code: 'ASIA', name: 'Asia', basePrice: 55 },
  CN: { code: 'ASIA', name: 'Asia', basePrice: 55 },
  KR: { code: 'ASIA', name: 'Asia', basePrice: 55 },
  IN: { code: 'ASIA', name: 'Asia', basePrice: 55 },
  SG: { code: 'ASIA', name: 'Asia', basePrice: 55 },
  AE: { code: 'ASIA', name: 'Asia', basePrice: 55 }
};

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(type: ShippingType, countryCode: string) {
    const normalizedCountry = countryCode.toUpperCase();

    if (type === 'GEORGIA') {
      const zone = await this.ensureZone({
        code: 'GEORGIA',
        name: 'Georgia Local',
        countryCode: 'GE',
        basePrice: 0,
        minDeliveryDays: 1,
        maxDeliveryDays: 3
      });

      return {
        shippingType: 'GEORGIA' as const,
        shippingZone: zone,
        shippingCost: 0,
        provider: 'Georgian Post'
      };
    }

    const config = COUNTRY_ZONE_MAP[normalizedCountry] ?? { code: 'INTL_OTHER', name: 'International Other', basePrice: 65 };

    const zone = await this.ensureZone({
      code: config.code,
      name: config.name,
      countryCode: normalizedCountry,
      basePrice: config.basePrice,
      minDeliveryDays: 7,
      maxDeliveryDays: 21
    });

    return {
      shippingType: 'INTERNATIONAL' as const,
      shippingZone: zone,
      shippingCost: Number(zone.basePrice),
      provider: 'International Courier'
    };
  }

  private ensureZone(input: {
    code: string;
    name: string;
    countryCode: string;
    basePrice: number;
    minDeliveryDays: number;
    maxDeliveryDays: number;
  }) {
    return this.prisma.shippingZone.upsert({
      where: { code: input.code },
      update: {
        name: input.name,
        countryCode: input.countryCode,
        basePrice: input.basePrice,
        minDeliveryDays: input.minDeliveryDays,
        maxDeliveryDays: input.maxDeliveryDays,
        isActive: true
      },
      create: {
        code: input.code,
        name: input.name,
        countryCode: input.countryCode,
        basePrice: input.basePrice,
        minDeliveryDays: input.minDeliveryDays,
        maxDeliveryDays: input.maxDeliveryDays,
        isActive: true
      }
    });
  }
}
