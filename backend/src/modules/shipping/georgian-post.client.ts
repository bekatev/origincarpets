import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import {
  DEFAULT_PACKAGE_HEIGHT_CM,
  DEFAULT_PRODUCT_LENGTH_CM,
  DEFAULT_PRODUCT_WIDTH_CM,
  DEFAULT_PRODUCT_WEIGHT_KG,
  GPOST_CURRENCIES,
  GPOST_DECLARATION_ITEMS,
  GPOST_DELIVERY_METHODS,
  GPOST_LOCAL_DELIVERY_METHOD,
  GPOST_METHODS_BY_ID,
  GPOST_PAYMENT_METHODS,
  GPOST_RECEIVER_TYPES,
  type GpostDeliveryMethodKey
} from './georgian-post.constants';

type GpostCountry = {
  CountryId: number;
  CountryNameGe: string;
  CountryNameEn: string;
  CountryAB: string;
};

type GpostCity = {
  CityId: number;
  CityNameGe: string;
  CityNameEn: string;
};

type GpostParcelService = {
  parcelTypeId: number;
};

export type GpostPriceInput = {
  parcelTypeId: number;
  receiverCityGpostId: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  supportsLocal: boolean;
};

export type GpostRegisterParcelInput = {
  parcelTypeId: number;
  receiverCityGpostId: number;
  receiverAddressNote: string;
  zipCode: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  supportsLocal: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  itemCount: number;
  itemValueUsd: number;
};

@Injectable()
export class GeorgianPostClient {
  private readonly logger = new Logger(GeorgianPostClient.name);
  private readonly client: AxiosInstance | null;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    const resourceUrl = config.get<string>('GPOST_API_URL', 'https://istore.gpost.ge/api/');
    const username = config.get<string>('GPOST_USERNAME');
    const password = config.get<string>('GPOST_PASSWORD');
    this.enabled = Boolean(username && password);

    if (!this.enabled) {
      this.client = null;
      this.logger.warn('Georgian Post credentials missing — shipping quotes will use fallback estimates');
      return;
    }

    this.client = axios.create({
      baseURL: resourceUrl,
      auth: { username: username!, password: password! },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 30_000
    });
  }

  isConfigured() {
    return this.enabled;
  }

  async fetchCountries(): Promise<GpostCountry[]> {
    const response = await this.request<{ Countries: GpostCountry[] }>('GET', '/Countries');
    return response?.Countries ?? [];
  }

  async fetchCities(countryGpostId: number): Promise<GpostCity[]> {
    const response = await this.request<{ Cities: GpostCity[] }>(
      'GET',
      `/Cities?countryId=${countryGpostId}`
    );
    return response?.Cities ?? [];
  }

  async fetchParcelTypesByCountry(countryGpostId: number): Promise<GpostParcelService[]> {
    const response = await this.request<{ availableServices: GpostParcelService[] }>(
      'GET',
      `/Service?countryId=${countryGpostId}`
    );
    return response?.availableServices ?? [];
  }

  async fetchPrice(input: GpostPriceInput): Promise<{ priceGel: number | null; error?: string }> {
    const data: Record<string, unknown> = {
      ParcelTypeId: input.parcelTypeId,
      ReceiverCityId: input.receiverCityGpostId,
      Weight: input.weightKg,
      X: this.toGpostMetres(input.lengthCm),
      Y: this.toGpostMetres(input.widthCm),
      Z: this.toGpostMetres(input.heightCm),
      Insurance: { IsInsured: false },
      isHand2Hand: false
    };

    if (input.supportsLocal) {
      data.IsExpress = false;
      data.deliveryMethod = GPOST_LOCAL_DELIVERY_METHOD;
    }

    try {
      const response = await this.request<{ Price?: number; Status?: { Code?: string } }>(
        'POST',
        '/Price',
        data
      );
      const price = response?.Price;
      const statusCode = response?.Status?.Code;

      if (!price || statusCode !== '200') {
        return { priceGel: null, error: 'gpost-price-unavailable' };
      }

      return { priceGel: Number(price) };
    } catch (error) {
      this.logger.error('Georgian Post price request failed', error);
      return { priceGel: null, error: 'gpost-error' };
    }
  }

  async registerParcel(input: GpostRegisterParcelInput): Promise<{
    success: boolean;
    parcelInternalCode?: string;
    parcelTrackingNumber?: string;
    error?: string;
  }> {
    const data: Record<string, unknown> = {
      ParcelTypeId: input.parcelTypeId,
      ReceiverCityId: input.receiverCityGpostId,
      ReceiverAddressNote: input.receiverAddressNote,
      ZIP: input.zipCode,
      Weight: input.weightKg,
      X: this.toGpostMetres(input.lengthCm),
      Y: this.toGpostMetres(input.widthCm),
      Z: this.toGpostMetres(input.heightCm),
      Quantity: 1,
      Insurance: { IsInsured: false },
      ReceiverPerson: {
        PersonTypeId: GPOST_RECEIVER_TYPES.INDIVIDUAL,
        FirstName: input.firstName,
        LastName: input.lastName,
        OrganizationName: '',
        Phone: input.phone,
        Email: input.email
      },
      PaymentMethod: GPOST_PAYMENT_METHODS.SENDER_PAYS,
      isHand2Hand: false,
      declarationItems: [
        {
          declarationItemID: GPOST_DECLARATION_ITEMS.HOUSEHOLD_GOODS,
          currencyId: GPOST_CURRENCIES.USD,
          itemCount: input.itemCount,
          itemPrice: input.itemValueUsd,
          itemWeigth: input.weightKg
        }
      ],
      needExportDeclaration: false
    };

    if (input.supportsLocal) {
      data.IsExpress = false;
      data.deliveryMethod = GPOST_LOCAL_DELIVERY_METHOD;
    }

    try {
      const response = await this.request<{ InternalCode?: string; TrackingNumber?: string }>(
        'POST',
        '/RegisterParcel',
        data
      );

      if (response?.InternalCode) {
        return {
          success: true,
          parcelInternalCode: response.InternalCode,
          parcelTrackingNumber: response.TrackingNumber ?? response.InternalCode
        };
      }

      return { success: false, error: 'Invalid response from Georgian Post API' };
    } catch (error) {
      this.logger.error('Georgian Post register parcel failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register parcel with Georgian Post'
      };
    }
  }

  resolveMethod(methodKey: GpostDeliveryMethodKey) {
    return GPOST_DELIVERY_METHODS[methodKey];
  }

  resolveMethodByParcelTypeId(parcelTypeId: number) {
    return GPOST_METHODS_BY_ID[String(parcelTypeId)];
  }

  packageDimensions(product?: {
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
    weightKg: { toNumber(): number } | null;
  }) {
    return {
      weightKg: product?.weightKg ? Number(product.weightKg) : DEFAULT_PRODUCT_WEIGHT_KG,
      lengthCm: product?.lengthCm ?? DEFAULT_PRODUCT_LENGTH_CM,
      widthCm: product?.widthCm ?? DEFAULT_PRODUCT_WIDTH_CM,
      heightCm: product?.heightCm ?? DEFAULT_PACKAGE_HEIGHT_CM
    };
  }

  /** Georgian Post iStore API expects parcel dimensions in metres (legacy site behaviour). */
  private toGpostMetres(cm: number) {
    return Math.round((cm / 100) * 100) / 100;
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    const response =
      method === 'GET'
        ? await this.client.get<T>(path)
        : await this.client.post<T>(path, body);

    return response.data;
  }
}
