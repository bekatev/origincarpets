import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingService } from '../shipping/shipping.service';
import { IpayClient } from './ipay.client';
import { PayPalClient } from './paypal.client';
import { BANK_TRANSFER_DEFAULTS } from './payments.constants';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly config: ConfigService,
    private readonly ipay: IpayClient,
    private readonly paypal: PayPalClient
  ) {}

  getPublicConfig() {
    return {
      card: this.ipay.isConfigured()
    };
  }

  private gelPerUsd() {
    return Number(this.config.get<string>('GEL_PER_USD', '2.69'));
  }

  private frontendUrl() {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  private async loadPendingOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedException('Order does not belong to user');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be paid');
    }

    return order;
  }

  private async markOrderPaid(orderId: string, provider: string, providerPaymentId: string, transactionRef?: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId, provider, providerPaymentId },
        data: {
          status: 'CAPTURED',
          paidAt: new Date(),
          transactionRef: transactionRef ?? null
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });
    });

    try {
      const parcel = await this.shippingService.registerOrderParcel(orderId);
      if (!parcel.success && 'error' in parcel) {
        this.logger.warn(`Georgian Post parcel registration failed for order ${orderId}: ${parcel.error}`);
      }
    } catch (error) {
      this.logger.error(`Georgian Post parcel registration error for order ${orderId}`, error);
    }
  }

  async startBankTransfer(userId: string, orderId: string) {
    const order = await this.loadPendingOrder(userId, orderId);

    const captured = await this.prisma.payment.findFirst({
      where: { orderId, status: 'CAPTURED' }
    });
    if (captured) {
      throw new BadRequestException('Order is already paid');
    }

    let payment = await this.prisma.payment.findFirst({
      where: { orderId, method: 'BANK_TRANSFER', status: 'PENDING' }
    });

    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'BANK_TRANSFER',
          status: 'PENDING',
          amount: Number(order.total),
          currency: order.currency,
          provider: 'bank_transfer'
        }
      });
    }

    const bankName =
      this.config.get<string>('BANK_TRANSFER_BANK_NAME') ?? BANK_TRANSFER_DEFAULTS.bankName;
    const accountHolder =
      this.config.get<string>('BANK_TRANSFER_ACCOUNT_HOLDER') ?? BANK_TRANSFER_DEFAULTS.accountHolder;
    const iban = this.config.get<string>('BANK_TRANSFER_IBAN') ?? BANK_TRANSFER_DEFAULTS.iban;
    const swift = this.config.get<string>('BANK_TRANSFER_SWIFT') ?? BANK_TRANSFER_DEFAULTS.swift;
    const contactEmail =
      this.config.get<string>('BANK_TRANSFER_CONTACT_EMAIL') ?? BANK_TRANSFER_DEFAULTS.contactEmail;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: payment.id,
      amount: Number(order.total),
      currency: order.currency,
      reference: order.orderNumber,
      bankName,
      accountHolder,
      iban: iban || null,
      swift: swift || null,
      contactEmail
    };
  }

  async startIpayPayment(userId: string, orderId: string) {
    if (!this.ipay.isConfigured()) {
      throw new BadRequestException('Card payments (iPay) are not configured on server');
    }

    const order = await this.loadPendingOrder(userId, orderId);
    const amountGel = Math.round(Number(order.total) * this.gelPerUsd());

    const checkout = await this.ipay.createCheckoutOrder({
      shopOrderId: order.id,
      amountGel
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'CARD',
        status: 'PENDING',
        amount: Number(order.total),
        currency: order.currency,
        provider: 'ipay',
        providerPaymentId: checkout.trxIdentifier
      }
    });

    return {
      orderId: order.id,
      paymentUrl: checkout.paymentUrl,
      trxIdentifier: checkout.trxIdentifier
    };
  }

  async handleIpayCallback(body: Record<string, unknown>) {
    const trxIdentifier = String(body.order_id ?? '');
    const status = String(body.status ?? '').toLowerCase();

    if (!trxIdentifier) {
      return { ok: false };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { provider: 'ipay', providerPaymentId: trxIdentifier },
      include: { order: true }
    });

    if (!payment) {
      this.logger.warn(`iPay callback for unknown transaction ${trxIdentifier}`);
      return { ok: true };
    }

    if (status === 'success' && payment.order.status === 'PENDING') {
      await this.markOrderPaid(
        payment.orderId,
        'ipay',
        trxIdentifier,
        body.transaction_id ? String(body.transaction_id) : undefined
      );
    } else if (status !== 'success') {
      await this.prisma.payment.updateMany({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
    }

    return { ok: true, orderNumber: payment.order.orderNumber };
  }

  ipayReturnRedirect() {
    return `${this.frontendUrl()}/checkout/result`;
  }

  async createPayPalOrder(userId: string, orderId: string) {
    if (!this.paypal.isConfigured()) {
      throw new BadRequestException('PayPal is not configured on server');
    }

    const order = await this.loadPendingOrder(userId, orderId);
    const result = await this.paypal.createOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountUsd: Number(order.total)
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'PAYPAL',
        status: 'PENDING',
        amount: Number(order.total),
        currency: order.currency,
        provider: 'paypal',
        providerPaymentId: result.paypalOrderId
      }
    });

    return { orderId: order.id, paypalOrderId: result.paypalOrderId };
  }

  async capturePayPalOrder(userId: string, orderId: string, paypalOrderId: string) {
    if (!this.paypal.isConfigured()) {
      throw new BadRequestException('PayPal is not configured on server');
    }

    await this.loadPendingOrder(userId, orderId);

    const payment = await this.prisma.payment.findFirst({
      where: { orderId, provider: 'paypal', providerPaymentId: paypalOrderId }
    });

    if (!payment) {
      throw new BadRequestException('PayPal payment does not match order');
    }

    const capture = await this.paypal.captureOrder(paypalOrderId);
    if (capture.status !== 'COMPLETED') {
      throw new BadRequestException(`PayPal capture not completed: ${capture.status}`);
    }

    await this.markOrderPaid(orderId, 'paypal', paypalOrderId, capture.captureId ?? undefined);

    return { orderId, orderStatus: 'PAID' as const };
  }
}
