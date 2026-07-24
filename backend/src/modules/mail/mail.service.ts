import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type OrderConfirmationInput = {
  to: string;
  customerName: string;
  orderNumber: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  deliveryMethod: string | null;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string | null;
    country: string;
    phone: string | null;
  };
  /** Prefer order lookup for guests; My Orders for registered customers. */
  isGuest?: boolean;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly resendApiKey: string | null;
  private readonly relayUrl: string | null;
  private readonly relaySecret: string | null;
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'Origin Carpets <noreply.origincarpets@gmail.com>');
    this.resendApiKey = config.get<string>('RESEND_API_KEY') ?? null;
    this.relayUrl = config.get<string>('MAIL_RELAY_URL') ?? null;
    this.relaySecret = config.get<string>('MAIL_RELAY_SECRET') ?? null;

    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT', '587'));
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000
      });
    } else {
      this.transporter = null;
    }

    if (!this.resendApiKey && !this.relayUrl && !this.transporter) {
      this.logger.warn('Mail not configured — transactional emails will fail until transport is set');
    } else if (this.resendApiKey) {
      this.logger.log('Mail transport: Resend API');
    } else if (this.relayUrl) {
      this.logger.log('Mail transport: HTTPS relay');
    } else {
      this.logger.log('Mail transport: SMTP');
    }
  }

  private frontendUrl() {
    return (this.config.get<string>('FRONTEND_URL') ?? 'https://origincarpets.com').replace(/\/$/, '');
  }

  private logoUrl() {
    return `${this.frontendUrl()}/brand/logo-full.png`;
  }

  private money(amount: number, currency = 'USD') {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Shared branded HTML shell for customer-facing mail. */
  private brandedHtml(input: {
    preheader: string;
    heading: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }) {
    const logo = this.logoUrl();
    const shopUrl = `${this.frontendUrl()}/products`;
    const cta =
      input.ctaLabel && input.ctaUrl
        ? `<tr>
            <td style="padding:28px 0 8px;">
              <a href="${input.ctaUrl}" style="display:inline-block;background:#342827;color:#f6eee8;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;">
                ${this.escapeHtml(input.ctaLabel)}
              </a>
            </td>
          </tr>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Origin Carpets</title>
</head>
<body style="margin:0;padding:0;background:#c5ae8e;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${this.escapeHtml(input.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#c5ae8e;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#d2bea0;border:1px solid #a89272;">
          <tr>
            <td style="padding:28px 32px 12px;text-align:center;border-bottom:1px solid #a89272;">
              <img src="${logo}" alt="Origin Carpets" width="180" style="display:inline-block;max-width:180px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;font-family:Georgia,'Times New Roman',serif;color:#342827;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:normal;letter-spacing:0.02em;line-height:1.3;">
                ${this.escapeHtml(input.heading)}
              </h1>
              <div style="font-size:15px;line-height:1.7;color:#5c4a42;">
                ${input.bodyHtml}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0">${cta}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px;border-top:1px solid #a89272;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5c4a42;text-align:center;">
              <p style="margin:0 0 8px;">Origin Carpets · Finest Caucasian and Oriental Carpets</p>
              <p style="margin:0 0 8px;">
                <a href="${shopUrl}" style="color:#342827;">Shop the collection</a>
                &nbsp;·&nbsp;
                <a href="mailto:info@origincarpets.com" style="color:#342827;">info@origincarpets.com</a>
              </p>
              <p style="margin:0;">8/10 Erekle II street, Tbilisi, Georgia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private adminOrderEmails(): string[] {
    const raw = this.config.get<string>(
      'ADMIN_ORDER_EMAILS',
      'bekatevd@gmail.com,gallerycarpets19@gmail.com'
    );
    return raw
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
  }

  async sendWelcomeEmail(input: {
    to: string;
    firstName?: string | null;
  }): Promise<void> {
    const name = input.firstName?.trim() || 'there';
    const shopUrl = `${this.frontendUrl()}/products`;
    const accountUrl = `${this.frontendUrl()}/orders`;

    const subject = 'Welcome to Origin Carpets';
    const text = [
      `Welcome to Origin Carpets, ${name}.`,
      '',
      'Your account has been created successfully.',
      'You can now browse our collection of Caucasian and Oriental carpets, save favourites, and check out securely.',
      '',
      `Shop: ${shopUrl}`,
      `Your orders: ${accountUrl}`,
      '',
      'If you have any questions, reply to this email or write to info@origincarpets.com.',
      '',
      '— Origin Carpets, Tbilisi'
    ].join('\n');

    const html = this.brandedHtml({
      preheader: 'Your Origin Carpets account is ready.',
      heading: `Welcome, ${name}`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Thank you for registering with Origin Carpets. Your account is ready.</p>
        <p style="margin:0 0 14px;">Explore our curated collection of Caucasian and Oriental carpets — antique and contemporary pieces chosen for craftsmanship, colour, and story.</p>
        <p style="margin:0;">Questions? Write to us at <a href="mailto:info@origincarpets.com" style="color:#342827;">info@origincarpets.com</a>.</p>
      `,
      ctaLabel: 'Explore the collection',
      ctaUrl: shopUrl
    });

    await this.sendMail({ to: input.to, subject, text, html });
    this.logger.log(`Welcome email sent to ${input.to}`);
  }

  async sendOrderConfirmationEmail(input: OrderConfirmationInput): Promise<void> {
    const lookupUrl = `${this.frontendUrl()}/order-lookup?order=${encodeURIComponent(input.orderNumber)}&email=${encodeURIComponent(input.to)}`;
    const ordersUrl = input.isGuest ? lookupUrl : `${this.frontendUrl()}/orders`;
    const ctaLabel = input.isGuest ? 'Look up your order' : 'View your order';
    const addressLines = [
      input.shippingAddress.fullName,
      input.shippingAddress.line1,
      input.shippingAddress.line2,
      [input.shippingAddress.city, input.shippingAddress.region].filter(Boolean).join(', '),
      input.shippingAddress.postalCode,
      input.shippingAddress.country,
      input.shippingAddress.phone ? `Phone: ${input.shippingAddress.phone}` : null
    ].filter(Boolean) as string[];

    const itemLines = input.items.map(
      (item) =>
        `${item.title} × ${item.quantity} — ${this.money(item.unitPrice * item.quantity, input.currency)}`
    );

    const subject = `Order confirmed — ${input.orderNumber}`;
    const text = [
      `Thank you for your purchase, ${input.customerName}.`,
      '',
      `Order ${input.orderNumber} has been confirmed and payment received.`,
      '',
      'Items:',
      ...itemLines.map((line) => `  - ${line}`),
      '',
      `Subtotal: ${this.money(input.subtotal, input.currency)}`,
      `Shipping: ${this.money(input.shippingCost, input.currency)}`,
      `Total: ${this.money(input.total, input.currency)}`,
      input.deliveryMethod ? `Delivery: ${input.deliveryMethod}` : '',
      '',
      'Ship to:',
      ...addressLines,
      '',
      input.isGuest
        ? `Look up your order anytime with your email and order number: ${lookupUrl}`
        : `View your order: ${ordersUrl}`,
      '',
      'We will prepare your carpets carefully and follow up with shipping details.',
      '',
      '— Origin Carpets, Tbilisi'
    ]
      .filter((line) => line !== '')
      .join('\n');

    const itemsHtml = input.items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #a89272;font-size:14px;color:#342827;">
            ${this.escapeHtml(item.title)}
            <div style="font-size:12px;color:#5c4a42;">Qty ${item.quantity}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #a89272;font-size:14px;color:#342827;text-align:right;white-space:nowrap;">
            ${this.escapeHtml(this.money(item.unitPrice * item.quantity, input.currency))}
          </td>
        </tr>`
      )
      .join('');

    const html = this.brandedHtml({
      preheader: `Order ${input.orderNumber} is confirmed.`,
      heading: 'Thank you for your order',
      bodyHtml: `
        <p style="margin:0 0 14px;">Dear ${this.escapeHtml(input.customerName)},</p>
        <p style="margin:0 0 18px;">We have received your payment. Your order <strong style="color:#342827;">${this.escapeHtml(input.orderNumber)}</strong> is confirmed.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
          ${itemsHtml}
          <tr>
            <td style="padding:12px 0 4px;font-size:13px;color:#5c4a42;">Subtotal</td>
            <td style="padding:12px 0 4px;font-size:13px;color:#5c4a42;text-align:right;">${this.escapeHtml(this.money(input.subtotal, input.currency))}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#5c4a42;">Shipping${input.deliveryMethod ? ` (${this.escapeHtml(input.deliveryMethod)})` : ''}</td>
            <td style="padding:4px 0;font-size:13px;color:#5c4a42;text-align:right;">${this.escapeHtml(this.money(input.shippingCost, input.currency))}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 0;font-size:15px;color:#342827;font-weight:bold;">Total</td>
            <td style="padding:10px 0 0;font-size:15px;color:#342827;font-weight:bold;text-align:right;">${this.escapeHtml(this.money(input.total, input.currency))}</td>
          </tr>
        </table>
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#5c4a42;">Shipping address</p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#342827;">
          ${addressLines.map((line) => this.escapeHtml(line)).join('<br />')}
        </p>
        ${
          input.isGuest
            ? `<p style="margin:0 0 18px;font-size:13px;color:#5c4a42;">Use your email and order number on our order lookup page anytime.</p>`
            : ''
        }
        <p style="margin:0;">We will prepare your carpets with care and share tracking details once the shipment is booked.</p>
      `,
      ctaLabel,
      ctaUrl: ordersUrl
    });

    await this.sendMail({ to: input.to, subject, text, html });
    this.logger.log(`Order confirmation email sent to ${input.to} for ${input.orderNumber}`);
  }

  async sendAdminShipmentRequestEmail(input: {
    order: {
      orderNumber: string;
      deliveryMethod: string | null;
      subtotal: { toNumber(): number } | number;
      shippingCost: { toNumber(): number } | number;
      total: { toNumber(): number } | number;
      currency: string;
      guestEmail?: string | null;
      user: { email: string; firstName: string | null; lastName: string | null } | null;
      shippingAddress: {
        fullName: string;
        phone: string | null;
        countryCode: string;
        city: string;
        region: string | null;
        postalCode: string | null;
        line1: string;
        line2: string | null;
        deliveryCity?: { country: { nameEn: string } } | null;
      };
      items: Array<{
        titleSnapshot: string;
        quantity: number;
        unitPrice: { toNumber(): number } | number;
        product: {
          sku: string;
          weightKg: { toNumber(): number } | null;
          lengthCm: number | null;
          widthCm: number | null;
          heightCm: number | null;
        };
      }>;
    };
    packageDimensions: {
      weightKg: number;
      lengthCm: number;
      widthCm: number;
      heightCm: number;
    };
    billableWeightKg: number;
    estimatedMerchantCostUsd: number;
  }): Promise<void> {
    const { order, packageDimensions, billableWeightKg, estimatedMerchantCostUsd } = input;
    const address = order.shippingAddress;
    const countryName = address.deliveryCity?.country.nameEn ?? address.countryCode;
    const customerEmail = order.user?.email ?? order.guestEmail ?? 'unknown';
    const customerName =
      [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ') ||
      address.fullName ||
      customerEmail;

    const lines = [
      `New paid order — create UPS shipment manually`,
      ``,
      `Order: ${order.orderNumber}`,
      `Customer: ${customerName} <${customerEmail}>${order.guestEmail && !order.user ? ' (guest)' : ''}`,
      `Service: ${order.deliveryMethod ?? 'UPS_STANDARD'}`,
      ``,
      `Ship to:`,
      `${address.fullName}`,
      `${address.line1}${address.line2 ? `, ${address.line2}` : ''}`,
      `${address.city}${address.region ? `, ${address.region}` : ''}`,
      `${address.postalCode ?? '(no postal code)'}`,
      `${countryName}`,
      `Phone: ${address.phone ?? '—'}`,
      ``,
      `Package (estimate before final packing):`,
      `  Weight: ${packageDimensions.weightKg} kg (billable: ${billableWeightKg} kg)`,
      `  Dimensions: ${packageDimensions.lengthCm} × ${packageDimensions.widthCm} × ${packageDimensions.heightCm} cm`,
      `  Estimated UPS cost: $${estimatedMerchantCostUsd.toFixed(2)}`,
      ``,
      `Order total: $${Number(order.total).toFixed(2)} (shipping charged: $${Number(order.shippingCost).toFixed(2)})`,
      ``,
      `Items:`,
      ...order.items.map(
        (item) =>
          `  - ${item.titleSnapshot} ×${item.quantity} ($${Number(item.unitPrice).toFixed(2)} each)`
      ),
      ``,
      `After booking in UPS, add the tracking number in the admin dashboard.`
    ];

    const subject = `[Origin Carpets] UPS shipment needed — ${order.orderNumber}`;
    const text = lines.join('\n');
    const html = lines.map((line) => `<p>${line || '&nbsp;'}</p>`).join('');

    for (const to of this.adminOrderEmails()) {
      await this.sendMail({ to, subject, text, html });
      this.logger.log(`Shipment request email sent to ${to} for ${order.orderNumber}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Reset your Origin Carpets password';
    const text = [
      'You requested a password reset for your Origin Carpets account.',
      '',
      'Open this link to choose a new password (valid for 1 hour):',
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.'
    ].join('\n');

    const html = this.brandedHtml({
      preheader: 'Reset your Origin Carpets password.',
      heading: 'Password reset',
      bodyHtml: `
        <p style="margin:0 0 14px;">You requested a password reset for your Origin Carpets account.</p>
        <p style="margin:0;">This link is valid for 1 hour. If you did not request this, you can ignore this email.</p>
      `,
      ctaLabel: 'Reset password',
      ctaUrl: resetUrl
    });

    await this.sendMail({ to, subject, text, html });
    this.logger.log(`Password reset email sent to ${to}`);
  }

  private async sendMail(payload: MailPayload): Promise<void> {
    if (this.resendApiKey) {
      await this.sendViaResend(payload);
      return;
    }

    if (this.relayUrl && this.relaySecret) {
      await this.sendViaRelay(payload);
      return;
    }

    if (this.transporter) {
      await this.transporter.sendMail({ from: this.from, ...payload });
      return;
    }

    throw new Error(
      'Mail is not configured (set RESEND_API_KEY, MAIL_RELAY_URL+SECRET, or SMTP_HOST/USER/PASS)'
    );
  }

  private async sendViaResend(payload: MailPayload): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend failed (${response.status}): ${body}`);
    }
  }

  private async sendViaRelay(payload: MailPayload): Promise<void> {
    const response = await fetch(this.relayUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: this.relaySecret,
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Mail relay failed (${response.status}): ${body}`);
    }

    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!result.ok) {
      throw new Error(result.error ?? 'Mail relay rejected the request');
    }
  }
}
