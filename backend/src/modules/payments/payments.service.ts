import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe.Stripe;
  private readonly currency: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService
  ) {
    const secretKey = config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.currency = config.get<string>('STRIPE_CURRENCY', 'usd').toLowerCase();
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(userId: string, orderId: string) {
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

    const amount = Math.round(Number(order.total) * 100);
    if (amount <= 0) {
      throw new BadRequestException('Invalid order total for payment');
    }

    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: this.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order.id,
        userId
      }
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'CARD',
        status: 'PENDING',
        amount: Number(order.total),
        currency: this.currency.toUpperCase(),
        provider: 'stripe',
        providerPaymentId: intent.id
      }
    });

    return {
      orderId: order.id,
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret
    };
  }

  async confirmPayment(userId: string, orderId: string, paymentIntentId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedException('Order does not belong to user');
    }

    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata.orderId !== orderId) {
      throw new BadRequestException('Payment intent does not match order');
    }

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment is not successful. Current status: ${intent.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId, provider: 'stripe', providerPaymentId: paymentIntentId },
        data: {
          status: 'CAPTURED',
          paidAt: new Date(),
          transactionRef: intent.latest_charge ? String(intent.latest_charge) : null
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });
    });

    return {
      orderId,
      paymentIntentId,
      orderStatus: 'PAID'
    };
  }
}
