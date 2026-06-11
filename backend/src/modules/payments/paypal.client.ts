import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalClient {
  private readonly enabled: boolean;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiBase: string;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('PAYPAL_CLIENT_ID', '');
    this.clientSecret = config.get<string>('PAYPAL_CLIENT_SECRET', '');
    const mode = config.get<string>('PAYPAL_MODE', 'sandbox');
    this.apiBase =
      mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    this.enabled = Boolean(this.clientId && this.clientSecret);
  }

  isConfigured() {
    return this.enabled;
  }

  getClientId() {
    return this.clientId;
  }

  private async accessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post<{ access_token: string }>(
      `${this.apiBase}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = response.data?.access_token;
    if (!token) {
      throw new Error('PayPal OAuth token missing');
    }

    return token;
  }

  async createOrder(input: { orderId: string; orderNumber: string; amountUsd: number }) {
    const token = await this.accessToken();
    const value = input.amountUsd.toFixed(2);

    const response = await axios.post<{ id: string }>(
      `${this.apiBase}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.orderId,
            custom_id: input.orderNumber,
            amount: {
              currency_code: 'USD',
              value
            }
          }
        ]
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return { paypalOrderId: response.data.id };
  }

  async captureOrder(paypalOrderId: string) {
    const token = await this.accessToken();
    const response = await axios.post<{
      id: string;
      status: string;
      purchase_units?: Array<{ payments?: { captures?: Array<{ id: string }> } }>;
    }>(
      `${this.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const captureId = response.data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    return {
      status: response.data.status,
      captureId: captureId ?? null
    };
  }
}
