import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';
import { GeorgianPostClient } from './georgian-post.client';
import {
  internationalCityGpostId,
  UPS_DELIVERY_COUNTRIES,
  UPS_INTERNATIONAL_CITY
} from './delivery-countries.seed';
import {
  FREE_SHIPPING_COUNTRY_CODE,
  isDomesticDeliveryOnly,
  isShippingLive,
  SHIPPING_PROVIDER,
  SHIPPING_PROVIDER_KEY
} from './shipping.constants';
import { combineOrderPackage } from './package-dimensions.util';
import {
  UPS_DELIVERY_METHODS,
  UPS_DOMESTIC_METHOD,
  type UpsDeliveryMethodKey
} from './ups.constants';
import { quoteUpsRate } from './ups-rate-calculator';

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
    billableWeightKg: number;
  };
};

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly domesticOnly: boolean;
  private readonly shippingLive: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gpost: GeorgianPostClient,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {
    this.shippingLive = isShippingLive();
    this.domesticOnly = isDomesticDeliveryOnly();
  }

  listProvider() {
    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      live: this.shippingLive,
      domesticOnly: this.domesticOnly,
      manualFulfillment: true,
      description: this.domesticOnly
        ? 'Domestic delivery within Georgia via UPS from our Tbilisi gallery. Worldwide shipping coming soon.'
        : 'Delivery worldwide through UPS — domestic and international from our Tbilisi gallery.'
    };
  }

  async listCountries() {
    await this.ensureCountriesSynced();
    const countries = await this.prisma.deliveryCountry.findMany({
      where: this.domesticOnly ? { abbr: FREE_SHIPPING_COUNTRY_CODE } : undefined,
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

  async listCities(deliveryCountryId: string) {
    const country = await this.prisma.deliveryCountry.findUnique({
      where: { id: deliveryCountryId }
    });

    if (!country) {
      throw new NotFoundException('Delivery country not found');
    }

    this.assertDomesticDeliveryAvailable(country.abbr);

    if (country.abbr === FREE_SHIPPING_COUNTRY_CODE) {
      let cities = await this.prisma.deliveryCity.findMany({
        where: { countryId: country.id },
        orderBy: { nameEn: 'asc' }
      });

      if (!cities.length && this.gpost.isConfigured()) {
        await this.syncCitiesForCountry(country.id, country.gpostId);
        cities = await this.prisma.deliveryCity.findMany({
          where: { countryId: country.id },
          orderBy: { nameEn: 'asc' }
        });
      }

      if (cities.length) {
        return cities.map((city) => ({
          id: city.id,
          gpostId: city.gpostId,
          nameEn: city.nameEn,
          nameGe: city.nameGe
        }));
      }
    }

    const placeholder = await this.ensureInternationalCity({
      id: country.id,
      gpostId: country.gpostId
    });
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

    this.assertDomesticDeliveryAvailable(country.abbr);

    if (country.abbr === FREE_SHIPPING_COUNTRY_CODE) {
      return [this.serializeDomesticMethod()];
    }

    return Object.values(UPS_DELIVERY_METHODS).map((method) => ({
      ...this.serializeMethod(method),
      recommended: method.value === 'UPS_STANDARD'
    }));
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

    this.assertDomesticDeliveryAvailable(country.abbr);

    const method = UPS_DELIVERY_METHODS[input.deliveryMethod];
    if (!method) {
      throw new BadRequestException('Invalid delivery method');
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
      method: input.deliveryMethod,
      packageDimensions
    });

    const isDomesticGeorgia = country.abbr === FREE_SHIPPING_COUNTRY_CODE;
    const freeShipping = isDomesticGeorgia;
    const merchantShippingCostUsd = rate.priceUsd;
    const customerShippingUsd = freeShipping ? 0 : rate.priceUsd;

    const deliveryMeta = isDomesticGeorgia ? UPS_DOMESTIC_METHOD : method;
    const zone = await this.ensureZone(
      country.abbr,
      country.nameEn,
      customerShippingUsd,
      input.deliveryMethod,
      deliveryMeta.minDeliveryDays,
      deliveryMeta.maxDeliveryDays
    );

    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      deliveryMethod: input.deliveryMethod,
      shippingZone: zone,
      shippingCost: customerShippingUsd,
      merchantShippingCostUsd,
      freeShipping,
      isEstimate: freeShipping ? false : rate.isEstimate,
      deliveryDays: {
        min: deliveryMeta.minDeliveryDays,
        max: deliveryMeta.maxDeliveryDays
      },
      package: {
        weightKg: packageDimensions.weightKg,
        lengthCm: packageDimensions.lengthCm,
        widthCm: packageDimensions.widthCm,
        heightCm: packageDimensions.heightCm,
        billableWeightKg: rate.chargeableWeightKg
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
    const method = (order.deliveryMethod as UpsDeliveryMethodKey) ?? 'UPS_STANDARD';
    const countryAbbr = order.shippingAddress.countryCode;
    const rate = quoteUpsRate({ countryCode: countryAbbr, method, packageDimensions });

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

  async syncCitiesForCountry(deliveryCountryId: string, countryGpostId?: number) {
    if (!this.gpost.isConfigured()) {
      return { count: 0 };
    }

    const country =
      countryGpostId != null
        ? await this.prisma.deliveryCountry.findFirst({ where: { gpostId: countryGpostId } })
        : await this.prisma.deliveryCountry.findUnique({ where: { id: deliveryCountryId } });

    if (!country || country.abbr !== FREE_SHIPPING_COUNTRY_CODE) {
      return { count: 0 };
    }

    const cities = await this.gpost.fetchCities(country.gpostId);

    for (const item of cities) {
      await this.prisma.deliveryCity.upsert({
        where: { gpostId: item.CityId },
        update: {
          nameEn: item.CityNameEn,
          nameGe: item.CityNameGe,
          countryId: country.id
        },
        create: {
          gpostId: item.CityId,
          nameEn: item.CityNameEn,
          nameGe: item.CityNameGe,
          countryId: country.id
        }
      });
    }

    return { count: cities.length };
  }

  private async ensureCountriesSynced() {
    const count = await this.prisma.deliveryCountry.count();
    if (count > 0) {
      return;
    }

    await this.syncAllCountries();
  }

  private async ensureInternationalCity(country: { id: string; gpostId: number }) {
    const gpostId = internationalCityGpostId(country.gpostId);
    const existing = await this.prisma.deliveryCity.findFirst({
      where: { countryId: country.id, gpostId }
    });

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

  private assertDomesticDeliveryAvailable(countryAbbr: string) {
    if (this.domesticOnly && countryAbbr !== FREE_SHIPPING_COUNTRY_CODE) {
      throw new BadRequestException(
        'International delivery is not available yet. Worldwide shipping coming soon.'
      );
    }
  }

  private serializeDomesticMethod() {
    return {
      value: UPS_DOMESTIC_METHOD.value,
      label: UPS_DOMESTIC_METHOD.label,
      descTop: UPS_DOMESTIC_METHOD.descTop,
      descBottom: {
        en: 'Free delivery · 2–4 business days',
        ge: 'უფასო მიწოდება · 2–4 სამუშაო დღე'
      },
      minDeliveryDays: UPS_DOMESTIC_METHOD.minDeliveryDays,
      maxDeliveryDays: UPS_DOMESTIC_METHOD.maxDeliveryDays,
      recommended: true
    };
  }

  private serializeMethod(method: (typeof UPS_DELIVERY_METHODS)[UpsDeliveryMethodKey]) {
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
    method: UpsDeliveryMethodKey,
    minDeliveryDays: number,
    maxDeliveryDays: number
  ) {
    const methodLabel = UPS_DELIVERY_METHODS[method]?.label.en ?? method;
    const code = `UPS-${countryAbbr}-${method}`;
    return this.prisma.shippingZone.upsert({
      where: { code },
      update: {
        name: `${countryName} — ${methodLabel}`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays,
        maxDeliveryDays,
        isActive: true
      },
      create: {
        code,
        name: `${countryName} — ${methodLabel}`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays,
        maxDeliveryDays,
        isActive: true
      }
    });
  }
}
