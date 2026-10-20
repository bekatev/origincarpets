import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderAttribution } from '../orders/order-attribution';

type PurchaseInput = {
  /** Meta event_id — must match browser Pixel for dedup (order cuid). */
  eventId: string;
  orderNumber: string;
  value: number;
  currency: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
  countryCode?: string | null;
  city?: string | null;
  postalCode?: string | null;
  attribution?: OrderAttribution | null;
  contentIds: string[];
  contents: Array<{ id: string; quantity: number; item_price: number }>;
};

/**
 * Meta Conversions API — server-side Purchase when an order is marked PAID.
 * Survives Instagram/Facebook in-app browsers where sessionStorage is lost.
 */
@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);
  private readonly apiVersion = 'v21.0';

  constructor(private readonly config: ConfigService) {}

  private pixelId(): string {
    return (
      this.config.get<string>('NEXT_PUBLIC_META_PIXEL_ID')?.trim() ||
      this.config.get<string>('META_PIXEL_ID')?.trim() ||
      ''
    );
  }

  private accessToken(): string {
    return this.config.get<string>('META_CAPI_ACCESS_TOKEN')?.trim() || '';
  }

  private testEventCode(): string {
    return this.config.get<string>('META_CAPI_TEST_EVENT_CODE')?.trim() || '';
  }

  private frontendUrl(): string {
    const raw = (this.config.get<string>('FRONTEND_URL') || '').replace(/\/$/, '');
    if (/localhost|127\.0\.0\.1/i.test(raw)) return raw || 'https://origincarpets.com';
    return 'https://origincarpets.com';
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  /** Meta's documented fbc format when the _fbc cookie is missing but we kept the fbclid. */
  private resolveFbc(attribution?: OrderAttribution | null): string | undefined {
    if (attribution?.fbc) return attribution.fbc;
    if (attribution?.fbclid) {
      const clickedAt = attribution.fbclidAt ?? attribution.capturedAt ?? Date.now();
      return `fb.1.${clickedAt}.${attribution.fbclid}`;
    }
    return undefined;
  }

  async sendPurchase(input: PurchaseInput): Promise<void> {
    const pixelId = this.pixelId();
    const token = this.accessToken();
    if (!pixelId || !token) {
      return;
    }

    const consent = input.attribution?.consent;
    if (consent === 'rejected' || consent === 'pending') {
      this.logger.log(`Meta CAPI Purchase skipped for ${input.orderNumber}: consent ${consent}`);
      return;
    }

    const userData: Record<string, string> = {};
    if (input.email?.includes('@')) {
      userData.em = this.sha256(input.email);
    }
    if (input.phone) {
      const digits = this.normalizePhone(input.phone);
      if (digits.length >= 8) {
        userData.ph = this.sha256(digits);
      }
    }
    if (input.firstName?.trim()) userData.fn = this.sha256(input.firstName);
    if (input.lastName?.trim()) userData.ln = this.sha256(input.lastName);
    if (input.externalId) userData.external_id = this.sha256(input.externalId);
    if (input.countryCode?.trim()) userData.country = this.sha256(input.countryCode);
    if (input.city?.trim()) userData.ct = this.sha256(input.city.replace(/\s+/g, ''));
    if (input.postalCode?.trim()) userData.zp = this.sha256(input.postalCode.replace(/\s+/g, ''));

    const attribution = input.attribution;
    const fbc = this.resolveFbc(attribution);
    if (fbc) userData.fbc = fbc;
    if (attribution?.fbp) userData.fbp = attribution.fbp;
    if (attribution?.clientIp) userData.client_ip_address = attribution.clientIp;
    if (attribution?.userAgent) userData.client_user_agent = attribution.userAgent;

    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: `${this.frontendUrl()}/checkout`,
      user_data: userData,
      custom_data: {
        content_ids: input.contentIds,
        content_type: 'product',
        value: input.value,
        currency: input.currency || 'USD',
        order_id: input.orderNumber,
        contents: input.contents
      }
    };

    const payload: Record<string, unknown> = { data: [event] };
    const testCode = this.testEventCode();
    if (testCode) {
      payload.test_event_code = testCode;
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        this.logger.warn(`Meta CAPI Purchase failed for ${input.orderNumber}: ${res.status} ${JSON.stringify(json)}`);
        return;
      }
      this.logger.log(`Meta CAPI Purchase sent for ${input.orderNumber}`);
    } catch (error) {
      this.logger.error(
        `Meta CAPI Purchase error for ${input.orderNumber}`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
