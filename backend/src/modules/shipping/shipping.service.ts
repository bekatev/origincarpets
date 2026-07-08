import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';
import {
  UPS_DELIVERY_COUNTRIES,
  UPS_INTERNATIONAL_CITY,
  placeholderCityGpostId
} from './delivery-countries.seed';
import {
  FREE_SHIPPING_COUNTRY_CODE,
  SHIPPING_PROVIDER,
  SHIPPING_PROVIDER_KEY
} from './shipping.constants';
import { combineOrderPackage } from './package-dimensions.util';
import {
  UPS_DOMESTIC_METHOD,
  UPS_WORLDWIDE_METHOD,
  type UpsDeliveryMethod,
  type UpsDeliveryMethodKey
} from './ups.constants';
import { quoteUpsRate } from './ups-rate-calculator';
import { DEFAULT_USD_PER_EUR } from './ups-rates.config';

export type ShippingQuote = {
  providerKey: typeof SHIPPING_PROVIDER_KEY;
  provider: string;
  deliveryMethod: UpsDeliveryMethodKey;
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
  merchantShippingCostUsd?: number;
  freeShipping: boolean;
  isEstimate: boolean;
  deliveryDays: { min: number | null; max: number | null };
  package: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    chargeableWeightKg: number;
    perKgUsd: number;
  };
};

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  private usdPerEur() {
    return Number(this.config.get<string>('USD_PER_EUR', String(DEFAULT_USD_PER_EUR)));
  }

  private gelPerUsd() {
    return Number(this.config.get<string>('GEL_PER_USD', '2.69'));
  }

  listProvider() {
    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      live: true,
      domesticOnly: false,
      manualFulfillment: true,
      description: 'Worldwide delivery through UPS — domestic and international from our Tbilisi gallery.'
    };
  }

  async listCountries() {
    await this.ensureCountriesSynced();
    const countries = await this.prisma.deliveryCountry.findMany({
      orderBy: { nameEn: 'asc' }
    });

    return countries.map((country) => ({
      id: country.id,
      gpostId: country.gpostId,
      abbr: country.abbr,
      nameEn: country.nameEn,
      nameGe: country.nameGe
    }));
  }

  /** Customers type their own city, so every country returns a single placeholder. */
  async listCities(deliveryCountryId: string) {
    const country = await this.prisma.deliveryCountry.findUnique({
      where: { id: deliveryCountryId }
    });

    if (!country) {
      throw new NotFoundException('Delivery country not found');
    }

    const placeholder = await this.ensureInternationalCity(country);
    return [
      {
        id: placeholder.id,
        gpostId: placeholder.gpostId,
        nameEn: placeholder.nameEn,
        nameGe: placeholder.nameGe
      }
    ];
  }

  async listMethods(deliveryCountryId: string) {
    const country = await this.prisma.deliveryCountry.findUnique({
      where: { id: deliveryCountryId }
    });

    if (!country) {
      throw new NotFoundException('Delivery country not found');
    }

    const method = country.abbr === FREE_SHIPPING_COUNTRY_CODE ? UPS_DOMESTIC_METHOD : UPS_WORLDWIDE_METHOD;
    return [{ ...this.serializeMethod(method), recommended: true }];
  }

  async quote(input: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryCountryId: string;
    deliveryCityId: string;
    deliveryMethod: UpsDeliveryMethodKey;
  }): Promise<ShippingQuote> {
    const country = await this.prisma.deliveryCountry.findUnique({
      where: { id: input.deliveryCountryId }
    });
    const city = await this.prisma.deliveryCity.findUnique({
      where: { id: input.deliveryCityId }
    });

    if (!country || !city || city.countryId !== country.id) {
      throw new BadRequestException('Invalid delivery country or city');
    }

    const productIds = input.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, ...PUBLIC_SHIPPABLE_PRODUCT_WHERE }
    });

    if (products.length !== new Set(productIds).size) {
      throw new BadRequestException('One or more products are unavailable for shipping quote');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems = input.items
      .map((item) => {
        const product = productMap.get(item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const packageDimensions = combineOrderPackage(lineItems);
    const rate = quoteUpsRate({
      countryCode: country.abbr,
      packageDimensions,
      usdPerEur: this.usdPerEur()
    });

    const customerShippingUsd = rate.priceUsd;
    const deliveryMeta = rate.freeShipping ? UPS_DOMESTIC_METHOD : UPS_WORLDWIDE_METHOD;
    const zone = await this.ensureZone(
      country.abbr,
      country.nameEn,
      customerShippingUsd,
      deliveryMeta.minDeliveryDays,
      deliveryMeta.maxDeliveryDays
    );

    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      deliveryMethod: 'UPS_WORLDWIDE',
      shippingZone: zone,
      shippingCost: customerShippingUsd,
      merchantShippingCostUsd: customerShippingUsd,
      freeShipping: rate.freeShipping,
      isEstimate: false,
      deliveryDays: {
        min: deliveryMeta.minDeliveryDays,
        max: deliveryMeta.maxDeliveryDays
      },
      package: {
        weightKg: packageDimensions.weightKg,
        lengthCm: packageDimensions.lengthCm,
        widthCm: packageDimensions.widthCm,
        heightCm: packageDimensions.heightCm,
        chargeableWeightKg: rate.chargeableWeightKg,
        perKgUsd: rate.perKgUsd
      }
    };
  }

  /** Notify gallery staff to create the UPS shipment manually (no carrier API). */
  async notifyAdminsForPaidOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shippingAddress: { include: { deliveryCity: { include: { country: true } } } },
        items: { include: { product: true } }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.shipmentNotifiedAt) {
      return { success: true as const, alreadyNotified: true };
    }

    const packageDimensions = combineOrderPackage(
      order.items.map((item) => ({ product: item.product, quantity: item.quantity }))
    );
    const rate = quoteUpsRate({
      countryCode: order.shippingAddress.countryCode,
      packageDimensions,
      usdPerEur: this.usdPerEur()
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        shippingProvider: SHIPPING_PROVIDER_KEY,
        billableWeightKg: rate.chargeableWeightKg,
        packageLengthCm: packageDimensions.lengthCm,
        packageWidthCm: packageDimensions.widthCm,
        packageHeightCm: packageDimensions.heightCm
      }
    });

    try {
      await this.mail.sendAdminShipmentRequestEmail({
        order,
        packageDimensions,
        billableWeightKg: rate.chargeableWeightKg,
        estimatedMerchantCostUsd: rate.priceUsd
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: { shipmentNotifiedAt: new Date() }
      });

      return { success: true as const, alreadyNotified: false };
    } catch (error) {
      this.logger.error(`Failed to notify admins for order ${orderId}`, error);
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to send admin notification'
      };
    }
  }

  async updateTrackingNumber(orderId: string, trackingNumber: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        parcelTrackingNumber: trackingNumber.trim(),
        status: order.status === 'PAID' ? 'SHIPPED' : order.status
      },
      select: {
        id: true,
        orderNumber: true,
        parcelTrackingNumber: true,
        status: true
      }
    });
  }

  async syncAllCountries() {
    let count = 0;
    for (const item of UPS_DELIVERY_COUNTRIES) {
      await this.prisma.deliveryCountry.upsert({
        where: { gpostId: item.gpostId },
        update: {
          nameEn: item.nameEn,
          nameGe: item.nameGe,
          abbr: item.abbr
        },
        create: {
          gpostId: item.gpostId,
          nameEn: item.nameEn,
          nameGe: item.nameGe,
          abbr: item.abbr
        }
      });
      count += 1;
    }

    return { count };
  }

  private async ensureCountriesSynced() {
    const count = await this.prisma.deliveryCountry.count();
    if (count > 0) {
      return;
    }

    await this.syncAllCountries();
  }

  private async ensureInternationalCity(country: { id: string; gpostId: number }) {
    const gpostId = placeholderCityGpostId(country.gpostId);
    const existing = await this.prisma.deliveryCity.findUnique({ where: { gpostId } });

    if (existing) {
      return existing;
    }

    return this.prisma.deliveryCity.create({
      data: {
        gpostId,
        nameEn: UPS_INTERNATIONAL_CITY.nameEn,
        nameGe: UPS_INTERNATIONAL_CITY.nameGe,
        countryId: country.id
      }
    });
  }

  private serializeMethod(method: UpsDeliveryMethod) {
    return {
      value: method.value,
      label: method.label,
      descTop: method.descTop,
      descBottom: method.descBottom,
      minDeliveryDays: method.minDeliveryDays,
      maxDeliveryDays: method.maxDeliveryDays
    };
  }

  private ensureZone(
    countryAbbr: string,
    countryName: string,
    basePriceUsd: number,
    minDeliveryDays: number,
    maxDeliveryDays: number
  ) {
    const code = `UPS-${countryAbbr}`;
    return this.prisma.shippingZone.upsert({
      where: { code },
      update: {
        name: `${countryName} — UPS`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays,
        maxDeliveryDays,
        isActive: true
      },
      create: {
        code,
        name: `${countryName} — UPS`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays,
        maxDeliveryDays,
        isActive: true
      }
    });
  }
}
