import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GPOST_DELIVERY_METHODS,
  type GpostDeliveryMethodKey
} from './georgian-post.constants';
import { GeorgianPostClient } from './georgian-post.client';
import { PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';
import {
  DOMESTIC_DELIVERY_ONLY,
  FALLBACK_SHIPPING_USD,
  FREE_SHIPPING_COUNTRY_CODE,
  SHIPPING_PROVIDER,
  SHIPPING_PROVIDER_KEY
} from './shipping.constants';

export type ShippingQuote = {
  providerKey: typeof SHIPPING_PROVIDER_KEY;
  provider: string;
  deliveryMethod: GpostDeliveryMethodKey;
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
  shippingCostGel?: number;
  freeShipping: boolean;
  isEstimate: boolean;
  deliveryDays: { min: number | null; max: number | null };
};

@Injectable()
export class ShippingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gpost: GeorgianPostClient,
    private readonly config: ConfigService
  ) {}

  listProvider() {
    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      description: DOMESTIC_DELIVERY_ONLY
        ? 'Domestic delivery within Georgia via Georgian Post from our Tbilisi gallery. Worldwide shipping coming soon.'
        : 'Delivery worldwide through Georgian Post — domestic and international postal services from our Tbilisi gallery.'
    };
  }

  async listCountries() {
    await this.ensureCountriesSynced();
    const countries = await this.prisma.deliveryCountry.findMany({
      where: DOMESTIC_DELIVERY_ONLY ? { abbr: FREE_SHIPPING_COUNTRY_CODE } : undefined,
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

    let cities = await this.prisma.deliveryCity.findMany({
      where: { countryId: country.id },
      orderBy: { nameEn: 'asc' }
    });

    if (!cities.length) {
      await this.syncCitiesForCountry(country.id, country.gpostId);
      cities = await this.prisma.deliveryCity.findMany({
        where: { countryId: country.id },
        orderBy: { nameEn: 'asc' }
      });
    }

    return cities.map((city) => ({
      id: city.id,
      gpostId: city.gpostId,
      nameEn: city.nameEn,
      nameGe: city.nameGe
    }));
  }

  async listMethods(deliveryCountryId: string) {
    const country = await this.prisma.deliveryCountry.findUnique({
      where: { id: deliveryCountryId }
    });

    if (!country) {
      throw new NotFoundException('Delivery country not found');
    }

    this.assertDomesticDeliveryAvailable(country.abbr);

    if (DOMESTIC_DELIVERY_ONLY) {
      return [this.serializeDomesticMethod()];
    }

    if (this.gpost.isConfigured()) {
      const services = await this.gpost.fetchParcelTypesByCountry(country.gpostId);
      const methods = services
        .map((service) => this.gpost.resolveMethodByParcelTypeId(service.parcelTypeId))
        .filter((method): method is NonNullable<typeof method> => Boolean(method));

      if (methods.length) {
        return methods.map((method) => this.serializeMethod(method, country.abbr === 'GE'));
      }
    }

    const isDomestic = country.abbr === 'GE';
    const defaults = isDomestic
      ? [GPOST_DELIVERY_METHODS['CD-Parcel']]
      : Object.values(GPOST_DELIVERY_METHODS);

    return defaults.map((method) => this.serializeMethod(method, isDomestic));
  }

  async quote(input: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryCountryId: string;
    deliveryCityId: string;
    deliveryMethod: GpostDeliveryMethodKey;
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

    if (DOMESTIC_DELIVERY_ONLY && input.deliveryMethod !== 'CD-Parcel') {
      throw new BadRequestException('Only domestic delivery is available at this time');
    }

    const method = this.gpost.resolveMethod(input.deliveryMethod);
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
    let totalWeightKg = 0;
    let maxLengthCm = 0;
    let maxWidthCm = 0;
    let maxHeightCm = 0;

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const dims = this.gpost.packageDimensions(product);
      totalWeightKg += dims.weightKg * item.quantity;
      maxLengthCm = Math.max(maxLengthCm, dims.lengthCm);
      maxWidthCm = Math.max(maxWidthCm, dims.widthCm);
      maxHeightCm = Math.max(maxHeightCm, dims.heightCm);
    }

    const isDomesticGeorgia = country.abbr === FREE_SHIPPING_COUNTRY_CODE;
    const supportsLocal = isDomesticGeorgia && Boolean(method.supportsLocal);
    let shippingCostGel: number | undefined;
    let isEstimate = false;
    let shippingCostUsd = 0;

    if (this.gpost.isConfigured()) {
      const priceResult = await this.gpost.fetchPrice({
        parcelTypeId: method.gpostId,
        receiverCityGpostId: city.gpostId,
        weightKg: totalWeightKg,
        lengthCm: maxLengthCm,
        widthCm: maxWidthCm,
        heightCm: maxHeightCm,
        supportsLocal
      });

      if (priceResult.priceGel != null) {
        shippingCostGel = priceResult.priceGel;
        shippingCostUsd = this.gelToUsd(priceResult.priceGel);
      } else {
        isEstimate = true;
        shippingCostUsd = this.fallbackUsd(country.abbr);
      }
    } else {
      isEstimate = true;
      shippingCostUsd = this.fallbackUsd(country.abbr);
    }

    const freeShipping = isDomesticGeorgia;
    const customerShippingUsd = freeShipping ? 0 : shippingCostUsd;

    const zone = await this.ensureZone(country.abbr, country.nameEn, customerShippingUsd, method);

    return {
      providerKey: SHIPPING_PROVIDER_KEY,
      provider: SHIPPING_PROVIDER,
      deliveryMethod: input.deliveryMethod,
      shippingZone: zone,
      shippingCost: customerShippingUsd,
      shippingCostGel,
      freeShipping,
      isEstimate: freeShipping ? false : isEstimate,
      deliveryDays: {
        min: method.minDeliveryDays,
        max: method.maxDeliveryDays
      }
    };
  }

  async registerOrderParcel(orderId: string) {
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

    if (order.parcelInternalCode) {
      return {
        success: true as const,
        parcelInternalCode: order.parcelInternalCode,
        parcelTrackingNumber: order.parcelTrackingNumber ?? undefined
      };
    }

    if (!order.deliveryMethod || !order.gpostParcelTypeId) {
      throw new BadRequestException('Order is missing Georgian Post delivery method');
    }

    const city = order.shippingAddress.deliveryCity;
    if (!city) {
      throw new BadRequestException('Order shipping address is missing Georgian Post city');
    }

    const method = this.gpost.resolveMethod(order.deliveryMethod as GpostDeliveryMethodKey);
    const supportsLocal = city.country.abbr === 'GE' && Boolean(method?.supportsLocal);

    let totalWeightKg = 0;
    let maxLengthCm = 0;
    let maxWidthCm = 0;
    let maxHeightCm = 0;
    let itemValueUsd = 0;

    for (const item of order.items) {
      const dims = this.gpost.packageDimensions(item.product);
      totalWeightKg += dims.weightKg * item.quantity;
      maxLengthCm = Math.max(maxLengthCm, dims.lengthCm);
      maxWidthCm = Math.max(maxWidthCm, dims.widthCm);
      maxHeightCm = Math.max(maxHeightCm, dims.heightCm);
      itemValueUsd += Number(item.unitPrice) * item.quantity;
    }

    const address = order.shippingAddress;
    const nameParts = address.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const fullAddress = [
      city.country.nameEn,
      address.city,
      address.line1,
      address.line2,
      address.postalCode
    ]
      .filter(Boolean)
      .join(', ');

    const result = await this.gpost.registerParcel({
      parcelTypeId: order.gpostParcelTypeId,
      receiverCityGpostId: city.gpostId,
      receiverAddressNote: fullAddress,
      zipCode: address.postalCode ?? '',
      weightKg: totalWeightKg,
      lengthCm: maxLengthCm,
      widthCm: maxWidthCm,
      heightCm: maxHeightCm,
      supportsLocal: Boolean(supportsLocal),
      firstName,
      lastName,
      phone: address.phone ?? '',
      email: order.user.email,
      itemCount: order.items.length,
      itemValueUsd
    });

    if (result.success) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          parcelInternalCode: result.parcelInternalCode,
          parcelTrackingNumber: result.parcelTrackingNumber,
          parcelRegisteredAt: new Date(),
          parcelRegistrationError: null,
          status: order.status === 'PAID' ? 'FULFILLED' : order.status
        }
      });
    } else {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          parcelRegistrationError: result.error ?? 'Unknown Georgian Post error'
        }
      });
    }

    return result;
  }

  async syncAllCountries() {
    if (!this.gpost.isConfigured()) {
      throw new BadRequestException('Georgian Post API is not configured');
    }

    const countries = await this.gpost.fetchCountries();
    for (const item of countries) {
      await this.prisma.deliveryCountry.upsert({
        where: { gpostId: item.CountryId },
        update: {
          nameEn: item.CountryNameEn,
          nameGe: item.CountryNameGe,
          abbr: item.CountryAB
        },
        create: {
          gpostId: item.CountryId,
          nameEn: item.CountryNameEn,
          nameGe: item.CountryNameGe,
          abbr: item.CountryAB
        }
      });
    }

    return { count: countries.length };
  }

  async syncCitiesForCountry(deliveryCountryId: string, countryGpostId?: number) {
    if (!this.gpost.isConfigured()) {
      return { count: 0 };
    }

    const country =
      countryGpostId != null
        ? await this.prisma.deliveryCountry.findFirst({ where: { gpostId: countryGpostId } })
        : await this.prisma.deliveryCountry.findUnique({ where: { id: deliveryCountryId } });

    if (!country) {
      throw new NotFoundException('Delivery country not found');
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
    if (count > 0 || !this.gpost.isConfigured()) {
      return;
    }

    await this.syncAllCountries();
  }

  private assertDomesticDeliveryAvailable(countryAbbr: string) {
    if (DOMESTIC_DELIVERY_ONLY && countryAbbr !== FREE_SHIPPING_COUNTRY_CODE) {
      throw new BadRequestException('International delivery is not available yet. Worldwide shipping coming soon.');
    }
  }

  private serializeDomesticMethod() {
    const method = GPOST_DELIVERY_METHODS['CD-Parcel'];
    return {
      ...this.serializeMethod(method, true),
      label: { en: 'Domestic delivery', ge: 'შიდა მიწოდება' },
      descTop: {
        en: 'Georgian Post domestic parcel within Georgia',
        ge: 'საქართველოს ფოსტის შიდა გზავნილი საქართველოს ფარგლებში'
      },
      descBottom: {
        en: 'Free delivery · 7–21 working days',
        ge: 'უფასო მიწოდება · 7–21 სამუშაო დღე'
      },
      recommended: true
    };
  }

  private serializeMethod(
    method: (typeof GPOST_DELIVERY_METHODS)[GpostDeliveryMethodKey],
    isDomestic: boolean
  ) {
    return {
      value: method.value,
      gpostId: method.gpostId,
      label: method.label,
      descTop: method.descTop,
      descBottom: method.descBottom,
      minDeliveryDays: method.minDeliveryDays,
      maxDeliveryDays: method.maxDeliveryDays,
      recommended: isDomestic ? method.value === 'CD-Parcel' : method.value === 'EMS'
    };
  }

  private gelToUsd(gel: number) {
    const rate = Number(this.config.get<string>('GEL_PER_USD', '2.69'));
    return Math.round((gel / rate) * 100) / 100;
  }

  private fallbackUsd(countryAbbr: string) {
    return countryAbbr === 'GE' ? FALLBACK_SHIPPING_USD.domestic : FALLBACK_SHIPPING_USD.international;
  }

  private ensureZone(
    countryAbbr: string,
    countryName: string,
    basePriceUsd: number,
    method: (typeof GPOST_DELIVERY_METHODS)[GpostDeliveryMethodKey]
  ) {
    const code = `GP-${countryAbbr}-${method.value}`;
    return this.prisma.shippingZone.upsert({
      where: { code },
      update: {
        name: `${countryName} — ${method.label.en}`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays: method.minDeliveryDays,
        maxDeliveryDays: method.maxDeliveryDays,
        isActive: true
      },
      create: {
        code,
        name: `${countryName} — ${method.label.en}`,
        countryCode: countryAbbr,
        basePrice: basePriceUsd,
        minDeliveryDays: method.minDeliveryDays,
        maxDeliveryDays: method.maxDeliveryDays,
        isActive: true
      }
    });
  }
}
