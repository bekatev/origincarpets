import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { ShippingService } from '../shipping/shipping.service';
import { syncOrigincarpetsProducts } from './origincarpets-sync';

type ManageableOrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly paymentsService: PaymentsService
  ) {}

  async overview() {
    const [ordersCount, productsCount, usersCount, revenueAgg] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.aggregate({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true }
      })
    ]);

    return {
      orders: ordersCount,
      products: productsCount,
      customers: usersCount,
      revenue: Number(revenueAgg._sum.total ?? 0)
    };
  }

  async listOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      merchantShippingCostGel:
        order.merchantShippingCostGel != null ? Number(order.merchantShippingCostGel) : null,
      total: Number(order.total),
      deliveryMethod: order.deliveryMethod,
      shippingProvider: order.shippingProvider,
      billableWeightKg: order.billableWeightKg != null ? Number(order.billableWeightKg) : null,
      packageLengthCm: order.packageLengthCm,
      packageWidthCm: order.packageWidthCm,
      packageHeightCm: order.packageHeightCm,
      parcelTrackingNumber: order.parcelTrackingNumber,
      shipmentNotifiedAt: order.shipmentNotifiedAt,
      createdAt: order.createdAt,
      customer: {
        id: order.user.id,
        email: order.user.email,
        name: [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || null
      },
      itemsCount: order.items.length
    }));
  }

  async updateOrderStatus(orderId: string, status: ManageableOrderStatus) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, shipmentNotifiedAt: true }
    });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      if (status === 'PAID' && existing.status !== 'PAID') {
        await tx.payment.updateMany({
          where: { orderId, status: 'PENDING', method: 'BANK_TRANSFER' },
          data: { status: 'CAPTURED', paidAt: new Date() }
        });
      }

      return updated;
    });

    if (status === 'PAID' && !existing.shipmentNotifiedAt) {
      try {
        const result = await this.shippingService.notifyAdminsForPaidOrder(orderId);
        if (!result.success && 'error' in result) {
          this.logger.warn(`UPS admin notification failed for order ${orderId}: ${result.error}`);
        }
      } catch (error) {
        this.logger.error(`UPS admin notification error for order ${orderId}`, error);
      }
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status
    };
  }

  async updateOrderTracking(orderId: string, trackingNumber: string) {
    return this.shippingService.updateTrackingNumber(orderId, trackingNumber);
  }

  async reconcileIpayPayments() {
    return this.paymentsService.reconcilePendingIpayPayments();
  }

  async resendShipmentNotification(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });
      await this.prisma.payment.updateMany({
        where: { orderId, status: 'PENDING' },
        data: { status: 'CAPTURED', paidAt: new Date() }
      });
    }

    return this.shippingService.notifyAdminsForPaidOrder(orderId, { force: true });
  }

  async listCustomers() {
    const users = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          select: { id: true, total: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      createdAt: user.createdAt,
      ordersCount: user.orders.length,
      spentTotal: user.orders.reduce((sum, order) => sum + Number(order.total), 0)
    }));
  }

  async syncOrigincarpets(mode: 'full' | 'sync' = 'sync') {
    return syncOrigincarpetsProducts(this.prisma, mode);
  }
}
