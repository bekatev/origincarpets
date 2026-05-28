import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { syncOrigincarpetsProducts } from './origincarpets-sync';

type ManageableOrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
      total: Number(order.total),
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
    const existing = await this.prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status
    };
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
