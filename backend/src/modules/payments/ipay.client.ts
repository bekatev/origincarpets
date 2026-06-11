import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { isAxiosError, type AxiosInstance } from 'axios';

type IpayCheckoutOrder = {
  status: string;
  order_id: string;
  links: Array<{ method: string; href: string; rel?: string }>;
};

@Injectable()
export class IpayClient {
  private readonly logger = new Logger(IpayClient.name);
  private readonly enabled: boolean;
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUrl: string;

  constructor(config: ConfigService) {
    this.apiUrl = config.get<string>('IPAY_API_URL', 'https://ipay.ge/opay/api/v1');
    this.clientId = config.get<string>('IPAY_CLIENT_ID', '');
    this.clientSecret = config.get<string>('IPAY_CLIENT_SECRET', '');
    this.redirectUrl = config.get<string>('IPAY_REDIRECT_URL', '');
    this.enabled = Boolean(this.clientId && this.clientSecret && this.redirectUrl);
  }

  isConfigured() {
    return this.enabled;
  }

  async getAccessToken(): Promise<string> {
    const response = await axios.post<{ access_token: string }>(
      `${this.apiUrl}/oauth2/token`,
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        auth: { username: this.clientId, password: this.clientSecret }
      }
    );

    const token = response.data?.access_token;
    if (!token) {
      throw new Error('iPay OAuth token missing');
    }

    return token;
  }

  async createCheckoutOrder(input: {
    shopOrderId: string;
    amountGel: number;
  }): Promise<{ paymentUrl: string; trxIdentifier: string; status: string }> {
    const accessToken = await this.getAccessToken();
    const amount = String(Math.max(1, Math.round(input.amountGel)));

    try {
      const response = await this.client(accessToken).post<IpayCheckoutOrder>('/checkout/orders', {
        intent: 'CAPTURE',
        redirect_url: this.redirectUrl,
        shop_order_id: input.shopOrderId,
        capture_method: 'AUTOMATIC',
        locale: 'en-US',
        purchase_units: [
          {
            amount: {
              currency_code: 'GEL',
              value: amount
            },
            industry_type: 'ECOMMERCE'
          }
        ],
        items: [
          {
            amount,
            description: 'Origin Carpets',
            product_id: input.shopOrderId
          }
        ]
      });

      const links = response.data?.links;
      if (!Array.isArray(links) || !links.length) {
        this.logger.error('iPay checkout missing links', response.data);
        throw new BadRequestException(this.redirectRejectedMessage());
      }

      const redirect = links.find((link) => link.method === 'REDIRECT' || link.rel === 'approve');
      if (!redirect?.href) {
        this.logger.error('iPay checkout missing redirect link', response.data);
        throw new BadRequestException('iPay did not return a payment redirect URL');
      }

      return {
        status: response.data.status,
        paymentUrl: redirect.href,
        trxIdentifier: response.data.order_id
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (isAxiosError(error)) {
        this.logger.error('iPay checkout request failed', error.response?.data ?? error.message);
      }

      throw new BadRequestException(this.redirectRejectedMessage());
    }
  }

  private redirectRejectedMessage() {
    if (/localhost|127\.0\.0\.1/i.test(this.redirectUrl)) {
      return 'iPay does not accept localhost callback URLs. Set IPAY_REDIRECT_URL to your HTTPS production URL (e.g. https://origincarpets.com/api/payments/ipay/callback).';
    }

    return 'iPay rejected the payment request. Check IPAY_REDIRECT_URL is a valid HTTPS URL registered for your merchant account.';
  }

  async getOrderStatus(trxIdentifier: string) {
    const accessToken = await this.getAccessToken();
    const response = await this.client(accessToken).get(`/checkout/orders/${trxIdentifier}`);
    return response.data as {
      id: string;
      status: string;
      purchaseUnit?: { shop_order_id?: string; amount?: { value?: string; currency_code?: string } };
    };
  }

  private client(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.apiUrl,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`
      },
      timeout: 30_000
    });
  }
}
